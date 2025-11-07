# Dynatrace Managed MCP Server

<h4 align="center">
  <a href="https://github.com/dynatrace-oss/dynatrace-managed-mcp/releases">
    <img src="https://img.shields.io/github/release/dynatrace-oss/dynatrace-managed-mcp" />
  </a>
  <a href="https://github.com/dynatrace-oss/dynatrace-managed-mcp/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-mit-blue.svg" alt="Dynatrace Managed MCP Server is released under the MIT License" />
  </a>
  <a href="https://www.npmjs.com/package/@dynatrace-oss/dynatrace-managed-mcp">
    <img src="https://img.shields.io/npm/dm/@dynatrace-oss/dynatrace-managed-mcp?logo=npm&style=flat&color=red" alt="npm" />
  </a>
  <a href="https://github.com/dynatrace-oss/dynatrace-managed-mcp">
    <img src="https://img.shields.io/github/stars/dynatrace-oss/dynatrace-managed-mcp" alt="Dynatrace Managed MCP Server Stars on GitHub" />
  </a>
  <a href="https://github.com/dynatrace-oss/dynatrace-managed-mcp">
    <img src="https://img.shields.io/github/contributors/dynatrace-oss/dynatrace-managed-mcp?color=green" alt="Dynatrace Managed MCP Server Contributors on GitHub" />
  </a>
</h4>

The _Dynatrace Managed MCP server_ allows AI Assistants to interact with on-premise [Dynatrace Managed](https://www.dynatrace.com/) deployments,
bringing historical observability data directly into your AI assisted workflow.

This MCP server is specifically designed for Dynatrace Managed (on-premise) deployments and is intended for accessing historical data.

There is a different [Dynatrace MCP](https://github.com/dynatrace-oss/dynatrace-mcp) server for use with Dynatrace SaaS.

> Note: This product is not officially supported by Dynatrace.

If you need help, please contact us via [GitHub Issues](https://github.com/dynatrace-oss/dynatrace-managed-mcp/issues) if you have feature requests, questions, or need help.

## Architecture

![Architecture](./assets/dynatrace-managed-mcp-arch.png?raw=true)

## Use cases

- **Historical data analysis** - Access legacy observability data from on-premise Managed deployments
- **Contextual debugging** - Fix issues with full context from monitored exceptions, logs, and anomalies
- **Security insights** - Get detailed vulnerability analysis and security problem tracking
- **Intelligent query assistance** - Get context-aware query suggestions and optimization recommendations
- **Multi-phase incident investigation** - Systematic correlation analysis with automated impact assessment
- **Advanced transaction analysis** - Root cause identification through cross-API data correlation
- **Cross-data source correlation** - Connect problems → events → logs → metrics for comprehensive analysis
- **Performance optimization** - Built-in caching and request batching for efficient cluster usage
- **Security compliance monitoring** - Vulnerability assessment with evidence-based investigation

## Capabilities

- **Metrics Analysis** - Query and analyze performance metrics using V2 Metrics API
- **Log Investigation** - Search and filter logs with advanced content and time-based queries
- **Event Tracking** - Monitor system events including deployments and configuration changes
- **Entity Management** - Discover and analyze monitored entities with relationship mapping
- **Problem Analysis** - Investigate problems with impact analysis and root cause identification
- **Security Assessment** - Comprehensive vulnerability scanning and risk assessment
- **SLO Management** - Service Level Objective monitoring, evaluation tracking, and error budget analysis
- **Data Correlation** - Cross-API correlation for comprehensive incident analysis including SLO impact
- **Query Assistance** - Intelligent query suggestions and optimization recommendations
- **Performance Optimization** - Built-in caching and request batching for cluster efficiency
- **Timeline Analysis** - Chronological analysis of problems, events, logs, and SLO violations

### Performance Considerations

**Important:** This MCP server is designed for efficient usage with Dynatrace Managed clusters. The server includes built-in performance optimizations:

**Performance Features:**

- **Intelligent Caching** - Responses are cached with configurable TTL to reduce cluster load
- **Request Batching** - Multiple requests are batched and prioritized for optimal performance
- **Resource Monitoring** - Built-in performance metrics and optimization recommendations

**Best Practices:**

1. Use specific time ranges (e.g., 1-2 hours) rather than large historical queries
2. Leverage entity selectors to filter data at the source
3. Monitor performance metrics using the `get_performance_metrics` tool
4. Clear cache periodically using `clear_cache` if memory usage becomes high
5. Use query suggestions (`suggest_queries`) for optimized query patterns

**Cluster Compatibility:**

- Minimum supported version: Dynatrace Managed 1.320
- Automatic version detection and optimization
- Performance warnings for older cluster versions
