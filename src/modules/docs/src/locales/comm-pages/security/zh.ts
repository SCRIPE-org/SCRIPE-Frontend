/**
 * Docs page locale — ZH
 */
export const zh = {
  commercial: {
    auditCompliance: {
      alerting: "实时警报",
      alertingDesc: "当特定的高权限审计阈值被突破时，通过 Webhooks 或 Slack 自动触发安全警报。",
      complianceContent:
        "SCRIPE 提供了实现 ISO 27001、SOC 2、HIPAA 和 GDPR 合规性的统包方案。凭借不可变的事件捕获、有保证的归因和严格的隔离，审计人员可以立即验证您租户数据的完整性。",
      complianceTitle: "为合规而生",
      dashboard: "可视化仪表板",
      dashboardDesc: "使用我们基于 Vue/Next.js 的高性能报告仪表板，立即深入分析数 GB 的审计数据。",
      description: "法证级审计管道，零数据丢失地捕获 HTTP 请求、实体快照和安全操作。",
      exportContent:
        "将海量审计数据集直接导出为加密的 CSV 或 Excel 格式，或者安全地将其流式传输到您现有的 SIEM 解决方案（如 Splunk 或 Datadog）。",
      exportTitle: "法证导出与 SIEM",
      intro:
        "数据治理是不容妥协的。SCRIPE 具有在后台线程运行的军用级审计日志系统，该系统可以在不降低 API 性能的情况下捕获整个单体应用中的每一次变更、身份验证尝试和关键读取。",
      liveStream: "实时 SignalR 流",
      liveStreamDesc: "通过受保护的 WebSockets 实时监控整个平台上的管理和安全事件流。",
      pipelineContent:
        "审计管道构建在 Entity Framework Core 的拦截器约束模型之上，在数据变更前后拍摄实体的时态快照。变更会被序列化为 JSON 并不可变地存储。",
      pipelineTitle: "异步捕获管道",
      realTimeContent:
        "以透明的可观测性监控您的系统运行。Webhook 集成和 SignalR 流能即时传递法证级洞察，使您的 DevSecOps 团队能够主动而非被动地做出响应。",
      realTimeTitle: "实时可观测性",
      retention: "自适应保留策略",
      retentionDesc: "配置冷存储策略，根据您特定的合规时间限制自动归档或清除审计日志。",
      sourcesTitle: "捕获的四大支柱",
      title: "审计与合规引擎",
    },
    authSecurity: {
      apiTitle: "API 密钥管理",
      description: "高级 JWT 身份验证、防暴力破解保护、多因素安全和强化的密码策略。",
      intro:
        "安全性深深植根于 SCRIPE 的 DNA 中。我们的零信任身份架构利用行业领先的加密技术、高度可配置的密码策略和严格的 JWT 验证，来保护您的应用程序免受现代攻击向量的侵害。",
      jwtContent:
        "我们使用由非对称 RSA 密钥签名的快速、无状态 JSON Web Tokens (JWT)。访问令牌的生命周期较短，而安全的、仅限 HTTP 的刷新令牌则在不牺牲安全性的情况下确保了无缝的用户体验。",
      jwtTitle: "非对称 JWT 协议",
      passwordContent:
        "强制执行符合 NIST 标准的密码复杂性。指定所需的长度、特殊字符组合，并防止在可配置的时间段内重复使用历史密码。",
      passwordTitle: "自适应密码策略",
      sessionTitle: "并发会话控制",
      title: "身份验证与安全",
      twoFa1Content:
        "使用标准 QR 码配置，无缝集成标准的 TOTP 应用程序（如 Google Authenticator 或 Authy）。",
      twoFa1Title: "基于时间的一次性密码 (TOTP)",
      twoFa2Content: "回退到通过强大的第三方集成商（Twilio、Nexmo）处理的安全 SMS 验证。",
      twoFa2Title: "SMS 验证",
      twoFa3Content: "通过集成了可定制 Scriban 模板的 SMTP 电子邮件解决方案发送一次性挑战码。",
      twoFa3Title: "电子邮件 OTP",
      twoFa4Content: "提供可打印的、加密安全的恢复代码，以应对灾难恢复场景。",
      twoFa4Title: "安全恢复代码",
      twoFaContent:
        "仅靠密码是不够的。SCRIPE 原生要求动态的二次验证屏障，即使在发生凭据撞库或网络钓鱼的情况下也能保护您的用户。",
      twoFaTitle: "多因素身份验证 (MFA)",
    },
    complianceReadiness: {
      auditReadyContent:
        "审计员不想要承诺；他们想要证据。SCRIPE 提供了关于每一次 API 调用、权限提升和数据突变的防篡改、可导出的日志，将需要 6 个月的 SOC 2 准备工作转化为只需 2 周的例行公事。",
      auditReadyTitle: "即时证据工件",
      checklistTitle: "合规性捷径",
      consentMgmt: "高级同意管理",
      consentMgmtDesc:
        "跨越多个隐私政策和服务条款迭代，以编程方式跟踪、进行版本控制并强制执行用户同意。",
      dataMinimization: "智能数据最小化",
      dataMinimizationDesc:
        "当达到保留策略时，自动使数据库中的 PII (个人身份信息) 过期或对其进行脱敏。",
      dataPortability: "即时数据可移植性",
      dataPortabilityDesc: "允许用户安全地以机器可读的 JSON 格式下载其完整数据足迹的加密存档。",
      description: "预配置的技控措施，实现 ISO 27001、SOC 2 和 GDPR 的极速认证。",
      disclaimer: "免责声明：SCRIPE 提供技术基础；对于程序上的合规性，请咨询法律顾问。",
      frameworkIntro:
        "实现合规性通常会使工程路线图脱轨数月。SCRIPE 通过将最困难的技术控制措施直接内置到基础框架中，极大地缩短了这条曲线。",
      frameworkTitle: "加速框架支持",
      gdprTitle: "原生支持 GDPR 和 CCPA",
      intro:
        "监管框架要求严格的数据治理。SCRIPE 通过在应用程序架构深处嵌入军用级审计、加密和隐私控制措施，加速了您的认证之路。",
      rightToErasure: "编排的被遗忘权",
      rightToErasureDesc: "执行全平台范围的软删除或硬删除，这些删除会自动级联到所有关系表中。",
      securityControlsTitle: "映射的安全控制",
      title: "合规准备就绪",
    },
    dataProtection: {
      csrfContent:
        "从根本上阻断跨站攻击。所有可变更的 API 端点都需要加密的防伪令牌。通过将 CSRF 断言自动绑定到用户的 JWT 和安全的 SameSite cookie 上，SCRIPE 彻底消除了跨站请求伪造攻击向量。",
      csrfTitle: "坚不可摧的 CSRF 防御",
      description: "密码学防护、静态数据加密策略和全面的隐私控制。",
      encryptionTitle: "端到端加密架构",
      fieldProjectionContent:
        "停止过度获取 (over-fetching)。我们的动态投影映射确保 API 仅查询和序列化前端精确请求的列，从而防止密码哈希或薪资数据等敏感后端字段被意外暴露。",
      fieldProjectionTitle: "严格的数据投影",
      idEncContent:
        "我们使用强大的、顺序的 UUID (v7) 和 Hashids，以防止容易猜到的顺序整数暴露业务增长速度。对象 ID 天生就是模糊的，并且与物理数据库身份解耦。",
      idEncTitle: "不透明 ID 生成",
      intro:
        "保护用户数据是重中之重。SCRIPE 采用纵深防御策略，利用军用级加密和逻辑屏障，确保在数学上不可能发生未经授权的数据访问。",
      replayContent:
        "通过强制执行严格的 JWT nonce 验证、令牌过期和加密签名的时间戳，我们的 API 网关会自动拒绝被拦截或重复的请求有效载荷。",
      replayTitle: "防止重放攻击 (Replay Attack)",
      title: "数据保护与隐私",
    },
    infraSecurity: {
      corsContent:
        "彻底阻止跨域泄漏。SCRIPE 的默认 CORS 策略已用严格的白名单范式锁定，立即拒绝任何来自不受信任域的未授权浏览器预检 (pre-flight) 请求。",
      corsTitle: "严格的跨域策略 (CORS)",
      cspContent:
        "我们预配置的 Content Security Policy (CSP) 标头在数学上消除了大量 XSS 漏洞，它精确规定了浏览器在法律上被允许执行哪些外部脚本、字体和样式表。",
      cspTitle: "坚不可摧的 CSP 标头",
      description: "深入探究外部防御边界：速率限制、CORS、输入验证以及物理基础设施强化。",
      intro:
        "安全性不能是应用层事后才补上的附加品。SCRIPE 在基础设施层面强化了外围防线，建立起对抗大规模 DDoS 攻击、跨站脚本 (XSS) 和未经授权的网络穿透的强大盾牌。",
      ipFiltering: "第 4 层 IP 白名单",
      ipFilteringDesc: "将高度敏感的管理端点严格限制为仅源自您企业 VPN 或物理办公室子网的流量。",
      networkSegment: "微分段 (Micro-Segmentation)",
      networkSegmentDesc:
        "将数据库和后台工作进程隔离在私有、不可路由且与公共互联网完全断开的子网中。",
      networkTitle: "拓扑屏蔽",
      rateLimitContent:
        "从容应对突发的流量激增和暴力扫描。SCRIPE 包含支持分布式的、由 Redis 支撑的速率限制功能，该功能在恶意 IP 地址或特定 JWT 耗尽数据库连接池之前就会对其进行动态节流 (throttling)。",
      rateLimitTitle: "分布式节流",
      reverseProxy: "代理标头验证",
      reverseProxyDesc:
        "使用经过严格验证的 X-Forwarded-For 标头安全解析负载均衡器背后的原始客户端 IP，从而防止 IP 欺骗。",
      secretsContent:
        "硬编码的密码是灾难性的漏洞。SCRIPE 配置管道会在系统启动时原生拦截并从企业密钥管理器中动态注入安全字符串。",
      secretsTitle: "零信任密钥管理",
      title: "边界与基础设施安全",
      tlsInspection: "强制执行 TLS 1.3",
      tlsInspectionDesc:
        "强制实施最高级别的加密套件，同时强烈拒绝 TLS 1.1 或 SSLv3 等过时且不安全的协议。",
      warningNote:
        "警告：在未咨询您的 CISO（首席信息安全官）的情况下禁用这些默认防御机制将大幅增加您组织的攻击面。",
    },
    securityOverview: {
      complianceTitle: "合规的基础",
      description: "SCRIPE 的多层级、纵深防御安全边界的全面解析，可从路由层一直保护到持久化层。",
      gdpr: "GDPR 被遗忘权",
      gdprDesc: "开箱即用地支持严格的 PII（个人身份信息）匿名化和硬删除协议。",
      headersTitle: "防御性 HTTP 标头",
      intro:
        "我们不信任网络，不信任客户端，也不信任有效载荷 (payload)。SCRIPE 建立在零信任架构方法论之上，在应用矩阵的每一个边界强制执行积极的安全协议。",
      modelContent:
        "每一个 API 请求都会被 FluentValidation 引擎立即评估。如果有效载荷违反了领域约束（例如，无效的电子邮件格式，数字超出范围），管道将在控制器被实例化之前立即以 400 错误请求 (Bad Request) 拒绝该有效载荷。",
      modelTitle: "严格的管道验证",
      soc2: "SOC 2 Type II 就绪",
      soc2Desc: "内置的法证级审计跟踪和严格的数据隔离机制可加速您成功通过 SOC 2 审计。",
      sox: "SOX 合规触发器",
      soxDesc: "在财务审计日志中提供数学意义上的不可变性 (Immutability)，以支持高度受监管的环境。",
      summaryTitle: "纵深防御矩阵",
      title: "零信任安全态势",
    },
  },
};
