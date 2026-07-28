"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Camera,
  ChartColumn,
  FileImage,
  ImagePlus,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  Plus,
  Search,
  Shield,
  Sparkles,
  User,
  X,
  ZoomIn,
} from "lucide-react";

type AdminRole = "super_admin" | "admin" | "editor";

type AdminUser = {
  id: number;
  email: string;
  role: AdminRole;
};

type MenuKey =
  | "dashboard"
  | "profile"
  | "rooms"
  | "room-images"
  | "gallery"
  | "reservations"
  | "reviews"
  | "users"
  | "invite-codes";

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

type ProfilePayload = {
  id: number;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type RoomRecord = {
  id: number;
  name_ro: string;
  name_en: string;
  description_ro: string;
  description_en: string;
  max_guests: number;
  size_sqm: number;
  price_per_night: number;
  main_image_url: string;
  amenities_ro: string;
  amenities_en: string;
  view_ro: string;
  view_en: string;
  badge_ro: string | null;
  badge_en: string | null;
  is_active: number;
  sort_order: number;
};

type GalleryRecord = {
  id: number;
  image_url: string;
  thumbnail_url: string | null;
  title_ro: string | null;
  title_en: string | null;
  description_ro: string | null;
  description_en: string | null;
  is_active: number;
  sort_order: number;
};

type RoomImageRecord = {
  id: number;
  room_id: number;
  image_url: string;
  title: string | null;
  description: string | null;
  sort_order: number;
  is_active: number;
};

type ReservationRecord = {
  id: string;
  first_name: string;
  last_name: string;
  room: string;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
};

type ReviewRecord = {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
};

type UserRecord = {
  id: number;
  email: string;
  role: AdminRole;
  is_active: number;
};

type InviteCodeRecord = {
  id: number;
  code: string;
  role: AdminRole;
  is_active: number;
  expires_at: string | null;
};

const menus: Array<{ key: MenuKey; label: string; icon: typeof ChartColumn }> = [
  { key: "dashboard", label: "Dashboard", icon: ChartColumn },
  { key: "profile", label: "Profil", icon: User },
  { key: "rooms", label: "Camere", icon: Camera },
  { key: "room-images", label: "Imagini camere", icon: FileImage },
  { key: "gallery", label: "Galerie", icon: ImagePlus },
  { key: "reservations", label: "Rezervari", icon: Mail },
  { key: "reviews", label: "Review-uri", icon: Sparkles },
  { key: "users", label: "Utilizatori", icon: Shield },
  { key: "invite-codes", label: "Coduri invitatie", icon: KeyRound },
];

function formatDate(value: string) {
  if (!value) return "-";
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
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [active, setActive] = useState<MenuKey>("dashboard");
  const [user, setUser] = useState<AdminUser | null>(null);

  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [gallery, setGallery] = useState<GalleryRecord[]>([]);
  const [roomImages, setRoomImages] = useState<RoomImageRecord[]>([]);
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [inviteCodes, setInviteCodes] = useState<InviteCodeRecord[]>([]);

  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const [reservationSearch, setReservationSearch] = useState("");
  const [reservationStatusFilter, setReservationStatusFilter] = useState<"all" | ReservationRecord["status"]>("all");
  const [reviewStatusFilter, setReviewStatusFilter] = useState<"all" | ReviewRecord["status"]>("all");

  const [userForm, setUserForm] = useState({ email: "", password: "", role: "admin" as AdminRole, open: false });
  const [inviteForm, setInviteForm] = useState({ role: "admin" as AdminRole, open: false });

  const [profileForm, setProfileForm] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [roomForm, setRoomForm] = useState({
    id: 0,
    nameRo: "",
    nameEn: "",
    descriptionRo: "",
    descriptionEn: "",
    maxGuests: 2,
    sizeSqm: 20,
    pricePerNight: 200,
    mainImageUrl: "",
    amenitiesRo: "Wi-Fi",
    amenitiesEn: "Wi-Fi",
    viewRo: "Gradina",
    viewEn: "Garden",
    badgeRo: "",
    badgeEn: "",
    isActive: true,
    sortOrder: 99,
  });

  const [galleryForm, setGalleryForm] = useState({
    id: 0,
    titleRo: "",
    titleEn: "",
    descriptionRo: "",
    descriptionEn: "",
    sortOrder: 0,
    isActive: true,
  });

  const [roomImageForm, setRoomImageForm] = useState({
    id: 0,
    title: "",
    description: "",
    sortOrder: 0,
    isActive: true,
  });

  const isSuperAdmin = user?.role === "super_admin";

  const clearNotice = () => {
    setMessage("");
    setError("");
  };

  const handleError = (err: unknown) => {
    setMessage("");
    setError(err instanceof Error ? err.message : "A aparut o eroare.");
  };

  const loadDashboard = useCallback(async () => {
    const data = await fetchJson<DashboardPayload>("/api/admin/dashboard");
    setDashboard(data);
  }, []);

  const loadProfile = useCallback(async () => {
    const data = await fetchJson<{ profile: ProfilePayload }>("/api/admin/profile");
    setProfile(data.profile);
    setProfileForm((prev) => ({ ...prev, email: data.profile.email }));
  }, []);

  const loadRooms = useCallback(async () => {
    const data = await fetchJson<{ rooms: RoomRecord[] }>("/api/admin/rooms");
    setRooms(data.rooms);

    if (data.rooms.length > 0) {
      setSelectedRoomId((prev) => prev || Number(data.rooms[0].id));
    }

    return data.rooms;
  }, []);

  const loadGallery = useCallback(async () => {
    const data = await fetchJson<{ images: GalleryRecord[] }>("/api/admin/gallery");
    setGallery(data.images);
  }, []);

  const loadRoomImages = useCallback(async (roomId: number) => {
    const data = await fetchJson<{ images: RoomImageRecord[] }>(`/api/admin/rooms/images?roomId=${roomId}`);
    setRoomImages(data.images);
  }, []);

  const loadReservations = useCallback(async () => {
    const data = await fetchJson<{ reservations: ReservationRecord[] }>("/api/admin/reservations");
    setReservations(data.reservations);
  }, []);

  const loadReviews = useCallback(async () => {
    const data = await fetchJson<{ reviews: ReviewRecord[] }>("/api/admin/reviews");
    setReviews(data.reviews);
  }, []);

  const loadUsers = useCallback(async () => {
    const data = await fetchJson<{ users: UserRecord[] }>("/api/admin/users");
    setUsers(data.users);
  }, []);

  const loadInviteCodes = useCallback(async () => {
    const data = await fetchJson<{ codes: InviteCodeRecord[] }>("/api/admin/invite-codes");
    setInviteCodes(data.codes);
  }, []);

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

    const loadForTab = async () => {
      clearNotice();

      try {
        if (active === "dashboard") await loadDashboard();
        if (active === "profile") await loadProfile();
        if (active === "rooms") await loadRooms();
        if (active === "gallery") await loadGallery();
        if (active === "room-images") {
          const loadedRooms = await loadRooms();
          const roomId = selectedRoomId || Number(loadedRooms[0]?.id || 0);
          if (roomId) {
            await loadRoomImages(roomId);
          }
        }
        if (active === "reservations") await loadReservations();
        if (active === "reviews") await loadReviews();
        if (active === "users") await loadUsers();
        if (active === "invite-codes") await loadInviteCodes();
      } catch (err) {
        handleError(err);
      }
    };

    void loadForTab();
  }, [
    active,
    loadingAuth,
    loadDashboard,
    loadProfile,
    loadRooms,
    loadGallery,
    loadRoomImages,
    loadReservations,
    loadReviews,
    loadUsers,
    loadInviteCodes,
    selectedRoomId,
  ]);

  const sidebarMenu = useMemo(
    () =>
      menus.filter((item) => {
        if ((item.key === "users" || item.key === "invite-codes") && !isSuperAdmin) return false;
        return true;
      }),
    [isSuperAdmin]
  );

  const submitProfile = async () => {
    clearNotice();

    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmNewPassword) {
      setError("Parola noua si confirmarea nu coincid.");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        email: profileForm.email,
        currentPassword: profileForm.currentPassword,
        newPassword: profileForm.newPassword,
      };

      const data = await fetchJson<{ profile: ProfilePayload; message: string }>("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setProfile(data.profile);
      setUser((prev) => (prev ? { ...prev, email: data.profile.email } : prev));
      setProfileForm((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmNewPassword: "" }));
      setMessage(data.message || "Profil actualizat.");
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  };

  const openRoomForEdit = (room: RoomRecord) => {
    setRoomForm({
      id: Number(room.id),
      nameRo: room.name_ro,
      nameEn: room.name_en,
      descriptionRo: room.description_ro,
      descriptionEn: room.description_en,
      maxGuests: Number(room.max_guests),
      sizeSqm: Number(room.size_sqm),
      pricePerNight: Number(room.price_per_night),
      mainImageUrl: room.main_image_url,
      amenitiesRo: room.amenities_ro,
      amenitiesEn: room.amenities_en,
      viewRo: room.view_ro,
      viewEn: room.view_en,
      badgeRo: room.badge_ro || "",
      badgeEn: room.badge_en || "",
      isActive: Number(room.is_active) === 1,
      sortOrder: Number(room.sort_order),
    });
  };

  const submitRoom = async () => {
    clearNotice();
    setBusy(true);

    try {
      const payload = {
        id: roomForm.id,
        nameRo: roomForm.nameRo,
        nameEn: roomForm.nameEn,
        descriptionRo: roomForm.descriptionRo,
        descriptionEn: roomForm.descriptionEn,
        maxGuests: Number(roomForm.maxGuests),
        sizeSqm: Number(roomForm.sizeSqm),
        pricePerNight: Number(roomForm.pricePerNight),
        mainImageUrl: roomForm.mainImageUrl,
        amenitiesRo: roomForm.amenitiesRo,
        amenitiesEn: roomForm.amenitiesEn,
        viewRo: roomForm.viewRo,
        viewEn: roomForm.viewEn,
        badgeRo: roomForm.badgeRo || null,
        badgeEn: roomForm.badgeEn || null,
        isActive: roomForm.isActive,
        sortOrder: Number(roomForm.sortOrder),
      };

      if (roomForm.id > 0) {
        await fetchJson("/api/admin/rooms", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setMessage("Camera actualizata.");
      } else {
        await fetchJson("/api/admin/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setMessage("Camera adaugata.");
      }

      setRoomForm({
        id: 0,
        nameRo: "",
        nameEn: "",
        descriptionRo: "",
        descriptionEn: "",
        maxGuests: 2,
        sizeSqm: 20,
        pricePerNight: 200,
        mainImageUrl: "",
        amenitiesRo: "Wi-Fi",
        amenitiesEn: "Wi-Fi",
        viewRo: "Gradina",
        viewEn: "Garden",
        badgeRo: "",
        badgeEn: "",
        isActive: true,
        sortOrder: 99,
      });
      await loadRooms();
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  };

  const deleteRoom = async (id: number) => {
    if (!confirm("Sigur stergi camera?")) return;
    clearNotice();
    setBusy(true);

    try {
      await fetchJson(`/api/admin/rooms?id=${id}`, { method: "DELETE" });
      setMessage("Camera stearsa.");
      await loadRooms();
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  };

  const uploadGallery = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    clearNotice();
    setBusy(true);

    try {
      const formData = new FormData();
      for (const file of Array.from(files)) {
        formData.append("files", file);
      }

      const uploadResponse = await fetch("/api/admin/gallery/upload", { method: "POST", body: formData });
      const uploadPayload = await uploadResponse.json().catch(() => ({}));
      if (!uploadResponse.ok) {
        throw new Error((uploadPayload as { error?: string }).error || "Upload esuat.");
      }

      const uploaded = (uploadPayload as { uploaded?: Array<{ imageUrl: string; thumbnailUrl: string }> }).uploaded || [];

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

      setMessage(`Upload complet: ${uploaded.length} imagini adaugate in galerie.`);
      await loadGallery();
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  };

  const openGalleryForEdit = (item: GalleryRecord) => {
    setGalleryForm({
      id: Number(item.id),
      titleRo: item.title_ro || "",
      titleEn: item.title_en || "",
      descriptionRo: item.description_ro || "",
      descriptionEn: item.description_en || "",
      sortOrder: Number(item.sort_order),
      isActive: Number(item.is_active) === 1,
    });
  };

  const submitGalleryEdit = async () => {
    if (!galleryForm.id) return;

    clearNotice();
    setBusy(true);

    try {
      await fetchJson("/api/admin/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: galleryForm.id,
          titleRo: galleryForm.titleRo,
          titleEn: galleryForm.titleEn,
          descriptionRo: galleryForm.descriptionRo,
          descriptionEn: galleryForm.descriptionEn,
          isActive: galleryForm.isActive,
          sortOrder: Number(galleryForm.sortOrder),
        }),
      });

      setMessage("Imagine actualizata.");
      await loadGallery();
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  };

  const deleteGallery = async (id: number) => {
    if (!confirm("Sigur stergi imaginea?")) return;

    clearNotice();
    setBusy(true);

    try {
      await fetchJson(`/api/admin/gallery?id=${id}`, { method: "DELETE" });
      setMessage("Imagine stearsa din galerie.");
      await loadGallery();
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  };

  const uploadRoomImages = async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedRoomId) return;

    clearNotice();
    setBusy(true);

    try {
      const formData = new FormData();
      for (const file of Array.from(files)) {
        formData.append("files", file);
      }

      const uploadResponse = await fetch("/api/admin/gallery/upload", { method: "POST", body: formData });
      const uploadPayload = await uploadResponse.json().catch(() => ({}));
      if (!uploadResponse.ok) {
        throw new Error((uploadPayload as { error?: string }).error || "Upload esuat.");
      }

      const uploaded = (uploadPayload as { uploaded?: Array<{ imageUrl: string }> }).uploaded || [];

      for (let index = 0; index < uploaded.length; index += 1) {
        const item = uploaded[index];
        await fetchJson("/api/admin/rooms/images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId: selectedRoomId,
            imageUrl: item.imageUrl,
            title: "",
            description: "",
            sortOrder: 90 + index,
            isActive: true,
          }),
        });
      }

      await loadRoomImages(selectedRoomId);
      setMessage(`Imagini adaugate pentru camera selectata: ${uploaded.length}.`);
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  };

  const openRoomImageForEdit = (item: RoomImageRecord) => {
    setRoomImageForm({
      id: Number(item.id),
      title: item.title || "",
      description: item.description || "",
      sortOrder: Number(item.sort_order),
      isActive: Number(item.is_active) === 1,
    });
  };

  const submitRoomImageEdit = async () => {
    if (!roomImageForm.id) return;

    clearNotice();
    setBusy(true);

    try {
      await fetchJson("/api/admin/rooms/images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: roomImageForm.id,
          title: roomImageForm.title,
          description: roomImageForm.description,
          sortOrder: Number(roomImageForm.sortOrder),
          isActive: roomImageForm.isActive,
        }),
      });

      if (selectedRoomId) {
        await loadRoomImages(selectedRoomId);
      }

      setMessage("Imagine camera actualizata.");
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  };

  const deleteRoomImage = async (id: number) => {
    if (!confirm("Sigur stergi aceasta imagine a camerei?")) return;

    clearNotice();
    setBusy(true);

    try {
      await fetchJson(`/api/admin/rooms/images?id=${id}`, { method: "DELETE" });
      if (selectedRoomId) {
        await loadRoomImages(selectedRoomId);
      }
      setMessage("Imagine stearsa.");
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  };

  const changeReservationStatus = async (id: string, status: "pending" | "confirmed" | "cancelled") => {
    clearNotice();

    try {
      await fetchJson("/api/admin/reservations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      await loadReservations();
      setMessage("Status rezervare actualizat.");
    } catch (err) {
      handleError(err);
    }
  };

  const moderateReview = async (id: number, action: "approve" | "reject") => {
    clearNotice();

    try {
      await fetchJson("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });

      await loadReviews();
      setMessage(action === "approve" ? "Review aprobat." : "Review respins.");
    } catch (err) {
      handleError(err);
    }
  };

  const submitCreateUser = async () => {
    if (!userForm.email || !userForm.password) {
      setError("Email si parola sunt obligatorii.");
      return;
    }
    clearNotice();
    setBusy(true);
    try {
      await fetchJson("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userForm.email, password: userForm.password, role: userForm.role, isActive: true }),
      });
      setUserForm({ email: "", password: "", role: "admin", open: false });
      await loadUsers();
      setMessage("Utilizator adaugat.");
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  };

  const submitCreateInviteCode = async () => {
    clearNotice();
    setBusy(true);
    try {
      await fetchJson("/api/admin/invite-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: inviteForm.role }),
      });
      setInviteForm((p) => ({ ...p, open: false }));
      await loadInviteCodes();
      setMessage("Cod de invitatie generat.");
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  };

  const filteredReservations = useMemo(() => {
    let list = reservations;
    if (reservationStatusFilter !== "all") {
      list = list.filter((r) => r.status === reservationStatusFilter);
    }
    if (reservationSearch.trim()) {
      const q = reservationSearch.toLowerCase();
      list = list.filter((r) =>
        `${r.first_name} ${r.last_name} ${r.room} ${r.id}`.toLowerCase().includes(q)
      );
    }
    return list;
  }, [reservations, reservationSearch, reservationStatusFilter]);

  const filteredReviews = useMemo(() => {
    if (reviewStatusFilter === "all") return reviews;
    return reviews.filter((r) => r.status === reviewStatusFilter);
  }, [reviews, reviewStatusFilter]);

  const logout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-200 grid place-items-center px-6">
        <div className="inline-flex items-center gap-2 text-sm bg-slate-900/80 border border-slate-700 px-4 py-2 rounded-full">
          <Loader2 className="h-4 w-4 animate-spin" />
          Se verifica sesiunea admin...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,_#1f2a44_0%,_#0b0f19_55%)] text-slate-100">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-6">
        <header className="mb-6 rounded-2xl border border-slate-700/70 bg-slate-900/70 backdrop-blur p-4 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-cyan-300">Sofia Armony Admin</p>
              <h1 className="text-2xl md:text-3xl font-semibold mt-1">Panou de administrare profesional</h1>
              <p className="text-sm text-slate-300 mt-1">Gestioneaza profilul, camerele si imaginile dintr-un singur loc.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm">
                <span className="text-slate-400">Cont:</span> <span className="font-medium">{user?.email}</span>
              </div>
              <div className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm uppercase">
                {user?.role}
              </div>
              <Link
                href="/"
                className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium"
              >
                Inapoi la site
              </Link>
              <button
                onClick={() => void logout()}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-sm font-medium"
              >
                <LogOut size={16} />
                Iesire
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[270px_1fr] gap-6">
          <aside className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-3 h-fit">
            <nav className="space-y-2">
              {sidebarMenu.map((item) => {
                const Icon = item.icon;
                const selected = active === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActive(item.key)}
                    className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      selected
                        ? "bg-cyan-600 text-white"
                        : "bg-slate-800/80 text-slate-200 hover:bg-slate-700"
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4 md:p-6">
            {(message || error) && (
              <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${error ? "border-rose-600 bg-rose-950/60 text-rose-200" : "border-emerald-700 bg-emerald-950/40 text-emerald-200"}`}>
                {error || message}
              </div>
            )}

            {active === "dashboard" && dashboard && (
              <section className="space-y-5">
                <h2 className="text-xl font-semibold">Dashboard</h2>
                <div className="grid gap-3 md:grid-cols-5">
                  <div className="rounded-xl bg-slate-800 p-4 border border-slate-700">Camere: <strong>{dashboard.counters.rooms}</strong></div>
                  <div className="rounded-xl bg-slate-800 p-4 border border-slate-700">Rezervari: <strong>{dashboard.counters.reservations}</strong></div>
                  <div className="rounded-xl bg-slate-800 p-4 border border-slate-700">Review-uri: <strong>{dashboard.counters.reviews}</strong></div>
                  <div className="rounded-xl bg-slate-800 p-4 border border-slate-700">Utilizatori: <strong>{dashboard.counters.users}</strong></div>
                  <div className="rounded-xl bg-slate-800 p-4 border border-slate-700">DB size: <strong>{dashboard.counters.dbSizeMb} MB</strong></div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-xl bg-slate-800 p-4 border border-slate-700">
                    <h3 className="font-medium mb-2">Ultimele rezervari</h3>
                    <div className="space-y-2 text-sm text-slate-300">
                      {dashboard.recentReservations.map((row) => (
                        <div key={row.id} className="rounded-lg bg-slate-900 px-3 py-2 border border-slate-700">
                          <p className="font-medium text-slate-100">{row.guestName} - {row.room}</p>
                          <p className="text-xs text-slate-400">{formatDate(row.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-800 p-4 border border-slate-700">
                    <h3 className="font-medium mb-2">Ultimele review-uri</h3>
                    <div className="space-y-2 text-sm text-slate-300">
                      {dashboard.recentReviews.map((row) => (
                        <div key={row.id} className="rounded-lg bg-slate-900 px-3 py-2 border border-slate-700">
                          <p className="font-medium text-slate-100">{row.userName} ({row.rating}★)</p>
                          <p className="text-xs text-slate-400">{formatDate(row.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-800 p-4 border border-slate-700">
                    <h3 className="font-medium mb-2">Ultimele imagini galerie</h3>
                    <div className="space-y-2 text-sm text-slate-300">
                      {dashboard.recentGallery.map((row) => (
                        <div key={row.id} className="rounded-lg bg-slate-900 px-3 py-2 border border-slate-700">
                          <p className="font-medium text-slate-100">{row.title || "Fara titlu"}</p>
                          <p className="text-xs text-slate-400">{formatDate(row.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {active === "profile" && (
              <section className="space-y-5">
                <h2 className="text-xl font-semibold">Profil administrator</h2>

                {profile && (
                  <div className="grid gap-3 md:grid-cols-3 text-sm">
                    <div className="rounded-xl bg-slate-800 border border-slate-700 p-4">
                      <p className="text-slate-400">Email</p>
                      <p className="font-medium mt-1">{profile.email}</p>
                    </div>
                    <div className="rounded-xl bg-slate-800 border border-slate-700 p-4">
                      <p className="text-slate-400">Rol</p>
                      <p className="font-medium mt-1 uppercase">{profile.role}</p>
                    </div>
                    <div className="rounded-xl bg-slate-800 border border-slate-700 p-4">
                      <p className="text-slate-400">Actualizat</p>
                      <p className="font-medium mt-1">{formatDate(profile.updatedAt)}</p>
                    </div>
                  </div>
                )}

                <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 md:p-5 space-y-3">
                  <p className="font-medium">Editeaza profilul</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={profileForm.email}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                      placeholder="Email"
                    />
                    <input
                      type="password"
                      value={profileForm.currentPassword}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                      placeholder="Parola curenta"
                    />
                    <input
                      type="password"
                      value={profileForm.newPassword}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                      placeholder="Parola noua (optional)"
                    />
                    <input
                      type="password"
                      value={profileForm.confirmNewPassword}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, confirmNewPassword: e.target.value }))}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                      placeholder="Confirma parola noua"
                    />
                  </div>

                  <button
                    onClick={() => void submitProfile()}
                    disabled={busy}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium disabled:opacity-60"
                  >
                    {busy && <Loader2 size={15} className="animate-spin" />}
                    Salveaza profil
                  </button>
                </div>
              </section>
            )}

            {active === "rooms" && (
              <section className="space-y-5">
                <h2 className="text-xl font-semibold">Camere</h2>

                <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 space-y-3">
                  <p className="font-medium">{roomForm.id > 0 ? "Editeaza camera" : "Adauga camera"}</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input value={roomForm.nameRo} onChange={(e) => setRoomForm((p) => ({ ...p, nameRo: e.target.value }))} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" placeholder="Nume RO" />
                    <input value={roomForm.nameEn} onChange={(e) => setRoomForm((p) => ({ ...p, nameEn: e.target.value }))} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" placeholder="Nume EN" />
                    <input value={roomForm.mainImageUrl} onChange={(e) => setRoomForm((p) => ({ ...p, mainImageUrl: e.target.value }))} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm md:col-span-2" placeholder="Main image URL" />
                    <input value={roomForm.viewRo} onChange={(e) => setRoomForm((p) => ({ ...p, viewRo: e.target.value }))} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" placeholder="View RO" />
                    <input value={roomForm.viewEn} onChange={(e) => setRoomForm((p) => ({ ...p, viewEn: e.target.value }))} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" placeholder="View EN" />
                    <input type="number" value={roomForm.maxGuests} onChange={(e) => setRoomForm((p) => ({ ...p, maxGuests: Number(e.target.value) }))} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" placeholder="Max guests" />
                    <input type="number" value={roomForm.sizeSqm} onChange={(e) => setRoomForm((p) => ({ ...p, sizeSqm: Number(e.target.value) }))} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" placeholder="Size sqm" />
                    <input type="number" value={roomForm.pricePerNight} onChange={(e) => setRoomForm((p) => ({ ...p, pricePerNight: Number(e.target.value) }))} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" placeholder="Pret" />
                    <input type="number" value={roomForm.sortOrder} onChange={(e) => setRoomForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" placeholder="Sort order" />
                    <textarea value={roomForm.descriptionRo} onChange={(e) => setRoomForm((p) => ({ ...p, descriptionRo: e.target.value }))} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm md:col-span-2 min-h-[84px]" placeholder="Descriere RO" />
                    <textarea value={roomForm.descriptionEn} onChange={(e) => setRoomForm((p) => ({ ...p, descriptionEn: e.target.value }))} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm md:col-span-2 min-h-[84px]" placeholder="Description EN" />
                    <input value={roomForm.amenitiesRo} onChange={(e) => setRoomForm((p) => ({ ...p, amenitiesRo: e.target.value }))} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" placeholder="Amenitati RO (comma separated)" />
                    <input value={roomForm.amenitiesEn} onChange={(e) => setRoomForm((p) => ({ ...p, amenitiesEn: e.target.value }))} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" placeholder="Amenities EN (comma separated)" />
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => void submitRoom()} disabled={busy} className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-sm font-medium disabled:opacity-60">{roomForm.id > 0 ? "Actualizeaza" : "Adauga"}</button>
                    {roomForm.id > 0 && (
                      <button
                        onClick={() => setRoomForm({ id: 0, nameRo: "", nameEn: "", descriptionRo: "", descriptionEn: "", maxGuests: 2, sizeSqm: 20, pricePerNight: 200, mainImageUrl: "", amenitiesRo: "Wi-Fi", amenitiesEn: "Wi-Fi", viewRo: "Gradina", viewEn: "Garden", badgeRo: "", badgeEn: "", isActive: true, sortOrder: 99 })}
                        className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-auto rounded-xl border border-slate-700">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800 text-slate-200">
                      <tr>
                        <th className="text-left p-3">ID</th>
                        <th className="text-left p-3">Nume RO</th>
                        <th className="text-left p-3">Pret</th>
                        <th className="text-left p-3">Activ</th>
                        <th className="text-left p-3">Actiuni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map((room) => (
                        <tr key={room.id} className="border-t border-slate-700">
                          <td className="p-3">{room.id}</td>
                          <td className="p-3">{room.name_ro}</td>
                          <td className="p-3">{room.price_per_night}</td>
                          <td className="p-3">{room.is_active === 1 ? "Da" : "Nu"}</td>
                          <td className="p-3 space-x-2">
                            <button onClick={() => openRoomForEdit(room)} className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600">Editeaza</button>
                            <button onClick={() => void deleteRoom(room.id)} className="px-2 py-1 rounded bg-rose-700 hover:bg-rose-600">Sterge</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {active === "room-images" && (
              <section className="space-y-5">
                <h2 className="text-xl font-semibold">Imagini camere</h2>

                <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 space-y-3">
                  <div className="flex flex-wrap gap-3 items-center">
                    <select
                      value={selectedRoomId || ""}
                      onChange={(e) => {
                        const roomId = Number(e.target.value);
                        setSelectedRoomId(roomId);
                        void loadRoomImages(roomId).catch(handleError);
                      }}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                    >
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          #{room.id} - {room.name_ro}
                        </option>
                      ))}
                    </select>

                    <label className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-sm font-medium cursor-pointer">
                      Upload imagini camera
                      <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => void uploadRoomImages(e.target.files)} />
                    </label>
                  </div>

                  {roomImages.length === 0 && <p className="text-sm text-slate-400">Nu exista imagini pentru camera selectata.</p>}

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {roomImages.map((item) => (
                      <article key={item.id} className="rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                        <div className="relative h-44 group cursor-pointer" onClick={() => setLightbox(item.image_url)}>
                          <Image src={item.image_url} alt={item.title || "Room image"} fill className="object-cover" unoptimized />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="p-3 text-sm space-y-1">
                          <p className="font-medium">{item.title || "Fara titlu"}</p>
                          <p className="text-slate-400 text-xs">Sort: {item.sort_order} | {item.is_active === 1 ? "Activ" : "Inactiv"}</p>
                          <div className="flex gap-2 pt-1">
                            <button onClick={() => openRoomImageForEdit(item)} className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600">Editeaza</button>
                            <button onClick={() => void deleteRoomImage(item.id)} className="px-2 py-1 rounded bg-rose-700 hover:bg-rose-600">Sterge</button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 space-y-3">
                  <p className="font-medium">Editeaza metadate imagine camera</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input value={roomImageForm.title} onChange={(e) => setRoomImageForm((p) => ({ ...p, title: e.target.value }))} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" placeholder="Titlu" />
                    <input type="number" value={roomImageForm.sortOrder} onChange={(e) => setRoomImageForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" placeholder="Sort order" />
                    <textarea value={roomImageForm.description} onChange={(e) => setRoomImageForm((p) => ({ ...p, description: e.target.value }))} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm md:col-span-2 min-h-[82px]" placeholder="Descriere" />
                  </div>
                  <button onClick={() => void submitRoomImageEdit()} disabled={busy || !roomImageForm.id} className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-sm font-medium disabled:opacity-60">Salveaza imagine</button>
                </div>
              </section>
            )}

            {active === "gallery" && (
              <section className="space-y-5">
                <h2 className="text-xl font-semibold">Galerie</h2>

                <div className="flex items-center gap-3">
                  <label className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-sm font-medium cursor-pointer">
                    Upload imagini in galerie
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => void uploadGallery(e.target.files)} />
                  </label>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {gallery.map((item) => (
                    <article key={item.id} className="rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                      <div className="relative h-44 group cursor-pointer" onClick={() => setLightbox(item.image_url)}>
                        <Image src={item.thumbnail_url || item.image_url} alt={item.title_ro || "Gallery image"} fill className="object-cover" unoptimized />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div className="p-3 space-y-1">
                        <p className="font-medium">{item.title_ro || "Fara titlu"}</p>
                        <p className="text-xs text-slate-400">Sort: {item.sort_order} | {item.is_active === 1 ? "Activ" : "Inactiv"}</p>
                        <div className="flex gap-2 pt-1 text-sm">
                          <button onClick={() => openGalleryForEdit(item)} className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600">Editeaza</button>
                          <button onClick={() => void deleteGallery(item.id)} className="px-2 py-1 rounded bg-rose-700 hover:bg-rose-600">Sterge</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 space-y-3">
                  <p className="font-medium">Editeaza imagine galerie</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input value={galleryForm.titleRo} onChange={(e) => setGalleryForm((p) => ({ ...p, titleRo: e.target.value }))} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" placeholder="Titlu RO" />
                    <input value={galleryForm.titleEn} onChange={(e) => setGalleryForm((p) => ({ ...p, titleEn: e.target.value }))} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" placeholder="Title EN" />
                    <textarea value={galleryForm.descriptionRo} onChange={(e) => setGalleryForm((p) => ({ ...p, descriptionRo: e.target.value }))} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm min-h-[82px]" placeholder="Descriere RO" />
                    <textarea value={galleryForm.descriptionEn} onChange={(e) => setGalleryForm((p) => ({ ...p, descriptionEn: e.target.value }))} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm min-h-[82px]" placeholder="Description EN" />
                  </div>
                  <div className="flex gap-2">
                    <input type="number" value={galleryForm.sortOrder} onChange={(e) => setGalleryForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm w-40" placeholder="Sort" />
                    <button onClick={() => void submitGalleryEdit()} disabled={busy || !galleryForm.id} className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-sm font-medium disabled:opacity-60">Salveaza</button>
                  </div>
                </div>
              </section>
            )}

            {active === "reservations" && (
              <section className="space-y-5">
                <h2 className="text-xl font-semibold">Rezervari</h2>

                <div className="flex flex-wrap gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      value={reservationSearch}
                      onChange={(e) => setReservationSearch(e.target.value)}
                      placeholder="Cauta dupa nume, camera, ID..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm"
                    />
                  </div>
                  <select
                    value={reservationStatusFilter}
                    onChange={(e) => setReservationStatusFilter(e.target.value as typeof reservationStatusFilter)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">Toate statusurile</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <span className="text-sm text-slate-400 self-center">{filteredReservations.length} / {reservations.length}</span>
                </div>

                <div className="overflow-auto rounded-xl border border-slate-700">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800">
                      <tr>
                        <th className="text-left p-3">ID</th>
                        <th className="text-left p-3">Nume</th>
                        <th className="text-left p-3">Camera</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Creat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReservations.map((row) => (
                        <tr key={row.id} className="border-t border-slate-700">
                          <td className="p-3 font-mono text-xs text-slate-400">{row.id}</td>
                          <td className="p-3">{row.first_name} {row.last_name}</td>
                          <td className="p-3">{row.room}</td>
                          <td className="p-3">
                            <select
                              value={row.status}
                              onChange={(e) => void changeReservationStatus(row.id, e.target.value as ReservationRecord["status"])}
                              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1"
                            >
                              <option value="pending">pending</option>
                              <option value="confirmed">confirmed</option>
                              <option value="cancelled">cancelled</option>
                            </select>
                          </td>
                          <td className="p-3 text-slate-300">{formatDate(row.created_at)}</td>
                        </tr>
                      ))}
                      {filteredReservations.length === 0 && (
                        <tr><td colSpan={5} className="p-4 text-center text-slate-400 text-sm">Nicio rezervare gasita.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {active === "reviews" && (
              <section className="space-y-4">
                <div className="flex flex-wrap gap-3 items-center">
                  <h2 className="text-xl font-semibold">Review-uri</h2>
                  <div className="flex gap-2 ml-auto">
                    {(["all", "pending", "approved", "rejected"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setReviewStatusFilter(s)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium capitalize ${
                          reviewStatusFilter === s
                            ? "bg-cyan-600 text-white"
                            : "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        {s === "all" ? "Toate" : s}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-slate-400">{filteredReviews.length} / {reviews.length}</span>
                </div>

                <div className="grid gap-3">
                  {filteredReviews.map((review) => (
                    <article key={review.id} className="rounded-xl bg-slate-800 border border-slate-700 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{review.user_name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{Array.from({ length: 5 }, (_, i) => i < review.rating ? "★" : "☆").join("")}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          review.status === "approved" ? "bg-emerald-900 text-emerald-300" :
                          review.status === "rejected" ? "bg-rose-900 text-rose-300" :
                          "bg-amber-900 text-amber-300"
                        }`}>{review.status}</span>
                      </div>
                      <p className="text-sm text-slate-300 mt-2 leading-relaxed">{review.comment}</p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => void moderateReview(review.id, "approve")} className="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-sm">Aproba</button>
                        <button onClick={() => void moderateReview(review.id, "reject")} className="px-3 py-1.5 rounded bg-amber-700 hover:bg-amber-600 text-sm">Respinge</button>
                      </div>
                    </article>
                  ))}
                  {filteredReviews.length === 0 && (
                    <p className="text-slate-400 text-sm text-center py-4">Niciun review gasit.</p>
                  )}
                </div>
              </section>
            )}

            {active === "users" && (
              <section className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Utilizatori</h2>
                  {isSuperAdmin && (
                    <button
                      onClick={() => setUserForm((p) => ({ ...p, open: !p.open }))}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-sm font-medium"
                    >
                      <Plus size={15} />
                      {userForm.open ? "Inchide" : "Adauga utilizator"}
                    </button>
                  )}
                </div>

                {isSuperAdmin && userForm.open && (
                  <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 space-y-3">
                    <p className="font-medium">Utilizator nou</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        value={userForm.email}
                        onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))}
                        placeholder="Email"
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        type="password"
                        value={userForm.password}
                        onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))}
                        placeholder="Parola (minim 8 caractere)"
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                      />
                      <select
                        value={userForm.role}
                        onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value as AdminRole }))}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="super_admin">super_admin</option>
                        <option value="admin">admin</option>
                        <option value="editor">editor</option>
                      </select>
                    </div>
                    <button
                      onClick={() => void submitCreateUser()}
                      disabled={busy}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-sm font-medium disabled:opacity-60"
                    >
                      {busy && <Loader2 size={14} className="animate-spin" />}
                      Creeaza utilizator
                    </button>
                  </div>
                )}

                <div className="overflow-auto rounded-xl border border-slate-700">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800">
                      <tr>
                        <th className="text-left p-3">ID</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Rol</th>
                        <th className="text-left p-3">Activ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-t border-slate-700">
                          <td className="p-3">{u.id}</td>
                          <td className="p-3">{u.email}</td>
                          <td className="p-3 uppercase">{u.role}</td>
                          <td className="p-3">{u.is_active === 1 ? "Da" : "Nu"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {active === "invite-codes" && (
              <section className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Coduri invitatie</h2>
                  {isSuperAdmin && (
                    <button
                      onClick={() => setInviteForm((p) => ({ ...p, open: !p.open }))}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-sm font-medium"
                    >
                      <Plus size={15} />
                      {inviteForm.open ? "Inchide" : "Genereaza cod"}
                    </button>
                  )}
                </div>

                {isSuperAdmin && inviteForm.open && (
                  <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 space-y-3">
                    <p className="font-medium">Cod de invitatie nou</p>
                    <div className="flex gap-3 items-center">
                      <select
                        value={inviteForm.role}
                        onChange={(e) => setInviteForm((p) => ({ ...p, role: e.target.value as AdminRole }))}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="super_admin">super_admin</option>
                        <option value="admin">admin</option>
                        <option value="editor">editor</option>
                      </select>
                      <button
                        onClick={() => void submitCreateInviteCode()}
                        disabled={busy}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-sm font-medium disabled:opacity-60"
                      >
                        {busy && <Loader2 size={14} className="animate-spin" />}
                        Genereaza
                      </button>
                    </div>
                  </div>
                )}

                <div className="overflow-auto rounded-xl border border-slate-700">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800">
                      <tr>
                        <th className="text-left p-3">ID</th>
                        <th className="text-left p-3">Cod</th>
                        <th className="text-left p-3">Rol</th>
                        <th className="text-left p-3">Activ</th>
                        <th className="text-left p-3">Expira</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inviteCodes.map((row) => (
                        <tr key={row.id} className="border-t border-slate-700">
                          <td className="p-3">{row.id}</td>
                          <td className="p-3">{row.code}</td>
                          <td className="p-3 uppercase">{row.role}</td>
                          <td className="p-3">{row.is_active === 1 ? "Da" : "Nu"}</td>
                          <td className="p-3">{row.expires_at ? formatDate(row.expires_at) : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-slate-900/80 rounded-full p-2"
            onClick={() => setLightbox(null)}
          >
            <X size={22} />
          </button>
          <Image
            src={lightbox}
            alt="Preview"
            width={1600}
            height={1000}
            unoptimized
            className="max-h-[90vh] max-w-full rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
