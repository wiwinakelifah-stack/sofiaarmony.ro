# Sistem Notificari - Sofia Armony

## 1) Ce face sistemul
La fiecare rezervare noua:
1. Salveaza rezervarea in `data/reservations.json`.
2. Trimite mesaj WhatsApp catre administrator.
3. Trimite email de confirmare catre client.
4. Scrie loguri complete in `data/notification-logs.json`.
5. Daca WhatsApp sau Email esueaza, rezervarea ramane salvata si poate fi retrimisa din Admin.

## 2) Configurare WhatsApp
Deschide Admin la ruta `/ro/admin`, apoi tab-ul `Configurare`:
1. Completeaza `WhatsApp administrator` (implicit: `+40769277629`).
2. Completeaza campurile `WhatsApp Cloud API`:
- `Access Token`
- `Phone Number ID`
- `API Version` (ex: `v20.0`)
3. Apasa `Salveaza setarile`.

## 3) Configurare SMTP
In acelasi tab `Configurare`:
1. Completeaza `SMTP Host`, `SMTP Port`, `SMTP User`, `SMTP Password`.
2. Bifeaza `Conexiune securizata` daca providerul cere SMTPS.
3. Completeaza `From Name` si `From Email`.
4. Optional: completeaza fallback Gmail (`emailUser`, `emailPassword`) daca nu folosesti SMTP custom.
5. Apasa `Salveaza setarile`.

## 4) Testare servicii
In tab-ul `Notificari`:
1. `Trimite mesaj de test` in cardul WhatsApp.
2. Introdu adresa in campul email si apasa `Trimite e-mail de test`.
3. Vezi rezultatul real in banner-ul de actiune si in `Ultima notificare` / `Ultimul e-mail trimis`.

## 5) Retrimitere notificari esuate
In `Notificari` exista sectiunea `Loguri si retrimitere`:
1. Pentru fiecare log esuat apare butonul `Retrimite`.
2. Apasarea butonului retrimite notificarea folosind configuratia reala curenta.
3. Rezultatul retrimiterii este logat automat cu legatura la logul original (`retryOfLogId`).

## 6) Cum verifici logurile
- Logurile sunt afisate in Admin, sectiunea `Ultimele operatiuni`.
- Persistenta este in fisierul `data/notification-logs.json`.
- Se salveaza:
  - canalele WhatsApp/Email/System
  - status sent/failed
  - timpul de raspuns
  - erori tehnice
  - payload preview
  - timestamp

## 7) Troubleshooting rapid
### WhatsApp esueaza
1. Verifica `Access Token` si `Phone Number ID`.
2. Verifica daca numarul destinatar este valid international (`+40...`).
3. Ruleaza `Trimite mesaj de test` si verifica eroarea exacta in Admin.

### Email esueaza
1. Verifica `SMTP Host`, `SMTP Port`, `SMTP User`, `SMTP Password`.
2. Verifica `smtpSecure` (true/false) conform providerului.
3. Ruleaza `Trimite e-mail de test` si verifica mesajul de eroare.

### Rezervari fara notificari
1. Verifica `Loguri si retrimitere` pentru esecuri.
2. Apasa `Retrimite` pe fiecare notificare esuata.
3. Confirmarea rezervarii ramane salvata in `data/reservations.json` indiferent de statusul notificarii.

## 8) Endpoint-uri relevante
- `POST /api/bookings` - salveaza rezervare + trigger notificari.
- `GET /api/admin/notifications/overview` - status + loguri + ultimele evenimente.
- `POST /api/admin/notifications/test-whatsapp` - test real WhatsApp.
- `POST /api/admin/notifications/test-email` - test real SMTP.
- `POST /api/admin/notifications/retry` - retrimite log esuat.
