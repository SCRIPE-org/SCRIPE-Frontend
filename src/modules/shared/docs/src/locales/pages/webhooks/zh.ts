export const zh = {
  modules: {
    webhooks: {
      title: "Webhooks",
      description:
        "独立于网关的 Webhook 分发器，具有安全的 HMAC 签名 and 自动指数重试队列。",
      intro:
        "异步出站 Webhook 执行子系统，通过带有可配置退避策略的 HMAC-SHA256 请求头验证负载完整性。",
      engineTitle: "Webhook 发送引擎",
      engineContent:
        "Webhook 发送引擎异步处理领域事件。它作为一个发件箱（outbox）消费者，监听事件，将它们与租户 Webhook 订阅进行匹配，并将其排队等待交付。该过程与主 HTTP请求线程完全解耦，确保缓慢的第三方服务器不会影响平台性能。",
      payloadTitle: "数据负载结构与格式",
      payloadContent:
        "SCRIPE 发送的所有 Webhook 通知都是包含标准 JSON 负载信封的 HTTP POST 请求。信封包含关于事件的元数据，而 'data' 内部的负载主体包含被修改资源的序列化状态。",
      retryTitle: "自动重试和退避",
      retryContent:
        "当外部 Webhook 端点返回非 2xx 状态码或超时时，发送引擎会将其排队重试。它使用指数退避策略在后续尝试之间等待更长时间，防止压垮目标服务器。",
      securityTitle: "HMAC-SHA256 签名安全",
      securityContent:
        "为了防止欺骗攻击，所有 Webhook 请求都包含一个 X-Scripe-Signature 请求头。该请求头包含原始 JSON 请求体的 HMAC-SHA256 签名，该签名是使用 Webhook 的密钥计算的。接收方必须计算接收到的请求体的签名，并使用常数时间比较辅助函数进行比较。",
      signatureWarning:
        "安全提示：在处理数据负载之前，请务必验证 Webhook 签名，以保证真实性并防止未经授权的访问或欺骗。",
      registeringTitle: "Webhook 管理 API",
    },
  },
};
