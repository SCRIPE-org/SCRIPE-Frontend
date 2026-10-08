/**
 * Documentation for module export
 */
export const zh = {
  modules: {
    ecosystemRecycleBin: {
      title: "回收站",
      description: "全系统软删除管理器，具备自动化永久清理调度计划。",
      intro: "可审计实体软删除解析引擎，管理资源隔离、恢复路由以及按计划执行的数据库清理周期。",
      softDeleteTitle: "软删除与恢复引擎",
      softDeleteContent: "生态回收站集中管理所有活跃模块中软删除的实体。通过复用 AuditableEntity 基类的 IsDeleted 和 DeletedAt 属性，在系统层强制执行全局查询过滤，并在 30 天后自动调度永久清理作业。",
    },
  },
};
