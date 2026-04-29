export const ar = {
  modules: {
    billingEngine: {
      "title": "محرك الفوترة",
      "description": "معالجة المدفوعات متعددة البوابات مع دعم Stripe وPayPal وPaymob مع الدفع الذاتي وروابط الدفع وبوابة العملاء ومزامنة الحالة عبر Webhooks.",
      "intro": "يدير محرك الفوترة دورة حياة الاشتراكات في NEXORA من خلال بنية دفع مستقلة عن المزود. يدعم ثلاث بوابات دفع (Stripe وPayPal وPaymob) وثلاثة أنماط اشتراك: الخدمة الذاتية (المستأجر يختار خطة ويدفع عبر البوابة المحددة)، والتواصل مع المبيعات (المدير ينشئ رابط دفع للصفقات المؤسسية)، والتعيين اليدوي (المدير يعين خطة بدون دفع). تتم مزامنة جميع أحداث الدفع عبر Webhooks الخاصة بكل بوابة.",
      "abstractionTitle": "تجريد IPaymentGateway",
      "abstractionIntro": "نظام الدفع مبني على واجهة IPaymentGateway في Core.Application مع IPaymentGatewayResolver الذي يختار المزود المناسب ديناميكياً لكل مستأجر. ثلاثة تطبيقات نشطة: StripePaymentGateway (عالمي، متكرر، بوابة فوترة)، PayPalPaymentGateway (دولي، يعتمد على OAuth2)، وPaymobPaymentGateway (منطقة الشرق الأوسط وشمال أفريقيا، ترميز البطاقات). تُسجل البوابات كخدمات DI مفتاحية وتُحل في وقت التشغيل.",
      "modesTitle": "ثلاثة أنماط اشتراك",
      "modesIntro": "كل عملية تهيئة مستأجر تتبع أحد المسارات الثلاثة. يتم اختيار النمط بناءً على ما إذا كان الإصدار يحتوي على IsSelfServiceEnabled أو IsContactSalesOnly.",
      "mode1Title": "الخدمة الذاتية (آلي)",
      "mode1Intro": "يختار المستأجر إصداراً ودورة فوترة في لوحة الإدارة. يحدد NEXORA بوابة الدفع المناسبة (عبر تجاوز المستأجر أو الافتراضي العام)، وينشئ جلسة دفع، ويعين حالة الاشتراك إلى PendingPayment، ويعيد توجيه المستأجر إلى صفحة الدفع المستضافة. عند نجاح الدفع، يُفعّل NEXORA الاشتراك تلقائياً عبر Webhook.",
      "mode2Title": "التواصل مع المبيعات (بمساعدة المدير)",
      "mode2Intro": "للصفقات المؤسسية أو المخصصة السعر، ينشئ المدير اشتراكاً مع رابط دفع عبر البوابة المحددة. ينشئ NEXORA رابط دفع قابل لإعادة الاستخدام يرسله المدير للعميل. نفس تدفق Webhook يُفعّل الاشتراك بمجرد الدفع.",
      "mode3Title": "التعيين اليدوي (تخطي الدفع)",
      "mode3Intro": "للشركاء أو الحسابات الداخلية أو الفترات التجريبية المجانية، يعين المدير الإصدار مباشرة. لا يحدث أي تفاعل مع البوابة — يتم تعيين الاشتراك كـ Active فوراً. استخدم هذا للإصدارات المجانية أو المستأجرين الداخليين أو الصفقات المتفاوض عليها يدوياً.",
      "gatewayTitle": "بنية متعددة البوابات",
      "gatewayIntro": "يدعم NEXORA ثلاث بوابات دفع في وقت واحد. يحدد IPaymentGatewayResolver البوابة الصحيحة لكل مستأجر باستخدام سلسلة أولويات: تجاوز المدير الصريح، ثم تكوين مستوى المستأجر، ثم الافتراضي العام. كل اشتراك يسجل أي بوابة عالجت دفعته في حقل PaymentGateway.",
      "gatewayStripe": "Stripe — كامل الميزات: الدفع، الفوترة المتكررة، بوابة الفوترة، روابط الدفع، الاسترداد، 3D Secure، متعدد العملات. مثالي كافتراضي عام.",
      "gatewayPaypal": "PayPal — وصول دولي: الدفع، الفوترة المتكررة، الاسترداد، متعدد العملات. يعتمد على OAuth2 مع دعم Sandbox. بدون بوابة فوترة (تُدار عبر paypal.com).",
      "gatewayPaymob": "Paymob Accept — متخصص في الشرق الأوسط: الدفع، التكرار عبر بطاقات مُرمّزة، المحافظ الإلكترونية. يدعم عملات EGP وSAR وAED وPKR. تحقق HMAC-SHA512 من Webhook.",
      "webhookTitle": "معالجات Webhook",
      "webhookIntro": "لكل بوابة نقطة نهاية Webhook خاصة بها مع تحقق توقيع خاص بالمزود. Stripe يستخدم HMAC-SHA256 في POST /api/stripe-webhooks، PayPal يستخدم تحقق توقيع الإرسال في POST /api/paypal-webhooks، وPaymob يستخدم HMAC-SHA512 في POST /api/paymob-webhooks. جميع المعالجات ترسل إلى أوامر MediatR للمعالجة.",
      "webhookEvents": "Stripe: checkout.session.completed, invoice.paid, invoice.payment_failed, customer.subscription.updated, customer.subscription.deleted, charge.refunded. PayPal: BILLING.SUBSCRIPTION.ACTIVATED, PAYMENT.SALE.COMPLETED, BILLING.SUBSCRIPTION.CANCELLED. Paymob: transaction.success, transaction.failed, transaction.refunded.",
      "idempotencyTitle": "العمليات المتكررة الآمنة",
      "idempotencyIntro": "جميع معالجات Webhook متكررة آمنة — معالجة نفس الحدث مرتين ليس لها آثار جانبية. يتم فحص معرفات معاملات البوابة قبل إنشاء سجلات جديدة. هذا يحمي من ضمان التسليم مرة واحدة على الأقل من جميع المزودين.",
      "configTitle": "التكوين",
      "configIntro": "كل بوابة مُكوّنة في appsettings.json تحت قسمها الخاص (Stripe وPayPal وPaymob). قسم PaymentGateways يتحكم في البوابات المُفعّلة والافتراضي العام وما إذا كان يمكن للمستأجرين تجاوز اختيار البوابة. استخدم مفاتيح Sandbox/Test للتطوير.",
      "portalTitle": "بوابة الفوترة (Stripe فقط)",
      "portalIntro": "بمجرد أن يكون لدى المستأجر اشتراك Stripe نشط، يمكنه إدارة الفوترة عبر بوابة عملاء Stripe المستضافة. هذه الميزة حصرية لـ Stripe — اشتراكات PayPal وPaymob تعرض إرشادات إدارة خاصة بالبوابة بدلاً من ذلك. واجهة المستخدم تخفي زر البوابة تلقائياً للبوابات غير Stripe.",
      "endpointsTitle": "نقاط النهاية API",
      "endpointsIntro": "يوفر BillingController خمس نقاط نهاية تحت /api/v1/billing، بالإضافة إلى إدارة البوابات في /api/v1/payment-gateways:",
      "ep": {
        "checkout": "إنشاء جلسة دفع عبر بوابة الدفع المحددة (يدعم معامل GatewayOverride)",
        "paymentLink": "إنشاء رابط دفع عبر البوابة المحددة (تدفق التواصل مع المبيعات)",
        "portal": "إنشاء جلسة بوابة عملاء Stripe (Stripe فقط، يُرجع خطأ للبوابات الأخرى)",
        "cancel": "إلغاء اشتراك البوابة (يحدد البوابة الصحيحة من حقل PaymentGateway في الاشتراك)",
        "dashboard": "لوحة الإيرادات (MRR وARR والتسرب والاتجاهات — مجمعة عبر جميع البوابات)",
        "gateways": "GET /api/v1/payment-gateways — استعلام البوابات المُفعّلة ومصفوفة دعم الميزات"
      },
      "selfServiceTitle": "حقول الخدمة الذاتية للإصدار",
      "selfServiceIntro": "حقلان في كيان الإصدار يتحكمان في نمط الدفع المتاح: IsSelfServiceEnabled (المستأجر يمكنه الدفع بدون الاتصال بالمبيعات) وIsContactSalesOnly (زر الدفع يعرض 'تواصل مع المبيعات' ويُفعّل تدفق رابط الدفع بدلاً من ذلك).",
      "currencyTitle": "معالجة العملات ذات الصفر العشري",
      "currencyIntro": "يتضمن NEXORA أداة CurrencyHelper التي تحول المبالغ بشكل صحيح للعملات ذات الصفر العشري (JPY وKWD وBHD وغيرها). العملات العادية (USD وEUR وSAR وغيرها) تُضرب في 100 للتحويل إلى أصغر وحدة. العملات ذات الصفر العشري تُمرر كما هي. ينطبق هذا عبر جميع البوابات."
    }
  }
};
