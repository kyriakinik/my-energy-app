# Σημειώσεις Ειδικού Θέματος - EDDIE Tutorial

## Day 1: First Contact & Simulated Flow (Πρώτη Επαφή & Προσομοίωση)

### 1. Τι πετύχαμε σήμερα:
- Στήσαμε το EDDIE framework και τη βάση PostgreSQL τοπικά μέσω Docker Compose.
- Ορίσαμε τις μεταβλητές περιβάλλοντος (.env) για σύνδεση στη βάση και ενεργοποίηση του Simulation connector.
- Δημιουργήσαμε τα "Data Needs" (data-needs.json) για Master Data και Validated Historical Data.
- Ενσωματώσαμε το Custom Web Component κουμπί (<eddie-connect-button>) σε δική μας ιστοσελίδα (index.html).
- Ολοκληρώσαμε τη ροή συγκατάθεσης (permission flow) ως χρήστες και στείλαμε δοκιμαστικές μετρήσεις.
- Επαληθεύσαμε την άφιξη των δεδομένων μέσω REST Outbound Connectors (θύρα 9090).

### 2. Βασικές Έννοιες & Ορολογία:
- **EDDIE (European Distributed Data Infrastructure for Energy):** Ανοιχτό λογισμικό που λειτουργεί ως ενδιάμεσος (data space connector) για ομογενοποιημένη πρόσβαση σε ενεργειακά δεδομένα στην Ευρώπη με συγκατάθεση χρήστη.
- **Master Data (Account):** Στατικά στοιχεία μετρητή και σύμβασης (π.χ. αριθμός παροχής, ισχύς).
- **Validated Data:** Επικυρωμένες χρονοσειρές κατανάλωσης (kWh) ανά διάστημα (π.χ. ημέρα/ώρα).
- **ISO 8601 Duration:** Πρότυπο διαστημάτων (π.χ. -P3M = 3 μήνες πίσω, P1D = ανάλυση ανά 1 ημέρα).
- **CIM (Common Information Model):** Το ευρωπαϊκό πρότυπο μοντέλο δεδομένων (σε XML/JSON) για την ανταλλαγή ενεργειακών δεδομένων.
- **Connection ID:** Το ID σύνδεσης που γεφυρώνει τον χρήστη της εφαρμογής μας με τα δεδομένα που επιστρέφει το EDDIE.

### 3. Ports & Endpoints:
- `http://localhost:8080/demo`: Δοκιμαστική σελίδα του EDDIE.
- `http://localhost:8080/lib/eddie-components.js`: Βιβλιοθήκη JavaScript για το κουμπί.
- `http://localhost:9090/outbound-connectors/rest/agnostic/connection-status-messages`: REST endpoint για κατάσταση αδειών (CREATED κ.λπ.).
- `http://localhost:9090/outbound-connectors/rest/cim_0_82/validated-historical-data-md`: REST endpoint για μετρήσεις κατανάλωσης σε CIM format.

## Day 2: Real Region Connectors (Πραγματικοί Συνδετήρες Περιοχών)

### 1. Βασικό Συμπέρασμα:
- Στην Ευρώπη υπάρχει έντονος κατακερματισμός: κάθε χώρα έχει διαφορετικές τεχνολογίες πρόσβασης (π.χ. OAuth 2.0 στη Γαλλία/Enedis, ebXML/Ponton Messenger στην Αυστρία/EDA).
- Το EDDIE λειτουργεί ως **επίπεδο αφαίρεσης (Abstraction Layer)**: κρύβει όλη την πολυπλοκότητα των εθνικών πρωτοκόλλων.
- Η δική μας εφαρμογή καταναλώνει πάντα την ίδια ενιαία μορφή δεδομένων (CIM), ανεξάρτητα από τη χώρα προέλευσης.
- Η προσθήκη νέας χώρας γίνεται αποκλειστικά μέσω ρυθμίσεων (environment variables στο `.env`) χωρίς καμία αλλαγή στον κώδικα της εφαρμογής μας.

