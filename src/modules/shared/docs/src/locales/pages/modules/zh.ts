// FILE-EXCEPTION: file length
/**
 * Docs page locale — ZH
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const zh = {
  modules: {
    entitlementsOverview: {
      title: "权益总览 (Entitlements Overview)",
      description:
        "基于版本的功能门控，包含功能、版本、订阅以及基于租户的自定义覆盖。",
      intro:
        "权益模块是 SCRIPE 的计划与功能管理引擎。它定义了每个租户 (tenant) 能获得哪些能力，计划（版本）如何打包这些能力，以及订阅如何将租户与计划关联起来。",
      whatIsTitle: "什么是权益 (Entitlements)？",
      whatIsIntro:
        "权益模块负责根据租户订阅的版本（计划）控制其可访问的功能。它提供了一个三级解析链：功能默认值 → 版本值 → 租户自定义覆盖，从而确保为平台运营商和经销商租户提供最大的灵活性。",
      architectureTitle: "架构",
      architectureIntro:
        "权益系统由四个相互关联的领域 (Domains) 组成，它们协同工作以提供完整的功能门控 (feature-gating) 解决方案。",
      domainsTitle: "四大领域",
      domainsIntro: "每个领域负责处理权益生命周期中的特定方面：",
      resolutionTitle: "功能值解析链",
      resolutionIntro:
        "当系统需要确定某个租户的功能值时，它会遵循严格的优先级链。提供值的最高优先级来源将胜出。",
      pipelineTitle: "管道集成 (Pipeline Integration)",
      pipelineIntro:
        "SCRIPE 通过 FeatureCheckBehavior 将权益直接集成到 SCRIPE mediator CQRS 管道中。实现 IRequireFeature 的命令和查询会自动受到门控保护 —— 如果解析出的租户功能值为禁用状态，请求将在到达处理程序之前被拒绝。",
      pipelineTip:
        "要将命令隐藏在功能门控之后，只需实现 IRequireFeature 并将 RequiredFeatureName 设置为该功能的稳定系统键（例如 'Chat.Enabled'）。无需编写额外代码。",
      backendTitle: "后端结构",
      backendIntro:
        "权益后端遵循 SCRIPE 标准的整洁架构 (Clean Architecture) 模块布局，包含领域层 (Domain)、应用层 (Application) 和基础设施层 (Infrastructure)。",
      frontendTitle: "前端结构",
      frontendIntro:
        "前端与后端相呼应，包含四个子模块（版本、功能、订阅、覆盖），每个模块都遵循 SOLID 视图/视图模型 (View/ViewModel) 模式。",
      controllersTitle: "API 控制器",
      controllersIntro:
        "权益模块跨 4 个控制器暴露了 31 个 API 端点 (endpoints)，所有端点均经过 JWT 身份验证，并受基于权限的授权保护。",
      noOpTitle: "NoOp 后备机制 (Fallback)",
      noOpIntro:
        "当未加载权益模块时（例如在不包含权益的微服务中），SCRIPE 会注册一个 NoOpFeatureCache。这允许 IRequireFeature 命令无错误地通过 —— 所有功能默认被视为已启用。",
      noOpNote:
        "NoOp 后备机制确保模块可以使用 IRequireFeature 而无需硬依赖权益模块。在生产环境的单体模式下，真实的 FeatureCache 始终可用。",
      contextAwareTitle: "上下文感知范围筛选",
      contextAwareIntro:
        "所有权益页面（功能、版本、权限）都是上下文感知的。前端会检测用户是否为系统管理员（tenantId 为 null）、租户管理员或处于下钻模式，并相应地调用不同的后端接口。系统管理员可以看到完整的目录并进行 CRUD 操作；租户管理员仅能以只读模式查看其有效数据。",
      resolutionTip:
        "解析链采用延迟评估 (lazy evaluation) —— 值在首次解析后会被缓存，并在订阅、版本或覆盖发生变化时失效。",
      cqrsMapTitle: "CQRS 命令与查询映射",
      cqrsMapIntro:
        "权益模块注册了跨越四个领域的 31 个 SCRIPE mediator 处理程序。每个命令都有一个对应的 FluentValidation 验证器用于输入验证。",
      diTitle: "依赖注入 (DI) 注册",
      diIntro:
        "所有权益服务均通过 DependencyInjection.cs 中的 AddEntitlementsModule 扩展方法进行注册。该模块遵循 SCRIPE 的标准注册模式。",
      comparisonTitle: "启用与禁用权益的对比",
      comparisonIntro:
        "下表展示了启用权益模块与在没有该模块的情况下运行时的功能差异：",
      gettingStartedTitle: "快速入门",
      gettingStartedIntro:
        "按照以下 5 个步骤为您的平台设置权益系统。每个步骤都建立在前一个步骤的基础之上：",
      quotaGatingTitle: "配额限制与插槽保留",
      quotaGatingIntro:
        "数值型功能表示在创建租户资源时强制执行的配额。SCRIPE 使用并发安全的原子保留模式来管理这些限制。",
      quotaGatingNote:
        "TryReserveSlotAsync 递增已保留的计数器。处理程序在成功时确认保留，失败时释放保留。",
    },
    editions: {
      title: "版本 (Editions)",
      description:
        "具有功能包、溢出策略、版本控制和发布策略的命名订阅计划。",
      intro:
        "版本是命名的计划（如基础版、专业版、企业版），用于将功能值捆绑在一起。每个租户都会订阅一个版本，以决定其功能访问权限。版本支持通过受控的发布策略进行版本控制，以便安全地部署更改。",
      entityTitle: "版本实体",
      entityIntro:
        "版本是一个包含功能值的命名计划。系统版本由平台管理员创建；零售版由经销商租户为其子租户创建。",
      overflowTitle: "溢出策略 (Overflow Policy)",
      overflowIntro:
        "当租户降级到具有较低限制的版本时，其现有资源可能会超出新限制。溢出策略决定了此时会发生什么：",
      featuresTitle: "版本功能",
      featuresIntro:
        "每个版本包含一组 EditionFeature 记录，用于将功能映射到该计划内的值。未在版本中显式设置的功能将回退到 Feature.DefaultValue。",
      versionsTitle: "版本控制 (Edition Versions)",
      versionsIntro:
        "版本控制为功能更改提供了发布系统。管理员无需直接修改功能，而是可以创建一个新版本（快照），选择发布策略并进行发布。",
      rolloutTitle: "发布策略 (Rollout Strategies)",
      rolloutIntro:
        "发布版本时，管理员可以选择如何将更改部署给已订阅的租户：",
      workflowTitle: "立即应用 vs 另存为版本",
      workflowIntro:
        "SCRIPE 提供了两种更新版本功能的方法，各自适用于不同的场景：",
      workflowTip:
        "使用“立即应用”进行紧急修复和较小更改。使用“另存为版本”进行需要阶段性发布和审计跟踪的重大计划更新。",
      endpointsTitle: "API 端点 (Endpoints)",
      endpointsIntro:
        "版本控制器暴露了 11 个端点，用于管理版本、其功能及版本生命周期：",
      drillDownTitle: "下钻行为",
      drillDownIntro:
        "当系统管理员下钻到租户时，版本列表会自动限制为该租户可见的版本。后端使用 X-Tenant-Context 头进行筛选：系统版本 + 所选租户创建的零售版本。前端在下钻模式下隐藏 CRUD 操作。",
      scopingTitle: "系统版本 vs 零售版本",
      scopingIntro:
        "SCRIPE 支持两种类型的版本：平台管理员创建对所有租户可见的系统版本，以及经销商租户仅为其子租户创建的零售版本。",
      scopingNote:
        "租户管理员只能看到系统版本及其自己的零售版本。这确保了经销商租户之间的版本隔离。",
      featuresTip:
        "未在版本中显式设置的功能将回退到 Feature.DefaultValue。您只需配置与全局默认值不同的功能。",
      endpointsList: "列出所有版本（支持分页和过滤）",
      endpointsGet: "通过 ID 获取版本详情",
      endpointsCreate: "创建一个新版本",
      endpointsUpdate: "更新版本元数据",
      endpointsDelete: "软删除一个版本",
      endpointsGetFeatures: "列出为此版本配置的功能",
      endpointsSetFeatures: "为此版本设置/更新功能",
      endpointsDirectApply: "立即应用功能更改（无版本控制）",
      endpointsGetVersions: "列出此版本的所有历史版本",
      endpointsCreateVersion: "创建一个带有功能快照的新草稿版本",
      endpointsPublishVersion: "使用所选的发布策略发布草稿版本",
      seededTitle: "预置系统版本",
      seededIntro: "平台在启动时通过 EditionSeeder 自动预置两个标准系统版本，确立默认的功能限制。",
    },
    subscriptions: {
      title: "订阅 (Subscriptions)",
      description:
        "具有完整生命周期管理、多币种定价、促销活动、试用、降级、过期行为和高级分析导出的租户-版本绑定。",
      intro:
        "订阅将租户与版本（计划）连接起来。每个租户都有一个决定其版本的基础订阅，也可以选择附加订阅以获得额外功能。订阅系统负责处理从分配到续订、降级、挂起和取消的完整生命周期——内置多币种定价和促销折扣追踪支持。",
      entityTitle: "订阅实体",
      entityIntro:
        "TenantSubscription（租户订阅）通过生命周期跟踪将租户绑定到版本。它支持多种订阅类型和状态，以实现全面的生命周期管理。",
      typesTitle: "订阅类型",
      typesIntro: "每个订阅都有一个类型，它决定了计费周期和行为：",
      lifecycleTitle: "状态生命周期",
      lifecycleIntro: "订阅在其生命周期中会经历一系列状态：",
      downgradeTitle: "降级跟踪",
      downgradeIntro:
        "当租户被降级时（无论是手动降级还是因过期降级），系统会跟踪原始订阅详细信息，以用于审计和潜在的恢复。DowngradedFromEditionId、DowngradedFromType、DowngradedFromEndDate 和 DowngradedAt 字段保留了完整的降级历史记录。",
      downgradeWarning:
        "降级时，目标版本的溢出策略 (OverflowPolicy) 决定了对超出新限制的资源的处理方式。在进行更改之前，请始终使用'降级影响'端点预览效果。",
      expiryTitle: "过期行为",
      expiryIntro: "当订阅过期时，ExpiryBehavior 设置决定了接下来会发生什么：",
      pricingTitle: "多币种定价",
      pricingIntro:
        "每个订阅都携带完整的定价元数据：货币（ISO 代码）、基础金额、调整金额、总金额、兑美元汇率和美元总金额。这使得在 9+ 种支持的货币（USD、EUR、GBP、SAR、AED、EGP、TRY、INR 等）中进行精确的收入跟踪成为可能。",
      exchangeRateTitle: "USD 标准化",
      exchangeRateIntro:
        "所有金额通过 ExchangeRateToUsd 标准化为 USD，以实现一致的 MRR/ARR 报告。TotalAmountUsd 字段在订阅时计算并存储以确保历史准确性——汇率波动不会追溯性地更改过去的记录。",
      promotionsTitle: "促销折扣",
      promotionsIntro:
        "订阅通过 AppliedPromoCode 字段支持促销代码。当应用有效的促销活动时，PromotionDiscount 百分比会被记录，AdjustmentAmount 反映应用于 BaseAmount 的折扣。促销活动按订阅进行跟踪，用于审计和分析。",
      exportTitle: "高级导出与报告",
      exportIntro:
        "订阅导出系统以 CSV、Excel (XLSX) 和 PDF 格式生成全面的报告。每份报告都包含带有筛选元数据的封面页、颜色编码的数据表和统计摘要。",
      exportFiltersTitle: "导出筛选器",
      exportFiltersIntro: "报告支持高级筛选以实现有针对性的分析：",
      exportFilterDate:
        "日期范围 — 按订阅创建日期筛选（过去 7/30/90 天、去年或自定义范围）",
      exportFilterExpiring: "即将到期 — 查找 5/7/14/30/60/90 天内到期的订阅",
      exportFilterStatus: "状态 — 活跃、已挂起、已取消、已过期",
      exportFilterEdition: "版本 — 按特定计划/版本筛选",
      exportFilterCurrency: "货币 — 以选定货币显示金额",
      exportDaysLeftTitle: "距到期天数",
      exportDaysLeftIntro:
        "报告包含一个计算的'剩余天数'列，具有条件颜色编码：红色（≤7 天）、黄色（≤30 天）、绿色（>30 天）。这使得能够一目了然地识别需要续订关注的订阅。",
      exportFormatsTitle: "导出格式详情",
      exportFormatCsv: "CSV — 轻量级，可导入任何电子表格或 BI 工具",
      exportFormatExcel:
        "XLSX — 专业的 Excel 工作簿，具有样式化标题、筛选元数据表、条件格式和自动调整列宽 (ClosedXML)",
      exportFormatPdf:
        "PDF — 可打印的文档，具有品牌化封面页、统计摘要和分页数据表 (QuestPDF)",
      renewalTitle: "续订 — 新行模式 (B2)",
      renewalIntro:
        "续订会创建新的 TenantSubscription 行，而不是覆盖现有记录（Stripe 模式）。旧订阅标记为已过期（IsActive=false），同时创建新行，包含新的 Id、StartDate=UtcNow、重新计算的定价和转移的促销详情。这为每个计费周期保留了完整的收入审计跟踪。",
      renewalAuditTitle: "收入审计跟踪",
      renewalAuditIntro:
        "每个计费周期在数据库中生成自己的不可变行，包含续订时锁定的定价。这实现了精确的财务报告：MRR 趋势、按周期的流失分析和每个周期的退款跟踪。",
      promoExpiryTitle: "促销到期跟踪 (A1)",
      promoExpiryIntro:
        "当应用 DurationDays > 0 的促销时，系统计算 PromotionExpiresAt 时间戳。每次续订时，处理程序检查 UtcNow > PromotionExpiresAt — 如果促销已过期，折扣将被移除且不会转移到新的订阅行。",
      concurrencyTitle: "乐观并发 (E1)",
      concurrencyIntro:
        "每个 TenantSubscription 都有标记为 [ConcurrencyCheck] 的 ConcurrencyStamp (Guid)。该戳在每次写操作时刷新。这防止了竞态条件 — 例如并发取消 + 对账任务 — 通过在冲突时抛出 DbUpdateConcurrencyException。",
      validationTitle: "输入验证 (G1)",
      validationIntro:
        "所有 8 个订阅命令都有专用的 FluentValidation 验证器。验证器使用 ILocalizer 提供本地化错误消息（EN + AR）。业务规则包括：不能以试用方式续订、正数退款金额、字符串长度限制。",
      crossModuleTitle: "跨模块集成 (H1)",
      crossModuleIntro:
        "订阅生命周期事件发布由身份模块消费的领域事件。当订阅被暂停时，所有租户管理员以 DeactivationReason='SubscriptionSuspended' 被停用。恢复时，只有因暂停而停用的管理员被重新激活。",
      crossModuleReasons:
        "三个停用原因：'Manual'（永不自动重新激活）、'SubscriptionSuspended'（恢复时重新激活）、'SubscriptionExpired'（到期时停用）。",
      impactTitle: "降级影响分析",
      impactIntro:
        "在更改租户的版本之前，请使用'降级影响'端点预览哪些资源会发生溢出。响应会列出将超出新版本限制的所有功能，以及当前使用量与新限制的对比。",
      endpointsTitle: "API 端点 (Endpoints)",
      endpointsIntro: "订阅控制器提供了涵盖完整订阅生命周期的 13 个端点：",
      operationsTitle: "订阅操作",
      operationsIntro:
        "订阅模块支持一套全面的生命周期操作。每个操作都会使订阅转换到新状态，并带有完整的审计跟踪。",
      assignTitle: "分配订阅",
      assignIntro:
        "创建新的订阅以将租户链接到版本。如果租户已有活动订阅，先前的订阅将被自动取消。支持可选的货币、促销代码和过期行为参数。",
      upgradeTitle: "升级与降级 (Upgrade & Downgrade)",
      upgradeIntro:
        "租户可以在不同版本之间移动。升级会立即应用，新版本的功能立即生效。降级会首先检查 OverflowPolicy，以处理超出新限制的资源。",
      trialTitle: "试用转换 (Trial Conversion)",
      trialIntro:
        "试用订阅具有 TrialEndDate（试用结束日期）。当试用版升级为付费计划时，IsTrialConverted 将设置为 true，并且订阅将转换为新类型。如果试用在未转换的情况下过期，ExpiryBehavior 将决定接下来的操作。",
      ep: {
        list: "列出所有订阅（支持分页，可按状态/类型/租户过滤）",
        get: "通过 ID 获取订阅详情",
        assign: "创建新订阅（将租户分配给版本，含货币/促销）",
        upgrade: "升级到更高的版本",
        downgrade: "降级到较低的版本（会检查 OverflowPolicy）",
        impact: "在执行前预览降级影响",
        suspend: "挂起订阅（阻止租户访问）",
        resume: "恢复已挂起的订阅",
        cancel: "永久取消订阅",
        renew: "续订即将过期的订阅",
        tenantActive: "获取特定租户的活动订阅",
        export: "将订阅导出为 CSV、Excel 或 PDF，支持高级筛选",
      },
    },
    features: {
      title: "功能 (Features)",
      description: "具有布尔、数字和字符串值类型的可控平台能力。",
      intro:
        "功能是权益系统的原子构建块。每个功能代表一种可控的能力——布尔开关、数字配额或字符串配置。功能拥有一个永不改变的稳定系统键 (Name)，确保在代码中引用的安全性。",
      entityTitle: "功能实体",
      entityIntro:
        "功能 (Feature) 定义了一种可控的平台能力。Name 字段是用于代码的稳定系统键；DisplayNameEn/DisplayNameAr 是面向用户的标签。",
      valueTypesTitle: "值类型",
      valueTypesIntro:
        "功能值以字符串形式存储，但会根据其 ValueType 进行解析。系统在创建和更新时会针对预期类型验证值。",
      valueTypesTip:
        "对于数字 (Numeric) 功能，使用 -1 表示“无限制”。FeatureCheckBehavior 将 -1 视为特殊值，绝不会拦截具有无限配额的请求。",
      systemVsCustomTitle: "系统功能 vs 自定义功能",
      systemVsCustomIntro:
        "SCRIPE 区分了系统功能（启动时自动植入，只读）和自定义功能（由管理员通过 API 创建）：",
      cacheTitle: "功能缓存 (Feature Cache)",
      cacheIntro:
        "解析后的功能值缓存在 IFeatureCache 中，以避免每次请求都查询数据库。每当版本功能发生更改、订阅被修改或覆盖被设置/移除时，缓存就会失效。在没有权益模块的微服务部署中，NoOpFeatureCache 会将所有功能视为已启用。",
      requireFeatureTitle: "IRequireFeature 接口",
      requireFeatureIntro:
        "要将 CQRS 命令或查询隐藏在功能后面，请实现 IRequireFeature 标记接口。FeatureCheckBehavior 管道行为会自动解析租户的当前值，如果功能被禁用，则拒绝该请求。",
      requireFeatureNote:
        "IRequireFeature 同时适用于布尔功能（检查启用/禁用状态）和数字功能（检查剩余配额）。该行为会自动根据 Feature.ValueType 确定检查类型。",
      contextAwareTitle: "上下文感知功能显示",
      contextAwareIntro:
        "功能列表是上下文感知的。系统管理员可以看到完整的功能目录并进行 CRUD 操作。租户管理员和下钻会话仅能以只读模式查看租户的有效功能（从版本 + 覆盖中解析）。所有范围筛选均在后端通过 GET /features（目录）vs GET /features/effective（租户范围）完成。",
      endpointsTitle: "API 端点 (Endpoints)",
      endpointsIntro: "功能控制器暴露了 5 个 CRUD 端点。系统功能无法被删除：",
      seedingTitle: "功能数据植入 (Seeding)",
      seedingIntro:
        "系统功能在应用程序启动时由 EntitlementsStartupSeeder 自动植入。植入程序会检查每个系统功能是否已存在（通过名称），仅创建缺失的功能 —— 绝不会覆盖已存在的功能。",
      quotaTitle: "配额跟踪 (QuotaCounter)",
      quotaIntro:
        "数字功能通过 QuotaCounter 实体支持自动配额执行。针对每个面向数字功能的 IRequireFeature 命令，FeatureCheckBehavior 会将当前使用量与解析后的限制进行对比检查。",
      cacheNote:
        "缓存会在以下情况自动失效：(1) 修改了版本功能；(2) 分配/更改了订阅；(3) 设置/移除了自定义覆盖。不需要手动清除缓存。",
      patternTitle: "IRequireFeature 模式",
      patternIntro:
        "要将任何 CQRS 命令置于功能检查之后，只需实现 IRequireFeature 标记接口。FeatureCheckBehavior 会自动拦截请求，解析租户的功能值，如果禁用或超出配额则拒绝请求。",
      ep: {
        list: "列出所有功能（支持分页，可按类别/类型过滤）",
        get: "通过 ID 获取功能详情",
        create: "创建新的自定义功能",
        update: "更新功能元数据（系统功能：仅限更新 DefaultValue/Description）",
        delete: "软删除自定义功能（系统功能无法被删除）",
      },
    },
    overrides: {
      title: "功能覆盖 (Feature Overrides)",
      description: "基于每个租户的功能值定制，绕过版本的默认值。",
      intro:
        "功能覆盖允许平台管理员为单个租户定制功能值，无论其订阅了哪个版本。覆盖在解析链中具有最高优先级，非常适合定制销售交易、特别促销或一次性例外情况。",
      entityTitle: "覆盖实体",
      entityIntro:
        "TenantFeatureOverride 为特定租户的特定功能设置自定义值。它包含一个可选的 Reason（原因）字段以供审计使用。",
      priorityTitle: "解析优先级",
      priorityIntro:
        "覆盖位于解析链的顶端。当系统解析某个租户的功能值时，会首先检查是否存在覆盖记录：",
      whenTitle: "何时使用覆盖 (Overrides)",
      whenIntro:
        "覆盖专为特殊情况设计，即租户需要与当前版本提供的值不同的情况：",
      useCase1:
        "定制企业交易 — '给 Acme Corp 提供 500 个管理员名额，而不是标准的 50 个'",
      useCase2: "促销优惠 — '为该租户启用高级聊天功能 30 天'",
      useCase3: "Beta 测试 — '为早期采用者启用新的发票模块'",
      useCase4: "临时提额 — '在数据迁移期间提高他们的文件上传限制'",
      overuseWarning:
        "应谨慎使用覆盖功能。如果许多租户需要相同的覆盖，请考虑创建一个新版本。过多的覆盖会使系统变得难以管理和审计。",
      resolvedTitle: "已解析功能端点 (Resolved Features)",
      resolvedIntro:
        "GET /api/v1/tenants/{tenantId}/features/resolved 端点返回给定租户每个功能的最终生效值。它会显示每个条目的解析来源（覆盖/版本/默认值），使调试和审计变得非常简单。",
      endpointsTitle: "API 端点 (Endpoints)",
      endpointsIntro:
        "TenantFeatures 控制器暴露了 4 个端点，用于管理按租户自定义覆盖和解析后的值：",
      scenariosTitle: "使用场景",
      scenariosIntro: "以下实际场景展示了覆盖功能何时能提供最大价值：",
      settingTitle: "设置覆盖",
      settingIntro:
        "要设置覆盖，请向租户功能端点发送 POST 请求，并附带功能 ID、自定义值以及可选的审计原因。",
      settingTip:
        "在设置覆盖时，请始终提供原因 —— 这会使审计跟踪更有意义，并帮助未来的管理员理解应用该覆盖的原因。",
      expiryTitle: "过期的覆盖",
      expiryIntro:
        "覆盖可以有一个可选的 ExpiresAt（过期时间）日期。当过期日期过去后，覆盖会自动停用，该功能将回退到版本值（或全局默认值）。",
      expiryNote:
        "过期的覆盖将被软停用（IsActive = false），而不是被删除。这保留了审计跟踪，并在需要时允许重新激活。",
      auditTitle: "审计跟踪",
      auditIntro:
        "每一个覆盖操作都会被记录，并附带完整的审计信息。每个覆盖上的 Reason（原因）字段提供了应用自定义值的上下文背景。",
      bestPracticesTitle: "最佳实践",
      bestPracticesIntro: "遵循以下准则，以保持您的覆盖系统易于维护且可审计。",
      bestPracticesWarning:
        "应谨慎使用覆盖。如果许多租户需要相同的覆盖，请考虑直接创建一个新版本。过度使用覆盖会使系统管理变得困难，并产生维护债务。",
      ep: {
        list: "列出特定租户的所有覆盖",
        set: "为租户设置或更新功能覆盖",
        remove: "移除（停用）功能覆盖",
        resolved: "获取租户所有已解析的功能值（显示来源：覆盖/版本/默认值）",
      },
    },

    // ── Plugins Module (Phase 15) ────────────────────────────
    plugins: {
      overview: {
        title: "合规模块",
        description:
          "GDPR、CCPA 和 PDPA 合规自动化——法规、DSR 处理、同意管理、数据保留、资产清单和报告生成。",
        intro:
          "合规模块是 SCRIPE 的内置法规合规引擎。它通过用于管理数据主体请求、同意记录、保留政策以及生成可供审计的合规报告的自动化工具，帮助平台运营商及其租户保持符合主要数据保护法律（GDPR、CCPA、PDPA）的要求。",
        infoTitle: "合规声明",
        infoContent:
          "合规模块对于维持监管合规 and 避免罚款至关重要。确保所有功能正确映射到数据处理政策。",
        featureDsr: "数据主体请求 (DSR)",
        featureDsrDesc:
          "处理包括导出、擦除、更正和限制在内的数据主体请求，具有完整的生命周期跟踪和 SLA 监控。",
        featureConsent: "同意管理",
        featureConsentDesc:
          "对同意状态、快照和审计轨迹进行不可变跟踪，以符合 GDPR 第 6 条和 CCPA 的合规要求。",
        featureRetention: "保留政策",
        featureRetentionDesc: "根据可配置的保留期执行数据销毁政策，并具有自动删除或匿名化操作。",
        featureInventory: "数据资产清单",
        featureInventoryDesc:
          "跨模块映射敏感的 PII 位置——符合 GDPR 第 30 条处理活动记录 (RoPA) 的要求。",
        featureReports: "合规报告",
        featureReportsDesc:
          "生成异步的可供审计的报告（GDPR 概述、DSR 摘要、同意审计、保留分析、数据资产清单导出）。",
        featureWebhooks: "Webhook 事件",
        featureWebhooksDesc:
          "11 个实时 Webhook 事件，涵盖 DSR 生命周期、同意更改、保留执行和报告生成。",
        descDsr: "处理主体请求（导出、擦除、更正）",
        descConsent: "对同意状态和快照进行不可变跟踪",
        descRet: "根据数据时间执行数据销毁政策",
        descInv: "跨模块映射敏感的 PII 位置",
        descRep: "生成 RoPA 和 DPIA 合规报告",
        descId: "身份模块",
        descIdDesc: "提供用户/管理员上下文和身份验证",
        descEnt: "授权模块",
        descEntDesc: "通过功能入口控制合规功能",
        conn1: "发起请求",
        conn2: "授予/撤销",
        conn3: "门控政策",
        conn4: "引导擦除",
        conn5: "针对数据",
        conn6: "审计轨迹",
        conn7: "审计轨迹",
        th1: "组件",
        th2: "职责",
        tr1_1: "DsrListViewModel",
        tr1_2: "处理传入数据主体请求的分页、过滤和分配。",
        tr2_1: "ConsentRecordView",
        tr2_2: "渲染不可变的同意快照以及用户代理和时间戳元数据。",
        whatIsTitle: "什么是合规模块？",
        whatIsIntro:
          "合规模块提供了六个相互关联的子系统，涵盖了完整的合规生命周期。SCRIPE 租户无需从头开始构建合规工具，而是获得了一个生产就绪的系统，该系统可以跟踪、自动化和报告他们的数据保护义务。",
        subModulesTitle: "六大子系统",
        subModulesIntro: "每个子系统处理一个特定的合规领域：",
        sub1: "法规配置文件——存储平台运营所依据的监管框架（GDPR、CCPA、PDPA）。",
        sub2: "数据主体请求 (DSR)——管理数据主体的权利请求（导出、擦除、更正、限制）。",
        sub3: "同意管理——记录、跟踪和审计用户同意的授予和撤销。",
        sub4: "数据保留政策——定义数据保留时间以及过期时的处理方式（删除或匿名化）。",
        sub5: "数据资产清单——平台处理的所有个人数据类别的注册表。",
        sub6: "合规报告——生成异步的可供审计的报告（GDPR 概述、DSR 摘要、同意审计等）。",
        regulationsTitle: "支持的法规",
        regulationsIntro:
          "SCRIPE 的合规模块支持执行这些主要的数据保护法规。每项法规都预置了其 SLA 期限和罚款结构。",
        regName: "法规",
        regRegion: "地区 / 管辖权",
        regSla: "响应 SLA",
        regPenalty: "最高罚款",
        regGdprRegion: "欧盟 (EU/EEA)",
        regCcpaRegion: "美国加利福尼亚州",
        regLgpdRegion: "巴西",
        regPopiaRegion: "南非",
        regPdpaRegion: "新加坡",
        backendTitle: "后端架构",
        backendIntro:
          "合规后端遵循标准的 SCRIPE 三项目模块布局（Domain / Application / Infrastructure），具有专用的 ComplianceDbContext 和 ComplianceController。",
        cqrsTitle: "CQRS 命令和查询",
        cqrsIntro:
          "合规模块使用标准的 SCRIPE 中介者 CQRS 模式。命令处理写操作，查询处理读操作，每个都有专用的 FluentValidation 验证器。",
        cqrsType: "类型",
        cqrsExample: "处理器",
        cqrsDesc: "描述",
        cqrsSubmit: "提交一个新的数据主体请求，并进行验证 and SLA 计算",
        cqrsReview: "审查并更新 DSR 的状态（批准、拒绝、完成）",
        cqrsConsent: "记录同意授予以及完整的审计元数据（IP、用户代理、版本）",
        cqrsRetention: "更新保留政策配置（天数、操作、激活状态）",
        cqrsDsrList: "通过分页列出所有 DSR，并按状态/类型/法规进行过滤",
        cqrsConsentAnalytics: "按目的、状态和时间段聚合同意统计信息",
        cqrsDashboard: "返回包含所有合规子系统计数汇总仪表板",
        frontendTitle: "前端架构",
        frontendIntro:
          "前端在 src/modules/compliance/ 下组织为六个独立的子模块，每个子模块都按照 View/ViewModel 模式具有自己的域、数据和表示层。",
        endpointsTitle: "API 端点概述",
        endpointsIntro:
          "所有端点都在 /api/v1/compliances/ 下，并且需要使用 compliance.view 权限进行身份验证。",
        apiRegList: "列出为平台配置的所有法规配置文件",
        apiDsrSubmit: "提交新的数据主体请求（导出、擦除、更正、限制）",
        apiDsrList: "通过分页列出所有 DSR，并按状态/类型/法规进行过滤",
        apiDsrReview: "审查 DSR——批准、拒绝或将其标记为已完成并附带解决说明",
        apiConsentRecord: "记录具有完整审计元数据的新同意授予",
        apiConsentAnalytics: "检索同意分析（按目的划分的授予/撤销率）",
        apiRetentionList: "列出所有具有执行状态的保留政策",
        apiRetentionUpdate: "更新保留政策（天数、操作、激活状态）",
        apiInventoryList: "列出所有数据资产清单项（GDPR 第 30 条 RoPA）",
        apiReportsList: "列出所有具有状态和类型过滤器的合规报告",
        apiReportDownload: "以 CSV、JSON、XLSX 或 PDF 格式下载生成的报告",
        apiReportGenerate: "排队一个新的异步合规报告生成作业",
        apiDashboard: "检索合规仪表板摘要（计数、SLA 状态、警报）",
        webhooksTitle: "Webhook 事件",
        webhooksIntro:
          "合规模块触发 11 个实时 Webhook 事件，外部系统可以订阅这些事件。事件通过 ComplianceWebhookEventCatalog 自动注册，并通过 IWebhookDispatcher 管道进行调度。",
        webhookEvent: "事件键",
        webhookCategory: "类别",
        webhookDesc: "描述",
        whDsrSubmitted: "提交新的数据主体请求时触发",
        whDsrStatusChanged: "当 DSR 状态转换（待处理 → 进行中 → 已完成/已拒绝）时触发",
        whDsrCompleted: "当 DSR 完全完成（数据导出、擦除或更正）时触发",
        whDsrErasure: "当管理员确认擦除 DSR 时触发（终极操作）",
        whDsrCancelled: "在完成前取消 DSR 时触发",
        whConsentGranted: "当用户同意特定目的时触发",
        whConsentWithdrawn: "当用户撤销先前授予的同意时触发",
        whRetentionUpdated: "更新保留政策配置时触发",
        whRetentionExec: "保留执行作业完成执行时触发",
        whReportGenerated: "合规报告生成成功完成时触发",
        whReportFailed: "合规报告生成失败时触发",
        quickStartTitle: "快速入门指南",
        step1Title: "播种合规数据",
        step1Content: "运行开发播种器以填充测试环境的法规配置文件、示例同意目的和保留政策。",
        step2Title: "配置法规配置文件",
        step2Content:
          "导航至管理面板中的合规 → 法规。启用平台运营所依据的法规（GDPR、CCPA、PDPA）。每项法规都定义了将要执行的 SLA 期限和罚款结构。",
        step3Title: "提交测试 DSR",
        step3Content:
          "创建一个数据主体请求以测试完整生命周期。系统将验证该请求，计算 SLA 期限，并将其提供给合规官进行分配。",
        step4Title: "记录同意并配置保留",
        step4Content:
          "设置同意目的（营销、分析、第三方）并为每个数据类别配置保留政策。当数据老化超过保留期时，保留执行作业将自动应用配置的操作。",
        step5Title: "生成合规报告",
        step5Content:
          "排队一个异步合规报告。报告将在后台生成，并在准备就绪后出现在报告列表中。以 CSV、JSON、XLSX 或 PDF 格式下载。",
        securityTitle: "安全注意事项",
        securityIntro:
          "合规数据是平台中最敏感的数据之一。所有端点都受 JWT 身份验证、基于角色的授权和加密 ID 传输的保护。DSR 和同意记录中的个人数据受到字段级安全限制。",
        securityWarningTitle: "数据保护警告",
        securityWarningContent:
          "合规数据包含个人身份信息 (PII)。确保配置了适当的访问控制、审计日志和数据加密。切勿在没有身份验证的情况下公开原始合规端点。",
        secDoTitle: "推荐做法",
        secDo1: "为 DSR 响应中的 PII 字段启用字段级安全",
        secDo2: "为所有合规事件订阅配置 Webhook 密钥",
        secDo3: "为合规 data 本身设置保留政策（元合规）",
        secDo4: "定期审查审计日志以发现未经授权的访问企图",
        secDontTitle: "要避免的反模式",
        secDont1: "切勿在没有仅限管理员身份验证的情况下公开 DSR 端点 (AdminOnly)",
        secDont2: "切勿跳过同意版本跟踪——这会使审计轨迹失效",
        secDont3: "切勿硬删除合规记录——请始终使用软删除 (soft-delete)",
        secDont4: "切勿绕过 Webhook 调度程序来处理合规事件",
      },

      dsr: {
        title: "数据主体权利 (DSR)",
        description: "描述",
        intro:
          "数据主体请求 (DSR) 是个人根据数据保护法行使其权利的正式请求。合规模块提供了一个完整且结构化的 DSR 工作流程：提交、分配、审核、处理和关闭 — 具有完整的只增审计跟踪和 SLA 跟踪。",
        typesTitle: "请求类型",
        typesIntro: "系统支持 GDPR 和 CCPA 法规定义的五种 DSR 类型：",
        typesType: "请求类型",
        typesDesc: "描述",
        typesGdpr: "GDPR 条款引用",
        typesAccessDesc: "访问权（第 15 条）。数据主体请求处理目的、个人数据类别和接收方列表。",
        typesExportDesc: "数据可携权（第 20 条）。数据主体请求其个人数据的机器可读副本。",
        typesErasureDesc: "删除权 / 被遗忘权（第 17 条）。数据主体请求永久删除或匿名化其 PII。",
        typesRectificationDesc: "纠正权（第 16 条）。数据主体请求纠正不准确或不完整的个人数据。",
        typesRestrictionDesc:
          "限制处理权（第 18 条）。数据主体请求在保留数据存储的同时暂停数据处理。",
        lifecycleTitle: "请求生命周期",
        lifecycleIntro:
          "DSR 工单被建模为具有审核周期和安全确认状态的过渡，以防止意外和不可逆的删除：",
        lifecycleFlowTitle: "DSR 请求生命周期与安全确认门禁",
        nodeSubmit: "1. 提交请求",
        descSubmit:
          "数据主体通过 SubmitDsrCommand 提交 DSR 请求。状态设为等待中并计算 SLA 截止日期。",
        nodeReview: "2. 管理员审核",
        descReview: "管理员通过 ReviewDsrCommand 审核请求，将状态过渡为已批准或已拒绝。",
        nodeConfirm: "3. 确认删除",
        descConfirm:
          "删除请求需要通过 ConfirmErasureCommand 进行手动确认，从而将 ErasureConfirmed 设为 true。",
        nodeProcessing: "4. DSR 执行任务",
        descProcessing:
          "每 5 分钟运行一次的 DsrExecutionJob 会按多达 50 个元素的批次处理已确认/批准的请求。",
        nodeCompleted: "5. 状态: 已完成",
        descCompleted: "在所有模块中成功执行，并存储完成时间戳。",
        nodeRejected: "状态: 已拒绝",
        descRejected: "管理员在审核期间拒绝请求。保存解决备注。",
        nodeCancelled: "状态: 已取消",
        descCancelled: "等待中、审核中或已批准的请求可以随时手动取消。",
        nodePartial: "6. 部分完成",
        descPartial:
          "如果任何模块提供程序失败，DSR 将过渡为部分完成，并递增 RetryCount（最多 3 次）。",
        connSubmitReview: "分配并移至审核中",
        connReviewApprove: "批准请求",
        connReviewReject: "拒绝请求",
        connApproveConfirm: "删除请求所需",
        connConfirmExec: "获取并开始处理",
        connExecComplete: "所有模块均成功",
        connExecPartial: "任何模块失败",
        connPartialRetry: "重试失败的模块",
        connCancel: "取消请求",
        executionFlowTitle: "DSR 匿名化执行流程",
        nodeExecJob: "DsrExecutionJob 触发",
        descExecJob: "每 5 分钟运行一次，检索已批准且准备执行的删除请求。",
        nodeCheckSafety: "安全检查门禁",
        descCheckSafety: "验证 ErasureConfirmed = true 且 ErasureExecuteAfter 宽限期已过。",
        nodeGenToken: "生成匿名化令牌",
        descGenToken: "根据数据主体 ID 生成安全的 SHA-256 匿名化令牌。",
        nodeFanOut: "模块分发",
        descFanOut: "循环遍历所有实现了 IUserDataAnonymizer 的已注册合规提供程序。",
        nodeModuleExec: "零分配内存执行",
        descModuleExec: "通过 EF Core 的 ExecuteUpdateAsync 执行数据库更新以擦除 PII 字段。",
        nodeEvalStatus: "评估结果",
        descEvalStatus: "检查模块执行报告以确认成功完成。",
        nodeComplete: "设置状态: 已完成",
        descComplete: "DSR 工单被标记为已完成，并保存 CompletedAt 时间戳。",
        nodePartialLimit: "设置状态: 部分完成",
        descPartialLimit: "记录错误，递增 RetryCount，并将失败的模块放入重试队列（最多 3 次）。",
        connJobCheck: "检索批次",
        connCheckGen: "如果安全门禁已通过",
        connGenFan: "构建令牌",
        connFanMod: "调用匿名化程序",
        connModEval: "收集状态",
        connEvalComplete: "如果全部成功",
        connEvalPartial: "如果任何失败",
        slaTitle: "SLA 跟踪与截止日期计算",
        slaIntro:
          "合规法规规定了严格的响应时间。SCRIPE 会在管理员控制面板上自动计算并跟踪 SLA 指标：",
        slaWarningTitle: "SLA 截止日期逻辑",
        slaWarningContent:
          "截止日期在提交时通过读取活动的 RegulationProfile（GDPR：30 天，CCPA：45 天）来计算。SLA 进度按百分比动态计算：(当前时间 - CreatedAt) / (截止日期 - CreatedAt) * 100。",
        escalationTitle: "升级引擎与警报",
        escalationIntro:
          "DsrEscalationJob 每天 08:00 UTC 运行，以评估 SLA 消耗情况并升级逾期工单：",
        escalationTier1:
          "1 级 (50% SLA) — 发送给指定管理员的标准提醒警报。记录历史备注: [SLA-ESCALATION-50%].",
        escalationTier2:
          "2 级 (75% SLA) — 警告升级。记录历史备注: [SLA-ESCALATION-75%] 并发送 compliance.dsr_sla_escalated Webhook。",
        escalationTier3:
          "3 级 (90% SLA) — 紧急升级。记录历史备注: [SLA-ESCALATION-90%]，向系统管理员报警，并发送紧急 Webhook。",
        providerTitle: "可扩展提供程序架构",
        providerIntro:
          "为了保持松耦合，合规模块使用 IUserDataProvider 和 IUserDataAnonymizer 抽象与其他模块通信：",
        providerIdentityTitle: "身份模块集成",
        providerIdentityContent:
          "IdentityUserDataProvider 导出个人资料元数据、活动登录会话以及绑定的外部登录。IdentityUserDataAnonymizer 使用高性能、零分配的数据库更新，将名称替换为匿名化令牌，将电子邮件格式化为 {token}@anonymized.invalid，将电话号码设为 null，并将活动会话 IP 标记为 'ANONYMIZED'。",
        providerComplianceTitle: "合规模块集成",
        providerComplianceContent:
          "ComplianceUserDataProvider 导出请求日志和同意登记项。ComplianceUserDataAnonymizer 擦除历史 DSR（SubjectEmail 和 RequesterNotes）以及同意日志（IpAddress 和 UserAgent）中的个人信息。",
        entitiesTitle: "实体参考",
        entityName: "实体名称",
        entityDesc: "描述",
        entityDsrDesc: "表示包含类型、状态、SLA 截止日期和执行参数的数据主体请求。",
        entityModuleDesc: "为每个模块提供程序跟踪分发的 DSR 执行的执行状态和重试尝试。",
        entityStatusDesc: "只增登记册，跟踪 DSR 状态转换、解决备注和 SLA 升级。",
        codeTitle: "代码实现",
        endpointsTitle: "API 端点",
        endpointsIntro: "DSR 控制器公开了以下端点，用于请求提交、审核和执行控制：",
        ep: {
          list: "列出所有 DSR（分页，可通过状态/类型/法规进行过滤）",
          get: "按 ID 获取 DSR 详细信息",
          create: "提交新的 DSR（计算 SLA 截止日期）",
          updateStatus: "更新 DSR status（进行中、已完成、已拒绝）",
          assign: "将 DSR 分配给合规官",
          delete: "软删除 DSR",
          confirm: "明确确认已批准的删除 DSR 以解锁执行",
        },
        field: "字段",
        type: "类型",
        fId: "DSR 请求的唯一标识符。",
        fTenantId: "引用租户上下文的外键。",
        fSubjectEmail: "数据主体电子邮件地址（擦除时匿名化）。",
        fRequestType: "DSR 类型（访问、导出、删除、纠正、限制）。",
        fStatus: "请求的当前生命周期状态。",
        fDeadline: "计算得出的 SLA 响应截止日期。",
        fErasureConfirmed: "布尔标志，为后台任务解锁删除请求。",
        fErasureExecuteAfter: "执行阈值，强制执行自适应宽限期。",
        fExportFileUrl: "用于下载分发的导出数据压缩包的 URL。",
        fAssignedTo: "引用被分配管理员的外键。",
        fRetryCount: "失败模块执行的当前重试尝试计数。",
        fCompletedAt: "指示 DSR 何时完成的时间戳。",
        quickStartTitle: "快速入门指南",
        step1Title: "播种合规配置文件",
        step1Content: "运行开发播种程序以使用 SLA 天数填充 GDPR 和 CCPA 法规配置文件。",
        step2Title: "提交数据主体请求",
        step2Content: "使用 POST 端点记录新请求。系统验证输入约束并计算截止日期。",
        step3Title: "审核并批准",
        step3Content: "指定的合规官审核工单。批准删除 DSR 会设置宽限期并等待最终确认。",
        executionFlowIntro: "删除请求的执行通过分发的提供程序实现跨模块异步匿名化个人数据：",
      },
      consent: {
        title: "同意管理",
        description: "描述",
        intro:
          "同意管理提供用户同意状态的不可变记录。为了支持高性能查询以及法律上可辩护的审计跟踪，SCRIPE 使用双表架构，分为只增事务日志和缓存的物化视图。",
        purposesTitle: "同意目的与设置",
        purposesIntro: "同意跟踪受全局配置文件和应用程序启动时播种的结构化同意目的的约束：",
        purposesKey: "目的键",
        purposesBasis: "法律依据",
        purposesRequired: "强制性",
        purposesSort: "排序顺序",
        purposesActive: "有效",
        purposesEssentialDesc: "平台运行所需的基本能力。（强制性，合同法律依据）。",
        purposesMarketingDesc: "促销时事通讯、电子邮件和营销活动沟通。（可选，同意作为法律依据）。",
        purposesAnalyticsDesc:
          "使用情况分析、用户行为跟踪和产品改进遥测。（可选，同意作为法律依据）。",
        basisContract: "合同",
        basisConsent: "同意",
        basisLegitimate: "合法利益",
        basisObligation: "法律义务",
        flowTitle: "同意记录与验证流程",
        nodeSubmit: "提交同意",
        descSubmit: "用户更新其首选项或提交同意表单。",
        nodeValidate: "FluentValidation 验证",
        descValidate: "验证法规约束和目的键的语法。",
        nodeLedger: "添加至日志",
        descLedger: "写入不可变的 ConsentRecord 事务，包含 IP 地址、用户代理、版本和操作。",
        nodeUpsert: "更新快照状态",
        descUpsert: "在 ConsentSnapshot 缓存中物化当前状态，以进行高性能权限检查。",
        nodeEvents: "领域事件",
        descEvents: "通过 MediatR 发布 ConsentGrantedEvent 或 ConsentWithdrawnEvent。",
        nodeExpiry: "同意过期任务",
        descExpiry: "每周后台任务分析版本差异并将过期的记录标记为需要重新同意。",
        connSubmitValidate: "将详细信息提交给",
        connValidateLedger: "如果有效则添加事务",
        connLedgerUpsert: "更新缓存快照状态，基于",
        connUpsertEvents: "成功时分发事件",
        connExpiryUpsert: "将 RequiresReConsent = true 标记在",
        immutabilityTitle: "双表数据库架构",
        immutabilityIntro:
          "为同时确保数据库性能和合规审计完整性，同意跟踪将高写入量的事务与高读取量的权限检查隔离开来：",
        entitiesTitle: "实体参考",
        entitiesIntro: "以下表格定义了只增日志和缓存的物化快照的架构属性：",
        field: "字段",
        type: "类型",
        fId: "记录的唯一标识符。",
        fTenantId: "引用租户上下文的外键。",
        fSubjectId: "引用数据主体（用户）的外键。",
        fPurposeId: "引用 ConsentPurpose 配置的外键。",
        fAction: "记录的同意操作（已授权或已撤销）。",
        fCurrentAction: "最新同意状态缓存，基于主体和目的。",
        fRequiresReConsent: "指示用户因政策版本更新而必须重新同意的标志。",
        fLastUpdatedAt: "表示快照最后修改时间的时间戳。",
        fRecordedAt: "表示日志事务发生时间的时间戳。",
        fIpAddress: "记录时捕获的客户端 IP 地址。",
        fUserAgent: "记录时捕获的浏览器用户代理。",
        fRegulationBasis: "提交时有效的法规背景 (GDPR, CCPA)。",
        fCollectionMethod: "收集同意的方法（网页表单、移动应用、API）。",
        fConsentVersion: "提交时有效的同意政策文件版本。",
        bestPracticesTitle: "最佳实践",
        doTitle: "推荐实践",
        dontTitle: "应避免的实践",
        do1: "验证目的键是否符合小写字母和数字的正则约束。",
        do2: "始终运行每周一次的 ConsentExpiryJob 以在版本更新时强制重新同意。",
        do3: "使用 MediatR ConsentWithdrawnEvents 限制下游数据处理。",
        dont1: "切勿直接修改 ConsentRecord 行，以免破坏不可变的审计记录。",
        dont2:
          "切勿在 ConsentRecord 上直接执行 SQL 查询进行前端权限检查；请始终读取 ConsentSnapshot。",
        dont3: "切勿公开未授权的原始同意记录端点。",
        endpointsTitle: "API 端点",
        ep: {
          list: "列出所有日志记录（仅限管理员，可过滤分页）",
          get: "按 ID 获取同意记录详细信息",
          record: "记录新的同意授权或撤销（用户/管理员）",
          withdraw: "撤回先前授予的同意（用户/管理员）",
          getMy: "检索当前经过身份验证的用户的活动同意快照",
          analytics: "按目的和状态获取同意统计数据（仅限管理员）",
        },
        entitiesLedgerTitle: "ConsentRecord (只增日志)",
        entitiesSnapshotTitle: "ConsentSnapshot (物化快照缓存)",
        epWithdraw: "撤回先前授予的同意",
      },

      retention: {
        title: "数据保留政策",
        description:
          "定义数据保留期和自动过期操作（删除或匿名化），以遵守GDPR第5(1)(e)条。",
        intro:
          "数据保留政策定义必须将特定类别的数据保留多长时间，以及保留期满后会发生什么。SCRIPE通过后台作业自动执行这些政策，消除了管理数据生命周期的手动开销。",
        policiesTitle: "政策配置",
        policiesIntro: "每项保留政策规定：",
        field1:
          "DataCategory — 数据类型（例如“用户档案”、“交易日志”、“同意记录”）。",
        field2: "RetentionDays — 必须保留数据的天数。",
        field3: "ExpiryAction — 过期后会发生什么：删除或匿名化。",
        field4: "RegulationCode — 需要此保留期的法规（GDPR，CCPA等）。",
        actionsTitle: "过期操作",
        actionsIntro: "当保留期满时，SCRIPE应用两种操作之一：",
        action1: "删除 — 永久删除匹配数据类别的所有记录。",
        action2:
          "匿名化 — 将个人可识别信息替换为假名令牌，同时保留汇总分析数据。",
        automationTitle: "自动执行",
        automationIntro:
          "RetentionEnforcementJob在每天世界协调时(UTC)凌晨3:00运行，扫描所有活动保留政策并对合格记录应用配置的过期操作。每次执行都会创建RetentionExecution审计记录。",
        nodePolicy: "保留政策",
        descPolicy: "定义实体类型、寿命限制和销毁策略",
        nodeEnforcement: "保留执行作业",
        descEnforcement: "每周作业以评估政策",
        nodeExecution: "保留执行",
        descExecution: "销毁操作的审计跟踪",
        nodeAction: "数据销毁",
        descAction: "通过ISuspendableModule硬删除或匿名化",
        conn1: "扫描者",
        conn2: "触发",
        conn3: "记录",
        endpointsTitle: "API端点",
        ep: {
          list: "列出所有保留政策",
          executions: "列出执行历史",
          update: "更新保留政策（天数，操作，活动状态）",
        },
      },
      inventory: {
        title: "数据清单",
        description:
          "平台处理的所有个人数据类别的注册表——GDPR第30条处理活动记录 (RoPA) 要求。",
        intro:
          "数据清单是平台处理的所有个人数据类别的结构化注册表。根据GDPR第30条，控制者必须维护处理活动记录（RoPA）——数据清单即是SCRIPE对此要求的实现。",
        fieldsTitle: "清单字段",
        fieldsIntro: "每个清单项目记录：",
        field1:
          "DataCategory — 数据类别的易读名称（例如“电子邮件地址”、“支付信息”）。",
        field2:
          "LegalBasis — 处理的GDPR合法基础（同意、合同、法定义务、重要利益、公共任务、合法利益）。",
        field3:
          "DataSubjects — 数据属于谁（例如“最终用户”、“员工”、“客户”）。",
        field4:
          "ProcessingPurpose — 处理数据的原因（例如“订单履行”、“营销”、“合规”）。",
        field5:
          "StorageLocation — 数据存储的位置（针对跨境转移合规性的国家/地区）。",
        field6: "RetentionPeriod — 数据保留多长时间（链接到保留政策）。",
        field7: "ThirdPartySharing — 数据是否与第三方共享以及是哪些第三方。",
        ropaTitle: "第30条合规",
        ropaIntro:
          "拥有250名以上员工或处理高风险数据的组织必须根据GDPR第30条维护RoPA。SCRIPE的数据清单充当实时、可查询的RoPA，可导出以供监管检查。",
        endpointsTitle: "API端点",
        ep: {
          list: "列出所有数据清单项目（分页，可搜索）",
          get: "按ID获取项目",
          create: "向清单中添加新的数据类别",
          update: "更新现有清单项目",
          delete: "从清单中删除项目",
        },
      },
      reports: {
        title: "合规报告",
        description:
          "生成异步的支持审计的合规报告（GDPR概览、DSR摘要、同意审计、保留分析、数据清单导出）。",
        intro:
          "合规报告是异步生成的文档，可提供合规状态的审计就绪摘要。报告在后台生成，准备好后即存储供下载，支持监管检查、内部审计和高管汇报。",
        reportTypesTitle: "报告类型",
        reportTypesIntro: "提供五种报告类型：",
        type1: "GDPR概览 — 各子模块GDPR合规状态的高层次摘要。",
        type2: "DSR活动摘要 — 关于DSR容量、类型、完成率和SLA遵循情况的统计。",
        type3: "同意审计 — 按目的和时间段划分的同意授予和撤销的完整日志。",
        type4: "保留分析 — 所有活动保留政策的当前执行状态。",
        type5: "数据清单导出 — 数据清单的完整导出（第30条RoPA）。",
        asyncTitle: "异步生成",
        asyncIntro:
          "报告是异步生成的，以避免阻塞大型数据集的HTTP请求。当您请求一份报告时，系统立即创建IsReady=false的ComplianceReport记录并对生成作业进行排队。轮询报告列表以检查IsReady何时变为true。",
        asyncTip:
          "在报告UI中使用刷新按钮以轮询报告就绪状态。对于多达10,000条记录的数据集，报告通常在30-60秒内完成。",
        downloadTitle: "下载报告",
        downloadIntro:
          "一旦报告准备就绪（IsReady=true），就会提供DownloadUrl。下载端点安全地提供报告文件。报告文件在自动清理前保留90天。",
        endpointsTitle: "API端点",
        ep: {
          list: "列出所有合规报告（分页，按类型/状态过滤）",
          get: "按ID获取报告详情和下载URL",
          generate: "排队新的报告生成作业",
          download: "下载生成的报告文件",
        },
      },
    },
    hrms: {
      overview: {
        title: "HRMS 模块",
        description: "人力资源管理系统，管理员工个人资料、雇用记录、资质、认证、空闲时间和分配。",
        intro:
          "HRMS 模块是平台员工资源的单一事实来源。它管理员工资料、雇用记录、资质、专业认证、空闲时间和分配。",
        infoTitle: "设计原则",
        infoContent:
          "HRMS 记录通过稳定的 ID 引用指向 Identity 用户，而不是通过数据库外键。这保持了身份验证与 HR 资料的解耦。",
        whatIsTitle: "什么是 HRMS？",
        whatIsIntro: "它是管理员、教练和员工的行政核心。",
        featureStaff: "员工资料",
        featureStaffDesc: "个人 and 专业细节，包括紧急联系人和就业状态。",
        featureCompliance: "资质与认证",
        featureComplianceDesc: "双语证书、验证日期以及教练课程的合规性验证。",
        modelTitle: "数据模型",
        modelIntro:
          "管理 StaffMember, EmploymentRecord, Qualification, Certification, StaffAvailability, StaffAssignment 等实体。",
        permsTitle: "权限",
        permsIntro:
          "访问受权限控制：hrms.staff.view, hrms.staff.create, hrms.staff.update 和 hrms.staff.delete。",
      },
    },
    partyKernel: {
      overview: {
        title: "Party Kernel 模块",
        description: "核心业务目录，管理个人、组织、联系方式、关系和数据合并候选者。",
        intro:
          "Party Kernel 模块是业务实体的核心注册表。它跟踪个人和组织、他们的联系方式以及相互关系。",
        infoTitle: "设计原则",
        infoContent:
          "Party Kernel 使用中立的模型，将所有业务参与者（客户、监护人、员工）表示为通用的 Parties。",
        whatIsTitle: "什么是 Party Kernel？",
        whatIsIntro: "它构成了 CRM 和账单的基础。",
        featureParties: "通用 Parties",
        featurePartiesDesc: "个人和法人实体的统一表示。",
        featureMerge: "数据去重",
        featureMergeDesc: "根据姓名/邮箱/电话匹配识别重复记录，并干净地合并它们。",
        modelTitle: "数据模型",
        modelIntro:
          "管理 Party, PartyPerson, PartyOrganization, PartyRole, PartyRelationship, ContactPoint 等实体。",
        permsTitle: "权限",
        permsIntro: "受 party.view, party.create, party.update 和 party.delete 权限保护。",
      },
    },
    organizationCore: {
      overview: {
        title: "Organization Core 模块",
        description: "定义租户的物理和法律层级结构，包括业务单元、分部、场地和部门。",
        intro: "Organization Core 对组织架构 and 设施拓扑进行建模。",
        infoTitle: "设计原则",
        infoContent: "组织结构是层级化的，支持区域分部和场地的父子关系。",
        whatIsTitle: "什么是 Organization Core？",
        whatIsIntro: "它结构化了业务开展的地点和方式。",
        featureStructure: "组织层级结构",
        featureStructureDesc: "法人实体、区域分部、场地和部门的灵活嵌套。",
        featureNodes: "稳定引用",
        featureNodesDesc: "日程安排、预订和学院模块通过稳定的组织 ID 进行引用。",
        modelTitle: "数据模型",
        modelIntro: "管理 BusinessUnit, Branch, Site, Department 等实体。",
        permsTitle: "权限",
        permsIntro:
          "通过 organization.view, organization.create, organization.update 和 organization.delete 进行管理。",
      },
    },
    customFields: {
      overview: {
        title: "自定义字段模块",
        description:
          "按租户可配置的自定义字段定义，通过稳定键关联到任何已注册的实体类型——无需更改架构，也不产生跨模块耦合。",
        intro:
          "自定义字段模块允许每个租户使用自己的类型化字段扩展平台的记录——例如在「人员」上添加「衬衫尺码」字段，或在「球员」上添加「惯用脚」字段——无需任何数据库迁移或代码更改。字段定义按租户划分范围，并通过跨模块的实体类型注册表关联到宿主实体，而不是通过外键，因此该模块永远不会与其他模块的架构耦合。",
        infoTitle: "设计原则",
        infoContent:
          '自定义字段通过稳定的实体类型键（例如 "party.person"）关联，并根据实体类型注册表进行校验，而不是通过数据库外键。这使模块保持完全解耦，并可安全地独立演进。',
        whatIsTitle: "什么是自定义字段？",
        whatIsIntro:
          "自定义字段是租户为现有实体定义的扩展。每个定义包含一个机器键（在同一租户和实体类型下唯一）、双语标签、一个值类型、一个可选的必填标志、供选择型字段使用的可选允许选项列表，以及一个排序顺序。值以类型化方式存储，而不是存储在无类型的 JSON 块中。",
        featureTenant: "按租户划分范围",
        featureTenantDesc:
          "每个定义都归属于某个租户，并通过全局租户查询过滤器进行隔离。系统级（共享）定义则供平台运营方使用。",
        featureRegistry: "经注册表校验的关联",
        featureRegistryDesc:
          "字段通过其规范的实体类型键关联到宿主实体，并根据跨模块的实体类型注册表进行校验——绝不通过外键。",
        featureTyped: "类型化的值",
        featureTypedDesc:
          "每个字段声明二十二种值类型之一——从纯文本和数字，到引用、上传的文件或图片，再到格式化的富文本——从而避免无类型的元数据块，并支持恰当的校验。",
        featureIsolation: "不可变的键",
        featureIsolationDesc:
          "实体类型键和机器键在创建后不可更改，以确保已存储的值始终可寻址；只有显示和行为方面的元数据可以编辑。",
        valueTypesTitle: "值类型",
        valueTypesIntro:
          "端到端支持二十二种值类型——完整列表请参见操作员文档中的「值类型」页面。选择型和多选型字段包含以换行符分隔的允许选项列表；其他类型不得携带选项。API 在创建和更新时都会强制执行这一点。",
        modelTitle: "数据模型",
        modelIntro:
          "一个 CustomField 包含：EntityTypeKey（已注册）、Key（机器键，在租户 + 实体类型下唯一）、LabelEn / LabelAr、ValueType、IsRequired、Options（仅限选择型）、SortOrder 和 IsActive。唯一性按 (TenantId, EntityTypeKey, Key) 强制执行。",
        isolationTitle: "租户隔离",
        isolationIntro:
          "读取操作在该模块的全局租户过滤器下执行，因此某个租户只能看到自己的定义以及系统级共享的定义。创建操作会自动标记当前租户。更新和删除操作会强制执行所有权检查，因此租户管理员永远无法修改或删除共享定义或其他租户的定义。",
        isolationWarnTitle: "系统级字段",
        isolationWarnContent:
          "没有租户归属的定义会被视为共享/全局定义，对每个租户都可见。只有系统主体（无租户上下文）才能修改或删除它们；受租户范围限制的管理员会被所有权检查阻止。",
        permsTitle: "权限",
        permsIntro:
          "该模块拥有 custom-fields 资源，具备标准的 CRUD 操作：custom-fields.view、custom-fields.create、custom-fields.update 和 custom-fields.delete。",
      },
    },
  },
};
