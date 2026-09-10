const ar = {
  // App
  app: {
    name: 'تمويل السلام',
    buildingName: 'عمارة السلام',
    subtitle: 'التسيير المالي للعمارة',
  },

  // Navigation
  nav: {
    dashboard: 'لوحة التحكم',
    payments: 'الدفعات',
    expenses: 'المصاريف',
    residents: 'السكان',
    categories: 'الفئات',
    reports: 'التقارير',
    history: 'السجل',
    settings: 'الإعدادات',
    guide: 'دليل الاستخدام',
    logout: 'تسجيل الخروج',
  },

  // Dashboard
  dashboard: {
    title: 'لوحة التحكم',
    currentBalance: 'الرصيد الحالي',
    totalPayments: 'مجموع الدفعات',
    totalExpenses: 'مجموع المصاريف',
    totalResidents: 'عدد السكان',
    monthlyOverview: 'نظرة عامة على الشهر',
    expectedContributions: 'مجموع الاشتراكات المطلوبة',
    receivedContributions: 'مجموع الاشتراكات المؤداة',
    remainingToReceive: 'المبلغ المتبقي',
    monthlyExpenses: 'مصاريف الشهر',
    recentExpenses: 'آخر المصاريف',
    paymentStatus: 'حالة الأداء',
    noData: 'لا توجد بيانات لهذا الشهر',
    noResidents: 'لا توجد بيانات للعرض. ابدأ بإضافة الساكنين.',
  },

  // Payments
  payments: {
    title: 'الدفعات',
    addPayment: 'إضافة دفعة',
    editPayment: 'تعديل الدفعة',
    deletePayment: 'حذف الدفعة',
    resident: 'الساكن',
    month: 'الشهر',
    date: 'التاريخ',
    amount: 'المبلغ',
    paymentType: 'طريقة الدفع',
    note: 'ملاحظة',
    cash: 'نقدي',
    bankTransfer: 'تحويل بنكي',
    other: 'أخرى',
    saved: 'تمت إضافة الدفعة بنجاح.',
    updated: 'تم تعديل الدفعة بنجاح.',
    deleted: 'تم حذف الدفعة بنجاح.',
    deleteConfirm: 'هل أنت متأكد من حذف هذه الدفعة؟',
    totalReceived: 'المجموع المستلم',
    forMonth: 'لشهر',
  },

  // Expenses
  expenses: {
    title: 'المصاريف',
    addExpense: 'إضافة مصروف',
    editExpense: 'تعديل المصروف',
    deleteExpense: 'حذف المصروف',
    category: 'الفئة',
    date: 'التاريخ',
    month: 'الشهر',
    description: 'الوصف',
    amount: 'المبلغ',
    paymentMethod: 'طريقة الدفع',
    note: 'ملاحظة',
    saved: 'تمت إضافة المصروف بنجاح.',
    updated: 'تم تعديل المصروف بنجاح.',
    deleted: 'تم حذف المصروف بنجاح.',
    deleteConfirm: 'هل أنت متأكد من حذف هذا المصروف؟',
    totalExpenses: 'مجموع المصاريف',
  },

  // Expense Categories
  categories: {
    cleaning: 'عاملة النظافة',
    electricity: 'الكهرباء',
    water: 'الماء',
    maintenance: 'الصيانة',
    repair: 'الإصلاح',
    elevator: 'المصعد',
    commonAreas: 'المرافق المشتركة',
    other: 'أخرى',
  },

  // Residents
  residents: {
    title: 'السكان',
    addResident: 'إضافة ساكن',
    editResident: 'تعديل بيانات الساكن',
    deactivateResident: 'تعطيل حساب الساكن',
    deleteResident: 'حذف الساكن',
    apartment: 'الشقة',
    name: 'الاسم',
    phone: 'الهاتف',
    email: 'البريد الإلكتروني',
    status: 'الحالة',
    active: 'نشط',
    inactive: 'غير نشط',
    saved: 'تم حفظ بيانات الساكن بنجاح.',
    updated: 'تم تعديل بيانات الساكن بنجاح.',
    deleted: 'تم حذف الساكن بنجاح.',
    activated: 'تم تفعيل الساكن.',
    deactivated: 'تم تعطيل الساكن.',
    deactivateConfirm: 'هل أنت متأكد من تعطيل هذا الساكن؟',
    activateConfirm: 'هل أنت متأكد من تفعيل هذا الساكن؟',
    deleteConfirm: 'هل أنت متأكد من حذف هذا الساكن؟ لا يمكن التراجع عن هذا الإجراء.',
    hasPaymentRecords: 'لهذا الساكن دفعات مسجلة. قم بتعطيله بدلا من حذفه.',
  },

  // Payment Status
  paymentStatus: {
    paid: 'تم الأداء',
    partial: 'أداء جزئي',
    notPaid: 'لم يتم الأداء',
    expected: 'المطلوب',
    paidAmount: 'المدفوع',
    remaining: 'المتبقي',
  },

  // Reports
  reports: {
    title: 'التقارير',
    monthlyReport: 'التقرير الشهري',
    selectMonth: 'اختر الشهر',
    entries: 'المقبوضات',
    exits: 'المصروفات',
    monthlyBalance: 'رصيد الشهر',
    expected: 'المطلوبة',
    received: 'المؤداة',
    paymentsCount: 'دفعة مستلمة',
    residentsSummary: 'ملخص السكان',
    paid: 'مؤداة',
    partial: 'جزئية',
    notPaid: 'غير مؤداة',
    print: 'طباعة',
    exportPdf: 'تصدير PDF',
    exportCsv: 'تصدير CSV',
  },

  // History
  history: {
    title: 'السجل',
    filter: 'تصفية',
    allTypes: 'جميع الأنواع',
    payment: 'دفعة',
    expense: 'مصروف',
    from: 'من',
    to: 'إلى',
    noRecords: 'لا توجد سجلات.',
  },

  // Settings
  settings: {
    title: 'الإعدادات',
    building: 'العمارة',
    buildingName: 'اسم العمارة',
    address: 'العنوان',
    city: 'المدينة',
    financial: 'المالية',
    monthlyContribution: 'الاشتراك الشهري',
    currency: 'العملة',
    account: 'الحساب',
    changePassword: 'تغيير كلمة المرور',
    currentPassword: 'كلمة المرور الحالية',
    newPassword: 'كلمة المرور الجديدة',
    confirmPassword: 'تأكيد كلمة المرور',
    saved: 'تم حفظ الإعدادات بنجاح.',
    passwordChanged: 'تم تغيير كلمة المرور بنجاح.',
  },

  // Guide
  guide: {
    title: 'دليل الاستخدام',
    forAdmin: 'للمسؤول',
    forResident: 'للساكن',
    addPaymentGuide: {
      title: 'إضافة دفعة',
      steps: [
        'افتح صفحة الدفعات.',
        'اضغط على إضافة دفعة.',
        'اختر الساكن.',
        'اختر الشهر.',
        'أدخل المبلغ.',
        'احفظ العملية.',
      ],
    },
    addExpenseGuide: {
      title: 'إضافة مصروف',
      steps: [
        'افتح صفحة المصاريف.',
        'اضغط على إضافة مصروف.',
        'اختر الفئة.',
        'أدخل الوصف.',
        'أدخل المبلغ.',
        'احفظ العملية.',
      ],
    },
    viewDashboard: {
      title: 'عرض لوحة التحكم',
      steps: [
        'لوحة التحكم تعرض الرصيد الحالي تلقائيا.',
        'الاشتراكات المستلمة والمتبقة.',
        'مصاريف الشهر.',
        'حالة كل ساكن.',
      ],
    },
    viewReports: {
      title: 'عرض التقارير',
      steps: [
        'افتح صفحة التقارير.',
        'اختر الشهر المطلوب.',
        'التقرير يتم إنشاؤه تلقائيا.',
        'يمكنك الطباعة أو التصدير.',
      ],
    },
  },

  // Auth
  auth: {
    login: 'تسجيل الدخول',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    signIn: 'دخول',
    forgotPassword: 'نسيت كلمة المرور؟',
    logout: 'تسجيل الخروج',
    logoutConfirm: 'هل تريد تسجيل الخروج فعلا؟',
    invalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    sessionExpired: 'انتهت صلاحية الجلسة. يرجى إعادة تسجيل الدخول.',
    tooManyAttempts: 'محاولات تسجيل دخول كثيرة. أعد المحاولة بعد بضع دقائق.',
    maxSessions: 'تم بلوغ الحد الأقصى للجلسات النشطة. سجل الخروج من جهاز آخر.',
  },

  // Roles
  roles: {
    admin: 'المسؤول',
    resident: 'ساكن',
    readOnly: 'للقراءة فقط',
  },

  // Common
  common: {
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    search: 'بحث',
    filter: 'تصفية',
    close: 'إغلاق',
    confirm: 'تأكيد',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ.',
    success: 'تمت العملية بنجاح.',
    saved: 'تم الحفظ بنجاح.',
    updated: 'تم التعديل بنجاح.',
    noPermission: 'ليس لديك الصلاحية للقيام بهذه العملية.',
    networkError: 'خطأ في الاتصال. تحقق من اتصالك بالإنترنت وأعد المحاولة.',
    required: 'هذا الحقل مطلوب.',
    invalidAmount: 'يجب أن يكون المبلغ أكبر من 0.',
    all: 'الكل',
    from: 'من',
    to: 'إلى',
    selectMonth: 'اختر الشهر',
    yes: 'نعم',
    no: 'لا',
    online: 'متصل',
    offline: 'غير متصل',
    offlineMessage: 'أنت غير متصل بالإنترنت. يرجى إعادة الاتصال لتعديل البيانات.',
    empty: 'لا توجد بيانات',
    emptyPayments: 'لا توجد دفعات مسجلة.',
    emptyExpenses: 'لا توجد مصاريف مسجلة.',
  },

  // Validation
  validation: {
    required: 'هذا الحقل مطلوب.',
    email: 'البريد الإلكتروني غير صحيح.',
    minLength: 'الحد الأدنى {min} حرف.',
    passwordMatch: 'كلمتا المرور غير متطابقتين.',
    positiveAmount: 'يجب أن يكون المبلغ أكبر من 0.',
  },

  // Time
  months: {
    january: 'يناير',
    february: 'فبراير',
    march: 'مارس',
    april: 'أبريل',
    may: 'ماي',
    june: 'يونيو',
    july: 'يوليوز',
    august: 'غشت',
    september: 'شتنبر',
    october: 'أكتوبر',
    november: 'نونبر',
    december: 'دجنبر',
  },
};

export default ar;