## Day 3: Outbound Connectors (REST, Kafka, AMQP)

### 1. Πώς φεύγουν τα δεδομένα από το EDDIE:
- **REST Connector (Port 9090):** 
  - Pull/Polling μοντέλο.
  - Απλό στη χρήση, αλλά τα μηνύματα παραμένουν στη μνήμη μόνο 48 ώρες.
  - Επιστρέφει δεδομένα σε JSON, XML ή SSE.
- **Kafka Connector (Port 9092 / 9094):** 
  - Push/Streaming μοντέλο.
  - Μεγάλη κλίμακα, ανθεκτικότητα (log-based durability), ιδανικό για Big Data.
  - Χωρίζει τα δεδομένα σε topics ανά τύπο (π.χ. `ep.eddie.cim_0_82.validated-historical-data-md`).
- **AMQP / RabbitMQ (Port 5672 / Web UI: 15672):** 
  - Push μοντέλο βασισμένο σε ουρές (Queues).
  - Εγγυήσεις παράδοσης, acknowledgements και Dead-Letter Queues.
  - Παρέχει γραφικό περιβάλλον διαχείρισης (Management Dashboard).

### 2. Συμπέρασμα Αρχιτεκτονικής:
Και οι 3 connectors λαμβάνουν **τα ίδια ακριβώς μηνύματα**. Η επιλογή εξαρτάται από τις ανάγκες της εφαρμογής μας:
- Στις επόμενες μέρες (Day 5-8) θα χτίσουμε ένα Spring Backend που αρχικά θα καταναλώνει από το REST, και αργότερα θα δούμε και event-driven επεξεργασία.

## Day 4: Process Integration and Permission Lifecycle (Κύκλος Ζωής Αδειών & Ιχνηλασιμότητα)

### 1. Καταστάσεις Άδειας (Permission States):
- `CREATED`: Η άδεια ενεργοποιήθηκε επιτυχώς από τον χρήστη και ξεκινά η ροή ενεργειακών δεδομένων.
- `REVOKED`: Ο καταναλωτής ανακάλεσε τη συγκατάθεσή του μέσω του διαχειριστή/παρόχου του (απαίτηση GDPR).
- `TERMINATED`: Η δική μας εφαρμογή τερμάτισε την άδεια (π.χ. διαγραφή λογαριασμού πελάτη).

### 2. Βασικά Κλειδιά Ιχνηλασιμότητας (Tracing Identifiers):
- `permissionId`: Μοναδικό αναγνωριστικό της άδειας σε όλο το σύστημα (π.χ. `pm::...::1`).
- `connectionId`: Εσωτερικό αναγνωριστικό της εφαρμογής μας που αντιστοιχίζει την άδεια με τον συγκεκριμένο χρήστη (User ID).
- `dataNeedId`: Το αναγνωριστικό του τύπου δεδομένων που ζητήθηκαν (Master data vs Ιστορικά 3 μηνών).

### 3. Ανάκτηση & Επεξεργασία μέσω Τερματικού:
- Χρήση του `curl.exe` για ανάκτηση των μηνυμάτων από το REST API:
  `curl.exe -s http://localhost:9090/outbound-connectors/rest/agnostic/connection-status-messages`
- Χρήση του `ConvertFrom-Json` στο PowerShell (το αντίστοιχο του εργαλείου `jq` των Linux/Mac) για μορφοποίηση των δεδομένων (pretty-printing):
  `curl.exe -s http://localhost:9090/outbound-connectors/rest/agnostic/connection-status-messages | ConvertFrom-Json`


 ## Day 5 — Application Skeleton (Full-Stack Setup)

### 1. Αρχιτεκτονική Επισκόπηση & Ροή Δεδομένων

