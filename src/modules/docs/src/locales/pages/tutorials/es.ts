/**
 * Docs page locale — ES
 */
export const es = {
  tutorials: {
    addBackendModule: {
      commandTitle: "Aislar Funciones CQRS",
      controllerTitle: "Diseño de la Interfaz REST",
      description:
        "El flujo de datos completo a través de Arquitectura Limpia, conectando el patrón CQRS.",
      diTitle: "Cableado de Dependencia",
      entityTitle: "Configuraciones Fluentes de Entidad",
      intro:
        "Cubrimos cómo exponer datos de C# fuertemente seguros y auditados en una API lista para producción.",
      migrationNote:
        "Siempre realizar el test 'dotnet ef database update' localmente antes del commit principal a la rama.",
      prerequisitesTitle: "Requisitos Previos",
      registerTitle: "Modificación de Compilación General",
      step1Desc:
        "Establecer librerías de clase separando Dominio, Capa de Aplicación e Infraestructura.",
      step1Title: "1. Crear Estructura",
      step2Desc: "Configurar modelo y validar requerimientos heredados desde AuditableEntity.",
      step2Title: "2. Establecer Entidad (Domain)",
      step3Desc:
        "Manejadores AstraFlow mediator enfocados únicamente a crear, mutar o destruir registros.",
      step3Title: "3. Comandos de Escritura",
      step4Desc: "Lecturas ultrarrápidas con uso intensivo de mapeo y proyecciones No-Tracking.",
      step4Title: "4. Consultas (Queries)",
      step5Desc: "Implementar abstracciones EF Core para el control del contexto.",
      step5Title: "5. Capa Repositorio",
      step6Desc:
        "Avisarle al núcleo de la aplicación de las clases implementadas y los Behaviors requeridos.",
      step6Title: "6. Modificar Inyección de Dependencias",
      step7Desc: "Decoradores de Autorización, Rutas REST y documentación XML de Swagger.",
      step7Title: "7. Exponer Controlador API",
      step8Desc: "Integración final al DbContext y creación en físico de las tablas SQL.",
      step8Title: "8. Compilar el Migrations",
      stepsTitle: "Guía Paso a Paso",
      structureTitle: "Estructura Base de C#",
      title: "Agregar un Módulo Backend",
    },
    addModule: {
      checklist:
        "Antes de lanzar tu Pull Request comprueba la regla de separación absoluta y traducción internacional.",
      description:
        "Paso a paso para integrar un nuevo Módulo Frontend con patrón SOLID View/ViewModel.",
      diTitle: "Contenedor de Inyección",
      entityTitle: "Entidad Zod de Dominio",
      intro:
        "Este tutorial garantiza que evites el código espagueti guiándote en la construcción exacta validada por las reglas arquitectónicas de SCRIPE.",
      prerequisitesTitle: "Requisitos Previos",
      repoTitle: "Capa Repositorio",
      routeTitle: "Entrada de Ruta y Red",
      step1Desc: "Creación de carpetas Domain, Presentation, Data.",
      step1Title: "1. Crear Estructura",
      step2Desc: "Tipos de TypeScript fuertemente acoplados a reglas de negocio Zod.",
      step2Title: "2. Definir la Entidad",
      step3Desc: "Promesas asincrónicas y capturas de excepciones en la capa de Datos.",
      step3Title: "3. Crear el Repositorio",
      step4Desc: "Declarar tu proveedor para el contenedor de servicios de React.",
      step4Title: "4. Establecer Inyección de Dependencias",
      step5Desc: "Enlazar CRUD genérico al contexto local y prepararlo para la Vista.",
      step5Title: "5. Construir ViewModel",
      step6Desc:
        "Componente React tonto que solo pinta lo que ViewModel demanda. (Aprox 60 líneas).",
      step6Title: "6. Crear Vista Pura (View)",
      step7Desc:
        "Poner a disposición el page.tsx dentro del layout y conectarlo a la barra de menú.",
      step7Title: "7. Enrutador y Navegación",
      stepsTitle: "Guía Paso a Paso",
      structureTitle: "Estructura Base",
      title: "Agregar un Módulo Frontend",
      viewModelTitle: "Hook de ViewModel",
      viewTitle: "Componente Vista",
    },
  },
};
