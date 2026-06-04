/**
 * Docs features — ZH
 * Auto-filled 264 keys from EN.
 */
export const zh = {
  features: {
    authentication: {
      title: "身份验证 (Authentication)",
      description: "双重验证体系 (管理+用户)、JWT 令牌、2FA 与备用代码，以及租户级的密码策略。",
      intro:
        "SCRIPE 提供安全的认证系统：短期 JWT 访问令牌、刷新令牌轮换、可选的双因素认证 (2FA) 以及全面的速率限制 (限流)。",
      flowTitle: "认证流程",
      jwtTitle: "JWT 令牌配置",
      jwtIntro:
        "系统使用短期访问令牌（15分钟）和长期刷新令牌（7天）。刷新令牌每次使用后都会轮换，以防止重放攻击。",
      dualAuthTitle: "双重身份验证系统 (管理员与用户)",
      dualAuthIntro:
        "管理端和用户端拥有隔离的验证管道：AdminAuthController 和 UserAuthController，签发不同的权限声明。",
      adminEntityTitle: "管理员实体 (安全特性)",
      adminEntityIntro: "Admin 实体具有多个关键安全字段，控制着帐户的行为与保护机制。",
      twoFactorTitle: "双因素身份验证 (2FA)",
      twoFactorIntro:
        "2FA 使用 TOTP 实现。备用代码被哈希并存储。防重放保护确保同一个验证码不能被使用两次。",
      passwordPolicyTitle: "租户级密码策略",
      passwordPolicyIntro:
        "每个租户可通过 TenantSettings 独立配置密码要求（最小长度、大写、数字、特殊字符及过期时间）。",
      endpointsTitle: "身份验证 API 端点",
      endpointsAdminTitle: "管理端 Auth 端点",
      endpointsUserTitle: "用户端 Auth 端点",
      rateLimitingTitle: "限流 (Rate Limiting)",
      rateLimitingIntro: "身份验证端点受到多重速率限制策略的保护，可防止暴力破解和滥用。",
      lockoutWarning: "连续 5 次登录失败后，帐户将被锁定 15 分钟。管理员可以手动解除锁定。",
    },
    multiTenancy: {
      title: "多租户 (Multi-Tenancy)",
      description: "行级数据隔离、层次化租户、每租户独立设置、品牌定制和数据作用域架构。",
      intro:
        "SCRIPE 使用 EF Core 全局查询过滤器实现完全的行级数据隔离，支持多租户。确保租户之间的数据完全隔离。",
      architectureTitle: "架构",
      featuresTitle: "租户特性",
      featureIsolation: "数据隔离",
      featureIsolationDesc:
        "基于 EF Core 全局过滤器的行级隔离，自动包含 WHERE TenantId = @CurrentTenant。",
      featureSettings: "独立配置",
      featureSettingsDesc: "配额、安全策略、审计设置和品牌配置均独立可控。",
      featureBranding: "品牌定制",
      featureBrandingDesc: "为每个租户配置独立的 Logo、主色调和公司名称。",
      featureUserScoping: "用户隔离",
      featureUserScopingDesc: "管理员只能查看和管理自己租户内的用户。",
      featureRoleScoping: "角色隔离",
      featureRoleScopingDesc: "角色限定于租户级别，互不干扰。",
      featureDataScoping: "数据隔离",
      featureDataScopingDesc: "所有业务数据自动限制在当前租户范围内。",
      hierarchyTitle: "租户层级树",
      hierarchyIntro:
        "租户通过 ParentTenantId 形成树状结构。包含层级深度和路径，支持总公司与分支机构的管理。",
      settingsTitle: "租户设置 (Tenant Settings)",
      settingsIntro:
        "每个租户有对应的 1:1 TenantSettings 实体，分 4 个配置组。值为 -1 代表无限制。",
      quotaGroup: "配额设置",
      securityGroup: "安全策略",
      auditGroup: "审计配置",
      brandingGroup: "品牌定制",
      autoRoleTitle: "自动角色创建",
      autoRoleIntro: "创建新租户时，系统会自动生成 Super Admin 和 Default 两个基础角色。",
      cascadeDeleteTitle: "级联删除保护",
      cascadeDeleteIntro:
        "提供端点以计算受删除租户影响的子级和相关数据数量，删除操作受到严格保护和审计。",
      permissionInheritanceTitle: "权限继承",
      permissionInheritanceIntro:
        "创建子租户时，父租户只能授予其已拥有的权限。子级权限无法超越父级。",
      endpointsTitle: "租户 API 端点",
      endpointsCrudTitle: "CRUD 端点",
      endpointsHierarchyTitle: "层级管理端点",
      endpointsSettingsTitle: "设置端点",
      endpointsPermissionsTitle: "权限端点",
      endpointsDrilldownTitle: "下钻分析端点",
      logoTip: "租户的 Logo 会通过静态文件中间件在 /storage/tenants/{tenantId}/logo.{ext} 提供。",
      domainTitle: "域名管理",
      domainIntro:
        "每个租户可以拥有多个域名——一个在创建租户时自动生成的子域名，以及管理员添加的可选自定义域名。系统支持通过 DNS 进行域名验证，以证明自定义域名的所有权后才激活。所有域名相关配置完全外部化到 appsettings.json 中，实现无缝品牌重塑和多部署设置。",
      domainTypesTitle: "域名类型",
      domainArchTitle: "域名解析架构",
      domainArchIntro:
        "当请求到达时，系统通过在 TenantDomain 表中查找主机名来解析租户。自动生成的域名（例如 sofa.scripe.com）始终已验证并立即解析。自定义域名必须先通过 DNS 验证。在未配置 DNS 的开发环境中，可使用 ?code= 查询参数作为回退机制。",
      domainDnsTitle: "DNS 验证流程",
      domainDnsIntro:
        "自定义域名需要 DNS 验证以证明所有权。当管理员添加自定义域名时，系统会生成唯一的验证令牌。管理员随后配置两条 DNS 记录：一条 CNAME 记录将域名指向平台的 CnameTarget，以及一条 TXT 记录位于 {VerificationPrefix}.{domain}，包含验证令牌。配置完成后，点击'验证'会触发 DNS 查询以确认两条记录均存在。",
      domainDnsNote:
        "DNS 验证目前是 UI 驱动的流程，管理员点击'验证'来触发检查。后端已预留接口，可与完整的 DNS 解析集成。自动生成的域名完全跳过验证——它们始终受信任。",
      domainConfigTitle: "可配置的平台域名",
      domainConfigIntro:
        "每个域名相关的值都可通过 appsettings.json 中的 Tenancy 部分进行配置。这意味着您可以对整个平台进行品牌重塑——更改基础域名、CNAME 目标、验证前缀和令牌前缀——只需编辑一个配置块。无需修改代码。后端通过 IOptions<T> 注入 TenancySettings，前端从 GET /domains API 响应中获取 CNAME 目标和验证前缀。",
      domainConfigTip:
        "若要部署到完全不同的域名（例如 myplatform.io 而不是 scripe.com），只需更新 appsettings.json 中的 4 个值。所有自动生成的子域名、DNS 指令和验证令牌将自动使用新值。",
      domainEndpointsTitle: "域名 API 端点",
    },
    rolePermissions: {
      title: "角色与权限 (RBAC)",
      description: "包含作用域覆盖、字段级限制、防权限提升和租户级角色的 RBAC 系统。",
      intro:
        "SCRIPE 实施全面的基于角色的访问控制 (RBAC) 系统。权限在服务器端被缓存以保障极高的性能。",
      hierarchyTitle: "权限层级",
      systemTitle: "权限系统",
      systemIntro: "权限被组织成不同的类别，命名约定遵循：{资源}.{动作}。",
      scopeOverrideTitle: "作用域覆盖 (数据访问控制)",
      scopeOverrideIntro:
        "RolePermission 可以覆盖权限的默认作用域，从而实现对特定角色数据访问级别的细粒度控制。",
      authPipelineTitle: "授权管道",
      authPipelineIntro: "SCRIPE 使用 4 个属性组合的安全系统，动态生成 ASP.NET Core 授权策略。",
      restrictedFieldsTitle: "字段级限制",
      restrictedFieldsIntro:
        "除了标准 CRUD，角色可以配置受限字段 (RestrictedFields)。特定字段（如薪水）将被 API 自动置空隐藏。",
      cloneRoleTitle: "克隆角色 (防止权限提升)",
      cloneRoleIntro:
        "被克隆的角色只能获得操作者本人所拥有的权限，防止低权限管理员通过克隆获取高权限。",
      rolePropertiesTitle: "角色实体属性",
      rolePropertiesIntro: "每个角色包含若干控制其行为和保护级别的系统标志。",
      endpointsTitle: "角色 API 端点",
      endpointsMyTenantTitle: "我的租户相关端点",
      endpointsPermissionsTitle: "权限字典端点",
      tenantScopingNote: "角色自动限定在当前用户的租户范围内。",
      userGroupsTitle: "用户组 (User Groups)",
      userGroupsIntro:
        "用户组支持批量为多个管理员分配角色和字段限制。用户登录时，合并其直接角色和用户组角色。",
      userGroupEndpointsTitle: "用户组 API 端点",
      userGroupsNote:
        "用户组是叠加的 (Additive) —— 管理员最终的权限是其直接角色与用户组角色的并集 (UNION)。",
    },
    auditSystem: {
      title: "审计系统 (Audit System)",
      description: "4 源管道、35+ 种事件类型、7 种守护事件、实时 SignalR 广播以及 CSV/PDF 导出。",
      intro:
        "SCRIPE 通过 AstraFlow mediator 行为、EF Core 拦截器、中间件和安全服务显式调用来记录所有重大操作。",
      architectureTitle: "审计架构",
      eventTypesTitle: "事件类型 (35+ 类别)",
      authEventsTitle: "身份验证事件",
      rbacEventsTitle: "权限控制事件",
      twoFactorEventsTitle: "2FA 相关事件",
      sessionEventsTitle: "会话事件",
      adminEventsTitle: "管理员管理事件",
      bulkEventsTitle: "批量操作事件",
      tenantEventsTitle: "租户事件",
      guardianTitle: "守护者 (Guardian) 保护事件",
      guardianIntro:
        "当系统拦截并阻止危险操作时（例如：试图删除租户下的最后一个超级管理员），会生成此类审计记录。",
      serviceMethodsTitle: "AuditService 方法",
      serviceMethodsIntro: "IAuditService 暴露了异步的日志记录方法，不阻塞主请求管道。",
      realTimeTitle: "实时广播",
      realTimeIntro: "每一个审计事件都通过 SignalR 实时广播。客户端按租户分组接收事件。",
      exportTitle: "审计数据导出",
      exportIntro: "支持将筛选后的审计日志导出为 CSV、Excel 和 PDF 格式。",
      endpointsTitle: "审计 API 端点",
      retentionTip: "审计日志保留期可通过 TenantSettings 配置，Hangfire 会自动定期清理过期的日志。",
    },
    notificationSystem: {
      title: "通知系统",
      description: "基于 SignalR 的实时通知推送，具备自动加入分组、未读数量跟踪和分页历史记录。",
      architectureTitle: "通知架构",
      architectureIntro: "通知系统持久化数据的同时，通过 NotificationHub 推送到用户浏览器。",
      hubTitle: "NotificationHub",
      hubIntro: "在用户连接时自动将其加入个人组 (user_{userId})，并立即推送未读数量。",
      autoJoinTitle: "自动加入 (Auto-Join) 模式",
      clientInterfaceTitle: "Hub 客户端接口",
      serviceTitle: "NotificationService 方法",
      endpointsTitle: "通知 API 端点",
    },
    emailSystem: {
      title: "邮件系统",
      description: "可插拔的邮件递送管道，支持队列策略、后台处理和 HTML 消毒。",
      architectureTitle: "邮件管道架构",
      architectureIntro: "架构流程：Controller -> EmailService -> 队列 -> Sender -> SMTP。",
      endpointsTitle: "邮件 API 端点",
      queueTitle: "队列实现 (Queues)",
      queueIntro:
        "开发环境使用 InMemoryQueue 立即发送，生产环境使用 HangfireQueue 进行可靠的后台队列处理。",
      senderTitle: "发送策略 (Senders)",
      senderIntro: "SmtpSender 负责真实投递，ConsoleSender 用于开发时在控制台打印邮件。",
      backgroundTitle: "后台工作者模式",
      backgroundIntro: "HangfireQueue 为每封邮件创建后台 Job 异步处理渲染与发送。",
      errorTitle: "错误处理与消毒 (Sanitization)",
      errorIntro:
        "发送前对邮件进行 XSS 消毒处理，失败的邮件会通过 Hangfire 内置的指数退避重试机制重新发送。",
    },
    webhookSystem: {
      title: "Webhook 系统",
      description: "事件驱动的 Webhook，具有 HMAC 密钥轮换、租户层级订阅、熔断器和投递日志。",
      architectureTitle: "Webhook 架构",
      architectureIntro: "每个请求负载均使用 HMAC-SHA256 签名。投递失败将指数退避重试。",
      entityTitle: "WebhookSubscription 实体",
      hmacTitle: "HMAC 签名",
      hmacIntro: "接收方可比对 X-Webhook-Signature 头部以验证负载真伪。",
      secretRotationTitle: "密钥轮换 (24 小时宽限期)",
      secretRotationIntro: "生成新密钥时，旧密钥在 24 小时内依然有效，防止迁移期间漏掉消息。",
      includeChildrenTitle: "租户层级订阅",
      includeChildrenIntro: "父级公司可开启此选项以监控其所有下属分支机构的事件。",
      circuitBreakerTitle: "熔断器 (自动禁用)",
      circuitBreakerIntro: "连续失败达到阈值时，自动将订阅状态设为禁用以保护系统性能。",
      retryTitle: "重试策略",
      retryIntro: "失败的 Webhook 投递采用指数退避 (Exponential backoff) 进行重试。",
      deliveryLogsTitle: "投递日志",
      deliveryLogsIntro: "记录每次投递的 HTTP 状态码、响应体、持续时间和尝试次数。",
      eventsTitle: "Webhook 事件类型",
      endpointsTitle: "Webhook API 端点",
      endpointsManagementTitle: "订阅管理",
      endpointsOperationsTitle: "运维与监控",
    },
    menuSystem: {
      title: "菜单系统",
      description: "支持权限过滤、租户作用域、角色可见性和拖拽重排序的动态菜单树。",
      architectureTitle: "菜单架构",
      architectureIntro: "菜单系统使用自引用的树状结构，经过 6 个步骤的管道过滤后才传递给前端。",
      entityTitle: "MenuItem 实体",
      endpointsTitle: "菜单 API 端点",
      filteringTitle: "菜单过滤管道",
      filteringIntro: "请求 /menus/my 时，系统会顺序应用 6 个过滤器确保管理员仅看到授权的菜单。",
      overrideTitle: "覆盖系统 (Override)",
      overrideNote: "允许用户和租户覆盖菜单的名称和可见性。用户的覆盖优先级高于租户。",
      reorderTitle: "拖拽重排序 (Drag-Drop)",
    },
    recycleBin: {
      title: "回收站 (Recycle Bin)",
      description: "软删除管理、级联恢复、批量操作及永久清理功能。",
      softDeleteTitle: "软删除工作原理",
      softDeleteIntro: "IsDeleted 设置为 true，记录在数据库中被 EF Core 全局查询过滤器隐藏。",
      ignoreFiltersTitle: "IgnoreQueryFilters 模式",
      ignoreFiltersWarning:
        "调用该方法会绕过包括租户隔离在内的所有过滤器，请务必手动添加租户约束防止越权数据泄漏。",
      cascadeTitle: "级联恢复",
      cascadeIntro:
        "恢复租户时，需恢复其附属的所有实体。SCRIPE 使用 ExecuteUpdateAsync 进行批量恢复操作。",
      executeUpdateTitle: "ExecuteUpdateAsync vs 传统 EF",
      interceptorNote:
        "该方法绕过了 EF Core 的更改跟踪器，因此系统会通过 Controller 记录手动的审计条目。",
      endpointsTitle: "回收站端点",
      purgeVsRestoreTitle: "清理 (Purge) vs 恢复 (Restore)",
      purgeWarning:
        "清理 (Purge) 对应硬删除 (DELETE)，是不可逆的破坏性操作，主要用于 GDPR 隐私合规。",
    },
    userManagement: {
      title: "用户管理",
      description: "完整的管理员/用户生命周期管理、批量操作、身份模拟和保护规则。",
      adminVsUserTitle: "Admin 与 User 区分",
      adminVsUserIntro:
        "管理员 (Admin) 登录后台管理平台，而普通用户 (User) 仅限于自助服务和客户端应用。",
      crudTitle: "CRUD 端点",
      accountOpsTitle: "账号状态操作",
      roleMgmtTitle: "角色管理端点",
      bulkOpsTitle: "批量操作 (Bulk)",
      enterpriseOpsTitle: "企业级操作",
      protectedTitle: "受保护管理员规则",
      protectedIntro:
        "租户的创建者（Owner）被标记为受保护的管理员，防止发生被意外删除或停用的惨剧。",
      nukePaveTitle: "Nuke & Pave (全量替换) 模式",
      nukePaveTip:
        "在分配角色时使用同步覆盖 (PUT /sync)，而不是逐个添加/移除，以确保数据库与 UI 复选框状态绝对一致。",
    },
    fileUpload: {
      title: "文件上传系统",
      description: "图片和文档的双重上传管道，支持验证、处理和基于租户的作用域存储。",
      architectureTitle: "上传架构",
      architectureIntro:
        "拆分为 ImageUploadController (图片处理、裁剪) 和 UploadsController (通用附件)。",
      imagePipelineTitle: "图片上传管道",
      validationTitle: "文件验证规则",
      generalTitle: "通用文件上传",
      servingTitle: "静态文件服务",
      servingNote:
        "上传的文件通过 ASP.NET Core 的静态文件中间件提供服务。未知文件类型会返回 application/octet-stream 防止被恶意执行。",
      tenantScopedTitle: "租户作用域存储",
    },
    downloadExport: {
      title: "下载与导出系统",
      description: "认证下载与基于会话的下载，支持 Range 断点续传、ETag 缓存及目录穿越防御。",
      architectureTitle: "下载架构",
      architectureIntro: "支持两种模式：需要 JWT 的认证下载，和生成临时无认证 URL 的会话下载。",
      endpointsTitle: "下载端点",
      resumableTitle: "可恢复下载 (Range Headers)",
      resumableIntro: "客户端可请求文件的特定字节范围，服务器返回 206 Partial Content。",
      etagTitle: "ETag 缓存",
      etagNote: "通过比对 ETag 避免重复传输相同的文件，节省带宽资源 (返回 304 Not Modified)。",
      sessionTitle: "基于会话 (Session) 的下载",
      sessionIntro: "为需要分享的外部人员生成具有过期时间的临时下载链接。",
      sessionWarning: "下载会话一旦过期将返回 404，无法延期，只能创建新会话。",
      pathTraversalTitle: "目录穿越防御",
      pathTraversalNote: "过滤 '..' 序列，验证解析路径是否被限制在规定的存储目录范围内。",
      streamConfigTitle: "文件流配置 (FileStream)",
    },
    messageTemplates: {
      title: "消息模板 (Message Templates)",
      description: "基于 Scriban 引擎的双语消息模板，支持预览、内置模板及占位符。",
      architectureTitle: "模板架构",
      architectureIntro:
        "为电子邮件、通知和 Webhook 的内容管理提供集中控制。使用 Scriban (类似于 Liquid) 支持变量替换和循环。",
      syntaxTitle: "Scriban 语法",
      builtInTitle: "系统内置模板",
      entityTitle: "MessageTemplate 实体",
      rendererTitle: "模板渲染器",
      endpointsTitle: "模板 API 端点",
      previewTitle: "预览功能",
      previewIntro: "允许管理员在正式发送前通过注入模拟数据预览邮件或通知的排版效果。",
    },
    userGroups: {
      title: "用户组 (User Groups)",
      description: "基于用户组的角色与限制分配，支持租户作用域及登录时的增量叠加。",
      intro: "用户组提供了一种可扩展的方式，可为大量管理员批量分配角色和字段限制，无需逐一分配。",
      architectureTitle: "架构",
      architectureIntro:
        "每个 UserGroup 属于单个租户，包含三组关系：成员、角色、字段限制。实现软删除和自动租户过滤。",
      domainModelTitle: "领域模型 (Domain Model)",
      domainModelIntro: "为 Identity 领域增加了四个实体来管理多对多的成员和权限映射。",
      howItWorksTitle: "登录时的权限叠加原理",
      howItWorksIntro:
        "登录时，系统会获取用户直接分配的角色与所有所属群组的角色，对其进行并集 (UNION) 计算。限制条件同理。",
      mergeNote:
        "用户组的权限和限制是“叠加的” (Additive)，只能增加限制或增加角色，永远无法移除直接授予的权限 (Deny Wins)。",
      memberManagementTitle: "成员管理",
      memberManagementIntro:
        "添加成员的 API 是幂等的 (Idempotent)；移除成员不会影响其直接拥有的角色。",
      roleAssignmentTitle: "角色分配",
      roleAssignmentIntro:
        "使用 Nuke-and-pave 模式（整体替换）确保数据库始终与 UI 复选框状态同步。",
      restrictionsTitle: "字段限制",
      restrictionsIntro:
        "如果任何群组或角色来源对某个字段进行了限制，则该字段在有效负载中将被隐藏。",
      cascadeTitle: "级联操作",
      cascadeIntro:
        "删除用户组时，可以选定触发级联操作，将排他地仅属于该组的管理员一同软删除或停用。",
      cascadeNote: "级联操作会自动跳过被保护的管理员 (如租户创建者)，防止意外删除企业的超级账户。",
      endpointsTitle: "API 端点 (12个)",
      frontendTitle: "前端模块",
      frontendIntro: "详情页分为 3 个标签页独立管理成员、角色和权限限制。",
      securityNote: "操作受限，超级管理员可以跨租户查看组，租户管理员仅限本地。",
    },
    ssoOauth: {
      title: "SSO 与 OAuth 服务器 (Keycloak 的企业级替代方案)",
      description:
        "企业级身份验证服务器，能够完全取代 Keycloak、Okta 和 Auth0。具备原生 OIDC 身份提供商 (IdP)、OAuth 应用程序注册、强制 PKCE 和完全隔离的租户联邦功能。",
      intro:
        "SCRIPE 不仅仅是一个应用程序系统，它是一个基于 OpenIddict 构建的“企业身份与访问管理 (IAM) 服务器”。其运作方式等同于 Keycloak —— 既可作为 OIDC 的依赖方 (Client)，也可作为主动式的 OAuth2/OIDC 授权服务器。租户可以向外部 (如 Azure AD/Google) 验证，也可以允许第三方系统向 SCRIPE 内部验证。",
      overviewTitle: "企业级 IAM 功能",
      feat1Title: "联邦身份提供商 (IdP)",
      feat1Desc:
        "将外部 OIDC/OAuth2 身份提供商立即绑定到特定租户。针对 Azure AD、Google、Okta、Auth0、AWS Cognito 或任何兼容 OIDC 的系统实现零代码集成。",
      feat2Title: "SCRIPE 作为服务器 (OAuth Apps)",
      feat2Desc:
        "取代 Keycloak。将第三方业务系统直接注册到 SCRIPE。生成客户端 ID 与密钥，控制访问权限范围，颁发由 SCRIPE 身份存储支持的企业级 JWT。",
      feat3Title: "严格的 PKCE 与安全性",
      feat3Desc:
        "彻底消除隐式流 (Implicit Flow)。无论是内部还是外部，所有验证均严格通过授权码流上的安全交换秘钥原像 (PKCE) 强制执行，防止机密泄露到浏览器。",
      feat4Title: "多租户 IAM 隔离",
      feat4Desc:
        "每个租户都是其自身隔离的 IAM 领域 (Realm)。租户自主管理其外部 SSO 身份提供商，并向自己的 OAuth 应用程序颁发凭据，完全不影响全局根系统架构。",
      configTitle: "IAM 配置指南",
      configContent: "将 SCRIPE 配置为您的主要验证网关：",
      config1Title: "1. 绑定外部身份提供商",
      config1Content:
        "导航到 /settings/identity-providers。输入从 Azure AD 或 Google 获取的 Discovery/Authority URL、客户端 ID 和密钥。SCRIPE 会自动协商 OIDC 配置和元数据。",
      config2Title: "2. 自动声明映射",
      config2Content:
        "配置请求的作用域 (openid, profile, email)。SCRIPE 自动将外部 JWT 声明映射到内部的管理员 / 用户配置文件，无需手动数据输入。",
      config3Title: "3. 实施 IAM 策略",
      config3Content:
        "决定身份提供商仅适用于后台管理员还是前台用户。外部身份的类型被严格控制，可从物理层面防止普通外部用户越权获得后台管理员会话。",
      config4Title: "4. 注册第三方应用程序",
      config4Content:
        "导航到 /settings/oauth-apps，使 SCRIPE 充当外部软件 (如移动 APP 或独立 CRM) 的 SSO 提供商。支持公共 (SPA) 与机密 (后端) 配置文件。",
      config5Title: "5. Jwks Uri 与 Discovery",
      config5Content:
        "外部应用程序只需要将其验证权威来源 (Authority) 指向 `https://your-scripe-instance.com`。SCRIPE 会自动支持 `/.well-known/openid-configuration` API。",
      managementTitle: "IAM 控制中心",
      managementContent:
        "SCRIPE 在系统设置中提供专门的 IAM 控制中心模块，用于统一配置您的外部 OIDC 客户端聚合以及 OAuth 授权服务器。",
      loginFlowTitle: "OIDC 架构深度解析",
      loginFlowContent:
        "当您通过 Azure AD 登录时：SCRIPE 充当客户端。它将用户重定向到 Azure 验证，并接受回调验证外部 JWT，然后【颁发其自己内部生成的 JWT】，彻底将内部授权与外部依赖解耦。",
      scopingTitle: "领域 (租户) 分区",
      scopingContent:
        "SCRIPE 通过强大的租户系统对标 Keycloak 的 Realm 概念。无论是 Identity Providers 还是注册的应用都和 TenantId 严格绑定。主平台超级管理员可以通过“进入租户世界”无缝管理所有 Realm。",
      scopingTip:
        "不像基础的 SaaS 产品，SCRIPE 决不会将多租户身份设置进行杂糅。如果 A 租户绑定了跨国公司的 Azure AD 节点，B 租户是完全看不见该底层架构的。",
    },
    loginCustomizer: {
      title: "登录页定制工作室",
      description:
        "可视化登录页面自定义，支持22种布局、设计令牌、叠加/模糊控制、明暗主题、WCAG AA 无障碍套件以及沙盒化实时预览 — 完全零代码。",
      intro:
        "SCRIPE 登录定制工作室是一个强大的可视化编辑器，允许租户管理员在不编写任何代码的情况下完全自定义登录页面体验。工作室提供分屏界面，左侧为配置面板，右侧为沙盒化 iframe 预览，可在进行更改时提供实时视觉反馈。工作室包含 8 个配置选项卡：外观、颜色、排版、背景、叠加、品牌面板、无障碍和高级选项。所有修改基于草稿，需要明确发布才能上线。",
      studioTitle: "工作室概览",
      studioIntro:
        "定制工作室采用分屏架构：左侧面板包含 8 个选项卡式配置区域（外观、颜色、排版、背景、叠加、品牌面板、无障碍、高级选项），右侧面板提供沙盒化 iframe，通过 postMessage 进行实时 CSS 变量注入来渲染登录页面。设备切换按钮允许在桌面、平板和移动断点上预览。",
      studioTip:
        "所有工作室更改都在草稿模式下运行。在您明确点击发布之前，线上登录页面永远不会受到影响。您可以安全地尝试任何设置组合。",
      layoutsTitle: "22种登录布局",
      layoutsIntro:
        "SCRIPE 配备22种生产就绪的登录布局，分为四个层级：T1 分屏布局（6种）在登录表单旁边提供专用品牌面板，T2 全页布局（8种）利用整个视口创建沉浸式登录体验，T3 居中布局（4种）提供紧凑的卡片式设计，T4 特殊布局（4种）提供电影级和艺术化处理。每种布局都支持独立的背景、叠加和无障碍控制。",
      layoutsNote:
        "分屏布局渲染 LoginBranding 组件，在品牌面板上具有独立的叠加/模糊控制。全页布局将背景和叠加应用于整个包装容器。居中和特殊布局各有自己的渲染策略。切换布局时保留所有配置 —— 仅渲染结构发生变化。",
      tokensTitle: "设计令牌管道",
      tokensIntro:
        "自定义系统基于全面的设计令牌管道构建。存储为 JSON 的租户设置被转换为语义设计令牌，然后作为 CSS 自定义属性发出并注入到实时 DOM 中。这种架构确保了所有 22 种布局的一致性和类型安全的样式设置，包括 23+ 条无障碍特定的 CSS 规则。",
      bgOverlayTitle: "背景与叠加控制",
      bgOverlayIntro:
        "背景和叠加控制根据所选布局类型进行适配。全页布局将背景和叠加应用于包装容器，而分屏布局将背景限制在品牌面板内，并具有独立的表单区域叠加。叠加控制包括颜色、不透明度（0–100%）和模糊度（0–20px）。",
      bgOverlayWarning:
        "对于分屏布局，叠加分别限定在表单区域和品牌面板上。值为0的 CSS 变量（如不透明度）可正确发出 —— 系统使用 != null 检查而非真值检查，以防止丢弃有效的零值。",
      themeTitle: "明暗主题架构",
      themeIntro:
        "登录定制器支持明暗模式的独立配置。启用暗模式时，会为暗色面板发出单独的 CSS 变量集 (--login-dark-*)，控制表单背景、文本颜色、输入样式和叠加。外观面板中的暗模式切换允许完全控制暗主题而不影响亮色配置。",
      brandingTitle: "品牌面板",
      brandingIntro:
        "品牌面板（在分屏布局中可见）为登录页面的品牌侧提供专用控制。支持自定义标志、公司名称、标题文本、副标题以及独立的背景/叠加控制。品牌面板叠加使用自己的 CSS 变量集 (--login-panel-overlay-*) 进行与表单区域分离的精细控制。",
      draftTitle: "草稿 / 发布 / 回滚",
      draftIntro:
        "工作室实现了安全的 草稿 → 预览 → 发布 工作流程，使用乐观并发控制。所有更改保存为草稿 (DraftBrandingJson)，直到管理员明确发布。发布会递增 SettingsVersion 计数器 —— 其他管理员的并发发布将被拒绝（409 冲突）。任何已发布的版本都可以从审计日志快照中回滚。",
      draftNote:
        "乐观并发控制可防止同时编辑造成的数据丢失。如果其他管理员在您编辑时发布，您的发布将被拒绝（409），您需要刷新并合并更改。",
      safeModeTitle: "安全模式",
      safeModeIntro:
        "安全模式是一种紧急回退机制，绕过所有租户品牌自定义并恢复登录页面的平台默认值。当 TenantSettings 中的 IsSafeMode 设为 true 时，无论任何自定义配置，登录页面都会以 SCRIPE 默认主题渲染。这确保了即使品牌配置损坏也能保证正常的登录体验。",
      accessTitle: "访问控制",
      accessIntro:
        "登录自定义遵循 SCRIPE 基于角色的访问控制模型。打开定制工作室需要 branding.manage 权限。拥有相应权限的系统管理员和租户管理员可以编辑和发布。普通管理员只能切换个人偏好设置（如明暗模式）。安全模式的激活仅限系统管理员。",
      a11yTitle: "无障碍套件 (WCAG AA)",
      a11yIntro:
        "无障碍选项卡提供了一个全面的套件，包含 8 个类别中的 32 项设置，旨在使登录页面完全符合 WCAG AA 标准。所有设置存储在 StudioDraft 实体中，并通过 CSS 令牌管道注入到实时页面。该套件包括实时验证、一键式配置文件和自动化 WCAG 审计引擎。",
      a11yCategoriesTitle: "8 个设置类别",
      a11yCat1: "焦点指示器 —— 自定义焦点环颜色、宽度（1–5px）、偏移量和所有交互元素的样式。",
      a11yCat2: "高对比度 —— 切换高对比度模式，具有可配置的文本/背景对比度覆盖。",
      a11yCat3: "文本可读性 —— 字号缩放（80–200%）、行高调整（1.0–2.5）、字间距和词间距控制。",
      a11yCat4: "动效与动画 —— 遵循 prefers-reduced-motion、控制过渡持续时间、独立禁用装饰性动画。",
      a11yCat5: "触摸目标 —— 强制按钮和输入的最小高度（WCAG 最低 44px）、调整交互元素的内边距。",
      a11yCat6: "颜色与视觉 —— 色盲安全模式、自定义链接颜色、链接始终显示下划线和图标标注。",
      a11yCat7: "屏幕阅读器 —— ARIA 地标注入、实时区域播报、跳转导航链接和表单标签增强。",
      a11yCat8: "阅读辅助 —— 可配置的阅读指南叠加、行高亮、文本遮罩和阅读障碍友好字体切换。",
      a11yProfilesTitle: "6 个一键式配置文件",
      a11yProfilesIntro:
        "预配置的无障碍配置文件可即时批量应用设置。每个配置文件针对特定用户需求，应用后可进一步自定义。",
      a11yProfile1:
        "WCAG AA 基线 —— 应用最低 WCAG AA 要求：4.5:1 对比度、44px 触摸目标、可见焦点环。",
      a11yProfile2: "低视力 —— 大字体 (140%)、高对比度、粗体文本、额外间距、粗焦点指示器。",
      a11yProfile3: "运动障碍 —— 加大触摸目标 (56px)、额外内边距、无动画、针对键盘优化的导航。",
      a11yProfile4: "认知障碍 —— 简化布局、减少动效、增大间距、阅读指南、清晰焦点指示器。",
      a11yProfile5:
        "屏幕阅读器优化 —— 增强的 ARIA 地标、实时区域、表单标签、跳转导航链接、语义化标题结构。",
      a11yProfile6: "恢复默认值 —— 将所有无障碍设置恢复为 WCAG AA 默认值。",
      a11yAuditTitle: "实时 WCAG 审计引擎",
      a11yAuditIntro:
        "useAccessibilityChecker hook 对当前草稿设置实时运行 4 项自动化检查：对比度验证（文本 4.5:1、大文本 3:1）、触摸目标尺寸（最小 44×44px）、叠加可读性（检查叠加不透明度是否遮挡内容）和动效设置（验证 reduced-motion 配置）。每项检查返回通过/警告/失败的严重等级，并附带可操作的消息。",
      a11yAutoFixTitle: "自动修复机制",
      a11yAutoFixIntro:
        "审计引擎包含 autoFix 功能，可自动解决未通过的检查，将草稿设置调整为符合 WCAG AA。例如，如果对比度失败，它会调整文本颜色；如果触摸目标太小，它会将按钮高度增加到 44px。",
      a11yCssTitle: "CSS 注入管道",
      a11yCssIntro:
        "useLoginBrandingTokens hook 通过单个 <style> 标签注入发出 23+ 条无障碍特定的 CSS 规则。规则包括焦点环样式 (--login-focus-ring-*)、高对比度覆盖、字体缩放、触摸目标最小值、阅读指南叠加和 reduced-motion 媒体查询覆盖。所有无障碍 CSS 正确级联覆盖基础品牌样式。",
      a11yPreviewTitle: "预览集成",
      a11yPreviewIntro:
        "LoginPreviewShell 实时显示无障碍功能：阅读指南/遮罩叠加在预览 iframe 中可视化渲染，无障碍徽章显示活跃的无障碍功能计数。预览完全与认证系统隔离。",
      archTitle: "模块架构",
      archIntro:
        "登录定制器遵循 SCRIPE 标准的模块化清洁架构，包含领域层、数据层和展示层。展示层包含 StylePanel 组件（配置 UI）、LoginPreviewShell（iframe 管理）、AccessibilityPanel（WCAG 设置和配置文件）以及 useLoginBrandingTokens hook（令牌到 CSS 管道）。组件被提取到模块级别以防止 React 重新渲染导致的焦点丢失问题。",
      archTip:
        "BgControls 和 PresetDots 组件被故意定义在模块级别（而非内联），以防止 React 在重新渲染期间卸载/重新挂载输入字段，否则会在每次按键时导致焦点丢失。",
      relatedTitle: "Related Features",
      relatedIntro:
        "The Login Customizer Studio is part of a larger customization ecosystem. See these companion features for complete coverage:",
      relatedMarketplace:
        "Theme Marketplace — Browse, preview, and apply 40 premium branding packages with per-page overrides.",
      relatedMultiPage:
        "Multi-Page Branding — Configure independent branding for Login, Forgot Password, and Reset Password pages.",
      relatedBuilder:
        "Login Page Builder — Drag-and-drop visual canvas for building custom login page layouts with 14 component types.",
    },
    dashboardBuilder: {
      title: "仪表盘构建器",
      description:
        "通过4层合并引擎实现服务器同步的管理员偏好设置，支持61项可配置参数、FOUC防护、409冲突解决及基于版本的功能控制。",
      intro:
        "仪表盘构建器是 SCRIPE 的企业级管理员偏好设置系统，在浏览器和服务器之间同步61项可配置的仪表盘参数。该系统采用4层合并引擎（平台 → 租户 → 管理员 → 运行时）进行配置解析，支持租户级覆盖控制、通过 AdminSettingsJson 实现跨设备持久化，以及5项边界情况防护。",
      overviewTitle: "系统概览",
      overviewIntro: "仪表盘构建器提供完整的偏好设置生命周期——从缓存即时渲染到后台服务器对账。",
      overviewTip: "页面加载时立即从 localStorage 缓存渲染设置。服务器请求在后台进行。",
      mergeEngineTitle: "4层合并引擎",
      mergeEngineIntro:
        "设置遵循严格的4层优先级链。每一层可以覆盖前一层，并可选地在租户级别进行基于路径的访问控制。",
      mergeEngineNote: "第2层（版本限制）由服务端通过 FeatureCheckBehavior 管道处理。",
      syncHookTitle: "服务器同步 Hook",
      syncHookIntro:
        "useAdminSettingsSync hook 管理管理员偏好设置的完整生命周期：从缓存初始加载、延迟刷写、后台服务器拉取到静默对账。",
      edgeCasesTitle: "边界情况防护",
      edgeCasesIntro: "同步系统处理企业环境中常见的5种关键边界情况。",
      edgeCasesWarning: "PENDING_SETTINGS_FLUSH 键在退出登录后刻意保留，以便在下次登录时执行刷写。",
      settingsRefTitle: "设置参考 (61项参数)",
      settingsRefIntro:
        "全部61项设置被组织为9个分区。每项设置都有明确的类型、默认值、DOM data 属性和可选的版本控制。",
      overrideControlTitle: "管理员覆盖控制",
      overrideControlIntro: "租户管理员可以控制哪些设置允许个人管理员自定义。",
      securityTitle: "安全模型",
      securityIntro: "仪表盘构建器实现纵深防御安全机制，防止管理员之间的数据泄露和有效载荷溢出。",
      archTitle: "架构与文件映射",
      archIntro: "仪表盘构建器在 Core 层中以7个文件实现，遵循 SCRIPE 基于 Provider 的架构模式。",
      archTip: "添加新设置时，请扩展 settings-provider.tsx 中的 Settings 接口和 defaultSettings。",
    },
    themeMarketplace: {
      title: "Theme Marketplace",
      description:
        "40 premium branding packages, 7 categories, 5 pricing tiers, per-page overrides, copy-on-apply snapshot semantics, and a full clean-architecture data layer — all seeded and ready to browse.",
      intro:
        "The Theme Marketplace is SCRIPE's curated catalog of 40 production-ready branding packages. Each theme is a comprehensive visual identity — not just a color swap — containing 50+ design tokens spanning colors, typography, spacing, overlay, dark mode, branding panel, and per-page overrides for Login, Forgot Password, and Reset Password pages. Themes are stored as structured JSON in the LoginTheme entity, browsable via a full-page gallery with rich filtering, and applied to tenant settings with copy-on-apply snapshot semantics that permanently isolate applied configurations from future marketplace updates.",
      archTitle: "Marketplace Architecture",
      archIntro:
        "The Theme Marketplace follows a pipeline architecture: backend seeder populates the LoginTheme table with 40 records → API exposes paginated list, detail, and apply endpoints → frontend gallery renders themes with advanced filtering → apply action snapshots the ThemeDataJson into tenant's DraftBrandingJson → publish propagates to LiveBrandingJson. Each layer is fully decoupled.",
      archDataFlowTitle: "Data Flow Pipeline",
      archDataFlowIntro:
        "1. LoginThemeSeeder.cs seeds 40 themes at application startup (upsert-safe). 2. ThemesController exposes GET /themes (list), GET /themes/{id} (detail), POST /themes/{id}/apply (apply). 3. Frontend ThemeMarketplaceService calls the API via IApiService. 4. ThemeMarketplaceMapper converts DTOs to domain entities. 5. ThemeMarketplaceRepository orchestrates services + mappers. 6. useThemeMarketplace hook provides ViewModel state. 7. ThemeGalleryView renders the marketplace UI.",
      archLayersTitle: "Clean Architecture Layers",
      archLayersIntro:
        "The marketplace follows SCRIPE's standard 3-layer module structure: Domain layer (ThemeDetail entity, IThemeMarketplaceRepository, IThemeMarketplaceService interfaces), Data layer (ThemeMarketplaceService, ThemeMarketplaceRepository, ThemeMarketplaceMapper, ThemeMarketplaceTypes models), and Presentation layer (ThemeGalleryView, ThemeManagementView, ThemeDetailModal, ThemeCard, useThemeMarketplace hook).",
      entityTitle: "LoginTheme Entity",
      entityIntro:
        "Each marketplace theme is stored as a LoginTheme entity in the Identity module's database. The entity extends AuditableEntity, providing soft-delete, audit trail, and optimistic concurrency. The core data is stored in ThemeDataJson — a JSON column containing the full design specification.",
      entityFieldsTitle: "Entity Fields",
      entityFieldName:
        "Name — Human-readable theme name (e.g., 'Midnight Aurora', 'Sakura Bloom'). Unique per system.",
      entityFieldCategory:
        "Category — Classification tag (corporate, creative, dark, elegant, luxury, minimal, nature). Used for gallery filtering.",
      entityFieldDescription:
        "Description — Marketing-quality description of the theme's visual identity and design philosophy.",
      entityFieldThumbnail: "ThumbnailUrl — Optional preview image URL for gallery cards.",
      entityFieldPreviewUrl:
        "PreviewUrl — Optional full-size preview image URL for the detail modal.",
      entityFieldThemeData:
        "ThemeDataJson — JSON column containing the complete design specification (50+ tokens). This is the heart of each theme.",
      entityFieldTier:
        "Tier — Pricing/access tier (Free, Starter, Professional, Enterprise, StandaloneAddon). Controls edition-based access gating.",
      entityFieldIsSystem:
        "IsSystemTheme — Boolean flag. System themes are seeded at startup and cannot be deleted by tenants.",
      entityFieldIsActive:
        "IsActive — Boolean flag. Inactive themes are hidden from the gallery but preserved in the database.",
      entityFieldTag:
        "Tags — Optional comma-separated tags for search (e.g., 'gradient, glass, modern, dark').",
      entityFieldVersion:
        "Version — Semantic version string (e.g., '1.0.0'). Incremented when the theme design is updated.",
      entityFieldAuthor: "Author — Creator identifier (e.g., 'SCRIPE Design Team').",
      entityFieldLikes:
        "LikesCount — Engagement counter. Tracks how many tenants have favorited this theme.",
      entityFieldApplied:
        "AppliedCount — Usage counter. Tracks how many tenants have applied this theme.",
      schemaTitle: "ThemeDataJson Schema (50+ Design Tokens)",
      schemaIntro:
        "The ThemeDataJson column stores a comprehensive JSON object containing every visual parameter needed to fully render a branded login page. The schema is versioned and contains 7 major sections: layout, colors, dark mode colors, typography, spacing, overlay, and branding panel. Each token maps directly to a CSS custom property via the useLoginBrandingTokens pipeline.",
      schemaVersionTitle: "Schema Version",
      schemaVersionIntro:
        "The root 'version' field tracks the JSON schema version. Current version is '2.0'. The frontend handles backward compatibility — older schemas are normalized at read time.",
      schemaLayoutTitle: "Layout Configuration",
      schemaLayoutIntro:
        "Controls the page structure: selectedLayout (one of 22 layout identifiers), loginPosition (left/center/right), formWidth, formMaxWidth, containerPadding, and formAlignment. Layout selection determines which rendering strategy the LoginPage component uses.",
      schemaColorsTitle: "Color System (16 Tokens)",
      schemaColorsIntro:
        "The colors section defines the complete light-mode palette: primaryColor (brand accent), secondaryColor (complementary), backgroundColor (page background), formBackground (form card), textColor (primary text), secondaryTextColor (muted text), inputBackground (form input fields), inputBorderColor, inputTextColor, buttonColor (primary CTA), buttonTextColor, buttonHoverColor, linkColor, linkHoverColor, borderColor (general borders), and accentColor (highlights/badges).",
      schemaDarkTitle: "Dark Mode Color System (10 Tokens)",
      schemaDarkIntro:
        "Independent dark-mode palette: darkEnabled (boolean toggle), darkFormBackground, darkTextColor, darkInputBackground, darkInputBorderColor, darkInputTextColor, darkButtonColor, darkButtonTextColor, darkSecondaryTextColor, and darkBorderColor. These tokens are emitted as --login-dark-* CSS variables and activated via the [data-theme='dark'] selector.",
      schemaTypographyTitle: "Typography Configuration (8 Tokens)",
      schemaTypographyIntro:
        "Controls all text rendering: fontFamily (Google Fonts name, e.g., 'Playfair Display'), headingFontFamily (optional separate heading font), fontSize (base size in px), headingSize, labelSize, inputFontSize, fontWeight (normal/medium/semibold/bold), and letterSpacing. Fonts are loaded dynamically via the Google Fonts CDN.",
      schemaSpacingTitle: "Spacing & Dimensions (6 Tokens)",
      schemaSpacingIntro:
        "Controls layout geometry: borderRadius (global border-radius in px), inputBorderRadius, buttonBorderRadius, inputHeight (in px), buttonHeight, and gap (spacing between form elements). These values are emitted as CSS custom properties and applied uniformly across all 22 layouts.",
      schemaOverlayTitle: "Overlay & Effects (8 Tokens)",
      schemaOverlayIntro:
        "Controls visual effects layered on backgrounds: overlayColor (RGBA), overlayOpacity (0–100%), overlayBlur (0–20px in Gaussian blur), backgroundType ('color', 'gradient', 'image'), backgroundValue (CSS gradient string or image URL), backgroundSize, backgroundPosition, and backgroundRepeat. Overlay settings can be scoped to the form section or branding panel independently.",
      schemaPanelTitle: "Branding Panel Configuration (12 Tokens)",
      schemaPanelIntro:
        "Controls the branding side of split layouts: panelLogo (URL), panelHeadline (heading text), panelSubtitle (subheading text), panelHeadlineColor, panelSubtitleColor, panelBackgroundType, panelBackgroundValue, panelOverlayColor, panelOverlayOpacity, panelOverlayBlur, panelLogoSize (small/medium/large), and panelAlignment (left/center/right). These tokens are only rendered in T1 Split layouts.",
      perPageTitle: "Per-Page Branding Architecture",
      perPageIntro:
        "Each theme can define independent visual overrides for three authentication pages: Login, Forgot Password, and Reset Password. The 'pages' block in ThemeDataJson contains page-specific layout, headline, subtitle, overlay, and background settings that are merged on top of the global design when that page is active. This enables a single theme to present different messaging and visual treatments for different auth flows.",
      perPageStructTitle: "Pages Block Structure",
      perPageStructIntro:
        "The 'pages' object in ThemeDataJson contains three optional keys: 'login', 'forgotPassword', and 'resetPassword'. Each key maps to a page override object with fields: selectedLayout, panelHeadline, panelSubtitle, overlayColor, overlayOpacity, backgroundType, backgroundValue, and any other token that should differ from the global configuration.",
      perPageMergeTitle: "Merge Strategy",
      perPageMergeIntro:
        "When a tenant previews a theme's Forgot Password page, the frontend merges the global design tokens with the forgotPassword override using spread semantics: { ...globalTokens, ...pages.forgotPassword }. This means any token not specified in the page override inherits from the global design — only the explicitly overridden values change. The merge happens in the previewTheme() function in useStudioViewModel.ts.",
      perPageIsolationTitle: "State Isolation",
      perPageIsolationNote:
        "Each auth page can have its own layout, headline, subtitle, and overlay without affecting the other pages. The Login page might use a full-image corporate layout while Forgot Password uses a clean centered card — all within the same theme.",
      catalogTitle: "40-Theme Catalog Overview",
      catalogIntro:
        "SCRIPE ships with 40 meticulously designed branding packages. Each theme is a unique visual identity crafted for a specific market segment or brand aesthetic. Themes span 7 categories, use 30+ different Google Fonts, cover all 22 layouts, and include per-page branding overrides for Login, Forgot Password, and Reset Password.",
      catalogDiversityTitle: "Design Diversity Matrix",
      catalogDiversityIntro:
        "The 40-theme catalog achieves maximum diversity across multiple axes: each theme uses a unique Google Font pairing, no two themes share the same color palette, all 7 categories are represented, and the layout distribution covers T1 Split (16), T2 Full-Page (12), T3 Centered (6), and T4 Special (6). This ensures every tenant can find a theme that matches their brand identity.",
      tierTitle: "5-Tier Pricing Model",
      tierIntro:
        "Themes are organized into 5 pricing tiers that align with SCRIPE's edition system. Each tier provides increasing design sophistication and customization depth. Tier enforcement is handled by the theme marketplace frontend — themes from higher tiers display an 'Upgrade Required' badge and disable the Apply button for tenants on lower editions.",
      tierFreeTitle: "Free Tier (8 Themes)",
      tierFreeIntro:
        "Essential branding packages available to all tenants regardless of edition. Clean, professional designs suitable for quick deployment. Includes Starter themes across corporate, minimal, and creative categories.",
      tierStarterTitle: "Starter Tier (8 Themes)",
      tierStarterIntro:
        "Enhanced branding packages for Starter-edition tenants. Richer color palettes, premium font pairings, and gradient backgrounds. Includes Starter-exclusive designs across corporate, dark, and elegant categories.",
      tierProTitle: "Professional Tier (10 Themes)",
      tierProIntro:
        "Advanced branding packages for Professional-edition tenants. Sophisticated visual treatments with glass-morphism effects, editorial typography, and multi-tone overlays. Includes the most diverse category coverage.",
      tierEnterpriseTitle: "Enterprise Tier (8 Themes)",
      tierEnterpriseIntro:
        "Premium branding packages for Enterprise-edition tenants. Ultra-premium designs with cinematic layouts, luxury typography (Cormorant Garamond, Italiana, Cinzel Decorative), and exclusive dark-mode treatments.",
      tierStandaloneTitle: "Standalone Add-on Tier (6 Themes)",
      tierStandaloneIntro:
        "Ultra-exclusive standalone branding packages available as individual add-on purchases. These represent the most unique and specialized designs — botanical illustrations, art deco, brutalist, vaporwave, and zen-inspired themes that make a bold brand statement.",
      categoriesTitle: "7 Theme Categories",
      categoriesIntro:
        "Every theme belongs to exactly one category. Categories enable intuitive gallery browsing and filtering. The distribution ensures broad coverage: Corporate (8), Creative (6), Dark (6), Minimal (5), Elegant (5), Luxury (5), Nature (5).",
      catCorporate:
        "Corporate — Professional business identity. Clean lines, serif/sans-serif font pairs, subtle gradients, blue/navy/gray palettes. Designed for financial services, consulting, law firms.",
      catCreative:
        "Creative — Bold, expressive identity. Vibrant colors, playful typography (Poppins, Quicksand), animated gradients, modern card layouts. Designed for agencies, startups, tech companies.",
      catDark:
        "Dark — Sophisticated dark-mode-first identity. Deep backgrounds (slate, zinc, charcoal), accent-driven highlights (cyan, amber, rose), premium glass effects. Designed for developer tools, media, gaming.",
      catMinimal:
        "Minimal — Reductive, content-focused identity. Monochromatic palettes, generous whitespace, thin borders, system-optimized typography. Designed for productivity tools, documentation, SaaS platforms.",
      catElegant:
        "Elegant — Refined, luxurious identity. Rose gold, champagne, pearl gradients, serif typography (Playfair Display, Cormorant), delicate overlays. Designed for beauty, fashion, hospitality.",
      catLuxury:
        "Luxury — Ultra-premium brand identity. Black/gold/platinum palettes, display typography (Italiana, Cinzel Decorative), full-bleed imagery, art-directed layouts. Designed for high-end brands, private banking, exclusive services.",
      catNature:
        "Nature — Organic, earth-inspired identity. Forest greens, terracotta, ocean blues, botanical accents, rounded shapes, warm serif typography. Designed for sustainability, wellness, organic brands.",
      componentsTitle: "Frontend Component Inventory",
      componentsIntro:
        "The Theme Marketplace frontend consists of 8 purpose-built components spanning 3 pages and 1 modal. Each component follows SCRIPE's presentation-layer patterns using domain entities (never DTOs) and consuming data exclusively through the DI container.",
      compGalleryView:
        "ThemeGalleryView (26KB) — Full-page marketplace with animated hero section, category filter chips, search bar, grid/list view toggle, tier filter tabs, sort controls (popular/newest/name), infinite scroll pagination, and a responsive 3-column grid of ThemeCard components.",
      compManagementView:
        "ThemeManagementView (12KB) — Admin CRUD page for managing system themes. DataTable with columns: thumbnail, name, category, tier, status, likes, applies, actions. Supports create, edit, activate/deactivate, and bulk operations.",
      compDetailModal:
        "ThemeDetailModal (28KB) — Richly detailed theme preview modal. Contains: full-size preview image, design token summary (colors, fonts, spacing), feature matrix (dark mode, per-page, overlay), category/tier badges, Apply button with confirmation dialog, and like/favorite toggles.",
      compThemeCard:
        "ThemeCard — Gallery grid item. Displays: thumbnail, name, category badge, tier badge, color palette strip (5 primary colors), font family name, like count, apply count, and hover-to-preview animation.",
      compMarketplacePanel:
        "ThemeMarketplacePanel — Inline panel within the Customizer Studio sidebar. Shows a compact gallery of themes with quick-apply functionality. Allows browsing and applying themes without leaving the studio.",
      applyTitle: "Theme Application Flow",
      applyIntro:
        "Applying a marketplace theme follows a 5-step pipeline: 1. User clicks Apply on a theme. 2. Frontend reads the theme's ThemeDataJson. 3. previewTheme() in useStudioViewModel merges the design tokens (including per-page overrides) into the current StudioDraft. 4. The merged draft is saved to the tenant's DraftBrandingJson via PUT /tenants/{id}/settings. 5. Admin publishes the draft to make it live.",
      copyOnApplyTitle: "Copy-on-Apply Snapshot Semantics",
      copyOnApplyIntro:
        "When a theme is applied, the ThemeDataJson is COPIED into the tenant's DraftBrandingJson — not linked. This means the tenant's branding is permanently isolated from future marketplace updates. If the theme is updated in v2.0, existing tenants who applied v1.0 retain their v1.0 snapshot. This prevents unexpected visual changes to production login pages.",
      copyOnApplyNote:
        "Copy-on-apply is a deliberate architectural decision. It trades storage efficiency for deployment safety — a critical requirement for enterprise tenants who negotiate specific branding contracts.",
      previewFlowTitle: "Preview Before Apply",
      previewFlowIntro:
        "The previewTheme() function in useStudioViewModel.ts performs a non-destructive preview by temporarily injecting theme tokens into the draft state. The preview is displayed in the sandboxed iframe via postMessage CSS variable injection. The draft is NOT saved until the user explicitly confirms the application. Canceling the preview restores the previous draft state.",
      seedingTitle: "Backend Seeding Architecture",
      seedingIntro:
        "All 40 themes are seeded at application startup by LoginThemeSeeder.cs. The seeder uses an upsert-safe strategy: it checks for existing themes by Name and only inserts new ones — existing themes are never overwritten. This ensures idempotent deployment across environments.",
      seedHelperTitle: "Build() Helper Architecture",
      seedHelperIntro:
        "The seeder uses a fluent Build() helper with ThemeMeta and ThemeDesign records for clean theme definition. ThemeMeta contains name, category, tier, description, author, version, and tags. ThemeDesign contains all 50+ design tokens plus per-page overrides (PageOverrideDesign records for ForgotPassword and ResetPassword). The BuildFullThemeJson() method serializes the ThemeDesign record into the JSON format expected by the frontend.",
      seedUpsertTitle: "Upsert-Safe Strategy",
      seedUpsertIntro:
        "The seeder queries all existing theme names before processing. For each of the 40 themes, it checks the existing set — if the name exists, the theme is skipped. New themes are added to the DbContext in a single batch and saved with one SaveChangesAsync call. This makes the seeder safe to run repeatedly without duplicating themes or losing manual edits.",
      governanceTitle: "Marketplace Governance",
      governanceIntro:
        "Theme access is controlled by a combination of edition-based tier enforcement and permission-based administrative access. The marketplace respects SCRIPE's multi-tenancy model — themes are globally visible but apply operations are scoped to the current tenant.",
      governanceEditionTitle: "Edition-Based Tier Enforcement",
      governanceEditionIntro:
        "Each theme's Tier field maps to an edition level. The frontend gallery marks themes above the tenant's edition with an 'Upgrade Required' badge and disables the Apply button. The backend apply endpoint verifies the tenant's active subscription against the theme's tier before allowing application.",
      governancePermissionTitle: "Permission Requirements",
      governancePermissionIntro:
        "Browsing the marketplace requires the branding.view permission. Applying a theme requires branding.manage. Managing system themes (CRUD) requires the themes.manage permission, which is restricted to System Admins.",
      governanceTenantTitle: "Tenant Isolation",
      governanceTenantIntro:
        "When a theme is applied, it modifies only the current tenant's DraftBrandingJson. The apply operation is scoped via the JWT tenant_id claim. SuperAdmins can apply themes on behalf of any tenant via the 'Enter Tenant World' drill-down capability.",
      endpointsTitle: "Theme API Endpoints",
      endpointsIntro:
        "The theme marketplace exposes endpoints through the existing TenantSettings and Themes controllers. Theme data is served as part of the branding configuration pipeline.",
      endpointList:
        "GET /api/v1/themes — Paginated list of active themes with category, tier, and search filters.",
      endpointDetail:
        "GET /api/v1/themes/{id} — Full theme detail including ThemeDataJson, metadata, and engagement counters.",
      endpointApply:
        "POST /api/v1/themes/{id}/apply — Apply theme to the current tenant's draft settings. Copies ThemeDataJson to DraftBrandingJson.",
      endpointLike:
        "POST /api/v1/themes/{id}/like — Toggle like/favorite for the current admin. Increments/decrements LikesCount.",
      endpointManage:
        "POST/PUT/DELETE /api/v1/themes — System admin CRUD for managing theme catalog (create, update, deactivate).",
      sourceTitle: "Source File Reference",
      sourceBackend:
        "Backend: LoginThemeSeeder.cs (seeder), LoginTheme.cs (entity), ThemeConfiguration.cs (EF config)",
      sourceFrontend:
        "Frontend: ThemeGalleryView.tsx, ThemeManagementView.tsx, ThemeDetailModal.tsx, ThemeCard.tsx",
      sourceData:
        "Data Layer: ThemeMarketplaceService.ts, ThemeMarketplaceRepository.ts, ThemeMarketplaceMapper.ts, ThemeMarketplaceTypes.ts",
      sourceDomain:
        "Domain Layer: ThemeDetail.ts (entity), IThemeMarketplaceService.ts, IThemeMarketplaceRepository.ts",
      sourceViewModel:
        "ViewModel: useThemeMarketplace.ts (gallery state), useStudioViewModel.ts (preview/apply integration)",
    },
    multiPageBranding: {
      title: "Multi-Page Branding",
      description:
        "Independent visual customization for Login, Forgot Password, and Reset Password pages — shared design tokens with per-page overrides, isolated preview, and theme integration.",
      intro:
        "Multi-Page Branding extends SCRIPE's Login Customizer Studio to support independent visual configurations for all three authentication pages: Login, Forgot Password, and Reset Password. Instead of forcing a single visual identity across all auth flows, Multi-Page Branding allows tenants to present context-appropriate messaging, layouts, and visual treatments for each page. A shared global design provides consistency, while per-page overrides enable targeted differentiation — all managed through the same zero-code studio interface.",
      pagesTitle: "Supported Authentication Pages",
      pagesIntro:
        "SCRIPE's authentication system exposes three distinct pages, each serving a different user intent. Multi-Page Branding allows independent customization of all three while maintaining visual consistency through shared design tokens.",
      pageLogin:
        "Login Page — The primary authentication entry point. Users enter their credentials (email + password) to access the platform. This page receives the most visual attention as it creates the first impression of the tenant's brand.",
      pageForgot:
        "Forgot Password Page — The password recovery entry point. Users enter their email to receive a reset link. This page benefits from reassuring messaging ('We'll help you get back in') and softer visual treatments that convey trust and care.",
      pageReset:
        "Reset Password Page — The password change confirmation page. Users set a new password using the link from their email. This page benefits from action-oriented messaging ('Create your new password') and clear, focused layouts that minimize distraction.",
      pagesNote:
        "Each page can independently configure: layout, headline, subtitle, background, overlay, and any design token. Tokens not explicitly overridden inherit from the global configuration — enabling 'configure once, override selectively' workflow.",
      stateTitle: "State Isolation Model",
      stateIntro:
        "Multi-Page Branding uses a layered state model. The global StudioDraft contains the base configuration for all pages. Each page has an optional override object (pageOverrides.login, pageOverrides.forgotPassword, pageOverrides.resetPassword) that stores only the tokens that differ from the global. This minimizes storage and simplifies diff tracking.",
      stateGlobalTitle: "Global Layer (Shared Tokens)",
      stateGlobalIntro:
        "The global layer contains all 50+ design tokens: colors, typography, spacing, overlay, dark mode, and branding panel settings. These tokens apply to ALL auth pages by default. The global layer is always defined — it is never empty.",
      stateOverrideTitle: "Page Override Layer (Per-Page Tokens)",
      stateOverrideIntro:
        "Each page's override layer contains ONLY the tokens that differ from the global configuration. For example, if the Forgot Password page has a different headline and subtitle but shares all colors and typography, only panelHeadline and panelSubtitle are stored in the override. Empty fields inherit from the global layer.",
      stateMergeTitle: "Runtime Merge Strategy",
      stateMergeIntro:
        "When the studio switches to a specific page tab, the effective configuration is computed as: effectiveConfig = { ...globalDraft, ...pageOverrides[currentPage] }. This spread-merge ensures that page-specific overrides take precedence while all unspecified tokens fall through to the global values. The merge is performed in the previewTheme() function and in the CSS token emission pipeline.",
      stateMergeNote:
        "The merge is a shallow spread — nested objects (like darkColors or overlay) are replaced entirely, not deep-merged. This is intentional: if a page overrides the overlay, it should control the complete overlay configuration, not inherit partial values from the global.",
      studioTitle: "Studio Integration — Page Tabs",
      studioIntro:
        "The Customizer Studio sidebar includes a page tab strip (AuthPageTabs component) that allows switching between Login, Forgot Password, and Reset Password. When the active tab changes, the studio loads the corresponding page override (if any) and merges it with the global draft for preview. The preview iframe navigates to the selected auth page route.",
      studioTabsTitle: "AuthPageTabs Component",
      studioTabsIntro:
        "The AuthPageTabs component renders a horizontal tab bar with 3 tabs (Login, Forgot Password, Reset Password). Each tab displays the page name and an optional 'Customized' badge if per-page overrides exist. Clicking a tab updates the activePage state in the studio, triggers a preview refresh, and loads the page-specific sidebar panel settings.",
      studioSwitchTitle: "Tab Switching Flow",
      studioSwitchIntro:
        "When a user switches tabs: 1. The activePage state is updated to 'login', 'forgotPassword', or 'resetPassword'. 2. The sidebar panels reload with merged values (global + page override). 3. The preview iframe receives an updated postMessage with the merged CSS variables. 4. The iframe URL changes to the corresponding auth route (e.g., /login-preview, /forgot-password-preview, /reset-password-preview). 5. Any changes made in the sidebar are saved to the page override, not the global draft.",
      studioEditTitle: "Per-Page Editing",
      studioEditIntro:
        "When a user modifies a setting while a non-login page is active (e.g., Forgot Password), the change is saved to pageOverrides.forgotPassword — not to the global draft. The studio tracks which page is active and routes edits accordingly. This ensures that changing the forgot-password headline does not affect the login page's headline.",
      studioResetTitle: "Reset to Global",
      studioResetIntro:
        "Each page tab includes a 'Reset to Global' action that removes all per-page overrides for that page, reverting it to the global configuration. This is useful when a tenant wants to undo page-specific customizations and restore visual consistency across all auth pages.",
      themeTitle: "Theme Marketplace Integration",
      themeIntro:
        "When a marketplace theme includes per-page overrides (pages.forgotPassword, pages.resetPassword), the previewTheme() function in useStudioViewModel.ts automatically imports those overrides into the studio's pageOverrides state. This means applying a theme with per-page branding instantly populates all three auth pages with the theme's intended visual treatment.",
      themeImportTitle: "Page Override Import",
      themeImportIntro:
        "The previewTheme() function checks for the 'pages' key in the theme's ThemeDataJson. If found, it extracts the forgotPassword and resetPassword objects and stores them as pageOverrides. If the theme does not include page overrides, the existing pageOverrides are preserved (or cleared, depending on the apply mode).",
      themeCompatTitle: "Backward Compatibility",
      themeCompatIntro:
        "Themes without a 'pages' block are fully backward-compatible. The absence of page overrides means all three auth pages use the global design — the same behavior as themes created before the Multi-Page Branding feature. No migration is required for existing themes.",
      serializationTitle: "Data Serialization & Persistence",
      serializationIntro:
        "Per-page overrides are stored in the tenant's DraftBrandingJson alongside the global configuration. The JSON structure contains a top-level 'pageOverrides' object with 'login', 'forgotPassword', and 'resetPassword' keys. Each key maps to a flat token object. On publish, the entire structure (global + pageOverrides) is promoted to LiveBrandingJson.",
      serializationSchemaTitle: "Stored JSON Schema",
      serializationSchemaIntro:
        "The DraftBrandingJson stores: { selectedLayout, primaryColor, ...(all global tokens), pageOverrides: { login: { panelHeadline, panelSubtitle, ... }, forgotPassword: { selectedLayout, panelHeadline, overlayColor, ... }, resetPassword: { selectedLayout, panelHeadline, ... } } }. Only non-null override tokens are persisted — empty pages are not stored to save space.",
      previewTitle: "Sandboxed Preview Architecture",
      previewIntro:
        "Each auth page is previewed in the same sandboxed iframe used by the Login Customizer Studio. When the user switches to a different page tab, the preview URL changes to the corresponding auth route, and new CSS variables (merged from global + page override) are injected via postMessage. The preview supports desktop, tablet, and mobile breakpoints for all three pages.",
      previewIsolationTitle: "Preview Isolation",
      previewIsolationIntro:
        "The preview iframe runs in a completely isolated context — separate from the admin panel's authentication state. This prevents the preview from triggering real login/logout actions. The preview pages are purpose-built components that render the auth UI with injected CSS variables but no authentication logic.",
      conflictTitle: "Conflict Prevention & Consistency",
      conflictIntro:
        "Multi-Page Branding includes safeguards to prevent visual inconsistency. When the global design changes (e.g., a new font family), all pages that inherit from the global automatically update — only explicitly overridden tokens remain unchanged. The studio displays a 'Customized' badge on page tabs that have overrides, making it clear which pages have independent configurations.",
      conflictWarning:
        "When a global token is changed (e.g., primaryColor), pages with overrides that include the same token will NOT update — the override takes precedence. This is intentional. To propagate a global change to overridden pages, use the 'Reset to Global' action on those pages first.",
      sourceTitle: "Source File Reference",
      sourceStudio: "Studio: useStudioViewModel.ts (page state, merge logic, previewTheme())",
      sourceComponents:
        "Components: AuthPageTabs.tsx (tab strip), StylePanel.tsx (sidebar with per-page routing)",
      sourceTypes:
        "Types: StudioDraft.ts (pageOverrides interface), ThemeTypes.ts (page override type definitions)",
      sourceSeeder:
        "Backend: LoginThemeSeeder.cs (PageOverrideDesign records, BuildFullThemeJson pages serialization)",
    },
    loginPageBuilder: {
      title: "Login Page Builder",
      description:
        "No-code drag-and-drop visual canvas with 3 design modes (Freeform, Grid, Builder), 14 component types, a 12-column responsive grid system, real-time preview sync, and JSON serialization.",
      intro:
        "The Login Page Builder is SCRIPE's most advanced customization tool — a fully visual, drag-and-drop canvas that allows tenant administrators to build custom login page layouts without writing any code. The builder provides 3 design modes (Freeform, Grid, and Builder), a palette of 14 pre-built component types (from logos and headings to social login buttons and footer links), a responsive 12-column CSS grid system, real-time two-way sync with the preview iframe, and full JSON serialization for persistence. The builder integrates seamlessly with the Login Customizer Studio's design token pipeline, ensuring that builder-created layouts inherit all theme colors, typography, and accessibility settings.",
      modesTitle: "3 Canvas Modes",
      modesIntro:
        "The builder offers three distinct canvas modes, each providing a different level of control over layout positioning. Users can switch between modes at any time — components are preserved during mode switches.",
      modeFreeformTitle: "Freeform Mode",
      modeFreeformIntro:
        "Absolute positioning with pixel-level control. Components can be placed anywhere on the canvas and dragged to exact coordinates. Best for creative, non-standard layouts where design freedom is paramount. Components have x/y position, width, height, and z-index properties.",
      modeGridTitle: "Grid Mode (12-Column)",
      modeGridIntro:
        "Responsive 12-column CSS grid layout. Components are placed into grid cells with configurable column span (1–12), row positioning, alignment, and gap spacing. The grid ensures consistent, responsive layouts that adapt to desktop, tablet, and mobile breakpoints. This is the recommended mode for enterprise deployments where cross-device consistency is critical.",
      modeBuilderTitle: "Builder Mode",
      modeBuilderIntro:
        "Structured block-based layout with predefined sections. Components are organized into vertical sections (header, body, footer) with automatic stacking and reordering via drag-and-drop. Best for quick layout assembly with predictable, clean results. Builder mode enforces structural constraints — components snap to section boundaries and maintain consistent spacing.",
      modesNote:
        "Grid mode is the default for new configurations. It provides the best balance between design flexibility and responsive consistency. Freeform mode is intended for advanced users who need pixel-perfect control.",
      paletteTitle: "14 Component Types",
      paletteIntro:
        "The component palette provides 14 pre-built, configurable UI components that can be dragged onto the canvas. Each component has a set of editable properties (text content, styling, behavior) accessible via the Properties Panel when selected.",
      compLogo:
        "Logo — Displays the tenant's logo image. Properties: src (URL), alt text, width, height, alignment, link URL. Supports SVG, PNG, and WebP formats.",
      compHeading:
        "Heading — Large display text for page titles and headlines. Properties: text content, font size, font weight, color, alignment, HTML tag (h1–h6). Supports dynamic variables ({tenantName}).",
      compText:
        "Text — General-purpose paragraph text. Properties: content, font size, color, line height, alignment, max width. Supports rich text with bold, italic, and links.",
      compDivider:
        "Divider — Visual separator line. Properties: color, thickness, width, margin, style (solid, dashed, dotted, gradient).",
      compSpacer:
        "Spacer — Invisible spacing element. Properties: height (in px). Used to create vertical gaps between components without manual positioning.",
      compImage:
        "Image — Display any image on the canvas. Properties: src (URL), alt text, width, height, object-fit, border radius, shadow. Supports all web image formats.",
      compButton:
        "Button — Clickable action button. Properties: text, variant (primary, secondary, outline, ghost), size, width (auto, full), icon, link URL, border radius.",
      compSocialLogin:
        "Social Login — Pre-built social authentication buttons (Google, Microsoft, Apple, GitHub). Properties: providers (multi-select), layout (horizontal, vertical, icon-only), separator text.",
      compForm:
        "Form — The login form component containing email/password inputs and submit button. Properties: show labels, show placeholders, input style, button text, remember me checkbox, forgot password link.",
      compFooter:
        "Footer — Page footer with links and copyright text. Properties: links array, copyright text, alignment, font size, color.",
      compBadge:
        "Badge — Small label/tag element. Properties: text, variant (default, success, warning, destructive), size.",
      compCard:
        "Card — Container with background, border, and shadow. Properties: background color, border radius, shadow, padding. Can contain other components (nested layout).",
      compIcon:
        "Icon — SVG icon from the built-in icon library. Properties: icon name, size, color, rotation, link URL.",
      compTermsLink:
        "Terms & Privacy — Pre-built links to Terms of Service and Privacy Policy pages. Properties: terms URL, privacy URL, text template, font size, color.",
      gridTitle: "12-Column Grid System",
      gridIntro:
        "The Grid Mode uses a responsive 12-column CSS grid layout. Each component occupies a configurable number of columns (1–12) and rows. The grid supports gap spacing, column alignment (start, center, end, stretch), and row alignment. The grid is fully responsive — column spans can be configured independently for desktop (lg), tablet (md), and mobile (sm) breakpoints.",
      gridPropsTitle: "Grid Component Properties",
      gridPropsIntro:
        "Each component in Grid mode has additional grid-specific properties: colSpan (1–12 columns), rowSpan (number of rows), colStart (starting column), rowStart (starting row), alignment (start/center/end/stretch), and responsive overrides (sm/md/lg column spans). These properties are configured via the Properties Panel.",
      gridResponsiveTitle: "Responsive Breakpoints",
      gridResponsiveIntro:
        "The grid supports 3 breakpoints: Desktop (lg, ≥1024px), Tablet (md, 768–1023px), and Mobile (sm, <768px). Each component can have independent column spans per breakpoint. For example, a logo might span 4 columns on desktop but 12 columns (full width) on mobile. The preview iframe respects these breakpoints when device toggles are used.",
      gridGapTitle: "Gap Configuration",
      gridGapIntro:
        "The grid gap (spacing between cells) is configurable globally: columnGap and rowGap properties, each accepting pixel values (default: 16px). This ensures consistent spacing across all grid items without manual padding on individual components.",
      dndTitle: "Drag-and-Drop Architecture",
      dndIntro:
        "The builder uses @dnd-kit/core (not react-beautiful-dnd) for drag-and-drop interactions. Components are dragged from the palette sidebar and dropped onto the canvas. The DragOverlay renders a ghost preview of the component during drag. Drop zones are highlighted with blue outlines when a draggable component hovers over them.",
      dndPaletteTitle: "Palette → Canvas Flow",
      dndPaletteIntro:
        "1. User drags a component type from the palette sidebar. 2. @dnd-kit creates a DragOverlay with a preview of the component. 3. The canvas renders drop zone indicators (grid cells in Grid mode, free areas in Freeform mode). 4. On drop, a new component instance is created with default properties and added to the builder state. 5. The component is rendered on the canvas at the drop position.",
      dndReorderTitle: "Canvas Reordering",
      dndReorderIntro:
        "Existing components on the canvas can be reordered by dragging. In Grid mode, components snap to grid cells. In Builder mode, components reorder within their section (header/body/footer). In Freeform mode, components move to the exact drop coordinates.",
      dndSelectTitle: "Component Selection",
      dndSelectIntro:
        "Clicking a component on the canvas selects it, displaying a blue selection border and resize handles. The Properties Panel on the right sidebar loads the selected component's editable properties. Pressing Delete/Backspace removes the selected component. Escape deselects.",
      propsTitle: "Properties Panel",
      propsIntro:
        "The Properties Panel is a contextual sidebar that appears when a component is selected on the canvas. It displays all editable properties for the selected component type, organized into sections: Content (text, URLs), Layout (width, height, alignment), Style (colors, borders, shadows), and Grid (column span, row span, responsive breakpoints). Changes in the Properties Panel update the canvas in real-time.",
      propsContentTitle: "Content Properties",
      propsContentIntro:
        "Text inputs for content: headline text, paragraph text, button labels, URLs, alt text. Supports variable interpolation with {variableName} syntax for dynamic tenant data.",
      propsStyleTitle: "Style Properties",
      propsStyleIntro:
        "Visual styling controls: color pickers, border radius sliders, shadow toggles, opacity controls, font size selectors. Style properties that overlap with theme tokens (e.g., primaryColor) can be set to 'inherit from theme' to maintain consistency.",
      propsGridTitle: "Grid Properties",
      propsGridIntro:
        "Grid-specific layout controls (Grid mode only): column span slider (1–12), row span, column start, row start, alignment select, and responsive breakpoint overrides. A visual grid preview shows the component's position within the 12-column grid.",
      stateTitle: "Canvas State Management",
      stateIntro:
        "The builder maintains a flat array of BuilderComponent objects in the StudioDraft. Each component has: id (unique UUID), type (one of 14 types), properties (key-value map), position (x, y for Freeform), gridPosition (col, row, colSpan, rowSpan for Grid), and section (header/body/footer for Builder mode). The entire array is serialized as JSON in the builderComponentsJson field of DraftBrandingJson.",
      stateComponentTitle: "BuilderComponent Schema",
      stateComponentIntro:
        "Each BuilderComponent is a serializable object: { id: string, type: ComponentType, props: Record<string, unknown>, position: { x: number, y: number }, gridPosition: { colSpan: number, rowSpan: number, colStart: number, rowStart: number }, section: 'header' | 'body' | 'footer', order: number, responsive: { sm: GridOverride, md: GridOverride } }.",
      stateUndoTitle: "Undo/Redo Support",
      stateUndoIntro:
        "The builder maintains a history stack for undo/redo operations. Each action (add, move, resize, delete, property change) pushes a snapshot to the stack. Ctrl+Z undoes the last action, Ctrl+Shift+Z redoes. The history stack has a configurable depth limit (default: 50 actions).",
      serializationTitle: "JSON Serialization & Persistence",
      serializationIntro:
        "The builder state is serialized as a JSON array and stored in the builderComponentsJson field of the tenant's DraftBrandingJson. The canvasMode (freeform/grid/builder) is stored as a separate field. On publish, the builder state is promoted to LiveBrandingJson alongside all other branding tokens.",
      serializationSchemaTitle: "Serialized Schema",
      serializationSchemaIntro:
        "The stored JSON follows this structure: { canvasMode: 'freeform' | 'grid' | 'builder', gridConfig: { columns: 12, columnGap: 16, rowGap: 16 }, components: [ { id, type, props, position, gridPosition, section, order, responsive } ] }. The schema is versioned for forward compatibility.",
      serializationSizeTitle: "Storage Optimization",
      serializationSizeIntro:
        "Default property values are NOT stored — only properties that differ from the component type's defaults are serialized. This keeps the JSON payload compact (typically 2–5KB for a complex layout with 10+ components).",
      previewTitle: "Real-Time Preview Sync",
      previewIntro:
        "Every canvas change is immediately reflected in the sandboxed preview iframe. The builder emits postMessage events containing the current component array and canvas mode. The preview page receives these events, reconstructs the layout, and renders the components with live CSS variable injection from the active theme.",
      previewSyncTitle: "Two-Way Sync",
      previewSyncIntro:
        "The sync is bidirectional: canvas changes propagate to preview (via postMessage), and device toggle changes in the preview header propagate back to the builder (updating responsive breakpoint indicators). This ensures the builder canvas accurately reflects how the layout will appear at each breakpoint.",
      securityTitle: "Security Constraints",
      securityIntro:
        "The Login Page Builder enforces strict security constraints on user-generated content. All text content is HTML-sanitized before rendering (no script injection). Image URLs are validated to prevent SSRF. The builder canvas runs in a sandboxed iframe with restrictive CSP headers. Custom CSS injection is not supported — styling is controlled exclusively through the design token pipeline.",
      securitySanitizeTitle: "Input Sanitization",
      securitySanitizeIntro:
        "All text properties (headings, paragraphs, button labels) are sanitized using DOMPurify before rendering in the preview. HTML tags are stripped — only plain text is stored. URLs are validated against a whitelist of allowed protocols (https, http) to prevent javascript: and data: injection.",
      securityIframeTitle: "Iframe Sandboxing",
      securityIframeIntro:
        "The preview iframe uses the sandbox attribute with restricted permissions: allow-scripts (for CSS variable injection), allow-same-origin (for postMessage). Forms are non-functional — the preview renders visual-only representations of auth components.",
      dashboardTitle: "Dashboard Theming (Related Feature)",
      dashboardIntro:
        "The Dashboard Theming panel in the Customizer Studio allows tenants to configure their admin dashboard's visual defaults. Settings include layout template (8 options), color theme (12 options), theme mode (light/dark/system), default language, and sidebar default state. Dashboard theming uses the same draft/publish workflow as login branding.",
      dashboardLayoutsTitle: "8 Layout Templates",
      dashboardLayoutsIntro:
        "Default, Navigation, Classic, Compact, Elegant, Floating, Modern, and Minimal. Each template defines the dashboard shell structure: sidebar position, header style, content width, and navigation pattern.",
      dashboardColorsTitle: "12 Color Themes",
      dashboardColorsIntro:
        "Default, Zinc, Slate, Stone, Neutral, Red, Rose, Orange, Green, Blue, Violet, and Yellow. Each color theme defines the dashboard's accent color palette applied to the sidebar, headers, buttons, and active states.",
      dashboardStorageTitle: "Storage Format",
      dashboardStorageIntro:
        "Dashboard settings are stored in the dashboardThemeJson field of DraftBrandingJson as a JSON object: { layoutTemplate, colorTheme, mode, language, sidebarDefaultState }. On publish, the settings are promoted to the tenant's live configuration.",
      bundleTitle: "Bundle Marketplace (Related Feature)",
      bundleIntro:
        "The Bundle Marketplace allows tenants to save their complete studio configuration (login theme + builder layout + dashboard settings + per-page overrides) as a named bundle, and browse/apply bundles created by other tenants or the system. Bundles are displayed in a dedicated tab within the Theme Gallery.",
      bundleComponentsTitle: "Bundle Components",
      bundleComponentsIntro:
        "BundleGalleryTab (5.6KB) — Gallery tab with type filters (Login, Dashboard, Complete), search, grid, pagination. BundleCard (12.8KB) — Card with accent preview, pricing tier, metadata. BundleDetailModal (8.5KB) — Full detail with apply button. SaveBundleDialog (7.6KB) — Dialog for saving current studio state as a new bundle.",
      bundleTypesTitle: "Bundle Types",
      bundleTypesIntro:
        "Login Bundle — Contains only login branding (theme tokens + builder layout). Dashboard Bundle — Contains only dashboard settings. Complete Bundle — Contains everything: login branding, builder layout, per-page overrides, dashboard settings, and accessibility configuration. Complete bundles provide one-click full-workspace setup.",
      archTitle: "Module Architecture",
      archIntro:
        "The Login Page Builder follows SCRIPE's standard modular clean architecture. The builder/ directory contains: BuilderCanvas.tsx (main canvas), ComponentPalette.tsx (sidebar palette), PropertiesPanel.tsx (property editor), GridOverlay.tsx (grid visualization), and BuilderToolbar.tsx (mode switcher, undo/redo, zoom controls). State management uses the useBuilderState hook integrated into useStudioViewModel.",
      archTip:
        "The builder components are intentionally defined as stable, memoized React components to prevent re-renders during drag operations. Each canvas component is wrapped in React.memo with custom equality checks on position and properties.",
    },
    dashboardHub: {
      title: "仪表板中心 (Hub-and-Spoke)",
      description:
        "模块化选项卡仪表板,包含领域分离的子模块(审计、安全、分析),每个模块6层清洁架构,符合ISP的接口,懒加载以及基于权限的选项卡可见性控制。",
      intro:
        "仪表板中心是SCRIPE的核心运营指挥中心——一个选项卡界面,将四个特定领域视图(概览、审计、安全、分析)聚合到一个统一的中心。每个领域模块遵循严格的6层清洁架构(模型 → 实体 → 接口 → 服务 → 仓库 → 映射器),并具有专用的DI注册。子视图通过React.lazy懒加载,并通过权限控制确保用户只看到被授权访问的选项卡。",
      archTitle: "Hub-and-Spoke架构",
      archIntro:
        "仪表板中心使用Hub-and-Spoke模式,其中主DashboardView作为中心Hub渲染选项卡栏,每个选项卡懒加载一个独立的特定领域视图(Spoke)。概览选项卡内联以实现即时渲染。审计、安全和分析选项卡通过React.lazy按需加载,配合Suspense后备方案。",
      archTip:
        "子视图仅在其选项卡首次激活时才进行懒加载。与急切加载所有四个视图相比,这将初始仪表板包减少约60%。",
      domainTitle: "领域分离 (接口分离原则)",
      domainIntro:
        "此前,所有仪表板数据通过单个DashboardRepository(上帝接口)流动,该接口有8个以上方法,涵盖审计、安全和分析关注点。重构后的架构将每个领域提取到独立模块中,拥有自己的仓库接口,消除了单体耦合,遵循接口分离原则(ISP)。",
      domainNote:
        "在DashboardEntities.ts中保留了向后兼容的类型别名,供尚未迁移到新领域特定导入的遗留组件使用。这些别名标记为@deprecated以指导未来清理。",
      layersTitle: "6层清洁架构",
      layersIntro:
        "每个提取的模块(审计、安全、分析)都实现了SCRIPE前端完整的清洁架构堆栈。6层确保严格的职责分离:模型保存原始API响应形状,实体是具有计算属性的丰富领域对象,接口定义契约,服务通过IApiService处理HTTP调用,仓库编排服务和映射器以返回领域实体,映射器执行DTO到实体的转换并进行null合并。",
      diTitle: "DI容器连接",
      diIntro:
        "所有三个新模块都注册在SystemContainer(modules/system/di.ts)中。每个模块遵循以下模式:服务(接收IApiService)→ 仓库(接收服务)→ SystemContainer接口声明 → 懒getter导出。ViewModel专门通过DI容器消费仓库——从不直接实例化服务。",
      diTip:
        "systemContainer访问器中的懒getter确保服务和仓库仅在首次访问时实例化,防止从未打开的选项卡产生不必要的网络开销。",
      viewmodelTitle: "ViewModel解耦",
      viewmodelIntro:
        "每个ViewModel钩子现在从DI容器导入其专用仓库,而不是共享单个仪表板仓库。这消除了跨领域耦合:useAuditViewModel仅消费auditRepository,useSecurityDashboardViewModel仅消费securityRepository,useTenantAnalyticsViewModel仅消费analyticsRepository。",
      hubTitle: "选项卡Hub实现",
      hubIntro:
        "DashboardView组件作为Hub,渲染包含4个TabsTrigger元素的TabsList(概览、审计、安全、分析)。审计和安全选项卡基于当前管理员的权限使用usePermission钩子进行条件渲染。",
      hubNote:
        "选项卡可见性在前端通过权限控制仅用于UX目的(隐藏用户无法访问的选项卡)。后端端点强制执行实际的安全边界——前端检查是补充性的,而非权威性的。",
      cachingTitle: "租户感知缓存",
      cachingIntro:
        "Hub中所有TanStack Query键都包含当前tenantId作为分区键。这确保当超级管理员使用'进入租户世界'钻取功能切换租户时,所有仪表板数据会自动失效并重新获取新租户上下文的数据。",
      compatTitle: "向后兼容性",
      compatIntro:
        "为防止迁移期间的构建错误,DashboardEntities.ts保留了已弃用的类型别名,这些别名从新的领域特定模块重新导出类型。仍从仪表板模块实体文件导入的组件将继续工作,但会收到TypeScript弃用警告,引导开发人员使用规范的导入路径。",
      compatWarning:
        "一旦所有消费组件迁移到从各自的领域模块(audit/security/analytics)导入后,应在未来的清理中移除已弃用的别名。",
      sourceTitle: "源文件参考",
      sourceIntro:
        "重构后的仪表板中心横跨4个模块(dashboard、audit、security、analytics),每个模块都有自己完整的6层堆栈。",
    },
  },
};
