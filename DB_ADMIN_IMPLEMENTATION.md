# Implementare DB si Administrare - Sofia Armony

## Conexiune baza de date
- Development local: `mysql://root:nuimipasa@localhost:3306/sofia_db`
- Productie: configurare obligatorie prin `DATABASE_URL` (fara credentiale hardcodate)

## Tabele utilizate
- `users`
  - autentificare admin, roluri (`super_admin`, `admin`, `editor`), status activ
- `invite_codes`
  - coduri de invitatie, rol asociat, expirare, status activ
- `rooms`
  - informatii camere: nume RO/EN, descriere RO/EN, capacitate, suprafata, pret/noapte, imagine principala, facilitati, status, ordine
- `room_images`
  - galerie foto pentru fiecare camera, ordine si status
- `gallery_images`
  - galerie publica: imagine, thumbnail, titlu/descriere RO/EN, status activ, ordine
- `reservations`
  - rezervari sincronizate din fluxul de booking, status, notification status, has_review
- `reviews`
  - review-uri cu moderare (`pending`, `approved`, `rejected`), data publicarii
- `admin_logs`
  - loguri administrative
- `app_settings`
  - setari aplicatie key/value

## Continut public livrat din baza de date
- `/rooms`
  - camere active din `rooms` + galerie camera din `room_images`
- `/gallery`
  - imagini active din `gallery_images`
- `/reviews`
  - doar review-uri aprobate din `reviews`
  - afiseaza: nume, stele, comentariu, data publicarii
  - fara poza utilizatorului
- Homepage (statistici Hero)
  - `Camere elegante`: total camere active (`rooms.is_active = 1`)
  - `Oaspeti fericiti`: total rezervari confirmate (`reservations.status = confirmed`), fallback la total rezervari daca nu exista confirmate
  - `Evaluare medie`: media review-urilor aprobate

## Administrare din /admin
Meniuri incluse:
- Dashboard
- Camere
- Rezervari
- Review-uri
- Galerie
- Utilizatori
- Coduri invitatie
- WhatsApp
- Email
- Setari
- Diagnostic
- Loguri
- Administrare baza de date

### Camere
- CRUD pentru camere
- campuri gestionate: nume, descriere, persoane maxime, m2, pret/noapte, imagine principala, facilitati, status activ/inactiv, ordine
- galerie foto per camera prin `room_images`

### Review-uri
- aprobare / respingere
- editare comentariu
- stergere
- public se afiseaza numai status `approved`

### Galerie
- upload multiplu imagini
- conversie WebP
- compresie
- generare miniaturi
- lazy loading in frontend
- editare titlu, descriere, ordine, status
- stergere imagine

### Dashboard
Date live din DB:
- numar camere
- numar rezervari
- numar review-uri
- numar utilizatori
- spatiu ocupat baza de date
- ultimele rezervari
- ultimele review-uri
- ultimele incarcari galerie

### Administrare baza de date (doar Super Admin)
- listare tabele
- numar inregistrari pe tabel
- cautare si filtrare inregistrari
- vizualizare inregistrari
- editare inregistrari
- stergere cu confirmare
- export CSV pe tabel
- export SQL complet
- backup SQL
- restore din backup
- optimizare tabele

## Endpoint-uri principale
- Public:
  - `GET /api/public/rooms`
  - `GET /api/public/gallery`
  - `GET /api/public/reviews`
  - `GET /api/public/stats`
- Admin:
  - `POST /api/admin/auth/login`
  - `POST /api/admin/auth/logout`
  - `GET /api/admin/auth/me`
  - `GET /api/admin/dashboard`
  - `GET/POST/PUT/DELETE /api/admin/rooms`
  - `GET/POST/PUT/DELETE /api/admin/rooms/images`
  - `GET/POST/PUT/DELETE /api/admin/gallery`
  - `POST /api/admin/gallery/upload`
  - `GET/PUT/DELETE /api/admin/reviews`
  - `GET/PUT /api/admin/reservations`
  - `GET/POST/PUT/DELETE /api/admin/users`
  - `GET/POST/PUT/DELETE /api/admin/invite-codes`
  - `GET/POST/PUT/DELETE /api/admin/db`

## Securitate
- Nu exista endpoint public de administrare DB (`/db` nu este expus)
- Operatiunile de administrare DB sunt accesibile doar cu rol `super_admin`
- Sesiunea admin este pe cookie httpOnly semnat
