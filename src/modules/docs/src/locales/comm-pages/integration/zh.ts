/**
 * Docs integration — ZH
 * Auto-filled 28 keys from EN.
 */
export const zh = {
  commercial: {
    apiDesign: {
      conventionsTitle: "企业级约定",
      description: "探索驱动 SCRIPE 的严格 RESTful API 设计原则、强制版本控制和可预测的命名约定。",
      errorTitle: "标准化的错误处理",
      intro:
        "SCRIPE 的 API 接口专为规模化和可预测性而设计。从一致的命名约定到标准化的分页，再到用于错误处理的 RFC 7807 问题详细信息，我们的无状态 RESTful 架构确保了下游消费者的无缝集成。",
      pipelineContent:
        "API 管道利用了高度优化的 AstraFlow mediator 请求生命周期。每个端点在执行任何业务逻辑之前，都会自动继承验证、性能跟踪、缓存和审计日志记录功能。",
      pipelineTitle: "强大的请求管道",
      resultContent:
        "SCRIPE 通过统一的 Result 模式消除了 try-catch 嵌套地狱。每个 API 响应都有严格的类型约束并在数学上可预测，确保无论访问哪个模块，消费者都能收到包装了相同 JSON 响应结构的标准 HTTP 状态码。",
      resultTitle: "可预测的 Result 模式",
      statusCodesTitle: "语义化状态码",
      swaggerContent:
        "探索实时 Swagger/OpenAPI 3.0 文档，即刻与 400 个以上的预配置端点进行交互。我们生成严格的 OpenAPI 规范，从而为前端和移动平台实现无缝的 SDK 生成。",
      swaggerTitle: "交互式 Swagger UI",
      title: "API 设计与架构",
    },
    emailIntegration: {
      bilingual: "双语模板路由",
      bilingualDesc:
        "自动检测租户语言环境，并从严格分类的模板中分发高度个性化的阿拉伯语 (RTL) 或英语 (LTR) HTML 电子邮件。",
      configTitle: "动态 SMTP 配置",
      description: "基于队列的异步事务性电子邮件分发，配备丰富且可定制的 Scriban 模板引擎。",
      featuresTitle: "企业级交付功能",
      intro:
        "事务性通信绝不应该阻塞 API 请求。SCRIPE 包含一个基于发件箱模式 (Outbox-pattern) 和队列的调度系统，利用后台工作进程，通过标准 SMTP 或 SendGrid、Mailgun 等直接 REST API，保证超高速、可靠的电子邮件交付。",
      pipelineTitle: "事务性管道",
      providersTitle: "与传输提供商无关",
      queueBased: "后台调度",
      queueBasedDesc:
        "API 严格在 50 毫秒内响应，繁重的字符串操作和外部网络调用则委托给持久性的后台服务。",
      retryLogic: "指数退避 (Exponential Backoff)",
      retryLogicDesc:
        "利用内置的、可配置的弹性重试策略，优雅地处理临时网络分区或外部提供商的速率限制。",
      templatesContent:
        "直接在电子邮件布局中编写逻辑。使用极其快速的 Scriban 模板语言，您可以在内容中安全地执行 if/else 条件块、遍历项目并完美地格式化日期，而不会将业务逻辑泄漏到应用层中。",
      templatesTitle: "智能 Scriban 模板",
      title: "弹性的电子邮件基础设施",
      tracking: "审计与交付跟踪",
      trackingDesc:
        "记录发送的每封电子邮件的调度 ID、精确时间戳和提供商响应，创建不可否认的审计跟踪。",
    },
    messageTemplates: {
      bilingualContent:
        "每个模板原生理解用户的上下文。发送完全相同的事务负载，引擎会评估接收者的偏好区域设置，瞬间生成格式精美的 RTL 阿拉伯语或 LTR 英语通信内容。",
      bilingualTitle: "智能上下文渲染",
      builtInTitle: "预配置的系统模板",
      description:
        "用于本地化电子邮件、SMS、通知和 PDF 文档生成的，由 Scriban 驱动的图灵完备 (Turing-complete) 的动态模板引擎。",
      engineContent:
        "为什么要为了更改电子邮件的主题行而重新编译代码？SCRIPE 利用 Scriban——一种速度极快、兼容 Liquid 的模板语言。它安全地直接在内容中评估 if/else 逻辑、字符串操作和数据循环，执行时间不到一毫秒。",
      engineTitle: "图灵完备的模板引擎",
      intro:
        "客户通信必须是动态的、深度个性化的且可即时部署。SCRIPE 使用高度安全的沙盒模板引擎将通信标记 (markup) 与底层应用程序逻辑解耦。",
      managementTitle: "统一的模板中心",
      previewContent:
        "开发人员和产品所有者可以通过集成的实时预览界面即时迭代模板设计。注入模拟的 JSON 数据以测试复杂的逻辑循环和错误处理，完全无需部署代码。",
      previewLive: "实时数据注入",
      previewLiveDesc: "通过向沙盒提供动态数据对象，直观地可视化确切的渲染输出。",
      previewTitle: "实时沙盒环境",
      previewVariables: "安全的模型绑定",
      previewVariablesDesc: "只有明确允许的 ViewModels 才能被模板访问，保证了数据安全。",
      title: "动态消息模板",
    },
    restApiOverview: {
      authContent:
        "每一个控制器在默认情况下都是被锁定的。SCRIPE 采用强健的 JWT 令牌验证，在返回哪怕一个字节的 JSON 数据之前，都需要精确的细粒度权限和经过验证的租户声明 (claims)。",
      authTitle: "严格的加密授权",
      controllersTitle: "严谨的控制器拓扑",
      description:
        "一个完美无瑕、有完整文档支持的 RESTful API 表面，支持动态过滤、基于游标的分页，以及丰富的 HATEOAS 响应。",
      intro:
        "后端不仅仅是数据库的包装器；它是一个精心设计的 HTTP 交互面。SCRIPE 暴露了一个纯净的 RESTful API，严格遵守标准的 HTTP 谓词、状态码和超媒体约定。",
      lstSwagI1: "自动从控制器特性 (Attributes) 和 XML 文档生成",
      lstSwagI2: "“Try-it-out” 模式，用于直接测试端点",
      lstSwagI3: "在 Swagger UI 中支持 JWT 身份验证",
      lstSwagI4: "带有示例的请求/响应模式文档",
      lstSwagI5: "按控制器分组，方便快速导航",
      lstSwagI6: "在开发模式下通过 /swagger 访问",
      paginationTitle: "游标 (Cursor) 与偏移量 (Offset) 分页",
      responseContent:
        "无需再解析随机错误字符串了。每一个 API 响应——无论是成功还是灾难性失败——都被封装在我们标准化的 `Result<T>` Problem Details 结构中，确保前端和第三方消费者拥有绝对的可预测性。",
      responseTitle: "标准化且可预测的有效载荷",
      swaggerContent:
        "我们在运行时直接从 C# 源代码生成全面、带有深度注释的 Swagger (OpenAPI 3.0) 文档。在系统启动的瞬间，开发人员就可以在浏览器中交互式地测试经过身份验证的负载请求。",
      swaggerTitle: "交互式 OpenAPI 门户",
      tblCtrlHeader1: "控制器",
      tblCtrlHeader2: "端点数",
      tblCtrlHeader3: "描述",
      tblCtrlR10C1: "SettingsController",
      tblCtrlR10C2: "4",
      tblCtrlR10C3: "系统全局设置与租户专用设置",
      tblCtrlR11C1: "DashboardController",
      tblCtrlR11C2: "3",
      tblCtrlR11C3: "KPI 数据、图表数据及数据汇总",
      tblCtrlR12C1: "WebhookController",
      tblCtrlR12C2: "5",
      tblCtrlR12C3: "订阅管理与事件目录",
      tblCtrlR13C1: "RecycleBinController",
      tblCtrlR13C2: "4",
      tblCtrlR13C3: "软删除项的管理、恢复与彻底清除 (Purge)",
      tblCtrlR14C1: "EditionsController",
      tblCtrlR14C2: "11",
      tblCtrlR14C3: "版本 CRUD、功能、版本控制、发布",
      tblCtrlR15C1: "FeaturesController",
      tblCtrlR15C2: "5",
      tblCtrlR15C3: "功能 CRUD、值类型、系统功能",
      tblCtrlR16C1: "SubscriptionsController",
      tblCtrlR16C2: "12",
      tblCtrlR16C3: "分配、升级、降级、生命周期、影响分析",
      tblCtrlR17C1: "TenantFeaturesController",
      tblCtrlR17C2: "4",
      tblCtrlR17C3: "基于租户的覆盖、已解析功能",
      tblCtrlR1C1: "AuthController",
      tblCtrlR1C2: "8",
      tblCtrlR1C3: "登录、注册、2FA、密码重置、会话管理",
      tblCtrlR2C1: "UserController",
      tblCtrlR2C2: "27",
      tblCtrlR2C3: "CRUD、批量操作、企业级管理",
      tblCtrlR3C1: "RoleController",
      tblCtrlR3C2: "12",
      tblCtrlR3C3: "角色管理、权限分配",
      tblCtrlR4C1: "TenantController",
      tblCtrlR4C2: "10",
      tblCtrlR4C3: "租户生命周期、配置、激活",
      tblCtrlR5C1: "AuditController",
      tblCtrlR5C2: "6",
      tblCtrlR5C3: "审计日志查询、导出、数据流传输",
      tblCtrlR6C1: "NotificationController",
      tblCtrlR6C2: "5",
      tblCtrlR6C3: "推送通知、标记已读、偏好设置",
      tblCtrlR7C1: "FileController",
      tblCtrlR7C2: "4",
      tblCtrlR7C3: "文件上传、下载、删除、元数据获取",
      tblCtrlR8C1: "TemplateController",
      tblCtrlR8C2: "5",
      tblCtrlR8C3: "邮件/消息模板的 CRUD 操作及预览",
      tblCtrlR9C1: "MenuController",
      tblCtrlR9C2: "6",
      tblCtrlR9C3: "动态菜单管理及覆盖设置",
      title: "RESTful API 表面",
    },
    ssoEnterprise: {
      brandingContent:
        "Deliver a seamless, uncompromising login aesthetic. Tenant administrators simply configure their external SSO within the UI, and the login interface autonomously generates flawlessly styled, tenant-bound SSO buttons ensuring user trust.",
      brandingTitle: "Architected for Corporate Branding",
      comparisonTitle: "How SCRIPE Compares",
      description:
        "集中账户访问权限。将企业目录原生对接至 SCRIPE 的多租户认证体系，实现零门槛接驳。",
      intro:
        "企业级安全需要集中化的信任。SCRIPE 的 SSO 服务让您的租户可以放心地将身份验证工作交由他们原有的身份提供商 (IdP) 完成，与此同时依然维系绝对的租户隔离和完备的权限控制。",
      linkingContent:
        "告别繁琐的邮件邀请函。一旦员工通过企业 SSO 完成初次验证，系统会在后台悄无声息地进行邮箱印证，并将其与既有的 SCRIPE 管理权与本地 RBAC（基于角色的权限控制）合二为一。",
      linkingTitle: "无痕身份同步",
      multiIdpContent:
        "Legacy platforms often bind identity to the root infrastructure, forcing all tenants to share an IdP, or requiring massively complex infrastructure scaling. SCRIPE natively supports infinite, uniquely mapped Identity Providers per tenant—all governed through the integrated Admin UI without touching the deployment pipeline.",
      multiIdpTitle: "Infinite Multi-IdP Per Tenant",
      oauth1Desc:
        "Server-side applications with secure backend storage for client secrets. Perfect for B2B API integrations enforcing the full Authorization Code flow with PKCE.",
      oauth1Title: "Confidential Clients (Backend)",
      oauth2Desc:
        "React, Vue, iOS, and Android applications that cannot securely store static secrets. Strictly leverages the PKCE-only flow, ensuring access tokens are generated flawlessly without risking a compromised client secret.",
      oauth2Title: "Public Clients (SPA & Mobile)",
      oauthAppsContent:
        "释放生态潜能。允许企业合作伙伴通过注册无限量的 OAuth 应用 (Web/Desktop/SPA) 接入您的平台，程序化授予接口权限并精准掌控令牌注销机制。",
      oauthAppsTitle: "第三方 OAuth 应用网关",
      oauthContent:
        "Invert the identity paradigm. By registering third-party software as OAuth Applications within SCRIPE, you instantly transform your application into a centralized enterprise Identity Provider. Mobile applications, partner portals, and decoupled internal microservices can all aggressively rely on SCRIPE for unified identity resolution.",
      oauthTitle: "OAuth Application Registry (SCRIPE as Server)",
      oidcContent:
        "即插即用 Azure Active Directory (Entra ID)、Okta、Auth0、Google Workspace 乃至任何兼容 OpenID Connect 的平台。复杂的密码学交换我们包办，留给用户的仅仅是“一键登录”。",
      oidcTitle: "全生态 OIDC 兼容",
      pkceSecurityContent:
        "坚决摒弃脆弱过时的协议流。不管是网页应用还是原生移动端，SCRIPE 强制每笔 OAuth 交互必须携带 PKCE (Proof Key for Code Exchange) 防护，100% 免疫授权码拦截攻击。",
      pkceSecurityTitle: "PKCE 防御机制",
      protocolsContent:
        "SCRIPE mandates adherence to immutable industry standards, ensuring frictionless topological compatibility with every major identity provider globally.",
      protocolsTitle: "Supported Authentication Protocols",
      securityModelContent:
        "The deprecated Implicit Flow is eradicated. Every SSO login flows exclusively through PKCE (Proof Key for Code Exchange), the definitive standard dictated by OAuth 2.1. Authorization codes are strictly one-time-use, instantly exchanged server-side, with full discovery document caching.",
      securityModelTitle: "PKCE Security Architecture",
      tenantIsolationContent:
        "每一个 SSO 的配置都被严格锁定在其拥有者的租户内部。在同一个平台上，A 公司可以通过它专属的 Entra ID 登录，而 B 公司则走它的 Okta——彼此数据永远不可见、不可跨越。",
      tenantIsolationTitle: "专有租户身份引擎",
      title: "企业单点登录 (Enterprise SSO)",
      val1Desc:
        "Every authentication flow is fortified with stringent PKCE (Proof Key for Code Exchange) validation. We enforce strict state-checking to thwart CSRF attacks and encrypt all latent client secrets at rest. Secret keys never touch the browser.",
      val1Title: "Zero-Trust Identity Protocol",
      val2Desc:
        "Employees and B2B clients sign in instantly with their existing corporate credentials. Connect Azure AD, Google Workspace, Okta, or AWS Cognito directly from the Admin Panel in exactly 30 seconds—no custom backend middleware required.",
      val2Title: "Zero-Code Federation (IdP)",
      val3Desc:
        "Why pay for Auth0 or deploy Keycloak? Turn SCRIPE into your primary authentication broker. Register distinct OAuth applications (SPAs, Mobile Apps, external dashboards) to securely consume SCRIPE's JWTs.",
      val3Title: "SCRIPE as the Identity Server",
      val4Desc:
        "B2B SaaS superpower: Every single tenant can configure their own isolated SSO providers. Tenant A's Azure AD is mathematically invisible to Tenant B's Google Workspace. SuperAdmins can also provide Global SSO fallbacks.",
      val4Title: "Absolute Tenant IAM Isolation",
      val5Desc:
        "Every configured Identity Provider dynamically renders on the login screen with custom hex colors, branded labels, and distinct vectorized SVGs perfectly matching the tenant's brand identity.",
      val5Title: "White-Labeled Login Experience",
      val6Desc:
        "SCRIPE relies entirely on the battle-tested OpenIddict framework for robust OIDC and OAuth 2.0 compliance, with planned architecture expansions into SAML 2.0 for legacy government system compliance.",
      val6Title: "Future-Proof Standardization",
      valueTitle: "Strategic IAM Value",
    },
    webhookIntegration: {
      description:
        "一个具有超高弹性的、异步的、事件驱动的 Webhook 调度程序，可实现与庞大外部 API 的安全、即时的数据同步。",
      eventsTitle: "全局广播的受支持事件",
      intro:
        "现代企业系统必须能够相互通信。SCRIPE 包含一个原生、极其高效的传出 Webhook 调度程序，而不是强迫客户端积极地轮询 (polling) 您的 REST API。通过 HTTPS 将关键领域事件安全、即时地推送到任何外部系统。",
      logsTitle: "法证级调度审计",
      managementTitle: "动态订阅管理",
      retryContent:
        "如果订阅者的服务器离线，SCRIPE 不会丢弃有效载荷。它利用智能的、带指数退避的持久性发件箱 (outbox) 模式，在数学层面自动重试请求（例如，5 秒，1 分钟，1 小时，1 天），直到通过 HTTP 2xx 状态确认收到为止。",
      retryTitle: "持久的指数退避",
      securityContent:
        "每个发出的有效载荷都使用从租户密钥生成的 HMAC-SHA256 签名进行安全签名。第三方集成平台可以确切验证 Webhook 确实源自您的 SCRIPE 服务器，并且有效载荷在全局范围内未被拦截或更改。",
      securityTitle: "HMAC 加密签名",
      title: "高容量 Webhook 调度",
    },
  },
};
