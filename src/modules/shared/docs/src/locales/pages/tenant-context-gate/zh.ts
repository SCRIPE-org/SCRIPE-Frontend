// FILE-EXCEPTION: file length
/**
 * Docs page locale — ZH
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const zh = {
  features: {
    tenantContextGate: {
      title: "Tenant Context Gate",
      description:
        "RequiresTenantContext flag, multi-layer menu visibility defense, drill-down behavior, and impersonation scoping for tenant-only pages.",
      intro:
        "The Tenant Context Gate is a security mechanism that prevents system admins from accidentally (or intentionally) accessing tenant-scoped pages when they have no active tenant context. Pages like Tenant Plans, User Subscriptions, and the Customizer Studio only make sense within a specific tenant's context – showing them to a system admin with no tenant would either show incorrect data or expose cross-tenant information.",
      problemTitle: "The Problem",
      problemIntro:
        "System super-admins have a bypass flag (IsSystemProtectedAdmin) that normally grants them access to all pages. Without a gate, a super-admin with no tenant context could navigate to /tenant-plans and see data from all tenants, or crash the page because no TenantId is available.",
      solutionTitle: "The Solution: RequiresTenantContext",
      solutionIntro:
        "We introduced the RequiresTenantContext boolean flag in the DocNavigationItem schema. When this flag is set to true, the frontend actively checks if the current user has a valid tenantId. If they do not, the item is completely stripped from the navigation menu and the route redirects to the overview page.",
      layersTitle: "Defense In Depth",
      layersIntro: "The gate operates at three levels:",
      layer1:
        "1. Menu Visibility: The navigation builder strips the item from the sidebar if no tenant context is present.",
      layer2:
        "2. Route Protection: The page component uses useAppStore to verify the tenant context before attempting to fetch data.",
      layer3:
        "3. Backend Gate: The API endpoints themselves throw 403 Forbidden if a system admin attempts to fetch tenant-scoped data without an explicit drill-down tenant ID header.",
      drillDownTitle: "Drill-Down and Impersonation",
      drillDownIntro:
        "System admins can still access these pages, but only through explicit context-switching mechanisms:",
      drill1:
        'Enter Tenant World (Drill-Down): The admin clicks "Enter Tenant World" on a tenant record. This sets the tenantId in the global state and adds it to the X-Tenant-Id header for all subsequent API requests. The gate now opens, and the admin sees exactly what the tenant sees.',
      drill2:
        "User Impersonation: The admin impersonates a specific tenant user. This swaps the JWT entirely, providing a perfect replica of the user's experience, including all tenant-scoped pages.",
      layer1Title: "第 1 层：前端菜单可见性安全过滤器",
      layer1Intro:
        "菜单生成管线严格检查每一项的 RequiresTenantContext 标识。若当前登录用户未处于有效租户上下文中，该节点将在组装时从导航树中彻底剥离。",
      layer2Title: "第 2 层：客户端路由前置守卫 (Route Guards)",
      layer2Intro:
        "Next.js 路由中间件及页面顶层包裹组件挂载前自动检查应用状态机。任何无租户越权访问将自动平滑重定向至工作区概览页。",
      layer3Title: "第 3 层：后端控制器与 CQRS 管道上下文防火墙",
      layer3Intro:
        "后端 API 控制器与 CQRS 处理器双重独立校验租户上下文，对未携带有效租户凭证的请求一律硬性驳回 401 未授权或 403 禁止访问。",
      drillDownNote:
        "下钻管理访问权仅限拥有 'tenants.drill_down' 特权的平台超级管理员使用，且所有下钻操作均双向落盘审计留痕。",
      impersonationTitle: "用户身份模拟的租户作用域约束",
      impersonationIntro:
        "在执行用户身份模拟期间，安全管道将主体 Claims 替换为附带严格租户作用域的会话 Token，精准继承所属租户的权限边界。",
      flaggedPagesTitle: "受租户上下文防火墙保护的核心专属页面",
      flaggedPagesIntro: "以下管理功能界面强制启用租户上下文安全卡口保护：",
      flaggedPage1: "企业租户专属订阅版本与计费策略配置",
      flaggedPage2: "用户独立订阅分配与细粒度特权管理",
      flaggedPage3: "企业品牌化视觉主题定制与外观工作室",
      flaggedPage4: "企业全局参数配置与独立域名解析绑定",
      flaggedPage5: "企业级专属消息推送与邮件通知动态模板",
      flaggedPage6: "生态系统数据回收站与安全恢复控制中心",
      addingTitle: "安全接入全新的租户专属管理页面",
      addingIntro:
        "在文档导航模型与前端页面路由中声明 RequiresTenantContext: true，即可全面激活三层立体化纵深防御。",
      addingTip:
        "务必确保在后端 MediatR 管道中挂载 TenantContextBehavior 校验切面，从根源切断绕过前端直接调用 API 的越权可能。",
      seederTitle: "安全基线与初始数据播种",
      seederIntro: "数据播种引擎在初次部署时将自动为所有企业级敏感菜单项写入对应的租户保护标识。",
    },
  },
};
