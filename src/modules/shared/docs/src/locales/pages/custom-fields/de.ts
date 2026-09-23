// FILE-EXCEPTION: file length
/**
 * Exported constant defining parameters and fields for de configurations.
 *
 * Custom Fields product documentation — German (de). Eleven pages under the
 * Custom Fields section of the docs portal. Namespaced under
 * modules.customFields.docs so it never collides with the developer-facing
 * modules.customFields.overview page.
 *
 * Translation conventions used throughout this file:
 *
 * - Identifiers stay in Latin script and untranslated: entity-type registry
 *   keys such as hrms.staff-member, party.person, identity.user, media.file;
 *   machine error codes such as VALIDATION_REQUIRED, AUTH_FORBIDDEN,
 *   ENTITY_INVALID_ID; JSON/wire-shape property names such as entityTypeKey
 *   and entityId; and quoted literal example inputs that test an exact string
 *   match (an email address, a phone number, a hex colour, an IBAN, a postal
 *   code). Only the prose around them is translated.
 * - The twenty-two value-type names (Text, LongText, Select, MultiSelect,
 *   Number, Percent, Rating, Currency, Duration, Date, DateTime, Time, Email,
 *   Url, Phone, Boolean, Color, EntityReference, UserReference, File, Image,
 *   RichText) are given in English throughout, because they are the literal
 *   names shown in the interface the product itself currently uses — there is
 *   no German-localised build of the custom-fields screens to translate them
 *   against yet. The same applies to specific form controls, buttons and
 *   status labels quoted from that interface (Required, Active, Sort Order,
 *   Target Entity Type, Save, Add, Draft, Published, and so on).
 * - "Custom Field" / "Custom Fields" is translated throughout as
 *   "benutzerdefiniertes Feld" / "benutzerdefinierte Felder", and the page and
 *   screen names built around that subject (Value Types, Field Groups, Option
 *   Sets, and so on) are translated into natural German, since those are
 *   section names that belong to this docs portal rather than quotes from an
 *   English-only screen.
 * - "Workspace" is Arbeitsbereich and "record" is Datensatz, matching the
 *   rest of this docs portal.
 */
