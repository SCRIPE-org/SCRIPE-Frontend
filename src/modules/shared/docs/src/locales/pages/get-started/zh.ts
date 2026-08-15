/**
 * Docs page locale — ZH
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const zh = {
  getStarted: {
    overview: {
      title: "概述",
      description: "介绍 SCRIPE 企业级平台的架构、功能和技术栈。",
      intro:
        "SCRIPE 是一个基于模块化单体 (Modular Monolith) 架构构建的生产级企业平台。它提供了构建可扩展业务应用所需的一切：身份验证、授权、多租户、审计日志、实时事件以及全面的管理后台 —— 全部开箱即用。该平台作为单一二进制文件运行，可部署为单体应用，也可在不更改代码的情况下拆分为微服务。",
      featureModular: "模块化单体",
      featureModularDesc:
        "边界清晰的隔离模块：独立开发、测试和部署。相同的二进制文件，灵活的部署方式。",
      featureCQRS: "CQRS + SCRIPE mediator",
      featureCQRSDesc:
        "具有 4 个行为管道的命令/查询分离：验证、功能控制 (feature gating)、缓存和性能监控。",
      featureSecurity: "企业级安全",
      featureSecurityDesc:
        "统一的基于策略的访问控制 (PBAC) 引擎，结合了 RBAC、GBAC 和 ABAC。包含 2FA、字段级限制、限流、会话管理和不可变的审计追踪。",
      featureMultiTenant: "多租户 (Multi-Tenancy)",
      featureMultiTenantDesc:
        "使用 EF Core 全局查询过滤器实现行级租户隔离。每个租户具有独立的设置、品牌定制和数据作用域。",
      featureMultiDB: "灵活数据库",
      featureMultiDBDesc:
        "在 SQL Server、PostgreSQL 或 Oracle 之间切换。将所有模块运行在一个共享数据库中（Single 模式）或为每个模块分配独立数据库（Multi 模式）——通过单一配置选项控制。",
      featureDeployment: "灵活部署",
      featureDeploymentDesc: "通过单一的 MODULE_NAME 环境变量，可部署为单体、微服务或混合架构。",
      featureSSO: "企业级 SSO 与身份提供商",
      featureSSODesc:
        "原生的 OIDC/OAuth2 身份提供商，支持在整个生态系统中实现真正的单点登录。作为主要身份提供商（类似于 Keycloak），无缝管理外部客户端应用程序。",
      architectureTitle: "架构拓扑",
      architectureIntro:
        "SCRIPE 以三种部署模式运行，完全由单一环境变量控制。相同的已编译二进制文件可以作为单体（所有模块）、微服务（单个模块）或 API 网关（YARP 代理）运行。",
      deploymentModesTitle: "部署模式",
      deploymentModesIntro:
        "MODULE_NAME 环境变量决定了启动时加载哪些模块。为空时，注册所有模块（单体模式）。设置为特定模块名称时，仅加载该模块（微服务模式）。设置为 'Gateway' 时，激活 YARP 反向代理。",
      techStackTitle: "技术栈",
      serviceRegistrationTitle: "服务注册顺序",
      serviceRegistrationIntro:
        "Program.cs 中的服务注册顺序在架构上具有重要意义。改变顺序会导致运行时失败。核心基础设施必须在模块之前注册，并且 SCRIPE mediator 需要首先收集模块程序集标记。",
      registrationOrderWarning:
        "请勿重新排列 Program.cs 中的服务注册顺序。AddCoreInfrastructure 必须在模块之前（模块依赖 ICurrentUser），AddCoreApplication 必须在模块之后（SCRIPE mediator 需要其程序集）。",
      environmentProfilesTitle: "环境变量配置",
      envVarPrefixTip:
        "仅加载以 SCRIPE_ 开头的环境变量。例如，SCRIPE_ConnectionStrings__DefaultConnection 会覆盖连接字符串。双下划线 (__) 代表 JSON 配置中的嵌套层级。",
    },
    prerequisites: {
      title: "环境要求",
      description: "开发所需的工具、数据库设置和环境配置。",
      intro:
        "在开始使用 SCRIPE 开发之前，请确保您的开发机已安装所需的工具。本页涵盖了确切的版本要求、数据库支持、逐步设置以及 Docker 快速启动指南。",
      requiredToolsTitle: "必备工具",
      databaseTitle: "数据库支持",
      databaseIntro:
        "SCRIPE 开箱即支持三种数据库提供程序：SQL Server、PostgreSQL 和 Oracle。通过 appsettings.json 中的 Database.Provider 设置配置提供程序。此外，Database.Mode 设置控制数据库隔离：'Single' 将所有模块表放在一个共享数据库中，而 'Multi'（默认）允许每个模块拥有独立的数据库和单独的连接字符串。",
      databaseTip:
        "对于本地开发，使用 Docker 运行 SQL Server 是最快的设置方式。使用下方的 Docker Compose 文件，可在几秒钟内启动 SQL Server 和 Redis。",
      envSetupTitle: "环境设置",
      step1Title: "验证工具版本",
      step1Content: "确保已安装所有必备工具并满足最低版本要求。",
      step2Title: "克隆仓库",
      step2Content: "克隆包含后端和前端 Git 子模块的 Monorepo (单体仓库)。",
      step3Title: "配置连接字符串",
      step3Content: "更新数据库连接字符串以指向您的本地数据库实例。",
      step4Title: "后端设置",
      step4Content: "还原 NuGet 包并应用 Entity Framework 迁移以创建数据库架构。",
      step5Title: "前端设置",
      step5Content: "安装 npm 依赖项并创建您的本地环境配置文件。",
      dockerTitle: "Docker 快速启动",
      dockerNote:
        "上述 Docker Compose 文件为本地开发设置了 SQL Server 2022 和 Redis 7。scripe-api 服务从后端 Dockerfile 构建，并自动连接到这两个服务。",
    },
    quickStart: {
      title: "快速入门",
      description: "在 5 分钟内本地运行 SCRIPE，包括后端、前端和验证步骤。",
      intro:
        "本指南将引导您启动后端 API 服务器和前端开发服务器，然后通过健康检查和 API 测试验证一切是否正常运行。",
      backendTitle: "启动后端",
      backendStep1Title: "还原依赖项",
      backendStep1Content: "还原解决方案的所有 NuGet 包。",
      backendStep2Title: "应用数据库迁移",
      backendStep2Content: "运行 Entity Framework 迁移以创建或更新数据库架构。",
      backendStep3Title: "运行 API 服务器",
      backendStep3Content: "在 https://localhost:5035 启动后端 API 服务器。",
      backendRunningTip:
        "API 服务器默认在 https://localhost:5035 启动。在开发模式下，可通过 /swagger 访问 Swagger UI。",
      frontendTitle: "启动前端",
      frontendStep1Title: "安装依赖项",
      frontendStep1Content: "使用 pnpm 安装所有 npm 依赖项，以获得更快、更省磁盘的安装体验。",
      frontendStep2Title: "配置环境",
      frontendStep2Content: "创建一个包含 API URL 和应用名称的 .env.local 文件。",
      frontendStep3Title: "启动开发服务器",
      frontendStep3Content: "在 http://localhost:3000 启动 Next.js 开发服务器。",
      defaultCredentialsTitle: "默认凭据",
      credentialsWarning:
        "请在生产环境中立即更改这些密码！默认凭据由数据库迁移种子数据生成，仅应用于本地开发。",
      verifyInstallTitle: "验证安装",
      verifyInstallIntro: "一旦两个服务器都在运行，请使用以下检查验证安装是否成功。",
      scripeCliTitle: "SCRIPE 命令行工具 (CLI)",
      scripeCliIntro:
        "SCRIPE CLI (scripe-cli) 提供了脚手架命令来生成模块、实体、命令、查询等。它会自动遵循项目的架构约定。",
      cliDevTitle: "使用 CLI 开发",
      cliDevIntro:
        "不必手动启动后端和前端服务器，使用 SCRIPE CLI 可获得优化的开发体验。CLI 自动处理端口解析、浏览器启动和并发服务器管理。",
      cliDevAllCmd: "scripe dev all — 同时启动两个服务器，带标记的输出和自动打开浏览器。",
      cliDevFrontendCmd:
        "scripe dev frontend — 启动 Next.js 开发服务器，自动检测端口并打开浏览器。",
      cliDevBackendCmd: "scripe dev backend — 以开发模式启动 .NET 后端。",
      cliDevNoBrowser:
        "在任何 dev 命令中添加 --no-browser 标志以防止自动打开浏览器（适用于 CI/无头环境）。",
      studioTitle: "SCRIPE Studio",
      studioIntro:
        "SCRIPE Studio 是一个可视化的开发者仪表板，提供实时 UI 来管理您的整个开发工作流程。包括模块管理、代码生成器、开发服务器控制、数据库操作、终端访问等。",
      studioDevCmd:
        "scripe studio --dev — 以开发模式启动 Studio，支持热重载。自动在端口 4200 打开浏览器。",
      studioProdCmd: "scripe studio — 以生产模式启动 Studio。如果尚未构建，则构建引擎和 UI。",
      studioBuildCmd:
        "scripe studio build — 预编译 Studio 引擎 (TypeScript) 和 UI (Next.js)，但不启动。",
      studioPortCmd:
        "使用 --port 和 --engine-port 标志自定义 UI 端口（默认：4200）和引擎端口（默认：4201）。",
      productionTitle: "生产服务器",
      productionIntro:
        "对于生产部署，使用 scripe start 命令以发布/生产模式运行服务器，获得优化的性能。",
      prodStartAllCmd:
        "scripe start all — 同时启动后端（Release 模式）和前端（next start）。自动打开浏览器。",
      prodStartPublishedCmd:
        "scripe start all --published — 从预编译的 DLL 运行以获得最快启动速度。需要先运行 scripe build backend。",
      prodStartFrontendCmd: "scripe start frontend — 仅启动生产前端服务器。",
      prodStartBackendCmd:
        "scripe start backend — 仅启动生产后端服务器 (dotnet run --configuration Release)。",
      prodBuildAllCmd: "scripe build all — 为生产部署构建后端和前端。",
      prodNoBrowser: "添加 --no-browser 以防止在生产模式下自动打开浏览器。",
    },
    projectStructure: {
      title: "项目结构",
      description: "SCRIPE Monorepo 的完整目录布局：根目录、后端、前端和模块解剖。",
      intro:
        "SCRIPE 被组织为一个包含三个主要部分的 Git 子模块 Monorepo：根仓库、后端子模块和前端子模块。了解这种结构对于在代码库中进行导航至关重要。",
      rootTitle: "根 Monorepo",
      backendTitle: "后端结构",
      frontendTitle: "前端结构",
      toolsTitle: "开发者工具",
      toolsIntro:
        "tools/ 目录包含 SCRIPE CLI 和 Studio。CLI 提供 62 个命令用于脚手架、构建、迁移和部署。Studio 是基于 Express（引擎）和 Next.js（UI）构建的可视化开发者仪表板。",
      moduleAnatomyTitle: "模块解剖",
      moduleAnatomyIntro:
        "每个前端模块都遵循相同的结构。这种一致性使得只要您理解了一个模块，就很容易浏览任何其他模块。每层都有严格的职责和导入规则。",
      allowedImports: "允许的导入",
      forbiddenImports: "禁止的导入",
      boundaryWarning:
        "模块边界是绝对的铁律。模块之间不能互相导入代码。如果需要共享代码，必须将其移动到 @core/ 下。跨模块数据只能通过路由参数 (URL) 或共享 ID 传递。",
    },
  },
};
