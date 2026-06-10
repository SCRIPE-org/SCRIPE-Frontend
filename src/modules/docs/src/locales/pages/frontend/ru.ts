/**
 * Docs frontend — RU
 * Auto-filled 1 keys from EN.
 */
export const ru = {
  frontend: {
    crudSystem: {
      title: "Система CRUD",
      description:
        "Хук useCrudViewModel, компонент GenericCrudView, DataTable, работа со столбцами и формами.",
      intro:
        "Система CRUD предоставляет готовое решение для создания страниц списков, деталей и форм с минимальным кодом.",
      architectureTitle: "Обзор архитектуры",
      viewModelTitle: "Хук useCrudViewModel",
      viewModelIntro: "Инкапсулирует состояния поиска, сортировки, пагинации и операций CRUD.",
      genericCrudViewTitle: "Компонент GenericCrudView",
      genericCrudViewIntro:
        "Оркестратор, который объединяет DataTable, FormDialog и ConfirmDialog в готовый UI.",
      columnsTitle: "Система столбцов",
      dataTableTitle: "Возможности DataTable",
      searchTitle: "Глобальный поиск",
      searchDesc:
        "Поиск по всем текстовым столбцам с задержкой (debounce) для снижения нагрузки на сервер.",
      sortingTitle: "Сортировка столбцов",
      sortingDesc: "Мультинаправленная сортировка по клику на заголовок (asc/desc).",
      paginationTitle: "Пагинация",
      paginationDesc: "Серверная пагинация с настраиваемым размером страниц (10/25/50/100).",
      selectionTitle: "Выбор строк",
      selectionDesc: "Выбор чекбоксами (включая select-all) для массовых операций.",
      responsiveTitle: "Адаптивный дизайн",
      responsiveDesc: "Горизонтальная прокрутка на мобильных устройствах.",
      rtlTitle: "Поддержка RTL",
      rtlDesc: "Полная поддержка написания справа налево (для арабского и иврита).",
      formTitle: "Система форм",
      formIntro: "Интеграция GenericForm с Zod-схемами для валидации на лету.",
      extensionTip:
        "Система CRUD предназначена для расширения путем оборачивания (wrapping), а не прямого изменения исходного кода.",
    },
    stateManagement: {
      title: "Управление состоянием (Frontend)",
      description:
        "TanStack Query для состояния сервера, Zustand для глобального UI-состояния и локальный useState.",
      intro:
        "Избегайте спагетти-кода, используя правильный инструмент для правильного типа состояния.",
      categoriesTitle: "Категории состояний",
      tanstackTitle: "TanStack Query (Состояние сервера)",
      tanstackIntro: "Обрабатывает все обращения к API, кэширует ответы и дедуплицирует запросы.",
      mutationsTitle: "Мутации и инвалидация кэша",
      zustandTitle: "Zustand (Глобальное состояние UI)",
      zustandIntro: "Для легких, глобальных данных (Токены, Тема, Боковое меню, Уведомления).",
      languageTitle: "Состояние локализации",
      languageIntro: "Управляется через LanguageProvider с сохранением в localStorage.",
      antiPatternsTitle: "Анти-паттерны (Anti-Patterns)",
    },
    localization: {
      title: "Локализация (i18n)",
      description: "LanguageProvider, функция t(), словари и поддержка RTL.",
      intro: "Быстрая реализация i18n на базе React Context, работающая без перезагрузки страниц.",
      architectureTitle: "Архитектура",
      dictionaryTitle: "Структура словаря",
      tFunctionTitle: "Использование функции t()",
      rtlTitle: "Поддержка RTL / LTR",
      rtlIntro: "Динамически меняет направление текста и CSS-классы.",
      addingKeysTitle: "Добавление новых ключей перевода",
      step1Title: "1. Добавление в словарь",
      step1Desc: "Отредактируйте файлы en.ts и ru.ts.",
      step2Title: "2. Использование в компоненте",
      step2Desc: "Доступ через точечную нотацию (dot-notation).",
      step3Title: "3. Интерполяция переменных",
      step3Desc: "Используйте синтаксис {{variable}} для подстановки динамических данных.",
      noLocaleRoutes:
        "В целях производительности (Server-Side Rendering) мы НЕ используем роутинг на основе папок локалей (например, [locale]/page.tsx).",
      moduleLocaleNote:
        "The scripe CLI automatically scaffolds locales/ when creating new modules via scripe new-module. Each locale file contains both EN and AR translations, bundled in a single chunk for instant language switching.",
    },
    formValidation: {
      title: "Валидация форм",
      description:
        "Zod-схемы (клиент), интеграция с React Hook Form и серверная валидация FluentValidation.",
      intro:
        "Двухуровневый подход обеспечивает мгновенную обратную связь для клиента и абсолютную безопасность на сервере.",
      architectureTitle: "Архитектура валидации",
      zodTitle: "Схемы Zod (Клиент)",
      rhfTitle: "Интеграция с React Hook Form",
      rulesTitle: "Справочник правил валидации",
      serverErrorTitle: "Обработка серверных ошибок",
      serverErrorIntro:
        "Ошибки бэкенда (400 Bad Request) автоматически связываются с полями ввода React Hook Form.",
    },
    componentLibrary: {
      title: "Библиотека компонентов",
      description:
        "База на shadcn/ui, утилита cn(), GenericSelect, система тем и правила размещения.",
      intro: "Обеспечивает корпоративный и согласованный дизайн всей платформы.",
      shadcnTitle: "Основа shadcn/ui",
      shadcnIntro:
        "Примитивы компонентов, которые дают полный контроль над стилизацией (через Tailwind CSS).",
      categoriesTitle: "Категории компонентов",
      formsTitle: "Компоненты форм",
      feedbackTitle: "Компоненты обратной связи (Feedback)",
      layoutTitle: "Компоненты макета (Layout)",
      chartsTitle: "Графики и диаграммы (Charts)",
      genericSelectTitle: "Компонент GenericSelect",
      genericSelectIntro:
        "Собственный древовидный селектор с асинхронной загрузкой для огромных списков данных.",
      themeTitle: "Система тем (Themes)",
      responsiveTitle: "Адаптивный дизайн",
      a11yTitle: "Доступность (A11y)",
      placementTitle: "Правила размещения компонентов",
      architectureTitle: "Архитектура компонентов",
      neverInApp:
        "Строго запрещено размещать переиспользуемые UI-компоненты внутри маршрутов Next.js (src/app/).",
    },
    realtime: {
      title: "Реальное время (SignalR)",
      description:
        "SignalR-хабы (AuditHub, NotificationHub), React-хуки и управление подключениями.",
      intro: "Обеспечивает живое обновление данных без необходимости поллинга (polling).",
      architectureTitle: "Архитектура реального времени",
      hubsTitle: "Хабы SignalR",
      hooksTitle: "React-хуки",
      providerTitle: "Провайдер SignalR",
      connectionStatesTitle: "Состояния подключения",
      tenantGroupNote:
        "Сигналы изолированы на сервере: тенант никогда не получит события другого тенанта.",
    },
  },
};
