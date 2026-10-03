// FILE-EXCEPTION: file length
/**
 * Docs page locale — ZH
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const zh = {
  architecture: {
    overview: {
      title: "架构概述",
      description: "整洁架构分层、后端管道、前端 SOLID 流程和模块边界规则。",
      intro:
        "SCRIPE 遵循严格的 Clean Architecture，包含 Presentation、Application、Domain 和 Infrastructure 四层。依赖规则确保内部层永远不依赖外部层，并在后端与前端一致应用。",
      layersTitle: "整洁架构分层",
      backendArchTitle: "后端架构",
      backendArchIntro:
        "后端遵循请求管道 (Request Pipeline) 架构，每个 HTTP 请求流经中间件、控制器、SCRIPE mediator 行为管道，最后到达 CQRS 处理程序。这确保了验证、审计和错误处理的一致性。",
      frontendArchTitle: "前端架构",
      frontendArchIntro:
        "前端使用 SOLID View/ViewModel 模式，其中视图 (View) 是纯 UI（无状态、无逻辑），而视图模型 (ViewModel) 包含所有业务逻辑。连接器模式将 Next.js 路由（服务端组件）与应用逻辑（客户端组件）分离。",
      moduleBoundariesTitle: "模块边界",
      moduleBoundariesIntro:
        "Modules have strict code boundaries. This supports future extraction, but extraction is not the same as proven production microservices readiness.",
      withBoundaries: "有模块边界",
      withoutBoundaries: "无模块边界",
      communicationPatternsTitle: "跨模块通信",
      crossModuleNote:
        "事件总线 (Event Bus) 模式计划在未来的版本中推出。目前，模块之间仅通过 URL 导航和共享 ID 进行通信。",
    },
    backend: {
      title: "后端架构",
      description: "Program.cs 解剖、中间件管道、DI 服务映射、模块注册模式和控制器目录。",
      intro:
        "SCRIPE 后端是一个 .NET 10 模块化单体，在 Program.cs 中仅用 288 行代码就串联了 16 个服务注册、10 个中间件组件和 18 个 REST 控制器。本页将解剖后端架构的每一层。",
      programCsTitle: "Program.cs 解剖",
      programCsIntro:
        "Program.cs 是应用程序的入口点和组装中心。它检测部署模式，以特定顺序注册服务，并构建中间件管道。该文件遵循清晰的 5 节结构。",
      middlewarePipelineTitle: "中间件管道 (Middleware Pipeline)",
      middlewarePipelineIntro:
        "中间件管道按特定顺序处理每个 HTTP 请求。每个中间件都可以短路管道（例如，限流器返回 429，身份验证返回 401）。顺序至关重要 —— 改变它可能会破坏安全性。",
      diMapTitle: "依赖注入 (DI) 服务映射",
      diMapIntro:
        "下表显示了所有主要服务接口、其实现、生命周期以及它们注册的位置。了解此映射对于调试和扩展系统至关重要。",
      modulePatternTitle: "模块注册模式",
      modulePatternIntro:
        "每个新模块都遵循相同的 DI 注册模式。AddXxxModule() 扩展方法注册该模块的 DbContext、仓储、服务和模块注册标记。",
      controllersTitle: "控制器 (Controllers)",
      controllerTip:
        "所有控制器都继承自一个基础 ApiController，该控制器提供标准化的 Result<T> 响应映射。控制器应保持轻量 —— 它们仅验证请求模型并委派给 SCRIPE mediator 处理。",
    },
    frontend: {
      title: "前端架构",
      description: "SOLID View/ViewModel 模式、模块结构以及用于 Next.js 集成的连接器模式。",
      intro:
        "SCRIPE 前端使用 Next.js 16 (App Router) 构建，遵循严格的 SOLID View/ViewModel 模式。每个页面均由一个纯 UI 视图组成，该视图将所有逻辑委派给 ViewModel Hooks。这种分离确保了可测试性、可重用性和可维护性。",
      solidPatternTitle: "SOLID View/ViewModel 模式",
      solidPatternIntro:
        "SOLID 模式确保 UI 的每个部分都具有单一职责。视图 (View) 渲染 JSX，视图模型 (ViewModel) 管理状态和逻辑，组件 (Components) 提供可重用的 UI 块。",
      viewRulesTitle: "视图 (View) 规则",
      viewDo: "视图应当",
      viewDont: "视图不应",
      viewExampleTitle: "视图示例",
      viewModelRulesTitle: "视图模型 (ViewModel) 规则",
      viewModelRulesIntro:
        "ViewModel 是包含所有业务逻辑的 React Hooks。它们组合特定部分的 ViewModel（统计、过滤器、表格），并返回供视图消费的强类型接口。",
      moduleStructureTitle: "模块文件结构",
      connectorPatternTitle: "连接器模式 (Connector Pattern)",
      connectorPatternIntro:
        "连接器模式将 Next.js App Router 页面（服务端组件）与模块视图（客户端组件）分离。src/app/ 中的页面是轻量级连接器，用于导入和渲染模块视图。它们仅处理路由、元数据和 URL 参数。",
      connectorWarning:
        "永远不要在 src/app/ 文件中放入业务逻辑、数据获取、表单或状态管理。这些是服务端组件，仅负责将路由连接到模块视图。",
    },
    cqrs: {
      title: "CQRS 模式",
      description: "通过 SCRIPE mediator 管道、行为 (Behaviors)、验证和缓存实现命令查询职责分离。",
      intro:
        "SCRIPE 使用 CQRS (命令查询职责分离) 模式将读写操作分开。命令 (Commands) 改变状态并经过验证和审计行为。查询 (Queries) 读取状态并可以利用缓存。SCRIPE mediator 充当控制器和处理程序之间的中介。",
      whatIsCqrsTitle: "什么是 CQRS？",
      whatIsCqrsIntro:
        "CQRS 将您的应用程序分为两端：命令（写入）和查询（读取）。每一端都可以独立优化 —— 命令侧重于数据完整性和验证，而查询侧重于性能和缓存。",
      commandSide: "命令端 (写入)",
      querySide: "查询端 (读取)",
      pipelineTitle: "SCRIPE mediator 管道",
      validationBehaviorTitle: "验证行为 (Validation Behavior)",
      commandExampleTitle: "命令示例",
      queryExampleTitle: "查询示例",
      cachingTip:
        "查询可以使用服务端缓存，避免每次请求都访问数据库。缓存键应包含所有查询参数以确保唯一性。当相关的命令成功执行时，缓存会自动失效。",
    },
    modules: {
      title: "模块系统",
      description: "模块隔离规则、后端/前端模板、模块注册表和跨模块通信。",
      intro:
        "SCRIPE 使用严格的模块系统，每个模块都是具有清晰边界的孤立岛屿。模块不能互相导入 —— 它们只能通过 URL、共享 ID 或核心事件总线进行通信。这确保了独立性、可测试性，并具备将模块提取到独立代码库的能力。",
      isolationRulesTitle: "模块隔离规则",
      allowedImportsTitle: "允许的导入",
      forbiddenImportsTitle: "禁止的导入",
      backendModuleTitle: "后端模块模板",
      backendModuleIntro:
        "每个后端模块都遵循 DDD (领域驱动设计)，包含三个项目：领域层、应用层和基础设施层。领域层是纯 C# 代码，没有外部依赖。",
      frontendModuleTitle: "前端模块模板",
      registryTitle: "模块注册表",
      registryIntro:
        "The current backend modules verified in code are Identity, Entitlements, Compliance, Plugins, and Marketplace, plus host controller labels such as Auth, System, Communication, Media, and Customization. CRM, HRMS, Inventory, Finance, Documents, Workflow, and Service Management are future modules, not current backend modules.",
      communicationTitle: "跨模块通信模式",
      pattern1Title: "模式 1: URL 导航",
      pattern1Content: "通过标准的 URL 链接导航到另一个模块的页面。不需要导入。",
      pattern2Title: "模式 2: 仅共享 ID",
      pattern2Content: "仅存储外部模块实体的 ID。切勿嵌套整个实体。",
      pattern3Title: "模式 3: 核心事件总线",
      pattern3Content:
        "Domain events currently dispatch in-process. RabbitMQ is a placeholder fallback, so do not use this as proof of true distributed microservices.",
      boundaryWarning:
        "模块边界是绝对的铁律。如果需要在模块之间共享代码，它必须放在 @core/ 中。任何从 @modules/{other}/ 的导入都是违规行为，将在代码审查中被拦截。",
    },
    solidPattern: {
      title: "SOLID 视图/视图模型",
      description: "页面类型场景：CRUD 列表、仪表盘、个人资料、设置、向导和报表构建器。",
      intro:
        "SOLID View/ViewModel 模式对 src/modules/ 中的所有页面都是强制性的。本指南涵盖了 7 种页面类型场景，提供其精确的目录结构、ViewModel 模式和代码示例。",
      principlesTitle: "应用的 SOLID 原则",
      scenariosTitle: "页面类型场景",
      scenariosIntro:
        "选择与您的页面类型匹配的场景。每种场景都提供了经过测试的结构，确保整个应用程序的一致性。",
      scenario1Title: "场景 1: CRUD 列表页面",
      scenario1Intro:
        "用于管理实体集合（用户、产品、订单）。编排器组合了统计、过滤器和表格的 ViewModel。",
      scenario2Title: "场景 2: 仪表盘 / 分析",
      scenario2Intro:
        "用于 KPI、图表和指标。每个图表或卡片部分都有自己的 ViewModel，负责期间选择和数据转换。",
      scenario3Title: "场景 3: 详情 / 个人资料页面",
      scenario3Intro:
        "用于查看带有标签页和分区的单个实体。编排器获取主实体并组合各标签页的 ViewModel。",
      scenario4Title: "场景 4: 设置页面",
      scenario4Intro:
        "用于多个可独立保存的表单分区。每个设置分区都有自己的 ViewModel，包含表单状态和保存变更 (Mutation)。",
      scenario5Title: "场景 5: 向导 / 多步表单",
      scenario5Intro:
        "用于复杂的、包含多个步骤的流程（如入职或结账）。向导 ViewModel 协调步骤导航、验证门控和合并提交。",
      rulesTitle: "黄金法则",
      antiPatternWarning:
        "反模式 (Anti-pattern)：将 useState、useEffect 或 useQuery 直接放在 View 组件中。所有的状态和逻辑必须位于 ViewModels 中。Views 仅作纯 UI 组合之用。",
    },
    stateManagement: {
      title: "状态管理",
      description: "Clean Architecture 分层、后端管道、前端 SOLID 流程以及模块边界规则。",
      intro:
        "SCRIPE 使用三种状态管理工具，每种用于特定类别：TanStack Query 用于服务器数据（API 结果），Zustand 用于全局 UI 状态（认证、侧边栏、主题），useState 用于组件本地状态（表单、切换开关）。",
      decisionTitle: "决策矩阵",
      tanstackTitle: "TanStack Query (服务器状态)",
      tanstackIntro:
        "对任何来自 API 的数据使用 TanStack Query。它自动处理缓存、后台重新获取、分页、乐观更新和请求去重。",
      zustandTitle: "Zustand (全局 UI 状态)",
      zustandIntro:
        "对于需要在组件间共享但不来自服务器的全局 UI 状态，请使用 Zustand。系统只有 3 个批准的全局 Store。",
      antiPatternsTitle: "反模式",
      doTitle: " 推荐做法",
      dontTitle: " 错误做法",
      localizationTitle: "本地化 (LanguageProvider)",
      localizationIntro:
        "本地化使用自定义的 LanguageProvider 并带有 localStorage 持久化。它支持 7 种语言、RTL/LTR 自动检测以及带有插值的点表示法 (dot-notation) 翻译键。",
      noLocaleFoldersWarning:
        "请勿在 src/app/ 中使用 [locale] 文件夹！本地化是通过 LanguageProvider 上下文处理的，而不是基于文件的路由。没有 next-intl，没有 next-i18next，也没有基于 URL 的语言（例如 /en/, /zh/）。",
    },
    dataFlow: {
      title: "数据流",
      description: "端到端数据流图：查询、变更、后端管道、错误处理和缓存策略。",
      intro:
        "了解数据如何流经 SCRIPE 对于调试和扩展系统至关重要。本页面追踪了从 UI 中的按钮点击一直到数据库并返回的完整数据流动。",
      queryFlowTitle: "查询流 (读取)",
      queryFlowIntro:
        "当用户查看数据（例如打开用户页面）时，流程从 View 开始，经过 ViewModel、TanStack Query、仓储 (Repository)、API 服务，最后到达后端 API。",
      mutationFlowTitle: "变更流 (写入)",
      backendPipelineTitle: "后端请求管道",
      backendPipelineIntro:
        "每个后端请求在到达处理程序之前，都会经过 10 个中间件组件和 3 个 SCRIPE mediator 管道行为。这确保了一致的日志记录、身份验证、授权、验证和审计。",
      errorFlowTitle: "错误处理",
      errorFlowIntro:
        "错误在多个层面进行处理。每个错误源都有特定的处理程序、响应代码和前端处理策略。",
      cachingFlowTitle: "缓存策略",
      cachingFlowIntro:
        "后端使用两级缓存策略：L1（进程内 IMemoryCache）和 L2（分布式 Redis）。前端使用带有可配置 staleTime 的 TanStack Query 内置缓存。",
      cacheTip:
        "对于不常改变的数据（如角色、权限），请将 staleTime 设置为 5 分钟。对于频繁改变的数据（如审计日志、通知），请使用 0。成功执行写操作 (Mutation) 后始终使相关查询失效。",
    },
    domainModel: {
      title: "领域模型 (Domain Model)",
      description:
        "实体继承层次结构、AuditableEntity、ITenantAwareEntity、软删除生命周期、仓储抽象和全局查询过滤器。",
      intro:
        "SCRIPE 的领域模型遵循严格的继承层次结构：所有业务实体都继承自 AuditableEntity，它提供了审计字段和软删除支持。租户作用域的实体额外实现 ITenantAwareEntity，以实现自动的行级数据隔离。",
      entityHierarchyTitle: "实体继承层次",
      entityHierarchyIntro:
        "所有领域实体遵循三个层级的继承链：IEntity (标记接口) → Entity<TId> (身份+相等性+领域事件) → AuditableEntity (审计字段+软删除)。属于特定租户的实体还实现了 ITenantAwareEntity 接口。",
      ientityTitle: "IEntity 接口",
      entityBaseTitle: "Entity<TId> 基类",
      entityBaseIntro:
        "Entity<TId> 基类提供身份相等性判断（两个实体若拥有相同 Id 则相等）、哈希码生成和领域事件支持。每个实体都能引发领域事件。",
      entityDomainEventNote:
        "通过 RaiseDomainEvent() 引发的领域事件会在 SaveChanges 期间由 OutboxInterceptor 收集，并保存在同一事务中。",
      auditableEntityTitle: "AuditableEntity (可审计实体)",
      auditableEntityIntro:
        "AuditableEntity 向基础 Entity 添加了 7 个审计和软删除字段。这些字段在 SaveChanges 时由 AuditableEntityInterceptor 自动填充 —— 您无需手动设置。",
      tenantAwareTitle: "ITenantAwareEntity",
      tenantAwareIntro:
        "实现了 ITenantAwareEntity 的实体，通过 EF Core 的全局查询过滤器自动限定在当前租户内。TenantId 由 TenantContextMiddleware 设置。",
      tenantIsolationWarning:
        "永远不要在没有明确授权的情况下绕过租户隔离。使用 IgnoreQueryFilters() 会移除所有过滤器，包括租户范围限制。",
      softDeleteTitle: "软删除生命周期",
      softDeleteIntro:
        "所有实体都使用 IsDeleted 标志实现软删除。当调用 DELETE 端点时，拦截器会将硬删除转换为软删除，在普通查询中被隐藏。",
      repositoryTitle: "仓储抽象 (Repository)",
      repositoryIntro:
        "SCRIPE 在领域层定义了三种仓储接口：用于查询的 IReadRepository<T>、用于变更的 IWriteRepository<T>，以及结合两者并带有 SaveChangesAsync 的 IRepository<T>。",
      concreteEntitiesTitle: "具体实体注册表",
      queryFiltersTitle: "全局查询过滤器",
      queryFiltersIntro:
        "EF Core 全局查询过滤器应用于所有继承自 AuditableEntity（软删除过滤器）和实现 ITenantAwareEntity（租户隔离过滤器）的实体。",
      ignoreFiltersTip:
        "仅在回收站操作（查看已软删除项）和超级管理员跨租户查询时使用 IgnoreQueryFilters()。必须始终搭配显式的租户过滤器以防止数据泄露。",
      bestPracticesTitle: "最佳实践",
      doTitle: "✅ 推荐",
      dontTitle: "❌ 避免",
    },
    domainEvents: {
      title: "领域事件 (Domain Events)",
      description:
        "IDomainEvent 接口、发件箱模式 (Outbox Pattern)、OutboxInterceptor、OutboxProcessor 以及可靠的事件投递。",
      intro:
        "领域事件代表业务领域中发生的重大事件。SCRIPE 使用发件箱模式 (Outbox Pattern) 来保证事件的可靠投递 —— 事件与实体变更在同一个数据库事务中持久化，并由后台处理器异步发布。",
      interfaceTitle: "IDomainEvent 接口",
      interfaceIntro:
        "所有领域事件都实现 IDomainEvent 接口，该接口继承自 SCRIPE mediator 的 INotification。这使得进程内能够实现发布/订阅 (Pub/Sub) 模型。",
      publishingTitle: "发布与处理流程",
      publishingIntro:
        "领域事件遵循 6 步生命周期：触发事件 -> 拦截器捕获 -> 作为 OutboxMessage 持久化 -> 后台轮询 -> 反序列化 -> 通过 SCRIPE mediator 发布。",
      publisherTitle: "IDomainEventPublisher",
      outboxTitle: "发件箱模式 (Outbox Pattern)",
      outboxIntro:
        "发件箱模式解决了双写 (dual-write) 问题：如何原子性地更新数据库并同时发布事件。通过将事件与业务变更放在同一事务中，确保事件永不丢失。",
      outboxWarning:
        "发件箱模式提供“至少一次” (at-least-once) 投递，而不是“恰好一次” (exactly-once)。因此，事件处理程序必须是幂等的。",
      outboxMessageTitle: "OutboxMessage 实体",
      outboxInterceptorTitle: "OutboxInterceptor (发件箱拦截器)",
      outboxInterceptorIntro:
        "它是一个 EF Core SaveChanges 拦截器，在事务提交前运行。它收集被追踪实体的所有领域事件，并将其序列化为 OutboxMessage 记录加入上下文中。",
      outboxProcessorTitle: "OutboxProcessor (发件箱处理器)",
      outboxProcessorIntro:
        "这是一个后台服务 (BackgroundService)，每 5 秒轮询一次 OutboxMessage 表。它批量处理事件并通过 SCRIPE mediator 发布。失败的事件将进行重试。",
      outboxCleanupTitle: "发件箱清理任务",
      outboxCleanupIntro:
        "一个 Hangfire 周期性任务，每天凌晨 2:00 UTC 运行，删除 7 天前已处理的发件箱消息，防止表无限增长。",
      architectureSummaryTitle: "发件箱架构总结",
      customEventsTitle: "创建自定义领域事件",
      customEventsIntro: "遵循以下 3 个步骤将新的领域事件添加到 SCRIPE。",
      step1Title: "1. 定义事件",
      step1Content: "在模块的 Domain/Events/ 目录中创建实现 IDomainEvent 的 Record。",
      step2Title: "2. 从命令处理程序触发",
      step2Content: "在命令处理程序中调用 entity.RaiseDomainEvent()，然后调用 SaveChangesAsync。",
      step3Title: "3. 创建事件处理程序",
      step3Content:
        "实现 INotificationHandler<DomainEventNotification> 来响应事件。多个处理程序可订阅同一事件进行各种副作用处理。",
      reliabilityTitle: "可靠性保证",
      withOutboxTitle: "✅ 使用发件箱模式",
      withoutOutboxTitle: "❌ 不使用发件箱模式",
    },
    cqrsPipeline: {
      title: "CQRS 管道",
      description:
        "SCRIPE 中介器管道行为：LoggingBehavior、ValidationBehavior、FeatureCheckBehavior、WebhookDispatchBehavior、CachingBehavior、Result 模式以及完整的命令/查询映射。",
      intro:
        "SCRIPE 中的每个命令 and 查询都会经过可配置的 SCRIPE 中介器管道，内置 5 个行为：LoggingBehavior、ValidationBehavior、FeatureCheckBehavior、WebhookDispatchBehavior 和 CachingBehavior。顺序可通过 appsettings 或环境变量管理，并在启动时校验。",
      overviewTitle: "管道概述",
      overviewIntro:
        "默认顺序为 Logging -> Validation -> FeatureCheck -> WebhookDispatch -> Caching -> Handler。验证和功能检查会先于缓存读取执行；成功变更后，缓存失效会先于 webhook 分发完成。",
      separationTitle: "命令与查询分离",
      separationIntro:
        "CQRS 将应用程序清晰地分为两条路径：命令 (写入) 改变状态并经过全面验证，查询 (读取) 针对性能进行优化 (无跟踪 AsNoTracking 及缓存)。",
      commandsTitle: "命令 (写入)",
      queriesTitle: "查询 (读取)",
      resultPatternTitle: "Result 模式",
      resultPatternIntro:
        "所有处理程序都返回 Result<T>，而不是针对预期的故障抛出异常。这消除了控制器中的 try-catch 块，并支持模式匹配。",
      validationTitle: "验证行为 (ValidationBehavior)",
      validationIntro:
        "ValidationBehavior 紧跟日志记录之后执行。它收集所有 IValidator<TRequest> 验证器，为无效请求返回结构化 Result 失败，并阻止无效请求进入处理器或缓存。",
      validatorExampleTitle: "验证器示例",
      loggingTitle: "日志行为 (LoggingBehavior)",
      loggingIntro:
        "记录每个 SCRIPE mediator 请求的用户 ID、租户 ID、请求类型和执行时间。超过 500ms 的请求将作为警告记录，以进行性能监控。",
      cachingTitle: "缓存行为 (CachingBehavior)",
      cachingIntro:
        "CachingBehavior 拦截实现了 ICacheable 接口的查询，执行租户范围的缓存查找。为了在高负载下防止并发缓存雪崩，它依赖于特定于键的 SemaphoreSlim 锁来在未命中时序列化数据库读取。它还通过 IInvalidatesCache 处理变更失效，清除精确的键或基于前缀的命名空间。此外，它结合了键驱逐以限制增长，并将功能配置绑定到全局驱逐令牌源，以便进行即时、线程安全的缓存失效。",
      cachingStampedeTitle: "缓存并发与雪崩预防 (Cache Stampede)",
      cachingStampedeIntro:
        "为了防止高负载下的性能下降，缓存系统实现了缓存雪崩（Cache Stampede）缓解。特定于键的信号量确保，如果多个并发请求查询缺失或过期的键，只有第一个线程执行数据库/API查询，而后续请求则等待信号量并检索新缓存的值。此外，通过跟踪缓存键并在超过 10,000 个被跟踪的键时随机驱逐其中的 50% 来防止无限增长。功能缓存条目还绑定到全局驱逐令牌，以便立即清除缓存。",
      outboxTitle: "领域事件与 Outbox 系统管道",
      outboxIntro:
        "为了保证事务一致性并防止双写问题，SCRIPE 使用发件箱（Outbox）模式。领域事件在聚合根（Aggregate Roots）内部引发，被 EF Core SaveChangesInterceptor 拦截，序列化为 JSON，并作为 OutboxMessage 实体持久化在同一个数据库事务中。后台作业（OutboxProcessorJob）每分钟运行一次，轮询未处理的消息并在本地（通过 AstraFlow 中介者）或外部（通过 EventBus）发布它们。最后，每日 OutboxCleanupJob 在凌晨 5:00 运行，以清除超过 7 天的已处理消息。",
      flowStampedeTitle: "缓存雪崩锁定顺序",
      flowStampedeRequest: "客户端请求\nGetOrCreateAsync(key)",
      flowStampedeMiss: "缓存未命中？\n检查 InMemory/Redis",
      flowStampedeLock: "获取锁\nSemaphoreSlim(1,1)",
      flowStampedeCheck: "双重检查缓存\n在锁内验证",
      flowStampedeFound: "缓存命中\n由其他线程填充的值",
      flowStampedeFactory: "执行工厂\n运行数据库/API查询",
      flowStampedeWrite: "写入缓存\n添加 PostEvictionCallback",
      flowStampedeRelease: "释放锁\n向所有线程返回缓存的值",
      flowOutboxTitle: "发件箱消息处理管道",
      flowOutboxRaise: "引发领域事件\nAggregateRoot.AddDomainEvent()",
      flowOutboxIntercept: "拦截 SaveChanges\nOutboxInterceptor 扫描 ChangeTracker",
      flowOutboxSerialize: "序列化事件\n转换为 JSON 并包裹在 OutboxMessage 中",
      flowOutboxCommit: "原子数据库事务\n保存实体更新 + OutboxMessage",
      flowOutboxPoll: "OutboxProcessorJob\n每分钟轮询未处理",
      flowOutboxDispatch: "发布事件\n本地中介者 + 外部事件总线",
      flowOutboxComplete: "标记为已处理\n设置 ProcessedOnUtc = UtcNow",
      flowOutboxCleanup: "OutboxCleanupJob\n清除已处理记录 > 7 天",
      connCacheQuery: "请求键",
      connCacheMiss: "缓存未命中",
      connAcquireLock: "获取锁",
      connDoubleCheck: "缓存命中",
      connCacheHit: "返回值",
      connDbQuery: "执行查询",
      connCacheWrite: "更新缓存",
      connLockRelease: "释放锁",
      connRaise: "触发拦截器",
      connIntercept: "扫描事件",
      connSerialize: "序列化",
      connCommit: "原子提交",
      connPoll: "轮询 50 个批次",
      connDispatch: "分发事件",
      connComplete: "保存状态",
      connCleanup: "每日清除",
      commandMapTitle: "命令与查询目录",
      commandMapIntro: "下表列出了系统中注册的每个命令、查询和验证器，按业务领域组织。",
      registrationTitle: "管道注册",
      registrationIntro: "管道行为在 AddCoreApplication() 中按其应执行的顺序进行注册。",
      behaviorOrderTip:
        "默认安全校验会拒绝让 Caching 早于 Validation 或 FeatureCheck 执行的管道顺序。只有在完全掌控风险时才应关闭 Mediator__EnforceSecurityPipelineOrder。",
      featureCheckTitle: "FeatureCheckBehavior (功能检查行为)",
      featureCheckIntro:
        "FeatureCheckBehavior 拦截实现了 IRequireFeature 的命令。它通过调用 IFeatureChecker.IsEnabledAsync 检查租户的版本 (Edition) 是否允许所请求的功能。如果功能被禁用，它将返回 Forbidden 错误而不执行处理程序。系统级操作（无 TenantId）会绕过此检查。",
      featureCheckMarkerTitle: "IRequireFeature 标记接口",
      featureCheckMarkerIntro:
        "命令通过实现 IRequireFeature 接口及其 RequiredFeatureName 属性来选择性地启用功能门控。当 Entitlements 模块未部署时，NoOpFeatureChecker 对所有检查返回 true —— 使此行为成为静默通过。",
    },
    dependencyInjection: {
      title: "依赖注入 (DI)",
      description:
        "Program.cs 注册流程、模块 DI 模式、服务发现、核心与身份服务映射、生命周期规则和 YARP 网关。",
      intro:
        "SCRIPE 使用 .NET 内置的依赖注入容器，并采用结构化的注册模式。Program.cs 协调所有注册：核心基础设施 -> 根据 MODULE_NAME 的模块 -> SCRIPE mediator 应用层。",
      architectureTitle: "DI 注册架构",
      architectureIntro:
        "Program.cs 遵循严格的 4 阶段注册顺序：(1) 核心基础设施 (缓存, 存储等) (2) CORS 和 限流 (3) 模块 (4) 应用层。",
      moduleRegTitle: "模块注册模式",
      moduleRegIntro:
        "每个模块暴露一个 AddXxxModule() 扩展方法来注册其所有服务。MODULE_NAME 环境变量控制加载哪些模块：空=单体，'Gateway'=网关模式。",
      monolithNote:
        "在单体模式下，所有模块都加载到单个进程中。在微服务模式下，每个模块作为一个独立的进程运行并监听自己的端口。",
      controllerProviderTitle: "模块控制器功能提供程序",
      controllerProviderIntro:
        "根据部署模式过滤启动时加载的控制器，仅加载符合 [BelongsToModule] 标记的控制器。",
      serviceDiscoveryTitle: "服务发现 (Service Discovery)",
      serviceDiscoveryIntro:
        "在微服务模式下，SCRIPE 使用基于配置的服务发现 (来自 appsettings.json) 将服务名称解析为 URL。",
      coreServicesTitle: "核心基础设施服务",
      coreServicesIntro:
        "由 AddCoreInfrastructure() 注册的服务，可供所有模块使用，提供跨切面功能（缓存、审计、Webhook等）。",
      identityModuleTitle: "身份模块 (Identity) 服务",
      identityModuleIntro:
        "身份模块注册了 24 个仓储接口和 10 个服务接口。仓储全部注册为 Scoped (作用域)，匹配 DbContext 的生命周期。",
      lifetimeTitle: "服务生命周期规则 (Lifetimes)",
      singletonTitle: "单例 (Singleton) 生命周期",
      scopedTitle: "作用域 (Scoped) 生命周期",
      gatewayTitle: "YARP 网关配置",
      gatewayIntro:
        "当 MODULE_NAME=Gateway 时，应用程序充当 YARP 反向代理。它根据 URL 路径前缀匹配将请求路由到后端微服务。",
      bestPracticesTitle: "DI 最佳实践",
      captiveTip:
        "当 Singleton 服务注入了 Scoped 服务时，就会发生“依赖捕获”(Captive Dependency)，导致内存泄漏和数据陈旧。需要时请使用 IServiceScopeFactory。",
    },
    moduleCollab: {
      title: "跨模块协作深度剖析",
      description: "SCRIPE 模块化单体架构中跨模块通信的真实代码分析。",
      intro:
        "Identity 和 Entitlements 模块不能相互导入（循环依赖）。它们通过 Core 层协作——共享抽象、领域事件和 Mediator 管道。",
      coreBridgeTitle: "Core 层桥接",
      coreBridgeIntro:
        "所有跨模块协作都通过 Core.Application.Abstractions 进行。每个模块实现 Core 中定义的接口，并通过依赖注入消费其他模块的接口。",
      catalogTitle: "完整接口目录",
      catalogIntro:
        "这些接口是模块间的完整契约。所有接口定义在 Core.Application.Abstractions，由各模块基础设施实现，并在 Core.Infrastructure 中默认注册 NoOp。",
      noopTitle: "NoOp 安全模式",
      noopIntro:
        "每个跨模块接口在 Core.Infrastructure 中都有一个 NoOp 实现。当模块缺失时，NoOp 确保系统以优雅降级模式运行。",
      noopWarning:
        "NoOp 是安全网，而非永久默认值。在生产环境中加载所有模块时，不应有任何 NoOp 处于活动状态。",
      noopRegistrationTitle: "NoOp 注册 — TryAddScoped 与 AddScoped",
      noopRegistrationIntro:
        "NoOp 替换机制依赖一个关键规则：Core.Infrastructure 使用 TryAddScoped 注册 NoOp，真实模块使用 AddScoped 注册，从而无条件覆盖。",
      startupDiagnosticsTitle: "启动诊断 — 检测 NoOp 泄漏",
      startupDiagnosticsIntro:
        "PostBuildInitialization.cs 在 DI 容器构建后运行，检查关键接口的解析类型是否仍为 NoOp。",
      featureCheckTitle: "FeatureCheckBehavior — 深度分析",
      featureCheckIntro:
        "FeatureCheckBehavior 是 AstraFlow 管道行为，拦截所有实现 IRequireFeature 的命令。",
      requireFeatureInterfaceTitle: "IRequireFeature — 可选标记接口",
      requireFeatureInterfaceIntro:
        "IRequireFeature 是零开销标记接口。实现它的命令通过 FeatureCheckBehavior 启用版本功能门控。",
      subscriptionEventTitle: "SubscriptionChangedEvent",
      subscriptionEventIntro:
        "SubscriptionChangedEvent 是系统中最关键的领域事件，每当租户订阅发生变化时由 Entitlements 发布。",
      eventTriggersTitle: "发布 SubscriptionChangedEvent 的所有命令",
      eventTriggersIntro:
        "SubscriptionChangedEvent 由任何改变租户订阅状态的 Entitlements 命令或服务发布。",
      permSyncTitle: "权限同步生命周期",
      permSyncIntro:
        "当 Identity 处理 SubscriptionChangedEvent 时，会对受影响的租户执行完整的权限同步。",
      permSyncStep1Title: "步骤 1：解析功能映射",
      permSyncStep1Content:
        "Entitlements 处理程序解析完整的有效功能映射：版本功能与租户覆盖和 Bundle 扩展合并。",
      permSyncStep2Title: "步骤 2：发布领域事件",
      permSyncStep2Content:
        "SubscriptionChangedEvent 作为领域事件发布，被 OutboxInterceptor 捕获并持久化到 OutboxMessages 表。",
      permSyncStep3Title: "步骤 3：Identity 事件处理程序",
      permSyncStep3Content:
        "Identity 的 SubscriptionChangedEventHandler 接收事件，委托给 ITenantPermissionManager 同步权限。",
      permSyncStep4Title: "步骤 4：权限差异和应用",
      permSyncStep4Content:
        "TenantPermissionManager 按模块读取权限 ID，与租户当前权限对比，按需添加或删除。",
      permSyncStep5Title: "步骤 5：缓存失效",
      permSyncStep5Content:
        "同步后，该租户所有管理员的权限缓存失效。下次请求时从数据库重新加载权限。",
      loginEnrichTitle: "登录响应增强",
      loginEnrichIntro:
        "Identity 的 LoginCommandHandler 在不直接导入 Entitlements 的情况下，使用订阅状态丰富 JWT 响应。",
      loginEnrichNote:
        "如果 Entitlements 未加载，ISubscriptionStatusProvider 返回 null。JWT 令牌仍会签发，但不含订阅数据。",
      deployTopologyTitle: "部署拓扑影响",
      deployTopologyIntro: "跨模块协作模式在单体模式和微服务模式下工作方式不同。",
      monolithMode: "单体模式",
      microserviceMode: "微服务模式",
      moduleNameEnvTitle: "MODULE_NAME 环境变量参考",
      moduleNameEnvIntro: "MODULE_NAME 环境变量在容器启动时设置，决定哪些模块加载到进程中。",
      microserviceCaution:
        "永远不要在没有为领域事件实现消息总线的情况下，将 Identity 和 Entitlements 部署到独立进程。",
      coDependencyTitle: "模块协同依赖映射",
      coDependencyIntro: "此表记录系统中每个跨模块依赖关系。",
      signupSagaTitle: "自助注册 Saga",
      signupSagaIntro: "自助注册是跨模块协作最复杂的示例。",
      signupMonolithOnly:
        "自助注册仅在单体模式下支持。在微服务模式下，PostBuildInitialization.cs 中的 G15 守卫会在启动时阻止。",
      signupStep1Title: "阶段 1：租户预置（Identity）",
      signupStep1Content:
        "RegisterTenantSelfServiceCommand 在单个原子事务中创建租户、管理员、角色并发布 SignupPhase1CompletedEvent。",
      signupStep2Title: "阶段 2：订阅绑定（Entitlements）",
      signupStep2Content:
        "SignupPhase1CompletedEventHandler 创建订阅。免费版本立即激活，付费版本创建 Stripe 结账会话。",
      signupStep3Title: "阶段 3：支付确认（Stripe）",
      signupStep3Content: "Stripe Webhook 处理支付确认并激活订阅，发布 SubscriptionChangedEvent。",
      signupStep4Title: "阶段 4：补偿（如结账放弃）",
      signupStep4Content:
        "如果 Stripe 结账被放弃，CompensatePhase1Async 删除租户和管理员，防止产生孤立账户。",
      signupEventChainTitle: "注册事件链",
      signupEventChainIntro: "注册 Saga 通过三个进程内领域事件跨越模块边界。",
      bundleExpansionTitle: "Bundle 扩展 — 细粒度权限授予",
      bundleExpansionIntro: "Bundle 扩展允许版本在模块级启用之外，授予或拒绝特定权限代码。",
      bundleExpansionNote: "Bundle 扩展在主模块权限同步之后处理。",
      adminPermCacheTitle: "IAdminPermissionCache — 授权缓存",
      adminPermCacheIntro:
        "IAdminPermissionCache 是 AuthorizationBehavior 使用的服务器端 Redis 缓存，无需每次请求访问数据库即可检查权限。",
      currentUserTitle: "ICurrentUser — 通用横切接口",
      currentUserIntro:
        "ICurrentUser 是所有模块直接使用的唯一接口，由 Identity 的 JWT 中间件在每次认证请求时填充。",
      currentUserNote:
        "ICurrentUser 与其他跨模块接口不同，不需要 NoOp 回退，始终由 Core.Infrastructure 的 JWT 中间件实现。",
      featureResolutionTitle: "功能值解析链",
      featureResolutionIntro:
        "调用 IFeatureChecker.IsEnabledAsync() 时，Entitlements 通过优先级链解析值。",
      devChecklistTitle: "开发者检查清单",
      devChecklistIntro: "每次添加新的跨模块依赖时，遵循以下步骤。",
      checkStep1Title: "步骤 1：在 Core.Application 中定义接口",
      checkStep1Content:
        "在 Core.Application.Abstractions 中定义契约，只有接口定义，没有实现逻辑。",
      checkStep2Title: "步骤 2：注册 NoOp 回退",
      checkStep2Content: "在 Core.Infrastructure 中创建 NoOp 实现，并通过 TryAddScoped 注册。",
      checkStep3Title: "步骤 3：在所有者模块中实现",
      checkStep3Content: "在所有者模块中创建真实实现，并通过 AddScoped（而非 TryAddScoped）注册。",
      checkStep4Title: "步骤 4：添加启动诊断",
      checkStep4Content: "在 PostBuildInitialization.cs 中添加检查，以检测 NoOp 是否仍然活跃。",
      addScopedTip:
        "在真实模块中始终使用 AddScoped（不加 Try）以确保覆盖 Core.Infrastructure 的 NoOp。",
      archRulesTitle: "架构规则摘要",
      archRulesIntro: "这些约束性规则适用于 SCRIPE 中所有跨模块通信。",
      doTitle: "应该做",
      dontTitle: "绝不能做",
      securityBoundaryTitle: "安全边界执行",
      securityBoundaryIntro: "模块隔离规则不仅仅是架构偏好，它们是安全边界。",
      archCheckCaution: "在每次涉及跨模块代码的 PR 之前运行 scripe arch-check。",
    },
    crossModule: {
      title: "跨模块协同架构深度剖析",
      description: "解析 Identity 与 Entitlements 模块如何在杜绝直接依赖的前提下无缝协同：基于 Core.Application 抽象层、IRequireFeature 接口与 AstraFlow 流水线行为。",
      intro: "Identity 与 Entitlements 存在高度业务关联，但直接相互引用将导致致命的循环依赖。SCRIPE 采用中立的 Core.Application 契约层作为解耦桥梁。",
      bridgeTitle: "三层架构解耦桥梁",
      bridgeContent: "Core.Application.Abstractions 定义了 32+ 项标准接口契约。AstraFlow 流水线行为及各模块处理器仅依赖这些中立抽象。",
      gridCoreTitle: "Core.Application 核心契约",
      gridCoreDesc: "包含 IFeatureChecker、ITenantPermissionManager、ICurrentUser 等 32+ 项强类型接口标准。",
      gridEventsTitle: "跨模块领域事件",
      gridEventsDesc: "实体发布领域事件后，由订阅模块通过 INotificationHandler 异步响应，杜绝硬编码耦合。",
      gridPipelineTitle: "AstraFlow 管道拦截",
      gridPipelineDesc: "FeatureCheckBehavior 与 AuthorizationBehavior 全自动拦截请求并验证配额权限，处理器零冗余代码。",
      coreAbstractionsTitle: "中立契约依赖注入",
      coreAbstractionsContent: "Core.Infrastructure 通过 TryAddScoped 预置空实现（NoOp），各业务模块加载时使用 AddScoped 覆盖为真实实现。",
      requireFeatureTitle: "IRequireFeature：命令级特性准入",
      requireFeatureContent: "业务命令通过实现 IRequireFeature 声明租户功能前置条件，流水线在第 4 阶段自动核验配额与版本状态。",
      pipelineTitle: "AstraFlow 流水线执行次序",
      pipelineContent: "严格按序执行 7 大管道行为：输入验证 -> 身份鉴权 -> 特性核验 -> 缓存控制 -> 最终业务处理器。",
      eventFlowTitle: "发件箱可靠事件流",
      eventFlowContent: "领域事件经由 EF Core OutboxInterceptor 在同一事务中安全落库，由 OutboxProcessor 后台可靠广播。",
      realWorldTitle: "工程实战：Identity ↔ Entitlements",
      realWorldContent: "各模块严格隔离私有数据存储，所有跨模块数据交互均经由中立接口与领域事件完成。",
      keyInsightTip: "核心架构洞察：Identity 与 Entitlements 彼此零引用，双向解耦保证了独立构建、独立测试与微服务化演进能力。",
    },
  },
};