export const de = {
  modules: {
    customFields: {
      docs: {
        // ═══════════════════════════════════════════════════
        //  Benutzerdefinierte Felder (Startseite des Abschnitts)
        // ═══════════════════════════════════════════════════
        home: {
          title: "Benutzerdefinierte Felder",
          description:
            "Fügen Sie den Datensätzen, die Sie bereits verwenden, eigene Felder hinzu — was ein benutzerdefiniertes Feld ist, woraus es besteht, wie sein Geltungsbereich festgelegt wird und wo Sie die übrige Dokumentation finden.",
          intro:
            "Mit benutzerdefinierten Feldern fügen Sie den Datensätzen, mit denen Sie ohnehin arbeiten, eigene Informationen hinzu — eine Nationalität bei einer Person, den bevorzugten Fuß bei einem Spieler, eine Bestellnummer bei einer Buchung — ohne auf ein Release zu warten und ohne dass jemand Code schreiben muss. Sie definieren das Feld einmal auf dem Bildschirm Benutzerdefinierte Felder, und von diesem Moment an zeigt jedes Erstellungs- und Bearbeitungsformular für diese Art von Datensatz es an, die Datensatzliste erhält dafür eine Spalte, und der eingegebene Wert wird bei genau diesem Datensatz gespeichert.",
          valueInfoTitle: "In einem Satz",
          valueInfoContent:
            "Ein benutzerdefiniertes Feld ist eine Frage, die Sie sich entscheiden, zu einem Datensatz zu stellen: einmal von einem Administrator definiert und von da an von jedem beantwortet, der diesen Datensatz ausfüllt.",

          whatTitle: "Was Sie bekommen",
          whatIntro:
            "Benutzerdefinierte Felder sind keine frei formulierbare Notizbox, die seitlich an einen Datensatz angeflanscht ist. Jedes ist ein echtes, typisiertes, benanntes Feld mit eigenen Validierungsregeln, einem eigenen Platz im Formular, einer eigenen Spalte in der Liste und einem eigenen Prüfpfad.",
          featDefineOnce: "Einmal definiert, überall verwendet",
          featDefineOnceDesc:
            "Fügen Sie das Feld auf dem Bildschirm Benutzerdefinierte Felder hinzu, und jedes Erstellungs- und Bearbeitungsformular für diesen Datensatztyp übernimmt es, zusammen mit einer zusätzlichen Spalte in der Datensatzliste. Kein Release, kein Code, keine Wartezeit.",
          featTyped: "Geprüft beim Eingeben",
          featTypedDesc:
            "Jeder Werttyp hat seine eigenen Regeln — eine echte E-Mail-Adresse, eine Hex-Farbe, eine Bewertung von 1 bis 5 —, sodass ein falscher Wert mit einer konkreten Meldung zurückgewiesen wird, statt still gespeichert und erst sechs Monate später entdeckt zu werden.",
          featValueTypes: "Zweiundzwanzig Werttypen",
          featValueTypesDesc:
            "Text und langer Text, formatierter Rich Text, Einzel- und Mehrfachauswahl, Zahlen, Prozentsätze, Bewertungen, Geldbeträge, Zeitdauern, Datumsangaben, Datum und Uhrzeit mit echter Zeitzone, Uhrzeiten, E-Mail, Webadressen, Telefonnummern, Ja/Nein und Farbe — dazu eine Datei und ein Bild sowie zwei Typen, die überhaupt keinen Text speichern, sondern stattdessen auf einen Datensatz in einem anderen Teil des Produkts verweisen.",
          featScoped: "Ihr eigenes, oder das der ganzen Plattform",
          featScopedDesc:
            "Ein von Ihnen erstelltes Feld gehört ausschließlich Ihrem Arbeitsbereich. Plattformadministratoren können globale Felder anlegen, die jeder Arbeitsbereich erbt und die kein Arbeitsbereich bearbeiten oder löschen kann.",
          featSecured: "Feld für Feld einschränkbar",
          featSecuredDesc:
            "Eine Rolle oder eine Benutzergruppe kann ein bestimmtes Feld vor den Personen verbergen, die sie innehaben, und das Produkt lässt niemanden, der einen Wert nicht sehen darf, diesen durch Bearbeiten des umgebenden Datensatzes löschen.",
          featAccountable: "Nachvollziehbar",
          featAccountableDesc:
            "Jede Änderung an einer Definition wird mit Wer und Wann protokolliert, ein Nutzungsbericht zeigt Ihnen, wie viele Antworten ein Feld enthält, bevor Sie es löschen, und die gesamte Menge der Definitionen lässt sich in eine Tabellenkalkulation exportieren.",

          anatomyTitle: "Woraus ein Feld besteht",
          anatomyIntro:
            "Dies ist die vollständige Menge dessen, was eine Felddefinition trägt. Drei davon sind nach dem Speichern dauerhaft, weil bereits erfasste Antworten keinen Sinn mehr ergäben, wenn sie sich änderten. Namen von Bedienelementen werden so angegeben, wie sie in der englischsprachigen Oberfläche erscheinen.",
          thPart: "Einstellung",
          thWhat: "Was sie ist",
          thChange: "Später änderbar?",
          partEntityType:
            "Die Art von Datensatz, zu der das Feld gehört — Personen, Mitarbeitende, Buchungen und so weiter.",
          partKey:
            "Der maschinenlesbare Name, verwendet in Fehlermeldungen und Exporten. Kleinbuchstaben, beginnt mit einem Buchstaben, nur Buchstaben, Ziffern und Unterstriche.",
          partValueType: "Einer der zweiundzwanzig Typen; er legt fest, was eingegeben werden kann und wie es geprüft wird.",
          partLabelEn: "Die englische Bezeichnung, die Personen über dem Eingabefeld sehen.",
          partLabelAr: "Die arabische Bezeichnung, optional. Fällt bei leerem Wert auf die englische zurück.",
          partPlaceholder:
            "Optionaler, grau dargestellter Hinweistext im leeren Eingabefeld, für jede Sprache einzeln.",
          partRequired: "Ob ein Datensatz gespeichert werden kann, während dieses Feld leer bleibt.",
          partSortOrder: "Wo das Feld im Verhältnis zu den anderen benutzerdefinierten Feldern im Formular steht.",
          partFieldGroup: "Die optionale Überschrift, unter der das Feld zusammengefasst wird.",
          partOptions: "Die Liste der zulässigen Antworten. Nur bei Select und MultiSelect.",
          partValidator: "Eine optionale zusätzliche Formatprüfung samt ihrer Einstellung. Nur bei Textfeldern.",
          partReferenceTarget:
            "Die eine Art von Datensatz, auf die die Werte dieses Felds verweisen dürfen, oder nichts, damit jeder Wert seine eigene Art wählt. Nur bei EntityReference-Feldern.",
          partSensitivity:
            "Ein Klassifizierungs-Label — Unclassified, Internal, Confidential oder Restricted — für Berichte und den Umgang beim Export.",
          partExportable:
            "Eine Markierung, die angibt, ob die Werte dieses Felds in Exporte aufgenommen werden sollen. Sie wirkt sich nicht auf den Definitionsexport aus, der das Feld immer auflistet und den Wert dieser Markierung mit ausweist.",
          partActive:
            "Ob das Feld weiterhin in Formularen angeboten wird. Ein inaktives Feld behält seine gespeicherten Antworten.",
          partScope:
            "Ob das Feld Ihrem Arbeitsbereich gehört oder der gesamten Plattform. Entschieden durch die Person, die es anlegt.",
          changeNever: "Nein — nach dem Speichern dauerhaft",
          changeAnytime: "Ja, jederzeit",
          changeAnytimeConditions: "Ja, sofern keine Rolle oder Gruppe das Feld einschränkt",
          changeAnytimeCare: "Ja, aber lesen Sie zuerst die Warnhinweise",

          exampleTitle: "Ein durchgerechnetes Beispiel, von Anfang bis Ende",
          exampleIntro:
            "Angenommen, die Akademie muss die Nationalität jedes Spielers erfassen, und das Produkt hat noch kein solches Feld. Nichts davon braucht einen Entwickler.",
          ex1Title: "Entscheiden Sie, wonach Sie fragen",
          ex1Content:
            "Die Frage lautet: \"Welche Nationalität hat dieser Spieler?\". Die Antwort ist ein kurzer Text ohne feste Auswahlliste, also ist der Werttyp Text. Wollten Sie tatsächlich eine feste Liste, wäre stattdessen Select die richtige Wahl — und diese Entscheidung ist dauerhaft, also lohnt sich ein Moment des Nachdenkens.",
          ex2Title: "Definieren Sie das Feld",
          ex2Content:
            "Wählen Sie auf dem Bildschirm Benutzerdefinierte Felder Hinzufügen. Wählen Sie den Datensatztyp für Personen, setzen Sie den Schlüssel auf nationality, die englische Bezeichnung auf Nationality, den Werttyp auf Text, und lassen Sie Required vorerst ausgeschaltet. Speichern.",
          ex3Title: "Füllen Sie es aus",
          ex3Content:
            "Öffnen Sie einen beliebigen Spielerdatensatz. Ein Abschnitt Benutzerdefinierte Felder zeigt nun ein Eingabefeld Nationality, leer. Geben Sie einen Wert ein und speichern Sie den Datensatz. Keine Fehlermeldung bedeutet, dass der Wert angenommen und bei diesem Spieler gespeichert wurde.",
          ex4Title: "Lesen Sie ihn wieder aus",
          ex4Content:
            "Öffnen Sie den Datensatz erneut, und der Wert ist da. Die Datensatzliste hat jetzt ebenfalls eine Spalte Nationality, sodass Sie die Antwort für jeden Spieler auf einen Blick sehen, ohne einen einzigen davon zu öffnen.",
          ex5Title: "Ziehen Sie es an",
          ex5Content:
            "Später entscheiden Sie, dass das Feld immer ausgefüllt sein muss. Bearbeiten Sie die Definition und schalten Sie Required ein. Von da an kann ein Spieler nicht mehr mit leerem Nationality gespeichert werden — aber Spieler, die zuvor mit leerem Feld gespeichert wurden, bleiben unverändert, bis jemand sie bearbeitet.",

          scopeTitle: "Ihr Arbeitsbereich, oder die gesamte Plattform",
          scopeIntro:
            "Ein Feld, das ein Administrator innerhalb eines Arbeitsbereichs anlegt, gehört diesem Arbeitsbereich. Niemand in einem anderen Arbeitsbereich sieht es, und seine Antworten sind außerhalb davon nie sichtbar. Das ist der Normalfall und erfordert kein weiteres Nachdenken.",
          scopeGlobal:
            "Ein Plattformadministrator, der ohne ausgewählten Arbeitsbereich arbeitet, legt stattdessen ein globales Feld an, und das Formular zeigt in diesem Fall einen Schalter Global (all tenants). Ein globales Feld wird von jedem Arbeitsbereich geerbt: Jeder kann es ausfüllen, und niemand außer einem Plattformadministrator kann es bearbeiten, umsortieren oder löschen. Globale Felder umgehen außerdem das Feldkontingent pro Arbeitsbereich.",
          scopeInfoTitle: "Der Geltungsbereich wird bei der Erstellung festgelegt",
          scopeInfoContent:
            "Es gibt keine Möglichkeit, ein Arbeitsbereichsfeld nachträglich in ein globales umzuwandeln oder umgekehrt. Ist der Geltungsbereich falsch, muss das Feld im richtigen Geltungsbereich neu angelegt werden — und bereits zum alten Feld erfasste Antworten verbleiben beim alten Feld.",

          notTitle: "Was benutzerdefinierte Felder nicht sind",
          notIntro:
            "Ein paar Dinge, die man vernünftigerweise von ihnen erwarten könnte, die sie aber bewusst nicht leisten.",
          not1: "Sie sind kein Ersatz für eine echte Funktion. Ein benutzerdefiniertes Feld speichert und zeigt eine Antwort an; es berechnet nichts, löst nichts aus und erscheint in keinem Bericht, den Sie nicht selbst gebaut haben.",
          not2: "Sie sind kein Zugriffskontrollmechanismus. Die Einstellung Sensitivity ist ein Label. Die Sicherheit auf Feldebene, konfiguriert auf Rollen und Benutzergruppen, ist das, was ein Feld tatsächlich verbirgt.",
          not3: "Sie sind keine vollständige Dokumentenverwaltung. File und Image halten jeweils genau einen verwalteten Verweis, keinen Versionsverlauf und keine Galerie — umfassendere Anhang-Workflows gehören zu den eigenen Anhangfunktionen des Datensatzes. Das Anhängen eines neuen File- oder Image-Werts ist über diesen Bildschirm noch nicht möglich; beide Typen lassen sich definieren, und ein vorhandener Wert lässt sich ansehen oder löschen.",
          not4: "Sie sind nicht frei formbar. Jedes Feld hat genau einen Werttyp, im Voraus gewählt und dauerhaft, und jeder Wert wird beim Eingeben dagegen geprüft.",
          not5: "Sie wirken nicht rückwirkend. Ein Feld zu verschärfen — es als Pflichtfeld zu markieren oder eine Formatprüfung anzuhängen — geht nie zurück, um bereits gespeicherte Antworten erneut zu prüfen.",

          nextTitle: "Wie es weitergeht",
          nextIntro: "Der Rest dieses Abschnitts behandelt jeden Teil vollständig.",
          thPage: "Seite",
          thCovers: "Was sie behandelt",
          pageValueTypes: "Werttypen",
          coversValueTypes:
            "Alle zweiundzwanzig Typen, einer nach dem anderen: was jeder speichert, was er akzeptiert, was er zurückweist, sowie durchgerechnete Beispieleingaben mit dem Fehlercode, den das Produkt zurückgibt.",
          pageReferences: "Referenzfelder",
          coversReferences:
            "Die beiden Typen, die auf einen Datensatz in einem anderen Teil des Produkts verweisen: welchen davon Sie verwenden, was tatsächlich gespeichert wird, warum niemals ein Name mitgespeichert wird, das Festlegen eines Ziels, was referenziert werden darf, sowie die Arbeitsbereichsregeln.",
          pageReferenceLookups: "Referenz-Lookups",
          coversReferenceLookups:
            "Die drei Lookups hinter einem Referenzfeld, was jede Antwort bedeutet, die fünf Fehlerzustände und wessen Problem jeder davon ist, was beim Löschen des referenzierten Datensatzes passiert, und wie sich die Auswahlkomponente verhält.",
          pageDefining: "Ein Feld definieren",
          coversDefining:
            "Das Definitionsformular Element für Element, die vollständige Schritt-für-Schritt-Anleitung, die Regeln für Schlüsselnamen, das Anlegen eines Felds direkt aus einem Datensatz heraus, und jede Ablehnung, auf die Sie stoßen können.",
          pageGroups: "Feldgruppen",
          coversGroups:
            "Das Zusammenfassen der Felder eines Datensatztyps unter Überschriften, der stabile Schlüssel, die Reihenfolge, das Löschen, globale Gruppen, und was Gruppen beeinflussen und was nicht.",
          pageOptions: "Optionen",
          coversOptions:
            "Das Schreiben der zulässigen Antworten für Select und MultiSelect, der zweisprachige Options-Editor, wie ein übermittelter Wert abgeglichen wird, und was eine spätere Änderung der Liste mit bestehenden Datensätzen macht.",
          pageValidators: "Validatoren",
          coversValidators:
            "Alle 13 integrierten Formatprüfungen mit gültigen und ungültigen Beispieleingaben, die sechs, die eine Einstellung benötigen, die sieben unterstützten Länder für Postleitzahlen, und wie eine Ablehnung aussieht.",
          pageSecurity: "Sicherheit auf Feldebene",
          coversSecurity:
            "Das Einschränken eines Felds auf einer Rolle oder Benutzergruppe, was eine eingeschränkte Person sieht, warum ihre Speichervorgänge verborgene Werte nicht zerstören, und warum sich Pflichtfeld und eingeschränkt nicht kombinieren lassen.",
          pageManaging: "Felder verwalten",
          coversManaging:
            "Bearbeiten, Deaktivieren, der Dialog zum Definitionsverlauf, der Nutzungs- und Auswirkungsbericht, das Löschen ohne Datenverlust, der Tabellenexport, und die beiden schreibgeschützten Referenzbildschirme.",
          pageLimits: "Grenzwerte und Verhalten",
          coversLimits:
            "Jede feste Obergrenze, jede bewusste Einschränkung und der Grund dafür — damit Sie keinen Nachmittag mit der Suche nach einer Einstellung verbringen, die es gar nicht gibt.",

          accessTitle: "Berechtigungen",
          accessIntro:
            "Die Arbeit mit Definitionen braucht eigene Berechtigungen. Ein von jemand anderem definiertes Feld auszufüllen braucht nichts weiter als Zugriff auf den Datensatz selbst.",
          thNeed: "Berechtigung",
          thWhoNeedsIt: "Was sie erlaubt",
          permView:
            "Den Bildschirm Benutzerdefinierte Felder sehen, die Liste der Definitionen, die Dialoge History und Usage sowie die beiden schreibgeschützten Referenzbildschirme.",
          permCreate:
            "Eine Definition anlegen, auch über den Link Add custom field innerhalb eines Datensatzformulars.",
          permUpdate: "Eine bestehende Definition bearbeiten.",
          permDelete: "Eine Definition löschen, einschließlich der Bestätigung eines zerstörerischen Löschvorgangs.",
          permGroups:
            "Die Feldgruppen-Funktion, gesondert freigeschaltet. Eine Rolle, die bereits jede der obigen Berechtigungen für benutzerdefinierte Felder besitzt, erhält diese nicht automatisch mit.",
          planInfoTitle: "Benutzerdefinierte Felder sind Teil Ihres Plans",
          planInfoContent:
            "Die Funktion ist berechtigungs- und kontingentgebunden: Die Free-Edition erlaubt null Felder, und jeder Plan hat eine Höchstzahl an Feldern pro Arbeitsbereich. Fehlt der Bildschirm Benutzerdefinierte Felder, fehlt die Schaltfläche Add, oder wird ein Speichervorgang wegen des Kontingents abgelehnt, ist das eine Frage des Plans und kein Fehler. Globale Plattformfelder zählen nicht gegen das Kontingent eines Arbeitsbereichs.",
        },

        // ═══════════════════════════════════════════════════
        //  Werttypen
        // ═══════════════════════════════════════════════════
        valueTypes: {
          title: "Werttypen",
          description:
            "Alle zweiundzwanzig Werttypen für benutzerdefinierte Felder: was jeder speichert, was er genau akzeptiert und zurückweist, durchgerechnete Beispieleingaben, und die Fehlercodes, die das Produkt zurückgibt.",
          intro:
            "Jedes benutzerdefinierte Feld hat genau einen Werttyp, gewählt bei der Definition des Felds. Der Werttyp bestimmt, welches Bedienelement im Formular erscheint, was das Produkt akzeptiert, wie der Wert gespeichert wird und wie er anschließend angezeigt wird. Diese Seite behandelt alle zweiundzwanzig, einen nach dem anderen, mit Beispieleingaben, die angenommen werden, und Beispieleingaben, die zurückgewiesen werden. Achtzehn davon speichern etwas, das Sie eingegeben haben; die übrigen vier speichern stattdessen einen Verweis — zwei auf einen Datensatz an anderer Stelle im Produkt, mit einer eigenen Seite dafür, und zwei auf eine einzelne hochgeladene Datei oder ein einzelnes Bild.",
          permanentTitle: "Den Werttyp später zu ändern ist ein eigener, eingeschränkter Vorgang",
          permanentContent:
            "Neun bestimmte Typenpaare lassen sich nachträglich umwandeln, über die eigene Aktion des Felds im Zeilenmenü — siehe die Seite Felder verwalten —, aber jedes andere Paar wird rundheraus zurückgewiesen, und mit einer Umwandlung sollte man nicht planen: Wählen Sie den richtigen Typ von vornherein, wo immer Sie können, denn das weitaus häufigere Ergebnis einer falschen Wahl ist, das Feld zu löschen und neu anzulegen und dabei die bereits dazu gespeicherten Antworten zu verlieren.",

          orderTitle: "Wie ein übermittelter Wert geprüft wird",
          orderIntro:
            "Jeder Speichervorgang durchläuft für jeden Typ dieselben vier Schritte in derselben Reihenfolge. Diese Reihenfolge zu kennen erklärt die meisten Überraschungen.",
          order1:
            "Ist der Wert leer? Ein fehlender Wert, eine leere Zeichenkette oder eine Zeichenkette aus nichts als Leerzeichen zählt als leer. Bei MultiSelect zählt auch eine explizit leere Liste, und bei DateTime, Currency sowie den vier referenzförmigen Typen (EntityReference, UserReference, File, Image) gilt ein Wert nur dann als leer, wenn beide seiner Teile fehlen.",
          order2:
            "Ist er leer und das Feld ist Required, wird der Speichervorgang mit VALIDATION_REQUIRED zurückgewiesen. Ist er leer und das Feld ist nicht Required, wird der gespeicherte Wert gelöscht und nichts weiter läuft ab — keine Typprüfung, kein Validator.",
          order3:
            "Ist er nicht leer, laufen die typeigenen Regeln: Längenobergrenzen, Zahlen-Parsing, Bereichsprüfungen, Abgleich zulässiger Optionen, Formatprüfungen.",
          order4:
            "Bei einem Textfeld mit angehängtem Validator, und nur dann, läuft der Validator zuletzt — nach der globalen Obergrenze von 4.000 Zeichen und nach der eigenen, kürzeren Längenobergrenze des Validators.",
          orderKeyNote:
            "Ein Detail, das sich zu kennen lohnt, bevor Sie irgendeine Fehlermeldung lesen: Die Meldung nennt den Schlüssel des Felds, nicht seine Bezeichnung. Ein Feld mit der Bezeichnung Nationality und dem Schlüssel nationality erzeugt \"'nationality' expects a date.\", nicht \"'Nationality'\".",

          thExample: "Beispieleingabe",
          thOutcome: "Was passiert",

          groupTextTitle: "Text und Auswahl",
          textTitle: "Text",
          textStores:
            "Eine einzelne Zeile frei formulierbaren Textes, bis zu 4.000 Zeichen. Wird als gewöhnliches einzeiliges Eingabefeld dargestellt.",
          textChecks:
            "Die einzige Prüfung ist die Längenobergrenze — sofern kein Validator angehängt ist, was Text zum einzigen Typ macht, der eine Formatprüfung tragen kann. Der Wert wird exakt so gespeichert, wie er übermittelt wurde; anders als Select entfernt Text keine umgebenden Leerzeichen.",
          textOk: "Angenommen, und exakt so gespeichert, wie übermittelt.",
          textTooLong:
            "Zurückgewiesen: VALIDATION_MAX_LENGTH. Text endet bei 4.000 Zeichen — verwenden Sie LongText für alles, was länger ist.",
          textBlankOptional:
            "Angenommen, und als gelöscht gespeichert. Reine Leerzeichen zählen als leer, sodass ein angehängter Validator darauf nie läuft.",
          textBlankRequired: "Zurückgewiesen: VALIDATION_REQUIRED. Reine Leerzeichen zählen auch hier als leer.",
          exText4500: "Ein Wert mit einer Länge von 4.500 Zeichen",
          exSpacesOptional: "Drei Leerzeichen, bei einem Feld, das nicht Required ist",
          exSpacesRequired: "Drei Leerzeichen, bei einem Required-Feld",

          longTextTitle: "LongText",
          longTextStores:
            "Längerer frei formulierbarer Inhalt, bis zu 10.000 Zeichen. Wird als echtes mehrzeiliges Textfeld dargestellt, nicht als höher gezogenes einzeiliges Feld.",
          longTextChecks:
            "Nur die Obergrenze von 10.000 Zeichen. LongText kann keinen Validator tragen. Der Zähler auf dem Bildschirm wird rot, sobald Sie die Obergrenze überschreiten, hindert Sie aber nicht am Weitertippen — die Zurückweisung kommt erst beim Speichern.",
          longTextOk:
            "Angenommen. Das liegt deutlich über der eigenen 4.000-Zeichen-Grenze von Text, was der Grund ist, warum LongText existiert.",
          longTextTooLong: "Zurückgewiesen: VALIDATION_MAX_LENGTH, unter Nennung der Obergrenze von 10.000 Zeichen.",
          exLong6000: "Eine Beschreibung mit 6.000 Zeichen",
          exLong12000: "Eine Beschreibung mit 12.000 Zeichen",

          selectTitle: "Select",
          selectStores:
            "Eine Antwort, gewählt aus einer selbst verfassten Liste. Wird als Dropdown dargestellt, das genau Ihre Optionen anbietet.",
          selectChecks:
            "Der übermittelte Wert muss exakt mit einer der konfigurierten Optionen des Felds übereinstimmen. Beide Seiten werden vor dem Vergleich getrimmt, und der Vergleich unterscheidet Groß-/Kleinschreibung. Für eine Optionsliste aus Small, Medium, Large gilt:",
          selectOk: "Angenommen, und als der Optionstext selbst gespeichert.",
          selectTrimmed: "Angenommen. Umgebende Leerzeichen werden vor dem Vergleich entfernt.",
          selectCase:
            "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Der Abgleich unterscheidet Groß-/Kleinschreibung, sodass Medium und medium unterschiedliche Antworten sind — was auch bedeutet, dass beide rechtmäßig als getrennte Optionen existieren können.",
          selectUnknown:
            "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Die Meldung zitiert den zurückgewiesenen Wert und den Schlüssel des Felds.",
          exSelectPadded: "\" Medium\" mit einem führenden Leerzeichen",

          multiSelectTitle: "MultiSelect",
          multiSelectStores:
            "Mehrere Antworten aus derselben Art von Liste, bis zu 19 davon. Wird als Mehrfachauswahl-Combobox mit einem live mitlaufenden Zähler \"N of 19 selected\" dargestellt.",
          multiSelectChecks:
            "Jede übermittelte Antwort muss eine der konfigurierten Optionen des Felds sein, keine Antwort darf sich wiederholen, und es dürfen höchstens 19 sein. Die Reihenfolge, in der Sie auswählen, bleibt durchgehend erhalten. Für eine Optionsliste aus Red, Green, Blue, Yellow gilt:",
          multiOk:
            "Angenommen, und in der gewählten Reihenfolge zurückgelesen — zuerst Blue, dann Red — nicht neu sortiert in die Reihenfolge, in der die Optionen aufgeführt waren.",
          multiTooMany:
            "Zurückgewiesen: VALIDATION_MAX_LENGTH, unter Nennung der Obergrenze von 19. Die Auswahlkomponente selbst macht die zwanzigste Option nicht auswählbar, sodass dies nur über eine Anfrage erreichbar ist, die das Formular umgeht.",
          multiDuplicate:
            "Zurückgewiesen: VALIDATION_UNIQUE. Eine wiederholte Antwort wird zurückgewiesen, statt still auf eine zusammengeführt zu werden.",
          multiUnknown: "Zurückgewiesen: VALIDATION_INVALID_FORMAT — Purple gehört nicht zu den Optionen des Felds.",
          multiEmpty:
            "Als leer behandelt: gelöscht, wenn das Feld optional ist, zurückgewiesen mit VALIDATION_REQUIRED, wenn es Required ist.",
          exMultiTwo: "Blue, dann Red",
          exMultiTwenty: "20 Auswahlen",
          exMultiRepeat: "Red, dann noch einmal Red",
          exMultiEmptyList: "Eine explizit leere Liste",

          groupNumberTitle: "Zahlen und Maße",
          numberTitle: "Number",
          numberStores:
            "Eine beliebige Zahl, ganzzahlig oder mit Dezimalstellen, positiv oder negativ, mit bis zu sechs Nachkommastellen.",
          numberChecks:
            "Es wird nur geprüft, ob sich der Wert als Zahl parsen lässt. Es gibt keine Mindest-, Höchst-, Präzisions- oder Rundungsregel, wählen Sie Number also, wenn wirklich jede Zahl eine gültige Antwort ist — und wählen Sie Percent, Rating, Currency oder Duration, wenn das nicht der Fall ist.",
          numberOk: "Angenommen.",
          numberNegative: "Angenommen. Negative Werte sind für diesen Typ vollkommen gültig.",
          numberPrecision:
            "Angenommen, und auf sechs Nachkommastellen gespeichert. Alles Feinere als das bleibt nicht erhalten.",
          numberInvalid:
            "Zurückgewiesen: VALIDATION_INVALID_FORMAT — die Meldung lautet \"expects a number\". Eine als Wort geschriebene Zahl wird nicht geparst.",
          exAboutForty: "\"about 40\"",

          percentTitle: "Percent",
          percentStores:
            "Ein Prozentsatz zwischen 0 und 100 einschließlich, Dezimalstellen erlaubt. Wird als einfaches numerisches Eingabefeld dargestellt und anschließend als die Zahl mit angehängtem %-Zeichen angezeigt.",
          percentChecks:
            "Der Wert muss sich als Zahl parsen lassen und zwischen 0 und 100 liegen. Er wird exakt so gespeichert, wie eingegeben — das ist das Detail, das Sie richtig haben müssen, falls Sie je die Rohdaten lesen oder einen Export bauen.",
          percentOk: "Angenommen, und anschließend als 25% angezeigt.",
          percentDecimal: "Angenommen, und als 33,5% angezeigt. Bruchteile eines Prozentpunkts bleiben exakt erhalten.",
          percentQuarter:
            "Angenommen — bedeutet aber ein Viertel eines Prozents, angezeigt als 0,25%. Percent speichert die Zahl, die Sie laut aussprechen würden, nie einen Bruch zwischen 0 und 1.",
          percentTooHigh: "Zurückgewiesen: VALIDATION_RANGE, unter Nennung der Grenzen 0 und 100.",
          percentNegative: "Zurückgewiesen: VALIDATION_RANGE. Die Untergrenze ist 0, und sie ist einschließend.",

          ratingTitle: "Rating",
          ratingStores:
            "Eine ganze Zahl von 1 bis 5, erfasst über einen Schieberegler. Wird anschließend als \"4 / 5\" angezeigt.",
          ratingChecks:
            "Der Wert muss sich als Zahl parsen lassen, eine ganze Zahl sein und zwischen 1 und 5 einschließlich liegen. Es gibt weder ein Sterne-Element noch eine Freitexteingabe.",
          ratingOk: "Angenommen, und als 4 / 5 angezeigt.",
          ratingZero:
            "Zurückgewiesen: VALIDATION_RANGE. Eine 0 ist ein echter übermittelter Wert, der die Prüfung von 1 bis 5 nicht besteht; sie wird nicht als \"unbewertet\" gelesen.",
          ratingFraction:
            "Zurückgewiesen: VALIDATION_RANGE. Halbe Bewertungen werden nicht unterstützt — das ist ein echter Unterschied zu Number, das jede Dezimalzahl erlaubt.",
          ratingTooHigh: "Zurückgewiesen: VALIDATION_RANGE, mit derselben Meldung, die auch eine 0 erhält.",
          ratingUntouched:
            "Wird als leer gespeichert, nicht als 1. Der Schieberegler muss irgendwo stehen, sodass ein unberührtes Feld an seiner äußersten linken Position erscheint — das ist ein Anzeigeartefakt, keine gespeicherte Antwort.",
          exRatingUntouched: "Der Schieberegler, unberührt gelassen bei einem neuen Datensatz",

          currencyTitle: "Currency",
          currencyStores:
            "Ein Betrag zusammen mit seinem dreibuchstabigen Währungscode, gehalten als zwei unabhängige Eingaben innerhalb einer beschrifteten Gruppe. Wird anschließend über die eigene Zahlenformatierung des Lesers angezeigt, wobei der Code statt eines Symbols gezeigt wird, sodass EUR und USD nie mehrdeutig sind.",
          currencyChecks:
            "Beide Teile sind zusammen erforderlich. Der Betrag muss sich als Zahl parsen lassen; der Code muss aus genau drei großgeschriebenen ASCII-Buchstaben bestehen. Das Code-Eingabefeld wandelt beim Tippen in Großbuchstaben um und filtert Buchstaben, weil die Prüfung selbst Kleinschreibung nicht umwandelt — sie weist sie zurück.",
          currencyOk: "Angenommen. Wird als Betrag neben dem Code angezeigt, zum Beispiel USD 100.50.",
          currencyLower:
            "Zurückgewiesen, sofern es je den Server erreicht: VALIDATION_INVALID_FORMAT, unter Nennung der Anforderung von drei Buchstaben nach ISO 4217. Im Formular selbst erzwingt das Eingabefeld beim Tippen Großschreibung, sodass Sie das normalerweise nicht zu sehen bekommen.",
          currencyNoCode:
            "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Das Formular blockiert dies bereits, bevor es den Server aufruft, mit einer Meldung, dass das Feld sowohl einen Betrag als auch einen Währungscode braucht.",
          currencyNoAmount:
            "Auf dieselbe Weise zurückgewiesen. Ein Code ohne Betrag ist ein defekter Wert, kein gelöschter — nur wenn beide Teile fehlen, zählt das als leer.",
          currencyZzz:
            "Angenommen. Geprüft wird nur die Form des Codes, nie seine Mitgliedschaft in der echten ISO-4217-Liste, sodass ein wohlgeformter, aber nicht existierender Code durchkommt. Die Anzeige weicht für einen Code, den der Browser des Lesers nicht erkennt, auf \"ZZZ 100.50\" aus.",
          currencyMinor:
            "Angenommen, und bedeutet zehntausendfünfzig. In der Speicherung benutzerdefinierter Felder gibt es nirgends kleinste Währungseinheiten — 100.50 wird als 100.50 gespeichert, nie als 10050.",
          exCurrencyOk: "100.50 mit dem Code USD",
          exCurrencyLower: "100.50 mit dem Code usd",
          exCurrencyNoCode: "100.50 mit leer gelassenem Code",
          exCurrencyNoAmount: "Der Betrag leer gelassen, mit dem Code USD",
          exCurrencyZzz: "100.50 mit dem Code ZZZ",
          exCurrencyMinor: "10050 mit dem Code USD",

          durationTitle: "Duration",
          durationStores:
            "Eine Zeitdauer, gezählt in Minuten. Wird als numerisches Eingabefeld mit sichtbarer Beschriftung \"minutes\" daneben dargestellt, nie als nackte, unbeschriftete Zahl.",
          durationChecks:
            "Der Wert muss sich als Zahl parsen lassen und darf nicht negativ sein. Null wird angenommen — ein rechtmäßiger \"kein Puffer\"-Wert. Es gibt überhaupt keine Obergrenze.",
          durationOk: "Angenommen, und als 90 minutes angezeigt.",
          durationFraction:
            "Angenommen, und exakt als 1.5 gehalten — neunzig Sekunden. Dezimalstellen werden nicht auf ganze Minuten gerundet.",
          durationZero: "Angenommen. Null ist eine echte Antwort, keine leere.",
          durationLarge:
            "Angenommen — 5.400 Minuten, das sind dreieinhalb Tage. Nichts warnt Sie, denn es gibt kein Maximum.",
          durationNegative: "Zurückgewiesen: VALIDATION_RANGE, mit einer Meldung, dass der Wert nicht negativ sein darf.",

          groupDateTitle: "Daten und Uhrzeiten",
          dateTitle: "Date",
          dateStores:
            "Ein Kalenderdatum ganz ohne Zeitanteil — ein Geburtstag, ein Vertragsdatum, ein Ablaufdatum. Wird als Datumsauswahl dargestellt.",
          dateChecks:
            "Es wird nur geprüft, ob sich der Wert als Datum parsen lässt. Da der gespeicherte Wert ein reines Kalenderdatum ist und kein Zeitpunkt, liest er sich für jeden Betrachter unabhängig von dessen Zeitzone identisch zurück.",
          dateOk: "Angenommen, und für jeden Betrachter, überall, als dasselbe Kalenderdatum zurückgelesen.",
          dateNoTime:
            "Ignoriert. Date hält keinen Zeitanteil, sodass eine zusammen mit dem Datum übermittelte Uhrzeit schlicht nicht gespeichert wird. Verwenden Sie DateTime, wenn die Uhrzeit eine Rolle spielt.",
          dateInvalid: "Zurückgewiesen: VALIDATION_INVALID_FORMAT — die Meldung lautet \"expects a date\".",
          exDateWithTime: "Ein Datum mit angehängtem Zeitanteil",
          exNotADate: "\"next Tuesday\"",

          dateTimeTitle: "DateTime",
          dateTimeStores:
            "Ein genauer Zeitpunkt zusammen mit der Zeitzone, zu der er gehört. Beide Hälften werden gespeichert, sodass ein Anstoß um 18:00 Uhr in Kairo für jemanden, der von London aus schaut, weiterhin als 18:00 Uhr in Kairo gelesen wird.",
          dateTimeChecks:
            "Der Zeitpunkt muss sich parsen lassen, und die Zeitzone muss ein Zonen-Bezeichner sein, den der Server erkennt — in der Praxis ein IANA-Bezeichner wie \"Africa/Cairo\", wobei die zugrunde liegende Prüfung plattformabhängig ist und eine unter Windows gehostete Bereitstellung auch einen nativen Windows-Bezeichner wie \"Egypt Standard Time\" akzeptiert. Die Zone ist erforderlich, sobald eine der beiden Hälften vorhanden ist — ein Zeitpunkt ohne Zone wird zurückgewiesen, nicht still interpretiert. Das Formular zeigt die Zone als kleinen Hinweis neben der eingegebenen Uhrzeit, mit einem Link Change, der eine durchsuchbare Auswahl öffnet.",
          dateTimeOk: "Angenommen. Sowohl der Zeitpunkt als auch seine Zone werden exakt wie eingegeben zurückgelesen.",
          dateTimeNoZone:
            "Zurückgewiesen: VALIDATION_INVALID_TIMEZONE. Ein Zeitpunkt ohne Zone ist genau das, was DateTime verhindern soll.",
          dateTimeBadZone:
            "Zurückgewiesen: VALIDATION_INVALID_TIMEZONE, unter Nennung des nicht erkannten Bezeichners. Zonen sind echte IANA-Namen wie Africa/Cairo oder Asia/Tokyo.",
          dateTimeEmpty:
            "Als leer behandelt: gelöscht, wenn das Feld optional ist, zurückgewiesen mit VALIDATION_REQUIRED, wenn es Required ist. Nur wenn beide Hälften fehlen, zählt das als leer.",
          exDateTimeOk: "18:00 Uhr am 21. August 2026, Zone Africa/Cairo",
          exDateTimeNoZone: "18:00 Uhr am 21. August 2026, Zone leer gelassen",
          exDateTimeBadZone: "18:00 Uhr am 21. August 2026, Zone Not/AZone",
          exDateTimeBothBlank: "Sowohl der Zeitpunkt als auch die Zone leer gelassen",

          timeTitle: "Time",
          timeStores:
            "Eine Tageszeit im 24-Stunden-Format, einschließlich Sekunden, ohne zugehöriges Datum — eine Öffnungszeit, eine Sperrstunde, ein Anstoßzeitpunkt. Wird als native Zeitauswahl mit aktivierten Sekunden dargestellt und anschließend im jeweils eigenen lokalen Zeitformat des Lesers angezeigt.",
          timeChecks:
            "Der Wert muss aus durch Doppelpunkte getrennten Stunden, Minuten und Sekunden bestehen, mit Stunden von 0 bis 23, Minuten von 0 bis 59 und Sekunden von 0 bis 59. Nicht aufgefüllte Eingaben werden angenommen und normalisiert statt zurückgewiesen.",
          timeOk: "Angenommen, und im eigenen Format des Lesers angezeigt — zum Beispiel 2:30:00 PM für einen englischsprachigen (US-)Leser.",
          timeNormalised:
            "Angenommen, und vor der Speicherung auf 09:05:00 normalisiert. Zwei Übermittlungen derselben Uhrzeit mit unterschiedlicher Ziffernbreite landen immer identisch.",
          timeHourRange: "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Stunden laufen von 0 bis 23, sodass 24 außerhalb des Bereichs liegt.",
          timeMinuteRange: "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Minuten laufen von 0 bis 59.",
          timeAmPm:
            "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Zwölf-Stunden-Text wird nicht geparst — die gespeicherte Form ist immer 24-Stunden, auch wenn die Anzeige es nicht ist.",

          groupContactTitle: "Kontaktdaten und Links",
          emailTitle: "Email",
          emailStores:
            "Eine E-Mail-Adresse. Wird als natives E-Mail-Eingabefeld dargestellt und anschließend als klickbarer Mail-Link angezeigt.",
          emailChecks:
            "Die Adresse wird als echte Adresse geparst statt gegen ein Muster abgeglichen, und sie darf nichts als die Adresse enthalten. Groß-/Kleinschreibung bleibt exakt wie eingegeben erhalten — keine Umwandlung in Kleinbuchstaben.",
          emailOk:
            "Angenommen, mit exakter Groß-/Kleinschreibung gespeichert, und als klickbarer Mail-Link angezeigt.",
          emailDisplayName:
            "Zurückgewiesen: VALIDATION_INVALID_EMAIL. Eine Umhüllung mit Anzeigenamen lässt sich zwar als Adresse parsen, wird aber zurückgewiesen statt still entfernt, weil ein Email-Feld keinen Anzeigenamen zu bewahren hat.",
          emailInvalid: "Zurückgewiesen: VALIDATION_INVALID_EMAIL.",
          exEmailDisplayName: "\"Test User <test@example.com>\"",

          urlTitle: "Url",
          urlStores:
            "Eine Webadresse. Wird als natives URL-Eingabefeld dargestellt und anschließend als echter Link angezeigt, der sich in einem neuen Tab öffnet.",
          urlChecks:
            "Der Wert muss eine absolute Adresse sein, deren Schema exakt http oder https ist. Jedes andere Schema wird zurückgewiesen. Das Schema wird beim Ausgeben erneut geprüft, bevor der Wert je als Link gerendert wird.",
          urlOk: "Angenommen, und als Link angezeigt, der sich in einem neuen Tab öffnet.",
          urlHttpOk:
            "Angenommen. Einfaches http ist bewusst erlaubt — eine Firmenseite oder eine interne Adresse während der Einrichtung ist legitime Daten.",
          urlNoScheme:
            "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Ein nackter Host wird zurückgewiesen statt erraten, sodass nichts entscheiden muss, ob http oder https gemeint war.",
          urlScheme:
            "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Das ist eine echte Sicherheitsgrenze, keine Stilregel — und weil das Schema erneut vor der Anzeige geprüft wird, erscheint sogar ein Wert, der vor Einführung dieser Prüfung gespeichert wurde, als reglosen Text statt als aktiver Link.",
          urlFtp: "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Nur http und https stehen auf der Liste.",

          phoneTitle: "Phone",
          phoneStores:
            "Eine Telefonnummer im internationalen Format. Wird über eine Länderauswahl mit Flaggen und Suche dargestellt und anschließend zur besseren Lesbarkeit umformatiert angezeigt — zum Beispiel +20 123 456 7890.",
          phoneChecks:
            "Der gespeicherte Wert muss mit einem + beginnen, seine erste Ziffer darf nicht Null sein, und er muss insgesamt zwischen 8 und 15 Ziffern enthalten. Das ist eine reine Formprüfung.",
          phoneOk: "Angenommen, und umformatiert angezeigt statt als nackte gespeicherte Zeichenkette.",
          phoneNoPlus: "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Das führende + ist Teil des Formats.",
          phoneLeadingZero: "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Eine Landesvorwahl beginnt nie mit Null.",
          phoneTooShort: "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Sieben Ziffern liegen unter dem Minimum von acht.",
          phoneUnassignable:
            "Vom Server angenommen, der nur die Form prüft und nicht, ob die Nummer wirklich existieren könnte. Die Auswahlkomponente des Formulars prüft die Nummer zusätzlich gegen den echten Nummernplan des gewählten Landes, sodass Sie diesen Wert nicht über die Oberfläche erzeugen können — nur über eine Anfrage, die das Formular umgeht.",

          groupOtherTitle: "Ja/Nein und Farbe",
          booleanTitle: "Boolean",
          booleanStores: "Ein einfaches Ja oder Nein. Wird als Ein/Aus-Schalter dargestellt. Hat weder Platzhalter noch Optionen.",
          booleanChecks:
            "Es werden nur die Wörter true und false geparst, unabhängig von Groß-/Kleinschreibung. Nichts anderes wird als Synonym behandelt.",
          boolTrue: "Angenommen.",
          boolFalse: "Angenommen.",
          boolOne:
            "Zurückgewiesen: VALIDATION_INVALID_FORMAT — die Meldung lautet \"expects a boolean\". Eine numerische 1 wird nicht als true gelesen.",
          boolYes: "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Weder yes/no noch on/off wird angenommen.",

          colorTitle: "Color",
          colorStores:
            "Eine Farbe, gespeichert als Hex-Wert. Wird als Raster aus zwanzig Farbfeldern plus einer benutzerdefinierten Hex-Eingabe dargestellt und anschließend als Hex-Text mit einem kleinen passenden Farbchip daneben angezeigt.",
          colorChecks:
            "Der Wert muss aus einem # gefolgt von genau drei oder genau sechs Hexadezimalziffern bestehen. Groß-/Kleinschreibung wird beim Speichern auf Kleinbuchstaben normalisiert; die Länge nicht.",
          colorOk: "Angenommen, und als #aabbcc gespeichert. Großbuchstaben werden auf Kleinbuchstaben umgelegt.",
          colorShort:
            "Angenommen, und als #abc beibehalten. Die Kurzform wird nie zu #aabbcc erweitert, auch wenn ein Renderer beide als dieselbe Farbe behandelt — sodass dieselbe Farbe über verschiedene Datensätze hinweg rechtmäßig auf zwei Arten gespeichert sein kann.",
          colorNoHash: "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Das führende # ist erforderlich.",
          colorBadLength: "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Drei oder sechs Ziffern, nichts dazwischen.",
          colorNamed: "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Farbnamen werden nicht angenommen, nur Hex-Werte.",

          groupReferenceTitle: "Verweise auf einen anderen Datensatz",
          referenceGroupIntro:
            "Die letzten beiden Typen speichern selbst keinen Text. Jeder speichert einen Verweis auf einen Datensatz an anderer Stelle im Produkt, und der angezeigte Name wird jedes Mal, wenn das Feld angezeigt wird, frisch nachgeschlagen, statt zusammen mit dem Verweis gespeichert zu werden. Beide speichern dieselben zwei Bestandteile — die Art des Datensatzes und die Identität dieses Datensatzes — und beide behandeln einen Wert nur dann als leer, wenn beide Bestandteile fehlen. Es gibt weit mehr dazu zu sagen, als in eine Tabelle passt; die Seiten Referenzfelder und Referenz-Lookups sagen es.",
          entityReferenceTitle: "EntityReference",
          entityReferenceStores:
            "Ein Verweis auf einen Datensatz jeder Art, für die diese Installation zuständig sein kann und die Sie ansehen dürfen. Wird als durchsuchbare Auswahl über diese Art von Datensatz dargestellt — davor eine zweite Auswahl für die Art selbst, wenn die Definition keine festlegt.",
          entityReferenceChecks:
            "Beide Bestandteile sind zusammen erforderlich. Die Art des Datensatzes muss registriert sein und, wenn die Definition eine festlegt, genau diese sein. Die Identität muss lesbar sein. Und Sie müssen in der Lage gewesen sein, diesen Datensatz im Moment des Speicherns zu lesen — das verhindert, dass ein Verweis benutzt wird, um an Daten zu gelangen, die Sie nicht direkt öffnen dürfen. Jede Prüfung weist mit ihrer eigenen Meldung zurück statt mit einer allgemeinen.",
          refOk:
            "Angenommen. Die Antwort erfasst sowohl die Art des Datensatzes als auch dessen Identität, und die Auswahlkomponente zeigt von da an den aktuellen Namen des Datensatzes.",
          refIncomplete:
            "Als unvollständiger Verweis zurückgewiesen. Ein halber Verweis wird nicht als leeres Feld behandelt — er bedeutet, dass jemand mit dem Antworten begonnen und aufgehört hat.",
          refIncompleteToo:
            "Auf dieselbe Weise zurückgewiesen. Eine Identität ohne Art von Datensatz benennt eine Zeile, aber keine Tabelle, sodass es nichts gibt, worin nachgeschlagen werden könnte.",
          refMismatch:
            "Zurückgewiesen, und die Meldung nennt sowohl, was das Feld erwartet, als auch, was ankam. Die Festlegung ist eine bewusste Einschränkung, also ist dies die Zurückweisung, die funktioniert, statt zu versagen.",
          refUnknownType:
            "Zurückgewiesen: ENTITY_UNKNOWN_TYPE, unter Nennung des Bezeichners. Nur über eine Anfrage erreichbar, die die Auswahlkomponente umgeht, denn diese bietet nie eine nicht registrierte Art von Datensatz an.",
          refInvalidId:
            "Zurückgewiesen: ENTITY_INVALID_ID. Eine Identität ist undurchsichtig und muss exakt so zurückgesendet werden, wie sie empfangen wurde — ein verändertes Zeichen macht sie unlesbar.",
          refForbidden:
            "Zurückgewiesen: AUTH_FORBIDDEN, unter Nennung des Felds. Einen Verweis auf einen Datensatz zu speichern ist eine aufgeschobene Lesung dieses Datensatzes, braucht also dieselbe Berechtigung, die auch dessen Lesen bräuchte.",
          refEmpty:
            "Als leer behandelt: gelöscht, wenn das Feld optional ist, zurückgewiesen mit VALIDATION_REQUIRED, wenn es Required ist. Nur wenn beide Bestandteile fehlen, zählt das als leer.",
          exRefOk: "Ein über die Auswahlkomponente gewähltes Mitglied des Personals",
          exRefTypeOnly: "Eine gewählte Art von Datensatz, ohne gewählten Datensatz",
          exRefIdOnly: "Ein gewählter Datensatz, ohne übermittelte Art von Datensatz",
          exRefWrongType: "Eine Person, bei einem auf Mitarbeitende festgelegten Feld",
          exRefUnknownType: "Eine Art von Datensatz, die nicht registriert ist",
          exRefEdited: "Eine gespeicherte Identität, um ein Zeichen verändert",
          exRefNoAccess: "Ein Datensatz einer Art, die Sie nicht ansehen dürfen",
          exRefBothBlank: "Beide Teile leer gelassen",

          userReferenceTitle: "UserReference",
          userReferenceStores:
            "Ein Verweis auf ein Benutzerkonto — assigned to, reviewed by, account manager. Wird als durchsuchbare Auswahl über Benutzerkonten dargestellt und zeigt nie ein Element zur Wahl einer Art von Datensatz, weil es nur eine gibt.",
          userReferenceChecks:
            "Jede Prüfung, die EntityReference vornimmt, plus eine engere Regel: Die einzige akzeptierte Art von Datensatz ist ein Benutzerkonto. Diese Liste ist von der Plattform festgelegt, nicht durch Konfiguration, und ein Versuch, diesen Typ auf etwas anderes zu richten, wird sowohl bei der Konfiguration einer Definition als auch beim Speichern eines Werts zurückgewiesen.",
          usrOk: "Angenommen, exakt wie bei EntityReference. Die Antwort ist auf dieselbe Weise selbstbeschreibend.",
          usrDormant:
            "Angenommen. Ein gesperrtes Konto ist ruhend, nicht gelöscht: Es existiert weiterhin, wird von der Auswahlkomponente weiterhin mit einer Inaktiv-Markierung angeboten, und ist eine legitime Antwort für etwas, das bereits geschehen ist.",
          usrAdminRefused:
            "Zurückgewiesen, mit einer Meldung, die nennt, was erlaubt ist. Ein Administrator kann zu überhaupt keinem Arbeitsbereich gehören, was die eine Eigenschaft ist, die ein Referenzziel niemals haben darf.",
          usrGroupRefused:
            "Auf dieselbe Weise zurückgewiesen. Eine Gruppe ist gefahrlos zu lesen, aber keine Person, und ein als UserReference typisiertes Feld, das sich zu einer Gruppe auflöste, würde über das lügen, was es enthält.",
          usrThemeRefused:
            "Auf dieselbe Weise zurückgewiesen. Eine gemeinsam genutzte Plattformkatalog-Zeile gehört zu keinem Arbeitsbereich und ist ebenfalls keine Person — doppelt ausgeschlossen.",
          usrEmpty: "Zu genau denselben Bedingungen als leer behandelt wie bei EntityReference.",
          exUsrOk: "Ein über die Auswahlkomponente gewähltes Benutzerkonto",
          exUsrDormant: "Ein Konto, dessen Anmeldung derzeit gesperrt ist",
          exUsrAdmin: "Ein Administrator-Datensatz",
          exUsrGroup: "Eine Benutzergruppe",
          exUsrTheme: "Ein Anmelde-Theme",

          groupMediaTitle: "Medien und formatierter Text",
          mediaGroupIntro:
            "File und Image sind auf dieselbe Weise gebaut wie die beiden Referenztypen oben — ein Verweis, kein gespeicherter Text —, aber jeder verweist auf eine einzelne hochgeladene Datei statt auf einen anderen Datensatz. RichText ist wieder anders: Es speichert echten formatierten Inhalt, verfasst im eigenen Editor des Produkts.",

          fileTitle: "File",
          fileStores:
            "Ein Verweis auf eine hochgeladene Datei — eine unterschriebene Haftungsfreistellung, ein ärztliches Attest, ein Versicherungsdokument. Wird als kleines Statuselement dargestellt, das anzeigt, ob eine Datei angehängt ist, mit einer Schaltfläche Clear, wenn das der Fall ist.",
          fileChecks:
            "Ein gespeicherter Wert wird nur angenommen, wenn die referenzierte Datei tatsächlich an den Datensatz angehängt ist, den Sie gerade bearbeiten — eine Sicherheitsprüfung, die verhindert, dass eine für einen Datensatz bestimmte Datei von einem anderen aus referenziert wird. Das Anhängen einer neuen Datei ist über diesen Bildschirm noch nicht möglich: Das Feld lässt sich bereits heute definieren, und ein vorhandener Wert lässt sich ansehen oder löschen, aber ihn zum ersten Mal auszufüllen kommt erst mit einem künftigen Release.",
          fileAttachedExample: "Ein Datensatz, dessen File-Feld bereits einen Wert enthält",
          fileAttachedOutcome: "Wird als angehängt angezeigt, mit einem Element Clear. Ein Element zum Anhängen gibt es derzeit nicht daneben.",
          fileClearExample: "Eine angehängte Datei löschen, dann speichern",
          fileClearOutcome: "Angenommen — der Wert wird entfernt.",

          imageTitle: "Image",
          imageStores:
            "Das Gegenstück zu File, beschränkt auf Bilder — ein Spielerfoto, eine Hero-Aufnahme einer Anlage, ein Vereinswappen. Dasselbe Statuselement, dieselbe derzeitige Einschränkung beim Anhängen eines neuen Werts.",
          imageChecks:
            "Alles, was File prüft, plus die referenzierte Datei selbst muss ein Bild sein. Das Anhängen eines neuen Bildes ist über diesen Bildschirm ebenfalls noch nicht möglich — siehe File oben.",
          imageAttachedExample: "Ein Datensatz, dessen Image-Feld bereits einen Wert enthält",
          imageAttachedOutcome: "Wird als angehängt angezeigt, mit einem Element Clear.",

          richTextTitle: "RichText",
          richTextStores:
            "Formatierte Prosa, verfasst im eigenen Editor des Produkts — eine Trainernotiz mit Absätzen und einer Aufzählungsliste, ein Hinweistext zu einer Richtlinie mit einem Link. Wird als echter Rich-Text-Editor dargestellt, nicht als schlichtes Feld.",
          richTextChecks:
            "Bis zu 50.000 Zeichen Markup, geprüft bevor es automatisch bereinigt wird: Ein Inline-Stil und ein eingebettetes Bild werden beide entfernt, weil ersteres die umgebende Seite optisch kapern kann und letzteres im Stillen nachverfolgen kann, wer das Feld später ansieht. Dabei erscheint keine gesonderte Warnung — öffnen Sie das Feld anschließend erneut, und was Sie sehen, ist genau das, was erhalten blieb.",
          richTextOkExample: "Ein Absatz mit einem fett gedruckten Wort und einer Aufzählungsliste",
          richTextOkOutcome: "Angenommen, und jedes Element bleibt erhalten.",
          richTextStyleExample: "Eingefügter Inhalt mit angewendetem Inline-Stil",
          richTextStyleOutcome: "Angenommen, mit entferntem Stil. Der sichtbare Text und die Struktur bleiben erhalten.",
          richTextImgExample: "Inhalt mit eingebettetem Bild",
          richTextImgOutcome: "Angenommen, mit entferntem Bild. Ein Bild gehört stattdessen in ein File- oder Image-Feld.",
          richTextTooLongExample: "Mehr als 50.000 Zeichen Markup",
          richTextTooLongOutcome: "Zurückgewiesen: VALIDATION_MAX_LENGTH — kürzen Sie es und versuchen Sie es erneut.",

          emptyTitle: "Leere Werte und der Schalter Required",
          emptyIntro:
            "Jeder Typ teilt eine Definition von leer, und sie wird vor allem anderen geprüft. Ein Wert zählt als leer, wenn:",
          empty1: "er beim Speichern vollständig fehlt;",
          empty2: "er leer ist oder aus nichts als Leerzeichen besteht;",
          empty3: "bei MultiSelect die Liste der Auswahlen explizit leer ist;",
          empty4: "bei DateTime sowohl der Zeitpunkt als auch die Zeitzone fehlen — nicht nur eines von beiden;",
          empty5: "bei Currency sowohl der Betrag als auch der Währungscode fehlen — nicht nur eines von beiden;",
          empty6:
            "bei EntityReference, UserReference, File und Image beide Hälften des Verweises fehlen — nicht nur eine davon.",
          emptyOutcome:
            "Ein leerer Wert bei einem Required-Feld wird mit VALIDATION_REQUIRED zurückgewiesen. Ein leerer Wert bei einem optionalen Feld wird angenommen, und die gespeicherte Antwort wird gelöscht — die Zeile bleibt erhalten statt gelöscht zu werden, sodass der Verlauf nicht verloren geht.",
          emptyWarnTitle: "Rating ist die Ausnahme, die man sich merken sollte",
          emptyWarnContent:
            "Eine explizit übermittelte 0 bei einem Rating-Feld ist ein echter, nicht leerer Wert und besteht die Bereichsprüfung von 1 bis 5 ebenso wenig wie eine 6. Nur eine wirklich fehlende oder leere Übermittlung zählt als unbewertet. Unabhängig davon, und aus demselben Grund, aus dem ein Schieberegler eine Position braucht, erscheint ein unberührtes Rating-Feld so, als stünde es auf 1, während es dabei leer bleibt.",

          codesTitle: "Fehlercodes, die Ihnen begegnen können",
          codesIntro:
            "Fast jede Zurückweisung ist ein HTTP 422 mit einem dieser maschinenlesbaren Codes; zwei davon sind stattdessen ein 403, weil es dabei um Ihren Zugriff geht, nicht um die Form dessen, was Sie gesendet haben. Ein dritter verdient eine gesonderte Erwähnung: Sein Codename liest sich wie ein 404, aber die Antwort ist trotzdem ein 422 — siehe den Hinweis daneben weiter unten. Sollten Sie je einen 500 beim Speichern eines Werts für ein benutzerdefiniertes Feld sehen, ist das ein meldenswerter Fehler — der Validierungspfad ist so geschrieben, dass er sauber zurückweist, niemals versagt.",
          thCode: "Code",
          thWhenItFires: "Wann er ausgelöst wird",
          codeRequired: "Das Feld ist Required, und der übermittelte Wert ist leer oder besteht nur aus Leerzeichen.",
          codeInvalidFormat:
            "Der Wert entspricht nicht der vom Typ erwarteten Form — eine nicht parsbare Zahl, ein nicht parsbares Datum oder eine nicht parsbare Uhrzeit, eine Option, die nicht auf der Liste steht, ein nicht zulässiges URL-Schema, eine falsche Telefonform, eine falsche Hex-Farbe, ein falscher Währungscode, oder die meisten Validator-Fehlschläge.",
          codeInvalidEmail: "Der Wert eines Email-Felds ist keine echte Adresse oder trägt einen Anzeigenamen.",
          codeInvalidTimezone:
            "Bei einem DateTime-Wert fehlt die Zeitzone, sobald ein Zeitpunkt vorhanden ist, oder er nennt eine Zone, die der Server nicht erkennt.",
          codeRange:
            "Eine Zahl liegt außerhalb der Grenzen ihres Typs — Percent außerhalb von 0 bis 100, Rating außerhalb einer ganzen Zahl von 1 bis 5, eine negative Duration, oder außerhalb der eigenen Grenzen eines Numeric-Range-Validators.",
          codeMaxLength:
            "Text jenseits von 4.000 Zeichen, LongText jenseits von 10.000, RichText jenseits von 50.000, ein Email oder Url jenseits von 4.000, mehr als 19 MultiSelect-Auswahlen, oder die Obergrenze eines Length-Range-Validators.",
          codeMinLength: "Die Untergrenze eines Length-Range-Validators.",
          codeUnique: "Dieselbe MultiSelect-Option wurde in einem Speichervorgang mehr als einmal übermittelt.",
          codeUnknownEntityType:
            "Ein Verweis nennt eine Art von Datensatz, die in dieser Installation nicht registriert ist.",
          codeInvalidId:
            "Die gespeicherte Identität eines Verweises ließ sich nicht lesen — auf dem Weg irgendwo verändert, oder ein Wert, der von vor einer Änderung stammt.",
          codeForbidden:
            "Ein Verweis zeigt auf einen Datensatz, den Sie nicht lesen dürfen. Dies ist ein 403, kein 422, weil es um Ihren Zugriff geht und nicht um die Form des Werts.",
          codeMediaOwnerMismatch:
            "Ein File- oder Image-Wert zeigt auf eine hochgeladene Datei, die nicht an den Datensatz angehängt ist, den Sie gerade bearbeiten. Dies ist ein 403, aus demselben Grund wie der Forbidden-Fall bei Referenzen oben — es geht um Eigentümerschaft, nicht um die Form.",
          codeMediaNotFound:
            "Die ID eines File- oder Image-Werts lässt sich nicht entschlüsseln, oder sie entschlüsselt sich zu einer hochgeladenen Datei, die nicht mehr existiert. Der Codename liest sich wie ein 404, aber die Antwort ist ein 422 — dieselbe Form, die jede andere Zurückweisung eines fehlerhaften Werts auf dieser Seite verwendet, nicht die Not-found-Form, die ein Client aufgrund des Namens erwarten könnte.",
          codeMediaNotAnImage:
            "Der Wert eines Image-Felds zeigt auf eine Datei, die kein Bild ist.",
          codeRichTextShape:
            "Der Wert eines RichText-Felds wurde nicht als Objekt mit einer Eigenschaft 'html' gesendet.",
          codesInfoTitle: "Meldungen nennen den Schlüssel, nicht die Bezeichnung",
          codesInfoContent:
            "Fehlermeldungen zitieren den maschinenlesbaren Schlüssel des Felds — 'shirt_size' — statt seiner Anzeigebezeichnung. Wenn Sie eine Meldung einem Feld zuordnen, gleichen Sie über den Schlüssel ab.",

          catalogueTitle: "Der Bildschirm Werttypen im Produkt",
          catalogueIntro:
            "Das Produkt führt einen eigenen schreibgeschützten Katalog dieser Typen, erreichbar über einen Link im Seitenkopf der Seite Benutzerdefinierte Felder. Das ist Dokumentation, keine Konfiguration: Nichts darauf kann hinzugefügt, bearbeitet oder entfernt werden, weil Werttypen von der Plattform festgelegt sind. Er ist hinter derselben Berechtigung wie der Bildschirm Benutzerdefinierte Felder selbst verborgen, und er ist vollständig übersetzt, rechts-nach-links eingeschlossen.",
          catalogueColumns:
            "Jede Zeile zeigt den Namen des Typs, eine Beschreibung, wofür er gedacht ist, ob er einen Platzhalter annimmt, ob er eine Optionsliste besitzt, und ob er einen Validator unterstützt. Text ist die einzige Zeile, die Validator-Unterstützung zeigt — das macht die Text-exklusive Grenze sichtbar.",
          catalogueNoPlanColumn:
            "Auf diesem Bildschirm gibt es bewusst keine Plan- oder Berechtigungsspalte. Werttypen sind nicht einzeln planabhängig freigeschaltet, sodass eine Spalte, die das Gegenteil andeutet, etwas zeigen würde, das nicht existiert.",
        },

        // ═══════════════════════════════════════════════════
        //  Referenzfelder
        // ═══════════════════════════════════════════════════
        references: {
          title: "Referenzfelder",
          description:
            "Die beiden Werttypen, die auf einen Datensatz in einem anderen Modul verweisen — Entity Reference und User Reference: welchen Sie verwenden, was tatsächlich gespeichert wird, warum der Name nie mitgespeichert wird, wie ein Zieltyp festgelegt wird, was referenziert werden darf, und die Arbeitsbereichsregeln.",
          intro:
            "Jeder andere Werttyp speichert etwas, das Sie eingegeben haben. Diese beiden speichern einen Verweis: Das Feld enthält keinen eigenen Text, nur die Identität eines anderen Datensatzes irgendwo im Produkt. Ein Feld auf einem Administrator-Datensatz, das angibt, welches Mitglied des Personals er ist, ein Feld auf einer Buchung, das angibt, wer sie geprüft hat, ein Feld auf einer Person, das angibt, welcher Account Manager sich um sie kümmert — alle drei sind ein Datensatz, der auf einen anderen zeigt, und bevor es diese Typen gab, gab es keine Möglichkeit, das zu erfassen, ohne einen Namen erneut einzutippen und zuzusehen, wie er auseinanderdriftet.",
          oneLineTitle: "In einem Satz",
          oneLineContent:
            "Ein Referenzfeld speichert, welchen Datensatz Sie gewählt haben, nie wie dieser Datensatz hieß — sodass der angezeigte Name immer der Name ist, den dieser Datensatz gerade jetzt trägt, und immer einer, den Sie sehen dürfen.",

          whatTitle: "Was Ihnen ein Referenzfeld bietet",
          whatIntro:
            "Eine Referenz ist kein Textfeld, das zufällig den Namen von jemandem enthält. Es ist ein echter Verweis, geprüft beim Speichern und bei jedem Lesen erneut geprüft, und jedes der folgenden Merkmale folgt daraus.",
          featPointsAt: "Zeigt auf einen echten Datensatz",
          featPointsAtDesc:
            "Sie wählen aus einer durchsuchbaren Liste von Datensätzen, die tatsächlich existieren, in Ihrem eigenen Arbeitsbereich, statt einen Namen einzutippen und zu hoffen, dass er passt. Es wird nichts gespeichert, bevor ein echter Datensatz gewählt wurde.",
          featLiveName: "Zeigt immer den aktuellen Namen",
          featLiveNameDesc:
            "Der Name wird bei jeder Anzeige des Felds frisch nachgeschlagen. Wird der Name von jemandem auf dessen eigenem Datensatz korrigiert, zeigt jeder auf diese Person zeigende Verweis die Korrektur sofort — es gibt keine Kopie, die veralten könnte.",
          featPermission: "Trägt die eigenen Berechtigungen des Ziels",
          featPermissionDesc:
            "Um den Namen zu lesen, braucht es die Berechtigung, diese Art von Datensatz anzusehen, nicht die Berechtigung, den Datensatz mit dem Feld anzusehen. Jemand, der den besitzenden Datensatz bearbeiten, aber Personal nicht lesen darf, sieht, dass eine Referenz gesetzt ist, und sieht nicht, worauf sie zeigt.",
          featSearch: "Durchsuchbar, seitenweise, und sagt Ihnen, was sie nicht kann",
          featSearchDesc:
            "Die Auswahlkomponente durchsucht die eigenen Datensätze des Zielmoduls seitenweise, markiert einen ruhenden Datensatz als inaktiv statt ihn zu verbergen, und sagt in Worten, wenn es nichts gibt, worauf Sie verweisen dürfen — nie ein leeres Dropdown, das sich liest wie \"es gibt keine Datensätze\".",
          featPinned: "Kann auf eine Art von Datensatz festgelegt werden",
          featPinnedDesc:
            "Ein Entity-Reference-Feld kann so festgelegt werden, dass jeder Wert auf, sagen wir, ein Mitglied des Personals zeigen muss — oder nicht festgelegt bleiben, wobei dann jeder Wert seine eigene Art von Datensatz wählt und diese Wahl zusammen mit dem Verweis speichert.",
          featSelfHealing: "Leert sich selbst, wenn das Ziel gelöscht wird",
          featSelfHealingDesc:
            "Löschen Sie den Datensatz, auf den ein Verweis zeigt, und der Verweis wird automatisch geleert. Die Wertzeile selbst überlebt mit ihrem Prüfpfad — nur der Verweis geht, und nichts muss von Hand aufgeräumt werden.",

          whichTitle: "Entity Reference oder User Reference",
          whichIntro:
            "Es gibt zwei Referenz-Werttypen, und sie sind mechanisch fast identisch. Der Unterschied liegt vollständig darin, worauf jeder zeigen darf, und damit darin, wie viel Sie konfigurieren müssen. Wählen Sie User Reference, wenn die Antwort \"eine Person, die sich anmeldet\" lautet; wählen Sie Entity Reference für alles andere.",
          thAspect: "Aspekt",
          thEntityRef: "Entity Reference",
          thUserRef: "User Reference",
          aspTargets: "Worauf es zeigen darf",
          entTargets:
            "Jede Art von Datensatz, für die die Plattform derzeit zuständig sein kann und die Sie ansehen dürfen.",
          usrTargets:
            "Genau eine Art von Datensatz: ein Benutzerkonto. Nichts anderes wird jemals angenommen, und diese Liste ist von der Plattform festgelegt, nicht durch Konfiguration.",
          aspConfig: "Was Sie konfigurieren",
          entConfig:
            "Optional einen Target Entity Type auf der Definition. Ihn nicht festzulegen ist eine echte und dauerhaft unterstützte Wahl, keine unfertige.",
          usrConfig:
            "Überhaupt nichts. Für diesen Typ gibt es keine Zielauswahl auf dem Definitionsformular, weil es keine Entscheidung zu treffen gibt.",
          aspPicker: "Was die ausfüllende Person sieht",
          entPicker:
            "Bei einem festgelegten Feld eine durchsuchbare Liste dieser Art von Datensatz. Bei einem nicht festgelegten Feld zwei Elemente: zuerst die Art des Datensatzes, dann der Datensatz.",
          usrPicker: "Eine durchsuchbare Liste von Benutzerkonten. Es gibt nie ein Element zur Typwahl.",
          aspUse: "Greifen Sie darauf zurück, wenn",
          entUse:
            "Die Antwort ein Geschäftsdatensatz ist — ein Mitglied des Personals, eine Person, eine Anlage — oder wenn verschiedene Datensätze unter demselben Feld rechtmäßig auf unterschiedliche Arten von Dingen zeigen.",
          usrUse:
            "Die Antwort ein Konto ist: assigned to, reviewed by, account manager, approved by.",
          aspStorage: "Wie die Antwort gespeichert wird",
          entStorage: "Die Art des Datensatzes, plus die eigene Identität dieses Datensatzes. Beides, immer zusammen.",
          usrStorage:
            "Identisch. Der gespeicherte Wert ist auf genau dieselbe Weise selbstbeschreibend, was ihn dazu befähigt, auch nach einer Änderung der Definition lesbar zu bleiben.",
          whichInfoTitle: "Warum das zwei Typen sind und keine einzelne Einstellung",
          whichInfoContent:
            "Die Liste dessen, worauf ein User Reference zeigen darf, ist eine Sicherheitsentscheidung, also ist sie in der Plattform festgelegt statt von einem Administrator in eine Definition eingetippt. Und weil der Typ bei jeder gespeicherten Antwort mit erfasst wird, hat die Frage \"welche unserer Felder enthalten Verweise auf Personen?\" eine Antwort, selbst für Werte, deren Definition sich seither geändert hat. Ein einzelner Typ mit einer Einstellung hätte beide Eigenschaften verloren.",

          storedTitle: "Was tatsächlich gespeichert wird",
          storedIntro:
            "Ein Referenzwert besteht aus zwei zusammengehaltenen Teilen. Das ist dieselbe Form, die Currency für seinen Betrag und seinen Code verwendet, und aus demselben Grund: Kein Teil bedeutet für sich allein etwas.",
          thPiece: "Teil",
          thWhat: "Was er ist",
          thRequired: "Erforderlich?",
          pieceTypeName: "Die Art des Datensatzes",
          pieceIdName: "Die Identität des Datensatzes",
          pieceTypeKey:
            "Die Art des Datensatzes, auf die verwiesen wird, als stabiler Bezeichner — zum Beispiel hrms.staff-member. Er wird bei der Antwort selbst gespeichert, nicht aus der Definition nachgeschlagen.",
          pieceTypeKeyRequired: "Ja — immer, bei jeder Antwort",
          pieceId:
            "Die Identität des konkreten Datensatzes, auf den verwiesen wird, als undurchsichtige Zeichenkette.",
          pieceIdRequired: "Ja — immer, bei jeder Antwort",
          storedNeither:
            "Eine Identität ohne Art von Datensatz benennt eine Zeile, aber keine Tabelle; eine Art von Datensatz ohne Identität benennt eine Tabelle, aber keine Zeile. Ein Wert gilt daher nur dann als leer, wenn beide Teile fehlen — genau wie sich Currency und Date & Time verhalten —, und die Hälfte einer Referenz wird zurückgewiesen statt still gespeichert oder still geleert. Sollten Sie je einen wegen einer unvollständigen Referenz zurückgewiesenen Speichervorgang sehen, wurde eines der beiden Elemente unberührt gelassen.",
          storedIdsTitle: "Die Identität ist undurchsichtig, und muss es bleiben",
          storedIdsContent:
            "Die Identität des Zieldatensatzes reist nie als lesbarer Datenbankschlüssel. Sie kommt als verschlüsselte Zeichenkette an, und alles, was eine Referenz liest oder schreibt, muss exakt die empfangene Zeichenkette zurücksenden — unverändert, ungekürzt, nicht kleingeschrieben, gegen kein Muster geprüft. Verändern Sie ein Zeichen, und das Produkt meldet den gespeicherten Verweis zu Recht als fehlerhaft, bei einer Referenz, die einen Moment zuvor noch vollkommen in Ordnung war. In dieser Zeichenkette gibt es nichts für einen Menschen zu lesen, und nichts, das zu lesen sich lohnte.",
          storedSymmetryTitle: "Dieselben zwei Namen in beiden Richtungen",
          storedSymmetryContent:
            "Eine Referenz wird unter denselben zwei Eigenschaftsnamen geschrieben, unter denen sie gelesen wird: entityTypeKey und entityId. Es gibt keine zweite Schreibweise für den einen Weg, und keine für den anderen. Wenn Sie gegen die Values-API integrieren, senden Sie exakt die Feldnamen zurück, die Ihnen gegeben wurden — für die Identität auf dem Hinweg einen anderen Namen zu erfinden ist keine Frage der Schreibweise, sondern ein Speichervorgang, der still überhaupt keinen Verweis mit sich führt und dann als unvollständige Referenz zurückgewiesen wird.",

          nameTitle: "Warum der Anzeigename nie gespeichert wird",
          nameIntro:
            "Das naheliegende Design wäre, den Namen neben der Identität zu speichern, damit eine Referenz angezeigt werden kann, ohne irgendjemanden etwas zu fragen. Das Produkt tut das bewusst nicht, und der Grund ist eine Berechtigungsgrenze, keine Vorliebe in Sachen Aktualität.",
          nameWhy:
            "Ein neben dem Verweis gespeicherter Name würde innerhalb des Datensatzes liegen, der das Feld trägt, und wäre daher für jeden lesbar, der die Berechtigung hat, diesen Datensatz anzusehen. Der Name gehört aber zum Ziel — er wird von der Berechtigung geschützt, die diese Art von Datensatz schützt. Ihn als Momentaufnahme zu speichern würde jemandem einen Namen aushändigen, dem nie die Berechtigung erteilt wurde, die ihn schützt. Das ist eine Umgehung von Berechtigungen im Gewand eines Performance-Arguments, und keine noch so große Zwischenspeicherung macht daraus etwas anderes.",
          nameCost:
            "Ein Name wird also bei jedem Lesen live aufgelöst, über einen Aufruf, der jedes Mal erneut die eigene Ansichtsberechtigung des Ziels und den eigenen Arbeitsbereichsfilter des Zielmoduls anwendet. Der praktische Vorteil ist genau der, den Sie ohnehin wollen würden: Ein auf seinem eigenen Datensatz korrigierter Name ist überall, wo er referenziert wird, sofort korrigiert, ohne dass irgendetwas erneut ausgeführt werden muss und ohne veraltete Kopien, nach denen gesucht werden müsste.",
          nameInfoTitle: "Was Sie dadurch bemerken werden",
          nameInfoContent:
            "Zwei Dinge, beide beabsichtigt. Ein Referenzfeld zeigt kurz einen Ladezustand, während sein Name abgerufen wird, statt sofort mit Text zu erscheinen und sich dann zu korrigieren. Und zwei Personen, die auf denselben Datensatz schauen, können in demselben Feld rechtmäßig unterschiedliche Dinge sehen: die eine den Namen des Mitarbeiters, die andere einen Hinweis, dass eine Referenz vorhanden ist, aber nicht, worauf sie zeigt. Keines von beiden ist ein Fehler.",

          pinTitle: "Einen Zieltyp auf der Definition festlegen",
          pinIntro:
            "Eine Entity-Reference-Definition trägt eine eigene optionale Einstellung: Target Entity Type. Sie beantwortet \"auf welche Art von Datensatz darf dieses Feld zeigen?\", und sie wird nur für Entity Reference angeboten — ein User-Reference-Feld zeigt sie nie, weil seine Antwort bereits feststeht.",
          thState: "Zustand der Einstellung",
          thMeans: "Was er bedeutet",
          thPickerShows: "Was das Datensatzformular dann zeigt",
          stateUnpinned: "Nicht festgelegt — jede erlaubte Art",
          meansUnpinned:
            "Jede Antwort darf auf jede Art von Datensatz zeigen, die die ausfüllende Person referenzieren darf, und jede Antwort erfasst, welche Art sie gewählt hat. In diesem Zustand beginnt eine brandneue Definition, und er bleibt für immer zulässig.",
          pickerUnpinned:
            "Zwei Elemente in dieser Reihenfolge: ein Element Record type, dann der Datensatz selbst. Das zweite bleibt untätig, bis das erste beantwortet ist, und die Wahl einer Art bewegt den Cursor nicht in das Datensatz-Element hinein — Sie bleiben, wo Sie sind, wobei das Datensatz-Element nun verfügbar ist.",
          statePinned: "Auf eine Art festgelegt",
          meansPinned:
            "Jede neue Antwort muss auf einen Datensatz genau dieser einen Art zeigen. Eine Antwort einer anderen Art wird zurückgewiesen, mit einer Meldung, die sowohl das Erwartete als auch das Angekommene nennt.",
          pickerPinned: "Ein Element: der Datensatz. Es gibt überhaupt kein Typ-Element.",
          stateUserRef: "Ein User-Reference-Feld",
          meansUserRef:
            "Dauerhaft gleichbedeutend damit, auf Benutzerkonten festgelegt zu sein, entschieden von der Plattform. Ein Versuch, es auf etwas anderes festzulegen, wird bereits bei der Definition zurückgewiesen, nicht erst beim Speichern.",
          pickerUserRef: "Ein Element: das Benutzerkonto. Es gibt nie ein Typ-Element.",
          pinRepoint:
            "Die Einstellung lässt sich später ändern, auch bei einem Feld, das bereits Antworten enthält, und das ist beabsichtigt — eine Ablehnung würde bedeuten, dass ein falsch festgelegtes Feld nie korrigiert werden könnte, ohne zuerst echte Daten zu zerstören. Was dabei geschieht, lohnt sich, genau festzuhalten, denn beide Hälften zählen: Jede bereits gespeicherte Antwort wird vollständig in Ruhe gelassen und liest sich weiterhin korrekt zurück, weil jede Antwort ihre eigene Art von Datensatz mitträgt. Der nächste Speichervorgang eines Datensatzes, dessen Antwort noch von der alten Art ist, wird zurückgewiesen, bis jemand diese Antwort erneut wählt.",
          pinRepointDetail:
            "Das Bearbeitungsformular sagt das, bevor Sie speichern. Lesen Sie diese Zeile, statt eines der beiden Extreme anzunehmen — ein Umstellen des Ziels ist weder folgenlos noch zerstörerisch.",
          pinWarnTitle: "Eine Folge des Umstellens, auf die Sie achten sollten",
          pinWarnContent:
            "Ein nicht festgelegtes Feld, das bereits eine Antwort enthält, bietet solange kein Typ-Element an, wie diese Antwort besteht, weil stattdessen die eigene Art von Datensatz der Antwort verwendet wird. Ein erneutes Wählen ist daher auf die Art von Datensatz beschränkt, auf die es bereits zeigt. Leeren Sie das Feld, und das Typ-Element kommt zurück. Das ist eine echte Grenze und kein Fehler, und es ist die Ausprägung dieser Funktion, die am ehesten als Fehler gemeldet wird.",

          targetsTitle: "Was derzeit referenziert werden kann",
          targetsIntro:
            "Die Liste lautet nicht \"jeder Datensatztyp im Produkt\". Eine Art von Datensatz kann nur referenziert werden, wenn das Modul, dem sie gehört, eine Möglichkeit bereitstellt, ihre Datensätze zu suchen und aufzulösen — indem es seine eigenen Daten nach den Regeln seiner eigenen Bildschirme liest, sodass eine Auswahlkomponente nie umfassender sein kann als der Bildschirm, den sie spiegelt. Sechs Arten von Datensatz stellen das heute bereit; die letzten drei kamen in einem späteren Release zu den ersten drei hinzu.",
          thType: "Datensatztyp",
          thKey: "Bezeichner",
          thOwner: "Gehört zu",
          thShows: "Was die Auswahlkomponente für jede Zeile zeigt",
          typeStaff: "Staff Member",
          keyStaff: "hrms.staff-member",
          ownerStaff: "Dem Modul für die Personalverwaltung",
          showsStaff:
            "Den Namen der Person, mit ihrer Berufsbezeichnung darunter als Unterscheidungsmerkmal. Bewusst die Berufsbezeichnung statt einer E-Mail-Adresse: Eine Auswahlkomponente muss zwei Personen mit demselben Namen auseinanderhalten können und braucht dafür nicht deren Kontaktdaten.",
          typeUser: "User",
          keyUser: "identity.user",
          ownerUser: "Dem Identitätsmodul",
          showsUser:
            "Den Namen des Kontoinhabers, mit dem Benutzernamen darunter. Ein Konto, dessen Anmeldung derzeit gesperrt ist, wird als inaktiv angezeigt, bleibt aber auswählbar.",
          typePerson: "Party Person",
          keyPerson: "party.person",
          ownerPerson: "Dem Modul für Parteien und Beziehungen",
          showsPerson:
            "Nur den Namen der Person. Das besitzende Modul liefert überhaupt keine zweite Zeile, da es beurteilt hat, dass alles, was es hinzufügen könnte, personenbezogene Daten wären, die eine Auswahlkomponente nicht braucht.",
          typeAdmin: "Administrator",
          keyAdmin: "identity.admin",
          ownerAdmin: "Dem Identitätsmodul",
          showsAdmin:
            "Den Namen des Administrators, mit Rückgriff auf den Benutzernamen, wenn beide Namensteile leer sind, und dem Benutzernamen als zweiter Zeile. Bewusst nie die E-Mail-Adresse, die Telefonnummer, Rollennamen oder ob die Zeile ein Super Admin ist — die schmalste der drei personenähnlichen Zeilen auf dieser Liste, weil ein Administrator-Datensatz das Sensibelste ist, worauf diese Schnittstelle zeigen kann.",
          typeTeam: "Team",
          keyTeam: "organization.team",
          ownerTeam: "Dem Organisationsmodul",
          showsTeam:
            "Nur den Namen des Teams, ohne zweite Zeile. Zwei Teams, die sich in unterschiedlichen Abteilungen einen Namen teilen, werden heute identisch dargestellt — die Abteilung, die sie auseinanderhalten würde, steht nicht in der Zeile dieser Auswahlkomponente.",
          typeBranch: "Branch",
          keyBranch: "organization.branch",
          ownerBranch: "Dem Organisationsmodul",
          showsBranch:
            "Den Namen der Niederlassung, mit ihrer Zeitzone darunter als Unterscheidungsmerkmal — aus demselben Grund, aus dem zwei beide \"Main\" genannte Niederlassungen bereits auf dem Bildschirm für Niederlassungen selbst auseinandergehalten werden.",
          targetsRefused:
            "Alles andere wird zurückgewiesen statt mit einer leeren Liste beantwortet, und dieser Unterschied ist der springende Punkt: Eine leere Liste sieht wie ein normales Ergebnis aus und würde einem Administrator sagen \"es gibt keine Mitarbeitenden\", was eine falsche Aussage im Gewand einer richtigen ist. Eine Art von Datensatz, für die die Plattform nicht zuständig sein kann, erzeugt stattdessen eine klare Zurückweisung, die das Datensatzformular als Satz darstellt, der besagt, dass diese Art von Datensatz in dieser Installation nicht verfügbar ist.",
          targetsEmpty:
            "Und eine wirklich leere Liste verfügbarer Typen ist selbst eine legitime Antwort, kein Fehlschlag. Sie bedeutet \"es gibt nichts, worauf Sie eine Referenz richten dürfen\", was aus zwei ganz unterschiedlichen Gründen passieren kann: Die Module, denen diese Datensätze gehören, sind möglicherweise nicht Teil dieser Installation, oder Sie besitzen möglicherweise keinen Lesezugriff auf keinen davon. Das Produkt nennt beide Möglichkeiten, ohne eine davon zu behaupten, denn nur die zweite lässt sich durch das Beantragen von Berechtigungen beheben.",
          targetsWhyNot:
            "Zwei Arten von Datensatz, die so aussehen, als gehörten sie auf diese Liste, und die absichtlich ausgeschlossen sind (Administrator-Datensätze waren früher eine dritte, bis ein späteres Release ihnen einen eigenen Lookup-Provider gab — sie stehen jetzt oben in der Tabelle, nicht hier):",
          targetsWhyNotGroup:
            "Benutzergruppen. Vollkommen gefahrlos, und schlicht keine Person. Ein als User Reference typisiertes Feld, das sich zu einer Gruppe auflöste, würde über das lügen, was es enthält.",
          targetsWhyNotTheme:
            "Gemeinsam genutzte Plattformkatalog-Zeilen wie Anmelde-Themes. Sie gehören per Entwurf zu keinem Arbeitsbereich, fallen also durch denselben Test wie Administrator-Datensätze, und sind ebenfalls keine Personen.",
          targetsInfoTitle: "Die Liste, die Sie sehen, ist die Liste, die Sie nutzen dürfen",
          targetsInfoContent:
            "Die verfügbaren Typen werden gefiltert, bevor sie Sie erreichen: registriert, von dieser Installation beantwortbar, und für Sie zulässig. Jeder Eintrag, der Ihnen angeboten wird, funktioniert, wenn Sie ihn benutzen, und nichts, was Ihnen angeboten wird, weist Sie beim nächsten Klick zurück. Deshalb wird die Liste abgerufen, wenn Sie das Element öffnen, statt wenn das Formular lädt — ein Datensatzformular mit mehreren Referenzfeldern, die niemand anfasst, verlangt den anderen Modulen überhaupt nichts ab.",

          tenantTitle: "Arbeitsbereichs- und Plattformregeln",
          tenantIntro:
            "Referenzen überschreiten eine Modulgrenze, was die Arbeitsbereichsgrenze zu dem Punkt macht, bei dem Genauigkeit zählt. Fünf Regeln, alle durchgesetzt statt nur empfohlen.",
          tenant1:
            "Alles ist arbeitsbereichsgeschützt. Sowohl die Suche nach einem Datensatz als auch das Auflösen eines bereits gehaltenen Datensatzes lesen über das eigene Repository des besitzenden Moduls, sodass derselbe Arbeitsbereichsfilter und derselbe Filter für gelöschte Datensätze gelten, die auch auf den eigenen Bildschirmen dieses Moduls gelten. Sie können nur auf Datensätze verweisen, die Ihr Arbeitsbereich bereits sehen kann.",
          tenant2:
            "Eine Identität zu besitzen ist keine Berechtigung. Eine Referenz wird bei jedem einzelnen Lesen erneut autorisiert: Die eigene Ansichtsberechtigung des Ziels ist jedes Mal erneut erforderlich, und die Tatsache, dass der Verweis bereits gespeichert ist, zählt für nichts.",
          tenant3:
            "Ein Datensatz eines anderen Arbeitsbereichs und ein gelöschter Datensatz sind bewusst eine ununterscheidbare Antwort. Wären sie unterscheidbar, könnte jemand Identitäten einzeln durchprobieren, um herauszufinden, was in einem Arbeitsbereich existiert, den er nicht sehen kann. \"Sie dürfen diese Art von Datensatz nicht sehen\" wird von \"dieser Datensatz ist weg\" unterschieden, weil diese beiden entgegengesetzte Abhilfen haben und keine von beiden irgendetwas preisgibt.",
          tenant4:
            "Datensätze auf Plattformebene gehören Plattformadministratoren. Ein auf Plattformebene angelegtes benutzerdefiniertes Feld wird von jedem Arbeitsbereich geerbt und kann nur von einem Plattformadministrator angelegt, bearbeitet oder gelöscht werden — einschließlich des festgelegten Zieltyps eines Referenzfelds auf Plattformebene, den kein Arbeitsbereich ändern kann.",
          tenant5:
            "Niemand darf einen Administrator außerhalb des eigenen Arbeitsbereichs zuweisen. In der Praxis geht das Produkt über das hinaus, was die Regel verlangt: Ein Administrator-Datensatz kann überhaupt nicht von einem Referenzfeld referenziert werden, weder im eigenen Arbeitsbereich noch in einem anderen, genau weil ein Administrator außerhalb jedes Arbeitsbereichs stehen kann.",
          tenantWarnTitle: "Eine Sache, die dies nicht leistet",
          tenantWarnContent:
            "Eine Referenz ist so streng wie der eigene Listenbildschirm des Ziels, und nicht strenger. Ist eine Art von Datensatz für eine Rolle über deren eigenen Bildschirm sichtbar, ist sie über eine Auswahlkomponente für dieselbe Rolle auswählbar — engere Regeln als \"dieser gesamte Arbeitsbereich\" werden nicht zusätzlich angewendet. Behandeln Sie eine Referenz-Auswahlkomponente also nicht als Möglichkeit, Datensätze zu verbergen, die das Zielmodul selbst bereits zeigt.",

          exampleTitle: "Ein durchgerechnetes Beispiel: ein Administrator-Datensatz, der auf ein Mitglied des Personals zeigt",
          exampleIntro:
            "Der Fall, für den diese Typen gebaut wurden. Ihre Administratoren sind auch Angestellte, und Sie möchten, dass jeder Administrator-Datensatz angibt, welcher Personal-Datensatz dieselbe Person ist — einmal korrekt erfasst, und nie erneut eingetippt.",
          ex1Title: "Entscheiden Sie, welchen Typ Sie brauchen",
          ex1Content:
            "Die Antwort ist ein Mitglied des Personals, kein Login-Konto, also ist dies eine Entity Reference. Hätte die Frage \"wer hat das geprüft?\" gelautet, wäre die Antwort ein Konto und User Reference die richtige Wahl gewesen — und der Werttyp ist dauerhaft, also lohnt sich der Moment des Nachdenkens.",
          ex2Title: "Definieren Sie das Feld",
          ex2Content:
            "Wählen Sie auf dem Bildschirm Benutzerdefinierte Felder Add, wählen Sie den Administrator-Datensatztyp, setzen Sie den Schlüssel auf staff_record, die englische Bezeichnung auf Staff record, und den Werttyp auf Entity Reference. Ein Element Target Entity Type erscheint, sobald Sie diesen Werttyp wählen.",
          ex3Title: "Legen Sie das Ziel auf Staff Member fest",
          ex3Content:
            "Setzen Sie Target Entity Type auf Staff Member. Das ist es, was das Feld von \"einem Verweis auf irgendetwas\" zu \"einem Verweis auf ein Mitglied des Personals\" macht, und es ist das, was das Datensatzformular ein einzelnes Element statt zweier zeigen lässt. Lassen Sie es nur dann als Not pinned, wenn Sie wirklich möchten, dass verschiedene Administratoren auf verschiedene Arten von Datensatz zeigen.",
          ex4Title: "Füllen Sie es bei einem Datensatz aus",
          ex4Content:
            "Öffnen Sie einen beliebigen Administrator-Datensatz. Der Abschnitt Benutzerdefinierte Felder zeigt nun ein Element Staff record mit einem Platzhalter, der Sie einlädt, einen Datensatz zu wählen. Öffnen Sie es, tippen Sie einen Teil eines Namens, und die Liste verengt sich auf passende Mitglieder des Personals mit ihrer Berufsbezeichnung darunter. Wählen Sie eines und speichern Sie den Datensatz.",
          ex5Title: "Lesen Sie es zurück, und bemerken Sie, was geschah",
          ex5Content:
            "Öffnen Sie den Datensatz erneut. Das Feld zeigt den Namen des Mitglieds des Personals — soeben abgerufen, nicht aus Ihrem Speichervorgang erinnert. Ändern Sie den Nachnamen dieser Person auf ihrem eigenen Personal-Datensatz, kommen Sie zurück, und die Referenz zeigt den neuen Nachnamen, ohne dass jemand den Administrator-Datensatz angefasst hätte.",
          ex6Title: "Prüfen Sie die beiden Verhaltensweisen, die zählen",
          ex6Content:
            "Melden Sie sich als jemand an, der Administratoren bearbeiten, aber Personal nicht ansehen darf: Das Feld ist vorhanden, es sagt, dass der gespeicherte Wert in Ordnung ist und dass diese Person den Namen nicht sehen darf, und sie kann ihn nicht überschreiben. Löschen Sie dann das Mitglied des Personals: Die Referenz leert sich selbst, der Administrator-Datensatz behält seine Wertzeile und seinen Verlauf, und das Feld liest sich als leer statt als defekter Verweis.",

          userExampleTitle: "Ein durchgerechnetes Beispiel: ein Feld Reviewed by",
          userExampleIntro:
            "Der Fall für User Reference, der genau deshalb kürzer ist, weil es nichts zu konfigurieren gibt.",
          ux1Title: "Definieren Sie das Feld",
          ux1Content:
            "Fügen Sie ein Feld bei dem gewünschten Datensatztyp hinzu, setzen Sie den Schlüssel auf reviewed_by, die Bezeichnung auf Reviewed by, und den Werttyp auf User Reference. Es erscheint kein Ziel-Element, und das ist richtig so — die Antwort kann immer nur ein Benutzerkonto sein.",
          ux2Title: "Füllen Sie es aus",
          ux2Content:
            "Öffnen Sie einen Datensatz dieses Typs. Das Element Reviewed by bietet eine durchsuchbare Liste von Benutzerkonten, jedes mit seinem Benutzernamen unter dem Namen. Konten, die derzeit gesperrt sind, werden als inaktiv markiert und bleiben auswählbar, weil sie legitime Antworten für etwas sind, das bereits geschehen ist.",
          ux3Title: "Bestätigen Sie, was es speichert",
          ux3Content:
            "Die Antwort erfasst den Typ Benutzerkonto und die Identität dieses Kontos — dieselben zwei Bestandteile, die auch eine Entity Reference speichert, sodass ein Feld, das User Reference angibt, Ihnen sagt, was es enthält, statt nur, wie es konfiguriert wurde.",
          ux4Title: "Bestätigen Sie, was es zurückweist",
          ux4Content:
            "Es gibt keine Möglichkeit, weder über dieses Formular noch über eine Anfrage, die es umgeht, dieses Feld auf einen Administrator, eine Benutzergruppe oder eine Plattformkatalog-Zeile zeigen zu lassen. Die Zurückweisung kommt mit einer Meldung, die nennt, was erlaubt ist, und sie erfolgt sowohl bei der Definition als auch beim Speichern.",

          notTitle: "Was Referenzfelder nicht sind",
          notIntro:
            "Vernünftige Erwartungen, die diese Typen bewusst nicht erfüllen. Keine davon ist ein meldenswerter Fehler.",
          not1:
            "Sie sind keine Beziehung, die das Produkt versteht. Nichts wird aus einer Referenz berechnet, nichts wird durch sie ausgelöst, und kein Bildschirm gewinnt eine Liste \"Datensätze, die auf diesen zeigen\", nur weil eine Referenz existiert.",
          not2:
            "Sie sind kein Weg, um Datensätze zu verbergen. Eine Auswahlkomponente zeigt exakt das, was die eigenen Bildschirme des Zielmoduls derselben Person zeigen. Sollte jemand eine Art von Datensatz nicht sehen, ist das eine Berechtigung auf dieser Art von Datensatz.",
          not3:
            "Sie speichern nie einen Namen, und es gibt keine Einstellung, die das ändert. Ein Feld, das das Löschen des Ziels überleben muss, wobei der alte Name weiterhin lesbar bleibt, ist ein Textfeld, und zu akzeptieren, dass es auseinanderdriftet, ist der Preis dieser Wahl.",
          not4:
            "Sie sind nicht mehrwertig. Ein Referenzfeld enthält einen Verweis. Es gibt keinen mehrwertigen Referenztyp, und MultiSelect kann nicht auf Datensätze verweisen — seine Antworten sind von Ihnen verfasster Text.",
          not5:
            "Sie können nicht auf jede Art von Datensatz zeigen. Nur die Arten, deren besitzendes Modul eine durchsuchbare, berechtigungsgeprüfte Liste bereitstellt, können referenziert werden, und der Rest wird zurückgewiesen statt still angeboten.",
          not6:
            "Sie werden nicht im Tabellenexport der Definitionen mitgeführt. Diese Datei hat achtzehn Spalten, und ein festgelegter Zieltyp ist keine davon, sodass eine exportierte Definition nicht erfasst, worauf ihr Feld zeigt.",

          nextTitle: "Wie es weitergeht",
          nextIntro:
            "Die Mechanik des Nachschlagens einer Referenz — die drei Lookups, jeder Fehlerzustand, und was in jedem Fall zu tun ist — steht auf einer eigenen Seite.",
          thPage: "Seite",
          thCovers: "Was sie behandelt",
          pageLookups: "Referenz-Lookups",
          coversLookups:
            "Die drei Lookups hinter einer Referenz, was jede Antwort und jede Zurückweisung bedeutet, die fünf Fehlerzustände und wessen Problem jeder davon ist, das Löschverhalten, und wie die Auswahlkomponente paginiert.",
          pageValueTypes: "Werttypen",
          coversValueTypes:
            "Alle zweiundzwanzig Werttypen im Vergleich, einschließlich dieser beiden, mit durchgerechneten Beispieleingaben und dem Fehlercode, den jede Zurückweisung zurückgibt.",
          pageDefining: "Ein Feld definieren",
          coversDefining:
            "Das Definitionsformular Element für Element, einschließlich des Elements Target Entity Type und jeder Zurückweisung, die es erzeugen kann.",
        },

        // ═══════════════════════════════════════════════════
        //  Referenz-Lookups
        // ═══════════════════════════════════════════════════
        referenceLookups: {
          title: "Referenz-Lookups",
          description:
            "Wie eine Referenz nachgeschlagen wird: die drei Lookups hinter einem Referenzfeld, was jede Antwort bedeutet, die fünf Fehlerzustände und wessen Problem jeder davon ist, was beim Löschen des referenzierten Datensatzes passiert, und wie sich die Auswahlkomponente verhält.",
          intro:
            "Ein Referenzfeld wird durch drei getrennte Lookups gezeichnet: einer fragt, auf welche Arten von Datensatz Sie verweisen dürfen, einer durchsucht eine gewählte Art, und einer löst einen bereits gehaltenen Verweis zu einem Namen auf. Diese Seite behandelt alle drei, jede Antwort, die jeder von ihnen geben kann, und — der Teil, der sich zu lesen lohnt, bevor irgendetwas schiefgeht — was jede unterschiedliche Art von Fehlschlag bedeutet und wer sie beheben kann.",
          whyThreeTitle: "Warum der Name gesondert eintrifft",
          whyThreeContent:
            "Die eigenen Werte des Datensatzes werden in einem Aufruf gelesen; der Name jeder Referenz wird dann in seinem eigenen aufgelöst. Das ist kein Versehen. Das Auflösen eines Namens wird von der eigenen Berechtigung des Ziels geschützt, muss also seine eigene berechtigungsgeprüfte Lesung sein — und es inline zu tun würde eine modulübergreifende Abfrage pro Referenz pro Zeile bedeuten, was bei einer Liste von Datensätzen eine Abfrage pro Zelle wäre.",

          endpointsTitle: "Die drei Lookups",
          endpointsIntro:
            "Alle drei liegen unter einer eigenen Adresse statt neben den übrigen Aufrufen für benutzerdefinierte Felder, und das ist beabsichtigt: Sie lesen Daten anderer Module, also werden sie von der eigenen Ansichtsberechtigung der jeweiligen Zielart geschützt, nicht von der Berechtigung, Felddefinitionen zu verwalten. Jemand, der benutzerdefinierte Felder verwaltet, aber Personal nicht lesen darf, wird hier zu Recht zurückgewiesen.",
          endpointsTypes: "Listet die Arten von Datensatz, auf die dieser Aufrufer gerade jetzt verweisen darf.",
          endpointsSearch: "Gibt eine Seite auswählbarer Datensätze einer Art zurück, optional gefiltert.",
          endpointsResolve: "Löst einen Verweis, den der Aufrufer bereits hält, zu seinem Datensatz auf.",
          endpointsPermission:
            "Es gibt also keine einzelne Berechtigung, die diese Funktion öffnet. Alle drei verlangen, dass Sie als Administrator angemeldet sind, und jeder verlangt dann die Ansichtsberechtigung für die Art von Datensatz in der Adresse: Mitglieder des Personals aufzulisten braucht die Ansichtsberechtigung für Personal, Benutzerkonten aufzulisten braucht die für Benutzerkonten. Die zu erwartende Folge ist, dass dieselbe Person von einem dieser Lookups zugelassen und vom nächsten zurückgewiesen werden kann, auf demselben Bildschirm, und beide Antworten sind korrekt.",

          typesTitle: "Auflisten, worauf Sie verweisen dürfen",
          typesWhat:
            "Dies antwortet mit der gefilterten Menge, nicht dem vollständigen Katalog: registriert, von dieser Installation beantwortbar, und für Sie zulässig. Jeder zurückgegebene Eintrag ist sofort nutzbar, was der ganze Grund für seine Existenz ist — ein Element, das jede registrierte Art von Datensatz anbieten würde, würde Möglichkeiten anbieten, die Sie beim nächsten Klick zurückweisen, und die Alternative, jede der Reihe nach auszuprobieren, wäre eine Handvoll Ablehnungen pro Seitenaufruf.",
          typesEmpty:
            "Eine leere Liste ist ein Erfolg, kein Fehlschlag. Sie bedeutet \"Sie dürfen auf nichts eine Referenz richten\", und sie wird als erklärender Satz innerhalb des Elements dargestellt statt als Fehler oder als still leeres Dropdown. Sie hat zwei mögliche Ursachen, und das Produkt nennt beide, ohne eine zu behaupten: Die besitzenden Module sind möglicherweise nicht Teil dieser Installation, oder Sie besitzen möglicherweise keinen Lesezugriff auf sie. Nur die zweite lässt sich durch das Beantragen von Berechtigungen beheben, weshalb ein Text, der eine Ursache benennt, jemanden dazu bringen würde, etwas zu tun, das nicht funktionieren kann.",
          typesShape:
            "Jeder Eintrag trägt seinen stabilen Bezeichner, das Modul, dem er gehört, und einen Anzeigenamen auf Englisch und Arabisch. Diese Namen stammen aus der eigenen Registry der Plattform statt aus den Übersetzungen dieser Anwendung, sodass sie so gezeigt werden, wie sie geliefert wurden, und nie als Übersetzungsschlüssel nachgeschlagen werden.",

          searchTitle: "Eine Art von Datensatz durchsuchen",
          searchWhat:
            "Eine Seite auswählbarer Datensätze, in stabiler Reihenfolge, mit einem optionalen Freitextfilter. Welche Spalten der Filter durchsucht, ist die Wahl des besitzenden Moduls, keine hier gegebene Zusage.",
          searchPaging:
            "Eine Seite enthält standardmäßig zwanzig Zeilen. Eine Anfrage nach mehr als hundert wird still gedeckelt statt zurückgewiesen, und die Reihenfolge ist absichtlich über Aufrufe hinweg stabil — eine instabile Reihenfolge würde dazu führen, dass Seite zwei Zeilen zurückgibt, die Sie schon auf Seite eins gesehen haben. Das Element lädt die erste Seite und sammelt weitere Seiten dann hinter einem Element Load more an, statt zu ersetzen, was Sie gerade betrachtet haben.",
          searchRows:
            "Jede Zeile trägt einen Anzeigenamen, der nie leer ist, eine optionale zweite Zeile, um zwei ähnlich benannte Datensätze auseinanderzuhalten, und eine Markierung, ob der Datensatz ruhend ist. Gelöschte Datensätze werden überhaupt nicht zurückgegeben, sodass diese Markierung nie gelöscht bedeutet — eine ruhende Zeile ist vorhanden, auswählbar, und eine vollkommen gültige Antwort.",
          searchTyping:
            "Das Tippen wird verzögert (debounced), bevor daraus eine Anfrage wird. Ohne das würde ein achtzeichiger Name acht modulübergreifende Abfragen auslösen, von denen sieben Antworten verworfen würden — und die, die gerendert wird, wäre diejenige, die zuletzt zurückkam, statt derjenigen, die zu dem passt, was Sie getippt haben.",

          resolveTitle: "Einen bereits gehaltenen Verweis auflösen",
          resolveWhat:
            "Die Lese-Hälfte der Funktion, und der einzige Weg, wie eine gespeicherte Referenz je zu einem Namen auf dem Bildschirm wird. Er nimmt die Art des Datensatzes und die Identität und gibt genau dieselbe Form zurück, die auch eine Zeile der Auswahlkomponente hat — sodass eine aus der Datenbank geladene Referenz und ein soeben gewählter Datensatz aus einem einzigen Vertrag statt aus zwei gezeichnet werden.",
          resolveGates:
            "Er wendet jede Schranke an, die auch die Suche anwendet: Die Art des Datensatzes muss registriert sein, Sie müssen die eigene Ansichtsberechtigung dieser Art besitzen, diese Installation muss für sie zuständig sein können, und der Datensatz wird über das arbeitsbereichsgefilterte und um gelöschte Datensätze bereinigte Repository des besitzenden Moduls gelesen. Nichts an der Tatsache, dass dies eine reine Anzeigelesung ist, lockert eine davon.",
          resolveNoName:
            "Er ist auch die einzige Stelle, von der ein Name stammt. Nichts an einer gespeicherten Referenz enthält von sich aus einen Namen, mit Absicht, sodass ein Feld, das sich nicht auflösen lässt, einen konkreten Satz zeigt, warum — nie einen Namen, an den es sich von früher erinnert.",

          statusesTitle: "Was jede Antwort bedeutet",
          statusesIntro:
            "Die Antworten sind bewusst voneinander unterscheidbar, mit genau einer beibehaltenen Zusammenlegung. Lesen Sie diese Tabelle als die Landkarte von dem, was Ihnen das Produkt mitteilt, zu dem, was Sie deswegen tun sollten.",
          thAnswer: "Antwort",
          thWhatItMeans: "Was sie bedeutet",
          thWhoFixes: "Wessen Problem es ist",
          ansOk: "Erfolg",
          ansOkMeans:
            "Der Datensatz wurde aufgelöst. Sie erhalten seinen aktuellen Namen, seine optionale zweite Zeile, und ob er ruhend ist.",
          ansOkFixes: "Niemandes — das ist der Normalfall.",
          ansForbidden: "Nicht zulässig",
          ansForbiddenMeans:
            "Sie besitzen nicht die Ansichtsberechtigung für diese Art von Datensatz. Das sagt überhaupt nichts über den Datensatz aus, oder darüber, ob er noch existiert.",
          ansForbiddenFixes:
            "Wer auch immer Rollen verwaltet. Es ist eine Tatsache über Ihren eigenen Zugriff, und Sie hätten sie bereits durch das Lesen Ihrer eigenen Berechtigungen erfahren können.",
          ansNotFound: "Nicht gefunden",
          ansNotFoundMeans:
            "Der Datensatz löst sich nicht auf. Er wurde gelöscht, oder er gehört zu einem Arbeitsbereich, den Sie nicht sehen können — absichtlich zu einer Antwort zusammengeführt, damit dieser Lookup nicht benutzt werden kann, um zu testen, was anderswo existiert.",
          ansNotFoundFixes:
            "Wer auch immer die Daten besitzt. Wählen Sie einen anderen Datensatz, oder leeren Sie das Feld.",
          ansUnknownType: "Unbekannter Datensatztyp",
          ansUnknownTypeMeans:
            "Die genannte Art von Datensatz ist überhaupt nicht registriert. Das beschreibt die Installation, nicht irgendeinen Datensatz — es bedeutet meist, dass ein Feld auf eine Art von Datensatz festgelegt wurde, die seither ausgemustert wurde.",
          ansUnknownTypeFixes: "Wer auch immer die Bereitstellung verwaltet.",
          ansUnavailable: "Modul nicht verfügbar",
          ansUnavailableMeans:
            "Die Art von Datensatz ist registriert, aber das Modul, dem sie gehört, ist nicht Teil dieser Installation, sodass nichts hier für sie zuständig sein kann. Keine Berechtigungsvergabe wird das je ändern.",
          ansUnavailableFixes: "Wer auch immer die Bereitstellung verwaltet.",
          ansInvalidId: "Ungültige Identität",
          ansInvalidIdMeans:
            "Die gesendete Identität ließ sich überhaupt nicht lesen. Entweder wurde sie auf ihrem Weg irgendwo verändert, oder ein gespeicherter Wert stammt von vor einer Änderung und lässt sich nicht mehr interpretieren.",
          ansInvalidIdFixes:
            "Wer auch immer den Datensatz ausfüllt — wählen Sie den Datensatz erneut. Dieser wird ersetzt, nie neu verknüpft.",
          statusesInfoTitle: "Was die Antworten bewusst nicht verraten",
          statusesInfoContent:
            "\"Gelöscht\" und \"in einem Arbeitsbereich, den Sie nicht sehen können\" sind eine Antwort und werden es immer bleiben. Sie zu trennen würde jemandem erlauben, Identitäten einzeln durchzuprobieren, um herauszufinden, was in einem anderen Arbeitsbereich existiert. Alles andere ist unterscheidbar, weil alles andere entweder Ihren eigenen Zugriff oder diese Installation beschreibt — von denen keines ein Geheimnis vor Ihnen ist.",

          failuresTitle: "Die fünf Fehlerzustände, und warum sie sich unterschiedlich lesen",
          failuresIntro:
            "Ein Referenzfeld kann aus fünf unterschiedlichen Gründen nicht angezeigt werden. Es sind fünf verschiedene Sätze auf dem Bildschirm, weil es fünf verschiedene Probleme mit fünf verschiedenen Abhilfen sind, und das ist die mit Abstand wichtigste Tabelle auf dieser Seite.",
          thState: "Was passiert ist",
          thOnScreen: "Was das Feld sagt und tut",
          thYouDo: "Was Sie tun sollten",
          stNoPermission: "Sie dürfen diese Art von Datensatz nicht ansehen",
          scrNoPermission:
            "Das Feld gibt an, dass der gespeicherte Wert in Ordnung ist, sein Name Ihnen aber nicht gezeigt werden kann, und wird schreibgeschützt — lesbar, ohne Auswahlkomponente. Es wird bewusst nicht geleert, weil das Leeren jemanden ohne Einsicht in das Ziel dazu einladen würde, eine vollkommen gute Referenz zu überschreiben.",
          doNoPermission:
            "Nichts an den Daten. Bitten Sie, wer auch immer Rollen verwaltet, um Ansichtszugriff auf diese Art von Datensatz.",
          stGone: "Der referenzierte Datensatz existiert nicht mehr",
          scrGone:
            "Das Feld gibt an, dass der Datensatz nicht gefunden werden kann, nennt beide möglichen Gründe — gelöscht, oder in einer Organisation, die Sie nicht sehen können — und behauptet keinen von beiden. Es bleibt bearbeitbar.",
          doGone: "Wählen Sie einen anderen Datensatz, oder leeren Sie das Feld. Erneutes Wählen ist die Abhilfe.",
          stMalformed: "Die gespeicherte Referenz ist fehlerhaft",
          scrMalformed:
            "Das Feld gibt an, dass sich das Gespeicherte überhaupt nicht lesen lässt, bleibt bearbeitbar, und markiert sich zusätzlich als ungültig — weil dies, anders als ein baumelnder Verweis, kein Wert ist, den das Produkt je rechtmäßig erzeugt hätte.",
          doMalformed:
            "Wählen Sie den Datensatz erneut. Dieser muss ersetzt statt neu verknüpft werden, und es lohnt sich, ihn zu melden, wenn Sie ihn nicht selbst verursacht haben.",
          stTransient: "Der Lookup konnte gerade eben nicht ausgeführt werden",
          scrTransient:
            "Das Feld gibt an, dass es den referenzierten Datensatz im Moment nicht laden konnte und dass die Referenz selbst in Ordnung ist, und bietet ein Element Try again.",
          doTransient:
            "Versuchen Sie es erneut. Leeren Sie das Feld auf keinen Fall — der gespeicherte Wert ist gut, und ihn zu leeren ist die eine Handlung, die einen vorübergehenden Fehlschlag in echten Datenverlust verwandelt.",
          stTypeUnavailable: "Diese Installation kann für diese Art von Datensatz nicht zuständig sein",
          scrTypeUnavailable:
            "Das Feld gibt an, dass diese Art von Datensatz in dieser Installation nicht verfügbar ist, und bietet kein Element Try again an — weil ein erneuter Versuch jedes Mal identisch zurückgewiesen würde.",
          doTypeUnavailable:
            "Fragen Sie, wer auch immer die Bereitstellung verwaltet, welche Arten von Datensatz diese Installation nutzen kann. Das ist eine Frage der Installation, keine der Berechtigung.",
          greyDashTitle: "Warum das nicht ein einziger grauer Strich ist",
          greyDashContent:
            "Jeder der fünf Fälle könnte als leeres Feld dargestellt werden, und das Ergebnis wäre ein Verweis auf einen gelöschten Datensatz, der ein Jahr lang unbemerkt bleibt — nicht zu unterscheiden von einem Feld, das nie jemand ausgefüllt hat, und nicht zu unterscheiden von einer Kollegin, die einfach keine Berechtigung hat. Diese zusammenzulegen ist keine kosmetische Vereinfachung; es löscht die einzige Information, die sagt, wessen Problem es ist. Sollten Sie je versucht sein, diese gleich lesen zu lassen, ist dies der Absatz, der sagt, warum nicht.",
          emptyVsFailedTitle: "Ein leeres Feld ist eine sechste Sache",
          emptyVsFailedContent:
            "Eine Referenz, die nie ausgefüllt wurde, liest sich als leer, und das ist eine andere Tatsache als alle fünf oben. Deshalb wird eine ausgefüllte Referenz, deren Ziel weg ist, nie als leer gemeldet: Ein Betrachter, der auf eine leere Zelle schaut, muss \"niemand hat das beantwortet\" von \"die Antwort zeigt auf etwas, das nicht mehr da ist\" unterscheiden können.",

          saveTitle: "Was beim Speichern einer Referenz geprüft wird",
          saveIntro:
            "Jeder Speichervorgang einer Referenz durchläuft dieselben Prüfungen in derselben Reihenfolge, und jede scheitert mit ihrer eigenen Meldung statt mit einer allgemeinen \"ungültige Referenz\". Diese Reihenfolge zu kennen erklärt jede Zurückweisung, auf die Sie stoßen können.",
          save1:
            "Beide Teile vorhanden. Eine Übermittlung, der entweder die Art des Datensatzes oder die Identität fehlt, wird als unvollständige Referenz zurückgewiesen — nie als leeres Feld behandelt, weil eine halbe Referenz bedeutet, dass jemand mit dem Antworten begonnen und aufgehört hat.",
          save2:
            "Die Art des Datensatzes ist registriert. Ein nicht registrierter Bezeichner hat keine Berechtigung hinter sich, sodass es nichts gäbe, wogegen die späteren Prüfungen prüfen könnten. Zurückgewiesen, unter Nennung des Bezeichners.",
          save3:
            "Die Art des Datensatzes ist für diesen Werttyp zulässig. Bei Entity Reference immer wahr; bei User Reference ist dies die feste Positivliste der Plattform, und die Zurückweisung nennt, was erlaubt ist, statt nur, dass Ihre Wahl es nicht war.",
          save4:
            "Die Art des Datensatzes stimmt mit der Festlegung der Definition überein, sofern es eine gibt. Zurückgewiesen, unter Nennung sowohl dessen, was erwartet wurde, als auch dessen, was ankam. Eine nicht festgelegte Definition überspringt diese Prüfung vollständig — nicht festgelegt bedeutet \"jede erlaubte Art\", und darf nie als \"nichts konfiguriert, also nichts gültig\" gelesen werden.",
          save5:
            "Die Identität lässt sich lesen. Eine veraltete oder veränderte Identität wird sauber als ungültige Identität zurückgewiesen, bei genau diesem Feld, statt den gesamten Speichervorgang mit einem unerklärten Fehler scheitern zu lassen.",
          save6:
            "Sie konnten diesen Datensatz gerade jetzt lesen. Das ist die Prüfung, die alles andere sicher macht, und sie ist absichtlich eine einzige knappe Zurückweisung ohne Details — siehe unten.",
          saveGate:
            "Diese letzte Prüfung hält Sie an die eigene Ansichtsberechtigung der Zielart und löst den Datensatz über das arbeitsbereichsgefilterte Repository des besitzenden Moduls auf. Ohne sie wäre die Funktion ein Extraktionswerkzeug statt eine Referenz: Jemand, der einen Administrator-Datensatz bearbeiten, aber Personal nicht lesen darf, könnte eine beliebige Personal-Identität speichern und den Namen dann über den Resolve-Lookup zurücklesen. Einen Verweis auf Daten zu speichern ist eine aufgeschobene Lesung dieser Daten.",
          saveGateInfoTitle: "Warum diese eine Zurückweisung so wenig sagt",
          saveGateInfoContent:
            "Das ist die einzige Stelle in der gesamten Funktion, an der Sie eine beliebige Identität liefern, also die einzige Stelle, die zu einem Mittel werden könnte, um zu testen, was in einem anderen Arbeitsbereich existiert. Sie fasst deshalb jeden Grund zu einer einzigen Zurückweisung zusammen. Die Leseseite kann sich aus dem entgegengesetzten Grund Genauigkeit leisten: Zu diesem Zeitpunkt ist die Identität bereits eine, die diese Schranke schon genehmigt hat.",
          saveWhatStored:
            "Ein Detail mit einer echten Konsequenz: Die Antwort speichert die Art von Datensatz, auf die der Wert tatsächlich zeigt, nie die Festlegung der Definition. Beide sind im Moment des Speicherns genau wegen der vierten Prüfung gleich — aber stattdessen die Festlegung zu schreiben würde still die Bedeutung jeder gespeicherten Antwort umschreiben, an dem Tag, an dem jemand das Feld neu festlegt, was genau die Eigenschaft ist, die eine alte Antwort lesbar hält.",

          deleteTitle: "Wenn der referenzierte Datensatz gelöscht wird",
          deleteIntro:
            "Einen Datensatz zu löschen, auf den andere Datensätze zeigen, ist ein normaler Vorgang und braucht keine Aufräumarbeiten. Die Verweise leeren sich selbst.",
          d1Title: "Der Datensatz wird auf die übliche Weise gelöscht",
          d1Content:
            "Jemand löscht das Mitglied des Personals, das Benutzerkonto oder die Person über den eigenen Bildschirm dieses Moduls, mit der eigenen Löschberechtigung dieses Moduls. An diesem Punkt ist noch nichts mit benutzerdefinierten Feldern verbunden.",
          d2Title: "Die Löschung erfasst, dass sie geschehen ist",
          d2Content:
            "Die Löschung und der Hinweis, dass sie geschehen ist, werden zusammen in einer Transaktion festgeschrieben. Entweder geschehen beide, oder keines von beiden, sodass es kein Zeitfenster gibt, in dem ein Datensatz weg ist, ohne dass etwas diese Tatsache erfasst hätte.",
          d3Title: "Jeder Verweis auf diesen Datensatz wird geleert",
          d3Content:
            "Beide Teile jeder betroffenen Antwort werden zusammen geleert, im selben Durchgang. Nie eines ohne das andere — eine halbe Referenz ist der eine Zustand, den nichts anzeigen und den kein Betreiber reparieren kann.",
          d4Title: "Die Wertzeile überlebt",
          d4Content:
            "Nichts wird gelöscht. Jede Antwort behält ihre Zeile, ihre Version, ihren Platz in der Menge der Antworten des Datensatzes und ihren Prüfpfad. Nur der Verweis geht, weshalb sich das Feld anschließend als wirklich leer liest statt als defekt.",
          deleteScope:
            "Das Leeren erfasst beide Orte, an denen Antworten gespeichert werden, einschließlich des älteren Speichers, der noch Antworten von vor der Migration enthält, und es erfasst auch gelöschte Wertzeilen — eine gelöschte Zeile, die noch einen veralteten Verweis enthält, würde diesen veralteten Verweis an jeden zurückgeben, der sie später wiederherstellt.",
          deleteIdempotent:
            "Einen bereits geleerten Verweis zu leeren bewirkt absichtlich nichts, sodass der Vorgang gefahrlos wiederholt werden kann. Die eigenen Momentaufnahmen früherer Antworten des Datensatzes werden nicht durchgefegt, und müssen es auch nicht: Es sind kurzlebige Rollback-Artefakte, die nach ihrem eigenen Zeitplan entfernt werden und in der Zwischenzeit nie ein aktiver Anzeigepfad sind.",
          deleteInfoTitle: "Bevor der Verweis sich leert, und wo er es nie tut",
          deleteInfoContent:
            "Es gibt ein kurzes Zeitfenster zwischen einer Löschung und dem Leeren der Verweise, und es gibt Arten von Datensatz, deren Modul seine Löschungen überhaupt nicht bekannt gibt. In beiden Fällen meldet eine Referenz schlicht ehrlich, dass ihr Datensatz nicht gefunden werden kann, was genau der zweiten Zeile der Fehlertabelle oben entspricht. Nichts zeigt einen falschen Namen an, und nichts zeigt ein leeres Feld vor, das so tut, als hätte niemand geantwortet.",
          deleteSoftTitle: "Ein Datensatz, der nur verborgen ist, zählt als weg",
          deleteSoftContent:
            "Die meisten Löschungen im Produkt verbergen den Datensatz, statt ihn physisch zu entfernen. Ein verborgener Datensatz ist über die eigenen Bildschirme des besitzenden Moduls bereits unerreichbar, sodass eine Referenz ihn zu Recht als weg behandelt — ein Datensatz, den ein Administrator nicht sehen kann, ist kein Datensatz, auf den eine Referenz aufgelöst werden darf.",

          pickerTitle: "Wie sich die Auswahlkomponente verhält",
          pickerIntro:
            "Details des Elements selbst, die sich einmal zu lesen leichter fällt, als sie aus seinem Verhalten herzuleiten.",
          thBehaviour: "Verhalten",
          thWhy: "Warum es so ist",
          pkLazy: "Es wird nichts abgerufen, bevor Sie das Element öffnen.",
          pkLazyWhy:
            "Ein Datensatzformular kann mehrere Referenzfelder tragen. Eines, das niemand anfasst, sollte kein anderes Modul überhaupt befragen, und die Antworten werden anschließend zwischengespeichert, sodass das erneute Öffnen des Elements nichts kostet.",
          pkTwoControls: "Ein nicht festgelegtes Feld zeigt zwei Elemente, und keines nimmt dem anderen den Fokus.",
          pkTwoControlsWhy:
            "Eine Art von Datensatz zu wählen lässt Sie auf diesem Element, wobei das Datensatz-Element nun einen Schritt entfernt verfügbar ist. Die Datensatzauswahl automatisch zu öffnen würde jemandem den Fokus entziehen, der noch liest, was er gerade gewählt hat.",
          pkAccumulate: "Weitere Seiten ergänzen die Liste, statt sie zu ersetzen.",
          pkAccumulateWhy:
            "Eine Suche über die gesamte Personal-Tabelle eines Arbeitsbereichs braucht Seiten, und eine Liste, die sich selbst ersetzt, würde die Zeile verlieren, an der Sie auf dem Weg zu Load more vorbeigescrollt sind.",
          pkDormant: "Ein ruhender Datensatz wird markiert, nicht verborgen.",
          pkDormantWhy:
            "Er existiert weiterhin und ist weiterhin eine gültige Antwort — ein ausgeschiedenes Mitglied des Personals, das für historische Zuweisungen aufbewahrt wird, ist genau dieser Fall. Ihn als ungültig zu behandeln würde historische Referenzen unspeicherbar machen.",
          pkNoResults: "Ein unpassender Filter und eine leere Liste lesen sich unterschiedlich.",
          pkNoResultsWhy:
            "\"Ihr Filter traf auf nichts\" betrifft das, was Sie getippt haben. \"Es gibt nichts, worauf Sie zeigen dürfen\" betrifft Ihren Zugriff. Ein Satz für beides würde jemandem, der sich vertippt hat, sagen, er habe keine Berechtigungen.",
          pkNoRetry: "Zwei der Fehlerzustände bieten kein Element Try again an.",
          pkNoRetryWhy:
            "Eine Berechtigungsverweigerung und ein nicht verfügbares Modul weisen jedes Mal identisch zurück. Eine Schaltfläche, die Sie einlädt, darauf einzuhämmern, wäre schlechter als keine Schaltfläche. Nur ein echter Übertragungsfehler erhält einen erneuten Versuch, weil das der eine ist, den ein erneuter Versuch behebt.",
          pkViewMode: "Im Ansichtsmodus ist das Element deaktiviert statt nur unklickbar.",
          pkViewModeWhy:
            "Eine Referenz-Auswahlkomponente ist eine Auswahlkomponente, sie folgt also derselben Konvention wie jede andere Auswahlkomponente auf diesen Formularen. Ihr eigener schreibgeschützter Zustand, verwendet, wenn Sie den Namen des Ziels nicht ansehen dürfen, ist eine andere Sache und sieht anders aus.",
          pkNoLabelTrick: "Das Element benennt sich selbst für unterstützende Technologien.",
          pkNoLabelTrickWhy:
            "Seine sichtbare Bezeichnung ist echte, klickbare Verdrahtung, aber der barrierefreie Name wird direkt am Element gesetzt — eine Bezeichnung allein kann ein Element dieser Form nicht benennen. Zwei Referenzfelder auf einem Formular kündigen sich daher unterscheidbar an, statt beide als \"Record type\" anzukündigen.",

          diagnoseTitle: "Eine Referenz diagnostizieren, die sich nicht anzeigen lässt",
          diagnoseIntro:
            "Der Reihe nach. Jeder Schritt schließt einen der fünf oben genannten Zustände aus, und die ersten vier brauchen keinen Zugriff, den Sie nicht bereits haben.",
          dg1Title: "Lesen Sie den Satz im Feld",
          dg1Content:
            "Die fünf Zustände teilen sich nie denselben Wortlaut, das Feld hat Ihnen also bereits gesagt, in welchem Sie sich befinden. Dieser Schritt steht an erster Stelle, weil er am häufigsten übersprungen wird.",
          dg2Title: "Bietet es Try again an, nutzen Sie es",
          dg2Content:
            "Nur der vorübergehende Fehlschlag bietet eines an. Löst sich das Feld beim zweiten Versuch auf, war mit dem gespeicherten Wert nie etwas falsch, und es gibt nichts zu reparieren.",
          dg3Title: "Prüfen Sie dasselbe Feld bei einem anderen Datensatz",
          dg3Content:
            "Scheitert jede Referenz dieser Art identisch, liegt es an Ihren Berechtigungen oder der Installation — nicht an den Daten. Scheitert nur diese eine, ist der Datensatz, auf den sie zeigt, die Sache, die Sie sich ansehen sollten.",
          dg4Title: "Lassen Sie jemanden mit vollem Zugriff denselben Datensatz öffnen",
          dg4Content:
            "Sieht diese Person einen Namen und Sie nicht, ist es eine Berechtigung auf dieser Art von Datensatz. Sieht sie denselben Fehlschlag, liegt es an den Daten oder der Installation.",
          dg5Title: "Erst dann entscheiden, ob erneut gewählt oder geleert wird",
          dg5Content:
            "Wählen Sie erneut, wenn der Datensatz wirklich weg oder der gespeicherte Wert fehlerhaft ist. Leeren Sie nur, wenn das Feld leer sein sollte. Leeren Sie nie ein Feld, das einen vorübergehenden Fehlschlag gemeldet hat — das ist die eine Handlung, die den Ausfall von jemand anderem in Ihren Datenverlust verwandelt.",

          limitsTitle: "Grenzen und bewusste Lücken",
          limitsIntro:
            "Klar festgehalten, damit niemand einen Nachmittag mit der Suche nach einer Einstellung verbringt, die es nicht gibt.",
          thLimit: "Grenze",
          thDetail: "Detail",
          limPageSize: "Datensätze pro Seite in der Auswahlkomponente",
          limPageSizeDetail:
            "Standardmäßig zwanzig. Eine Anfrage nach mehr als hundert wird gedeckelt statt zurückgewiesen, und der Deckel wird auf dem Weg zweimal angewendet.",
          limDebounce: "Verzögerung zwischen Tippen und Suchen",
          limDebounceDetail:
            "Eine feste, kurze Pause, dieselbe, die jede serverseitig gestützte Auswahlkomponente im Produkt verwendet. Nicht konfigurierbar.",
          limNoName: "Kein gespeicherter Anzeigename",
          limNoNameDetail:
            "Es gibt nirgends eine Einstellung, um einen Namen als Momentaufnahme neben einem Verweis zu speichern, und es wird auch keine geben — sie würde einen von einer Berechtigung geschützten Namen an jeden aushändigen, der eine andere besitzt.",
          limNoBacklinks: "Keine Ansicht \"was zeigt auf diesen Datensatz\"",
          limNoBacklinksDetail:
            "Nichts listet die Referenzen auf, die auf einen gegebenen Datensatz zeigen. Einen Datensatz zu löschen warnt Sie nicht, wie viele Verweise dabei gleich geleert werden.",
          limNoExport: "Nicht im Definitionsexport",
          limNoExportDetail:
            "Die Tabelle der Definitionen mit achtzehn Spalten hat keine Spalte für einen festgelegten Zieltyp, sodass eine exportierte Definition nicht erfasst, worauf ihr Feld zeigt.",
          limNoMulti: "Ein Verweis pro Feld",
          limNoMultiDetail:
            "Es gibt keinen mehrwertigen Referenztyp. Zwei Antworten bedeuten zwei Felder.",
          limNoTypeFilter: "Die Auswahlkomponente lässt sich durch nichts außer Text eingrenzen",
          limNoTypeFilterDetail:
            "Welche Spalten der Freitextfilter durchsucht, ist die Wahl des besitzenden Moduls, und es gibt keine zusätzlichen Filter — kein \"nur aktive\", kein Filtern nach Gruppe.",
          limNoAdminTarget: "User Reference weist einen Administrator weiterhin zurück, obwohl Entity Reference das nicht mehr tut",
          limNoAdminTargetDetail:
            "Weder vom Definitionsformular noch von einer Anfrage, die es umgeht. Das zulässige Ziel von User Reference ist von Anfang an genau eine Sache, identity.user — der eigene Datensatz eines Administrators ist eine andere Art von Zeile, und ein User-Reference-Feld darauf zeigen zu lassen wird zurückgewiesen, unabhängig davon, über welches Modul die Anfrage kam. Entity Reference bietet Administratoren als Ziel an, seit ein späteres Release einen Lookup-Provider für sie hinzugefügt hat; diese Grenze gilt allein für User Reference.",

          nextTitle: "Wie es weitergeht",
          nextIntro: "Die Konzepte hinter diesen Lookups stehen auf der Seite Referenzfelder.",
          thPage: "Seite",
          thCovers: "Was sie behandelt",
          pageReferences: "Referenzfelder",
          coversReferences:
            "Was die beiden Referenztypen sind, welchen Sie verwenden, was gespeichert wird, warum kein Name aufbewahrt wird, das Festlegen eines Zieltyps, was referenziert werden darf, und die Arbeitsbereichsregeln.",
          pageSecurity: "Sicherheit auf Feldebene",
          coversSecurity:
            "Der gesonderte Mechanismus, um ein ganzes Feld vor einer Rolle oder Benutzergruppe zu verbergen — was eine andere Sache ist, als das Ziel einer Referenz nicht lesen zu dürfen.",
          pageLimits: "Grenzwerte und Verhalten",
          coversLimits:
            "Jede feste Obergrenze und jede bewusste Einschränkung der gesamten Funktion, Referenzen eingeschlossen.",
        },

        // ═══════════════════════════════════════════════════
        //  Ein Feld definieren
        // ═══════════════════════════════════════════════════
        defining: {
          title: "Ein Feld definieren",
          description:
            "Das Definitionsformular Element für Element, die vollständige Schritt-für-Schritt-Anleitung, die Regeln für Schlüssel, das Anlegen eines Felds direkt aus einem Datensatz heraus, jede Zurückweisung, und was sich nach dem Speichern noch ändern lässt.",
          intro:
            "Felddefinitionen leben auf dem Bildschirm Benutzerdefinierte Felder im Arbeitsbereich Administration. Diese Seite geht das gesamte Formular durch: jedes Element, was es sichtbar macht, was es tut, und was passiert, wenn ein Speichervorgang zurückgewiesen wird. Namen von Bedienelementen werden so angegeben, wie sie in der englischsprachigen Oberfläche erscheinen.",
          beforeTitle: "Zwei Entscheidungen, bevor Sie das Formular öffnen",
          beforeContent:
            "Der Datensatztyp und der Werttyp sind beide nach dem Speichern dauerhaft, und ebenso der Schlüssel. Alles andere lässt sich später bearbeiten. Sind Sie unsicher, welcher Werttyp passt, lesen Sie zuerst die Seite Werttypen — ein Feld neu anzulegen bedeutet, jede bereits dazu gespeicherte Antwort zu verlieren.",

          whereTitle: "Wo sich der Bildschirm befindet",
          whereIntro: "Benutzerdefinierte Felder werden von vier verwandten Bildschirmen aus verwaltet.",
          where1:
            "Der Bildschirm Benutzerdefinierte Felder selbst, im Arbeitsbereich Administration, ist, wo Definitionen angelegt, bearbeitet, deaktiviert und gelöscht werden, und wo ein Validator angehängt wird.",
          where2:
            "Der Bildschirm Feldgruppen, erreichbar über einen Link im Seitenkopf dieser Seite, fasst die Felder eines Datensatztyps unter Überschriften zusammen.",
          where3:
            "Die Bildschirme Werttypen und Entitätstypen, ebenfalls über diesen Seitenkopf erreichbar, sind schreibgeschützte Referenzen. Sie haben absichtlich keinen eigenen Eintrag in der Seitenleiste.",
          where4:
            "Der Link Add custom field am Ende des Abschnitts Benutzerdefinierte Felder auf einem Datensatzformular öffnet dasselbe Definitionsformular in einem Seitenpanel, ohne den Datensatz zu verlassen.",

          controlsTitle: "Das Formular, Element für Element",
          controlsIntro:
            "Nicht jedes Element ist immer sichtbar. Mehrere erscheinen erst, sobald ein bestimmter Werttyp oder Geltungsbereich gewählt ist, weshalb das Formular an einem gegebenen Tag kürzer aussieht als diese Tabelle.",
          thControl: "Element",
          thDoes: "Was es tut",
          thWhenShown: "Wann es erscheint",
          ctlEntityTypeDoes:
            "Wählt den Datensatztyp, zu dem das Feld gehört. Datensatztypen ohne eigenen Bildschirm in dieser Anwendung werden nach den übrigen aufgeführt und mit API only markiert — ein Feld auf einem davon ist über die API erreichbar, hat aber nirgends, wo es dargestellt werden könnte.",
          ctlEntityTypeWhen:
            "Bei der Erstellung. Fest und nicht bearbeitbar, wenn das Formular aus einem Datensatz heraus geöffnet wird, und dauerhaft nach dem Speichern.",
          ctlKeyDoes:
            "Setzt den maschinenlesbaren Namen, der in Fehlermeldungen, Exporten und der API verwendet wird. Kleinbuchstaben, muss mit einem Buchstaben beginnen, und darf nur Buchstaben, Ziffern und Unterstriche enthalten.",
          ctlKeyWhen: "Nur bei der Erstellung. Dauerhaft nach dem Speichern.",
          ctlLabelEnDoes: "Die englische Bezeichnung, die über dem Eingabefeld auf jedem Formular gezeigt wird. Erforderlich.",
          ctlLabelArDoes:
            "Die arabische Bezeichnung. Optional — ein arabischsprachiger Leser sieht die englische Bezeichnung, wenn dies leer bleibt.",
          ctlAlways: "Immer.",
          ctlValueTypeDoes:
            "Wählt einen der zweiundzwanzig Typen und entscheidet damit über das Bedienelement, die Validierung und die Speicherung. Diese Wahl ist es, die das Feld Options, das Dropdown Validator oder das Dropdown Target Entity Type sichtbar macht.",
          ctlValueTypeWhen: "Nur bei der Erstellung. Dauerhaft nach dem Speichern.",
          ctlPlaceholderEnDoes:
            "Optionaler, grau dargestellter Hinweis im leeren Eingabefeld, auf Englisch — zum Beispiel \"e.g. Enter your shirt size\".",
          ctlPlaceholderArDoes: "Derselbe Hinweis auf Arabisch.",
          ctlPlaceholderWhen:
            "Nur bei den Werttypen, deren Bedienelement überhaupt einen Platzhalter hat. Boolean, Rating, Color, Date und die anderen auswahlbasierten Typen haben keinen.",
          ctlOptionsDoes:
            "Enthält die Liste der zulässigen Antworten, eine Zeile pro Option, mit einer englischen und einer arabischen Bezeichnung für jede. Siehe die Seite Optionen.",
          ctlOptionsWhen: "Nur wenn der Werttyp Select oder MultiSelect ist.",
          ctlValidatorDoes:
            "Hängt eine der 13 integrierten Formatprüfungen an. Voreingestellt ist kein Validator. Siehe die Seite Validatoren.",
          ctlValidatorWhen:
            "Nur wenn der Werttyp Text ist. Für die anderen einundzwanzig Typen wird es nie gezeigt.",
          ctlValidatorParamDoes:
            "Liefert die Einstellung, die eine parametrisierte Prüfung braucht — ein Länder-Dropdown für Postal Code, Freitext für die anderen fünf.",
          ctlValidatorParamWhen:
            "Nur sobald einer der sechs parametrisierten Validatoren gewählt ist.",
          ctlReferenceTargetDoes:
            "Legt das Feld auf eine Art von Datensatz fest, sodass jeder Wert auf einen Datensatz dieser Art zeigen muss. Seine erste Option, Not pinned — any allowed type, ist eine echte und dauerhafte Wahl statt eines Platzhalters: Lassen Sie sie stehen, und jeder Wert benennt stattdessen seine eigene Art von Datensatz. Es ist der einzige Weg, eine Festlegung zu löschen, bleibt also auch verfügbar, wenn die Liste der Arten leer ist oder nicht lädt, und das Element wird nie deaktiviert.",
          ctlReferenceTargetWhen:
            "Nur wenn der Werttyp Entity Reference ist. Ein User-Reference-Feld zeigt es nie, weil sein einziges rechtmäßiges Ziel von der Plattform festgelegt ist und es nichts zu wählen gibt. Anders als die drei dauerhaften Einstellungen lässt sich diese später ändern — lesen Sie die Warnung auf dem Bearbeitungsformular, bevor Sie es tun.",
          ctlFieldGroupDoes:
            "Ordnet das Feld einer der Feldgruppen des Datensatztyps zu, oder keiner Gruppe. Das Ändern des Datensatztyps löscht die Wahl.",
          ctlFieldGroupWhen:
            "Nur wenn Sie die Ansichtsberechtigung für Feldgruppen besitzen und — auf dem Hauptbildschirm für Definitionen — sobald ein Datensatztyp gewählt wurde; das Inline-Panel zeigt es bereits, sobald Sie die Berechtigung besitzen, da es den Datensatztyp bereits kennt. In beiden Fällen auch dann gezeigt, wenn der gewählte Datensatztyp noch keine Gruppen hat, wobei bis dahin nur \"no group\" angeboten wird.",
          ctlRequiredDoes:
            "Weist einen Speichervorgang zurück, der das Feld leer lässt. Reine Leerzeichen zählen bei jedem Werttyp als leer.",
          ctlSortOrderDoes:
            "Positioniert das Feld im Verhältnis zu den anderen benutzerdefinierten Feldern im Formular. Niedrigere Zahlen kommen zuerst.",
          ctlSensitivityDoes:
            "Beschriftet, wie der Inhalt des Felds behandelt werden soll — Unclassified, Internal, Confidential oder Restricted. Voreingestellt ist Unclassified. Es ist ein Label für Berichte und den Umgang beim Export; es steuert nicht, wer das Feld sehen kann.",
          ctlExportableDoes:
            "Markiert, ob die Werte dieses Felds in Exporte aufgenommen werden sollen. Standardmäßig eingeschaltet. Das ist Aufräumen, keine Berechtigung — wer das Feld bereits lesen kann, kann seine Werte weiterhin anderswo lesen —, und es entfernt das Feld nicht aus dem Definitionsexport, der es so oder so auflistet.",
          ctlActiveDoes:
            "Ob das Feld weiterhin in Formularen angeboten wird. Es auszuschalten legt das Feld still, ohne die bereits dazu gespeicherten Antworten anzufassen.",
          ctlActiveWhen: "Bei der Bearbeitung. Ein neu angelegtes Feld ist aktiv.",
          ctlGlobalDoes:
            "Legt das Feld für jeden Arbeitsbereich der Plattform an statt für einen einzelnen. Globale Felder umgehen das Kontingent pro Arbeitsbereich, und nur ein Plattformadministrator kann sie anschließend bearbeiten oder löschen.",
          ctlGlobalWhen:
            "Nur für einen Plattform-Super-Admin, der ohne ausgewählten Arbeitsbereich arbeitet. Nur bei der Erstellung — der Geltungsbereich eines Felds ist dauerhaft.",

          stepsTitle: "Schritt für Schritt",
          stepsIntro: "Der gesamte Ablauf, für den gewöhnlichen Fall eines auf den Arbeitsbereich beschränkten Felds.",
          s1Title: "Öffnen Sie den Bildschirm Benutzerdefinierte Felder und wählen Sie Add",
          s1Content:
            "Der Bildschirm listet jedes Feld, das Ihr Arbeitsbereich sehen kann, einschließlich geerbter globaler Felder von der Plattform. Globale Zeilen tragen ein Abzeichen und bieten keine Bearbeitungs- oder Löschelemente.",
          s2Title: "Wählen Sie den Datensatztyp",
          s2Content:
            "Wählen Sie die Art von Datensatz, zu der das Feld gehört. Ist Ihr Datensatztyp als API only markiert, halten Sie inne und überdenken Sie es — das Feld wird gespeichert, aber nichts in der Oberfläche wird es darstellen.",
          s3Title: "Wählen Sie den Werttyp",
          s3Content:
            "Wählen Sie aus den zweiundzwanzig. Das ist die Entscheidung, die sich später nicht rückgängig machen lässt, und sie ist auch das, was das Feld Options, das Dropdown Validator oder das Dropdown Target Entity Type weiter unten im Formular erscheinen lässt.",
          s4Title: "Benennen Sie das Feld",
          s4Content:
            "Geben Sie die englische Bezeichnung ein, eine arabische, falls Sie eine haben, und den Schlüssel. Der Schlüssel ist dauerhaft, wählen Sie also etwas, das Sie auch in einem Jahr noch in einer Fehlermeldung erkennen.",
          s5Title: "Füllen Sie die eigenen Einstellungen des Typs aus",
          s5Content:
            "Fügen Sie bei Select und MultiSelect die Optionen hinzu. Wählen Sie bei Text einen Validator, falls Sie einen möchten, und liefern Sie dessen Einstellung. Entscheiden Sie bei Entity Reference, ob Sie einen Target Entity Type festlegen. Fügen Sie Platzhalter hinzu, wenn das Element sie annimmt.",
          s6Title: "Legen Sie Verhalten und Position fest",
          s6Content:
            "Schalten Sie Required ein oder aus, setzen Sie die Sort Order, und wählen Sie eine Field Group, falls Sie welche verwenden. Eine Gruppe bietet sich nur an, wenn sie zu dem gewählten Datensatztyp gehört.",
          s7Title: "Legen Sie die Klassifizierung fest",
          s7Content:
            "Sensitivity ist standardmäßig Unclassified, und Include in exports ist standardmäßig eingeschaltet. Lassen Sie beides unverändert, sofern Sie keinen Grund haben — insbesondere die Export-Voreinstellung existiert, damit Felder nie still aus einer Tabelle fehlen.",
          s8Title: "Speichern, und die Meldung lesen, falls zurückgewiesen",
          s8Content:
            "Eine Zurückweisung ist immer konkret darüber, was falsch ist. Die Tabelle weiter unten auf dieser Seite listet jede Ablehnung, auf die Sie stoßen können, und was sie bedeutet.",

          keyTitle: "Einen Schlüssel wählen",
          keyIntro:
            "Der Schlüssel ist der maschinenlesbare Name des Felds. Er erscheint in jeder Fehlermeldung, im Tabellenexport und in der API. Er muss aus Kleinbuchstaben bestehen, mit einem Buchstaben beginnen, und darf nur Buchstaben, Ziffern und Unterstriche enthalten — und er muss für diesen Datensatztyp innerhalb Ihres Arbeitsbereichs eindeutig sein.",
          thKeyExample: "Schlüssel",
          thOutcome: "Was passiert",
          keyOk: "Angenommen. Das ist die Form, die Sie anstreben sollten.",
          keyOkDigits: "Angenommen. Ziffern und Unterstriche sind nach dem ersten Zeichen in Ordnung.",
          keyUpper: "Zurückgewiesen. Schlüssel bestehen aus Kleinbuchstaben.",
          keyLeadingDigit: "Zurückgewiesen. Ein Schlüssel muss mit einem Buchstaben beginnen.",
          keyHyphen: "Zurückgewiesen. Bindestriche gehören nicht zur Grammatik — verwenden Sie einen Unterstrich.",
          keySpace: "Zurückgewiesen. Leerzeichen sind nicht erlaubt.",
          keyWarnTitle: "Der Schlüssel ist dauerhaft",
          keyWarnContent:
            "Sobald das Feld gespeichert ist, kann der Schlüssel von niemandem mehr geändert werden, weil bereits gespeicherte Antworten über ihn adressiert werden. Ist ein Schlüssel falsch, muss das Feld gelöscht und neu angelegt werden — und das Löschen zerstört die bereits dazu erfassten Antworten. Das ist das mit Abstand häufigste Bedauern, wenn ein Feld in Eile definiert wird.",

          inlineTitle: "Ein Feld direkt aus einem Datensatz heraus hinzufügen",
          inlineIntro:
            "Sie müssen nicht verlassen, woran Sie gerade arbeiten, um ein Feld hinzuzufügen. Jedes Formular, das benutzerdefinierte Felder unterstützt, beendet seinen Abschnitt Benutzerdefinierte Felder mit einem Link Add custom field, gesperrt hinter der Erstellungsberechtigung.",
          i1Title: "Klicken Sie auf Add custom field",
          i1Content:
            "Das Definitionsformular öffnet sich in einem Seitenpanel statt in einem Dialog über einem Dialog. Das dahinterliegende Datensatzformular bleibt sichtbar und lesbar, und nichts, was Sie bereits eingetippt haben, geht verloren.",
          i2Title: "Beachten Sie, dass der Datensatztyp feststeht",
          i2Content:
            "Der Datensatztyp wird als Kontext gezeigt statt als Dropdown — es ist, welcher Bildschirm auch immer Sie sich gerade befinden. Jedes andere Element verhält sich exakt wie auf dem vollständigen Bildschirm, Validator-Dropdown eingeschlossen, mit einer Ergänzung, die dieses Panel hat und der vollständige Bildschirm nicht — siehe den nächsten Punkt.",
          i2bTitle: "Optional ein gemeinsam genutztes Option Set anhängen",
          i2bContent:
            "Bei Select oder MultiSelect bietet dieses Panel — und nur dieses Panel, nicht das eigene Formular des Hauptbildschirms für Definitionen — neben dem manuellen Options-Editor eine Option-Set-Auswahl an. Eines zu wählen bindet es in demselben Schritt an das Feld, in dem Moment, in dem es angelegt wird: Manuell weiter oben eingetippte Optionen bleiben erhalten und werden mit denen des Sets zusammengeführt, statt durch sie ersetzt zu werden. Nur gezeigt, wenn Sie sowohl die Ansichts- als auch die Bindungsberechtigung für Option Sets besitzen.",
          i3Title: "Ausfüllen und speichern",
          i3Content:
            "Das Panel schließt sich, und das neue Feld erscheint sofort im weiterhin geöffneten Datensatzformular, leer und bereit zum Ausfüllen.",
          i4Title: "Mit dem Datensatz fortfahren",
          i4Content:
            "Füllen Sie das neue Feld zusammen mit allem anderen aus und speichern Sie den Datensatz einmal. Die Definition und die Antwort sind zwei getrennte Speichervorgänge, in dieser Reihenfolge.",
          inlineInfoTitle: "Wenn der Link nicht da ist",
          inlineInfoContent:
            "Der Link Add custom field erscheint nur für jemanden mit der Erstellungsberechtigung. Ohne sie funktioniert der Abschnitt Benutzerdefinierte Felder weiterhin normal zum Ausfüllen bestehender Felder — nur die Abkürzung zum Definieren eines neuen fehlt. Und bei einem Datensatztyp ohne bisher definierte benutzerdefinierte Felder erscheint der Abschnitt Benutzerdefinierte Felder überhaupt nicht.",

          rejectTitle: "Was zurückgewiesen wird, und warum",
          rejectIntro:
            "Jede Zurückweisung bei der Definition trägt eine konkrete Meldung. Dies sind diejenigen, auf die Sie tatsächlich vom Formular aus oder über eine Anfrage stoßen können, die es umgeht.",
          thSituation: "Situation",
          thWhatYouSee: "Was Sie sehen",
          rejDuplicateKey: "Ein Schlüssel, der für diesen Datensatztyp bereits existiert",
          rejDuplicateKeyMsg:
            "Als bereits vorhanden zurückgewiesen. Schlüssel sind pro Datensatztyp innerhalb eines Arbeitsbereichs eindeutig — derselbe Schlüssel bei einem anderen Datensatztyp ist in Ordnung.",
          rejUnknownEntityType: "Ein Datensatztyp, der nicht registriert ist",
          rejUnknownEntityTypeMsg:
            "Zurückgewiesen, unter Nennung des Schlüssels: Er ist kein registrierter Entitätstyp. Nur durch Umgehen des Dropdowns erreichbar.",
          rejNoOptions: "Ein Select- oder MultiSelect-Feld ohne Optionen",
          rejNoOptionsMsg: "Zurückgewiesen: Optionen sind für Select-Felder erforderlich.",
          rejOptionsOnOther: "Optionen geliefert für einen Typ, der sie nicht annimmt",
          rejOptionsOnOtherMsg: "Zurückgewiesen: Optionen sind nur für Select-Felder erlaubt.",
          rejValidatorNonText: "Ein Validator, angehängt an ein Nicht-Text-Feld",
          rejValidatorNonTextMsg:
            "Zurückgewiesen, unter Nennung des Typs: Ein Validator kann nur an ein Textfeld angehängt werden. Das Dropdown wird für diese Typen nicht einmal gezeigt, dies ist also der Server, der dasselbe ein zweites Mal zurückweist.",
          rejValidatorNoParam: "Ein parametrisierter Validator mit leer gelassener Einstellung",
          rejValidatorNoParamMsg: "Zurückgewiesen, unter Nennung des Validators: Er benötigt einen Parameter.",
          rejValidatorExtraParam: "Eine Einstellung für einen Validator geliefert, der keine annimmt",
          rejValidatorExtraParamMsg: "Zurückgewiesen, unter Nennung des Validators: Er akzeptiert keinen Parameter.",
          rejRequiredRestricted: "Ein Feld als Required markieren, während eine Rolle oder Gruppe es einschränkt",
          rejRequiredRestrictedMsg:
            "Zurückgewiesen, unter Nennung des Felds: Es kann nicht als erforderlich markiert werden, während es eingeschränkt ist. Entfernen Sie zuerst die Einschränkung, oder lassen Sie das Feld optional.",
          rejGroupWrongType: "Eine Feldgruppe, die zu einem anderen Datensatztyp gehört",
          rejGroupWrongTypeMsg:
            "Zurückgewiesen: Die gewählte Feldgruppe gehört zu einem anderen Entitätstyp. Das Ändern des Datensatztyps auf dem Formular löscht die Gruppenwahl genau aus diesem Grund.",
          rejReferenceTargetUnknown: "Ein Ziel festlegen, das kein registrierter Datensatztyp ist",
          rejReferenceTargetUnknownMsg:
            "Zurückgewiesen, unter Nennung des Bezeichners: Er ist kein registrierter Entitätstyp. Nur durch Umgehen des Dropdowns erreichbar, das nichts Unregistriertes anbietet.",
          rejReferenceTargetNotAllowed: "Ein User-Reference-Feld auf etwas anderes als ein Benutzerkonto festlegen",
          rejReferenceTargetNotAllowedMsg:
            "Zurückgewiesen, unter Nennung des Werttyps und Auflistung dessen, was er tatsächlich erlaubt. Das Dropdown wird für diesen Typ überhaupt nicht gezeigt, dies ist also der Server, der zurückweist, was das Formular bereits abgelehnt hat anzubieten.",
          rejGlobalNotSuperAdmin: "Ein globales Feld anlegen, ohne Plattform-Super-Admin zu sein",
          rejGlobalNotSuperAdminMsg: "Zurückgewiesen: Nur ein Plattform-Super-Admin kann ein globales benutzerdefiniertes Feld anlegen.",
          rejQuota: "Die Feldgrenze Ihres Plans überschreiten",
          rejQuotaMsg:
            "Wegen Kontingent zurückgewiesen. Die Free-Edition erlaubt null Felder; jeder andere Plan hat sein eigenes Maximum pro Arbeitsbereich. Globale Plattformfelder zählen nicht dagegen.",

          afterTitle: "Nach dem Speichern: Was sich noch ändern lässt",
          afterIntro:
            "Drei Dinge sind dauerhaft, und alles andere ist es nicht. Es lohnt sich, zu wissen, was was ist, bevor Sie speichern, statt danach.",
          editableTitle: "Jederzeit bearbeitbar",
          editable1: "Beide Bezeichnungen, und beide Platzhalter",
          editable2: "Required — sofern keine Rolle oder Benutzergruppe das Feld einschränkt",
          editable3: "Sort Order, und die Field Group",
          editable4: "Sensitivity, und Include in exports",
          editable5: "Active, was das Feld stilllegt, ohne seine gespeicherten Antworten anzufassen",
          editable6: "Die Optionsliste — auch wenn das Umbenennen einer Option ändert, was bestehende Datensätze anzeigen",
          editable7: "Der Validator und seine Einstellung — auch wenn dies bereits gespeicherte Antworten nie erneut prüft",
          editable8:
            "Der Target Entity Type eines Entity-Reference-Felds — bereits gespeicherte Antworten funktionieren weiter, und der nächste Speichervorgang einer Antwort der alten Art wird zurückgewiesen, bis sie erneut gewählt wird",
          permanentTitle: "Nach dem Speichern dauerhaft",
          permanent1: "Der Datensatztyp",
          permanent2: "Der Schlüssel",
          permanent3: "Der Werttyp",
          permanent4: "Der Geltungsbereich — Arbeitsbereich oder global",
          afterOutro:
            "Für keine der vier dauerhaften Einstellungen gibt es einen Migrationspfad. Eine davon falsch zu haben bedeutet, das Feld zu löschen und neu zu beginnen, was die bereits dazu erfassten Antworten zerstört.",

          verifyTitle: "Prüfen, ob es funktioniert hat",
          verifyIntro: "Vier schnelle Prüfungen, die fast jeden Fehler abfangen.",
          verify1:
            "Öffnen Sie einen Datensatz dieses Typs. Der Abschnitt Benutzerdefinierte Felder sollte Ihr neues Feld zeigen, leer, mit der von Ihnen gesetzten Bezeichnung und dem Platzhalter.",
          verify2:
            "Geben Sie einen Wert ein und speichern Sie. Kein Fehler bedeutet, dass der Wert angenommen wurde; öffnen Sie den Datensatz erneut und bestätigen Sie, dass er noch da ist.",
          verify3:
            "Löschen Sie den Wert und speichern Sie erneut. Bei einem optionalen Feld sollte dies gelingen und das Feld wirklich leer lassen, nicht den alten Wert zeigen.",
          verify4:
            "Prüfen Sie die Datensatzliste. Ihr Feld sollte dort ebenfalls eine zusätzliche Spalte sein, die die Antwort für jeden Datensatz auf einmal zeigt.",
          verifyWarnTitle: "Wenn das Feld nicht erscheint",
          verifyWarnContent:
            "Prüfen Sie zuerst den Datensatztyp — ein Feld, das gegen einen als API only markierten Datensatztyp definiert ist, hat nirgends, wo es dargestellt werden könnte. Prüfen Sie dann Active. Prüfen Sie dann, ob eine Rolle oder Benutzergruppe den Schlüssel des Felds einschränkt, denn ein eingeschränktes Feld wird vollständig ausgelassen statt leer gezeigt, und sieht genau wie ein Feld aus, das nie definiert wurde.",
        },

        // ═══════════════════════════════════════════════════
        //  Feldgruppen
        // ═══════════════════════════════════════════════════
        groups: {
          title: "Feldgruppen",
          description:
            "Die benutzerdefinierten Felder eines Datensatztyps unter von Hand geordneten Überschriften zusammenfassen: eine Gruppe anlegen, der dauerhafte stabile Schlüssel, die Reihenfolge, das Löschen, globale Gruppen, und was eine Gruppe nicht beeinflusst.",
          intro:
            "Eine Feldgruppe fasst mehrere benutzerdefinierte Felder eines Datensatztyps unter einer Überschrift zusammen, in einer von Hand festgelegten Reihenfolge. Ohne Gruppen erscheinen benutzerdefinierte Felder schlicht in der Sort Order unter einer einzigen Überschrift Custom Fields; mit ihnen können Sie Kontaktdaten von medizinischen Details von Ausrüstungspräferenzen auf demselben Formular trennen. Gruppen werden auf dem Bildschirm Feldgruppen verwaltet, erreichbar über einen Link im Seitenkopf der Seite Benutzerdefinierte Felder.",
          permInfoTitle: "Feldgruppen brauchen ihre eigenen Berechtigungen",
          permInfoContent:
            "Die gesamte Funktion ist über einen von Felddefinitionen getrennten Satz Berechtigungen gesperrt, einschließlich einer eigenen für das Umsortieren. Eine Rolle, die bereits jede Berechtigung für benutzerdefinierte Felder besitzt, erhält diese nicht automatisch mit. Ohne sie gibt es weder einen Link Manage field groups noch ein Field-Group-Auswahlfeld auf dem Definitionsformular — nichts ist defekt, die Funktion ist schlicht nicht gewährt. Ein Feld zu bearbeiten, das bereits eine Gruppe hat, und zu speichern, behält diese Gruppe, statt sie zu löschen.",

          whatTitle: "Woraus eine Gruppe besteht",
          whatIntro:
            "Gruppen gehören zu genau einem Datensatztyp, sodass der Bildschirm nichts zeigt, bis Sie einen wählen — und der Leerzustand sagt das, statt defekt zu wirken.",
          thPart: "Einstellung",
          thWhat: "Was sie ist",
          thChange: "Später änderbar?",
          partEntityType: "Der Datensatztyp, dessen Felder diese Gruppe zusammenfassen kann.",
          partStableKey:
            "Ein maschinenlesbarer Name für die Gruppe, eindeutig innerhalb des Datensatztyps. Kleinbuchstaben, beginnt mit einem Buchstaben, nur Buchstaben, Ziffern und Unterstriche.",
          partLabelEn: "Die englische Überschrift über den Feldern der Gruppe.",
          partLabelAr: "Die arabische Überschrift.",
          partSortOrder: "Wo die Gruppe im Verhältnis zu den anderen Gruppen des Datensatztyps steht.",
          partScope: "Ob die Gruppe Ihrem Arbeitsbereich gehört oder der gesamten Plattform.",
          changeNever: "Nein — nach dem Speichern dauerhaft",
          changeAnytime: "Ja, jederzeit",

          createTitle: "Eine Gruppe anlegen",
          createIntro: "Vier Schritte, auf dem Bildschirm Feldgruppen.",
          c1Title: "Wählen Sie den Datensatztyp",
          c1Content:
            "Bevor Sie das tun, ist nichts aufgelistet. Eine Gruppe ist immer nur für einen Datensatztyp gültig, es gibt also keine datensatztypübergreifende Ansicht, von der aus zu starten wäre.",
          c2Title: "Geben Sie ihr einen stabilen Schlüssel",
          c2Content:
            "Das Formular verlangt einen. Es wandelt beim Tippen in Kleinbuchstaben um und weist Zeichen außerhalb der Grammatik zurück. Wählen Sie sorgfältig — dieser ist dauerhaft.",
          c3Title: "Geben Sie ihr Bezeichnungen und eine Reihenfolge",
          c3Content:
            "Eine englische Überschrift, eine arabische Überschrift, und eine Zahl, die entscheidet, wo die Gruppe unter den anderen Gruppen des Datensatztyps steht.",
          c4Title: "Speichern, dann Felder zuordnen",
          c4Content:
            "Die Gruppe erscheint in der Liste. Öffnen Sie eine beliebige Felddefinition für denselben Datensatztyp, und ein Field-Group-Auswahlfeld bietet sie nun an, neben einem Eintrag no group.",

          stableKeyTitle: "Der stabile Schlüssel",
          stableKeyIntro:
            "Der stabile Schlüssel ist der maschinenlesbare Name der Gruppe. Er folgt derselben Grammatik wie ein Feldschlüssel — Kleinbuchstaben, beginnt mit einem Buchstaben, Buchstaben, Ziffern und Unterstriche — und muss unter den Gruppen dieses Datensatztyps eindeutig sein.",
          thKeyExample: "Stabiler Schlüssel",
          thOutcome: "Was passiert",
          skOk: "Angenommen.",
          skLowercased: "Angenommen, und beim Tippen in Kleinbuchstaben umgewandelt. Sie sehen, wie er zu contact_details wird.",
          skHyphen: "Beim Tippen zurückgewiesen. Das Eingabefeld weist Zeichen außerhalb der Grammatik zurück.",
          skLeadingDigit: "Zurückgewiesen. Ein stabiler Schlüssel muss mit einem Buchstaben beginnen.",
          skDuplicate:
            "Zurückgewiesen, unter Nennung des Schlüssels: Eine Feldgruppe mit diesem Schlüssel existiert für diesen Datensatztyp bereits.",
          exSkDuplicate: "Ein Schlüssel, den eine andere Gruppe desselben Datensatztyps bereits verwendet",
          stableKeyWhy:
            "Sobald die Gruppe gespeichert ist, ist der stabile Schlüssel sichtbar, aber ausgegraut, und kann von niemandem geändert werden. Das ist beabsichtigt, kein Versehen: Ein exportiertes Schema benennt eine Gruppe über diesen Schlüssel, sodass ein Umbenennen einen künftigen erneuten Import als Update still in ein Anlegen verwandeln würde, gegen ein Paket, das bereits ausgeliefert wurde. Den Schlüssel sehen zu können zählt trotzdem — Sie brauchen ihn, um ein exportiertes Paket der Gruppe zuzuordnen, auf die es sich bezieht —, weshalb er gezeigt statt verborgen wird.",
          stableKeyWarnTitle: "Es gibt kein Umbenennen",
          stableKeyWarnContent:
            "Ist ein stabiler Schlüssel falsch, muss die Gruppe gelöscht und neu angelegt werden, und jedes ihr zugeordnete Feld muss neu zugeordnet werden. Erwarten Sie nicht, dass eine Bearbeiten-Schaltfläche erscheint — ihr Fehlen ist das Design.",

          assignTitle: "Ein Feld einer Gruppe zuordnen",
          assignIntro:
            "Die Zuordnung geschieht am Feld, nicht an der Gruppe. Es gibt keinen Bildschirm, um Felder in eine Gruppe zu ziehen.",
          assign1:
            "Öffnen Sie eine Felddefinition für denselben Datensatztyp. Ein Field-Group-Auswahlfeld bietet jede Gruppe dieses Datensatztyps an, plus einen Eintrag no group.",
          assign2:
            "No group zu wählen ist der einzige Weg, ein Feld aus einer Gruppe zu lösen. Es gibt sonst nirgends ein gesondertes Element zum Aufheben.",
          assign3:
            "Das Ändern des Datensatztyps auf einem Erstellungsformular löscht jede bereits gewählte Gruppe, weil eine Gruppe eines Datensatztyps für einen anderen nie gültig ist.",
          assign4:
            "Ein Feld kann höchstens einer Gruppe angehören. Es gibt keinen Weg, ein Feld unter zwei Überschriften zu zeigen.",

          orderTitle: "Gruppen ordnen",
          orderIntro:
            "Gruppen werden auf dem Bildschirm Feldgruppen geordnet, durch Ziehen einer Zeile oder mit ihren Schaltflächen Move up und Move down. Beide tun dasselbe, und beide bleiben dauerhaft.",
          orderKeyboard:
            "Die Schaltflächen sind keine bloße Annehmlichkeit. Jemand, der nur die Tastatur nutzt, hat keine Ziehgeste, die Schaltflächen sind also der barrierefreie Weg und sollen identisch funktionieren — bewegt sich eine Zeile durch Ziehen, aber nicht über die Schaltfläche, ist das ein Fehler.",
          orderLimitTitle: "Das Umsortieren funktioniert ab 100 Gruppen nicht mehr",
          orderLimitContent:
            "Eine Umsortierungsanfrage trägt die gesamte umsortierbare Menge auf einmal, und mehr als 100 Gruppen für einen einzelnen Datensatztyp wird rundheraus zurückgewiesen. Ab diesem Punkt kann keine Gruppe dieses Datensatztyps mehr bewegt werden. Der Bildschirm sagt das, statt allgemein zu scheitern, aber die Obergrenze ist echt und nicht konfigurierbar.",
          orderGlobalTitle: "Sie können Ihre Gruppe nicht relativ zu einer globalen positionieren",
          orderGlobalContent:
            "Das Umsortieren ist alles oder nichts und weist jede Gruppe zurück, die der Aufrufer nicht besitzt, sodass die Umsortierung eines Arbeitsbereichs nur dessen eigene Gruppen erfasst, die dann bei null neu nummeriert werden. Diese Zahlen können mit der eigenen Reihenfolge einer globalen Gruppe kollidieren, und der Gleichstand wird über die englische Bezeichnung entschieden. Der sichtbare Effekt ist, dass das Verschieben Ihrer Gruppe an die Spitze sie unterhalb einer globalen Gruppe landen lassen kann und so aussieht, als wäre nichts geschehen.",

          deleteTitle: "Eine Gruppe löschen",
          deleteIntro:
            "Das Löschen einer Gruppe löscht nie Felder. Die Bestätigung sagt das ausdrücklich, und anschließend existieren die Felder weiterhin und sind schlicht nicht mehr gruppiert, erscheinen wieder unter der Standardüberschrift Custom Fields.",
          deleteEditing:
            "Ein Randfall, den man kennen sollte: Beginnen Sie, eine Gruppe zu bearbeiten, und löschen Sie dieselbe Gruppe dann aus ihrer Zeile heraus, während das Bearbeitungspanel noch offen ist, schließt sich das Panel, und keine neue Gruppe wird angelegt. Zu speichern erweckt die Gruppe an diesem Punkt nicht unter einer neuen Identität wieder.",

          globalTitle: "Globale Gruppen",
          globalIntro:
            "Ein Plattformadministrator ohne ausgewählten Arbeitsbereich legt eine globale Gruppe an, und ein Hinweis auf dem Bildschirm erklärt das. Der Geltungsbereich-Schalter erscheint bei der Erstellung und nie bei der Bearbeitung, weil der Geltungsbereich einer Gruppe genauso dauerhaft ist wie der eines Felds.",
          globalTenantView:
            "Innerhalb eines Arbeitsbereichs zeigt eine globale Gruppe ein Abzeichen Global und bietet überhaupt keine Bearbeitungs-, Lösch- oder Verschiebeelemente. Das ist nicht die Oberfläche, die willkürlich etwas verbirgt — der Server würde diese Vorgänge zurückweisen, die Elemente werden also gar nicht erst angeboten.",

          effectTitle: "Was eine Gruppe beeinflusst und was nicht",
          doesTitle: "Eine Gruppe leistet",
          does1: "Verwandte Felder auf dem Datensatzformular unter einer Überschrift zusammenzufassen",
          does2: "Gruppen von Hand zu ordnen, durch Ziehen oder mit Move up und Move down",
          does3: "Eine eigene englische und arabische Überschrift zu tragen, übersetzt wie alles andere",
          does4: "Das Löschen eines Felds zu überleben, und ein Feld über den Eintrag no group verlassen zu lassen",
          doesNotTitle: "Eine Gruppe leistet nicht",
          doesNot1: "Zu steuern, wer ein Feld sehen kann — das ist Sicherheit auf Feldebene, ein unabhängiges Thema",
          doesNot2: "Ihre Felder zu löschen, wenn die Gruppe selbst gelöscht wird",
          doesNot3: "Datensatztypen zu überschreiten oder auf mehr als einen Datensatztyp gleichzeitig zu wirken",
          doesNot4: "Zu ändern, wie ein Wert validiert, gespeichert, exportiert oder angezeigt wird",

          errorsTitle: "Gruppenfehler, die Ihnen begegnen können",
          thSituation: "Situation",
          thWhatYouSee: "Was Sie sehen",
          errDuplicateKey: "Ein stabiler Schlüssel, der bei diesem Datensatztyp bereits verwendet wird",
          errDuplicateKeyMsg: "Zurückgewiesen, unter Nennung des Schlüssels: Eine Feldgruppe mit diesem Schlüssel existiert für diesen Entitätstyp bereits.",
          errWrongEntityType: "Ein Feld einer Gruppe eines anderen Datensatztyps zuordnen",
          errWrongEntityTypeMsg: "Zurückgewiesen: Die gewählte Feldgruppe gehört zu einem anderen Entitätstyp.",
          errTooManyReorder: "Mehr als 100 Gruppen auf einmal umsortieren",
          errTooManyReorderMsg: "Zurückgewiesen, unter Nennung der Obergrenze: So viele Gruppen lassen sich nicht in einer Anfrage umsortieren.",
          errDuplicateReorder: "Dieselbe Gruppe zweimal in einer Umsortierung aufgeführt",
          errDuplicateReorderMsg: "Zurückgewiesen: Dieselbe Feldgruppe erscheint mehr als einmal in der Umsortierungsliste.",
          errMixedReorder: "Gruppen aus zwei Datensatztypen in einer Umsortierung",
          errMixedReorderMsg: "Zurückgewiesen: Alle Feldgruppen in einer Umsortierungsanfrage müssen zum selben Entitätstyp gehören.",
          errGlobalNotSuperAdmin: "Eine globale Gruppe anlegen, ohne Plattform-Super-Admin zu sein",
          errGlobalNotSuperAdminMsg: "Zurückgewiesen: Nur ein Plattform-Super-Admin kann eine globale Feldgruppe anlegen.",
          errNoDefinition: "Einem Feld ohne bisherigen Definitionsdatensatz eine Gruppe zuordnen",
          errNoDefinitionMsg:
            "Zurückgewiesen, mit der Erklärung, dass das Feld keinen Definitionsdatensatz hat und die Nachbefüllung der Definitionen zuerst ausgeführt werden muss. Das passiert nur in einer Umgebung, die von einer älteren Version aktualisiert wurde.",
        },

        // ═══════════════════════════════════════════════════
        //  Optionen
        // ═══════════════════════════════════════════════════
        options: {
          title: "Optionen",
          description:
            "Die zulässigen Antworten für Select- und MultiSelect-Felder schreiben: der zweisprachige Options-Editor, wie ein übermittelter Wert abgeglichen wird, und was das Hinzufügen, Umbenennen oder Entfernen einer Option mit bereits bestehenden Datensätzen macht.",
          intro:
            "Ein Select- oder MultiSelect-Feld trägt seine eigene Liste zulässiger Antworten. Die Liste gehört zum Feld — es gibt keine gemeinsam genutzte, über mehrere Felder wiederverwendete Liste —, und sie wird auf dem Definitionsformular geschrieben, im Feld Options, das erscheint, sobald Sie einen dieser beiden Werttypen wählen. Beide Typen verwenden genau dieselbe Liste und denselben Editor; der einzige Unterschied ist, dass eine MultiSelect-Antwort mehrere Einträge daraus gleichzeitig enthalten kann.",
          storedInfoTitle: "Der englische Optionstext ist die gespeicherte Antwort",
          storedInfoContent:
            "Es gibt keinen separaten, verborgenen Code hinter einer Option. Die englische Bezeichnung, die Sie eintippen, ist buchstäblich das, was auf jeden Datensatz geschrieben wird, der sie wählt, und es ist das, wogegen das Produkt einen übermittelten Wert vergleicht. Die arabische Bezeichnung dient nur der Anzeige. Diese eine Tatsache erklärt jedes Verhalten auf dieser Seite.",

          editorTitle: "Der Options-Editor",
          editorIntro:
            "Optionen werden als Liste von Zeilen bearbeitet, nicht als Freitext. Jede Zeile ist eine Option.",
          editor1: "Add option fügt am Ende der Liste eine Zeile hinzu.",
          editor2: "Jede Zeile nimmt eine englische und eine arabische Bezeichnung an.",
          editor3: "Remove option löscht eine Zeile.",
          editor4:
            "Die Zeilenreihenfolge ist die Reihenfolge, in der die Optionen auf dem Datensatzformular angeboten werden, von oben nach unten.",
          editor5:
            "Eine leere Liste zeigt eine Aufforderung, die erste Option hinzuzufügen — ein Select-Feld ohne Optionen kann nicht gespeichert werden.",
          editorBilingual:
            "Die beiden Bezeichnungen werden als zwei parallele Listen gespeichert, Zeile für Zeile zugeordnet. Ein arabischsprachiger Leser sieht die arabische Bezeichnung; die auf den Datensatz geschriebene Antwort ist so oder so die englische. Eine arabische Bezeichnung leer zu lassen ist erlaubt, und diese Option zeigt dann jedem ihre englische Bezeichnung.",

          exampleTitle: "Ein durchgerechnetes Beispiel",
          exampleIntro:
            "Ein Feld für Hemdgröße vom Typ Select, mit drei Optionen. Die rechte Spalte ist das, was tatsächlich auf einem Datensatz landet.",
          thEnglish: "Englische Bezeichnung",
          thArabic: "Arabische Bezeichnung",
          thStored: "Auf dem Datensatz gespeichert",
          exampleOutro:
            "Ein arabischsprachiger Nutzer, der متوسط wählt, speichert Medium, genau wie ein englischsprachiger Nutzer, der Medium wählt. Beide sehen ihre eigene Sprache auf dem Hin- und dem Rückweg; die zugrunde liegenden Daten sind ein einziger, konsistenter Wert.",

          matchTitle: "Wie ein übermittelter Wert abgeglichen wird",
          matchIntro:
            "Der übermittelte Wert wird getrimmt und dann exakt mit den englischen Bezeichnungen verglichen. Der Vergleich unterscheidet Groß-/Kleinschreibung. Anhand der drei obigen Optionen:",
          thSubmitted: "Übermittelter Wert",
          thOutcome: "Was passiert",
          matchOk: "Angenommen, und als Medium gespeichert.",
          matchTrimmed:
            "Angenommen. Beide Seiten werden vor dem Vergleich getrimmt, sodass umgebende Leerzeichen nie eine unbegründete Zurückweisung verursachen.",
          matchCase:
            "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Groß-/Kleinschreibung zählt — was auch bedeutet, dass Medium und medium rechtmäßig als zwei getrennte Optionen nebeneinander bestehen können, wenn Sie das wirklich möchten.",
          matchArabic:
            "Zurückgewiesen, sofern direkt an die API übermittelt: Nur die englischen Bezeichnungen werden abgeglichen. Das Wählen von متوسط in der Oberfläche funktioniert normal, weil die Oberfläche im Hintergrund die englische Bezeichnung übermittelt.",
          matchUnknown:
            "Zurückgewiesen: VALIDATION_INVALID_FORMAT, mit einer Meldung, die sowohl den zurückgewiesenen Wert als auch den Schlüssel des Felds zitiert.",
          matchBlank:
            "Als leer behandelt: bei einem optionalen Feld als gelöscht gespeichert, bei einem erforderlichen mit VALIDATION_REQUIRED zurückgewiesen.",
          exPadded: "\" Medium\" mit einem führenden Leerzeichen",
          exBlank: "Ein leerer Wert",

          multiTitle: "Besonderheiten von MultiSelect",
          multiIntro:
            "MultiSelect verwendet dieselbe Liste und denselben Editor wieder. Der Unterschied liegt im Wert: mehrere Antworten gleichzeitig, in der Reihenfolge, in der sie gewählt wurden, bis zu einer festen Obergrenze von 19.",
          multiOrder:
            "Angenommen, und als Blue dann Red zurückgelesen — die gewählte Reihenfolge, nicht die Reihenfolge, in der die Optionen aufgeführt waren.",
          multiRemove:
            "Angenommen. Das Entfernen einer Auswahl lässt die übrigen in ihrer bestehenden relativen Reihenfolge.",
          multiTooMany:
            "Zurückgewiesen: VALIDATION_MAX_LENGTH, unter Nennung der Obergrenze von 19. Die Auswahlkomponente macht jede nicht gewählte Option ab 19 nicht mehr auswählbar und zeigt einen live mitlaufenden Zähler \"N of 19 selected\", sodass dies über die Oberfläche normalerweise unerreichbar ist.",
          multiDuplicate: "Zurückgewiesen: VALIDATION_UNIQUE. Eine wiederholte Auswahl wird zurückgewiesen, nicht zusammengelegt.",
          multiEmpty:
            "Als leer behandelt, genau wie ein leerer skalarer Wert bei jedem anderen Typ: bei einem optionalen Feld gelöscht, bei einem erforderlichen zurückgewiesen.",
          exMultiOrder: "Blue, dann Red — bei einem Feld, dessen Optionsliste Red vor Blue führt",
          exMultiRemove: "Eine Auswahl von dreien entfernen",
          exMultiTwenty: "Eine zwanzigste Auswahl",
          exMultiRepeat: "Dieselbe Option zweimal gewählt",
          exMultiEmptyList: "Eine explizit leere Liste",
          multiOrderWarnTitle: "Die Auswahlreihenfolge ist nicht die Optionsreihenfolge",
          multiOrderWarnContent:
            "Weil eine MultiSelect-Antwort die Reihenfolge bewahrt, in der sie gewählt wurde, ist eine Listenspalte, die diese Antwort zeigt, nicht garantiert in der Reihenfolge zu lesen, in der Sie die Optionen verfasst haben. Das ist es, was die Reihenfolge originalgetreu hin- und zurückreisen lässt, überrascht aber die meisten Menschen beim ersten Mal, wenn sie es bemerken.",

          changingTitle: "Die Liste später ändern",
          changingIntro:
            "Die Optionsliste ist jederzeit bearbeitbar. Weil der Optionstext die gespeicherte Antwort ist, greifen manche Änderungen rückwirkend in bereits bestehende Datensätze ein, andere nicht.",
          thChange: "Bearbeitung",
          thEffect: "Wirkung auf bereits bestehende Datensätze",
          chgAdd: "Eine neue Option hinzufügen",
          chgAddEffect: "Keine. Bestehende Antworten bleiben unberührt; die neue Option wird schlicht verfügbar.",
          chgRename: "Eine englische Bezeichnung umbenennen",
          chgRenameEffect:
            "Jeder Datensatz, der bereits den alten Text trägt, zeigt nun den neuen Text. Nichts wird migriert und nichts geht verloren, weil die Optionszeile das ist, worauf der Datensatz zeigt — aber die Antwort, die Menschen sehen, hat sich unter ihnen geändert.",
          chgRemove: "Eine Option entfernen",
          chgRemoveEffect:
            "Datensätze, die sie bereits tragen, behalten ihre gespeicherte Antwort und zeigen sie weiterhin an. Die Option wird niemandem Neuem mehr angeboten, und beim nächsten Mal, wenn jemand einen dieser Datensätze bearbeitet, muss er eine andere Antwort wählen, um zu speichern.",
          chgReorder: "Die Zeilen umsortieren",
          chgReorderEffect:
            "Ändert die Reihenfolge, in der die Optionen angeboten werden. Ändert keine gespeicherte Antwort, und sortiert eine bestehende MultiSelect-Antwort nicht um, die die Reihenfolge behält, in der sie gewählt wurde.",
          chgArabicOnly: "Nur eine arabische Bezeichnung ändern",
          chgArabicOnlyEffect:
            "Nur die Anzeige. Die gespeicherte Antwort ist die englische Bezeichnung, sodass sich an den Daten nichts ändert.",
          renameWarnTitle: "Mit Vorsicht umbenennen, und Hinzufügen bevorzugen",
          renameWarnContent:
            "Eine Option umzubenennen ist die eine Bearbeitung, die still umschreibt, wie sich der Verlauf liest: Ein Datensatz, der letztes Jahr mit \"Medium\" beantwortet wurde, liest sich als das, wozu Sie Medium umbenannt haben. Ist Ihnen die Unterscheidung wichtig, fügen Sie eine neue Option hinzu und bieten Sie die alte nicht mehr an, statt sie umzubenennen.",

          errorsTitle: "Optionsfehler, die Ihnen begegnen können",
          thSituation: "Situation",
          thWhatYouSee: "Was Sie sehen",
          errNoOptions: "Ein Select- oder MultiSelect-Feld mit leerer Liste speichern",
          errNoOptionsMsg: "Zurückgewiesen: Optionen sind für Select-Felder erforderlich.",
          errOptionsOnOther: "Optionen geliefert bei einem Typ, der sie nicht annimmt",
          errOptionsOnOtherMsg: "Zurückgewiesen: Optionen sind nur für Select-Felder erlaubt.",
          errNotAllowed: "Ein Wert, der keine der Optionen ist",
          errNotAllowedMsg:
            "Zurückgewiesen: VALIDATION_INVALID_FORMAT, unter Zitat des Werts und des Schlüssels des Felds.",
          errTooMany: "Mehr als 19 MultiSelect-Auswahlen",
          errTooManyMsg: "Zurückgewiesen: VALIDATION_MAX_LENGTH, unter Nennung der Obergrenze von 19.",
          errDuplicate: "Dieselbe MultiSelect-Option zweimal in einem Speichervorgang",
          errDuplicateMsg: "Zurückgewiesen: VALIDATION_UNIQUE, unter Zitat des wiederholten Werts.",

          notYetTitle: "Was die Optionsliste nicht leistet",
          notYetIntro: "Drei Dinge, die vernünftigerweise nachgefragt werden, und was die Antwort heute ist.",
          notYet1:
            "Die eigene Inline-Liste dieses Felds kann nicht selbst von einem anderen Feld wiederverwendet werden — die Options jedes Felds sind seine eigenen, hier eingetippt. Eine Länderliste, die drei Felder brauchen, muss deshalb aber nicht mehr dreimal geschrieben werden: Binden Sie stattdessen alle drei an ein gemeinsam genutztes, versioniertes Option Set (siehe Optionssets) und bearbeiten Sie es einmal.",
          notYet2:
            "Es gibt keine Farbe, kein Symbol und keinen Code pro Option, den Sie setzen können. Die Bezeichnung ist, soweit es das Definitionsformular betrifft, die ganze Option.",
          notYet3:
            "Es gibt keine Obergrenze dafür, wie viele Optionen eine Liste enthalten darf, aber eine MultiSelect-Antwort kann trotzdem nicht mehr als 19 davon auswählen.",
        },

        // ═══════════════════════════════════════════════════
        //  Validatoren
        // ═══════════════════════════════════════════════════
        validators: {
          title: "Validatoren",
          description:
            "Alle 13 integrierten Formatprüfungen für Textfelder, mit angenommenen und zurückgewiesenen Beispieleingaben, den sechs, die eine Einstellung benötigen, den sieben unterstützten Ländern für Postleitzahlen, und jeder Zurückweisung, auf die Sie stoßen können.",
          intro:
            "Ein Validator ist eine optionale zusätzliche Formatprüfung, die Sie bei der Definition an ein Textfeld anhängen, sodass ein Wert der falschen Form in dem Moment zurückgewiesen wird, in dem jemand versucht, ihn zu speichern, statt still zu einer schlechten Angabe zu werden, die Monate später auftaucht. Sie wählen eine von 13 integrierten Prüfungen aus einem Dropdown, und sieben davon brauchen keine weitere Einstellung.",
          textOnlyTitle: "Validatoren sind Text-exklusiv",
          textOnlyContent:
            "Ein Validator kann immer nur an ein Textfeld angehängt werden. Nicht an Number, nicht an Date, nicht an Select, nicht an Email, nicht an Url, nicht an Phone, nicht an LongText, an keinen der anderen — das Dropdown Validator wird für sie nicht einmal gezeigt, und der Server weist dasselbe erneut zurück, falls eine Anfrage das Formular umgeht. Brauchen Sie eine E-Mail-Adresse mit zusätzlichen Einschränkungen, ist die Antwort heute ein Textfeld mit einem Validator statt eines Email-Felds.",

          whyClosedTitle: "Warum es kein Muster-Feld gibt",
          whyClosedIntro:
            "Es gibt bewusst nirgends im Produkt eine Freitext- oder Regex-Eingabe. Ein von Hand geschriebenes Muster lässt sich so gestalten, dass es enorm viel Rechenzeit für eine kurze Eingabe verbraucht, was ein Dateneingabeformular in einen Weg verwandelt, das System lahmzulegen. Die Menge der Prüfungen ist deshalb stattdessen fest und kuratiert, und jede trägt ihre eigene kurze Längenobergrenze und ihr eigenes Zeitlimit.",

          howTitle: "Wie ein Validator läuft",
          howIntro: "Vier Dinge geschehen in dieser Reihenfolge, jedes Mal, wenn ein Wert in das Feld gespeichert wird.",
          how1: "Ist der Wert leer oder besteht er aus nichts als Leerzeichen, wird er als leer behandelt, und es läuft überhaupt kein Validator.",
          how2: "Die globale Textobergrenze von 4.000 Zeichen läuft und weist mit VALIDATION_MAX_LENGTH zurück, falls der Wert länger ist.",
          how3:
            "Die eigene, deutlich kürzere Längenobergrenze des Validators läuft — 11 Zeichen für einen SWIFT-Code, 15 für eine IMEI, und so weiter — und weist ebenfalls mit VALIDATION_MAX_LENGTH zurück.",
          how4: "Erst dann läuft die tatsächliche Prüfung des Validators, die mit ihrem eigenen Code und ihrer eigenen Meldung zurückweist.",
          howTwoPoints:
            "Die Prüfung wird an zwei getrennten Punkten durchgesetzt, und es lohnt sich, zu wissen, dass es beide gibt. Bei der Definition wird eine ungültige Kombination aus Validator und Einstellung zurückgewiesen, wenn Sie die Definition speichern. Beim Wert läuft der Validator erneut gegen jeden Wert, den jemand in das Feld speichert.",

          fixedTitle: "Die sieben Prüfungen ohne Einstellung",
          fixedIntro:
            "Diese validieren ein bestimmtes externes Format und nehmen nie einen Parameter — einen zu liefern wird selbst zurückgewiesen. Drei von ihnen verifizieren eine echte Prüfziffer, was bedeutet, dass eine einzelne fehlgetippte Ziffer erkannt wird und nicht nur eine falsche Länge.",
          thValidator: "Validator",
          thShape: "Form",
          thMaxLength: "Maximallänge",
          thChecksum: "Prüfziffer",
          shapeIban: "Zwei Buchstaben, zwei Ziffern, dann 11 bis 30 Buchstaben oder Ziffern",
          shapeImei: "Genau 15 Ziffern",
          shapeSwift: "Sechs Buchstaben, zwei Buchstaben oder Ziffern, optional drei weitere",
          shapePlate: "2 bis 15 Buchstaben, Ziffern, Leerzeichen oder Bindestriche, beliebige Groß-/Kleinschreibung",
          shapeEgypt: "14 Ziffern: Jahrhundertmarker, dann ein plausibles JJMMTT, dann sieben weitere",
          shapeSaudi: "10 Ziffern, beginnend mit 1 oder 2",
          shapeEmirati: "784, vier Ziffern, sieben Ziffern, eine Ziffer — Bindestriche optional",
          checksumReal: "Ja — verifiziert",
          checksumNone: "Keine im Standard",
          checksumUnpublished: "Nicht verifiziert — keine veröffentlicht",
          thExample: "Beispieleingabe",
          thOutcome: "Was passiert",

          ibanTitle: "IBAN",
          ibanFor:
            "Für eine internationale Bankkontonummer. Verwenden Sie sie überall, wo eine falsche Ziffer Geld an die falsche Stelle senden würde.",
          ibanChecks:
            "Die Form wird zuerst geprüft, dann werden die echten ISO-Prüfziffern verifiziert. Auf 34 Zeichen gedeckelt — keine reale IBAN ist länger. Der Wert wird exakt so abgeglichen, wie übermittelt: Er wird nicht großgeschrieben, und Leerzeichen werden nicht für Sie entfernt.",
          ibanOk: "Angenommen. Form und Prüfziffern stimmen beide.",
          ibanBadCheck:
            "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Die Form ist vollkommen gültig, und nur die Prüfziffer ist falsch — genau die Art von Fehler, die eine reine Formprüfung übersehen würde.",
          ibanLower: "Zurückgewiesen. Die Buchstaben müssen großgeschrieben sein.",
          ibanSpaces:
            "Zurückgewiesen. IBANs werden zur besseren Lesbarkeit oft in Vierergruppen gedruckt, aber die gespeicherte Form enthält keine Leerzeichen.",

          imeiTitle: "IMEI",
          imeiFor: "Für die Identitätsnummer eines Mobilgeräts, wie sie auf dem Gerät oder seiner Verpackung aufgedruckt ist.",
          imeiChecks:
            "Genau 15 Ziffern, dann wird die echte Prüfziffer verifiziert. Auf 15 Zeichen gedeckelt. Die 16- und 17-stelligen Anzeigevarianten mancher Geräte werden nicht angenommen.",
          imeiOk: "Angenommen.",
          imeiBadCheck:
            "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Fünfzehn Ziffern, richtige Form, falsche letzte Ziffer.",
          imeiShort:
            "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Vierzehn Ziffern scheitern an der Formprüfung — die Längenobergrenze erfasst nur einen Wert, der länger als 15 ist.",

          swiftBicTitle: "SWIFT / BIC Code",
          swiftBicFor: "Für einen Bankleitzahl-Code, verwendet zusammen mit einer Kontonummer bei einer internationalen Überweisung.",
          swiftBicChecks:
            "Acht oder elf Zeichen: sechs Buchstaben, dann zwei Buchstaben oder Ziffern, dann optional drei weitere Buchstaben oder Ziffern. Nur Großbuchstaben, keine Trennzeichen, auf 11 Zeichen gedeckelt. Es gibt im Standard keine Prüfziffer, sodass ein wohlgeformter Code, der zu keiner echten Bank gehört, angenommen wird.",
          swiftOk8: "Angenommen — die achtstellige Form.",
          swiftOk11: "Angenommen — die elfstellige Form mit einem Filialcode.",
          swiftDigit: "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Die ersten sechs Zeichen müssen alle Buchstaben sein.",
          swiftLower: "Zurückgewiesen. Dies ist ein festes externes Format, und Kleinbuchstaben gehören nicht dazu.",
          swiftLength: "Zurückgewiesen. Acht oder elf Zeichen genau — neun ist keins von beiden.",

          plateTitle: "Vehicle Plate Number",
          plateFor:
            "Für ein Fahrzeugkennzeichen, wenn Sie offensichtlichen Unsinn abfangen möchten, ohne sich auf das Format eines bestimmten Landes festzulegen.",
          plateChecks:
            "2 bis 15 Zeichen, bestehend aus Buchstaben, Ziffern, Leerzeichen und Bindestrichen in beliebiger Kombination. Ohne Unterscheidung von Groß-/Kleinschreibung. Bewusst großzügig — es gibt in dieser Prüfung nirgends ein länderspezifisches Kennzeichenformat, weil sich Kennzeichenformate von Land zu Land und von Fahrzeugklasse zu Fahrzeugklasse innerhalb eines Landes unterscheiden.",
          plateOk: "Angenommen.",
          plateLowerOk: "Angenommen. Anders als SWIFT kümmert sich diese Prüfung nicht um Groß-/Kleinschreibung.",
          plateTooShort: "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Das Minimum sind zwei Zeichen.",
          plateBadChar: "Zurückgewiesen. Ein Schrägstrich gehört zu keiner der vier erlaubten Zeichenklassen.",

          egyptIdTitle: "Egyptian National ID",
          egyptIdFor: "Für eine ägyptische nationale Personalausweisnummer.",
          egyptIdChecks:
            "Vierzehn Ziffern: ein Jahrhundertmarker von 2 oder 3, dann ein Geburtsdatum als JJMMTT, das kalendarisch plausibel sein muss, dann sieben weitere Ziffern. Nur Struktur — Ägypten hat nie einen Prüfziffer-Algorithmus veröffentlicht, die letzte Ziffer wird also nicht verifiziert. Einen geratenen Algorithmus auszuliefern würde echte, gültige Ausweisnummern zurückweisen, was schlimmer ist, als gar nicht zu prüfen.",
          egyptOk: "Angenommen.",
          egyptBadMonth: "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Monat 13 ist kein plausibler Monat.",
          egyptBadDay: "Zurückgewiesen. Tag 32 ist kein plausibler Tag.",
          egyptBadCentury: "Zurückgewiesen. Der Jahrhundertmarker muss 2 oder 3 sein.",
          egyptLength: "Zurückgewiesen. Dreizehn Ziffern sind keine vierzehn.",

          saudiIdTitle: "Saudi National ID",
          saudiIdFor: "Für eine saudi-arabische nationale Personalausweisnummer oder eine Iqama-Nummer (Aufenthaltstitel).",
          saudiIdChecks:
            "Zehn Ziffern, die erste ist 1 für Staatsangehörige oder 2 für Ansässige, und die echte Prüfziffer wird verifiziert. Auf 10 Zeichen gedeckelt.",
          saudiOk: "Angenommen. Form und Prüfziffer stimmen beide.",
          saudiBadCheck: "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Richtige Form, falsche Prüfziffer.",
          saudiBadPrefix: "Zurückgewiesen. Die erste Ziffer muss 1 oder 2 sein.",
          saudiLength: "Zurückgewiesen. Neun Ziffern sind keine zehn.",

          emiratiIdTitle: "Emirati ID (UAE)",
          emiratiIdFor: "Für eine Emirates-ID-Nummer.",
          emiratiIdChecks:
            "Die Form 784-JJJJ-XXXXXXX-C, mit optionalen Bindestrichen. Auf 18 Zeichen gedeckelt. Nur Struktur — die VAE haben nie einen Prüfziffer-Algorithmus veröffentlicht, die letzte Ziffer wird also aus demselben Grund wie bei der ägyptischen Prüfung nicht verifiziert.",
          emiratiOk: "Angenommen, Bindestriche und alles.",
          emiratiNoHyphens: "Angenommen. Die Bindestriche sind optional, beide geschriebenen Formen funktionieren also.",
          emiratiBadPrefix: "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Jede Emirates-ID beginnt mit 784.",
          emiratiLength: "Zurückgewiesen. Der mittlere Block hat sieben Ziffern, nicht sechs.",

          paramTitle: "Die sechs Prüfungen, die eine Einstellung benötigen",
          paramIntro:
            "Diese verlangen einen Validator Parameter, und ihn leer zu lassen wird bei der Definition zurückgewiesen — ebenso wie einen für einen Validator zu liefern, der keinen annimmt. Das Element Validator Parameter erscheint, sobald Sie einen dieser sechs wählen.",
          thParamFormat: "Format der Einstellung",
          thParamExample: "Beispieleinstellung",
          paramFmtPostal: "Ein Land, gewählt aus einem Dropdown der sieben unterstützten",
          paramFmtNumeric: "Zwei durch Komma getrennte Grenzen; jede Seite darf für ein offenes Ende leer bleiben",
          paramFmtLength: "Zwei durch Komma getrennte Zeichenzahlen; jede Seite darf leer bleiben",
          paramFmtOneOf: "Ein zulässiger Wert pro Zeile",
          paramFmtContains: "Beliebiger literaler Text",
          paramFmtStartsWith: "Beliebiger literaler Text",
          paramExOneOf: "Goalkeeper / Defender / Midfielder / Forward, einer pro Zeile",

          postalTitle: "Postal Code",
          postalFor:
            "Für eine Postleitzahl eines bestimmten Landes. Das Land ist Teil der Definition, keine Wahl, die die Person trifft, die den Datensatz ausfüllt.",
          postalChecks:
            "Der Wert wird gegen das echte Postleitzahlenformat des von Ihnen konfigurierten Landes abgeglichen. Auf 16 Zeichen gedeckelt. Sieben Länder werden unterstützt, und das Dropdown bietet nie andere an.",
          postalEgOk: "Angenommen. Ägypten hat fünf Ziffern.",
          postalEgBad: "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Vier Ziffern sind keine fünf.",
          postalUsOk: "Angenommen. Sowohl die fünfstellige als auch die ZIP+4-Form sind gültig.",
          postalGbOk: "Angenommen. Das britische Format wird in beiden Fällen abgeglichen, mit oder ohne Leerzeichen.",
          postalCaOk: "Angenommen, einschließlich der echten Buchstabenausschlüsse, die Canada Post anwendet.",
          exPostalEg: "11511, mit der Einstellung EG",
          exPostalEgBad: "1151, mit der Einstellung EG",
          exPostalUsPlus4: "90210-1234, mit der Einstellung US",
          exPostalGb: "SW1A 1AA, mit der Einstellung GB",
          exPostalCa: "K1A 0B1, mit der Einstellung CA",

          numericRangeTitle: "Numeric Range",
          numericRangeFor:
            "Für eine Zahl innerhalb von Ihnen gesetzter Grenzen, bei einem Feld, das Text statt Number ist — eine Trikotnummer, eine Kadergröße, eine Anzahl von Trikots.",
          numericRangeChecks:
            "Der Wert muss sich als Zahl parsen lassen und innerhalb des Bereichs liegen. Die Einstellung besteht aus zwei durch Komma getrennten Grenzen; eine Seite leer zu lassen macht dieses Ende offen, aber beide leer zu lassen wird zurückgewiesen, weil ein Bereich, der alles akzeptiert, dasselbe ist wie gar keinen Validator anzuhängen.",
          numericOk: "Angenommen.",
          numericOut: "Zurückgewiesen: VALIDATION_RANGE.",
          numericNotANumber: "Zurückgewiesen: VALIDATION_RANGE. Ein Wert, der keine Zahl ist, kann nicht innerhalb eines Bereichs liegen.",
          numericOpenOk: "Angenommen. Eine offene Obergrenze bedeutet jede Zahl bei oder über der unteren.",
          numericBothBlank:
            "Bei der Definition zurückgewiesen, mit der Erklärung, dass der Validator mindestens eine Grenze braucht.",
          exNumeric50: "50, mit der Einstellung 1,100",
          exNumeric150: "150, mit der Einstellung 1,100",
          exNumericText: "\"fifty\", mit der Einstellung 1,100",
          exNumericOpen: "5000, mit der Einstellung 1,",
          exNumericBothBlank: "Die Einstellung , mit beiden Seiten leer",

          lengthRangeTitle: "Length Range",
          lengthRangeFor:
            "Für Text, der eine bestimmte Länge haben muss — ein zweibuchstabiger Code, eine Referenz von mindestens acht Zeichen.",
          lengthRangeChecks:
            "Die Anzahl der Zeichen muss innerhalb des Bereichs liegen. Die Einstellung besteht aus zwei durch Komma getrennten Zeichenzahlen, und jede Seite darf für ein offenes Ende leer bleiben. Diese Prüfung erzeugt zwei unterschiedliche Codes statt einem, sodass Sie zu kurz von zu lang unterscheiden können.",
          lengthOk: "Angenommen.",
          lengthTooShort: "Zurückgewiesen: VALIDATION_MIN_LENGTH, unter Nennung des Minimums.",
          lengthTooLong: "Zurückgewiesen: VALIDATION_MAX_LENGTH, unter Nennung des Maximums.",
          exLength10: "\"Alexandria\" — 10 Zeichen, mit der Einstellung 2,50",
          exLength1: "\"A\" — 1 Zeichen, mit der Einstellung 2,50",
          exLength80: "Ein Wert mit 80 Zeichen, mit der Einstellung 2,50",

          oneOfListTitle: "One of a List",
          oneOfListFor:
            "Für eine geschlossene Menge von Antworten bei einem Textfeld. Ist die geschlossene Menge der ganze Sinn des Felds, ist ein Select-Feld meist die bessere Wahl — aber dieser Validator existiert für den Fall, dass Sie das Verhalten eines Validators bei einem Textfeld möchten.",
          oneOfListChecks:
            "Der Wert muss exakt einer Zeile der von Ihnen konfigurierten Liste entsprechen, ein Wert pro Zeile. Der Abgleich unterscheidet Groß-/Kleinschreibung.",
          oneOfOk: "Angenommen.",
          oneOfCase: "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Der Abgleich unterscheidet Groß-/Kleinschreibung.",
          oneOfUnknown: "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Der Wert steht nicht auf der Liste.",

          containsTitle: "Contains Text",
          containsFor:
            "Für einen Wert, der irgendwo eine Kennzeichnung enthalten muss — ein Vereinspräfix, eine Saison-Kennung, einen Abteilungscode.",
          containsChecks: "Der Wert muss den von Ihnen konfigurierten literalen Text enthalten, unter Berücksichtigung der Groß-/Kleinschreibung.",
          containsOk: "Angenommen, mit der Einstellung FC-.",
          containsCase: "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Der Abgleich beachtet Groß-/Kleinschreibung.",
          containsMissing: "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Die Kennzeichnung ist nicht vorhanden.",

          startsWithTitle: "Starts With Text",
          startsWithFor:
            "Für einen Wert, der mit einem Präfix beginnen muss — einem Ländercode, einem Filialcode, einem festen Referenzstamm.",
          startsWithChecks: "Der Wert muss mit dem von Ihnen konfigurierten literalen Text beginnen, unter Berücksichtigung der Groß-/Kleinschreibung.",
          startsOk: "Angenommen, mit der Einstellung EG-.",
          startsWrongPlace:
            "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Der Text ist vorhanden, aber nicht am Anfang — verwenden Sie Contains Text, wenn die Position keine Rolle spielt.",
          startsCase: "Zurückgewiesen: VALIDATION_INVALID_FORMAT. Der Abgleich beachtet Groß-/Kleinschreibung.",

          postalCountriesTitle: "Die sieben Länder für Postal Code",
          postalCountriesIntro:
            "Postal Code liefert echte, belegte Formate für genau sieben Länder, und die Einstellung ist ein Dropdown statt Freitext, sodass vom Formular aus kein anderes Land gewählt werden kann.",
          thCountry: "Land",
          thFormat: "Format",
          thValidExample: "Gültiges Beispiel",
          fmtEg: "Genau fünf Ziffern",
          fmtSa: "Fünf Ziffern, optional ein Bindestrich und eine vierstellige Erweiterung",
          fmtUs: "Ein fünfstelliges ZIP, optional ein Bindestrich und eine vierstellige Erweiterung",
          fmtGb: "Die standardmäßige Form eines britischen Postcodes, beliebige Groß-/Kleinschreibung, Leerzeichen optional",
          fmtDe: "Genau fünf Ziffern, führende Null erlaubt",
          fmtFr: "Genau fünf Ziffern",
          fmtCa: "Die Form A1A 1A1, mit den echten Buchstabenausschlüssen von Canada Post angewendet",
          uaeTitle: "Die Vereinigten Arabischen Emirate fehlen bewusst",
          uaeContent:
            "Die VAE haben kein nationales Postleitzahlensystem, es gibt also kein echtes Format, gegen das ein Wert geprüft werden könnte — weder streng noch locker. Das ist kein fehlender Eintrag, der noch hinzugefügt werden soll: Der Versuch, es zu verwenden, wird bei der Definition mit einer eigenen erklärenden Meldung zurückgewiesen, verschieden von der allgemeinen Meldung für ein nicht unterstütztes Land, die Sie bei einem Tippfehler bekämen, und die Ihnen sagt, das Feld stattdessen ohne Validator zu lassen. Das Dropdown bietet es nie an.",

          attachTitle: "Zurückweisungen beim Anhängen eines Validators",
          attachIntro:
            "Diese geschehen alle bei der Definition, bevor je ein Wert gespeichert wird. Mehrere sind nur über eine Anfrage erreichbar, die das Formular umgeht, weil das Formular die ungültige Kombination gar nicht erst anbietet.",
          thSituation: "Situation",
          thWhatYouSee: "Was Sie sehen",
          attNonText: "Ein Validator bei einem Feld, das nicht Text ist",
          attNonTextMsg:
            "Zurückgewiesen, unter Nennung des Werttyps: Ein Validator kann nur an ein Textfeld angehängt werden.",
          attNoParam: "Ein parametrisierter Validator mit leerer Einstellung",
          attNoParamMsg: "Zurückgewiesen, unter Nennung des Validators: Er benötigt einen Parameter.",
          attExtraParam: "Eine Einstellung bei einem der sieben, die keine annehmen",
          attExtraParamMsg: "Zurückgewiesen, unter Nennung des Validators: Er akzeptiert keinen Parameter.",
          attBadRange: "Eine fehlerhafte Bereichseinstellung",
          attBadRangeMsg:
            "Zurückgewiesen, mit der Erklärung, dass zwei durch Komma getrennte Grenzen benötigt werden, dass jede Seite leer bleiben darf, und dass die untere Grenze die obere nicht überschreiten darf.",
          attNoBound: "Eine Bereichseinstellung mit beiden Seiten leer",
          attNoBoundMsg:
            "Zurückgewiesen, mit der Erklärung, dass ein Parameter mit beiden Seiten leer jeden Wert akzeptieren würde, was dasselbe ist wie gar keinen Validator anzuhängen.",
          attUnsupportedCountry: "Ein Postal-Code-Land, das keines der sieben ist",
          attUnsupportedCountryMsg:
            "Zurückgewiesen, unter Nennung des Landes und Auflistung der sieben unterstützten: EG, SA, US, GB, DE, FR, CA.",
          attUae: "Postal Code mit AE",
          attUaeMsg:
            "Zurückgewiesen mit einer eigenen, gesonderten Meldung, die erklärt, dass die VAE kein nationales Postleitzahlensystem haben und das Feld stattdessen ohne Validator gelassen werden sollte.",

          codesTitle: "Fehlercodes von Validatoren",
          codesIntro:
            "Jede Validator-Zurückweisung ist ein HTTP 422, nie ein 500. Sollte ein Validator-Fehlschlag je einen 500 erzeugen, ist das ein meldenswerter Fehler — jeder ist so geschrieben, dass er sauber zurückweist.",
          thCode: "Code",
          thWhenItFires: "Wann er ausgelöst wird",
          codeInvalidFormat:
            "Die meisten Validator-Fehlschläge: eine Form, die nicht passt, eine Prüfziffer, die sich nicht verifizieren lässt, ein Wert, der nicht auf einer One-of-a-List-Liste steht, eine fehlende Contains- oder Starts-With-Kennzeichnung, oder eine Postleitzahl, die nicht zu ihrem Land passt.",
          codeRange: "Numeric Range — der Wert liegt außerhalb der Grenzen, oder ist überhaupt keine Zahl.",
          codeMaxLength:
            "Die globale Textobergrenze von 4.000 Zeichen, die eigene kürzere Obergrenze eines Validators, oder die Obergrenze von Length Range.",
          codeMinLength: "Die Untergrenze von Length Range.",
          codeRequired:
            "Das Feld ist Required, und der Wert ist leer. Das wird ausgelöst, bevor irgendein Validator läuft, sodass ein reiner Leerzeichen-Wert bei einem erforderlichen Feld die allgemeine Required-Meldung erhält statt einer validatorspezifischen.",
          codesInfoTitle: "Meldungen nennen den Schlüssel, nicht die Bezeichnung",
          codesInfoContent:
            "Eine Validator-Meldung zitiert den maschinenlesbaren Schlüssel des Felds — \"'shirt_size' is not a valid IBAN.\" — statt seiner Anzeigebezeichnung. Gleichen Sie über den Schlüssel ab, wenn Sie einem Fehlschlag nachgehen.",

          limitsTitle: "Was Validatoren nicht leisten",
          limit1:
            "Sie hängen sich immer nur an ein Textfeld. Es gibt keinen Weg, eine Formatprüfung an einen der anderen einundzwanzig Typen anzubringen.",
          limit2:
            "Sie prüfen nie erneut Werte, die bereits gespeichert wurden. Einen Validator an ein Feld anzuhängen, das Antworten enthält, lässt diese Antworten exakt so, wie sie sind, einschließlich solcher, die nun scheitern würden, bis jemand sie erneut eingibt und speichert.",
          limit3:
            "Sie laufen nie bei einem leeren Wert. Bei einem Feld, das nicht Required ist, wird ein Wert aus nichts als Leerzeichen ohne jeden Validator-Fehler als gelöscht gespeichert — markieren Sie das Feld als Required, falls eine leere Antwort zurückgewiesen werden soll.",
          limit4:
            "Sie lassen sich nicht durchsuchen oder filtern. Es gibt keine Ansicht aller Felder, die IBAN verwenden; der einzige Weg zu sehen, welchen Validator ein Feld hat, ist, dieses Feld zu öffnen.",
          limit5:
            "Sie haben keine durchsuchbare Referenz im Produkt selbst. Um die Liste der Validatoren zu sehen, öffnen Sie das Definitionsformular eines Textfelds und lesen das Dropdown.",
          limit6:
            "Sie lassen sich nicht von Hand schreiben. Es gibt bewusst nirgends eine Regex- oder Muster-Eingabe, und die 13 integrierten Prüfungen sind die vollständige Menge.",
        },

        // ═══════════════════════════════════════════════════
        //  Sicherheit auf Feldebene
        // ═══════════════════════════════════════════════════
        security: {
          title: "Sicherheit auf Feldebene",
          description:
            "Ein bestimmtes benutzerdefiniertes Feld vor den Personen verbergen, die eine Rolle oder Benutzergruppe innehaben: wie es konfiguriert wird, was diese Personen sehen, warum ihre Speichervorgänge verborgene Werte nicht zerstören, und warum sich Pflichtfeld und eingeschränkt nicht kombinieren lassen.",
          intro:
            "Sicherheit auf Feldebene lässt Sie ein benanntes Feld vor den Personen verbergen, die eine bestimmte Rolle oder Benutzergruppe innehaben. Sie gilt für benutzerdefinierte Felder exakt so, wie für die eingebauten Felder eines Bildschirms — ein Feld, das ein Administrator bewusst eingeschränkt hat, ist auch über die API für benutzerdefinierte Felder nicht lesbar. Das ist der Mechanismus, zu dem Sie greifen, wenn ein Wert wirklich nicht gesehen werden darf.",
          notSensitivityTitle: "Das ist nicht die Einstellung Sensitivity",
          notSensitivityContent:
            "Die Einstellung Sensitivity einer Felddefinition — Unclassified, Internal, Confidential, Restricted — ist ein Label für Berichte und den Umgang beim Export. Sie schränkt den Zugriff auf nichts ein, und die beiden Mechanismen sind völlig unabhängig voneinander. Möchten Sie ein Feld verborgen haben, konfigurieren Sie es hier, auf der Rolle oder Benutzergruppe, nicht auf der Felddefinition.",

          whereTitle: "Wo Einschränkungen konfiguriert werden",
          whereIntro:
            "Einschränkungen werden auf der Sache gesetzt, die Zugriff gewährt, nicht auf dem Feld. Es gibt zwei Stellen, und sie addieren sich.",
          where1:
            "Pro Rolle: die Liste eingeschränkter Felder bei einer Berechtigung, im Berechtigungsdialog dieser Rolle.",
          where2: "Pro Benutzergruppe: die eigenen Einschränkungen der Gruppe.",
          whereKeyed:
            "Feldnamen werden von Hand eingetippt, und sie sind über die Berechtigungsressource verschlüsselt, die den Datensatz bereits schützt — employees, party-people — statt über den Datensatztyp. Die folgenden Details lohnt es sich, einmal zu lesen, bevor Sie irgendetwas konfigurieren.",
          thAspect: "Aspekt",
          thBehaviour: "Verhalten",
          aspSources: "Zwei Quellen",
          behSources:
            "Eine Rolleneinschränkung und eine Gruppeneinschränkung vereinigen sich. Eine Gruppe kann nie erweitern, was eine Rolle eingeschränkt hat, und es gibt in keiner Richtung eine Überschreibung.",
          aspCase: "Groß-/Kleinschreibung",
          behCase: "Der Abgleich ignoriert Groß-/Kleinschreibung, sodass Salary, salary und SALARY dasselbe Feld sind.",
          aspResource: "Verschlüsselung",
          behResource:
            "Einschränkungen sind über die Berechtigungsressource verschlüsselt, dieselbe Ressource, die auch den Datensatz selbst schützt — nicht über den Entitätstyp und nicht über die Feldgruppe.",
          aspBuiltIn: "Umfang des Mechanismus",
          behBuiltIn:
            "Derselbe Mechanismus deckt sowohl die eingebauten Felder eines Bildschirms als auch seine benutzerdefinierten Felder ab. Eine Liste eingeschränkter Felder, ein Verhalten.",
          aspExempt: "Ausnahme",
          behExempt:
            "Der Systemadministrator der Plattform ist immer ausgenommen und sieht immer jedes Feld. Das ist dieselbe Ausnahme, die der eingebaute Mechanismus bereits macht.",

          seesTitle: "Was eine eingeschränkte Person sieht",
          seesIntro:
            "Überhaupt nichts. Das Feld wird nicht ausgegraut, nicht leer gezeigt, nicht als verborgen markiert — der Eintrag wird vollständig aus dem Datensatzformular und aus der Datensatzliste ausgelassen.",
          seesIndistinguishable:
            "Ein ausgelassenes Feld ist nicht von einem Feld zu unterscheiden, das nie definiert wurde. Das ist beabsichtigt: Einen Platzhalter zu zeigen würde jemandem sagen, dass es einen Wert gibt, den er nicht sehen darf, was selbst eine Information ist. Es bedeutet auch, dass eine Kollegin, die meldet, ein Feld fehle, eine Einschränkung statt eines Fehlers beschreiben könnte — prüfen Sie die Rollen- und Gruppeneinschränkungen, bevor Sie nach einem Defekt suchen.",

          savingTitle: "Speichern rund um ein verborgenes Feld",
          savingIntro:
            "Das ist der Teil, den es sich lohnt, richtig zu verstehen, weil die naheliegende Umsetzung Daten zerstören würde. Wenn jemand einen Datensatz speichert, ersetzt der Speichervorgang die gesamte Menge der Werte benutzerdefinierter Felder auf einmal — ein in der Anfrage fehlendes Feld würde also normalerweise \"leeren\" bedeuten.",
          savingWhy:
            "Ein eingeschränktes Feld fehlt aus einem ganz anderen Grund: Der Person wurde es nie gesendet. Das Produkt unterscheidet diese beiden Fälle und lässt den gespeicherten Wert eines eingeschränkten Felds exakt so, wie er war. Jemand, der einen Wert nicht sehen kann, kann ihn nicht mehr löschen, indem er den Datensatz drum herum bearbeitet.",
          savingInfoTitle: "Die praktische Konsequenz",
          savingInfoContent:
            "Sie können jemandem gefahrlos Bearbeitungszugriff auf einen Datensatz geben, während Sie ein sensibles Feld darauf einschränken. Seine gewöhnlichen Bearbeitungen gehen durch, und der Wert, den er nicht sehen kann, überlebt unberührt.",

          writingTitle: "Ein eingeschränktes Feld absichtlich schreiben",
          writingIntro:
            "Ein Versuch, ein eingeschränktes Feld ausdrücklich zu schreiben, wird rundheraus zurückgewiesen, und nichts anderes im selben Speichervorgang wird ebenfalls angewendet. Die gesamte Anfrage abzulehnen statt das eine Feld still fallen zu lassen ist beabsichtigt: ein als erfolgreich gemeldeter Speichervorgang, dem still ein Feld fehlt, ist der schwerer zu bemerkende Fehlschlag.",
          writingProbe:
            "Die Zurückweisung greift auch dann, wenn der übermittelte Wert zufällig dem gespeicherten entspricht, sodass niemand einen verborgenen Wert herausfinden kann, indem er testet, welche Übermittlungen angenommen werden.",
          thAttempt: "Versuch",
          thResult: "Ergebnis",
          attSaveOthers: "Den Datensatz speichern, nur Felder ändernd, die Sie sehen können",
          resSaveOthers:
            "Gelingt. Der gespeicherte Wert des eingeschränkten Felds bleibt exakt so, wie er war, nicht geleert.",
          attWriteRestricted: "Einen Wert für das eingeschränkte Feld senden",
          resWriteRestricted:
            "Zurückgewiesen mit einer Meldung, die das Feld nennt, und der Datensatz wird überhaupt nicht gespeichert — nicht einmal die Felder, die Sie ändern durften.",
          attWriteSameValue: "Den aktuellen Wert des eingeschränkten Felds senden",
          resWriteSameValue:
            "Auf dieselbe Weise zurückgewiesen. Das Ergebnis hängt nicht davon ab, ob Ihre Vermutung richtig war, es kann also nicht benutzt werden, um den Wert zu erproben.",
          attReadApi: "Die Werte benutzerdefinierter Felder des Datensatzes direkt lesen",
          resReadApi:
            "Das eingeschränkte Feld fehlt in der Antwort. Das war die Lücke, die Sicherheit auf Feldebene speziell bei benutzerdefinierten Feldern früher offen ließ, und sie ist geschlossen.",

          requiredTitle: "Required und eingeschränkt lassen sich nicht kombinieren",
          requiredIntro:
            "Ein erforderliches Feld kann nie von jemandem ausgefüllt werden, der es nicht sehen darf — diese Person könnte den Datensatz überhaupt nicht speichern. Das Produkt weist die Kombination deshalb zurück, in welcher Reihenfolge Sie es auch versuchen.",
          thSituation: "Versuch",
          thWhatYouSee: "Was Sie sehen",
          reqRestrictRequired: "Ein derzeit erforderliches Feld einschränken",
          reqRestrictRequiredMsg: "Zurückgewiesen, unter Nennung des Felds.",
          reqRequireRestricted: "Ein Feld als erforderlich markieren, während eine Rolle oder Gruppe es einschränkt",
          reqRequireRestrictedMsg:
            "Zurückgewiesen, unter Nennung des Felds und mit dem Hinweis, zuerst die Einschränkung zu entfernen oder das Feld optional zu lassen.",
          requiredInfoTitle: "Die Reihenfolge hilft nicht",
          requiredInfoContent:
            "Die beiden Vorgänge in der anderen Reihenfolge auszuführen umgeht die Regel nicht. Beide Richtungen werden geprüft, es gibt also keine Abfolge, die ein Feld sowohl erforderlich als auch eingeschränkt zurücklässt.",

          reachTitle: "Wo eine Einschränkung sonst noch reicht",
          reachIntro:
            "Eine Einschränkung ist keine reine Formularsache. Sie gilt konsistent überall, wo die Werte des Felds sonst auftauchen könnten.",
          reach1: "Das Datensatzformular: Das Feld wird ausgelassen.",
          reach2: "Die Datensatzliste: Die Spalte wird ausgelassen.",
          reach3:
            "Die API für die Werte benutzerdefinierter Felder: Das Feld fehlt in der Antwort und wird beim Schreiben zurückgewiesen.",
          reach4:
            "Der Tabellenexport der Definitionen: Eingeschränkte Spalten fehlen in der Datei, statt vorhanden und leer zu sein.",

          exampleTitle: "Ein durchgerechnetes Beispiel",
          exampleIntro:
            "Ein Gehaltsfeld auf einem Personal-Datensatz einschränken, und bestätigen, dass es sich richtig verhält.",
          e1Title: "Definieren Sie das Feld und geben Sie ihm einen Wert",
          e1Content:
            "Definieren Sie als Administrator, der alles sehen kann, ein benutzerdefiniertes Feld mit dem Schlüssel salary beim Datensatztyp für Personal, und setzen Sie einen Wert bei einem Datensatz.",
          e2Title: "Schränken Sie es auf einer Rolle ein",
          e2Content:
            "Fügen Sie salary der Liste eingeschränkter Felder bei der betreffenden Berechtigung einer Rolle hinzu, und melden Sie sich dann als jemand an, der nur diese Rolle innehat.",
          e3Title: "Bestätigen Sie, dass es fehlt, nicht leer ist",
          e3Content:
            "Öffnen Sie denselben Personal-Datensatz. Das Feld Salary sollte überhaupt nicht auf dem Formular sein, und es sollte keine Spalte Salary in der Personalliste geben. Sehen Sie es leer statt fehlend, ist die Einschränkung nicht angewendet.",
          e4Title: "Speichern Sie den Datensatz und prüfen Sie, ob der Wert überlebt hat",
          e4Content:
            "Ändern Sie als diese eingeschränkte Person etwas anderes am Datensatz und speichern Sie. Öffnen Sie den Datensatz dann als der uneingeschränkte Administrator erneut und bestätigen Sie, dass das Gehalt noch da ist. Das ist der Fall, der bei einer naiven Umsetzung Daten zerstören würde.",
          e5Title: "Bestätigen Sie die beiden Regeln, die die Konfiguration schützen",
          e5Content:
            "Versuchen Sie, salary als erforderlich zu markieren, während die Einschränkung besteht — zurückgewiesen. Entfernen Sie die Einschränkung, markieren Sie es als erforderlich, und versuchen Sie dann, es erneut einzuschränken — ebenfalls zurückgewiesen. Setzen Sie schließlich denselben Schlüssel in die Einschränkungen einer Benutzergruppe statt einer Rolle und bestätigen Sie, dass es sich identisch verhält.",
          proofTitle: "Ein ehrlicher Vorbehalt zur Verifikation",
          proofContent:
            "Jedes auf dieser Seite beschriebene Autorisierungsverhalten wird von echten, unit-getesteten Schranken durchgesetzt, aber es gibt derzeit keinen automatisierten End-to-End-Test, der es über den vollen HTTP-Stack nachweist. Das macht eine manuelle Prüfung hier wirklich aufschlussreich statt überflüssig — wenn Sie einen Arbeitsbereich in Betrieb nehmen, in dem ein Feld nicht gesehen werden darf, prüfen Sie es einmal von Hand.",
        },

        // ═══════════════════════════════════════════════════
        //  Felder verwalten
        // ═══════════════════════════════════════════════════
        managing: {
          title: "Felder verwalten",
          description:
            "Definitionen bearbeiten und stilllegen, der Dialog zum Änderungsverlauf, der Nutzungs- und Auswirkungsbericht, das Löschen ohne Datenverlust, der Tabellenexport mit 18 Spalten, und die beiden schreibgeschützten Referenzbildschirme.",
          intro:
            "Sobald Felder existieren, ist der Bildschirm Benutzerdefinierte Felder die Stelle, an der sie gepflegt werden: bearbeitet, stillgelegt, geprüft, gemessen und exportiert. Diese Seite behandelt jedes davon, sowie die beiden schreibgeschützten Referenzbildschirme, die \"welche Typen existieren\" und \"welche Datensatztypen kann ich anhängen\" beantworten.",

          rowMenuTitle: "Das Zeilenmenü",
          rowMenuIntro:
            "Jedes Feld in der Liste hat ein Zeilenmenü mit acht Aktionen. Jede braucht ihre eigene Berechtigung, sodass eine Rolle manche sehen kann und andere nicht.",
          thAction: "Aktion",
          thDoes: "Was sie tut",
          thNeeds: "Berechtigung",
          actEdit: "Öffnet das Definitionsformular, befüllt mit dem vollständigen Detail des Felds.",
          actOptionSets:
            "Hängt ein gemeinsam genutztes, versioniertes Option Set für Select- oder MultiSelect-Felder an, konfiguriert es oder trennt es ab.",
          actVisibilityRules:
            "Öffnet den Dialog für bedingte Sichtbarkeitsregeln, um Anzeige- oder Verbergungsregeln zu konfigurieren, ausgewertet gegen Geschwisterfelder.",
          actConvertType:
            "Öffnet einen Dialog zur Umwandlung des Werttyps des Felds: Wählen Sie ein Ziel aus den Typen, in die es sich gefahrlos umwandeln lässt, bestätigen Sie im Fall einer verlustbehafteten Umwandlung, und machen Sie den Vorgang bei Bedarf anschließend per Rollback rückgängig.",
          actVersions:
            "Öffnet die Schublade für den Versionsverlauf: Lesen Sie die Kette der Versionen, erzeugen Sie einen neuen Entwurf, oder veröffentlichen oder verwerfen Sie einen bereits erzeugten.",
          actHistory:
            "Listet jede erfasste Änderung an der Definition des Felds, neueste zuerst, mit Wer und Wann.",
          actUsage:
            "Berichtet, wie viele Antworten das Feld enthält, aufgeschlüsselt nach Datensatztyp, und ob ein Löschen Daten zerstören würde.",
          actDelete:
            "Löscht die Definition — zunächst zurückgewiesen, falls sie Antworten enthält, bis Sie ausdrücklich bestätigen.",

          editTitle: "Eine Definition bearbeiten",
          editIntro:
            "Das Bearbeiten öffnet dasselbe Formular wie das Erstellen, wobei die dauerhaften Einstellungen gezeigt, aber nicht bearbeitbar sind: Datensatztyp, Schlüssel, Werttyp und Geltungsbereich. Alles andere lässt sich ändern, und die Änderungen wirken sich auf das nächste Formular aus, das jemand öffnet.",
          editLoadFailure:
            "Scheitert das Laden des Details hinter der Schaltfläche Edit, öffnet sich das Formular bewusst nicht, und Sie erhalten stattdessen eine Meldung. Das ist eine Schutzmaßnahme, keine Unannehmlichkeit: Die Listenzeile trägt weder die Optionen noch die Platzhalter noch den Validator, sodass das Öffnen eines damit befüllten Formulars und das Speichern alle drei still auslöschen würde.",
          editWarnTitle: "Zwei Bearbeitungen greifen rückwirkend",
          editWarnContent:
            "Eine Option umzubenennen ändert, was jeder bestehende Datensatz anzeigt, weil der Optionstext die gespeicherte Antwort ist. Das Anhängen oder Ändern eines Validators prüft bereits gespeicherte Antworten nicht erneut, ein Feld kann also Werte enthalten, die sein eigener aktueller Validator zurückweisen würde. Beides wird ausführlich auf den Seiten Optionen und Validatoren behandelt.",

          // Visibility Rules
          visibilityRulesTitle: "Verwaltung von Sichtbarkeitsregeln",
          visibilityRulesIntro:
            "Sichtbarkeitsregeln erlauben es, Felder auf Datensatzformularen dynamisch anzuzeigen oder zu verbergen, abhängig von den Werten von Geschwisterfeldern desselben Datensatztyps. Ist eine Regel aktiv, werten sowohl clientseitige Formulare als auch die serverseitige Validierung die Bedingungen deterministisch aus.",
          thOperator: "Operator",
          thOperatorMeaning: "Ausgewertete Bedingung",
          thOperatorExample: "Beispielauslöser",
          opEquals: "Equals",
          opEqualsMeaning: "Der Wert des steuernden Felds stimmt exakt mit dem Zielwert überein.",
          opEqualsExample: "Zeige Kit Size, wenn Staff Role gleich Coach ist.",
          opNotEquals: "Does not equal",
          opNotEqualsMeaning: "Das steuernde Feld hat einen beliebigen anderen Wert als den Zielwert.",
          opNotEqualsExample: "Zeige Dietary Requirements, wenn Meal Plan ungleich None ist.",
          opIsEmpty: "Is empty",
          opIsEmptyMeaning: "Das steuernde Feld enthält keine gespeicherte Antwort oder null.",
          opIsEmptyExample: "Zeige Explanation, wenn ID Number leer ist.",
          opIsNotEmpty: "Is not empty",
          opIsNotEmptyMeaning: "Das steuernde Feld hat einen beliebigen nicht-null, nicht-leeren Wert.",
          opIsNotEmptyExample: "Zeige Expiry Date, wenn Passport Number nicht leer ist.",
          opIn: "In set",
          opInMeaning: "Die Antwort des steuernden Felds ist einer von mehreren durch Komma getrennten Werten.",
          opInExample: "Zeige Specialization, wenn Department in Medical, Coaching, Analytics ist.",
          opNotIn: "Not in set",
          opNotInMeaning: "Die Antwort des steuernden Felds ist keiner der aufgeführten Werte.",
          opNotInExample: "Zeige General Notes, wenn Category nicht in VIP, Board ist.",
          opGreaterThan: "Greater than",
          opGreaterThanMeaning: "Die numerische oder Datumsantwort übersteigt den Schwellenwert echt.",
          opGreaterThanExample: "Zeige Clearance Details, wenn Security Level größer als 3 ist.",
          opLessThan: "Less than",
          opLessThanMeaning: "Die numerische oder Datumsantwort liegt echt unter dem Schwellenwert.",
          opLessThanExample: "Zeige Parental Consent, wenn Age kleiner als 18 ist.",
          visibilityRulesEvaluation:
            "Ein Feld mit mehreren Regeln ist nur sichtbar, wenn jede einzelne davon erfüllt ist — ein einfaches UND über alle hinweg, kein Wettstreit zwischen konkurrierenden Show- und Hide-Aktionen, denn eine Regel drückt immer nur eine Bedingung aus, unter der das Feld sichtbar ist. Priority ordnet die Regeln nur für Diagnose und Anzeige; sie ändert nie, welche Regeln gelten. Ein Feld, das eine Regel gerade verbirgt, wird auch von der Required-Validierung ausgelassen, sodass eine Bedingung, die niemand sehen kann, nie einen Speichervorgang blockiert.",
          visibilityRulesTipTitle: "Bedingungen nur über Geschwisterfelder",
          visibilityRulesTipContent:
            "Eine Regel kann sich nur auf Geschwisterfelder beziehen, die für exakt denselben Entitätstyp definiert sind. Entitätsübergreifende Bedingungen (zum Beispiel die Einstellung eines Mandanten aus einem Personenfeld heraus zu prüfen) sind nicht zulässig, um die transaktionale Integrität eines einzelnen Datensatzes zu bewahren.",

          // Conversion
          conversionTitle: "Werttyp-Umwandlung und Rollback",
          conversionIntro:
            "Die Umwandlung des deklarierten Werttyps eines Felds ist ein eigenständiger Vorgang, erreichbar über eine eigene Aktion im Zeilenmenü statt über das Bearbeitungsformular — sie ändert, wie bereits gespeicherte Antworten repräsentiert werden, nicht nur, wie künftige aussehen werden. Nur neun bestimmte Typenpaare sind zulässig; jedes andere Paar wird rundweg zurückgewiesen, einschließlich jedes Paars, das einen Referenztyp, File, Image oder RichText berührt.",
          thConversionClass: "Sicherheitsklasse",
          thConversionPairs: "Unterstützte Typenpaare",
          thConversionRisk: "Garantie zum Erhalt der Daten",
          classLossless: "Verlustfrei",
          classLosslessPairs:
            "Text → LongText, Number → Text, Number → LongText, Percent → Text, Rating → Text, Percent → Number, Rating → Number",
          classLosslessRisk:
            "Jeder bestehende Wert lässt sich direkt und ohne Verlust in den Zieltyp umwandeln — etwa eine als Text formatierte Zahl oder ein Prozentwert bzw. eine Bewertung, die als einfache Zahl neu gelesen wird.",
          classLossy: "Verlustbehaftet (Bestätigung erforderlich)",
          classLossyPairs: "LongText → Text, Text → Number",
          classLossyRisk:
            "Keines der beiden Paare kürzt. LongText → Text weist den gesamten Vorgang zurück, sobald auch nur ein gespeicherter Wert die eigene 4.000-Zeichen-Grenze von Text überschreitet, unter Nennung seiner tatsächlichen Länge. Text → Number weist den gesamten Vorgang zurück, sobald auch nur ein gespeicherter Wert sich nicht als Zahl parsen lässt. So oder so blockiert eine einzige fehlerhafte Zeile alle Zeilen — es gibt keine teilweise Umwandlung, die manche Datensätze ändert und andere lässt, wie sie waren.",
          classIncompatible: "Nicht angeboten",
          classIncompatiblePairs:
            "Jedes andere Paar — 453 der 462 möglichen, einschließlich jedes Paars, das EntityReference, UserReference, File, Image oder RichText berührt.",
          classIncompatibleRisk:
            "Wird zurückgewiesen, bevor überhaupt etwas ausgeführt wird. Ein referenzförmiger oder medienförmiger Wert hat keine sinnvolle Text- oder Zahlenform, in die er umgewandelt werden könnte, und in umgekehrter Richtung gibt es nichts Reales, worauf verwiesen werden könnte.",
          conversionLossyWarnTitle:
            "Eine verlustbehaftete Umwandlung wirkt sich dauerhaft auf jeden gespeicherten Wert aus",
          conversionLossyWarnContent:
            "Ein erfolgreicher Lauf ändert alle Zeilen auf einmal — es gibt keine gesonderte Bestätigung pro Datensatz, und nichts wird still gekürzt oder gelöscht, außer dem, was die eigene Umwandlung des Zieltyps ohnehin tut. Führen Sie vor dem Bestätigen immer zuerst Usage & impact aus, um zu sehen, wie viele Datensätze betroffen sein werden.",
          conversionDryRunIntro:
            "Bevor irgendetwas geändert wird, prüft der Server jeden gespeicherten Wert gegen den Zieltyp in einem ersten Durchgang, der nichts schreibt. Würde auch nur ein einziger Wert bei der Umwandlung scheitern, wird der gesamte Vorgang von vornherein zurückgewiesen, unter Nennung jeder fehlschlagenden Zeile, und nichts wird geändert — es ist alles oder nichts, nie eine teilweise Umwandlung, die manche Zeilen alt und manche neu zurücklässt.",
          conversionRollbackTitle: "Rollback per Schnappschuss",
          conversionRollbackContent:
            "Jede Umwandlung schreibt für jede Zeile einen Schnappschuss des vorherigen Werts, bevor dieser geändert wird. Ein Super Admin kann für einen bestimmten Umwandlungslauf anhand seiner Job-Run-ID ein Rollback durchführen und so die exakten vorherigen Werte wiederherstellen — Schnappschüsse laufen nach sieben Tagen automatisch ab und werden dann gelöscht, ein Rollback steht also nur in einem echten Zeitfenster zur Verfügung und nicht unbegrenzt.",

          // Versions & Drafts
          versionsTitle: "Lebenszyklus von Felddefinitions-Versionen und -Entwürfen",
          versionsIntro:
            "Die aktiven Skalarwerte, Optionen und Sichtbarkeitsregeln einer Definition lassen sich in einen isolierten Entwurf klonen und anschließend entweder veröffentlichen — wodurch die aktive Version in einem einzigen Schritt ersetzt wird — oder verwerfen, wobei die aktive Version unangetastet bleibt, so oder so.",
          thVersionStatus: "Status",
          thVersionMeaning: "Bedeutung im Lebenszyklus",
          thVersionActions: "Verfügbare Aktionen",
          vStatusDraft: "Draft",
          vMeaningDraft:
            "Ein isolierter Klon der Definition, wie sie in dem Moment stand, in dem er erzeugt wurde — mit einer eigenen Kopie der Skalarwerte, Optionen und Sichtbarkeitsregeln. Wird auf keinem Datensatzformular ausgeliefert.",
          vActionsDraft:
            "Publish, Discard. Aktuell lässt sich an einem Entwurf nach dem Erzeugen nichts mehr bearbeiten — ein fehlerhafter Klon muss verworfen und neu erzeugt werden.",
          vStatusPublished: "Published",
          vMeaningPublished:
            "Die eine aktive Version, die derzeit auf jedem Datensatzformular für dieses Feld ausgeliefert wird.",
          vActionsPublished: "Create Draft (erzeugt einen neuen Arbeitsklon), View History.",
          vStatusDeprecated: "Deprecated",
          vMeaningDeprecated:
            "Eine frühere Published-Version, ersetzt, als ein Entwurf befördert wurde. Ihre geklonten Optionen und Regeln bleiben an ihr hängen, sind jedoch wirkungslos — die Durchsetzung liest ausschließlich die aktuelle Published-Version.",
          vActionsDeprecated: "Schreibgeschützter Prüfeintrag. Aufbewahrt für die historische Integrität.",
          vStatusArchived: "Archived",
          vMeaningArchived:
            "Ein verworfener Entwurf, der aufbewahrt statt gelöscht wird, damit seine Versionsnummer niemals erneut vergeben werden kann.",
          vActionsArchived: "Nur historische Referenz.",
          versionsSnapshotWarnTitle: "Ein Entwurf ist eine Momentaufnahme, kein Live-Spiegel",
          versionsSnapshotWarnContent:
            "Ein Entwurf verfolgt keine Änderungen an der Live-Version, während er geöffnet bleibt — er enthält nur den Stand der Live-Version zum Zeitpunkt seiner Erstellung. Die Veröffentlichung führt die beiden nicht zusammen: Sie ersetzt die Live-Version vollständig durch die Momentaufnahme des Entwurfs und verwirft dabei stillschweigend alle in der Zwischenzeit vorgenommenen Live-Änderungen. Veröffentlichen Sie einen Entwurf zeitnah, oder erstellen Sie ihn neu, wenn sich die Live-Version inzwischen weiterentwickelt hat.",
          versionsPromotionIntro:
            "Das Veröffentlichen eines Entwurfs setzt die amtierende Published-Version im selben Speichervorgang auf Deprecated. Die Versionsnummer wird dabei immer erhöht, und jedes Laden eines Formulars liefert ab diesem Zeitpunkt die neue Published-Version aus.",
          versionsRuleGuardTitle:
            "Eine Veröffentlichung, die stillschweigend jede Sichtbarkeitsregel verlieren würde, wird zurückgewiesen",
          versionsRuleGuardContent:
            "Sichtbarkeitsregeln werden in dem Moment, in dem ein Entwurf erzeugt wird, auf ihn geklont, nicht erst zum Zeitpunkt der Veröffentlichung neu abgerufen — zum Zeitpunkt der Veröffentlichung gibt es also im Normalfall nichts mehr zu verlieren. Der eine Fall, für den diese Absicherung existiert, ist der, dass die ausgehende Version tatsächlich Regeln trägt, während der Entwurf keine trägt: Die Veröffentlichung wird dann rundweg zurückgewiesen, statt stillschweigend jedes bedingt verborgene Feld dieses Datensatztyps bedingungslos sichtbar zu machen.",

          retireTitle: "Ein Feld stilllegen: deaktivieren oder löschen",
          retireIntro:
            "Das sind nicht dieselben Vorgänge, und der Unterschied zählt. Sind Sie unsicher, deaktivieren Sie — das ist der umkehrbare.",
          deactivateTitle: "Active ausschalten",
          deactivate1: "Das Feld wird nicht mehr auf Erstellungs- und Bearbeitungsformularen angeboten",
          deactivate2: "Jede bereits gespeicherte Antwort bleibt erhalten, unberührt",
          deactivate3: "Es ist umkehrbar — Active wieder einzuschalten stellt das Feld wieder her, wie es war",
          deactivate4: "Es wird im Verlauf als Deactivated erfasst und kann später Reactivated werden",
          deleteColTitle: "Die Definition löschen",
          deleteCol1: "Beim ersten Versuch zurückgewiesen, falls das Feld irgendwelche Antworten enthält",
          deleteCol2: "Zerstört diese Antworten, sobald das Aufbewahrungsfenster verstreicht, falls Sie bestätigen",
          deleteCol3: "Gibt den Schlüssel frei, sodass ein neues Feld ihn später wiederverwenden könnte — ohne eine der alten Antworten",
          deleteCol4: "Wird im Verlauf als Deleted erfasst und kann Restored werden, solange sie wiederherstellbar ist",

          historyTitle: "Definitionsverlauf",
          historyIntro:
            "Der Eintrag History im Zeilenmenü eines Felds öffnet einen Dialog, der auflistet, was mit der Definition dieses Felds geschehen ist, neueste zuerst, mit der Person, die es getan hat, und wann. Eine vom System statt von einer Person vorgenommene Änderung wird dem System zugeschrieben. Einträge werden paginiert, und der Dialog sagt, wie viele Änderungen es insgesamt gibt.",
          thEvent: "Ereignis",
          thMeans: "Was es bedeutet",
          evCreated: "Das Feld wurde definiert.",
          evUpdated: "Etwas an der Definition hat sich geändert — eine Bezeichnung, ein Kennzeichen, der Validator, die Optionen.",
          evDeactivated: "Active wurde ausgeschaltet, wodurch das Feld stillgelegt wird, ohne seine Antworten anzufassen.",
          evReactivated: "Active wurde wieder eingeschaltet.",
          evDeleted: "Die Definition wurde gelöscht und ist noch wiederherstellbar.",
          evRestored: "Eine gelöschte Definition wurde zurückgeholt.",
          evPurged:
            "Die Definition wurde dauerhaft entfernt und ist nicht mehr wiederherstellbar. Der Dialog markiert diesen Eintrag ausdrücklich, damit er nicht als gewöhnliches Löschen gelesen werden kann.",
          historyParts:
            "Jeder Eintrag sagt auch, welchen Teil des Felds er betrifft, denn ein Feld ist mehr als eine einzelne Zeile.",
          thPart: "Teil",
          partField: "Das Feld selbst.",
          partDefinition: "Der dahinterliegende Definitionsdatensatz.",
          partVersion: "Eine Version der Definition.",
          partOption: "Ein Eintrag in der Optionsliste des Felds.",
          partVisibilityRule:
            "Eine bedingte Anzeige- oder Verbergungsregel, angehängt an das Feld, verwaltet über den Dialog Visibility Rules.",
          historyScopeTitle: "Der Verlauf deckt die Definition ab, nie die Antworten",
          historyScopeContent:
            "Dieser Dialog wird Ihnen nicht sagen, wer die Nationalität einer bestimmten Person geändert hat, und das ist auch nicht seine Absicht. Wertänderungen hier aufzulisten würde ihn in eine lesbare Kopie der Felddaten aller verwandeln, unter Umgehung der Sicherheit auf Feldebene und jeder anderen Sichtbarkeitsregel zugleich. Nur Änderungen auf der Definitionsseite sind zulässig, und die wertetragenden Datensätze sind namentlich ausgeschlossen statt durch Auslassung.",
          historyUnavailableTitle: "Wenn der Verlauf sagt, das Modul sei nicht verfügbar",
          historyUnavailableContent:
            "Das ist eine Frage der Bereitstellungsform, kein Fehler beim Feld: Der Prüfspeicher liegt in einem anderen Modul, und diese Bereitstellung läuft ohne es. Für diesen Zeitraum wurde auch kein Verlauf erfasst. Das ist eine Sache für die Person, die die Bereitstellung verwaltet, nichts, das Sie vom Bildschirm aus beheben können. Der Verlauf eines globalen Plattformfelds ist gesondert auf Plattformadministratoren beschränkt und zeigt eine andere Meldung.",

          usageTitle: "Nutzung und Auswirkung",
          usageIntro:
            "Der Eintrag Usage & impact im Zeilenmenü berichtet, was das Feld tatsächlich trägt, bevor Sie es ändern oder entfernen. Lesen Sie den ganzen Dialog statt einer einzelnen Zahl.",
          thReading: "Was er zeigt",
          readStoredValues: "Gespeicherte Werte",
          readStoredValuesMeans: "Wie viele Antworten für dieses Feld existieren.",
          readLegacyValues: "Werte im Legacy-Speicher",
          readLegacyValuesMeans:
            "Antworten, die noch im älteren Speicher von vor dem aktuellen Werte-Speicher gehalten werden. Gesondert gezählt, damit eine laufende Migration sichtbar ist statt verborgen.",
          readOptions: "Optionen",
          readOptionsMeans: "Wie viele Optionen die Liste des Felds enthält, bei einem Select- oder MultiSelect-Feld.",
          readByRecordType: "Nach Datensatztyp",
          readByRecordTypeMeans:
            "Dieselbe Anzahl von Antworten, aufgeschlüsselt nach der Art des Datensatzes, der sie hält, sodass Sie sehen können, wo sich die Daten tatsächlich befinden.",
          readAffectedOrgs: "Organisationen mit Werten",
          readAffectedOrgsMeans:
            "Bei einem globalen Plattformfeld, wie viele Arbeitsbereiche Antworten dafür halten. Das ist die Zahl, die ein Löschen wirklich folgenreich macht.",
          readScopeNotice: "Der Geltungsbereich-Hinweis oben",
          readScopeNoticeMeans:
            "Sagt, ob die untenstehenden Zahlen nur Ihren Arbeitsbereich oder jeden Arbeitsbereich der Plattform abdecken. Die beiden unterscheiden sich bei einem geerbten Feld um Größenordnungen, und nichts an einer nackten Zahl sagt Ihnen, welche der beiden Sie gerade betrachten.",
          usageWarnTitle: "Lesen Sie die Warnung, nicht die Zahl",
          usageWarnContent:
            "Die Zeile \"this will destroy data\" stammt aus dem eigenen Urteil des Servers, nie aus der Zahl auf dem Bildschirm. Ein globales Plattformfeld wird über jeden Arbeitsbereich gemessen, der es geerbt hat, sodass es in Ihrem eigenen Arbeitsbereich null zeigen und Sie trotzdem zu Recht warnen kann. Die Warnung ist das, dem Sie vertrauen sollten.",

          deleteTitle: "Löschen, ohne Daten zu zerstören",
          deleteIntro:
            "Ein Feld zu löschen, das Antworten enthält, braucht zwei bewusste Schritte. Ein Feld ohne Antworten braucht einen.",
          d1Title: "Öffnen Sie zuerst Usage & impact",
          d1Content:
            "Sehen Sie, wie viele Antworten existieren und wo sie sind. Überrascht Sie die Zahl, halten Sie hier inne — das Feld zu deaktivieren ist fast immer der bessere Schritt.",
          d2Title: "Wählen Sie Delete",
          d2Content:
            "Enthält das Feld Antworten, wird das Löschen mit einem Konflikt zurückgewiesen, und der Dialog erklärt genau, was verloren ginge, unter Nennung der Zahl gespeicherter Werte und der Zahl der Datensatztypen.",
          d3Title: "Bestätigen Sie das zerstörerische Löschen",
          d3Content:
            "Die Bestätigung von innerhalb dieses Dialogs ist es, was den Vorgang tatsächlich fortsetzt. Das ist ein separater, ausdrücklicher Akt statt eines zweiten Klicks auf dieselbe Schaltfläche, sodass ein Feld mit Daten nicht aus Schwung entfernt werden kann.",
          d4Title: "Oder löschen Sie ein leeres Feld in einem Schritt",
          d4Content:
            "Ein Feld ohne Antworten löscht sich ohne Warnung und ohne zusätzlichen Schritt, weil es nichts zu verlieren gibt.",
          deleteRetention:
            "Ein bestätigtes Löschen zerstört die gespeicherten Antworten erst, sobald das Aufbewahrungsfenster verstreicht, nicht sofort. Bis dahin kann die Definition noch Restored werden, und der Verlauf erfasst sowohl das Löschen als auch die Wiederherstellung. Nach dem Fenster sind die Antworten weg, und der Verlaufseintrag liest sich als Purged.",

          exportTitle: "Definitionen in eine Tabelle exportieren",
          exportIntro:
            "Die Aktion Export im Seitenkopf der Seite Benutzerdefinierte Felder lädt eine Tabelle der Definitionen herunter, die Sie sehen können, eine Zeile pro Feld mit Kopfzeilen in der ersten Zeile. Dies sind die 18 Spalten.",
          thColumn: "Spalte",
          thContains: "Enthält",
          colEntityType: "Der Datensatztyp, gegen den das Feld definiert ist.",
          colKey: "Der maschinenlesbare Schlüssel des Felds.",
          colLabelEn: "Die englische Bezeichnung.",
          colLabelAr: "Die arabische Bezeichnung, leer, falls keine gesetzt wurde.",
          colValueType: "Einer der zweiundzwanzig Werttypen.",
          colRequired: "Ob das Feld erforderlich ist.",
          colActive: "Ob das Feld weiterhin in Formularen angeboten wird.",
          colSortOrder: "Die Position des Felds unter den benutzerdefinierten Feldern des Datensatztyps.",
          colOptionsEn: "Die englischen Optionen, bei einem Select- oder MultiSelect-Feld.",
          colOptionsAr: "Die arabischen Optionen, an die englischen angepasst.",
          colSensitivity: "Das auf der Definition gesetzte Klassifizierungs-Label.",
          colExportable:
            "Die Einstellung Include in exports, gemeldet als Yes oder No. Sie wird nie benutzt, um diese Datei zu filtern — ein Definitionsexport, der Zeilen ausließe, würde genau die Felder verbergen, die ein Administrator am ehesten prüfen muss.",
          colValidator: "Der angehängte Validator, bei einem Textfeld.",
          colValidatorParam: "Die Einstellung des Validators, wo er eine annimmt.",
          colPlaceholderEn: "Der englische Platzhalter-Hinweis.",
          colPlaceholderAr: "Der arabische Platzhalter-Hinweis.",
          colScope: "Platform bei einem globalen Feld, Organisation bei einem Arbeitsbereichsfeld.",
          colCreated: "Wann die Definition angelegt wurde, in UTC.",
          exportBooleans:
            "Ja/Nein-Spalten werden als die Wörter Yes und No geschrieben statt als Tabellenkalkulations-Booleans, sodass sie das Öffnen in einer anderen Sprache überstehen und weiterhin wie beabsichtigt zu lesen sind.",
          exportSafetyTitle: "Bezeichnungen, die wie Formeln aussehen, bleiben Text",
          exportSafetyContent:
            "Jede Zelle wird als regloser Text geschrieben, nie als Formel. Eine Bezeichnung mit dem Namen =SUM(A1) landet in der Datei als die buchstäblichen Zeichen, nicht als Berechnung — und dasselbe gilt für eine Bezeichnung, die mit +, -, @ oder einem Tabulator gefolgt von = beginnt. Das ist kategorisch statt ein Filter bekannter Fälle.",
          exportLimitTitle: "Drei Grenzen des Exports",
          exportLimitContent:
            "Er enthält Definitionen und nie die Antworten von irgendjemandem — ein separater Werteexport, mit eigenem Endpunkt und eigener Schaltfläche im Seitenkopf, ist die Stelle, an der die Antworten selbst leben (siehe Grenzwerte und Verhalten). Über 10.000 Definitionen hinaus weist er rundheraus zurück, mit dem Hinweis, den Export auf einen einzigen Datensatztyp einzugrenzen, statt Ihnen eine abgeschnittene Datei zu geben, die vollständig aussieht. Und die 18 Spalten oben sind die ganze Datei: Der festgelegte Target Entity Type eines Referenzfelds ist keine davon, sodass eine exportierte Definition nicht erfasst, worauf ihr Feld zeigt. Vor Ihnen eingeschränkte Felder fehlen in der Datei, statt leer zu sein.",

          referenceTitle: "Die beiden Referenzbildschirme",
          referenceIntro:
            "Beide sind über Links im Seitenkopf der Seite Benutzerdefinierte Felder erreichbar, beide sind schreibgeschützt, und beide sind hinter derselben Ansichtsberechtigung wie der Bildschirm Benutzerdefinierte Felder selbst gesperrt. Keiner hat einen eigenen Eintrag in der Seitenleiste, was beabsichtigt ist.",
          valueTypesScreenTitle: "Werttypen",
          valueTypesScreenIntro:
            "Eine Tabelle aller zweiundzwanzig Werttypen mit, für jeden, einer Beschreibung, wofür er gedacht ist, ob er einen Platzhalter annimmt, ob er eine eigene Optionsliste besitzt, und ob er einen Validator unterstützt. Nutzen Sie sie, um \"welche Typen existieren\" zu beantworten, ohne ein Definitionsformular zu öffnen. Text ist die einzige Zeile, die Validator-Unterstützung zeigt, und die vier referenzförmigen Typen zeigen keine eigene Optionsliste — was sie anbieten, stammt aus einem anderen Modul oder aus einer hochgeladenen Datei, nicht aus einer von Ihnen verfassten Liste.",
          entityTypesScreenTitle: "Entitätstypen",
          entityTypesScreenIntro:
            "Eine Liste jedes Datensatztyps, an den ein benutzerdefiniertes Feld angehängt werden kann: sein Anzeigename, sein Schlüssel, und das Modul, dem er gehört.",
          entityTypesScreenDrift:
            "Sie zeigt auch zwei getrennte Bildschirm-Spalten plus einen Status, was keine Dopplung ist. Die eine ist das, was die Plattform über diese Anwendung behauptet; die andere ist das, was diese Anwendung tatsächlich hat. Die Statusspalte sagt, ob die beiden übereinstimmen, und eine Zeile mit Out of Sync ist ein echter, meldenswerter Fehler — sie bedeutet entweder, dass ein Feld auf einen Datensatztyp zeigt, den niemand darstellen kann, oder auf einen Bildschirm, von dem die Plattform nichts weiß.",
          apiOnlyTitle: "Nur per API erreichbare Datensatztypen",
          apiOnlyContent:
            "Ein Datensatztyp ohne Bildschirm in dieser Anwendung ist trotzdem ein rechtmäßiges Ziel für ein benutzerdefiniertes Feld. Er wird auf dem Definitionsformular nach den bildschirmgestützten aufgeführt, mit einem Zusatz API only. Ein gegen einen davon definiertes Feld ist über die API erreichbar und hat in der Oberfläche nirgends, wo es dargestellt werden könnte — was in Ordnung ist, falls das beabsichtigt war, und ein Rätsel, falls nicht.",
        },

        // ═══════════════════════════════════════════════════
        //  Grenzwerte und Verhalten
        // ═══════════════════════════════════════════════════
        limits: {
          title: "Grenzwerte und Verhalten",
          description:
            "Jede feste Obergrenze und jede bewusste Einschränkung bei benutzerdefinierten Feldern, jeweils mit dem Grund, warum sie so ist — damit niemand einen Nachmittag mit der Suche nach einer Einstellung verbringt, die es nicht gibt.",
          intro:
            "Diese Seite versammelt jede Grenze, auf die ein Administrator für benutzerdefinierte Felder vernünftigerweise stoßen kann, und sagt, warum jede dort ist, wo sie ist. Alles hier beschreibt aktuelles Verhalten statt eines Versprechens über die Zukunft. Eine klar ausgesprochene Grenze ist billiger als eine um vier Uhr nachmittags entdeckte.",

          numbersTitle: "Die festen Zahlen",
          numbersIntro:
            "Das sind Konstanten im Produkt. Keine davon lässt sich für ein einzelnes Feld anheben oder senken, und nur die letzte variiert überhaupt.",
          thLimit: "Grenze",
          thValue: "Wert",
          thConfigurable: "Konfigurierbar?",
          limTextLength: "Länge eines Text-Felds, in Zeichen",
          limLongTextLength: "Länge eines LongText-Felds, in Zeichen",
          limMultiSelect: "MultiSelect-Auswahlen pro Wert",
          limRating: "Bewertungsskala, nur ganze Zahlen",
          limPercent: "Percent-Bereich, einschließlich",
          limPhoneDigits: "Telefonziffern, nach dem führenden +",
          limCurrencyCode: "Länge des Währungscodes, Großbuchstaben",
          limDuration: "Obergrenze von Duration",
          limReferencePage: "Datensätze pro Seite in einer Referenz-Auswahlkomponente",
          limReferencePageMax: "Größte Seite, die eine Referenz-Auswahlkomponente anfragen darf",
          limGroupReorder: "Feldgruppen pro Datensatztyp in einer Umsortierung",
          limExportRows: "Definitionen pro Tabellenexport",
          limFieldsPerWorkspace: "Benutzerdefinierte Felder pro Arbeitsbereich",
          cfgNo: "Nein",
          cfgPlan: "Von Ihrem Plan festgelegt",
          valNoUpperBound: "Keine",
          valPlanQuota: "Plan-Kontingent — null bei der Free-Edition",

          validatorsTitle: "Validator-Verhalten",
          thBehaviour: "Verhalten",
          thWhy: "Warum",
          vTextOnly: "Validatoren hängen sich nur an Textfelder an.",
          vTextOnlyWhy:
            "Das Sicherheitsargument für die eingebauten Muster wurde für einzeilige Texteingabe hergeleitet. Es auf eine anders geformte Eingabe auszudehnen bräuchte diese Analyse erneut, und das ist nichts, das man in ein Feature-Release hineinschmuggelt. Ein Textfeld mit einem Validator ist die Antwort, wenn Sie eine E-Mail-Adresse mit zusätzlichen Einschränkungen brauchen.",
          vNoRetro: "Einen Validator anzuhängen prüft nie bereits gespeicherte Antworten erneut.",
          vNoRetroWhy:
            "Die Validierung läuft an genau einer Stelle: dem Speicherpfad. Nichts durchläuft historische Daten, wenn ein Validator neu angehängt wird, sodass ein Feld rechtmäßig Werte enthalten kann, die sein eigener aktueller Validator zurückweisen würde, bis jemand sie erneut eingibt.",
          vWhitespace: "Ein Wert aus nichts als Leerzeichen überspringt die Validierung vollständig, außer das Feld ist Required.",
          vWhitespaceWhy:
            "Die Leere-Prüfung läuft vor jeder Typ- oder Validator-Prüfung. Bei einem optionalen Feld wird ein Wert aus nichts als Leerzeichen daher ohne jeden Validator-Fehler als gelöscht gespeichert. Markieren Sie das Feld als Required, falls eine leere Antwort zurückgewiesen werden soll.",
          vNoRegex: "Es gibt nirgends ein Muster- oder Regex-Feld.",
          vNoRegexWhy:
            "Ein von Hand geschriebenes Muster lässt sich so gestalten, dass es enorm viel Rechenzeit für eine kurze Eingabe verbraucht, was ein Dateneingabeformular in einen Weg verwandelt, das System lahmzulegen. Die 13 kuratierten Prüfungen existieren genau deshalb, damit niemand eines verfassen muss.",
          vNoFilter: "Die Definitionsliste lässt sich nicht nach Validator filtern oder durchsuchen.",
          vNoFilterWhy:
            "Eine solche Ansicht wurde nicht gebaut. Um zu sehen, welchen Validator ein Feld nutzt, öffnen Sie das Definitionsformular dieses Felds.",
          vNoReference: "Es gibt keine durchsuchbare Validator-Referenz im Produkt selbst.",
          vNoReferenceWhy:
            "Werttypen und Datensatztypen erhielten je einen schreibgeschützten Referenzbildschirm; Validatoren nicht. Das Dropdown auf dem Definitionsformular eines Textfelds ist die einzige produktinterne Liste.",
          vNoChecksumEgUae: "Die Prüfungen für ägyptische und emiratische Ausweise verifizieren die Struktur, aber keine Prüfziffer.",
          vNoChecksumEgUaeWhy:
            "Keines der beiden Länder veröffentlicht einen Prüfziffer-Algorithmus, und die während der Recherche gefundenen Vermutungen der Community widersprachen einander. Ein falscher Algorithmus würde echte, gültige Ausweisnummern zurückweisen, was schlimmer ist, als die letzte Ziffer gar nicht zu prüfen.",
          vNoAe: "Postal Code unterstützt die Vereinigten Arabischen Emirate nicht.",
          vNoAeWhy:
            "Die VAE haben kein nationales Postleitzahlensystem, es gibt also nichts, wogegen geprüft werden könnte. Der Versuch wird mit einer eigenen erklärenden Meldung zurückgewiesen statt mit einer allgemeinen.",

          typesTitle: "Werttyp-Verhalten",
          tValueTypeFixed: "Der Schlüssel, der Datensatztyp und der Geltungsbereich lassen sich nie mehr ändern, sobald ein Feld gespeichert ist.",
          tValueTypeFixedWhy:
            "Ein nachträgliches Umbenennen, Neuausrichten oder Ändern des Geltungsbereichs würde jede bereits gespeicherte Antwort darüber im Unklaren lassen, was sie bedeutet. Der Werttyp ist die eine Ausnahme mit einem schmalen Hintertürchen: Neun bestimmte Typenpaare lassen sich nachträglich umwandeln — siehe die Seite Felder verwalten —, bei allem anderen bedeutet es weiterhin Löschen und Neuanlegen.",
          tMultiOrder: "Eine MultiSelect-Antwort liest sich in Auswahlreihenfolge zurück, nicht in Optionsreihenfolge.",
          tMultiOrderWhy:
            "Die Reihenfolge zu bewahren, in der jemand gewählt hat, ist es, was den Wert originalgetreu hin- und zurückreisen lässt. Der Preis dafür ist, dass eine Listenspalte, die diese Antwort zeigt, nicht garantiert der Reihenfolge folgt, in der Sie die Optionen verfasst haben.",
          tLongTextNoBlock: "LongText lässt Sie über seine 10.000-Zeichen-Grenze hinaus tippen.",
          tLongTextNoBlockWhy:
            "Der Zähler auf dem Bildschirm wird rot, aber es gibt keine Sperre vor dem Absenden, wie MultiSelect eine zwanzigste Auswahl sperrt. Die Zurückweisung kommt vom Speichervorgang.",
          tCurrencyShape: "Ein Currency-Code wird nur auf seine Form geprüft.",
          tCurrencyShapeWhy:
            "Es gibt im Produkt keine maßgebliche Liste echter Währungscodes, gegen die geprüft werden könnte, und ein Arbeitsbereich könnte rechtmäßig jeden der ungefähr 180 echten brauchen. Drei Großbuchstaben sind daher die ganze Prüfung, und ein wohlgeformter, aber nicht existierender Code wie ZZZ wird angenommen.",
          tCurrencyPlain: "Currency speichert einen einfachen Betrag, nie kleinste Einheiten.",
          tCurrencyPlainWhy:
            "Das folgt derselben Konvention wie jeder andere Geldbetrag im Produkt. 100.50 wird als 100.50 gespeichert, nie als 10050 — was zählt, falls Sie je die Rohdaten lesen oder einen Bericht darauf bauen.",
          tDurationMinutes: "Die Einheit von Duration ist immer Minuten, und es gibt kein Maximum.",
          tDurationMinutesWhy:
            "Minuten sind die Konvention, die die Planungs- und Buchungsteile des Produkts bereits für zeitdauerförmige Daten verwenden, und das Formular beschriftet die Einheit sichtbar statt eine nackte Zahl zu lassen. Nur negative Werte werden zurückgewiesen; es gibt keine Obergrenze und keinen Weg pro Feld, eine zu setzen.",
          tRatingSlider: "Ein unberührtes Rating-Feld zeigt seinen Schieberegler bei 1, während es leer bleibt.",
          tRatingSliderWhy:
            "Ein Schieberegler braucht immer eine echte Zahl, um seinen Griff zu positionieren. Nichts wird übermittelt, bevor jemand ihn tatsächlich bewegt, das Feld speichert also tatsächlich als leer — sieht aber wie eine 1 aus, bis man das weiß.",
          tRatingZero: "Eine Rating von 0 wird zurückgewiesen statt als unbewertet behandelt.",
          tRatingZeroWhy:
            "Unbewertet bedeutet, dass das Feld wirklich leer gelassen wurde. Eine ausdrücklich übermittelte 0 ist ein echter Wert, der die Prüfung von 1 bis 5 ebenso wenig besteht wie eine 6, und erhält dieselbe Meldung.",
          tPhoneShape: "Phone validiert die Form, nicht, ob die Nummer existieren könnte.",
          tPhoneShapeWhy:
            "Der Server prüft nur die internationale Grammatik. Die eigene Auswahlkomponente des Formulars prüft die Ziffern zusätzlich gegen den echten Nummernplan des gewählten Landes, sodass die Lücke nur über eine Anfrage erreichbar ist, die das Formular umgeht — eine akzeptierte Einschränkung der Datenqualität, keine der Sicherheit.",
          tPhoneFlag: "Die angezeigte Länderflagge von Phone kann bei einer gemeinsam genutzten Vorwahl falsch sein.",
          tPhoneFlagWhy:
            "Manche Vorwahlen werden von mehreren Ländern gemeinsam genutzt, und es gibt keine gesonderte Länderspalte — die Flagge wird aus der Nummer selbst abgeleitet. Die gespeicherte Nummer ist unberührt; nur die Flagge daneben kann innerhalb eines gemeinsam genutzten Codes das falsche Land wählen.",
          tColorShorthand: "Color vereinheitlicht nie die drei- und sechsstelligen Formen.",
          tColorShorthandWhy:
            "Beide sind gültig und bleiben genau so erhalten, wie übermittelt, sodass dieselbe Farbe über verschiedene Datensätze hinweg auf zwei Arten gespeichert sein kann. Nur die Groß-/Kleinschreibung wird normalisiert, immer auf Kleinbuchstaben.",
          tTimeText: "Time wird als kanonischer Text gespeichert statt als Datenbank-Zeit.",
          tTimeTextWhy:
            "Eine bewusste Speicherentscheidung, getroffen, um ein bekanntes Sortierproblem zu vermeiden, das eine bestehende Zeit-Spalte anderswo im Produkt bei einer Datenbank hat. Nicht aufgefüllte Eingaben werden angenommen und normalisiert, sodass zwei Schreibweisen derselben Uhrzeit immer zusammenlaufen.",
          tPercentStorage: "Percent speichert die Zahl, die Sie laut aussprechen würden, keinen Bruch.",
          tPercentStorageWhy:
            "25 wird als 25 gespeichert und als 25% angezeigt. Nie als 0.25, und die Anzeige hängt das Zeichen an, statt einen bruchbasierten Formatierer laufen zu lassen, gerade damit eine 25 nie als 2500% erscheinen kann.",
          tTextNotTrimmed: "Text entfernt keine umgebenden Leerzeichen; Select schon.",
          tTextNotTrimmedWhy:
            "Ein Text-Wert wird exakt so gespeichert, wie übermittelt, weil ein führendes oder folgendes Leerzeichen in Freitext bedeutungsvoll sein kann. Ein Select-Wert wird auf beiden Seiten getrimmt, bevor er mit den Optionen abgeglichen wird, sodass ein verirrtes Leerzeichen nie eine unbegründete Zurückweisung verursacht.",
          tOracleBytes: "Langer arabischer Text kann unterhalb der genannten Zeichenobergrenze bei einer Datenbank zurückgewiesen werden.",
          tOracleBytesWhy:
            "Die 4.000-Zeichen-Grenze von Text ist bei zwei der drei unterstützten Datenbanken eine exakte Zeichenanzahl. Bei der dritten wird sie in Bytes gezählt, sodass mehrbyteiger Text — Arabisch eingeschlossen — die Grenze früher erreichen kann. Verwenden Sie LongText, wenn Sie nahe an der Grenze sind.",

          referencesTitle: "Referenz-Verhalten",
          fNoStoredName: "Eine Referenz speichert nie den Namen des Datensatzes, auf den sie zeigt.",
          fNoStoredNameWhy:
            "Ein gespeicherter Name würde innerhalb des Datensatzes mit dem Feld liegen und wäre daher für jeden lesbar, der diesen Datensatz lesen kann — während der Name selbst von der eigenen Berechtigung des Ziels geschützt wird. Es gibt keine Einstellung, um das einzuschalten, und es wird auch keine geben. Der ausgleichende Vorteil ist, dass ein auf seinem eigenen Datensatz korrigierter Name sofort überall korrigiert ist, wo er referenziert wird.",
          fIdOpaque: "Die Identität des referenzierten Datensatzes ist undurchsichtig und muss unverändert hin- und zurückreisen.",
          fIdOpaqueWhy:
            "Es ist der Schlüssel eines anderen Moduls, für die Übertragung verschlüsselt, und nichts daran ist zum Lesen oder Umformen gedacht. Ein verändertes Zeichen, und das Produkt meldet den gespeicherten Verweis zu Recht als fehlerhaft. Senden Sie exakt die Zeichenkette zurück, die Sie empfangen haben.",
          fSameNames: "Eine Referenz wird unter denselben zwei Namen geschrieben, unter denen sie gelesen wird.",
          fSameNamesWhy:
            "Es gibt keine Asymmetrie zwischen der Leseform und der Schreibform. Wer gegen die Values-API integriert, sollte die beiden Eigenschaftsnamen widerspiegeln, die er erhalten hat; für die Identität auf dem Hinweg einen anderen Namen zu erfinden erzeugt einen Speichervorgang, der überhaupt keinen Verweis mit sich führt, der dann als unvollständige Referenz zurückgewiesen wird.",
          fFiveFailures: "Eine Referenz, die sich nicht anzeigen lässt, sagt, welches von fünf Dingen geschehen ist.",
          fFiveFailuresWhy:
            "Keine Berechtigung, der Datensatz ist weg, ein fehlerhafter Wert, ein Lookup, der gerade eben gescheitert ist, und eine Art von Datensatz, für die diese Installation nicht zuständig sein kann, sind fünf verschiedene Probleme mit fünf verschiedenen Abhilfen. Sie alle als ein leeres Feld darzustellen ist es, was einen Verweis auf einen gelöschten Datensatz ein Jahr lang unbemerkt lässt.",
          fMergedAnswers: "\"Gelöscht\" und \"in einem Arbeitsbereich, den Sie nicht sehen können\" sind eine Antwort.",
          fMergedAnswersWhy:
            "Sie zu unterscheiden würde jemandem erlauben, Identitäten einzeln durchzuprobieren, um herauszufinden, was in einem anderen Arbeitsbereich existiert. \"Sie dürfen diese Art von Datensatz nicht ansehen\" wird von beiden unterschieden, weil es den eigenen Zugriff des Lesers beschreibt und nichts preisgibt.",
          fDeleteClears: "Das Löschen eines referenzierten Datensatzes leert jeden Verweis darauf und behält jede Wertzeile.",
          fDeleteClearsWhy:
            "Beide Teile jeder betroffenen Antwort werden zusammen geleert, nie eines ohne das andere. Nichts wird gelöscht: Die Antwort behält ihre Zeile, ihre Version und ihren Prüfpfad, sodass sich das Feld anschließend wirklich als leer liest statt als defekt.",
          fNoBacklinks: "Nichts listet die Referenzen auf, die auf einen gegebenen Datensatz zeigen.",
          fNoBacklinksWhy:
            "Es gibt nirgends eine Ansicht \"was zeigt hierauf?\", und einen Datensatz zu löschen warnt Sie nicht, wie viele Verweise dabei gleich geleert werden. Das Leeren geschieht still, weil es sicher ist, nicht weil es verborgen ist.",
          fLimitedTargets: "Derzeit können nur drei Arten von Datensatz referenziert werden.",
          fLimitedTargetsWhy:
            "Mitglieder des Personals, Benutzerkonten und Personen (Party Person) — die Arten, deren besitzendes Modul eine durchsuchbare, berechtigungsgeprüfte Liste bereitstellt. Alles andere wird zurückgewiesen statt mit einer leeren Liste beantwortet, weil eine leere Liste wie ein korrektes Ergebnis aussieht und \"es gibt keine davon\" sagen würde, wenn die Wahrheit \"das lässt sich nicht fragen\" ist.",
          fNoAdminTarget: "Administrator-Datensätze können überhaupt nicht referenziert werden.",
          fNoAdminTargetWhy:
            "Ein Administrator kann zu keinem Arbeitsbereich gehören — ein Plattformadministrator hat keinen —, sodass ein Verweis auf einen davon jede Arbeitsbereichsgrenze im Produkt überschreiten könnte. Ein User-Reference-Feld weist einen rundheraus zurück, und das Definitionsformular bietet nie einen an.",
          fUnpinnedIsLegal: "Ein Referenzfeld nicht festzulegen ist ein dauerhafter, unterstützter Zustand.",
          fUnpinnedIsLegalWhy:
            "Es bedeutet \"jede Art, die diese Person referenzieren darf\", und jede Antwort erfasst, welche Art sie gewählt hat. Es darf nie als \"nichts konfiguriert, also nichts gültig\" gelesen werden — das Datensatzformular behandelt es, indem es zuerst nach der Art von Datensatz fragt und danach nach dem Datensatz.",
          fPopulatedUnpinned: "Ein ausgefülltes, nicht festgelegtes Feld bietet keinen Weg, die Art des Datensatzes zu ändern.",
          fPopulatedUnpinnedWhy:
            "Die eigene Art der gespeicherten Antwort wird für die Auswahlkomponente verwendet, ein erneutes Wählen ist also auf diese Art beschränkt. Das Leeren des Felds bringt das Typ-Element zurück. Eine echte Grenze und kein Fehler, und die Ausprägung dieser Funktion, die am ehesten als einer gemeldet wird.",
          fNotExported: "Ein festgelegter Zieltyp steht nicht im Definitionsexport.",
          fNotExportedWhy:
            "Die Tabelle hat 18 Spalten, und keine davon ist der Zieltyp, sodass eine exportierte Definition nicht erfasst, worauf ihr Feld zeigt.",
          fSingleValue: "Ein Referenzfeld enthält genau einen Verweis.",
          fSingleValueWhy:
            "Es gibt keinen mehrwertigen Referenztyp. Zwei Antworten bedeuten zwei Felder, und MultiSelect kann nicht auf Datensätze verweisen — seine Antworten sind von Ihnen verfasster Text.",

          optionsTitle: "Options-Verhalten",
          oTextIsValue: "Der englische Optionstext ist die gespeicherte Antwort.",
          oTextIsValueWhy:
            "Es gibt keinen separaten Code hinter einer Option, sodass das Umbenennen einer Option ändert, was jeder bestehende Datensatz anzeigt. Bevorzugen Sie es, eine neue Option hinzuzufügen und die alte auslaufen zu lassen, wenn die Unterscheidung wichtig ist.",
          oCaseSensitive: "Der Options-Abgleich ist exakt und unterscheidet Groß-/Kleinschreibung.",
          oCaseSensitiveWhy:
            "Zwei sich nur in der Groß-/Kleinschreibung unterscheidende Optionen sind ein rechtmäßig unterschiedliches Paar, und Groß-/Kleinschreibung zu ignorieren würde sie kollidieren lassen. Beide Seiten werden zuerst getrimmt, sodass nur Schreibweise und Inhalt zählen.",
          oEnglishStored: "Die arabische Optionsbezeichnung dient nur der Anzeige.",
          oEnglishStoredWhy:
            "Die beiden Bezeichnungslisten werden Zeile für Zeile abgeglichen, und die englische ist es, was auf den Datensatz geschrieben und dagegen validiert wird. Ein arabischsprachiger Leser sieht Arabisch auf dem Hin- und dem Rückweg; die zugrunde liegenden Daten bleiben ein einziger konsistenter Wert.",
          oNoSharedSets: "Die Inline-Optionsliste eines Felds ist seine eigene — eine gemeinsam zu nutzen ist ein separater, bewusster Schritt.",
          oNoSharedSetsWhy:
            "Eine Optionsliste bei einem Feld einzutippen hält sie privat für dieses Feld; sie wird nicht automatisch woanders wiederverwendet. Eine Länderliste, die drei Felder brauchen, muss deshalb aber nicht mehr dreimal geschrieben und gepflegt werden — binden Sie stattdessen alle drei an dasselbe gemeinsam genutzte, versionierte Option Set, und eine spätere Bearbeitung des Sets aktualisiert jedes gebundene Feld zusammen.",

          groupsTitle: "Feldgruppen-Verhalten",
          gStableKeyFixed: "Der stabile Schlüssel einer Gruppe kann von niemandem geändert werden.",
          gStableKeyFixedWhy:
            "Exportiertes Schema benennt eine Gruppe über diesen Schlüssel, sodass ein Umbenennen einen künftigen erneuten Import als Update still in ein Anlegen verwandeln würde, gegen ein Paket, das bereits ausgeliefert wurde. Ein falscher Schlüssel bedeutet, die Gruppe neu anzulegen.",
          gReorderCeiling: "Das Umsortieren weist mehr als 100 Gruppen bei einem Datensatztyp zurück.",
          gReorderCeilingWhy:
            "Eine Umsortierungsanfrage trägt die gesamte Menge auf einmal. Ab 100 kann keine Gruppe dieses Datensatztyps mehr bewegt werden — der Bildschirm sagt das, statt allgemein zu scheitern.",
          gGlobalOrdering: "Ein Arbeitsbereich kann seine Gruppe nicht relativ zu einer globalen positionieren.",
          gGlobalOrderingWhy:
            "Das Umsortieren ist alles oder nichts und weist jede Gruppe zurück, die der Aufrufer nicht besitzt, sodass die eigenen Gruppen eines Arbeitsbereichs bei null neu nummeriert werden. Diese Zahlen können mit denen einer globalen Gruppe kollidieren, der Gleichstand wird über die englische Bezeichnung entschieden, und der sichtbare Effekt ist, dass das Verschieben Ihrer Gruppe an die Spitze sie unterhalb einer globalen landen lassen kann.",
          gSeparatePerms: "Feldgruppen brauchen ihre eigenen Berechtigungen.",
          gSeparatePermsWhy:
            "Sie sind getrennt von Felddefinitionen gesperrt, einschließlich einer eigenen Berechtigung für das Umsortieren. Eine Rolle, die jede Berechtigung für benutzerdefinierte Felder besitzt, erhält diese nicht automatisch, und ohne sie fehlen der Link und die Auswahlkomponente schlicht.",
          gOneEntityType: "Eine Gruppe gehört zu genau einem Datensatztyp.",
          gOneEntityTypeWhy:
            "Nichts wird aufgelistet, bis Sie einen Datensatztyp wählen, und das Ändern des Datensatztyps eines Felds löscht dessen Gruppe, weil eine Gruppe eines Typs für einen anderen nie gültig ist.",
          gUniquenessIndex: "In einer aktualisierten Datenbank ruht die Eindeutigkeit des stabilen Schlüssels auf der Anwendungsprüfung.",
          gUniquenessIndexWhy:
            "Gruppen, die vor stabilen Schlüsseln existierten, tragen einen leeren Schlüssel, bis eine Nachbefüllung läuft, und die Eindeutigkeitsbeschränkung auf Datenbankebene bleibt abgeschaltet, bis das überall geschehen ist — sie würde sonst den zweiten dieser leeren Schlüssel zurückweisen.",

          securityTitle: "Sicherheits- und Klassifizierungsverhalten",
          sSensitivityLabel: "Sensitivity ist ein Label, keine Zugriffskontrolle.",
          sSensitivityLabelWhy:
            "Es wird gespeichert, hin- und zurückgereicht und berichtet, und es ändert nichts daran, wer einen Wert lesen kann. Sicherheit auf Feldebene ist der Mechanismus, der den Zugriff einschränkt, und die beiden sind unabhängig voneinander.",
          sRestrictedByResource: "Einschränkungen sind über die Berechtigungsressource verschlüsselt, nicht über den Datensatztyp.",
          sRestrictedByResourceWhy:
            "Es ist dieselbe Ressource, die bereits den Datensatz selbst schützt, sodass eine Liste eingeschränkter Felder sowohl die eingebauten Felder eines Bildschirms als auch seine benutzerdefinierten Felder abdeckt. Namen werden ohne Rücksicht auf Groß-/Kleinschreibung abgeglichen.",
          sRestrictedInvisible: "Ein eingeschränktes Feld fehlt, ist nicht leer.",
          sRestrictedInvisibleWhy:
            "Einen Platzhalter zu zeigen würde verraten, dass ein Wert existiert, was selbst eine Information ist. Die Folge ist, dass ein eingeschränktes Feld nicht von einem zu unterscheiden ist, das nie definiert wurde — es lohnt sich, das zu wissen, wenn jemand ein fehlendes Feld meldet.",
          sRejectWholeSave: "Ein eingeschränktes Feld zu schreiben weist den gesamten Speichervorgang zurück.",
          sRejectWholeSaveWhy:
            "Das eine Feld still fallen zu lassen und Erfolg zu melden ist der schwerer zu bemerkende Fehlschlag. Die Zurückweisung greift auch dann, wenn der übermittelte Wert dem gespeicherten entspricht, sodass niemand einen verborgenen Wert erproben kann, indem er testet, was angenommen wird.",
          sRequiredExclusive: "Required und eingeschränkt lassen sich nicht kombinieren.",
          sRequiredExclusiveWhy:
            "Jemand, der ein Feld nicht sehen kann, könnte es nie erfüllen, sodass der Datensatz für diese Person unspeicherbar wäre. Beide Richtungen werden zurückgewiesen, egal, welche Sie zuerst versuchen, und die Meldung nennt das Feld.",
          sHistoryNoValues: "Der Definitionsverlauf zeigt nie Wertänderungen.",
          sHistoryNoValuesWhy:
            "Sie einzuschließen würde den Dialog in eine lesbare Kopie der Felddaten aller verwandeln, unter Umgehung der Sicherheit auf Feldebene und jeder anderen Sichtbarkeitsregel zugleich. Die wertetragenden Datensätze sind namentlich ausgeschlossen statt durch Auslassung.",

          exportTitle: "Export- und Portabilitätsverhalten",
          eDefinitionsOnly: "Der Tabellenexport enthält Definitionen, nie Antworten.",
          eDefinitionsOnlyWhy:
            "Er ist per Entwurf ein Definitionsexport — ein separater Werteexport existiert als eigener Endpunkt und eigene Schaltfläche im Seitenkopf für die Antworten selbst, gedeckelt bei 10.000 Zellen statt darüber hinaus abgeschnitten zu werden.",
          eRefusesPastLimit: "Über 10.000 Definitionen hinaus weist der Export zurück, statt abzuschneiden.",
          eRefusesPastLimitWhy:
            "Eine still abgeschnittene Datei ist schlimmer als keine Datei, weil sie vollständig aussieht. Die Zurückweisung sagt Ihnen, den Export auf einen einzigen Datensatztyp einzugrenzen.",
          eRestrictedAbsent: "Vor Ihnen eingeschränkte Felder fehlen in der Datei, sind nicht leer.",
          eRestrictedAbsentWhy:
            "Sicherheit auf Feldebene gilt für den Export exakt wie auf dem Bildschirm, und eine leere Spalte würde immer noch verraten, dass das Feld existiert.",
          eNoImport: "Der Tabellenexport ist eine Einbahnstraße, und der einzige Weg zur Massenerstellung, den dieses Produkt je angeboten hat, ist abgeschaltet.",
          eNoImportWhy:
            "Die exportierte Tabelle ist ein Bericht zum Lesen, keine Vorlage, die sich erneut importieren lässt. Ein JSON-Schema-Paket-Import existiert — mit eigenem Dialog, eigenem Endpunkt, eigener Ergebnistabelle pro Gruppe —, aber jeder Aufruf davon wird mit einem 409 zurückgewiesen, durch einen bewussten, dauerhaften Sperrschalter, zusammen mit dem passenden Schema-Export. Die Massenerstellung von Feldern ist über das Produkt heute nicht verfügbar, aufgrund der Auslegung dieses Schalters und nicht aus Versehen.",
          eTextCells: "Jede Export-Zelle wird als Text geschrieben.",
          eTextCellsWhy:
            "Eine Bezeichnung, die mit =, +, - oder @ beginnt, landet als buchstäbliche Zeichen statt als Tabellenkalkulationsformel. Das ist kategorisch statt ein Filter bekannter Fälle, sodass nichts, das wie eine Berechnung aussieht, zu einer werden kann.",

          reachTitle: "Wo Felder erscheinen und wo nicht",
          rApiOnlyTypes: "Manche Datensatztypen haben überhaupt keinen Bildschirm.",
          rApiOnlyTypesWhy:
            "Sie sind rechtmäßige Ziele und werden auf dem Definitionsformular zuletzt aufgeführt, mit einem Zusatz API only. Ein gegen einen davon definiertes Feld ist über die API erreichbar und hat in der Oberfläche nirgends, wo es dargestellt werden könnte.",
          rHandRolledForms: "Eine Handvoll Bildschirme verdrahtet ihre benutzerdefinierten Felder von Hand.",
          rHandRolledFormsWhy:
            "Die meisten Bildschirme übernehmen benutzerdefinierte Felder automatisch. Ein paar, deren Erstellungs- und Bearbeitungsoberflächen älter sind als dieser Mechanismus — darunter Webhooks, Nachrichtenvorlagen, Mandantenpläne, Plugin-Definitionen, Leads und Themes — implementieren denselben Abschnitt Benutzerdefinierte Felder selbst. Das Verhalten sollte identisch sein; ist es das nicht, lohnt sich eine Meldung.",
          rDsrCreateOnly: "Datenschutzanfragen (Data Subject Requests) nehmen benutzerdefinierte Felder nur bei der Erstellung an.",
          rDsrCreateOnlyWhy:
            "Eine eingereichte Anfrage durchläuft einen Prüf-Workflow statt allgemein bearbeitbar zu sein, es gibt also kein Bearbeitungsformular, das benutzerdefinierte Felder hineintragen könnte. Das ist Design, keine Auslassung.",
          rDialogForms: "Die meisten Erstellungs- und Bearbeitungsformulare für Datensätze sind noch Dialoge.",
          rDialogFormsWhy:
            "Das Verfassen benutzerdefinierter Felder selbst zog aus einem verschachtelten Dialog in ein Seitenpanel um, weshalb das Hinzufügen eines Felds aus einem Datensatz heraus nicht mehr zwei Dialoge stapelt. Die umgebenden Datensatzformulare wurden bewusst unangetastet gelassen — sie zu verschieben ist eine viel breitere Änderung über Module hinweg, die mit benutzerdefinierten Feldern nichts zu tun haben.",
          rNoSidebarEntry: "Die Bildschirme Werttypen und Entitätstypen haben keinen Eintrag in der Seitenleiste.",
          rNoSidebarEntryWhy:
            "Die Navigation der Seitenleiste wird zentral eingesät, und diese beiden wurden bewusst aus dieser Aussaat ausgelassen. Sie sind stattdessen über Links im Seitenkopf der Seite Benutzerdefinierte Felder erreichbar.",

          absentTitle: "Dinge, die das Produkt nicht leistet",
          absentIntro:
            "Oft genug nachgefragt, um es klar auszusprechen. Keine davon ist ein meldenswerter Fehler.",
          absent1:
            "Die zweiundzwanzig Werttypen sind die vollständige Menge. Zwei Einträge, die früher auf dieser Liste standen, sind es nicht mehr: File und Image speichern eine hochgeladene Datei oder ein Bild, und RichText speichert formatierte Prosa — siehe die Seite Werttypen. Das Anhängen eines neuen File- oder Image-Werts ist im Produkt allerdings noch nicht verfügbar; beide lassen sich heute definieren, und ein vorhandener Wert lässt sich nur ansehen oder löschen.",
          absent2:
            "Der Werteexport weist zurück statt abzuschneiden, sobald eine Anfrage 10.000 Zellen überschreiten würde — exportieren Sie stattdessen eine engere Auswahl von Datensätzen, statt eine Teildatei zu erwarten.",
          absent3:
            "Es gibt einen Weg zur Massenerstellung, einen JSON-Schema-Paket-Import mit eigenem Dialog — aber er ist derzeit abgeschaltet und weist jeden Aufruf rundheraus zurück, statt tatsächlich irgendetwas anzulegen, zusammen mit dem passenden Schema-Export. Heute werden Felder in der Praxis weiterhin einzeln auf dem Formular angelegt.",
          absent4:
            "Eine veröffentlichte Option-Set-Version bewegt die bereits an eine frühere gebundenen Felder nicht automatisch mit — ein Administrator bindet jedes Feld ausdrücklich neu. Das ist beabsichtigt: automatisches Nachfolgen würde still ändern, was bereits gegen die alte Liste gespeicherte Werte bedeuten.",
          absent5:
            "Es gibt kein bedingtes Anzeigen oder Verbergen, das ein Administrator konfigurieren kann. Ein Feld ist entweder auf dem Formular oder nicht, vorbehaltlich Active und der Sicherheit auf Feldebene.",
          absent6:
            "Es gibt keine Berechnung, keinen Standardwert und keine feldübergreifende Regel. Ein benutzerdefiniertes Feld erfasst eine Antwort; es leitet keine ab.",
          absentInfoTitle: "Falls Sie eines davon brauchen",
          absentInfoContent:
            "Sagen Sie es, wer auch immer Ihre Produkt-Roadmap besitzt, statt es auf eine Weise zu umgehen, die Sie Daten kostet. Ein Feld neu anzulegen, um etwas Dauerhaftes zu ändern, zerstört die bereits dazu gespeicherten Antworten, und das ist der teure Fehler, den diese Seite verhindern soll.",
        },

        // ═══════════════════════════════════════════════════
        //  Option Sets (gemeinsam genutzte, versionierte Listen)
        // ═══════════════════════════════════════════════════
        optionSets: {
          title: "Optionssets",
          description:
            "Wiederverwendbare, versionierte Listen von Auswahlmöglichkeiten. Binden Sie viele Felder an ein Set, und jedes Feld, das es verwendet, ändert sich gemeinsam.",
          intro:
            "Ein Option Set ist eine benannte, versionierte Sammlung von Auswahlmöglichkeiten, die sich mehrere Select- und MultiSelect-Felder teilen. Statt dass jedes Feld seine eigene private Inline-Optionsliste pflegt, binden sich Felder an eine Option-Set-Version. Ändern sich die geschäftlichen Anforderungen, legt ein Administrator eine neue Version an, aktualisiert die Auswahlmöglichkeiten, und veröffentlicht sie — wodurch sofort jedes gebundene Feld im gesamten Produkt aktualisiert wird, ohne manuelle Aktualisierungen Feld für Feld.",
          whenToUseTitle: "Wann ein Option Set statt Inline-Optionen verwenden",
          whenToUseContent:
            "Verwenden Sie ein Option Set immer dann, wenn dieselbe Liste von Auswahlmöglichkeiten bei mehr als einem Feld gebraucht wird (zum Beispiel Ländercodes, Prioritätsstufen oder Abteilungslisten), oder wenn Sie einen nachvollziehbaren Versionsverlauf und ein gestaffeltes Veröffentlichen brauchen. Verwenden Sie Inline-Optionen, wenn eine Auswahlliste einem einzigen Feld eigen ist und nie wiederverwendet wird.",

          kindsTitle: "Drei Arten von Optionssets",
          kindsIntro:
            "SCRIPE unterscheidet drei Arten von Optionssets nach ihrer Herkunft, Eigentümerschaft und Bearbeitungsregeln:",
          thKind: "Art",
          thOwner: "Eigentümer",
          thWhoCanEdit: "Wer bearbeiten darf",
          thScope: "Geltungsbereich",
          kindSeeded: "Vorbefüllt (von der Plattform gepflegt)",
          ownerPlatform: "Plattform",
          editNobody: "Niemand (schreibgeschützt)",
          scopeGlobal: "Global (alle Mandanten)",
          kindPlatform: "Von der Plattform angelegt",
          editPlatformAdmin: "Plattformadministratoren",
          scopeGlobalOrTenant: "Global oder auf Mandantenebene",
          kindTenant: "Von einem Mandanten angelegt",
          ownerTenant: "Mandant",
          editTenantAdmin: "Mandantenadministratoren",
          scopeTenantOnly: "Nur der Arbeitsbereich des Mandanten",
          seededReadOnlyTitle: "Warum vorbefüllte Sets schreibgeschützt sind",
          seededReadOnlyContent:
            "Vorbefüllte Sets (etwa ISO-3166-1-Ländercodes und ISO-4217-Währungen) sind als systemverwaltet markiert. Der Server weist jede verändernde Aktion strikt zurück — Entwurfsversionen anlegen, Optionen bearbeiten, veröffentlichen oder löschen — für jeden, Super Admins eingeschlossen. Brauchen Sie eine angepasste Variante einer vorbefüllten Liste, legen Sie stattdessen ein eigenes Mandanten- oder Plattform-Set an.",

          lifecycleTitle: "Versionslebenszyklus und Zustände",
          lifecycleIntro:
            "Jedes Option Set verwaltet seine Auswahlmöglichkeiten über unveränderliche Versionen. Eine Version durchläuft vier eigenständige Lebenszyklus-Zustände:",
          thStatus: "Status",
          thMeaning: "Bedeutung",
          thNextState: "Nächster Zustand",
          statusDraft: "Draft",
          meaningDraft:
            "Bearbeitbare Entwurfsversion. Auswahlmöglichkeiten können hinzugefügt, aktualisiert, umsortiert oder deaktiviert werden. Auf aktiven Datensatzformularen erst nach der Veröffentlichung sichtbar.",
          nextDraft: "Published (über die Aktion Publish)",
          statusPublished: "Published",
          meaningPublished:
            "Die aktive, live geschaltete Version. Gebundene Felder rendern auf Erstellungs- und Bearbeitungsformularen exakt diese Auswahlmöglichkeiten. Unveränderlich.",
          nextPublished: "Deprecated (wenn ein neuerer Entwurf veröffentlicht wird)",
          statusDeprecated: "Deprecated",
          meaningDeprecated:
            "Abgelöst durch eine neuere veröffentlichte Version. Historische Datensätze, die auf Auswahlmöglichkeiten dieser Version verweisen, werden weiterhin korrekt dargestellt. Kann nicht an neue Felder gebunden werden.",
          nextDeprecated: "Archived (bei der Stilllegung)",
          statusArchived: "Archived",
          meaningArchived:
            "Dauerhaft aus der aktiven Nutzung genommen. Wird strikt für historische Prüfpfade aufbewahrt. Unveränderlich.",
          nextArchived: "Keiner (Endzustand)",
          lifecycleOnlyOnePublished:
            "Zu jedem Zeitpunkt kann genau eine Version Published sein. Einen Entwurf zu veröffentlichen setzt die zuvor amtierende veröffentlichte Version automatisch in einem einzigen atomaren Vorgang auf Deprecated.",
          publishSwapTitle: "Atomarer Veröffentlichungswechsel",
          publishSwapContent:
            "Wenn Sie einen neuen Entwurf veröffentlichen, wird die aktuelle veröffentlichte Version sofort abgelöst und als Deprecated markiert. Es gehen keine Daten verloren: Datensätze, die zuvor Werte aus der älteren Version gespeichert haben, bleiben unverändert und zeigen ihre gespeicherten Bezeichnungen weiterhin an.",

          draftTitle: "Eine Entwurfsversion anlegen und bearbeiten",
          draftIntro:
            "Um Auswahlmöglichkeiten in einem Option Set hinzuzufügen oder zu ändern, folgen Sie dem gestaffelten Versionierungs-Workflow:",
          draft1:
            "Klicken Sie im Detailpanel des Option Sets auf Create draft version. Ein neuer Entwurf wird initialisiert.",
          draft2:
            "Geben Sie für jede Option einen eindeutigen Key und eine englische Bezeichnung ein. Beide sind erforderlich, bevor das Speichern aktiviert wird. Optional können Sie arabische Bezeichnungen, Farbtöne, Symbol-Keys und Sortierreihenfolgen angeben.",
          draft3:
            "Klicken Sie auf Save draft, um die Optionsliste zu übernehmen. Der Entwurf wird auf dem Server gespeichert, bleibt aber für aktive Datensatzformulare unsichtbar.",
          draft4:
            "Wenn Sie bereit sind, klicken Sie auf Publish version. Die Version geht live, und alle gebundenen Felder liefern sofort die aktualisierten Auswahlmöglichkeiten aus.",
          draftSaveHintTitle: "Validierungsanforderungen für Entwürfe",
          draftSaveHintContent:
            "Ein Entwurf braucht mindestens eine gültige Option mit einem nicht leeren Key und einer englischen Bezeichnung. Jeder Key muss innerhalb der Version eindeutig sein. Die Schaltfläche Save draft aktiviert sich automatisch, sobald alle Zeilen diese Validierungsregeln erfüllen.",

          bindingTitle: "Felder an ein Option Set binden",
          bindingIntro:
            "Felder mit den Werttypen Select oder MultiSelect können sich an ein Option Set binden, statt Inline-Optionen zu pflegen — entweder im selben Schritt wie das Anlegen des Felds angehängt, direkt auf dem Erstellungsformular, oder anschließend über eine von drei Lebenszyklus-Aktionen, die für ein bereits bestehendes Feld verfügbar sind:",
          thAction: "Aktion",
          thWhatItDoes: "Was sie tut",
          thEffect: "Wirkung auf bestehende Daten",
          actionBind: "Bind",
          doingBind:
            "Hängt eine Definition eines benutzerdefinierten Felds an die veröffentlichte Version eines Option Sets an.",
          effectBind:
            "Das Feld wechselt von Inline-Optionen zu den Auswahlmöglichkeiten des Option Sets. Bereits gespeicherte Werte bleiben erhalten.",
          actionSwitch: "Switch version",
          doingSwitch:
            "Richtet ein gebundenes Feld auf eine neuere veröffentlichte Version desselben oder eines anderen Option Sets aus.",
          effectSwitch:
            "Das Feld bietet nun die Auswahlmöglichkeiten der neuen Version an. Historische Datensätze zeigen weiterhin die zuvor gewählten Optionen an.",
          actionDetach: "Detach (Unbind)",
          doingDetach:
            "Entfernt die Bindung an das Option Set und lässt das Feld zu eigenständigen Inline-Optionen zurückkehren.",
          effectDetach:
            "Das Feld fragt das Option Set nicht mehr ab. Gespeicherte Datensatzwerte bleiben unverändert.",
          switchCautionTitle: "Stabilität der Bindung",
          switchCautionContent:
            "Stellen Sie beim Trennen oder Wechseln von Optionssets sicher, dass bestehende Datensatzwerte mit den neuen Options-Keys kompatibel bleiben. Eine Option zu deaktivieren statt ihren Key zu entfernen garantiert, dass historische Datensätze unterbrechungsfrei angezeigt werden.",

          platformAdminTitle: "Fähigkeiten des Plattformadministrators",
          platformAdminIntro:
            "Plattform-Super-Admins arbeiten mit erweiterten, systemweiten Governance-Rechten:",
          platformAdmin1:
            "Globale Optionssets anlegen, die von allen Mandanten-Arbeitsbereichen gemeinsam genutzt werden.",
          platformAdmin2:
            "Neue Versionen für plattformeigene (nicht vorbefüllte) Optionssets anlegen und veröffentlichen.",
          platformAdmin3:
            "Die Verfügbarkeit von Optionssets über mandantenübergreifende Grenzen hinweg verwalten.",
          platformAdmin4:
            "Versionsketten und Prüfprotokolle für alle Optionssets plattformweit einsehen.",
          platformAdmin5:
            "Systemverwaltete Grenzen respektieren: plattformgepflegte vorbefüllte Sets bleiben auch für Plattformadministratoren unveränderlich.",
          platformContextTitle: "Erkennung des Plattformkontexts",
          platformContextContent:
            "Wird in der Plattform-Verwaltungskonsole gearbeitet (ohne in einen bestimmten Mandanten hinabzusteigen), werden neu angelegte Optionssets automatisch auf den Geltungsbereich Global voreingestellt, wodurch sie für jede Mandantenumgebung zugänglich werden.",

          rulesTitle: "Wichtige betriebliche Regeln, die man sich merken sollte",
          rule1:
            "Optionssets werden versioniert, nicht direkt bearbeitet: Auswahlmöglichkeiten werden geändert, indem ein Entwurf angelegt und veröffentlicht wird.",
          rule2:
            "Keys sind dauerhafte Bezeichner: Ist eine Option einmal mit einem Key veröffentlicht, ändern Sie diesen Key in späteren Versionen nicht, wenn bestehende Werte zugeordnet bleiben sollen.",
          rule3:
            "Deaktivieren statt löschen: Eine Option zu deaktivieren verhindert, dass sie auf neuen Formularen angeboten wird, während sie bei historischen Datensätzen erhalten bleibt.",
          rule4:
            "Eine einzige veröffentlichte Version: Immer nur eine Version ist aktiv; einen Entwurf zu veröffentlichen setzt die vorherige Version automatisch auf Deprecated.",
          rule5:
            "Systemverwaltete Sets sind strikt schreibgeschützt: Vorbefüllte Standardsets können von keinem Benutzer oder Administrator geändert werden.",
        },
        encryption: {
          title: "Kryptografische Schlüsselverwaltung & Umschlagverschlüsselung",
          description:
            "Mandantenfähige Umschlagverschlüsselung auf Unternehmensniveau, Plattform-Root-Keyring-Rotation, kryptografische AAD-Bindung und unterbrechungsfreie Datenbank-Migration.",
          intro:
            "Beim Speichern vertraulicher oder geheimer benutzerdefinierter Felder — wie Steuernummern, biometrischen Tokens, Bankverbindungen oder Sicherheitsfreigaben — wendet SCRIPE hardwarenahe Umschlagverschlüsselung an. Jeder Wert wird mit AES-256-GCM und mandanteneigenen kryptografischen Schlüsseln geschützt, die über HKDF-SHA256 aus dem aktiven Plattform-Root-Schlüsselbund abgeleitet werden. Geheimtext kann weder gefälscht noch unter einem anderen Mandanten oder einer anderen Entität entschlüsselt werden und lässt sich über Schlüsselrotationen hinweg ohne Ausfallzeiten sicher neu verschlüsseln.",
          archNoticeTitle: "Zero-Trust-Sicherheitsmodell für Unternehmen",
          archNoticeContent:
            "Die Verschlüsselung ist keine oberflächliche Datenbank-Verschleierung: Der Geheimtext ist über Additional Authenticated Data (AAD) von AES-GCM mathematisch an seinen Mandanten, seine Entität und seine Felddefinition gebunden. Manipuliert ein Angreifer ein einziges Byte oder kopiert den Geheimtext in einen anderen Datensatz, schlägt die Authentifizierung sofort fehl.",
          archTitle: "Zentrale kryptografische Architektur",
          archIntro:
            "Das Verschlüsselungssubsystem ist über fünf ausfallsichere Sicherheitsschichten aufgebaut:",
          featKeyringTitle: "Multi-Versions-Root-Schlüsselbund",
          featKeyringDesc:
            "Aktiver Plattformschlüssel für neue Schreibvorgänge neben einem Katalog beibehaltener historischer Schlüssel für nahtlose Lesezugriffe ohne Ausfallzeit.",
          featDerivationTitle: "Mandanten-HKDF-Ableitung",
          featDerivationDesc:
            "Mandantenisolierte Geheimschlüssel, deterministisch abgeleitet über HKDF-SHA256 mit Mandantencode-Salt und Anwendungskontext-Tags.",
          featEnvelopeTitle: "Binärer Magic Frame v2",
          featEnvelopeDesc:
            "Kompakter Binär-Header zur Codierung von Version, Plattform-Schlüssel-ID, Mandanten-Schlüsselversion, 96-Bit-Nonce und 128-Bit-Authentifizierungs-Tag.",
          featAadTitle: "Kryptografische AAD-Bindung",
          featAadDesc:
            "Geheimtext ist mathematisch an TenantId, EntityId und FieldDefinitionId gebunden, was entitätsübergreifende Injection-Angriffe verhindert.",
          featRewrapTitle: "Live-DB-Migration ohne Tabellensperren",
          featRewrapDesc:
            "Hintergrund-Worker durchläuft Datensätze in cursorbasierten Batches zur Neuverschlüsselung unter aktuellen Schlüsseln ohne Tabellensperren.",
          featCliTitle: "Einheitliche CLI- & Studio-Operationen",
          featCliDesc:
            "Vollständige operative Steuerung über `scripe crypto` und das visuelle Entwickler-Dashboard in SCRIPE Studio.",
          frameTitle: "Spezifikation des binären Magic Frame v2",
          frameIntro:
            "Verschlüsselte Werte werden als kompakte Base64-codierte Binärframes persistiert, die der v2-Spezifikation entsprechen:",
          thByteOffset: "Byte-Offset",
          thField: "Header-Feld",
          thLength: "Länge",
          thDescription: "Kryptografischer Zweck",
          descVersion: "Magic-Frame-Versionsbyte (0x02 für authentifizierte v2-Frames).",
          descPlatformKey: "Big-Endian-32-Bit-Ganzzahl zur Identifikation des Plattform-Root-Schlüssels im Schlüsselbund.",
          descTenantVersion: "Big-Endian-16-Bit-Ganzzahl zur Identifikation der Schlüsselrotationsversion des Mandanten.",
          descNonce: "Kryptografisch sicherer, zufälliger 96-Bit-Initialisierungsvektor, der pro Verschlüsselungsvorgang generiert wird.",
          descAuthTag: "128-Bit-GCM-Authentifizierungs-Tag zur Verifikation der Integrität von Geheimtext und AAD.",
          descCiphertext: "Mit AES-256-GCM verschlüsselte Nutzlast des Feldwerts.",
          aadTitle: "Zusätzliche authentifizierte Daten (AAD)",
          aadContent:
            "Während der Ver- und Entschlüsselung übergibt die Engine `tenantId:entityId:fieldDefinitionId` als Additional Authenticated Data (AAD) an die GCM-Chiffre. Dies garantiert, dass eine verschlüsselte Steuernummer von Unternehmen A weder von einem Administrator in die Datensätze von Unternehmen B kopiert noch in ein anderes Feld desselben Datensatzes verschoben werden kann.",
          lifecycleTitle: "Schlüssellebenszyklus & Hard-Gating",
          lifecycleIntro:
            "Schlüsseloperationen für Mandanten folgen einem strengen, auditierbaren Lebenszyklus zum Schutz vor unverschlüsselten Datenlecks:",
          step1Title: "1. Obligatorisches Initialisierungs-Gate",
          step1Content:
            "Administratoren können benutzerdefinierte Felder erst dann als 'Confidential' oder 'Secret' deklarieren, wenn der kryptografische Schlüssel des Mandanten initialisiert wurde. Der API-Validator erzwingt dies serverseitig.",
          step2Title: "2. Unterbrechungsfreie Schlüsselrotation",
          step2Content:
            "Die Rotation eines Schlüssels erstellt Version N+1 für neue Schreibvorgänge, während Version N im Schlüsselbund aktiv bleibt. Historische Datensätze bleiben sofort lesbar.",
          step3Title: "3. Nicht-blockierende Datenbank-Neuverschlüsselung",
          step3Content:
            "Ein asynchroner Hintergrund-Worker (`TenantKeyRewrapJob`) scannt Datensätze in cursorbasierten Batches, entschlüsselt mit historischen Schlüsseln und verschlüsselt mit der aktiven Version N+1 neu.",
          step4Title: "4. Kryptografisches Audit-Protokoll",
          step4Content:
            "Jede Schlüsselerstellung, Rotation, Sperrung und jede einzelne Feldwert-Offenlegung wird unveränderlich mit Akteur-Identität, IP-Adresse und Zeitstempel protokolliert.",
          rewrapTitle: "Live-Datenbank-Migrationsengine",
          rewrapIntro:
            "Große Unternehmensdatenbestände erfordern eine Schlüsselmigration ohne Systemausfallzeiten oder Tabellensperren:",
          thStrategy: "Betriebsstrategie",
          thBehavior: "Engine-Implementierung",
          stratLocking: "Keine Tabellensperren",
          behLocking: "Verwendet cursorbasierte Paginierung und optimistische Nebenläufigkeit (`RowVersion`), um Zeilen ohne exklusive Tabellensperren zu aktualisieren.",
          stratBatching: "Konfigurierbare Cursor-Batches",
          behBatching: "Verarbeitet 500 Datensätze pro Schleifendurchlauf und drosselt die Ausführung, um I/O-Engpässe auf Produktionsdatenbanken zu vermeiden.",
          stratResilience: "Absturzsicher & idempotent",
          behResilience: "Wird der Prozess neu gestartet, setzt der Cursor beim letzten bestätigten Offset fort. Bereits migrierte Datensätze werden sicher übersprungen.",
          stratObservability: "Echtzeit-Metriken & Fortschritt",
          behObservability: "Meldet verarbeitete Datensätze, Fehlerrate, Durchsatz und Fortschrittsprozentsatz an das Studio-Dashboard und Administrationsportal.",
          toolingTitle: "Verwaltungsschnittstellen",
          toolingIntro:
            "Betreiber und Entwickler verfügen über drei komplementäre Schnittstellen zur Verwaltung der Verschlüsselung:",
          toolPortal: "Mandanten-Sicherheitsportal: Web-UI unter `/custom-fields/security` für Self-Service-Rotation und Migrationsüberwachung.",
          toolCli: "SCRIPE CLI: Vollständige Terminal-Tools über `scripe crypto status`, `rotate`, `rewrap`, `verify` und `revoke`.",
          toolStudio: "SCRIPE Studio: Visuelles interaktives Dashboard unter `/crypto` mit Schlüsselbund-Tabellen und Live-Fortschrittsanzeige.",
        },
      },
    },
  },
};
