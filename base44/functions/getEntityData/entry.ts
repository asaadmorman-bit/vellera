import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * getEntityData — Generic entity data fetcher
 *
 * Payload:
 *   { entity: string, filter?: object, sort?: string, limit?: number }
 *
 * Examples:
 *   { entity: "TrainingSession", filter: { created_by: "user@example.com" }, limit: 50 }
 *   { entity: "BetaTester", sort: "-created_date", limit: 20 }
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch(() => null);

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { entity, filter = {}, sort = '-created_date', limit = 50 } = body;

  if (!entity) {
    return Response.json({ error: 'Missing required field: entity' }, { status: 400 });
  }

  const entityStore = base44.asServiceRole.entities[entity];
  if (!entityStore) {
    return Response.json({ error: `Unknown entity: ${entity}` }, { status: 400 });
  }

  console.log(`[getEntityData] user=${user.email} entity=${entity} filter=${JSON.stringify(filter)} limit=${limit}`);

  const data = Object.keys(filter).length > 0
    ? await entityStore.filter(filter, sort, limit)
    : await entityStore.list(sort, limit);

  return Response.json({ success: true, entity, count: data.length, data });
});