// FILE-EXCEPTION: file length
/**
 * Exported constant defining parameters and fields for fr configurations.
 *
 * Custom Fields product documentation — twelve pages under the Custom Fields
 * section of the docs portal. Namespaced under modules.customFields.docs so it
 * never collides with the developer-facing modules.customFields.overview page.
 *
 * Translation conventions used throughout this file:
 *
 * - Identifiers stay in Latin/code form and are never translated: machine
 *   error codes (VALIDATION_REQUIRED, AUTH_FORBIDDEN, ...), the literal name
 *   of a value type when it is being used as a type identifier (Text, Select,
 *   EntityReference, File, Image, RichText, ...), entity-type registry keys
 *   (hrms.staff-member, party.person, identity.user, media.file), JSON/wire
 *   shapes ({ "html": "..." }, { entityTypeKey, entityId }), and quoted
 *   example inputs that a reader is meant to reproduce character for
 *   character (a malformed email, a phone number, a hex colour, "about 40").
 *   Only the prose around these is translated.
 * - Where a value type is first introduced as a page heading, the French
 *   term is followed by the English identifier in brackets — "Texte [Text]",
 *   "Sélection [Select]" — the same convention already used in ar.ts for this
 *   dictionary. Inline mentions elsewhere use the bare English identifier.
 * - The product interface itself has no French localisation yet (only English
 *   and Arabic), so quoted product-output strings such as "expects a date"
 *   or "'shirt_size' is not a valid IBAN." are left in English exactly as the
 *   software would show them — translating them would describe a message
 *   nobody actually sees on screen.
 * - "Workspace" is "espace de travail" throughout. "Tenant" is kept as the
 *   established French SaaS loanword where the source text uses it as a
 *   category label (Option Sets' Tenant-created / Tenant administrators).
 * - Numbers spelled out in English ("twenty-two", "eighteen") are translated
 *   as French words. A round character cap stated as a numeral (4,000,
 *   10,000, 50,000) is rendered with the French thousands space (4 000,
 *   10 000, 50 000). A numeral that is itself a literal example value someone
 *   would type into a field (a currency amount, a duration, a percentage) is
 *   left in its original digit form, because changing "100.50" to "100,50"
 *   would describe an input the parser may not accept.
 */
