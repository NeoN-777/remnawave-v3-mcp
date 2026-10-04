import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { RemnawaveClient } from '../client/index.js';
import { TOOL_CATALOG } from './catalog.js';
import { isReadOnly, registerContractTool, ToolListing } from './define.js';

export function registerAllTools(server: McpServer, client: RemnawaveClient, readonly: boolean) {
    const listing = new ToolListing();
    for (const spec of TOOL_CATALOG) {
        if (readonly && !isReadOnly(spec)) continue;
        registerContractTool(server, client, spec, listing);
    }
    listing.install(server);
}
