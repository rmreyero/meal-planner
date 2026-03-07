import type { APIRoute } from 'astro';
import { json } from '../../../lib/api';
import { getAllTargets } from '../../../services/macro-targets';

export const GET: APIRoute = async () => {
  return json(getAllTargets());
};
