import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { carouselItems, caption, description } = await req.json();

    if (!carouselItems || !Array.isArray(carouselItems) || carouselItems.length === 0) {
      return Response.json({ error: 'carouselItems must be a non-empty array' }, { status: 400 });
    }

    // Get Instagram access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('instagram');

    // Get user's Instagram business account ID
    const meRes = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
    if (!meRes.ok) throw new Error('Failed to fetch Instagram user');
    const me = await meRes.json();
    const userId = me.id;

    // Create carousel container
    const containerRes = await fetch(`https://graph.instagram.com/${userId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        media_type: 'CAROUSEL',
        children: carouselItems.map(item => item.media_id).join(','),
        caption: caption || 'Fitness Training Carousel',
        access_token: accessToken,
      }).toString(),
    });

    if (!containerRes.ok) {
      const err = await containerRes.text();
      console.error('[publishInstagramCarousel] Container creation failed:', err);
      return Response.json({ error: 'Failed to create carousel', details: err }, { status: 500 });
    }

    const container = await containerRes.json();

    // Publish the carousel
    const publishRes = await fetch(`https://graph.instagram.com/${container.id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ access_token: accessToken }).toString(),
    });

    if (!publishRes.ok) {
      const err = await publishRes.text();
      console.error('[publishInstagramCarousel] Publish failed:', err);
      return Response.json({ error: 'Failed to publish carousel', details: err }, { status: 500 });
    }

    const result = await publishRes.json();

    return Response.json({
      success: true,
      postId: result.id,
      message: 'Fitness carousel published successfully',
    });

  } catch (error) {
    console.error('[publishInstagramCarousel] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});