import { REST_API } from '@remnawave/backend-contract';
import { Config } from '../config.js';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface RequestOptions {
    query?: Record<string, unknown>;
    body?: unknown;
}

export class RemnawaveApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
        public readonly details?: unknown,
    ) {
        super(message);
        this.name = 'RemnawaveApiError';
    }
}

function serializeQueryValue(value: unknown): string {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

export class RemnawaveClient {
    private baseUrl: string;
    private headers: Record<string, string>;

    constructor(config: Config) {
        this.baseUrl = config.baseUrl;
        this.headers = {
            Authorization: `Bearer ${config.apiToken}`,
            Accept: 'application/json',
        };
        if (config.apiKey) {
            this.headers['X-Api-Key'] = config.apiKey;
        }
    }

    async request<T = unknown>(
        method: HttpMethod,
        path: string,
        { query, body }: RequestOptions = {},
    ): Promise<T> {
        let url = `${this.baseUrl}${path}`;

        if (query) {
            const search = new URLSearchParams();
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) continue;
                search.append(key, serializeQueryValue(value));
            }
            const qs = search.toString();
            if (qs) url += `?${qs}`;
        }

        const headers: Record<string, string> = { ...this.headers };
        const init: RequestInit = { method: method.toUpperCase(), headers };
        if (body !== undefined) {
            headers['Content-Type'] = 'application/json';
            init.body = JSON.stringify(body);
        }

        const res = await fetch(url, init);
        const text = await res.text();

        let data: unknown = text;
        if (text) {
            try {
                data = JSON.parse(text);
            } catch {
                // Non-JSON response (e.g. raw subscription or proxy error page)
            }
        } else {
            data = undefined;
        }

        if (!res.ok) {
            const payload = data as
                | { message?: string; errorCode?: string; errors?: unknown }
                | string
                | undefined;
            let message = `HTTP ${res.status} ${res.statusText}`;
            if (payload && typeof payload === 'object') {
                if (payload.message) message += `: ${payload.message}`;
                if (payload.errorCode) message += ` [${payload.errorCode}]`;
            } else if (typeof payload === 'string' && payload.length < 500) {
                message += `: ${payload}`;
            }
            throw new RemnawaveApiError(
                res.status,
                `Remnawave API error: ${message}`,
                typeof payload === 'object' ? payload?.errors : undefined,
            );
        }

        return data as T;
    }

    // Convenience methods used by MCP resources

    async getStats() {
        return this.request('get', REST_API.SYSTEM.STATS.SYSTEM_STATS);
    }

    async getNodes() {
        return this.request('get', REST_API.NODES.GET);
    }

    async getHealth() {
        return this.request('get', REST_API.SYSTEM.HEALTH);
    }

    async getUserById(userId: number) {
        return this.request('get', REST_API.USERS.GET_BY_ID(String(userId)));
    }
}
