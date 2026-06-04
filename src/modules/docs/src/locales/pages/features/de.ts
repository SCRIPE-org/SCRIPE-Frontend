/**
 * Docs features — DE
 * Auto-filled 264 keys from EN.
 */
export const de = {
  features: {
    auditSystem: {
      adminEventsTitle: "Admin-Verwaltungsereignisse",
      architectureTitle: "Audit-Architektur",
      authEventsTitle: "Authentifizierungsereignisse",
      bulkEventsTitle: "Bulk-Operationen-Ereignisse",
      description:
        "4-Quellen-Pipeline, 35+ Ereignistypen, 7 Guardian-Ereignisse, Echtzeit-SignalR und CSV/PDF-Export.",
      endpointsTitle: "Audit-API-Endpunkte",
      eventTypesTitle: "Ereignistypen (35+ Kategorien)",
      exportIntro: "CSV- und PDF-Export unter Berücksichtigung der Mandantenisolierung.",
      exportTitle: "Audit-Export",
      guardianIntro: "Protokollierte Blockaden gefährlicher Operationen.",
      guardianTitle: "Guardian-Schutzereignisse",
      intro:
        "SCRIPE erfasst jede wichtige Aktion im Audit-Log durch AstraFlow mediator, EF Core, Middleware und Services.",
      rbacEventsTitle: "RBAC-Ereignisse",
      realTimeIntro:
        "Audit-Ereignisse werden in Echtzeit via SignalR an mandantenspezifische Gruppen übertragen.",
      realTimeTitle: "Echtzeit-Übertragung (Broadcasting)",
      retentionTip: "Die Aufbewahrungsfrist ist pro Mandant konfigurierbar.",
      serviceMethodsIntro: "Spezialisierte asynchrone Protokollierungsmethoden.",
      serviceMethodsTitle: "AuditService-Methoden",
      sessionEventsTitle: "Sitzungsereignisse",
      tenantEventsTitle: "Mandantenereignisse",
      title: "Audit-System",
      twoFactorEventsTitle: "Zwei-Faktor-Ereignisse",
    },
    authentication: {
      adminEntityIntro: "Sicherheitskritische Felder, die das Kontoverhalten steuern.",
      adminEntityTitle: "Admin-Entität (Sicherheitsfunktionen)",
      description:
        "Duale Authentifizierung (Admin + User), JWT-Tokens, 2FA mit Backup-Codes und mandantenbezogene Passwortrichtlinien.",
      dualAuthIntro:
        "Getrennte Pipelines für Admin- und User-Authentifizierung mit unterschiedlichen Claims und Rechten.",
      dualAuthTitle: "Duale Authentifizierung (Admin & User)",
      endpointsAdminTitle: "Admin Auth Endpunkte",
      endpointsTitle: "Auth-API-Endpunkte",
      endpointsUserTitle: "User Auth Endpunkte",
      flowTitle: "Authentifizierungs-Ablauf",
      intro:
        "SCRIPE bietet ein sicheres Authentifizierungssystem mit JWT-Access-Tokens, Refresh-Token-Rotation und optionaler 2FA.",
      jwtIntro:
        "Kurzlebige Access-Tokens (15 Min.) und langlebige Refresh-Tokens (7 Tage), die bei Nutzung rotiert werden.",
      jwtTitle: "JWT-Token Konfiguration",
      lockoutWarning:
        "Nach 5 fehlgeschlagenen Anmeldeversuchen wird das Konto für 15 Minuten gesperrt.",
      passwordPolicyIntro:
        "Die Passwortanforderungen sind pro Mandant über TenantSettings konfigurierbar.",
      passwordPolicyTitle: "Mandantenbezogene Passwortrichtlinie",
      rateLimitingIntro:
        "Schutz vor Brute-Force-Angriffen durch Limitierung der Authentifizierungsendpunkte.",
      rateLimitingTitle: "Rate Limiting",
      title: "Authentifizierung",
      twoFactorIntro: "2FA via TOTP mit Anti-Replay-Schutz und Backup-Codes.",
      twoFactorTitle: "Zwei-Faktor-Authentifizierung (Deep Dive)",
    },
    dashboardBuilder: {
      archIntro:
        "Der Dashboard-Builder ist über 7 Dateien in der Core-Schicht implementiert und folgt SCRIPEs Provider-basiertem Architekturmuster.",
      archTip:
        "Um eine neue Einstellung hinzuzufügen, erweitern Sie die Settings-Schnittstelle und defaultSettings in settings-provider.tsx.",
      archTitle: "Architektur & Dateiübersicht",
      description:
        "Server-synchronisierte Admin-Einstellungen mit 4-Schichten-Merge-Engine, 61 konfigurierbaren Einstellungen, FOUC-Prävention, 409-Konfliktlösung und editionsbasierter Feature-Kontrolle.",
      edgeCasesIntro:
        "Das Sync-System behandelt 5 kritische Edge Cases, die in Enterprise-Umgebungen häufig auftreten.",
      edgeCasesTitle: "Edge-Case-Schutzmaßnahmen",
      edgeCasesWarning:
        "Der PENDING_SETTINGS_FLUSH-Schlüssel überlebt absichtlich das Logout, um Einstellungen beim nächsten Login zu flushen.",
      intro:
        "Der Dashboard-Builder ist SCRIPEs Enterprise-Klasse Admin-Präferenzsystem, das 61 konfigurierbare Dashboard-Einstellungen zwischen Browser und Server synchronisiert. Es verwendet eine 4-Schichten-Merge-Engine (Plattform → Mandant → Admin → Laufzeit) zur Auflösung von Einstellungen mit mandantenbasierter Override-Kontrolle, geräteübergreifender Persistenz über AdminSettingsJson und 5 Edge-Case-Schutzmaßnahmen.",
      mergeEngineIntro:
        "Einstellungen folgen einer strengen 4-Schichten-Prioritätskette. Jede Schicht kann die vorherige überschreiben, mit optionaler pfadbasierter Zugriffskontrolle auf Mandantenebene.",
      mergeEngineNote:
        "Schicht 2 (Editions-Einschränkungen) wird serverseitig über die FeatureCheckBehavior-Pipeline behandelt.",
      mergeEngineTitle: "4-Schichten-Merge-Engine",
      overrideControlIntro:
        "Mandantenadministratoren können steuern, welche Einstellungen einzelne Admins anpassen dürfen.",
      overrideControlTitle: "Admin-Override-Kontrolle",
      overviewIntro:
        "Der Dashboard-Builder bietet einen vollständigen Lebenszyklus für Admin-Einstellungen — von sofortigem Cache-First-Rendering bis hin zur Hintergrund-Serverabstimmung.",
      overviewTip:
        "Einstellungen werden sofort aus dem localStorage-Cache beim Seitenaufruf gerendert. Der Server-Abruf erfolgt im Hintergrund.",
      overviewTitle: "Systemübersicht",
      securityIntro:
        "Der Dashboard-Builder implementiert Defense-in-Depth-Sicherheit, um Datenlecks zwischen Admins und Payload-Überläufe zu verhindern.",
      securityTitle: "Sicherheitsmodell",
      settingsRefIntro:
        "Alle 61 Einstellungen sind in 9 Abschnitte organisiert. Jede Einstellung hat einen definierten Typ, Standardwert, DOM-Datenattribut und optionale Editions-Kontrolle.",
      settingsRefTitle: "Einstellungsreferenz (61 Einstellungen)",
      syncHookIntro:
        "Der useAdminSettingsSync-Hook verwaltet den kompletten Lebenszyklus der Admin-Einstellungen: Erstladen aus dem Cache, verzögertes Flushing, Hintergrund-Server-Abruf und stille Abstimmung.",
      syncHookTitle: "Server-Sync-Hook",
      title: "Dashboard-Builder",
    },
    dashboardHub: {
      archIntro:
        "Der Dashboard Hub verwendet ein Hub-and-Spoke-Muster, bei dem die DashboardView als zentraler Hub den Tab-Streifen rendert und jeder Tab eine unabhängige, domänenspezifische View (Spoke) lazy-loaded. Der Übersicht-Tab ist inline für sofortiges Rendering. Audit-, Sicherheits- und Analytics-Tabs werden bei Bedarf via React.lazy mit Suspense-Fallbacks geladen.",
      archTip:
        "Sub-Views werden erst beim ersten Aktivieren ihres Tabs lazy-loaded. Dies reduziert das initiale Dashboard-Bundle um ~60%.",
      archTitle: "Hub-and-Spoke Architektur",
      cachingIntro:
        "Alle TanStack Query Keys im Hub enthalten die aktuelle tenantId als Partitionsschlüssel. Dies stellt sicher, dass beim Mandantenwechsel alle Dashboard-Daten automatisch invalidiert und neu abgerufen werden.",
      cachingTitle: "Mandantenspezifisches Caching",
      compatIntro:
        "Um Build-Fehler während der Migration zu vermeiden, behält DashboardEntities.ts veraltete Typ-Aliase bei.",
      compatTitle: "Abwärtskompatibilität",
      compatWarning: "Veraltete Aliase sollten in einem zukünftigen Cleanup entfernt werden.",
      description:
        "Modulares Tab-Dashboard mit domänensegmentierten Sub-Modulen (Audit, Sicherheit, Analytics), 6-Schichten Clean Architecture pro Modul, ISP-konforme Interfaces, Lazy Loading und berechtigungsgesteuerter Tab-Sichtbarkeit.",
      diIntro:
        "Alle drei neuen Module sind im SystemContainer (modules/system/di.ts) registriert. Jedes Modul folgt dem Muster: Service → Repository → SystemContainer Interface → Lazy Getter Export.",
      diTip:
        "Lazy Getter stellen sicher, dass Services und Repositories erst bei erstem Zugriff instanziiert werden.",
      diTitle: "DI-Container Verdrahtung",
      domainIntro:
        "Zuvor flossen alle Dashboard-Daten durch ein einzelnes DashboardRepository (God Interface) mit 8+ Methoden für Audit, Sicherheit und Analytics. Die refaktorisierte Architektur extrahiert jede Domäne in ein unabhängiges Modul mit eigenem Repository-Interface.",
      domainNote:
        "Abwärtskompatible Typ-Aliase werden in DashboardEntities.ts für Legacy-Komponenten beibehalten. Diese Aliase sind mit @deprecated markiert.",
      domainTitle: "Domänensegregation (Interface Segregation Principle)",
      hubIntro:
        "Die DashboardView-Komponente dient als Hub und rendert eine TabsList mit 4 TabsTrigger-Elementen. Audit- und Sicherheits-Tabs werden bedingt basierend auf den Berechtigungen des aktuellen Admins gerendert.",
      hubNote:
        "Tab-Sichtbarkeit ist im Frontend berechtigungsgesteuert für UX-Zwecke. Backend-Endpunkte erzwingen die tatsächliche Sicherheitsgrenze.",
      hubTitle: "Tab-Hub Implementierung",
      intro:
        "Der Dashboard Hub ist SCRIPEs zentrale Operationszentrale — eine Tab-Oberfläche, die vier domänenspezifische Ansichten (Übersicht, Audit, Sicherheit, Analytics) in einem einheitlichen Hub zusammenfasst. Jedes Domänenmodul folgt einer strikten 6-Schichten Clean Architecture (Models → Entities → Interfaces → Services → Repositories → Mappers) mit eigenem DI-Eintrag. Sub-Views werden via React.lazy lazy-loaded und berechtigungsgesteuert.",
      layersIntro:
        "Jedes extrahierte Modul (Audit, Sicherheit, Analytics) implementiert den vollständigen SCRIPE Frontend Clean Architecture Stack. Die 6 Schichten gewährleisten strikte Trennung der Zuständigkeiten.",
      layersTitle: "6-Schichten Clean Architecture",
      sourceIntro:
        "Der refaktorisierte Dashboard Hub erstreckt sich über 4 Module (Dashboard, Audit, Security, Analytics), jeweils mit eigenem vollständigen 6-Schichten-Stack.",
      sourceTitle: "Quelldatei-Referenz",
      title: "Dashboard Hub (Hub-and-Spoke)",
      viewmodelIntro:
        "Jeder ViewModel-Hook importiert nun sein dediziertes Repository aus dem DI-Container statt ein gemeinsames Dashboard-Repository zu teilen.",
      viewmodelTitle: "ViewModel-Entkopplung",
    },
    downloadExport: {
      architectureIntro:
        "Unterstützt authentifizierte JWT-Downloads und temporäre sitzungsbasierte URLs.",
      architectureTitle: "Download-Architektur",
      description:
        "Authentifizierte Downloads mit Range-Unterstützung, ETag-Caching und Path-Traversal-Schutz.",
      endpointsTitle: "Download-Endpunkte",
      etagNote: "Gibt 304 Not Modified zurück, wenn die Datei lokal noch aktuell ist.",
      etagTitle: "ETag-Caching",
      pathTraversalNote:
        "Entfernt '..'-Sequenzen, um Ausbrüche aus dem Speicherverzeichnis zu verhindern.",
      pathTraversalTitle: "Schutz vor Path Traversal",
      resumableIntro: "Client kann partielle Inhalte (Byte-Ranges) anfordern.",
      resumableTitle: "Fortsetzbare Downloads (Range Headers)",
      sessionIntro: "Ermöglicht das Teilen von URLs ohne Authentifizierung.",
      sessionTitle: "Sitzungsbasierte Downloads",
      sessionWarning: "Download-Sitzungen laufen ab und können nicht erneuert werden.",
      streamConfigTitle: "FileStream Konfiguration",
      title: "Download- & Export-System",
    },
    emailSystem: {
      architectureIntro: "Pipeline-Ansatz: Controller → Service → Queue → Sender → SMTP.",
      architectureTitle: "E-Mail-Pipeline-Architektur",
      backgroundIntro: "HangfireQueue erstellt Hintergrundjobs für E-Mails.",
      backgroundTitle: "Background Worker-Muster",
      description:
        "Steckbare E-Mail-Bereitstellungspipeline mit Queue-Strategien und Hintergrundverarbeitung.",
      endpointsTitle: "E-Mail-Controller-Endpunkte",
      errorIntro: "E-Mails werden vor dem Senden bereinigt, Fehler führen zu Retries.",
      errorTitle: "Fehlerbehandlung & Bereinigung",
      queueIntro: "Steuert, wie E-Mails verarbeitet und verzögert werden.",
      queueTitle: "Queue-Implementierungen (InMemory vs. Hangfire)",
      senderIntro: "Steuert die physische Übermittlung.",
      senderTitle: "Sender-Strategien (SMTP vs. Console)",
      title: "E-Mail-System",
    },
    fileUpload: {
      architectureIntro:
        "Getrennte Pfade für Bilder (Zuschneiden/Formatieren) und allgemeine Dateien.",
      architectureTitle: "Upload-Architektur",
      description:
        "Duale Upload-Pipeline für Bilder und Dokumente mit Validierung und mandantenspezifischem Speicher.",
      generalTitle: "Allgemeiner Dateiupload",
      imagePipelineTitle: "Bild-Upload-Pipeline",
      servingNote: "Bereitstellung über ASP.NET Core StaticFileMiddleware.",
      servingTitle: "Static File Serving",
      tenantScopedTitle: "Mandantenbezogener Speicher (Tenant-Scoped Storage)",
      title: "Datei-Upload-System",
      validationTitle: "Dateivalidierungsregeln",
    },
    loginCustomizer: {
      a11yAuditIntro:
        "Der useAccessibilityChecker-Hook führt 4 automatische Echtzeit-Prüfungen durch: Kontrastvalidierung (4,5:1), Touch-Zielgröße (min. 44px), Overlay-Lesbarkeit und Bewegungseinstellungen.",
      a11yAuditTitle: "Echtzeit-WCAG-Audit-Engine",
      a11yAutoFixIntro:
        "Die Audit-Engine enthält eine autoFix-Funktion, die fehlgeschlagene Prüfungen automatisch behebt, indem Entwurfseinstellungen für WCAG-AA-Konformität angepasst werden.",
      a11yAutoFixTitle: "Auto-Fix-Mechanismus",
      a11yCat1:
        "Fokusindikatoren — Benutzerdefinierte Fokusring-Farbe, Breite (1-5px), Versatz und Stil.",
      a11yCat2:
        "Hoher Kontrast — Umschaltung des Hochkontrastmodus mit Text-/Hintergrund-Kontrastüberschreibungen.",
      a11yCat3:
        "Textlesbarkeit — Schriftgrößenskalierung (80-200%), Zeilenhöhe (1.0-2.5), Buchstaben- und Wortabstand.",
      a11yCat4:
        "Bewegung & Animation — Bevorzugung reduzierter Bewegung, Übergangsdauer, dekorative Animationen.",
      a11yCat5: "Touch-Ziele — Mindesthöhe für Buttons und Eingabefelder (WCAG-Minimum 44px).",
      a11yCat6:
        "Farbe & Sehen — Farbenblindheitssicherer Modus, benutzerdefinierte Linkfarben, dauerhafte Unterstreichung.",
      a11yCat7:
        "Screenreader — ARIA-Landmark-Injektion, Live-Region-Ankündigungen, Skip-Navigation-Links.",
      a11yCat8:
        "Lesehilfe — Konfigurierbarer Leseführer, Zeilenhervorhebung, Textmaske, dyslexiefreundliche Schriftart.",
      a11yCategoriesTitle: "8 Einstellungskategorien",
      a11yCssIntro:
        "Der useLoginBrandingTokens-Hook gibt 23+ barrierefreiheitsspezifische CSS-Regeln über eine einzelne <style>-Tag-Injektion aus.",
      a11yCssTitle: "CSS-Injektions-Pipeline",
      a11yIntro:
        "Der Barrierefreiheitsbereich bietet 32 Einstellungen in 8 Kategorien, um die Anmeldeseite vollständig WCAG-AA-konform zu machen. Enthält Echtzeit-Validierung, Ein-Klick-Profile und eine automatische WCAG-Audit-Engine.",
      a11yPreviewIntro:
        "LoginPreviewShell zeigt Barrierefreiheitsfunktionen in Echtzeit mit einem Badge, der die Anzahl aktiver Barrierefreiheitsfunktionen anzeigt.",
      a11yPreviewTitle: "Vorschau-Integration",
      a11yProfile1:
        "WCAG AA Baseline — Wendet die WCAG-AA-Mindestanforderungen an: 4,5:1 Kontrast, 44px Touch-Ziele, sichtbare Fokusringe.",
      a11yProfile2:
        "Sehbehinderung — Große Schrift (140%), hoher Kontrast, fetter Text, zusätzlicher Abstand.",
      a11yProfile3:
        "Motorische Beeinträchtigung — Große Touch-Ziele (56px), zusätzliches Padding, keine Animationen.",
      a11yProfile4:
        "Kognitiv — Vereinfachtes Layout, reduzierte Bewegung, erhöhter Abstand, Leseführer.",
      a11yProfile5:
        "Screenreader-optimiert — Erweiterte ARIA-Landmarks, Live-Regionen, Formularbeschriftungen.",
      a11yProfile6:
        "Auf Standard zurücksetzen — Setzt alle Barrierefreiheitseinstellungen auf Standardwerte zurück.",
      a11yProfilesIntro:
        "Vorkonfigurierte Barrierefreiheitsprofile wenden sofort Batch-Einstellungen an.",
      a11yProfilesTitle: "6 Ein-Klick-Profile",
      a11yTitle: "Barrierefreiheits-Suite (WCAG AA)",
      accessIntro:
        "Die Login-Anpassung folgt dem rollenbasierten Zugriffskontrollmodell von SCRIPE. Das Öffnen des Customizer Studios erfordert die Berechtigung branding.manage.",
      accessTitle: "Zugriffskontrolle",
      archIntro:
        "Der Login Customizer folgt der standardmäßigen modularen Clean Architecture von SCRIPE mit Domain-, Daten- und Präsentationsschichten, einschließlich AccessibilityPanel für WCAG-Einstellungen und -Profile.",
      archTip:
        "Die Komponenten BgControls und PresetDots sind absichtlich auf Modulebene definiert (nicht inline), um zu verhindern, dass React Eingabefelder während des Re-Renderings entfernt/neu montiert.",
      archTitle: "Modul-Architektur",
      bgOverlayIntro:
        "Hintergrund- und Overlay-Steuerungen passen sich dem ausgewählten Layout-Typ an.",
      bgOverlayTitle: "Hintergrund- & Overlay-Steuerung",
      bgOverlayWarning:
        "Bei geteilten Layouts ist das Overlay auf den Formularbereich und das Branding-Panel unabhängig begrenzt. CSS-Variablen mit dem Wert 0 werden korrekt ausgegeben.",
      brandingIntro:
        "Das Branding-Panel (sichtbar in geteilten Layouts) bietet dedizierte Steuerungen für die Markenseite der Anmeldeseite.",
      brandingTitle: "Branding-Panel",
      description:
        "Visuelle Anpassung der Anmeldeseite mit 22 Layouts, Design-Tokens, Overlay-/Blur-Steuerung, hellen/dunklen Themes, WCAG AA Barrierefreiheits-Suite und einer sandboxed Live-Vorschau — ganz ohne Code.",
      draftIntro:
        "Das Studio implementiert einen sicheren Entwurf → Vorschau → Veröffentlichen-Workflow mit optimistischer Nebenläufigkeitskontrolle.",
      draftNote:
        "Optimistische Nebenläufigkeit verhindert Datenverlust bei gleichzeitiger Bearbeitung. Wenn ein anderer Administrator während Ihrer Bearbeitung veröffentlicht, wird Ihre Veröffentlichung abgelehnt (409).",
      draftTitle: "Entwurf / Veröffentlichen / Zurücksetzen",
      intro:
        "Das Login Customizer Studio von SCRIPE ist ein leistungsstarker visueller Editor, der Mandantenadministratoren die vollständige Anpassung der Anmeldeseite ohne Programmierung ermöglicht. Das Studio bietet eine geteilte Oberfläche mit 8 Konfigurationstabs — Erscheinungsbild, Farben, Typografie, Hintergrund, Overlay, Branding-Panel, Barrierefreiheit und Erweitert — sowie eine sandboxed iframe-Vorschau rechts.",
      layoutsIntro:
        "SCRIPE wird mit 22 produktionsbereiten Anmelde-Layouts in vier Kategorien geliefert: T1 Geteilte Layouts (6) bieten ein dediziertes Branding-Panel, T2 Ganzseitige Layouts (8) nutzen den gesamten Viewport, T3 Zentrierte Layouts (4) bieten kompakte kartenbasierte Designs, T4 Spezial-Layouts (4) bieten filmische und künstlerische Behandlungen.",
      layoutsNote:
        "Geteilte Layouts rendern die LoginBranding-Komponente mit unabhängigen Overlay-/Blur-Steuerungen. Ganzseitige Layouts wenden Hintergrund und Overlay auf den gesamten Wrapper an. Zentrierte und Spezial-Layouts haben eigene Rendering-Strategien.",
      layoutsTitle: "22 Anmelde-Layouts",
      relatedBuilder:
        "Login Page Builder — Drag-and-drop visual canvas for building custom login page layouts with 14 component types.",
      relatedIntro:
        "The Login Customizer Studio is part of a larger customization ecosystem. See these companion features for complete coverage:",
      relatedMarketplace:
        "Theme Marketplace — Browse, preview, and apply 40 premium branding packages with per-page overrides.",
      relatedMultiPage:
        "Multi-Page Branding — Configure independent branding for Login, Forgot Password, and Reset Password pages.",
      relatedTitle: "Related Features",
      safeModeIntro:
        "Der Sichere Modus ist ein Notfall-Fallback, der alle Mandanten-Branding-Anpassungen umgeht und die Plattform-Standardwerte wiederherstellt.",
      safeModeTitle: "Sicherer Modus",
      studioIntro:
        "Das Customizer Studio verwendet eine geteilte Architektur: Das linke Panel enthält 8 tabulierte Konfigurationsabschnitte (Erscheinungsbild, Farben, Typografie, Hintergrund, Overlay, Branding-Panel, Barrierefreiheit, Erweitert), während das rechte Panel ein sandboxed iframe bereitstellt, das die Anmeldeseite mit Live-CSS-Variablen-Injektion via postMessage rendert.",
      studioTip:
        "Alle Studio-Änderungen arbeiten im Entwurfsmodus. Die Live-Anmeldeseite wird niemals beeinflusst, bis Sie explizit auf Veröffentlichen klicken.",
      studioTitle: "Studio-Übersicht",
      themeIntro:
        "Der Login Customizer unterstützt unabhängige Konfigurationen für hellen und dunklen Modus. Bei aktiviertem Dunkelmodus wird ein separater Satz CSS-Variablen ausgegeben.",
      themeTitle: "Hell/Dunkel-Theme-Architektur",
      title: "Login-Customizer-Studio",
      tokensIntro:
        "Das Anpassungssystem basiert auf einer umfassenden Design-Token-Pipeline. Mandanteneinstellungen werden in semantische Tokens transformiert und ins Live-DOM injiziert, einschließlich 23+ barrierefreiheitsspezifischer CSS-Regeln.",
      tokensTitle: "Design-Token-Pipeline",
    },
    loginPageBuilder: {
      archIntro:
        "The Login Page Builder follows SCRIPE's standard modular clean architecture. The builder/ directory contains: BuilderCanvas.tsx (main canvas), ComponentPalette.tsx (sidebar palette), PropertiesPanel.tsx (property editor), GridOverlay.tsx (grid visualization), and BuilderToolbar.tsx (mode switcher, undo/redo, zoom controls). State management uses the useBuilderState hook integrated into useStudioViewModel.",
      archTip:
        "The builder components are intentionally defined as stable, memoized React components to prevent re-renders during drag operations. Each canvas component is wrapped in React.memo with custom equality checks on position and properties.",
      archTitle: "Module Architecture",
      bundleComponentsIntro:
        "BundleGalleryTab (5.6KB) — Gallery tab with type filters (Login, Dashboard, Complete), search, grid, pagination. BundleCard (12.8KB) — Card with accent preview, pricing tier, metadata. BundleDetailModal (8.5KB) — Full detail with apply button. SaveBundleDialog (7.6KB) — Dialog for saving current studio state as a new bundle.",
      bundleComponentsTitle: "Bundle Components",
      bundleIntro:
        "The Bundle Marketplace allows tenants to save their complete studio configuration (login theme + builder layout + dashboard settings + per-page overrides) as a named bundle, and browse/apply bundles created by other tenants or the system. Bundles are displayed in a dedicated tab within the Theme Gallery.",
      bundleTitle: "Bundle Marketplace (Related Feature)",
      bundleTypesIntro:
        "Login Bundle — Contains only login branding (theme tokens + builder layout). Dashboard Bundle — Contains only dashboard settings. Complete Bundle — Contains everything: login branding, builder layout, per-page overrides, dashboard settings, and accessibility configuration. Complete bundles provide one-click full-workspace setup.",
      bundleTypesTitle: "Bundle Types",
      compBadge:
        "Badge — Small label/tag element. Properties: text, variant (default, success, warning, destructive), size.",
      compButton:
        "Button — Clickable action button. Properties: text, variant (primary, secondary, outline, ghost), size, width (auto, full), icon, link URL, border radius.",
      compCard:
        "Card — Container with background, border, and shadow. Properties: background color, border radius, shadow, padding. Can contain other components (nested layout).",
      compDivider:
        "Divider — Visual separator line. Properties: color, thickness, width, margin, style (solid, dashed, dotted, gradient).",
      compFooter:
        "Footer — Page footer with links and copyright text. Properties: links array, copyright text, alignment, font size, color.",
      compForm:
        "Form — The login form component containing email/password inputs and submit button. Properties: show labels, show placeholders, input style, button text, remember me checkbox, forgot password link.",
      compHeading:
        "Heading — Large display text for page titles and headlines. Properties: text content, font size, font weight, color, alignment, HTML tag (h1–h6). Supports dynamic variables ({tenantName}).",
      compIcon:
        "Icon — SVG icon from the built-in icon library. Properties: icon name, size, color, rotation, link URL.",
      compImage:
        "Image — Display any image on the canvas. Properties: src (URL), alt text, width, height, object-fit, border radius, shadow. Supports all web image formats.",
      compLogo:
        "Logo — Displays the tenant's logo image. Properties: src (URL), alt text, width, height, alignment, link URL. Supports SVG, PNG, and WebP formats.",
      compSocialLogin:
        "Social Login — Pre-built social authentication buttons (Google, Microsoft, Apple, GitHub). Properties: providers (multi-select), layout (horizontal, vertical, icon-only), separator text.",
      compSpacer:
        "Spacer — Invisible spacing element. Properties: height (in px). Used to create vertical gaps between components without manual positioning.",
      compTermsLink:
        "Terms & Privacy — Pre-built links to Terms of Service and Privacy Policy pages. Properties: terms URL, privacy URL, text template, font size, color.",
      compText:
        "Text — General-purpose paragraph text. Properties: content, font size, color, line height, alignment, max width. Supports rich text with bold, italic, and links.",
      dashboardColorsIntro:
        "Default, Zinc, Slate, Stone, Neutral, Red, Rose, Orange, Green, Blue, Violet, and Yellow. Each color theme defines the dashboard's accent color palette applied to the sidebar, headers, buttons, and active states.",
      dashboardColorsTitle: "12 Color Themes",
      dashboardIntro:
        "The Dashboard Theming panel in the Customizer Studio allows tenants to configure their admin dashboard's visual defaults. Settings include layout template (8 options), color theme (12 options), theme mode (light/dark/system), default language, and sidebar default state. Dashboard theming uses the same draft/publish workflow as login branding.",
      dashboardLayoutsIntro:
        "Default, Navigation, Classic, Compact, Elegant, Floating, Modern, and Minimal. Each template defines the dashboard shell structure: sidebar position, header style, content width, and navigation pattern.",
      dashboardLayoutsTitle: "8 Layout Templates",
      dashboardStorageIntro:
        "Dashboard settings are stored in the dashboardThemeJson field of DraftBrandingJson as a JSON object: { layoutTemplate, colorTheme, mode, language, sidebarDefaultState }. On publish, the settings are promoted to the tenant's live configuration.",
      dashboardStorageTitle: "Storage Format",
      dashboardTitle: "Dashboard Theming (Related Feature)",
      description:
        "No-code drag-and-drop visual canvas with 3 design modes (Freeform, Grid, Builder), 14 component types, a 12-column responsive grid system, real-time preview sync, and JSON serialization.",
      dndIntro:
        "The builder uses @dnd-kit/core (not react-beautiful-dnd) for drag-and-drop interactions. Components are dragged from the palette sidebar and dropped onto the canvas. The DragOverlay renders a ghost preview of the component during drag. Drop zones are highlighted with blue outlines when a draggable component hovers over them.",
      dndPaletteIntro:
        "1. User drags a component type from the palette sidebar. 2. @dnd-kit creates a DragOverlay with a preview of the component. 3. The canvas renders drop zone indicators (grid cells in Grid mode, free areas in Freeform mode). 4. On drop, a new component instance is created with default properties and added to the builder state. 5. The component is rendered on the canvas at the drop position.",
      dndPaletteTitle: "Palette → Canvas Flow",
      dndReorderIntro:
        "Existing components on the canvas can be reordered by dragging. In Grid mode, components snap to grid cells. In Builder mode, components reorder within their section (header/body/footer). In Freeform mode, components move to the exact drop coordinates.",
      dndReorderTitle: "Canvas Reordering",
      dndSelectIntro:
        "Clicking a component on the canvas selects it, displaying a blue selection border and resize handles. The Properties Panel on the right sidebar loads the selected component's editable properties. Pressing Delete/Backspace removes the selected component. Escape deselects.",
      dndSelectTitle: "Component Selection",
      dndTitle: "Drag-and-Drop Architecture",
      gridGapIntro:
        "The grid gap (spacing between cells) is configurable globally: columnGap and rowGap properties, each accepting pixel values (default: 16px). This ensures consistent spacing across all grid items without manual padding on individual components.",
      gridGapTitle: "Gap Configuration",
      gridIntro:
        "The Grid Mode uses a responsive 12-column CSS grid layout. Each component occupies a configurable number of columns (1–12) and rows. The grid supports gap spacing, column alignment (start, center, end, stretch), and row alignment. The grid is fully responsive — column spans can be configured independently for desktop (lg), tablet (md), and mobile (sm) breakpoints.",
      gridPropsIntro:
        "Each component in Grid mode has additional grid-specific properties: colSpan (1–12 columns), rowSpan (number of rows), colStart (starting column), rowStart (starting row), alignment (start/center/end/stretch), and responsive overrides (sm/md/lg column spans). These properties are configured via the Properties Panel.",
      gridPropsTitle: "Grid Component Properties",
      gridResponsiveIntro:
        "The grid supports 3 breakpoints: Desktop (lg, ≥1024px), Tablet (md, 768–1023px), and Mobile (sm, <768px). Each component can have independent column spans per breakpoint. For example, a logo might span 4 columns on desktop but 12 columns (full width) on mobile. The preview iframe respects these breakpoints when device toggles are used.",
      gridResponsiveTitle: "Responsive Breakpoints",
      gridTitle: "12-Column Grid System",
      intro:
        "The Login Page Builder is SCRIPE's most advanced customization tool — a fully visual, drag-and-drop canvas that allows tenant administrators to build custom login page layouts without writing any code. The builder provides 3 design modes (Freeform, Grid, and Builder), a palette of 14 pre-built component types (from logos and headings to social login buttons and footer links), a responsive 12-column CSS grid system, real-time two-way sync with the preview iframe, and full JSON serialization for persistence. The builder integrates seamlessly with the Login Customizer Studio's design token pipeline, ensuring that builder-created layouts inherit all theme colors, typography, and accessibility settings.",
      modeBuilderIntro:
        "Structured block-based layout with predefined sections. Components are organized into vertical sections (header, body, footer) with automatic stacking and reordering via drag-and-drop. Best for quick layout assembly with predictable, clean results. Builder mode enforces structural constraints — components snap to section boundaries and maintain consistent spacing.",
      modeBuilderTitle: "Builder Mode",
      modeFreeformIntro:
        "Absolute positioning with pixel-level control. Components can be placed anywhere on the canvas and dragged to exact coordinates. Best for creative, non-standard layouts where design freedom is paramount. Components have x/y position, width, height, and z-index properties.",
      modeFreeformTitle: "Freeform Mode",
      modeGridIntro:
        "Responsive 12-column CSS grid layout. Components are placed into grid cells with configurable column span (1–12), row positioning, alignment, and gap spacing. The grid ensures consistent, responsive layouts that adapt to desktop, tablet, and mobile breakpoints. This is the recommended mode for enterprise deployments where cross-device consistency is critical.",
      modeGridTitle: "Grid Mode (12-Column)",
      modesIntro:
        "The builder offers three distinct canvas modes, each providing a different level of control over layout positioning. Users can switch between modes at any time — components are preserved during mode switches.",
      modesNote:
        "Grid mode is the default for new configurations. It provides the best balance between design flexibility and responsive consistency. Freeform mode is intended for advanced users who need pixel-perfect control.",
      modesTitle: "3 Canvas Modes",
      paletteIntro:
        "The component palette provides 14 pre-built, configurable UI components that can be dragged onto the canvas. Each component has a set of editable properties (text content, styling, behavior) accessible via the Properties Panel when selected.",
      paletteTitle: "14 Component Types",
      previewIntro:
        "Every canvas change is immediately reflected in the sandboxed preview iframe. The builder emits postMessage events containing the current component array and canvas mode. The preview page receives these events, reconstructs the layout, and renders the components with live CSS variable injection from the active theme.",
      previewSyncIntro:
        "The sync is bidirectional: canvas changes propagate to preview (via postMessage), and device toggle changes in the preview header propagate back to the builder (updating responsive breakpoint indicators). This ensures the builder canvas accurately reflects how the layout will appear at each breakpoint.",
      previewSyncTitle: "Two-Way Sync",
      previewTitle: "Real-Time Preview Sync",
      propsContentIntro:
        "Text inputs for content: headline text, paragraph text, button labels, URLs, alt text. Supports variable interpolation with {variableName} syntax for dynamic tenant data.",
      propsContentTitle: "Content Properties",
      propsGridIntro:
        "Grid-specific layout controls (Grid mode only): column span slider (1–12), row span, column start, row start, alignment select, and responsive breakpoint overrides. A visual grid preview shows the component's position within the 12-column grid.",
      propsGridTitle: "Grid Properties",
      propsIntro:
        "The Properties Panel is a contextual sidebar that appears when a component is selected on the canvas. It displays all editable properties for the selected component type, organized into sections: Content (text, URLs), Layout (width, height, alignment), Style (colors, borders, shadows), and Grid (column span, row span, responsive breakpoints). Changes in the Properties Panel update the canvas in real-time.",
      propsStyleIntro:
        "Visual styling controls: color pickers, border radius sliders, shadow toggles, opacity controls, font size selectors. Style properties that overlap with theme tokens (e.g., primaryColor) can be set to 'inherit from theme' to maintain consistency.",
      propsStyleTitle: "Style Properties",
      propsTitle: "Properties Panel",
      securityIframeIntro:
        "The preview iframe uses the sandbox attribute with restricted permissions: allow-scripts (for CSS variable injection), allow-same-origin (for postMessage). Forms are non-functional — the preview renders visual-only representations of auth components.",
      securityIframeTitle: "Iframe Sandboxing",
      securityIntro:
        "The Login Page Builder enforces strict security constraints on user-generated content. All text content is HTML-sanitized before rendering (no script injection). Image URLs are validated to prevent SSRF. The builder canvas runs in a sandboxed iframe with restrictive CSP headers. Custom CSS injection is not supported — styling is controlled exclusively through the design token pipeline.",
      securitySanitizeIntro:
        "All text properties (headings, paragraphs, button labels) are sanitized using DOMPurify before rendering in the preview. HTML tags are stripped — only plain text is stored. URLs are validated against a whitelist of allowed protocols (https, http) to prevent javascript: and data: injection.",
      securitySanitizeTitle: "Input Sanitization",
      securityTitle: "Security Constraints",
      serializationIntro:
        "The builder state is serialized as a JSON array and stored in the builderComponentsJson field of the tenant's DraftBrandingJson. The canvasMode (freeform/grid/builder) is stored as a separate field. On publish, the builder state is promoted to LiveBrandingJson alongside all other branding tokens.",
      serializationSchemaIntro:
        "The stored JSON follows this structure: { canvasMode: 'freeform' | 'grid' | 'builder', gridConfig: { columns: 12, columnGap: 16, rowGap: 16 }, components: [ { id, type, props, position, gridPosition, section, order, responsive } ] }. The schema is versioned for forward compatibility.",
      serializationSchemaTitle: "Serialized Schema",
      serializationSizeIntro:
        "Default property values are NOT stored — only properties that differ from the component type's defaults are serialized. This keeps the JSON payload compact (typically 2–5KB for a complex layout with 10+ components).",
      serializationSizeTitle: "Storage Optimization",
      serializationTitle: "JSON Serialization & Persistence",
      stateComponentIntro:
        "Each BuilderComponent is a serializable object: { id: string, type: ComponentType, props: Record<string, unknown>, position: { x: number, y: number }, gridPosition: { colSpan: number, rowSpan: number, colStart: number, rowStart: number }, section: 'header' | 'body' | 'footer', order: number, responsive: { sm: GridOverride, md: GridOverride } }.",
      stateComponentTitle: "BuilderComponent Schema",
      stateIntro:
        "The builder maintains a flat array of BuilderComponent objects in the StudioDraft. Each component has: id (unique UUID), type (one of 14 types), properties (key-value map), position (x, y for Freeform), gridPosition (col, row, colSpan, rowSpan for Grid), and section (header/body/footer for Builder mode). The entire array is serialized as JSON in the builderComponentsJson field of DraftBrandingJson.",
      stateTitle: "Canvas State Management",
      stateUndoIntro:
        "The builder maintains a history stack for undo/redo operations. Each action (add, move, resize, delete, property change) pushes a snapshot to the stack. Ctrl+Z undoes the last action, Ctrl+Shift+Z redoes. The history stack has a configurable depth limit (default: 50 actions).",
      stateUndoTitle: "Undo/Redo Support",
      title: "Login Page Builder",
    },
    menuSystem: {
      architectureIntro: "Selbstreferenzierende Baumstruktur mit 6-stufiger Pipeline-Filterung.",
      architectureTitle: "Menü-Architektur",
      description:
        "Dynamischer Menübaum mit Berechtigungsfilterung, Mandanten-Scoping und Drag-Drop.",
      endpointsTitle: "Menü-API-Endpunkte",
      entityTitle: "MenuItem Entität",
      filteringIntro: "Sichert ab, dass Admins nur Menüs sehen, auf die sie Zugriff haben.",
      filteringTitle: "Menü-Filter-Pipeline",
      overrideNote: "User-Overrides haben Vorrang vor Tenant-Overrides.",
      overrideTitle: "Override-System",
      reorderTitle: "Drag-Drop Neuordnung",
      title: "Menü-System",
    },
    messageTemplates: {
      architectureIntro:
        "Zentralisierte Verwaltung mit Scriban Engine (Liquid-ähnlich) für Variablen.",
      architectureTitle: "Vorlagen-Architektur",
      builtInTitle: "Integrierte Vorlagen (Built-in)",
      description: "Scriban-basierte zweisprachige Vorlagen für E-Mails und Benachrichtigungen.",
      endpointsTitle: "Template-API-Endpunkte",
      entityTitle: "MessageTemplate Entität",
      previewIntro: "Erlaubt das Rendern von Vorlagen mit Beispieldaten vor dem Versand.",
      previewTitle: "Vorschau-Funktion (Preview)",
      rendererTitle: "Template Renderer",
      syntaxTitle: "Scriban Template-Syntax",
      title: "Nachrichtenvorlagen (Message Templates)",
    },
    multiPageBranding: {
      conflictIntro:
        "Multi-Page Branding includes safeguards to prevent visual inconsistency. When the global design changes (e.g., a new font family), all pages that inherit from the global automatically update — only explicitly overridden tokens remain unchanged. The studio displays a 'Customized' badge on page tabs that have overrides, making it clear which pages have independent configurations.",
      conflictTitle: "Conflict Prevention & Consistency",
      conflictWarning:
        "When a global token is changed (e.g., primaryColor), pages with overrides that include the same token will NOT update — the override takes precedence. This is intentional. To propagate a global change to overridden pages, use the 'Reset to Global' action on those pages first.",
      description:
        "Independent visual customization for Login, Forgot Password, and Reset Password pages — shared design tokens with per-page overrides, isolated preview, and theme integration.",
      intro:
        "Multi-Page Branding extends SCRIPE's Login Customizer Studio to support independent visual configurations for all three authentication pages: Login, Forgot Password, and Reset Password. Instead of forcing a single visual identity across all auth flows, Multi-Page Branding allows tenants to present context-appropriate messaging, layouts, and visual treatments for each page. A shared global design provides consistency, while per-page overrides enable targeted differentiation — all managed through the same zero-code studio interface.",
      pageForgot:
        "Forgot Password Page — The password recovery entry point. Users enter their email to receive a reset link. This page benefits from reassuring messaging ('We'll help you get back in') and softer visual treatments that convey trust and care.",
      pageLogin:
        "Login Page — The primary authentication entry point. Users enter their credentials (email + password) to access the platform. This page receives the most visual attention as it creates the first impression of the tenant's brand.",
      pageReset:
        "Reset Password Page — The password change confirmation page. Users set a new password using the link from their email. This page benefits from action-oriented messaging ('Create your new password') and clear, focused layouts that minimize distraction.",
      pagesIntro:
        "SCRIPE's authentication system exposes three distinct pages, each serving a different user intent. Multi-Page Branding allows independent customization of all three while maintaining visual consistency through shared design tokens.",
      pagesNote:
        "Each page can independently configure: layout, headline, subtitle, background, overlay, and any design token. Tokens not explicitly overridden inherit from the global configuration — enabling 'configure once, override selectively' workflow.",
      pagesTitle: "Supported Authentication Pages",
      previewIntro:
        "Each auth page is previewed in the same sandboxed iframe used by the Login Customizer Studio. When the user switches to a different page tab, the preview URL changes to the corresponding auth route, and new CSS variables (merged from global + page override) are injected via postMessage. The preview supports desktop, tablet, and mobile breakpoints for all three pages.",
      previewIsolationIntro:
        "The preview iframe runs in a completely isolated context — separate from the admin panel's authentication state. This prevents the preview from triggering real login/logout actions. The preview pages are purpose-built components that render the auth UI with injected CSS variables but no authentication logic.",
      previewIsolationTitle: "Preview Isolation",
      previewTitle: "Sandboxed Preview Architecture",
      serializationIntro:
        "Per-page overrides are stored in the tenant's DraftBrandingJson alongside the global configuration. The JSON structure contains a top-level 'pageOverrides' object with 'login', 'forgotPassword', and 'resetPassword' keys. Each key maps to a flat token object. On publish, the entire structure (global + pageOverrides) is promoted to LiveBrandingJson.",
      serializationSchemaIntro:
        "The DraftBrandingJson stores: { selectedLayout, primaryColor, ...(all global tokens), pageOverrides: { login: { panelHeadline, panelSubtitle, ... }, forgotPassword: { selectedLayout, panelHeadline, overlayColor, ... }, resetPassword: { selectedLayout, panelHeadline, ... } } }. Only non-null override tokens are persisted — empty pages are not stored to save space.",
      serializationSchemaTitle: "Stored JSON Schema",
      serializationTitle: "Data Serialization & Persistence",
      sourceComponents:
        "Components: AuthPageTabs.tsx (tab strip), StylePanel.tsx (sidebar with per-page routing)",
      sourceSeeder:
        "Backend: LoginThemeSeeder.cs (PageOverrideDesign records, BuildFullThemeJson pages serialization)",
      sourceStudio: "Studio: useStudioViewModel.ts (page state, merge logic, previewTheme())",
      sourceTitle: "Source File Reference",
      sourceTypes:
        "Types: StudioDraft.ts (pageOverrides interface), ThemeTypes.ts (page override type definitions)",
      stateGlobalIntro:
        "The global layer contains all 50+ design tokens: colors, typography, spacing, overlay, dark mode, and branding panel settings. These tokens apply to ALL auth pages by default. The global layer is always defined — it is never empty.",
      stateGlobalTitle: "Global Layer (Shared Tokens)",
      stateIntro:
        "Multi-Page Branding uses a layered state model. The global StudioDraft contains the base configuration for all pages. Each page has an optional override object (pageOverrides.login, pageOverrides.forgotPassword, pageOverrides.resetPassword) that stores only the tokens that differ from the global. This minimizes storage and simplifies diff tracking.",
      stateMergeIntro:
        "When the studio switches to a specific page tab, the effective configuration is computed as: effectiveConfig = { ...globalDraft, ...pageOverrides[currentPage] }. This spread-merge ensures that page-specific overrides take precedence while all unspecified tokens fall through to the global values. The merge is performed in the previewTheme() function and in the CSS token emission pipeline.",
      stateMergeNote:
        "The merge is a shallow spread — nested objects (like darkColors or overlay) are replaced entirely, not deep-merged. This is intentional: if a page overrides the overlay, it should control the complete overlay configuration, not inherit partial values from the global.",
      stateMergeTitle: "Runtime Merge Strategy",
      stateOverrideIntro:
        "Each page's override layer contains ONLY the tokens that differ from the global configuration. For example, if the Forgot Password page has a different headline and subtitle but shares all colors and typography, only panelHeadline and panelSubtitle are stored in the override. Empty fields inherit from the global layer.",
      stateOverrideTitle: "Page Override Layer (Per-Page Tokens)",
      stateTitle: "State Isolation Model",
      studioEditIntro:
        "When a user modifies a setting while a non-login page is active (e.g., Forgot Password), the change is saved to pageOverrides.forgotPassword — not to the global draft. The studio tracks which page is active and routes edits accordingly. This ensures that changing the forgot-password headline does not affect the login page's headline.",
      studioEditTitle: "Per-Page Editing",
      studioIntro:
        "The Customizer Studio sidebar includes a page tab strip (AuthPageTabs component) that allows switching between Login, Forgot Password, and Reset Password. When the active tab changes, the studio loads the corresponding page override (if any) and merges it with the global draft for preview. The preview iframe navigates to the selected auth page route.",
      studioResetIntro:
        "Each page tab includes a 'Reset to Global' action that removes all per-page overrides for that page, reverting it to the global configuration. This is useful when a tenant wants to undo page-specific customizations and restore visual consistency across all auth pages.",
      studioResetTitle: "Reset to Global",
      studioSwitchIntro:
        "When a user switches tabs: 1. The activePage state is updated to 'login', 'forgotPassword', or 'resetPassword'. 2. The sidebar panels reload with merged values (global + page override). 3. The preview iframe receives an updated postMessage with the merged CSS variables. 4. The iframe URL changes to the corresponding auth route (e.g., /login-preview, /forgot-password-preview, /reset-password-preview). 5. Any changes made in the sidebar are saved to the page override, not the global draft.",
      studioSwitchTitle: "Tab Switching Flow",
      studioTabsIntro:
        "The AuthPageTabs component renders a horizontal tab bar with 3 tabs (Login, Forgot Password, Reset Password). Each tab displays the page name and an optional 'Customized' badge if per-page overrides exist. Clicking a tab updates the activePage state in the studio, triggers a preview refresh, and loads the page-specific sidebar panel settings.",
      studioTabsTitle: "AuthPageTabs Component",
      studioTitle: "Studio Integration — Page Tabs",
      themeCompatIntro:
        "Themes without a 'pages' block are fully backward-compatible. The absence of page overrides means all three auth pages use the global design — the same behavior as themes created before the Multi-Page Branding feature. No migration is required for existing themes.",
      themeCompatTitle: "Backward Compatibility",
      themeImportIntro:
        "The previewTheme() function checks for the 'pages' key in the theme's ThemeDataJson. If found, it extracts the forgotPassword and resetPassword objects and stores them as pageOverrides. If the theme does not include page overrides, the existing pageOverrides are preserved (or cleared, depending on the apply mode).",
      themeImportTitle: "Page Override Import",
      themeIntro:
        "When a marketplace theme includes per-page overrides (pages.forgotPassword, pages.resetPassword), the previewTheme() function in useStudioViewModel.ts automatically imports those overrides into the studio's pageOverrides state. This means applying a theme with per-page branding instantly populates all three auth pages with the theme's intended visual treatment.",
      themeTitle: "Theme Marketplace Integration",
      title: "Multi-Page Branding",
    },
    multiTenancy: {
      architectureTitle: "Architektur",
      auditGroup: "Audit-Konfiguration",
      autoRoleIntro:
        "Beim Erstellen eines Mandanten werden automatisch Super-Admin- und Standardrollen angelegt.",
      autoRoleTitle: "Automatische Rollenerstellung",
      brandingGroup: "Branding",
      cascadeDeleteIntro:
        "Eine Endpunktprüfung zur Vorhersage der Auswirkungen beim Löschen eines Mandanten.",
      cascadeDeleteTitle: "Cascade-Delete-Schutz",
      description:
        "Datenisolierung auf Zeilenebene, hierarchische Mandanten, mandantenspezifische Einstellungen, Branding und Bereichsarchitektur.",
      domainArchIntro:
        "Wenn eine Anfrage eingeht, löst das System den Mandanten auf, indem es den Hostnamen in der TenantDomain-Tabelle nachschlägt. Automatisch generierte Domains (z.B. sofa.scripe.com) sind immer verifiziert und werden sofort aufgelöst. Benutzerdefinierte Domains müssen zuerst die DNS-Verifizierung bestehen. Ein Fallback-Mechanismus mit dem ?code=-Abfrageparameter steht für Entwicklungsumgebungen zur Verfügung, in denen kein DNS konfiguriert ist.",
      domainArchTitle: "Domain-Auflösungsarchitektur",
      domainConfigIntro:
        "Jeder domainbezogene Wert ist über den Tenancy-Abschnitt in appsettings.json konfigurierbar. Das bedeutet, dass Sie die gesamte Plattform umbenennen können — Basis-Domain, CNAME-Ziel, Verifizierungspräfix und Token-Präfix ändern — indem Sie einen einzigen Konfigurationsblock bearbeiten. Keine Code-Änderungen erforderlich. Das Backend injiziert TenancySettings über IOptions<T>, und das Frontend erhält das CNAME-Ziel und das Verifizierungspräfix aus der GET /domains API-Antwort.",
      domainConfigTip:
        "Um auf einer völlig anderen Domain bereitzustellen (z.B. myplatform.io statt scripe.com), aktualisieren Sie einfach die 4 Werte in appsettings.json. Alle automatisch generierten Subdomains, DNS-Anweisungen und Verifizierungstokens verwenden automatisch die neuen Werte.",
      domainConfigTitle: "Konfigurierbarer Plattform-Domain",
      domainDnsIntro:
        "Benutzerdefinierte Domains erfordern eine DNS-Verifizierung zum Eigentumsnachweis. Wenn ein Admin eine benutzerdefinierte Domain hinzufügt, generiert das System einen eindeutigen Verifizierungstoken. Der Admin konfiguriert dann zwei DNS-Einträge: einen CNAME-Eintrag, der die Domain auf das CnameTarget der Plattform verweist, und einen TXT-Eintrag bei {VerificationPrefix}.{domain} mit dem Verifizierungstoken. Nach der Konfiguration löst ein Klick auf 'Verifizieren' eine DNS-Abfrage aus, um beide Einträge zu bestätigen.",
      domainDnsNote:
        "Die DNS-Verifizierung ist derzeit ein UI-gesteuerter Prozess, bei dem der Admin auf 'Verifizieren' klickt, um die Prüfung auszulösen. Das Backend-Platzhalter ist bereit für die vollständige DNS-Auflösungsintegration. Automatisch generierte Domains überspringen die Verifizierung vollständig — sie sind immer vertrauenswürdig.",
      domainDnsTitle: "DNS-Verifizierungsablauf",
      domainEndpointsTitle: "Domain-API-Endpunkte",
      domainIntro:
        "Jeder Mandant kann mehrere Domains besitzen — eine automatisch generierte Subdomain, die bei der Erstellung des Mandanten erstellt wird, sowie optionale benutzerdefinierte Domains, die von Administratoren hinzugefügt werden. Das System unterstützt DNS-basierte Domain-Verifizierung, um den Besitz benutzerdefinierter Domains nachzuweisen, bevor sie aktiv werden. Alle domainbezogenen Konfigurationen sind vollständig in appsettings.json ausgelagert, was nahtloses Rebranding und Multi-Deployment-Setups ermöglicht.",
      domainTitle: "Domain-Verwaltung",
      domainTypesTitle: "Domain-Typen",
      endpointsCrudTitle: "CRUD-Endpunkte",
      endpointsDrilldownTitle: "Drilldown-Endpunkte",
      endpointsHierarchyTitle: "Hierarchie-Endpunkte",
      endpointsPermissionsTitle: "Berechtigungs-Endpunkte",
      endpointsSettingsTitle: "Einstellungs-Endpunkte",
      endpointsTitle: "Mandanten-API-Endpunkte",
      featureBranding: "Benutzerdefiniertes Branding",
      featureBrandingDesc: "Laden Sie Mandanten-Logos hoch und passen Sie Farben an.",
      featureDataScoping: "Daten-Scoping",
      featureDataScopingDesc:
        "Sämtliche Geschäftsdaten werden automatisch dem Mandanten zugeordnet.",
      featureIsolation: "Datenisolierung",
      featureIsolationDesc: "Isolierung auf Zeilenebene über globale EF Core-Abfragefilter.",
      featureRoleScoping: "Rollen-Scoping",
      featureRoleScopingDesc: "Rollen sind auf den Mandanten beschränkt.",
      featureSettings: "Mandantenspezifische Einstellungen",
      featureSettingsDesc:
        "Unabhängige Konfigurationen für Quotas, Sicherheitsrichtlinien und Audit-Einstellungen.",
      featuresTitle: "Mandanten-Funktionen",
      featureUserScoping: "Benutzer-Scoping",
      featureUserScopingDesc: "Benutzer gehören zu einem einzigen Mandanten.",
      hierarchyIntro: "Mandanten bilden eine Baumstruktur (Parent/Child).",
      hierarchyTitle: "Mandanten-Hierarchie",
      intro:
        "SCRIPE unterstützt vollständige Mandantenfähigkeit (Multi-Tenancy) mit Datenisolierung auf Zeilenebene.",
      logoTip: "Mandantenlogos werden über eine Static File Middleware bereitgestellt.",
      permissionInheritanceIntro:
        "Ein Kind-Mandant kann niemals mehr Rechte haben als sein Eltern-Mandant.",
      permissionInheritanceTitle: "Berechtigungsvererbung",
      quotaGroup: "Quota-Einstellungen",
      securityGroup: "Sicherheitsrichtlinie",
      settingsIntro: "Jeder Mandant hat eine unabhängige Konfigurationsentität.",
      settingsTitle: "Mandanteneinstellungen (Tenant Settings)",
      title: "Mandantenfähigkeit (Multi-Tenancy)",
    },
    notificationSystem: {
      architectureIntro: "Persistierung in der Datenbank und Push via NotificationHub.",
      architectureTitle: "Architektur",
      autoJoinTitle: "Auto-Join-Muster",
      clientInterfaceTitle: "Hub-Client-Schnittstelle",
      description:
        "Echtzeit-Benachrichtigungen via SignalR mit automatischem Gruppenbeitritt und Historie.",
      endpointsTitle: "Benachrichtigungs-API-Endpunkte",
      hubIntro: "SignalR-Hub mit Auto-Join für benutzerspezifische Gruppen.",
      hubTitle: "NotificationHub",
      serviceTitle: "NotificationService-Methoden",
      title: "Benachrichtigungssystem",
    },
    recycleBin: {
      cascadeIntro:
        "Verwendet ExecuteUpdateAsync für schnelle Massenwiederherstellungen von Hierarchien.",
      cascadeTitle: "Cascade Restore",
      description:
        "Soft-Delete-Management mit Cascade-Restore, Massenoperationen und dauerhafter Löschung.",
      endpointsTitle: "Papierkorb-Endpunkte",
      executeUpdateTitle: "ExecuteUpdateAsync vs Traditionelles EF",
      ignoreFiltersTitle: "IgnoreQueryFilters Muster",
      ignoreFiltersWarning:
        "Umgeht ALLE globalen Filter. Ein expliziter Mandantenfilter muss hinzugefügt werden.",
      interceptorNote: "Umgeht den Change Tracker, weshalb Audits manuell geschrieben werden.",
      purgeVsRestoreTitle: "Purge vs Restore (Löschen vs Wiederherstellen)",
      purgeWarning: "Purge ist irreversibel (harter DELETE), primär für DSGVO-Compliance.",
      softDeleteIntro:
        "IsDeleted wird auf true gesetzt und der Datensatz via Query-Filter verborgen.",
      softDeleteTitle: "Wie Soft-Delete funktioniert",
      title: "Papierkorb (Recycle Bin)",
    },
    rolePermissions: {
      authPipelineIntro: "Richtlinien werden on-the-fly aus Attributen erstellt.",
      authPipelineTitle: "Autorisierungs-Pipeline",
      cloneRoleIntro:
        "Kopiert eine Rolle, lässt aber nur Berechtigungen zu, die der klonende Admin selbst besitzt.",
      cloneRoleTitle: "Rolle klonen (Anti-Eskalation)",
      description:
        "RBAC-System mit Scope-Override, Einschränkungen auf Feldebene, Anti-Eskalation und mandantenbezogenen Rollen.",
      endpointsMyTenantTitle: "Endpunkte des eigenen Mandanten",
      endpointsPermissionsTitle: "Berechtigungs-Endpunkte",
      endpointsTitle: "Rollen-API-Endpunkte",
      hierarchyTitle: "Berechtigungshierarchie",
      intro:
        "Ein umfassendes rollenbasiertes Zugriffskontrollsystem (RBAC) mit feingranularen Berechtigungen.",
      restrictedFieldsIntro:
        "Rollen können den Zugriff auf sensible Felder (wie Gehalt oder SSN) verbergen.",
      restrictedFieldsTitle: "Einschränkungen auf Feldebene (Restricted Fields)",
      rolePropertiesIntro: "System-Flags steuern das Verhalten und den Schutz von Rollen.",
      rolePropertiesTitle: "Rollen-Entitäts-Eigenschaften",
      scopeOverrideIntro:
        "Jede RolePermission kann den Standard-Scope einer Berechtigung überschreiben.",
      scopeOverrideTitle: "Scope Override (Datenzugriffskontrolle)",
      systemIntro: "Berechtigungen sind in Kategorien organisiert (Muster: {resource}.{action}).",
      systemTitle: "Berechtigungssystem",
      tenantScopingNote: "Rollen sind automatisch auf den aktuellen Mandanten beschränkt.",
      title: "Rollen & Berechtigungen (RBAC)",
      userGroupEndpointsTitle: "User Groups API Endpunkte",
      userGroupsIntro:
        "Ermöglicht die gebündelte Zuweisung von Rollen und Feldeinschränkungen an mehrere Administratoren.",
      userGroupsNote: "Gruppen sind additiv – Berechtigungen verschmelzen (UNION) beim Login.",
      userGroupsTitle: "Benutzergruppen (User Groups)",
    },
    ssoOauth: {
      config1Content:
        "Navigieren Sie zu /settings/identity-providers. Geben Sie Discovery/Authority-URL, Client-ID und Secret aus Azure AD oder Google ein. SCRIPE verhandelt OIDC-Metadaten vollautomatisch.",
      config1Title: "1. Externen Identity Provider binden",
      config2Content:
        "Konfigurieren Sie Scopes (openid, profile, email). SCRIPE mappt externe JWT-Claims (wie preferred_username, picture, given_name) automatisch auf interne Admin-/Nutzerprofile, ohne manuelle Dateneingabe.",
      config2Title: "2. Automatisches Claim-Mapping",
      config3Content:
        "Legen Sie fest, ob der Anbieter für Admins (Back-Office) oder Nutzer (Front-Office) ist. Identitätsbindungen sind strikt typisiert, was verhindert, dass sich ein externer Nutzer zu einer Admin-Sitzung hochstuft.",
      config3Title: "3. IAM-Richtlinien durchsetzen",
      config4Content:
        "Navigieren Sie zu /settings/oauth-apps, um SCRIPE zum SSO-Anbieter für externe Software (z. B. mobile App oder CRM) zu machen. Definieren Sie Public (SPA) oder Confidential (Backend) Profile.",
      config4Title: "4. Drittanbieter-Apps registrieren",
      config5Content:
        "Externe Anwendungen leiten ihre Authority einfach auf `https://ihre-scripe-instanz.com`. SCRIPE stellt automatisch die Endpunkte `/.well-known/openid-configuration` und `/.well-known/jwks` bereit.",
      config5Title: "5. Jwks Uri & Discovery",
      configContent: "SCRIPE als primäres Authentifizierungs-Gateway konfigurieren:",
      configTitle: "IAM Setup-Handbuch",
      description:
        "Authentifizierungsserver auf Enterprise-Niveau, der Keycloak, Okta und Auth0 ersetzen kann. Native OIDC-Identity-Provider, OAuth-App-Registrierung, PKCE-Durchsetzung und isolierte Mandantenföderationen.",
      feat1Desc:
        "Binden Sie externe OIDC/OAuth2-Identitätsanbieter sofort an bestimmte Mandanten. Zero-Code-Integration für Azure AD, Google, Okta, Auth0, AWS Cognito oder andere OIDC-kompatible Systeme.",
      feat1Title: "Föderierte Identitätsanbieter (IdP)",
      feat2Desc:
        "Ersetzen Sie Keycloak. Registrieren Sie Business-Systeme von Drittanbietern direkt in SCRIPE. Erstellen Sie Client-IDs und Secrets, steuern Sie Scopes und stellen Sie Enterprise-Grade JWTs aus, die vom SCRIPE-Identitätsspeicher gestützt werden.",
      feat2Title: "SCRIPE als Server (OAuth-Apps)",
      feat3Desc:
        "Der veraltete Implicit Flow wurde beseitigt. Die gesamte Authentifizierung – intern und extern – wird streng über Proof Key for Code Exchange (PKCE) über Authorization Code Flows durchgesetzt. Geheimnisse gelangen niemals in den Browser.",
      feat3Title: "Strenge PKCE & Sicherheit",
      feat4Desc:
        "Jeder Mandant ist sein eigener isolierter IAM-Realm. Mandanten verwalten ihre eigenen externen SSO-Anbieter und stellen Zugangsdaten für ihre eigenen OAuth-Anwendungen aus, ohne die globale Root-Infrastruktur zu berühren.",
      feat4Title: "Multi-Tenant IAM-Isolierung",
      intro:
        "SCRIPE ist nicht nur eine Anwendung; es ist ein Enterprise Identity and Access Management (IAM) Server, der auf OpenIddict basiert. Er funktioniert äquivalent zu Keycloak – als OIDC Relying Party (Client) und als aktiver OAuth2/OIDC-Autorisierungsserver. Mandanten können sich nach außen bei Azure AD/Google authentifizieren oder Systeme von Drittanbietern registrieren, die sich gegen SCRIPE authentifizieren.",
      loginFlowContent:
        "Beim Login in SCRIPE über Azure AD agiert SCRIPE als Client. Nutzer werden zu Azure geleitet; SCRIPE akzeptiert den Callback, validiert das externe JWT und stellt dann EIN EIGENES internes JWT aus. Dies entkoppelt die interne Autorisierung vom externen Anbieter vollständig.",
      loginFlowTitle: "OIDC Architektur",
      managementContent:
        "SCRIPE bietet ein dediziertes IAM-Kontrollzentrum in den Systemeinstellungen für die OIDC-Client-Aggregation und die Server-Emissionskonfiguration.",
      managementTitle: "IAM Control Center",
      overviewTitle: "Enterprise IAM Funktionen",
      scopingContent:
        "SCRIPE entspricht dem Realm-Konzept von Keycloak durch Mandantenpartitionen. Identity Provider und OAuth-Apps sind strikt an ihre TenantId gebunden. SuperAdmins verwalten alle Realms über 'Tenant-Welt betreten'.",
      scopingTip:
        "Im Gegensatz zu einfachen SaaS-Produkten mischt SCRIPE niemals Identitätskonfigurationen. Wenn Mandant A sein Azure AD anbindet, hat Mandant B absolut keinen Einblick in diese Infrastruktur.",
      scopingTitle: "Realm (Mandanten) Partitionierung",
      title: "SSO & OAuth Server (Keycloak-Alternative)",
    },
    themeMarketplace: {
      applyIntro:
        "Applying a marketplace theme follows a 5-step pipeline: 1. User clicks Apply on a theme. 2. Frontend reads the theme's ThemeDataJson. 3. previewTheme() in useStudioViewModel merges the design tokens (including per-page overrides) into the current StudioDraft. 4. The merged draft is saved to the tenant's DraftBrandingJson via PUT /tenants/{id}/settings. 5. Admin publishes the draft to make it live.",
      applyTitle: "Theme Application Flow",
      archDataFlowIntro:
        "1. LoginThemeSeeder.cs seeds 40 themes at application startup (upsert-safe). 2. ThemesController exposes GET /themes (list), GET /themes/{id} (detail), POST /themes/{id}/apply (apply). 3. Frontend ThemeMarketplaceService calls the API via IApiService. 4. ThemeMarketplaceMapper converts DTOs to domain entities. 5. ThemeMarketplaceRepository orchestrates services + mappers. 6. useThemeMarketplace hook provides ViewModel state. 7. ThemeGalleryView renders the marketplace UI.",
      archDataFlowTitle: "Data Flow Pipeline",
      archIntro:
        "The Theme Marketplace follows a pipeline architecture: backend seeder populates the LoginTheme table with 40 records → API exposes paginated list, detail, and apply endpoints → frontend gallery renders themes with advanced filtering → apply action snapshots the ThemeDataJson into tenant's DraftBrandingJson → publish propagates to LiveBrandingJson. Each layer is fully decoupled.",
      archLayersIntro:
        "The marketplace follows SCRIPE's standard 3-layer module structure: Domain layer (ThemeDetail entity, IThemeMarketplaceRepository, IThemeMarketplaceService interfaces), Data layer (ThemeMarketplaceService, ThemeMarketplaceRepository, ThemeMarketplaceMapper, ThemeMarketplaceTypes models), and Presentation layer (ThemeGalleryView, ThemeManagementView, ThemeDetailModal, ThemeCard, useThemeMarketplace hook).",
      archLayersTitle: "Clean Architecture Layers",
      archTitle: "Marketplace Architecture",
      catalogDiversityIntro:
        "The 40-theme catalog achieves maximum diversity across multiple axes: each theme uses a unique Google Font pairing, no two themes share the same color palette, all 7 categories are represented, and the layout distribution covers T1 Split (16), T2 Full-Page (12), T3 Centered (6), and T4 Special (6). This ensures every tenant can find a theme that matches their brand identity.",
      catalogDiversityTitle: "Design Diversity Matrix",
      catalogIntro:
        "SCRIPE ships with 40 meticulously designed branding packages. Each theme is a unique visual identity crafted for a specific market segment or brand aesthetic. Themes span 7 categories, use 30+ different Google Fonts, cover all 22 layouts, and include per-page branding overrides for Login, Forgot Password, and Reset Password.",
      catalogTitle: "40-Theme Catalog Overview",
      catCorporate:
        "Corporate — Professional business identity. Clean lines, serif/sans-serif font pairs, subtle gradients, blue/navy/gray palettes. Designed for financial services, consulting, law firms.",
      catCreative:
        "Creative — Bold, expressive identity. Vibrant colors, playful typography (Poppins, Quicksand), animated gradients, modern card layouts. Designed for agencies, startups, tech companies.",
      catDark:
        "Dark — Sophisticated dark-mode-first identity. Deep backgrounds (slate, zinc, charcoal), accent-driven highlights (cyan, amber, rose), premium glass effects. Designed for developer tools, media, gaming.",
      categoriesIntro:
        "Every theme belongs to exactly one category. Categories enable intuitive gallery browsing and filtering. The distribution ensures broad coverage: Corporate (8), Creative (6), Dark (6), Minimal (5), Elegant (5), Luxury (5), Nature (5).",
      categoriesTitle: "7 Theme Categories",
      catElegant:
        "Elegant — Refined, luxurious identity. Rose gold, champagne, pearl gradients, serif typography (Playfair Display, Cormorant), delicate overlays. Designed for beauty, fashion, hospitality.",
      catLuxury:
        "Luxury — Ultra-premium brand identity. Black/gold/platinum palettes, display typography (Italiana, Cinzel Decorative), full-bleed imagery, art-directed layouts. Designed for high-end brands, private banking, exclusive services.",
      catMinimal:
        "Minimal — Reductive, content-focused identity. Monochromatic palettes, generous whitespace, thin borders, system-optimized typography. Designed for productivity tools, documentation, SaaS platforms.",
      catNature:
        "Nature — Organic, earth-inspired identity. Forest greens, terracotta, ocean blues, botanical accents, rounded shapes, warm serif typography. Designed for sustainability, wellness, organic brands.",
      compDetailModal:
        "ThemeDetailModal (28KB) — Richly detailed theme preview modal. Contains: full-size preview image, design token summary (colors, fonts, spacing), feature matrix (dark mode, per-page, overlay), category/tier badges, Apply button with confirmation dialog, and like/favorite toggles.",
      compGalleryView:
        "ThemeGalleryView (26KB) — Full-page marketplace with animated hero section, category filter chips, search bar, grid/list view toggle, tier filter tabs, sort controls (popular/newest/name), infinite scroll pagination, and a responsive 3-column grid of ThemeCard components.",
      compManagementView:
        "ThemeManagementView (12KB) — Admin CRUD page for managing system themes. DataTable with columns: thumbnail, name, category, tier, status, likes, applies, actions. Supports create, edit, activate/deactivate, and bulk operations.",
      compMarketplacePanel:
        "ThemeMarketplacePanel — Inline panel within the Customizer Studio sidebar. Shows a compact gallery of themes with quick-apply functionality. Allows browsing and applying themes without leaving the studio.",
      componentsIntro:
        "The Theme Marketplace frontend consists of 8 purpose-built components spanning 3 pages and 1 modal. Each component follows SCRIPE's presentation-layer patterns using domain entities (never DTOs) and consuming data exclusively through the DI container.",
      componentsTitle: "Frontend Component Inventory",
      compThemeCard:
        "ThemeCard — Gallery grid item. Displays: thumbnail, name, category badge, tier badge, color palette strip (5 primary colors), font family name, like count, apply count, and hover-to-preview animation.",
      copyOnApplyIntro:
        "When a theme is applied, the ThemeDataJson is COPIED into the tenant's DraftBrandingJson — not linked. This means the tenant's branding is permanently isolated from future marketplace updates. If the theme is updated in v2.0, existing tenants who applied v1.0 retain their v1.0 snapshot. This prevents unexpected visual changes to production login pages.",
      copyOnApplyNote:
        "Copy-on-apply is a deliberate architectural decision. It trades storage efficiency for deployment safety — a critical requirement for enterprise tenants who negotiate specific branding contracts.",
      copyOnApplyTitle: "Copy-on-Apply Snapshot Semantics",
      description:
        "40 premium branding packages, 7 categories, 5 pricing tiers, per-page overrides, copy-on-apply snapshot semantics, and a full clean-architecture data layer — all seeded and ready to browse.",
      endpointApply:
        "POST /api/v1/themes/{id}/apply — Apply theme to the current tenant's draft settings. Copies ThemeDataJson to DraftBrandingJson.",
      endpointDetail:
        "GET /api/v1/themes/{id} — Full theme detail including ThemeDataJson, metadata, and engagement counters.",
      endpointLike:
        "POST /api/v1/themes/{id}/like — Toggle like/favorite for the current admin. Increments/decrements LikesCount.",
      endpointList:
        "GET /api/v1/themes — Paginated list of active themes with category, tier, and search filters.",
      endpointManage:
        "POST/PUT/DELETE /api/v1/themes — System admin CRUD for managing theme catalog (create, update, deactivate).",
      endpointsIntro:
        "The theme marketplace exposes endpoints through the existing TenantSettings and Themes controllers. Theme data is served as part of the branding configuration pipeline.",
      endpointsTitle: "Theme API Endpoints",
      entityFieldApplied:
        "AppliedCount — Usage counter. Tracks how many tenants have applied this theme.",
      entityFieldAuthor: "Author — Creator identifier (e.g., 'SCRIPE Design Team').",
      entityFieldCategory:
        "Category — Classification tag (corporate, creative, dark, elegant, luxury, minimal, nature). Used for gallery filtering.",
      entityFieldDescription:
        "Description — Marketing-quality description of the theme's visual identity and design philosophy.",
      entityFieldIsActive:
        "IsActive — Boolean flag. Inactive themes are hidden from the gallery but preserved in the database.",
      entityFieldIsSystem:
        "IsSystemTheme — Boolean flag. System themes are seeded at startup and cannot be deleted by tenants.",
      entityFieldLikes:
        "LikesCount — Engagement counter. Tracks how many tenants have favorited this theme.",
      entityFieldName:
        "Name — Human-readable theme name (e.g., 'Midnight Aurora', 'Sakura Bloom'). Unique per system.",
      entityFieldPreviewUrl:
        "PreviewUrl — Optional full-size preview image URL for the detail modal.",
      entityFieldsTitle: "Entity Fields",
      entityFieldTag:
        "Tags — Optional comma-separated tags for search (e.g., 'gradient, glass, modern, dark').",
      entityFieldThemeData:
        "ThemeDataJson — JSON column containing the complete design specification (50+ tokens). This is the heart of each theme.",
      entityFieldThumbnail: "ThumbnailUrl — Optional preview image URL for gallery cards.",
      entityFieldTier:
        "Tier — Pricing/access tier (Free, Starter, Professional, Enterprise, StandaloneAddon). Controls edition-based access gating.",
      entityFieldVersion:
        "Version — Semantic version string (e.g., '1.0.0'). Incremented when the theme design is updated.",
      entityIntro:
        "Each marketplace theme is stored as a LoginTheme entity in the Identity module's database. The entity extends AuditableEntity, providing soft-delete, audit trail, and optimistic concurrency. The core data is stored in ThemeDataJson — a JSON column containing the full design specification.",
      entityTitle: "LoginTheme Entity",
      governanceEditionIntro:
        "Each theme's Tier field maps to an edition level. The frontend gallery marks themes above the tenant's edition with an 'Upgrade Required' badge and disables the Apply button. The backend apply endpoint verifies the tenant's active subscription against the theme's tier before allowing application.",
      governanceEditionTitle: "Edition-Based Tier Enforcement",
      governanceIntro:
        "Theme access is controlled by a combination of edition-based tier enforcement and permission-based administrative access. The marketplace respects SCRIPE's multi-tenancy model — themes are globally visible but apply operations are scoped to the current tenant.",
      governancePermissionIntro:
        "Browsing the marketplace requires the branding.view permission. Applying a theme requires branding.manage. Managing system themes (CRUD) requires the themes.manage permission, which is restricted to System Admins.",
      governancePermissionTitle: "Permission Requirements",
      governanceTenantIntro:
        "When a theme is applied, it modifies only the current tenant's DraftBrandingJson. The apply operation is scoped via the JWT tenant_id claim. SuperAdmins can apply themes on behalf of any tenant via the 'Enter Tenant World' drill-down capability.",
      governanceTenantTitle: "Tenant Isolation",
      governanceTitle: "Marketplace Governance",
      intro:
        "The Theme Marketplace is SCRIPE's curated catalog of 40 production-ready branding packages. Each theme is a comprehensive visual identity — not just a color swap — containing 50+ design tokens spanning colors, typography, spacing, overlay, dark mode, branding panel, and per-page overrides for Login, Forgot Password, and Reset Password pages. Themes are stored as structured JSON in the LoginTheme entity, browsable via a full-page gallery with rich filtering, and applied to tenant settings with copy-on-apply snapshot semantics that permanently isolate applied configurations from future marketplace updates.",
      perPageIntro:
        "Each theme can define independent visual overrides for three authentication pages: Login, Forgot Password, and Reset Password. The 'pages' block in ThemeDataJson contains page-specific layout, headline, subtitle, overlay, and background settings that are merged on top of the global design when that page is active. This enables a single theme to present different messaging and visual treatments for different auth flows.",
      perPageIsolationNote:
        "Each auth page can have its own layout, headline, subtitle, and overlay without affecting the other pages. The Login page might use a full-image corporate layout while Forgot Password uses a clean centered card — all within the same theme.",
      perPageIsolationTitle: "State Isolation",
      perPageMergeIntro:
        "When a tenant previews a theme's Forgot Password page, the frontend merges the global design tokens with the forgotPassword override using spread semantics: { ...globalTokens, ...pages.forgotPassword }. This means any token not specified in the page override inherits from the global design — only the explicitly overridden values change. The merge happens in the previewTheme() function in useStudioViewModel.ts.",
      perPageMergeTitle: "Merge Strategy",
      perPageStructIntro:
        "The 'pages' object in ThemeDataJson contains three optional keys: 'login', 'forgotPassword', and 'resetPassword'. Each key maps to a page override object with fields: selectedLayout, panelHeadline, panelSubtitle, overlayColor, overlayOpacity, backgroundType, backgroundValue, and any other token that should differ from the global configuration.",
      perPageStructTitle: "Pages Block Structure",
      perPageTitle: "Per-Page Branding Architecture",
      previewFlowIntro:
        "The previewTheme() function in useStudioViewModel.ts performs a non-destructive preview by temporarily injecting theme tokens into the draft state. The preview is displayed in the sandboxed iframe via postMessage CSS variable injection. The draft is NOT saved until the user explicitly confirms the application. Canceling the preview restores the previous draft state.",
      previewFlowTitle: "Preview Before Apply",
      schemaColorsIntro:
        "The colors section defines the complete light-mode palette: primaryColor (brand accent), secondaryColor (complementary), backgroundColor (page background), formBackground (form card), textColor (primary text), secondaryTextColor (muted text), inputBackground (form input fields), inputBorderColor, inputTextColor, buttonColor (primary CTA), buttonTextColor, buttonHoverColor, linkColor, linkHoverColor, borderColor (general borders), and accentColor (highlights/badges).",
      schemaColorsTitle: "Color System (16 Tokens)",
      schemaDarkIntro:
        "Independent dark-mode palette: darkEnabled (boolean toggle), darkFormBackground, darkTextColor, darkInputBackground, darkInputBorderColor, darkInputTextColor, darkButtonColor, darkButtonTextColor, darkSecondaryTextColor, and darkBorderColor. These tokens are emitted as --login-dark-* CSS variables and activated via the [data-theme='dark'] selector.",
      schemaDarkTitle: "Dark Mode Color System (10 Tokens)",
      schemaIntro:
        "The ThemeDataJson column stores a comprehensive JSON object containing every visual parameter needed to fully render a branded login page. The schema is versioned and contains 7 major sections: layout, colors, dark mode colors, typography, spacing, overlay, and branding panel. Each token maps directly to a CSS custom property via the useLoginBrandingTokens pipeline.",
      schemaLayoutIntro:
        "Controls the page structure: selectedLayout (one of 22 layout identifiers), loginPosition (left/center/right), formWidth, formMaxWidth, containerPadding, and formAlignment. Layout selection determines which rendering strategy the LoginPage component uses.",
      schemaLayoutTitle: "Layout Configuration",
      schemaOverlayIntro:
        "Controls visual effects layered on backgrounds: overlayColor (RGBA), overlayOpacity (0–100%), overlayBlur (0–20px in Gaussian blur), backgroundType ('color', 'gradient', 'image'), backgroundValue (CSS gradient string or image URL), backgroundSize, backgroundPosition, and backgroundRepeat. Overlay settings can be scoped to the form section or branding panel independently.",
      schemaOverlayTitle: "Overlay & Effects (8 Tokens)",
      schemaPanelIntro:
        "Controls the branding side of split layouts: panelLogo (URL), panelHeadline (heading text), panelSubtitle (subheading text), panelHeadlineColor, panelSubtitleColor, panelBackgroundType, panelBackgroundValue, panelOverlayColor, panelOverlayOpacity, panelOverlayBlur, panelLogoSize (small/medium/large), and panelAlignment (left/center/right). These tokens are only rendered in T1 Split layouts.",
      schemaPanelTitle: "Branding Panel Configuration (12 Tokens)",
      schemaSpacingIntro:
        "Controls layout geometry: borderRadius (global border-radius in px), inputBorderRadius, buttonBorderRadius, inputHeight (in px), buttonHeight, and gap (spacing between form elements). These values are emitted as CSS custom properties and applied uniformly across all 22 layouts.",
      schemaSpacingTitle: "Spacing & Dimensions (6 Tokens)",
      schemaTitle: "ThemeDataJson Schema (50+ Design Tokens)",
      schemaTypographyIntro:
        "Controls all text rendering: fontFamily (Google Fonts name, e.g., 'Playfair Display'), headingFontFamily (optional separate heading font), fontSize (base size in px), headingSize, labelSize, inputFontSize, fontWeight (normal/medium/semibold/bold), and letterSpacing. Fonts are loaded dynamically via the Google Fonts CDN.",
      schemaTypographyTitle: "Typography Configuration (8 Tokens)",
      schemaVersionIntro:
        "The root 'version' field tracks the JSON schema version. Current version is '2.0'. The frontend handles backward compatibility — older schemas are normalized at read time.",
      schemaVersionTitle: "Schema Version",
      seedHelperIntro:
        "The seeder uses a fluent Build() helper with ThemeMeta and ThemeDesign records for clean theme definition. ThemeMeta contains name, category, tier, description, author, version, and tags. ThemeDesign contains all 50+ design tokens plus per-page overrides (PageOverrideDesign records for ForgotPassword and ResetPassword). The BuildFullThemeJson() method serializes the ThemeDesign record into the JSON format expected by the frontend.",
      seedHelperTitle: "Build() Helper Architecture",
      seedingIntro:
        "All 40 themes are seeded at application startup by LoginThemeSeeder.cs. The seeder uses an upsert-safe strategy: it checks for existing themes by Name and only inserts new ones — existing themes are never overwritten. This ensures idempotent deployment across environments.",
      seedingTitle: "Backend Seeding Architecture",
      seedUpsertIntro:
        "The seeder queries all existing theme names before processing. For each of the 40 themes, it checks the existing set — if the name exists, the theme is skipped. New themes are added to the DbContext in a single batch and saved with one SaveChangesAsync call. This makes the seeder safe to run repeatedly without duplicating themes or losing manual edits.",
      seedUpsertTitle: "Upsert-Safe Strategy",
      sourceBackend:
        "Backend: LoginThemeSeeder.cs (seeder), LoginTheme.cs (entity), ThemeConfiguration.cs (EF config)",
      sourceData:
        "Data Layer: ThemeMarketplaceService.ts, ThemeMarketplaceRepository.ts, ThemeMarketplaceMapper.ts, ThemeMarketplaceTypes.ts",
      sourceDomain:
        "Domain Layer: ThemeDetail.ts (entity), IThemeMarketplaceService.ts, IThemeMarketplaceRepository.ts",
      sourceFrontend:
        "Frontend: ThemeGalleryView.tsx, ThemeManagementView.tsx, ThemeDetailModal.tsx, ThemeCard.tsx",
      sourceTitle: "Source File Reference",
      sourceViewModel:
        "ViewModel: useThemeMarketplace.ts (gallery state), useStudioViewModel.ts (preview/apply integration)",
      tierEnterpriseIntro:
        "Premium branding packages for Enterprise-edition tenants. Ultra-premium designs with cinematic layouts, luxury typography (Cormorant Garamond, Italiana, Cinzel Decorative), and exclusive dark-mode treatments.",
      tierEnterpriseTitle: "Enterprise Tier (8 Themes)",
      tierFreeIntro:
        "Essential branding packages available to all tenants regardless of edition. Clean, professional designs suitable for quick deployment. Includes Starter themes across corporate, minimal, and creative categories.",
      tierFreeTitle: "Free Tier (8 Themes)",
      tierIntro:
        "Themes are organized into 5 pricing tiers that align with SCRIPE's edition system. Each tier provides increasing design sophistication and customization depth. Tier enforcement is handled by the theme marketplace frontend — themes from higher tiers display an 'Upgrade Required' badge and disable the Apply button for tenants on lower editions.",
      tierProIntro:
        "Advanced branding packages for Professional-edition tenants. Sophisticated visual treatments with glass-morphism effects, editorial typography, and multi-tone overlays. Includes the most diverse category coverage.",
      tierProTitle: "Professional Tier (10 Themes)",
      tierStandaloneIntro:
        "Ultra-exclusive standalone branding packages available as individual add-on purchases. These represent the most unique and specialized designs — botanical illustrations, art deco, brutalist, vaporwave, and zen-inspired themes that make a bold brand statement.",
      tierStandaloneTitle: "Standalone Add-on Tier (6 Themes)",
      tierStarterIntro:
        "Enhanced branding packages for Starter-edition tenants. Richer color palettes, premium font pairings, and gradient backgrounds. Includes Starter-exclusive designs across corporate, dark, and elegant categories.",
      tierStarterTitle: "Starter Tier (8 Themes)",
      tierTitle: "5-Tier Pricing Model",
      title: "Theme Marketplace",
    },
    userGroups: {
      architectureIntro:
        "Enthält Mitglieder, Rollen und Feldeinschränkungen, angebunden an den Mandanten.",
      architectureTitle: "Architektur",
      cascadeIntro:
        "Ermöglicht das Massen-Löschen (Soft-Delete) von Administratoren, die an eine Gruppe gebunden sind.",
      cascadeNote: "Überspringt automatisch geschützte Admins (Tenant Owner).",
      cascadeTitle: "Cascade-Operationen",
      description:
        "Gruppenbasierte Rollen- und Einschränkungszuweisung mit additivem Merge beim Login.",
      domainModelIntro: "Junction-Tabellen verbinden Administratoren und Rollen mit der Gruppe.",
      domainModelTitle: "Domain-Modell",
      endpointsTitle: "API-Endpunkte (12)",
      frontendIntro:
        "Standard-CRUD-Listen mit GenericCrudView und 3 Tabs für die Detailverwaltung.",
      frontendTitle: "Frontend-Modul",
      howItWorksIntro:
        "Die effektiven Berechtigungen sind eine UNION aus direkten und gruppenvererbten Rollen.",
      howItWorksTitle: "Funktionsweise beim Login",
      intro:
        "Skalierbare Verwaltung von Flotten von Administratoren durch gebündelte Berechtigungen.",
      memberManagementIntro:
        "Das Hinzufügen ist idempotent, das Entfernen betrifft keine direkten Rollen.",
      memberManagementTitle: "Mitgliederverwaltung",
      mergeNote:
        "Gruppenrollen sind additiv – sie KÖNNEN direkte Zuweisungen niemals entfernen (Deny Wins).",
      restrictionsIntro:
        "Folgt demselben UNION-Prinzip wie Rollen zur Ausblendung sensibler Felder.",
      restrictionsTitle: "Feldeinschränkungen (Field Restrictions)",
      roleAssignmentIntro: "Verwendet das Nuke-and-Pave-Muster für garantierte UI-Synchronisation.",
      roleAssignmentTitle: "Rollenzuweisung",
      securityNote: "SuperAdmins sehen alle, Tenant-Admins nur die eigenen Gruppen.",
      title: "Benutzergruppen (User Groups)",
    },
    userManagement: {
      accountOpsTitle: "Konto-Operationen",
      adminVsUserIntro: "Trennung zwischen Plattform-Administratoren und Endbenutzern.",
      adminVsUserTitle: "Admin vs User Modell",
      bulkOpsTitle: "Bulk-Operationen",
      crudTitle: "AdminsController CRUD-Endpunkte",
      description:
        "Vollständiger Admin/User-Lebenszyklus, Bulk-Operationen und geschützte Admin-Regeln.",
      enterpriseOpsTitle: "Enterprise-Operationen",
      nukePaveTip:
        "Vermeidet Race Conditions bei UI-Checklisten durch vollständiges Ersetzen von Rollen.",
      nukePaveTitle: "Nuke & Pave Muster",
      protectedIntro:
        "Verhindert das versehentliche Löschen des Hauptadministrators eines Mandanten.",
      protectedTitle: "Geschützte Admin-Regeln",
      roleMgmtTitle: "Rollen-Verwaltungs-Endpunkte",
      title: "Benutzerverwaltung",
    },
    webhookSystem: {
      architectureIntro: "Externe Integrationen durch Payload-Lieferung mit HMAC-Signatur.",
      architectureTitle: "Webhook-Architektur",
      circuitBreakerIntro: "Sperrt das Webhook-Ziel nach zu vielen Fehlversuchen.",
      circuitBreakerTitle: "Circuit Breaker (Auto-Deaktivierung)",
      deliveryLogsIntro: "Zeichnet den Statuscode, die Antwort und die Dauer auf.",
      deliveryLogsTitle: "Zustellungsprotokolle (Delivery Logs)",
      description:
        "Ereignisgesteuerte Webhooks mit HMAC-Rotation, Abonnements für Mandantenhierarchien und Circuit Breaker.",
      endpointsManagementTitle: "Abonnement-Verwaltung",
      endpointsOperationsTitle: "Betrieb & Monitoring",
      endpointsTitle: "Webhook-API-Endpunkte",
      entityTitle: "WebhookSubscription Entität",
      eventsTitle: "Webhook-Ereignistypen",
      hmacIntro: "Verifizierung der Payload durch den Empfänger.",
      hmacTitle: "HMAC-Signatur",
      includeChildrenIntro: "Ermöglicht das Empfangen von Ereignissen des gesamten Mandantenbaums.",
      includeChildrenTitle: "Abonnements für Kind-Mandanten",
      retryIntro: "Fehlgeschlagene Zustellungen werden mit Exponential Backoff wiederholt.",
      retryTitle: "Retry-Richtlinie",
      secretRotationIntro: "Generiert ein neues Secret, hält das alte für 24h gültig.",
      secretRotationTitle: "Secret Rotation (24h Übergangsfrist)",
      title: "Webhook-System",
    },
  },
};
