export const fr = {
  modules: {
    revenueAnalytics: {
      overviewTitle: "Aperçu",
      overview:
        "Le module Revenue Analytics est un composant central de la plateforme SCRIPE, fournissant la logique essentielle de gestion et d'orchestration pour cette fonctionnalité dans le système d'entreprise.",
      architectureTitle: "Architecture & Intégration",
      architectureDesc:
        "Conçu selon les principes du DDD et de la Clean Architecture, garantissant des limites claires, une haute scalabilité et un couplage lâche.",
      dataTitle: "Données & Modèle de schéma",
      dataDesc:
        "Comprend les configurations d'entités EF Core, les champs de suivi AuditableEntity et le support automatique multi-bases de données (SQL Server, PostgreSQL, Oracle).",
      governanceTitle: "Gouvernance & Sécurité",
      governanceDesc:
        "Respecte les exigences d'isolation multi-locataires, les contrôles de sécurité au niveau des champs et la journalisation d'audit pour chaque opération.",
      verificationTitle: "Vérification & Validation",
      verificationDesc:
        "Validé par des tests unitaires/d'intégration et des barrières de contrôle automatisées. Exécutez 'scripe check' pour une vérification complète.",
      sourceMapTitle: "Carte du code source",
      sourceMapIntro:
        "Les fichiers sources suivants contiennent les détails d'implémentation principaux de cette fonctionnalité dans le projet :",
      operatingModelTitle: "Modèle opérationnel",
      operatingModel:
        "S'exécute via les gestionnaires AstraFlow CQRS et les comportements de middleware. Utilise le verrouillage distribué pour une concurrence élevée.",
      localizationNoteTitle: "Localisation & Internationalisation",
      localizationNote:
        "Localisé dans 7 langues (EN, AR, FR, RU, ZH, ES, DE) avec un rendu ultra-rapide et un support complet des dispositions RTL.",
      title: "Revenue Analytics",
    },
  },
};
