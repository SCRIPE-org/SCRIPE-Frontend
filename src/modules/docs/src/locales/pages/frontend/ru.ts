export const ru = {
  frontend: {
    componentLibrary: {
      a11yTitle: "Доступность (A11y)",
      architectureTitle: "Архитектура компонентов",
      categoriesTitle: "Категории компонентов",
      chartsTitle: "Графики и диаграммы (Charts)",
      description:
        "База на shadcn/ui, утилита cn(), GenericSelect, система тем и правила размещения.",
      feedbackTitle: "Компоненты обратной связи (Feedback)",
      formsTitle: "Компоненты форм",
      genericSelectIntro:
        "Собственный древовидный селектор с асинхронной загрузкой для огромных списков данных.",
      genericSelectTitle: "Компонент GenericSelect",
      intro: "Обеспечивает корпоративный и согласованный дизайн всей платформы.",
      layoutTitle: "Компоненты макета (Layout)",
      neverInApp:
        "Строго запрещено размещать переиспользуемые UI-компоненты внутри маршрутов Next.js (src/app/).",
      placementTitle: "Правила размещения компонентов",
      responsiveTitle: "Адаптивный дизайн",
      shadcnIntro:
        "Примитивы компонентов, которые дают полный контроль над стилизацией (через Tailwind CSS).",
      shadcnTitle: "Основа shadcn/ui",
      themeTitle: "Система тем (Themes)",
      title: "Библиотека компонентов",
    },
    crudSystem: {
      architectureTitle: "Обзор архитектуры",
      columnsTitle: "Система столбцов",
      dataTableTitle: "Возможности DataTable",
      description:
        "Хук useCrudViewModel, компонент GenericCrudView, DataTable, работа со столбцами и формами.",
      extensionTip:
        "Система CRUD предназначена для расширения путем оборачивания (wrapping), а не прямого изменения исходного кода.",
      formIntro: "Интеграция GenericForm с Zod-схемами для валидации на лету.",
      formTitle: "Система форм",
      genericCrudViewIntro:
        "Оркестратор, который объединяет DataTable, FormDialog и ConfirmDialog в готовый UI.",
      genericCrudViewTitle: "Компонент GenericCrudView",
      intro:
        "Система CRUD предоставляет готовое решение для создания страниц списков, деталей и форм с минимальным кодом.",
      paginationDesc: "Серверная пагинация с настраиваемым размером страниц (10/25/50/100).",
      paginationTitle: "Пагинация",
      responsiveDesc: "Горизонтальная прокрутка на мобильных устройствах.",
      responsiveTitle: "Адаптивный дизайн",
      rtlDesc: "Полная поддержка написания справа налево (для арабского и иврита).",
      rtlTitle: "Поддержка RTL",
      searchDesc:
        "Поиск по всем текстовым столбцам с задержкой (debounce) для снижения нагрузки на сервер.",
      searchTitle: "Глобальный поиск",
      selectionDesc: "Выбор чекбоксами (включая select-all) для массовых операций.",
      selectionTitle: "Выбор строк",
      sortingDesc: "Мультинаправленная сортировка по клику на заголовок (asc/desc).",
      sortingTitle: "Сортировка столбцов",
      title: "Система CRUD",
      viewModelIntro: "Инкапсулирует состояния поиска, сортировки, пагинации и операций CRUD.",
      viewModelTitle: "Хук useCrudViewModel",
    },
    formValidation: {
      architectureTitle: "Архитектура валидации",
      description:
        "Zod-схемы (клиент), интеграция с React Hook Form и серверная валидация FluentValidation.",
      intro:
        "Двухуровневый подход обеспечивает мгновенную обратную связь для клиента и абсолютную безопасность на сервере.",
      rhfTitle: "Интеграция с React Hook Form",
      rulesTitle: "Справочник правил валидации",
      serverErrorIntro:
        "Ошибки бэкенда (400 Bad Request) автоматически связываются с полями ввода React Hook Form.",
      serverErrorTitle: "Обработка серверных ошибок",
      title: "Валидация форм",
      zodTitle: "Схемы Zod (Клиент)",
    },
    localization: {
      addingKeysTitle: "Добавление новых ключей перевода",
      architectureTitle: "Архитектура",
      description: "LanguageProvider, функция t(), словари и поддержка RTL.",
      dictionaryTitle: "Структура словаря",
      intro:
        "SCRIPE использует локальную систему локализации на уровне модулей. Общие ключи (~1 156) находятся в core/locales/. Каждый модуль владеет своими переводами в со-локализованной директории locales/, которые принудительно импортируются на этапе сборки через module-registry.ts для загрузки страниц без мерцания. Поддерживает арабский (RTL) и английский (LTR) языки с автоматическим переключением направления, сменой шрифтов и сохранением в localStorage.",
      moduleLocaleNote:
        "The scripe CLI automatically scaffolds locales/ when creating new modules via scripe new-module. Each locale file contains both EN and AR translations, bundled in a single chunk for instant language switching.",
      noLocaleRoutes:
        "В целях производительности (Server-Side Rendering) мы НЕ используем роутинг на основе папок локалей (например, [locale]/page.tsx).",
      rtlIntro: "Динамически меняет направление текста и CSS-классы.",
      rtlTitle: "Поддержка RTL / LTR",
      step1Desc:
        "Добавьте новые ключи в файлы locales/{module}.en.ts и {module}.ar.ts вашего модуля. Добавляйте ключи в core/locales/ только в том случае, если они действительно являются общими (валидация, навигация, общий UI).",
      step1Title: "1. Создание или обновление языковых файлов модуля",
      step2Desc:
        "Зарегистрируйте локали вашего модуля в core/locales/module-registry.ts. Новые модули, созданные с помощью scripe new-module, автоматически регистрируются интерфейсом командной строки CLI.",
      step2Title: "2. Регистрация в реестре модулей",
      step3Desc:
        "Вызывайте t('moduleName.keyPath'), используя пространство имен из вашего файла локали. Для интерполяции используйте синтаксис {{variable}} и передавайте переменные в качестве второго аргумента.",
      step3Title: "3. Использование t() с пространством имен модуля",
      tFunctionTitle: "Использование функции t()",
      title: "Локализация (i18n)",
    },
    realtime: {
      architectureTitle: "Архитектура реального времени",
      connectionStatesTitle: "Состояния подключения",
      description:
        "SignalR-хабы (AuditHub, NotificationHub), React-хуки и управление подключениями.",
      hooksTitle: "React-хуки",
      hubsTitle: "Хабы SignalR",
      intro: "Обеспечивает живое обновление данных без необходимости поллинга (polling).",
      providerTitle: "Провайдер SignalR",
      tenantGroupNote:
        "Сигналы изолированы на сервере: тенант никогда не получит события другого тенанта.",
      title: "Реальное время (SignalR)",
    },
    stateManagement: {
      antiPatternsTitle: "Анти-паттерны (Anti-Patterns)",
      categoriesTitle: "Категории состояний",
      description:
        "TanStack Query для состояния сервера, Zustand для глобального UI-состояния и локальный useState.",
      intro:
        "Избегайте спагетти-кода, используя правильный инструмент для правильного типа состояния.",
      languageIntro: "Управляется через LanguageProvider с сохранением в localStorage.",
      languageTitle: "Состояние локализации",
      mutationsTitle: "Мутации и инвалидация кэша",
      tanstackIntro: "Обрабатывает все обращения к API, кэширует ответы и дедуплицирует запросы.",
      tanstackTitle: "TanStack Query (Состояние сервера)",
      title: "Управление состоянием (Frontend)",
      zustandIntro: "Для легких, глобальных данных (Токены, Тема, Боковое меню, Уведомления).",
      zustandTitle: "Zustand (Глобальное состояние UI)",
    },
  },
};
