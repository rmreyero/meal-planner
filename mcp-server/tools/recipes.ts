import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

async function apiCall(base: string, apiKey: string, path: string, options?: RequestInit) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
  const res = await fetch(`${base}${path}`, { ...options, headers: { ...headers, ...options?.headers } });
  const text = await res.text();
  return { ok: res.ok, status: res.status, data: text };
}

export function registerTools(server: McpServer, apiBase: string, apiKey: string) {
  server.registerTool('list_recipes', {
    description: 'List all recipes. Optionally filter by tag or search text.',
    inputSchema: {
      tag: z.string().optional().describe('Filter by tag (e.g. "vegetariano", "batchcooking")'),
      search: z.string().optional().describe('Search by recipe name'),
    },
  }, async ({ tag, search }) => {
    const params = new URLSearchParams();
    if (tag) params.set('tag', tag);
    if (search) params.set('search', search);
    const qs = params.toString();
    const { data } = await apiCall(apiBase, apiKey, `/api/recipes${qs ? '?' + qs : ''}`);
    const recipes = JSON.parse(data);
    const summary = recipes.map((r: Record<string, unknown>) =>
      `- ${r.name} (id:${r.id}, slug:${r.slug})${r.baseCalories ? ` — ${r.baseCalories} kcal` : ''}`
    ).join('\n');
    return { content: [{ type: 'text' as const, text: summary || 'No recipes found' }] };
  });

  server.registerTool('get_recipe', {
    description: 'Get full details of a recipe by its ID.',
    inputSchema: {
      id: z.number().describe('Recipe ID'),
    },
  }, async ({ id }) => {
    const { data, ok } = await apiCall(apiBase, apiKey, `/api/recipes/${id}`);
    if (!ok) return { content: [{ type: 'text' as const, text: `Error: ${data}` }], isError: true };
    return { content: [{ type: 'text' as const, text: data }] };
  });

  server.registerTool('add_recipe', {
    description: 'Create a new recipe. Returns the created recipe with auto-generated slug.',
    inputSchema: {
      name: z.string().describe('Recipe name'),
      category: z.string().describe('Category (e.g. "platos", "verduras", "postres")'),
      servings: z.string().optional().describe('Servings description'),
      prepTime: z.string().optional().describe('Preparation time'),
      cookTime: z.string().optional().describe('Cooking time'),
      totalTime: z.string().optional().describe('Total time'),
      difficulty: z.string().optional().describe('Difficulty level'),
      ingredients: z.array(z.object({
        group: z.string().optional(),
        items: z.array(z.string()),
      })).describe('Ingredient groups with items'),
      instructions: z.array(z.string()).describe('Step-by-step instructions. Use [Section Name] for section headers.'),
      notes: z.array(z.string()).optional().describe('Additional notes'),
      tags: z.array(z.string()).optional().describe('Tags for filtering'),
      sourceUrl: z.string().optional().describe('Source URL'),
      sourceName: z.string().optional().describe('Source name'),
      basePortionWeight: z.number().optional().describe('Base portion weight in grams'),
      baseCalories: z.number().optional().describe('Calories per base portion'),
      baseProtein: z.number().optional().describe('Protein in grams per base portion'),
      baseCarbs: z.number().optional().describe('Carbs in grams per base portion'),
      baseFat: z.number().optional().describe('Fat in grams per base portion'),
    },
  }, async (input) => {
    const { data, ok } = await apiCall(apiBase, apiKey, '/api/recipes', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if (!ok) return { content: [{ type: 'text' as const, text: `Error: ${data}` }], isError: true };
    return { content: [{ type: 'text' as const, text: data }] };
  });

  server.registerTool('update_recipe', {
    description: 'Update an existing recipe by ID. Only include fields you want to change.',
    inputSchema: {
      id: z.number().describe('Recipe ID to update'),
      name: z.string().optional().describe('Recipe name'),
      category: z.string().optional().describe('Category'),
      servings: z.string().optional().describe('Servings description'),
      prepTime: z.string().optional().describe('Preparation time'),
      cookTime: z.string().optional().describe('Cooking time'),
      totalTime: z.string().optional().describe('Total time'),
      difficulty: z.string().optional().describe('Difficulty level'),
      ingredients: z.array(z.object({
        group: z.string().optional(),
        items: z.array(z.string()),
      })).optional().describe('Ingredient groups'),
      instructions: z.array(z.string()).optional().describe('Instructions'),
      notes: z.array(z.string()).optional().describe('Notes'),
      tags: z.array(z.string()).optional().describe('Tags'),
      basePortionWeight: z.number().optional().describe('Base portion weight in grams'),
      baseCalories: z.number().optional().describe('Calories per base portion'),
      baseProtein: z.number().optional().describe('Protein per base portion'),
      baseCarbs: z.number().optional().describe('Carbs per base portion'),
      baseFat: z.number().optional().describe('Fat per base portion'),
    },
  }, async ({ id, ...fields }) => {
    const { data, ok } = await apiCall(apiBase, apiKey, `/api/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(fields),
    });
    if (!ok) return { content: [{ type: 'text' as const, text: `Error: ${data}` }], isError: true };
    return { content: [{ type: 'text' as const, text: data }] };
  });
}
