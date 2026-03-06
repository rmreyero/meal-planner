const API_KEY = import.meta.env.API_KEY || process.env.API_KEY;

export function requireAuth(request: Request): Response | null {
  if (!API_KEY) return null; // no key configured = open access (dev)

  const header = request.headers.get('Authorization');
  if (header === `Bearer ${API_KEY}`) return null;

  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
}
