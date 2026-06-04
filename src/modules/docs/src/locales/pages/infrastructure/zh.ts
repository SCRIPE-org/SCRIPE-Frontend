export const zh = {
  infrastructure: {
    auditTrail: {
      architectureTitle: "审计追踪架构",
      description: "完整的审计日志，具有自动模块检测、关联追踪、SignalR 实时广播和45+事件类型。",
      entityIntro: "AuditLog 实体为每个可审计事件捕获全面的上下文。旧值和新值存储为 JSON 快照。",
      entityTitle: "AuditLog 实体模式",
      eventTypesTitle: "审计事件类型 (45+)",
      intro:
        "SCRIPE 的企业审计追踪捕获平台上每个重要操作——从身份验证事件和实体变更到权限修改和安全事件。",
      moduleDetectionIntro:
        "AuditService 通过分析 API 端点路径或实体类型名称自动确定哪个模块生成了每个审计事件。",
      moduleDetectionTitle: "自动模块检测",
      queryIntro:
        "审计日志查询端点支持12个参数的综合过滤。所有过滤器均为可选并可组合。结果分页（默认：20条，最大：100条）并按时间戳降序排序。",
      queryTip: "专业提示：使用 CorrelationId 跟踪单个 HTTP 请求在所有审计条目中的完整生命周期。",
      queryTitle: "审计日志查询 API",
      realtimeIntro:
        "审计事件（排除常规 HTTP 请求日志）通过 SignalR 广播给已连接的客户端。事件通过租户特定组进行范围限定。",
      realtimeTitle: "实时广播",
      title: "企业审计追踪",
    },
    backgroundJobs: {
      architectureFlowTitle: "自动发现管道",
      architectureIntro:
        "启动时，BackgroundJobsConfiguration 从 appsettings.json 读取活动的提供商，并调用 GetServices<IAutoRegisteredJob>() 来发现 DI 容器中注册的每个任务。对于每个任务，它检查每个任务的 appsettings 覆盖，解析 Enabled 和 CronExpression，然后使用提供商的 API 调度任务。任务本身不包含特定于提供商的代码。",

      // Architecture
      architectureTitle: "架构概览",
      conn1: "[ZH] drives",
      conn2: "[ZH] triggers",
      conn3: "[ZH] for each job",
      conn4: "[ZH] on cron tick",
      connBuilds: "构建查询",
      connOrders: "排序",
      connRemoves: "移除",
      connStarts: "开始",
      connTriggers: "触发",
      contractIntro:
        "SCRIPE 中的每个循环后台任务都实现一个接口：IAutoRegisteredJob。这就是整个契约 — 三个属性和一个方法。该接口故意排除了任何特定于提供商的概念（没有 Hangfire 属性，没有 Quartz 注解）。任务不知道是哪个提供商在运行它。",
      contractTitle: "IAutoRegisteredJob 契约",
      descConfig:
        "[ZH] Provider: Native | Hangfire | Quartz\nJobs: { id: { Enabled, CronExpression } }",
      descDiscovery: "[ZH] Scans DI container for every registered IAutoRegisteredJob",
      descExecute: "[ZH] Provider-agnostic - job has zero knowledge of which provider runs it",
      description:
        "自动发现、与提供商无关的 (Native, Hangfire, Quartz.NET) 循环任务 — 在 6 个模块中包含 31 个任务，无需手动配置。",
      descSchedule: "[ZH] Uses CronExpression from appsettings override or job default",
      descStartup: "[ZH] Reads provider, discovers all jobs, schedules them",
      diIntro:
        "每个任务需要在其模块的 DependencyInjection.cs 中进行精确的两行 DI 注册。缺少第二行会使任务对所有提供商完全不可见 — 它永远不会被发现或调度，并且没有错误或警告。",

      // DI Registration
      diTitle: "DI 注册 — 关键的两行模式",
      diWarning:
        "IAutoRegisteredJob 工厂委托（第 2 行）是使自动发现工作的关键。GetServices<IAutoRegisteredJob>() 仅返回作为 IAutoRegisteredJob 注册的任务。仅按其具体类型注册的任务对所有三个提供商都是不可见的。",
      diWarningTitle: "永远不要跳过第 2 行",
      flowCascadeDesc: "以正确的删除顺序处理外键约束",
      flowCascadeLabel: "FK 感知级联",
      flowCronDesc: "软删除作业的默认 Cron",
      flowCronLabel: "Cron 滴答 (凌晨 3:00)",
      flowExecuteDesc: "执行原生 SQL 进行批量删除，绕过 EF 更改跟踪",
      flowExecuteLabel: "硬删除",
      flowFilterDesc: "查找 IsDeleted = true 且 DeletedAt < DateTime.UtcNow.AddDays(-30) 的记录",
      flowFilterLabel: "过滤过期实体",
      flowInitDesc: "由 DI 容器实例化",
      flowInitLabel: "SoftDeleteCleanupJob<TContext>",
      flowScanDesc: "对实现 ISoftDeletable 的实体进行 DbContext 反射扫描",
      flowScanLabel: "发现 ISoftDeletable",
      hierarchyColClass: "类",
      hierarchyColGets: "你得到了什么",
      hierarchyColUseWhen: "何时使用",
      hierarchyIntro:
        "根据您需要的结构有三种选择。轻量级任务直接实现 IAutoRegisteredJob。需要结构化计时日志的任务继承 RecurringJobBase。清理软删除实体的任务继承 SoftDeleteCleanupJob<TContext>。",
      hierarchyRow1Gets: "只有契约 — 完全控制，没有额外内容",
      hierarchyRow1When: "任务很简单，不需要太多样板代码",
      hierarchyRow2Gets: "带有经过时间的自动启动/完成/错误日志",
      hierarchyRow2When: "你需要结构化的计时和错误日志",
      hierarchyRow3Gets: "自动实体发现、FK 有序删除、批处理",
      hierarchyRow3When: "模块需要一个软删除永久清理任务",

      // Class Hierarchy
      hierarchyTitle: "类层次结构 — 选择您的基类",
      identityNote:
        "EmailProcessingJob 和 WebhookRetryJob/WebhookLogCleanupJob 是基础基础设施任务，注册在 Identity 模块 DI 中，因为它们依赖于 Identity 服务。",
      intro:
        "SCRIPE 的后台任务系统建立在一个原则之上：一次编写，在任何提供商上运行。每个任务实现 IAutoRegisteredJob 并在启动时被自动发现。在 Native、Hangfire 或 Quartz 之间切换只需在 appsettings.json 中更改配置 — 无需修改任何代码。",
      inventoryColPurpose: "目的",
      inventoryComplianceTitle: "Compliance 模块 (7 个任务)",
      inventoryCoreTitle: "Core 模块 (5 个任务)",
      inventoryEntitlementsTitle: "Entitlements 模块 (12 个任务)",
      inventoryIdentityTitle: "Identity 模块 (2 个任务)",
      inventoryIntro:
        "跨六个模块的全部 33 个循环后台任务。每个任务都实现了 IAutoRegisteredJob。可以在 appsettings.json 中按环境覆盖默认 Cron。",
      inventoryMarketplaceTitle: "Marketplace 模块 (4 个任务)",
      inventoryPluginsTitle: "Plugins 模块 (3 个任务)",

      // Jobs Inventory
      inventoryTitle: "完整任务清单 — 33 个任务",
      jobAnalyticsReport: "每周生成分析报告",
      jobAnalyticsSnapshot: "每日收入/MRR/ARR 快照聚合",
      jobAuthSessionCleanup: "清理过期的身份验证会话和刷新令牌",
      jobCommissionAutoCharge: "重试失败的佣金自动扣款",
      jobCommissionInvoicing: "每月综合生成佣金发票",
      jobComplianceSoftDelete: "永久删除软删除的 Compliance 实体",
      jobConsentExpiry: "使过期的用户同意失效",
      jobDsrEscalation: "警告即将达到 SLA 截止日期的 DSR",
      jobDsrExecution: "每 5 分钟执行未决的数据主体请求 (DSR)",
      jobDsrExportCleanup: "删除过期的 DSR 导出文件",
      jobDunningNotification: "发送越来越紧急的付款失败通知",
      jobEditionRollout: "应用计划的版本升级和降级",
      jobEmailProcessing: "通过 EmailJobProcessor 轮询并发送延迟电子邮件",
      jobEntitlementsSoftDelete: "永久删除软删除的 Entitlements 实体",
      jobIdentitySoftDelete: "永久删除软删除的 Identity 实体",
      jobInstallCountAggregation: "将临时安装计数聚合到静态应用商品计数器中",
      jobMarketplaceSoftDelete: "在保留期过后永久删除软删除的商品、提交、个人资料和评论",
      jobOutboxCleanup: "删除 7 天前已处理的 outbox 消息",

      // Job purpose descriptions
      jobOutboxProcessor: "处理待处理的 outbox 消息并分发给 AstraFlow",
      jobPaymobRecurringBilling: "存储的 Paymob 信用卡的定期收费",
      jobPayoutBatch: "将未结收益组装成批次转账，并通过 Stripe Connect 执行付款",
      jobPluginDataCleanup: "清理插件创建的过期临时数据库存储键",
      jobPluginHealthCheck: "轮询活跃的插件沙箱环境并报告健康状态",
      jobPluginsSoftDelete: "在保留期过后永久删除软删除的插件、定义和执行日志",
      jobReportGeneration: "每 2 分钟轮询并生成未决的合规性报告",
      jobRetentionEnforcement: "执行数据保留策略",
      jobStaleSubmissionReminder: "扫描待审核时间超过 7 天的应用提交并向管理员发出提醒",
      jobSubscriptionReconciliation: "使用户试用期满，续订活跃订阅",
      jobTenantHealthScore: "重新计算所有活跃租户的健康分数",
      jobTrialNotification: "发送试用期在 7、3 或 1 天内到期的提醒",
      jobUserSubscriptionReconciliation: "Tier 2 用户级订阅对账",
      jobWebhookLogCleanup: "删除 90 天前的 webhook 交付日志",
      jobWebhookRetry: "以 50 批次处理持久化的 Webhook 重试队列",
      newJobIntro:
        "完全按照这四个步骤操作。唯一必需的文件是任务类本身和两行 DI 注册。其他一切都是自动连接的。",
      newJobStep1Desc:
        "在 {Module}.Infrastructure/BackgroundJobs/ 中创建一个新文件。使用 kebab-case JobId 约定：'{module}-{purpose}'。将 ExecuteAsync 实现为幂等操作。",
      newJobStep1Title: "第 1 步 — 创建任务类",
      newJobStep2Desc:
        "在模块的 DependencyInjection.cs 中，添加确切的两条注册。第 1 行启用构造函数注入。第 2 行启用自动发现。永远不要跳过第 2 行。",
      newJobStep2Title: "第 2 步 — 注册两行 DI",
      newJobStep3Desc:
        "要进行特定于环境的计划设置或禁用任务，请在 BackgroundJobs.Jobs 下使用 JobId 作为键添加覆盖。",
      newJobStep3Title: "第 3 步 — 添加 appsettings 覆盖 (可选)",
      newJobStep4Desc:
        "运行后端构建。零错误意味着任务已准备就绪。自动发现会处理其余的一切 — 任何地方都无需手动注册。",
      newJobStep4Title: "第 4 步 — 构建并验证",

      // Creating a New Job
      newJobTitle: "创建新的后台任务",

      // IAutoRegisteredJob Contract
      nodeConfig: "[ZH] appsettings.json\nProvider + Per-Job Overrides",
      nodeDiscovery: "[ZH] Auto-Discovery Loop\nGetServices<IAutoRegisteredJob>()",
      nodeExecute: "[ZH] job.ExecuteAsync(ct)\nAt every cron tick",
      nodeSchedule: "[ZH] Schedule Each Job\nIf Enabled -> Register with provider API",
      nodeStartup: "[ZH] BackgroundJobsConfiguration\nAddBackgroundJobsConfiguration()",
      providerColFeature: "特性",
      providerColHangfire: "Hangfire",
      providerColNative: "Native",
      providerColQuartz: "Quartz",
      providerHangfireBest: "带有 SQL Server 的生产环境",
      providerHangfireDash: "/hangfire (仅限超级管理员)",
      providerHangfireRetry: "是 (可配置重试次数)",
      providerHangfireYes: "保存到 SQL — 重启后保留",
      providerNativeBest: "本地开发，单元测试",
      providerNativeDash: "无",
      providerNativeNo: "仅限内存 — 重启后丢失",
      providerNativeRetry: "否",
      providerQuartzBest: "带有 Oracle 或 PostgreSQL 的生产环境",
      providerQuartzDash: "无 (单独提供 Quartz.UI)",
      providerQuartzOptional: "内存（可选的数据库存储）",
      providerQuartzRetry: "是 (通过 misfire 策略)",
      providerRowBestFor: "最适合",
      providerRowDashboard: "仪表板",
      providerRowPersistence: "任务持久化",
      providerRowRetry: "自动重试",
      providersIntro:
        "这三个提供商使用完全相同的 IAutoRegisteredJob 接口。唯一的区别是它们如何调度和持久化任务。在 appsettings.json 中配置提供商 — 切换无需更改代码。",

      // Providers
      providersTitle: "提供商比较",
      ruleMust1: "在 BackgroundJobs/ 文件夹中每个文件一个类",
      ruleMust2: "注册两行 DI（具体类型 + 工厂委托）",
      ruleMust3: "使用 5 字段 CRON（不要使用 Quartz 6 字段格式）",
      ruleMust4: "使 ExecuteAsync 幂等",
      ruleMust5: "每次更改后构建 — scripe build backend",
      ruleNever1: "永远不要在任务中导入 Hangfire 或 Quartz 命名空间",
      ruleNever2: "永远不要使用 [AutomaticRetry] — 全局重试在 BackgroundJobsConfiguration 中配置",
      ruleNever3: "永远不要在模块代码中调用 RecurringJob.AddOrUpdate<T>()",
      ruleNever4: "永远不要将任务放在 Services/ 或其他任何文件夹中",
      ruleNever5: "永远不要注册为 Singleton — 总是使用 AddScoped",
      rulesMustTitle: "✅ 必须执行",
      rulesNeverTitle: "❌ 永远不要",
      rulesTitle: "规则",
      softDeleteFlowTitle: "软删除执行流程",
      softDeleteIntro:
        "SoftDeleteCleanupJob<TContext> 基类是最高级的选项。它自动发现 DbContext 中所有的 ISoftDeletable 实体类型，对其进行拓扑排序，并进行批处理删除。",
      softDeleteTip:
        "CLI 命令 'scripe add-bg-service {Module}' 可一步生成作业文件并添加两个 DI 注册。这是添加 SoftDeleteCleanupJob 的推荐方法。",

      // SoftDelete
      softDeleteTitle: "SoftDeleteCleanupJob — FK 有序自动删除",

      tenantWarning:
        "后台任务在 HTTP 上下文之外运行 — 没有可用的租户上下文。处理租户特定数据的任务必须使用 IServiceScopeFactory 创建显式的作用域。",
      title: "后台任务 (Background Jobs)",
    },
    databaseMigrations: {
      architectureContent:
        "业务逻辑书写在基类，各个 SQL 提供者基于此派生出针对自身方言的上下文用于建表。",
      architectureTitle: "派生上下文体系",
      cliContent: "CLI 工具 scripe-cli 一键并行派发指令，同时生成 3 个独立数据库引擎的迁移记录。",
      cliRemoveContent: "当建表模型出错，一条命令即可并行清空 3 大关系型数据库的废弃迁移版本。",
      cliRemoveTitle: "智能回滚 (Force Removal)",
      cliTitle: "使用 CLI 同步生成多引擎脚本",
      cliUpdateContent: "命令无需人为指定 Provider，它会自己探测配置文件并更新对应的真实数据库。",
      cliUpdateTitle: "数据库 Update 智能识别",
      cliWarning: "极其重要：永远不要手动编辑由 ORM 生成的 ModelSnapshot 文件。",
      description: "完全适配于 SQL Server、Oracle 以及 PostgreSQL 的多引擎切换架构。",
      diContent: "核心基础设施通过读取 appsettings.json 来自动向服务容器中注入当前所选的数据库类。",
      diTitle: "运行期动态连接",
      intro:
        "不同数据库拥有独立的方言，SCRIPE 使用“派生 DbContext (Derived DbContext)”结构完美隔离了各自的快照 (ModelSnapshot)。",
      newProviderContent: "接入轻量级测试库 SQLite 时的 Clean Architecture 扩展范例。",
      newProviderStep1: "1. 建立密封的派生类。",
      newProviderStep2: "2. 创建设计期 Factory 接口。",
      newProviderStep3: "3. 加入注册数组中心。",
      newProviderStep4: "4. 执行 add-migration Initial 导出。 ",
      newProviderTitle: "接入全新的数据库提供商",
      title: "企业级数据库迁移 (Migrations)",
    },
    fileStorage: {
      architectureTitle: "存储层架构",
      configTitle: "注入配置",
      description: "策略模式适配器：支持本地盘、AWS S3、阿里云/Azure 对象存储的无缝切换。",
      intro: "底层接口抹平了物理存放的差异，使得云端与私有化部署仅在配置参数上有别。",
      providersTitle: "云及本地提供商",
      tenantScopingTitle: "严格的租户级存储分拣",
      title: "文件存储系统 (File Storage)",
      validationTitle: "防毒与文件验证",
    },
    gatewayDeployment: {
      description: "YARP 反向代理、模块分离技术、IIS 部署以及 Linux Kestrel 启动指南。",
      iisStep1Desc: "使用 dotnet publish 产生独立二进制运行库。",
      iisStep1Title: "1. 产出发布包",
      iisStep2Desc: "设定物理目录。",
      iisStep2Title: "2. 绑定 IIS 网站",
      iisStep3Desc: "挂载 MODULE_NAME 及数据库账号。",
      iisStep3Title: "3. 分配环境变量",
      iisStep4Desc: "务必将应用池选择为 'No Managed Code'，交由 .NET Core Module 在独立进程执行。",
      iisStep4Title: "4. 应用池设定 (App Pool)",
      iisTitle: "IIS (Windows Server) 部署指南",
      intro: "SCRIPE 面向生产环境的灵活部署之道。",
      kestrelTitle: "Kestrel 宿主服务配置",
      microservicesTitle: "微服务模式 (Microservices)",
      modesTitle: "多形态部署模式",
      moduleIntro: "环境变量直接控制编译包是否只加载指定业务逻辑以降低内存。",
      moduleTitle: "模块控制系统",
      monolithTitle: "单体模式 (Monolith)",
      portNote: "微服务运行时会在独立的端口唤醒，再由代理接管入口映射。",
      title: "网关与部署 (Gateway & Deployment)",
      yarpIntro: "路由中心：负责流量分发、SSL 卸载以及针对微服务端口的代理与负载均衡。",
      yarpTitle: "YARP API 网关",
    },
    healthChecks: {
      architectureTitle: "健康端点架构",
      checksIntro:
        "每项检查验证特定的基础设施依赖关系。检查并行运行以最小化延迟。失败的检查返回详细的错误信息，但不会泄露敏感的连接字符串。故障状态可按检查配置——数据库和启动故障返回 Unhealthy，而 Redis、SMTP 和存储返回 Degraded。",
      checksTitle: "独立健康检查",
      description: "企业级健康端点，用于 Kubernetes 存活、就绪和启动探针，包含5项独立检查。",
      dockerIntro:
        "对于 Docker Compose 部署，在服务定义中配置健康检查。使用 /health/live 进行基本存活检查，/health/ready 进行就绪检查。设置 start_period 以让数据库迁移有时间完成。",
      dockerTip:
        "对于 IIS 部署：配置 Application Request Routing (ARR) 健康探针使用 /health/ready 作为检查 URL。对于 Azure App Service：配置健康检查路径 = /health/ready。",
      dockerTitle: "Docker Compose 健康检查",
      endpointsTitle: "健康端点",
      environmentsTitle: "环境专属指南",
      intro:
        "SCRIPE 提供5个企业级健康端点，专为 Kubernetes 编排、负载均衡器集成和运维监控而设计。每个端点验证特定的基础设施依赖关系，并返回结构化的 JSON 响应。",
      k8sIntro:
        "SCRIPE 的健康端点直接映射到 Kubernetes 探针类型。启动探针在首次部署时允许最多5分钟（30次失败 × 10秒间隔）用于数据库迁移。",
      k8sTitle: "Kubernetes 探针配置",
      registrationIntro:
        "健康检查在 HealthCheckExtensions.cs 中集中注册，并带有明确的标签和故障状态。标签决定哪个端点包含每个检查。",
      registrationTitle: "健康检查注册",
      responseIntro:
        "SCRIPE 根据端点支持两种响应格式。公共探针端点返回最小化 JSON。认证端点返回详细响应，包括每项检查的持续时间、标签、负载数据和异常详情。",
      responseTitle: "响应格式",
      title: "健康检查与 K8s 探针",
    },
    loadTesting: {
      authFlowIntro:
        "auth-flow.js 测试模拟真实的用户身份验证模式：使用凭据登录、使用 JWT 令牌访问受保护端点和验证健康检查端点。自定义指标（scr_login_duration、scr_login_fail_rate）独立跟踪身份验证 SLA。",
      authFlowTitle: "身份验证流程测试脚本",
      backupIntro: "SCRIPE 支持多提供商备份策略，为每个数据库引擎提供特定的工具和频率。",
      backupTitle: "备份与灾难恢复",
      cicdIntro:
        "k6 与 GitHub Actions、GitLab CI 和 Azure Pipelines 集成。测试在容器化的后端实例上运行，并等待健康就绪后执行。当任何 SLA 阈值被突破时，管道自动失败。",
      cicdTitle: "CI/CD 集成",
      description: "k6 性能测试套件，包含 SLA 阈值、CI/CD 集成和多提供商备份策略。",
      drWarning: "重要提醒：每季度测试一次灾难恢复程序。从未恢复过的备份不是备份——而是一种希望。",
      intro: "SCRIPE 包含 k6 负载测试脚本以验证性能 SLA，配合全面的备份和灾难恢复策略。",
      overviewIntro: "两个预构建的 k6 测试套件覆盖关键用户旅程：身份验证流程和 CRUD 操作。",
      overviewTitle: "k6 测试套件",
      runningTitle: "运行负载测试",
      thresholdsTitle: "SLA 阈值",
      title: "负载测试与备份",
    },
    observability: {
      alertsIntro:
        "预配置的 Prometheus 告警规则检测关键和警告条件。关键告警在高错误率、数据库故障和极端延迟时触发。",
      alertsTitle: "告警规则",
      configTitle: "可观测性配置",
      description:
        "OpenTelemetry 分布式追踪、Prometheus 指标、Grafana Loki 集中日志和预配置的告警规则。",
      intro:
        "SCRIPE 实现了基于开放标准的完整可观测性栈：OpenTelemetry 用于分布式追踪，Prometheus 用于指标收集，Grafana Loki 用于集中日志记录，Jaeger 用于追踪可视化。",
      loggingIntro:
        "Serilog 用机器名称、环境、关联ID、租户ID和模块标签丰富每条日志条目。配置 Loki 后，日志实时推送。",
      loggingTitle: "集中日志 (Serilog + Loki)",
      monitoringStackIntro:
        "预构建的 Docker Compose 文件启动完整的监控栈，自动配置数据源、仪表板和告警规则。",
      monitoringStackTitle: "Docker 监控栈",
      productionWarning:
        "生产环境中：将 TraceSampleRatio 设置为0.1，更改 Grafana 默认密码，通过反向代理 IP 白名单限制 /metrics 端点访问。",
      prometheusIntro:
        "/metrics 端点以 Prometheus 文本格式公开 OpenTelemetry 指标。Prometheus 每15秒抓取此端点。",
      prometheusTitle: "Prometheus 指标",
      stackTitle: "可观测性栈架构",
      title: "可观测性与监控",
      tracingIntro:
        "TracingBehavior 为每个命令和查询处理程序创建 OpenTelemetry span，具有自动模块检测、请求类型识别和持续时间测量。",
      tracingTitle: "分布式追踪 (OpenTelemetry)",
    },
    resilience: {
      architectureTitle: "弹性架构",
      circuitBreakerIntro: "如果外部服务连挂 5 次，直接切断通讯并保持静默 30 秒，不再发起请求。",
      circuitBreakerTitle: "熔断器策略 (Circuit Breaker)",
      configTitle: "配置参数调整",
      description: "Polly 策略体系对内外部 HTTP 请求的保护机制。",
      intro: "在遭遇外部服务掉线或网络抖动时，防止 SCRIPE 服务器堆积过多死请求导致全面雪崩。",
      retryTitle: "指数退避重试 (Retry Policy)",
      timeoutTitle: "悲观超时控制 (Timeout Policy)",
      title: "弹性与熔断 (Resilience)",
      usageTitle: "装载于 HttpClient 工厂之上",
    },
    scripeCli: {
      autoWiringIntro:
        "生成文件很容易，但修改现有工程最容易出错。CLI 全面自动化了以下系统集成节点：",
      autoWiringTitle: "超凡的自动编织技术 (Auto-Wiring)",
      bgJobsIntro: "将独立模块快速挂载进 Hangfire 中心。",
      bgJobsTitle: "生成定时与后台服务",
      commandsIntro: "构建模块与业务的核心。 ",
      commandsReferenceIntro:
        "SCRIPE CLI 拥有 10 个不同类别的 123 个命令，涵盖开发和运维生命周期的每个方面。以下是完整的参考表。",
      commandsReferenceTitle: "完整命令参考 (v4.0)",
      commandsTitle: "核心工程构建命令",
      configIntro: "解析根目录下的 scripe.config.json 以探寻项目实际文件目录。",
      configTitle: "系统配置文件",
      dbCliCmd: "自动执行 SqlServer, Oracle 和 PostgreSQL 的交叉运算。",
      dbSyncIntro: "消除网络与建库命令的繁琐。",
      dbSyncTitle: "数据库与 API 交互体系",
      description: "内置 79 套开发模板、支持多库同步及文件自动化编织的脚手架引擎。",
      destructionIntro: "用于开发调优：通过一键回滚彻底清洗系统生成的配置代码与服务挂载。",
      destructionTitle: "毁灭操作 (Destructive Tools)",
      dslIntro:
        "通过 `--properties` (-p) 传递，跨 C# 到 TypeScript 进行双重推导并打通 SQL 及 Zod。",
      dslSyntaxInfo: "格式规范: 属性名称:类型[:约束1][:约束2]",
      dslTitle: "属性描述语法 (DSL)",
      intro:
        "为 SCRIPE 模块化单体量身定制的 Node.js 命令行。它不但生成前后端源码，还会执行手术刀般的自动化注册 (Auto-Wiring)。",
      namingIntro: "输入单数大写驼峰单词，它将在全局产生无数正确大小写、复数与宏常量名称。",
      namingTitle: "自动命名变异引擎",
      newFeatureIntro:
        "根据实体属性 DSL (领域特定语言) 产生共 26 个贯穿后端 CQRS 和前端 React 的源文件。",
      newFeatureTitle: "新建特征流: new-feature",
      newModuleIntro: "建立起符合 DDD 标准的 3 层后端项目以及统一规则的 Next.js 结构。",
      newModuleTitle: "新建模块结构: new-module",
      revertSafely: "无损消除上述挂载而不破坏系统自身。",
      securityIntro: "在生成 REST API 的瞬间自动追加拦截策略，防止暴露任何不受保护的接口。",
      securityTitle: "默认防御加固",
      syncApiCmd: "捕获远端 OpenAPI/Swagger 文件以更新强类型 Zod 验证和模型。",
      templatesIntro:
        "CLI 无需手动编写标准架构，而是通过 79 个精准的 Handlebars 模板（涵盖 54 个后端文件和 25 个前端配置）来强制执行纯粹的整洁架构 (Clean Architecture)，从而确保代码质量。",
      templatesTitle: "79 套铁律模板",
      title: "SCRIPE CLI 命令行工具",
      utilityIntro: "包含针对 .NET 与 NPM 构建与运行的统合快捷操作。",
      utilityTitle: "工程环境支持",
      wiringDocker: "docker-compose.yml (微服务服务注册)。",
      wiringFrontendApp: "src/app/ (服务端页面挂载)。",
      wiringFrontEnv: "Proxy 等前端环境修改。",
      wiringPermissions: "permissions.ts (React 侧常量映射)。",
      wiringProgram: "Program.cs (主机构建注入)。",
      wiringSettings: "appsettings.json (环境连接信息扩展)。",
      wiringSln: ".sln 工程的注入。",
    },
    scripeStudio: {
      architectureIntro:
        "Studio 由两个组件组成：引擎（Express + Socket.io + SQLite，端口 4201）处理 API 请求、命令执行和实时流。UI（Next.js，端口 4200）提供 19 个页面，涵盖开发工作流的所有方面。",
      architectureTitle: "Studio 架构",
      cliCommandsIntro:
        "Studio 完全通过 SCRIPE CLI 启动和管理。scripe studio 命令支持开发模式 (--dev)、生产模式、仅构建模式 (studio build)、自定义端口 (--port, --engine-port) 和无头模式 (--no-browser)。",
      cliCommandsTitle: "Studio CLI 命令",
      description: "可视化开发者仪表板，提供实时模块管理、代码生成器、开发服务器控制和嵌入式终端。",
      featureConfig:
        "配置编辑器 — 查看和编辑 .env、appsettings.json 和 scripe.config.json 中的环境变量。",
      featureDashboard: "仪表板 — 健康评分、活动动态、模块统计和系统概览。",
      featureDatabase: "数据库 — 运行迁移、填充数据、检查迁移状态、备份数据库和重置模块。",
      featureDevServers: "开发服务器 — 一键启动、停止和重启后端和前端服务器。",
      featureDocker: "Docker — 管理 Docker Compose 服务、查看日志、检查容器健康状态。",
      featureGenerators:
        "代码生成器 — 通过表单界面生成事件、规范、验证器、枚举、Hooks、组件和页面。",
      featureModules: "模块管理器 — 通过可视化界面和实时反馈创建、删除、检查和浏览模块。",
      featurePackages: "包管理器 — 为前端和后端添加、删除和更新 npm 和 NuGet 包。",
      featureSecurity: "安全工具 — 生成 JWT/AES 密钥、运行漏洞审计和验证环境完整性。",
      featuresTitle: "Studio 功能",
      featureTerminal: "终端 — 嵌入式终端，支持命令历史、ANSI 输出渲染和 WebSocket 流式传输。",
      intro:
        "SCRIPE Studio 是一个功能完整的可视化开发者仪表板，提供实时 Web 界面用于管理模块、运行代码生成器、控制开发服务器、执行数据库操作、管理 Docker 容器等 —— 全部在一个浏览器标签页中完成。",
      securityIntro:
        "纵深防御安全：令牌认证（每次启动生成）、命令白名单验证、集中式输入净化、速率限制（每 IP 200 req/min）、CORS 白名单（仅 localhost）和 URL 验证。",
      securityTitle: "安全模型",
      title: "SCRIPE Studio",
    },
  },
};
