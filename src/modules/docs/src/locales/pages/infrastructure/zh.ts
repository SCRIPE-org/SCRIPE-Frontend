/**
 * Docs page locale — ZH
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const zh = {
  infrastructure: {
    backgroundJobs: {
      title: "后台任务 (Background Jobs)",
      description: "基于 Hangfire 的延时处理：垃圾清理、消息队列与后台监控面板。",
      intro: "利用挂起任务保障 HTTP 接口在处理发信或繁重运算时的超高吞吐率。",
      architectureTitle: "Hangfire 架构体系",
      recurringTitle: "定时调度任务 (Cron Jobs)",
      softDeleteTitle: "软删除物理擦除任务",
      softDeleteIntro: "定期查询数据库，按外键依赖安全地将已超过宽限期的软删除数据彻底抹除。",
      dashboardTitle: "Hangfire 监控大屏",
      dashboardIntro: "仅对平台超级管理员暴露的内部诊断仪表盘，可随时停止或重试报错任务。",
      configTitle: "系统配置",
      tenantWarning:
        "后台 Worker 进程中不存在 HTTP 请求流，所以任何涉及数据的操作必须手动向其传入租户标识以获得访问权限。",
    },
    fileStorage: {
      title: "文件存储系统 (File Storage)",
      description: "策略模式适配器：支持本地盘、AWS S3、阿里云/Azure 对象存储的无缝切换。",
      intro: "底层接口抹平了物理存放的差异，使得云端与私有化部署仅在配置参数上有别。",
      architectureTitle: "存储层架构",
      providersTitle: "云及本地提供商",
      validationTitle: "防毒与文件验证",
      tenantScopingTitle: "严格的租户级存储分拣",
      configTitle: "注入配置",
    },
    resilience: {
      title: "弹性与熔断 (Resilience)",
      description: "Polly 策略体系对内外部 HTTP 请求的保护机制。",
      intro: "在遭遇外部服务掉线或网络抖动时，防止 NEXORA 服务器堆积过多死请求导致全面雪崩。",
      architectureTitle: "弹性架构",
      retryTitle: "指数退避重试 (Retry Policy)",
      circuitBreakerTitle: "熔断器策略 (Circuit Breaker)",
      circuitBreakerIntro: "如果外部服务连挂 5 次，直接切断通讯并保持静默 30 秒，不再发起请求。",
      timeoutTitle: "悲观超时控制 (Timeout Policy)",
      usageTitle: "装载于 HttpClient 工厂之上",
      configTitle: "配置参数调整",
    },
    gatewayDeployment: {
      title: "网关与部署 (Gateway & Deployment)",
      description: "YARP 反向代理、模块分离技术、IIS 部署以及 Linux Kestrel 启动指南。",
      intro: "NEXORA 面向生产环境的灵活部署之道。",
      yarpTitle: "YARP API 网关",
      yarpIntro: "路由中心：负责流量分发、SSL 卸载以及针对微服务端口的代理与负载均衡。",
      moduleTitle: "模块控制系统",
      moduleIntro: "环境变量直接控制编译包是否只加载指定业务逻辑以降低内存。",
      modesTitle: "多形态部署模式",
      monolithTitle: "单体模式 (Monolith)",
      microservicesTitle: "微服务模式 (Microservices)",
      portNote: "微服务运行时会在独立的端口唤醒，再由代理接管入口映射。",
      iisTitle: "IIS (Windows Server) 部署指南",
      iisStep1Title: "1. 产出发布包",
      iisStep1Desc: "使用 dotnet publish 产生独立二进制运行库。",
      iisStep2Title: "2. 绑定 IIS 网站",
      iisStep2Desc: "设定物理目录。",
      iisStep3Title: "3. 分配环境变量",
      iisStep3Desc: "挂载 MODULE_NAME 及数据库账号。",
      iisStep4Title: "4. 应用池设定 (App Pool)",
      iisStep4Desc: "务必将应用池选择为 'No Managed Code'，交由 .NET Core Module 在独立进程执行。",
      kestrelTitle: "Kestrel 宿主服务配置",
    },
    databaseMigrations: {
      title: "企业级数据库迁移 (Migrations)",
      description: "完全适配于 SQL Server、Oracle 以及 PostgreSQL 的多引擎切换架构。",
      intro:
        "不同数据库拥有独立的方言，NEXORA 使用“派生 DbContext (Derived DbContext)”结构完美隔离了各自的快照 (ModelSnapshot)。",
      architectureTitle: "派生上下文体系",
      architectureContent:
        "业务逻辑书写在基类，各个 SQL 提供者基于此派生出针对自身方言的上下文用于建表。",
      diTitle: "运行期动态连接",
      diContent: "核心基础设施通过读取 appsettings.json 来自动向服务容器中注入当前所选的数据库类。",
      cliTitle: "使用 CLI 同步生成多引擎脚本",
      cliContent: "CLI 工具 nexora-cli 一键并行派发指令，同时生成 3 个独立数据库引擎的迁移记录。",
      cliWarning: "极其重要：永远不要手动编辑由 ORM 生成的 ModelSnapshot 文件。",
      cliUpdateTitle: "数据库 Update 智能识别",
      cliUpdateContent: "命令无需人为指定 Provider，它会自己探测配置文件并更新对应的真实数据库。",
      cliRemoveTitle: "智能回滚 (Force Removal)",
      cliRemoveContent: "当建表模型出错，一条命令即可并行清空 3 大关系型数据库的废弃迁移版本。",
      newProviderTitle: "接入全新的数据库提供商",
      newProviderContent: "接入轻量级测试库 SQLite 时的 Clean Architecture 扩展范例。",
      newProviderStep1: "1. 建立密封的派生类。",
      newProviderStep2: "2. 创建设计期 Factory 接口。",
      newProviderStep3: "3. 加入注册数组中心。",
      newProviderStep4: "4. 执行 add-migration Initial 导出。 ",
    },
    nexoraCli: {
      title: "NEXORA CLI 命令行工具",
      description: "内置 66 套开发模板、支持多库同步及文件自动化编织的脚手架引擎。",
      intro:
        "为 NEXORA 模块化单体量身定制的 Node.js 命令行。它不但生成前后端源码，还会执行手术刀般的自动化注册 (Auto-Wiring)。",
      commandsTitle: "核心工程构建命令",
      commandsIntro: "构建模块与业务的核心。 ",
      newModuleTitle: "新建模块结构: new-module",
      newModuleIntro: "建立起符合 DDD 标准的 3 层后端项目以及统一规则的 Next.js 结构。",
      newFeatureTitle: "新建特征流: new-feature",
      newFeatureIntro:
        "根据实体属性 DSL (领域特定语言) 产生共 26 个贯穿后端 CQRS 和前端 React 的源文件。",
      destructionTitle: "毁灭操作 (Destructive Tools)",
      destructionIntro: "用于开发调优：通过一键回滚彻底清洗系统生成的配置代码与服务挂载。",
      bgJobsTitle: "生成定时与后台服务",
      bgJobsIntro: "将独立模块快速挂载进 Hangfire 中心。",
      dslTitle: "属性描述语法 (DSL)",
      dslIntro:
        "通过 `--properties` (-p) 传递，跨 C# 到 TypeScript 进行双重推导并打通 SQL 及 Zod。",
      dslSyntaxInfo: "格式规范: 属性名称:类型[:约束1][:约束2]",
      templatesTitle: "66 套铁律模板",
      templatesIntro: "剥离手工操作的冗余，采用 Handlebars 模板锁死整洁架构。",
      securityTitle: "默认防御加固",
      securityIntro: "在生成 REST API 的瞬间自动追加拦截策略，防止暴露任何不受保护的接口。",
      autoWiringTitle: "超凡的自动编织技术 (Auto-Wiring)",
      autoWiringIntro:
        "生成文件很容易，但修改现有工程最容易出错。CLI 全面自动化了以下系统集成节点：",
      wiringSln: ".sln 工程的注入。",
      wiringProgram: "Program.cs (主机构建注入)。",
      wiringSettings: "appsettings.json (环境连接信息扩展)。",
      wiringDocker: "docker-compose.yml (微服务服务注册)。",
      wiringPermissions: "permissions.ts (React 侧常量映射)。",
      wiringFrontendApp: "src/app/ (服务端页面挂载)。",
      wiringFrontEnv: "Proxy 等前端环境修改。",
      revertSafely: "无损消除上述挂载而不破坏系统自身。",
      dbSyncTitle: "数据库与 API 交互体系",
      dbSyncIntro: "消除网络与建库命令的繁琐。",
      dbCliCmd: "自动执行 SqlServer, Oracle 和 PostgreSQL 的交叉运算。",
      syncApiCmd: "捕获远端 OpenAPI/Swagger 文件以更新强类型 Zod 验证和模型。",
      configTitle: "系统配置文件",
      configIntro: "解析根目录下的 nexora.config.json 以探寻项目实际文件目录。",
      namingTitle: "自动命名变异引擎",
      namingIntro: "输入单数大写驼峰单词，它将在全局产生无数正确大小写、复数与宏常量名称。",
      utilityTitle: "工程环境支持",
      utilityIntro: "包含针对 .NET 与 NPM 构建与运行的统合快捷操作。",
    },
    nexoraStudio: {
      title: "NEXORA Studio",
      description: "可视化开发者仪表板，提供实时模块管理、代码生成器、开发服务器控制和嵌入式终端。",
      intro:
        "NEXORA Studio 是一个功能完整的可视化开发者仪表板，提供实时 Web 界面用于管理模块、运行代码生成器、控制开发服务器、执行数据库操作、管理 Docker 容器等 —— 全部在一个浏览器标签页中完成。",
      architectureTitle: "Studio 架构",
      architectureIntro:
        "Studio 由两个组件组成：引擎（Express + Socket.io + SQLite，端口 4201）处理 API 请求、命令执行和实时流。UI（Next.js，端口 4200）提供 19 个页面，涵盖开发工作流的所有方面。",
      securityTitle: "安全模型",
      securityIntro:
        "纵深防御安全：令牌认证（每次启动生成）、命令白名单验证、集中式输入净化、速率限制（每 IP 200 req/min）、CORS 白名单（仅 localhost）和 URL 验证。",
      featuresTitle: "Studio 功能",
      featureDashboard: "仪表板 — 健康评分、活动动态、模块统计和系统概览。",
      featureModules: "模块管理器 — 通过可视化界面和实时反馈创建、删除、检查和浏览模块。",
      featureGenerators:
        "代码生成器 — 通过表单界面生成事件、规范、验证器、枚举、Hooks、组件和页面。",
      featureDevServers: "开发服务器 — 一键启动、停止和重启后端和前端服务器。",
      featureDatabase: "数据库 — 运行迁移、填充数据、检查迁移状态、备份数据库和重置模块。",
      featureDocker: "Docker — 管理 Docker Compose 服务、查看日志、检查容器健康状态。",
      featureTerminal: "终端 — 嵌入式终端，支持命令历史、ANSI 输出渲染和 WebSocket 流式传输。",
      featureConfig:
        "配置编辑器 — 查看和编辑 .env、appsettings.json 和 nexora.config.json 中的环境变量。",
      featurePackages: "包管理器 — 为前端和后端添加、删除和更新 npm 和 NuGet 包。",
      featureSecurity: "安全工具 — 生成 JWT/AES 密钥、运行漏洞审计和验证环境完整性。",
      cliCommandsTitle: "Studio CLI 命令",
      cliCommandsIntro:
        "Studio 完全通过 NEXORA CLI 启动和管理。nexora studio 命令支持开发模式 (--dev)、生产模式、仅构建模式 (studio build)、自定义端口 (--port, --engine-port) 和无头模式 (--no-browser)。",
    },
    healthChecks: {
      title: "健康检查与 K8s 探针",
      description: "企业级健康端点，用于 Kubernetes 存活、就绪和启动探针，包含5项独立检查。",
      intro:
        "NEXORA 提供5个企业级健康端点，专为 Kubernetes 编排、负载均衡器集成和运维监控而设计。每个端点验证特定的基础设施依赖关系，并返回结构化的 JSON 响应。",
      architectureTitle: "健康端点架构",
      endpointsTitle: "健康端点",
      checksTitle: "独立健康检查",
      checksIntro:
        "每项检查验证特定的基础设施依赖关系。检查并行运行以最小化延迟。失败的检查返回详细的错误信息，但不会泄露敏感的连接字符串。故障状态可按检查配置——数据库和启动故障返回 Unhealthy，而 Redis、SMTP 和存储返回 Degraded。",
      registrationTitle: "健康检查注册",
      registrationIntro:
        "健康检查在 HealthCheckExtensions.cs 中集中注册，并带有明确的标签和故障状态。标签决定哪个端点包含每个检查。",
      k8sTitle: "Kubernetes 探针配置",
      k8sIntro:
        "NEXORA 的健康端点直接映射到 Kubernetes 探针类型。启动探针在首次部署时允许最多5分钟（30次失败 × 10秒间隔）用于数据库迁移。",
      dockerTitle: "Docker Compose 健康检查",
      dockerIntro:
        "对于 Docker Compose 部署，在服务定义中配置健康检查。使用 /health/live 进行基本存活检查，/health/ready 进行就绪检查。设置 start_period 以让数据库迁移有时间完成。",
      responseTitle: "响应格式",
      responseIntro:
        "NEXORA 根据端点支持两种响应格式。公共探针端点返回最小化 JSON。认证端点返回详细响应，包括每项检查的持续时间、标签、负载数据和异常详情。",
      environmentsTitle: "环境专属指南",
      dockerTip:
        "对于 IIS 部署：配置 Application Request Routing (ARR) 健康探针使用 /health/ready 作为检查 URL。对于 Azure App Service：配置健康检查路径 = /health/ready。",
    },
    observability: {
      title: "可观测性与监控",
      description:
        "OpenTelemetry 分布式追踪、Prometheus 指标、Grafana Loki 集中日志和预配置的告警规则。",
      intro:
        "NEXORA 实现了基于开放标准的完整可观测性栈：OpenTelemetry 用于分布式追踪，Prometheus 用于指标收集，Grafana Loki 用于集中日志记录，Jaeger 用于追踪可视化。",
      stackTitle: "可观测性栈架构",
      tracingTitle: "分布式追踪 (OpenTelemetry)",
      tracingIntro:
        "TracingBehavior 为每个命令和查询处理程序创建 OpenTelemetry span，具有自动模块检测、请求类型识别和持续时间测量。",
      prometheusTitle: "Prometheus 指标",
      prometheusIntro:
        "/metrics 端点以 Prometheus 文本格式公开 OpenTelemetry 指标。Prometheus 每15秒抓取此端点。",
      loggingTitle: "集中日志 (Serilog + Loki)",
      loggingIntro:
        "Serilog 用机器名称、环境、关联ID、租户ID和模块标签丰富每条日志条目。配置 Loki 后，日志实时推送。",
      alertsTitle: "告警规则",
      alertsIntro:
        "预配置的 Prometheus 告警规则检测关键和警告条件。关键告警在高错误率、数据库故障和极端延迟时触发。",
      monitoringStackTitle: "Docker 监控栈",
      monitoringStackIntro:
        "预构建的 Docker Compose 文件启动完整的监控栈，自动配置数据源、仪表板和告警规则。",
      configTitle: "可观测性配置",
      productionWarning:
        "生产环境中：将 TraceSampleRatio 设置为0.1，更改 Grafana 默认密码，通过反向代理 IP 白名单限制 /metrics 端点访问。",
    },
    auditTrail: {
      title: "企业审计追踪",
      description: "完整的审计日志，具有自动模块检测、关联追踪、SignalR 实时广播和45+事件类型。",
      intro:
        "NEXORA 的企业审计追踪捕获平台上每个重要操作——从身份验证事件和实体变更到权限修改和安全事件。",
      architectureTitle: "审计追踪架构",
      entityTitle: "AuditLog 实体模式",
      entityIntro: "AuditLog 实体为每个可审计事件捕获全面的上下文。旧值和新值存储为 JSON 快照。",
      moduleDetectionTitle: "自动模块检测",
      moduleDetectionIntro:
        "AuditService 通过分析 API 端点路径或实体类型名称自动确定哪个模块生成了每个审计事件。",
      eventTypesTitle: "审计事件类型 (45+)",
      realtimeTitle: "实时广播",
      realtimeIntro:
        "审计事件（排除常规 HTTP 请求日志）通过 SignalR 广播给已连接的客户端。事件通过租户特定组进行范围限定。",
      queryTitle: "审计日志查询 API",
      queryIntro:
        "审计日志查询端点支持12个参数的综合过滤。所有过滤器均为可选并可组合。结果分页（默认：20条，最大：100条）并按时间戳降序排序。",
      queryTip: "专业提示：使用 CorrelationId 跟踪单个 HTTP 请求在所有审计条目中的完整生命周期。",
    },
    loadTesting: {
      title: "负载测试与备份",
      description: "k6 性能测试套件，包含 SLA 阈值、CI/CD 集成和多提供商备份策略。",
      intro: "NEXORA 包含 k6 负载测试脚本以验证性能 SLA，配合全面的备份和灾难恢复策略。",
      overviewTitle: "k6 测试套件",
      overviewIntro: "两个预构建的 k6 测试套件覆盖关键用户旅程：身份验证流程和 CRUD 操作。",
      thresholdsTitle: "SLA 阈值",
      authFlowTitle: "身份验证流程测试脚本",
      authFlowIntro:
        "auth-flow.js 测试模拟真实的用户身份验证模式：使用凭据登录、使用 JWT 令牌访问受保护端点和验证健康检查端点。自定义指标（nexora_login_duration、nexora_login_fail_rate）独立跟踪身份验证 SLA。",
      runningTitle: "运行负载测试",
      cicdTitle: "CI/CD 集成",
      cicdIntro:
        "k6 与 GitHub Actions、GitLab CI 和 Azure Pipelines 集成。测试在容器化的后端实例上运行，并等待健康就绪后执行。当任何 SLA 阈值被突破时，管道自动失败。",
      backupTitle: "备份与灾难恢复",
      backupIntro: "NEXORA 支持多提供商备份策略，为每个数据库引擎提供特定的工具和频率。",
      drWarning: "重要提醒：每季度测试一次灾难恢复程序。从未恢复过的备份不是备份——而是一种希望。",
    },
  },
};
