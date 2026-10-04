import * as C from '@remnawave/backend-contract';
import { ContractCommand, ToolSpec } from './define.js';

const USER_ID_HINT =
    'Users are identified by numeric `userId` (the `id` field) — get it via users_get_by_username, users_get_by_short_uuid or users_resolve.';

const TABLE_QUERY_HINT =
    'Supports TanStack-style `filters` (e.g. [{"id":"email","value":"john"}]), `filterModes` and `sorting` (e.g. [{"id":"createdAt","desc":true}]).';

function t(
    name: string,
    command: unknown,
    extra: Omit<ToolSpec, 'name' | 'command'> = {},
): ToolSpec {
    return { name, command: command as ContractCommand, ...extra };
}

export const TOOL_CATALOG: ToolSpec[] = [
    // Users
    t('users_list', C.GetUsersCommand, {
        hint: `${TABLE_QUERY_HINT} Use filters to search by email, telegramId, tag, status, etc.`,
    }),
    t('users_get', C.GetUserByIdCommand, { hint: USER_ID_HINT }),
    t('users_get_by_username', C.GetUserByUsernameCommand),
    t('users_get_by_short_uuid', C.GetUserByShortUuidCommand),
    t('users_resolve', C.ResolveUserCommand),
    t('users_tags_list', C.GetUsersTagsCommand),
    t('users_accessible_nodes', C.GetUserAccessibleNodesCommand, { hint: USER_ID_HINT }),
    t('users_subscription_request_history', C.GetUserSubscriptionRequestHistoryCommand, {
        hint: USER_ID_HINT,
    }),
    t('users_create', C.CreateUserCommand),
    t('users_update', C.UpdateUserCommand, {
        hint: 'Identify the user with either `id` or `username`.',
    }),
    t('users_delete', C.DeleteUserCommand, { hint: USER_ID_HINT }),
    t('users_enable', C.EnableUserCommand, { hint: USER_ID_HINT }),
    t('users_disable', C.DisableUserCommand, { hint: USER_ID_HINT }),
    t('users_reset_traffic', C.ResetUserTrafficCommand, { hint: USER_ID_HINT }),
    t('users_revoke_subscription', C.RevokeUserSubscriptionCommand, {
        hint: USER_ID_HINT,
        destructive: true,
    }),
    t('users_extend', C.ExtendUserCommand, { hint: USER_ID_HINT }),
    t('users_bulk_delete_by_status', C.BulkDeleteUsersByStatusCommand, { destructive: true }),
    t('users_bulk_delete', C.BulkDeleteUsersCommand, { destructive: true }),
    t('users_bulk_update', C.BulkUpdateUsersCommand),
    t('users_bulk_reset_traffic', C.BulkResetTrafficUsersCommand),
    t('users_bulk_revoke_subscription', C.BulkRevokeUsersSubscriptionCommand, {
        destructive: true,
    }),
    t('users_bulk_update_squads', C.BulkUpdateUsersSquadsCommand),
    t('users_bulk_extend_expiration', C.BulkExtendExpirationDateCommand),
    t('users_bulk_all_update', C.BulkAllUpdateUsersCommand, { hint: 'Affects ALL users.' }),
    t('users_bulk_all_reset_traffic', C.BulkAllResetTrafficUsersCommand, {
        hint: 'Affects ALL users.',
    }),
    t('users_bulk_all_extend_expiration', C.BulkAllExtendExpirationDateCommand, {
        hint: 'Affects ALL users.',
    }),

    // Nodes
    t('nodes_list', C.GetNodesCommand),
    t('nodes_get', C.GetNodeCommand),
    t('nodes_tags_list', C.GetNodesTagsCommand),
    t('nodes_create', C.CreateNodeCommand),
    t('nodes_update', C.UpdateNodeCommand),
    t('nodes_delete', C.DeleteNodeCommand),
    t('nodes_enable', C.EnableNodeCommand),
    t('nodes_disable', C.DisableNodeCommand),
    t('nodes_restart', C.RestartNodeCommand),
    t('nodes_restart_all', C.RestartAllNodesCommand),
    t('nodes_reset_traffic', C.ResetNodeTrafficCommand),
    t('nodes_reorder', C.ReorderNodesCommand),
    t('nodes_bulk_actions', C.BulkNodesActionsCommand),
    t('nodes_bulk_update', C.BulkNodesUpdateCommand),
    t('nodes_bulk_profile_modification', C.BulkNodesProfileModificationCommand),

    // Hosts
    t('hosts_list', C.GetHostsCommand),
    t('hosts_get', C.GetHostCommand),
    t('hosts_tags_list', C.GetHostsTagsCommand),
    t('hosts_create', C.CreateHostCommand),
    t('hosts_update', C.UpdateHostCommand),
    t('hosts_delete', C.DeleteHostCommand),
    t('hosts_clone', C.CloneHostCommand),
    t('hosts_reorder', C.ReorderHostsCommand),
    t('hosts_bulk_enable', C.BulkEnableHostsCommand),
    t('hosts_bulk_disable', C.BulkDisableHostsCommand),
    t('hosts_bulk_delete', C.BulkDeleteHostsCommand, { destructive: true }),
    t('hosts_bulk_update', C.UpdateManyHostsCommand, {
        hint: 'Replaces the former hosts_bulk_set_inbound / hosts_bulk_set_port tools.',
    }),

    // System
    t('system_stats', C.GetStatsCommand),
    t('system_stats_digest', C.GetStatsDigestCommand),
    t('system_stats_recap', C.GetRecapCommand),
    t('system_stats_http', C.GetHttpStatsCommand),
    t('system_bandwidth_stats', C.GetBandwidthStatsCommand),
    t('system_nodes_statistics', C.GetNodesStatisticsCommand),
    t('system_nodes_metrics', C.GetNodesMetricsCommand),
    t('system_health', C.GetRemnawaveHealthCommand),
    t('system_metadata', C.GetMetadataCommand),
    t('system_configuration', C.GetConfigurationCommand),
    t('system_generate_x25519', C.GenerateX25519Command),
    t('system_srr_matcher', C.TestSrrMatcherCommand, { readOnly: true }),
    t('auth_status', C.GetStatusCommand),
    t('keygen_get', C.GetNodeSecretKeyCommand),

    // Bandwidth stats
    t('bandwidth_nodes_usage', C.GetStatsNodesUsageCommand),
    t('bandwidth_node_users_usage', C.GetStatsNodeUsersUsageCommand),
    t('bandwidth_nodes_users_usage', C.GetStatsNodesUsersUsageCommand),
    t('bandwidth_nodes_threshold_usage', C.GetNodeUsageCommand),
    t('bandwidth_user_usage', C.GetStatsUserUsageCommand, { hint: USER_ID_HINT }),
    t('bandwidth_squad_usage', C.GetInternalSquadUsageCommand),
    t('bandwidth_squad_user_usage', C.GetInternalSquadUserUsageCommand, { hint: USER_ID_HINT }),

    // Subscriptions
    t('subscriptions_list', C.GetSubscriptionsCommand),
    t('subscriptions_get_by_id', C.GetSubscriptionByIdCommand, { hint: USER_ID_HINT }),
    t('subscriptions_get_by_username', C.GetSubscriptionByUsernameCommand),
    t('subscriptions_get_by_short_uuid', C.GetSubscriptionByShortUuidProtectedCommand),
    t('subscriptions_get_raw_by_short_uuid', C.GetRawSubscriptionByShortUuidCommand),
    t('subscriptions_get_subpage_config', C.GetSubpageConfigByShortUuidCommand),
    t('subscriptions_get_connection_keys', C.GetConnectionKeysByUserIdCommand, {
        hint: USER_ID_HINT,
    }),
    t('subscription_info', C.GetSubscriptionInfoByShortUuidCommand),
    t('subscription_request_history_list', C.GetSubscriptionRequestHistoryCommand, {
        hint: TABLE_QUERY_HINT,
    }),
    t('subscription_request_history_stats', C.GetSubscriptionRequestHistoryStatsCommand),

    // Subscription settings & templates
    t('subscription_settings_get', C.GetSubscriptionSettingsCommand),
    t('subscription_settings_update', C.UpdateSubscriptionSettingsCommand),
    t('subscription_templates_list', C.GetSubscriptionTemplatesCommand),
    t('subscription_templates_get', C.GetSubscriptionTemplateCommand),
    t('subscription_templates_create', C.CreateSubscriptionTemplateCommand),
    t('subscription_templates_update', C.UpdateSubscriptionTemplateCommand),
    t('subscription_templates_delete', C.DeleteSubscriptionTemplateCommand),
    t('subscription_templates_reorder', C.ReorderSubscriptionTemplateCommand),
    t('subscription_templates_tags_list', C.GetSubscriptionTemplatesTagsCommand),
    t('subscription_templates_set_tags', C.SetSubscriptionTemplateTagsCommand),

    // Subscription page configs
    t('sub_page_configs_list', C.GetSubpageConfigsCommand),
    t('sub_page_configs_get', C.GetSubpageConfigCommand),
    t('sub_page_configs_create', C.CreateSubpageConfigCommand),
    t('sub_page_configs_update', C.UpdateSubpageConfigCommand),
    t('sub_page_configs_delete', C.DeleteSubpageConfigCommand),
    t('sub_page_configs_reorder', C.ReorderSubpageConfigsCommand),
    t('sub_page_configs_clone', C.CloneSubpageConfigCommand),
    t('sub_page_configs_tags_list', C.GetSubpageConfigsTagsCommand),
    t('sub_page_configs_set_tags', C.SetSubpageConfigTagsCommand),

    // Config profiles & inbounds
    t('config_profiles_list', C.GetConfigProfilesCommand),
    t('config_profiles_get', C.GetConfigProfileByUuidCommand),
    t('config_profiles_get_inbounds', C.GetInboundsByProfileUuidCommand),
    t('config_profiles_get_computed_config', C.GetComputedConfigProfileByUuidCommand),
    t('config_profiles_create', C.CreateConfigProfileCommand),
    t('config_profiles_update', C.UpdateConfigProfileCommand),
    t('config_profiles_delete', C.DeleteConfigProfileCommand),
    t('config_profiles_reorder', C.ReorderConfigProfileCommand),
    t('config_profiles_tags_list', C.GetConfigProfilesTagsCommand),
    t('config_profiles_set_tags', C.SetConfigProfileTagsCommand),
    t('inbounds_list', C.GetAllInboundsCommand),

    // Internal squads
    t('squads_list', C.GetInternalSquadsCommand),
    t('squads_get', C.GetInternalSquadCommand),
    t('squads_accessible_nodes', C.GetInternalSquadAccessibleNodesCommand),
    t('squads_create', C.CreateInternalSquadCommand),
    t('squads_update', C.UpdateInternalSquadCommand),
    t('squads_delete', C.DeleteInternalSquadCommand),
    t('squads_reorder', C.ReorderInternalSquadCommand),
    t('squads_add_users', C.AddManyUsersToInternalSquadCommand),
    t('squads_remove_users', C.DeleteManyUsersFromInternalSquadCommand),
    t('squads_add_all_users', C.AddUsersToInternalSquadCommand, {
        hint: 'Adds ALL users to the squad.',
    }),
    t('squads_remove_all_users', C.DeleteUsersFromInternalSquadCommand, {
        hint: 'Removes ALL users from the squad.',
    }),
    t('squads_tags_list', C.GetInternalSquadsTagsCommand),
    t('squads_set_tags', C.SetInternalSquadTagsCommand),

    // External squads
    t('external_squads_list', C.GetExternalSquadsCommand),
    t('external_squads_get', C.GetExternalSquadByUuidCommand),
    t('external_squads_create', C.CreateExternalSquadCommand),
    t('external_squads_update', C.UpdateExternalSquadCommand),
    t('external_squads_delete', C.DeleteExternalSquadCommand),
    t('external_squads_reorder', C.ReorderExternalSquadCommand),
    t('external_squads_add_all_users', C.AddUsersToExternalSquadCommand, {
        hint: 'Adds ALL users to the external squad.',
    }),
    t('external_squads_remove_all_users', C.DeleteUsersFromExternalSquadCommand, {
        hint: 'Removes ALL users from the external squad.',
    }),
    t('external_squads_tags_list', C.GetExternalSquadsTagsCommand),
    t('external_squads_set_tags', C.SetExternalSquadTagsCommand),

    // HWID devices
    t('hwid_devices_list_all', C.GetHwidDevicesCommand, { hint: TABLE_QUERY_HINT }),
    t('hwid_devices_list', C.GetUserHwidDevicesCommand, { hint: USER_ID_HINT }),
    t('hwid_stats', C.GetHwidDevicesStatsCommand),
    t('hwid_top_users', C.GetTopUsersByHwidDevicesCommand),
    t('hwid_device_create', C.CreateUserHwidDeviceCommand),
    t('hwid_device_delete', C.DeleteUserHwidDeviceCommand, { destructive: true }),
    t('hwid_devices_delete_all', C.DeleteAllUserHwidDevicesCommand, { destructive: true }),

    // Connections (formerly IP Control)
    t('connections_by_user', C.ConnectionsByUserCommand, {
        hint: `Starts an async job; poll connections_by_user_result with the returned jobId. ${USER_ID_HINT}`,
    }),
    t('connections_by_user_result', C.ConnectionsByUserResultCommand),
    t('connections_by_node', C.ConnectionsByNodeCommand, {
        hint: 'Starts an async job; poll connections_by_node_result with the returned jobId.',
    }),
    t('connections_by_node_result', C.ConnectionsByNodeResultCommand),
    t('connections_geocheck_by_node', C.GeocheckByNodeCommand, {
        hint: 'Starts an async job; poll connections_geocheck_by_node_result with the returned jobId.',
    }),
    t('connections_geocheck_by_node_result', C.GeocheckByNodeResultCommand),
    t('connections_drop', C.DropConnectionsCommand, { destructive: true }),

    // Metadata
    t('metadata_node_get', C.GetNodeMetadataCommand),
    t('metadata_node_upsert', C.UpsertNodeMetadataCommand),
    t('metadata_user_get', C.GetUserMetadataCommand, { hint: USER_ID_HINT }),
    t('metadata_user_upsert', C.UpsertUserMetadataCommand, { hint: USER_ID_HINT }),

    // API tokens
    t('api_tokens_list', C.GetApiTokensCommand),
    t('api_tokens_scopes', C.GetApiTokenScopesCommand),
    t('api_tokens_create', C.CreateApiTokenCommand),
    t('api_tokens_delete', C.DeleteApiTokenCommand),

    // Panel settings
    t('settings_get', C.GetRemnawaveSettingsCommand),
    t('settings_update', C.UpdateRemnawaveSettingsCommand),

    // Snippets
    t('snippets_list', C.GetSnippetsCommand),
    t('snippets_create', C.CreateSnippetCommand),
    t('snippets_update', C.UpdateSnippetCommand),
    t('snippets_delete', C.DeleteSnippetCommand),
    t('snippets_sync', C.SyncSnippetCommand),

    // Infra billing
    t('billing_providers_list', C.GetInfraProvidersCommand),
    t('billing_provider_get', C.GetInfraProviderCommand),
    t('billing_provider_create', C.CreateInfraProviderCommand),
    t('billing_provider_update', C.UpdateInfraProviderCommand),
    t('billing_provider_delete', C.DeleteInfraProviderCommand),
    t('billing_nodes_list', C.GetInfraBillingNodesCommand),
    t('billing_node_create', C.CreateInfraBillingNodeCommand),
    t('billing_node_update', C.UpdateInfraBillingNodeCommand),
    t('billing_node_delete', C.DeleteInfraBillingNodeCommand),
    t('billing_history_list', C.GetInfraBillingRecordsCommand),
    t('billing_history_create', C.CreateInfraBillingRecordCommand),
    t('billing_history_delete', C.DeleteInfraBillingRecordCommand),

    // Node plugins
    t('node_plugins_list', C.GetNodePluginsCommand),
    t('node_plugins_get', C.GetNodePluginCommand),
    t('node_plugins_create', C.CreateNodePluginCommand),
    t('node_plugins_update', C.UpdateNodePluginCommand),
    t('node_plugins_delete', C.DeleteNodePluginCommand),
    t('node_plugins_reorder', C.ReorderNodePluginCommand),
    t('node_plugins_clone', C.CloneNodePluginCommand),
    t('node_plugins_sync', C.SyncNodePluginCommand),
    t('node_plugins_execute', C.PluginExecutorCommand),
    t('node_plugins_tags_list', C.GetNodePluginsTagsCommand),
    t('node_plugins_set_tags', C.SetNodePluginTagsCommand),
    t('node_plugins_torrent_reports', C.GetTorrentBlockerReportsCommand, {
        hint: TABLE_QUERY_HINT,
    }),
    t('node_plugins_torrent_stats', C.GetTorrentBlockerReportsStatsCommand),
    t('node_plugins_torrent_truncate', C.TruncateTorrentBlockerReportsCommand),
    t('shared_lists_list', C.GetSharedListsCommand),
    t('shared_lists_get', C.GetSharedListCommand),
    t('shared_lists_create', C.CreateSharedListCommand),
    t('shared_lists_update', C.UpdateSharedListCommand),
    t('shared_lists_delete', C.DeleteSharedListCommand),
    t('shared_lists_sync', C.SyncSharedListCommand),

    // Node integrations
    t('node_integrations_list', C.GetNodeIntegrationsCommand),
    t('node_integrations_get', C.GetNodeIntegrationCommand),
    t('node_integrations_create', C.CreateNodeIntegrationCommand),
    t('node_integrations_update', C.UpdateNodeIntegrationCommand),
    t('node_integrations_delete', C.DeleteNodeIntegrationCommand),
];
