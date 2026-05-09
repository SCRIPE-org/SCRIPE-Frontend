/**
 * Docs page locale — ES
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const es = {
  tutorials: {
    addModule: {
      title: "Agregar un Módulo Frontend",
      description:
        "Paso a paso para integrar un nuevo Módulo Frontend con patrón SOLID View/ViewModel.",
      intro:
        "Este tutorial garantiza que evites el código espagueti guiándote en la construcción exacta validada por las reglas arquitectónicas de NEXORA.",
      prerequisitesTitle: "Requisitos Previos",
      stepsTitle: "Guía Paso a Paso",
      step1Title: "1. Crear Estructura",
      step1Desc: "Creación de carpetas Domain, Presentation, Data.",
      step2Title: "2. Definir la Entidad",
      step2Desc: "Tipos de TypeScript fuertemente acoplados a reglas de negocio Zod.",
      step3Title: "3. Crear el Repositorio",
      step3Desc: "Promesas asincrónicas y capturas de excepciones en la capa de Datos.",
      step4Title: "4. Establecer Inyección de Dependencias",
      step4Desc: "Declarar tu proveedor para el contenedor de servicios de React.",
      step5Title: "5. Construir ViewModel",
      step5Desc: "Enlazar CRUD genérico al contexto local y prepararlo para la Vista.",
      step6Title: "6. Crear Vista Pura (View)",
      step6Desc:
        "Componente React tonto que solo pinta lo que ViewModel demanda. (Aprox 60 líneas).",
      step7Title: "7. Enrutador y Navegación",
      step7Desc:
        "Poner a disposición el page.tsx dentro del layout y conectarlo a la barra de menú.",
      structureTitle: "Estructura Base",
      entityTitle: "Entidad Zod de Dominio",
      repoTitle: "Capa Repositorio",
      diTitle: "Contenedor de Inyección",
      viewModelTitle: "Hook de ViewModel",
      viewTitle: "Componente Vista",
      routeTitle: "Entrada de Ruta y Red",
      checklist:
        "Antes de lanzar tu Pull Request comprueba la regla de separación absoluta y traducción internacional.",
    },
    addBackendModule: {
      title: "Agregar un Módulo Backend",
      description:
        "El flujo de datos completo a través de Arquitectura Limpia, conectando el patrón CQRS.",
      intro:
        "Cubrimos cómo exponer datos de C# fuertemente seguros y auditados en una API lista para producción.",
      prerequisitesTitle: "Requisitos Previos",
      stepsTitle: "Guía Paso a Paso",
      step1Title: "1. Crear Estructura",
      step1Desc:
        "Establecer librerías de clase separando Dominio, Capa de Aplicación e Infraestructura.",
      step2Title: "2. Establecer Entidad (Domain)",
      step2Desc: "Configurar modelo y validar requerimientos heredados desde AuditableEntity.",
      step3Title: "3. Comandos de Escritura",
      step3Desc:
        "Manejadores NEXORA mediator enfocados únicamente a crear, mutar o destruir registros.",
      step4Title: "4. Consultas (Queries)",
      step4Desc: "Lecturas ultrarrápidas con uso intensivo de mapeo y proyecciones No-Tracking.",
      step5Title: "5. Capa Repositorio",
      step5Desc: "Implementar abstracciones EF Core para el control del contexto.",
      step6Title: "6. Modificar Inyección de Dependencias",
      step6Desc:
        "Avisarle al núcleo de la aplicación de las clases implementadas y los Behaviors requeridos.",
      step7Title: "7. Exponer Controlador API",
      step7Desc: "Decoradores de Autorización, Rutas REST y documentación XML de Swagger.",
      step8Title: "8. Compilar el Migrations",
      step8Desc: "Integración final al DbContext y creación en físico de las tablas SQL.",
      structureTitle: "Estructura Base de C#",
      entityTitle: "Configuraciones Fluentes de Entidad",
      commandTitle: "Aislar Funciones CQRS",
      diTitle: "Cableado de Dependencia",
      controllerTitle: "Diseño de la Interfaz REST",
      registerTitle: "Modificación de Compilación General",
      migrationNote:
        "Siempre realizar el test 'dotnet ef database update' localmente antes del commit principal a la rama.",
    },
  },
};
