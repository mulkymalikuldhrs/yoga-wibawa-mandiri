// ============================================================
// NotificationProvider — Context + state management for notifications
// Persists to localStorage, connects replies to AI, auto-generates smart notifications
// ============================================================

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import type { Notification, DashboardModule } from '@/types/dashboard';
import { KV_PREFIXES } from '@/types/dashboard';
import {
  getData,
  saveData,
  deleteData,
  generateId,
} from '@/lib/supabase-data';
import { chatWithAiStream } from '@/lib/ywm-ai';
import type { AiMessage } from '@/types/dashboard';

// ── Notification beep sound (Web Audio API) ──
function playNotificationBeep() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    // AudioContext not available
  }
}

// ── Browser push notification ──
function showBrowserNotification(title: string, body: string, url?: string) {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }

  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'ywm-notification',
    });

    notification.onclick = () => {
      window.focus();
      if (url) {
        window.location.href = url;
      }
      notification.close();
    };
  }
}

// ── Popup notification (ephemeral, shown in toast) ──
export interface PopupNotification extends Notification {
  popupId: string; // unique ID for the popup instance
  dismissed: boolean;
}

// ── Context shape ──
interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  popups: PopupNotification[];
  addNotification: (
    partial: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'dibaca'>
  ) => Notification;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  dismissPopup: (popupId: string) => void;
  replyToNotification: (
    notificationId: string,
    replyText: string
  ) => Promise<void>;
  replyLoading: Record<string, boolean>;
  centerOpen: boolean;
  setCenterOpen: (open: boolean) => void;
  navigateToModule?: (mod: DashboardModule) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return ctx;
}

// ── Welcome notifications to seed on first load (minimal) ──
const WELCOME_NOTIFICATIONS: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    judul: 'Selamat Datang di YWM Dashboard! 👋',
    pesan: 'Dashboard PT. Yoga Wibawa Mandiri siap digunakan. Anda akan menerima notifikasi otomatis untuk stok rendah, maintenance overdue, dan pelumasan terlewat.',
    tipe: 'info',
    dibaca: false,
    modul: 'overview',
    link: '/dashboard?module=overview',
  },
  {
    judul: 'Tips: Gunakan Asisten AI',
    pesan: 'Klik tombol chat di pojok kanan bawah untuk bertanya atau input data menggunakan bahasa natural. AI siap membantu operasional harian Anda.',
    tipe: 'sukses',
    dibaca: false,
    modul: 'overview',
    link: '/dashboard?module=overview',
  },
];

// ── Provider ──
interface NotificationProviderProps {
  children: React.ReactNode;
  navigateToModule?: (mod: DashboardModule) => void;
}

