import type { APIRoute } from 'astro';
import { db, schema } from '../../../../db/index';
import { eq } from 'drizzle-orm';
import { json, errorResponse, parseBody } from '../../../lib/api';

function parseId(raw: string | undefined): number | null {
  const n = Number(raw);
  return Number.isInteger(n) ? n : null;
}

export const PUT: APIRoute = async ({ params, request }) => {
  const id = parseId(params.id);
  if (!id) return errorResponse('Invalid id', 400);

  const existing = db.select({ id: schema.mealEntries.id }).from(schema.mealEntries).where(eq(schema.mealEntries.id, id)).get();
  if (!existing) return errorResponse('Not found', 404);

  const body = await parseBody(request);
  if (!body) return errorResponse('Invalid JSON body', 400);

  const { slotLabel, slotOrder, portionWeight, isTrainingDay } = body;

  const updates: Record<string, unknown> = {};
  if (slotLabel !== undefined) updates.slotLabel = slotLabel;
  if (slotOrder !== undefined) updates.slotOrder = slotOrder;
  if (portionWeight !== undefined) updates.portionWeight = portionWeight;
  if (isTrainingDay !== undefined) updates.isTrainingDay = isTrainingDay;

  const result = db.update(schema.mealEntries).set(updates).where(eq(schema.mealEntries.id, id)).returning().get();
  return json(result);
};

export const DELETE: APIRoute = async ({ params }) => {
  const id = parseId(params.id);
  if (!id) return errorResponse('Invalid id', 400);

  const existing = db.select({ id: schema.mealEntries.id }).from(schema.mealEntries).where(eq(schema.mealEntries.id, id)).get();
  if (!existing) return errorResponse('Not found', 404);

  db.delete(schema.mealEntries).where(eq(schema.mealEntries.id, id)).run();
  return new Response(null, { status: 204 });
};
