import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { HttpMethod, RemnawaveClient } from '../client/index.js';
import { toolError, toolResult } from './helpers.js';

/**
 * Minimal structural view of a command namespace exported by
 * `@remnawave/backend-contract` (e.g. `CreateUserCommand`).
 */
export interface ContractCommand {
    TSQ_url: string;
    endpointDetails: {
        REQUEST_METHOD: string;
        METHOD_DESCRIPTION: string;
        METHOD_LONG_DESCRIPTION?: string;
        SCOPE_KIND?: string;
    };
    RequestParamSchema?: z.ZodType;
    RequestQuerySchema?: z.ZodType;
    RequestBodySchema?: z.ZodType;
}

export interface ToolSpec {
    /** MCP tool name. */
    name: string;
    /** Contract command describing the endpoint. */
    command: ContractCommand;
    /** Extra guidance appended to the contract description. */
    hint?: string;
    /** Overrides the read/write classification taken from the contract. */
    readOnly?: boolean;
    /** Marks the tool as destructive (irreversible). */
    destructive?: boolean;
}

type Shape = Record<string, z.ZodType>;

/** Extracts the object shape from a contract schema, unwrapping preprocess pipes. */
function getShape(schema: z.ZodType | undefined): Shape {
    if (!schema) return {};
    let current: unknown = schema;
    for (let i = 0; i < 5 && current; i++) {
        const s = current as { shape?: Shape; def?: { type?: string; in?: unknown; out?: unknown } };
        if (s.shape) return s.shape;
        if (s.def?.type !== 'pipe') break;
        const out = s.def.out as { shape?: Shape } | undefined;
        current = out?.shape ? out : s.def.in;
    }
    throw new Error('Unsupported contract schema: expected an object');
}

export function isReadOnly(spec: ToolSpec): boolean {
    return spec.readOnly ?? spec.command.endpointDetails.SCOPE_KIND === 'read';
}

function buildDescription(spec: ToolSpec): string {
    const { METHOD_DESCRIPTION, METHOD_LONG_DESCRIPTION, REQUEST_METHOD } =
        spec.command.endpointDetails;
    const parts = [METHOD_DESCRIPTION.replace(/\.?$/, '.')];
    if (spec.hint) parts.push(spec.hint);
    if (METHOD_LONG_DESCRIPTION) parts.push(METHOD_LONG_DESCRIPTION);
    parts.push(`[${REQUEST_METHOD.toUpperCase()} ${spec.command.TSQ_url}]`);
    return parts.join(' ');
}

const MAX_FIELD_DESCRIPTION = 300;

/** Keeps only the first paragraph of long, editor-oriented field docs. */
function shortenDescription(value: unknown): unknown {
    if (typeof value !== 'string' || value.length <= MAX_FIELD_DESCRIPTION) {
        return value;
    }
    const first = value.split(/\n\s*\n/)[0];
    return first.length <= MAX_FIELD_DESCRIPTION
        ? first
        : `${first.slice(0, MAX_FIELD_DESCRIPTION - 1)}…`;
}

/**
 * Strips noise from generated JSON Schema to keep tool definitions small:
 * long multi-paragraph field docs are cut to their first paragraph,
 * editor-only `markdownDescription`, regex `pattern`s duplicating a `format`
 * (uuid, email, ip, date...) and unbounded safe-integer limits.
 */
function slimJsonSchema(node: unknown): unknown {
    if (Array.isArray(node)) return node.map(slimJsonSchema);
    if (!node || typeof node !== 'object') return node;
    const out: Record<string, unknown> = {};
    const obj = node as Record<string, unknown>;
    for (const [key, value] of Object.entries(obj)) {
        if (key === '$schema') continue;
        if (key === 'markdownDescription') {
            if (!obj.description) out.description = shortenDescription(value);
            continue;
        }
        if (key === 'description') {
            out.description = shortenDescription(value);
            continue;
        }
        if (key === 'pattern' && obj.format) continue;
        if (
            (key === 'minimum' || key === 'maximum') &&
            Math.abs(value as number) === Number.MAX_SAFE_INTEGER
        ) {
            continue;
        }
        out[key] = slimJsonSchema(value);
    }
    return out;
}

/** Tool definitions as advertised in tools/list, built alongside registration. */
export class ToolListing {
    private tools: Tool[] = [];

    add(tool: Tool) {
        this.tools.push(tool);
    }

    /** Replaces the SDK's tools/list handler with the slimmed definitions. */
    install(server: McpServer) {
        server.server.setRequestHandler(ListToolsRequestSchema, () => ({
            tools: this.tools,
        }));
    }
}

export function registerContractTool(
    server: McpServer,
    client: RemnawaveClient,
    spec: ToolSpec,
    listing: ToolListing,
) {
    const { command } = spec;
    const method = command.endpointDetails.REQUEST_METHOD as HttpMethod;
    const paramShape = getShape(command.RequestParamSchema);
    const queryShape = getShape(command.RequestQuerySchema);
    const bodyShape = getShape(command.RequestBodySchema);

    const paramKeys = Object.keys(paramShape);
    const queryKeys = new Set(Object.keys(queryShape));
    const hasBody = command.RequestBodySchema !== undefined;

    const readOnly = isReadOnly(spec);
    const destructive =
        spec.destructive ?? (!readOnly && method === 'delete');

    const description = buildDescription(spec);
    const inputSchema = z.object({ ...paramShape, ...queryShape, ...bodyShape });
    const annotations = {
        readOnlyHint: readOnly,
        destructiveHint: readOnly ? false : destructive,
        openWorldHint: false,
    };

    listing.add({
        name: spec.name,
        description,
        inputSchema: slimJsonSchema(
            z.toJSONSchema(inputSchema, { target: 'draft-7', io: 'input' }),
        ) as Tool['inputSchema'],
        annotations,
    });

    server.registerTool(
        spec.name,
        { description, inputSchema, annotations },
        async (args: Record<string, unknown>) => {
            try {
                let path = command.TSQ_url;
                for (const key of paramKeys) {
                    path = path.replace(
                        `:${key}`,
                        encodeURIComponent(String(args[key])),
                    );
                }

                const query: Record<string, unknown> = {};
                const body: Record<string, unknown> = {};
                for (const [key, value] of Object.entries(args)) {
                    if (paramKeys.includes(key)) continue;
                    if (queryKeys.has(key)) query[key] = value;
                    else body[key] = value;
                }

                const result = await client.request(method, path, {
                    query: queryKeys.size ? query : undefined,
                    body: hasBody ? body : undefined,
                });
                return toolResult(result ?? { success: true });
            } catch (e) {
                return toolError(e);
            }
        },
    );
}