```text
[ Browser / Angular Frontend ] (port 4200)
       │  ▲
       │  │ 1. OIDC Login / Redirect (PKCE)
       ▼  │ 2. Έκδοση JWT Bearer Token
[ Keycloak IAM Server ] (port 8888)
       
       │
       │ 3. HTTP GET /api/me (Header: Authorization: Bearer <JWT>)
       ▼
[ Spring Boot Backend ] (port 8082 - OAuth2 Resource Server)
       │  ▲
       │  │ (Επαλήθευση JWT μέσω Keycloak Issuer URI)
       ▼  │
[ PostgreSQL Database ] (port 5432 - Database: tutorial)

       ▲
       │ 4. Φόρτωση Web Component (<eddie-connect-button>)
[ EDDIE Core Service ] (port 8080)
```

---

### 2. Βασικές Έννοιες & Ορολογία

* **Keycloak (IAM - Identity & Access Management):** 
  * Λειτουργεί ως Authorization Server για OpenID Connect / OAuth2. Αναλαμβάνει τη διαχείριση χρηστών, σελίδες login/registration και έκδοση ψηφιακά υπογεγραμμένων JWT tokens.
* **Realm (`tutorial-realm`):** 
  * Ένας αυτόνομος χώρος ασφαλείας (security domain/tenant) μέσα στο Keycloak, απομονωμένος από το `master` realm.
* **Public Client vs Confidential Client:** 
  * Η **Angular** είναι Single Page Application (SPA) που τρέχει στον browser του χρήστη, επομένως δεν μπορεί να αποκρύψει με ασφάλεια μυστικό κλειδί (Client Secret). Ορίζεται ως `publicClient: true` και προστατεύεται μέσω **PKCE** (Proof Key for Code Exchange) και αυστηρών `redirectUris`.
* **OAuth2 Resource Server:** 
  * Ο ρόλος του Spring Boot backend. Δεν διατηρεί session (stateless), αλλά επαληθεύει την υπογραφή του Bearer JWT token μέσω του Keycloak issuer URI.
* **Web Components (`<eddie-connect-button>`):** 
  * Custom HTML στοιχείο που σερβίρεται αυτόνομα από το EDDIE Core (`/lib/eddie-components.js`). Ενσωματώνεται στην Angular με χρήση του `CUSTOM_ELEMENTS_SCHEMA`.

---

### 3. Τεχνικά Βήματα Υλοποίησης

#### Α. Υποδομή Docker (`docker-compose.yml` & `keycloak.json`)
* **Keycloak Service:** Image `quay.io/keycloak/keycloak:26.6.0`, port mapping `8888:8080`, αυτόματη εισαγωγή realm μέσω mount του `keycloak.json` στο `/opt/keycloak/data/import/realm.json:ro`.
* **Database Setup (`db.sql`):** Δημιουργία ξεχωριστής βάσης και χρήστη `tutorial` στην PostgreSQL, και έκθεση της θύρας `5432:5432`.

#### Β. Spring Boot Backend (`backend/`)
* **Τεχνολογίες:** Java 21 LTS, Spring Boot, Gradle, Spring Security OAuth2 Resource Server, Spring Data JPA, PostgreSQL Driver.
* **Ρυθμίσεις (`application.properties`):** Θύρα λειτουργίας `8082`, ορισμός `issuer-uri` στο Keycloak (`http://localhost:8888/realms/tutorial-realm`), σύνδεση στη βάση `tutorial`.
* **Ασφάλεια & Endpoints:** Δημιουργία `SecurityConfig.java` (JWT authentication & CORS) και `UserController.java` με προστατευμένο endpoint `/api/me` που διαβάζει τα claims του χρήστη μέσω `@AuthenticationPrincipal Jwt jwt`.

#### Γ. Angular Frontend (`frontend/`)
* **Τεχνολογίες:** Angular 19/20, βιβλιοθήκη `keycloak-js`.
* **Εκκίνηση (`main.ts`):** Αρχικοποίηση του Keycloak με `login-required` πριν το `bootstrapApplication`.
* **Component (`app.ts` & `app.html`):** Κλήση του `/api/me` με `Authorization: Bearer <token>`, ενημέρωση reactive signal `name`, προσθήκη `CUSTOM_ELEMENTS_SCHEMA` και προβολή του `<eddie-connect-button>`.

