export const es = {
  modules: {
    webhooks: {
      title: "Webhooks",
      description:
        "Distribuidor de webhooks independiente del portal con firmas HMAC seguras y colas de reintentos exponenciales.",
      intro:
        "Subsistema asíncrono de ejecución de webhooks de salida que verifica la integridad de la carga útil mediante HMAC-SHA256 con políticas de retroceso configurables.",
      engineTitle: "Motor de Envío de Webhooks",
      engineContent:
        "El motor de envío de webhooks procesa eventos de dominio de forma asíncrona. Actúa como un consumidor de bandeja de salida que escucha eventos, los hace coincidir con las suscripciones de webhooks de los inquilinos y los pone en cola para su entrega. El proceso está completamente desacoplado del hilo de solicitud HTTP principal, lo que garantiza que los servidores de terceros lentos no afecten el rendimiento de la plataforma.",
      payloadTitle: "Estructura y Formato del Payload",
      payloadContent:
        "Todas las notificaciones de webhooks enviadas por SCRIPE son solicitudes HTTP POST que contienen un sobre de payload JSON estándar. El sobre contiene metadatos sobre el evento, y el cuerpo del payload dentro de 'data' contiene el estado serializado del recurso modificado.",
      retryTitle: "Reintento Automático y Retroceso",
      retryContent:
        "Cuando un punto final de webhook externo devuelve un código de estado que no es 2xx o agota el tiempo de espera, el motor de envío lo pone en cola para reintentarlo. Utiliza una estrategia de retroceso exponencial para esperar más tiempo entre intentos subsiguientes, evitando saturar el servidor de destino.",
      securityTitle: "Seguridad de Firma HMAC-SHA256",
      securityContent:
        "Para evitar ataques de suplantación de identidad, todas las solicitudes de webhooks incluyen un encabezado X-Scripe-Signature. Este encabezado contiene la firma HMAC-SHA256 del cuerpo de la solicitud JSON sin procesar, calculada con la clave secreta del webhook. Los receptores deben calcular la firma del cuerpo recibido y compararla mediante un ayudante de comparación de tiempo constante.",
      signatureWarning:
        "Aviso de seguridad: Siempre verifique las firmas de los webhooks antes de procesar los payloads para garantizar la autenticidad y evitar el acceso no autorizado o la suplantación de identidad.",
      registeringTitle: "APIs de Gestión de Webhooks",
    },
  },
};
