// Helpers para notificação local de agendamentos próximos.
// Persistimos em localStorage e re-agendamos a cada load.

const STORAGE_KEY = "studio-mariano-appointments";
const REMIND_MINUTES_BEFORE = 30;

export type StoredAppointment = {
  id: string;
  cliente: string;
  profissional: string;
  servico: string;
  // ISO datetime string
  quando: string;
};

export function loadAppointments(): StoredAppointment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredAppointment[];
  } catch {
    return [];
  }
}

function save(list: StoredAppointment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function ensurePermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const res = await Notification.requestPermission();
  return res === "granted";
}

const timers = new Map<string, number>();

function scheduleOne(appt: StoredAppointment) {
  if (timers.has(appt.id)) {
    window.clearTimeout(timers.get(appt.id));
    timers.delete(appt.id);
  }
  const when = new Date(appt.quando).getTime();
  const remindAt = when - REMIND_MINUTES_BEFORE * 60_000;
  const delay = remindAt - Date.now();
  if (delay <= 0 || delay > 2_147_000_000) return; // ignora passado ou >24d
  const handle = window.setTimeout(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Studio Mariano — Lembrete de agendamento", {
        body: `${appt.cliente}, seu horário com ${appt.profissional} (${appt.servico}) é em ${REMIND_MINUTES_BEFORE} minutos.`,
        icon: "/favicon.ico",
      });
    }
  }, delay);
  timers.set(appt.id, handle);
}

export function addAppointment(appt: StoredAppointment) {
  const list = loadAppointments().filter((a) => a.id !== appt.id);
  list.push(appt);
  // Limpa passados
  const now = Date.now();
  const fresh = list.filter((a) => new Date(a.quando).getTime() > now);
  save(fresh);
  scheduleOne(appt);
}

export function rescheduleAll() {
  if (typeof window === "undefined") return;
  const list = loadAppointments();
  const now = Date.now();
  const fresh = list.filter((a) => new Date(a.quando).getTime() > now);
  if (fresh.length !== list.length) save(fresh);
  fresh.forEach(scheduleOne);
}
