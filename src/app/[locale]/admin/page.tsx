"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AdminUser = {
  id: number;
  email: string;
  role: "super_admin" | "admin" | "editor";
};

type MenuKey =
  | "dashboard"
  | "rooms"
  | "reservations"
  | "reviews"
  | "gallery"
  | "users"
  | "invite-codes"
  | "whatsapp"
  | "email"
  | "settings"
  | "diagnostic"
  | "logs"
  | "db-admin";

type DashboardPayload = {
  counters: {
    rooms: number;
    reservations: number;
    reviews: number;
    users: number;
    dbSizeMb: number;
  };
  recentReservations: Array<{ id: string; guestName: string; room: string; status: string; createdAt: string }>;
  recentReviews: Array<{ id: number; userName: string; rating: number; status: string; createdAt: string }>;
  recentGallery: Array<{ id: number; title: string; createdAt: string }>;
};

const menus: Array<{ key: MenuKey; label: string }> = [
  { key: "dashboard", label: "Dashboard" },
  { key: "rooms", label: "Camere" },
  { key: "reservations", label: "Rezervari" },
  { key: "reviews", label: "Review-uri" },
  { key: "gallery", label: "Galerie" },
  { key: "users", label: "Utilizatori" },
  { key: "invite-codes", label: "Coduri invitatie" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "Email" },
  { key: "settings", label: "Setari" },
  { key: "diagnostic", label: "Diagnostic" },
  { key: "logs", label: "Loguri" },
  { key: "db-admin", label: "Administrare baza de date" },
];

function formatDate(value: string) {
  return new Date(value).toLocaleString("ro-RO");
}

async function fetchJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data as { error?: string }).error || "Request failed.");
  }
  return data as T;
}

