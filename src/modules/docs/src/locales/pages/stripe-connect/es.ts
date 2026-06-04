export const es = {
  commercial: {
    stripeConnect: {
      ben1: "Facturación sin Fricciones",
      ben1Desc:
        "Permita que sus inquilinos cobren a sus clientes en todo el mundo mientras usted retiene su parte automáticamente.",
      ben2: "Menor Riesgo Financiero",
      ben2Desc:
        "Los fondos fluyen a través de Stripe, evitando regulaciones financieras complejas o la necesidad de fideicomisos.",
      ben3: "Comisiones Automáticas",
      ben3Desc:
        "Cobre tarifas fijas o porcentuales por transacción, creando un motor de ingresos constante.",
      benefitsIntro:
        "Habilitar los pagos divididos a través de Stripe Connect aporta un gran valor comercial.",
      benefitsTitle: "¿Por qué usar Pagos Divididos?",
      commissionIntro:
        "Cada transacción de sus inquilinos se divide en la pasarela. Por ejemplo, si un inquilino vende por $100 con una comisión del 5%, Stripe Connect envía $95 al inquilino y $5 a la cuenta de la plataforma.",
      commissionTitle: "División de Tarifas de la Plataforma",
      intro:
        "Monetice las transacciones de su plataforma al instante con un sistema de pagos divididos y comisiones integrado impulsado por Stripe Connect.",
    },
  },
  stripeConnect: {
    apiAccountStatus:
      "Obtiene el estado de la cuenta conectada del inquilino y el estado de transferencias",
    apiCommissionsDashboard: "Obtiene estadísticas y tendencias de las comisiones cobradas",
    apiCommissionsInvoices: "Lista las facturas de comisiones generadas con filtros de estado",
    apiOnboard: "Inicia la sesión de registro de Stripe Connect para el inquilino",
    apiRetryCharge: "Reintenta el cobro manual e inmediato de una factura de comisión",
    apiWaiveInvoice: "Perdona una factura de comisión de un inquilino (marcada como pagada)",
    commissionIntro:
      "Cobre comisiones por las ventas de los inquilinos de forma dinámica mediante un sistema contable de transacciones.",
    commissionTitle: "Motor de Comisiones de la Plataforma",
    controllerIntro:
      "Los endpoints de Stripe Connect y comisiones están gestionados por StripeConnectController, TenantStripeConnectController y CommissionsController.",
    controllerTitle: "Endpoints del Centro de Pagos",
    description:
      "Documentación detallada para el registro de inquilinos, cuentas personalizadas, pagos divididos y gestión de comisiones.",
    flowIntro:
      "Los inquilinos se registran en el centro de pagos mediante un flujo de registro autoservicio.",
    flowTitle: "Flujo de Registro de Inquilinos",
    intro:
      "El módulo Stripe Connect proporciona capacidades de facturación multi-inquilino. Permite a los inquilinos conectar sus cuentas de Stripe para cobrar a sus clientes, con soporte para una comisión de plataforma automatizada.",
    step1Content:
      "El administrador del inquilino inicia la conexión desde el panel de control, solicitando un enlace único de registro.",
    step1Title: "Inicio del Registro",
    step2Content:
      "El inquilino es redirigido a Stripe para verificar sus datos comerciales, cuentas bancarias y cumplimiento.",
    step2Title: "Verificación de Stripe",
    step3Content:
      "Al completar, Stripe redirige de vuelta a la plataforma. El webhook procesa la actualización y activa la cuenta.",
    step3Title: "Activación de Cuenta",
    title: "Stripe Connect y Comisiones",
  },
};
