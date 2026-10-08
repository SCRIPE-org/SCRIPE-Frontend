/**
 * Documentation for module export
 */
export const fr = {
  modules: {
    ecosystemRecycleBin: {
      title: "Corbeille",
      description: "Gestionnaire de suppression réversible à l'échelle du système avec calendriers de nettoyage permanent automatisés.",
      intro: "Moteur de résolution de suppression réversible pour entités auditables gérant l'isolation des ressources, les routes de récupération et les cycles de purge planifiés par cron.",
      softDeleteTitle: "Moteur de Suppression Réversible et Restauration",
      softDeleteContent: "La Corbeille de l'Écosystème gère les entités supprimées de manière réversible sur tous les modules actifs. En s'appuyant sur les attributs IsDeleted et DeletedAt de la classe de base AuditableEntity, elle applique des filtres de requête globaux et planifie des nettoyages permanents après 30 jours.",
    },
  },
};
