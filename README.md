# My Energy App — Energy Data Space Integration

Ειδικό Θέμα: **Ανάλυση και αξιοποίηση δεδομένων ενέργειας μέσω dataspaces (CEEDS & EDDIE frameworks)**  
Αποθετήριο υλοποίησης του hands-on tutorial του ευρωπαϊκού πλαισίου [EDDIE (European Distributed Data Infrastructure for Energy)](https://github.com/eddie-energy/tutorial).

---

## 📌 Περιγραφή Έργου

Η εφαρμογή αποτελεί μια πλήρη full-stack υλοποίηση διασύνδεσης με ευρωπαϊκούς χώρους ενεργειακών δεδομένων (Energy Data Spaces). Χρησιμοποιώντας το πλαίσιο **EDDIE**, η εφαρμογή επιτρέπει σε καταναλωτές ενέργειας να παρέχουν ρητή συγκατάθεση (Consent Management κατά GDPR) για την ασφαλή ανάκτηση:
1. **Master Data (Στοιχεία Μετρητή & Σύμβασης)**
2. **Validated Historical Consumption Data (Ιστορικά δεδομένα κατανάλωσης kWh)**

---

## 🏛 Αρχιτεκτονική Συστήματος

Το σύστημα απαρτίζεται από τρία βασικά επίπεδα (Layers):

```text
+--------------------------------------------------------------------------+
|                        Frontend (Angular 19+)                            |
|  - Keycloak JS (OAuth2 / OIDC Login)                                     |
|  - EDDIE Connect Button (<eddie-connect-button> Web Component)           |
|  - Προβολή ενεργών συνδέσεων χρήστη σε πραγματικό χρόνο                  |
+------------------------------------+-------------------------------------+
                                     |
                                     v
+------------------------------------+-------------------------------------+
|                     Backend (Spring Boot 3)                              |
|  - OAuth2 Resource Server (JWT verification μέσω Keycloak)               |
|  - Reactive WebClient (Server-Sent Events streaming από το EDDIE)        |
|  - Spring Data JPA / REST APIs (/api/me, /api/connections)               |
+------------------------------------+-------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                 Docker Infrastructure & Data Space Services              |
|  - EDDIE Framework (ghcr.io/eddie-energy/eddie)                          |
|  - Keycloak IAM (Identity & Access Management, Port 8888)                |
|  - PostgreSQL 17 (Bases: eddie & tutorial, Port 5432)                    |
|  - Apache Kafka (Event Streaming, Port 9092/9094)                        |
|  - RabbitMQ 4 (AMQP Message Broker & Management UI, Port 5672/15672)    |
+--------------------------------------------------------------------------+
```

---

## 🚀 Πρόοδος Υλοποίησης (Tutorial Milestones)

- [x] **Day 1 — First Contact & Simulated Flow**: Εγκατάσταση EDDIE & PostgreSQL μέσω Docker Compose, ορισμός `data-needs.json`, ενσωμάτωση του EDDIE Connect button και λήψη πρώτων δεδομένων CIM μέσω REST.
- [x] **Day 2 — Real Region Connectors**: Εννοιολογική μελέτη και σύγκριση πραγματικών ευρωπαϊκών διασυνδέσεων (Γαλλία/Enedis - OAuth 2.0, Αυστρία/EDA - ebXML μέσω PontonXP Messenger).
- [x] **Day 3 — Outbound Connectors (REST, Kafka, AMQP)**: Ενεργοποίηση και δοκιμή των τριών μηχανισμών παράδοσης δεδομένων (REST polling, Kafka event streaming, RabbitMQ message queues).
- [x] **Day 4 — Permission Lifecycle & Tracing**: Μελέτη του κύκλου ζωής συγκατάθεσης (`CREATED`, `REVOKED`, `TERMINATED`) και ιχνηλασιμότητα με `permissionId`, `connectionId` και `dataNeedId`.
- [x] **Day 5 — Full-Stack Application Setup**:
  - Ενσωμάτωση **Keycloak** (Tutorial Realm, Client, Users) για authentication.
  - Δημιουργία **Spring Boot Backend** (OAuth2 Resource Server, DB integration).
  - Δημιουργία **Angular Frontend** με προστατευμένο login και ενσωμάτωση του EDDIE button.
- [x] **Day 6 — User-Bound Connections**:
  - Δυναμική συσχέτιση αδειών με τον συνδεδεμένο χρήστη (Keycloak User ID ως `connection-id`).
  - Ανάπτυξη Persistence Layer στο Backend (Entity `UserConnection`, Spring Data `UserConnectionRepository`).
  - Υλοποίηση streaming πραγματικού χρόνου (Server-Sent Events) με `WebClient` και Java Record `ConnectionStatusMessage`.
  - Εμπλουτισμός του Angular UI με αυτόματη φόρτωση και προβολή των ενεργών συνδέσεων (`CREATED`).

---

## 🛠 Οδηγίες Εκτέλεσης (Quick Start)

### 1. Εκκίνηση Υποδομής (Docker)
Βεβαιωθείτε ότι το Docker Desktop είναι ανοιχτό και εκτελέστε:
```powershell
docker compose up -d
```
*Υπηρεσίες:*
* EDDIE UI: http://localhost:8080/demo
* EDDIE REST APIs: http://localhost:9090
* Keycloak Admin: http://localhost:8888 (admin / admin)
* RabbitMQ Console: http://localhost:15672 (guest / guest)

### 2. Εκκίνηση Backend (Spring Boot)
```powershell
cd backend
./gradlew bootRun
```
*Τρέχει στη θύρα `8082` και επικυρώνει JWT tokens από το Keycloak.*

### 3. Εκκίνηση Frontend (Angular)
```powershell
cd frontend
npm start
```
*Η εφαρμογή είναι διαθέσιμη στο http://localhost:4200 με αυτόματη ανακατεύθυνση στο Keycloak για είσοδο.*

---

## 📚 Τεχνολογίες & Πρότυπα
* **Data Space Protocols**: EDDIE Framework, IEC Common Information Model (CIM)
* **Security & Auth**: OAuth 2.0, OpenID Connect (OIDC), JWT, Keycloak
* **Backend**: Java 21, Spring Boot 3, Spring Security, Spring Data JPA, Reactive WebClient, Hibernate, PostgreSQL
* **Frontend**: TypeScript, Angular 19+, HTML5 Custom Web Components (SSE Data Binding)
* **Message Brokers**: Apache Kafka, RabbitMQ (AMQP 1.0)
* **DevOps**: Docker, Docker Compose