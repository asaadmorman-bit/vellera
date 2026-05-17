import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { stats } = await req.json();
    if (!stats) return Response.json({ error: 'stats payload required' }, { status: 400 });

    // Get Instagram access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('instagram');

    // Get Instagram user ID
    const meRes = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
    if (!meRes.ok) {
      const err = await meRes.text();
      console.error('[postStatsCarousel] Failed to get IG user:', err);
      return Response.json({ error: 'Failed to get Instagram user' }, { status: 500 });
    }
    const me = await meRes.json();
    const userId = me.id;
    console.log('[postStatsCarousel] Instagram user:', me.username, 'id:', userId);

    // Generate slide images via AI
    const slidePrompts = [
      {
        label: 'slide1_summary',
        prompt: `Create a dark, athletic, motivational fitness stats card image. Style: black background, neon cyan (#00E5FF) and lime green (#CCFF00) accents, bold white text. 
Title: "WEEKLY PEAK PERFORMANCE" in large bold text at top.
Stats displayed prominently:
- Total Sessions: ${stats.total_sessions}
- Training Hours: ${stats.training_hours}h
- Avg Recovery: ${stats.avg_recovery}%
- Consistency Score: ${stats.consistency_score}%
Show a bold athlete silhouette or abstract athletic shape in the background. Make it look like a premium sports analytics card. Square format (1:1). No borders outside the image.`
      },
      {
        label: 'slide2_training',
        prompt: `Dark athletic training performance card. Black background with neon cyan (#00E5FF) highlights. Square 1:1 format.
Header: "TRAINING BREAKDOWN" bold at top.
Show these metrics in a clean card layout:
- Strength Sessions: ${stats.strength_sessions}
- BJJ / Combat: ${stats.bjj_sessions}
- Cardio Sessions: ${stats.cardio_sessions}
- Total Volume: ${stats.total_volume_lbs ? stats.total_volume_lbs + ' lbs' : 'tracked'}
Include a minimal bar chart visualization of the breakdown. Use bold numbers. Premium dark fitness app aesthetic.`
      },
      {
        label: 'slide3_recovery',
        prompt: `Dark performance recovery stats card. Black background, lime green (#CCFF00) and blue accents. Square 1:1 format.
Header: "RECOVERY & READINESS" bold at top.
Stats:
- Avg HRV: ${stats.avg_hrv || 'N/A'} ms
- Sleep Score: ${stats.avg_sleep || 'N/A'}%
- Readiness: ${stats.avg_recovery || 'N/A'}%
- Streak: ${stats.streak_days} days 🔥
Show circular progress rings or bold gauges for each metric. Dark, premium, athletic aesthetic.`
      },
      {
        label: 'slide4_cta',
        prompt: `Bold dark motivational fitness call-to-action card. Black background, gradient from cyan to lime green text. Square 1:1 format.
Large bold motivational quote in the center: "${stats.motivational_quote || 'Forge your best self. One session at a time.'}"
Below: "Track your journey with Vellera" in smaller text.
Athlete silhouette or abstract energy lines in the background. Signature Vellera app branding feel. Premium, powerful, minimal.`
      },
    ];

    // Generate all slide images in parallel
    console.log('[postStatsCarousel] Generating', slidePrompts.length, 'slide images...');
    const imageResults = await Promise.all(
      slidePrompts.map(async (slide) => {
        const res = await base44.asServiceRole.integrations.Core.GenerateImage({ prompt: slide.prompt });
        console.log('[postStatsCarousel] Generated', slide.label, ':', res.url);
        return { label: slide.label, url: res.url };
      })
    );

    // Create Instagram carousel item containers (one per image)
    const itemContainerIds = [];
    for (const img of imageResults) {
      const params = new URLSearchParams({
        image_url: img.url,
        is_carousel_item: 'true',
        access_token: accessToken,
      });
      const itemRes = await fetch(`https://graph.instagram.com/${userId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      if (!itemRes.ok) {
        const err = await itemRes.text();
        console.error('[postStatsCarousel] Failed to create carousel item for', img.label, ':', err);
        return Response.json({ error: `Failed to create carousel item: ${img.label}`, details: err }, { status: 500 });
      }
      const item = await itemRes.json();
      console.log('[postStatsCarousel] Created carousel item', img.label, 'id:', item.id);
      itemContainerIds.push(item.id);
    }

    // Build caption
    const week = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const caption = [
      `🏆 WEEKLY PEAK PERFORMANCE STATS — Week of ${week}`,
      ``,
      `📊 ${stats.total_sessions} sessions · ${stats.training_hours}h trained · ${stats.consistency_score}% consistency`,
      `💪 Strength: ${stats.strength_sessions} · BJJ: ${stats.bjj_sessions} · Cardio: ${stats.cardio_sessions}`,
      `❤️ Avg Recovery: ${stats.avg_recovery}% · Streak: ${stats.streak_days} days 🔥`,
      ``,
      `Forging elite performance with @vellerafitness`,
      ``,
      `#Vellera #WeeklyStats #PeakPerformance #StrengthTraining #BJJ #FitnessGoals #AthleteLife #RecoveryMatters #TrainSmarter #ConsistencyWins`,
    ].join('\n');

    // Create carousel container
    const carouselParams = new URLSearchParams({
      media_type: 'CAROUSEL',
      children: itemContainerIds.join(','),
      caption,
      access_token: accessToken,
    });
    const containerRes = await fetch(`https://graph.instagram.com/${userId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: carouselParams.toString(),
    });
    if (!containerRes.ok) {
      const err = await containerRes.text();
      console.error('[postStatsCarousel] Failed to create carousel container:', err);
      return Response.json({ error: 'Failed to create carousel container', details: err }, { status: 500 });
    }
    const container = await containerRes.json();
    console.log('[postStatsCarousel] Carousel container id:', container.id);

    // Publish
    const publishParams = new URLSearchParams({ access_token: accessToken });
    const publishRes = await fetch(`https://graph.instagram.com/${userId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        creation_id: container.id,
        access_token: accessToken,
      }).toString(),
    });
    if (!publishRes.ok) {
      const err = await publishRes.text();
      console.error('[postStatsCarousel] Failed to publish:', err);
      return Response.json({ error: 'Failed to publish carousel', details: err }, { status: 500 });
    }
    const published = await publishRes.json();
    console.log('[postStatsCarousel] Published! Post ID:', published.id);

    return Response.json({
      success: true,
      post_id: published.id,
      username: me.username,
      slides: imageResults.length,
      caption_preview: caption.slice(0, 120) + '...',
    });

  } catch (error) {
    console.error('[postStatsCarousel] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});