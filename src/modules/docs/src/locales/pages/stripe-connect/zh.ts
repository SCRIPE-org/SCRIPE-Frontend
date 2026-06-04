export const zh = {
  commercial: {
    stripeConnect: {
      ben1: "无摩擦计费",
      ben1Desc: "让您的租户接受全球客户付款，同时您自动保留您的分成。",
      ben2: "降低财务风险",
      ben2Desc: "资金流经 Stripe，避免了复杂的金融监管合规或第三方托管要求。",
      ben3: "自动佣金",
      ben3Desc: "按交易收取百分比或固定费用，打造强大的持续性收入来源。",
      benefitsIntro: "通过 Stripe Connect 启用拆分付款具有巨大的商业价值。",
      benefitsTitle: "为什么使用拆分付款？",
      commissionIntro:
        "租户处理的每笔交易都可以在网关级别进行拆分。例如，如果租户以 100 美元的价格售出服务，佣金为 5%，Stripe Connect 会将 95 美元分配给租户，并将 5 美元直接存入您的公司账户。",
      commissionTitle: "平台费拆分",
      intro:
        "通过由 Stripe Connect 提供支持的内置分成付款和佣金收取网关，即时将您的平台交易货币化。",
    },
  },
  stripeConnect: {
    apiAccountStatus: "获取租户 Connected Account 的当前状态和付款状态",
    apiCommissionsDashboard: "获取平台佣金的全局统计数据、趋势和总计",
    apiCommissionsInvoices: "列出系统佣金发票并提供状态筛选",
    apiOnboard: "为租户发起 Stripe Connect 入驻会话",
    apiRetryCharge: "为租户佣金发票触发手动的即时扣款重试",
    apiWaiveInvoice: "豁免租户的特定佣金发票（标记为已支付）",
    commissionIntro: "通过基于账本的交易记账系统，动态收取租户销售的交易费用。",
    commissionTitle: "平台佣金引擎",
    controllerIntro:
      "Stripe Connect 和平台佣金的端点由 StripeConnectController、TenantStripeConnectController 和 CommissionsController 管理。",
    controllerTitle: "付款中心端点",
    description: "租户入驻、自定义账户、拆分付款和平台佣金管理的详细文档。",
    flowIntro: "租户使用自助服务 OAuth 或自定义入驻工作流接入付款中心。",
    flowTitle: "租户入驻工作流",
    intro:
      "Stripe Connect 模块提供多租户计费能力。它允许租户连接他们自己的 Stripe 账户以接收其客户的付款，并支持自动平台佣金引擎来收取交易费用。",
    step1Content:
      "租户管理员在付款仪表板中单击“连接 Stripe”，这将发送一个命令以获取单次使用的入驻 URL。",
    step1Title: "触发入驻",
    step2Content: "租户被重定向到 Stripe 的入驻门户，以验证其业务详情、银行账户和合规性状态。",
    step2Title: "Stripe 验证",
    step3Content: "完成后，Stripe 重定向回 SCRIPE。Webhook 接收账户更新并激活租户的付款网关状态。",
    step3Title: "账户激活",
    title: "Stripe Connect 与平台佣金",
  },
};