---

### 4. Επιβεβαίωση Checkpoints (Day 5)

- [x] Αυτόματο redirect στο Keycloak και επιτυχές login με τον χρήστη `eddie`.
- [x] Ανάκτηση και εμφάνιση του ονόματος ("Hello, Eddie Eddington!") από το backend.
- [x] Επιτυχής φόρτωση και απόδοση του EDDIE Connect Web Component στο UI.
- [x] Version Control: Αποθήκευση και συγχρονισμός όλων των αλλαγών στο GitHub.

---

## Day 6 — User-Bound Connections (Συνδέσεις Δεδομένων ανά Χρήστη)

### 1. Τι πετύχαμε σήμερα (Checkpoints):
- Μετατρέψαμε τις ανώνυμες/στατικές συνδέσεις σε προσωποποιημένες (User-Bound): κάθε άδεια ενέργειας συσχετίζεται πλέον με το μοναδικό Keycloak User ID.
- Δημιουργήσαμε το πλήρες persistence layer στο Spring Boot (Entity, Repository, Service, Controller).
- Ενσωματώσαμε μηχανισμό πραγματικού χρόνου (Server-Sent Events streaming) μέσω του reactive `WebClient`.
- Επιβεβαιώσαμε end-to-end τη ροή: πάτημα κουμπιού -> καταγραφή στο EDDIE -> λήψη status message -> αποθήκευση στην PostgreSQL -> εμφάνιση της ενεργής σύνδεσης (`CREATED`) στο Angular UI.

---

### 2. Αρχιτεκτονική Επισκόπηση & Ροή Δεδομένων

```text
[ Browser / Angular Frontend ] (port 4200)
       │
       │ 1. Ο χρήστης πατάει το κουμπί: <eddie-connect-button [attr.connection-id]="userId()">
       ▼
[ EDDIE Framework Service ] (port 8080/9090)
       │
       │ 2. Ολοκλήρωση ροής συγκατάθεσης (Consent Flow)
       │ 3. Εκπομπή Server-Sent Event (SSE): { connectionId: "userId", permissionId: "pm::...", status: "CREATED" }
       ▼
[ Spring Boot Backend ] (port 8082)
       │
       │ 4. EddieRestClient: Λήψη του SSE stream μέσω reactive WebClient
       │ 5. UserConnectionService: Επεξεργασία και mapping του μηνύματος
       │ 6. UserConnectionRepository: Αποθήκευση/ενημέρωση της οντότητας UserConnection
       ▼
[ PostgreSQL Database ] (port 5432 - DB: tutorial, Table: user_connection)
       │
       ▲ 7. HTTP GET /api/connections (με Bearer JWT Token)
       │
[ Angular Frontend ] -> Ανάκτηση και προβολή της λίστας συνδέσεων (@if / @for) με Status: CREATED!
```

---

### 3. Βασικές Έννοιες & Θεωρία (Java & Spring Boot)

* **User-Bound Connection:**
  * Η σύνδεση της ενεργειακής άδειας (permission) με τη μοναδική ταυτότητα του συνδεδεμένου χρήστη (`userId` από το Keycloak), αντί για στατικό/ανώνυμο αναγνωριστικό.
* **Server-Sent Events (SSE):**
  * Πρωτόκολλο μονόδρομης ροής δεδομένων (HTTP streaming με MIME type `text/event-stream`). Ο server διατηρεί τη σύνδεση ανοιχτή και προωθεί γεγονότα σε πραγματικό χρόνο χωρίς να απαιτείται συνεχές polling.
* **Reactive WebClient & Flux:**
  * Ο μη-μπλοκάρον (non-blocking) HTTP client του Spring WebFlux. Το `Flux` αντιπροσωπεύει έναν ασύγχρονο κυλιόμενο διάδρομο δεδομένων (0..N στοιχεία) που διαβάζει τα μηνύματα του EDDIE χωρίς να παγώνει threads.
