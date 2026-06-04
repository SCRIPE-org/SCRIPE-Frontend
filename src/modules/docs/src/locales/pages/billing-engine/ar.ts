export const ar = {
  modules: {
    billingEngine: {
      abstractionIntro:
        "نظام الدفع مبني على واجهة IPaymentGateway في Core.Application مع IPaymentGatewayResolver الذي يختار المزود المناسب ديناميكياً لكل مستأجر. ثلاثة تطبيقات نشطة: StripePaymentGateway (عالمي، متكرر، بوابة فوترة)، PayPalPaymentGateway (دولي، يعتمد على OAuth2)، وPaymobPaymentGateway (منطقة الشرق الأوسط وشمال أفريقيا، ترميز البطاقات). تُسجل البوابات كخدمات DI مفتاحية وتُحل في وقت التشغيل.",
      abstractionTitle: "تجريد IPaymentGateway",
      configIntro:
        "كل بوابة مُكوّنة في appsettings.json تحت قسمها الخاص (Stripe وPayPal وPaymob). قسم PaymentGateways يتحكم في البوابات المُفعّلة والافتراضي العام وما إذا كان يمكن للمستأجرين تجاوز اختيار البوابة. استخدم مفاتيح Sandbox/Test للتطوير.",
      configTitle: "التكوين",
      currencyIntro:
        "يتضمن SCRIPE أداة CurrencyHelper التي تحول المبالغ بشكل صحيح للعملات ذات الصفر العشري (JPY وKWD وBHD وغيرها). العملات العادية (USD وEUR وSAR وغيرها) تُضرب في 100 للتحويل إلى أصغر وحدة. العملات ذات الصفر العشري تُمرر كما هي. ينطبق هذا عبر جميع البوابات.",
      currencyTitle: "معالجة العملات ذات الصفر العشري",
      description:
        "معالجة المدفوعات متعددة البوابات مع دعم Stripe وPayPal وPaymob مع الدفع الذاتي وروابط الدفع وبوابة العملاء ومزامنة الحالة عبر Webhooks.",
      endpointsIntro:
        "يوفر BillingController خمس نقاط نهاية تحت /api/v1/billing، بالإضافة إلى إدارة البوابات في /api/v1/payment-gateways:",
      endpointsTitle: "نقاط النهاية API",
      ep: {
        cancel: "إلغاء اشتراك البوابة (يحدد البوابة الصحيحة من حقل PaymentGateway في الاشتراك)",
        checkout: "إنشاء جلسة دفع عبر بوابة الدفع المحددة (يدعم معامل GatewayOverride)",
        dashboard: "لوحة الإيرادات (MRR وARR والتسرب والاتجاهات — مجمعة عبر جميع البوابات)",
        gateways: "GET /api/v1/payment-gateways — استعلام البوابات المُفعّلة ومصفوفة دعم الميزات",
        paymentLink: "إنشاء رابط دفع عبر البوابة المحددة (تدفق التواصل مع المبيعات)",
        portal: "إنشاء جلسة بوابة عملاء Stripe (Stripe فقط، يُرجع خطأ للبوابات الأخرى)",
      },
      gatewayIntro:
        "يدعم SCRIPE ثلاث بوابات دفع في وقت واحد. يحدد IPaymentGatewayResolver البوابة الصحيحة لكل مستأجر باستخدام سلسلة أولويات: تجاوز المدير الصريح، ثم تكوين مستوى المستأجر، ثم الافتراضي العام. كل اشتراك يسجل أي بوابة عالجت دفعته في حقل PaymentGateway.",
      gatewayPaymob:
        "Paymob Accept — متخصص في الشرق الأوسط: الدفع، التكرار عبر بطاقات مُرمّزة، المحافظ الإلكترونية. يدعم عملات EGP وSAR وAED وPKR. تحقق HMAC-SHA512 من Webhook.",
      gatewayPaypal:
        "PayPal — وصول دولي: الدفع، الفوترة المتكررة، الاسترداد، متعدد العملات. يعتمد على OAuth2 مع دعم Sandbox. بدون بوابة فوترة (تُدار عبر paypal.com).",
      gatewayStripe:
        "Stripe — كامل الميزات: الدفع، الفوترة المتكررة، بوابة الفوترة، روابط الدفع، الاسترداد، 3D Secure، متعدد العملات. مثالي كافتراضي عام.",
      gatewayTitle: "بنية متعددة البوابات",
      idempotencyIntro:
        "جميع معالجات Webhook متكررة آمنة — معالجة نفس الحدث مرتين ليس لها آثار جانبية. يتم فحص معرفات معاملات البوابة قبل إنشاء سجلات جديدة. هذا يحمي من ضمان التسليم مرة واحدة على الأقل من جميع المزودين.",
      idempotencyTitle: "العمليات المتكررة الآمنة",
      intro:
        "يدير محرك الفوترة دورة حياة الاشتراكات في SCRIPE من خلال بنية دفع مستقلة عن المزود. يدعم ثلاث بوابات دفع (Stripe وPayPal وPaymob) وثلاثة أنماط اشتراك: الخدمة الذاتية (المستأجر يختار خطة ويدفع عبر البوابة المحددة)، والتواصل مع المبيعات (المدير ينشئ رابط دفع للصفقات المؤسسية)، والتعيين اليدوي (المدير يعين خطة بدون دفع). تتم مزامنة جميع أحداث الدفع عبر Webhooks الخاصة بكل بوابة.",
      mode1Intro:
        "يختار المستأجر إصداراً ودورة فوترة في لوحة الإدارة. يحدد SCRIPE بوابة الدفع المناسبة (عبر تجاوز المستأجر أو الافتراضي العام)، وينشئ جلسة دفع، ويعين حالة الاشتراك إلى PendingPayment، ويعيد توجيه المستأجر إلى صفحة الدفع المستضافة. عند نجاح الدفع، يُفعّل SCRIPE الاشتراك تلقائياً عبر Webhook.",
      mode1Title: "الخدمة الذاتية (آلي)",
      mode2Intro:
        "للصفقات المؤسسية أو المخصصة السعر، ينشئ المدير اشتراكاً مع رابط دفع عبر البوابة المحددة. ينشئ SCRIPE رابط دفع قابل لإعادة الاستخدام يرسله المدير للعميل. نفس تدفق Webhook يُفعّل الاشتراك بمجرد الدفع.",
      mode2Title: "التواصل مع المبيعات (بمساعدة المدير)",
      mode3Intro:
        "للشركاء أو الحسابات الداخلية أو الفترات التجريبية المجانية، يعين المدير الإصدار مباشرة. لا يحدث أي تفاعل مع البوابة — يتم تعيين الاشتراك كـ Active فوراً. استخدم هذا للإصدارات المجانية أو المستأجرين الداخليين أو الصفقات المتفاوض عليها يدوياً.",
      mode3Title: "التعيين اليدوي (تخطي الدفع)",
      modesIntro:
        "كل عملية تهيئة مستأجر تتبع أحد المسارات الثلاثة. يتم اختيار النمط بناءً على ما إذا كان الإصدار يحتوي على IsSelfServiceEnabled أو IsContactSalesOnly.",
      modesTitle: "ثلاثة أنماط اشتراك",
      portalIntro:
        "بمجرد أن يكون لدى المستأجر اشتراك Stripe نشط، يمكنه إدارة الفوترة عبر بوابة عملاء Stripe المستضافة. هذه الميزة حصرية لـ Stripe — اشتراكات PayPal وPaymob تعرض إرشادات إدارة خاصة بالبوابة بدلاً من ذلك. واجهة المستخدم تخفي زر البوابة تلقائياً للبوابات غير Stripe.",
      portalTitle: "بوابة الفوترة (Stripe فقط)",
      selfServiceIntro:
        "حقلان في كيان الإصدار يتحكمان في نمط الدفع المتاح: IsSelfServiceEnabled (المستأجر يمكنه الدفع بدون الاتصال بالمبيعات) وIsContactSalesOnly (زر الدفع يعرض 'تواصل مع المبيعات' ويُفعّل تدفق رابط الدفع بدلاً من ذلك).",
      selfServiceTitle: "حقول الخدمة الذاتية للإصدار",
      title: "محرك الفوترة",
      webhookEvents:
        "Stripe: checkout.session.completed, invoice.paid, invoice.payment_failed, customer.subscription.updated, customer.subscription.deleted, charge.refunded. PayPal: BILLING.SUBSCRIPTION.ACTIVATED, PAYMENT.SALE.COMPLETED, BILLING.SUBSCRIPTION.CANCELLED. Paymob: transaction.success, transaction.failed, transaction.refunded.",
      webhookIntro:
        "لكل بوابة نقطة نهاية Webhook خاصة بها مع تحقق توقيع خاص بالمزود. Stripe يستخدم HMAC-SHA256 في POST /api/stripe-webhooks، PayPal يستخدم تحقق توقيع الإرسال في POST /api/paypal-webhooks، وPaymob يستخدم HMAC-SHA512 في POST /api/paymob-webhooks. جميع المعالجات ترسل إلى أوامر AstraFlow mediator للمعالجة.",
      webhookTitle: "معالجات Webhook",
    },
  },
};
