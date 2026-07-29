import fs from "fs/promises";
import path from "path";
import { mirrorReservationToDb } from "@/lib/content-db";

export interface ReservationInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  room: string;
  roomId?: number | null;
  roomSlug?: string;
  roomName?: string;
  roomPricePerNight?: number | null;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  message: string;
}

export interface Reservation extends ReservationInput {
  id: string;
  createdAt: string;
  guestCount: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notificationStatus: "pending" | "partial" | "sent";
  hasReview?: boolean;
}

const RESERVATIONS_FILE = path.join(process.cwd(), "data", "reservations.json");

async function ensureStorageDir() {
  await fs.mkdir(path.dirname(RESERVATIONS_FILE), { recursive: true });
}

async function readReservationsUnsafe(): Promise<Reservation[]> {
  const data = await fs.readFile(RESERVATIONS_FILE, "utf-8");
  const parsed = JSON.parse(data);
  return Array.isArray(parsed) ? (parsed as Reservation[]) : [];
}

export async function readReservations(): Promise<Reservation[]> {
  await ensureStorageDir();
  try {
    return await readReservationsUnsafe();
  } catch {
    return [];
  }
}

export async function saveReservations(reservations: Reservation[]) {
  await ensureStorageDir();
  await fs.writeFile(RESERVATIONS_FILE, JSON.stringify(reservations, null, 2));
}

export function buildReservationId() {
  const randomSuffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `SA-${Date.now()}-${randomSuffix}`;
}

export async function createReservation(input: ReservationInput): Promise<Reservation> {
  const reservations = await readReservations();
  const guestCount = Math.max(1, Number(input.adults || 0) + Number(input.children || 0));

  const reservation: Reservation = {
    id: buildReservationId(),
    createdAt: new Date().toISOString(),
    status: "pending",
    notificationStatus: "pending",
    guestCount,
    ...input,
    room: input.roomName || input.room,
  };

  reservations.push(reservation);
  await saveReservations(reservations);
  await mirrorReservationToDb({
    id: reservation.id,
    firstName: reservation.firstName,
    lastName: reservation.lastName,
    email: reservation.email,
    phone: reservation.phone,
    room: reservation.room,
    roomId: reservation.roomId,
    roomSlug: reservation.roomSlug,
    roomName: reservation.roomName || reservation.room,
    roomPricePerNight: reservation.roomPricePerNight ?? null,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    adults: reservation.adults,
    children: reservation.children,
    guestCount: reservation.guestCount,
    message: reservation.message,
    status: reservation.status,
    notificationStatus: reservation.notificationStatus,
    createdAt: reservation.createdAt,
    hasReview: reservation.hasReview,
  });

  return reservation;
}

export async function updateReservationNotificationStatus(
  reservationId: string,
  notificationStatus: Reservation["notificationStatus"]
) {
  const reservations = await readReservations();
  const target = reservations.find((reservation) => reservation.id === reservationId) || null;
  const updatedReservation: Reservation | null = target
    ? { ...target, notificationStatus }
    : null;

  const updated = reservations.map((reservation) =>
    reservation.id === reservationId && updatedReservation
      ? updatedReservation
      : reservation
  );
  await saveReservations(updated);

  if (updatedReservation) {
    await mirrorReservationToDb({
      id: updatedReservation.id,
      firstName: updatedReservation.firstName,
      lastName: updatedReservation.lastName,
      email: updatedReservation.email,
      phone: updatedReservation.phone,
      room: updatedReservation.room,
      roomId: updatedReservation.roomId,
      roomSlug: updatedReservation.roomSlug,
      roomName: updatedReservation.roomName || updatedReservation.room,
      roomPricePerNight: updatedReservation.roomPricePerNight ?? null,
      checkIn: updatedReservation.checkIn,
      checkOut: updatedReservation.checkOut,
      adults: updatedReservation.adults,
      children: updatedReservation.children,
      guestCount: updatedReservation.guestCount,
      message: updatedReservation.message,
      status: updatedReservation.status,
      notificationStatus: updatedReservation.notificationStatus,
      createdAt: updatedReservation.createdAt,
      hasReview: updatedReservation.hasReview,
    });
  }
}

export async function findReservationById(reservationId: string) {
  const reservations = await readReservations();
  return reservations.find((reservation) => reservation.id === reservationId) || null;
}

export async function getRecentReservations(limit = 10) {
  const reservations = await readReservations();
  return reservations
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
