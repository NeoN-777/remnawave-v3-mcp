# remnawave-v3-mcp

[English](#english) | [Русский](#русский)

> Fork of [TrackLine/mcp-remnawave](https://github.com/TrackLine/mcp-remnawave) with support for **Remnawave v3** (API 3.x). For Remnawave 2.x panels use the original repository.
>
> Форк [TrackLine/mcp-remnawave](https://github.com/TrackLine/mcp-remnawave) с поддержкой **Remnawave v3** (API 3.x). Для панелей Remnawave 2.x используйте оригинальный репозиторий.

---

<a id="english"></a>

## MCP Server for Remnawave Panel

MCP server ([Model Context Protocol](https://modelcontextprotocol.io)) providing LLM clients (Claude Desktop, Cursor, Windsurf, etc.) with tools to manage a [Remnawave](https://github.com/remnawave/) VPN panel.

**Version:** 2.0.0 | **Remnawave API:** 3.4.x (`@remnawave/backend-contract` 3.4.15)

### Features

- **203 tools** — users, nodes, hosts, subscriptions, subscription templates & settings, squads, HWID, config profiles, bandwidth stats, connections, API tokens, billing, snippets, settings, subscription page configs, node plugins & shared lists, node integrations, metadata
- **3 resources** — real-time panel stats, node status, health checks
- **5 prompts** — guided workflows for common tasks
- **Readonly mode** — restrict to 94 read-only tools for safe monitoring
- **Caddy support** — `X-Api-Key` header for panels behind Caddy with custom path
- **Contract-driven** — every tool is generated from [@remnawave/backend-contract](https://www.npmjs.com/package/@remnawave/backend-contract): routes, HTTP methods, input schemas and validation always match the panel API
- **Tool annotations** — `readOnlyHint` / `destructiveHint` so clients can ask for confirmation before dangerous actions
- **stdio transport** — works with Claude Desktop, Cursor, Windsurf, and any MCP-compatible client

### Requirements

- Node.js >= 22
- Remnawave panel with API token (Settings > API Tokens)

### Installation

```bash
git clone https://github.com/NeoN-777/remnawave-v3-mcp.git
cd remnawave-v3-mcp
npm install
npm run build
```

### Configuration

Create a `.env` file or pass environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `REMNAWAVE_BASE_URL` | Yes | Panel URL (e.g. `https://vpn.example.com`) |
| `REMNAWAVE_API_TOKEN` | Yes | API token from panel settings |
| `REMNAWAVE_API_KEY` | No | API key for Caddy reverse proxy authentication |
| `REMNAWAVE_READONLY` | No | Set to `true` to enable readonly mode |

```env
REMNAWAVE_BASE_URL=https://vpn.example.com
REMNAWAVE_API_TOKEN=your-api-token-here
```

### Caddy with Custom Path

If your Remnawave panel is deployed behind [Caddy with a custom path and API key protection](https://docs.remnawave.com/docs/security/caddy-with-custom-path/), set the base URL to include the custom path and provide the API key:

```env
REMNAWAVE_BASE_URL=https://example.com/your-secret-path/api
REMNAWAVE_API_KEY=your-caddy-api-key
```

The `X-Api-Key` header will be added to every request automatically.

### Readonly Mode

Set `REMNAWAVE_READONLY=true` to disable all write operations (create, update, delete, enable, disable, restart, revoke, reset). Only read/list tools will be registered.

Useful for monitoring dashboards or shared environments where you want to prevent accidental changes.

In readonly mode, only the 94 tools marked `read` in the tables below are registered (the read/write classification comes from the contract).

### Migrating from 1.x

Version 2.0 targets Remnawave 3.x, which introduced breaking API changes:

- **Users are identified by numeric `userId`** instead of UUID (`users_get`, `users_delete`, `users_enable`, `users_disable`, `users_reset_traffic`, `users_revoke_subscription`, `hwid_devices_list`, `metadata_user_*`, `subscriptions_get_by_id`, `subscriptions_get_connection_keys`, ...). Get the ID via `users_get_by_username`, `users_get_by_short_uuid` or `users_resolve`.
- Bulk user tools take `userIds` (numbers) instead of `uuids`; `users_bulk_update` takes `{ userIds, fields }`.
- `users_get_by_telegram_id`, `users_get_by_email`, `users_get_by_tag`, `users_get_by_subscription_uuid` were removed from the API — use `users_list` with `filters`, e.g. `[{"id":"telegramId","value":"123"}]`.
- `users_resolve` takes exactly one of `id`, `shortUuid`, `username`.
- `users_extend` is new (extend one user by N days).
- `subscriptions_get_by_uuid` → `subscriptions_get_by_id`.
- `hosts_bulk_set_inbound` / `hosts_bulk_set_port` → `hosts_bulk_update`.
- `ip_control_*` → `connections_*` (by user, by node, geocheck, drop).
- `squads_add_users` / `squads_remove_users` take `userIds`; adding/removing *all* users is `squads_add_all_users` / `squads_remove_all_users`.
- `external_squads_add_users` / `external_squads_remove_users` → `external_squads_add_all_users` / `external_squads_remove_all_users` (assign a single user via `users_update` → `externalSquadUuid`).
- Resource `remnawave://users/{uuid}` → `remnawave://users/{userId}`.
- `settings_*` and `api_tokens_*` require an admin JWT; with a regular API token the panel returns 403.

### Usage with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "remnawave": {
      "command": "node",
      "args": ["/absolute/path/to/remnawave-mcp/dist/index.js"],
      "env": {
        "REMNAWAVE_BASE_URL": "https://vpn.example.com",
        "REMNAWAVE_API_TOKEN": "your-api-token-here",
        "REMNAWAVE_API_KEY": "your-caddy-api-key",
        "REMNAWAVE_READONLY": "false"
      }
    }
  }
}
```

### Usage with Cursor / Windsurf

Add to `.cursor/mcp.json` or `.windsurf/mcp.json` in your project:

```json
{
  "mcpServers": {
    "remnawave": {
      "command": "node",
      "args": ["/absolute/path/to/remnawave-mcp/dist/index.js"],
      "env": {
        "REMNAWAVE_BASE_URL": "https://vpn.example.com",
        "REMNAWAVE_API_TOKEN": "your-api-token-here",
        "REMNAWAVE_API_KEY": "your-caddy-api-key",
        "REMNAWAVE_READONLY": "false"
      }
    }
  }
}
```

### Docker

```bash
npm run build
docker compose up -d
```

Environment variables are passed via `.env` file or `docker-compose.yml`.

### Available Tools

Tools are generated from `@remnawave/backend-contract` commands: input schemas, validation and descriptions come straight from the contract.

#### Users (26)

| Tool | Description | Endpoint | Mode |
|------|-------------|----------|------|
| `users_list` | Get all users using offset-based pagination | `GET /api/users/` | read |
| `users_get` | Get user by ID | `GET /api/users/:userId` | read |
| `users_get_by_username` | Get user by username | `GET /api/users/by-username/:username` | read |
| `users_get_by_short_uuid` | Get user by Short UUID | `GET /api/users/by-short-uuid/:shortUuid` | read |
| `users_resolve` | Resolve a user | `POST /api/users/resolve` | read |
| `users_tags_list` | Get users tags | `GET /api/users/tags` | read |
| `users_accessible_nodes` | Get user accessible nodes | `GET /api/users/:userId/accessible-nodes` | read |
| `users_subscription_request_history` | Get user subscription request history, recent 24 records | `GET /api/users/:userId/subscription-request-history` | read |
| `users_create` | Create a new user | `POST /api/users/` | write |
| `users_update` | Update a user | `PATCH /api/users/` | write |
| `users_delete` | Delete user | `DELETE /api/users/:userId` | write |
| `users_enable` | Enable user | `POST /api/users/:userId/actions/enable` | write |
| `users_disable` | Disable user | `POST /api/users/:userId/actions/disable` | write |
| `users_reset_traffic` | Reset user traffic | `POST /api/users/:userId/actions/reset-traffic` | write |
| `users_revoke_subscription` | Revoke user subscription | `POST /api/users/:userId/actions/revoke` | write |
| `users_extend` | Extend user expiration date | `POST /api/users/:userId/actions/extend` | write |
| `users_bulk_delete_by_status` | Bulk delete users by status | `POST /api/users/bulk/delete-by-status` | write |
| `users_bulk_delete` | Bulk delete users by User IDs | `POST /api/users/bulk/delete` | write |
| `users_bulk_update` | Bulk update users by User IDs | `POST /api/users/bulk/update` | write |
| `users_bulk_reset_traffic` | Bulk reset traffic users by User IDs | `POST /api/users/bulk/reset-traffic` | write |
| `users_bulk_revoke_subscription` | Revoke users subscription by User IDs | `POST /api/users/bulk/revoke-subscription` | write |
| `users_bulk_update_squads` | Bulk update users internal squads by User IDs | `POST /api/users/bulk/update-squads` | write |
| `users_bulk_extend_expiration` | Extend expiration date for specified users by days | `POST /api/users/bulk/extend-expiration-date` | write |
| `users_bulk_all_update` | Bulk update all users | `POST /api/users/bulk/all/update` | write |
| `users_bulk_all_reset_traffic` | Reset user used traffic for all users | `POST /api/users/bulk/all/reset-traffic` | write |
| `users_bulk_all_extend_expiration` | Extend expiration date for all users by days | `POST /api/users/bulk/all/extend-expiration-date` | write |

#### Nodes (15)

| Tool | Description | Endpoint | Mode |
|------|-------------|----------|------|
| `nodes_list` | Get nodes | `GET /api/nodes/` | read |
| `nodes_get` | Get node by UUID | `GET /api/nodes/:uuid` | read |
| `nodes_tags_list` | Get nodes tags | `GET /api/nodes/tags` | read |
| `nodes_create` | Create a new node | `POST /api/nodes/` | write |
| `nodes_update` | Update node | `PATCH /api/nodes/` | write |
| `nodes_delete` | Delete a node | `DELETE /api/nodes/:uuid` | write |
| `nodes_enable` | Enable a node | `POST /api/nodes/:uuid/actions/enable` | write |
| `nodes_disable` | Disable a node | `POST /api/nodes/:uuid/actions/disable` | write |
| `nodes_restart` | Restart node | `POST /api/nodes/:uuid/actions/restart` | write |
| `nodes_restart_all` | Restart all nodes | `POST /api/nodes/actions/restart-all` | write |
| `nodes_reset_traffic` | Reset Node Traffic | `POST /api/nodes/:uuid/actions/reset-traffic` | write |
| `nodes_reorder` | Reorder nodes | `POST /api/nodes/actions/reorder` | write |
| `nodes_bulk_actions` | Perform actions for many nodes | `POST /api/nodes/bulk-actions` | write |
| `nodes_bulk_update` | Update many nodes | `POST /api/nodes/bulk-actions/update` | write |
| `nodes_bulk_profile_modification` | Modify Inbounds & Profile for many nodes | `POST /api/nodes/bulk-actions/profile-modification` | write |

#### Hosts (12)

| Tool | Description | Endpoint | Mode |
|------|-------------|----------|------|
| `hosts_list` | Get hosts | `GET /api/hosts/` | read |
| `hosts_get` | Get a host by UUID | `GET /api/hosts/:uuid` | read |
| `hosts_tags_list` | Get tags of hosts | `GET /api/hosts/tags` | read |
| `hosts_create` | Create a new host | `POST /api/hosts/` | write |
| `hosts_update` | Update a host | `PATCH /api/hosts/` | write |
| `hosts_delete` | Delete a host by UUID | `DELETE /api/hosts/:uuid` | write |
| `hosts_clone` | Clone host | `POST /api/hosts/actions/clone` | write |
| `hosts_reorder` | Reorder hosts | `POST /api/hosts/actions/reorder` | write |
| `hosts_bulk_enable` | Enable hosts by UUIDs | `POST /api/hosts/bulk/enable` | write |
| `hosts_bulk_disable` | Disable hosts by UUIDs | `POST /api/hosts/bulk/disable` | write |
| `hosts_bulk_delete` | Delete hosts by UUIDs | `POST /api/hosts/bulk/delete` | write |
| `hosts_bulk_update` | Update many hosts | `PATCH /api/hosts/bulk/update` | write |

#### System (14)

| Tool | Description | Endpoint | Mode |
|------|-------------|----------|------|
| `system_stats` | Get Stats | `GET /api/system/stats` | read |
| `system_stats_digest` | Get Stats Digest | `GET /api/system/stats/digest` | read |
| `system_stats_recap` | Get Recap | `GET /api/system/stats/recap` | read |
| `system_stats_http` | Get HTTP Stats | `GET /api/system/stats/http` | read |
| `system_bandwidth_stats` | Get Bandwidth Stats | `GET /api/system/stats/bandwidth` | read |
| `system_nodes_statistics` | Get Nodes Statistics | `GET /api/system/stats/nodes` | read |
| `system_nodes_metrics` | Get Nodes Metrics | `GET /api/system/nodes/metrics` | read |
| `system_health` | Get Remnawave Health | `GET /api/system/health` | read |
| `system_metadata` | Get Remnawave Information | `GET /api/system/metadata` | read |
| `system_configuration` | Get Remnawave Configuration | `GET /api/system/configuration` | read |
| `system_generate_x25519` | Generate 30 X25519 keypairs | `GET /api/system/tools/x25519/generate` | read |
| `system_srr_matcher` | Test SRR Matcher | `POST /api/system/testers/srr-matcher` | read |
| `auth_status` | Get the status of the authentication | `GET /api/auth/status` | read |
| `keygen_get` | Get SECRET_KEY for Remnawave Node | `GET /api/keygen/` | read |

#### Bandwidth stats (7)

| Tool | Description | Endpoint | Mode |
|------|-------------|----------|------|
| `bandwidth_nodes_usage` | Get Nodes Usage by Range | `GET /api/bandwidth-stats/nodes/` | read |
| `bandwidth_node_users_usage` | Get Node Users Usage by Node UUID | `GET /api/bandwidth-stats/nodes/:uuid/users` | read |
| `bandwidth_nodes_users_usage` | Get Nodes Users Usage by Nodes UUIDs | `POST /api/bandwidth-stats/nodes/users` | read |
| `bandwidth_nodes_threshold_usage` | Get users exceeding a traffic threshold on the given nodes for a period | `POST /api/bandwidth-stats/nodes/usage` | read |
| `bandwidth_user_usage` | Get User Usage by Range | `GET /api/bandwidth-stats/users/:userId` | read |
| `bandwidth_squad_usage` | Get internal squad users traffic usage for a period | `GET /api/bandwidth-stats/internal-squads/:uuid/usage` | read |
| `bandwidth_squad_user_usage` | Get a single user daily traffic usage on the internal squad nodes for a period | `GET /api/bandwidth-stats/internal-squads/:squadUuid/users/:userId/usage` | read |

#### Subscriptions (10)

| Tool | Description | Endpoint | Mode |
|------|-------------|----------|------|
| `subscriptions_list` | Get all subscriptions | `GET /api/subscriptions/` | read |
| `subscriptions_get_by_id` | Get subscription by User ID | `GET /api/subscriptions/by-id/:userId` | read |
| `subscriptions_get_by_username` | Get subscription by username | `GET /api/subscriptions/by-username/:username` | read |
| `subscriptions_get_by_short_uuid` | Get subscription by short uuid (protected route) | `GET /api/subscriptions/by-short-uuid/:shortUuid` | read |
| `subscriptions_get_raw_by_short_uuid` | Get Raw Subscription by Short UUID | `GET /api/subscriptions/by-short-uuid/:shortUuid/raw` | read |
| `subscriptions_get_subpage_config` | Get Subpage Config by Short UUID | `GET /api/subscriptions/subpage-config/:shortUuid` | read |
| `subscriptions_get_connection_keys` | Get connection keys (base64 format) by user id | `GET /api/subscriptions/connection-keys/:userId` | read |
| `subscription_info` | Get Subscription Info by Short UUID | `GET /api/sub/:shortUuid/info` | read |
| `subscription_request_history_list` | Get all subscription request history | `GET /api/subscription-request-history/` | read |
| `subscription_request_history_stats` | Get subscription request history stats | `GET /api/subscription-request-history/stats` | read |

#### Subscription settings & templates (10)

| Tool | Description | Endpoint | Mode |
|------|-------------|----------|------|
| `subscription_settings_get` | Get subscription settings | `GET /api/subscription-settings/` | read |
| `subscription_settings_update` | Update subscription settings | `PATCH /api/subscription-settings/` | write |
| `subscription_templates_list` | Get all subscription templates (wihout content) | `GET /api/subscription-templates/` | read |
| `subscription_templates_get` | Get subscription template by uuid | `GET /api/subscription-templates/:uuid` | read |
| `subscription_templates_create` | Create subscription template | `POST /api/subscription-templates/` | write |
| `subscription_templates_update` | Update subscription template | `PATCH /api/subscription-templates/` | write |
| `subscription_templates_delete` | Delete subscription template | `DELETE /api/subscription-templates/:uuid` | write |
| `subscription_templates_reorder` | Reorder subscription templates | `POST /api/subscription-templates/actions/reorder` | write |
| `subscription_templates_tags_list` | Get tags of Subscription Templates | `GET /api/subscription-templates/tags` | read |
| `subscription_templates_set_tags` | Set tags of Subscription Template | `PATCH /api/subscription-templates/tags` | write |

#### Subscription page configs (9)

| Tool | Description | Endpoint | Mode |
|------|-------------|----------|------|
| `sub_page_configs_list` | Get all subscription page configs | `GET /api/subscription-page-configs/` | read |
| `sub_page_configs_get` | Get subscription page config by uuid | `GET /api/subscription-page-configs/:uuid` | read |
| `sub_page_configs_create` | Create subscription page config | `POST /api/subscription-page-configs/` | write |
| `sub_page_configs_update` | Update subscription page config | `PATCH /api/subscription-page-configs/` | write |
| `sub_page_configs_delete` | Delete subscription page config | `DELETE /api/subscription-page-configs/:uuid` | write |
| `sub_page_configs_reorder` | Reorder subscription page configs | `POST /api/subscription-page-configs/actions/reorder` | write |
| `sub_page_configs_clone` | Clone subscription page config | `POST /api/subscription-page-configs/actions/clone` | write |
| `sub_page_configs_tags_list` | Get tags of Subpage Configs | `GET /api/subscription-page-configs/tags` | read |
| `sub_page_configs_set_tags` | Set tags of Subpage Config | `PATCH /api/subscription-page-configs/tags` | write |

#### Config profiles & inbounds (11)

| Tool | Description | Endpoint | Mode |
|------|-------------|----------|------|
| `config_profiles_list` | Get config profiles | `GET /api/config-profiles/` | read |
| `config_profiles_get` | Get config profile by uuid | `GET /api/config-profiles/:uuid` | read |
| `config_profiles_get_inbounds` | Get inbounds by profile uuid | `GET /api/config-profiles/:uuid/inbounds` | read |
| `config_profiles_get_computed_config` | Get computed config profile by uuid | `GET /api/config-profiles/:uuid/computed-config` | read |
| `config_profiles_create` | Create config profile | `POST /api/config-profiles/` | write |
| `config_profiles_update` | Update Core Config in specific config profile | `PATCH /api/config-profiles/` | write |
| `config_profiles_delete` | Delete config profile | `DELETE /api/config-profiles/:uuid` | write |
| `config_profiles_reorder` | Reorder config profiles | `POST /api/config-profiles/actions/reorder` | write |
| `config_profiles_tags_list` | Get tags of Config Profiles | `GET /api/config-profiles/tags` | read |
| `config_profiles_set_tags` | Set tags of Config Profile | `PATCH /api/config-profiles/tags` | write |
| `inbounds_list` | Get all inbounds from all config profiles | `GET /api/config-profiles/inbounds` | read |

#### Internal squads (13)

| Tool | Description | Endpoint | Mode |
|------|-------------|----------|------|
| `squads_list` | Get all internal squads | `GET /api/internal-squads/` | read |
| `squads_get` | Get internal squad by uuid | `GET /api/internal-squads/:uuid` | read |
| `squads_accessible_nodes` | Get internal squad accessible nodes | `GET /api/internal-squads/:uuid/accessible-nodes` | read |
| `squads_create` | Create internal squad | `POST /api/internal-squads/` | write |
| `squads_update` | Update internal squad | `PATCH /api/internal-squads/` | write |
| `squads_delete` | Delete internal squad | `DELETE /api/internal-squads/:uuid` | write |
| `squads_reorder` | Reorder internal squads | `POST /api/internal-squads/actions/reorder` | write |
| `squads_add_users` | Add many users to internal squad | `POST /api/internal-squads/:uuid/bulk-actions/add-many-users` | write |
| `squads_remove_users` | Delete many users from internal squad | `DELETE /api/internal-squads/:uuid/bulk-actions/remove-many-users` | write |
| `squads_add_all_users` | Add all users to internal squad | `POST /api/internal-squads/:uuid/bulk-actions/add-users` | write |
| `squads_remove_all_users` | Delete users from internal squad | `DELETE /api/internal-squads/:uuid/bulk-actions/remove-users` | write |
| `squads_tags_list` | Get tags of Internal Squads | `GET /api/internal-squads/tags` | read |
| `squads_set_tags` | Set tags of Internal Squad | `PATCH /api/internal-squads/tags` | write |

#### External squads (10)

| Tool | Description | Endpoint | Mode |
|------|-------------|----------|------|
| `external_squads_list` | Get all external squads | `GET /api/external-squads/` | read |
| `external_squads_get` | Get external squad by uuid | `GET /api/external-squads/:uuid` | read |
| `external_squads_create` | Create external squad | `POST /api/external-squads/` | write |
| `external_squads_update` | Update external squad | `PATCH /api/external-squads/` | write |
| `external_squads_delete` | Delete external squad | `DELETE /api/external-squads/:uuid` | write |
| `external_squads_reorder` | Reorder external squads | `POST /api/external-squads/actions/reorder` | write |
| `external_squads_add_all_users` | Add all users to external squad | `POST /api/external-squads/:uuid/bulk-actions/add-users` | write |
| `external_squads_remove_all_users` | Delete users from external squad | `DELETE /api/external-squads/:uuid/bulk-actions/remove-users` | write |
| `external_squads_tags_list` | Get tags of External Squads | `GET /api/external-squads/tags` | read |
| `external_squads_set_tags` | Set tags of External Squad | `PATCH /api/external-squads/tags` | write |

#### HWID devices (7)

| Tool | Description | Endpoint | Mode |
|------|-------------|----------|------|
| `hwid_devices_list_all` | Get HWID devices | `GET /api/hwid/devices` | read |
| `hwid_devices_list` | Get user HWID devices | `GET /api/hwid/devices/:userId` | read |
| `hwid_stats` | Get HWID devices stats | `GET /api/hwid/devices/stats` | read |
| `hwid_top_users` | Get top users by HWID devices | `GET /api/hwid/devices/top-users` | read |
| `hwid_device_create` | Create a user HWID device | `POST /api/hwid/devices` | write |
| `hwid_device_delete` | Delete a user HWID device | `POST /api/hwid/devices/delete` | write |
| `hwid_devices_delete_all` | Delete all user HWID devices | `POST /api/hwid/devices/delete-all` | write |

#### Connections (formerly IP Control) (7)

| Tool | Description | Endpoint | Mode |
|------|-------------|----------|------|
| `connections_by_user` | Request Connections for User | `POST /api/connections/by-user/:userId` | read |
| `connections_by_user_result` | Get Connections for User by Job ID | `GET /api/connections/by-user/:jobId` | read |
| `connections_by_node` | Request Connections for Node | `POST /api/connections/by-node/:nodeUuid` | read |
| `connections_by_node_result` | Get Connections for Node by Job ID | `GET /api/connections/by-node/:jobId` | read |
| `connections_geocheck_by_node` | Request Geocheck for Node | `POST /api/connections/geocheck/:nodeUuid` | read |
| `connections_geocheck_by_node_result` | Get Geocheck for Node by Job ID | `GET /api/connections/geocheck/:jobId` | read |
| `connections_drop` | Drop Connections for Users or IPs | `POST /api/connections/drop` | write |

#### Metadata (4)

| Tool | Description | Endpoint | Mode |
|------|-------------|----------|------|
| `metadata_node_get` | Get node metadata | `GET /api/metadata/node/:uuid` | read |
| `metadata_node_upsert` | Update or create Node Metadata | `PUT /api/metadata/node/:uuid` | write |
| `metadata_user_get` | Get user metadata | `GET /api/metadata/user/:userId` | read |
| `metadata_user_upsert` | Update or create User Metadata | `PUT /api/metadata/user/:userId` | write |

#### API tokens (4)

| Tool | Description | Endpoint | Mode |
|------|-------------|----------|------|
| `api_tokens_list` | Get all API tokens | `GET /api/tokens/` | read |
| `api_tokens_scopes` | Get available API token scopes | `GET /api/tokens/scopes` | read |
| `api_tokens_create` | Create a new API token | `POST /api/tokens/` | write |
| `api_tokens_delete` | Delete API token | `DELETE /api/tokens/:uuid` | write |

#### Panel settings (2)

| Tool | Description | Endpoint | Mode |
|------|-------------|----------|------|
| `settings_get` | Get Remnawave settings | `GET /api/remnawave-settings/` | read |
| `settings_update` | Update Remnawave settings | `PATCH /api/remnawave-settings/` | write |

#### Snippets (5)

| Tool | Description | Endpoint | Mode |
|------|-------------|----------|------|
| `snippets_list` | Get snippets | `GET /api/snippets/` | read |
| `snippets_create` | Create snippet | `POST /api/snippets/` | write |
| `snippets_update` | Update snippet | `PATCH /api/snippets/` | write |
| `snippets_delete` | Delete snippet | `DELETE /api/snippets/` | write |
| `snippets_sync` | Sync snippet to affected config profiles | `POST /api/snippets/actions/sync` | write |

#### Infra billing (12)

| Tool | Description | Endpoint | Mode |
|------|-------------|----------|------|
| `billing_providers_list` | Get all infra providers | `GET /api/infra-billing/providers` | read |
| `billing_provider_get` | Get infra provider by uuid | `GET /api/infra-billing/providers/:uuid` | read |
| `billing_provider_create` | Create infra provider | `POST /api/infra-billing/providers` | write |
| `billing_provider_update` | Update infra provider | `PATCH /api/infra-billing/providers` | write |
| `billing_provider_delete` | Delete infra provider by uuid | `DELETE /api/infra-billing/providers/:uuid` | write |
| `billing_nodes_list` | Get infra billing nodes | `GET /api/infra-billing/nodes` | read |
| `billing_node_create` | Create infra billing node | `POST /api/infra-billing/nodes` | write |
| `billing_node_update` | Update infra billing nodes | `PATCH /api/infra-billing/nodes` | write |
| `billing_node_delete` | Delete infra billing node | `DELETE /api/infra-billing/nodes/:uuid` | write |
| `billing_history_list` | Get infra billing history | `GET /api/infra-billing/history` | read |
| `billing_history_create` | Create infra billing history | `POST /api/infra-billing/history` | write |
| `billing_history_delete` | Delete infra billing history | `DELETE /api/infra-billing/history/:uuid` | write |

#### Node plugins (20)

| Tool | Description | Endpoint | Mode |
|------|-------------|----------|------|
| `node_plugins_list` | Get all Node Plugins | `GET /api/node-plugins/` | read |
| `node_plugins_get` | Get Node Plugin by uuid | `GET /api/node-plugins/:uuid` | read |
| `node_plugins_create` | Create Node Plugin | `POST /api/node-plugins/` | write |
| `node_plugins_update` | Update Node Plugin | `PATCH /api/node-plugins/` | write |
| `node_plugins_delete` | Delete Node Plugin | `DELETE /api/node-plugins/:uuid` | write |
| `node_plugins_reorder` | Reorder Node Plugins | `POST /api/node-plugins/actions/reorder` | write |
| `node_plugins_clone` | Clone Node Plugin | `POST /api/node-plugins/actions/clone` | write |
| `node_plugins_sync` | Sync Node Plugin to nodes | `POST /api/node-plugins/actions/sync` | write |
| `node_plugins_execute` | Execute command on node plugins | `POST /api/node-plugins/executor` | write |
| `node_plugins_tags_list` | Get tags of Node Plugins | `GET /api/node-plugins/tags` | read |
| `node_plugins_set_tags` | Set tags of Node Plugin | `PATCH /api/node-plugins/tags` | write |
| `node_plugins_torrent_reports` | Get Torrent Blocker Reports | `GET /api/node-plugins/torrent-blocker` | read |
| `node_plugins_torrent_stats` | Get Torrent Blocker Reports Stats | `GET /api/node-plugins/torrent-blocker/stats` | read |
| `node_plugins_torrent_truncate` | Truncate Torrent Blocker Reports | `DELETE /api/node-plugins/torrent-blocker/truncate` | write |
| `shared_lists_list` | Get Shared Lists (Preview) | `GET /api/node-plugins/shared-lists` | read |
| `shared_lists_get` | Get Shared List by name | `GET /api/node-plugins/shared-lists/by-name` | read |
| `shared_lists_create` | Create Shared List | `POST /api/node-plugins/shared-lists` | write |
| `shared_lists_update` | Update Shared List | `PATCH /api/node-plugins/shared-lists` | write |
| `shared_lists_delete` | Delete Shared List by name | `DELETE /api/node-plugins/shared-lists` | write |
| `shared_lists_sync` | Sync Shared List to nodes | `POST /api/node-plugins/shared-lists/actions/sync` | write |

#### Node integrations (5)

| Tool | Description | Endpoint | Mode |
|------|-------------|----------|------|
| `node_integrations_list` | Get all Node Integrations | `GET /api/node-integrations/` | read |
| `node_integrations_get` | Get Node Integration by uuid | `GET /api/node-integrations/:uuid` | read |
| `node_integrations_create` | Create Node Integration | `POST /api/node-integrations/` | write |
| `node_integrations_update` | Update Node Integration | `PATCH /api/node-integrations/` | write |
| `node_integrations_delete` | Delete Node Integration | `DELETE /api/node-integrations/:uuid` | write |

### Resources

| URI | Description |
|-----|-------------|
| `remnawave://stats` | Current panel statistics |
| `remnawave://nodes` | All nodes status |
| `remnawave://health` | Panel health status |
| `remnawave://users/{userId}` | Specific user details |

### Prompts

| Prompt | Description |
|--------|-------------|
| `create_user_wizard` | Step-by-step user creation guide |
| `node_diagnostics` | Node troubleshooting |
| `traffic_report` | Traffic usage report |
| `user_audit` | Complete user audit |
| `bulk_user_cleanup` | Find and manage expired users |

### Example Queries

```
"Show me all users with expired subscriptions"
"Create user vasya with 50 GB limit for one month"
"Restart node amsterdam-01"
"Give me a traffic report for the last week"
"Disable users who exceeded their traffic limit"
"Which nodes are offline right now?"
"Show billing history"
"List all node plugins"
"Get active connections for user X"
```

### Project Structure

```
src/
├── index.ts               # Entry point (stdio transport)
├── server.ts              # McpServer setup
├── config.ts              # Environment config
├── client/
│   └── index.ts           # Generic Remnawave HTTP client
├── tools/
│   ├── catalog.ts         # Tool name → contract command mapping
│   ├── define.ts          # Builds MCP tools from contract commands
│   ├── helpers.ts         # Result formatting helpers
│   └── index.ts           # Tool registration (readonly filtering)
├── resources/
│   └── index.ts           # MCP resources
└── prompts/
    └── index.ts           # MCP prompts
```

To expose a new endpoint, add one line to `src/tools/catalog.ts`:

```ts
t('users_extend', C.ExtendUserCommand),
```

### License

MIT

---

<a id="русский"></a>

## MCP-сервер для Remnawave Panel

MCP-сервер ([Model Context Protocol](https://modelcontextprotocol.io)), предоставляющий LLM-клиентам (Claude Desktop, Cursor, Windsurf и др.) инструменты для управления VPN-панелью [Remnawave](https://github.com/remnawave/).

**Версия:** 2.0.0 | **Remnawave API:** 3.4.x (`@remnawave/backend-contract` 3.4.15)

### Возможности

- **203 инструмента** — пользователи, ноды, хосты, подписки, шаблоны и настройки подписок, сквады, HWID, конфиг-профили, статистика трафика, подключения, API-токены, биллинг, сниппеты, настройки, страницы подписок, плагины нод и shared lists, интеграции нод, метаданные
- **3 ресурса** — статистика панели, статус нод, проверка здоровья в реальном времени
- **5 промптов** — пошаговые сценарии для типичных задач
- **Readonly-режим** — ограничение до 94 инструментов только для чтения
- **Поддержка Caddy** — заголовок `X-Api-Key` для панелей за Caddy с кастомным путём
- **Генерация из контракта** — каждый инструмент строится из [@remnawave/backend-contract](https://www.npmjs.com/package/@remnawave/backend-contract): маршруты, HTTP-методы, входные схемы и валидация всегда совпадают с API панели
- **Аннотации инструментов** — `readOnlyHint` / `destructiveHint`, чтобы клиент запрашивал подтверждение перед опасными действиями
- **stdio транспорт** — работает с Claude Desktop, Cursor, Windsurf и любым MCP-совместимым клиентом

### Требования

- Node.js >= 22
- Remnawave панель с API-токеном (Настройки > API Tokens)

### Установка

```bash
git clone https://github.com/NeoN-777/remnawave-v3-mcp.git
cd remnawave-v3-mcp
npm install
npm run build
```

### Конфигурация

Создайте файл `.env` или передайте переменные окружения:

| Переменная | Обязательная | Описание |
|------------|-------------|----------|
| `REMNAWAVE_BASE_URL` | Да | URL панели (например `https://vpn.example.com`) |
| `REMNAWAVE_API_TOKEN` | Да | API-токен из настроек панели |
| `REMNAWAVE_API_KEY` | Нет | API-ключ для аутентификации через Caddy reverse proxy |
| `REMNAWAVE_READONLY` | Нет | `true` для включения режима только чтения |

```env
REMNAWAVE_BASE_URL=https://vpn.example.com
REMNAWAVE_API_TOKEN=ваш-api-токен
```

### Caddy с кастомным путём

Если ваша панель Remnawave развёрнута за [Caddy с кастомным путём и защитой API-ключом](https://docs.remnawave.com/docs/security/caddy-with-custom-path/), укажите полный путь в base URL и предоставьте API-ключ:

```env
REMNAWAVE_BASE_URL=https://example.com/your-secret-path/api
REMNAWAVE_API_KEY=ваш-caddy-api-ключ
```

Заголовок `X-Api-Key` будет автоматически добавляться к каждому запросу.

### Режим Readonly

Установите `REMNAWAVE_READONLY=true`, чтобы отключить все операции записи (создание, обновление, удаление, включение, отключение, перезапуск, отзыв, сброс). Будут зарегистрированы только инструменты чтения.

Полезно для мониторинговых дашбордов или общих окружений, где нужно исключить случайные изменения.

В readonly-режиме регистрируются только 94 инструмента с пометкой `read` в таблицах ниже (классификация чтение/запись берётся из контракта).

### Миграция с 1.x

Версия 2.0 рассчитана на Remnawave 3.x, где API изменился несовместимо:

- **Пользователи адресуются числовым `userId`** вместо UUID (`users_get`, `users_delete`, `users_enable`, `users_disable`, `users_reset_traffic`, `users_revoke_subscription`, `hwid_devices_list`, `metadata_user_*`, `subscriptions_get_by_id`, `subscriptions_get_connection_keys`, ...). ID можно получить через `users_get_by_username`, `users_get_by_short_uuid` или `users_resolve`.
- Bulk-инструменты пользователей принимают `userIds` (числа) вместо `uuids`; `users_bulk_update` принимает `{ userIds, fields }`.
- `users_get_by_telegram_id`, `users_get_by_email`, `users_get_by_tag`, `users_get_by_subscription_uuid` удалены из API — используйте `users_list` с `filters`, например `[{"id":"telegramId","value":"123"}]`.
- `users_resolve` принимает ровно одно из полей: `id`, `shortUuid`, `username`.
- Новый `users_extend` — продление одного пользователя на N дней.
- `subscriptions_get_by_uuid` → `subscriptions_get_by_id`.
- `hosts_bulk_set_inbound` / `hosts_bulk_set_port` → `hosts_bulk_update`.
- `ip_control_*` → `connections_*` (по пользователю, по ноде, geocheck, сброс).
- `squads_add_users` / `squads_remove_users` принимают `userIds`; добавить/убрать *всех* пользователей — `squads_add_all_users` / `squads_remove_all_users`.
- `external_squads_add_users` / `external_squads_remove_users` → `external_squads_add_all_users` / `external_squads_remove_all_users` (одного пользователя назначайте через `users_update` → `externalSquadUuid`).
- Ресурс `remnawave://users/{uuid}` → `remnawave://users/{userId}`.
- `settings_*` и `api_tokens_*` требуют JWT администратора; с обычным API-токеном панель вернёт 403.

### Использование с Claude Desktop

Добавьте в конфигурацию Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json` на macOS):

```json
{
  "mcpServers": {
    "remnawave": {
      "command": "node",
      "args": ["/абсолютный/путь/к/remnawave-mcp/dist/index.js"],
      "env": {
        "REMNAWAVE_BASE_URL": "https://vpn.example.com",
        "REMNAWAVE_API_TOKEN": "ваш-api-токен",
        "REMNAWAVE_API_KEY": "ваш-caddy-api-ключ",
        "REMNAWAVE_READONLY": "false"
      }
    }
  }
}
```

### Использование с Cursor / Windsurf

Добавьте в `.cursor/mcp.json` или `.windsurf/mcp.json` вашего проекта:

```json
{
  "mcpServers": {
    "remnawave": {
      "command": "node",
      "args": ["/абсолютный/путь/к/remnawave-mcp/dist/index.js"],
      "env": {
        "REMNAWAVE_BASE_URL": "https://vpn.example.com",
        "REMNAWAVE_API_TOKEN": "ваш-api-токен",
        "REMNAWAVE_API_KEY": "ваш-caddy-api-ключ",
        "REMNAWAVE_READONLY": "false"
      }
    }
  }
}
```

### Docker

```bash
npm run build
docker compose up -d
```

Переменные окружения передаются через `.env` файл или `docker-compose.yml`.

### Доступные инструменты

Инструменты генерируются из команд `@remnawave/backend-contract`: входные схемы, валидация и описания берутся из контракта. Описания в таблицах — из контракта (на английском).

#### Пользователи (26)

| Инструмент | Описание | Эндпоинт | Режим |
|------------|----------|----------|-------|
| `users_list` | Get all users using offset-based pagination | `GET /api/users/` | read |
| `users_get` | Get user by ID | `GET /api/users/:userId` | read |
| `users_get_by_username` | Get user by username | `GET /api/users/by-username/:username` | read |
| `users_get_by_short_uuid` | Get user by Short UUID | `GET /api/users/by-short-uuid/:shortUuid` | read |
| `users_resolve` | Resolve a user | `POST /api/users/resolve` | read |
| `users_tags_list` | Get users tags | `GET /api/users/tags` | read |
| `users_accessible_nodes` | Get user accessible nodes | `GET /api/users/:userId/accessible-nodes` | read |
| `users_subscription_request_history` | Get user subscription request history, recent 24 records | `GET /api/users/:userId/subscription-request-history` | read |
| `users_create` | Create a new user | `POST /api/users/` | write |
| `users_update` | Update a user | `PATCH /api/users/` | write |
| `users_delete` | Delete user | `DELETE /api/users/:userId` | write |
| `users_enable` | Enable user | `POST /api/users/:userId/actions/enable` | write |
| `users_disable` | Disable user | `POST /api/users/:userId/actions/disable` | write |
| `users_reset_traffic` | Reset user traffic | `POST /api/users/:userId/actions/reset-traffic` | write |
| `users_revoke_subscription` | Revoke user subscription | `POST /api/users/:userId/actions/revoke` | write |
| `users_extend` | Extend user expiration date | `POST /api/users/:userId/actions/extend` | write |
| `users_bulk_delete_by_status` | Bulk delete users by status | `POST /api/users/bulk/delete-by-status` | write |
| `users_bulk_delete` | Bulk delete users by User IDs | `POST /api/users/bulk/delete` | write |
| `users_bulk_update` | Bulk update users by User IDs | `POST /api/users/bulk/update` | write |
| `users_bulk_reset_traffic` | Bulk reset traffic users by User IDs | `POST /api/users/bulk/reset-traffic` | write |
| `users_bulk_revoke_subscription` | Revoke users subscription by User IDs | `POST /api/users/bulk/revoke-subscription` | write |
| `users_bulk_update_squads` | Bulk update users internal squads by User IDs | `POST /api/users/bulk/update-squads` | write |
| `users_bulk_extend_expiration` | Extend expiration date for specified users by days | `POST /api/users/bulk/extend-expiration-date` | write |
| `users_bulk_all_update` | Bulk update all users | `POST /api/users/bulk/all/update` | write |
| `users_bulk_all_reset_traffic` | Reset user used traffic for all users | `POST /api/users/bulk/all/reset-traffic` | write |
| `users_bulk_all_extend_expiration` | Extend expiration date for all users by days | `POST /api/users/bulk/all/extend-expiration-date` | write |

#### Ноды (15)

| Инструмент | Описание | Эндпоинт | Режим |
|------------|----------|----------|-------|
| `nodes_list` | Get nodes | `GET /api/nodes/` | read |
| `nodes_get` | Get node by UUID | `GET /api/nodes/:uuid` | read |
| `nodes_tags_list` | Get nodes tags | `GET /api/nodes/tags` | read |
| `nodes_create` | Create a new node | `POST /api/nodes/` | write |
| `nodes_update` | Update node | `PATCH /api/nodes/` | write |
| `nodes_delete` | Delete a node | `DELETE /api/nodes/:uuid` | write |
| `nodes_enable` | Enable a node | `POST /api/nodes/:uuid/actions/enable` | write |
| `nodes_disable` | Disable a node | `POST /api/nodes/:uuid/actions/disable` | write |
| `nodes_restart` | Restart node | `POST /api/nodes/:uuid/actions/restart` | write |
| `nodes_restart_all` | Restart all nodes | `POST /api/nodes/actions/restart-all` | write |
| `nodes_reset_traffic` | Reset Node Traffic | `POST /api/nodes/:uuid/actions/reset-traffic` | write |
| `nodes_reorder` | Reorder nodes | `POST /api/nodes/actions/reorder` | write |
| `nodes_bulk_actions` | Perform actions for many nodes | `POST /api/nodes/bulk-actions` | write |
| `nodes_bulk_update` | Update many nodes | `POST /api/nodes/bulk-actions/update` | write |
| `nodes_bulk_profile_modification` | Modify Inbounds & Profile for many nodes | `POST /api/nodes/bulk-actions/profile-modification` | write |

#### Хосты (12)

| Инструмент | Описание | Эндпоинт | Режим |
|------------|----------|----------|-------|
| `hosts_list` | Get hosts | `GET /api/hosts/` | read |
| `hosts_get` | Get a host by UUID | `GET /api/hosts/:uuid` | read |
| `hosts_tags_list` | Get tags of hosts | `GET /api/hosts/tags` | read |
| `hosts_create` | Create a new host | `POST /api/hosts/` | write |
| `hosts_update` | Update a host | `PATCH /api/hosts/` | write |
| `hosts_delete` | Delete a host by UUID | `DELETE /api/hosts/:uuid` | write |
| `hosts_clone` | Clone host | `POST /api/hosts/actions/clone` | write |
| `hosts_reorder` | Reorder hosts | `POST /api/hosts/actions/reorder` | write |
| `hosts_bulk_enable` | Enable hosts by UUIDs | `POST /api/hosts/bulk/enable` | write |
| `hosts_bulk_disable` | Disable hosts by UUIDs | `POST /api/hosts/bulk/disable` | write |
| `hosts_bulk_delete` | Delete hosts by UUIDs | `POST /api/hosts/bulk/delete` | write |
| `hosts_bulk_update` | Update many hosts | `PATCH /api/hosts/bulk/update` | write |

#### Система (14)

| Инструмент | Описание | Эндпоинт | Режим |
|------------|----------|----------|-------|
| `system_stats` | Get Stats | `GET /api/system/stats` | read |
| `system_stats_digest` | Get Stats Digest | `GET /api/system/stats/digest` | read |
| `system_stats_recap` | Get Recap | `GET /api/system/stats/recap` | read |
| `system_stats_http` | Get HTTP Stats | `GET /api/system/stats/http` | read |
| `system_bandwidth_stats` | Get Bandwidth Stats | `GET /api/system/stats/bandwidth` | read |
| `system_nodes_statistics` | Get Nodes Statistics | `GET /api/system/stats/nodes` | read |
| `system_nodes_metrics` | Get Nodes Metrics | `GET /api/system/nodes/metrics` | read |
| `system_health` | Get Remnawave Health | `GET /api/system/health` | read |
| `system_metadata` | Get Remnawave Information | `GET /api/system/metadata` | read |
| `system_configuration` | Get Remnawave Configuration | `GET /api/system/configuration` | read |
| `system_generate_x25519` | Generate 30 X25519 keypairs | `GET /api/system/tools/x25519/generate` | read |
| `system_srr_matcher` | Test SRR Matcher | `POST /api/system/testers/srr-matcher` | read |
| `auth_status` | Get the status of the authentication | `GET /api/auth/status` | read |
| `keygen_get` | Get SECRET_KEY for Remnawave Node | `GET /api/keygen/` | read |

#### Статистика трафика (7)

| Инструмент | Описание | Эндпоинт | Режим |
|------------|----------|----------|-------|
| `bandwidth_nodes_usage` | Get Nodes Usage by Range | `GET /api/bandwidth-stats/nodes/` | read |
| `bandwidth_node_users_usage` | Get Node Users Usage by Node UUID | `GET /api/bandwidth-stats/nodes/:uuid/users` | read |
| `bandwidth_nodes_users_usage` | Get Nodes Users Usage by Nodes UUIDs | `POST /api/bandwidth-stats/nodes/users` | read |
| `bandwidth_nodes_threshold_usage` | Get users exceeding a traffic threshold on the given nodes for a period | `POST /api/bandwidth-stats/nodes/usage` | read |
| `bandwidth_user_usage` | Get User Usage by Range | `GET /api/bandwidth-stats/users/:userId` | read |
| `bandwidth_squad_usage` | Get internal squad users traffic usage for a period | `GET /api/bandwidth-stats/internal-squads/:uuid/usage` | read |
| `bandwidth_squad_user_usage` | Get a single user daily traffic usage on the internal squad nodes for a period | `GET /api/bandwidth-stats/internal-squads/:squadUuid/users/:userId/usage` | read |

#### Подписки (10)

| Инструмент | Описание | Эндпоинт | Режим |
|------------|----------|----------|-------|
| `subscriptions_list` | Get all subscriptions | `GET /api/subscriptions/` | read |
| `subscriptions_get_by_id` | Get subscription by User ID | `GET /api/subscriptions/by-id/:userId` | read |
| `subscriptions_get_by_username` | Get subscription by username | `GET /api/subscriptions/by-username/:username` | read |
| `subscriptions_get_by_short_uuid` | Get subscription by short uuid (protected route) | `GET /api/subscriptions/by-short-uuid/:shortUuid` | read |
| `subscriptions_get_raw_by_short_uuid` | Get Raw Subscription by Short UUID | `GET /api/subscriptions/by-short-uuid/:shortUuid/raw` | read |
| `subscriptions_get_subpage_config` | Get Subpage Config by Short UUID | `GET /api/subscriptions/subpage-config/:shortUuid` | read |
| `subscriptions_get_connection_keys` | Get connection keys (base64 format) by user id | `GET /api/subscriptions/connection-keys/:userId` | read |
| `subscription_info` | Get Subscription Info by Short UUID | `GET /api/sub/:shortUuid/info` | read |
| `subscription_request_history_list` | Get all subscription request history | `GET /api/subscription-request-history/` | read |
| `subscription_request_history_stats` | Get subscription request history stats | `GET /api/subscription-request-history/stats` | read |

#### Настройки и шаблоны подписок (10)

| Инструмент | Описание | Эндпоинт | Режим |
|------------|----------|----------|-------|
| `subscription_settings_get` | Get subscription settings | `GET /api/subscription-settings/` | read |
| `subscription_settings_update` | Update subscription settings | `PATCH /api/subscription-settings/` | write |
| `subscription_templates_list` | Get all subscription templates (wihout content) | `GET /api/subscription-templates/` | read |
| `subscription_templates_get` | Get subscription template by uuid | `GET /api/subscription-templates/:uuid` | read |
| `subscription_templates_create` | Create subscription template | `POST /api/subscription-templates/` | write |
| `subscription_templates_update` | Update subscription template | `PATCH /api/subscription-templates/` | write |
| `subscription_templates_delete` | Delete subscription template | `DELETE /api/subscription-templates/:uuid` | write |
| `subscription_templates_reorder` | Reorder subscription templates | `POST /api/subscription-templates/actions/reorder` | write |
| `subscription_templates_tags_list` | Get tags of Subscription Templates | `GET /api/subscription-templates/tags` | read |
| `subscription_templates_set_tags` | Set tags of Subscription Template | `PATCH /api/subscription-templates/tags` | write |

#### Конфиги страницы подписки (9)

| Инструмент | Описание | Эндпоинт | Режим |
|------------|----------|----------|-------|
| `sub_page_configs_list` | Get all subscription page configs | `GET /api/subscription-page-configs/` | read |
| `sub_page_configs_get` | Get subscription page config by uuid | `GET /api/subscription-page-configs/:uuid` | read |
| `sub_page_configs_create` | Create subscription page config | `POST /api/subscription-page-configs/` | write |
| `sub_page_configs_update` | Update subscription page config | `PATCH /api/subscription-page-configs/` | write |
| `sub_page_configs_delete` | Delete subscription page config | `DELETE /api/subscription-page-configs/:uuid` | write |
| `sub_page_configs_reorder` | Reorder subscription page configs | `POST /api/subscription-page-configs/actions/reorder` | write |
| `sub_page_configs_clone` | Clone subscription page config | `POST /api/subscription-page-configs/actions/clone` | write |
| `sub_page_configs_tags_list` | Get tags of Subpage Configs | `GET /api/subscription-page-configs/tags` | read |
| `sub_page_configs_set_tags` | Set tags of Subpage Config | `PATCH /api/subscription-page-configs/tags` | write |

#### Конфиг-профили и inbounds (11)

| Инструмент | Описание | Эндпоинт | Режим |
|------------|----------|----------|-------|
| `config_profiles_list` | Get config profiles | `GET /api/config-profiles/` | read |
| `config_profiles_get` | Get config profile by uuid | `GET /api/config-profiles/:uuid` | read |
| `config_profiles_get_inbounds` | Get inbounds by profile uuid | `GET /api/config-profiles/:uuid/inbounds` | read |
| `config_profiles_get_computed_config` | Get computed config profile by uuid | `GET /api/config-profiles/:uuid/computed-config` | read |
| `config_profiles_create` | Create config profile | `POST /api/config-profiles/` | write |
| `config_profiles_update` | Update Core Config in specific config profile | `PATCH /api/config-profiles/` | write |
| `config_profiles_delete` | Delete config profile | `DELETE /api/config-profiles/:uuid` | write |
| `config_profiles_reorder` | Reorder config profiles | `POST /api/config-profiles/actions/reorder` | write |
| `config_profiles_tags_list` | Get tags of Config Profiles | `GET /api/config-profiles/tags` | read |
| `config_profiles_set_tags` | Set tags of Config Profile | `PATCH /api/config-profiles/tags` | write |
| `inbounds_list` | Get all inbounds from all config profiles | `GET /api/config-profiles/inbounds` | read |

#### Внутренние сквады (13)

| Инструмент | Описание | Эндпоинт | Режим |
|------------|----------|----------|-------|
| `squads_list` | Get all internal squads | `GET /api/internal-squads/` | read |
| `squads_get` | Get internal squad by uuid | `GET /api/internal-squads/:uuid` | read |
| `squads_accessible_nodes` | Get internal squad accessible nodes | `GET /api/internal-squads/:uuid/accessible-nodes` | read |
| `squads_create` | Create internal squad | `POST /api/internal-squads/` | write |
| `squads_update` | Update internal squad | `PATCH /api/internal-squads/` | write |
| `squads_delete` | Delete internal squad | `DELETE /api/internal-squads/:uuid` | write |
| `squads_reorder` | Reorder internal squads | `POST /api/internal-squads/actions/reorder` | write |
| `squads_add_users` | Add many users to internal squad | `POST /api/internal-squads/:uuid/bulk-actions/add-many-users` | write |
| `squads_remove_users` | Delete many users from internal squad | `DELETE /api/internal-squads/:uuid/bulk-actions/remove-many-users` | write |
| `squads_add_all_users` | Add all users to internal squad | `POST /api/internal-squads/:uuid/bulk-actions/add-users` | write |
| `squads_remove_all_users` | Delete users from internal squad | `DELETE /api/internal-squads/:uuid/bulk-actions/remove-users` | write |
| `squads_tags_list` | Get tags of Internal Squads | `GET /api/internal-squads/tags` | read |
| `squads_set_tags` | Set tags of Internal Squad | `PATCH /api/internal-squads/tags` | write |

#### Внешние сквады (10)

| Инструмент | Описание | Эндпоинт | Режим |
|------------|----------|----------|-------|
| `external_squads_list` | Get all external squads | `GET /api/external-squads/` | read |
| `external_squads_get` | Get external squad by uuid | `GET /api/external-squads/:uuid` | read |
| `external_squads_create` | Create external squad | `POST /api/external-squads/` | write |
| `external_squads_update` | Update external squad | `PATCH /api/external-squads/` | write |
| `external_squads_delete` | Delete external squad | `DELETE /api/external-squads/:uuid` | write |
| `external_squads_reorder` | Reorder external squads | `POST /api/external-squads/actions/reorder` | write |
| `external_squads_add_all_users` | Add all users to external squad | `POST /api/external-squads/:uuid/bulk-actions/add-users` | write |
| `external_squads_remove_all_users` | Delete users from external squad | `DELETE /api/external-squads/:uuid/bulk-actions/remove-users` | write |
| `external_squads_tags_list` | Get tags of External Squads | `GET /api/external-squads/tags` | read |
| `external_squads_set_tags` | Set tags of External Squad | `PATCH /api/external-squads/tags` | write |

#### HWID-устройства (7)

| Инструмент | Описание | Эндпоинт | Режим |
|------------|----------|----------|-------|
| `hwid_devices_list_all` | Get HWID devices | `GET /api/hwid/devices` | read |
| `hwid_devices_list` | Get user HWID devices | `GET /api/hwid/devices/:userId` | read |
| `hwid_stats` | Get HWID devices stats | `GET /api/hwid/devices/stats` | read |
| `hwid_top_users` | Get top users by HWID devices | `GET /api/hwid/devices/top-users` | read |
| `hwid_device_create` | Create a user HWID device | `POST /api/hwid/devices` | write |
| `hwid_device_delete` | Delete a user HWID device | `POST /api/hwid/devices/delete` | write |
| `hwid_devices_delete_all` | Delete all user HWID devices | `POST /api/hwid/devices/delete-all` | write |

#### Подключения (бывший IP Control) (7)

| Инструмент | Описание | Эндпоинт | Режим |
|------------|----------|----------|-------|
| `connections_by_user` | Request Connections for User | `POST /api/connections/by-user/:userId` | read |
| `connections_by_user_result` | Get Connections for User by Job ID | `GET /api/connections/by-user/:jobId` | read |
| `connections_by_node` | Request Connections for Node | `POST /api/connections/by-node/:nodeUuid` | read |
| `connections_by_node_result` | Get Connections for Node by Job ID | `GET /api/connections/by-node/:jobId` | read |
| `connections_geocheck_by_node` | Request Geocheck for Node | `POST /api/connections/geocheck/:nodeUuid` | read |
| `connections_geocheck_by_node_result` | Get Geocheck for Node by Job ID | `GET /api/connections/geocheck/:jobId` | read |
| `connections_drop` | Drop Connections for Users or IPs | `POST /api/connections/drop` | write |

#### Метаданные (4)

| Инструмент | Описание | Эндпоинт | Режим |
|------------|----------|----------|-------|
| `metadata_node_get` | Get node metadata | `GET /api/metadata/node/:uuid` | read |
| `metadata_node_upsert` | Update or create Node Metadata | `PUT /api/metadata/node/:uuid` | write |
| `metadata_user_get` | Get user metadata | `GET /api/metadata/user/:userId` | read |
| `metadata_user_upsert` | Update or create User Metadata | `PUT /api/metadata/user/:userId` | write |

#### API-токены (4)

| Инструмент | Описание | Эндпоинт | Режим |
|------------|----------|----------|-------|
| `api_tokens_list` | Get all API tokens | `GET /api/tokens/` | read |
| `api_tokens_scopes` | Get available API token scopes | `GET /api/tokens/scopes` | read |
| `api_tokens_create` | Create a new API token | `POST /api/tokens/` | write |
| `api_tokens_delete` | Delete API token | `DELETE /api/tokens/:uuid` | write |

#### Настройки панели (2)

| Инструмент | Описание | Эндпоинт | Режим |
|------------|----------|----------|-------|
| `settings_get` | Get Remnawave settings | `GET /api/remnawave-settings/` | read |
| `settings_update` | Update Remnawave settings | `PATCH /api/remnawave-settings/` | write |

#### Сниппеты (5)

| Инструмент | Описание | Эндпоинт | Режим |
|------------|----------|----------|-------|
| `snippets_list` | Get snippets | `GET /api/snippets/` | read |
| `snippets_create` | Create snippet | `POST /api/snippets/` | write |
| `snippets_update` | Update snippet | `PATCH /api/snippets/` | write |
| `snippets_delete` | Delete snippet | `DELETE /api/snippets/` | write |
| `snippets_sync` | Sync snippet to affected config profiles | `POST /api/snippets/actions/sync` | write |

#### Биллинг инфраструктуры (12)

| Инструмент | Описание | Эндпоинт | Режим |
|------------|----------|----------|-------|
| `billing_providers_list` | Get all infra providers | `GET /api/infra-billing/providers` | read |
| `billing_provider_get` | Get infra provider by uuid | `GET /api/infra-billing/providers/:uuid` | read |
| `billing_provider_create` | Create infra provider | `POST /api/infra-billing/providers` | write |
| `billing_provider_update` | Update infra provider | `PATCH /api/infra-billing/providers` | write |
| `billing_provider_delete` | Delete infra provider by uuid | `DELETE /api/infra-billing/providers/:uuid` | write |
| `billing_nodes_list` | Get infra billing nodes | `GET /api/infra-billing/nodes` | read |
| `billing_node_create` | Create infra billing node | `POST /api/infra-billing/nodes` | write |
| `billing_node_update` | Update infra billing nodes | `PATCH /api/infra-billing/nodes` | write |
| `billing_node_delete` | Delete infra billing node | `DELETE /api/infra-billing/nodes/:uuid` | write |
| `billing_history_list` | Get infra billing history | `GET /api/infra-billing/history` | read |
| `billing_history_create` | Create infra billing history | `POST /api/infra-billing/history` | write |
| `billing_history_delete` | Delete infra billing history | `DELETE /api/infra-billing/history/:uuid` | write |

#### Плагины нод (20)

| Инструмент | Описание | Эндпоинт | Режим |
|------------|----------|----------|-------|
| `node_plugins_list` | Get all Node Plugins | `GET /api/node-plugins/` | read |
| `node_plugins_get` | Get Node Plugin by uuid | `GET /api/node-plugins/:uuid` | read |
| `node_plugins_create` | Create Node Plugin | `POST /api/node-plugins/` | write |
| `node_plugins_update` | Update Node Plugin | `PATCH /api/node-plugins/` | write |
| `node_plugins_delete` | Delete Node Plugin | `DELETE /api/node-plugins/:uuid` | write |
| `node_plugins_reorder` | Reorder Node Plugins | `POST /api/node-plugins/actions/reorder` | write |
| `node_plugins_clone` | Clone Node Plugin | `POST /api/node-plugins/actions/clone` | write |
| `node_plugins_sync` | Sync Node Plugin to nodes | `POST /api/node-plugins/actions/sync` | write |
| `node_plugins_execute` | Execute command on node plugins | `POST /api/node-plugins/executor` | write |
| `node_plugins_tags_list` | Get tags of Node Plugins | `GET /api/node-plugins/tags` | read |
| `node_plugins_set_tags` | Set tags of Node Plugin | `PATCH /api/node-plugins/tags` | write |
| `node_plugins_torrent_reports` | Get Torrent Blocker Reports | `GET /api/node-plugins/torrent-blocker` | read |
| `node_plugins_torrent_stats` | Get Torrent Blocker Reports Stats | `GET /api/node-plugins/torrent-blocker/stats` | read |
| `node_plugins_torrent_truncate` | Truncate Torrent Blocker Reports | `DELETE /api/node-plugins/torrent-blocker/truncate` | write |
| `shared_lists_list` | Get Shared Lists (Preview) | `GET /api/node-plugins/shared-lists` | read |
| `shared_lists_get` | Get Shared List by name | `GET /api/node-plugins/shared-lists/by-name` | read |
| `shared_lists_create` | Create Shared List | `POST /api/node-plugins/shared-lists` | write |
| `shared_lists_update` | Update Shared List | `PATCH /api/node-plugins/shared-lists` | write |
| `shared_lists_delete` | Delete Shared List by name | `DELETE /api/node-plugins/shared-lists` | write |
| `shared_lists_sync` | Sync Shared List to nodes | `POST /api/node-plugins/shared-lists/actions/sync` | write |

#### Интеграции нод (5)

| Инструмент | Описание | Эндпоинт | Режим |
|------------|----------|----------|-------|
| `node_integrations_list` | Get all Node Integrations | `GET /api/node-integrations/` | read |
| `node_integrations_get` | Get Node Integration by uuid | `GET /api/node-integrations/:uuid` | read |
| `node_integrations_create` | Create Node Integration | `POST /api/node-integrations/` | write |
| `node_integrations_update` | Update Node Integration | `PATCH /api/node-integrations/` | write |
| `node_integrations_delete` | Delete Node Integration | `DELETE /api/node-integrations/:uuid` | write |

### Ресурсы

| URI | Описание |
|-----|----------|
| `remnawave://stats` | Текущая статистика панели |
| `remnawave://nodes` | Статус всех нод |
| `remnawave://health` | Состояние здоровья панели |
| `remnawave://users/{userId}` | Данные конкретного пользователя |

### Промпты

| Промпт | Описание |
|--------|----------|
| `create_user_wizard` | Пошаговое создание пользователя |
| `node_diagnostics` | Диагностика ноды |
| `traffic_report` | Отчёт по трафику |
| `user_audit` | Полный аудит пользователя |
| `bulk_user_cleanup` | Поиск и управление просроченными пользователями |

### Примеры запросов

```
«Покажи мне всех пользователей с истёкшей подпиской»
«Создай пользователя vasya с лимитом 50 ГБ на месяц»
«Перезапусти ноду amsterdam-01»
«Дай отчёт по трафику за последнюю неделю»
«Отключи пользователей, которые превысили лимит трафика»
«Какие ноды сейчас офлайн?»
«Покажи историю биллинга»
«Список плагинов нод»
«Покажи активные подключения пользователя X»
```

### Структура проекта

```
src/
├── index.ts               # Точка входа (stdio транспорт)
├── server.ts              # Настройка McpServer
├── config.ts              # Конфигурация окружения
├── client/
│   └── index.ts           # Универсальный HTTP-клиент Remnawave
├── tools/
│   ├── catalog.ts         # Соответствие инструментов командам контракта
│   ├── define.ts          # Сборка MCP-инструментов из команд контракта
│   ├── helpers.ts         # Хелперы форматирования
│   └── index.ts           # Регистрация инструментов (фильтр readonly)
├── resources/
│   └── index.ts           # MCP-ресурсы
└── prompts/
    └── index.ts           # MCP-промпты
```

Чтобы добавить новый эндпоинт, достаточно одной строки в `src/tools/catalog.ts`:

```ts
t('users_extend', C.ExtendUserCommand),
```

### Лицензия

MIT
