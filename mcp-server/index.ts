import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTools } from './tools/recipes.js';

const API_BASE = process.env.API_BASE || 'http://localhost:4321';
const API_KEY = process.env.API_KEY || '';

const server = new McpServer({
  name: 'meal-planner',
  version: '0.0.1',
});

registerTools(server, API_BASE, API_KEY);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
