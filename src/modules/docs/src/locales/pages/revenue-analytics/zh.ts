export const zh = {
  modules: {
    revenueAnalytics: {
      "title": "收入分析引擎",
      "description": "BI级别的收入情报，包含7标签仪表板、实时KPI、群组分析、LTV建模、收入预测、租户健康评分和自动PDF报告投递。",
      "intro": "收入分析引擎为您的SaaS平台提供全面的财务情报。它将所有租户的订阅数据汇总为可操作的KPI、趋势可视化和预测模型。夜间后台作业快照所有指标，计算租户健康评分，并生成定期报告——无需外部工具即可提供完整的BI级分析套件。",
      "kpiTitle": "KPI概览",
      "kpiIntro": "八个核心KPI从订阅和支付数据中实时计算。每个KPI支持日期范围筛选、周期对比和按版本或租户的下钻分析。",
      "tabsTitle": "7标签仪表板",
      "tabsIntro": "分析仪表板组织为7个延迟加载的标签，每个标签专注于特定的分析维度。标签通过React.lazy和Suspense回退进行渲染，以实现最佳的包拆分。",
      "snapshotTitle": "AnalyticsSnapshot实体",
      "snapshotIntro": "AnalyticsSnapshot实体存储每日指标快照。每晚，AnalyticsSnapshotJob创建一个聚合行（TenantId = null）和每个活跃租户一行。这使得无需查询实时订阅表即可进行历史趋势分析。",
      "healthTitle": "租户健康评分",
      "healthIntro": "TenantHealthScoreJob使用加权公式为每个活跃租户计算综合健康评分（0-100），该公式结合了支付可靠性、平台活跃度和订阅增长信号。",
      "jobsTitle": "后台作业管道",
      "jobsIntro": "三个后台作业每晚按严格顺序运行。它们完全与提供者无关——可通过appsettings.json配置为在Native、Hangfire或Quartz下运行。每个作业实现IAutoRegisteredJob接口以进行统一管理。",
      "jobsConfig": "所有三个作业均可通过appsettings.json中的BackgroundJobs:Jobs进行配置。您可以覆盖CRON计划、启用/禁用单个作业或切换提供者（Native/Hangfire/Quartz），无需更改代码。",
      "endpointsTitle": "API端点",
      "endpointsIntro": "AnalyticsController在/api/v1/analytics下公开12个端点。所有端点需要SuperAdmin角色和相应的分析权限。",
      "exportTitle": "导出系统",
      "exportIntro": "分析数据可以导出为三种格式。每次导出包括当前KPI摘要、MRR趋势和订阅细分。PDF导出包括品牌标头和图表。",
      "scheduledTitle": "定期报告",
      "scheduledIntro": "管理员可以配置自动报告投递。报告由AnalyticsReportJob在UTC时间早上6:00生成，并以选定的格式通过电子邮件发送给配置的收件人。",
      "permissionsTitle": "权限",
      "permissionsIntro": "收入分析使用四个细粒度权限，可通过标准RBAC系统分配给角色。",
      "ep": {
        "summary": "获取分析摘要（KPI卡片 + 周期对比）",
        "mrr": "获取MRR瀑布变动（新增/扩展/收缩/流失/重新激活）",
        "cohort": "按月度群组获取群组留存热图数据",
        "ltv": "按版本等级获取生命周期价值细分",
        "forecast": "获取6个月收入预测（线性回归 + 置信区间）",
        "health": "获取租户健康评分及风险分类",
        "snapshots": "获取历史每日快照用于趋势图表",
        "export": "以指定格式（csv/excel/pdf）导出分析数据",
        "reportList": "列出所有定期报告",
        "reportCreate": "创建新的定期报告配置",
        "reportUpdate": "更新定期报告设置",
        "reportDelete": "删除定期报告"
      }
    }
  }
};