export const fr = {
  modules: {
    customFields: {
      docs: {
        // ═══════════════════════════════════════════════════
        //  Champs personnalisés (page d'accueil de la section)
        // ═══════════════════════════════════════════════════
        home: {
          title: "Champs personnalisés",
          description:
            "Ajoutez vos propres champs aux enregistrements que vous utilisez déjà — ce qu'est un champ personnalisé, de quoi il est composé, comment sa portée est définie, et où trouver le reste de la documentation.",
          intro:
            "Les champs personnalisés vous permettent d'ajouter vos propres informations aux enregistrements que vous manipulez déjà — une nationalité sur une personne, un pied fort sur un joueur, un numéro de bon de commande sur une réservation — sans attendre une nouvelle version et sans qu'il soit besoin d'écrire une seule ligne de code. Vous définissez le champ une fois sur l'écran Champs personnalisés, et à partir de ce moment, tous les formulaires de création et de modification pour ce type d'enregistrement l'affichent, la liste des enregistrements gagne une colonne pour lui, et la valeur que vous saisissez est stockée pour cet enregistrement précis.",
          valueInfoTitle: "En une phrase",
          valueInfoContent:
            "Un champ personnalisé est une question que vous décidez de poser à propos d'un enregistrement : définie une fois par un administrateur, et à laquelle répond ensuite quiconque remplit cet enregistrement.",

          whatTitle: "Ce que vous obtenez",
          whatIntro:
            "Les champs personnalisés ne sont pas une simple zone de notes en texte libre accolée à un enregistrement. Chacun est un champ réel, typé, nommé, avec ses propres règles de validation, sa propre place dans le formulaire, sa propre colonne dans la liste, et son propre historique.",
          featDefineOnce: "Défini une fois, utilisé partout",
          featDefineOnceDesc:
            "Ajoutez le champ sur l'écran Champs personnalisés et tous les formulaires de création et de modification pour ce type d'enregistrement l'adoptent, avec une colonne supplémentaire dans la liste des enregistrements. Aucune nouvelle version, aucun code, aucune attente.",
          featTyped: "Vérifié à la saisie",
          featTypedDesc:
            "Chaque type de valeur a ses propres règles — une véritable adresse e-mail, une couleur hexadécimale, une note de 1 à 5 — de sorte qu'une valeur incorrecte est refusée avec un message précis plutôt que stockée silencieusement et découverte six mois plus tard.",
          featValueTypes: "Vingt-deux types de valeur",
          featValueTypesDesc:
            "Texte et texte long, texte enrichi mis en forme, choix simple et choix multiple, nombres, pourcentages, notes, montants, durées, dates, date et heure avec un véritable fuseau horaire, heures, e-mail, adresses web, numéros de téléphone, oui/non et couleur — plus un fichier et une image, et deux types qui ne stockent aucun texte et pointent à la place vers un enregistrement d'une autre partie du produit.",
          featScoped: "Le vôtre, ou celui de toute la plateforme",
          featScopedDesc:
            "Un champ que vous créez n'appartient qu'à votre espace de travail. Les administrateurs de la plateforme peuvent créer des champs globaux hérités par tous les espaces de travail, qu'aucun espace de travail ne peut modifier ni supprimer.",
          featSecured: "Restreignable champ par champ",
          featSecuredDesc:
            "Un rôle ou un groupe d'utilisateurs peut masquer un champ précis aux personnes qui le détiennent, et le produit ne laissera pas quelqu'un qui ne peut pas voir une valeur l'effacer en modifiant l'enregistrement autour d'elle.",
          featAccountable: "Traçable",
          featAccountableDesc:
            "Chaque changement de définition est enregistré avec qui l'a fait et quand, un rapport d'utilisation vous indique combien de réponses un champ contient avant que vous ne le supprimiez, et l'ensemble des définitions s'exporte vers une feuille de calcul.",

          anatomyTitle: "De quoi un champ est composé",
          anatomyIntro:
            "Voici l'ensemble complet des éléments que porte une définition de champ. Trois d'entre eux sont définitifs une fois enregistrés, car les réponses déjà consignées sous ces réglages n'auraient plus de sens s'ils changeaient. Les noms des contrôles sont donnés tels qu'ils apparaissent dans l'interface anglaise.",
          thPart: "Paramètre",
          thWhat: "Ce que c'est",
          thChange: "Modifiable plus tard ?",
          partEntityType:
            "Le type d'enregistrement auquel le champ appartient — personnes, membres du personnel, réservations, etc.",
          partKey:
            "Le nom machine, utilisé dans les messages d'erreur et les exports. En minuscules, commence par une lettre, uniquement des lettres, des chiffres et des tirets bas.",
          partValueType:
            "L'un des vingt-deux types, qui détermine ce qui peut être saisi et comment c'est vérifié.",
          partLabelEn:
            "Le libellé anglais que les utilisateurs voient au-dessus du champ de saisie.",
          partLabelAr:
            "Le libellé arabe, facultatif. Si vide, le libellé anglais est utilisé à la place.",
          partPlaceholder:
            "Texte indicatif grisé, facultatif, affiché dans le champ vide, dans chaque langue.",
          partRequired: "Si un enregistrement peut être sauvegardé avec ce champ laissé vide.",
          partSortOrder:
            "Où le champ se situe par rapport aux autres champs personnalisés du formulaire.",
          partFieldGroup: "L'en-tête facultatif sous lequel le champ est rassemblé.",
          partOptions: "La liste des réponses autorisées. Uniquement pour Select et MultiSelect.",
          partValidator:
            "Une vérification de format supplémentaire facultative, plus son paramètre. Uniquement pour les champs Text.",
          partReferenceTarget:
            "Le seul type d'enregistrement vers lequel les valeurs de ce champ peuvent pointer, ou rien pour laisser chaque valeur choisir le sien. Uniquement pour les champs Entity Reference.",
          partSensitivity:
            "Un libellé de classification — Non classifié, Interne, Confidentiel ou Restreint — pour le reporting et la gestion des exports.",
          partExportable:
            "Un indicateur précisant si les valeurs de ce champ doivent figurer dans les exports. Il n'affecte pas l'export des définitions, qui liste toujours le champ et rapporte cet indicateur.",
          partActive:
            "Si le champ est encore proposé sur les formulaires. Un champ inactif conserve ses réponses déjà enregistrées.",
          partScope:
            "Si le champ appartient à votre espace de travail ou à toute la plateforme. Décidé par qui le crée.",
          changeNever: "Non — définitif une fois enregistré",
          changeAnytime: "Oui, à tout moment",
          changeAnytimeConditions: "Oui, sauf si un rôle ou un groupe restreint le champ",
          changeAnytimeCare: "Oui, mais lisez d'abord les avertissements",

          exampleTitle: "Un exemple concret, de bout en bout",
          exampleIntro:
            "Supposons que l'académie doive enregistrer la nationalité de chaque joueur, et que le produit n'ait pas un tel champ. Rien ici n'exige de développeur.",
          ex1Title: "Décidez ce que vous demandez",
          ex1Content:
            "La question est « quelle est la nationalité de ce joueur ? ». La réponse est un court texte sans liste de choix fixe, donc le type de valeur est Text. Si vous vouliez vraiment une liste fixe, Select serait le bon choix à la place — et cette décision est définitive, elle mérite donc un instant de réflexion.",
          ex2Title: "Définissez le champ",
          ex2Content:
            "Sur l'écran Champs personnalisés, choisissez Add. Sélectionnez le type d'enregistrement Personnes, définissez la clé sur nationality, le libellé anglais sur Nationality, le type de valeur sur Text, et laissez Required désactivé pour l'instant. Enregistrez.",
          ex3Title: "Remplissez-le",
          ex3Content:
            "Ouvrez n'importe quel enregistrement de joueur. Une section Champs personnalisés affiche maintenant un champ Nationality, vide. Saisissez une valeur et enregistrez la fiche. L'absence d'erreur signifie que la valeur a été acceptée et stockée pour ce joueur.",
          ex4Title: "Relisez-le",
          ex4Content:
            "Rouvrez l'enregistrement : la valeur est là. La liste des enregistrements possède désormais aussi une colonne Nationality, ce qui permet de voir la réponse de chaque joueur d'un seul coup d'œil, sans en ouvrir aucun.",
          ex5Title: "Renforcez-le",
          ex5Content:
            "Plus tard, vous décidez que le champ doit toujours être rempli. Modifiez la définition et activez Obligatoire. À partir de là, un joueur ne peut plus être enregistré avec Nationality vide — mais notez que les joueurs déjà enregistrés avec ce champ vide restent tels quels jusqu'à ce que quelqu'un les modifie.",

          scopeTitle: "Votre espace de travail, ou toute la plateforme",
          scopeIntro:
            "Un champ créé par un administrateur à l'intérieur d'un espace de travail appartient à cet espace de travail. Personne dans un autre espace de travail ne le voit, et ses réponses ne sont jamais visibles en dehors. C'est le cas normal, et il ne nécessite aucune réflexion particulière.",
          scopeGlobal:
            "Un administrateur de la plateforme travaillant sans espace de travail sélectionné crée à la place un champ global, et le formulaire affiche alors un interrupteur Global (tous les espaces de travail). Un champ global est hérité par tous les espaces de travail : tout le monde peut le remplir, et seul un administrateur de la plateforme peut le modifier, le réordonner ou le supprimer. Les champs globaux échappent aussi au quota de champs par espace de travail.",
          scopeInfoTitle: "La portée se décide à la création",
          scopeInfoContent:
            "Il n'existe aucun moyen de convertir un champ d'espace de travail en champ global, ni l'inverse. Si la portée est incorrecte, le champ doit être recréé avec la bonne portée — et les réponses déjà enregistrées sous l'ancien champ restent attachées à celui-ci.",

          notTitle: "Ce que les champs personnalisés ne sont pas",
          notIntro:
            "Quelques attentes raisonnables que l'on peut avoir à leur égard, et auxquelles ils ne répondent délibérément pas.",
          not1: "Ils ne remplacent pas une véritable fonctionnalité. Un champ personnalisé stocke et affiche une réponse ; il ne calcule rien, ne déclenche rien, et n'apparaît dans aucun rapport que vous n'avez pas construit.",
          not2: "Ce ne sont pas un mécanisme de contrôle d'accès. Le paramètre Sensibilité est un libellé. La sécurité au niveau du champ, configurée sur les rôles et les groupes d'utilisateurs, est ce qui masque réellement un champ.",
          not3: "Ce ne sont pas une bibliothèque documentaire complète. File et Image contiennent chacun une seule référence gérée, pas un historique de versions ni une galerie — les flux de pièces jointes plus larges relèvent des propres fonctionnalités de pièces jointes de l'enregistrement. Le rattachement d'une nouvelle valeur File ou Image n'est pas encore possible depuis cet écran : les deux types peuvent être définis, et une valeur existante peut être consultée ou effacée.",
          not4: "Ils ne sont pas de forme libre. Chaque champ a exactement un type de valeur, choisi au départ et définitif, et chaque valeur y est vérifiée à la saisie.",
          not5: "Ils ne sont pas rétroactifs. Durcir un champ — le rendre obligatoire, ou lui attacher une vérification de format — ne revient jamais en arrière pour revérifier les réponses déjà enregistrées.",

          nextTitle: "Où aller ensuite",
          nextIntro: "Le reste de cette section couvre chaque partie en détail.",
          thPage: "Page",
          thCovers: "Ce qu'elle couvre",
          pageValueTypes: "Types de valeur",
          coversValueTypes:
            "Les vingt-deux types, un par un : ce que chacun stocke, ce qu'il accepte, ce qu'il rejette, et des exemples de saisie avec le code d'erreur que le produit renvoie.",
          pageReferences: "Champs de référence",
          coversReferences:
            "Les deux types qui pointent vers un enregistrement d'une autre partie du produit : lequel utiliser, ce qui est réellement stocké, pourquoi un nom n'y est jamais stocké, comment épingler une cible, ce qui peut être référencé, et les règles d'espace de travail.",
          pageReferenceLookups: "Recherches de référence",
          coversReferenceLookups:
            "Les trois recherches qui se cachent derrière un champ de référence, ce que signifie chaque réponse, les cinq états d'échec et à qui chacun incombe, ce qui se passe quand l'enregistrement référencé est supprimé, et comment se comporte le sélecteur.",
          pageDefining: "Définir un champ",
          coversDefining:
            "Le formulaire de définition contrôle par contrôle, le parcours complet, les règles de nommage des clés, la création d'un champ depuis l'intérieur d'un enregistrement, et chaque refus que vous pouvez rencontrer.",
          pageGroups: "Groupes de champs",
          coversGroups:
            "Rassembler les champs d'un type d'enregistrement sous des en-têtes, la clé stable, l'ordonnancement, la suppression, les groupes globaux, et ce que les groupes affectent ou n'affectent pas.",
          pageOptions: "Options",
          coversOptions:
            "Rédiger les réponses autorisées pour Select et MultiSelect, l'éditeur d'options bilingue, comment une valeur soumise est comparée, et ce que change plus tard la modification de la liste sur les enregistrements existants.",
          pageValidators: "Validateurs",
          coversValidators:
            "Les 13 vérifications de format intégrées avec des exemples de saisie valides et invalides, les six qui nécessitent un paramètre, les sept pays de code postal pris en charge, et à quoi ressemble un refus.",
          pageSecurity: "Sécurité au niveau du champ",
          coversSecurity:
            "Restreindre un champ sur un rôle ou un groupe d'utilisateurs, ce que voit une personne restreinte, pourquoi ses enregistrements ne détruisent pas les valeurs masquées, et pourquoi obligatoire et restreint ne peuvent pas être combinés.",
          pageManaging: "Gestion des champs",
          coversManaging:
            "Modifier, désactiver, la boîte de dialogue d'historique de définition, le rapport d'utilisation et d'impact, supprimer sans détruire de données, l'export vers une feuille de calcul, et les deux écrans de référence en lecture seule.",
          pageLimits: "Limites et comportements",
          coversLimits:
            "Chaque plafond fixe, chaque limitation délibérée, et la raison de chacune — pour que vous ne passiez pas un après-midi à chercher un paramètre qui n'existe pas.",

          accessTitle: "Permissions",
          accessIntro:
            "Travailler avec les définitions nécessite ses propres permissions. Remplir un champ que quelqu'un d'autre a défini ne demande rien de plus que l'accès à l'enregistrement lui-même.",
          thNeed: "Permission",
          thWhoNeedsIt: "Ce qu'elle permet",
          permView:
            "Voir l'écran Champs personnalisés, la liste des définitions, les boîtes de dialogue Historique et Utilisation, et les deux écrans de référence en lecture seule.",
          permCreate:
            "Créer une définition, y compris via le lien Add custom field à l'intérieur d'un formulaire d'enregistrement.",
          permUpdate: "Modifier une définition existante.",
          permDelete: "Supprimer une définition, y compris confirmer une suppression destructrice.",
          permGroups:
            "La fonctionnalité des groupes de champs, verrouillée séparément. Un rôle détenant déjà toutes les permissions de champs personnalisés ci-dessus ne détient pas automatiquement celles-ci.",
          planInfoTitle: "Les champs personnalisés font partie de votre forfait",
          planInfoContent:
            "La fonctionnalité est soumise à un droit d'accès et à un quota : l'édition Free n'autorise aucun champ, et chaque forfait a un nombre maximal de champs par espace de travail. Si l'écran Champs personnalisés est absent, si le bouton Add manque, ou si un enregistrement est refusé pour quota, il s'agit d'une question de forfait plutôt que d'un défaut. Les champs globaux de la plateforme ne comptent pas dans le quota d'un espace de travail.",
        },

        // ═══════════════════════════════════════════════════
        //  Types de valeur
        // ═══════════════════════════════════════════════════
        valueTypes: {
          title: "Types de valeur",
          description:
            "Les vingt-deux types de valeur des champs personnalisés : ce que chacun stocke, exactement ce qu'il accepte et rejette, des exemples de saisie, et les codes d'erreur que le produit renvoie.",
          intro:
            "Chaque champ personnalisé a exactement un type de valeur, choisi lors de la définition du champ. Le type de valeur détermine le contrôle qui apparaît sur le formulaire, ce que le produit accepte, comment la valeur est stockée et comment elle s'affiche ensuite. Cette page couvre les vingt-deux, un par un, avec des exemples de saisie acceptés et des exemples de saisie refusés. Dix-huit d'entre eux stockent ce que vous avez tapé ; les quatre autres stockent un pointeur à la place — deux vers un enregistrement situé ailleurs dans le produit, avec une page qui leur est propre, et deux vers un unique fichier ou image téléversé.",
          permanentTitle:
            "Changer le type de valeur plus tard est une opération distincte et restreinte",
          permanentContent:
            "Neuf paires de types précises peuvent être converties après coup, depuis la propre action du champ dans le menu de ligne — voir la page Gestion des champs — mais toute autre paire est refusée d'emblée, et il ne faut pas compter sur la conversion pour rattraper un mauvais choix : choisissez le bon type dès le départ chaque fois que possible, car l'issue de loin la plus fréquente d'un mauvais choix reste de supprimer et recréer le champ, perdant du même coup les réponses déjà stockées pour lui.",

          orderTitle: "Comment une valeur soumise est vérifiée",
          orderIntro:
            "Chaque enregistrement exécute les quatre mêmes étapes, dans le même ordre, pour chaque type. Connaître cet ordre explique la plupart des surprises.",
          order1:
            "La valeur est-elle vide ? Une valeur absente, une chaîne vide, ou une chaîne composée uniquement d'espaces compte comme vide. Pour MultiSelect, une liste vide compte aussi, et pour DateTime, Currency et les quatre types en forme de référence (EntityReference, UserReference, File, Image), une valeur ne compte comme vide que lorsque ses deux parties sont absentes.",
          order2:
            "Si elle est vide et que le champ est Obligatoire, l'enregistrement est refusé avec VALIDATION_REQUIRED. Si elle est vide et que le champ n'est pas obligatoire, la valeur stockée est effacée et rien d'autre ne s'exécute — ni vérification de type, ni validateur.",
          order3:
            "Si elle n'est pas vide, les règles propres au type s'exécutent : plafonds de longueur, analyse des nombres, vérifications de plage, correspondance avec les options autorisées, vérifications de format.",
          order4:
            "Pour un champ Text auquel un validateur est attaché, et alors seulement, le validateur s'exécute en dernier — après le plafond global de 4 000 caractères et après le plafond de longueur, plus court, propre au validateur.",
          orderKeyNote:
            "Un détail à connaître avant de lire un message d'erreur : le message nomme la clé du champ, pas son libellé. Un champ libellé Nationality avec la clé nationality produit « 'nationality' expects a date. », pas « 'Nationality' ».",

          thExample: "Exemple de saisie",
          thOutcome: "Ce qui se passe",

          groupTextTitle: "Texte et choix",
          textTitle: "Texte [Text]",
          textStores:
            "Une seule ligne de texte libre, jusqu'à 4 000 caractères. S'affiche comme un champ de saisie mono-ligne ordinaire.",
          textChecks:
            "La seule vérification est le plafond de longueur — sauf si un validateur est attaché, ce qui fait de Text le seul type pouvant porter une vérification de format. La valeur est stockée exactement telle que soumise ; contrairement à Select, Text ne supprime pas les espaces qui l'entourent.",
          textOk: "Acceptée, et stockée exactement telle que soumise.",
          textTooLong:
            "Refusée : VALIDATION_MAX_LENGTH. Text s'arrête à 4 000 caractères — utilisez LongText pour tout ce qui est plus long.",
          textBlankOptional:
            "Acceptée, et stockée comme effacée. Une valeur composée uniquement d'espaces compte comme vide, donc un validateur éventuellement attaché ne s'exécute jamais dessus.",
          textBlankRequired:
            "Refusée : VALIDATION_REQUIRED. Ici aussi, une valeur composée uniquement d'espaces compte comme vide.",
          exText4500: "Une valeur longue de 4 500 caractères",
          exSpacesOptional: "Trois espaces, sur un champ non Obligatoire",
          exSpacesRequired: "Trois espaces, sur un champ Obligatoire",

          longTextTitle: "Texte long [LongText]",
          longTextStores:
            "Un contenu libre plus long, jusqu'à 10 000 caractères. S'affiche comme une véritable zone de texte multiligne, pas comme une boîte mono-ligne agrandie.",
          longTextChecks:
            "Seul le plafond de 10 000 caractères s'applique. LongText ne peut pas porter de validateur. Le compteur à l'écran passe au rouge une fois le plafond dépassé, mais il ne vous empêche pas de continuer à taper — le refus survient à l'enregistrement.",
          longTextOk:
            "Acceptée. C'est bien au-delà du plafond de 4 000 caractères propre à Text, qui est la raison d'être de LongText.",
          longTextTooLong:
            "Refusée : VALIDATION_MAX_LENGTH, en nommant le plafond de 10 000 caractères.",
          exLong6000: "Une description de 6 000 caractères",
          exLong12000: "Une description de 12 000 caractères",

          selectTitle: "Sélection [Select]",
          selectStores:
            "Une réponse choisie dans une liste que vous rédigez vous-même. S'affiche comme une liste déroulante proposant exactement vos options.",
          selectChecks:
            "La valeur soumise doit correspondre exactement à l'une des options configurées pour le champ. Les deux côtés sont épurés des espaces avant comparaison, et la comparaison est sensible à la casse. Pour une liste d'options Small, Medium, Large :",
          selectOk: "Acceptée, et stockée telle quelle comme le texte de l'option.",
          selectTrimmed:
            "Acceptée. Les espaces qui l'entourent sont supprimés avant la comparaison.",
          selectCase:
            "Refusée : VALIDATION_INVALID_FORMAT. La comparaison est sensible à la casse, donc Medium et medium sont des réponses différentes — ce qui signifie aussi que les deux peuvent légitimement exister comme deux options distinctes.",
          selectUnknown:
            "Refusée : VALIDATION_INVALID_FORMAT. Le message cite la valeur rejetée et la clé du champ.",
          exSelectPadded: "« Medium » précédé d'une espace",

          multiSelectTitle: "Sélection multiple [MultiSelect]",
          multiSelectStores:
            "Plusieurs réponses issues du même type de liste, jusqu'à 19. S'affiche comme un champ à sélection multiple avec un compteur en direct « N sur 19 sélectionnées ».",
          multiSelectChecks:
            "Chaque réponse soumise doit être l'une des options configurées pour le champ, aucune réponse ne peut se répéter, et il ne peut y en avoir plus de 19. L'ordre de sélection est conservé de bout en bout. Pour une liste d'options Red, Green, Blue, Yellow :",
          multiOk:
            "Acceptée, et relue dans l'ordre de sélection — Blue d'abord, puis Red — sans être retriée dans l'ordre où les options étaient listées.",
          multiTooMany:
            "Refusée : VALIDATION_MAX_LENGTH, en nommant le plafond de 19. Le sélecteur lui-même rend la vingtième option impossible à choisir, donc atteindre ce cas nécessite une requête qui contourne le formulaire.",
          multiDuplicate:
            "Refusée : VALIDATION_UNIQUE. Une réponse répétée est rejetée plutôt que silencieusement réduite à une seule.",
          multiUnknown:
            "Refusée : VALIDATION_INVALID_FORMAT — Purple ne fait pas partie des options du champ.",
          multiEmpty:
            "Traitée comme vide : effacée si le champ est facultatif, refusée avec VALIDATION_REQUIRED s'il est obligatoire.",
          exMultiTwo: "Blue, puis Red",
          exMultiTwenty: "20 sélections",
          exMultiRepeat: "Red, puis Red à nouveau",
          exMultiEmptyList: "Une liste explicitement vide",

          groupNumberTitle: "Nombres et mesures",
          numberTitle: "Nombre [Number]",
          numberStores:
            "Tout nombre, entier ou décimal, positif ou négatif, avec jusqu'à six décimales.",
          numberChecks:
            "La seule vérification est que la valeur s'analyse comme un nombre. Aucune règle de minimum, de maximum, de précision ou d'arrondi n'est appliquée : choisissez Number lorsque véritablement n'importe quel nombre est une réponse valide — et choisissez Percent, Rating, Currency ou Duration lorsque ce n'est pas le cas.",
          numberOk: "Acceptée.",
          numberNegative: "Acceptée. Les valeurs négatives sont parfaitement valides pour ce type.",
          numberPrecision:
            "Acceptée, et stockée avec six décimales. Toute précision plus fine n'est pas conservée.",
          numberInvalid:
            "Refusée : VALIDATION_INVALID_FORMAT — le message indique « expects a number ». Un nombre écrit en toutes lettres n'est pas analysé.",
          exAboutForty: '"about 40"',

          percentTitle: "Pourcentage [Percent]",
          percentStores:
            "Un pourcentage compris entre 0 et 100 inclus, décimales autorisées. S'affiche comme un simple champ de saisie numérique, puis se présente ensuite comme le nombre suivi du signe %.",
          percentChecks:
            "La valeur doit s'analyser comme un nombre et se situer entre 0 et 100. Elle est stockée exactement telle que saisie — c'est le détail à bien maîtriser si vous lisez un jour les données brutes ou construisez un export.",
          percentOk: "Acceptée, et affichée ensuite comme 25%.",
          percentDecimal:
            "Acceptée, et affichée comme 33.5%. Les fractions de point de pourcentage sont conservées exactement.",
          percentQuarter:
            "Acceptée — mais cela signifie un quart d'un pour cent, affiché comme 0.25%. Percent stocke le nombre que vous diriez à voix haute, jamais une fraction entre 0 et 1.",
          percentTooHigh: "Refusée : VALIDATION_RANGE, en nommant les bornes 0 et 100.",
          percentNegative:
            "Refusée : VALIDATION_RANGE. La borne inférieure est 0, et elle est incluse.",

          ratingTitle: "Note [Rating]",
          ratingStores:
            "Un nombre entier de 1 à 5, saisi sur un curseur. S'affiche ensuite comme « 4 / 5 ».",
          ratingChecks:
            "La valeur doit s'analyser comme un nombre, être un nombre entier, et se situer entre 1 et 5 inclus. Il n'y a ni contrôle en étoiles ni saisie de texte libre.",
          ratingOk: "Acceptée, et affichée comme 4 / 5.",
          ratingZero:
            "Refusée : VALIDATION_RANGE. Un zéro est une valeur réellement soumise qui échoue à la vérification de plage 1 à 5 ; il n'est pas interprété comme « non noté ».",
          ratingFraction:
            "Refusée : VALIDATION_RANGE. Les demi-notes ne sont pas prises en charge — c'est une différence réelle avec Number, qui autorise n'importe quelle décimale.",
          ratingTooHigh: "Refusée : VALIDATION_RANGE, avec le même message qu'un 0.",
          ratingUntouched:
            "Enregistrée comme vide, pas comme 1. La poignée du curseur doit bien se trouver quelque part, donc un champ non touché s'affiche à sa position la plus à gauche — c'est un artefact d'affichage, pas une réponse stockée.",
          exRatingUntouched: "Le curseur laissé intact sur un nouvel enregistrement",

          currencyTitle: "Devise [Currency]",
          currencyStores:
            "Un montant accompagné de son code de devise à trois lettres, conservé comme deux champs de saisie indépendants à l'intérieur d'un même groupe libellé. S'affiche ensuite selon le formatage numérique propre au lecteur, en montrant le code plutôt qu'un symbole afin que EUR et USD ne soient jamais ambigus.",
          currencyChecks:
            "Les deux parties sont exigées ensemble. Le montant doit s'analyser comme un nombre ; le code doit être exactement trois lettres ASCII majuscules. Le champ du code se met en majuscules et filtre les lettres au fur et à mesure de la saisie, car la vérification elle-même ne convertit pas les minuscules — elle les rejette.",
          currencyOk:
            "Acceptée. S'affiche comme le montant accompagné du code, par exemple USD 100.50.",
          currencyLower:
            "Refusée si elle atteint un jour le serveur : VALIDATION_INVALID_FORMAT, en nommant l'exigence des trois lettres de la norme ISO 4217. Dans le formulaire lui-même, le champ force les majuscules au fur et à mesure de la saisie, donc vous ne verrez normalement pas ce cas.",
          currencyNoCode:
            "Refusée : VALIDATION_INVALID_FORMAT. Le formulaire bloque aussi ce cas avant même d'appeler le serveur, avec un message indiquant que le champ a besoin à la fois d'un montant et d'un code de devise.",
          currencyNoAmount:
            "Refusée de la même façon. Un code sans montant est une valeur incomplète, pas une valeur effacée — seule l'absence des deux parties compte comme vide.",
          currencyZzz:
            "Acceptée. Seule la forme du code est vérifiée, jamais son appartenance à la véritable liste ISO 4217, donc un code bien formé mais inexistant passe. L'affichage se replie sur « ZZZ 100.50 » pour un code que le navigateur du lecteur ne reconnaît pas.",
          currencyMinor:
            "Acceptée, et cela signifie dix mille cinquante. Il n'existe nulle part d'unités mineures dans le stockage des champs personnalisés — 100.50 est stocké comme 100.50, jamais comme 10050.",
          exCurrencyOk: "100.50 avec le code USD",
          exCurrencyLower: "100.50 avec le code usd",
          exCurrencyNoCode: "100.50 avec le code laissé vide",
          exCurrencyNoAmount: "Le montant laissé vide avec le code USD",
          exCurrencyZzz: "100.50 avec le code ZZZ",
          exCurrencyMinor: "10050 avec le code USD",

          durationTitle: "Durée [Duration]",
          durationStores:
            "Une durée comptée en minutes. S'affiche comme un champ numérique avec un libellé « minutes » visible à côté, jamais comme un nombre nu sans unité.",
          durationChecks:
            "La valeur doit s'analyser comme un nombre et ne doit pas être négative. Zéro est accepté — un « aucun tampon » légitime. Il n'y a aucune borne supérieure.",
          durationOk: "Acceptée, et affichée comme 90 minutes.",
          durationFraction:
            "Acceptée, et conservée exactement comme 1.5 — quatre-vingt-dix secondes. Les décimales ne sont pas arrondies à la minute entière.",
          durationZero: "Acceptée. Zéro est une réponse réelle, pas une réponse vide.",
          durationLarge:
            "Acceptée — 5 400 minutes, soit trois jours et demi. Rien ne vous avertit, car il n'y a pas de maximum.",
          durationNegative:
            "Refusée : VALIDATION_RANGE, avec un message indiquant que la valeur ne doit pas être négative.",

          groupDateTitle: "Dates et heures",
          dateTitle: "Date [Date]",
          dateStores:
            "Une date calendaire sans aucune composante horaire — un anniversaire, une date de contrat, une expiration. S'affiche comme un sélecteur de date.",
          dateChecks:
            "La seule vérification est que la valeur s'analyse comme une date. Comme la valeur stockée est une simple date calendaire plutôt qu'un instant précis, elle se relit identiquement pour chaque lecteur, quel que soit son fuseau horaire.",
          dateOk:
            "Acceptée, et relue comme la même date calendaire pour chaque lecteur, où qu'il soit.",
          dateNoTime:
            "Ignorée. Date ne contient aucune composante horaire, donc une heure soumise en même temps que la date n'est tout simplement pas stockée. Utilisez DateTime lorsque l'heure compte.",
          dateInvalid:
            "Refusée : VALIDATION_INVALID_FORMAT — le message indique « expects a date ».",
          exDateWithTime: "Une date à laquelle est rattachée une composante horaire",
          exNotADate: '"next Tuesday"',

          dateTimeTitle: "Date et heure [DateTime]",
          dateTimeStores:
            "Un instant précis accompagné du fuseau horaire auquel il appartient. Les deux moitiés sont stockées, de sorte qu'un coup d'envoi à 18:00 au Caire se relit toujours comme 18:00 au Caire pour quelqu'un qui le consulte depuis Londres.",
          dateTimeChecks:
            "L'instant doit s'analyser correctement, et le fuseau horaire doit être un identifiant de fuseau que le serveur reconnaît — en pratique un identifiant IANA tel que « Africa/Cairo », bien que la vérification sous-jacente dépende de la plateforme : un déploiement hébergé sous Windows accepte aussi un identifiant Windows natif tel que « Egypt Standard Time ». Le fuseau est exigé dès que l'une des deux moitiés est présente — un instant sans fuseau est refusé, jamais interprété silencieusement. Le formulaire affiche le fuseau comme une petite indication à côté de l'heure saisie, avec un lien Change qui ouvre un sélecteur permettant la recherche.",
          dateTimeOk:
            "Acceptée. L'instant et son fuseau sont tous deux relus exactement tels que saisis.",
          dateTimeNoZone:
            "Refusée : VALIDATION_INVALID_TIMEZONE. Un instant sans fuseau est exactement ce que DateTime existe pour empêcher.",
          dateTimeBadZone:
            "Refusée : VALIDATION_INVALID_TIMEZONE, en nommant l'identifiant non reconnu. Les fuseaux sont de véritables noms IANA tels que Africa/Cairo ou Asia/Tokyo.",
          dateTimeEmpty:
            "Traitée comme vide : effacée si le champ est facultatif, refusée avec VALIDATION_REQUIRED s'il est obligatoire. Seule l'absence des deux moitiés compte comme vide.",
          exDateTimeOk: "18:00 le 21 août 2026, fuseau Africa/Cairo",
          exDateTimeNoZone: "18:00 le 21 août 2026, fuseau laissé vide",
          exDateTimeBadZone: "18:00 le 21 août 2026, fuseau Not/AZone",
          exDateTimeBothBlank: "L'instant et le fuseau laissés vides tous les deux",

          timeTitle: "Heure [Time]",
          timeStores:
            "Une heure du jour sur une horloge 24 heures, secondes comprises, sans date associée — une heure d'ouverture, un couvre-feu, un créneau de coup d'envoi. S'affiche comme un sélecteur d'heure natif avec les secondes activées, puis se présente ensuite dans le format horaire local propre à chaque lecteur.",
          timeChecks:
            "La valeur doit être des heures, minutes et secondes séparées par des deux-points, avec des heures de 0 à 23, des minutes de 0 à 59 et des secondes de 0 à 59. Une saisie sans zéros de tête est acceptée et normalisée plutôt que refusée.",
          timeOk:
            "Acceptée, et affichée dans le format propre au lecteur — par exemple 2:30:00 PM pour un lecteur en anglais (États-Unis).",
          timeNormalised:
            "Acceptée, et normalisée en 09:05:00 avant stockage. Deux soumissions de la même heure écrites avec des largeurs de chiffres différentes finissent toujours identiques.",
          timeHourRange:
            "Refusée : VALIDATION_INVALID_FORMAT. Les heures vont de 0 à 23, donc 24 est hors plage.",
          timeMinuteRange: "Refusée : VALIDATION_INVALID_FORMAT. Les minutes vont de 0 à 59.",
          timeAmPm:
            "Refusée : VALIDATION_INVALID_FORMAT. Le texte sur 12 heures n'est pas analysé — la forme stockée est toujours sur 24 heures, même si l'affichage ne l'est pas.",

          groupContactTitle: "Coordonnées et liens",
          emailTitle: "E-mail [Email]",
          emailStores:
            "Une adresse e-mail. S'affiche comme un champ de saisie e-mail natif, puis se présente ensuite comme un lien de messagerie cliquable.",
          emailChecks:
            "L'adresse est analysée comme une véritable adresse plutôt que comparée à un motif, et elle ne doit contenir rien d'autre que l'adresse. La casse est conservée exactement telle que saisie — aucune mise en minuscules.",
          emailOk:
            "Acceptée, stockée avec sa casse exacte, et affichée comme un lien de messagerie cliquable.",
          emailDisplayName:
            "Refusée : VALIDATION_INVALID_EMAIL. Une enveloppe avec nom d'affichage s'analyse comme une adresse mais est rejetée plutôt que silencieusement dépouillée, car un champ Email n'a aucun nom d'affichage à conserver.",
          emailInvalid: "Refusée : VALIDATION_INVALID_EMAIL.",
          exEmailDisplayName: '"Test User <test@example.com>"',

          urlTitle: "Url [Url]",
          urlStores:
            "Une adresse web. S'affiche comme un champ de saisie URL natif, puis se présente ensuite comme un véritable lien qui s'ouvre dans un nouvel onglet.",
          urlChecks:
            "La valeur doit être une adresse absolue dont le protocole est exactement http ou https. Tout autre protocole est refusé. Le protocole est revérifié à la sortie, avant que la valeur ne soit jamais rendue comme un lien.",
          urlOk: "Acceptée, et affichée comme un lien s'ouvrant dans un nouvel onglet.",
          urlHttpOk:
            "Acceptée. Le simple http est délibérément autorisé — un site d'entreprise ou une adresse interne en cours de mise en place est une donnée légitime.",
          urlNoScheme:
            "Refusée : VALIDATION_INVALID_FORMAT. Un hôte nu est rejeté plutôt que deviné, afin que rien n'ait à décider si vous vouliez dire http ou https.",
          urlScheme:
            "Refusée : VALIDATION_INVALID_FORMAT. C'est une véritable limite de sécurité, pas une règle de style — et comme le protocole est revérifié avant affichage, même une valeur stockée avant l'existence de cette vérification s'affiche comme du texte inerte plutôt que comme un lien actif.",
          urlFtp: "Refusée : VALIDATION_INVALID_FORMAT. Seuls http et https figurent sur la liste.",

          phoneTitle: "Téléphone [Phone]",
          phoneStores:
            "Un numéro de téléphone au format international. S'affiche via un sélecteur de pays avec drapeaux et recherche, puis se présente ensuite reformaté pour la lisibilité — par exemple +20 123 456 7890.",
          phoneChecks:
            "La valeur stockée doit commencer par un +, son premier chiffre ne doit pas être zéro, et elle doit contenir entre 8 et 15 chiffres au total. C'est une vérification de forme uniquement.",
          phoneOk: "Acceptée, et affichée reformatée plutôt que comme la chaîne brute stockée.",
          phoneNoPlus: "Refusée : VALIDATION_INVALID_FORMAT. Le + initial fait partie du format.",
          phoneLeadingZero:
            "Refusée : VALIDATION_INVALID_FORMAT. Un indicatif de pays ne commence jamais par zéro.",
          phoneTooShort:
            "Refusée : VALIDATION_INVALID_FORMAT. Sept chiffres, c'est en dessous du minimum de huit.",
          phoneUnassignable:
            "Acceptée par le serveur, qui ne vérifie que la forme et non si le numéro pourrait réellement exister. Le sélecteur du formulaire vérifie en plus les chiffres par rapport au plan de numérotation réel du pays sélectionné, donc vous ne pouvez pas construire cette valeur via l'interface — seulement via une requête qui contourne le formulaire.",

          groupOtherTitle: "Oui/non et couleur",
          booleanTitle: "Valeur booléenne [Boolean]",
          booleanStores:
            "Un simple oui ou non. S'affiche comme un interrupteur marche/arrêt. N'a ni texte indicatif ni options.",
          booleanChecks:
            "Seuls les mots true et false sont analysés, quelle que soit la casse. Rien d'autre n'est traité comme un synonyme.",
          boolTrue: "Acceptée.",
          boolFalse: "Acceptée.",
          boolOne:
            "Refusée : VALIDATION_INVALID_FORMAT — le message indique « expects a boolean ». Un 1 numérique n'est pas interprété comme true.",
          boolYes: "Refusée : VALIDATION_INVALID_FORMAT. Ni yes/no ni on/off ne sont acceptés.",

          colorTitle: "Couleur [Color]",
          colorStores:
            "Une couleur, stockée sous forme de valeur hexadécimale. S'affiche comme une grille de vingt pastilles plus une saisie hexadécimale personnalisée, puis se présente ensuite comme le texte hexadécimal accompagné d'une petite pastille de couleur correspondante.",
          colorChecks:
            "La valeur doit être un # suivi d'exactement trois ou exactement six chiffres hexadécimaux. La casse est normalisée en minuscules à l'enregistrement ; la longueur ne l'est pas.",
          colorOk:
            "Acceptée, et stockée comme #aabbcc. Les majuscules sont ramenées en minuscules.",
          colorShort:
            "Acceptée, et conservée telle quelle comme #abc. La forme abrégée n'est jamais développée en #aabbcc, même si un moteur de rendu traite les deux comme la même couleur — de sorte que la même couleur peut légitimement être stockée de deux façons selon les enregistrements.",
          colorNoHash: "Refusée : VALIDATION_INVALID_FORMAT. Le # initial est obligatoire.",
          colorBadLength:
            "Refusée : VALIDATION_INVALID_FORMAT. Trois ou six chiffres, rien entre les deux.",
          colorNamed:
            "Refusée : VALIDATION_INVALID_FORMAT. Les noms de couleur ne sont pas acceptés, seulement les valeurs hexadécimales.",

          groupReferenceTitle: "Références vers un autre enregistrement",
          referenceGroupIntro:
            "Les deux derniers types ne stockent aucun texte qui leur soit propre. Chacun stocke un pointeur vers un enregistrement situé ailleurs dans le produit, et le nom que vous voyez est recherché à nouveau chaque fois que le champ s'affiche, plutôt que sauvegardé aux côtés du pointeur. Les deux stockent les deux mêmes éléments — le type d'enregistrement et l'identité propre de cet enregistrement — et tous deux ne traitent une valeur comme vide que lorsque ces deux éléments sont absents. Il y a bien plus à en dire que ce qu'un tableau peut contenir ; les pages Champs de référence et Recherches de référence le disent.",
          entityReferenceTitle: "Référence d'entité [EntityReference]",
          entityReferenceStores:
            "Un pointeur vers un enregistrement de tout type que cette installation peut résoudre et que vous êtes autorisé à consulter. S'affiche comme un sélecteur avec recherche sur ce type d'enregistrement — précédé d'un second sélecteur pour le type lui-même, lorsque la définition n'en épingle aucun.",
          entityReferenceChecks:
            "Les deux éléments sont exigés ensemble. Le type d'enregistrement doit être enregistré et, lorsque la définition en épingle un, doit être celui-là. L'identité doit être lisible. Et vous devez avoir été en mesure de lire cet enregistrement au moment où vous avez sauvegardé, ce qui empêche un pointeur d'être utilisé pour atteindre des données que vous ne pouvez pas ouvrir directement. Chaque vérification refuse avec son propre message plutôt qu'un message générique.",
          refOk:
            "Acceptée. La réponse enregistre à la fois le type d'enregistrement et l'identité de cet enregistrement, et le sélecteur affiche désormais le nom actuel de l'enregistrement.",
          refIncomplete:
            "Refusée comme référence incomplète. La moitié d'un pointeur n'est pas traitée comme un champ vide — cela signifie que quelqu'un a commencé à répondre et s'est arrêté.",
          refIncompleteToo:
            "Refusée de la même façon. Une identité sans type d'enregistrement nomme une ligne mais aucune table, donc il n'y a rien où la rechercher.",
          refMismatch:
            "Refusée, et le message nomme à la fois ce que le champ attend et ce qui est arrivé. L'épinglage est une restriction délibérée, donc c'est le refus qui fonctionne, pas un échec.",
          refUnknownType:
            "Refusée : ENTITY_UNKNOWN_TYPE, en nommant l'identifiant. Accessible uniquement via une requête qui contourne le sélecteur, lequel ne propose jamais de type d'enregistrement non enregistré.",
          refInvalidId:
            "Refusée : ENTITY_INVALID_ID. Une identité est opaque et doit être renvoyée exactement telle qu'elle a été reçue — un seul caractère modifié la rend illisible.",
          refForbidden:
            "Refusée : AUTH_FORBIDDEN, en nommant le champ. Stocker un pointeur vers un enregistrement est une lecture différée de cet enregistrement, elle nécessite donc la même permission que sa lecture directe.",
          refEmpty:
            "Traitée comme vide : effacée si le champ est facultatif, refusée avec VALIDATION_REQUIRED s'il est obligatoire. Seule l'absence des deux éléments compte comme vide.",
          exRefOk: "Un membre du personnel choisi dans le sélecteur",
          exRefTypeOnly: "Un type d'enregistrement choisi, sans enregistrement sélectionné",
          exRefIdOnly: "Un enregistrement sélectionné, sans type d'enregistrement envoyé",
          exRefWrongType: "Une personne, sur un champ épinglé aux membres du personnel",
          exRefUnknownType: "Un type d'enregistrement qui n'est pas enregistré",
          exRefEdited: "Une identité stockée modifiée d'un caractère",
          exRefNoAccess:
            "Un enregistrement d'un type que vous n'êtes peut-être pas autorisé à consulter",
          exRefBothBlank: "Les deux parties laissées vides",

          userReferenceTitle: "Référence d'utilisateur [UserReference]",
          userReferenceStores:
            "Un pointeur vers un compte utilisateur — assigné à, révisé par, gestionnaire de compte. S'affiche comme un sélecteur avec recherche sur les comptes utilisateurs, et n'affiche jamais de contrôle pour choisir un type d'enregistrement, puisqu'il n'y en a qu'un.",
          userReferenceChecks:
            "Toutes les vérifications que fait EntityReference, plus une règle plus étroite : le seul type d'enregistrement accepté est un compte utilisateur. Cette liste est fixée par la plateforme plutôt que par la configuration, et une tentative de pointer ce type vers autre chose est refusée aussi bien lorsqu'une définition est configurée que lorsqu'une valeur est enregistrée.",
          usrOk:
            "Acceptée, exactement comme l'est une EntityReference. La réponse est autodescriptive de la même façon.",
          usrDormant:
            "Acceptée. Un compte verrouillé est dormant plutôt que supprimé : il existe toujours, il est toujours proposé par le sélecteur avec un marqueur d'inactivité, et c'est une réponse légitime pour quelque chose qui s'est déjà produit.",
          usrAdminRefused:
            "Refusée, avec un message nommant ce qui est autorisé. Un administrateur peut n'appartenir à aucun espace de travail du tout, ce qui est la seule propriété qu'une cible de référence ne doit jamais avoir.",
          usrGroupRefused:
            "Refusée de la même façon. Un groupe peut être lu sans danger mais n'est pas une personne, et un champ de type UserReference qui se résoudrait en un groupe mentirait sur ce qu'il contient.",
          usrThemeRefused:
            "Refusée de la même façon. Une ligne de catalogue partagé de la plateforme n'appartient à aucun espace de travail et n'est pas non plus une personne — exclue à double titre.",
          usrEmpty: "Traitée comme vide exactement dans les mêmes conditions qu'EntityReference.",
          exUsrOk: "Un compte utilisateur choisi dans le sélecteur",
          exUsrDormant: "Un compte dont la connexion est actuellement verrouillée",
          exUsrAdmin: "Un enregistrement d'administrateur",
          exUsrGroup: "Un groupe d'utilisateurs",
          exUsrTheme: "Un thème de connexion",

          groupMediaTitle: "Médias et texte mis en forme",
          mediaGroupIntro:
            "File et Image sont construits de la même façon que les deux types de référence ci-dessus — un pointeur, pas du texte stocké — mais chacun pointe vers un unique fichier téléversé plutôt que vers un autre enregistrement. RichText est différent : il stocke un véritable contenu mis en forme, rédigé dans l'éditeur propre au produit.",

          fileTitle: "Fichier [File]",
          fileStores:
            "Un pointeur vers un unique fichier téléversé — une décharge signée, un certificat médical, un document d'assurance. S'affiche comme un petit indicateur de statut montrant si un fichier est rattaché, avec un bouton Clear lorsque c'est le cas.",
          fileChecks:
            "Une valeur stockée n'est acceptée que lorsque le fichier référencé est véritablement rattaché à l'enregistrement que vous modifiez — une vérification de sécurité qui empêche un fichier destiné à un enregistrement d'être pointé depuis un autre. Rattacher un nouveau fichier depuis cet écran n'est pas encore possible : le champ peut être défini dès aujourd'hui, et une valeur existante peut être consultée ou effacée, mais le remplir pour la première fois arrivera dans une future version.",
          fileAttachedExample: "Un enregistrement dont le champ File contient déjà une valeur",
          fileAttachedOutcome:
            "Affiché comme rattaché, avec un contrôle Clear. Il n'existe actuellement aucun contrôle de rattachement à côté.",
          fileClearExample: "Effacer un fichier rattaché, puis enregistrer",
          fileClearOutcome: "Acceptée — la valeur est supprimée.",

          imageTitle: "Image [Image]",
          imageStores:
            "Le pendant de File, restreint aux images — une photo de joueur, une photo principale d'installation, un blason d'équipe. Le même indicateur de statut, la même limitation actuelle sur le rattachement d'une nouvelle valeur.",
          imageChecks:
            "Tout ce que vérifie File, plus le fait que le fichier référencé doit lui-même être une image. Rattacher une nouvelle image depuis cet écran n'est pas non plus encore possible — voir File, ci-dessus.",
          imageAttachedExample: "Un enregistrement dont le champ Image contient déjà une valeur",
          imageAttachedOutcome: "Affiché comme rattaché, avec un contrôle Clear.",

          richTextTitle: "Texte enrichi [RichText]",
          richTextStores:
            "Une prose mise en forme, rédigée dans l'éditeur propre au produit — une note d'entraînement avec des paragraphes et une liste à puces, un texte de politique avec un lien. S'affiche comme un véritable éditeur de texte enrichi, pas une simple boîte de texte.",
          richTextChecks:
            "Jusqu'à 50 000 caractères de balisage, vérifiés avant d'être automatiquement nettoyés : un style en ligne et une image intégrée sont tous deux supprimés, car le premier peut visuellement détourner la page environnante et la seconde peut suivre silencieusement quiconque consulte le champ par la suite. Il n'y a pas d'avertissement séparé quand cela se produit — rouvrez le champ ensuite, et ce que vous voyez est exactement ce qui a été conservé.",
          richTextOkExample: "Un paragraphe avec un mot en gras et une liste à puces",
          richTextOkOutcome: "Acceptée, et chaque élément est conservé.",
          richTextStyleExample: "Un contenu collé avec un style en ligne appliqué",
          richTextStyleOutcome:
            "Acceptée, avec le style supprimé. Le texte visible et la structure sont conservés.",
          richTextImgExample: "Un contenu avec une image intégrée",
          richTextImgOutcome:
            "Acceptée, avec l'image supprimée. Une image a sa place dans un champ File ou Image plutôt qu'ici.",
          richTextTooLongExample: "Plus de 50 000 caractères de balisage",
          richTextTooLongOutcome:
            "Refusée : VALIDATION_MAX_LENGTH — raccourcissez-le et réessayez.",

          emptyTitle: "Valeurs vides et l'interrupteur Required",
          emptyIntro:
            "Chaque type partage une même définition du vide, vérifiée avant tout le reste. Une valeur compte comme vide quand :",
          empty1: "elle est totalement absente de l'enregistrement ;",
          empty2: "elle est vide, ou composée uniquement d'espaces ;",
          empty3: "pour MultiSelect, la liste des sélections est explicitement vide ;",
          empty4:
            "pour DateTime, l'instant et le fuseau horaire sont tous deux absents — pas seulement l'un des deux ;",
          empty5:
            "pour Currency, le montant et le code de devise sont tous deux absents — pas seulement l'un des deux ;",
          empty6:
            "pour EntityReference, UserReference, File et Image, les deux moitiés du pointeur sont absentes — pas seulement l'une des deux.",
          emptyOutcome:
            "Une valeur vide sur un champ Obligatoire est refusée avec VALIDATION_REQUIRED. Une valeur vide sur un champ facultatif est acceptée et la réponse stockée est effacée — la ligne est conservée plutôt que supprimée, afin que l'historique ne soit pas perdu.",
          emptyWarnTitle: "Rating est l'exception à retenir",
          emptyWarnContent:
            "Un 0 explicitement soumis sur un champ Rating est une valeur réelle, non vide, qui échoue à la vérification de plage 1 à 5 exactement comme le ferait un 6. Seule une soumission véritablement absente ou vide compte comme non notée. Séparément, et pour la même raison qu'un curseur a besoin d'une position, un champ Rating non touché semble se trouver sur 1 tout en étant vide.",

          codesTitle: "Codes d'erreur que vous pourriez voir",
          codesIntro:
            "Presque tous les refus sont une réponse HTTP 422 avec l'un de ces codes lisibles par une machine ; deux d'entre eux sont plutôt un 403, car ils concernent votre accès plutôt que la forme de ce que vous avez envoyé. Un troisième mérite d'être signalé à part : son nom de code se lit comme un 404, mais la réponse reste un 422 — voir la remarque à côté de lui ci-dessous. Si vous voyez un jour un 500 lors de l'enregistrement d'une valeur de champ personnalisé, c'est un défaut qui mérite d'être signalé — le chemin de validation est écrit pour refuser proprement, jamais pour échouer.",
          thCode: "Code",
          thWhenItFires: "Quand il se déclenche",
          codeRequired:
            "Le champ est Obligatoire et la valeur soumise est vide ou composée uniquement d'espaces.",
          codeInvalidFormat:
            "La valeur ne correspond pas à la forme attendue par le type — un nombre, une date ou une heure inanalysable, une option absente de la liste, un protocole d'URL non autorisé, une forme de téléphone incorrecte, une couleur hexadécimale incorrecte, un code de devise incorrect, ou la plupart des échecs de validateur.",
          codeInvalidEmail:
            "La valeur d'un champ Email n'est pas une véritable adresse, ou porte un nom d'affichage.",
          codeInvalidTimezone:
            "Une valeur DateTime est dépourvue de fuseau horaire alors qu'un instant est présent, ou nomme un fuseau que le serveur ne reconnaît pas.",
          codeRange:
            "Un nombre est hors des bornes de son type — Percent hors de 0 à 100, Rating hors d'un entier de 1 à 5, un Duration négatif, ou les propres bornes d'un validateur Numeric Range.",
          codeMaxLength:
            "Text au-delà de 4 000 caractères, LongText au-delà de 10 000, RichText au-delà de 50 000, un Email ou Url au-delà de 4 000, plus de 19 sélections MultiSelect, ou la borne supérieure d'un validateur Length Range.",
          codeMinLength: "La borne inférieure d'un validateur Length Range.",
          codeUnique:
            "La même option MultiSelect a été soumise plus d'une fois dans un même enregistrement.",
          codeUnknownEntityType:
            "Une référence nomme un type d'enregistrement qui n'est pas enregistré dans cette installation.",
          codeInvalidId:
            "L'identité stockée d'une référence n'a pas pu être lue — modifiée en chemin par quelque chose, ou une valeur antérieure à un changement.",
          codeForbidden:
            "Une référence pointe vers un enregistrement que vous n'êtes pas autorisé à lire. Celui-ci est un 403 plutôt qu'un 422, car il concerne votre accès et non la forme de la valeur.",
          codeMediaOwnerMismatch:
            "Une valeur File ou Image pointe vers un fichier téléversé qui n'est pas rattaché à l'enregistrement que vous modifiez. Celui-ci est un 403, pour la même raison que le cas Forbidden des références ci-dessus — il s'agit de propriété, pas de forme.",
          codeMediaNotFound:
            "L'identité d'une valeur File ou Image ne parvient pas à se déchiffrer, ou se déchiffre vers un fichier téléversé qui n'existe plus. Le nom du code se lit comme un 404, mais la réponse est un 422 — la même forme qu'utilise tout autre refus de valeur mal formée sur cette page, pas la forme « introuvable » qu'un client pourrait attendre d'après le nom.",
          codeMediaNotAnImage:
            "La valeur d'un champ Image pointe vers un fichier qui n'est pas une image.",
          codeRichTextShape:
            "La valeur d'un champ RichText n'a pas été envoyée comme un objet avec une propriété 'html'.",
          codesInfoTitle: "Les messages nomment la clé, pas le libellé",
          codesInfoContent:
            "Les messages d'erreur citent la clé machine du champ — 'shirt_size' — plutôt que son libellé affiché. Si vous rapprochez un message d'un champ, faites correspondre sur la clé.",

          catalogueTitle: "L'écran Types de valeur dans le produit",
          catalogueIntro:
            "Le produit possède son propre catalogue en lecture seule de ces types, accessible depuis un lien dans l'en-tête de la page Champs personnalisés. C'est de la documentation, pas de la configuration : rien n'y peut être ajouté, modifié ou supprimé, car les types de valeur sont fixés par la plateforme. Il est verrouillé derrière la même permission que l'écran Champs personnalisés lui-même, et il est entièrement traduit, de droite à gauche compris.",
          catalogueColumns:
            "Chaque ligne montre le nom du type, une description de son usage, s'il prend un texte indicatif, s'il possède une liste d'options, et s'il prend en charge un validateur. Text est la seule ligne montrant une prise en charge de validateur — c'est la limite propre à Text rendue visible.",
          catalogueNoPlanColumn:
            "Il n'y a délibérément aucune colonne de forfait ou de droit d'accès sur cet écran. Les types de valeur ne sont pas soumis à un droit d'accès individuel, donc une colonne qui suggérerait le contraire montrerait quelque chose qui n'existe pas.",
        },

        // ═══════════════════════════════════════════════════
        //  Champs de référence
        // ═══════════════════════════════════════════════════
        references: {
          title: "Champs de référence",
          description:
            "Les deux types de valeur qui pointent vers un enregistrement d'un autre module — Entity Reference et User Reference : lequel utiliser, ce qui est réellement stocké, pourquoi le nom n'est jamais sauvegardé avec, comment un type cible est épinglé, ce qui peut être référencé, et les règles d'espace de travail.",
          intro:
            "Tous les autres types de valeur stockent quelque chose que vous avez saisi. Ces deux-là stockent un pointeur : le champ ne contient aucun texte qui lui soit propre, seulement l'identité d'un autre enregistrement situé ailleurs dans le produit. Un champ sur un enregistrement d'administrateur qui indique de quel membre du personnel il s'agit, un champ sur une réservation qui indique qui l'a révisée, un champ sur une personne qui indique quel gestionnaire de compte s'occupe d'elle — les trois sont un enregistrement pointant vers un autre, et avant l'existence de ces types, il n'y avait aucun moyen d'enregistrer cela sans retaper un nom et le regarder dériver.",
          oneLineTitle: "En une phrase",
          oneLineContent:
            "Un champ de référence stocke l'enregistrement que vous avez choisi, jamais le nom que portait cet enregistrement — de sorte que le nom que vous voyez est toujours celui que cet enregistrement porte actuellement, et toujours un nom que vous êtes autorisé à voir.",

          whatTitle: "Ce que vous apporte un champ de référence",
          whatIntro:
            "Une référence n'est pas un champ de texte qui contiendrait par hasard le nom de quelqu'un. C'est un véritable pointeur, vérifié quand vous l'enregistrez et revérifié chaque fois qu'il est lu, et chacun des points suivants en découle.",
          featPointsAt: "Pointe vers un enregistrement réel",
          featPointsAtDesc:
            "Vous choisissez dans une liste consultable d'enregistrements qui existent réellement, dans votre propre espace de travail, plutôt que de taper un nom en espérant qu'il corresponde. Rien n'est stocké tant qu'un enregistrement réel n'a pas été choisi.",
          featLiveName: "Affiche toujours le nom actuel",
          featLiveNameDesc:
            "Le nom est recherché à nouveau chaque fois que le champ s'affiche. Quand le nom de quelqu'un est corrigé sur son propre enregistrement, chaque référence qui pointe vers lui affiche la correction immédiatement — il n'y a aucune copie susceptible de devenir obsolète.",
          featPermission: "Porte les permissions propres à la cible",
          featPermissionDesc:
            "Lire le nom nécessite la permission de consulter ce type d'enregistrement, pas la permission de consulter l'enregistrement qui porte le champ. Quelqu'un qui peut modifier l'enregistrement propriétaire mais ne peut pas lire le personnel voit qu'une référence est définie sans voir vers qui elle pointe.",
          featSearch:
            "Consultable par recherche, paginé, et il vous dit ce qu'il ne peut pas faire",
          featSearchDesc:
            "Le sélecteur recherche dans les propres enregistrements du module cible, une page à la fois, marque un enregistrement dormant comme inactif plutôt que de le masquer, et indique en toutes lettres lorsqu'il n'y a rien que vous soyez autorisé à cibler — jamais une liste déroulante vide qui se lirait comme « il n'existe aucun enregistrement ».",
          featPinned: "Peut être épinglé à un type d'enregistrement",
          featPinnedDesc:
            "Un champ Entity Reference peut être épinglé de sorte que chaque valeur doive pointer vers, disons, un membre du personnel — ou laissé non épinglé, auquel cas chaque valeur choisit son propre type d'enregistrement et enregistre ce choix aux côtés du pointeur.",
          featSelfHealing: "S'efface de lui-même quand la cible est supprimée",
          featSelfHealingDesc:
            "Supprimez l'enregistrement vers lequel pointe une référence, et le pointeur s'efface automatiquement. La ligne de valeur elle-même survit avec son historique — seul le pointeur disparaît, et rien n'a besoin d'être nettoyé à la main.",

          whichTitle: "Entity Reference ou User Reference",
          whichIntro:
            "Il existe deux types de valeur de référence, et ils sont mécaniquement presque identiques. La différence porte entièrement sur ce que chacun est autorisé à cibler, et donc sur ce que vous devez configurer. Choisissez User Reference chaque fois que la réponse est « une personne qui se connecte » ; choisissez Entity Reference pour tout le reste.",
          thAspect: "Aspect",
          thEntityRef: "Entity Reference",
          thUserRef: "User Reference",
          aspTargets: "Vers quoi il peut pointer",
          entTargets:
            "Tout type d'enregistrement que la plateforme peut actuellement résoudre et que vous êtes autorisé à consulter.",
          usrTargets:
            "Exactement un type d'enregistrement : un compte utilisateur. Rien d'autre n'est jamais accepté, et cette liste est fixée par la plateforme plutôt que par la configuration.",
          aspConfig: "Ce que vous configurez",
          entConfig:
            "Facultativement, un Target Entity Type sur la définition. Le laisser non épinglé est un choix réel et durablement pris en charge, pas un choix inachevé.",
          usrConfig:
            "Rien du tout. Il n'y a aucun sélecteur de cible sur le formulaire de définition pour ce type, car il n'y a aucune décision à prendre.",
          aspPicker: "Ce que voit la personne qui le remplit",
          entPicker:
            "Sur un champ épinglé, une seule liste consultable de ce type d'enregistrement. Sur un champ non épinglé, deux contrôles : d'abord le type d'enregistrement, puis l'enregistrement.",
          usrPicker:
            "Une seule liste consultable de comptes utilisateurs. Il n'y a jamais de contrôle de type.",
          aspUse: "À utiliser quand",
          entUse:
            "La réponse est un enregistrement métier — un membre du personnel, une personne, une installation — ou lorsque différents enregistrements sous le même champ pointent légitimement vers différents types de choses.",
          usrUse:
            "La réponse est un compte : assigné à, révisé par, gestionnaire de compte, approuvé par.",
          aspStorage: "Comment la réponse est stockée",
          entStorage:
            "Le type d'enregistrement, plus l'identité propre de cet enregistrement. Les deux, toujours ensemble.",
          usrStorage:
            "De façon identique. La valeur stockée est autodescriptive exactement de la même manière, ce qui est ce qui garde une ancienne réponse lisible après un changement de définition.",
          whichInfoTitle: "Pourquoi ce sont deux types et non un seul paramètre",
          whichInfoContent:
            "La liste de ce vers quoi un User Reference peut pointer est une décision de sécurité, elle est donc fixée dans la plateforme plutôt que saisie dans une définition par un administrateur. Et comme le type est enregistré sur chaque réponse stockée, la question « lesquels de nos champs contiennent des références à des personnes ? » a une réponse même pour des valeurs dont la définition a depuis été modifiée. Un type unique avec un paramètre aurait perdu ces deux propriétés.",

          storedTitle: "Ce qui est réellement stocké",
          storedIntro:
            "Une valeur de référence, ce sont deux éléments, tenus ensemble. C'est la même forme que celle utilisée par Currency pour son montant et son code, et pour la même raison : aucun des deux éléments ne signifie quoi que ce soit seul.",
          thPiece: "Élément",
          thWhat: "Ce que c'est",
          thRequired: "Obligatoire ?",
          pieceTypeName: "Le type d'enregistrement",
          pieceIdName: "L'identité de l'enregistrement",
          pieceTypeKey:
            "Le type d'enregistrement ciblé, sous forme d'identifiant stable — par exemple hrms.staff-member. Il est stocké sur la réponse elle-même, pas recherché depuis la définition.",
          pieceTypeKeyRequired: "Oui — toujours, sur chaque réponse",
          pieceId: "L'identité de l'enregistrement précis ciblé, sous forme de chaîne opaque.",
          pieceIdRequired: "Oui — toujours, sur chaque réponse",
          storedNeither:
            "Une identité sans type d'enregistrement nomme une ligne mais aucune table ; un type d'enregistrement sans identité nomme une table mais aucune ligne. Une valeur n'est donc traitée comme vide que lorsque les deux éléments sont absents — exactement comme se comportent Currency et Date & Time — et la moitié d'une référence est refusée plutôt que silencieusement stockée ou silencieusement effacée. Si vous voyez un jour un enregistrement refusé pour référence incomplète, l'un des deux contrôles a été laissé de côté.",
          storedIdsTitle: "L'identité est opaque, et doit le rester",
          storedIdsContent:
            "L'identité de l'enregistrement cible ne circule jamais comme une clé de base de données lisible. Elle arrive sous forme de chaîne chiffrée, et tout ce qui lit ou écrit une référence doit renvoyer exactement la chaîne qu'il a reçue — inchangée, non tronquée, non mise en minuscules, non vérifiée par rapport à un quelconque motif. Modifiez un seul caractère et le produit signale à juste titre que la référence stockée est mal formée, alors qu'elle était parfaitement valide un instant plus tôt. Il n'y a rien dans cette chaîne qu'un humain puisse lire, ni rien qui vaille la peine d'essayer.",
          storedSymmetryTitle: "Les deux mêmes noms dans les deux sens",
          storedSymmetryContent:
            "Une référence est écrite sous les deux mêmes noms de propriété que ceux sous lesquels elle est lue : entityTypeKey et entityId. Il n'y a pas de seconde orthographe pour le sens de l'écriture, ni pour celui de la lecture. Si vous intégrez avec l'API des valeurs, renvoyez exactement les noms de champs qui vous ont été donnés — inventer un nom différent pour l'identité à l'entrée n'est pas une simple variante orthographique, c'est un enregistrement qui ne porte silencieusement aucun pointeur du tout, et qui est ensuite refusé comme référence incomplète.",

          nameTitle: "Pourquoi le nom affiché n'est jamais stocké",
          nameIntro:
            "La conception évidente serait d'enregistrer le nom à côté de l'identité, afin qu'une référence puisse s'afficher sans rien demander à personne. Le produit ne le fait délibérément pas, et la raison est une limite de permission plutôt qu'une préférence sur la fraîcheur des données.",
          nameWhy:
            "Un nom enregistré aux côtés du pointeur se trouverait à l'intérieur de l'enregistrement qui porte le champ, et serait donc lisible par quiconque détient la permission de consulter cet enregistrement. Or le nom appartient à la cible — il est protégé par la permission qui protège ce type d'enregistrement. Le figer reviendrait à donner un nom à quelqu'un qui n'a jamais reçu la permission qui le protège. C'est un contournement de permission déguisé en argument de performance, et aucune mise en cache n'en fait autre chose.",
          nameCost:
            "Un nom est donc résolu en direct, à chaque lecture, via un appel qui réapplique à chaque fois la permission de consultation propre à la cible et le propre filtre d'espace de travail du module cible. Le bénéfice pratique est celui que vous voudriez de toute façon : un nom corrigé sur son propre enregistrement est corrigé partout où il est référencé, instantanément, sans rien à relancer et sans copie obsolète à traquer.",
          nameInfoTitle: "Ce que vous remarquerez en conséquence",
          nameInfoContent:
            "Deux choses, toutes deux intentionnelles. Un champ de référence affiche un bref état de chargement pendant que son nom est récupéré, plutôt que d'apparaître instantanément avec un texte qui se corrige ensuite. Et deux personnes regardant le même enregistrement peuvent légitimement voir des choses différentes dans le même champ : l'une le nom du membre du personnel, l'autre une note indiquant qu'une référence existe sans montrer vers qui elle pointe. Aucun des deux cas n'est un défaut.",

          pinTitle: "Épingler un type cible sur la définition",
          pinIntro:
            "Une définition Entity Reference porte un paramètre facultatif qui lui est propre : Target Entity Type. Il répond à « quel type d'enregistrement ce champ peut-il cibler ? », et il n'est proposé que pour Entity Reference — un champ User Reference ne l'affiche jamais, car sa réponse est déjà figée.",
          thState: "État du paramètre",
          thMeans: "Ce que cela signifie",
          thPickerShows: "Ce que montre alors le formulaire d'enregistrement",
          stateUnpinned: "Non épinglé — tout type autorisé",
          meansUnpinned:
            "Chaque réponse peut pointer vers tout type d'enregistrement que la personne qui remplit le champ est autorisée à référencer, et chaque réponse enregistre le type qu'elle a choisi. C'est l'état dans lequel démarre toute nouvelle définition, et il reste valide indéfiniment.",
          pickerUnpinned:
            "Deux contrôles dans l'ordre : un contrôle de type d'enregistrement, puis l'enregistrement lui-même. Le second est inerte tant que le premier n'a pas de réponse, et choisir un type ne déplace pas le curseur vers le contrôle d'enregistrement — vous restez où vous êtes, le contrôle d'enregistrement devenant simplement disponible.",
          statePinned: "Épinglé à un type",
          meansPinned:
            "Chaque nouvelle réponse doit pointer vers un enregistrement de ce type unique. Une réponse de tout autre type est refusée avec un message nommant à la fois ce qui était attendu et ce qui est arrivé.",
          pickerPinned: "Un seul contrôle : l'enregistrement. Il n'y a aucun contrôle de type.",
          stateUserRef: "Un champ User Reference",
          meansUserRef:
            "Équivalent en permanence à un épinglage sur les comptes utilisateurs, décidé par la plateforme. Une tentative de l'épingler sur autre chose est refusée dès la définition, pas seulement à l'enregistrement.",
          pickerUserRef:
            "Un seul contrôle : le compte utilisateur. Il n'y a jamais de contrôle de type.",
          pinRepoint:
            "Le paramètre peut être modifié plus tard, y compris sur un champ qui contient déjà des réponses, et c'est délibéré : refuser cela signifierait qu'un champ mal épinglé ne pourrait jamais être corrigé sans d'abord détruire des données réelles. Ce qui se passe alors mérite d'être énoncé précisément, car les deux volets comptent : chaque réponse déjà stockée est laissée totalement intacte et continue de se relire correctement, car chaque réponse porte son propre type d'enregistrement. Le prochain enregistrement d'une fiche dont la réponse est de l'ancien type est refusé, jusqu'à ce que quelqu'un choisisse à nouveau cette réponse.",
          pinRepointDetail:
            "Le formulaire de modification le précise avant que vous n'enregistriez. Lisez cette ligne plutôt que de présumer l'un ou l'autre extrême — le repointage n'est ni gratuit ni destructeur.",
          pinWarnTitle: "Une conséquence du repointage à surveiller",
          pinWarnContent:
            "Un champ non épinglé qui contient déjà une réponse n'offre aucun contrôle de type tant que cette réponse est en place, car le propre type de la réponse est utilisé à la place. Reprendre une sélection se limite donc au type déjà ciblé. Effacez le champ, et le contrôle de type revient. C'est une limite réelle plutôt qu'un défaut, et c'est la manifestation de cette fonctionnalité la plus susceptible d'être signalée comme telle.",

          targetsTitle: "Ce qui peut actuellement être référencé",
          targetsIntro:
            "La liste n'est pas « tous les types d'enregistrement du produit ». Un type d'enregistrement ne peut être référencé que lorsque le module qui le possède fournit un moyen de rechercher et de résoudre ses enregistrements — en lisant ses propres données selon les règles de ses propres écrans, de sorte qu'un sélecteur ne peut jamais être plus large que l'écran qu'il reflète. Six types d'enregistrement le fournissent aujourd'hui ; les trois derniers ont rejoint les trois premiers lors d'une version ultérieure.",
          thType: "Type d'enregistrement",
          thKey: "Identifiant",
          thOwner: "Détenu par",
          thShows: "Ce que le sélecteur affiche pour chaque ligne",
          typeStaff: "Staff Member",
          keyStaff: "hrms.staff-member",
          ownerStaff: "Le module de gestion du personnel",
          showsStaff:
            "Le nom de la personne, avec son intitulé de poste en dessous comme élément de distinction. Délibérément l'intitulé de poste plutôt qu'une adresse e-mail : un sélecteur doit permettre de distinguer deux personnes homonymes, sans avoir besoin de leurs coordonnées pour cela.",
          typeUser: "User",
          keyUser: "identity.user",
          ownerUser: "Le module d'identité",
          showsUser:
            "Le nom du titulaire du compte, avec le nom d'utilisateur en dessous. Un compte dont la connexion est actuellement verrouillée s'affiche comme inactif mais reste sélectionnable.",
          typePerson: "Party Person",
          keyPerson: "party.person",
          ownerPerson: "Le module de tiers et relations",
          showsPerson:
            "Le nom de la personne uniquement. Le module propriétaire ne fournit aucune seconde ligne, ayant jugé que tout ce qu'il pourrait ajouter serait une donnée personnelle dont un sélecteur n'a pas besoin.",
          typeAdmin: "Administrator",
          keyAdmin: "identity.admin",
          ownerAdmin: "Le module d'identité",
          showsAdmin:
            "Le nom de l'administrateur, revenant au nom d'utilisateur lorsque les deux parties du nom sont vides, avec le nom d'utilisateur en seconde ligne. Délibérément jamais l'adresse e-mail, le numéro de téléphone, les noms de rôle, ni si la ligne est un Super Admin — la plus restreinte des trois lignes de type personne de cette liste, car un enregistrement d'administrateur est la chose la plus sensible que ce mécanisme de référence puisse cibler.",
          typeTeam: "Team",
          keyTeam: "organization.team",
          ownerTeam: "Le module d'organisation",
          showsTeam:
            "Le nom de l'équipe uniquement, sans seconde ligne. Deux équipes portant le même nom dans des services différents s'affichent aujourd'hui de façon identique — le service qui permettrait de les distinguer ne figure pas sur la ligne de ce sélecteur.",
          typeBranch: "Branch",
          keyBranch: "organization.branch",
          ownerBranch: "Le module d'organisation",
          showsBranch:
            "Le nom de la succursale, avec son fuseau horaire en dessous comme élément de distinction — la même raison qui permet de distinguer deux succursales toutes deux appelées « Main » sur l'écran des succursales lui-même.",
          targetsRefused:
            "Tout le reste est refusé plutôt que répondu par une liste vide, et la différence est tout l'enjeu : une liste vide ressemble à un résultat normal et dirait à un administrateur « il n'existe aucun membre du personnel », ce qui est une affirmation fausse revêtant l'apparence d'une affirmation correcte. Un type d'enregistrement pour lequel la plateforme ne peut pas répondre produit à la place un refus clair, que le formulaire d'enregistrement affiche comme une phrase indiquant que ce type d'enregistrement n'est pas disponible dans cette installation.",
          targetsEmpty:
            "Et une liste véritablement vide de types disponibles est elle-même une réponse légitime, pas un échec. Elle signifie « il n'y a rien vers quoi vous puissiez pointer une référence », ce qui arrive pour deux raisons bien distinctes : les modules propriétaires de ces enregistrements peuvent ne pas faire partie de cette installation, ou vous pouvez ne détenir aucun accès en consultation à aucun d'eux. Le produit nomme les deux possibilités sans affirmer laquelle s'applique, car seule l'une des deux se règle en demandant des permissions.",
          targetsWhyNot:
            "Deux types d'enregistrement qui semblent devoir figurer sur cette liste et en sont exclus délibérément (les enregistrements d'administrateur en formaient autrefois un troisième, jusqu'à ce qu'une version ultérieure leur donne leur propre fournisseur de recherche — ils figurent désormais dans le tableau ci-dessus, pas ici) :",
          targetsWhyNotGroup:
            "Les groupes d'utilisateurs. Parfaitement sûrs à lire, et simplement pas une personne. Un champ typé User Reference qui se résoudrait en un groupe mentirait sur ce qu'il contient.",
          targetsWhyNotTheme:
            "Les lignes de catalogue partagé de la plateforme telles que les thèmes de connexion. Elles n'appartiennent par conception à aucun espace de travail, elles échouent donc au même test que les enregistrements d'administrateur, et elles ne sont pas non plus des personnes.",
          targetsInfoTitle: "La liste que vous voyez est la liste que vous pouvez utiliser",
          targetsInfoContent:
            "Les types disponibles sont filtrés avant de vous parvenir : enregistrés, résolubles par cette installation, et autorisés pour vous. Chaque entrée qui vous est proposée fonctionnera lorsque vous l'utiliserez, et rien de ce qui vous est proposé ne vous refusera au clic suivant. C'est pourquoi la liste est récupérée à l'ouverture du contrôle plutôt qu'au chargement du formulaire — un formulaire d'enregistrement comportant plusieurs champs de référence auxquels personne ne touche ne demande rien du tout aux autres modules.",

          tenantTitle: "Règles d'espace de travail et de plateforme",
          tenantIntro:
            "Les références traversent une frontière de module, ce qui fait de la frontière d'espace de travail le point sur lequel il faut être précis. Cinq règles, toutes appliquées et non simplement recommandées.",
          tenant1:
            "Tout est protégé par l'espace de travail. Rechercher un enregistrement comme résoudre un enregistrement déjà détenu passent tous deux par le propre référentiel du module propriétaire, de sorte que s'appliquent le même filtre d'espace de travail et le même filtre d'enregistrements supprimés que sur les propres écrans de ce module. Vous ne pouvez cibler que des enregistrements que votre espace de travail peut déjà voir.",
          tenant2:
            "Détenir une identité n'est pas une permission. Une référence est réautorisée à chaque lecture : la propre permission de consultation de la cible est exigée à nouveau, à chaque fois, et le fait que le pointeur soit déjà stocké ne compte pour rien.",
          tenant3:
            "L'enregistrement d'un autre espace de travail et un enregistrement supprimé forment une seule réponse indissociable, délibérément. S'ils étaient distingués, quelqu'un pourrait tester des identités une par une pour découvrir ce qui existe dans un espace de travail qu'il ne peut pas voir. « Vous n'êtes pas autorisé à voir ce type d'enregistrement » est distingué de « cet enregistrement a disparu », car ces deux cas appellent des corrections opposées et aucun des deux ne révèle quoi que ce soit.",
          tenant4:
            "Les enregistrements de niveau plateforme appartiennent aux administrateurs de la plateforme. Un champ personnalisé créé au niveau plateforme est hérité par chaque espace de travail et ne peut être créé, modifié ou supprimé que par un administrateur de la plateforme — y compris le type cible épinglé sur un champ de référence de niveau plateforme, qu'aucun espace de travail ne peut modifier.",
          tenant5:
            "Personne ne peut assigner un administrateur en dehors de son propre espace de travail. En pratique, le produit va plus loin que ce qu'exige la règle : un enregistrement d'administrateur ne peut absolument pas être ciblé par un champ de référence, ni dans votre propre espace de travail ni dans aucun autre, précisément parce qu'un administrateur peut se situer en dehors de tout espace de travail.",
          tenantWarnTitle: "Une chose que cela ne fait pas",
          tenantWarnContent:
            "Une référence est aussi stricte que le propre écran de liste de la cible, et pas plus stricte. Si un type d'enregistrement est visible pour un rôle via son propre écran, il est sélectionnable via un sélecteur pour ce même rôle — aucune règle plus étroite que « tout cet espace de travail » n'est appliquée par-dessus. Ne traitez donc pas un sélecteur de référence comme un moyen de masquer des enregistrements que le module cible montre déjà de lui-même.",

          exampleTitle:
            "Un exemple concret : un enregistrement d'administrateur pointant vers un membre du personnel",
          exampleIntro:
            "Le cas pour lequel ces types ont été conçus. Vos administrateurs sont aussi des employés, et vous voulez que chaque enregistrement d'administrateur indique quel enregistrement de personnel correspond à la même personne — enregistré une fois, correctement, et jamais retapé.",
          ex1Title: "Décidez de quel type vous avez besoin",
          ex1Content:
            "La réponse est un membre du personnel, pas un compte de connexion, il s'agit donc d'un Entity Reference. Si la question avait été « qui a révisé ceci ? », la réponse aurait été un compte et User Reference aurait été le bon choix — et le type de valeur est définitif, cela mérite donc un instant de réflexion.",
          ex2Title: "Définissez le champ",
          ex2Content:
            "Sur l'écran Champs personnalisés, choisissez Add, sélectionnez le type d'enregistrement administrateur, définissez la clé sur staff_record, le libellé anglais sur Staff record, et le type de valeur sur Entity Reference. Un contrôle Target Entity Type apparaît dès que vous choisissez ce type de valeur.",
          ex3Title: "Épinglez la cible sur Staff Member",
          ex3Content:
            "Définissez Target Entity Type sur Staff Member. C'est ce qui transforme le champ de « un pointeur vers quelque chose » en « un pointeur vers un membre du personnel », et c'est ce qui permet au formulaire d'enregistrement d'afficher un seul contrôle au lieu de deux. Ne laissez Not pinned que si vous voulez vraiment que différents administrateurs pointent vers différents types d'enregistrement.",
          ex4Title: "Remplissez-le sur un enregistrement",
          ex4Content:
            "Ouvrez n'importe quel enregistrement d'administrateur. La section Champs personnalisés affiche désormais un contrôle Staff record avec un texte indicatif vous invitant à sélectionner un enregistrement. Ouvrez-le, tapez une partie d'un nom, et la liste se restreint aux membres du personnel correspondants avec leur intitulé de poste en dessous. Choisissez-en un et enregistrez la fiche.",
          ex5Title: "Relisez-la, et remarquez ce qui s'est passé",
          ex5Content:
            "Rouvrez l'enregistrement. Le champ affiche le nom du membre du personnel — récupéré à l'instant, pas mémorisé depuis votre enregistrement. Changez le nom de famille de cette personne sur son propre enregistrement de personnel, revenez, et la référence affiche le nouveau nom de famille sans que personne n'ait touché à l'enregistrement d'administrateur.",
          ex6Title: "Vérifiez les deux comportements qui comptent",
          ex6Content:
            "Connectez-vous en tant que quelqu'un qui peut modifier les administrateurs mais ne peut pas consulter le personnel : le champ est présent, il indique que la valeur stockée est correcte et que cette personne n'est pas autorisée à voir le nom, et elle ne peut pas l'écraser. Supprimez ensuite le membre du personnel : la référence s'efface d'elle-même, l'enregistrement d'administrateur conserve sa ligne de valeur et son historique, et le champ se lit comme vide plutôt que comme un pointeur cassé.",

          userExampleTitle: "Un exemple concret : un champ Reviewed by",
          userExampleIntro:
            "Le cas User Reference, plus court précisément parce qu'il n'y a rien à configurer.",
          ux1Title: "Définissez le champ",
          ux1Content:
            "Ajoutez un champ sur le type d'enregistrement souhaité, définissez la clé sur reviewed_by, le libellé sur Reviewed by, et le type de valeur sur User Reference. Aucun contrôle de cible n'apparaît, et c'est normal — la réponse ne peut jamais être qu'un compte utilisateur.",
          ux2Title: "Remplissez-le",
          ux2Content:
            "Ouvrez un enregistrement de ce type. Le contrôle Reviewed by propose une liste consultable de comptes utilisateurs, chacun avec son nom d'utilisateur sous le nom. Les comptes actuellement verrouillés sont marqués inactifs et restent sélectionnables, car ce sont des réponses légitimes pour quelque chose qui s'est déjà produit.",
          ux3Title: "Confirmez ce qu'il stocke",
          ux3Content:
            "La réponse enregistre le type de compte utilisateur et l'identité de ce compte — les deux mêmes éléments que stocke un Entity Reference, de sorte qu'un champ marqué User Reference indique ce qu'il contient plutôt que simplement ce pour quoi il a été configuré.",
          ux4Title: "Confirmez ce qu'il refuse",
          ux4Content:
            "Il n'existe aucun moyen, depuis ce formulaire ou depuis une requête qui le contourne, de faire pointer ce champ vers un administrateur, un groupe d'utilisateurs ou une ligne de catalogue de plateforme. Le refus arrive avec un message nommant ce qui est autorisé, et il est refusé aussi bien à la définition qu'à l'enregistrement.",

          notTitle: "Ce que les champs de référence ne sont pas",
          notIntro:
            "Des attentes raisonnables auxquelles ces types ne répondent délibérément pas. Aucune n'est un défaut à signaler.",
          not1: "Ce n'est pas une relation que le produit comprend. Rien n'est calculé à partir d'une référence, rien n'en est déclenché, et aucun écran ne gagne une liste « enregistrements pointant vers celui-ci » du simple fait qu'une référence existe.",
          not2: "Ce n'est pas un moyen de masquer des enregistrements. Un sélecteur montre exactement ce que les propres écrans du module cible montrent à cette même personne. Si quelqu'un ne doit pas voir un type d'enregistrement, cela relève d'une permission sur ce type d'enregistrement.",
          not3: "Ils ne stockent jamais de nom, et il n'existe aucun paramètre pour en changer. Un champ qui doit survivre à la suppression de sa cible avec l'ancien nom encore lisible est un champ Text, et accepter qu'il dérive avec le temps est le prix de ce choix.",
          not4: "Ce n'est pas du plusieurs-à-plusieurs. Un champ de référence contient un seul pointeur. Il n'existe aucun type de référence à valeurs multiples, et Multi-Select ne peut pas pointer vers des enregistrements — ses réponses sont du texte que vous avez rédigé.",
          not5: "Ils ne peuvent pas cibler tous les types d'enregistrement. Seuls les types dont le module propriétaire fournit une liste consultable et vérifiée par permission peuvent être référencés, et les autres sont refusés plutôt que silencieusement proposés.",
          not6: "Ce n'est pas inclus dans l'export des définitions en feuille de calcul. Ce fichier compte dix-huit colonnes et un type cible épinglé n'en fait pas partie, donc une définition exportée n'enregistre pas ce vers quoi pointe son champ.",

          nextTitle: "Où aller ensuite",
          nextIntro:
            "La mécanique de recherche d'une référence — les trois recherches, chaque état d'échec, et ce qu'il faut faire pour chacun — se trouve sur sa propre page.",
          thPage: "Page",
          thCovers: "Ce qu'elle couvre",
          pageLookups: "Recherches de référence",
          coversLookups:
            "Les trois recherches derrière une référence, ce que signifie chaque réponse et chaque refus, les cinq états d'échec et à qui chacun incombe, le comportement à la suppression, et comment le sélecteur pagine.",
          pageValueTypes: "Types de valeur",
          coversValueTypes:
            "Les vingt-deux types de valeur côte à côte, y compris ces deux-là, avec des exemples de saisie et le code d'erreur que renvoie chaque refus.",
          pageDefining: "Définir un champ",
          coversDefining:
            "Le formulaire de définition contrôle par contrôle, y compris le contrôle Target Entity Type et chaque refus qu'il peut produire.",
        },

        // ═══════════════════════════════════════════════════
        //  Recherches de référence
        // ═══════════════════════════════════════════════════
        referenceLookups: {
          title: "Recherches de référence",
          description:
            "Comment une référence est recherchée : les trois recherches derrière un champ de référence, ce que signifie chaque réponse, les cinq états d'échec et à qui chacun incombe, ce qui se passe quand l'enregistrement référencé est supprimé, et comment se comporte le sélecteur.",
          intro:
            "Un champ de référence est composé à partir de trois recherches distinctes : l'une demande quels types d'enregistrement vous pouvez cibler, l'une recherche dans un type choisi, et l'une résout un pointeur déjà détenu pour en retrouver un nom. Cette page couvre les trois, chaque réponse que chacune peut donner, et — la partie à lire avant que quelque chose ne tourne mal — ce que signifie chaque type d'échec et qui peut le corriger.",
          whyThreeTitle: "Pourquoi le nom arrive séparément",
          whyThreeContent:
            "Les propres valeurs de l'enregistrement sont lues en un seul appel ; le nom de chaque référence est ensuite résolu dans le sien. Ce n'est pas un oubli. Résoudre un nom est protégé par la propre permission de la cible, il doit donc s'agir de sa propre lecture vérifiée par permission — et le faire en ligne signifierait une requête inter-modules par référence et par ligne, ce qui, sur une liste d'enregistrements, donne une requête par cellule.",

          endpointsTitle: "Les trois recherches",
          endpointsIntro:
            "Toutes trois vivent sous une adresse qui leur est propre plutôt qu'aux côtés des autres appels de champs personnalisés, et c'est délibéré : elles lisent les données d'autres modules, elles sont donc protégées par la propre permission de consultation du type d'enregistrement cible, et non par la permission d'administrer les définitions de champs. Quelqu'un qui administre les champs personnalisés mais ne peut pas lire le personnel est refusé ici, à juste titre.",
          endpointsTypes:
            "Liste les types d'enregistrement que cet appelant peut cibler dès maintenant.",
          endpointsSearch:
            "Renvoie une page d'enregistrements sélectionnables d'un type, éventuellement filtrée.",
          endpointsResolve:
            "Résout un pointeur déjà détenu par l'appelant pour retrouver son enregistrement.",
          endpointsPermission:
            "Il n'existe donc aucune permission unique qui ouvre cette fonctionnalité. Toutes trois exigent d'être connecté en tant qu'administrateur, et chacune exige ensuite la permission de consultation du type d'enregistrement présent dans l'adresse : lister les membres du personnel nécessite la permission de consultation du personnel, lister les comptes utilisateurs nécessite celle des comptes utilisateurs. La conséquence à prévoir est que la même personne peut être admise par l'une de ces recherches et refusée par la suivante, sur le même écran, et les deux réponses sont correctes.",

          typesTitle: "Lister ce que vous pouvez cibler",
          typesWhat:
            "Ceci répond avec l'ensemble filtré, pas le catalogue complet : enregistré, résoluble par cette installation, et autorisé pour vous. Chaque entrée renvoyée est immédiatement utilisable, ce qui est toute la raison d'être de cette recherche — un contrôle qui proposerait tous les types d'enregistrement enregistrés proposerait des choix qui vous refuseraient au clic suivant, et l'alternative consistant à tous les essayer un par un représente une poignée de refus par chargement de page.",
          typesEmpty:
            "Une liste vide est un succès, pas un échec. Elle signifie « vous n'êtes autorisé à cibler aucune référence », et elle est rendue comme une phrase explicative à l'intérieur du contrôle plutôt que comme une erreur ou comme une liste déroulante silencieusement vide. Elle a deux causes possibles, et le produit nomme les deux sans affirmer laquelle s'applique : les modules propriétaires peuvent ne pas faire partie de cette installation, ou vous pouvez ne détenir aucun accès en consultation sur eux. Seule la seconde se règle en demandant des permissions, ce qui explique pourquoi un texte ne nommant qu'une seule cause enverrait quelqu'un faire quelque chose qui ne peut pas fonctionner.",
          typesShape:
            "Chaque entrée porte son identifiant stable, le module qui le possède, et un nom d'affichage en anglais et en arabe. Ces noms proviennent du propre registre de la plateforme plutôt que des traductions de cette application, ils sont donc affichés tels que fournis et jamais recherchés comme des clés de traduction.",

          searchTitle: "Rechercher dans un type d'enregistrement",
          searchWhat:
            "Une page d'enregistrements sélectionnables, dans un ordre stable, avec un filtre en texte libre facultatif. Les colonnes sur lesquelles porte le filtre relèvent du choix du module propriétaire plutôt que d'une promesse faite ici.",
          searchPaging:
            "Une page contient vingt lignes par défaut. Demander plus de cent est silencieusement plafonné plutôt que refusé, et l'ordre est délibérément stable d'un appel à l'autre — un ordre instable ferait que la page deux renverrait des lignes déjà vues sur la page un. Le contrôle charge la première page, puis accumule les pages suivantes derrière un contrôle Load more plutôt que de remplacer ce que vous étiez en train de regarder.",
          searchRows:
            "Chaque ligne porte un nom d'affichage jamais vide, une seconde ligne facultative pour distinguer deux enregistrements au nom similaire, et un indicateur signalant si l'enregistrement est dormant. Les enregistrements supprimés ne sont jamais renvoyés du tout, donc cet indicateur ne signifie jamais supprimé — une ligne dormante est présente, sélectionnable, et une réponse parfaitement valide.",
          searchTyping:
            "La frappe est temporisée avant de devenir une requête. Sans cela, un nom de huit caractères déclencherait huit requêtes inter-modules, dont sept réponses seraient jetées — et celle qui s'affiche serait celle arrivée en dernier plutôt que celle correspondant à ce que vous avez tapé.",

          resolveTitle: "Résoudre un pointeur déjà détenu",
          resolveWhat:
            "Le versant lecture de la fonctionnalité, et le seul moyen pour une référence stockée de devenir un nom à l'écran. Cette recherche prend le type d'enregistrement et l'identité, et renvoie exactement la même forme qu'une ligne de sélecteur — de sorte qu'une référence chargée depuis la base de données et un enregistrement que vous venez de choisir proviennent d'un seul contrat plutôt que de deux.",
          resolveGates:
            "Elle applique chaque filtre qu'applique la recherche : le type d'enregistrement doit être enregistré, vous devez détenir la propre permission de consultation de ce type, cette installation doit pouvoir y répondre, et l'enregistrement est lu via le référentiel du module propriétaire filtré par espace de travail et par enregistrements supprimés. Le fait qu'il s'agisse d'une lecture d'affichage uniquement n'assouplit aucun de ces points.",
          resolveNoName:
            "C'est aussi le seul endroit d'où provient un nom. Rien dans une référence stockée ne comprend de nom, par conception, donc un champ qui ne peut pas se résoudre affiche une phrase précise expliquant pourquoi — jamais un nom dont il se serait souvenu depuis avant.",

          statusesTitle: "Ce que signifie chaque réponse",
          statusesIntro:
            "Les réponses sont délibérément distinctes les unes des autres, avec exactement une fusion conservée. Lisez ce tableau comme la correspondance entre ce que le produit vous dit et ce que vous devez en faire.",
          thAnswer: "Réponse",
          thWhatItMeans: "Ce que cela signifie",
          thWhoFixes: "À qui cela incombe",
          ansOk: "Succès",
          ansOkMeans:
            "L'enregistrement s'est résolu. Vous obtenez son nom actuel, sa seconde ligne facultative, et s'il est dormant.",
          ansOkFixes: "Personne — c'est le cas normal.",
          ansForbidden: "Non autorisé",
          ansForbiddenMeans:
            "Vous ne détenez pas la permission de consultation de ce type d'enregistrement. Cela ne dit absolument rien sur l'enregistrement lui-même, ni sur le fait qu'il existe toujours.",
          ansForbiddenFixes:
            "Quiconque administre les rôles. C'est un fait sur votre propre accès, que vous auriez déjà pu apprendre en lisant vos propres permissions.",
          ansNotFound: "Introuvable",
          ansNotFoundMeans:
            "L'enregistrement ne se résout pas. Il a été supprimé, ou il appartient à un espace de travail que vous ne pouvez pas voir — fusionnés en une seule réponse délibérément, afin que cette recherche ne puisse pas servir à tester ce qui existe ailleurs.",
          ansNotFoundFixes:
            "Quiconque possède la donnée. Choisissez un autre enregistrement, ou videz le champ.",
          ansUnknownType: "Type d'enregistrement inconnu",
          ansUnknownTypeMeans:
            "Le type d'enregistrement nommé n'est pas enregistré du tout. Ceci décrit l'installation, pas un enregistrement précis — cela signifie généralement qu'un champ a été épinglé à un type d'enregistrement qui a depuis été retiré.",
          ansUnknownTypeFixes: "Quiconque administre le déploiement.",
          ansUnavailable: "Module non disponible",
          ansUnavailableMeans:
            "Le type d'enregistrement est enregistré mais le module qui le possède ne fait pas partie de cette installation, donc rien ici ne peut y répondre. Aucun octroi de permission ne changera jamais cela.",
          ansUnavailableFixes: "Quiconque administre le déploiement.",
          ansInvalidId: "Identité invalide",
          ansInvalidIdMeans:
            "L'identité envoyée n'a pas pu être lue du tout. Soit elle a été modifiée en chemin par quelque chose, soit une valeur stockée est antérieure à un changement et ne peut plus être interprétée.",
          ansInvalidIdFixes:
            "Quiconque remplit l'enregistrement — choisissez à nouveau l'enregistrement. Celui-ci est remplacé, jamais repointé.",
          statusesInfoTitle: "Ce que les réponses ne vous disent délibérément pas",
          statusesInfoContent:
            "« Supprimé » et « dans un espace de travail que vous ne pouvez pas voir » sont une seule réponse et le resteront toujours. Les séparer permettrait à quelqu'un de sonder des identités une par une pour découvrir ce qui existe dans un autre espace de travail. Tout le reste est distinguable, car tout le reste décrit soit votre propre accès, soit cette installation — dont aucun n'est un secret pour vous.",

          failuresTitle: "Les cinq états d'échec, et pourquoi ils se lisent différemment",
          failuresIntro:
            "Un champ de référence peut échouer à s'afficher pour cinq raisons distinctes. Ce sont cinq phrases différentes à l'écran parce que ce sont cinq problèmes différents avec cinq remèdes différents, et c'est le tableau le plus important de cette page.",
          thState: "Ce qui s'est passé",
          thOnScreen: "Ce que dit et fait le champ",
          thYouDo: "Ce qu'il faut faire",
          stNoPermission: "Vous n'êtes peut-être pas autorisé à consulter ce type d'enregistrement",
          scrNoPermission:
            "Le champ indique que la valeur stockée est correcte mais que son nom ne peut pas vous être montré, et devient en lecture seule — lisible, sans sélecteur. Il n'est délibérément pas vidé, car le vider inviterait quelqu'un sans visibilité sur la cible à écraser une référence parfaitement valide.",
          doNoPermission:
            "Rien concernant la donnée. Demandez à qui administre les rôles un accès en consultation à ce type d'enregistrement.",
          stGone: "L'enregistrement référencé n'existe plus",
          scrGone:
            "Le champ indique que l'enregistrement est introuvable, propose les deux raisons possibles — supprimé, ou dans une organisation que vous ne pouvez pas voir — et n'affirme ni l'une ni l'autre. Il reste modifiable.",
          doGone:
            "Choisissez un autre enregistrement, ou videz le champ. Reprendre une sélection est la solution.",
          stMalformed: "La référence stockée est mal formée",
          scrMalformed:
            "Le champ indique que ce qui est stocké ne peut pas être lu du tout, reste modifiable, et se marque en plus comme invalide — car contrairement à un pointeur en suspens, ce n'est pas une valeur que le produit a jamais légitimement produite.",
          doMalformed:
            "Choisissez à nouveau l'enregistrement. Celui-ci doit être remplacé plutôt que repointé, et cela vaut la peine d'être signalé si vous n'en êtes pas la cause.",
          stTransient: "La recherche n'a pas pu s'exécuter à l'instant",
          scrTransient:
            "Le champ indique qu'il n'a pas pu charger l'enregistrement référencé pour le moment et que la référence elle-même est correcte, et propose un contrôle Try again.",
          doTransient:
            "Réessayez. Ne videz surtout pas le champ — la valeur stockée est correcte, et la vider est la seule action qui transforme une panne passagère en véritable perte de donnée.",
          stTypeUnavailable:
            "Cette installation ne peut pas répondre pour ce type d'enregistrement",
          scrTypeUnavailable:
            "Le champ indique que ce type d'enregistrement n'est pas disponible dans cette installation, et n'offre aucun contrôle Try again — car réessayer refusera identiquement à chaque fois.",
          doTypeUnavailable:
            "Demandez à qui administre le déploiement quels types d'enregistrement cette installation peut utiliser. C'est une question d'installation, pas de permission.",
          greyDashTitle: "Pourquoi ce n'est pas un simple tiret gris",
          greyDashContent:
            "Chacun des cinq cas pourrait être rendu comme un champ vide, et le résultat serait un pointeur vers un enregistrement supprimé qui passerait inaperçu pendant un an — indissociable d'un champ que personne n'a jamais rempli, et indissociable d'un collègue qui n'a simplement pas la permission. Les fusionner n'est pas une simplification cosmétique ; cela supprime la seule information qui indique à qui incombe le problème. Si vous êtes un jour tenté de faire lire ces cas de la même façon, voici le paragraphe qui explique pourquoi ne pas le faire.",
          emptyVsFailedTitle: "Un champ vide est une sixième chose, entièrement différente",
          emptyVsFailedContent:
            "Une référence qui n'a jamais été remplie se lit comme vide, et c'est un fait différent des cinq précédents. C'est pourquoi une référence remplie dont la cible a disparu n'est jamais présentée comme vide : un opérateur regardant une cellule vierge doit pouvoir distinguer « personne n'a répondu à ceci » de « la réponse pointe vers quelque chose qui n'existe plus ».",

          saveTitle: "Ce qui est vérifié quand une référence est enregistrée",
          saveIntro:
            "Chaque enregistrement de référence exécute les mêmes vérifications dans le même ordre, et chacune échoue avec son propre message plutôt qu'un générique « référence invalide ». Connaître cet ordre explique chaque refus que vous pouvez rencontrer.",
          save1:
            "Les deux éléments sont présents. Une soumission à laquelle il manque soit le type d'enregistrement soit l'identité est refusée comme référence incomplète — jamais traitée comme un champ vide, car la moitié d'une référence signifie que quelqu'un a commencé à répondre et s'est arrêté.",
          save2:
            "Le type d'enregistrement est enregistré. Un identifiant non enregistré n'a aucune permission derrière lui, il n'y aurait donc rien contre quoi les vérifications suivantes pourraient se mesurer. Refusée, en nommant l'identifiant.",
          save3:
            "Le type d'enregistrement est autorisé pour ce type de valeur. Toujours vrai pour Entity Reference ; pour User Reference, c'est la liste blanche fixe de la plateforme, et le refus nomme ce qui est autorisé plutôt que seulement le fait que votre choix ne l'était pas.",
          save4:
            "Le type d'enregistrement correspond à l'épinglage de la définition, s'il y en a un. Refusée en nommant à la fois ce qui était attendu et ce qui est arrivé. Une définition non épinglée saute entièrement cette vérification — non épinglé signifie « tout type autorisé », et ne doit jamais être lu comme « rien de configuré, donc rien de valide ».",
          save5:
            "L'identité peut être lue. Une identité obsolète ou modifiée est refusée proprement comme identité invalide, sur ce seul champ, plutôt que de faire échouer tout l'enregistrement avec une erreur inexpliquée.",
          save6:
            "Vous pouviez lire cet enregistrement à l'instant même. C'est la vérification qui rend tout le reste sûr, et c'est délibérément un refus plat unique, sans détail — voir ci-dessous.",
          saveGate:
            "Cette dernière vérification vous soumet à la propre permission de consultation du type d'enregistrement cible et résout l'enregistrement via le référentiel filtré par espace de travail du module propriétaire. Sans elle, la fonctionnalité serait un outil d'extraction plutôt qu'une référence : quelqu'un qui peut modifier un enregistrement d'administrateur mais ne peut pas lire le personnel pourrait stocker une identité de personnel arbitraire puis relire le nom via la recherche de résolution. Stocker un pointeur vers une donnée est une lecture de cette donnée, différée.",
          saveGateInfoTitle: "Pourquoi ce refus unique en dit si peu",
          saveGateInfoContent:
            "C'est le seul endroit de toute la fonctionnalité où vous fournissez une identité arbitraire, c'est donc le seul endroit qui pourrait être détourné en moyen de tester ce qui existe dans un autre espace de travail. Il regroupe donc toutes les raisons en un seul refus. Le versant lecture peut se permettre d'être précis pour la raison inverse : à ce stade, l'identité est déjà une identité que ce filtre a approuvée.",
          saveWhatStored:
            "Un détail aux conséquences réelles : la réponse stocke le type d'enregistrement que la valeur cible réellement, jamais l'épinglage de la définition. Les deux sont identiques au moment de l'enregistrement précisément à cause de la quatrième vérification — mais écrire l'épinglage à la place réécrirait silencieusement le sens de chaque réponse stockée le jour où quelqu'un repointe le champ, ce qui est précisément la propriété qui garde une ancienne réponse lisible.",

          deleteTitle: "Quand l'enregistrement référencé est supprimé",
          deleteIntro:
            "Supprimer un enregistrement que d'autres enregistrements ciblent est une opération normale qui ne nécessite aucun nettoyage. Les pointeurs s'effacent d'eux-mêmes.",
          d1Title: "L'enregistrement est supprimé, de façon ordinaire",
          d1Content:
            "Quelqu'un supprime le membre du personnel, le compte utilisateur ou la personne via le propre écran de ce module, en détenant la propre permission de suppression de ce module. Rien concernant les champs personnalisés n'entre encore en jeu.",
          d2Title: "La suppression enregistre qu'elle a eu lieu",
          d2Content:
            "La suppression et la note indiquant qu'elle a eu lieu sont validées ensemble, en une seule transaction. Soit les deux se produisent, soit aucune ne se produit, il n'y a donc aucune fenêtre pendant laquelle un enregistrement a disparu sans que rien n'ait enregistré le fait.",
          d3Title: "Chaque pointeur vers cet enregistrement est effacé",
          d3Content:
            "Les deux éléments de chaque réponse concernée sont effacés ensemble, dans la même passe. Jamais l'un sans l'autre — la moitié d'une référence est le seul état que rien ne peut afficher et qu'aucun opérateur ne peut réparer.",
          d4Title: "La ligne de valeur survit",
          d4Content:
            "Rien n'est supprimé. Chaque réponse conserve sa ligne, sa version, sa place dans l'ensemble des réponses de l'enregistrement et son historique. Seul le pointeur disparaît, ce qui explique pourquoi le champ se lit ensuite comme véritablement vide plutôt que comme cassé.",
          deleteScope:
            "L'effacement couvre les deux emplacements où les réponses sont stockées, y compris l'ancien magasin qui contient encore des réponses antérieures à la migration, et il couvre aussi les lignes de réponse supprimées — une ligne supprimée qui conserverait encore un pointeur obsolète le redonnerait à quiconque la restaurerait plus tard.",
          deleteIdempotent:
            "Effacer un pointeur déjà vide ne fait rien, délibérément, de sorte que l'opération est sûre à répéter. Les propres instantanés de réponses antérieures de l'enregistrement ne sont pas balayés, et n'ont pas besoin de l'être : ce sont des artefacts de restauration à rétention courte, supprimés selon leur propre calendrier, et qui ne constituent jamais entre-temps un chemin d'affichage actif.",
          deleteInfoTitle: "Avant que le pointeur ne s'efface, et là où il ne s'efface jamais",
          deleteInfoContent:
            "Il existe une courte fenêtre entre une suppression et l'effacement des pointeurs, et il existe des types d'enregistrement dont le module n'annonce pas du tout ses suppressions. Dans les deux cas, une référence se contente de signaler honnêtement que son enregistrement est introuvable, ce qui correspond exactement à la deuxième ligne du tableau des échecs ci-dessus. Rien n'affiche un nom erroné, et rien n'affiche un champ vide en prétendant que personne n'y a répondu.",
          deleteSoftTitle: "Un enregistrement simplement masqué compte comme disparu",
          deleteSoftContent:
            "La plupart des suppressions dans le produit masquent l'enregistrement plutôt que de le retirer physiquement. Un enregistrement masqué est déjà inaccessible via les propres écrans du module propriétaire, une référence le traite donc à juste titre comme disparu — un enregistrement qu'un administrateur ne peut pas voir n'est pas un enregistrement vers lequel une référence peut se résoudre.",

          pickerTitle: "Comment se comporte le sélecteur",
          pickerIntro:
            "Des détails du contrôle lui-même, plus faciles à lire une fois que de les déduire de son comportement.",
          thBehaviour: "Comportement",
          thWhy: "Pourquoi il en est ainsi",
          pkLazy: "Rien n'est récupéré tant que vous n'ouvrez pas le contrôle.",
          pkLazyWhy:
            "Un formulaire d'enregistrement peut porter plusieurs champs de référence. Celui auquel personne ne touche ne devrait interroger aucun autre module du tout, et les réponses sont mises en cache ensuite, donc rouvrir le contrôle ne coûte rien.",
          pkTwoControls:
            "Un champ non épinglé affiche deux contrôles, et aucun ne vole le focus à l'autre.",
          pkTwoControlsWhy:
            "Choisir un type d'enregistrement vous laisse sur ce contrôle, le contrôle d'enregistrement devenant disponible à une étape près. Ouvrir automatiquement le sélecteur d'enregistrement retirerait le focus à quelqu'un qui relit encore ce qu'il vient de choisir.",
          pkAccumulate: "Les pages suivantes s'ajoutent à la liste plutôt que de la remplacer.",
          pkAccumulateWhy:
            "Une recherche sur la table de personnel de tout un espace de travail nécessite la pagination, et une liste qui se remplacerait ferait perdre la ligne dépassée en chemin vers Load more.",
          pkDormant: "Un enregistrement dormant est marqué, pas masqué.",
          pkDormantWhy:
            "Il existe toujours et reste une réponse valide — un membre du personnel parti, conservé pour des affectations historiques, en est exactement le cas. Le traiter comme invalide rendrait les références historiques impossibles à enregistrer.",
          pkNoResults: "Un filtre sans correspondance et une liste vide se lisent différemment.",
          pkNoResultsWhy:
            "« Votre filtre n'a rien trouvé » concerne ce que vous avez tapé. « Il n'y a rien que vous puissiez cibler » concerne votre accès. Une phrase unique pour les deux dirait à quelqu'un ayant fait une faute de frappe qu'il n'a aucune permission.",
          pkNoRetry: "Deux des états d'échec n'offrent aucun contrôle Try again.",
          pkNoRetryWhy:
            "Un refus de permission et un module indisponible refusent identiquement à chaque fois. Un bouton vous invitant à insister serait pire que pas de bouton. Seule une véritable panne de transport bénéficie d'une nouvelle tentative, car c'est la seule qu'une nouvelle tentative corrige.",
          pkViewMode:
            "En mode consultation, le contrôle est désactivé plutôt que simplement non cliquable.",
          pkViewModeWhy:
            "Un sélecteur de référence est un sélecteur, il suit donc la même convention que tout autre sélecteur de ces formulaires. Son propre état de lecture seule, utilisé quand vous n'êtes pas autorisé à voir le nom de la cible, est une chose différente qui a une apparence différente.",
          pkNoLabelTrick: "Le contrôle se nomme lui-même pour les technologies d'assistance.",
          pkNoLabelTrickWhy:
            "Son libellé visible est un vrai câblage cliquable, mais le nom accessible est défini directement sur le contrôle — un libellé seul ne peut pas nommer un contrôle de cette forme. Deux champs de référence sur un même formulaire s'annoncent donc distinctement plutôt que tous deux comme « Record type ».",

          diagnoseTitle: "Diagnostiquer une référence qui ne s'affiche pas",
          diagnoseIntro:
            "Dans l'ordre. Chaque étape écarte l'un des cinq états ci-dessus, et les quatre premières ne nécessitent aucun accès que vous ne déteniez déjà.",
          dg1Title: "Lisez la phrase dans le champ",
          dg1Content:
            "Les cinq états n'ont jamais le même libellé, donc le champ vous a déjà indiqué dans lequel vous vous trouvez. Cette étape est citée en premier car c'est celle qu'on saute le plus souvent.",
          dg2Title: "S'il propose Try again, utilisez-le",
          dg2Content:
            "Seul l'échec transitoire en propose un. Si le champ se résout à la deuxième tentative, rien n'a jamais été défectueux dans la valeur stockée, et il n'y a rien à corriger.",
          dg3Title: "Vérifiez le même champ sur un autre enregistrement",
          dg3Content:
            "Si chaque référence de ce type échoue de façon identique, c'est vos permissions ou l'installation — pas la donnée. Si seule celle-ci échoue, c'est l'enregistrement qu'elle cible qu'il faut examiner.",
          dg4Title: "Faites ouvrir le même enregistrement par quelqu'un ayant un accès complet",
          dg4Content:
            "S'il voit un nom et pas vous, c'est une permission sur ce type d'enregistrement. S'il voit le même échec, c'est la donnée ou l'installation.",
          dg5Title:
            "Ce n'est qu'alors qu'il faut décider de reprendre une sélection ou de vider le champ",
          dg5Content:
            "Reprenez une sélection quand l'enregistrement a véritablement disparu ou que la valeur stockée est mal formée. Videz le champ seulement quand il doit être vide. Ne videz jamais un champ qui a signalé un échec transitoire — c'est la seule action qui transforme une panne chez quelqu'un d'autre en perte de vos propres données.",

          limitsTitle: "Limites et écarts délibérés",
          limitsIntro:
            "Énoncés pour que personne ne passe un après-midi à chercher un paramètre qui n'existe pas.",
          thLimit: "Limite",
          thDetail: "Détail",
          limPageSize: "Enregistrements par page dans le sélecteur",
          limPageSizeDetail:
            "Vingt par défaut. Une demande de plus de cent est plafonnée plutôt que refusée, et le plafond est appliqué deux fois à l'entrée.",
          limDebounce: "Délai entre la frappe et la recherche",
          limDebounceDetail:
            "Une courte pause fixe, la même que celle utilisée par tout sélecteur du produit adossé au serveur. Non configurable.",
          limNoName: "Aucun nom d'affichage stocké",
          limNoNameDetail:
            "Il n'existe nulle part de paramètre pour figer un nom aux côtés d'un pointeur, et il n'y en aura pas — cela reviendrait à donner un nom protégé par une permission à quiconque en détient une autre.",
          limNoBacklinks: "Aucune vue « qu'est-ce qui pointe vers cet enregistrement »",
          limNoBacklinksDetail:
            "Rien ne liste les références qui pointent vers un enregistrement donné. Supprimer un enregistrement ne vous avertit pas du nombre de pointeurs qu'il s'apprête à effacer.",
          limNoExport: "Absent de l'export des définitions",
          limNoExportDetail:
            "La feuille de calcul des définitions à dix-huit colonnes n'a aucune colonne pour un type cible épinglé, donc une définition exportée n'enregistre pas ce vers quoi pointe son champ.",
          limNoMulti: "Un pointeur par champ",
          limNoMultiDetail:
            "Il n'existe aucun type de référence à valeurs multiples. Deux réponses signifient deux champs.",
          limNoTypeFilter: "Le sélecteur ne peut être restreint que par du texte",
          limNoTypeFilterDetail:
            "Les colonnes sur lesquelles porte le filtre en texte libre relèvent du choix du module propriétaire, et il n'existe aucun filtre supplémentaire — ni « actifs seulement », ni filtre par groupe.",
          limNoAdminTarget:
            "User Reference refuse toujours un administrateur, même si Entity Reference ne le fait plus",
          limNoAdminTargetDetail:
            "Ni depuis le formulaire de définition, ni depuis une requête qui le contourne. La cible autorisée de User Reference est exactement une seule chose, identity.user, par conception d'origine — l'enregistrement propre d'un administrateur est un type de ligne différent, et pointer un champ User Reference vers l'un d'eux est refusé quel que soit le module par lequel la requête est passée. Entity Reference propose les administrateurs comme cible depuis qu'une version ultérieure leur a ajouté un fournisseur de recherche ; cette limite est propre à User Reference seul.",

          nextTitle: "Où aller ensuite",
          nextIntro:
            "Les concepts derrière ces recherches se trouvent sur la page Champs de référence.",
          thPage: "Page",
          thCovers: "Ce qu'elle couvre",
          pageReferences: "Champs de référence",
          coversReferences:
            "Ce que sont les deux types de référence, lequel utiliser, ce qui est stocké, pourquoi aucun nom n'est conservé, l'épinglage d'un type cible, ce qui peut être référencé, et les règles d'espace de travail.",
          pageSecurity: "Sécurité au niveau du champ",
          coversSecurity:
            "Le mécanisme distinct pour masquer un champ entier à un rôle ou un groupe d'utilisateurs — ce qui est différent du fait de ne pas être autorisé à lire la cible d'une référence.",
          pageLimits: "Limites et comportements",
          coversLimits:
            "Chaque plafond fixe et chaque limitation délibérée à travers toute la fonctionnalité, références comprises.",
        },

        // ═══════════════════════════════════════════════════
        //  Définir un champ
        // ═══════════════════════════════════════════════════
        defining: {
          title: "Définir un champ",
          description:
            "Le formulaire de définition contrôle par contrôle, le parcours complet, les règles de clés, la création d'un champ depuis l'intérieur d'un enregistrement, chaque refus, et ce qui peut encore être modifié après l'enregistrement.",
          intro:
            "Les définitions de champs vivent sur l'écran Champs personnalisés, dans l'espace de travail Administration. Cette page parcourt tout le formulaire : chaque contrôle, ce qui le révèle, ce qu'il fait, et ce qui se passe quand un enregistrement est refusé. Les noms des contrôles sont donnés tels qu'ils apparaissent dans l'interface anglaise.",
          beforeTitle: "Deux décisions à prendre avant d'ouvrir le formulaire",
          beforeContent:
            "Le type d'enregistrement et le type de valeur sont tous deux définitifs une fois enregistrés, et la clé l'est aussi. Tout le reste peut être modifié plus tard. Si vous n'êtes pas sûr du type de valeur qui convient, lisez d'abord la page Types de valeur — recréer un champ signifie perdre chaque réponse déjà stockée pour lui.",

          whereTitle: "Où se trouve l'écran",
          whereIntro: "Les champs personnalisés s'administrent depuis quatre écrans liés.",
          where1:
            "L'écran Champs personnalisés lui-même, dans l'espace de travail Administration, est l'endroit où les définitions sont créées, modifiées, désactivées et supprimées, et où un validateur est attaché.",
          where2:
            "L'écran Groupes de champs, accessible depuis un lien dans l'en-tête de cette page, rassemble les champs d'un type d'enregistrement sous des en-têtes.",
          where3:
            "Les écrans Types de valeur et Types d'entité, également accessibles depuis cet en-tête, sont des références en lecture seule. Ils n'ont volontairement pas leur propre entrée de menu latéral.",
          where4:
            "Le lien Add custom field à la fin de la section Champs personnalisés d'un formulaire d'enregistrement ouvre le même formulaire de définition dans un panneau latéral, sans quitter l'enregistrement.",

          controlsTitle: "Le formulaire, contrôle par contrôle",
          controlsIntro:
            "Tous les contrôles ne sont pas toujours visibles. Plusieurs n'apparaissent qu'une fois un type de valeur ou une portée particulière choisis, ce qui explique pourquoi le formulaire paraît plus court que ce tableau, un jour donné.",
          thControl: "Contrôle",
          thDoes: "Ce qu'il fait",
          thWhenShown: "Quand il apparaît",
          ctlEntityTypeDoes:
            "Choisit le type d'enregistrement auquel le champ appartient. Les types d'enregistrement sans écran dans cette application sont listés après les autres et marqués API only — un champ sur l'un d'eux est accessible via l'API mais n'a nulle part où s'afficher.",
          ctlEntityTypeWhen:
            "À la création. Figé et non modifiable quand le formulaire est ouvert depuis l'intérieur d'un enregistrement, et définitif après l'enregistrement.",
          ctlKeyDoes:
            "Définit le nom machine utilisé dans les messages d'erreur, les exports et l'API. En minuscules, doit commencer par une lettre, et ne peut contenir que des lettres, des chiffres et des tirets bas.",
          ctlKeyWhen: "À la création uniquement. Définitif après l'enregistrement.",
          ctlLabelEnDoes:
            "Le libellé anglais affiché au-dessus du champ de saisie sur chaque formulaire. Obligatoire.",
          ctlLabelArDoes:
            "Le libellé arabe. Facultatif — un lecteur arabophone voit le libellé anglais quand celui-ci est vide.",
          ctlAlways: "Toujours.",
          ctlValueTypeDoes:
            "Choisit l'un des vingt-deux types, déterminant le contrôle, la validation et le stockage. Le choisir est ce qui révèle la boîte Options, la liste déroulante Validator ou la liste déroulante Target Entity Type.",
          ctlValueTypeWhen: "À la création uniquement. Définitif après l'enregistrement.",
          ctlPlaceholderEnDoes:
            "Texte indicatif grisé facultatif affiché dans le champ vide, en anglais — par exemple « e.g. Enter your shirt size ».",
          ctlPlaceholderArDoes: "Le même texte indicatif en arabe.",
          ctlPlaceholderWhen:
            "Uniquement pour les types de valeur dont le contrôle possède un texte indicatif. Boolean, Rating, Color, Date et les autres types à base de sélecteur n'en ont aucun.",
          ctlOptionsDoes:
            "Contient la liste des réponses autorisées, une ligne par option, avec un libellé anglais et un libellé arabe pour chacune. Voir la page Options.",
          ctlOptionsWhen: "Uniquement quand le type de valeur est Select ou MultiSelect.",
          ctlValidatorDoes:
            "Attache l'une des 13 vérifications de format intégrées. Par défaut, aucun validateur. Voir la page Validateurs.",
          ctlValidatorWhen:
            "Uniquement quand le type de valeur est Text. Il n'est jamais affiché pour les vingt et un autres types.",
          ctlValidatorParamDoes:
            "Fournit le paramètre dont a besoin une vérification paramétrée — une liste déroulante de pays pour Postal Code, du texte libre pour les cinq autres.",
          ctlValidatorParamWhen: "Uniquement une fois choisi l'un des six validateurs paramétrés.",
          ctlReferenceTargetDoes:
            "Épingle le champ à un type d'enregistrement, de sorte que chaque valeur doive pointer vers un enregistrement de ce type. Sa première option, Not pinned — any allowed type, est un choix réel et permanent plutôt qu'un espace réservé : laissez-la telle quelle et chaque valeur nommera son propre type d'enregistrement à la place. C'est le seul moyen de retirer un épinglage, il reste donc disponible même quand la liste des types est vide ou ne se charge pas, et le contrôle n'est jamais désactivé.",
          ctlReferenceTargetWhen:
            "Uniquement quand le type de valeur est Entity Reference. Un champ User Reference ne l'affiche jamais, car sa seule cible légale est fixée par la plateforme et il n'y a rien à choisir. Contrairement aux trois paramètres définitifs, celui-ci peut être modifié plus tard — lisez l'avertissement du formulaire de modification avant de le faire.",
          ctlFieldGroupDoes:
            "Place le champ sous l'un des groupes de champs du type d'enregistrement, ou sous aucun groupe. Changer le type d'enregistrement efface le choix.",
          ctlFieldGroupWhen:
            "Uniquement si vous détenez la permission de consultation des groupes de champs et — sur l'écran principal des définitions — une fois qu'un type d'enregistrement a été choisi ; le panneau intégré l'affiche dès que vous détenez la permission, puisqu'il connaît déjà le type d'enregistrement. Affiché dans les deux cas même lorsque le type d'enregistrement choisi n'a encore aucun groupe, en ne proposant alors que no group jusqu'à ce qu'un groupe existe.",
          ctlRequiredDoes:
            "Refuse un enregistrement qui laisse le champ vide. Une valeur composée uniquement d'espaces compte comme vide pour chaque type de valeur.",
          ctlSortOrderDoes:
            "Positionne le champ par rapport aux autres champs personnalisés du formulaire. Les nombres les plus petits viennent en premier.",
          ctlSensitivityDoes:
            "Qualifie la façon dont le contenu du champ doit être traité — Unclassified, Internal, Confidential ou Restricted. Par défaut, Unclassified. C'est un libellé pour le reporting et la gestion des exports ; il ne contrôle pas qui peut voir le champ.",
          ctlExportableDoes:
            "Marque si les valeurs de ce champ doivent figurer dans les exports. Activé par défaut. C'est un rangement plutôt qu'une permission — quiconque peut déjà lire le champ peut toujours lire ses valeurs ailleurs — et cela ne retire pas le champ de l'export des définitions, qui le liste dans tous les cas.",
          ctlActiveDoes:
            "Si le champ est encore proposé sur les formulaires. Le désactiver retire le champ sans toucher aux réponses déjà stockées pour lui.",
          ctlActiveWhen: "À la modification. Un champ nouvellement créé est actif.",
          ctlGlobalDoes:
            "Crée le champ pour tous les espaces de travail de la plateforme plutôt que pour un seul. Les champs globaux échappent au quota par espace de travail, et seul un administrateur de la plateforme peut ensuite les modifier ou les supprimer.",
          ctlGlobalWhen:
            "Uniquement pour un Super Admin de la plateforme travaillant sans espace de travail sélectionné. À la création uniquement — la portée d'un champ est définitive.",

          stepsTitle: "Étape par étape",
          stepsIntro:
            "Le déroulement complet, pour le cas ordinaire d'un champ à portée d'espace de travail.",
          s1Title: "Ouvrez l'écran Champs personnalisés et choisissez Add",
          s1Content:
            "L'écran liste chaque champ que votre espace de travail peut voir, y compris tout champ global hérité de la plateforme. Les lignes globales portent un badge et n'offrent aucun contrôle de modification ou de suppression.",
          s2Title: "Choisissez le type d'enregistrement",
          s2Content:
            "Choisissez le type d'enregistrement auquel appartient le champ. Si votre type d'enregistrement est marqué API only, arrêtez-vous et reconsidérez — le champ s'enregistrera, mais rien dans l'interface ne l'affichera.",
          s3Title: "Choisissez le type de valeur",
          s3Content:
            "Choisissez parmi les vingt-deux. C'est la décision qui ne peut plus être annulée par la suite, et c'est aussi ce qui fait apparaître plus bas dans le formulaire la boîte Options, la liste déroulante Validator ou la liste déroulante Target Entity Type.",
          s4Title: "Nommez le champ",
          s4Content:
            "Saisissez le libellé anglais, un libellé arabe si vous en avez un, et la clé. La clé est définitive, choisissez donc quelque chose que vous reconnaîtrez encore dans un message d'erreur dans un an.",
          s5Title: "Renseignez les paramètres propres au type",
          s5Content:
            "Pour Select et MultiSelect, ajoutez les options. Pour Text, choisissez un validateur si vous en voulez un et fournissez son paramètre. Pour Entity Reference, décidez si vous épinglez un Target Entity Type. Ajoutez des textes indicatifs si le contrôle les accepte.",
          s6Title: "Définissez le comportement et la position",
          s6Content:
            "Activez ou désactivez Required, définissez Sort Order, et choisissez un Field Group si vous en utilisez. Un groupe ne se propose que s'il appartient au type d'enregistrement choisi.",
          s7Title: "Définissez la classification",
          s7Content:
            "Sensitivity vaut par défaut Unclassified et Include in exports est activé par défaut. Laissez les deux tels quels sauf raison contraire — la valeur par défaut de l'export existe en particulier pour qu'aucun champ ne manque silencieusement d'une feuille de calcul.",
          s8Title: "Enregistrez, et lisez le message en cas de refus",
          s8Content:
            "Un refus est toujours précis sur ce qui ne va pas. Le tableau plus bas sur cette page liste chaque refus que vous pouvez rencontrer et ce qu'il signifie.",

          keyTitle: "Choisir une clé",
          keyIntro:
            "La clé est le nom machine du champ. Elle apparaît dans chaque message d'erreur, dans l'export en feuille de calcul, et dans l'API. Elle doit être en minuscules, commencer par une lettre, et ne contenir que des lettres, des chiffres et des tirets bas — et elle doit être unique pour ce type d'enregistrement au sein de votre espace de travail.",
          thKeyExample: "Clé",
          thOutcome: "Ce qui se passe",
          keyOk: "Acceptée. C'est la forme à viser.",
          keyOkDigits:
            "Acceptée. Les chiffres et les tirets bas sont autorisés après le premier caractère.",
          keyUpper: "Refusée. Les clés sont en minuscules.",
          keyLeadingDigit: "Refusée. Une clé doit commencer par une lettre.",
          keyHyphen:
            "Refusée. Les traits d'union ne font pas partie de la grammaire — utilisez un tiret bas.",
          keySpace: "Refusée. Les espaces ne sont pas autorisés.",
          keyWarnTitle: "La clé est définitive",
          keyWarnContent:
            "Une fois le champ enregistré, la clé ne peut être modifiée par personne, car les réponses déjà stockées sont adressées par elle. Si une clé est incorrecte, le champ doit être supprimé et recréé — et le supprimer détruit les réponses déjà enregistrées pour lui. C'est le regret le plus courant lorsqu'on définit un champ dans la précipitation.",

          inlineTitle: "Ajouter un champ depuis l'intérieur d'un enregistrement",
          inlineIntro:
            "Vous n'avez pas à quitter ce que vous faites pour ajouter un champ. Chaque formulaire prenant en charge les champs personnalisés termine sa section Champs personnalisés par un lien Add custom field, verrouillé derrière la permission de création.",
          i1Title: "Cliquez sur Add custom field",
          i1Content:
            "Le formulaire de définition s'ouvre dans un panneau latéral plutôt que dans une boîte de dialogue par-dessus une autre. Le formulaire d'enregistrement derrière lui reste visible et lisible, et rien de ce que vous y avez déjà saisi n'est perdu.",
          i2Title: "Notez que le type d'enregistrement est figé",
          i2Content:
            "Le type d'enregistrement est affiché comme un contexte plutôt que comme une liste déroulante — c'est celui de l'écran où vous vous trouvez déjà. Tous les autres contrôles de l'écran complet se comportent ici de la même façon, sélecteur de validateur compris, à l'exception d'un ajout que ce panneau possède et que l'écran complet n'a pas — voir la suite.",
          i2bTitle: "Rattacher facultativement un Option Set partagé",
          i2bContent:
            "Pour Select ou MultiSelect, ce panneau — et lui seul, pas le propre formulaire de l'écran principal des définitions — propose un sélecteur Option Set aux côtés de l'éditeur d'options manuel. En choisir un le lie au champ dès sa création, dans la même étape : les options saisies manuellement au-dessus sont conservées, fusionnées avec celles du jeu plutôt que remplacées par elles. Affiché uniquement si vous détenez à la fois la permission de consultation des jeux d'options et celle de liaison.",
          i3Title: "Remplissez et enregistrez",
          i3Content:
            "Le panneau se ferme et le nouveau champ apparaît immédiatement dans le formulaire d'enregistrement toujours ouvert, vide et prêt à être rempli.",
          i4Title: "Poursuivez avec l'enregistrement",
          i4Content:
            "Remplissez le nouveau champ avec le reste et enregistrez la fiche une seule fois. La définition et la réponse sont deux enregistrements séparés, dans cet ordre.",
          inlineInfoTitle: "Si le lien n'est pas présent",
          inlineInfoContent:
            "Le lien Add custom field n'apparaît que pour quelqu'un détenant la permission de création. Sans elle, la section Champs personnalisés continue de fonctionner normalement pour remplir les champs existants — seul le raccourci pour en définir un nouveau est absent. Et sur un type d'enregistrement sans aucun champ personnalisé encore défini, la section Champs personnalisés n'apparaît pas du tout.",

          rejectTitle: "Ce qui est rejeté, et pourquoi",
          rejectIntro:
            "Chaque refus à la définition porte un message précis. Voici ceux que vous pouvez réellement rencontrer depuis le formulaire ou depuis une requête qui le contourne.",
          thSituation: "Situation",
          thWhatYouSee: "Ce que vous voyez",
          rejDuplicateKey: "Une clé qui existe déjà pour ce type d'enregistrement",
          rejDuplicateKeyMsg:
            "Refusée comme déjà existante. Les clés sont uniques par type d'enregistrement au sein d'un espace de travail — la même clé sur un autre type d'enregistrement ne pose pas de problème.",
          rejUnknownEntityType: "Un type d'enregistrement qui n'est pas enregistré",
          rejUnknownEntityTypeMsg:
            "Refusée, en nommant la clé : ce n'est pas un type d'entité enregistré. Accessible uniquement en contournant la liste déroulante.",
          rejNoOptions: "Un champ Select ou MultiSelect sans options",
          rejNoOptionsMsg: "Refusée : des options sont requises pour les champs Select.",
          rejOptionsOnOther: "Des options fournies pour un type qui ne les accepte pas",
          rejOptionsOnOtherMsg:
            "Refusée : les options ne sont autorisées que pour les champs Select.",
          rejValidatorNonText: "Un validateur attaché à un champ qui n'est pas Text",
          rejValidatorNonTextMsg:
            "Refusée, en nommant le type : un validateur ne peut être attaché qu'à un champ Text. La liste déroulante n'est même pas affichée pour ces types, ce serveur refuse donc une seconde fois la même chose.",
          rejValidatorNoParam: "Un validateur paramétré dont le paramètre est laissé vide",
          rejValidatorNoParamMsg: "Refusée, en nommant le validateur : il exige un paramètre.",
          rejValidatorExtraParam: "Un paramètre fourni pour un validateur qui n'en accepte aucun",
          rejValidatorExtraParamMsg:
            "Refusée, en nommant le validateur : il n'accepte aucun paramètre.",
          rejRequiredRestricted:
            "Marquer un champ obligatoire alors qu'un rôle ou un groupe le restreint",
          rejRequiredRestrictedMsg:
            "Refusée, en nommant le champ : il ne peut pas être rendu obligatoire tant qu'il est restreint. Retirez d'abord la restriction, ou laissez le champ facultatif.",
          rejGroupWrongType: "Un groupe de champs appartenant à un autre type d'enregistrement",
          rejGroupWrongTypeMsg:
            "Refusée : le groupe de champs sélectionné appartient à un autre type d'entité. Changer le type d'enregistrement sur le formulaire efface le choix de groupe précisément pour cette raison.",
          rejReferenceTargetUnknown:
            "Épingler une cible qui n'est pas un type d'enregistrement enregistré",
          rejReferenceTargetUnknownMsg:
            "Refusée, en nommant l'identifiant : ce n'est pas un type d'entité enregistré. Accessible uniquement en contournant la liste déroulante, qui ne propose rien de non enregistré.",
          rejReferenceTargetNotAllowed:
            "Épingler un champ User Reference à autre chose qu'un compte utilisateur",
          rejReferenceTargetNotAllowedMsg:
            "Refusée, en nommant le type de valeur et en listant ce qu'il autorise. La liste déroulante n'est pas du tout affichée pour ce type, ce serveur refuse donc ce que le formulaire a déjà refusé de proposer.",
          rejGlobalNotSuperAdmin: "Créer un champ global sans être un Super Admin de la plateforme",
          rejGlobalNotSuperAdminMsg:
            "Refusée : seul un Super Admin de la plateforme peut créer un champ personnalisé global.",
          rejQuota: "Dépasser la limite de champs de votre forfait",
          rejQuotaMsg:
            "Refusée pour quota. L'édition Free n'autorise aucun champ ; chaque autre forfait a son propre maximum par espace de travail. Les champs globaux de la plateforme ne comptent pas dans ce quota.",

          afterTitle: "Après l'enregistrement : ce qui peut encore changer",
          afterIntro:
            "Trois éléments sont définitifs, et tout le reste ne l'est pas. Mieux vaut savoir lequel est lequel avant d'enregistrer plutôt qu'après.",
          editableTitle: "Modifiable à tout moment",
          editable1: "Les deux libellés, et les deux textes indicatifs",
          editable2: "Required — sauf si un rôle ou un groupe d'utilisateurs restreint le champ",
          editable3: "Sort Order, et le Field Group",
          editable4: "Sensitivity, et Include in exports",
          editable5: "Active, qui retire le champ sans toucher à ses réponses stockées",
          editable6:
            "La liste d'options — bien que renommer une option change ce qu'affichent les enregistrements existants",
          editable7:
            "Le validateur et son paramètre — bien que cela ne revérifie jamais les réponses déjà enregistrées",
          editable8:
            "Le Target Entity Type d'un champ Entity Reference — les réponses déjà stockées continuent de fonctionner, et le prochain enregistrement d'une réponse de l'ancien type est refusé jusqu'à ce qu'elle soit choisie à nouveau",
          permanentTitle: "Définitif une fois enregistré",
          permanent1: "Le type d'enregistrement",
          permanent2: "La clé",
          permanent3: "Le type de valeur",
          permanent4: "La portée — espace de travail ou globale",
          afterOutro:
            "Il n'existe aucun chemin de migration pour aucun des quatre paramètres définitifs. Se tromper sur l'un d'eux signifie supprimer le champ et recommencer, ce qui détruit les réponses déjà enregistrées pour lui.",

          verifyTitle: "Vérifier que cela a fonctionné",
          verifyIntro: "Quatre vérifications rapides qui détectent presque toutes les erreurs.",
          verify1:
            "Ouvrez un enregistrement de ce type. La section Champs personnalisés devrait afficher votre nouveau champ, vide, avec le libellé et le texte indicatif que vous avez définis.",
          verify2:
            "Saisissez une valeur et enregistrez. L'absence d'erreur signifie que la valeur a été acceptée ; rouvrez l'enregistrement et confirmez qu'elle est toujours là.",
          verify3:
            "Videz la valeur et enregistrez à nouveau. Sur un champ facultatif, cela devrait réussir et laisser le champ véritablement vide, sans afficher l'ancienne valeur.",
          verify4:
            "Vérifiez la liste des enregistrements. Votre champ devrait aussi y être une colonne supplémentaire, montrant la réponse de chaque enregistrement d'un seul coup d'œil.",
          verifyWarnTitle: "Si le champ n'apparaît pas",
          verifyWarnContent:
            "Vérifiez d'abord le type d'enregistrement — un champ défini sur un type d'enregistrement marqué API only n'a nulle part où s'afficher. Vérifiez ensuite Active. Vérifiez enfin si un rôle ou un groupe d'utilisateurs restreint la clé du champ, car un champ restreint est entièrement omis plutôt qu'affiché vide, et ressemble exactement à un champ qui n'a jamais été défini.",
        },

        // ═══════════════════════════════════════════════════
        //  Groupes de champs
        // ═══════════════════════════════════════════════════
        groups: {
          title: "Groupes de champs",
          description:
            "Rassembler les champs personnalisés d'un type d'enregistrement sous des en-têtes que vous ordonnez à la main : créer un groupe, la clé stable définitive, l'ordonnancement, la suppression, les groupes globaux, et ce qu'un groupe n'affecte pas.",
          intro:
            "Un groupe de champs rassemble plusieurs champs personnalisés d'un même type d'enregistrement sous un en-tête, dans un ordre que vous définissez à la main. Sans groupes, les champs personnalisés apparaissent simplement selon Sort Order sous un unique en-tête Champs personnalisés ; avec eux, vous pouvez séparer les coordonnées des informations médicales et des préférences d'équipement sur le même formulaire. Les groupes se gèrent sur l'écran Groupes de champs, accessible depuis un lien dans l'en-tête de la page Champs personnalisés.",
          permInfoTitle: "Les groupes de champs ont besoin de leurs propres permissions",
          permInfoContent:
            "Toute la fonctionnalité est verrouillée par un ensemble de permissions distinct de celui des définitions de champs, y compris une permission propre pour la réorganisation. Un rôle détenant déjà toutes les permissions de champs personnalisés ne les détient pas automatiquement. Sans elles, il n'y a ni lien Manage field groups ni sélecteur Field Group sur le formulaire de définition — rien n'est cassé, la fonctionnalité n'est simplement pas accordée. Modifier un champ qui a déjà un groupe et enregistrer conserve ce groupe plutôt que de l'effacer.",

          whatTitle: "De quoi un groupe est composé",
          whatIntro:
            "Les groupes appartiennent à exactement un type d'enregistrement, donc l'écran n'affiche rien tant que vous n'en avez pas choisi un — et l'état vide le précise plutôt que de paraître cassé.",
          thPart: "Paramètre",
          thWhat: "Ce que c'est",
          thChange: "Modifiable plus tard ?",
          partEntityType: "Le type d'enregistrement dont ce groupe peut rassembler les champs.",
          partStableKey:
            "Un nom machine pour le groupe, unique au sein du type d'enregistrement. En minuscules, commence par une lettre, uniquement des lettres, des chiffres et des tirets bas.",
          partLabelEn: "L'en-tête anglais affiché au-dessus des champs du groupe.",
          partLabelAr: "L'en-tête arabe.",
          partSortOrder:
            "Où le groupe se situe par rapport aux autres groupes du type d'enregistrement.",
          partScope: "Si le groupe appartient à votre espace de travail ou à toute la plateforme.",
          changeNever: "Non — définitif une fois enregistré",
          changeAnytime: "Oui, à tout moment",

          createTitle: "Créer un groupe",
          createIntro: "Quatre étapes, sur l'écran Groupes de champs.",
          c1Title: "Choisissez le type d'enregistrement",
          c1Content:
            "Rien n'est listé avant que vous ne le fassiez. Un groupe n'est jamais valide que pour un seul type d'enregistrement, il n'existe donc aucune vue tous-types-confondus pour démarrer.",
          c2Title: "Donnez-lui une clé stable",
          c2Content:
            "Le formulaire en exige une. Elle se met en minuscules au fur et à mesure de la saisie et refuse les caractères hors grammaire. Choisissez avec soin — celle-ci est définitive.",
          c3Title: "Donnez-lui des libellés et un ordre",
          c3Content:
            "Un en-tête anglais, un en-tête arabe, et un nombre déterminant où le groupe se situe parmi les autres groupes du type d'enregistrement.",
          c4Title: "Enregistrez, puis assignez-lui des champs",
          c4Content:
            "Le groupe apparaît dans la liste. Ouvrez n'importe quelle définition de champ personnalisé pour le même type d'enregistrement, et un sélecteur Field Group le propose désormais, aux côtés d'une entrée no group.",

          stableKeyTitle: "La clé stable",
          stableKeyIntro:
            "La clé stable est le nom machine du groupe. Elle suit la même grammaire qu'une clé de champ — minuscules, commence par une lettre, lettres, chiffres et tirets bas — et elle doit être unique parmi les groupes de ce type d'enregistrement.",
          thKeyExample: "Clé stable",
          thOutcome: "Ce qui se passe",
          skOk: "Acceptée.",
          skLowercased:
            "Acceptée, et mise en minuscules au fur et à mesure de la saisie. Vous la verrez devenir contact_details.",
          skHyphen:
            "Refusée au fur et à mesure de la saisie. Le champ rejette les caractères hors grammaire.",
          skLeadingDigit: "Refusée. Une clé stable doit commencer par une lettre.",
          skDuplicate:
            "Refusée, en nommant la clé : un groupe de champs avec cette clé existe déjà pour ce type d'enregistrement.",
          exSkDuplicate:
            "Une clé déjà utilisée par un autre groupe sur le même type d'enregistrement",
          stableKeyWhy:
            "Une fois le groupe enregistré, la clé stable est visible mais grisée et ne peut être modifiée par personne. C'est délibéré plutôt qu'un oubli : le schéma exporté nomme un groupe par cette clé, donc la renommer transformerait silencieusement une future réimportation d'une mise à jour en une création, contre un ensemble déjà livré. Pouvoir voir la clé compte tout de même — vous en avez besoin pour faire correspondre un ensemble exporté au groupe auquel il se réfère — ce qui explique pourquoi elle est affichée plutôt que masquée.",
          stableKeyWarnTitle: "Il n'existe aucun renommage",
          stableKeyWarnContent:
            "Si une clé stable est incorrecte, le groupe doit être supprimé et recréé, et chaque champ qui lui était assigné doit être réassigné. Ne vous attendez pas à voir apparaître un bouton de modification — son absence est voulue.",

          assignTitle: "Assigner un champ à un groupe",
          assignIntro:
            "L'assignation se fait sur le champ, pas sur le groupe. Il n'existe aucun écran permettant de glisser des champs dans un groupe.",
          assign1:
            "Ouvrez une définition de champ personnalisé pour le même type d'enregistrement. Un sélecteur Field Group propose chaque groupe de ce type d'enregistrement, plus une entrée no group.",
          assign2:
            "Choisir no group est le seul moyen de retirer un champ d'un groupe. Il n'existe aucun autre contrôle de désassignation ailleurs.",
          assign3:
            "Changer le type d'enregistrement sur un formulaire de création efface tout groupe déjà choisi, car un groupe d'un type d'enregistrement n'est jamais valide pour un autre.",
          assign4:
            "Un champ ne peut appartenir qu'à un seul groupe au maximum. Il n'existe aucun moyen d'afficher un même champ sous deux en-têtes.",

          orderTitle: "Ordonner les groupes",
          orderIntro:
            "Les groupes s'ordonnent sur l'écran Groupes de champs, en faisant glisser une ligne ou en utilisant ses boutons Move up et Move down. Les deux font la même chose et les deux sont conservés.",
          orderKeyboard:
            "Les boutons ne sont pas un simple confort. Un utilisateur au clavier seul n'a aucun geste de glisser-déposer, les boutons constituent donc le chemin accessible et sont censés fonctionner à l'identique — si une ligne se déplace par glisser-déposer mais pas par bouton, c'est un défaut.",
          orderLimitTitle: "La réorganisation cesse de fonctionner au-delà de 100 groupes",
          orderLimitContent:
            "Une requête de réorganisation transporte tout l'ensemble réorganisable d'un coup, et plus de 100 groupes pour un même type d'enregistrement est purement refusé. Au-delà de ce seuil, aucun groupe de ce type d'enregistrement ne peut plus être déplacé. L'écran le signale plutôt que d'échouer de façon générique, mais le plafond est réel et n'est pas configurable.",
          orderGlobalTitle:
            "Vous ne pouvez pas positionner votre groupe par rapport à un groupe global",
          orderGlobalContent:
            "La réorganisation est tout ou rien et refuse tout groupe que l'appelant ne possède pas, donc la réorganisation d'un espace de travail ne couvre que ses propres groupes, qui sont ensuite renumérotés à partir de zéro. Ces numéros peuvent entrer en collision avec le propre ordre d'un groupe global, et l'égalité se départage sur le libellé anglais. L'effet visible est que déplacer votre groupe tout en haut peut le faire atterrir en dessous d'un groupe global et donner l'impression que rien ne s'est passé.",

          deleteTitle: "Supprimer un groupe",
          deleteIntro:
            "Supprimer un groupe ne supprime jamais de champs. La confirmation le précise explicitement, et par la suite les champs existent toujours et sont simplement dégroupés, réapparaissant sous l'en-tête par défaut Champs personnalisés.",
          deleteEditing:
            "Un cas particulier à connaître : si vous commencez à modifier un groupe puis supprimez ce même groupe depuis sa ligne pendant que le panneau de modification est encore ouvert, le panneau se ferme et aucun nouveau groupe n'est créé. Enregistrer à ce moment-là ne ressuscite pas le groupe sous une nouvelle identité.",

          globalTitle: "Groupes globaux",
          globalIntro:
            "Un administrateur de la plateforme sans espace de travail sélectionné crée un groupe global, et un avis sur l'écran l'explique. L'interrupteur de portée apparaît à la création et jamais à la modification, car la portée d'un groupe est définitive de la même façon que celle d'un champ.",
          globalTenantView:
            "À l'intérieur d'un espace de travail, un groupe global affiche un badge Global et n'offre aucun contrôle de modification, de suppression ou de déplacement. Ce n'est pas l'interface qui masque quelque chose arbitrairement — le serveur refuserait ces opérations, les contrôles ne sont donc pas proposés.",

          effectTitle: "Ce qu'un groupe affecte, et ce qu'il n'affecte pas",
          doesTitle: "Un groupe fait cela",
          does1:
            "Rassembler des champs liés sous un même en-tête sur le formulaire d'enregistrement",
          does2:
            "Vous laisser ordonner les groupes à la main, par glisser-déposer ou avec Move up et Move down",
          does3: "Porter son propre en-tête anglais et arabe, traduit comme tout le reste",
          does4:
            "Survivre à la suppression d'un champ, et laisser un champ le quitter via l'entrée no group",
          doesNotTitle: "Un groupe ne fait pas cela",
          doesNot1:
            "Contrôler qui peut voir un champ — cela relève de la sécurité au niveau du champ, qui est sans rapport",
          doesNot2: "Supprimer ses champs quand le groupe lui-même est supprimé",
          doesNot3:
            "Se propager entre types d'enregistrement, ni s'appliquer à plus d'un type d'enregistrement à la fois",
          doesNot4: "Changer la façon dont une valeur est validée, stockée, exportée ou affichée",

          errorsTitle: "Erreurs de groupe que vous pourriez voir",
          thSituation: "Situation",
          thWhatYouSee: "Ce que vous voyez",
          errDuplicateKey: "Une clé stable déjà utilisée sur ce type d'enregistrement",
          errDuplicateKeyMsg:
            "Refusée, en nommant la clé : un groupe de champs avec cette clé existe déjà pour ce type d'entité.",
          errWrongEntityType: "Assigner un champ à un groupe d'un autre type d'enregistrement",
          errWrongEntityTypeMsg:
            "Refusée : le groupe de champs sélectionné appartient à un autre type d'entité.",
          errTooManyReorder: "Réorganiser plus de 100 groupes en une fois",
          errTooManyReorderMsg:
            "Refusée, en nommant le maximum : au-delà de ce nombre de groupes, aucune réorganisation n'est possible en une seule requête.",
          errDuplicateReorder: "Le même groupe listé deux fois dans une réorganisation",
          errDuplicateReorderMsg:
            "Refusée : le même groupe de champs apparaît plus d'une fois dans la liste de réorganisation.",
          errMixedReorder:
            "Des groupes de deux types d'enregistrement dans une même réorganisation",
          errMixedReorderMsg:
            "Refusée : tous les groupes de champs d'une même requête de réorganisation doivent appartenir au même type d'entité.",
          errGlobalNotSuperAdmin:
            "Créer un groupe global sans être un Super Admin de la plateforme",
          errGlobalNotSuperAdminMsg:
            "Refusée : seul un Super Admin de la plateforme peut créer un groupe de champs global.",
          errNoDefinition:
            "Assigner un groupe à un champ n'ayant pas encore d'enregistrement de définition",
          errNoDefinitionMsg:
            "Refusée, en expliquant que le champ n'a pas d'enregistrement de définition et que le rétro-remplissage des définitions doit d'abord être exécuté. Cela ne se produit que dans un environnement mis à niveau depuis une version plus ancienne.",
        },

        // ═══════════════════════════════════════════════════
        //  Options
        // ═══════════════════════════════════════════════════
        options: {
          title: "Options",
          description:
            "Rédiger les réponses autorisées pour les champs Select et MultiSelect : l'éditeur d'options bilingue, comment une valeur soumise est comparée, et ce que fait l'ajout, le renommage ou la suppression d'une option aux enregistrements déjà existants.",
          intro:
            "Un champ Select ou MultiSelect porte sa propre liste de réponses autorisées. La liste appartient au champ — il n'existe aucune liste partagée réutilisée entre plusieurs champs — et elle se rédige sur le formulaire de définition, dans la boîte Options qui apparaît dès que vous choisissez l'un de ces deux types de valeur. Les deux types utilisent exactement la même liste et le même éditeur ; la seule différence est qu'une réponse MultiSelect peut contenir plusieurs entrées de cette liste à la fois.",
          storedInfoTitle: "Le texte anglais de l'option est la réponse stockée",
          storedInfoContent:
            "Il n'existe aucun code caché séparé derrière une option. Le libellé anglais que vous saisissez est littéralement ce qui s'écrit sur chaque enregistrement qui le choisit, et c'est ce à quoi le produit compare une valeur soumise. Le libellé arabe n'est là que pour l'affichage. Ce seul fait explique tout le comportement de cette page.",

          editorTitle: "L'éditeur d'options",
          editorIntro:
            "Les options se modifient comme une liste de lignes plutôt que comme du texte libre. Chaque ligne est une option.",
          editor1: "Add option ajoute une ligne à la fin de la liste.",
          editor2: "Chaque ligne comporte un libellé anglais et un libellé arabe.",
          editor3: "Remove option supprime une ligne.",
          editor4:
            "L'ordre des lignes est l'ordre dans lequel les options sont proposées sur le formulaire d'enregistrement, de haut en bas.",
          editor5:
            "Une liste vide affiche une invite à ajouter la première option — un champ Select sans options ne peut pas être enregistré.",
          editorBilingual:
            "Les deux libellés sont stockés comme deux listes parallèles, associées ligne par ligne. Un lecteur arabophone voit le libellé arabe ; la réponse écrite sur l'enregistrement est de toute façon celle en anglais. Laisser un libellé arabe vide est autorisé, et cette option affiche alors son libellé anglais à tout le monde.",

          exampleTitle: "Un exemple concret",
          exampleIntro:
            "Un champ taille de maillot sur un type Select, avec trois options. La colonne de droite est ce qui atterrit réellement sur un enregistrement.",
          thEnglish: "Libellé anglais",
          thArabic: "Libellé arabe",
          thStored: "Stocké sur l'enregistrement",
          exampleOutro:
            "Un utilisateur arabophone qui choisit متوسط stocke Medium, exactement comme le fait un utilisateur anglophone qui choisit Medium. Les deux voient leur propre langue à l'entrée comme à la sortie ; la donnée sous-jacente est une valeur unique et cohérente.",

          matchTitle: "Comment une valeur soumise est comparée",
          matchIntro:
            "La valeur soumise est épurée de ses espaces, puis comparée exactement aux libellés anglais. La comparaison est sensible à la casse. En reprenant les trois options ci-dessus :",
          thSubmitted: "Valeur soumise",
          thOutcome: "Ce qui se passe",
          matchOk: "Acceptée, et stockée comme Medium.",
          matchTrimmed:
            "Acceptée. Les deux côtés sont épurés de leurs espaces avant comparaison, donc des espaces superflus ne provoquent jamais un rejet inattendu.",
          matchCase:
            "Refusée : VALIDATION_INVALID_FORMAT. La casse compte — ce qui signifie aussi que Medium et medium peuvent légitimement coexister comme deux options distinctes si vous le souhaitez vraiment.",
          matchArabic:
            "Refusée si soumise directement à l'API : seuls les libellés anglais sont comparés. Choisir متوسط dans l'interface fonctionne normalement, car l'interface soumet le libellé anglais qui se cache derrière.",
          matchUnknown:
            "Refusée : VALIDATION_INVALID_FORMAT, avec un message citant à la fois la valeur rejetée et la clé du champ.",
          matchBlank:
            "Traitée comme vide : stockée comme effacée sur un champ facultatif, refusée avec VALIDATION_REQUIRED sur un champ obligatoire.",
          exPadded: "« Medium » précédé d'une espace",
          exBlank: "Une valeur vide",

          multiTitle: "Particularités de MultiSelect",
          multiIntro:
            "MultiSelect réutilise cette même liste et ce même éditeur. Ce qui diffère, c'est la valeur : plusieurs réponses à la fois, dans l'ordre où elles ont été choisies, jusqu'à un plafond strict de 19.",
          multiOrder:
            "Acceptée, et relue comme Blue puis Red — l'ordre de sélection, pas l'ordre dans lequel les options étaient listées.",
          multiRemove:
            "Acceptée. Retirer une sélection laisse les autres dans leur ordre relatif existant.",
          multiTooMany:
            "Refusée : VALIDATION_MAX_LENGTH, en nommant le plafond de 19. Le sélecteur rend impossible le choix de toute option non sélectionnée une fois 19 atteintes, et affiche un compteur en direct « N sur 19 sélectionnées », de sorte que ce cas est normalement inatteignable depuis l'interface.",
          multiDuplicate:
            "Refusée : VALIDATION_UNIQUE. Une sélection répétée est rejetée, pas fusionnée.",
          multiEmpty:
            "Traitée comme vide, exactement comme l'est une valeur scalaire vide pour tout autre type : effacée sur un champ facultatif, refusée sur un champ obligatoire.",
          exMultiOrder:
            "Blue, puis Red — sur un champ dont la liste d'options place Red avant Blue",
          exMultiRemove: "Retirer une sélection parmi trois",
          exMultiTwenty: "Une vingtième sélection",
          exMultiRepeat: "La même option sélectionnée deux fois",
          exMultiEmptyList: "Une liste explicitement vide",
          multiOrderWarnTitle: "L'ordre de sélection n'est pas l'ordre des options",
          multiOrderWarnContent:
            "Comme une réponse MultiSelect conserve l'ordre dans lequel elle a été choisie, une colonne de liste affichant cette réponse ne se lit pas nécessairement dans l'ordre où vous avez rédigé les options. C'est ce qui permet à l'ordre de survivre fidèlement à l'aller-retour, mais cela surprend la plupart des gens la première fois qu'ils le remarquent.",

          changingTitle: "Modifier la liste plus tard",
          changingIntro:
            "La liste d'options est modifiable à tout moment. Comme le texte de l'option est la réponse stockée, certaines modifications rejaillissent sur les enregistrements déjà existants, et d'autres non.",
          thChange: "Modification",
          thEffect: "Effet sur les enregistrements déjà existants",
          chgAdd: "Ajouter une nouvelle option",
          chgAddEffect:
            "Aucun. Les réponses existantes ne sont pas touchées ; la nouvelle option devient simplement disponible.",
          chgRename: "Renommer un libellé anglais",
          chgRenameEffect:
            "Chaque enregistrement contenant déjà l'ancien texte affiche désormais le nouveau texte. Rien n'est migré et rien n'est perdu, car c'est la ligne d'option que cible l'enregistrement — mais la réponse que voient les gens a changé sous leurs yeux.",
          chgRemove: "Supprimer une option",
          chgRemoveEffect:
            "Les enregistrements qui la détiennent déjà conservent leur réponse stockée et continuent de l'afficher. L'option n'est plus proposée à personne de nouveau, et la prochaine fois que quelqu'un modifie l'un de ces enregistrements, il devra choisir une autre réponse pour l'enregistrer.",
          chgReorder: "Réordonner les lignes",
          chgReorderEffect:
            "Change l'ordre dans lequel les options sont proposées. Cela ne change aucune réponse stockée, et cela ne réordonne pas une réponse MultiSelect existante, qui conserve l'ordre dans lequel elle a été choisie.",
          chgArabicOnly: "Changer uniquement un libellé arabe",
          chgArabicOnlyEffect:
            "Affichage uniquement. La réponse stockée est le libellé anglais, donc rien ne change dans la donnée.",
          renameWarnTitle: "Renommez avec précaution, et préférez ajouter",
          renameWarnContent:
            "Renommer une option est la seule modification qui réécrit silencieusement l'apparence de l'historique : un enregistrement ayant répondu « Medium » l'année dernière se lira comme ce en quoi vous avez renommé Medium. Si la distinction compte pour vous, ajoutez une nouvelle option et cessez de proposer l'ancienne plutôt que de la renommer.",

          errorsTitle: "Erreurs d'option que vous pourriez voir",
          thSituation: "Situation",
          thWhatYouSee: "Ce que vous voyez",
          errNoOptions: "Enregistrer un champ Select ou MultiSelect avec une liste vide",
          errNoOptionsMsg: "Refusée : des options sont requises pour les champs Select.",
          errOptionsOnOther: "Des options fournies sur un type qui ne les accepte pas",
          errOptionsOnOtherMsg:
            "Refusée : les options ne sont autorisées que pour les champs Select.",
          errNotAllowed: "Une valeur qui n'est pas l'une des options",
          errNotAllowedMsg:
            "Refusée : VALIDATION_INVALID_FORMAT, citant la valeur et la clé du champ.",
          errTooMany: "Plus de 19 sélections MultiSelect",
          errTooManyMsg: "Refusée : VALIDATION_MAX_LENGTH, en nommant le plafond de 19.",
          errDuplicate: "La même option MultiSelect deux fois dans un même enregistrement",
          errDuplicateMsg: "Refusée : VALIDATION_UNIQUE, citant la valeur répétée.",

          notYetTitle: "Ce que la liste d'options ne fait pas",
          notYetIntro:
            "Trois choses que l'on demande raisonnablement, et quelle est la réponse aujourd'hui.",
          notYet1:
            "La liste intégrée propre à ce champ ne peut pas elle-même être réutilisée par un autre champ — les options de chaque champ lui sont propres, rédigées ici. Une liste de pays dont ont besoin trois champs n'a toutefois plus besoin d'être écrite trois fois : liez plutôt les trois à un Option Set partagé et versionné (voir Jeux d'options) et modifiez-le une seule fois.",
          notYet2:
            "Il n'existe aucune couleur, icône ou code par option que vous puissiez définir. Le libellé est toute l'option, en ce qui concerne le formulaire de définition.",
          notYet3:
            "Il n'existe aucun plafond sur le nombre d'options qu'une liste peut contenir, mais une réponse MultiSelect ne peut toujours pas en sélectionner plus de 19.",
        },

        // ═══════════════════════════════════════════════════
        //  Validateurs
        // ═══════════════════════════════════════════════════
        validators: {
          title: "Validateurs",
          description:
            "Les 13 vérifications de format intégrées pour les champs Text, avec des exemples de saisie acceptés et rejetés, les six qui nécessitent un paramètre, les sept pays de code postal pris en charge, et chaque refus que vous pouvez rencontrer.",
          intro:
            "Un validateur est une vérification de format supplémentaire et facultative que vous attachez à un champ Text à la définition, afin qu'une valeur de mauvaise forme soit refusée dès que quelqu'un tente de l'enregistrer, plutôt que de devenir silencieusement une donnée corrompue qui ne se révèle que des mois plus tard. Vous choisissez l'une des 13 vérifications intégrées dans une liste déroulante, et sept d'entre elles ne nécessitent aucun autre paramètre.",
          textOnlyTitle: "Les validateurs sont réservés à Text",
          textOnlyContent:
            "Un validateur ne peut être attaché qu'à un champ Text. Ni Number, ni Date, ni Select, ni Email, ni Url, ni Phone, ni LongText, ni aucun des autres — la liste déroulante Validator n'est même pas affichée pour eux, et le serveur refuse à nouveau la même chose si une requête contourne le formulaire. Si vous avez besoin d'une adresse e-mail avec des contraintes supplémentaires, la réponse aujourd'hui est un champ Text avec un validateur plutôt qu'un champ Email.",

          whyClosedTitle: "Pourquoi il n'existe aucune zone de motif",
          whyClosedIntro:
            "Il n'existe délibérément aucune saisie de texte libre ni d'expression régulière nulle part dans le produit. Un motif écrit à la main peut être conçu pour consommer un temps de traitement énorme sur une saisie courte, ce qui transforme un formulaire de saisie en moyen de mettre le système à genoux. L'ensemble des vérifications est donc fixé et sélectionné à l'avance, et chacune porte son propre plafond de longueur court et sa propre limite de temps.",

          howTitle: "Comment un validateur s'exécute",
          howIntro:
            "Quatre choses se produisent dans cet ordre, chaque fois qu'une valeur est enregistrée dans le champ.",
          how1: "Si la valeur est vide ou composée uniquement d'espaces, elle est traitée comme vide et aucun validateur ne s'exécute du tout.",
          how2: "Le plafond global de 4 000 caractères de Text s'applique, et refuse avec VALIDATION_MAX_LENGTH si la valeur est plus longue.",
          how3: "Le propre plafond de longueur du validateur, bien plus court, s'applique ensuite — 11 caractères pour un code SWIFT, 15 pour un IMEI, et ainsi de suite — et refuse aussi avec VALIDATION_MAX_LENGTH.",
          how4: "C'est seulement alors que s'exécute la véritable vérification du validateur, qui refuse avec son propre code et son propre message.",
          howTwoPoints:
            "La vérification s'applique en deux points distincts, et il vaut la peine de savoir que les deux existent. À la définition, une combinaison invalide de validateur et de paramètre est refusée quand vous enregistrez la définition. À l'enregistrement de la valeur, le validateur s'exécute à nouveau contre chaque valeur que quelqu'un enregistre dans le champ.",

          fixedTitle: "Les sept vérifications sans paramètre",
          fixedIntro:
            "Celles-ci vérifient un format externe précis et ne prennent jamais de paramètre — en fournir un est lui-même refusé. Trois d'entre elles vérifient un véritable chiffre de contrôle, ce qui signifie qu'un seul chiffre mal saisi est détecté, et pas seulement une mauvaise longueur.",
          thValidator: "Validateur",
          thShape: "Forme",
          thMaxLength: "Longueur max.",
          thChecksum: "Chiffre de contrôle",
          shapeIban: "Deux lettres, deux chiffres, puis 11 à 30 lettres ou chiffres",
          shapeImei: "Exactement 15 chiffres",
          shapeSwift: "Six lettres, deux lettres ou chiffres, éventuellement trois de plus",
          shapePlate:
            "2 à 15 lettres, chiffres, espaces ou traits d'union, quelle que soit la casse",
          shapeEgypt:
            "14 chiffres : marqueur de siècle, puis une date AAMMJJ plausible, puis sept chiffres de plus",
          shapeSaudi: "10 chiffres commençant par 1 ou 2",
          shapeEmirati:
            "784, quatre chiffres, sept chiffres, un chiffre — traits d'union facultatifs",
          checksumReal: "Oui — vérifié",
          checksumNone: "Aucun dans la norme",
          checksumUnpublished: "Non vérifié — aucun publié",
          thExample: "Exemple de saisie",
          thOutcome: "Ce qui se passe",

          ibanTitle: "IBAN",
          ibanFor:
            "Pour un numéro de compte bancaire international. À utiliser partout où un chiffre erroné enverrait de l'argent au mauvais endroit.",
          ibanChecks:
            "La forme est vérifiée en premier, puis les véritables chiffres de contrôle ISO sont vérifiés. Plafonné à 34 caractères — aucun IBAN réel n'est plus long. La valeur est comparée exactement telle que soumise : elle n'est pas mise en majuscules et les espaces n'en sont pas retirés pour vous.",
          ibanOk: "Acceptée. La forme et les chiffres de contrôle sont tous deux corrects.",
          ibanBadCheck:
            "Refusée : VALIDATION_INVALID_FORMAT. La forme est parfaitement valide et seul le chiffre de contrôle est erroné — exactement le genre d'erreur qu'une vérification de forme seule manquerait.",
          ibanLower: "Refusée. Les lettres doivent être en majuscules.",
          ibanSpaces:
            "Refusée. Les IBAN sont souvent imprimés en groupes de quatre pour la lisibilité, mais la forme stockée ne contient aucune espace.",

          imeiTitle: "IMEI",
          imeiFor:
            "Pour le numéro d'identité d'un appareil mobile, tel qu'imprimé sur l'appareil ou sa boîte.",
          imeiChecks:
            "Exactement 15 chiffres, puis le véritable chiffre de contrôle est vérifié. Plafonné à 15 caractères. Les variantes d'affichage à 16 et 17 caractères que montrent certains appareils ne sont pas acceptées.",
          imeiOk: "Acceptée.",
          imeiBadCheck:
            "Refusée : VALIDATION_INVALID_FORMAT. Quinze chiffres, bonne forme, dernier chiffre erroné.",
          imeiShort:
            "Refusée : VALIDATION_INVALID_FORMAT. Quatorze chiffres échouent à la vérification de forme — le plafond de longueur ne détecte jamais qu'une valeur plus longue que 15.",

          swiftBicTitle: "Code SWIFT / BIC",
          swiftBicFor:
            "Pour un code d'identification bancaire, utilisé aux côtés d'un numéro de compte pour un virement international.",
          swiftBicChecks:
            "Huit ou onze caractères : six lettres, puis deux lettres ou chiffres, puis éventuellement trois lettres ou chiffres de plus. Majuscules uniquement, aucun séparateur, plafonné à 11 caractères. Il n'existe aucun chiffre de contrôle dans la norme, donc un code bien formé n'appartenant à aucune banque réelle est accepté.",
          swiftOk8: "Acceptée — la forme à huit caractères.",
          swiftOk11: "Acceptée — la forme à onze caractères avec un code d'agence.",
          swiftDigit:
            "Refusée : VALIDATION_INVALID_FORMAT. Les six premiers caractères doivent tous être des lettres.",
          swiftLower:
            "Refusée. C'est un format externe fixe, et les minuscules n'en font pas partie.",
          swiftLength:
            "Refusée. Huit ou onze caractères exactement — neuf n'est ni l'un ni l'autre.",

          plateTitle: "Numéro de plaque d'immatriculation",
          plateFor:
            "Pour une plaque d'immatriculation de véhicule, quand vous voulez détecter une absurdité évidente sans vous engager sur le format d'un pays en particulier.",
          plateChecks:
            "2 à 15 caractères, composés de lettres, de chiffres, d'espaces et de traits d'union dans n'importe quelle combinaison. Insensible à la casse. Délibérément permissif — cette vérification ne contient aucun format de plaque propre à un pays, car les formats de plaque varient selon le pays et selon la catégorie de véhicule au sein d'un même pays.",
          plateOk: "Acceptée.",
          plateLowerOk:
            "Acceptée. Contrairement à SWIFT, cette vérification ne se soucie pas de la casse.",
          plateTooShort: "Refusée : VALIDATION_INVALID_FORMAT. Le minimum est de deux caractères.",
          plateBadChar:
            "Refusée. Une barre oblique ne fait pas partie des quatre classes de caractères autorisées.",

          egyptIdTitle: "Numéro national égyptien",
          egyptIdFor: "Pour un numéro d'identité nationale égyptien.",
          egyptIdChecks:
            "Quatorze chiffres : un marqueur de siècle valant 2 ou 3, puis une date de naissance au format AAMMJJ qui doit être plausible sur le calendrier, puis sept chiffres de plus. Structure uniquement — l'Égypte n'a jamais publié d'algorithme de chiffre de contrôle, donc le dernier chiffre n'est pas vérifié. Livrer un algorithme deviné rejetterait de véritables identités valides, ce qui est pire que de ne pas vérifier du tout.",
          egyptOk: "Acceptée.",
          egyptBadMonth:
            "Refusée : VALIDATION_INVALID_FORMAT. Le mois 13 n'est pas un mois plausible.",
          egyptBadDay: "Refusée. Le jour 32 n'est pas un jour plausible.",
          egyptBadCentury: "Refusée. Le marqueur de siècle doit valoir 2 ou 3.",
          egyptLength: "Refusée. Treize chiffres, ce n'est pas quatorze.",

          saudiIdTitle: "Numéro d'identité saoudien",
          saudiIdFor:
            "Pour un numéro d'identité nationale saoudien ou un numéro d'Iqama (résidence).",
          saudiIdChecks:
            "Dix chiffres, le premier valant 1 pour un citoyen ou 2 pour un résident, et le véritable chiffre de contrôle est vérifié. Plafonné à 10 caractères.",
          saudiOk: "Acceptée. La forme et le chiffre de contrôle sont tous deux corrects.",
          saudiBadCheck:
            "Refusée : VALIDATION_INVALID_FORMAT. Bonne forme, chiffre de contrôle erroné.",
          saudiBadPrefix: "Refusée. Le premier chiffre doit valoir 1 ou 2.",
          saudiLength: "Refusée. Neuf chiffres, ce n'est pas dix.",

          emiratiIdTitle: "Identité émiratie (EAU)",
          emiratiIdFor: "Pour un numéro d'identité des Émirats.",
          emiratiIdChecks:
            "La forme 784-AAAA-XXXXXXX-C, avec les traits d'union facultatifs. Plafonné à 18 caractères. Structure uniquement — les Émirats arabes unis n'ont jamais publié d'algorithme de chiffre de contrôle, donc le dernier chiffre n'est pas vérifié, pour la même raison que la vérification égyptienne.",
          emiratiOk: "Acceptée, traits d'union compris.",
          emiratiNoHyphens:
            "Acceptée. Les traits d'union sont facultatifs, donc les deux formes d'écriture fonctionnent.",
          emiratiBadPrefix:
            "Refusée : VALIDATION_INVALID_FORMAT. Chaque identité des Émirats commence par 784.",
          emiratiLength: "Refusée. Le bloc du milieu compte sept chiffres, pas six.",

          paramTitle: "Les six vérifications qui nécessitent un paramètre",
          paramIntro:
            "Celles-ci exigent un Validator Parameter, et le laisser vide est refusé dès la définition — tout comme en fournir un pour un validateur qui n'en accepte aucun. Le contrôle Validator Parameter apparaît dès que vous choisissez l'un de ces six validateurs.",
          thParamFormat: "Format du paramètre",
          thParamExample: "Exemple de paramètre",
          paramFmtPostal: "Un pays, choisi dans une liste déroulante des sept pris en charge",
          paramFmtNumeric:
            "Deux bornes séparées par une virgule ; chaque côté peut être vide pour une extrémité ouverte",
          paramFmtLength:
            "Deux nombres de caractères séparés par une virgule ; chaque côté peut être vide",
          paramFmtOneOf: "Une valeur autorisée par ligne",
          paramFmtContains: "N'importe quel texte littéral",
          paramFmtStartsWith: "N'importe quel texte littéral",
          paramExOneOf: "Goalkeeper / Defender / Midfielder / Forward, un par ligne",

          postalTitle: "Code postal",
          postalFor:
            "Pour un code postal d'un pays précis. Le pays fait partie de la définition, ce n'est pas quelque chose que choisit la personne qui remplit l'enregistrement.",
          postalChecks:
            "La valeur est comparée au véritable format de code postal du pays que vous avez configuré. Plafonné à 16 caractères. Sept pays sont pris en charge et la liste déroulante n'en propose jamais d'autres.",
          postalEgOk: "Acceptée. L'Égypte utilise cinq chiffres.",
          postalEgBad: "Refusée : VALIDATION_INVALID_FORMAT. Quatre chiffres, ce n'est pas cinq.",
          postalUsOk: "Acceptée. Les formes à cinq chiffres et ZIP+4 sont toutes deux valides.",
          postalGbOk:
            "Acceptée. Le format britannique est comparé quelle que soit la casse, avec ou sans son espace.",
          postalCaOk:
            "Acceptée, y compris les véritables exclusions de lettres qu'applique Postes Canada.",
          exPostalEg: "11511, avec le paramètre EG",
          exPostalEgBad: "1151, avec le paramètre EG",
          exPostalUsPlus4: "90210-1234, avec le paramètre US",
          exPostalGb: "SW1A 1AA, avec le paramètre GB",
          exPostalCa: "K1A 0B1, avec le paramètre CA",

          numericRangeTitle: "Plage numérique",
          numericRangeFor:
            "Pour un nombre à l'intérieur de bornes que vous définissez, sur un champ Text plutôt que Number — un numéro de maillot, une taille d'effectif, un nombre de maillots.",
          numericRangeChecks:
            "La valeur doit s'analyser comme un nombre et se situer à l'intérieur de la plage. Le paramètre est deux bornes séparées par une virgule ; laisser un côté vide rend cette extrémité ouverte, mais laisser les deux vides est refusé, car une plage qui accepte tout revient au même qu'attacher aucun validateur.",
          numericOk: "Acceptée.",
          numericOut: "Refusée : VALIDATION_RANGE.",
          numericNotANumber:
            "Refusée : VALIDATION_RANGE. Une valeur qui n'est pas un nombre ne peut pas se situer à l'intérieur d'une plage.",
          numericOpenOk:
            "Acceptée. Une borne supérieure ouverte signifie n'importe quel nombre égal ou supérieur à la borne inférieure.",
          numericBothBlank:
            "Refusée à la définition, en expliquant que le validateur a besoin d'au moins une borne.",
          exNumeric50: "50, avec le paramètre 1,100",
          exNumeric150: "150, avec le paramètre 1,100",
          exNumericText: '"fifty", avec le paramètre 1,100',
          exNumericOpen: "5000, avec le paramètre 1,",
          exNumericBothBlank: "Le paramètre , avec les deux côtés vides",

          lengthRangeTitle: "Plage de longueur",
          lengthRangeFor:
            "Pour un texte devant avoir une certaine longueur — un code à deux lettres, une référence d'au moins huit caractères.",
          lengthRangeChecks:
            "Le nombre de caractères doit se situer à l'intérieur de la plage. Le paramètre est deux nombres de caractères séparés par une virgule, et chaque côté peut être laissé vide pour une extrémité ouverte. Cette vérification produit deux codes distincts plutôt qu'un seul, afin de distinguer trop court de trop long.",
          lengthOk: "Acceptée.",
          lengthTooShort: "Refusée : VALIDATION_MIN_LENGTH, en nommant le minimum.",
          lengthTooLong: "Refusée : VALIDATION_MAX_LENGTH, en nommant le maximum.",
          exLength10: "« Alexandria » — 10 caractères, avec le paramètre 2,50",
          exLength1: "« A » — 1 caractère, avec le paramètre 2,50",
          exLength80: "Une valeur de 80 caractères, avec le paramètre 2,50",

          oneOfListTitle: "Une valeur d'une liste",
          oneOfListFor:
            "Pour un ensemble fermé de réponses sur un champ Text. Si l'ensemble fermé est tout l'enjeu du champ, un champ Select est généralement le meilleur choix — mais celui-ci existe pour le cas où vous voulez le comportement d'un validateur sur un champ Text.",
          oneOfListChecks:
            "La valeur doit correspondre exactement à l'une des lignes de la liste que vous avez configurée, une valeur par ligne. La comparaison est sensible à la casse.",
          oneOfOk: "Acceptée.",
          oneOfCase: "Refusée : VALIDATION_INVALID_FORMAT. La comparaison est sensible à la casse.",
          oneOfUnknown:
            "Refusée : VALIDATION_INVALID_FORMAT. La valeur ne figure pas dans la liste.",

          containsTitle: "Contient un texte",
          containsFor:
            "Pour une valeur devant inclure un marqueur quelque part en son sein — un préfixe de club, une étiquette de saison, un code de département.",
          containsChecks:
            "La valeur doit contenir le texte littéral que vous avez configuré, comparé de façon sensible à la casse.",
          containsOk: "Acceptée, avec le paramètre FC-.",
          containsCase: "Refusée : VALIDATION_INVALID_FORMAT. La comparaison respecte la casse.",
          containsMissing: "Refusée : VALIDATION_INVALID_FORMAT. Le marqueur est absent.",

          startsWithTitle: "Commence par un texte",
          startsWithFor:
            "Pour une valeur devant commencer par un préfixe — un indicatif de pays, un code d'agence, un radical de référence fixe.",
          startsWithChecks:
            "La valeur doit commencer par le texte littéral que vous avez configuré, comparé de façon sensible à la casse.",
          startsOk: "Acceptée, avec le paramètre EG-.",
          startsWrongPlace:
            "Refusée : VALIDATION_INVALID_FORMAT. Le texte est présent mais pas au début — utilisez Contains Text si la position n'a pas d'importance.",
          startsCase: "Refusée : VALIDATION_INVALID_FORMAT. La comparaison respecte la casse.",

          postalCountriesTitle: "Les sept pays de Postal Code",
          postalCountriesIntro:
            "Postal Code fournit des formats réels et documentés pour exactement sept pays, et le paramètre est une liste déroulante plutôt que du texte libre, donc aucun autre pays ne peut être choisi depuis le formulaire.",
          thCountry: "Pays",
          thFormat: "Format",
          thValidExample: "Exemple valide",
          fmtEg: "Exactement cinq chiffres",
          fmtSa:
            "Cinq chiffres, éventuellement un trait d'union et une extension de quatre chiffres",
          fmtUs:
            "Un ZIP à cinq chiffres, éventuellement un trait d'union et une extension de quatre chiffres",
          fmtGb:
            "La forme standard du code postal britannique, quelle que soit la casse, espace facultatif",
          fmtDe: "Exactement cinq chiffres, zéro de tête autorisé",
          fmtFr: "Exactement cinq chiffres",
          fmtCa:
            "La forme A1A 1A1, avec les véritables exclusions de lettres de Postes Canada appliquées",
          uaeTitle: "Les Émirats arabes unis sont délibérément absents",
          uaeContent:
            "Les Émirats arabes unis n'ont aucun système de code postal national, il n'existe donc aucun format réel auquel comparer une valeur — ni strict, ni permissif. Ce n'est pas une entrée manquante en attente d'ajout : tenter de l'utiliser est refusé dès la définition avec son propre message explicatif, distinct du message générique de pays non pris en charge que vous obtiendriez pour une faute de frappe, vous indiquant de laisser plutôt le champ sans validateur. La liste déroulante ne le propose jamais.",

          attachTitle: "Refus à l'attachement d'un validateur",
          attachIntro:
            "Tous ces cas surviennent à la définition, avant qu'aucune valeur ne soit jamais enregistrée. Plusieurs ne sont accessibles que depuis une requête qui contourne le formulaire, car le formulaire ne propose pas la combinaison invalide en premier lieu.",
          thSituation: "Situation",
          thWhatYouSee: "Ce que vous voyez",
          attNonText: "Un validateur sur un champ qui n'est pas Text",
          attNonTextMsg:
            "Refusée, en nommant le type de valeur : un validateur ne peut être attaché qu'à un champ Text.",
          attNoParam: "Un validateur paramétré avec un paramètre vide",
          attNoParamMsg: "Refusée, en nommant le validateur : il exige un paramètre.",
          attExtraParam: "Un paramètre sur l'un des sept qui n'en acceptent aucun",
          attExtraParamMsg: "Refusée, en nommant le validateur : il n'accepte aucun paramètre.",
          attBadRange: "Un paramètre de plage mal formé",
          attBadRangeMsg:
            "Refusée, en expliquant que deux bornes séparées par une virgule sont nécessaires, que chaque côté peut être vide, et que la borne inférieure ne doit pas dépasser la borne supérieure.",
          attNoBound: "Un paramètre de plage avec les deux côtés vides",
          attNoBoundMsg:
            "Refusée, en expliquant qu'un paramètre dont les deux côtés sont vides accepterait toute valeur, ce qui revient au même qu'attacher aucun validateur.",
          attUnsupportedCountry: "Un pays de Postal Code qui n'est pas l'un des sept",
          attUnsupportedCountryMsg:
            "Refusée, en nommant le pays et en listant les sept pris en charge : EG, SA, US, GB, DE, FR, CA.",
          attUae: "Postal Code avec AE",
          attUaeMsg:
            "Refusée avec son propre message dédié, expliquant que les Émirats arabes unis n'ont aucun système de code postal national et que le champ devrait plutôt rester sans validateur.",

          codesTitle: "Codes d'erreur des validateurs",
          codesIntro:
            "Chaque refus de validateur est une réponse HTTP 422, jamais un 500. Si un échec de validateur produit un jour un 500, c'est un défaut qui mérite d'être signalé — chacun est écrit pour refuser proprement.",
          thCode: "Code",
          thWhenItFires: "Quand il se déclenche",
          codeInvalidFormat:
            "La plupart des échecs de validateur : une forme qui ne correspond pas, un chiffre de contrôle qui ne se vérifie pas, une valeur absente d'une liste One of a List, un marqueur Contains ou Starts With absent, ou un code postal qui ne correspond pas à son pays.",
          codeRange:
            "Numeric Range — la valeur est hors des bornes, ou n'est pas un nombre du tout.",
          codeMaxLength:
            "Le plafond global de 4 000 caractères de Text, le propre plafond plus court d'un validateur, ou la borne supérieure de Length Range.",
          codeMinLength: "La borne inférieure de Length Range.",
          codeRequired:
            "Le champ est Obligatoire et la valeur est vide. Ceci se déclenche avant qu'aucun validateur ne s'exécute, donc une valeur composée uniquement d'espaces sur un champ obligatoire reçoit le message générique d'obligation plutôt qu'un message propre au validateur.",
          codesInfoTitle: "Les messages nomment la clé, pas le libellé",
          codesInfoContent:
            "Un message de validateur cite la clé machine du champ — « 'shirt_size' is not a valid IBAN. » — plutôt que son libellé affiché. Faites correspondre sur la clé lorsque vous tracez un échec.",

          limitsTitle: "Ce que les validateurs ne font pas",
          limit1:
            "Ils ne s'attachent jamais qu'à un champ Text. Il n'existe aucun moyen de poser une vérification de format sur aucun des vingt et un autres types.",
          limit2:
            "Ils ne revérifient jamais les valeurs déjà enregistrées. Attacher un validateur à un champ qui contient des réponses laisse ces réponses exactement telles quelles, y compris celles qui échoueraient désormais, jusqu'à ce que quelqu'un les ressaisisse et les enregistre.",
          limit3:
            "Ils ne s'exécutent jamais sur une valeur vide. Sur un champ non Obligatoire, une valeur composée uniquement d'espaces est stockée comme effacée sans aucune erreur de validateur — marquez le champ Obligatoire si une réponse vide doit être refusée.",
          limit4:
            "Ils ne peuvent être ni recherchés ni filtrés. Il n'existe aucune vue de tous les champs utilisant IBAN ; le seul moyen de voir quel validateur porte un champ est d'ouvrir ce champ.",
          limit5:
            "Ils n'ont aucune référence consultable à l'intérieur du produit. Pour voir la liste des validateurs, vous ouvrez le formulaire de définition d'un champ Text et lisez la liste déroulante.",
          limit6:
            "Ils ne peuvent pas être écrits à la main. Il n'existe nulle part de saisie d'expression régulière ou de motif, par conception, et les 13 vérifications intégrées forment l'ensemble complet.",
        },

        // ═══════════════════════════════════════════════════
        //  Sécurité au niveau du champ
        // ═══════════════════════════════════════════════════
        security: {
          title: "Sécurité au niveau du champ",
          description:
            "Masquer un champ personnalisé précis aux personnes détenant un rôle ou un groupe d'utilisateurs : comment cela se configure, ce qu'elles voient, pourquoi leurs enregistrements ne détruisent pas les valeurs masquées, et pourquoi obligatoire et restreint ne peuvent pas être combinés.",
          intro:
            "La sécurité au niveau du champ vous permet de masquer un champ nommé aux personnes détenant un rôle ou un groupe d'utilisateurs particulier. Elle s'applique aux champs personnalisés exactement comme aux champs intégrés d'un écran — un champ qu'un administrateur a délibérément restreint n'est pas non plus lisible via l'API des champs personnalisés. C'est le mécanisme vers lequel se tourner quand une valeur ne doit véritablement pas être vue.",
          notSensitivityTitle: "Ce n'est pas le paramètre Sensitivity",
          notSensitivityContent:
            "Le paramètre Sensitivity d'une définition de champ — Unclassified, Internal, Confidential, Restricted — est un libellé pour le reporting et la gestion des exports. Il ne restreint l'accès à rien, et les deux mécanismes sont totalement indépendants. Si vous voulez qu'un champ soit masqué, configurez-le ici, sur le rôle ou le groupe d'utilisateurs, pas sur la définition du champ.",

          whereTitle: "Où les restrictions se configurent",
          whereIntro:
            "Les restrictions se définissent sur ce qui accorde l'accès, pas sur le champ. Il existe deux endroits, et ils s'additionnent.",
          where1:
            "Par rôle : la liste des champs restreints sur une permission, dans la boîte de dialogue de permissions de ce rôle.",
          where2: "Par groupe d'utilisateurs : les propres restrictions du groupe.",
          whereKeyed:
            "Les noms de champ sont saisis à la main, et ils sont indexés par la ressource de permission qui protège déjà l'enregistrement — employees, party-people — plutôt que par type d'enregistrement. Les détails ci-dessous méritent d'être lus une fois avant de configurer quoi que ce soit.",
          thAspect: "Aspect",
          thBehaviour: "Comportement",
          aspSources: "Deux sources",
          behSources:
            "Une restriction de rôle et une restriction de groupe s'additionnent par union. Un groupe ne peut jamais élargir ce qu'un rôle a restreint, et il n'existe de dérogation dans aucun des deux sens.",
          aspCase: "Casse",
          behCase:
            "La comparaison ignore la casse, donc Salary, salary et SALARY désignent le même champ.",
          aspResource: "Indexation",
          behResource:
            "Les restrictions sont indexées par ressource de permission, la même ressource qui protège l'enregistrement lui-même — ni par type d'entité, ni par groupe de champs.",
          aspBuiltIn: "Portée du mécanisme",
          behBuiltIn:
            "Le même mécanisme couvre les champs intégrés d'un écran et ses champs personnalisés. Une seule liste de champs restreints, un seul comportement.",
          aspExempt: "Exemption",
          behExempt:
            "L'administrateur système de la plateforme est toujours exempté et voit toujours chaque champ. C'est la même exemption que fait déjà le mécanisme intégré.",

          seesTitle: "Ce que voit une personne restreinte",
          seesIntro:
            "Rien du tout. Le champ n'est ni grisé, ni vide, ni marqué comme masqué — l'entrée est omise du formulaire d'enregistrement et de la liste des enregistrements, entièrement.",
          seesIndistinguishable:
            "Un champ omis est indissociable d'un champ qui n'a jamais été défini. C'est délibéré : afficher un espace réservé indiquerait à quelqu'un qu'une valeur existe sans qu'il soit autorisé à la voir, ce qui est déjà une information. Cela signifie aussi qu'un collègue signalant qu'un champ manque décrit peut-être une restriction plutôt qu'un défaut — vérifiez les restrictions de rôle et de groupe avant de partir à la recherche d'un bogue.",

          savingTitle: "Enregistrer autour d'un champ masqué",
          savingIntro:
            "C'est la partie qui mérite d'être bien comprise, car l'implémentation évidente détruirait des données. Quand quelqu'un enregistre un enregistrement, l'enregistrement remplace tout l'ensemble des valeurs de champs personnalisés d'un coup — donc un champ absent de la requête signifierait normalement « l'effacer ».",
          savingWhy:
            "Un champ restreint est absent pour une raison totalement différente : il n'a jamais été envoyé à cette personne. Le produit distingue ces deux cas, et laisse la valeur stockée d'un champ restreint exactement telle qu'elle était. Quelqu'un qui ne peut pas voir une valeur ne peut plus l'effacer en modifiant l'enregistrement autour d'elle.",
          savingInfoTitle: "La conséquence pratique",
          savingInfoContent:
            "Vous pouvez en toute sécurité donner à quelqu'un un accès de modification sur un enregistrement tout en restreignant un champ sensible dessus. Ses modifications ordinaires passent, et la valeur qu'il ne peut pas voir survit intacte.",

          writingTitle: "Écrire délibérément dans un champ restreint",
          writingIntro:
            "Une tentative d'écrire explicitement dans un champ restreint est purement refusée, et rien d'autre dans le même enregistrement n'est appliqué non plus. Rejeter toute la requête plutôt que de silencieusement ignorer ce seul champ est délibéré : un enregistrement rapporté comme réussi mais manquant silencieusement un champ est l'échec le plus difficile à remarquer.",
          writingProbe:
            "Le refus se déclenche aussi quand la valeur soumise se trouve être égale à celle stockée, de sorte que personne ne peut deviner une valeur masquée en testant quelles soumissions sont acceptées.",
          thAttempt: "Tentative",
          thResult: "Résultat",
          attSaveOthers: "Enregistrer la fiche en ne changeant que les champs que vous pouvez voir",
          resSaveOthers:
            "Réussit. La valeur stockée du champ restreint est laissée exactement telle quelle, pas effacée.",
          attWriteRestricted: "Envoyer une valeur pour le champ restreint",
          resWriteRestricted:
            "Refusé avec un message nommant le champ, et l'enregistrement n'est pas du tout sauvegardé — pas même les champs que vous étiez autorisé à changer.",
          attWriteSameValue: "Envoyer la valeur actuelle du champ restreint",
          resWriteSameValue:
            "Refusé de la même façon. Le résultat ne dépend pas de la justesse de votre supposition, il ne peut donc pas servir à sonder la valeur.",
          attReadApi: "Lire directement les valeurs de champs personnalisés de l'enregistrement",
          resReadApi:
            "Le champ restreint est absent de la réponse. C'était la brèche que la sécurité au niveau du champ laissait ouverte spécifiquement pour les champs personnalisés, et elle est fermée.",

          requiredTitle: "Obligatoire et restreint ne peuvent pas être combinés",
          requiredIntro:
            "Un champ obligatoire ne peut jamais être rempli par quelqu'un qui n'est pas autorisé à le voir — il lui serait impossible d'enregistrer la fiche du tout. Le produit refuse donc la combinaison, quel que soit l'ordre dans lequel vous la tentez.",
          thSituation: "Tentative",
          thWhatYouSee: "Ce que vous voyez",
          reqRestrictRequired: "Restreindre un champ actuellement obligatoire",
          reqRestrictRequiredMsg: "Refusée, en nommant le champ.",
          reqRequireRestricted:
            "Marquer un champ obligatoire alors qu'un rôle ou un groupe le restreint",
          reqRequireRestrictedMsg:
            "Refusée, en nommant le champ et en vous invitant à retirer d'abord la restriction ou à laisser le champ facultatif.",
          requiredInfoTitle: "L'ordre n'aide pas",
          requiredInfoContent:
            "Effectuer les deux opérations dans l'autre ordre ne contourne pas la règle. Les deux sens sont vérifiés, il n'existe donc aucune séquence qui laisse un champ à la fois obligatoire et restreint.",

          reachTitle: "Où d'autre une restriction s'étend",
          reachIntro:
            "Une restriction n'est pas seulement une affaire de formulaire. Elle s'applique de façon cohérente partout où les valeurs du champ pourraient autrement apparaître.",
          reach1: "Le formulaire d'enregistrement : le champ est omis.",
          reach2: "La liste des enregistrements : la colonne est omise.",
          reach3:
            "L'API des valeurs de champs personnalisés : le champ est absent de la réponse, et refusé à l'écriture.",
          reach4:
            "L'export en feuille de calcul des définitions : les colonnes restreintes sont absentes du fichier plutôt que présentes et vides.",

          exampleTitle: "Un exemple concret",
          exampleIntro:
            "Restreindre un champ salaire sur un enregistrement de personnel, et confirmer son comportement.",
          e1Title: "Définissez le champ et donnez-lui une valeur",
          e1Content:
            "En tant qu'administrateur pouvant tout voir, définissez un champ personnalisé avec la clé salary sur le type d'enregistrement personnel, et définissez une valeur sur un enregistrement.",
          e2Title: "Restreignez-le sur un rôle",
          e2Content:
            "Ajoutez salary à la liste des champs restreints sur la permission concernée dans un rôle, puis connectez-vous en tant que quelqu'un détenant uniquement ce rôle.",
          e3Title: "Confirmez qu'il est absent, pas vide",
          e3Content:
            "Ouvrez le même enregistrement de personnel. Le champ Salary ne devrait pas du tout figurer sur le formulaire, et il ne devrait y avoir aucune colonne Salary dans la liste du personnel. Si vous le voyez vide plutôt qu'absent, la restriction n'est pas appliquée.",
          e4Title: "Enregistrez la fiche et vérifiez que la valeur a survécu",
          e4Content:
            "En tant qu'utilisateur restreint, changez autre chose sur l'enregistrement et enregistrez. Puis, en tant qu'administrateur non restreint, rouvrez l'enregistrement et confirmez que le salaire est toujours là. C'est le cas qui détruirait des données dans une implémentation naïve.",
          e5Title: "Confirmez les deux règles qui protègent la configuration",
          e5Content:
            "Essayez de marquer salary comme obligatoire pendant que la restriction est en place — refusé. Retirez la restriction, marquez-le obligatoire, puis essayez de le restreindre à nouveau — également refusé. Enfin, placez la même clé dans les restrictions d'un groupe d'utilisateurs plutôt que d'un rôle, et confirmez qu'elle se comporte à l'identique.",
          proofTitle: "Une réserve honnête sur la vérification",
          proofContent:
            "Chaque comportement d'autorisation décrit sur cette page est appliqué par de véritables garde-fous testés unitairement, mais il n'existe actuellement aucun test automatisé de bout en bout le prouvant à travers toute la pile HTTP. Cela rend la vérification manuelle véritablement informative ici plutôt que redondante — si vous mettez en service un espace de travail où un champ ne doit pas être vu, vérifiez-le une fois à la main.",
        },

        // ═══════════════════════════════════════════════════
        //  Gestion des champs
        // ═══════════════════════════════════════════════════
        managing: {
          title: "Gestion des champs",
          description:
            "Modifier et retirer des définitions, la boîte de dialogue d'historique des changements, le rapport d'utilisation et d'impact, supprimer sans détruire de données, l'export en feuille de calcul à 18 colonnes, et les deux écrans de référence en lecture seule.",
          intro:
            "Une fois les champs créés, l'écran Champs personnalisés est l'endroit où on les entretient : modifiés, retirés, audités, mesurés et exportés. Cette page couvre chacun de ces points, ainsi que les deux écrans de référence en lecture seule qui répondent à « quels types existent » et « à quels types d'enregistrement puis-je rattacher un champ ».",

          rowMenuTitle: "Le menu de ligne",
          rowMenuIntro:
            "Chaque champ de la liste possède un menu de ligne avec huit actions. Chacune nécessite sa propre permission, donc un rôle peut en voir certaines et pas d'autres.",
          thAction: "Action",
          thDoes: "Ce qu'elle fait",
          thNeeds: "Permission",
          actEdit:
            "Ouvre le formulaire de définition, préempli à partir du détail complet du champ.",
          actOptionSets:
            "Attache, configure ou détache un jeu d'options partagé et versionné pour les champs Select ou MultiSelect.",
          actVisibilityRules:
            "Ouvre la boîte de dialogue de règles de visibilité conditionnelle pour configurer des règles d'affichage ou de masquage évaluées par rapport aux champs frères.",
          actConvertType:
            "Ouvre une boîte de dialogue pour convertir le type de valeur du champ : choisir une cible parmi les types vers lesquels il peut évoluer sans risque, confirmer si la conversion entraîne une perte de données, puis revenir en arrière ensuite si nécessaire.",
          actVersions:
            "Ouvre le tiroir d'historique des versions : consulter la chaîne des versions, générer un nouveau brouillon, ou publier ou abandonner un brouillon déjà généré.",
          actHistory:
            "Liste chaque changement enregistré sur la définition du champ, du plus récent au plus ancien, avec qui l'a fait et quand.",
          actUsage:
            "Indique combien de réponses le champ contient, ventilées par type d'enregistrement, et si le supprimer détruirait des données.",
          actDelete:
            "Supprime la définition — refusé d'abord si elle contient des réponses, jusqu'à confirmation explicite.",

          editTitle: "Modifier une définition",
          editIntro:
            "La modification ouvre le même formulaire que la création, avec les paramètres définitifs affichés mais non modifiables : type d'enregistrement, clé, type de valeur et portée. Tout le reste peut être changé, et les changements prennent effet dès le prochain formulaire que quelqu'un ouvre.",
          editLoadFailure:
            "Si le détail derrière le bouton Edit échoue à se charger, le formulaire ne s'ouvre délibérément pas, et vous obtenez un message à la place. C'est une protection plutôt qu'un désagrément : la ligne de la liste ne porte pas les options, les textes indicatifs ou le validateur, donc ouvrir un formulaire préempli à partir d'elle et enregistrer effacerait silencieusement les trois.",
          editWarnTitle: "Deux modifications rejaillissent en arrière",
          editWarnContent:
            "Renommer une option change ce qu'affiche chaque enregistrement existant, car le texte de l'option est la réponse stockée. Attacher ou changer un validateur ne revérifie pas les réponses déjà enregistrées, donc un champ peut contenir des valeurs que son validateur actuel refuserait désormais. Les deux sont détaillés sur les pages Options et Validateurs.",

          // Règles de visibilité
          visibilityRulesTitle: "Administration des règles de visibilité",
          visibilityRulesIntro:
            "Les règles de visibilité permettent d'afficher ou de masquer des champs dynamiquement sur les formulaires d'enregistrement, en fonction des valeurs de champs personnalisés frères du même type d'enregistrement. Quand une règle est active, les formulaires côté client et la validation côté serveur évaluent les conditions de façon déterministe.",
          thOperator: "Opérateur",
          thOperatorMeaning: "Condition évaluée",
          thOperatorExample: "Exemple de déclencheur",
          opEquals: "Égal à",
          opEqualsMeaning: "La valeur du champ contrôlant correspond exactement à la valeur cible.",
          opEqualsExample: "Afficher Kit Size quand Staff Role est égal à Coach.",
          opNotEquals: "Différent de",
          opNotEqualsMeaning: "Le champ contrôlant a toute valeur autre que la valeur cible.",
          opNotEqualsExample:
            "Afficher Dietary Requirements quand Meal Plan est différent de None.",
          opIsEmpty: "Est vide",
          opIsEmptyMeaning:
            "Le champ contrôlant ne contient aucune réponse stockée, ou une valeur nulle.",
          opIsEmptyExample: "Afficher Explanation quand ID Number est vide.",
          opIsNotEmpty: "N'est pas vide",
          opIsNotEmptyMeaning: "Le champ contrôlant a une valeur non nulle et non vide.",
          opIsNotEmptyExample: "Afficher Expiry Date quand Passport Number n'est pas vide.",
          opIn: "Dans l'ensemble",
          opInMeaning:
            "La réponse du champ contrôlant est l'une de plusieurs valeurs séparées par des virgules.",
          opInExample:
            "Afficher Specialization quand Department est dans Medical, Coaching, Analytics.",
          opNotIn: "Absent de l'ensemble",
          opNotInMeaning:
            "La réponse du champ contrôlant ne figure dans aucune des valeurs listées.",
          opNotInExample: "Afficher General Notes quand Category n'est pas dans VIP, Board.",
          opGreaterThan: "Supérieur à",
          opGreaterThanMeaning: "La réponse numérique ou de date dépasse strictement le seuil.",
          opGreaterThanExample:
            "Afficher Clearance Details quand Security Level est supérieur à 3.",
          opLessThan: "Inférieur à",
          opLessThanMeaning: "La réponse numérique ou de date est strictement inférieure au seuil.",
          opLessThanExample: "Afficher Parental Consent quand Age est inférieur à 18.",
          visibilityRulesEvaluation:
            "Un champ associé à plusieurs règles n'est visible que lorsque chacune d'elles est satisfaite — un simple ET entre toutes, et non un arbitrage entre des actions Show et Hide qui s'affronteraient, car une règle n'exprime jamais qu'une seule condition de visibilité. La priorité ne sert qu'à ordonner les règles pour le diagnostic et l'affichage ; elle ne change jamais quelles règles s'appliquent. Un champ qu'une règle est en train de masquer est également ignoré par la validation Required, de sorte qu'une condition que personne ne peut voir ne bloque jamais un enregistrement.",
          visibilityRulesTipTitle: "Conditionner uniquement sur des champs frères",
          visibilityRulesTipContent:
            "Une règle ne peut référencer que des champs frères définis sur exactement le même type d'entité. Les conditions inter-entités (par exemple vérifier un paramètre de tenant depuis un champ de personne) ne sont pas autorisées, afin de préserver l'intégrité transactionnelle d'un enregistrement unique.",

          // Conversion
          conversionTitle: "Conversion de type de valeur et restauration",
          conversionIntro:
            "Convertir le type de valeur déclaré d'un champ est une opération distincte, accessible via sa propre action du menu de ligne plutôt que via le formulaire de modification — elle change la façon dont les réponses déjà stockées sont représentées, pas seulement l'apparence que prendront les futures réponses. Seules neuf paires de types précises sont autorisées ; toute autre paire est refusée d'emblée, y compris toute paire impliquant un type de référence, File, Image ou RichText.",
          thConversionClass: "Catégorie de sécurité",
          thConversionPairs: "Paires de types prises en charge",
          thConversionRisk: "Garantie de préservation des données",
          classLossless: "Sans perte",
          classLosslessPairs:
            "Text → LongText, Number → Text, Number → LongText, Percent → Text, Rating → Text, Percent → Number, Rating → Number",
          classLosslessRisk:
            "Chaque valeur existante s'analyse directement dans le type cible sans rien perdre — un nombre mis en forme comme du texte, ou un pourcentage ou une note relue comme un simple nombre.",
          classLossy: "Avec perte (confirmation requise)",
          classLossyPairs: "LongText → Text, Text → Number",
          classLossyRisk:
            "Aucune des deux paires ne tronque quoi que ce soit. LongText → Text refuse l'opération entière dès qu'une seule valeur stockée dépasse le plafond propre à Text de 4 000 caractères, en nommant sa longueur réelle. Text → Number refuse l'opération entière dès qu'une seule valeur stockée échoue à s'analyser comme un nombre. Dans les deux cas, une seule ligne défectueuse bloque toutes les lignes — il n'existe aucune conversion partielle qui changerait certains enregistrements en laissant les autres tels quels.",
          classIncompatible: "Non proposée",
          classIncompatiblePairs:
            "Toute autre paire — 453 des 462 possibles, y compris toute paire impliquant EntityReference, UserReference, File, Image ou RichText.",
          classIncompatibleRisk:
            "Refusée avant même que quoi que ce soit ne s'exécute. Une valeur de type référence ou média n'a aucune forme textuelle ou numérique sensée vers laquelle convertir, et le sens inverse n'a rien de réel vers quoi pointer.",
          conversionLossyWarnTitle:
            "Une conversion avec perte s'applique à chaque valeur stockée, de façon permanente",
          conversionLossyWarnContent:
            "Une exécution réussie change toutes les lignes à la fois — il n'existe aucune confirmation séparée par enregistrement, et rien n'est tronqué ni effacé silencieusement en dehors de ce que fait la propre conversion du type cible. Exécutez toujours Usage & impact en premier pour voir combien d'enregistrements seront affectés avant de confirmer.",
          conversionDryRunIntro:
            "Avant de rien changer, le serveur vérifie chaque valeur stockée par rapport au type cible, dans une première passe qui n'écrit rien. Si ne serait-ce qu'une seule valeur échouerait à se convertir, l'opération entière est refusée d'emblée, en nommant chaque ligne en échec, et rien n'est changé — c'est tout ou rien, jamais une conversion partielle qui laisserait certaines lignes à l'ancien état et d'autres au nouveau.",
          conversionRollbackTitle: "Restauration par instantané",
          conversionRollbackContent:
            "Chaque conversion enregistre un instantané de la valeur antérieure pour chaque ligne avant de la modifier. Un Super Admin peut restaurer une exécution de conversion précise à l'aide de son identifiant d'exécution (job-run id), rétablissant exactement les valeurs antérieures — les instantanés expirent et sont purgés automatiquement au bout de sept jours, de sorte qu'une restauration dispose d'une fenêtre réelle plutôt que d'être disponible indéfiniment.",

          // Versions et brouillons
          versionsTitle: "Cycle de vie des versions et des brouillons de définition de champ",
          versionsIntro:
            "Les scalaires, options et règles de visibilité en production d'une définition peuvent être clonés dans un brouillon isolé, puis soit publiés — remplaçant la version en production en une seule étape —, soit abandonnés, laissant la version en production intacte dans les deux cas.",
          thVersionStatus: "Statut",
          thVersionMeaning: "Signification dans le cycle de vie",
          thVersionActions: "Actions disponibles",
          vStatusDraft: "Brouillon",
          vMeaningDraft:
            "Un clone isolé de la définition telle qu'elle se présentait au moment de sa génération — sa propre copie des scalaires, des options et des règles de visibilité. N'est servi sur aucun formulaire d'enregistrement.",
          vActionsDraft:
            "Publish, Discard. Rien ne permet actuellement de modifier un brouillon après sa génération — un clone erroné doit être abandonné puis régénéré.",
          vStatusPublished: "Publié",
          vMeaningPublished:
            "L'unique version active actuellement servie sur chaque formulaire d'enregistrement pour ce champ.",
          vActionsPublished: "Create Draft (génère un nouveau clone de travail), View History.",
          vStatusDeprecated: "Déprécié",
          vMeaningDeprecated:
            "Une ancienne version publiée, remplacée lors de la promotion d'un brouillon. Ses options et règles clonées lui restent attachées mais sont inertes — l'application des règles ne lit jamais que la version publiée actuelle.",
          vActionsDeprecated:
            "Enregistrement d'audit en lecture seule. Conservé pour l'intégrité de l'historique.",
          vStatusArchived: "Archivé",
          vMeaningArchived:
            "Un brouillon abandonné, conservé plutôt que supprimé afin que son numéro de version ne puisse jamais être réattribué.",
          vActionsArchived: "Référence historique uniquement.",
          versionsSnapshotWarnTitle: "Un brouillon est un instantané, pas un miroir en direct",
          versionsSnapshotWarnContent:
            "Un brouillon ne suit pas les modifications apportées à la version en ligne pendant qu'il reste ouvert — il ne conserve que l'état de la version en ligne au moment de sa création. La publication ne fusionne pas les deux : elle remplace entièrement la version en ligne par l'instantané du brouillon, annulant silencieusement toute modification en ligne effectuée entre-temps. Publiez un brouillon rapidement, ou recréez-le si la version en ligne a évolué depuis.",
          versionsPromotionIntro:
            "Publier un brouillon déprécie la version publiée en place dans le même enregistrement. Le numéro de version s'incrémente toujours, et chaque chargement de formulaire à partir de ce moment sert la nouvelle version publiée.",
          versionsRuleGuardTitle:
            "Une publication qui ferait silencieusement perdre toutes les règles de visibilité est refusée",
          versionsRuleGuardContent:
            "Les règles de visibilité sont clonées sur un brouillon au moment de sa génération, et non récupérées à nouveau au moment de la publication — de sorte qu'au moment où une publication a lieu, il n'y a normalement plus rien à perdre. Le seul cas pour lequel ce garde-fou existe est celui où la version sortante porte réellement des règles alors que le brouillon n'en porte aucune : la publication est alors refusée d'emblée, plutôt que de rendre silencieusement visible sans condition chaque champ conditionnellement masqué de ce type d'enregistrement.",

          retireTitle: "Retirer un champ : désactiver ou supprimer",
          retireIntro:
            "Ce ne sont pas la même opération, et la différence compte. En cas de doute, désactivez — c'est l'opération réversible.",
          deactivateTitle: "Désactiver Active",
          deactivate1:
            "Le champ cesse d'être proposé sur les formulaires de création et de modification",
          deactivate2: "Chaque réponse déjà stockée est conservée, intacte",
          deactivate3: "C'est réversible — réactiver Active restaure le champ tel qu'il était",
          deactivate4:
            "C'est enregistré dans l'historique comme Deactivated, et peut être Reactivated plus tard",
          deleteColTitle: "Supprimer la définition",
          deleteCol1: "Refusée à la première tentative si le champ contient des réponses",
          deleteCol2:
            "Détruit ces réponses une fois le délai de rétention écoulé, si vous confirmez",
          deleteCol3:
            "Libère la clé, de sorte qu'un nouveau champ pourrait plus tard la réutiliser — sans aucune des anciennes réponses",
          deleteCol4:
            "Est enregistrée dans l'historique comme Deleted, et peut être Restored tant qu'elle est récupérable",

          historyTitle: "Historique de définition",
          historyIntro:
            "L'entrée History du menu de ligne d'un champ ouvre une boîte de dialogue listant ce qui est arrivé à la définition de ce champ, du plus récent au plus ancien, avec la personne qui l'a fait et quand. Un changement effectué par le système plutôt que par une personne est attribué au système. Les entrées sont paginées, et la boîte de dialogue indique le nombre total de changements.",
          thEvent: "Événement",
          thMeans: "Ce que cela signifie",
          evCreated: "Le champ a été défini.",
          evUpdated:
            "Quelque chose sur la définition a changé — un libellé, un indicateur, le validateur, les options.",
          evDeactivated: "Active a été désactivé, retirant le champ sans toucher à ses réponses.",
          evReactivated: "Active a été réactivé.",
          evDeleted: "La définition a été supprimée et reste récupérable.",
          evRestored: "Une définition supprimée a été restaurée.",
          evPurged:
            "La définition a été retirée de façon permanente et n'est plus récupérable. La boîte de dialogue le marque explicitement afin que cela ne soit pas lu comme une suppression ordinaire.",
          historyParts:
            "Chaque entrée précise aussi quelle partie du champ elle concerne, car un champ est plus qu'une seule ligne.",
          thPart: "Partie",
          partField: "Le champ lui-même.",
          partDefinition: "L'enregistrement de définition qui le sous-tend.",
          partVersion: "Une version de la définition.",
          partOption: "Une entrée de la liste d'options du champ.",
          partVisibilityRule:
            "Une règle conditionnelle d'affichage ou de masquage attachée au champ, gérée via la boîte de dialogue Visibility Rules.",
          historyScopeTitle: "L'historique couvre la définition, jamais les réponses",
          historyScopeContent:
            "Cette boîte de dialogue ne vous dira pas qui a changé la nationalité d'une personne précise, et ce n'est pas son but. Y lister les changements de valeur en ferait une copie lisible des données de champs de tout le monde, contournant d'un coup la sécurité au niveau du champ et toute autre règle de visibilité. Seuls les changements côté définition sont éligibles, et les enregistrements porteurs de valeurs sont exclus nommément plutôt que par simple omission.",
          historyUnavailableTitle: "Si l'historique indique que le module n'est pas disponible",
          historyUnavailableContent:
            "C'est une caractéristique du déploiement plutôt qu'un défaut du champ : le magasin d'audit vit dans un autre module, et ce déploiement fonctionne sans lui. Aucun historique n'a non plus été enregistré pour cette période. Cela relève de qui administre le déploiement, pas de quelque chose que vous pouvez corriger depuis l'écran. L'historique d'un champ global de plateforme est en outre réservé aux administrateurs de la plateforme, et affiche un message différent.",

          usageTitle: "Utilisation et impact",
          usageIntro:
            "L'entrée Usage & impact du menu de ligne indique ce que le champ porte réellement avant que vous ne le changiez ou ne le supprimiez. Lisez toute la boîte de dialogue plutôt qu'un seul chiffre.",
          thReading: "Ce qu'elle montre",
          readStoredValues: "Valeurs stockées",
          readStoredValuesMeans: "Combien de réponses existent pour ce champ.",
          readLegacyValues: "Valeurs dans l'ancien magasin",
          readLegacyValuesMeans:
            "Réponses encore détenues dans l'ancien stockage antérieur au magasin de valeurs actuel. Comptées séparément afin qu'une migration en cours soit visible plutôt que masquée.",
          readOptions: "Options",
          readOptionsMeans:
            "Combien d'options contient la liste du champ, pour un champ Select ou MultiSelect.",
          readByRecordType: "Par type d'enregistrement",
          readByRecordTypeMeans:
            "Le même décompte de réponses ventilé par type d'enregistrement qui les détient, afin que vous puissiez voir où se trouve réellement la donnée.",
          readAffectedOrgs: "Organisations détenant des valeurs",
          readAffectedOrgsMeans:
            "Pour un champ global de plateforme, combien d'espaces de travail détiennent des réponses pour lui. C'est le chiffre qui rend une suppression véritablement lourde de conséquences.",
          readScopeNotice: "L'avis de portée en haut",
          readScopeNoticeMeans:
            "Indique si les décomptes ci-dessous couvrent uniquement votre espace de travail ou toute la plateforme. Les deux diffèrent d'ordres de grandeur pour un champ hérité, et rien dans un simple chiffre ne vous dit lequel vous regardez.",
          usageWarnTitle: "Lisez l'avertissement, pas le chiffre",
          usageWarnContent:
            "La ligne « ceci détruira des données » provient du propre verdict du serveur, jamais du chiffre affiché à l'écran. Un champ global de plateforme est mesuré à travers chaque espace de travail qui en a hérité, il peut donc afficher zéro dans votre propre espace de travail tout en vous avertissant — à juste titre. C'est l'avertissement qu'il faut croire.",

          deleteTitle: "Supprimer sans détruire de données",
          deleteIntro:
            "Supprimer un champ contenant des réponses nécessite deux étapes délibérées. Un champ sans réponse n'en nécessite qu'une.",
          d1Title: "Ouvrez d'abord Usage & impact",
          d1Content:
            "Voyez combien de réponses existent et où elles se trouvent. Si le chiffre vous surprend, arrêtez-vous ici — désactiver le champ est presque toujours la meilleure option.",
          d2Title: "Choisissez Delete",
          d2Content:
            "Si le champ contient des réponses, la suppression est refusée avec un conflit, et la boîte de dialogue explique exactement ce qui serait perdu, en nommant le nombre de valeurs stockées et le nombre de types d'enregistrement.",
          d3Title: "Confirmez la suppression destructrice",
          d3Content:
            "Confirmer depuis l'intérieur de cette boîte de dialogue est ce qui fait réellement avancer les choses. C'est un acte distinct et explicite plutôt qu'un second clic sur le même bouton, de sorte qu'un champ contenant des données ne peut pas être supprimé par élan.",
          d4Title: "Ou supprimez un champ vide en une seule étape",
          d4Content:
            "Un champ sans réponse se supprime sans avertissement et sans étape supplémentaire, car il n'y a rien à perdre.",
          deleteRetention:
            "Une suppression confirmée détruit les réponses stockées une fois le délai de rétention écoulé, pas instantanément. Jusque-là, la définition peut encore être Restored, et l'historique enregistre à la fois la suppression et la restauration. Passé ce délai, les réponses ont disparu et l'entrée d'historique se lit comme Purged.",

          exportTitle: "Exporter les définitions vers une feuille de calcul",
          exportIntro:
            "L'action Export dans l'en-tête de la page Champs personnalisés télécharge une feuille de calcul des définitions que vous pouvez voir, une ligne par champ avec des en-têtes sur la première ligne. Voici les 18 colonnes.",
          thColumn: "Colonne",
          thContains: "Contient",
          colEntityType: "Le type d'enregistrement contre lequel le champ est défini.",
          colKey: "La clé machine du champ.",
          colLabelEn: "Le libellé anglais.",
          colLabelAr: "Le libellé arabe, vide si aucun n'a été défini.",
          colValueType: "L'un des vingt-deux types de valeur.",
          colRequired: "Si le champ est obligatoire.",
          colActive: "Si le champ est encore proposé sur les formulaires.",
          colSortOrder:
            "La position du champ parmi les champs personnalisés du type d'enregistrement.",
          colOptionsEn: "Les options en anglais, pour un champ Select ou MultiSelect.",
          colOptionsAr: "Les options en arabe, alignées avec les anglaises.",
          colSensitivity: "Le libellé de classification défini sur la définition.",
          colExportable:
            "Le paramètre Include in exports, rapporté comme Yes ou No. Il ne sert jamais à filtrer ce fichier — un export de définitions qui omettrait des lignes masquerait précisément les champs qu'un administrateur a le plus besoin d'auditer.",
          colValidator: "Le validateur attaché, pour un champ Text.",
          colValidatorParam: "Le paramètre du validateur, lorsqu'il en prend un.",
          colPlaceholderEn: "Le texte indicatif anglais.",
          colPlaceholderAr: "Le texte indicatif arabe.",
          colScope:
            "Platform pour un champ global, Organisation pour un champ d'espace de travail.",
          colCreated: "Quand la définition a été créée, en UTC.",
          exportBooleans:
            "Les colonnes oui/non sont écrites comme les mots Yes et No plutôt que comme des booléens de tableur, afin qu'elles survivent à une ouverture dans une autre langue et continuent de se lire comme prévu.",
          exportSafetyTitle: "Les libellés qui ressemblent à des formules restent du texte",
          exportSafetyContent:
            "Chaque cellule est écrite comme du texte inerte, jamais comme une formule. Un champ libellé =SUM(A1) arrive dans le fichier comme les caractères littéraux, pas comme un calcul — et il en va de même pour un libellé commençant par +, -, @, ou une tabulation suivie de =. C'est catégorique plutôt qu'un filtrage de cas connus.",
          exportLimitTitle: "Trois limites de l'export",
          exportLimitContent:
            "Il contient des définitions et jamais les réponses de qui que ce soit — un export des valeurs séparé, avec sa propre adresse et son propre bouton dans l'en-tête, est l'endroit où vivent les réponses elles-mêmes (voir Limites et comportements). Au-delà de 10 000 définitions, il refuse purement et simplement, en vous invitant à restreindre l'export à un seul type d'enregistrement, plutôt que de vous remettre un fichier tronqué qui paraîtrait complet. Et les 18 colonnes ci-dessus constituent tout le fichier : le Target Entity Type épinglé d'un champ de référence n'en fait pas partie, donc une définition exportée n'enregistre pas ce vers quoi pointe son champ. Les champs qui vous sont restreints sont absents du fichier plutôt que vides.",

          referenceTitle: "Les deux écrans de référence",
          referenceIntro:
            "Les deux sont accessibles depuis des liens dans l'en-tête de la page Champs personnalisés, les deux sont en lecture seule, et les deux sont verrouillés derrière la même permission de consultation que l'écran Champs personnalisés lui-même. Aucun n'a sa propre entrée de menu latéral, ce qui est délibéré.",
          valueTypesScreenTitle: "Types de valeur",
          valueTypesScreenIntro:
            "Un tableau des vingt-deux types de valeur avec, pour chacun, une description de son usage, s'il prend un texte indicatif, s'il possède une liste d'options, et s'il prend en charge un validateur. À utiliser pour répondre à « quels types existent » sans ouvrir de formulaire de définition. Text est la seule ligne montrant une prise en charge de validateur, et les quatre types en forme de référence ne montrent aucune liste d'options qui leur soit propre — ce qu'ils proposent provient d'un autre module, ou d'un fichier téléversé, plutôt que d'une liste que vous rédigez.",
          entityTypesScreenTitle: "Types d'entité",
          entityTypesScreenIntro:
            "Une liste de chaque type d'enregistrement auquel un champ personnalisé peut être rattaché : son nom d'affichage, sa clé, et le module qui le possède.",
          entityTypesScreenDrift:
            "Elle montre aussi deux colonnes d'écran distinctes plus un statut, ce qui n'est pas une redondance. L'une indique ce que la plateforme prétend au sujet de cette application ; l'autre indique ce que cette application possède réellement. La colonne de statut indique si les deux concordent, et une ligne indiquant Out of Sync est un véritable défaut qui mérite d'être signalé — cela signifie soit qu'un champ cible un type d'enregistrement que personne ne peut afficher, soit un écran dont la plateforme ignore l'existence.",
          apiOnlyTitle: "Types d'enregistrement API uniquement",
          apiOnlyContent:
            "Un type d'enregistrement sans écran dans cette application reste une cible légale pour un champ personnalisé. Il est listé après ceux adossés à un écran sur le formulaire de définition, avec un suffixe API only. Un champ défini contre l'un d'eux est accessible via l'API et n'a nulle part où s'afficher dans l'interface — ce qui est très bien si c'était l'intention, et une énigme sinon.",
        },

        // ═══════════════════════════════════════════════════
        //  Limites et comportements
        // ═══════════════════════════════════════════════════
        limits: {
          title: "Limites et comportements",
          description:
            "Chaque plafond fixe et chaque limitation délibérée des champs personnalisés, avec pour chacune la raison de son existence — pour que personne ne passe un après-midi à chercher un paramètre qui n'existe pas.",
          intro:
            "Cette page rassemble chaque limite qu'un administrateur de champs personnalisés peut raisonnablement rencontrer, et explique pourquoi chacune est ce qu'elle est. Tout ici décrit le comportement actuel plutôt qu'une promesse sur l'avenir. Une limite énoncée clairement coûte moins cher qu'une limite découverte à quatre heures de l'après-midi.",

          numbersTitle: "Les chiffres fixes",
          numbersIntro:
            "Ce sont des constantes du produit. Aucune ne peut être relevée ou abaissée pour un champ individuel, et seule la dernière varie réellement.",
          thLimit: "Limite",
          thValue: "Valeur",
          thConfigurable: "Configurable ?",
          limTextLength: "Longueur du champ Text, en caractères",
          limLongTextLength: "Longueur du champ LongText, en caractères",
          limMultiSelect: "Sélections MultiSelect par valeur",
          limRating: "Échelle de Rating, nombres entiers uniquement",
          limPercent: "Plage de Percent, bornes incluses",
          limPhoneDigits: "Chiffres du téléphone, après le + initial",
          limCurrencyCode: "Longueur du code de devise, lettres majuscules",
          limDuration: "Borne supérieure de Duration",
          limReferencePage: "Enregistrements par page dans un sélecteur de référence",
          limReferencePageMax: "Plus grande page qu'un sélecteur de référence puisse demander",
          limGroupReorder: "Groupes de champs par type d'enregistrement dans une réorganisation",
          limExportRows: "Définitions par export en feuille de calcul",
          limFieldsPerWorkspace: "Champs personnalisés par espace de travail",
          cfgNo: "Non",
          cfgPlan: "Défini par votre forfait",
          valNoUpperBound: "Aucune",
          valPlanQuota: "Quota du forfait — zéro sur l'édition Free",

          validatorsTitle: "Comportements des validateurs",
          thBehaviour: "Comportement",
          thWhy: "Pourquoi",
          vTextOnly: "Les validateurs ne s'attachent qu'aux champs Text.",
          vTextOnlyWhy:
            "L'argument de sécurité des motifs intégrés a été établi pour une saisie de texte mono-ligne. L'étendre à une saisie de forme différente exigerait de refaire cette analyse, et ce n'est pas quelque chose à glisser discrètement dans une version. Un champ Text avec un validateur est la réponse quand vous avez besoin d'une adresse e-mail avec des contraintes supplémentaires.",
          vNoRetro: "Attacher un validateur ne revérifie jamais les réponses déjà enregistrées.",
          vNoRetroWhy:
            "La validation ne s'exécute qu'à un seul endroit : le chemin d'enregistrement. Rien ne parcourt les données historiques quand un validateur est nouvellement attaché, donc un champ peut légitimement contenir des valeurs que son validateur actuel refuserait, jusqu'à ce que quelqu'un les ressaisisse.",
          vWhitespace:
            "Une valeur composée uniquement d'espaces échappe entièrement à la validation, sauf si le champ est Obligatoire.",
          vWhitespaceWhy:
            "La vérification de vide s'exécute avant toute vérification de type ou de validateur. Sur un champ facultatif, une valeur composée uniquement d'espaces est donc stockée comme effacée sans aucune erreur de validateur. Marquez le champ Obligatoire si une réponse vide doit être refusée.",
          vNoRegex: "Il n'existe nulle part de zone de motif ou d'expression régulière.",
          vNoRegexWhy:
            "Un motif écrit à la main peut être conçu pour consommer un temps de traitement énorme sur une saisie courte, transformant un formulaire de saisie en moyen de mettre le système à genoux. Les 13 vérifications sélectionnées existent précisément pour que personne n'ait à en rédiger une.",
          vNoFilter:
            "La liste des définitions ne peut être ni filtrée ni recherchée par validateur.",
          vNoFilterWhy:
            "Aucune vue de ce type n'a été construite. Pour voir quel validateur utilise un champ, ouvrez le formulaire de définition de ce champ.",
          vNoReference:
            "Il n'existe aucune référence consultable de validateurs à l'intérieur du produit.",
          vNoReferenceWhy:
            "Les types de valeur et les types d'enregistrement ont chacun reçu un écran de référence en lecture seule ; pas les validateurs. La liste déroulante du formulaire de définition d'un champ Text est la seule liste disponible dans le produit.",
          vNoChecksumEgUae:
            "Les vérifications d'identité égyptienne et émiratie contrôlent la structure mais pas un chiffre de contrôle.",
          vNoChecksumEgUaeWhy:
            "Aucun des deux pays ne publie d'algorithme de chiffre de contrôle, et les hypothèses communautaires trouvées lors des recherches se contredisaient entre elles. Un algorithme erroné rejetterait de véritables identités valides, ce qui est pire que de ne pas vérifier du tout le dernier chiffre.",
          vNoAe: "Postal Code ne prend pas en charge les Émirats arabes unis.",
          vNoAeWhy:
            "Les Émirats arabes unis n'ont aucun système de code postal national, il n'y a donc rien à quoi comparer une valeur. Tenter de l'utiliser est refusé avec son propre message explicatif plutôt qu'un message générique.",

          typesTitle: "Comportements des types de valeur",
          tValueTypeFixed:
            "La clé, le type d'enregistrement et la portée d'un champ ne peuvent jamais être changés une fois enregistrés.",
          tValueTypeFixedWhy:
            "Renommer la clé, changer le type d'enregistrement visé ou changer la portée après coup rendrait chaque réponse déjà stockée ambiguë quant à sa signification. Le type de valeur est la seule exception, avec une échappatoire étroite : neuf paires de types précises peuvent être converties après coup — voir Gestion des champs — tout le reste signifie encore supprimer et recréer.",
          tMultiOrder:
            "Une réponse MultiSelect se relit dans l'ordre de sélection, pas dans l'ordre des options.",
          tMultiOrderWhy:
            "Conserver l'ordre de sélection est ce qui permet à la valeur de survivre fidèlement à l'aller-retour. Le coût est qu'une colonne de liste affichant cette réponse ne suit pas nécessairement l'ordre dans lequel vous avez rédigé les options.",
          tLongTextNoBlock:
            "LongText vous laisse taper au-delà de son plafond de 10 000 caractères.",
          tLongTextNoBlockWhy:
            "Le compteur à l'écran passe au rouge, mais il n'existe aucun blocage avant soumission comme celui que MultiSelect applique à une vingtième sélection. Le refus vient de l'enregistrement.",
          tCurrencyShape: "Un code de devise n'est vérifié que sur sa forme.",
          tCurrencyShapeWhy:
            "Il n'existe dans le produit aucune liste faisant autorité de véritables codes de devise à laquelle comparer, et un espace de travail peut légitimement avoir besoin de n'importe lequel des quelque 180 codes réels. Trois lettres majuscules constituent donc toute la vérification, et un code bien formé mais inexistant tel que ZZZ passe.",
          tCurrencyPlain: "Currency stocke un montant simple, jamais des unités mineures.",
          tCurrencyPlainWhy:
            "Cela suit la même convention que tout autre montant monétaire du produit. 100.50 est stocké comme 100.50, jamais comme 10050 — ce qui compte si vous lisez un jour les données brutes ou construisez un rapport dessus.",
          tDurationMinutes:
            "L'unité de Duration est toujours la minute, et elle n'a aucun maximum.",
          tDurationMinutesWhy:
            "La minute est la convention déjà utilisée par les parties planification et réservation du produit pour les données de type durée, et le formulaire libelle l'unité visiblement plutôt que de laisser un nombre nu. Seules les valeurs négatives sont refusées ; il n'y a aucune borne supérieure ni aucun moyen par champ d'en définir une.",
          tRatingSlider: "Un champ Rating non touché affiche son curseur sur 1 tout en étant vide.",
          tRatingSliderWhy:
            "Un curseur a toujours besoin d'un nombre réel pour positionner sa poignée. Rien n'est soumis tant que quelqu'un ne l'a pas réellement déplacé, donc le champ s'enregistre véritablement comme vide — mais il ressemble à un 1 tant qu'on ne le sait pas.",
          tRatingZero: "Un Rating de 0 est refusé plutôt que traité comme non noté.",
          tRatingZeroWhy:
            "Non noté signifie que le champ a été laissé véritablement vide. Un 0 explicitement soumis est une valeur réelle qui échoue à la vérification de 1 à 5 exactement comme le ferait un 6, et reçoit le même message.",
          tPhoneShape: "Phone valide la forme, pas si le numéro pourrait réellement exister.",
          tPhoneShapeWhy:
            "Le serveur ne vérifie que la grammaire internationale. Le sélecteur du formulaire vérifie en plus les chiffres par rapport au plan de numérotation réel du pays sélectionné, donc l'écart n'est accessible que depuis une requête qui contourne le formulaire — une limitation acceptée de qualité de donnée plutôt qu'une limitation de sécurité.",
          tPhoneFlag:
            "Le drapeau de pays affiché par Phone peut être erroné sur un indicatif partagé.",
          tPhoneFlagWhy:
            "Certains indicatifs sont partagés par plusieurs pays, et il n'existe aucune colonne de pays séparée — le drapeau est déduit du numéro lui-même. Le numéro stocké n'est pas affecté ; seul le drapeau à côté peut désigner le mauvais pays au sein d'un indicatif partagé.",
          tColorShorthand: "Color n'unifie jamais les formes à trois et à six chiffres.",
          tColorShorthandWhy:
            "Les deux sont valides et persistent toutes deux exactement telles que soumises, de sorte que la même couleur peut être stockée de deux façons selon les enregistrements. Seule la casse est normalisée, toujours en minuscules.",
          tTimeText:
            "Time est stocké comme du texte canonique plutôt que comme une heure de base de données.",
          tTimeTextWhy:
            "Un choix de stockage délibéré, fait pour éviter de reproduire un problème de tri connu que subit une colonne d'heure existante ailleurs dans le produit sur une base de données. Une saisie sans zéros de tête est acceptée et normalisée, de sorte que deux écritures de la même heure convergent toujours.",
          tPercentStorage:
            "Percent stocke le nombre que vous diriez à voix haute, pas une fraction.",
          tPercentStorageWhy:
            "25 est stocké comme 25 et affiché comme 25%. Ce n'est jamais 0.25, et l'affichage ajoute simplement le signe plutôt que de faire tourner un formateur basé sur les fractions, spécifiquement pour qu'un 25 ne puisse jamais s'afficher comme 2500%.",
          tTextNotTrimmed: "Text ne supprime pas les espaces qui l'entourent ; Select le fait.",
          tTextNotTrimmedWhy:
            "Une valeur Text est stockée exactement telle que soumise, car un espace en début ou en fin peut avoir un sens dans du texte libre. Une valeur Select est épurée des deux côtés avant d'être comparée aux options, de sorte qu'une espace égarée ne provoque jamais un rejet inattendu.",
          tOracleBytes:
            "Un long texte arabe peut être refusé en dessous du plafond de caractères annoncé sur une base de données.",
          tOracleBytesWhy:
            "Le plafond de 4 000 caractères de Text est un décompte de caractères exact sur deux des trois bases de données prises en charge. Sur la troisième, il est compté en octets, donc un texte multi-octets — l'arabe compris — peut atteindre la limite plus tôt. Utilisez LongText si vous êtes proche de cette limite.",

          referencesTitle: "Comportements des références",
          fNoStoredName: "Une référence ne stocke jamais le nom de l'enregistrement qu'elle cible.",
          fNoStoredNameWhy:
            "Un nom stocké se trouverait à l'intérieur de l'enregistrement portant le champ, et serait donc lisible par quiconque peut lire cet enregistrement — alors que le nom lui-même est protégé par la propre permission de la cible. Il n'existe aucun paramètre pour activer cela, et il n'y en aura pas. Le bénéfice compensatoire est qu'un nom corrigé sur son propre enregistrement est corrigé partout où il est référencé, immédiatement.",
          fIdOpaque:
            "L'identité de l'enregistrement référencé est opaque et doit faire l'aller-retour inchangée.",
          fIdOpaqueWhy:
            "C'est la clé d'un autre module, chiffrée pour le transport, et rien dedans n'est destiné à être lu ou remanié. Un seul caractère modifié, et le produit signale à juste titre que la référence stockée est mal formée. Renvoyez exactement la chaîne que vous avez reçue.",
          fSameNames:
            "Une référence est écrite sous les deux mêmes noms que ceux sous lesquels elle est lue.",
          fSameNamesWhy:
            "Il n'existe aucune asymétrie entre la forme de lecture et la forme d'écriture. Quiconque intègre avec l'API des valeurs doit reprendre les deux noms de propriété qui lui ont été donnés ; inventer un nom différent pour l'identité à l'entrée produit un enregistrement ne portant aucun pointeur du tout, ensuite refusé comme référence incomplète.",
          fFiveFailures:
            "Une référence qui ne s'affiche pas indique lequel de cinq événements s'est produit.",
          fFiveFailuresWhy:
            "Aucune permission, enregistrement disparu, valeur mal formée, une recherche qui vient d'échouer, et un type d'enregistrement pour lequel cette installation ne peut pas répondre : cinq problèmes différents avec cinq remèdes différents. Les rendre tous comme un champ vide est ce qui laisserait un pointeur vers un enregistrement supprimé passer inaperçu pendant un an.",
          fMergedAnswers:
            "« Supprimé » et « dans un espace de travail que vous ne pouvez pas voir » sont une seule réponse.",
          fMergedAnswersWhy:
            "Les distinguer permettrait à quelqu'un de tester des identités une par une pour découvrir ce qui existe dans un autre espace de travail. « Vous n'êtes pas autorisé à consulter ce type d'enregistrement » est distingué des deux, car cela décrit le propre accès du lecteur et ne révèle rien.",
          fDeleteClears:
            "Supprimer un enregistrement référencé efface chaque pointeur vers lui et conserve chaque ligne de valeur.",
          fDeleteClearsWhy:
            "Les deux éléments de chaque réponse concernée sont effacés ensemble, jamais l'un sans l'autre. Rien n'est supprimé : la réponse conserve sa ligne, sa version et son historique, de sorte que le champ se lit ensuite comme véritablement vide plutôt que comme cassé.",
          fNoBacklinks: "Rien ne liste les références qui pointent vers un enregistrement donné.",
          fNoBacklinksWhy:
            "Il n'existe nulle part de vue « qu'est-ce qui pointe vers ceci ? », et supprimer un enregistrement ne vous avertit pas du nombre de pointeurs qu'il s'apprête à effacer. L'effacement est silencieux parce qu'il est sûr, pas parce qu'il est caché.",
          fLimitedTargets:
            "Seuls trois types d'enregistrement peuvent actuellement être référencés.",
          fLimitedTargetsWhy:
            "Membres du personnel, comptes utilisateurs et personnes de tiers — les types dont le module propriétaire fournit une liste consultable et vérifiée par permission. Tout le reste est refusé plutôt que répondu par une liste vide, car une liste vide ressemble à un résultat correct et dirait « il n'en existe aucun » alors que la vérité est « cela ne peut pas être demandé ».",
          fNoAdminTarget:
            "Les enregistrements d'administrateur ne peuvent absolument pas être référencés.",
          fNoAdminTargetWhy:
            "Un administrateur peut n'appartenir à aucun espace de travail — un administrateur de plateforme n'en a aucun — de sorte qu'un pointeur vers l'un d'eux pourrait franchir toutes les limites d'espace de travail du produit. Un champ User Reference en refuse un purement et simplement, et le formulaire de définition n'en propose jamais.",
          fUnpinnedIsLegal:
            "Laisser un champ de référence non épinglé est un état permanent et pris en charge.",
          fUnpinnedIsLegalWhy:
            "Cela signifie « tout type que cette personne peut référencer », et chaque réponse enregistre le type qu'elle a choisi. Cela ne doit jamais être lu comme « rien de configuré, donc rien de valide » — le formulaire d'enregistrement le gère en demandant d'abord le type d'enregistrement, puis l'enregistrement.",
          fPopulatedUnpinned:
            "Un champ non épinglé et rempli n'offre aucun moyen de changer le type d'enregistrement.",
          fPopulatedUnpinnedWhy:
            "Le propre type de la réponse stockée est utilisé pour le sélecteur, donc reprendre une sélection se limite à ce type. Vider le champ fait revenir le contrôle de type. Une limite réelle plutôt qu'un défaut, et la manifestation de cette fonctionnalité la plus susceptible d'être signalée comme telle.",
          fNotExported: "Un type cible épinglé ne figure pas dans l'export des définitions.",
          fNotExportedWhy:
            "La feuille de calcul compte 18 colonnes et aucune n'est le type cible, donc une définition exportée n'enregistre pas ce vers quoi pointe son champ.",
          fSingleValue: "Un champ de référence contient exactement un pointeur.",
          fSingleValueWhy:
            "Il n'existe aucun type de référence à valeurs multiples. Deux réponses signifient deux champs, et Multi-Select ne peut pas pointer vers des enregistrements — ses réponses sont du texte que vous avez rédigé.",

          optionsTitle: "Comportements des options",
          oTextIsValue: "Le texte anglais de l'option est la réponse stockée.",
          oTextIsValueWhy:
            "Il n'existe aucun code séparé derrière une option, donc renommer l'une d'elles change ce qu'affiche chaque enregistrement existant. Préférez ajouter une nouvelle option et retirer l'ancienne quand la distinction compte.",
          oCaseSensitive: "La comparaison des options est exacte et sensible à la casse.",
          oCaseSensitiveWhy:
            "Deux options qui ne diffèrent que par la casse forment une paire légitimement distincte, et ignorer la casse les ferait entrer en collision. Les deux côtés sont d'abord épurés de leurs espaces, donc seules la casse et le contenu comptent.",
          oEnglishStored: "Le libellé arabe d'une option est réservé à l'affichage.",
          oEnglishStoredWhy:
            "Les deux listes de libellés sont associées ligne par ligne, et c'est la liste anglaise qui est écrite sur l'enregistrement et validée contre elle. Un lecteur arabophone voit de l'arabe à l'entrée comme à la sortie ; la donnée sous-jacente reste une valeur unique et cohérente.",
          oNoSharedSets:
            "La liste d'options intégrée d'un champ lui est propre — en partager une est une étape distincte et délibérée.",
          oNoSharedSetsWhy:
            "Rédiger une liste Options sur un champ la garde privée à ce champ ; elle n'est pas automatiquement réutilisée ailleurs. Une liste de pays dont ont besoin trois champs n'a toutefois plus besoin d'être écrite et maintenue trois fois — liez plutôt les trois au même Option Set partagé et versionné, et une modification ultérieure de ce jeu met à jour tous les champs liés ensemble.",

          groupsTitle: "Comportements des groupes de champs",
          gStableKeyFixed: "La clé stable d'un groupe ne peut jamais être changée, par personne.",
          gStableKeyFixedWhy:
            "Le schéma exporté nomme un groupe par cette clé, donc un renommage transformerait silencieusement une future réimportation d'une mise à jour en une création, contre un ensemble déjà livré. Une clé incorrecte signifie recréer le groupe.",
          gReorderCeiling:
            "La réorganisation refuse plus de 100 groupes sur un même type d'enregistrement.",
          gReorderCeilingWhy:
            "Une requête de réorganisation transporte tout l'ensemble d'un coup. Au-delà de 100, aucun groupe de ce type d'enregistrement ne peut plus être déplacé du tout — l'écran le signale plutôt que d'échouer de façon générique.",
          gGlobalOrdering:
            "Un espace de travail ne peut pas positionner son groupe par rapport à un groupe global.",
          gGlobalOrderingWhy:
            "La réorganisation est tout ou rien et refuse tout groupe que l'appelant ne possède pas, donc les propres groupes d'un espace de travail sont renumérotés à partir de zéro. Ces numéros peuvent entrer en collision avec ceux d'un groupe global, l'égalité se départage sur le libellé anglais, et l'effet visible est que déplacer votre groupe tout en haut peut le laisser en dessous d'un groupe global.",
          gSeparatePerms: "Les groupes de champs ont besoin de leurs propres permissions.",
          gSeparatePermsWhy:
            "Ils sont verrouillés séparément des définitions de champs, y compris une permission distincte pour la réorganisation. Un rôle détenant toutes les permissions de champs personnalisés ne les obtient pas automatiquement, et sans elles, le lien et le sélecteur sont simplement absents.",
          gOneEntityType: "Un groupe appartient à exactement un type d'enregistrement.",
          gOneEntityTypeWhy:
            "Rien n'est listé tant que vous n'avez pas choisi un type d'enregistrement, et changer le type d'enregistrement d'un champ efface son groupe, car un groupe d'un type n'est jamais valide pour un autre.",
          gUniquenessIndex:
            "Dans une base de données mise à niveau, l'unicité de la clé stable repose sur la vérification applicative.",
          gUniquenessIndexWhy:
            "Les groupes qui existaient avant les clés stables portent une clé vide jusqu'à l'exécution d'un rétro-remplissage, et la contrainte d'unicité au niveau de la base de données reste désactivée tant que cela ne s'est pas produit partout — sinon elle rejetterait la seconde de ces clés vides.",

          securityTitle: "Comportements de sécurité et de classification",
          sSensitivityLabel: "Sensitivity est un libellé, pas un contrôle d'accès.",
          sSensitivityLabelWhy:
            "Il est stocké, restitué et exploitable en reporting, et il ne change rien à qui peut lire une valeur. La sécurité au niveau du champ est le mécanisme qui restreint l'accès, et les deux sont indépendants.",
          sRestrictedByResource:
            "Les restrictions sont indexées par ressource de permission, pas par type d'enregistrement.",
          sRestrictedByResourceWhy:
            "C'est la même ressource qui protège déjà l'enregistrement lui-même, donc une seule liste de champs restreints couvre à la fois les champs intégrés d'un écran et ses champs personnalisés. Les noms sont comparés sans tenir compte de la casse.",
          sRestrictedInvisible: "Un champ restreint est absent, pas vide.",
          sRestrictedInvisibleWhy:
            "Afficher un espace réservé révélerait qu'une valeur existe, ce qui est déjà une information. La conséquence est qu'un champ restreint est indissociable d'un champ qui n'a jamais été défini — à retenir quand quelqu'un signale un champ manquant.",
          sRejectWholeSave: "Écrire dans un champ restreint refuse tout l'enregistrement.",
          sRejectWholeSaveWhy:
            "Ignorer silencieusement le seul champ concerné et rapporter un succès est l'échec le plus difficile à remarquer. Le refus se déclenche aussi quand la valeur soumise est égale à celle stockée, de sorte que personne ne peut sonder une valeur masquée en testant ce qui est accepté.",
          sRequiredExclusive: "Obligatoire et restreint ne peuvent pas être combinés.",
          sRequiredExclusiveWhy:
            "Quelqu'un qui ne peut pas voir un champ ne pourrait jamais le satisfaire, donc l'enregistrement lui serait impossible à sauvegarder. Les deux sens sont refusés, quel que soit celui tenté en premier, et le message nomme le champ.",
          sHistoryNoValues:
            "L'historique de définition n'affiche jamais les changements de valeur.",
          sHistoryNoValuesWhy:
            "Les inclure ferait de la boîte de dialogue une copie lisible des données de champs de tout le monde, contournant d'un coup la sécurité au niveau du champ et toute autre règle de visibilité. Les enregistrements porteurs de valeurs sont exclus nommément plutôt que par simple omission.",

          exportTitle: "Comportements d'export et de portabilité",
          eDefinitionsOnly:
            "L'export en feuille de calcul contient des définitions, jamais des réponses.",
          eDefinitionsOnlyWhy:
            "C'est par conception un export de définitions — un export des valeurs séparé existe, avec sa propre adresse et son propre bouton dans l'en-tête, pour les réponses elles-mêmes, plafonné à 10 000 cellules plutôt que tronqué au-delà.",
          eRefusesPastLimit:
            "Au-delà de 10 000 définitions, l'export refuse plutôt que de tronquer.",
          eRefusesPastLimitWhy:
            "Un fichier silencieusement tronqué est pire qu'aucun fichier, car il paraît complet. Le refus vous invite à restreindre l'export à un seul type d'enregistrement.",
          eRestrictedAbsent:
            "Les champs qui vous sont restreints sont absents du fichier, pas vides.",
          eRestrictedAbsentWhy:
            "La sécurité au niveau du champ s'applique à l'export exactement comme à l'écran, et une colonne vide révélerait quand même que le champ existe.",
          eNoImport:
            "L'export en feuille de calcul est à sens unique, et l'unique chemin de création en masse que ce produit ait jamais proposé est désactivé.",
          eNoImportWhy:
            "La feuille de calcul exportée est un rapport destiné à la lecture, pas un modèle réimportable. Un import d'ensemble de schéma portable, au format JSON, existe — avec sa propre boîte de dialogue, sa propre adresse, son propre tableau de résultats par groupe — mais chaque appel qui lui est fait est refusé avec un 409 par un interrupteur de confinement délibéré et permanent, aux côtés de l'export de schéma correspondant. La création de champs en masse n'est pas disponible dans le produit aujourd'hui, du fait de la conception même de cet interrupteur plutôt que par omission.",
          eTextCells: "Chaque cellule exportée est écrite comme du texte.",
          eTextCellsWhy:
            "Un libellé commençant par =, +, - ou @ arrive comme des caractères littéraux plutôt que comme une formule de tableur. C'est catégorique plutôt qu'un filtrage de cas connus, de sorte que rien qui ressemble à un calcul ne puisse en devenir un.",

          reachTitle: "Où les champs apparaissent, et où ils n'apparaissent pas",
          rApiOnlyTypes: "Certains types d'enregistrement n'ont aucun écran du tout.",
          rApiOnlyTypesWhy:
            "Ce sont des cibles légales, listées en dernier sur le formulaire de définition avec un suffixe API only. Un champ défini contre l'un d'eux est accessible via l'API et n'a nulle part où s'afficher dans l'interface.",
          rHandRolledForms: "Une poignée d'écrans câblent leurs champs personnalisés à la main.",
          rHandRolledFormsWhy:
            "La plupart des écrans récupèrent automatiquement les champs personnalisés. Quelques-uns dont les interfaces de création et de modification précèdent ce mécanisme — parmi eux les webhooks, les modèles de message, les forfaits de tenant, les définitions de plugin, les prospects et les thèmes — implémentent eux-mêmes la même section Champs personnalisés. Le comportement devrait être identique ; si ce n'est pas le cas, cela mérite d'être signalé.",
          rDsrCreateOnly:
            "Les demandes de personne concernée ne prennent les champs personnalisés qu'à la création.",
          rDsrCreateOnlyWhy:
            "Une demande soumise traverse un flux de révision plutôt que d'être généralement modifiable, il n'existe donc aucun formulaire de modification pour y porter des champs personnalisés. C'est voulu, pas un oubli.",
          rDialogForms:
            "La plupart des formulaires de création et de modification d'enregistrement restent des boîtes de dialogue.",
          rDialogFormsWhy:
            "La rédaction des champs personnalisés elle-même est sortie d'une boîte de dialogue imbriquée pour rejoindre un panneau latéral, ce qui explique pourquoi ajouter un champ depuis l'intérieur d'un enregistrement n'empile plus deux boîtes de dialogue. Les formulaires d'enregistrement environnants ont été délibérément laissés tels quels — les déplacer est un changement bien plus large, à travers des modules qui n'ont rien à voir avec les champs personnalisés.",
          rNoSidebarEntry:
            "Les écrans Types de valeur et Types d'entité n'ont aucune entrée de menu latéral.",
          rNoSidebarEntryWhy:
            "La navigation du menu latéral est initialisée de façon centralisée, et ces deux écrans en ont été délibérément exclus. Ils sont accessibles depuis des liens dans l'en-tête de la page Champs personnalisés à la place.",

          absentTitle: "Ce que le produit ne fait pas",
          absentIntro:
            "Assez souvent demandé pour mériter d'être énoncé clairement. Aucun de ces points n'est un défaut à signaler.",
          absent1:
            "Les vingt-deux types de valeur forment l'ensemble complet. Deux éléments qui figuraient autrefois sur cette liste n'y sont plus : File et Image stockent un fichier ou une image téléversés, et RichText stocke une prose mise en forme — voir la page Types de valeur. Rattacher une nouvelle valeur File ou Image n'est cependant pas encore possible depuis le produit ; les deux peuvent être définis dès aujourd'hui, et une valeur existante ne peut être que consultée ou effacée.",
          absent2:
            "L'export des valeurs refuse plutôt que de tronquer dès qu'une requête dépasserait 10 000 cellules — exportez une tranche d'enregistrements plus étroite plutôt que d'espérer un fichier partiel.",
          absent3:
            "Il existe un chemin de création en masse, un import d'ensemble de schéma portable au format JSON avec sa propre boîte de dialogue — mais il est actuellement désactivé, refusant purement et simplement chaque appel plutôt que de réellement créer quoi que ce soit, aux côtés de son export de schéma correspondant. Aujourd'hui, en pratique, les champs se créent encore un par un, sur le formulaire.",
          absent4:
            "Une version d'option set publiée ne déplace pas automatiquement les champs déjà liés à une version antérieure — un administrateur relie chaque champ explicitement. C'est délibéré : suivre automatiquement changerait silencieusement le sens des valeurs déjà enregistrées sous l'ancienne liste.",
          absent5:
            "Il n'existe aucun affichage ou masquage conditionnel qu'un administrateur puisse configurer. Un champ est soit sur le formulaire, soit non, sous réserve d'Active et de la sécurité au niveau du champ.",
          absent6:
            "Il n'existe ni calcul, ni valeur par défaut, ni règle inter-champs. Un champ personnalisé enregistre une réponse ; il n'en déduit aucune.",
          absentInfoTitle: "Si vous avez besoin de l'un de ces éléments",
          absentInfoContent:
            "Faites-le savoir à qui possède votre feuille de route produit plutôt que de le contourner d'une façon qui vous coûte des données. Recréer un champ pour changer quelque chose de définitif détruit les réponses déjà stockées pour lui, et c'est précisément l'erreur coûteuse que cette page existe pour prévenir.",
        },

        // ═══════════════════════════════════════════════════
        //  Jeux d'options (listes partagées et versionnées)
        // ═══════════════════════════════════════════════════
        optionSets: {
          title: "Jeux d'options",
          description:
            "Des listes de choix réutilisables et versionnées. Faites pointer plusieurs champs vers un même jeu, et chaque champ qui l'utilise change ensemble.",
          intro:
            "Un jeu d'options (option set) est une collection nommée et versionnée de choix que plusieurs champs personnalisés Select et MultiSelect partagent. Plutôt que chaque champ entretienne sa propre liste d'options intégrée et privée, les champs se lient à une version de jeu d'options. Quand les besoins métier évoluent, un administrateur crée une nouvelle version, met à jour les choix, et la publie — mettant immédiatement à jour chaque champ lié à travers le produit, sans mise à jour manuelle champ par champ.",
          whenToUseTitle: "Quand utiliser un jeu d'options plutôt que des options intégrées",
          whenToUseContent:
            "Utilisez un jeu d'options chaque fois que la même liste de choix est nécessaire sur plus d'un champ (par exemple, des codes pays, des niveaux de priorité, ou des listes de départements), ou quand vous avez besoin d'un historique de versions auditable et d'une publication par étapes. Utilisez des options intégrées quand une liste de choix est propre à un seul champ et ne sera jamais réutilisée.",

          kindsTitle: "Trois types de jeux d'options",
          kindsIntro:
            "SCRIPE distingue trois types de jeux d'options selon leur origine, leur propriétaire, et leurs règles de modification :",
          thKind: "Type",
          thOwner: "Propriétaire",
          thWhoCanEdit: "Qui peut modifier",
          thScope: "Portée",
          kindSeeded: "Prédéfini (maintenu par la plateforme)",
          ownerPlatform: "Plateforme",
          editNobody: "Personne (lecture seule)",
          scopeGlobal: "Global (tous les tenants)",
          kindPlatform: "Créé par la plateforme",
          editPlatformAdmin: "Administrateurs de la plateforme",
          scopeGlobalOrTenant: "Portée globale ou tenant",
          kindTenant: "Créé par le tenant",
          ownerTenant: "Tenant",
          editTenantAdmin: "Administrateurs du tenant",
          scopeTenantOnly: "Espace de travail du tenant uniquement",
          seededReadOnlyTitle: "Pourquoi les jeux prédéfinis sont en lecture seule",
          seededReadOnlyContent:
            "Les jeux prédéfinis (tels que les codes pays ISO 3166-1 et les devises ISO 4217) sont marqués comme gérés par le système. Le serveur refuse strictement toute action de modification — créer des versions brouillon, modifier des options, publier, ou supprimer — pour tout le monde, Super Admins compris. Si vous avez besoin d'une variante personnalisée d'une liste prédéfinie, créez plutôt votre propre jeu de tenant ou de plateforme.",

          lifecycleTitle: "Cycle de vie et états des versions",
          lifecycleIntro:
            "Chaque jeu d'options gère ses choix à travers des versions immuables. Une version traverse quatre états distincts de cycle de vie :",
          thStatus: "Statut",
          thMeaning: "Signification",
          thNextState: "État suivant",
          statusDraft: "Brouillon",
          meaningDraft:
            "Version brouillon modifiable. Les choix peuvent être ajoutés, mis à jour, réordonnés ou désactivés. Non visible sur les formulaires d'enregistrement actifs tant qu'elle n'est pas publiée.",
          nextDraft: "Published (via l'action Publish)",
          statusPublished: "Publié",
          meaningPublished:
            "La version active et en direct. Les champs liés affichent exactement ces choix sur les formulaires de création et de modification. Immuable.",
          nextPublished: "Deprecated (quand un brouillon plus récent est publié)",
          statusDeprecated: "Déprécié",
          meaningDeprecated:
            "Remplacé par une version publiée plus récente. Les enregistrements historiques référençant des choix de cette version continuent de s'afficher correctement. Ne peut plus être lié à de nouveaux champs.",
          nextDeprecated: "Archived (au retrait)",
          statusArchived: "Archivé",
          meaningArchived:
            "Retiré définitivement de l'usage actif. Conservé strictement pour l'historique d'audit. Immuable.",
          nextArchived: "Aucun (état terminal)",
          lifecycleOnlyOnePublished:
            "Exactement une version peut être Published à tout moment. Publier un brouillon déprécie automatiquement la version publiée en place en une seule opération atomique.",
          publishSwapTitle: "Bascule atomique de publication",
          publishSwapContent:
            "Quand vous publiez un nouveau brouillon, la version publiée actuelle est immédiatement remplacée et marquée Deprecated. Aucune donnée n'est perdue : les enregistrements ayant précédemment stocké des valeurs de l'ancienne version restent intacts et affichent leurs libellés stockés.",

          draftTitle: "Créer et modifier une version brouillon",
          draftIntro:
            "Pour ajouter ou modifier des choix dans un jeu d'options, suivez le flux de versionnage par étapes :",
          draft1:
            "Cliquez sur Create draft version dans le panneau de détail du jeu d'options. Un nouveau brouillon est initialisé.",
          draft2:
            "Saisissez une Key unique et un libellé anglais pour chaque option. Les deux sont obligatoires avant que l'enregistrement ne soit possible. Vous pouvez facultativement fournir des libellés arabes, des teintes de couleur, des clés d'icône, et des ordres de tri.",
          draft3:
            "Cliquez sur Save draft pour enregistrer la liste d'options. Le brouillon est sauvegardé sur le serveur mais reste invisible pour les formulaires d'enregistrement actifs.",
          draft4:
            "Quand vous êtes prêt, cliquez sur Publish version. La version devient active et tous les champs liés proposent immédiatement les choix mis à jour.",
          draftSaveHintTitle: "Exigences de validation d'un brouillon",
          draftSaveHintContent:
            "Un brouillon exige au moins une option valide avec une Key et un libellé anglais non vides. Chaque Key doit être unique au sein de la version. Le bouton Save draft s'active automatiquement dès que toutes les lignes satisfont ces règles de validation.",

          bindingTitle: "Lier des champs à un jeu d'options",
          bindingIntro:
            "Les champs de type de valeur Select ou MultiSelect peuvent se lier à un jeu d'options plutôt que d'entretenir des options intégrées — soit rattaché dès la même étape que la création du champ, sur le formulaire de création lui-même, soit ensuite, sur un champ déjà existant, via l'une de trois actions de cycle de vie :",
          thAction: "Action",
          thWhatItDoes: "Ce qu'elle fait",
          thEffect: "Effet sur les données existantes",
          actionBind: "Bind",
          doingBind:
            "Attache une définition de champ personnalisé à la version publiée d'un jeu d'options.",
          effectBind:
            "Le champ passe des options intégrées aux choix du jeu d'options. Les valeurs déjà enregistrées sont préservées.",
          actionSwitch: "Switch version",
          doingSwitch:
            "Fait pointer un champ lié vers une version publiée plus récente du même jeu d'options ou d'un autre.",
          effectSwitch:
            "Le champ commence à proposer les choix de la nouvelle version. Les enregistrements historiques continuent d'afficher les options précédemment sélectionnées.",
          actionDetach: "Detach (dissocier)",
          doingDetach:
            "Retire la liaison au jeu d'options, faisant revenir le champ à des options intégrées autonomes.",
          effectDetach:
            "Le champ cesse d'interroger le jeu d'options. Les valeurs enregistrées restent intactes.",
          switchCautionTitle: "Stabilité de la liaison",
          switchCautionContent:
            "Lors d'une dissociation ou d'un changement de jeu d'options, assurez-vous que les valeurs déjà enregistrées restent compatibles avec les nouvelles clés de choix. Désactiver une option plutôt que de retirer sa clé garantit que les enregistrements historiques s'affichent sans interruption.",

          platformAdminTitle: "Capacités de l'administrateur de plateforme",
          platformAdminIntro:
            "Les Super Administrateurs de la plateforme opèrent avec des droits de gouvernance élevés à l'échelle du système :",
          platformAdmin1:
            "Créer des jeux d'options globaux partagés entre tous les espaces de travail des tenants.",
          platformAdmin2:
            "Créer et publier de nouvelles versions pour les jeux d'options détenus par la plateforme (non prédéfinis).",
          platformAdmin3:
            "Gérer la disponibilité des jeux d'options à travers les frontières multi-tenants.",
          platformAdmin4:
            "Inspecter les chaînes de versions et les journaux d'audit de tous les jeux d'options à l'échelle de la plateforme.",
          platformAdmin5:
            "Respecter les frontières gérées par le système : les jeux prédéfinis maintenus par la plateforme restent immuables, même pour les administrateurs de plateforme.",
          platformContextTitle: "Détection du contexte plateforme",
          platformContextContent:
            "Quand vous opérez dans la console de gestion de la plateforme (sans être entré dans un tenant précis), les jeux d'options nouvellement créés adoptent automatiquement la portée Global par défaut, les rendant accessibles à tous les environnements de tenant.",

          rulesTitle: "Règles opérationnelles clés à retenir",
          rule1:
            "Les jeux d'options sont versionnés, pas modifiés directement : les choix se modifient en créant un brouillon et en le publiant.",
          rule2:
            "Les clés sont des identifiants permanents : une fois qu'une option est publiée avec une clé, ne changez pas cette clé dans les versions suivantes si vous voulez que les valeurs existantes restent correspondantes.",
          rule3:
            "Désactivez plutôt que de supprimer : désactiver une option l'empêche d'être proposée sur les nouveaux formulaires tout en la préservant sur les enregistrements historiques.",
          rule4:
            "Une seule version publiée : une seule version est active à la fois ; publier un brouillon déprécie automatiquement la version précédente.",
          rule5:
            "Les jeux gérés par le système sont strictement en lecture seule : les jeux standard prédéfinis ne peuvent être modifiés par aucun utilisateur ni administrateur.",
        },
        encryption: {
          title: "Gestion des clés et chiffrement d'enveloppe",
          description:
            "Chiffrement d'enveloppe multi-tenant d'entreprise, rotation du trousseau racine de la plateforme, liaison AAD du texte chiffré et ré-emballage sans indisponibilité.",
          intro:
            "Lors du stockage de champs personnalisés confidentiels ou secrets — tels que les identifiants fiscaux, jetons biométriques, données bancaires ou habilitations de sécurité — SCRIPE applique un chiffrement d'enveloppe de niveau matériel. Chaque valeur est protégée par AES-256-GCM avec des clés cryptographiques uniques par tenant dérivées via HKDF-SHA256 à partir du trousseau racine actif de la plateforme. Le texte chiffré ne peut être falsifié ni déchiffré sous un autre tenant, et peut être ré-emballé en toute sécurité lors des rotations de clés sans aucune indisponibilité.",
          archNoticeTitle: "Modèle Zero-Trust pour entreprise",
          archNoticeContent:
            "Le chiffrement n'est pas un simple masquage cosmétique en base de données : le texte chiffré est lié cryptographiquement à son tenant, son entité et sa définition de champ via les données authentifiées supplémentaires (AAD) de l'AES-GCM. Si un attaquant modifie un seul octet ou copie le texte chiffré vers un autre enregistrement, l'authentification échoue immédiatement.",
          archTitle: "Architecture cryptographique centrale",
          archIntro:
            "Le sous-système de chiffrement s'articule autour de cinq couches de sécurité résilientes :",
          featKeyringTitle: "Trousseau racine multi-versions",
          featKeyringDesc:
            "Clé active de plateforme pour les nouvelles écritures et catalogue de clés historiques conservées pour des lectures fluides sans interruption.",
          featDerivationTitle: "Dérivation HKDF par tenant",
          featDerivationDesc:
            "Clés secrètes isolées par tenant dérivées de façon déterministe par HKDF-SHA256 avec sel de code tenant et balises applicatives.",
          featEnvelopeTitle: "Cadre binaire Magic Frame v2",
          featEnvelopeDesc:
            "En-tête binaire compact codant la version, l'ID de clé de plateforme, la version de clé tenant, un vecteur de 96 bits et une balise d'authentification de 128 bits.",
          featAadTitle: "Liaison cryptographique AAD",
          featAadDesc:
            "Le texte chiffré est lié mathématiquement à TenantId, EntityId et FieldDefinitionId, empêchant les attaques par injection inter-entités.",
          featRewrapTitle: "Migration par ré-emballage direct",
          featRewrapDesc:
            "Un travailleur en arrière-plan parcourt la base de données par lots de curseurs pour ré-emballer les données sous les nouvelles clés sans verrouillage de tables.",
          featCliTitle: "Opérations unifiées CLI et Studio",
          featCliDesc:
            "Gestion opérationnelle complète via `scripe crypto` et le tableau de bord visuel SCRIPE Studio.",
          dualEnvelopeTitle: "Dérivation de clé fractionnée à double enveloppe",
          dualEnvelopeIntro:
            "SCRIPE applique une séparation cryptographique à divulgation nulle de connaissance (Zero-Knowledge) entre les opérateurs et les données des locataires :",
          thComponent: "Composant de clé",
          thCustodian: "Stockage et garde",
          thRole: "Responsabilité cryptographique",
          compPlatformKey: "KEK maître de plateforme",
          custPlatform: "Environnement d'hôte / KMS (`.env`)",
          rolePlatformKey:
            "Root Key Encryption Key (KEK). Chiffre les secrets des locataires au repos. Les opérateurs ne peuvent pas lire les données sans le secret du locataire.",
          compTenantSecret: "Secret cryptographique du locataire",
          custTenantDb: "Base de données du locataire (`EncryptedTenantSecret`)",
          roleTenantSecret:
            "Secret CSPRNG unique de 256 bits par locataire. Stocké chiffré sous la clé KEK active de la plateforme.",
          compSplitDek: "Clé de chiffrement des données dérivée (DEK)",
          custRuntimeMemory: "Mémoire volatile uniquement (HKDF)",
          roleSplitDek:
            "Dérivée à l'exécution via HKDF-SHA256 par combinaison de la clé plateforme et du secret locataire. Jamais conservée sur disque.",
          compAadBinding: "Étiquette AAD contextuelle",
          custCipherEngine: "Enveloppe AES-256-GCM",
          roleAadBinding:
            "Lie cryptographiquement le texte chiffré à TenantId, EntityId et FieldId, empêchant les attaques par rejeu inter-entités.",
          autoProvisionTitle: "Provisionnement automatique instantané",
          autoProvisionContent:
            "Lors de la création d'un locataire, `ITenantCryptographicProvisioner` provisionne automatiquement un secret de 256 bits enveloppé sous la clé active. Les locataires peuvent immédiatement créer des champs confidentiels.",
          frameTitle: "Spécification de transmission Magic Frame v2",
          frameIntro:
            "Les valeurs chiffrées sont persistées sous forme de trames binaires compactes encodées en base64 conformes à la spécification v2 :",
          thByteOffset: "Décalage d'octets",
          thField: "Champ d'en-tête",
          thLength: "Longueur",
          thDescription: "Rôle cryptographique",
          descVersion: "Octet de version Magic Frame (0x02 pour les trames authentifiées v2).",
          descPlatformKey:
            "Entier 32 bits (Big-endian) identifiant la clé racine de plateforme dans le trousseau.",
          descTenantVersion:
            "Entier 16 bits (Big-endian) identifiant la version de rotation de clé du tenant.",
          descNonce:
            "Vecteur d'initialisation aléatoire cryptographiquement sûr de 96 bits généré par opération.",
          descAuthTag:
            "Balise d'authentification GCM de 128 bits vérifiant l'intégrité du texte chiffré et de l'AAD.",
          descCiphertext: "Données utiles du champ chiffrées en AES-256-GCM.",
          aadTitle: "Données authentifiées supplémentaires (AAD)",
          aadContent:
            "Pendant le chiffrement et le déchiffrement, le moteur transmet `tenantId:entityId:fieldDefinitionId` comme données authentifiées supplémentaires (AAD) au chiffreur GCM. Cela garantit qu'un numéro fiscal chiffré de l'entreprise A ne peut être copié par un administrateur indélicat dans les dossiers de l'entreprise B, ni déplacé vers un autre champ du même enregistrement.",
          lifecycleTitle: "Cycle de vie des clés et verrous stricts",
          lifecycleIntro:
            "Les opérations sur les clés de tenant suivent un cycle de vie strict et auditable conçu pour empêcher toute fuite de données non chiffrées :",
          step1Title: "1. Verrou obligatoire d'initialisation",
          step1Content:
            "Les administrateurs ne peuvent pas créer de champs personnalisés 'Confidentiel' ou 'Secret' tant que la clé cryptographique du tenant n'est pas initialisée. Le validateur d'API applique cette règle côté serveur.",
          step2Title: "2. Rotation de clé sans indisponibilité",
          step2Content:
            "La rotation d'une clé génère la version N+1 pour les nouvelles écritures tandis que la version N reste active dans le trousseau. Les enregistrements historiques restent instantanément lisibles.",
          step3Title: "3. Ré-emballage en tâche de fond non bloquante",
          step3Content:
            "Un service d'arrière-plan (`TenantKeyRewrapJob`) analyse les enregistrements par lots de curseurs, déchiffre avec les clés historiques et ré-encrypte avec la version active N+1.",
          step4Title: "4. Piste d'audit cryptographique",
          step4Content:
            "Chaque création, rotation, révocation de clé et chaque révélation de valeur de champ est enregistrée de façon immuable avec identité, adresse IP et horodatage.",
          rewrapTitle: "Moteur de migration par ré-emballage en direct",
          rewrapIntro:
            "Les jeux de données d'entreprise à grande échelle nécessitent une migration des clés sans coupure ni verrouillage de tables :",
          thStrategy: "Stratégie opérationnelle",
          thBehavior: "Implémentation du moteur",
          stratLocking: "Zéro verrouillage de table",
          behLocking:
            "Utilise une pagination par curseur et une concurrence optimiste (`RowVersion`) pour mettre à jour les lignes sans verrou exclusif.",
          stratBatching: "Traitement par lots configurable",
          behBatching:
            "Traite 500 enregistrements par itération, régulant l'exécution pour préserver les performances I/O en production.",
          stratResilience: "Résistant aux pannes et idempotent",
          behResilience:
            "En cas de redémarrage du processus, le curseur reprend au dernier décalage validé. Les enregistrements déjà migrés sont ignorés.",
          stratObservability: "Métriques et progression en temps réel",
          behObservability:
            "Transmet le nombre de réussites, d'échecs et le pourcentage d'avancement au tableau de bord Studio et au portail d'administration.",
          stratCluster: "Ré-enveloppement de cluster de plateforme",
          behCluster:
            "Migration initiée par le SuperAdmin ré-enveloppant tous les secrets des locataires sous la nouvelle clé plateforme et mettant à jour les données sans interruption.",
          toolingTitle: "Interfaces de gestion",
          toolingIntro:
            "Les opérateurs et développeurs disposent de trois interfaces complémentaires pour administrer le chiffrement :",
          toolPortal:
            "Portail de sécurité du tenant : interface web à `/custom-fields/security` pour la rotation autonome et le suivi du ré-emballage.",
          toolCli:
            "SCRIPE CLI : outillage en ligne de commande complet via `scripe crypto status`, `rotate`, `rewrap`, `verify` et `revoke`.",
          toolStudio:
            "SCRIPE Studio : tableau de bord interactif à `/crypto` avec tables de trousseaux et barres de progression en direct.",
        },
      },
    },
  },
};