export default function AdminPage() {
  const router = useRouter();

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [active, setActive] = useState<MenuKey>("dashboard");
  const [message, setMessage] = useState<string>("");

  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [rooms, setRooms] = useState<Array<Record<string, unknown>>>([]);
  const [reservations, setReservations] = useState<Array<Record<string, unknown>>>([]);
  const [reviews, setReviews] = useState<Array<Record<string, unknown>>>([]);
  const [gallery, setGallery] = useState<Array<Record<string, unknown>>>([]);
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);
  const [inviteCodes, setInviteCodes] = useState<Array<Record<string, unknown>>>([]);

  const [dbTables, setDbTables] = useState<Array<{ table: string; rows: number }>>([]);
  const [dbBackups, setDbBackups] = useState<Array<{ name: string; size: number; createdAt: string }>>([]);
  const [dbTable, setDbTable] = useState<string>("");
  const [dbSearch, setDbSearch] = useState<string>("");
  const [dbColumns, setDbColumns] = useState<string[]>([]);
  const [dbRows, setDbRows] = useState<Array<Record<string, unknown>>>([]);

  const isSuperAdmin = user?.role === "super_admin";

  const loadDashboard = async () => {
    const data = await fetchJson<DashboardPayload>("/api/admin/dashboard");
    setDashboard(data);
  };

  const loadRooms = async () => {
    const data = await fetchJson<{ rooms: Array<Record<string, unknown>> }>("/api/admin/rooms");
    setRooms(data.rooms);
  };

  const loadReservations = async () => {
    const data = await fetchJson<{ reservations: Array<Record<string, unknown>> }>("/api/admin/reservations");
    setReservations(data.reservations);
  };

  const loadReviews = async () => {
    const data = await fetchJson<{ reviews: Array<Record<string, unknown>> }>("/api/admin/reviews");
    setReviews(data.reviews);
  };

  const loadGallery = async () => {
    const data = await fetchJson<{ images: Array<Record<string, unknown>> }>("/api/admin/gallery");
    setGallery(data.images);
  };

  const loadUsers = async () => {
    const data = await fetchJson<{ users: Array<Record<string, unknown>> }>("/api/admin/users");
    setUsers(data.users);
  };

  const loadInviteCodes = async () => {
    const data = await fetchJson<{ codes: Array<Record<string, unknown>> }>("/api/admin/invite-codes");
    setInviteCodes(data.codes);
  };

  const loadDbTables = useCallback(async () => {
    const data = await fetchJson<{
      tables: Array<{ table: string; rows: number }>;
      backups: Array<{ name: string; size: number; createdAt: string }>;
    }>("/api/admin/db?action=tables");
    setDbTables(data.tables);
    setDbBackups(data.backups);
    if (!dbTable && data.tables.length > 0) {
      setDbTable(data.tables[0].table);
    }
  }, [dbTable]);

  const loadDbRecords = async (table: string, search: string) => {
    if (!table) return;
    const params = new URLSearchParams({ action: "records", table, limit: "50", offset: "0", search });
    const data = await fetchJson<{ columns: string[]; rows: Array<Record<string, unknown>> }>(
      `/api/admin/db?${params.toString()}`
    );
    setDbColumns(data.columns);
    setDbRows(data.rows);
  };

  useEffect(() => {
    const boot = async () => {
      try {
        const auth = await fetchJson<{ authenticated: boolean; user: AdminUser }>("/api/admin/auth/me");
        setUser(auth.user);
      } catch {
        router.push("/admin/login");
        return;
      }

      setLoadingAuth(false);
    };

    void boot();
  }, [router]);

  useEffect(() => {
    if (loadingAuth) return;

    const run = async () => {
      setMessage("");
      try {
        if (active === "dashboard") await loadDashboard();
        if (active === "rooms") await loadRooms();
        if (active === "reservations") await loadReservations();
        if (active === "reviews") await loadReviews();
        if (active === "gallery") await loadGallery();
        if (active === "users") await loadUsers();
        if (active === "invite-codes") await loadInviteCodes();
        if (active === "db-admin" && isSuperAdmin) {
          await loadDbTables();
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Eroare.");
      }
    };

    void run();
  }, [active, loadingAuth, isSuperAdmin, loadDbTables]);

  const refreshDbRecords = async () => {
    if (active === "db-admin" && isSuperAdmin && dbTable) {
      await loadDbRecords(dbTable, dbSearch);
    }
  };

  const createRoom = async () => {
    const nameRo = prompt("Nume camera (RO):", "Camera noua");
    if (!nameRo) return;
    const nameEn = prompt("Nume camera (EN):", "New room") || "New room";

    await fetchJson("/api/admin/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nameRo,
        nameEn,
        descriptionRo: "Descriere",
        descriptionEn: "Description",
        maxGuests: 2,
        sizeSqm: 20,
        pricePerNight: 200,
        mainImageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
        amenitiesRo: "Wi-Fi",
        amenitiesEn: "Wi-Fi",
        viewRo: "Gradina",
        viewEn: "Garden",
        badgeRo: null,
        badgeEn: null,
        isActive: true,
        sortOrder: 99,
      }),
    });

    await loadRooms();
  };

  const saveRoom = async (room: Record<string, unknown>) => {
    const descriptionRo = prompt("Descriere RO:", String(room.description_ro || ""));
    if (descriptionRo == null) return;

    await fetchJson("/api/admin/rooms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: Number(room.id),
        nameRo: room.name_ro,
        nameEn: room.name_en,
        descriptionRo,
        descriptionEn: room.description_en,
        maxGuests: Number(room.max_guests),
        sizeSqm: Number(room.size_sqm),
        pricePerNight: Number(room.price_per_night),
        mainImageUrl: room.main_image_url,
        amenitiesRo: room.amenities_ro,
        amenitiesEn: room.amenities_en,
        viewRo: room.view_ro,
        viewEn: room.view_en,
        badgeRo: room.badge_ro,
        badgeEn: room.badge_en,
        isActive: Number(room.is_active) === 1,
        sortOrder: Number(room.sort_order),
      }),
    });

    await loadRooms();
  };

  const deleteRoom = async (id: number) => {
    if (!confirm("Sigur stergi camera?")) return;
    await fetchJson(`/api/admin/rooms?id=${id}`, { method: "DELETE" });
    await loadRooms();
  };

  const changeReservationStatus = async (id: string, status: string) => {
    await fetchJson("/api/admin/reservations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await loadReservations();
  };

  const moderateReview = async (id: number, action: "approve" | "reject") => {
    await fetchJson("/api/admin/reviews", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    await loadReviews();
  };

  const editReview = async (review: Record<string, unknown>) => {
    const comment = prompt("Comentariu:", String(review.comment || ""));
    if (comment == null) return;
    await fetchJson("/api/admin/reviews", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: Number(review.id), comment }),
    });
    await loadReviews();
  };

  const deleteReview = async (id: number) => {
    if (!confirm("Stergi review-ul?")) return;
    await fetchJson(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
    await loadReviews();
  };

  const uploadGallery = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    for (const file of Array.from(files)) {
      formData.append("files", file);
    }

    const response = await fetch("/api/admin/gallery/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error || "Upload esuat.");
    }

    const data = await response.json();
    const uploaded = data.uploaded as Array<{ imageUrl: string; thumbnailUrl: string }>;

    for (const item of uploaded) {
      await fetchJson("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: item.imageUrl,
          thumbnailUrl: item.thumbnailUrl,
          titleRo: "",
          titleEn: "",
          descriptionRo: "",
          descriptionEn: "",
          isActive: true,
          sortOrder: 99,
        }),
      });
    }

    await loadGallery();
  };

  const updateGallery = async (item: Record<string, unknown>) => {
    const titleRo = prompt("Titlu RO:", String(item.title_ro || ""));
    if (titleRo == null) return;

    await fetchJson("/api/admin/gallery", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: Number(item.id),
        titleRo,
        titleEn: item.title_en,
        descriptionRo: item.description_ro,
        descriptionEn: item.description_en,
        isActive: Number(item.is_active) === 1,
        sortOrder: Number(item.sort_order),
      }),
    });

    await loadGallery();
  };

  const deleteGallery = async (id: number) => {
    if (!confirm("Stergi imaginea?")) return;
    await fetchJson(`/api/admin/gallery?id=${id}`, { method: "DELETE" });
    await loadGallery();
  };

  const createInviteCode = async () => {
    const role = (prompt("Rol pentru cod (super_admin/admin/editor):", "admin") || "admin") as
      | "super_admin"
      | "admin"
      | "editor";

    await fetchJson("/api/admin/invite-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    await loadInviteCodes();
  };

  const createUser = async () => {
    const email = prompt("Email utilizator:", "");
    if (!email) return;
    const password = prompt("Parola:", "");
    if (!password) return;
    const role = (prompt("Rol (super_admin/admin/editor):", "admin") || "admin") as
      | "super_admin"
      | "admin"
      | "editor";

    await fetchJson("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role, isActive: true }),
    });

    await loadUsers();
  };

  const optimizeTable = async (table: string) => {
    await fetchJson("/api/admin/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "optimize", table }),
    });
    setMessage(`Tabela ${table} a fost optimizata.`);
  };

  const backupDatabase = async () => {
    await fetchJson("/api/admin/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "backup" }),
    });
    await loadDbTables();
    setMessage("Backup creat.");
  };

  const restoreBackup = async (fileName: string) => {
    if (!confirm(`Restore backup ${fileName}?`)) return;
    await fetchJson("/api/admin/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore", fileName }),
    });
    await loadDbTables();
    if (dbTable) {
      await loadDbRecords(dbTable, dbSearch);
    }
    setMessage("Restore finalizat.");
  };

  const updateDbRow = async (row: Record<string, unknown>) => {
    if (!dbTable) return;
    const key = dbColumns.find((column) => column === "id") || "id";
    const id = String(row[key]);
    const field = prompt("Camp de editat:", dbColumns[0] || "");
    if (!field || !dbColumns.includes(field)) return;
    const value = prompt("Valoare noua:", String(row[field] ?? ""));
    if (value == null) return;

    await fetchJson("/api/admin/db", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table: dbTable, id, payload: { [field]: value } }),
    });

    await refreshDbRecords();
  };

  const deleteDbRow = async (row: Record<string, unknown>) => {
    if (!dbTable) return;
    if (!confirm("Confirmi stergerea inregistrarii?")) return;
    const id = String(row.id);
    await fetchJson(`/api/admin/db?table=${encodeURIComponent(dbTable)}&id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    await refreshDbRecords();
  };

  const exportSql = async () => {
    const response = await fetch("/api/admin/db?action=export-sql");
    if (!response.ok) {
      throw new Error("Export SQL esuat.");
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "sofia-db-export.sql";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const exportCsv = async (table: string) => {
    const response = await fetch(`/api/admin/db?action=export-csv&table=${encodeURIComponent(table)}`);
    if (!response.ok) {
      throw new Error("Export CSV esuat.");
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${table}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  if (loadingAuth) {
    return <div className="min-h-screen bg-stone-50 pt-24 px-6">Se verifica sesiunea admin...</div>;
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-20 relative isolate">
      <div className="max-w-7xl mx-auto px-6 py-8 relative z-[60]">
        <div className="flex items-center justify-end mb-6">
          <Link
            href="/"
            className="px-4 py-2 bg-[#8b6f47] text-white rounded-lg hover:bg-[#6b5234] transition-colors text-sm font-medium"
          >
            Inapoi la site
          </Link>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <aside className="bg-white rounded-2xl p-4 shadow-sm h-fit">
            <div className="space-y-2">
              {menus.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    active === item.key ? "bg-[#8b6f47] text-white" : "bg-stone-100 text-stone-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </aside>

          <main className="bg-white rounded-2xl p-6 shadow-lg border border-stone-200 text-stone-900 relative z-[60]">
            {message && <p className="mb-4 text-sm text-amber-700">{message}</p>}

            {active === "dashboard" && dashboard && (
              <div className="space-y-6">
                <h2 className="text-2xl font-[family-name:var(--font-playfair)]">Dashboard</h2>
                <div className="grid md:grid-cols-5 gap-3">
                  <div className="p-4 rounded-xl bg-stone-100">Camere: <strong>{dashboard.counters.rooms}</strong></div>
                  <div className="p-4 rounded-xl bg-stone-100">Rezervari: <strong>{dashboard.counters.reservations}</strong></div>
                  <div className="p-4 rounded-xl bg-stone-100">Review-uri: <strong>{dashboard.counters.reviews}</strong></div>
                  <div className="p-4 rounded-xl bg-stone-100">Utilizatori: <strong>{dashboard.counters.users}</strong></div>
                  <div className="p-4 rounded-xl bg-stone-100">DB size: <strong>{dashboard.counters.dbSizeMb} MB</strong></div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h3 className="font-semibold mb-2">Ultimele rezervari</h3>
                    <div className="space-y-2">
                      {dashboard.recentReservations.map((r) => (
                        <div key={r.id} className="p-2 rounded bg-stone-100">{r.guestName} - {r.room}</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Ultimele review-uri</h3>
                    <div className="space-y-2">
                      {dashboard.recentReviews.map((r) => (
                        <div key={r.id} className="p-2 rounded bg-stone-100">{r.userName} ({r.rating}★)</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Ultimele upload-uri galerie</h3>
                    <div className="space-y-2">
                      {dashboard.recentGallery.map((g) => (
                        <div key={g.id} className="p-2 rounded bg-stone-100">{g.title}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {active === "rooms" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-[family-name:var(--font-playfair)]">Camere</h2>
                  <button onClick={() => void createRoom()} className="px-3 py-2 bg-[#8b6f47] text-white rounded-lg">Adauga camera</button>
                </div>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left"><th>ID</th><th>Nume RO</th><th>Pret</th><th>Activ</th><th>Actiuni</th></tr></thead>
                    <tbody>
                      {rooms.map((room) => (
                        <tr key={String(room.id)} className="border-t">
                          <td>{String(room.id)}</td>
                          <td>{String(room.name_ro || "")}</td>
                          <td>{String(room.price_per_night || "")}</td>
                          <td>{Number(room.is_active) === 1 ? "Da" : "Nu"}</td>
                          <td className="space-x-2 py-2">
                            <button className="px-2 py-1 bg-stone-200 rounded" onClick={() => void saveRoom(room)}>Editeaza</button>
                            <button className="px-2 py-1 bg-red-200 rounded" onClick={() => void deleteRoom(Number(room.id))}>Sterge</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {active === "reservations" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-[family-name:var(--font-playfair)]">Rezervari</h2>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left"><th>ID</th><th>Nume</th><th>Camera</th><th>Status</th><th>Creat</th></tr></thead>
                    <tbody>
                      {reservations.map((row) => (
                        <tr key={String(row.id)} className="border-t">
                          <td>{String(row.id)}</td>
                          <td>{String(row.first_name || "")} {String(row.last_name || "")}</td>
                          <td>{String(row.room || "")}</td>
                          <td>
                            <select
                              value={String(row.status || "pending")}
                              onChange={(e) => void changeReservationStatus(String(row.id), e.target.value)}
                              className="border rounded px-2 py-1"
                            >
                              <option value="pending">pending</option>
                              <option value="confirmed">confirmed</option>
                              <option value="cancelled">cancelled</option>
                            </select>
                          </td>
                          <td>{formatDate(String(row.created_at || ""))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {active === "reviews" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-[family-name:var(--font-playfair)]">Review-uri</h2>
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={String(review.id)} className="p-4 rounded-xl bg-stone-100">
                      <p className="font-semibold">{String(review.user_name || "")} - {String(review.rating || "")}★</p>
                      <p className="text-sm text-stone-700 mb-2">{String(review.comment || "")}</p>
                      <p className="text-xs text-stone-500 mb-3">Status: {String(review.status || "pending")}</p>
                      <div className="flex gap-2">
                        <button className="px-2 py-1 bg-green-200 rounded" onClick={() => void moderateReview(Number(review.id), "approve")}>Aproba</button>
                        <button className="px-2 py-1 bg-amber-200 rounded" onClick={() => void moderateReview(Number(review.id), "reject")}>Respinge</button>
                        <button className="px-2 py-1 bg-stone-200 rounded" onClick={() => void editReview(review)}>Editeaza</button>
                        <button className="px-2 py-1 bg-red-200 rounded" onClick={() => void deleteReview(Number(review.id))}>Sterge</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {active === "gallery" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-[family-name:var(--font-playfair)]">Galerie</h2>
                  <label className="px-3 py-2 bg-[#8b6f47] text-white rounded-lg cursor-pointer">
                    Upload imagini
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => void uploadGallery(e.target.files).catch((err: unknown) => {
                        const msg = err instanceof Error ? err.message : "Upload esuat.";
                        setMessage(msg);
                      })}
                    />
                  </label>
                </div>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left"><th>ID</th><th>Titlu RO</th><th>Activ</th><th>Ordine</th><th>Actiuni</th></tr></thead>
                    <tbody>
                      {gallery.map((item) => (
                        <tr key={String(item.id)} className="border-t">
                          <td>{String(item.id)}</td>
                          <td>{String(item.title_ro || "")}</td>
                          <td>{Number(item.is_active) === 1 ? "Da" : "Nu"}</td>
                          <td>{String(item.sort_order || "")}</td>
                          <td className="space-x-2 py-2">
                            <button className="px-2 py-1 bg-stone-200 rounded" onClick={() => void updateGallery(item)}>Editeaza</button>
                            <button className="px-2 py-1 bg-red-200 rounded" onClick={() => void deleteGallery(Number(item.id))}>Sterge</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {active === "users" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-[family-name:var(--font-playfair)]">Utilizatori</h2>
                  {isSuperAdmin && (
                    <button className="px-3 py-2 bg-[#8b6f47] text-white rounded-lg" onClick={() => void createUser()}>
                      Adauga utilizator
                    </button>
                  )}
                </div>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left"><th>ID</th><th>Email</th><th>Rol</th><th>Activ</th></tr></thead>
                    <tbody>
                      {users.map((item) => (
                        <tr key={String(item.id)} className="border-t">
                          <td>{String(item.id)}</td>
                          <td>{String(item.email)}</td>
                          <td>{String(item.role)}</td>
                          <td>{Number(item.is_active) === 1 ? "Da" : "Nu"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {active === "invite-codes" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-[family-name:var(--font-playfair)]">Coduri invitatie</h2>
                  {isSuperAdmin && (
                    <button className="px-3 py-2 bg-[#8b6f47] text-white rounded-lg" onClick={() => void createInviteCode()}>
                      Genereaza cod
                    </button>
                  )}
                </div>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left"><th>ID</th><th>Cod</th><th>Rol</th><th>Activ</th><th>Expira</th></tr></thead>
                    <tbody>
                      {inviteCodes.map((code) => (
                        <tr key={String(code.id)} className="border-t">
                          <td>{String(code.id)}</td>
                          <td>{String(code.code)}</td>
                          <td>{String(code.role)}</td>
                          <td>{Number(code.is_active) === 1 ? "Da" : "Nu"}</td>
                          <td>{code.expires_at ? formatDate(String(code.expires_at)) : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(active === "whatsapp" || active === "email" || active === "settings") && (
              <div className="space-y-3">
                <h2 className="text-2xl font-[family-name:var(--font-playfair)]">
                  {active === "whatsapp" ? "WhatsApp" : active === "email" ? "Email" : "Setari"}
                </h2>
                <p className="text-sm text-stone-600">
                  Configurarea operationala se face din sectiunea existenta Notificari/API-uri.
                </p>
              </div>
            )}

            {active === "diagnostic" && (
              <div className="space-y-3">
                <h2 className="text-2xl font-[family-name:var(--font-playfair)]">Diagnostic</h2>
                <p className="text-sm text-stone-600">
                  Verifica starea serviciilor folosind dashboard-ul si endpoint-urile de test din admin.
                </p>
              </div>
            )}

            {active === "logs" && (
              <div className="space-y-3">
                <h2 className="text-2xl font-[family-name:var(--font-playfair)]">Loguri</h2>
                <p className="text-sm text-stone-600">
                  Logurile de notificari sunt disponibile in sectiunea Notificari si in tabelele bazei de date.
                </p>
              </div>
            )}

            {active === "db-admin" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-[family-name:var(--font-playfair)]">Administrare baza de date</h2>
                {!isSuperAdmin ? (
                  <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                    Acces permis doar utilizatorilor cu rol Super Admin.
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-3 py-2 bg-[#8b6f47] text-white rounded" onClick={() => void backupDatabase()}>
                        Backup
                      </button>
                      <button className="px-3 py-2 bg-stone-200 rounded" onClick={() => void exportSql()}>
                        Export SQL
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-stone-100">
                        <h3 className="font-semibold mb-2">Tabele</h3>
                        <div className="space-y-2 text-sm">
                          {dbTables.map((entry) => (
                            <div key={entry.table} className="flex items-center justify-between gap-2">
                              <button
                                onClick={() => {
                                  setDbTable(entry.table);
                                  void loadDbRecords(entry.table, dbSearch);
                                }}
                                className={`text-left flex-1 ${dbTable === entry.table ? "font-semibold" : ""}`}
                              >
                                {entry.table} ({entry.rows})
                              </button>
                              <button className="px-2 py-1 bg-stone-200 rounded" onClick={() => void optimizeTable(entry.table)}>
                                Optimize
                              </button>
                              <button
                                className="px-2 py-1 bg-stone-200 rounded"
                                onClick={() => void exportCsv(entry.table)}
                              >
                                CSV
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-stone-100">
                        <h3 className="font-semibold mb-2">Backup-uri</h3>
                        <div className="space-y-2 text-sm">
                          {dbBackups.map((b) => (
                            <div key={b.name} className="flex items-center justify-between gap-2">
                              <span className="truncate">{b.name}</span>
                              <button className="px-2 py-1 bg-stone-200 rounded" onClick={() => void restoreBackup(b.name)}>
                                Restore
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-stone-100">
                      <div className="flex gap-2 mb-3">
                        <input
                          value={dbSearch}
                          onChange={(e) => setDbSearch(e.target.value)}
                          placeholder="Cautare in tabel"
                          className="border rounded px-3 py-2 w-full"
                        />
                        <button className="px-3 py-2 bg-stone-200 rounded" onClick={() => void refreshDbRecords()}>
                          Cauta
                        </button>
                      </div>

                      <div className="overflow-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-left">
                              {dbColumns.map((column) => (
                                <th key={column} className="pr-3 pb-2">{column}</th>
                              ))}
                              <th className="pb-2">Actiuni</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dbRows.map((row, idx) => (
                              <tr key={idx} className="border-t">
                                {dbColumns.map((column) => (
                                  <td key={column} className="pr-3 py-2 max-w-[200px] truncate">
                                    {String(row[column] ?? "")}
                                  </td>
                                ))}
                                <td className="py-2 space-x-1 whitespace-nowrap">
                                  <button className="px-2 py-1 bg-stone-200 rounded" onClick={() => void updateDbRow(row)}>
                                    Edit
                                  </button>
                                  <button className="px-2 py-1 bg-red-200 rounded" onClick={() => void deleteDbRow(row)}>
                                    Sterge
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
