import type { APIRoute } from 'astro';
import { db, schema } from '../../../../db/index';
import { eq } from 'drizzle-orm';

function parseId(raw: string | undefined): number | null {
  const n = Number(raw);
  return Number.isInteger(n) ? n : null;
}

export const PUT: APIRoute = async ({ params, request }) => {
  const id = parseId(params.id);
  if (!id) return new Response(JSON.stringify({ error: 'Invalid id' }), { status: 400 });

  const existing = db.select({ id: schema.mealEntries.id }).from(schema.mealEntries).where(eq(schema.mealEntries.id, id)).get();
  if (!existing) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

  const body = await request.json();
  const { slotLabel, slotOrder, portionWeight, isTrainingDay } = body;

  const updates: Record<string, unknown> = {};
  if (slotLabel !== undefined) updates.slotLabel = slotLabel;
  if (slotOrder !== undefined) updates.slotOrder = slotOrder;
  if (portionWeight !== undefined) updates.portionWeight = portionWeight;
  if (isTrainingDay !== undefined) updates.isTrainingDay = isTrainingDay;

  const result = db.update(schema.mealEntries).set(updates).where(eq(schema.mealEntries.id, id)).returning().get();
  return new Response(JSON.stringify(result));
};

export const DELETE: APIRoute = async ({ params }) => {
  const id = parseId(params.id);
  if (!id) return new Response(JSON.stringify({ error: 'Invalid id' }), { status: 400 });

  const existing = db.select({ id: schema.mealEntries.id }).from(schema.mealEntries).where(eq(schema.mealEntries.id, id)).get();
  if (!existing) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

  db.delete(schema.mealEntries).where(eq(schema.mealEntries.id, id)).run();
  return new Response(null, { status: 204 });
};
