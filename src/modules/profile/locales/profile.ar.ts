export const ar = {
  profile: {
    nav: {
      general: 'عام',
      security: 'الأمان',
      sessions: 'الجلسات',
      activity: 'النشاط',
      notifications: 'الإشعارات'
    },
    avatar: {
      clickOrDrag: 'انقر أو اسحب لتحميل صورة جديدة',
      formats: 'JPG, PNG, or WebP • بحد أقصى 5MB',
      recommended: 'الموصى بها: 256×256px أو أكبر',
      upload: 'رفع',
      remove: 'حذف',
      uploaded: 'تم رفع الصورة الشخصية بنجاح',
      removed: 'تم إزالة الصورة الشخصية بنجاح'
    },
    fields: {
      firstName: 'الاسم الأول',
      lastName: 'اسم العائلة',
      phoneNumber: 'رقم الهاتف',
      username: 'اسم المستخدم',
      usernameHint: 'لا يمكن تغيير اسم المستخدم',
      role: 'الدور'
    },
    general: {
      title: 'عام',
      description: 'إدارة معلوماتك الشخصية وصورة ملفك الشخصي.',
      profilePicture: 'صورة الملف الشخصي',
      personalInfo: 'المعلومات الشخصية',
      saved: 'تم تحديث الملف الشخصي بنجاح!'
    },
    security: {
      title: 'الأمان',
      description: 'إدارة كلمة المرور وإعدادات المصادقة الثنائية.',
      changePassword: 'تغيير كلمة المرور',
      currentPassword: 'كلمة المرور الحالية',
      newPassword: 'كلمة المرور الجديدة',
      confirmPassword: 'تأكيد كلمة المرور',
      updatePassword: 'تحديث كلمة المرور',
      passwordChanged: 'تم تغيير كلمة المرور بنجاح!',
      passwordMismatch: 'كلمات المرور غير متطابقة',
      passwordExpired: 'انتهت صلاحية كلمة المرور. يرجى تغييرها فوراً.',
      passwordExpiringSoon: 'تنتهي صلاحية كلمة المرور خلال {{days}} يوم.',
      lastChanged: 'آخر تغيير',
      twoFactorCode: 'رمز التحقق الثنائي',
      twoFactorCodeHint: 'أدخل الرمز من تطبيق المصادقة',
      strength: {
        minLength: '+8 أحرف',
        uppercase: 'حرف كبير',
        number: 'رقم',
        special: 'رمز خاص'
      },
      twoFactor: {
        title: 'المصادقة الثنائية',
        sectionTitle: 'المصادقة الثنائية',
        enabled: 'حسابك محمي بالمصادقة الثنائية',
        disabled: 'المصادقة الثنائية غير مفعلة لحسابك',
        backupCodes: 'رموز النسخ الاحتياطي المتبقية',
        regenerate: 'تجديد الرموز',
        setup: {
          scanQR: 'مسح رمز QR',
          scanDescription: 'امسح رمز QR هذا باستخدام تطبيق المصادقة (مثل Google Authenticator أو Authy أو 1Password)',
          manualEntry: 'أو أدخل هذا المفتاح يدوياً:',
          verifyTitle: 'تأكيد الإعداد',
          verifyDescription: 'أدخل الرمز المكون من 6 أرقام من تطبيق المصادقة لإكمال الإعداد',
          backupTitle: 'احفظ رموز النسخ الاحتياطي',
          backupDescription: 'هذه رموز النسخ الاحتياطي للاستخدام مرة واحدة. يمكن استخدام كل رمز مرة واحدة فقط.',
          backupWarning: '⚠️ احفظ هذه الرموز في مكان آمن. لن يتم عرضها مرة أخرى.',
          download: 'تنزيل الرموز'
        },
        disable: {
          title: 'تعطيل المصادقة الثنائية',
          description: 'سيؤدي هذا إلى إزالة طبقة الأمان الإضافية من حسابك. ستحتاج إلى تأكيد كلمة المرور الحالية.',
          passwordRequired: 'يرجى إدخال كلمة المرور الحالية',
          passwordLabel: 'كلمة المرور الحالية',
          verifyTitle: 'تأكيد هويتك',
          enterOtp: 'أدخل الرمز المكون من 6 أرقام من تطبيق المصادقة لتأكيد تعطيل المصادقة الثنائية',
          enterBackupCode: 'أدخل أحد رموز النسخ الاحتياطي لتأكيد تعطيل المصادقة الثنائية',
          confirm: 'تعطيل المصادقة الثنائية',
          failed: 'فشل في تعطيل المصادقة الثنائية'
        }
      },
      backupCodes: {
        title: 'رموز النسخ الاحتياطي',
        warning: 'تجديد الرموز سيبطل جميع الرموز الحالية. تأكد من حفظ الرموز الجديدة.',
        saveWarning: 'احفظ هذه الرموز في مكان آمن. لن يتم عرضها مرة أخرى.',
        regenerate: 'تجديد'
      }
    },
    sessions: {
      title: 'الجلسات النشطة',
      description: 'إدارة جلسات تسجيل الدخول النشطة عبر الأجهزة.',
      current: 'الحالية',
      currentSession: 'الجلسة الحالية',
      otherSessions: 'الجلسات الأخرى',
      signedIn: 'تم تسجيل الدخول',
      expires: 'تنتهي',
      revoke: 'إلغاء',
      revokeAll: 'إلغاء الكل',
      noOther: 'لا توجد جلسات نشطة أخرى',
      securityTip: 'إذا لاحظت أي جلسات مشبوهة، قم بإلغائها فوراً وغير كلمة المرور.',
      revoked: 'تم إلغاء الجلسة',
      allRevoked: 'تم إلغاء جميع الجلسات الأخرى'
    },
    activity: {
      title: 'سجل النشاط',
      description: 'مراجعة نشاطك الأمني الأخير.',
      noEntries: 'لا يوجد نشاط مسجل حتى الآن.'
    },
    notifications: {
      title: 'الإشعارات',
      description: 'إدارة الإشعارات والتنبيهات التي تتلقاها.',
      channels: {
        heading: 'قنوات الإشعارات',
        inApp: 'الإشعارات داخل المنصة',
        inAppDescription: 'تلقّ التنبيهات والتحديثات داخل المنصة.',
        email: 'إشعارات البريد الإلكتروني',
        emailDescription: 'احصل على التحديثات المهمة عبر بريدك الإلكتروني.',
        push: 'الإشعارات الفورية',
        pushDescription: 'تلقّ إشعارات المتصفح الفورية عند فتح التطبيق.'
      },
      comingSoon: 'إدارة تفضيلات الإشعارات الكاملة قادمة قريباً.'
    }
  },
  common: {
    copied: '[مفقود] Copied'
  }
};
