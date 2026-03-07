import type { APIRoute } from 'astro';
import { json, errorResponse } from '../../../lib/api';
import { getOrCreateWeekPlan } from '../../../services/meal-plans';

export const GET: APIRoute = async ({ url }) => {
  const week = url.searchParams.get('week');
  if (!week || !/^\d{4}-\d{2}-\d{2}$/.test(week)) {
    return errorResponse('week param required (YYYY-MM-DD)', 400);
  }

  return json(getOrCreateWeekPlan(week));
};
