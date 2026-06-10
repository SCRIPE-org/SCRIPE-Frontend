/**
 * Docs page locale — ZH
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const zh = {
  commercial: {
    enterpriseAddons: {
      entitlementsTitle: "权益与计划管理",
      entitlementsIntro:
        "利用 SCRIPE 内置的权益模块，将您的平台转化为真正的 SaaS 强力引擎。定义版本（计划）、管理订阅生命周期，并自定义每个租户的功能访问权限 —— 所有这些都在 CQRS 管道级别自动强制执行。",
      entReseller: "经销商版本隔离",
      entResellerDesc:
        "经销商租户可以为其子租户创建自己的零售版本，从而实现白标 (white-label) 计划管理，并与其他经销商完全隔离。",
      entVersioning: "版本化的发布控制",
      entVersioningDesc:
        "创建带有功能快照的发布版本，并通过立即、灰度 (canary) 或计划发布策略部署更改 —— 而不会中断现有已订阅租户的服务。",
      entOverrides: "细粒度的租户覆盖",
      entOverridesDesc:
        "无论租户订阅了什么计划，都可以为单个租户自定义功能值。非常适合定制的企业级交易、促销优惠和 Beta 测试。",
      entQuota: "自动配额执行",
      entQuotaDesc:
        "带有 QuotaCounter 实体的数字功能将通过 FeatureCheckBehavior 管道自动执行。无需手动检查 —— 当超出配额时，命令将被拒绝。",
      entContextAware: "上下文感知的管理范围",
      entContextAwareDesc:
        "功能、版本和权限页面会自动适应管理员的上下文。系统管理员可以看到完整的目录并拥有 CRUD 操作权限；租户管理员仅能看到其生效数据；深入查看 (drill-down) 会话会限定到所选定的租户 —— 所有这些都由后端驱动，而非客户端过滤。",
      entLifecycleTitle: "完整的订阅生命周期",
      entLifecycleContent:
        "从分配到续订、暂停、恢复、降级和取消——整个订阅生命周期通过企业级审计跟踪进行管理。每个计费周期在数据库中生成不可变的行（Stripe 模式）。",
      entRenewalAudit: "不可变的收入审计跟踪",
      entRenewalAuditDesc:
        "续订创建新的订阅行而不是覆盖现有记录。每个周期保留锁定的定价，使 MRR 趋势和财务审计精确可靠。",
      entPromoExpiry: "智能促销到期",
      entPromoExpiryDesc:
        "限时促销通过 PromotionExpiresAt 自动跟踪。续订时，过期的促销被移除——新定价无缝生效。",
      entConcurrency: "竞态条件保护",
      entConcurrencyDesc:
        "每个订阅上的乐观并发戳防止并行操作之间的冲突。企业级数据完整性，无性能损失。",
      entValidation: "管道级输入验证",
      entValidationDesc:
        "所有 8 个订阅命令都受到 FluentValidation 验证器的保护，具有完全本地化的英语和阿拉伯语错误消息。",
      entCrossModule: "跨模块管理员集成",
      entCrossModuleDesc:
        "订阅生命周期事件自动级联到身份管理。当订阅被暂停时，所有租户管理员被安全停用。恢复时，只有因暂停而停用的管理员被重新激活。",
      contactNote:
        "需要此处未列出的附加组件？我们的企业解决方案团队随时可以快速开发专业集成的原型。",
      customContent:
        "有非常具体的监管要求吗？SCRIPE 工程团队可以作为您自己团队的延伸，直接在您的租户层级中快速交付量身定制的模块。",
      customDev: "定制模块工程开发",
      customDevDesc: "我们构建、记录并测试高度特定的、完全针对您独特工作流程量身定制的限界上下文。",
      customTitle: "专属的定制工程",
      description: "高级功能模块、专属的服务等级协议 (SLA) 以及白金级的迁移协助。",
      integrationContent:
        "需要将数据与 Salesforce、SAP 或旧有的 AS400 主机同步吗？我们提供开箱即用的、高弹性的集成适配器，利用 Apache Kafka 或 Azure Service Bus 来无缝弥合这一鸿沟。",
      integrationTitle: "遗留系统集成",
      intro:
        "尽管 SCRIPE 开箱即用，功能已经极其强大，但大型组织通常需要白金级的定制服务。我们的企业层提供专门的工程师时间、对偏门数据库的支持以及专用的业务模块。",
      migrationIntro:
        "从单体遗留系统过渡是现代化过程中风险最高的阶段。我们的团队提供经过实战检验的 ETLA（提取、转换、加载、审计）脚本和手动映射协助。",
      migrationTitle: "白金级 (White-Glove) 迁移服务",
      pricingContent:
        "企业级附加组件的价格是单独评估的，以保证投资回报率 (ROI) 最大化。联系我们的架构团队以获取全面的技术发现会议。",
      pricingTitle: "透明的附加组件定价",
      priorityFeature: "优先访问路线图",
      priorityFeatureDesc:
        "免排队插队。提交关键的功能请求，我们的首席工程师将直接将其集成到核心代码库中。",
      processTitle: "集成路线图",
      securityAudit: "渗透测试协助",
      securityAuditDesc:
        "在技术审计期间，我们直接与您的第三方安全审计员交涉，以立即修补漏洞或证明误报。",
      step1Content: "确定定制集成的确切架构边界和数据合规性要求。",
      step1Title: "1. 架构发现",
      step2Content: "制定明确的服务等级协议和预期的交付节奏。",
      step2Title: "2. SLA 最终确定",
      step3Content: "协作细化领域模型和限界上下文定义。",
      step3Title: "3. 领域建模",
      step4Content: "与您的内部团队并行执行，以加快上市时间。",
      step4Title: "4. 敏捷实施",
      step5Content: "严格的用户验收测试和分阶段的生产发布。",
      step5Title: "5. 分阶段割接协议",
      title: "企业生态系统能力",
      training: "架构孵化",
      trainingDesc: "将我们的高级架构师嵌入到您组织的工作流中，以确保实现最快的技术采纳速度。",
      tblMigHeader1: "服务",
      tblMigHeader2: "描述",
      tblMigHeader3: "交付物",
      tblMigR1C1: "遗留系统迁移",
      tblMigR1C2: "从现有系统迁移到 SCRIPE",
      tblMigR1C3: "数据迁移脚本，并行运行计划",
      tblMigR2C1: "架构审查",
      tblMigR2C2: "评估当前系统，设计迁移方案",
      tblMigR2C3: "架构文档，风险分析报告",
      tblMigR3C1: "性能调优",
      tblMigR3C2: "针对您的特定工作负载进行优化",
      tblMigR3C3: "基准测试，配置建议",
      tblMigR4C1: "安全强化",
      tblMigR4C2: "超越默认设置的附加安全措施",
      tblMigR4C3: "安全报告，实施方案",
      tblMigR5C1: "定制集成",
      tblMigR5C2: "连接到您现有的业务系统",
      tblMigR5C3: "集成适配器，对接文档",
      tblMigR6C1: "数据清洗",
      tblMigR6C2: "在迁移前清洗和规范化遗留数据",
      tblMigR6C3: "数据质量报告，转换脚本",
      tblIntHeader1: "集成项",
      tblIntHeader2: "类型",
      tblIntHeader3: "复杂度",
      tblIntR1C1: "SAP ERP",
      tblIntR1C2: "双向数据同步",
      tblIntR1C3: "高",
      tblIntR2C1: "Salesforce CRM",
      tblIntR2C2: "API 对接集成",
      tblIntR2C3: "中",
      tblIntR3C1: "LDAP / Active Directory",
      tblIntR3C2: "SSO + 用户同步",
      tblIntR3C3: "中",
      tblIntR4C1: "定制 ERP 系统",
      tblIntR4C2: "数据迁移适配器",
      tblIntR4C3: "高",
      tblIntR5C1: "BI 工具 (Power BI, Tableau)",
      tblIntR5C2: "只读数据连接器",
      tblIntR5C3: "低",
      tblIntR6C1: "支付网关",
      tblIntR6C2: "交易处理流",
      tblIntR6C3: "中",
      tblPriceHeader1: "附加组件",
      tblPriceHeader2: "定价模式",
      tblPriceHeader3: "典型范围",
      tblPriceR1C1: "定制模块",
      tblPriceR1C2: "固定价格",
      tblPriceR1C3: "根据复杂度评估而定",
      tblPriceR2C1: "数据迁移",
      tblPriceR2C2: "按工时及材料 (Time & materials)",
      tblPriceR2C3: "在发现阶段确定范围",
      tblPriceR3C1: "系统集成",
      tblPriceR3C2: "按连接器收费",
      tblPriceR3C3: "取决于系统的复杂程度",
      tblPriceR4C1: "培训服务",
      tblPriceR4C2: "按课时 / 套餐",
      tblPriceR4C3: "时间安排灵活",
      tblPriceR5C1: "安全审计",
      tblPriceR5C2: "固定价格",
      tblPriceR5C3: "年度审查或一次性",
    },
    multiTenancy: {
      settEntitlements: "基于版本的计划管理",
      settEntitlementsDesc:
        "通过权益模块将租户分配到版本（计划），支持基于租户的功能覆盖、订阅生命周期管理以及自动配额执行。",
      architectureContent:
        "我们摒弃了危险的“共享数据库、软删除”方法。SCRIPE 实现了严格的、基于鉴别器 (discriminator) 的行级租户系统，由 Entity Framework 的全局查询过滤器在物理上强制执行。开发人员实际上无法查询另一个租户的数据，从根本上消除了 SaaS 中最具破坏性的一类漏洞。",
      architectureTitle: "数学上可证明的隔离",
      description:
        "军用级的企业多租户系统，具有严格的行级隔离、无限的层级继承以及海量的按租户配置覆盖。",
      intro:
        "SCRIPE 专为 B2B 规模而设计。它提供真正的分层多租户架构，允许您自信地在同一个全球部署中托管世界 500 强客户，同时保证绝对的加密隔离。",
      isolationTitle: "隔离担保",
      managementTitle: "分层控制平面",
      settBranding: "深度白标定制 (White-Label)",
      settBrandingDesc: "租户可以透明地注入自定义 CSS 变量、品牌资产和定制邮件域名。",
      settFeatures: "动态功能开关 (Feature Toggles)",
      settFeaturesDesc: "严格在单个租户基础上，细粒度地启用或禁用特定的平台模块。",
      settSecurity: "租户特定的加密配置",
      settSecurityDesc: "允许租户自行决定其密码复杂性、JWT 生命周期和多因素认证要求。",
      settingsContent:
        "多租户远不止数据隔离那么简单。系统中的每个租户都充当一个自治的虚拟应用程序。他们可以独立定义默认语言、功能标志、UI 主题和 Webhook 订阅，而不会影响全局集群。",
      settingsTitle: "自治的租户覆盖配置",
      title: "企业级多租户",
      whiteLabelContent:
        "提供优质的高端定制体验。我们的架构允许每个路由、电子邮件模板和 React 组件无缝适应当前认证租户的具体品牌要求。",
      whiteLabelTitle: "无摩擦的白标能力",
      domainTitle: "自定义域名管理",
      domainIntro:
        "每个租户在创建时自动获得一个品牌子域名（例如 acme.yourplatform.com），并可添加无限自定义域名（例如 app.acme.com），支持完整的 DNS 所有权验证。整个域名系统完全由配置驱动——更改平台域名、CNAME 目标和验证前缀无需任何代码更改。",
      domainAutoSub: "自动生成的子域名",
      domainAutoSubDesc:
        "每个租户在创建时立即获得品牌子域名（{code}.{PlatformDomain}）——始终已验证、始终活跃，无需手动设置。",
      domainCustom: "自定义域名映射",
      domainCustomDesc:
        "租户可以使用自己的域名（例如 app.acme.com）获得完整的白标体验。自定义域名通过 API 或管理面板添加。",
      domainDns: "DNS 所有权验证",
      domainDnsDesc:
        "通过 CNAME 和 TXT DNS 记录进行加密域名所有权验证。防篡改验证令牌确保没有域名可以被劫持。",
      domainConfig: "零代码配置",
      domainConfigDesc:
        "整个域名系统由 appsettings.json 驱动——平台域名、CNAME 目标、验证前缀和令牌格式。无需重新编译。",
      domainPrimary: "主域名选择",
      domainPrimaryDesc:
        "管理员可以将任何已验证的域名指定为主域名。主域名用于规范 URL、电子邮件品牌和 OAuth 重定向解析。",
      domainRebrand: "即时平台品牌重塑",
      domainRebrandDesc:
        "更改 4 个配置值即可对整个平台进行品牌重塑。所有现有租户、DNS 说明和验证令牌自动适配。",
      domainWhiteLabelTitle: "企业白标域名架构",
      domainWhiteLabelContent:
        "自定义域名系统实现真正的 B2B 白标，您的平台客户可以在自己的品牌域名下展示您的 SaaS 产品。管理面板提供引导式 DNS 设置说明和一键复制功能，验证流程为自助服务——无需提交支持工单。",
      domainApiTitle: "域名管理 API",
      domainTip:
        "B2B SaaS 超能力：您的企业客户可以使用自己的自定义域名，将其设为主域名，并在自己的企业品牌下向最终用户展示您的平台——全部通过管理面板自助完成。",
    },
    rolesPermissions: {
      categoriesTitle: "逻辑权限分组",
      description:
        "在数学上严格的、具有层级作用域的基于角色的访问控制 (RBAC) 引擎，专为大规模 B2B 多租户应用程序设计。",
      dynamicReg: "运行时权限发现",
      dynamicRegDesc: "模块在应用程序启动时动态注册其可用权限，无需进行任何硬编码。",
      featuresTitle: "企业级访问控制功能",
      fieldContent:
        "标准系统角色（例如“Tenant_Admin”）已被物理锁定，最终用户无法对其进行删除或灾难性的错误配置，从而确保了核心平台的稳定性。",
      fieldTitle: "不可变的系统角色",
      intro:
        "在 B2B SaaS 环境中，仅凭“管理员”和“用户”这两种角色是完全不够的。SCRIPE 提供了一个高度细粒度、原生多租户的角色与权限引擎，让您的企业客户能将其复杂的公司层级映射到系统的访问控制中。",
      rbacContent:
        "SCRIPE 不再对角色检查进行硬编码（`if (user.Role == 'Admin')`），而是检查细粒度的能力（`[HasPermission(Permissions.Invoices.Delete)]`）。从根本上将您的业务授权逻辑与职位名称不断变化的本质分离开来。",
      rbacTitle: "基于能力 (Capability) 的授权",
      roleCloning: "无摩擦的角色克隆",
      roleCloningDesc: "管理员可以立即克隆复杂的权限矩阵，以快速创建新的部门角色。",
      roleHierarchy: "受作用域限制的继承",
      roleHierarchyDesc: "通过在数学上确保用户不能授予他们不具备的权限，来防止权限提升。",
      tenantScoped: "租户隔离的角色",
      tenantScopedDesc:
        "角色配置专属于每个租户 (Tenant)。租户 A 的“经理”角色所拥有的权限边界与租户 B 的“经理”截然不同。",
      adminGroupsTitle: "基于群组的批量分配",
      adminGroupsContent:
        "不要再逐个向管理员分配角色了。SCRIPE 的“用户组”功能允许您创建命名的群组，为群组分配角色和字段级限制，然后将管理员添加为成员。所有成员在下次登录时将立即继承该群组的权限——并且拥有附加合并和字段级限制传播的所有优势。",
      groupBatchAssign: "即时批量分配",
      groupBatchAssignDesc: "通过命名组的成员身份，同时为数百名管理员分配复杂的角色和限制矩阵。",
      groupRestrictions: "组级字段限制",
      groupRestrictionsDesc:
        "在组级别定义基于权限的字段限制。在登录时，这些限制会与直接的角色限制进行附加合并。",
      groupTenantScoped: "限定租户范围的群组",
      groupTenantScopedDesc:
        "每个组仅属于一个租户。租户管理员管理自己的组，而超级管理员 (SuperAdmins) 则可全局查看所有组。",
      groupAdditiveMerge: "附加安全合并",
      groupAdditiveMergeDesc:
        "群组角色扩展了有效权限。组的限制则与直接限制相叠加——“拒绝 (Deny)”原则永远处于优先地位。",
      title: "细粒度访问控制",
    },
    adminGroups: {
      title: "企业用户组 (User Groups)",
      description: "利用层级化的用户组、附加安全合并以及大规模级联操作，轻松管理数以千计的管理员。",
      intro:
        "为拥有 5000 名用户的企业团队分配个人权限是一场噩梦般的运维灾难。SCRIPE 利用“企业用户组”解决了这一问题。只需定义一次组织结构组——分配其有效角色，锁定其特定的字段限制，然后将用户加入即可。用户在下次登录时，便会立即继承一套牢不可破、经过数学计算的安全矩阵。",
      batchAssignTitle: "即时的团队权限配置",
      batchAssignContent:
        "扩大员工规模，同时不增加 IT 开销。创建一个对账本拥有读写权限的“财务专员”组，在一次批量操作中添加 50 名新员工，便可绝对保证他们拥有相同的安全状态。",
      additiveRestrictionsTitle: "复合的字段级数据脱敏",
      additiveRestrictionsContent:
        "安全性是严格叠加的，且“拒绝 (Deny)”拥有最高优先级。如果高管拥有直接查看员工个人资料的访问权限，但暂时被放置在限制查看社会安全号码 (SSN) 的“外部审计员”组中，那么返回的 API payload 将无缝地把 SSN 字段清空 (nullify)。前端将完美渲染而不会崩溃，并且敏感数据永远不会离开服务器。",
      cascadeTitle: "大规模级联操作",
      cascadeContent:
        "当整个部门被撤销或数据遭到泄露时，管理员没有时间费力地逐个停用用户。SCRIPE 用户组支持即时的、级联的批量操作，强力地将状态变更传播给所有关联的管理员。",
      cascadeDelete: "级联软删除",
      cascadeDeleteDesc: "清除某个用户组时，您可以选择同时即时地软删除每个完全依赖于该组的管理员。",
      cascadeStatus: "级联安全锁定",
      cascadeStatusDesc:
        "将用户组的状态切换为非活动 (Inactive)，并可选择在几毫秒内瘫痪所有相关成员的登录能力。",
      rootProtection: "受保护的帐户免疫权",
      rootProtectionDesc:
        "大规模批量操作是危险的。我们的架构为“受保护的”根管理员 (root administrators) 提供了原生免疫力。即使级联删除波及整个租户，系统最初的拥有者也将完全不受影响。",
      fallbackSafety: "架构安全网",
      fallbackSafetyDesc:
        "SCRIPE 可防止您让管理员变成完全的“孤儿”。当删除一个群组时，系统会安全地接管用户，并将其重新分配给一个不可变的“System_default”角色，确保他们仍然可以进行身份验证，但没有任何破坏性的操作能力。",
      roiTitle: "释放企业投资回报率 (ROI) 与规模化潜力",
      roiContent:
        "停止在构建定制的权限配置管道上浪费昂贵的工程周期。实施 SCRIPE 的原生用户组可以省下数月的架构债务。您将亲眼见证，从扁平的 1:1 角色分配模式过渡后，系统安全态势的显著提升，以及 IT 运营负担削减了超过 90%。",
      complianceGridTitle: "专为组织治理而建",
      auditTrackingTitle: "细粒度审计跟踪",
      auditTrackingDesc:
        "每次修改——添加成员、变更角色模式、调整限制——都会生成不可变的、极其详细的事件日志，并通过 SignalR 即时广播。",
      zeroLatencyTitle: "零延迟安全评估",
      zeroLatencyDesc:
        "群组、角色和限制都被预编译并直接扁平化存储到了 JWT payload 中，使得在运行时的 API 授权检查中实现零数据库查询。",
      tenantIsolationTitle: "绝对的租户隔离",
      tenantIsolationDesc:
        "用户组被严格地绑定在当前解析租户的 ID 上。在 EF Core 全局查询过滤器的保护下，跨租户的组污染在架构上是绝对不可能的。",
      nukePaveTitle: "破坏性同步 (Nuke-and-Pave)",
      nukePaveDesc:
        "前端 UI 传来的大规模数据更新（例如同时更改 50 个角色），将使用强化的“销毁重建 (nuke-and-pave)”算法处理，该算法会在数据提交 (commit) 之前进行严格的状态验证。",
    },
    localizationI18n: {
      bilingualContent:
        "不要构建两个独立的应用程序。SCRIPE 的双语渲染引擎完全基于经过身份验证的用户的有效区域设置状态，即可瞬间交换复杂的 UI 布局、排版系统和数据格式。",
      bilingualTitle: "动态双语渲染",
      competitorRTL: "竞争对手的拼凑方案",
      description:
        "通过深度集成的 7 种语言支持和完美无瑕的从右到左 (RTL) 矩阵渲染，实现不妥协的全球覆盖。",
      frontendContent:
        "Next.js 前端利用高度优化、上下文驱动的翻译 Provider。它动态加载高度分隔的 JSON 字典，确保零延迟的语言切换，而不会造成巨大的代码包体积损失。",
      frontendTitle: "零延迟 UI 翻译",
      intro:
        "全球企业软件必须讲其用户的语言。SCRIPE 提供无与伦比的国际化基础设施，它不仅替换文本字符串——它还从根本上重塑整个应用程序架构，以支持真正的语义本地化。",
      languagesTitle: "立即实现全球覆盖",
      uisRTL: "SCRIPE 标准",
      rtlContent:
        "我们不只是简单地镜像 CSS。阿拉伯语和希伯来语界面经过了结构性的重新架构。我们的原子设计系统智能地反转边距 (margins)、内边距 (paddings)、矢量图标和布局层次结构，以提供让用户愉悦的真正原生 RTL 体验。",
      rtlTitle: "完美无瑕的 RTL 架构矩阵",
      templateBilingual: "上下文感知的模板",
      templateBilingualDesc: "电子邮件和 PDF 导出自动以目标接收者的特定语言和方向布局进行渲染。",
      templatePreview: "实时翻译预览",
      templatePreviewDesc:
        "开发人员可以在本地开发期间使用热模块替换 (HMR) 立即并排可视化 LTR 和 RTL 布局。",
      templatesContent:
        "本地化引擎深入到后端深处。异常消息、验证错误和审计日志在到达 API 表面之前，就会通过专用的 .NET 字符串本地化器进行动态翻译。",
      templatesTitle: "深度的后端本地化",
      title: "全球企业国际化 (i18n)",
    },
  },
};
