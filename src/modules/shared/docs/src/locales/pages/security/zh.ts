/**
 * Docs security — ZH
 * Auto-filled 25 keys from EN.
 */
export const zh = {
  security: {
    overview: {
      title: "安全概述",
      description: "五层纵深防御策略、安全特性、CORS 配置、限流与密码策略。",
      intro:
        "SCRIPE 采用纵深防御 (Defense-in-depth) 策略，分为：网络保护、身份验证、授权、数据隔离和审计日志。",
      layersTitle: "安全防御层",
      featuresTitle: "安全特性",
      featureJwt: "JWT 认证",
      featureJwtDesc: "短期访问令牌自动刷新，使用 HMAC-SHA256 签名。",
      feature2fa: "双因素认证 (2FA)",
      feature2faDesc: "基于 TOTP 的 2FA 以及备用恢复代码。",
      featureRbac: "RBAC 权限",
      featureRbacDesc: "基于策略的 PBAC 引擎，统一管理 RBAC、GBAC 和 ABAC，实现零延迟内存校验。",
      featureRateLimit: "限流 (Rate Limiting)",
      featureRateLimitDesc: "四层限流防御：全局 DDoS、单 IP、特定端点以及登录重试限制。",
      featureAudit: "审计日志",
      featureAuditDesc: "所有的增删改查都被持久化记录，支持 SignalR 实时广播。",
      featureCors: "CORS 配置",
      featureCorsDesc: "生产环境严格校验来源，开发环境开放 Localhost。",
      corsTitle: "CORS 跨域配置",
      corsIntro: "针对开发和生产环境提供截然不同的 CORS 策略保障安全。",
      rateLimitTitle: "限流策略",
      passwordTitle: "密码策略",
      securityWarning: "部署到生产环境前，务必审查并修改默认的安全机密配置 (Secrets) 及 CORS 源。",
    },
    authDeep: {
      title: "深入身份验证",
      description:
        "JWT 生命周期、BCrypt 哈希、账户锁定、2FA、OAuth、OTP 系统及模拟登录 (Impersonation)。",
      intro: "本页深入探讨 SCRIPE 的验证机制细节，从令牌颁发到会话状态管理。",
      jwtLifecycleTitle: "JWT 令牌生命周期",
      jwtLifecycleIntro: "短期 Access Token，长期且使用后即轮换作废的 Refresh Token。",
      tokenStructureTitle: "JWT 结构",
      bcryptTitle: "BCrypt 密码哈希",
      bcryptIntro: "配置合适的工作因子（默认为 12）来故意减慢哈希速度，抵御彩虹表及暴力破解攻击。",
      lockoutTitle: "账户锁定 (Lockout)",
      lockoutIntro: "连续 5 次错误后账户将被封锁 15 分钟。",
      tfaTitle: "双因素身份验证 (TOTP)",
      tfaIntro: "登录后返回临时 2FA Session Token，只有验证通过后才换发 JWT。",
      externalAuthTitle: "外部身份验证 (OAuth)",
      externalAuthIntro: "集成主流 OAuth 提供商，支持服务器端凭证校验。",
      otpTitle: "OTP 系统 (动态口令)",
      otpIntro: "用于邮箱、短信验证及密码重置流程。具备高强度随机生成和过期校验。",
      impersonationTitle: "身份模拟 (Impersonation)",
      impersonationIntro:
        "超级管理员可切换至其他管理员的视角以排查问题，并保留了不可篡改的模拟者审计日志。",
      impersonationWarning: "一项极高权限的操作，具有限制条件且无法模拟同级或拥有保护标签的账户。",
      sessionTitle: "会话管理",
      sessionIntro: "采用无状态 JWT 机制，不在服务器内存中保留用户会话，提高了并发性能。",
      cookieAuthTip:
        "为获得最佳安全性，请配置通过 HttpOnly 且 SameSite=Strict 的 Cookie 来传输 Refresh Token。",
    },
    sso: {
      samlTitle: "SAML 2.0 集成与加密验证",
      samlContent:
        "平台支持使用 ITfoxtec.Identity.Saml2 库进行 SAML 2.0 单点登录 (SSO)。当作为服务提供商 (SP) 时，将生成并通过重定向绑定发送 AuthnRequest。对于 ACS 回调，使用以 base64 格式存储的公共 X.509 证书（使用 X509CertificateLoader）验证 XML 签名。跳过证书链验证和吊销检查 (None/NoCheck)，以允许企业自签名证书。当作为身份提供商 (IdP) 时，向第三方应用发布已签名的 SAML XML 断言。",
      oidcCallbackTitle: "OIDC 回调与工作区选择缓存",
      oidcCallbackContent:
        "ProcessOidcCallbackCommandHandler 通过 AES-256 解密提供商 ID 并使用授权码交换声明来处理传入 of OIDC 回调。如果用户邮箱对应多个活动管理员工作区，SSO 登录选择状态 (SsoTempLoginData) 将缓存在 Redis 的 'sso-login-selection:{tempToken}' 下，有效期 15 分钟，以防止原始参数篡改。单一工作区匹配将绕过此选择，直接签发最终的 7 天 JWT 访问和刷新令牌。",
      oauthMirroringTitle: "OAuth 客户端镜像与配额验证",
      oauthMirroringContent:
        "出站 OAuth 应用程序的注册通过 QuotaService 验证租户范围的订阅配额。客户端 ID 使用租户特定的品牌设置作为前缀，机密客户端密钥安全生成（256 位加密随机数）且仅显示一次。应用程序注册与 OpenIddict 存储完全同步，并镜像到本地 OAuthApplication 数据库表中，其中的密钥已屏蔽以提高性能和租户隔离。",
      title: "单点登录 (SSO)",
      description: "OIDC 身份验证，外部身份绑定及 OAuth 应用集成。",
      intro:
        "SCRIPE 系统支持基于 OIDC 协议的外部提供商进行身份验证，并通过 OAuth 应用安全下发凭证。系统完美融合了租户隔离机制与严格的 PKCE 安全保护。",
      architectureTitle: "OIDC / OAuth 验证架构",
      endpointsTitle: "端点与流程 (Flows)",
      flowIntro: "SSO 登录环节包含一个提供最高安全保障的多步握手流程：",
      authEndpointTitle: "1. 授权端点 (Authorize)",
      authEndpointDesc:
        "将用户重定向至外部 IdP 的登录页。在此步骤系统将注入 PKCE 验证码与防伪装态 (State) 参数。",
      callbackEndpointTitle: "2. 回调端点 (Callback)",
      callbackEndpointDesc:
        "在用户成功验证后接收其返回，并在服务端静默使用授权码对换 Token，全程无需浏览器干预。",
      linkingTitle: "身份绑定处理机制",
      linkingIntro:
        "在成功登录后，系统会自动侦测数据库比对邮箱。如果是该用户的首次登录，其 OIDC 身份记录将瞬间融合并绑定到内部 SCRIPE 账户，从而杜绝数据重复割裂。",
      pkceWarning:
        "隐式 (Implicit) OAuth 流已被废弃剔除。PKCE 协议现在已强制应用在任何形式的授权机制中。",
      howItWorksTitle: "How SSO Works",
      howItWorksContent:
        "SCRIPE uses the Authorization Code Flow with PKCE (Proof Key for Code Exchange) for SSO. This is the most secure OAuth2 flow, recommended by the OAuth 2.1 specification for all client types.",
      step1Title: "1. Provider Discovery",
      step1Content:
        "The login page fetches available SSO providers via GET /auth/oidc/providers/admin. Only enabled providers for the current login context (admin/user) are returned.",
      step2Title: "2. PKCE Challenge",
      step2Content:
        "When the user clicks an SSO button, the frontend calls POST /auth/oidc/challenge. The backend generates a code_verifier, computes the code_challenge (SHA-256), and returns the authorization URL.",
      step3Title: "3. IdP Redirect",
      step3Content:
        "The frontend stores PKCE state (code_verifier, state, providerId) in sessionStorage, then redirects the user to the external IdP's authorization endpoint.",
      step4Title: "4. User Authentication",
      step4Content:
        "The user authenticates at the external IdP (Azure AD, Google, Okta, etc.) and grants consent for the requested scopes.",
      step5Title: "5. Callback & Token Exchange",
      step5Content:
        "The IdP redirects to /sso/callback with an authorization code. The frontend retrieves PKCE state from sessionStorage, validates the state parameter, and calls POST /auth/oidc/callback. The backend exchanges the code for tokens using the code_verifier.",
      pkceTitle: "PKCE Security Model",
      pkceContent:
        "PKCE prevents authorization code interception attacks by ensuring that only the client that initiated the flow can exchange the code. The code_verifier is never sent over the network — only its SHA-256 hash (code_challenge) is sent during the challenge step.",
      entityModelTitle: "Identity Provider Entity",
      entityModelContent:
        "The IdentityProvider entity stores all OIDC configuration for an external IdP. Each provider is optionally scoped to a tenant (TenantId = null means system-wide).",
      linkingContent:
        "Before SSO login works, a SCRIPE admin/user must link their account to the external identity. This creates an ExternalLogin record mapping the provider's subject ID to the SCRIPE account.",
      oauthAppsTitle: "OAuth Applications",
      oauthAppsContent:
        "OAuth Applications are third-party apps that authenticate against SCRIPE as an OIDC server. Each app gets a Client ID and Client Secret, with configurable redirect URIs, scopes, and PKCE enforcement.",
      claimMappingTitle: "Claim Mapping",
      claimMappingContent:
        "When an external IdP uses non-standard claim names, the ClaimMappingJson field maps them to SCRIPE's expected claims. If null, standard OIDC claim names (sub, email, name) are used.",
      tenantScopingTitle: "Tenant Scoping",
      tenantScopingContent:
        "Identity Providers are tenant-scoped via the TenantId column. Providers with null TenantId are system-wide (available to all tenants). The backend automatically filters providers by the current admin's tenant context.",
      tenantScopingNote:
        "Host admins can manage any tenant's SSO providers by using the 'Enter Tenant World' feature from the Tenants page. This scopes all API calls to the target tenant without needing to log in as that tenant's admin.",
      apiTitle: "API Endpoints",
    },
    dataProtection: {
      title: "数据保护",
      description: "租户隔离、静态与传输加密、字段级控制、ID 加密及 GDPR 合规。",
      intro: "SCRIPE 在每一层保护数据——从传输层加密到 ORM 级别的行数据隔离。",
      tenantIsolationTitle: "租户数据隔离",
      tenantIsolationIntro: "通过 EF Core 全局查询过滤器，所有的数据库读取均自动挂载租户限定条件。",
      tenantScopingTitle: "查询过滤器作用域",
      tenantServicesTitle: "感知租户的服务 (Tenant-Aware Services)",
      tenantServicesIntro:
        "服务层通过注入 IDataScopeService 直接获取租户上下文，而不是依赖请求头。",
      dataAtRestTitle: "静态数据加密 (Data at Rest)",
      dataAtRestIntro:
        "采用数据库级的 TDE 加密，并结合 ASP.NET Core Data Protection API 加密特定机密字段。",
      dataInTransitTitle: "传输中数据加密",
      dataInTransitIntro: "强制 TLS 1.2+ 加密并在生产环境启用了 HSTS 策略。",
      restrictedFieldsTitle: "受限字段 (字段级安全)",
      restrictedFieldsIntro:
        "FieldProjectionMiddleware 在 JSON 序列化阶段，拦截并擦除越权访问的敏感属性。",
      idEncryptionTitle: "ID 加密",
      idEncryptionIntro: "可选将数据库的 Guid ID 进行 AES-256 加密后再返回给客户端，防止枚举攻击。",
      gdprTitle: "GDPR 合规性",
      gdprIntro: "SCRIPE 提供 GDPR 合规机制，包含数据可移植性、被遗忘权、同意跟踪等。",
      rightToDeleteTitle: "被遗忘权 (Right to Delete)",
      dataPortabilityTitle: "数据可移植性",
      consentTitle: "同意管理",
      retentionTitle: "数据保留策略",
      auditTrailTitle: "合规审计追踪",
      bypassWarning:
        "IgnoreQueryFilters() 会绕过隔离系统，请必须配合 .Where(e => e.TenantId) 一起使用防范越权。",
    },
    apiSecurity: {
      title: "API 安全",
      description: "限流、CORS、输入验证、CSRF 保护、安全响应头及防重放攻击。",
      intro: "SCRIPE 的 API 面向互联网，其防御了多种常见的 Web 攻击向量。",
      rateLimitTitle: "限流 (Rate Limiting)",
      rateLimitIntro: "使用 ASP.NET Core 内置限流中间件提供 4 层网络防护策略。",
      corsTitle: "跨域配置",
      corsIntro: "严格控制 Allowed Origins 和 HTTP 谓词限制。",
      inputValidationTitle: "输入验证 (Input Validation)",
      inputValidationIntro: "集成 FluentValidation 在 SCRIPE mediator 管道层进行数据清洗拦截。",
      csrfTitle: "CSRF 防护",
      csrfIntro: "得益于 Bearer 令牌及 SameSite=Strict 的机制，API 天然具备抗 CSRF 的特性。",
      headersTitle: "安全响应头",
      headersIntro: "注入 X-Content-Type-Options, X-Frame-Options 以及 CSP 等一系列标头。",
      headersTip: "使用 securityheaders.com 测试，默认配置应达到 A+ 评级。",
      replayTitle: "防重放攻击",
      replayIntro: "短暂访问令牌、单次使用及滚动刷新的令牌设计使得重放攻击难以奏效。",
    },
    middlewarePipeline: {
      title: "中间件管道 (Middleware Pipeline)",
      description: "按特定顺序执行的 11 个中间件组件——从异常拦截到字段投影过滤。",
      intro: "SCRIPE 的 HTTP 请求管道以严谨的次序进行排列。每一步都可以短路失败以阻断攻击。",
      overviewTitle: "管道概述",
      overviewIntro: "请求自顶向下流动。顺序不容有错——例如租户上下文必须在身份验证之后建立。",
      globalExceptionTitle: "1. 全局异常处理 (Global Exception Handler)",
      globalExceptionIntro: "捕获 500 异常并在生产环境中隐蔽 Stack Trace，以防泄露系统内部结构。",
      correlationIdTitle: "2. 关联 ID (Correlation ID)",
      correlationIdIntro: "为所有分布式日志和审计附带 X-Correlation-ID 实现全链路追踪。",
      requestLoggingTitle: "3. 请求日志记录",
      requestLoggingIntro: "使用 Serilog 捕获元数据，并对登录、密码修改等敏感接口隐去 Body 参数。",
      cookieAuthTitle: "4. Cookie 转 Bearer 令牌",
      cookieAuthIntro: "抽取前端传来的 HttpOnly Cookie 注入到 Authorization 标头中供后续鉴权。",
      tenantContextTitle: "5. 租户上下文 (Tenant Context)",
      tenantContextIntro: "最关键的一步，提取租户 ID 确立全局数据的请求边界限制。",
      tenantContextNote: "此中间件如果先于验证中间件注册，将会因为无法获取令牌而导致整站崩溃。",
      cacheHeadersTitle: "6. 缓存标头控制",
      cacheHeadersIntro: "针对 API 下发 no-cache；针对静态文件下发 max-age 和 ETag。",
      fieldProjectionTitle: "7. 字段投影限制 (Field Projection)",
      fieldProjectionIntro: "清理响应 JSON，移除该用户角色无权访问的数据字段。",
      observabilityTitle: "可观测性中间件 (Observability)",
      observabilityIntro: "汇集 OpenTelemetry 链路与指标给 Prometheus 拉取使用。",
      registrationTitle: "注册顺序",
      registrationIntro: "由 Program.cs 控制的核心排列顺序。",
      summaryTitle: "中间件清单摘要",
      orderWarning: "轻易更改中间件顺序将导致不可预知的安全真空或级联崩溃。",
    },
    auditCompliance: {
      title: "审计与合规 (Audit & Compliance)",
      description: "完整审计管道、实体跟踪、SignalR 流式推送、CSV/Excel/PDF 导出和合规功能。",
      intro: "完整记录每次数据修改和每次 API 请求的审计日志。",
      architectureTitle: "审计架构",
      architectureIntro:
        "审计系统由 HTTP 请求日志记录和数据库级别的实体变更拦截组成。请求元数据通过 RequestLoggingMiddleware 在主机级别异步记录，而数据库更改由 AuditableEntityInterceptor 在 SaveChanges 之前捕获。",
      interceptorTitle: "实体变更拦截器",
      interceptorIntro:
        "AuditableEntityInterceptor 挂载到 EF Core 的 SaveChangesAsync 管道中。对于每个新增、修改或删除的实体（包括软删除），它将旧值和新值捕获为 JSON，并记录执行用户和时间戳。它会跳过 AuditLog 实体本身以防止无限递归。",
      auditLogEntityTitle: "审计日志实体结构",
      signalrTitle: "SignalR 实时大屏流",
      signalrIntro:
        "审计日志通过 SignalR 的 AuditHub 实时推送。已连接的管理员客户端在数据修改时可立即接收到实时通知，从而支持实时监控仪表盘的展示。",
      exportTitle: "审计数据导出",
      exportIntro: "用于企业存档、Excel 加工和 PDF 文件合规性归档。",
      exportDetail:
        "AuditExportService 提供多格式导出。CSV 导出使用 CsvHelper，并对所有字段强制使用双引号以防范 CSV 注入攻击（RFC 4180），同时附带 UTF-8 BOM 以前置适配 Excel。Excel 导出利用 ClosedXML 引擎生成包含三个工作表的工作簿：Executive Summary（KPI 和图表数据）、Audit Data（包含自动筛选器、冻结首行以及绿色/红色的条件格式）和 Security Analysis. PDF 导出基于 QuestPDF 引擎，针对大型数据集标记为废弃（Obsolete）以避免过高内存消耗。出于资源保护的目的，所有导出行为均限制在 10,000 行以内，并在发送前完整在内存中进行缓冲。",
      queryApiTitle: "查询与导出 API",
      queryApiIntro: "高性能的数据筛查查询端点，仅限授权的审计员或管理层使用。",
      scopingTitle: "层级租户范围和安全隔离",
      scopingDetail:
        "数据隔离在查询执行期间强制执行。DataScopeService 基于严格的优先级链确定管理员的有效范围：ContextTenant（通过 AES 加密标头进行穿透）、权限重写、SystemProtectedAdmin、Hierarchy（包括子租户）或 OwnTenant。后代通过物化路径在常数时间内遍历，这被翻译为索引 SQL LIKE 查询。存储库应用 AuditByTenantScopeSpec 以确保使用 'WHERE TenantId IN (...)' 进行过滤，而按记录 ID 进行的直接查询通过 GetAuditLogDetailQueryHandler 验证，以防止水平权限提升。",
      querySearchDesc: "分页过滤查询。",
      queryExportCsvDesc: "导出 CSV 数据格式。",
      queryExportExcelDesc: "导出 Excel 格式。",
      queryExportPdfDesc: "导出带水印的 PDF 文档。",
      complianceTitle: "合规功能清单",
      immutableTitle: "不可变日志",
      immutableDesc: "日志锁定并以只读方式存储，防止在提交后被删除或修改。",
      fullTraceTitle: "完整可追溯",
      fullTraceDesc: "捕获 HTTP 标头、请求上下文和实体变更，确保端到端的可追溯性。",
      searchableTitle: "高速检索",
      searchableDesc:
        "针对 Timestamp、UserId、EventType 和 Correlation ID 进行优化的索引，支持即时搜索。",
      tenantScopedTitle: "租户数据隔离",
      tenantScopedDesc: "日志通过 TenantId 和层级租户边界进行自动隔离，防范跨租户数据泄露。",
      realtimeTitle: "实时推送",
      realtimeDesc: "直接将安全性事件和数据更改推送到对应租户的 SignalR 实时大屏。",
      retentionTitle: "自动保留策略清理",
      retentionDesc: "已配置的保留期参数指示后台服务自动定期清理过期的审计日志记录。",
    },
  },
};