* **Java Records (`ConnectionStatusMessage.java`):**
  * Ειδικός τύπος κλάσης για αμετάβλητα δεδομένα (Immutable Data Carriers / DTOs). Αντικαθιστά δεκάδες γραμμές κλασικού boilerplate κώδικα (getters, constructors, `equals`, `hashCode`, `toString`).
* **Entity & Spring Data JPA (`UserConnection.java` & `UserConnectionRepository.java`):**
  * `@Entity`: Αντιστοιχίζει την κλάση Java σε πίνακα PostgreSQL (`user_connection`).
  * `JpaRepository<UserConnection, String>`: Παράγει αυτόματα στο παρασκήνιο τα SQL queries.
  * Derived Query Method: Η δήλωση `findAllByUserId(String userId)` μεταφράζεται αυτόματα σε `SELECT * FROM user_connection WHERE user_id = ?`.
* **Service Layer & `@PostConstruct` (`UserConnectionService.java`):**
  * Διαχωρισμός επιχειρησιακής λογικής. Η μέθοδος με annotation `@PostConstruct` εκτελείται αυτόματα μία φορά κατά την εκκίνηση του backend και συνδέεται στη ροή μηνυμάτων του EDDIE.
* **Controller Security & Claims (`UserController.java`):**
  * Μέσω του `@AuthenticationPrincipal Jwt jwt`, το Spring Boot αντλεί απευθείας το Keycloak User ID (`jwt.getSubject()`), εξασφαλίζοντας ότι κάθε χρήστης έχει πρόσβαση αποκλειστικά στις δικές του συνδέσεις.

---

### 4. Τεχνικά Βήματα Υλοποίησης

#### Α. Backend (`backend/src/main/java/energy/eddie/tutorial/backend/`)
* **`UserConnection.java`:** JPA Entity με πεδία `id` (UUID), `userId`, `permissionId`, `dataNeedId`, `status`.
* **`UserConnectionRepository.java`:** Interface που επεκτείνει το `JpaRepository` με τις μεθόδους `findAllByUserId` και `findByPermissionId`.
* **`ConnectionStatusMessage.java`:** Java Record για τη μοντελοποίηση των εισερχόμενων μηνυμάτων SSE από το EDDIE.
* **`EddieRestClient.java`:** Reactive WebClient component που συνδέεται στο `http://localhost:9090/outbound-connectors/rest/agnostic/connection-status-messages`.
* **`UserConnectionService.java`:** Service που διαχειρίζεται τα μηνύματα, αποθηκεύει/ενημερώνει συνδέσεις στη βάση και παρέχει μέθοδο ανάκτησης ανά χρήστη.
* **`UserController.java`:** Εμπλουτισμός με το endpoint `GET /api/connections` που επιστρέφει τις συνδέσεις του συνδεδεμένου χρήστη.

#### Β. Frontend (`frontend/src/app/`)
* **`app.ts`:** Προσθήκη reactive signals (`userId`, `connections`) και συνάρτησης `updateConnections()` για αυτόματη ανάκτηση των συνδέσεων μετά το login.
* **`app.html`:** Δυναμική σύνδεση του κουμπιού EDDIE (`[attr.connection-id]="userId()"`) και προβολή της λίστας συνδέσεων με `@if` / `@for`.

---

### 5. Επιβεβαίωση Checkpoints (Day 6)
- [x] Το `<eddie-connect-button>` δέχεται δυναμικά το Keycloak User ID ως `connection-id`.
- [x] Επιτυχής εκτέλεση του consent flow στον Simulation connector του EDDIE.
- [x] Λήψη του Server-Sent Event από το backend και αποθήκευση της νέας εγγραφής στην PostgreSQL (`tutorial`).
- [x] Εμφάνιση της σύνδεσης στην οθόνη του χρήστη με έγκυρο `permissionId` και `Status: CREATED`.
- [x] Version Control: Αποθήκευση και συγχρονισμός όλων των αλλαγών της ημέρας στο GitHub.