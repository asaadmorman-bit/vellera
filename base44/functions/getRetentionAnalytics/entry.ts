import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { google } from 'npm:googleapis@118.0.0';

const GA_PROPERTY_ID = Deno.env.get('GA4_PROPERTY_ID'); // Format: "123456789"
const GA_SERVICE_ACCOUNT = Deno.env.get('GA4_SERVICE_ACCOUNT_JSON');

if (!GA_PROPERTY_ID || !GA_SERVICE_ACCOUNT) {
  throw new Error('Missing GA4_PROPERTY_ID or GA4_SERVICE_ACCOUNT_JSON');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const serviceAccount = JSON.parse(GA_SERVICE_ACCOUNT);
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const analyticsDataClient = google.analyticsdata({
      version: 'v1beta',
      auth,
    });

    // Query 1: Weekly Active Users by Discipline (last 4 weeks)
    const weeklyResponse = await analyticsDataClient.properties.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      requestBody: {
        dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
        dimensions: [
          { name: 'customUser:fitness_path' },
          { name: 'week' },
        ],
        metrics: [
          { name: 'activeUsers' },
        ],
      },
    });

    // Query 2: 7-Day Retention (users active in week N and week N+1)
    const sevenDayRetention = await analyticsDataClient.properties.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      requestBody: {
        dateRanges: [{ startDate: '56daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'customUser:fitness_path' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'retentionRateDayNDay7' },
        ],
      },
    });

    // Query 3: 30-Day Retention
    const thirtyDayRetention = await analyticsDataClient.properties.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      requestBody: {
        dateRanges: [{ startDate: '60daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'customUser:fitness_path' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'retentionRateDayNDay30' },
        ],
      },
    });

    // Parse and aggregate by discipline
    const disciplines = {};

    // Process 7-day retention
    if (sevenDayRetention.data.rows) {
      for (const row of sevenDayRetention.data.rows) {
        const discipline = row.dimensionValues?.[0]?.value || 'unknown';
        const activeUsers = parseInt(row.metricValues?.[0]?.value || 0);
        const retention7d = parseFloat(row.metricValues?.[1]?.value || 0) * 100;

        disciplines[discipline] = disciplines[discipline] || {};
        disciplines[discipline].activeUsers = activeUsers;
        disciplines[discipline].retention7d = Math.round(retention7d);
      }
    }

    // Process 30-day retention
    if (thirtyDayRetention.data.rows) {
      for (const row of thirtyDayRetention.data.rows) {
        const discipline = row.dimensionValues?.[0]?.value || 'unknown';
        const retention30d = parseFloat(row.metricValues?.[1]?.value || 0) * 100;

        disciplines[discipline] = disciplines[discipline] || {};
        disciplines[discipline].retention30d = Math.round(retention30d);
      }
    }

    // Process weekly trend
    const weeklyTrend = {};
    if (weeklyResponse.data.rows) {
      for (const row of weeklyResponse.data.rows) {
        const discipline = row.dimensionValues?.[0]?.value || 'unknown';
        const week = row.dimensionValues?.[1]?.value || '0';
        const activeUsers = parseInt(row.metricValues?.[0]?.value || 0);

        weeklyTrend[discipline] = weeklyTrend[discipline] || {};
        weeklyTrend[discipline][week] = activeUsers;
      }
    }

    return Response.json({
      success: true,
      disciplines,
      weeklyTrend,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[GA Analytics Error]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});