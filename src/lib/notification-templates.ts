import type { Reservation } from "@/lib/reservations";

export const CLIENT_CONFIRMATION_SUBJECT =
  "Cererea dumneavoastra de rezervare a fost inregistrata";

function formatPrice(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return `${Number(value).toFixed(2)} lei`;
}

function getRoomLabel(reservation: Reservation) {
  return reservation.roomName || reservation.room || "Nespecificata";
}

function contactBlock() {
  return `
    <div style="margin-top:20px;padding:14px 16px;border-radius:10px;background:#f8fafc;border:1px solid #e2e8f0;">
      <div style="font-weight:700;color:#334155;margin-bottom:6px;">Date de contact</div>
      <div style="color:#475569;">Sofia Armony</div>
      <div style="color:#475569;">Str. Florilor nr. 12, Sinaia, Prahova</div>
      <div style="color:#475569;">Telefon: +40 722 123 456</div>
      <div style="color:#475569;">Email: contact@sofiaarmony.ro</div>
    </div>
  `;
}

export function formatAdminWhatsAppMessage(reservation: Reservation) {
  return `🏨 REZERVARE NOUA - SOFIA ARMONY\n\n👤 Nume:\n${reservation.firstName} ${reservation.lastName}\n\n📞 Telefon:\n${reservation.phone}\n\n📧 Email:\n${reservation.email}\n\n🛏 Camera:\n${getRoomLabel(reservation)}\n\n💶 Pret/noapte:\n${formatPrice(reservation.roomPricePerNight)}\n\n📅 Check-In:\n${reservation.checkIn}\n\n📅 Check-Out:\n${reservation.checkOut}\n\n👨 Oaspeti:\n${reservation.guestCount || reservation.adults + reservation.children}\n\n📝 Observatii:\n${reservation.message || "-"}\n\n🆔 ID Rezervare:\n${reservation.id}\n\n🕒 Data rezervarii:\n${new Date(reservation.createdAt).toLocaleString("ro-RO")}`;
}

export function formatAdminEmailHtml(reservation: Reservation) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;line-height:1.5">
      <h2 style="margin:0 0 16px;color:#8b6f47;">Rezervare noua - ${reservation.id}</h2>
      <p>A fost inregistrata o noua cerere de rezervare pe website.</p>
      <table style="border-collapse:collapse;width:100%;max-width:680px;">
        <tbody>
          <tr><td style="padding:6px 0;font-weight:bold;">Nume</td><td style="padding:6px 0;">${reservation.firstName} ${reservation.lastName}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Telefon</td><td style="padding:6px 0;">${reservation.phone}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Email</td><td style="padding:6px 0;">${reservation.email}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Camera</td><td style="padding:6px 0;">${getRoomLabel(reservation)}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Pret/noapte</td><td style="padding:6px 0;">${formatPrice(reservation.roomPricePerNight)}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Check-In</td><td style="padding:6px 0;">${reservation.checkIn}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Check-Out</td><td style="padding:6px 0;">${reservation.checkOut}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Oaspeti</td><td style="padding:6px 0;">${reservation.guestCount || reservation.adults + reservation.children}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Copii</td><td style="padding:6px 0;">${reservation.children}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Observatii</td><td style="padding:6px 0;">${reservation.message || "-"}</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

export function formatClientEmailHtml(reservation: Reservation) {
  const detailsRows = [
    ["Nume", `${reservation.firstName} ${reservation.lastName}`],
    ["Camera", getRoomLabel(reservation)],
    ["Pret/noapte", formatPrice(reservation.roomPricePerNight)],
    ["Check-In", reservation.checkIn],
    ["Check-Out", reservation.checkOut],
    ["Oaspeti", String(reservation.guestCount || reservation.adults + reservation.children)],
    ["Copii", String(reservation.children)],
    ["Telefon", reservation.phone],
    ["Email", reservation.email],
    ["Observatii", reservation.message || "-"],
    ["ID Rezervare", reservation.id],
  ]
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#374151;width:35%;">${label}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#111827;">${value}</td>
      </tr>
    `
    )
    .join("");

  return `
  <!doctype html>
  <html>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Confirmare primire cerere rezervare</title>
    </head>
    <body style="margin:0;padding:0;background:#f5f2ec;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f5f2ec;padding:24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:680px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7e2d7;">
              <tr>
                <td style="background:linear-gradient(135deg,#8b6f47,#b79567);padding:28px 24px;text-align:center;color:#ffffff;">
                  <div style="font-size:28px;font-weight:700;letter-spacing:0.5px;">Sofia Armony</div>
                  <div style="margin-top:6px;font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:0.9;">Casa de Oaspeti</div>
                </td>
              </tr>

              <tr>
                <td style="padding:28px 24px 20px;">
                  <p style="margin:0 0 12px;font-size:16px;">Buna ${reservation.firstName},</p>
                  <p style="margin:0 0 12px;font-size:15px;line-height:1.7;">Va multumim ca ati ales Sofia Armony.</p>
                  <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">Cererea dumneavoastra de rezervare a fost inregistrata cu succes.</p>
                  <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">Rezervarea este inregistrata; administratorul va confirma telefonic disponibilitatea daca este nevoie de validare suplimentara.</p>

                  <div style="font-size:18px;font-weight:700;color:#8b6f47;margin-bottom:10px;">Detaliile rezervarii</div>
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
                    ${detailsRows}
                  </table>

                  <div style="margin:20px 0;padding:14px 16px;border-radius:10px;background:#fff8ec;border:1px solid #f2d9a6;color:#6b4f24;">
                    <strong>Important:</strong> Aceasta este o confirmare de primire a cererii, NU confirmarea rezervarii.
                  </div>

                  <p style="margin:0 0 20px;font-size:15px;line-height:1.7;">Un membru al echipei Sofia Armony va va contacta telefonic pentru confirmarea disponibilitatii.</p>
                  ${contactBlock()}

                  <div style="text-align:center;margin:24px 0 8px;">
                    <a href="https://sofiaarmony.ro" style="display:inline-block;background:#8b6f47;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600;font-size:14px;">Viziteaza website-ul</a>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:18px 24px;background:#1c1917;color:#d1d5db;font-size:12px;line-height:1.6;text-align:center;">
                  <div style="font-weight:600;color:#f3f4f6;">Echipa Sofia Armony</div>
                  <div>Str. Florilor nr. 12, Sinaia, Prahova</div>
                  <div>Telefon: +40 722 123 456 | Email: contact@sofiaarmony.ro</div>
                  <div style="margin-top:6px;">https://sofiaarmony.ro</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}
