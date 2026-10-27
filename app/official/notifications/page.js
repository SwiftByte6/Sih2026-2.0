"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, SectionHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getNotifications, formatDate } from "@/lib/dataService";

export default function OfficialNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      // BACKEND INTEGRATION:
      // supabase.from('notifications').select('*').eq('recipient_user_id', auth.uid()).order('scheduled_for', { ascending: false })
      const data = await getNotifications();
      setNotifications(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleMarkAsRead = (id) => {
    // BACKEND INTEGRATION:
    // supabase.from('notifications').update({ read_at: new Date(), status: 'READ' }).eq('id', id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <AppShell
      role="official"
      breadcrumbs={[
        { label: "Dashboard", href: "/official/dashboard" },
        { label: "Official Notifications" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Official Notifications & Alerts
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Automated notifications for maturity thresholds, verification tasks, and clearance events.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
            Mark All as Read
          </Button>
        </div>

        <Card className="p-5">
          <SectionHeader
            title="Notification Center"
            description="System messages dispatched to your official review account"
          />

          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  notif.is_read
                    ? "bg-white border-slate-200"
                    : "bg-blue-50/40 border-blue-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      notif.is_read
                        ? "bg-slate-100 text-slate-500"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">
                        {notif.title}
                      </h4>
                      {!notif.is_read && (
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {notif.body}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-1.5 block">
                      {formatDate(notif.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {!notif.is_read && (
                    <Button
                      variant="tertiary"
                      size="sm"
                      onClick={() => handleMarkAsRead(notif.id)}
                    >
                      Mark Read
                    </Button>
                  )}
                  {notif.link && (
                    <Link href={notif.link}>
                      <Button variant="secondary" size="sm">
                        View Item →
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
