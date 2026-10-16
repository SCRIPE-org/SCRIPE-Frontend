/**
 * Documentation for module export
 */
export const zh = {
  commercial: {
    billingPayments: {
      title: "账单与支付",
      description:
        "基于 Stripe 的账单系统，具有自助结算、自动开票、四阶段催收、多币种支持和收入分析功能。",
      selfServiceTitle: "自助结算",
      selfServiceDesc: "租户通过 Stripe 托管结账即时订阅并付款——无需手动开票步骤。",
      automatedInvoicingTitle: "自动开票",
      automatedInvoicingDesc: "每笔付款都会生成一份带有条目明细和税费信息的编号可下载发票。",
      smartDunningTitle: "智能催收",
      smartDunningDesc: "四阶段失败付款追偿机制，包含阶梯式通知邮件、宽限期和自动降级回退。",
      revenueDashboardTitle: "收入仪表板",
      revenueDashboardDesc: "从您的账单数据中实时提取 MRR、ARR、客户流失率和平台健康度评分。",
      multiCurrencyTitle: "多币种支持",
      multiCurrencyDesc: "支持 28 种 Stripe 货币，内置零小数和特殊小数精度处理。",
      paymentLinksTitle: "支付链接",
      paymentLinksDesc: "企业销售？无需结账会话即可为定制交易生成 Stripe 支付链接。",
      checkoutModesTitle: "三种结算模式",
      invoicingTitle: "自动发票管理",
      dunningTitle: "四阶段催收追偿",
      revenueAnalyticsTitle: "收入分析",
      exportOptionsTitle: "导出选项",
    },
  },
};
