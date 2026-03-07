export function parseId(raw: string | undefined): number | null {
  const n = Number(raw);
  return Number.isInteger(n) ? n : null;
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function errorResponse(message: string, status: number): Response {
  return json({ error: message }, status);
}

export async function parseBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
