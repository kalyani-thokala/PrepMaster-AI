import React, { useState, useEffect } from "react";
import apiClient from "../../services/api.js";
import toast from "react-hot-toast";
import { FiBell, FiCheck, FiTrash2, FiInfo, FiCalendar, FiAward } from "react-icons/fi";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/notifications?page=${page}&limit=10`);
      setNotifications(response.data.data.notifications);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const handleMarkAsRead = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      // Update local state to show read
      setNotifications((current) =>
        current.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      toast.success("Notification marked as read");
    } catch (err) {
      toast.error("Failed to update notification");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (notifications.filter((n) => !n.isRead).length === 0) {
      return toast.error("All notifications are already marked as read");
    }

    try {
      await apiClient.put("/notifications/read-all");
      setNotifications((current) =>
        current.map((n) => ({ ...n, isRead: true }))
      );
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error("Failed to update notifications");
    }
  };

  // Helper to resolve icon style based on notification subject/title
  const getNotificationIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes("interview") || t.includes("schedule")) {
      return { icon: FiCalendar, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" };
    } else if (t.includes("achievement") || t.includes("badge") || t.includes("unlocked")) {
      return { icon: FiAward, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
    } else if (t.includes("challenge") || t.includes("assessment") || t.includes("code")) {
      return { icon: FiInfo, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
    }
    return { icon: FiBell, color: "text-primary bg-primary/10 border-primary/20" };
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-darkBorder/60 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-white Outfit flex items-center gap-2.5">
            <FiBell className="text-primary" /> Notifications Inbox
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Track mock test timelines, interview updates, and badge achievements.
          </p>
        </div>
        <button
          onClick={handleMarkAllAsRead}
          disabled={loading || notifications.length === 0}
          className="px-4.5 py-2.5 bg-[#0b0f19] border border-darkBorder hover:border-primary text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <FiCheck /> Mark All Read
        </button>
      </div>

      {/* NOTIFICATIONS LIST CONTAINER */}
      <div className="glass-panel p-6 min-h-[400px] flex flex-col justify-between">
        <div className="space-y-4 flex-1">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Syncing notifications...</div>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((n) => {
                const config = getNotificationIcon(n.title);
                const Icon = config.icon;
                return (
                  <div
                    key={n._id}
                    className={`flex items-start justify-between gap-4 p-4.5 rounded-2xl border transition-all ${
                      n.isRead
                        ? "bg-[#0b0f19]/30 border-darkBorder/55 opacity-70"
                        : "bg-primary/5 border-primary/20 shadow-glow"
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Sub-icon container */}
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 text-base ${config.color}`}>
                        <Icon size={16} />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-xs font-bold ${n.isRead ? "text-slate-300" : "text-white"}`}>
                            {n.title}
                          </h4>
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">{n.message}</p>
                        <span className="text-[10px] text-slate-500 block font-sans">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(n._id)}
                        className="text-slate-400 hover:text-primary p-1.5 hover:bg-card/50 rounded-lg transition-colors flex-shrink-0"
                        title="Mark as Read"
                      >
                        <FiCheck size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 py-16">
              <FiBell size={48} className="mb-3 text-slate-600" />
              <h4 className="text-sm font-semibold text-slate-400">All caught up!</h4>
              <p className="text-xs max-w-xs mt-1">There are no new placement alerts or achievements notifications logged.</p>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center border-t border-darkBorder/60 pt-4 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 border border-darkBorder rounded-xl text-xs text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 border border-darkBorder rounded-xl text-xs text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}

      </div>

    </div>
  );
};

export default Notifications;