export function NotificationProvider({
  children,
  navigateToModule,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [popups, setPopups] = useState<PopupNotification[]>([]);
  const [replyLoading, setReplyLoading] = useState<Record<string, boolean>>({});
  const [centerOpen, setCenterOpen] = useState(false);
  const initializedRef = useRef(false);
  const autoTimerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // ── Load from localStorage on mount ──
  useEffect(() => {
    async function loadNotifications() {
      const items = await getData<Notification>(KV_PREFIXES.notification);
      items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNotifications(items);

      // Seed welcome notifications if empty
      if (items.length === 0 && !initializedRef.current) {
        initializedRef.current = true;
        const now = new Date().toISOString();
        const seeded: Notification[] = WELCOME_NOTIFICATIONS.map((s, i) => ({
          ...s,
          id: generateId(),
          createdAt: new Date(
            Date.now() - i * 3600_000
          ).toISOString(),
          updatedAt: now,
        }));
        seeded.forEach((n) => saveData(KV_PREFIXES.notification, n));
        setNotifications(seeded);

        // Show welcome popups on first load
        const unreadPopups = seeded
          .filter((n) => !n.dibaca)
          .slice(0, 2)
          .map((n) => ({
            ...n,
            popupId: `popup_${n.id}_${Date.now()}`,
            dismissed: false,
          }));
        setPopups(unreadPopups);
      } else if (items.length > 0 && !initializedRef.current) {
        initializedRef.current = true;
        // Show unread popups for existing notifications on first visit
        const unreadPopups = items
          .filter((n) => !n.dibaca)
          .slice(0, 3)
          .map((n) => ({
            ...n,
            popupId: `popup_${n.id}_${Date.now()}`,
            dismissed: false,
          }));
        setPopups(unreadPopups);
      }
    }
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.dibaca).length;

  // ── Reload from localStorage ──
  const reloadNotifications = useCallback(async () => {
    const items = await getData<Notification>(KV_PREFIXES.notification);
    items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setNotifications(items);
  }, []);

  // ── Add notification ──
  const addNotification = useCallback(
    (
      partial: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'dibaca'>
    ): Notification => {
      const now = new Date().toISOString();
      const notification: Notification = {
        ...partial,
        id: generateId(),
        dibaca: partial.dibaca ?? false,
        createdAt: now,
        updatedAt: now,
      };

      saveData(KV_PREFIXES.notification, notification);
      reloadNotifications();

      // Play notification beep sound
      playNotificationBeep();

      // Show browser push notification
      showBrowserNotification(notification.judul, notification.pesan, notification.link);

      // Add popup for new notification (max 3 visible)
      const popup: PopupNotification = {
        ...notification,
        popupId: `popup_${notification.id}_${Date.now()}`,
        dismissed: false,
      };

      setPopups((prev) => {
        const active = prev.filter((p) => !p.dismissed);
        if (active.length >= 3) {
          // Dismiss the oldest popup
          const oldest = active[0];
          if (oldest) {
            clearTimeout(autoTimerRef.current[oldest.popupId]);
            delete autoTimerRef.current[oldest.popupId];
          }
          return [
            ...prev.map((p) =>
              p.popupId === oldest?.popupId ? { ...p, dismissed: true } : p
            ),
            popup,
          ];
        }
        return [...prev, popup];
      });

      return notification;
    },
    [reloadNotifications]
  );

  // ── Mark as read ──
  const markAsRead = useCallback(
    (id: string) => {
      const notif = notifications.find((n) => n.id === id);
      if (notif && !notif.dibaca) {
        saveData(KV_PREFIXES.notification, { ...notif, dibaca: true });
        reloadNotifications();
      }
    },
    [notifications, reloadNotifications]
  );

  // ── Mark all as read ──
  const markAllRead = useCallback(() => {
    notifications
      .filter((n) => !n.dibaca)
      .forEach((n) => {
        saveData(KV_PREFIXES.notification, { ...n, dibaca: true });
      });
    reloadNotifications();
  }, [notifications, reloadNotifications]);

  // ── Delete notification ──
  const deleteNotification = useCallback(
    (id: string) => {
      deleteData(KV_PREFIXES.notification, id);
      setPopups((prev) => prev.filter((p) => p.id !== id));
      reloadNotifications();
    },
    [reloadNotifications]
  );

  // ── Clear all ──
  const clearAll = useCallback(() => {
    notifications.forEach((n) => {
      deleteData(KV_PREFIXES.notification, n.id);
    });
    setPopups([]);
    Object.values(autoTimerRef.current).forEach(clearTimeout);
    autoTimerRef.current = {};
    reloadNotifications();
  }, [notifications, reloadNotifications]);

  // ── Dismiss popup ──
  const dismissPopup = useCallback((popupId: string) => {
    clearTimeout(autoTimerRef.current[popupId]);
    delete autoTimerRef.current[popupId];
    setPopups((prev) =>
      prev.map((p) =>
        p.popupId === popupId ? { ...p, dismissed: true } : p
      )
    );
  }, []);

  // ── Reply to notification (sends to AI) ──
  const replyToNotification = useCallback(
    async (notificationId: string, replyText: string) => {
      const notif = notifications.find((n) => n.id === notificationId);
      if (!notif || !replyText.trim()) return;

      setReplyLoading((prev) => ({ ...prev, [notificationId]: true }));

      // Mark as read when replying
      if (!notif.dibaca) {
        saveData(KV_PREFIXES.notification, { ...notif, dibaca: true });
        reloadNotifications();
      }

      try {
        const systemMessage: AiMessage = {
          id: 'system_notif_reply',
          role: 'system',
          content: `Kamu adalah asisten AI untuk YWM Dashboard (PT. Yoga Wibawa Mandiri). Pengguna sedang membalas notifikasi berikut:\n\nJudul: ${notif.judul}\nPesan: ${notif.pesan}\nTipe: ${notif.tipe}\nModul: ${notif.modul}\n\nBalas pertanyaan atau komentar pengguna terkait notifikasi ini secara informatif dan membantu dalam Bahasa Indonesia.`,
          timestamp: new Date().toISOString(),
        };

        const userMessage: AiMessage = {
          id: generateId(),
          role: 'user',
          content: replyText.trim(),
          timestamp: new Date().toISOString(),
        };

        let aiResponse = '';

        await chatWithAiStream(
          [systemMessage, userMessage],
          (chunk) => {
            aiResponse += chunk;
          },
          () => {
            // AI response complete — create a new notification with AI reply
            if (aiResponse) {
              const replyNotif: Omit<
                Notification,
                'id' | 'createdAt' | 'updatedAt' | 'dibaca'
              > = {
                judul: `Balasan AI: ${notif.judul}`,
                pesan:
                  aiResponse.length > 200
                    ? aiResponse.slice(0, 200) + '...'
                    : aiResponse,
                tipe: 'info',
                modul: notif.modul,
                link: notif.link,
              };

              // Use a timeout to avoid state update during render
              setTimeout(() => {
                addNotification(replyNotif);
              }, 100);
            }
            setReplyLoading((prev) => ({
              ...prev,
              [notificationId]: false,
            }));
          },
          (error) => {
            console.error('AI reply error:', error);
            setReplyLoading((prev) => ({
              ...prev,
              [notificationId]: false,
            }));
          }
        );
      } catch {
        setReplyLoading((prev) => ({ ...prev, [notificationId]: false }));
      }
    },
    [notifications, reloadNotifications, addNotification]
  );

  // ── Clean up dismissed popups periodically ──
  useEffect(() => {
    const interval = setInterval(() => {
      setPopups((prev) => {
        const active = prev.filter((p) => !p.dismissed);
        if (active.length < prev.length) {
          return active;
        }
        return prev;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ── Auto-generate smart notifications (check every 60s) ──
  useEffect(() => {
    const checkSmartNotifications = async () => {
      // Check for low stock items
      const spareParts = await getData<{ id: string; nama: string; kode: string; stok: number; stokMinimum: number }>(KV_PREFIXES.sparePart);

      const existingNotifs = await getData<Notification>(KV_PREFIXES.notification);

      spareParts.forEach((part) => {
        if (part.stok <= part.stokMinimum) {
          const existingAlert = existingNotifs.find(
            (n) =>
              n.modul === 'spare-parts' &&
              n.judul.includes(part.nama) &&
              n.tipe === 'bahaya' &&
              // Only if alert is less than 1 hour old
              Date.now() - new Date(n.createdAt).getTime() < 3600_000
          );

          if (!existingAlert) {
            // Check if there's any recent alert for this part (even if older)
            const anyRecentAlert = existingNotifs.find(
              (n) =>
                n.modul === 'spare-parts' &&
                n.judul.includes(part.nama) &&
                Date.now() - new Date(n.createdAt).getTime() < 7200_000 // 2 hours
            );

            if (!anyRecentAlert) {
              addNotification({
                judul: `Stok ${part.nama} di bawah minimum!`,
                pesan: `${part.nama} (${part.kode}) stok saat ini ${part.stok} pcs, minimum ${part.stokMinimum} pcs. Segera lakukan pemesanan ulang.`,
                tipe: part.stok <= part.stokMinimum / 2 ? 'bahaya' : 'peringatan',
                modul: 'spare-parts',
                link: '/dashboard?module=spare-parts',
              });
            }
          }
        }
      });

      // Check for overdue maintenance
      const maintenanceRecords = await getData<{ id: string; judul: string; status: string; prioritas: string; tanggalMulai: string }>(KV_PREFIXES.maintenance);

      maintenanceRecords.forEach((rec) => {
        if (
          rec.status === 'berjalan' &&
          rec.prioritas === 'kritis'
        ) {
          const daysSinceStart = Math.floor(
            (Date.now() - new Date(rec.tanggalMulai).getTime()) /
              (1000 * 60 * 60 * 24)
          );

          if (daysSinceStart >= 2) {
            const existingAlert = existingNotifs.find(
              (n) =>
                n.modul === 'maintenance' &&
                n.judul.includes(rec.judul) &&
                Date.now() - new Date(n.createdAt).getTime() < 7200_000
            );

            if (!existingAlert) {
              addNotification({
                judul: `Work Order "${rec.judul}" overdue ${daysSinceStart} hari`,
                pesan: `Work Order "${rec.judul}" sudah berjalan ${daysSinceStart} hari tanpa selesai. Prioritas: KRITIS. Segera tindak lanjuti.`,
                tipe: 'bahaya',
                modul: 'maintenance',
                link: '/dashboard?module=maintenance',
              });
            }
          }
        }
      });

      // Check for overdue Pispot (pelumasan terlewat)
      const pispotRecords = await getData<{ id: string; namaPeralatan: string; kodePeralatan: string; status: string; kondisi: string; bulan: string }>(KV_PREFIXES.pispot);

      pispotRecords.forEach((rec) => {
        if (rec.status === 'terlewat') {
          const existingAlert = existingNotifs.find(
            (n) =>
              n.modul === 'pispot' &&
              n.judul.includes(rec.namaPeralatan) &&
              Date.now() - new Date(n.createdAt).getTime() < 7200_000
          );

          if (!existingAlert) {
            addNotification({
              judul: `Pelumasan ${rec.namaPeralatan} terlewat`,
              pesan: `Pelumasan ${rec.namaPeralatan} (${rec.kodePeralatan}) bulan ${rec.bulan} terlewat. Kondisi: ${rec.kondisi}. Segera lakukan pelumasan.`,
              tipe: rec.kondisi === 'rusak' ? 'bahaya' : 'peringatan',
              modul: 'pispot',
              link: '/dashboard?module=pispot',
            });
          }
        }
      });
    };

    // Run once after a short delay, then every 60 seconds
    const initialTimer = setTimeout(checkSmartNotifications, 3000);
    const interval = setInterval(checkSmartNotifications, 60000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [addNotification]);

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    popups,
    addNotification,
    markAsRead,
    markAllRead,
    deleteNotification,
    clearAll,
    dismissPopup,
    replyToNotification,
    replyLoading,
    centerOpen,
    setCenterOpen,
    navigateToModule,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
