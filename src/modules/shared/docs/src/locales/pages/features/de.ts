// FILE-EXCEPTION: file length
/**
 * Docs page locale — DE
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const de = {
  features: {
    authentication: {
      title: "Authentifizierung",
      description:
        "Duale Authentifizierung (Admin + User), Multi-Workspace-Routing, JWT-Tokens, 2FA mit Backup-Codes, Durchsetzung des Passwortablaufs, SSO-Sperrgatter und mandantenspezifische Passwortrichtlinien.",
      intro:
        "SCRIPE bietet ein sichere Authentifizierungssystem mit JWT-Access-Tokens, Refresh-Token-Rotation, optionaler Zwei-Faktor-Authentifizierung, Multi-Workspace-Anmeldeerkennung, Passwortablaufdurchsetzung und umfassendem Rate-Limiting. Das System unterstützt separate Admin- und User-Authentifizierungspipelines mit unterschiedlichen JWT-Claims und Berechtigungen.",
      flowTitle: "Authentifizierungs-Ablauf",
      workspaceTitle: "Multi-Workspace-Erkennung beim Login",
      workspaceIntro:
        "Beim Anmelden über die Plattformdomain ermittelt ein intelligenter 3-Wege-Routing-Algorithmus den passenden Mandanten und bietet bei mehreren Treffern eine Workspace-Auswahl.",
      workspaceNote:
        "Das Flag isPlatformAdmin verhindert Endlosschleifen und leitet globale Plattform-Administratoren direkt an das Master-Konto weiter.",
      passwordExpiryTitle: "Durchsetzung von Passwort-Ablaufregeln",
      passwordExpiryIntro:
        "Das System prüft PasswordExpiryDays des Mandanten. Nach Ablauf wird der Benutzer direkt zur Passwortänderung gezwungen.",
      ssoSuspensionTitle: "SSO-Mandantensperrfilter",
      ssoSuspensionIntro:
        "Nach der SSO-Validierung prüft der Handler den Mandantenstatus. Ist die Organisation gesperrt, wird der Zugriff sofort verweigert.",
      ssoSuspensionWarning:
        "Verhindert, dass gesperrte Benutzer Kontobeschränkungen über externe Identitätsanbieter wie Google oder Azure AD umgehen.",
      jwtTitle: "JWT-Token Konfiguration",
      jwtIntro:
        "Das System verwendet kurzlebige Access-Tokens (15 Minuten) und langlebige Refresh-Tokens (7 Tage). Refresh-Tokens werden bei jeder Verwendung rotiert, um Wiederverwendungsangriffe zu verhindern.",
      dualAuthTitle: "Duale Authentifizierung (Admin & User)",
      dualAuthIntro:
        "SCRIPE verfügt über zwei separate Authentifizierungspipelines. Die Admin-Authentifizierung (AdminAuthController) stellt JWTs mit admin-spezifischen Claims (TenantId, IsSuperAdmin, Roles) aus. Die User-Authentifizierung (UserAuthController) stellt JWTs mit benutzerspezifischen Claims (NationalId, Gender, Country) aus. Jede Pipeline hat ihre eigenen Anmelde-, Registrierungs- und Token-Aktualisierungs-Endpunkte.",
      adminEntityTitle: "Admin-Entität (Sicherheitsfunktionen)",
      adminEntityIntro:
        "Die Admin-Entität verfügt über mehrere sicherheitskritische Felder, die das Kontoverhalten und den Schutz steuern.",
      twoFactorTitle: "Zwei-Faktor-Authentifizierung (Deep Dive)",
      twoFactorIntro:
        "Die 2FA ist mit TOTP (Time-based One-Time Password) unter Verwendung eines mandantenspezifischen TwoFactorSecret implementiert. Backup-Codes werden verschlüsselt in BackupCodesJson gespeichert. Der Anti-Replay-Schutz stellt sicher, dass derselbe Code nicht zweimal verwendet werden kann, indem die Zeitstempel LastTwoFactorCodeUsed und LastTwoFactorCodeUsedAt überprüft werden.",
      passwordPolicyTitle: "Mandantenbezogene Passwortrichtlinie",
      passwordPolicyIntro:
        "Passwortanforderungen sind pro Mandant über TenantSettings konfigurierbar. Jeder Mandant kann Mindestlänge, Großbuchstaben, Zahlen, Sonderzeichen und Ablaufdauer festlegen. Das Feld PasswordLastChanged in der Admin-Entität wird mit den PasswordExpiryDays des Mandanten abgeglichen, um die Passwortrotation zu erzwingen.",
      endpointsTitle: "Authentifizierungs-API-Endpunkte",
      endpointsAdminTitle: "Admin Auth Endpunkte",
      endpointsUserTitle: "User Auth Endpunkte",
      rateLimitingTitle: "Rate Limiting",
      rateLimitingIntro:
        "Authentifizierungsendpunkte sind durch mehrere Rate-Limiting-Richtlinien geschützt, um Brute-Force-Angriffe und Missbrauch zu verhindern.",
      lockoutWarning:
        "Nach 5 fehlgeschlagenen Anmeldeversuchen wird das Konto für 15 Minuten gesperrt. Der Sperrzähler wird nach einer erfolgreichen Anmeldung zurückgesetzt. Administratoren können Konten manuell über das Admin-Panel entsperren.",
      tokenValidationTitle: "Kryptografische Token-Validierung",
      tokenValidationIntro:
        "Prüfung von Signatur, Ablaufzeit und Geräte-Fingerabdrücken zur Abwehr von Session-Hijacking.",
      mcpMiddlewareTitle: "MCP-Sicherheits-Middleware",
      mcpMiddlewareIntro:
        "Sichere Kapselung aller Ein- und Ausgaben des Model Context Protocols für KI-gestützte Schnittstellen.",
      ssoCallbackTitle: "SSO-Callback-Verarbeitung",
      ssoCallbackIntro:
        "Verschlüsselter Token-Austausch und automatische Kontenverknüpfung über verifizierte E-Mail-Adressen.",
      antiReplayTitle: "Schutz vor Replay-Angriffen",
      antiReplayIntro:
        "Einmalige Nonces und strikte Zeitfenster verhindern das wiederholte Einspielen abgefangener Token.",
      lockoutPolicyTitle: "Automatische Kontensperrrichtlinie",
      lockoutPolicyIntro:
        "Nach 5 fehlgeschlagenen Anmeldeversuchen wird das Konto für 15 Minuten gesperrt, um Brute-Force-Angriffe abzuwehren.",
    },
    multiTenancy: {
      title: "Mandantenfähigkeit (Multi-Tenancy)",
      description:
        "Datenisolierung auf Zeilenebene, hierarchische Mandanten, mandantenspezifische Einstellungen, Branding und Bereichsarchitektur.",
      intro:
        "SCRIPE unterstützt vollständige Mandantenfähigkeit (Multi-Tenancy) mit Datenisolierung auf Zeilenebene.",
      architectureTitle: "Architektur",
      isolationIntro:
        "Die Datenisolierung auf Zeilenebene wird dynamisch über globale EF Core-Abfragefilter erreicht. Der Basis-Datenbankkontext erstellt dynamisch Abfragefilter, die den Zugriff auf den aktiven Mandanten (`CurrentTenantId`) oder plattformweite Datensätze (`TenantId == null`) beschränken. Anstatt einen statischen Wert zur Kompilierungszeit zu erfassen, wertet EF Core den Kontext des aktiven Mandanten bei jeder Abfrageausführung dynamisch aus.",
      drilldownIntro:
        "Systemadministratoren umgehen die Mandantendatengrenzen nicht implizit. Das Umgehen erfordert eine Drilldown-Aktion, bei der die Client-App die verschlüsselte Mandanten-ID im Header `X-Tenant-Context` anhängt. Die Middleware-Firewall fängt die Anfrage ab, prüft auf die Berechtigung `tenants.drill_down`, entschlüsselt den Header mittels AES und überschreibt den Kontext der Mandanten-ID für die Dauer der Anfrage.",
      featuresTitle: "Mandanten-Funktionen",
      featureIsolation: "Datenisolierung",
      featureIsolationDesc: "Isolierung auf Zeilenebene über globale EF Core-Abfragefilter.",
      featureSettings: "Mandantenspezifische Einstellungen",
      featureSettingsDesc:
        "Unabhängige Konfigurationen für Quotas, Sicherheitsrichtlinien und Audit-Einstellungen.",
      featureBranding: "Benutzerdefiniertes Branding",
      featureBrandingDesc: "Laden Sie Mandanten-Logos hoch und passen Sie Farben an.",
      featureUserScoping: "Benutzer-Scoping",
      featureUserScopingDesc: "Benutzer gehören zu einem einzigen Mandanten.",
      featureRoleScoping: "Rollen-Scoping",
      featureRoleScopingDesc: "Rollen sind auf den Mandanten beschränkt.",
      featureDataScoping: "Daten-Scoping",
      featureDataScopingDesc:
        "Sämtliche Geschäftsdaten werden automatisch dem Mandanten zugeordnet.",
      hierarchyTitle: "Mandanten-Hierarchie",
      hierarchyIntro: "Mandanten bilden eine Baumstruktur (Parent/Child).",
      hierarchyQueriesIntro:
        "Anstatt sich auf datenbankspezifische rekursive CTE-Abfragen zu verlassen, baut SCRIPE die Mandantenhierarchie bei der Erstellung von Kind-Mandanten durch Verknüpfung materialisierter Pfade (`HierarchyPath`) wie `/{grandparent-id}/{parent-id}/` auf. Abstammungsprüfungen und Unterbaum-Abfragen von Nachkommen werden in konstanter Zeit mittels indexierter StartsWith/Contains-Zeichenfolgenprüfungen ausgeführt, die in hochperformante SQL-`LIKE`-Abfragen übersetzt werden.",
      settingsTitle: "Mandanteneinstellungen (Tenant Settings)",
      settingsIntro: "Jeder Mandant hat eine unabhängige Konfigurationsentität.",
      quotaGroup: "Quota-Einstellungen",
      securityGroup: "Sicherheitsrichtlinie",
      auditGroup: "Audit-Konfiguration",
      brandingGroup: "Branding",
      autoRoleTitle: "Automatische Rollenerstellung",
      autoRoleIntro:
        "Die Erstellung eines Mandanten stellt Rollen und ein Administratorkonto dynamisch innerhalb einer atomaren Transaktion bereit. Die erstellten Rollen sind `{CODE}_SUPER_ADMIN` und `{CODE}_DEFAULT`. Die Super-Admin-Rolle durchläuft einen Sperrzustandsübergang: Während der Bereitstellung ist sie entsperrt (`IsPermissionLocked = false`), um Anfangsberechtigungen über die Zuweisung der Plan-Edition zu konfigurieren, bevor sie in einen gesperrten Zustand (`IsPermissionLocked = true`) übergeht, der weitere Änderungen verhindert.",
      cascadeDeleteTitle: "Cascade-Delete-Schutz",
      cascadeDeleteIntro:
        "Das Löschen von Mandanten erzwingt strenge Sicherheitsprüfungen. Wenn Nachkommen vorhanden sind, wird das Löschen blockiert, es sei denn, die Anfrage setzt `CascadeChildren` auf `true`. Die Ausführung validiert das Plan-Gate `Identity.CascadeDelete.Enabled`, die RBAC-Berechtigung `tenants.cascade_delete` und führt eine Bottom-Up-Löschung in umgekehrter Pfadreihenfolge (tiefste Kinder zuerst) sowie Massen-Soft-Deletes und die sofortige Bereinigung von Verknüpfungstabellen (Domains, direkte Berechtigungen) durch, um Hostage-Domains zu vermeiden, gefolgt von der Quotenabstimmung des Eltern-Mandanten.",
      permissionInheritanceTitle: "Berechtigungsvererbung",
      permissionInheritanceIntro:
        "Ein Kind-Mandant kann niemals mehr Rechte haben als sein Eltern-Mandant.",
      endpointsTitle: "Mandanten-API-Endpunkte",
      endpointsCrudTitle: "CRUD-Endpunkte",
      endpointsHierarchyTitle: "Hierarchie-Endpunkte",
      endpointsSettingsTitle: "Einstellungs-Endpunkte",
      endpointsPermissionsTitle: "Berechtigungs-Endpunkte",
      endpointsDrilldownTitle: "Drilldown-Endpunkte",
      logoTip: "Mandantenlogos werden über eine Static File Middleware bereitgestellt.",
      domainTitle: "Domain-Verwaltung",
      domainIntro:
        "Jeder Mandant kann mehrere Domains besitzen — eine automatisch generierte Subdomain, die bei der Erstellung des Mandanten erstellt wird, sowie optionale benutzerdefinierte Domains, die von Administratoren hinzugefügt werden. Das System unterstützt DNS-based Domain-Verifizierung, um den Besitz benutzerdefinierter Domains nachzuweisen, bevor sie aktiv werden. Alle domainbezogenen Konfigurationen sind vollständig in appsettings.json ausgelagert, was nahtloses Rebranding und Multi-Deployment-Setups ermöglicht.",
      domainTypesTitle: "Domain-Typen",
      domainArchTitle: "Domain-Auflösungsarchitektur",
      domainArchIntro:
        "Eingehende Anfragen lösen den Mandantenkontext über den clientseitigen Hook `useTenantResolution` und den serverseitigen Abfrage-Handler `ResolveTenantByDomainQueryHandler` auf. Der Client prüft, ob der Hostname eine lokale/Plattform-Domain ist, andernfalls wird die API abgefragt. Der Server schlägt in der TenantDomain-Tabelle nach, verifiziert `IsVerified == true`, führt einen Deep-Merge der mandantenspezifischen Login-Branding-Overrides durch oder greift im Entwicklungsmodus auf `?code=`-Abfrageparameter zurück.",
      domainDnsTitle: "DNS-Verifizierungsablauf",
      domainDnsIntro:
        "Benutzerdefinierte Domains müssen auf RFC 1123, die Liste der reservierten Subdomains und das Quotalimit `Tenancy.MaxCustomDomains` des Mandanten überprüft werden. Der Besitz wird nachgewiesen, indem ein Verifizierungstoken (Präfix `scr_`) generiert und das Vorhandensein einer CNAME-Zielzuordnung sowie eines passenden TXT-Eintrags (`_scr-verify.{domain}`) über DNS-Abfragen überprüft wird.",
      domainDnsNote:
        "Die DNS-Verifizierung ist derzeit ein UI-gesteuerter Prozess, bei dem der Admin auf 'Verifizieren' klickt, um die Prüfung auszulösen. Das Backend-Platzhalter ist bereit für die vollständige DNS-Auflösungsintegration. Automatisch generierte Domains überspringen die Verifizierung vollständig — sie sind immer vertrauenswürdig.",
      domainConfigTitle: "Konfigurierbarer Plattform-Domain",
      domainConfigIntro:
        "Jeder domainbezogene Wert ist über den Tenancy-Abschnitt in appsettings.json konfigurierbar. Das bedeutet, dass Sie die gesamte Plattform umbenennen können — Basis-Domain, CNAME-Ziel, Verifizierungspräfix und Token-Präfix ändern — indem Sie einen einzigen Konfigurationsblock bearbeiten. Keine Code-Änderungen erforderlich. Das Backend injiziert TenancySettings über IOptions<T>, und das Frontend erhält das CNAME-Ziel und das Verifizierungspräfix aus der GET /domains API-Antwort.",
      domainConfigTip:
        "Um auf einer völlig anderen Domain bereitzustellen (z.B. myplatform.io statt scripe.com), aktualisieren Sie einfach die 4 Werte in appsettings.json. Alle automatisch generierten Subdomains, DNS-Anweisungen und Verifizierungstokens verwenden automatisch die neuen Werte.",
      domainEndpointsTitle: "Domain-API-Endpunkte",
    },
    rolePermissions: {
      title: "Rollen & Berechtigungen (RBAC)",
      description:
        "RBAC-System mit Scope-Override, Einschränkungen auf Feldebene, Anti-Eskalation und mandantenbezogenen Rollen.",
      intro:
        "SCRIPE implementiert ein umfassendes, hochoptimiertes RBAC-System (Role-Based Access Control) mit modularen, kategoriebasierten Berechtigungen, Scope-Overrides, Einschränkungen auf Feldebene (FLS) und Mandantenscoperung. Berechtigungen werden dynamisch aus Providern geladen, serverseitig mit IMemoryCache zwischengespeichert und programmgesteuert validiert.",
      hierarchyTitle: "Berechtigungshierarchie",
      systemTitle: "Berechtigungssystem",
      systemIntro:
        "Berechtigungen folgen einer strengen Namenskonvention {Resource}.{Action}. Anstatt statischer Deklarationen definiert jedes Backend-Modul seine Berechtigungen durch Implementierung von IModulePermissionProvider (z. B. IdentityPermissionProvider, CompliancePermissionProvider). Beim Startup werden diese Provider automatisch erkannt, und der DatabaseSeeder verwendet PermissionSeeder.SyncFromProvidersAsync, um Berechtigungen in der Datenbank zu synchronisieren und zu seeden.",
      scopeOverrideTitle: "Scope Override (Datenzugriffskontrolle)",
      scopeOverrideIntro:
        "Jede RolePermission kann den Standard-Scope einer Berechtigung über das Feld ScopeOverride überschreiben. Der DataScopeService löst den effektiven Scope anhand einer strengen Prioritätenliste auf: 1) Drilldown-Kontext (ContextTenantId-Claim), 2) RolePermission Scope-Override, 3) God-Mode-Check (SystemProtectedAdmin), 4) Hierarchie-Flag (IncludeChildTenants), 5) zugewiesener Mandant, 6) globaler Fallback. Bei mehreren Rollen löst AdminSecurityService.GetWidestScope den breitesten Scope auf: all_tenants > hierarchy > own_tenant > own. Um Privilegien-Leckagen zu verhindern, sind Mandantenadministratoren bei der Scope-Auflösung streng auf ihre eigene Unterhierarchie beschränkt.",
      authPipelineTitle: "Autorisierungs-Pipeline",
      authPipelineIntro:
        "Die Autorisierung ist von statischen Konfigurationen entkoppelt. Der DynamicPermissionPolicyProvider erstellt dynamisch ASP.NET Core-Autorisierungsrichtlinien für Routen mit dem Attribut [PermissionRequired]. Um die JWT-Token-Größe unter 400 Bytes zu halten, werden Benutzerberechtigungen nicht in Claims gespeichert, sondern serverseitig im AdminPermissionCache (mit einer 10-minütigen gleitenden Gültigkeit) zwischengespeichert. Das Caching verwendet eine zentrale CancellationTokenSource für eine threadsichere globale Bereinigung bei Rollenänderungen. Programmgesteuerte Prüfungen werden in Handlern und Services über die Schnittstelle IPermissionChecker durchgeführt.",
      restrictedFieldsTitle: "Einschränkungen auf Feldebene (Restricted Fields)",
      restrictedFieldsIntro:
        'Die Feldebenen-Sicherheit (Field-Level Security, FLS) ermöglicht es Administratoren, bestimmte Felder einer Entität für bestimmte Rollen einzuschränken. Eingeschränkte Felder werden als JSON-Array von String-Pfaden konfiguriert (z. B. ["salary", "ssn"]) und in der Spalte RestrictedFieldsJson (varchar/nvarchar/VARCHAR2 bis zu 2000 Zeichen) der Tabelle RolePermission gespeichert. Während der Ausführung identifiziert der RestrictedFieldsAuthorizationFilter die Zielressource und setzt HttpContext.Items["RestrictedFields"]. Die FieldProjectionMiddleware fängt HTTP-2xx-JSON-Antworten ab, analysiert den Body in einen JsonNode-Baum und nullifiziert rekursiv eingeschränkte Eigenschaften, die mit dem genauen oder relativen Pfad (z. B. address.street) übereinstimmen, um Reflection-Overhead zu vermeiden.',
      cloneRoleTitle: "Rolle klonen (Anti-Eskalation)",
      cloneRoleIntro:
        "Um eine Privilegien-Eskalation zu verhindern, filtert der CloneRoleCommandHandler die kopierte Berechtigungsliste gegen die eigenen aktiven Berechtigungen des Kloners und verwirft nicht besessene Berechtigungen stillschweigend. Im Berechtigungszuweisungsbefehl führt der Versuch, Berechtigungen explizit hinzuzufügen, die der Administrator nicht besitzt, zu einem Forbidden-Fehler role.permissionEscalation. Darüber hinaus validiert der TenantGuardianService alle Rollenaktualisierungen und blockiert Änderungen an gesperrten systemkritischen Rollen (IsPermissionLocked == true).",
      rolePropertiesTitle: "Rollen-Entitäts-Eigenschaften",
      rolePropertiesIntro: "System-Flags steuern das Verhalten und den Schutz von Rollen.",
      endpointsTitle: "Rollen-API-Endpunkte",
      endpointsMyTenantTitle: "Endpunkte des eigenen Mandanten",
      endpointsPermissionsTitle: "Berechtigungs-Endpunkte",
      tenantScopingNote: "Rollen are automatisch auf den aktuellen Mandanten beschränkt.",
      userGroupsTitle: "Benutzergruppen (User Groups)",
      userGroupsIntro:
        "Ermöglicht die gebündelte Zuweisung von Rollen und Feldeinschränkungen an mehrere Administratoren.",
      userGroupEndpointsTitle: "User Groups API Endpunkte",
      userGroupsNote: "Gruppen sind additiv – Berechtigungen verschmelzen (UNION) beim Login.",
    },
    auditSystem: {
      title: "Audit-System",
      description:
        "Multi-Quellen-Pipeline, Change-Tracker-Mappings, Datenbank-Indizes, Echtzeit-SignalR und CSV/Excel/PDF-Export.",
      intro:
        "SCRIPE erfasst jede wichtige Aktion im Audit-Log über eine entkoppelte Anfrage- und Datenbank-Pipeline, die HTTP-Anforderungsprotokollierung, EF Core Entitätsänderungsverfolgung und direkte Sicherheitsereignisse umfasst. Alle Ereignisse werden in Echtzeit via SignalR an mandantenspezifische Gruppen übertragen.",
      architectureTitle: "Audit-Architektur",
      pipelineDetail:
        "Die HTTP-Anforderungsprotokollierung wird von der RequestLoggingMiddleware verarbeitet. Sie erfasst den Anforderungskontext (HTTP-Methode, Pfad, Remote-IP, User-Agent, Benutzer-Claims und Correlation-ID) synchron auf dem Anforderungsthread, bevor HttpContext recycelt wird, und ruft dann den AuditService asynchron in einem Hintergrundtask (Task.Run) auf, um das Blockieren von Anforderungen zu verhindern. Infrastrukturpfamden werden übersprungen und erfolgreiche GET-Anforderungen standardmäßig unterdrückt.",
      changeTrackingTitle: "Abfangen von Entitätsänderungen",
      changeTrackingDetail:
        "Der AuditableEntityInterceptor verfolgt Änderungen auf Datenbankebene, bevor diese gespeichert werden. Er fängt SaveChangesAsync ab und scannt den ChangeTracker nach Entitäten, die IAuditable oder ISoftDeletable implementieren. Bei neu erstellten Entitäten werden alle Felder erfasst. Bei geänderten Entitäten wird ein Eigenschaftsvergleich durchgeführt, sodass nur geänderte Felder gespeichert werden. Bei physischen Löschungen werden alle Originalwerte erfasst. Bei logischen Löschungen (Soft Delete) wird die Entität abgefangen, bevor sie durch den DbContext als geändert markiert wird. Zudem wird der Typ AuditLog selbst übersprungen, um Stack-Overflow-Rekursionen zu verhindern.",
      databaseSchemaTitle: "Datenbankschema & Multi-Provider-Indizes",
      databaseSchemaDetail:
        "Die Entität AuditLog wird durch leistungsstarke Indizes auf Timestamp, UserId, EventType, CorrelationId, TenantId sowie zusammengesetzte Indizes für häufige Abfragen (Endpoint+Timestamp, EventType+Timestamp, TenantId+Timestamp) unterstützt. Datentypen werden für SQL Server, PostgreSQL und Oracle korrekt gemappt (z. B. bit/boolean/NUMBER(1) und Guid/uuid/RAW(16)), um native Datenbankoperationen optimal zu unterstützen.",
      eventTypesTitle: "Ereignistypen (35+ Kategorien)",
      authEventsTitle: "Authentifizierungsereignisse",
      rbacEventsTitle: "RBAC-Ereignisse",
      twoFactorEventsTitle: "Zwei-Faktor-Ereignisse",
      sessionEventsTitle: "Sitzungsereignisse",
      adminEventsTitle: "Admin-Verwaltungsereignisse",
      bulkEventsTitle: "Bulk-Operationen-Ereignisse",
      tenantEventsTitle: "Mandantenereignisse",
      guardianTitle: "Guardian-Schutzereignisse",
      guardianIntro: "Protokollierte Blockaden gefährlicher Operationen.",
      serviceMethodsTitle: "AuditService-Methoden",
      serviceMethodsIntro:
        "Das IAuditService-Interface bietet 3 spezialisierte asynchrone Protokollierungsmethoden für Anforderungsmetriken, Datenbankmutationen und Compliance-Logs, ohne die Pipeline zu blockieren.",
      realTimeTitle: "Echtzeit-Übertragung (Broadcasting)",
      realTimeIntro:
        "Audit-Ereignisse werden in Echtzeit via SignalR an mandantenspezifische Gruppen übertragen. Die Übertragung erfolgt sowohl an die Mandantengruppe als auch an eine globale Gruppe für Super-Admins.",
      exportTitle: "Audit-Export",
      exportIntro: "CSV- und PDF-Export unter Berücksichtigung der Mandantenisolierung.",
      exportDetail:
        "Der AuditExportService bietet Exporte in mehreren Formaten. Der CSV-Export nutzt CsvHelper mit erzwungenen Anführungszeichen (RFC 4180) zur Vermeidung von CSV-Injektionen und fügt ein UTF-8-BOM für Excel hinzu. Der Excel-Export generiert eine ClosedXML-Arbeitsmappe mit drei Tabellenblättern: Executive Summary (KPIs und Statistiken), Audit Data (mit Auto-Filtern, fixierten Kopfzeilen und bedingter Formatierung in Grün/Rot) sowie Security Analysis. Der PDF-Export basiert auf QuestPDF und ist für große Datenmengen als veraltet (Obsolete) markiert. Zum Schutz der Systemressourcen sind alle Exporte auf 10.000 Zeilen begrenzt und werden vor der Übertragung vollständig im Arbeitsspeicher gepuffert.",
      endpointsTitle: "Audit-API-Endpunkte",
      retentionTip: "Die Aufbewahrungsfrist ist pro Mandant konfigurierbar.",
    },
    notificationSystem: {
      title: "Benachrichtigungssystem",
      description:
        "Echtzeit-Benachrichtigungen via SignalR mit automatischem Gruppenbeitritt und Historie.",
      architectureTitle: "Architektur",
      architectureIntro: "Persistierung in der Datenbank und Push via NotificationHub.",
      hubTitle: "NotificationHub",
      hubIntro: "SignalR-Hub mit Auto-Join für benutzerspezifische Gruppen.",
      autoJoinTitle: "Auto-Join-Muster",
      clientInterfaceTitle: "Hub-Client-Schnittstelle",
      serviceTitle: "NotificationService-Methoden",
      endpointsTitle: "Benachrichtigungs-API-Endpunkte",
    },
    emailSystem: {
      title: "E-Mail-System",
      description:
        "Steckbare E-Mail-Bereitstellungspipeline mit Queue-Strategien und Hintergrundverarbeitung.",
      architectureTitle: "E-Mail-Pipeline-Architektur",
      architectureIntro: "Pipeline-Ansatz: Controller → Service → Queue → Sender → SMTP.",
      endpointsTitle: "E-Mail-Controller-Endpunkte",
      queueTitle: "Queue-Implementierungen (InMemory vs. Hangfire)",
      queueIntro: "Steuert, wie E-Mails verarbeitet und verzögert werden.",
      senderTitle: "Sender-Strategien (SMTP vs. Console)",
      senderIntro: "Steuert die physische Übermittlung.",
      backgroundTitle: "Background Worker-Muster",
      backgroundIntro: "HangfireQueue erstellt Hintergrundjobs für E-Mails.",
      errorTitle: "Fehlerbehandlung & Bereinigung",
      errorIntro: "E-Mails werden vor dem Senden bereinigt, Fehler führen zu Retries.",
      pipelineTitle: "E-Mail-Versand-Pipeline",
      pipelineIntro:
        "Asynchrone Versand-Architektur mit Unterstützung für mehrere Carrier und automatischem Failover.",
      inMemoryTitle: "In-Memory-Entwicklungsversand",
      hangfireTitle: "Hintergrundverarbeitung mit Hangfire",
      sendersTitle: "Unterstützte Versand-Provider",
      senderNote: "Native Anbindung von SMTP, SendGrid, Mailgun und Amazon SES.",
      workerTitle: "Hintergrund-Worker & Dispatcher",
      sanitizerTitle: "HTML-Bereinigung & XSS-Schutz",
      sanitizerIntro:
        "Entfernt schädliche Skripte und unsichere Tags aus E-Mail-Vorlagen vor dem Versand.",
    },
    webhookSystem: {
      title: "Webhook-System",
      description:
        "Ereignisgesteuerte Webhooks mit HMAC-Rotation, Abonnements für Mandantenhierarchien und Circuit Breaker.",
      architectureTitle: "Webhook-Architektur",
      architectureIntro: "Externe Integrationen durch Payload-Lieferung mit HMAC-Signatur.",
      entityTitle: "WebhookSubscription Entität",
      hmacTitle: "HMAC-Signatur",
      hmacIntro: "Verifizierung der Payload durch den Empfänger.",
      secretRotationTitle: "Secret Rotation (24h Übergangsfrist)",
      secretRotationIntro: "Generiert ein neues Secret, hält das alte für 24h gültig.",
      includeChildrenTitle: "Abonnements für Kind-Mandanten",
      includeChildrenIntro: "Ermöglicht das Empfangen von Ereignissen des gesamten Mandantenbaums.",
      circuitBreakerTitle: "Circuit Breaker (Auto-Deaktivierung)",
      circuitBreakerIntro: "Sperrt das Webhook-Ziel nach zu vielen Fehlversuchen.",
      retryTitle: "Retry-Richtlinie",
      retryIntro: "Fehlgeschlagene Zustellungen werden mit Exponential Backoff wiederholt.",
      deliveryLogsTitle: "Zustellungsprotokolle (Delivery Logs)",
      deliveryLogsIntro: "Zeichnet den Statuscode, die Antwort und die Dauer auf.",
      eventsTitle: "Webhook-Ereignistypen",
      endpointsTitle: "Webhook-API-Endpunkte",
      endpointsManagementTitle: "Abonnement-Verwaltung",
      endpointsOperationsTitle: "Betrieb & Monitoring",
    },
    menuSystem: {
      title: "Menü-System",
      description:
        "Dynamischer Menübaum mit Berechtigungsfilterung, Mandanten-Scoping und Drag-Drop.",
      architectureTitle: "Menü-Architektur",
      architectureIntro: "Selbstreferenzierende Baumstruktur mit 6-stufiger Pipeline-Filterung.",
      entityTitle: "MenuItem Entität",
      endpointsTitle: "Menü-API-Endpunkte",
      filteringTitle: "Menü-Filter-Pipeline",
      filteringIntro: "Sichert ab, dass Admins nur Menüs sehen, auf die sie Zugriff haben.",
      overrideTitle: "Override-System",
      overrideNote: "User-Overrides haben Vorrang vor Tenant-Overrides.",
      reorderTitle: "Drag-Drop Neuordnung",
      customDomainTitle: "Unterstützung benutzerdefinierter Domänen im Menü",
      customDomainIntro:
        "Dynamische Anpassung aller internen Links und Navigationsziele beim Zugriff über Mandanten-Domains.",
    },
    recycleBin: {
      title: "Papierkorb (Recycle Bin)",
      description:
        "Soft-Delete-Management mit Cascade-Restore, Massenoperationen und dauerhafter Löschung.",
      softDeleteTitle: "Wie Soft-Delete funktioniert",
      softDeleteIntro:
        "IsDeleted wird auf true gesetzt und der Datensatz via Query-Filter verborgen.",
      ignoreFiltersTitle: "IgnoreQueryFilters Muster",
      ignoreFiltersWarning:
        "Umgeht ALLE globalen Filter. Ein expliziter Mandantenfilter muss hinzugefügt werden.",
      cascadeTitle: "Cascade Restore",
      cascadeIntro:
        "Verwendet ExecuteUpdateAsync für schnelle Massenwiederherstellungen von Hierarchien.",
      executeUpdateTitle: "ExecuteUpdateAsync vs Traditionelles EF",
      interceptorNote: "Umgeht den Change Tracker, weshalb Audits manuell geschrieben werden.",
      endpointsTitle: "Papierkorb-Endpunkte",
      purgeVsRestoreTitle: "Purge vs Restore (Löschen vs Wiederherstellen)",
      purgeWarning: "Purge ist irreversibel (harter DELETE), primär für DSGVO-Compliance.",
      restorationTitle: "Sichere Wiederherstellung gelöschter Entitäten",
      restorationIntro:
        "Stellt Datensätze unter Erhalt aller relationalen Verknüpfungen wieder her und schreibt Audit-Einträge.",
    },
    userManagement: {
      title: "Benutzerverwaltung",
      description:
        "Vollständiger Admin/User-Lebenszyklus, Bulk-Operationen und geschützte Admin-Regeln.",
      adminVsUserTitle: "Admin vs User Modell",
      adminVsUserIntro: "Trennung zwischen Plattform-Administratoren und Endbenutzern.",
      crudTitle: "AdminsController CRUD-Endpunkte",
      accountOpsTitle: "Konto-Operationen",
      roleMgmtTitle: "Rollen-Verwaltungs-Endpunkte",
      bulkOpsTitle: "Bulk-Operationen",
      enterpriseOpsTitle: "Enterprise-Operationen",
      protectedTitle: "Geschützte Admin-Regeln",
      protectedIntro:
        "Verhindert das versehentliche Löschen des Hauptadministrators eines Mandanten.",
      nukePaveTitle: "Nuke & Pave Muster",
      nukePaveTip:
        "Vermeidet Race Conditions bei UI-Checklisten durch vollständiges Ersetzen von Rollen.",
      registerValidationTitle: "Erweiterte Registrierungsvalidierung",
      registerValidationIntro:
        "Prüfung auf eindeutige E-Mail-Adressen, Passwortkomplexität und Mandantenrichtlinien vor der Kontoerstellung.",
      invitationTitle: "Fristgebundenes Einladungssystem",
      invitationIntro:
        "Sichere Einladungs-Links mit Token-Gültigkeitsdauer zur initialen Kontoeinrichtung durch neue Mitarbeiter.",
    },
    fileUpload: {
      title: "Datei-Upload-System",
      description:
        "Duale Upload-Pipeline für Bilder und Dokumente mit Validierung und mandantenspezifischem Speicher.",
      architectureTitle: "Upload-Architektur",
      architectureIntro:
        "Getrennte Pfade für Bilder (Zuschneiden/Formatieren) und allgemeine Dateien.",
      imagePipelineTitle: "Bild-Upload-Pipeline",
      validationTitle: "Dateivalidierungsregeln",
      generalTitle: "Allgemeiner Dateiupload",
      servingTitle: "Static File Serving",
      servingNote: "Bereitstellung über ASP.NET Core StaticFileMiddleware.",
      tenantScopedTitle: "Mandantenbezogener Speicher (Tenant-Scoped Storage)",
      chunkedUploadsTitle: "Paralleler Upload großer Dateien in Chunks",
      chunkedUploadsIntro:
        "Zerlegung großer Dateien in Blöcke mit automatischer Wiederaufnahme bei Netzwerkproblemen.",
      storageProvidersTitle: "Flexible Speicher-Backends",
      storageProvidersIntro:
        "Direkte Unterstützung von Azure Blob Storage, AWS S3 und verschlüsselten lokalen Speicherknoten.",
    },
    downloadExport: {
      title: "Download- & Export-System",
      description:
        "Authentifizierte Downloads mit Range-Unterstützung, ETag-Caching und Path-Traversal-Schutz.",
      architectureTitle: "Download-Architektur",
      architectureIntro:
        "Unterstützt authentifizierte JWT-Downloads und temporäre sitzungsbasierte URLs.",
      endpointsTitle: "Download-Endpunkte",
      resumableTitle: "Fortsetzbare Downloads (Range Headers)",
      resumableIntro: "Client kann partielle Inhalte (Byte-Ranges) anfordern.",
      etagTitle: "ETag-Caching",
      etagNote: "Gibt 304 Not Modified zurück, wenn die Datei lokal noch aktuell ist.",
      sessionTitle: "Sitzungsbasierte Downloads",
      sessionIntro: "Ermöglicht das Teilen von URLs ohne Authentifizierung.",
      sessionWarning: "Download-Sitzungen laufen ab und können nicht erneuert werden.",
      pathTraversalTitle: "Schutz vor Path Traversal",
      pathTraversalNote:
        "Entfernt '..'-Sequenzen, um Ausbrüche aus dem Speicherverzeichnis zu verhindern.",
      streamConfigTitle: "FileStream Konfiguration",
      sessionTokenTitle: "Zeitlich begrenzte Download-Tokens",
      sessionTokenIntro:
        "Erzeugung kurzlebiger Signatur-URLs zum Schutz sensibler Dateien vor unerlaubter Weitergabe.",
      exportEnginesTitle: "Multi-Format Export-Engines",
      exportEnginesIntro:
        "Performante Generierung von Excel-, CSV- und PDF-Exporten unter strikter Wahrung aller Benutzerberechtigungen.",
    },
    messageTemplates: {
      title: "Nachrichtenvorlagen (Message Templates)",
      description: "Scriban-basierte zweisprachige Vorlagen für E-Mails und Benachrichtigungen.",
      architectureTitle: "Vorlagen-Architektur",
      architectureIntro:
        "Zentralisierte Verwaltung mit Scriban Engine (Liquid-ähnlich) für Variablen.",
      syntaxTitle: "Scriban Template-Syntax",
      builtInTitle: "Integrierte Vorlagen (Built-in)",
      entityTitle: "MessageTemplate Entität",
      rendererTitle: "Template Renderer",
      endpointsTitle: "Template-API-Endpunkte",
      previewTitle: "Vorschau-Funktion (Preview)",
      previewIntro: "Erlaubt das Rendern von Vorlagen mit Beispieldaten vor dem Versand.",
      placeholderTitle: "Dynamische Vorlagen-Platzhalter",
      placeholderIntro:
        "Kontextsensitive Ersetzung von Variablen wie Benutzernamen, Fristen und Systemlinks beim Versand.",
      versionTitle: "Vorlagen-Versionierung & Rollback",
      versionIntro:
        "Lückenlose Historie aller Textänderungen mit Möglichkeit zur sofortigen Wiederherstellung früherer Versionen.",
    },
    userGroups: {
      title: "Benutzergruppen (User Groups)",
      description:
        "Gruppenbasierte Rollen- und Einschränkungszuweisung mit Mandantenscope, Mitgliederverwaltung und additivem Merge beim Login.",
      intro:
        "Benutzergruppen bieten eine skalierbare Methode zur Zuweisung von Rollen und Feldeinschränkungen für eine große Anzahl von Administratoren. Anstatt jedem Admin einzeln Rollen zuzuweisen, erstellen Sie eine Gruppe, fügen ihr Rollen und Einschränkungen hinzu und tragen Admins als Mitglieder ein. Alle Mitglieder erben automatisch die Rollen und Einschränkungen der Gruppe bei ihrem nächsten Login.",
      architectureTitle: "Architektur",
      architectureIntro:
        "Jede UserGroup gehört zu einem Mandanten und besitzt Junction-Verbindungen: AdminUserGroup für Mitglieder, UserGroupRole für Rollen und UserGroupRestriction für Feldeinschränkungen (FLS). Die Beziehungen sind auf der UserGroup-Seite mit Cascade Delete konfiguriert, sodass das Löschen einer Gruppe automatisch Mitgliedschaften, Rollen und Einschränkungen entfernt. Ein Restrict Delete auf der Tenant-Seite verhindert jedoch das Löschen eines Mandanten mit aktiven Benutzergruppen.",
      domainModelTitle: "Domain-Modell & Konfigurationen",
      domainModelIntro:
        "Das Benutzergruppen-Feature nutzt vier Domain-Entitäten: UserGroup (Aggregate Root), AdminUserGroup (n:m Junction), UserGroupRole (n:m Junction) und UserGroupRestriction (Feldeinschränkungen). Datenbankkonfigurationen erzwingen eindeutige zusammengesetzte Indizes auf {TenantId, Code} für UserGroup, {AdminId, UserGroupId} für AdminUserGroup und {UserGroupId, RoleId} für UserGroupRole, um doppelte Mappings zu verhindern.",
      howItWorksTitle: "Funktionsweise beim Login",
      howItWorksIntro:
        "Bei der Authentifizierung nutzt das AdminRepository ein Single-Query-Projektionsmuster (GetWithRolesAsync), um direkte sowie gruppenvererbte Rollen und Einschränkungen in einem einzigen Datenbank-Roundtrip abzurufen. Gruppenvererbte Rollen werden als synthetische AdminRole-Instanzen (mit Id = Guid.Empty) im Speicher abgebildet und an die Rollen-Sammlung des Admins angehängt. Der AdminSecurityService führt anschließend einen additiven Union-Merge von Rollen- und Gruppeneinschränkungen durch (wobei 'Deny Wins' für FLS gilt).",
      mergeNote:
        "Gruppenrollen und -einschränkungen sind additiv – sie können die effektiven Einschränkungen eines Admins nur erweitern, niemals direkte Rollenzuweisungen entfernen. Dies entspricht dem Sicherheitsprinzip 'Deny Wins'.",
      memberManagementTitle: "Mitgliederverwaltung",
      memberManagementIntro:
        "Das Hinzufügen von Mitgliedern ist idempotent – das Übermitteln einer bereits vorhandenen Admin-ID ist geräuschlos erfolgreich. Das Entfernen eines Mitglieds löscht den Junction-Datensatz; der Admin behält alle direkt zugewiesenen Rollen. Die Mitgliederliste kann mit Admin-Metadaten (name, E-Mail, Status) abgefragt werden.",
      roleAssignmentTitle: "Rollenzuweisung",
      roleAssignmentIntro:
        "Gruppenrollen verwenden ein Nuke-and-Pave-Muster (PUT ersetzt alle). Dies stellt sicher, dass die Datenbank immer exakt mit dem UI-Zustand übereinstimmt. Jede Rolle muss zum selben Mandanten wie die Gruppe gehören. Über Gruppen zugewiesene Rollen erscheinen neben direkt zugewiesenen Rollen im effektiven Berechtigungssatz des Admins.",
      restrictionsTitle: "Feldeinschränkungen",
      restrictionsIntro:
        "Gruppeneinschränkungen folgen demselben Modell wie RestrictedFields auf Rollenebene. Jede Einschränkung zielt auf einen bestimmten Berechtigungscode ab und listet die auszublendenden Felder auf. Beim Login bildet das System die UNION aller eingeschränkten Felder über direkte Rollen und alle Gruppenmitgliedschaften – schränkt eine Quelle 'salary' ein, ist es unabhängig von anderen Zuweisungen eingeschränkt.",
      cascadeTitle: "Kaskadierende Operationen",
      cascadeIntro:
        "Benutzergruppen unterstützen Massenoperationen (Aktivieren, Deaktivieren, Löschen und ihre filterbasierten -all Varianten). Wenn cascadeAdmins aktiviert ist, kaskadiert die Deaktivierung oder das Soft-Delete auf die Gruppenmitglieder. Kaskadierende Operationen überspringen automatisch geschützte Admins (wie den Mandantenersteller). Wenn cascadeAdmins false ist, wird jeder verwaiste Admin, der alle Rollenzuweisungen verliert, automatisch der Fallback-Rolle SYSTEM_DEFAULT zugewiesen.",
      cascadeNote:
        "Kaskadierende Operationen überspringen automatisch geschützte Admins (wie den Mandantenersteller). Dies stellt sicher, dass eine massive Gruppenlöschung nicht versehentlich das primäre Wiederherstellungskonto des Mandanten löscht.",
      endpointsTitle: "API-Endpunkte (18)",
      frontendTitle: "Frontend-Modul",
      frontendIntro:
        "Das Frontend nutzt ein sauberes MVVM-Muster. Der UserGroupService kommuniziert mit dem Backend, das UserGroupRepository validiert Verträge via Zod-Schema-Verifizierung (UserGroupModelSchema) und der UserGroupMapper transformiert Antwort-DTOs. Das useUserGroupsViewModel koordiniert CRUD-Zustände, einschließlich benutzerdefinierter deleteDialog- und statusDialog-Status-Handler für kaskadierende Aktionen.",
      securityNote:
        "Benutzergruppen sind mandantengebunden. SuperAdmins sehen alle Gruppen über Mandanten hinweg. Mandanten-Admins können nur Gruppen innerhalb ihres eigenen Mandanten verwalten. Alle Mutationen werden auditiert und erfordern das user_groups.* Berechtigungsset.",
    },
    ssoOauth: {
      title: "SSO & OAuth Server (Keycloak-Alternative)",
      description:
        "Authentifizierungsserver auf Enterprise-Niveau, der Keycloak, Okta und Auth0 ersetzen kann. Native OIDC-Identity-Provider, OAuth-App-Registrierung, PKCE-Durchsetzung und isolierte Mandantenföderationen.",
      intro:
        "SCRIPE ist nicht nur eine Anwendung; es ist ein Enterprise Identity and Access Management (IAM) Server, der auf OpenIddict basiert. Er funktioniert äquivalent zu Keycloak – als OIDC Relying Party (Client) und als aktiver OAuth2/OIDC-Autorisierungsserver. Mandanten können sich nach außen bei Azure AD/Google authentifizieren oder Systeme von Drittanbietern registrieren, die sich gegen SCRIPE authentifizieren.",
      overviewTitle: "Enterprise IAM Funktionen",
      feat1Title: "Föderierte Identitätsanbieter (IdP)",
      feat1Desc:
        "Binden Sie externe OIDC/OAuth2-Identitätsanbieter sofort an bestimmte Mandanten. Zero-Code-Integration für Azure AD, Google, Okta, Auth0, AWS Cognito oder andere OIDC-kompatible Systeme.",
      feat2Title: "SCRIPE als Server (OAuth-Apps)",
      feat2Desc:
        "Ersetzen Sie Keycloak. Registrieren Sie Business-Systeme von Drittanbietern direkt in SCRIPE. Erstellen Sie Client-IDs und Secrets, steuern Sie Scopes und stellen Sie Enterprise-Grade JWTs aus, die vom SCRIPE-Identitätsspeicher gestützt werden.",
      feat3Title: "Strenge PKCE & Sicherheit",
      feat3Desc:
        "Der veraltete Implicit Flow wurde beseitigt. Die gesamte Authentifizierung – intern und extern – wird streng über Proof Key for Code Exchange (PKCE) über Authorization Code Flows durchgesetzt. Geheimnisse gelangen niemals in den Browser.",
      feat4Title: "Multi-Tenant IAM-Isolierung",
      feat4Desc:
        "Jeder Mandant ist sein eigener isolierter IAM-Realm. Mandanten verwalten ihre eigenen externen SSO-Anbieter und stellen Zugangsdaten für ihre eigenen OAuth-Anwendungen aus, ohne die globale Root-Infrastruktur zu berühren.",
      configTitle: "IAM Setup-Handbuch",
      configContent: "SCRIPE als primäres Authentifizierungs-Gateway konfigurieren:",
      config1Title: "1. Externen Identity Provider binden",
      config1Content:
        "Navigieren Sie zu /settings/identity-providers. Geben Sie Discovery/Authority-URL, Client-ID und Secret aus Azure AD oder Google ein. SCRIPE verhandelt OIDC-Metadaten vollautomatisch.",
      config2Title: "2. Automatisches Claim-Mapping",
      config2Content:
        "Konfigurieren Sie Scopes (openid, profile, email). SCRIPE mappt externe JWT-Claims (wie preferred_username, picture, given_name) automatisch auf interne Admin-/Nutzerprofile, ohne manuelle Dateneingabe.",
      config3Title: "3. IAM-Richtlinien durchsetzen",
      config3Content:
        "Legen Sie fest, ob der Anbieter für Admins (Back-Office) oder Nutzer (Front-Office) ist. Identitätsbindungen sind strikt typisiert, was verhindert, dass sich ein externer Nutzer zu einer Admin-Sitzung hochstuft.",
      config4Title: "4. Drittanbieter-Apps registrieren",
      config4Content:
        "Navigieren Sie zu /settings/oauth-apps, um SCRIPE zum SSO-Anbieter für externe Software (z. B. mobile App oder CRM) zu machen. Definieren Sie Public (SPA) oder Confidential (Backend) Profile.",
      config5Title: "5. Jwks Uri & Discovery",
      config5Content:
        "Externe Anwendungen leiten ihre Authority einfach auf `https://ihre-scripe-instanz.com`. SCRIPE stellt automatisch die Endpunkte `/.well-known/openid-configuration` und `/.well-known/jwks` bereit.",
      managementTitle: "IAM Control Center",
      managementContent:
        "SCRIPE bietet ein dediziertes IAM-Kontrollzentrum in den Systemeinstellungen für die OIDC-Client-Aggregation und die Server-Emissionskonfiguration.",
      loginFlowTitle: "OIDC Architektur",
      loginFlowContent:
        "Beim Login in SCRIPE über Azure AD agiert SCRIPE als Client. Nutzer werden zu Azure geleitet; SCRIPE akzeptiert den Callback, validiert das externe JWT und stellt dann EIN EIGENES internes JWT aus. Dies entkoppelt die interne Autorisierung vom externen Anbieter vollständig.",
      scopingTitle: "Realm (Mandanten) Partitionierung",
      scopingContent:
        "SCRIPE entspricht dem Realm-Konzept von Keycloak durch Mandantenpartitionen. Identity Provider und OAuth-Apps sind strikt an ihre TenantId gebunden. SuperAdmins verwalten alle Realms über 'Tenant-Welt betreten'.",
      scopingTip:
        "Im Gegensatz zu einfachen SaaS-Produkten mischt SCRIPE niemals Identitätskonfigurationen. Wenn Mandant A sein Azure AD anbindet, hat Mandant B absolut keinen Einblick in diese Infrastruktur.",
      samlTitle: "SAML 2.0 Enterprise-Authentifizierung",
      samlContent:
        "Enterprise-Single-Sign-On für Identitätsanbieter mit automatischer Benutzerbereitstellung.",
      oidcCallbackTitle: "OpenID Connect Callback-Pipeline",
      oidcCallbackContent:
        "Sicherer Abgleich von ID-Tokens und kryptografischer Austausch von Authorization-Codes.",
      oauthMirroringTitle: "Profilsynchronisierung via OAuth",
      oauthMirroringContent:
        "Automatische Aktualisierung von Benutzerstammdaten und Profilbildern beim externen Login.",
    },
    loginCustomizer: {
      title: "Login-Customizer-Studio",
      description:
        "Visuelle Anpassung der Anmeldeseite mit 22 Layouts, Design-Tokens, Overlay-/Blur-Steuerung, hellen/dunklen Themes, WCAG AA Barrierefreiheits-Suite und einer sandboxed Live-Vorschau — ganz ohne Code.",
      intro:
        "Das Login Customizer Studio von SCRIPE ist ein leistungsstarker visueller Editor, der Mandantenadministratoren die vollständige Anpassung der Anmeldeseite ohne Programmierung ermöglicht. Das Studio bietet eine geteilte Oberfläche mit 8 Konfigurationstabs — Erscheinungsbild, Farben, Typografie, Hintergrund, Overlay, Branding-Panel, Barrierefreiheit und Erweitert — sowie eine sandboxed iframe-Vorschau rechts.",
      studioTitle: "Studio-Übersicht",
      studioIntro:
        "Das Customizer Studio verwendet eine geteilte Architektur: Das linke Panel enthält 8 tabulierte Konfigurationsabschnitte (Erscheinungsbild, Farben, Typografie, Hintergrund, Overlay, Branding-Panel, Barrierefreiheit, Erweitert), während das rechte Panel ein sandboxed iframe bereitstellt, das die Anmeldeseite mit Live-CSS-Variablen-Injektion via postMessage rendert.",
      studioTip:
        "Alle Studio-Änderungen arbeiten im Entwurfsmodus. Die Live-Anmeldeseite wird niemals beeinflusst, bis Sie explizit auf Veröffentlichen klicken.",
      layoutsTitle: "22 Anmelde-Layouts",
      layoutsIntro:
        "SCRIPE wird mit 22 produktionsbereiten Anmelde-Layouts in vier Kategorien geliefert: T1 Geteilte Layouts (6) bieten ein dediziertes Branding-Panel, T2 Ganzseitige Layouts (8) nutzen den gesamten Viewport, T3 Zentrierte Layouts (4) bieten kompakte kartenbasierte Designs, T4 Spezial-Layouts (4) bieten filmische und künstlerische Behandlungen.",
      layoutsNote:
        "Geteilte Layouts rendern die LoginBranding-Komponente mit unabhängigen Overlay-/Blur-Steuerungen. Ganzseitige Layouts wenden Hintergrund und Overlay auf den gesamten Wrapper an. Zentrierte und Spezial-Layouts haben eigene Rendering-Strategien.",
      tokensTitle: "Design-Token-Pipeline",
      tokensIntro:
        "Das Anpassungssystem basiert auf einer umfassenden Design-Token-Pipeline. Mandanteneinstellungen werden in semantische Tokens transformiert und ins Live-DOM injiziert, einschließlich 23+ barrierefreiheitsspezifischer CSS-Regeln.",
      bgOverlayTitle: "Hintergrund- & Overlay-Steuerung",
      bgOverlayIntro:
        "Hintergrund- und Overlay-Steuerungen passen sich dem ausgewählten Layout-Typ an.",
      bgOverlayWarning:
        "Bei geteilten Layouts ist das Overlay auf den Formularbereich und das Branding-Panel unabhängig begrenzt. CSS-Variablen mit dem Wert 0 werden korrekt ausgegeben.",
      themeTitle: "Hell/Dunkel-Theme-Architektur",
      themeIntro:
        "Der Login Customizer unterstützt unabhängige Konfigurationen für hellen und dunklen Modus. Bei aktiviertem Dunkelmodus wird ein separater Satz CSS-Variablen ausgegeben.",
      brandingTitle: "Branding-Panel",
      brandingIntro:
        "Das Branding-Panel (sichtbar in geteilten Layouts) bietet dedizierte Steuerungen für die Markenseite der Anmeldeseite.",
      draftTitle: "Entwurf / Veröffentlichen / Zurücksetzen",
      draftIntro:
        "Das Studio implementiert einen sicheren Entwurf → Vorschau → Veröffentlichen-Workflow mit optimistischer Nebenläufigkeitskontrolle.",
      draftNote:
        "Optimistische Nebenläufigkeit verhindert Datenverlust bei gleichzeitiger Bearbeitung. Wenn ein anderer Administrator während Ihrer Bearbeitung veröffentlicht, wird Ihre Veröffentlichung abgelehnt (409).",
      safeModeTitle: "Sicherer Modus",
      safeModeIntro:
        "Der Sichere Modus ist ein Notfall-Fallback, der alle Mandanten-Branding-Anpassungen umgeht und die Plattform-Standardwerte wiederherstellt.",
      accessTitle: "Zugriffskontrolle",
      accessIntro:
        "Die Login-Anpassung folgt dem rollenbasierten Zugriffskontrollmodell von SCRIPE. Das Öffnen des Customizer Studios erfordert die Berechtigung branding.manage.",
      a11yTitle: "Barrierefreiheits-Suite (WCAG AA)",
      a11yIntro:
        "Der Barrierefreiheitsbereich bietet 32 Einstellungen in 8 Kategorien, um die Anmeldeseite vollständig WCAG-AA-konform zu machen. Enthält Echtzeit-Validierung, Ein-Klick-Profile und eine automatische WCAG-Audit-Engine.",
      a11yCategoriesTitle: "8 Einstellungskategorien",
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
      a11yProfilesTitle: "6 Ein-Klick-Profile",
      a11yProfilesIntro:
        "Vorkonfigurierte Barrierefreiheitsprofile wenden sofort Batch-Einstellungen an.",
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
      a11yAuditTitle: "Echtzeit-WCAG-Audit-Engine",
      a11yAuditIntro:
        "Der useAccessibilityChecker-Hook führt 4 automatische Echtzeit-Prüfungen durch: Kontrastvalidierung (4,5:1), Touch-Zielgröße (min. 44px), Overlay-Lesbarkeit und Bewegungseinstellungen.",
      a11yAutoFixTitle: "Auto-Fix-Mechanismus",
      a11yAutoFixIntro:
        "Die Audit-Engine enthält eine autoFix-Funktion, die fehlgeschlagene Prüfungen automatisch behebt, indem Entwurfseinstellungen für WCAG-AA-Konformität angepasst werden.",
      a11yCssTitle: "CSS-Injektions-Pipeline",
      a11yCssIntro:
        "Der useLoginBrandingTokens-Hook gibt 23+ barrierefreiheitsspezifische CSS-Regeln über eine einzelne <style>-Tag-Injektion aus.",
      a11yPreviewTitle: "Vorschau-Integration",
      a11yPreviewIntro:
        "LoginPreviewShell zeigt Barrierefreiheitsfunktionen in Echtzeit mit einem Badge, der die Anzahl aktiver Barrierefreiheitsfunktionen anzeigt.",
      archTitle: "Modul-Architektur",
      archIntro:
        "Der Login Customizer folgt der standardmäßigen modularen Clean Architecture von SCRIPE mit Domain-, Daten- und Präsentationsschichten, einschließlich AccessibilityPanel für WCAG-Einstellungen und -Profile.",
      archTip:
        "Die Komponenten BgControls und PresetDots sind absichtlich auf Modulebene definiert (nicht inline), um zu verhindern, dass React Eingabefelder während des Re-Renderings entfernt/neu montiert.",
      relatedTitle: "Related Features",
      relatedIntro:
        "The Login Customizer Studio is part of a larger customization ecosystem. See these companion features for complete coverage:",
      relatedMarketplace:
        "Theme Marketplace — Browse, preview, and apply 40 premium branding packages with per-page overrides.",
      relatedMultiPage:
        "Multi-Page Branding — Configure independent branding for Login, Forgot Password, and Reset Password pages.",
      relatedBuilder:
        "Login Page Builder — Drag-and-drop visual canvas for building custom login page layouts with 14 component types.",
      logoPathsTitle: "Logo-Pfade & Auflösung",
      logoPathsIntro:
        "Mandanten-Logo-Assets werden in einem dedizierten lokalen oder Cloud-Speicherverzeichnis (Standard: 'FileHost/TenantLogos/') gespeichert, das über das Dateispeicherschema 'tenant-logo' strukturiert ist. Gespeicherte Dateien werden als '{TenantCode}_logo.{extension}' benannt, um Namenskollisionen zu vermeiden und die Mandantentrennung zu erzwingen. Bereitgestellte Logo-Anforderungspfade werden über '/api/files/tenant-logos/{filename}' geleitet, was Medienendungen (JPG, PNG, WEBP, GIF, SVG) validiert und ein Dateigrößenlimit von 10 MB erzwingt.",
      cssPreviewsTitle: "Live-CSS-Vorschau-Pipeline",
      cssPreviewsIntro:
        "Der Live-Vorschaurahmen im Customizer Studio kommuniziert über einen sicheren, herkunftsvalidierten postMessage-Kanal unter Verwendung des useStudioBridge-Hooks. Wenn ein Administrator ein Design-Token im Seitenleistenpanel ändert, sendet das übergeordnete Fenster ein Echtzeit-postMessage-Ereignis, das das vollständige serialisierte StudioDraft-Objekt enthält. Das Vorschau-iframe (z.B. LoginPreviewShell) fängt die Nachricht ab und ruft useLoginBrandingTokens auf, um CSS-Variablen (--login-*) auf dem document :root-Element sofort zu aktualisieren und latenzfreie DOM-Neuzeichnungen bereitzustellen.",
    },
    dashboardBuilder: {
      title: "Dashboard-Builder",
      description:
        "Server-synchronisierte Admin-Einstellungen mit 4-Schichten-Merge-Engine, 61 konfigurierbaren Einstellungen, FOUC-Prävention, 409-Konfliktlösung und editionsbasierter Feature-Kontrolle.",
      intro:
        "Der Dashboard-Builder ist SCRIPEs Enterprise-Klasse Admin-Präferenzsystem, das 61 konfigurierbare Dashboard-Einstellungen zwischen Browser und Server synchronisiert. Es verwendet eine 4-Schichten-Merge-Engine (Plattform → Mandant → Admin → Laufzeit) zur Auflösung von Einstellungen mit mandantenbasierter Override-Kontrolle, geräteübergreifender Persistenz über AdminSettingsJson und 5 Edge-Case-Schutzmaßnahmen.",
      overviewTitle: "Systemübersicht",
      overviewIntro:
        "Der Dashboard-Builder bietet einen vollständigen Lebenszyklus für Admin-Einstellungen — von sofortigem Cache-First-Rendering bis hin zur Hintergrund-Serverabstimmung.",
      overviewTip:
        "Einstellungen werden sofort aus dem localStorage-Cache beim Seitenaufruf gerendert. Der Server-Abruf erfolgt im Hintergrund.",
      mergeEngineTitle: "4-Schichten-Merge-Engine",
      mergeEngineIntro:
        "Einstellungen folgen einer strengen 4-Schichten-Prioritätskette. Jede Schicht kann die vorherige überschreiben, mit optionaler pfadbasierter Zugriffskontrolle auf Mandantenebene.",
      mergeEngineNote:
        "Schicht 2 (Editions-Einschränkungen) wird serverseitig über die FeatureCheckBehavior-Pipeline behandelt.",
      syncHookTitle: "Server-Sync-Hook",
      syncHookIntro:
        "Der useAdminSettingsSync-Hook verwaltet den kompletten Lebenszyklus der Admin-Einstellungen: Erstladen aus dem Cache, verzögertes Flushing, Hintergrund-Server-Abruf und stille Abstimmung.",
      edgeCasesTitle: "Edge-Case-Schutzmaßnahmen",
      edgeCasesIntro:
        "Das Sync-System behandelt 5 kritische Edge Cases, die in Enterprise-Umgebungen häufig auftreten.",
      edgeCasesWarning:
        "Der PENDING_SETTINGS_FLUSH-Schlüssel überlebt absichtlich das Logout, um Einstellungen beim nächsten Login zu flushen.",
      settingsRefTitle: "Einstellungsreferenz (61 Einstellungen)",
      settingsRefIntro:
        "Alle 61 Einstellungen sind in 9 Abschnitte organisiert. Jede Einstellung hat einen definierten Typ, Standardwert, DOM-Datenattribut und optionale Editions-Kontrolle.",
      overrideControlTitle: "Admin-Override-Kontrolle",
      overrideControlIntro:
        "Mandantenadministratoren können steuern, welche Einstellungen einzelne Admins anpassen dürfen.",
      securityTitle: "Sicherheitsmodell",
      securityIntro:
        "Der Dashboard-Builder implementiert Defense-in-Depth-Sicherheit, um Datenlecks zwischen Admins und Payload-Überläufe zu verhindern.",
      archTitle: "Architektur & Dateiübersicht",
      archIntro:
        "Der Dashboard-Builder ist über 7 Dateien in der Core-Schicht implementiert und folgt SCRIPEs Provider-basiertem Architekturmuster.",
      archTip:
        "Um eine neue Einstellung hinzuzufügen, erweitern Sie die Settings-Schnittstelle und defaultSettings in settings-provider.tsx.",
      widgetConfigTitle: "Widget- & Grid-Konfigurationsschema",
      widgetConfigIntro:
        "Jedes Widget auf der Dashboard-Builder-Leinwand ist ein positionierter Block in einem 12-Spalten-CSS-Grid. Der Builder konfiguriert Spalten, Zeilen, Ausrichtung, spezifische Props, zIndex und Sichtbarkeit und serialisiert diese zusammen mit den bestehenden Theme-Tokens in DashboardThemeJson.",
    },
    themeMarketplace: {
      title: "Theme Marketplace",
      description:
        "40 premium branding packages, 7 categories, 5 pricing tiers, per-page overrides, copy-on-apply snapshot semantics, and a full clean-architecture data layer — all seeded and ready to browse.",
      intro:
        "The Theme Marketplace is SCRIPE's curated catalog of 40 production-ready branding packages. Each theme is a comprehensive visual identity — not just a color swap — containing 50+ design tokens spanning colors, typography, spacing, overlay, dark mode, branding panel, and per-page overrides for Login, Forgot Password, and Reset Password pages. Themes are stored as structured JSON in the LoginTheme entity, browsable via a full-page gallery with rich filtering, and applied to tenant settings with copy-on-apply snapshot semantics that permanently isolate applied configurations from future marketplace updates.",
      archTitle: "Marketplace Architecture",
      archIntro:
        "The Theme Marketplace follows a pipeline architecture: backend seeder populates the LoginTheme table with 40 records → API exposes paginated list, detail, and apply endpoints → frontend gallery renders themes with advanced filtering → apply action snapshots the ThemeDataJson into tenant's DraftBrandingJson → publish propagates to LiveBrandingJson. Each layer is fully decoupled.",
      archDataFlowTitle: "Data Flow Pipeline",
      archDataFlowIntro:
        "1. LoginThemeSeeder.cs seeds 40 themes at application startup (upsert-safe). 2. ThemesController exposes GET /themes (list), GET /themes/{id} (detail), POST /themes/{id}/apply (apply). 3. Frontend ThemeMarketplaceService calls the API via IApiService. 4. ThemeMarketplaceMapper converts DTOs to domain entities. 5. ThemeMarketplaceRepository orchestrates services + mappers. 6. useThemeMarketplace hook provides ViewModel state. 7. ThemeGalleryView renders the marketplace UI.",
      archLayersTitle: "Clean Architecture Layers",
      archLayersIntro:
        "The marketplace follows SCRIPE's standard 3-layer module structure: Domain layer (ThemeDetail entity, IThemeMarketplaceRepository, IThemeMarketplaceService interfaces), Data layer (ThemeMarketplaceService, ThemeMarketplaceRepository, ThemeMarketplaceMapper, ThemeMarketplaceTypes models), and Presentation layer (ThemeGalleryView, ThemeManagementView, ThemeDetailModal, ThemeCard, useThemeMarketplace hook).",
      entityTitle: "LoginTheme Entity",
      entityIntro:
        "Each marketplace theme is stored as a LoginTheme entity in the Identity module's database. The entity extends AuditableEntity, providing soft-delete, audit trail, and optimistic concurrency. The core data is stored in ThemeDataJson — a JSON column containing the full design specification.",
      entityFieldsTitle: "Entity Fields",
      entityFieldName:
        "Name — Human-readable theme name (e.g., 'Midnight Aurora', 'Sakura Bloom'). Unique per system.",
      entityFieldCategory:
        "Category — Classification tag (corporate, creative, dark, elegant, luxury, minimal, nature). Used for gallery filtering.",
      entityFieldDescription:
        "Description — Marketing-quality description of the theme's visual identity and design philosophy.",
      entityFieldThumbnail: "ThumbnailUrl — Optional preview image URL for gallery cards.",
      entityFieldPreviewUrl:
        "PreviewUrl — Optional full-size preview image URL for the detail modal.",
      entityFieldThemeData:
        "ThemeDataJson — JSON column containing the complete design specification (50+ tokens). This is the heart of each theme.",
      entityFieldTier:
        "Tier — Pricing/access tier (Free, Starter, Professional, Enterprise, StandaloneAddon). Controls edition-based access gating.",
      entityFieldIsSystem:
        "IsSystemTheme — Boolean flag. System themes are seeded at startup and cannot be deleted by tenants.",
      entityFieldIsActive:
        "IsActive — Boolean flag. Inactive themes are hidden from the gallery but preserved in the database.",
      entityFieldTag:
        "Tags — Optional comma-separated tags for search (e.g., 'gradient, glass, modern, dark').",
      entityFieldVersion:
        "Version — Semantic version string (e.g., '1.0.0'). Incremented when the theme design is updated.",
      entityFieldAuthor: "Author — Creator identifier (e.g., 'SCRIPE Design Team').",
      entityFieldLikes:
        "LikesCount — Engagement counter. Tracks how many tenants have favorited this theme.",
      entityFieldApplied:
        "AppliedCount — Usage counter. Tracks how many tenants have applied this theme.",
      schemaTitle: "ThemeDataJson Schema (50+ Design Tokens)",
      schemaIntro:
        "The ThemeDataJson column stores a comprehensive JSON object containing every visual parameter needed to fully render a branded login page. The schema is versioned and contains 7 major sections: layout, colors, dark mode colors, typography, spacing, overlay, and branding panel. Each token maps directly to a CSS custom property via the useLoginBrandingTokens pipeline.",
      schemaVersionTitle: "Schema Version",
      schemaVersionIntro:
        "The root 'version' field tracks the JSON schema version. Current version is '2.0'. The frontend handles backward compatibility — older schemas are normalized at read time.",
      schemaLayoutTitle: "Layout Configuration",
      schemaLayoutIntro:
        "Controls the page structure: selectedLayout (one of 22 layout identifiers), loginPosition (left/center/right), formWidth, formMaxWidth, containerPadding, and formAlignment. Layout selection determines which rendering strategy the LoginPage component uses.",
      schemaColorsTitle: "Color System (16 Tokens)",
      schemaColorsIntro:
        "The colors section defines the complete light-mode palette: primaryColor (brand accent), secondaryColor (complementary), backgroundColor (page background), formBackground (form card), textColor (primary text), secondaryTextColor (muted text), inputBackground (form input fields), inputBorderColor, inputTextColor, buttonColor (primary CTA), buttonTextColor, buttonHoverColor, linkColor, linkHoverColor, borderColor (general borders), and accentColor (highlights/badges).",
      schemaDarkTitle: "Dark Mode Color System (10 Tokens)",
      schemaDarkIntro:
        "Independent dark-mode palette: darkEnabled (boolean toggle), darkFormBackground, darkTextColor, darkInputBackground, darkInputBorderColor, darkInputTextColor, darkButtonColor, darkButtonTextColor, darkSecondaryTextColor, and darkBorderColor. These tokens are emitted as --login-dark-* CSS variables and activated via the [data-theme='dark'] selector.",
      schemaTypographyTitle: "Typography Configuration (8 Tokens)",
      schemaTypographyIntro:
        "Controls all text rendering: fontFamily (Google Fonts name, e.g., 'Playfair Display'), headingFontFamily (optional separate heading font), fontSize (base size in px), headingSize, labelSize, inputFontSize, fontWeight (normal/medium/semibold/bold), and letterSpacing. Fonts are loaded dynamically via the Google Fonts CDN.",
      schemaSpacingTitle: "Spacing & Dimensions (6 Tokens)",
      schemaSpacingIntro:
        "Controls layout geometry: borderRadius (global border-radius in px), inputBorderRadius, buttonBorderRadius, inputHeight (in px), buttonHeight, and gap (spacing between form elements). These values are emitted as CSS custom properties and applied uniformly across all 22 layouts.",
      schemaOverlayTitle: "Overlay & Effects (8 Tokens)",
      schemaOverlayIntro:
        "Controls visual effects layered on backgrounds: overlayColor (RGBA), overlayOpacity (0–100%), overlayBlur (0–20px in Gaussian blur), backgroundType ('color', 'gradient', 'image'), backgroundValue (CSS gradient string or image URL), backgroundSize, backgroundPosition, and backgroundRepeat. Overlay settings can be scoped to the form section or branding panel independently.",
      schemaPanelTitle: "Branding Panel Configuration (12 Tokens)",
      schemaPanelIntro:
        "Controls the branding side of split layouts: panelLogo (URL), panelHeadline (heading text), panelSubtitle (subheading text), panelHeadlineColor, panelSubtitleColor, panelBackgroundType, panelBackgroundValue, panelOverlayColor, panelOverlayOpacity, panelOverlayBlur, panelLogoSize (small/medium/large), and panelAlignment (left/center/right). These tokens are only rendered in T1 Split layouts.",
      perPageTitle: "Per-Page Branding Architecture",
      perPageIntro:
        "Each theme can define independent visual overrides for three authentication pages: Login, Forgot Password, and Reset Password. The 'pages' block in ThemeDataJson contains page-specific layout, headline, subtitle, overlay, and background settings that are merged on top of the global design when that page is active. This enables a single theme to present different messaging and visual treatments for different auth flows.",
      perPageStructTitle: "Pages Block Structure",
      perPageStructIntro:
        "The 'pages' object in ThemeDataJson contains three optional keys: 'login', 'forgotPassword', and 'resetPassword'. Each key maps to a page override object with fields: selectedLayout, panelHeadline, panelSubtitle, overlayColor, overlayOpacity, backgroundType, backgroundValue, and any other token that should differ from the global configuration.",
      perPageMergeTitle: "Merge Strategy",
      perPageMergeIntro:
        "When a tenant previews a theme's Forgot Password page, the frontend merges the global design tokens with the forgotPassword override using spread semantics: { ...globalTokens, ...pages.forgotPassword }. This means any token not specified in the page override inherits from the global design — only the explicitly overridden values change. The merge happens in the previewTheme() function in useStudioViewModel.ts.",
      perPageIsolationTitle: "State Isolation",
      perPageIsolationNote:
        "Each auth page can have its own layout, headline, subtitle, and overlay without affecting the other pages. The Login page might use a full-image corporate layout while Forgot Password uses a clean centered card — all within the same theme.",
      catalogTitle: "40-Theme Catalog Overview",
      catalogIntro:
        "SCRIPE ships with 40 meticulously designed branding packages. Each theme is a unique visual identity crafted for a specific market segment or brand aesthetic. Themes span 7 categories, use 30+ different Google Fonts, cover all 22 layouts, and include per-page branding overrides for Login, Forgot Password, and Reset Password.",
      catalogDiversityTitle: "Design Diversity Matrix",
      catalogDiversityIntro:
        "The 40-theme catalog achieves maximum diversity across multiple axes: each theme uses a unique Google Font pairing, no two themes share the same color palette, all 7 categories are represented, and the layout distribution covers T1 Split (16), T2 Full-Page (12), T3 Centered (6), and T4 Special (6). This ensures every tenant can find a theme that matches their brand identity.",
      tierTitle: "5-Tier Pricing Model",
      tierIntro:
        "Themes are organized into 5 pricing tiers that align with SCRIPE's edition system. Each tier provides increasing design sophistication and customization depth. Tier enforcement is handled by the theme marketplace frontend — themes from higher tiers display an 'Upgrade Required' badge and disable the Apply button for tenants on lower editions.",
      tierFreeTitle: "Free Tier (8 Themes)",
      tierFreeIntro:
        "Essential branding packages available to all tenants regardless of edition. Clean, professional designs suitable for quick deployment. Includes Starter themes across corporate, minimal, and creative categories.",
      tierStarterTitle: "Starter Tier (8 Themes)",
      tierStarterIntro:
        "Enhanced branding packages for Starter-edition tenants. Richer color palettes, premium font pairings, and gradient backgrounds. Includes Starter-exclusive designs across corporate, dark, and elegant categories.",
      tierProTitle: "Professional Tier (10 Themes)",
      tierProIntro:
        "Advanced branding packages for Professional-edition tenants. Sophisticated visual treatments with glass-morphism effects, editorial typography, and multi-tone overlays. Includes the most diverse category coverage.",
      tierEnterpriseTitle: "Enterprise Tier (8 Themes)",
      tierEnterpriseIntro:
        "Premium branding packages for Enterprise-edition tenants. Ultra-premium designs with cinematic layouts, luxury typography (Cormorant Garamond, Italiana, Cinzel Decorative), and exclusive dark-mode treatments.",
      tierStandaloneTitle: "Standalone Add-on Tier (6 Themes)",
      tierStandaloneIntro:
        "Ultra-exclusive standalone branding packages available as individual add-on purchases. These represent the most unique and specialized designs — botanical illustrations, art deco, brutalist, vaporwave, and zen-inspired themes that make a bold brand statement.",
      categoriesTitle: "7 Theme Categories",
      categoriesIntro:
        "Every theme belongs to exactly one category. Categories enable intuitive gallery browsing and filtering. The distribution ensures broad coverage: Corporate (8), Creative (6), Dark (6), Minimal (5), Elegant (5), Luxury (5), Nature (5).",
      catCorporate:
        "Corporate — Professional business identity. Clean lines, serif/sans-serif font pairs, subtle gradients, blue/navy/gray palettes. Designed for financial services, consulting, law firms.",
      catCreative:
        "Creative — Bold, expressive identity. Vibrant colors, playful typography (Poppins, Quicksand), animated gradients, modern card layouts. Designed for agencies, startups, tech companies.",
      catDark:
        "Dark — Sophisticated dark-mode-first identity. Deep backgrounds (slate, zinc, charcoal), accent-driven highlights (cyan, amber, rose), premium glass effects. Designed for developer tools, media, gaming.",
      catMinimal:
        "Minimal — Reductive, content-focused identity. Monochromatic palettes, generous whitespace, thin borders, system-optimized typography. Designed for productivity tools, documentation, SaaS platforms.",
      catElegant:
        "Elegant — Refined, luxurious identity. Rose gold, champagne, pearl gradients, serif typography (Playfair Display, Cormorant), delicate overlays. Designed for beauty, fashion, hospitality.",
      catLuxury:
        "Luxury — Ultra-premium brand identity. Black/gold/platinum palettes, display typography (Italiana, Cinzel Decorative), full-bleed imagery, art-directed layouts. Designed for high-end brands, private banking, exclusive services.",
      catNature:
        "Nature — Organic, earth-inspired identity. Forest greens, terracotta, ocean blues, botanical accents, rounded shapes, warm serif typography. Designed for sustainability, wellness, organic brands.",
      componentsTitle: "Frontend Component Inventory",
      componentsIntro:
        "The Theme Marketplace frontend consists of 8 purpose-built components spanning 3 pages and 1 modal. Each component follows SCRIPE's presentation-layer patterns using domain entities (never DTOs) and consuming data exclusively through the DI container.",
      compGalleryView:
        "ThemeGalleryView (26KB) — Full-page marketplace with animated hero section, category filter chips, search bar, grid/list view toggle, tier filter tabs, sort controls (popular/newest/name), infinite scroll pagination, and a responsive 3-column grid of ThemeCard components.",
      compManagementView:
        "ThemeManagementView (12KB) — Admin CRUD page for managing system themes. DataTable with columns: thumbnail, name, category, tier, status, likes, applies, actions. Supports create, edit, activate/deactivate, and bulk operations.",
      compDetailModal:
        "ThemeDetailModal (28KB) — Richly detailed theme preview modal. Contains: full-size preview image, design token summary (colors, fonts, spacing), feature matrix (dark mode, per-page, overlay), category/tier badges, Apply button with confirmation dialog, and like/favorite toggles.",
      compThemeCard:
        "ThemeCard — Gallery grid item. Displays: thumbnail, name, category badge, tier badge, color palette strip (5 primary colors), font family name, like count, apply count, and hover-to-preview animation.",
      compMarketplacePanel:
        "ThemeMarketplacePanel — Inline panel within the Customizer Studio sidebar. Shows a compact gallery of themes with quick-apply functionality. Allows browsing and applying themes without leaving the studio.",
      applyTitle: "Theme Application Flow",
      applyIntro:
        "Applying a marketplace theme follows a 5-step pipeline: 1. User clicks Apply on a theme. 2. Frontend reads the theme's ThemeDataJson. 3. previewTheme() in useStudioViewModel merges the design tokens (including per-page overrides) into the current StudioDraft. 4. The merged draft is saved to the tenant's DraftBrandingJson via PUT /tenants/{id}/settings. 5. Admin publishes the draft to make it live.",
      copyOnApplyTitle: "Copy-on-Apply Snapshot Semantics",
      copyOnApplyIntro:
        "When a theme is applied, the ThemeDataJson is COPIED into the tenant's DraftBrandingJson — not linked. This means the tenant's branding is permanently isolated from future marketplace updates. If the theme is updated in v2.0, existing tenants who applied v1.0 retain their v1.0 snapshot. This prevents unexpected visual changes to production login pages.",
      copyOnApplyNote:
        "Copy-on-apply is a deliberate architectural decision. It trades storage efficiency for deployment safety — a critical requirement for enterprise tenants who negotiate specific branding contracts.",
      previewFlowTitle: "Preview Before Apply",
      previewFlowIntro:
        "The previewTheme() function in useStudioViewModel.ts performs a non-destructive preview by temporarily injecting theme tokens into the draft state. The preview is displayed in the sandboxed iframe via postMessage CSS variable injection. The draft is NOT saved until the user explicitly confirms the application. Canceling the preview restores the previous draft state.",
      seedingTitle: "Backend Seeding Architecture",
      seedingIntro:
        "All 40 themes are seeded at application startup by LoginThemeSeeder.cs. The seeder uses an upsert-safe strategy: it checks for existing themes by Name and only inserts new ones — existing themes are never overwritten. This ensures idempotent deployment across environments.",
      seedHelperTitle: "Build() Helper Architecture",
      seedHelperIntro:
        "The seeder uses a fluent Build() helper with ThemeMeta and ThemeDesign records for clean theme definition. ThemeMeta contains name, category, tier, description, author, version, and tags. ThemeDesign contains all 50+ design tokens plus per-page overrides (PageOverrideDesign records for ForgotPassword and ResetPassword). The BuildFullThemeJson() method serializes the ThemeDesign record into the JSON format expected by the frontend.",
      seedUpsertTitle: "Upsert-Safe Strategy",
      seedUpsertIntro:
        "The seeder queries all existing theme names before processing. For each of the 40 themes, it checks the existing set — if the name exists, the theme is skipped. New themes are added to the DbContext in a single batch and saved with one SaveChangesAsync call. This makes the seeder safe to run repeatedly without duplicating themes or losing manual edits.",
      governanceTitle: "Marketplace Governance",
      governanceIntro:
        "Theme access is controlled by a combination of edition-based tier enforcement and permission-based administrative access. The marketplace respects SCRIPE's multi-tenancy model — themes are globally visible but apply operations are scoped to the current tenant.",
      governanceEditionTitle: "Edition-Based Tier Enforcement",
      governanceEditionIntro:
        "Each theme's Tier field maps to an edition level. The frontend gallery marks themes above the tenant's edition with an 'Upgrade Required' badge and disables the Apply button. The backend apply endpoint verifies the tenant's active subscription against the theme's tier before allowing application.",
      governancePermissionTitle: "Permission Requirements",
      governancePermissionIntro:
        "Browsing the marketplace requires the branding.view permission. Applying a theme requires branding.manage. Managing system themes (CRUD) requires the themes.manage permission, which is restricted to System Admins.",
      governanceTenantTitle: "Tenant Isolation",
      governanceTenantIntro:
        "When a theme is applied, it modifies only the current tenant's DraftBrandingJson. The apply operation is scoped via the JWT tenant_id claim. SuperAdmins can apply themes on behalf of any tenant via the 'Enter Tenant World' drill-down capability.",
      endpointsTitle: "Theme API Endpoints",
      endpointsIntro:
        "The theme marketplace exposes endpoints through the existing TenantSettings and Themes controllers. Theme data is served as part of the branding configuration pipeline.",
      endpointList:
        "GET /api/v1/themes — Paginated list of active themes with category, tier, and search filters.",
      endpointDetail:
        "GET /api/v1/themes/{id} — Full theme detail including ThemeDataJson, metadata, and engagement counters.",
      endpointApply:
        "POST /api/v1/themes/{id}/apply — Apply theme to the current tenant's draft settings. Copies ThemeDataJson to DraftBrandingJson.",
      endpointLike:
        "POST /api/v1/themes/{id}/like — Toggle like/favorite for the current admin. Increments/decrements LikesCount.",
      endpointManage:
        "POST/PUT/DELETE /api/v1/themes — System admin CRUD for managing theme catalog (create, update, deactivate).",
      sourceTitle: "Source File Reference",
      sourceBackend:
        "Backend: LoginThemeSeeder.cs (seeder), LoginTheme.cs (entity), ThemeConfiguration.cs (EF config)",
      sourceFrontend:
        "Frontend: ThemeGalleryView.tsx, ThemeManagementView.tsx, ThemeDetailModal.tsx, ThemeCard.tsx",
      sourceData:
        "Data Layer: ThemeMarketplaceService.ts, ThemeMarketplaceRepository.ts, ThemeMarketplaceMapper.ts, ThemeMarketplaceTypes.ts",
      sourceDomain:
        "Domain Layer: ThemeDetail.ts (entity), IThemeMarketplaceService.ts, IThemeMarketplaceRepository.ts",
      sourceViewModel:
        "ViewModel: useThemeMarketplace.ts (gallery state), useStudioViewModel.ts (preview/apply integration)",
      devProfilesTitle: "Theme-Entwicklerportal & Profile",
      devProfilesIntro:
        "Der Theme-Marktplatz ermöglicht es registrierten Theme-Entwicklern, ihre Designs zu veröffentlichen. Entwicklerprofile werden über den DeveloperProfileController registriert und verwaltet und als mandantengebundene DeveloperProfile-Entitäten gespeichert. Die Verifizierung von Profilen ist auf Plattformadministratoren beschränkt (VerifyDeveloperCommand), während Auszahlungen und Provisionssätze über den AppFinancialsController (erfordert Berechtigungen wie developerprofiles.verify und developerpayouts.process) und Zahlungs-Gateways (Stripe Connect) verfolgt werden.",
      purchaseVerifyTitle: "Kaufverifizierungssequenz",
      purchaseVerifyIntro:
        "Premium- und Standalone-Themes erfordern einen expliziten Kauf, bevor sie von einem Mandanten angewendet werden können. Das System prüft die Stufe des Mandanten und bestehende Käufe (GetPurchasedThemeIdsAsync) in der Datenbank. Wenn ein Kauf erforderlich ist, leitet das System den Administrator zu einer sicheren Stripe Checkout-Sitzung weiter. Nach erfolgreicher Zahlung sendet Stripe einen checkout.session.completed-Webhook mit der Korrelations-ID, wodurch ein LoginThemePurchase-Datensatz in der Datenbank erstellt wird, der dauerhaften Zugriff auf dieses Theme gewährt.",
      downloadsVerifyTitle: "Theme-Download-Verifizierung",
      downloadsVerifyIntro:
        "Um benutzerdefinierte Theme-Presets oder Offline-Konfigurations-Assets sicher herunterzuladen, implementiert das System ein sitzungsgebundenes Dateidownload-Framework. Der Medien-DownloadsController generiert über den IDownloadService eine zeitlich begrenzte, kryptografisch zufällige sessionId. Der Benutzer lädt das Paket über eine sichere GET-Anforderung an /api/v1/downloads/session/{sessionId} herunter, wodurch clientseitige Authentifizierungs-Header im Download-Link vermieden und Dateien vor unbefugtem Zugriff geschützt werden.",
    },
    multiPageBranding: {
      title: "Multi-Page Branding",
      description:
        "Independent visual customization for Login, Forgot Password, and Reset Password pages — shared design tokens with per-page overrides, isolated preview, and theme integration.",
      intro:
        "Multi-Page Branding extends SCRIPE's Login Customizer Studio to support independent visual configurations for all three authentication pages: Login, Forgot Password, and Reset Password. Instead of forcing a single visual identity across all auth flows, Multi-Page Branding allows tenants to present context-appropriate messaging, layouts, and visual treatments for each page. A shared global design provides consistency, while per-page overrides enable targeted differentiation — all managed through the same zero-code studio interface.",
      pagesTitle: "Supported Authentication Pages",
      pagesIntro:
        "SCRIPE's authentication system exposes three distinct pages, each serving a different user intent. Multi-Page Branding allows independent customization of all three while maintaining visual consistency through shared design tokens.",
      pageLogin:
        "Login Page — The primary authentication entry point. Users enter their credentials (email + password) to access the platform. This page receives the most visual attention as it creates the first impression of the tenant's brand.",
      pageForgot:
        "Forgot Password Page — The password recovery entry point. Users enter their email to receive a reset link. This page benefits from reassuring messaging ('We'll help you get back in') and softer visual treatments that convey trust and care.",
      pageReset:
        "Reset Password Page — The password change confirmation page. Users set a new password using the link from their email. This page benefits from action-oriented messaging ('Create your new password') and clear, focused layouts that minimize distraction.",
      pagesNote:
        "Each page can independently configure: layout, headline, subtitle, background, overlay, and any design token. Tokens not explicitly overridden inherit from the global configuration — enabling 'configure once, override selectively' workflow.",
      stateTitle: "State Isolation Model",
      stateIntro:
        "Multi-Page Branding uses a layered state model. The global StudioDraft contains the base configuration for all pages. Each page has an optional override object (pageOverrides.login, pageOverrides.forgotPassword, pageOverrides.resetPassword) that stores only the tokens that differ from the global. This minimizes storage and simplifies diff tracking.",
      stateGlobalTitle: "Global Layer (Shared Tokens)",
      stateGlobalIntro:
        "The global layer contains all 50+ design tokens: colors, typography, spacing, overlay, dark mode, and branding panel settings. These tokens apply to ALL auth pages by default. The global layer is always defined — it is never empty.",
      stateOverrideTitle: "Page Override Layer (Per-Page Tokens)",
      stateOverrideIntro:
        "Each page's override layer contains ONLY the tokens that differ from the global configuration. For example, if the Forgot Password page has a different headline and subtitle but shares all colors and typography, only panelHeadline and panelSubtitle are stored in the override. Empty fields inherit from the global layer.",
      stateMergeTitle: "Runtime Merge Strategy",
      stateMergeIntro:
        "When the studio switches to a specific page tab, the effective configuration is computed as: effectiveConfig = { ...globalDraft, ...pageOverrides[currentPage] }. This spread-merge ensures that page-specific overrides take precedence while all unspecified tokens fall through to the global values. The merge is performed in the previewTheme() function and in the CSS token emission pipeline.",
      stateMergeNote:
        "The merge is a shallow spread — nested objects (like darkColors or overlay) are replaced entirely, not deep-merged. This is intentional: if a page overrides the overlay, it should control the complete overlay configuration, not inherit partial values from the global.",
      studioTitle: "Studio Integration — Page Tabs",
      studioIntro:
        "The Customizer Studio sidebar includes a page tab strip (AuthPageTabs component) that allows switching between Login, Forgot Password, and Reset Password. When the active tab changes, the studio loads the corresponding page override (if any) and merges it with the global draft for preview. The preview iframe navigates to the selected auth page route.",
      studioTabsTitle: "AuthPageTabs Component",
      studioTabsIntro:
        "The AuthPageTabs component renders a horizontal tab bar with 3 tabs (Login, Forgot Password, Reset Password). Each tab displays the page name and an optional 'Customized' badge if per-page overrides exist. Clicking a tab updates the activePage state in the studio, triggers a preview refresh, and loads the page-specific sidebar panel settings.",
      studioSwitchTitle: "Tab Switching Flow",
      studioSwitchIntro:
        "When a user switches tabs: 1. The activePage state is updated to 'login', 'forgotPassword', or 'resetPassword'. 2. The sidebar panels reload with merged values (global + page override). 3. The preview iframe receives an updated postMessage with the merged CSS variables. 4. The iframe URL changes to the corresponding auth route (e.g., /login-preview, /forgot-password-preview, /reset-password-preview). 5. Any changes made in the sidebar are saved to the page override, not the global draft.",
      studioEditTitle: "Per-Page Editing",
      studioEditIntro:
        "When a user modifies a setting while a non-login page is active (e.g., Forgot Password), the change is saved to pageOverrides.forgotPassword — not to the global draft. The studio tracks which page is active and routes edits accordingly. This ensures that changing the forgot-password headline does not affect the login page's headline.",
      studioResetTitle: "Reset to Global",
      studioResetIntro:
        "Each page tab includes a 'Reset to Global' action that removes all per-page overrides for that page, reverting it to the global configuration. This is useful when a tenant wants to undo page-specific customizations and restore visual consistency across all auth pages.",
      themeTitle: "Theme Marketplace Integration",
      themeIntro:
        "When a marketplace theme includes per-page overrides (pages.forgotPassword, pages.resetPassword), the previewTheme() function in useStudioViewModel.ts automatically imports those overrides into the studio's pageOverrides state. This means applying a theme with per-page branding instantly populates all three auth pages with the theme's intended visual treatment.",
      themeImportTitle: "Page Override Import",
      themeImportIntro:
        "The previewTheme() function checks for the 'pages' key in the theme's ThemeDataJson. If found, it extracts the forgotPassword and resetPassword objects and stores them as pageOverrides. If the theme does not include page overrides, the existing pageOverrides are preserved (or cleared, depending on the apply mode).",
      themeCompatTitle: "Backward Compatibility",
      themeCompatIntro:
        "Themes without a 'pages' block are fully backward-compatible. The absence of page overrides means all three auth pages use the global design — the same behavior as themes created before the Multi-Page Branding feature. No migration is required for existing themes.",
      serializationTitle: "Data Serialization & Persistence",
      serializationIntro:
        "Per-page overrides are stored in the tenant's DraftBrandingJson alongside the global configuration. The JSON structure contains a top-level 'pageOverrides' object with 'login', 'forgotPassword', and 'resetPassword' keys. Each key maps to a flat token object. On publish, the entire structure (global + pageOverrides) is promoted to LiveBrandingJson.",
      serializationSchemaTitle: "Stored JSON Schema",
      serializationSchemaIntro:
        "The DraftBrandingJson stores: { selectedLayout, primaryColor, ...(all global tokens), pageOverrides: { login: { panelHeadline, panelSubtitle, ... }, forgotPassword: { selectedLayout, panelHeadline, overlayColor, ... }, resetPassword: { selectedLayout, panelHeadline, ... } } }. Only non-null override tokens are persisted — empty pages are not stored to save space.",
      previewTitle: "Sandboxed Preview Architecture",
      previewIntro:
        "Each auth page is previewed in the same sandboxed iframe used by the Login Customizer Studio. When the user switches to a different page tab, the preview URL changes to the corresponding auth route, and new CSS variables (merged from global + page override) are injected via postMessage. The preview supports desktop, tablet, and mobile breakpoints for all three pages.",
      previewIsolationTitle: "Preview Isolation",
      previewIsolationIntro:
        "The preview iframe runs in a completely isolated context — separate from the admin panel's authentication state. This prevents the preview from triggering real login/logout actions. The preview pages are purpose-built components that render the auth UI with injected CSS variables but no authentication logic.",
      conflictTitle: "Conflict Prevention & Consistency",
      conflictIntro:
        "Multi-Page Branding includes safeguards to prevent visual inconsistency. When the global design changes (e.g., a new font family), all pages that inherit from the global automatically update — only explicitly overridden tokens remain unchanged. The studio displays a 'Customized' badge on page tabs that have overrides, making it clear which pages have independent configurations.",
      conflictWarning:
        "When a global token is changed (e.g., primaryColor), pages with overrides that include the same token will NOT update — the override takes precedence. This is intentional. To propagate a global change to overridden pages, use the 'Reset to Global' action on those pages first.",
      sourceTitle: "Source File Reference",
      sourceStudio: "Studio: useStudioViewModel.ts (page state, merge logic, previewTheme())",
      sourceComponents:
        "Components: AuthPageTabs.tsx (tab strip), StylePanel.tsx (sidebar with per-page routing)",
      sourceTypes:
        "Types: StudioDraft.ts (pageOverrides interface), ThemeTypes.ts (page override type definitions)",
      sourceSeeder:
        "Backend: LoginThemeSeeder.cs (PageOverrideDesign records, BuildFullThemeJson pages serialization)",
      domainMatchingTitle: "Domain-Matching & Mandanten-Isolation",
      domainMatchingIntro:
        "Um den korrekten Mandantenkontext zur Laufzeit aufzulösen, prüfen das API-Gateway und das Backend TenantContextMiddleware die eingehenden Anforderungs-Header. Wenn ein SuperAdmin zu einem bestimmten Mandanten-Arbeitsbereich drillt, überträgt die Client-App die verschlüsselte Mandanten-ID im Header 'X-Tenant-Context'. Die Middleware fängt die Anforderung ab, prüft auf die Berechtigung tenants.drill_down, entschlüsselt den Header mittels AES und ordnet ihn CurrentUserService.TenantId zu. Bei normalem Client-Verkehr, der auf benutzerdefinierten Domains eingeht, gleicht die Hostnamen-Auflösung Host-Header mit Mandanten-Domain-Zuordnungen ab.",
      dnsCnameTitle: "Custom-Domain DNS CNAME-Validierung",
      dnsCnameIntro:
        "Administratoren können benutzerdefinierte Domains (z. B. login.acme.com) über die TenantDomain-Endpunkte konfigurieren. Die Domain muss die RFC 1123-Validierungen bestehen und innerhalb des Mandanten-Kontingents Tenancy.MaxCustomDomains bleiben. Zur Überprüfung des Domainbesitzes generiert das System ein eindeutiges Verifizierungstoken mit dem Präfix 'scr_'. Der Administrator muss einen CNAME-Eintrag erstellen, der seine Domain auf den Plattform-Endpunkt verweist, und einen TXT-Eintrag für '_scr-verify.{domain}', der das Token enthält. DnsClient.NET fragt die TXT-Einträge ab, um die Übereinstimmung vor der Aktivierung der Domain zu bestätigen.",
    },
    loginPageBuilder: {
      title: "Login Page Builder",
      description:
        "No-code drag-and-drop visual canvas with 3 design modes (Freeform, Grid, Builder), 14 component types, a 12-column responsive grid system, real-time preview sync, and JSON serialization.",
      intro:
        "The Login Page Builder is SCRIPE's most advanced customization tool — a fully visual, drag-and-drop canvas that allows tenant administrators to build custom login page layouts without writing any code. The builder provides 3 design modes (Freeform, Grid, and Builder), a palette of 14 pre-built component types (from logos and headings to social login buttons and footer links), a responsive 12-column CSS grid system, real-time two-way sync with the preview iframe, and full JSON serialization for persistence. The builder integrates seamlessly with the Login Customizer Studio's design token pipeline, ensuring that builder-created layouts inherit all theme colors, typography, and accessibility settings.",
      modesTitle: "3 Canvas Modes",
      modesIntro:
        "The builder offers three distinct canvas modes, each providing a different level of control over layout positioning. Users can switch between modes at any time — components are preserved during mode switches.",
      modeFreeformTitle: "Freeform Mode",
      modeFreeformIntro:
        "Absolute positioning with pixel-level control. Components can be placed anywhere on the canvas and dragged to exact coordinates. Best for creative, non-standard layouts where design freedom is paramount. Components have x/y position, width, height, and z-index properties.",
      modeGridTitle: "Grid Mode (12-Column)",
      modeGridIntro:
        "Responsive 12-column CSS grid layout. Components are placed into grid cells with configurable column span (1–12), row positioning, alignment, and gap spacing. The grid ensures consistent, responsive layouts that adapt to desktop, tablet, and mobile breakpoints. This is the recommended mode for enterprise deployments where cross-device consistency is critical.",
      modeBuilderTitle: "Builder Mode",
      modeBuilderIntro:
        "Structured block-based layout with predefined sections. Components are organized into vertical sections (header, body, footer) with automatic stacking and reordering via drag-and-drop. Best for quick layout assembly with predictable, clean results. Builder mode enforces structural constraints — components snap to section boundaries and maintain consistent spacing.",
      modesNote:
        "Grid mode is the default for new configurations. It provides the best balance between design flexibility and responsive consistency. Freeform mode is intended for advanced users who need pixel-perfect control.",
      paletteTitle: "14 Component Types",
      paletteIntro:
        "The component palette provides 14 pre-built, configurable UI components that can be dragged onto the canvas. Each component has a set of editable properties (text content, styling, behavior) accessible via the Properties Panel when selected.",
      compLogo:
        "Logo — Displays the tenant's logo image. Properties: src (URL), alt text, width, height, alignment, link URL. Supports SVG, PNG, and WebP formats.",
      compHeading:
        "Heading — Large display text for page titles and headlines. Properties: text content, font size, font weight, color, alignment, HTML tag (h1–h6). Supports dynamic variables ({tenantName}).",
      compText:
        "Text — General-purpose paragraph text. Properties: content, font size, color, line height, alignment, max width. Supports rich text with bold, italic, and links.",
      compDivider:
        "Divider — Visual separator line. Properties: color, thickness, width, margin, style (solid, dashed, dotted, gradient).",
      compSpacer:
        "Spacer — Invisible spacing element. Properties: height (in px). Used to create vertical gaps between components without manual positioning.",
      compImage:
        "Image — Display any image on the canvas. Properties: src (URL), alt text, width, height, object-fit, border radius, shadow. Supports all web image formats.",
      compButton:
        "Button — Clickable action button. Properties: text, variant (primary, secondary, outline, ghost), size, width (auto, full), icon, link URL, border radius.",
      compSocialLogin:
        "Social Login — Pre-built social authentication buttons (Google, Microsoft, Apple, GitHub). Properties: providers (multi-select), layout (horizontal, vertical, icon-only), separator text.",
      compForm:
        "Form — The login form component containing email/password inputs and submit button. Properties: show labels, show placeholders, input style, button text, remember me checkbox, forgot password link.",
      compFooter:
        "Footer — Page footer with links and copyright text. Properties: links array, copyright text, alignment, font size, color.",
      compBadge:
        "Badge — Small label/tag element. Properties: text, variant (default, success, warning, destructive), size.",
      compCard:
        "Card — Container with background, border, and shadow. Properties: background color, border radius, shadow, padding. Can contain other components (nested layout).",
      compIcon:
        "Icon — SVG icon from the built-in icon library. Properties: icon name, size, color, rotation, link URL.",
      compTermsLink:
        "Terms & Privacy — Pre-built links to Terms of Service and Privacy Policy pages. Properties: terms URL, privacy URL, text template, font size, color.",
      gridTitle: "12-Column Grid System",
      gridIntro:
        "The Grid Mode uses a responsive 12-column CSS grid layout. Each component occupies a configurable number of columns (1–12) and rows. The grid supports gap spacing, column alignment (start, center, end, stretch), and row alignment. The grid is fully responsive — column spans can be configured independently for desktop (lg), tablet (md), and mobile (sm) breakpoints.",
      gridPropsTitle: "Grid Component Properties",
      gridPropsIntro:
        "Each component in Grid mode has additional grid-specific properties: colSpan (1–12 columns), rowSpan (number of rows), colStart (starting column), rowStart (starting row), alignment (start/center/end/stretch), and responsive overrides (sm/md/lg column spans). These properties are configured via the Properties Panel.",
      gridResponsiveTitle: "Responsive Breakpoints",
      gridResponsiveIntro:
        "The grid supports 3 breakpoints: Desktop (lg, ≥1024px), Tablet (md, 768–1023px), and Mobile (sm, <768px). Each component can have independent column spans per breakpoint. For example, a logo might span 4 columns on desktop but 12 columns (full width) on mobile. The preview iframe respects these breakpoints when device toggles are used.",
      gridGapTitle: "Gap Configuration",
      gridGapIntro:
        "The grid gap (spacing between cells) is configurable globally: columnGap and rowGap properties, each accepting pixel values (default: 16px). This ensures consistent spacing across all grid items without manual padding on individual components.",
      dndTitle: "Drag-and-Drop Architecture",
      dndIntro:
        "The builder uses @dnd-kit/core (not react-beautiful-dnd) for drag-and-drop interactions. Components are dragged from the palette sidebar and dropped onto the canvas. The DragOverlay renders a ghost preview of the component during drag. Drop zones are highlighted with blue outlines when a draggable component hovers over them.",
      dndPaletteTitle: "Palette → Canvas Flow",
      dndPaletteIntro:
        "1. User drags a component type from the palette sidebar. 2. @dnd-kit creates a DragOverlay with a preview of the component. 3. The canvas renders drop zone indicators (grid cells in Grid mode, free areas in Freeform mode). 4. On drop, a new component instance is created with default properties and added to the builder state. 5. The component is rendered on the canvas at the drop position.",
      dndReorderTitle: "Canvas Reordering",
      dndReorderIntro:
        "Existing components on the canvas can be reordered by dragging. In Grid mode, components snap to grid cells. In Builder mode, components reorder within their section (header/body/footer). In Freeform mode, components move to the exact drop coordinates.",
      dndSelectTitle: "Component Selection",
      dndSelectIntro:
        "Clicking a component on the canvas selects it, displaying a blue selection border and resize handles. The Properties Panel on the right sidebar loads the selected component's editable properties. Pressing Delete/Backspace removes the selected component. Escape deselects.",
      propsTitle: "Properties Panel",
      propsIntro:
        "The Properties Panel is a contextual sidebar that appears when a component is selected on the canvas. It displays all editable properties for the selected component type, organized into sections: Content (text, URLs), Layout (width, height, alignment), Style (colors, borders, shadows), and Grid (column span, row span, responsive breakpoints). Changes in the Properties Panel update the canvas in real-time.",
      propsContentTitle: "Content Properties",
      propsContentIntro:
        "Text inputs for content: headline text, paragraph text, button labels, URLs, alt text. Supports variable interpolation with {variableName} syntax for dynamic tenant data.",
      propsStyleTitle: "Style Properties",
      propsStyleIntro:
        "Visual styling controls: color pickers, border radius sliders, shadow toggles, opacity controls, font size selectors. Style properties that overlap with theme tokens (e.g., primaryColor) can be set to 'inherit from theme' to maintain consistency.",
      propsGridTitle: "Grid Properties",
      propsGridIntro:
        "Grid-specific layout controls (Grid mode only): column span slider (1–12), row span, column start, row start, alignment select, and responsive breakpoint overrides. A visual grid preview shows the component's position within the 12-column grid.",
      stateTitle: "Canvas State Management",
      stateIntro:
        "The builder maintains a flat array of BuilderComponent objects in the StudioDraft. Each component has: id (unique UUID), type (one of 14 types), properties (key-value map), position (x, y for Freeform), gridPosition (col, row, colSpan, rowSpan for Grid), and section (header/body/footer for Builder mode). The entire array is serialized as JSON in the builderComponentsJson field of DraftBrandingJson.",
      stateComponentTitle: "BuilderComponent Schema",
      stateComponentIntro:
        "Each BuilderComponent is a serializable object: { id: string, type: ComponentType, props: Record<string, unknown>, position: { x: number, y: number }, gridPosition: { colSpan: number, rowSpan: number, colStart: number, rowStart: number }, section: 'header' | 'body' | 'footer', order: number, responsive: { sm: GridOverride, md: GridOverride } }.",
      stateUndoTitle: "Undo/Redo Support",
      stateUndoIntro:
        "The builder maintains a history stack for undo/redo operations. Each action (add, move, resize, delete, property change) pushes a snapshot to the stack. Ctrl+Z undoes the last action, Ctrl+Shift+Z redoes. The history stack has a configurable depth limit (default: 50 actions).",
      serializationTitle: "JSON Serialization & Persistence",
      serializationIntro:
        "The builder state is serialized as a JSON array and stored in the builderComponentsJson field of the tenant's DraftBrandingJson. The canvasMode (freeform/grid/builder) is stored as a separate field. On publish, the builder state is promoted to LiveBrandingJson alongside all other branding tokens.",
      serializationSchemaTitle: "Serialized Schema",
      serializationSchemaIntro:
        "The stored JSON follows this structure: { canvasMode: 'freeform' | 'grid' | 'builder', gridConfig: { columns: 12, columnGap: 16, rowGap: 16 }, components: [ { id, type, props, position, gridPosition, section, order, responsive } ] }. The schema is versioned for forward compatibility.",
      serializationSizeTitle: "Storage Optimization",
      serializationSizeIntro:
        "Default property values are NOT stored — only properties that differ from the component type's defaults are serialized. This keeps the JSON payload compact (typically 2–5KB for a complex layout with 10+ components).",
      previewTitle: "Real-Time Preview Sync",
      previewIntro:
        "Every canvas change is immediately reflected in the sandboxed preview iframe. The builder emits postMessage events containing the current component array and canvas mode. The preview page receives these events, reconstructs the layout, and renders the components with live CSS variable injection from the active theme.",
      previewSyncTitle: "Two-Way Sync",
      previewSyncIntro:
        "The sync is bidirectional: canvas changes propagate to preview (via postMessage), and device toggle changes in the preview header propagate back to the builder (updating responsive breakpoint indicators). This ensures the builder canvas accurately reflects how the layout will appear at each breakpoint.",
      securityTitle: "Security Constraints",
      securityIntro:
        "The Login Page Builder enforces strict security constraints on user-generated content. All text content is HTML-sanitized before rendering (no script injection). Image URLs are validated to prevent SSRF. The builder canvas runs in a sandboxed iframe with restrictive CSP headers. Custom CSS injection is not supported — styling is controlled exclusively through the design token pipeline.",
      securitySanitizeTitle: "Input Sanitization",
      securitySanitizeIntro:
        "All text properties (headings, paragraphs, button labels) are sanitized using DOMPurify before rendering in the preview. HTML tags are stripped — only plain text is stored. URLs are validated against a whitelist of allowed protocols (https, http) to prevent javascript: and data: injection.",
      securityIframeTitle: "Iframe Sandboxing",
      securityIframeIntro:
        "The preview iframe uses the sandbox attribute with restricted permissions: allow-scripts (for CSS variable injection), allow-same-origin (for postMessage). Forms are non-functional — the preview renders visual-only representations of auth components.",
      dashboardTitle: "Dashboard Theming (Related Feature)",
      dashboardIntro:
        "The Dashboard Theming panel in the Customizer Studio allows tenants to configure their admin dashboard's visual defaults. Settings include layout template (8 options), color theme (12 options), theme mode (light/dark/system), default language, and sidebar default state. Dashboard theming uses the same draft/publish workflow as login branding.",
      dashboardLayoutsTitle: "8 Layout Templates",
      dashboardLayoutsIntro:
        "Default, Navigation, Classic, Compact, Elegant, Floating, Modern, and Minimal. Each template defines the dashboard shell structure: sidebar position, header style, content width, and navigation pattern.",
      dashboardColorsTitle: "12 Color Themes",
      dashboardColorsIntro:
        "Default, Zinc, Slate, Stone, Neutral, Red, Rose, Orange, Green, Blue, Violet, and Yellow. Each color theme defines the dashboard's accent color palette applied to the sidebar, headers, buttons, and active states.",
      dashboardStorageTitle: "Storage Format",
      dashboardStorageIntro:
        "Dashboard settings are stored in the dashboardThemeJson field of DraftBrandingJson as a JSON object: { layoutTemplate, colorTheme, mode, language, sidebarDefaultState }. On publish, the settings are promoted to the tenant's live configuration.",
      bundleTitle: "Bundle Marketplace (Related Feature)",
      bundleIntro:
        "The Bundle Marketplace allows tenants to save their complete studio configuration (login theme + builder layout + dashboard settings + per-page overrides) as a named bundle, and browse/apply bundles created by other tenants or the system. Bundles are displayed in a dedicated tab within the Theme Gallery.",
      bundleComponentsTitle: "Bundle Components",
      bundleComponentsIntro:
        "BundleGalleryTab (5.6KB) — Gallery tab with type filters (Login, Dashboard, Complete), search, grid, pagination. BundleCard (12.8KB) — Card with accent preview, pricing tier, metadata. BundleDetailModal (8.5KB) — Full detail with apply button. SaveBundleDialog (7.6KB) — Dialog for saving current studio state as a new bundle.",
      bundleTypesTitle: "Bundle Types",
      bundleTypesIntro:
        "Login Bundle — Contains only login branding (theme tokens + builder layout). Dashboard Bundle — Contains only dashboard settings. Complete Bundle — Contains everything: login branding, builder layout, per-page overrides, dashboard settings, and accessibility configuration. Complete bundles provide one-click full-workspace setup.",
      archTitle: "Module Architecture",
      archIntro:
        "The Login Page Builder follows SCRIPE's standard modular clean architecture. The builder/ directory contains: BuilderCanvas.tsx (main canvas), ComponentPalette.tsx (sidebar palette), PropertiesPanel.tsx (property editor), GridOverlay.tsx (grid visualization), and BuilderToolbar.tsx (mode switcher, undo/redo, zoom controls). State management uses the useBuilderState hook integrated into useStudioViewModel.",
      archTip:
        "The builder components are intentionally defined as stable, memoized React components to prevent re-renders during drag operations. Each canvas component is wrapped in React.memo with custom equality checks on position and properties.",
    },
    dashboardHub: {
      title: "Dashboard Hub (Hub-and-Spoke)",
      description:
        "Modulares Tab-Dashboard mit domänensegmentierten Sub-Modulen (Audit, Sicherheit, Analytics), 6-Schichten Clean Architecture pro Modul, ISP-konforme Interfaces, Lazy Loading und berechtigungsgesteuerter Tab-Sichtbarkeit.",
      intro:
        "Der Dashboard Hub ist SCRIPEs zentrale Operationszentrale — eine Tab-Oberfläche, die vier domänenspezifische Ansichten (Übersicht, Audit, Sicherheit, Analytics) in einem einheitlichen Hub zusammenfasst. Jedes Domänenmodul folgt einer strikten 6-Schichten Clean Architecture (Models → Entities → Interfaces → Services → Repositories → Mappers) mit eigenem DI-Eintrag. Sub-Views werden via React.lazy lazy-loaded und berechtigungsgesteuert.",
      archTitle: "Hub-and-Spoke Architektur",
      archIntro:
        "Der Dashboard Hub verwendet ein Hub-and-Spoke-Muster, bei dem die DashboardView als zentraler Hub den Tab-Streifen rendert und jeder Tab eine unabhängige, domänenspezifische View (Spoke) lazy-loaded. Der Übersicht-Tab ist inline für sofortiges Rendering. Audit-, Sicherheits- und Analytics-Tabs werden bei Bedarf via React.lazy mit Suspense-Fallbacks geladen.",
      archTip:
        "Sub-Views werden erst beim ersten Aktivieren ihres Tabs lazy-loaded. Dies reduziert das initiale Dashboard-Bundle um ~60%.",
      domainTitle: "Domänensegregation (Interface Segregation Principle)",
      domainIntro:
        "Zuvor flossen alle Dashboard-Daten durch ein einzelnes DashboardRepository (God Interface) mit 8+ Methoden für Audit, Sicherheit und Analytics. Die refaktorisierte Architektur extrahiert jede Domäne in ein unabhängiges Modul mit eigenem Repository-Interface.",
      domainNote:
        "Abwärtskompatible Typ-Aliase werden in DashboardEntities.ts für Legacy-Komponenten beibehalten. Diese Aliase sind mit @deprecated markiert.",
      layersTitle: "6-Schichten Clean Architecture",
      layersIntro:
        "Jedes extrahierte Modul (Audit, Sicherheit, Analytics) implementiert den vollständigen SCRIPE Frontend Clean Architecture Stack. Die 6 Schichten gewährleisten strikte Trennung der Zuständigkeiten.",
      diTitle: "DI-Container Verdrahtung",
      diIntro:
        "Alle drei neuen Module sind im SystemContainer (modules/system/di.ts) registriert. Jedes Modul folgt dem Muster: Service → Repository → SystemContainer Interface → Lazy Getter Export.",
      diTip:
        "Lazy Getter stellen sicher, dass Services und Repositories erst bei erstem Zugriff instanziiert werden.",
      viewmodelTitle: "ViewModel-Entkopplung",
      viewmodelIntro:
        "Jeder ViewModel-Hook importiert nun sein dediziertes Repository aus dem DI-Container statt ein gemeinsames Dashboard-Repository zu teilen.",
      hubTitle: "Tab-Hub Implementierung",
      hubIntro:
        "Die DashboardView-Komponente dient als Hub und rendert eine TabsList mit 4 TabsTrigger-Elementen. Audit- und Sicherheits-Tabs werden bedingt basierend auf den Berechtigungen des aktuellen Admins gerendert.",
      hubNote:
        "Tab-Sichtbarkeit ist im Frontend berechtigungsgesteuert für UX-Zwecke. Backend-Endpunkte erzwingen die tatsächliche Sicherheitsgrenze.",
      cachingTitle: "Mandantenspezifisches Caching",
      cachingIntro:
        "Alle TanStack Query Keys im Hub enthalten die aktuelle tenantId als Partitionsschlüssel. Dies stellt sicher, dass beim Mandantenwechsel alle Dashboard-Daten automatisch invalidiert und neu abgerufen werden.",
      compatTitle: "Abwärtskompatibilität",
      compatIntro:
        "Um Build-Fehler während der Migration zu vermeiden, behält DashboardEntities.ts veraltete Typ-Aliase bei.",
      compatWarning: "Veraltete Aliase sollten in einem zukünftigen Cleanup entfernt werden.",
      sourceTitle: "Quelldatei-Referenz",
      sourceIntro:
        "Der refaktorisierte Dashboard Hub erstreckt sich über 4 Module (Dashboard, Audit, Security, Analytics), jeweils mit eigenem vollständigen 6-Schichten-Stack.",
      realtimeTitle: "Echtzeit-SignalR-Updates",
      realtimeIntro:
        "Der Dashboard-Hub lässt sich in SignalR integrieren, um Echtzeit-Updates und Cache-Invalidierung bereitzustellen. Er teilt die Verbindung mit dem Audit-Log-Listener und invalidiert den Cache der Abfrage 'dashboard', wenn neue Audit-Ereignisse empfangen werden. Dies löst automatische Updates für TanStack-Abfragen aus, ohne dass die Seite neu geladen oder regelmäßige Abfragen durchgeführt werden müssen.",
    },
    selfServiceSignup: {
      title: "Self-Service-Registrierung und B2B2C-Onboarding",
      description:
        "Automatisierte Multi-Tenant-Onboarding-Saga mit Verifizierungs-OTPs, regionaler Währungsauflösung und Stripe-Checkout-Integration.",
      intro:
        "SCRIPE verfügt über eine umfassende B2B2C-Self-Service-Mandanten-Onboarding-Engine, die über eine robuste zweiphasige Saga orchestriert wird. Es koordiniert Datenbanktransaktionen, das Einrichten von Abonnements, Rechnungsverbindungen und bietet automatische Kompensations-Rollbacks, wenn Zahlungen abgebrochen werden.",
      flowTitle: "Onboarding-Ablauf",
      phase1Title: "Phase 1: Identitäts- und Bereitstellungstransaktion",
      phase1Intro:
        "Phase 1 wird in einer einzigen Datenbanktransaktion ausgeführt. Sie generiert den Mandanten-Arbeitsbereich, richtet die Standard-Unterdomäne ein, stellt Einstellungen bereit, erstellt die Standard-Sicherheitsrollen und erstellt das Benutzerkonto des Mandantenbesitzers.",
      validationTitle: "Subdomain- und Identitätsprüfung",
      validationIntro:
        "Um die Sicherheit zu gewährleisten und Routing-Konflikte zu vermeiden, das Onboarding-System wendet strenge Formatierungsregeln an und prüft die Verfügbarkeit von Subdomains anhand einer Blacklist für reservierte Wörter.",
      tableConstraint: "Einschränkung",
      tableRule: "Regel / Muster",
      tableReason: "Sicherheitsbegründung",
      emailVerificationTitle: "E-Mail-Verifizierungstickets",
      emailVerificationIntro:
        "Bevor eine Saga starten kann, muss die E-Mail-Adresse des Interessenten verifiziert werden. Das System stellt ein kryptografisch HMAC-SHA256-signiertes Ticket mit einer Gültigkeitsdauer von 15 Minuten aus.",
      phase2Title: "Phase 2: Berechtigungen und Rechnungsübergabe",
      phase2Intro:
        "Phase 2 verknüpft den neu erstellten Mandanten mit dem Berechtigungsmodul (Entitlements). Wenn die gewählte Edition kostenpflichtig ist, generiert das System eine Stripe-Checkout-Sitzung und leitet den Benutzer weiter.",
      compensationWarning:
        "Wenn eine kostenpflichtige Checkout-Sitzung vom Benutzer abgebrochen wird oder die Initialisierung fehlschlägt, führt das System einen automatischen Kompensationsablauf (CompensatePhase1Async) aus, um die Erstellung des Mandanten und des Administrators rückgängig zu machen und verwaiste Konten zu verhindern.",
    },
    view: "Features anzeigen",
    create: "Feature erstellen",
    update: "Feature bearbeiten",
    delete: "Feature löschen",
    "*": "Alle Feature-Berechtigungen",
  },
};
