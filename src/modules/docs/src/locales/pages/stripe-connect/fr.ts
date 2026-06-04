export const fr = {
  commercial: {
    stripeConnect: {
      ben1: "Facturation sans Frictionalité",
      ben1Desc:
        "Permettez à vos locataires de facturer leurs clients dans le monde entier pendant que vous prélevez votre part automatiquement.",
      ben2: "Risque Financier Réduit",
      ben2Desc:
        "Les fonds transitent par Stripe, évitant les réglementations financières complexes ou le besoin de fiducies.",
      ben3: "Commissions Automatiques",
      ben3Desc:
        "Prélevez des frais fixes ou en pourcentage par transaction, créant un moteur de revenus constant.",
      benefitsIntro:
        "L'activation des paiements divisés via Stripe Connect apporte une grande valeur commerciale.",
      benefitsTitle: "Pourquoi utiliser des Paiements Divisés ?",
      commissionIntro:
        "Chaque transaction de vos locataires est divisée au niveau de la passerelle. Par exemple, si un locataire vend pour 100 $ avec une commission de 5 %, Stripe Connect envoie 95 $ au locataire et 5 $ directement sur le compte de la plateforme.",
      commissionTitle: "Division des Frais de la Plateforme",
      intro:
        "Monétisez immédiatement les transactions de votre plateforme grâce à un système de paiements divisés et de commissions intégré propulsé par Stripe Connect.",
    },
  },
  stripeConnect: {
    apiAccountStatus: "Obtient l'état du compte connecté du locataire et l'état des transferts",
    apiCommissionsDashboard:
      "Obtient des statistiques et des tendances sur les commissions perçues",
    apiCommissionsInvoices: "Liste les factures de commissions générées avec des filtres d'état",
    apiOnboard: "Initie la session d'inscription Stripe Connect pour le locataire",
    apiRetryCharge: "Réessaie le prélèvement manuel et immédiat d'une facture de commission",
    apiWaiveInvoice: "Exonère une facture de commission d'un locataire (marquée comme payée)",
    commissionIntro:
      "Collectez des commissions sur les ventes des locataires de manière dynamique grâce à un système comptable de transactions.",
    commissionTitle: "Moteur de Commissions de la Plateforme",
    controllerIntro:
      "Les points de terminaison de Stripe Connect et des commissions sont gérés par StripeConnectController, TenantStripeConnectController et CommissionsController.",
    controllerTitle: "Endpoints du Hub de Paiement",
    description:
      "Documentation détaillée pour l'inscription des locataires, les comptes personnalisés, les paiements divisés et la gestion des commissions.",
    flowIntro:
      "Les locataires s'inscrivent dans le hub de paiement via un flux d'inscription en libre-service.",
    flowTitle: "Flux d'Inscription des Locataires",
    intro:
      "Le module Stripe Connect fournit des capacités de facturation multi-locataires. Il permet aux locataires de connecter leurs comptes Stripe pour facturer leurs clients, avec prise en charge d'une commission de plateforme automatisée.",
    step1Content:
      "L'administrateur du locataire démarre la connexion depuis le panneau de contrôle, demandant un lien unique d'inscription.",
    step1Title: "Début de l'Inscription",
    step2Content:
      "Le locataire est redirigé vers Stripe pour vérifier ses informations commerciales, ses comptes bancaires et sa conformité.",
    step2Title: "Vérification de Stripe",
    step3Content:
      "Une fois terminé, Stripe redirige vers la plateforme. Le webhook traite la mise à jour et active le compte.",
    step3Title: "Activation du Compte",
    title: "Stripe Connect & Commissions",
  },
};
