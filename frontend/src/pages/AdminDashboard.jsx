import React, { useEffect, useMemo, useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, formatApiError } from "../lib/api";
import { Toaster, toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  LogOut, Plus, Pencil, Trash2, Save, X, Coffee, Star, Mail, Home as HomeIcon,
  LayoutDashboard, Search, Filter, ImageIcon, CheckCircle2, XCircle, Eye, EyeOff,
  TrendingUp, Inbox, Bookmark, Loader2,
} from "lucide-react";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "menu", label: "Menu", icon: Coffee },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "homepage", label: "Homepage", icon: HomeIcon },
  { id: "contacts", label: "Inbox", icon: Mail },
];

const CATEGORIES = ["Burgers", "Pasta", "Coffee", "Drinks", "Desserts"];
const EMPTY_MENU = { name: "", category: "Burgers", price: 0, description: "", image: "", is_popular: false };
const EMPTY_REVIEW = { name: "", rating: 5, comment: "", is_featured: false, is_approved: true };

export default function AdminDashboard() {
  const { user, checking, logout } = useAuth();
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  const loadStats = async () => {
    try {
      const { data } = await api.get("/admin/stats");
      setStats(data);
    } catch { /* ignore */ }
  };
  useEffect(() => { if (user) loadStats(); }, [user, tab]);

  if (checking) return null;
  if (!user) return <Navigate to="/admin/login" replace />;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF]" data-testid="admin-dashboard">
      <Toaster richColors position="top-center" />
      {/* Topbar */}
      <header className="sticky top-0 z-30 bg-cafe-snow/90 backdrop-blur border-b border-cafe-line">
        <div className="px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-cafe-espresso text-cafe-paper">
              <Coffee className="w-5 h-5" />
            </span>
            <div className="leading-tight">
              <div className="font-serif text-lg text-cafe-ink">Coffee Cafe 9</div>
              <div className="text-[11px] uppercase tracking-widest text-cafe-muted">Content Manager</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-2 text-xs text-cafe-muted bg-cafe-cream px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {user.email}
            </span>
            <Link to="/" className="text-sm text-cafe-muted hover:text-cafe-espresso transition-colors hidden md:inline">View site →</Link>
            <button onClick={handleLogout} className="btn-outline !py-2 !px-4 text-xs" data-testid="admin-logout">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[260px_1fr] min-h-[calc(100vh-65px)]">
        {/* Sidebar */}
        <aside className="bg-cafe-snow border-r border-cafe-line p-4 lg:p-5 lg:sticky lg:top-[65px] lg:h-[calc(100vh-65px)] overflow-y-auto">
          <div className="text-[10px] uppercase tracking-[0.18em] text-cafe-muted px-3 py-2">Workspace</div>
          <nav className="space-y-1">
            {TABS.map((t) => {
              const badge =
                t.id === "reviews" ? stats?.pending_reviews :
                t.id === "contacts" ? stats?.unread_contacts : 0;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  data-testid={`admin-tab-${t.id}`}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                    tab === t.id
                      ? "bg-cafe-espresso text-cafe-paper shadow-sm"
                      : "text-cafe-ink hover:bg-cafe-cream"
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{t.label}</span>
                  {badge ? (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      tab === t.id ? "bg-cafe-paper/20 text-cafe-paper" : "bg-cafe-terracotta text-cafe-paper"
                    }`}>
                      {badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
          <div className="mt-8 text-[10px] uppercase tracking-[0.18em] text-cafe-muted px-3 py-2">Quick links</div>
          <div className="space-y-1">
            <Link to="/menu" target="_blank" className="block px-3.5 py-2 rounded-xl text-sm text-cafe-muted hover:bg-cafe-cream hover:text-cafe-ink">↗ Public menu</Link>
            <Link to="/reviews" target="_blank" className="block px-3.5 py-2 rounded-xl text-sm text-cafe-muted hover:bg-cafe-cream hover:text-cafe-ink">↗ Public reviews</Link>
          </div>
        </aside>

        <main className="p-6 lg:p-10 max-w-6xl">
          {tab === "dashboard" && <DashboardOverview stats={stats} onJump={setTab} />}
          {tab === "menu" && <MenuAdmin onChange={loadStats} />}
          {tab === "reviews" && <ReviewsAdmin onChange={loadStats} />}
          {tab === "homepage" && <HomepageAdmin />}
          {tab === "contacts" && <ContactsAdmin onChange={loadStats} />}
        </main>
      </div>
    </div>
  );
}

/* ---------- Dashboard Overview ---------- */
function DashboardOverview({ stats, onJump }) {
  if (!stats) {
    return (
      <div className="flex items-center justify-center py-24 text-cafe-muted">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading dashboard...
      </div>
    );
  }
  const cards = [
    { id: "menu", label: "Menu items", value: stats.menu_count, icon: Coffee, accent: "bg-amber-100 text-amber-700", sub: `${stats.popular_count} marked popular` },
    { id: "reviews", label: "Reviews", value: stats.reviews_count, icon: Star, accent: "bg-rose-100 text-rose-700", sub: `${stats.pending_reviews || 0} pending approval` },
    { id: "contacts", label: "Inbox", value: stats.contacts_count, icon: Inbox, accent: "bg-emerald-100 text-emerald-700", sub: `${stats.unread_contacts || 0} unread` },
    { id: "homepage", label: "Homepage", value: "Live", icon: TrendingUp, accent: "bg-sky-100 text-sky-700", sub: "Click to edit content" },
  ];
  return (
    <section data-testid="admin-dashboard-overview">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-cafe-ink">Welcome back ☕</h2>
          <p className="text-sm text-cafe-muted mt-1">A quick look at your cafe content today.</p>
        </div>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <button
            key={c.id}
            onClick={() => onJump(c.id)}
            data-testid={`stat-card-${c.id}`}
            className="text-left bg-cafe-snow border border-cafe-line rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-md transition-all"
          >
            <div className={`w-10 h-10 grid place-items-center rounded-xl ${c.accent}`}>
              <c.icon className="w-5 h-5" />
            </div>
            <div className="mt-4 text-3xl font-serif text-cafe-ink">{c.value}</div>
            <div className="text-xs uppercase tracking-widest text-cafe-muted mt-1">{c.label}</div>
            <div className="text-xs text-cafe-muted mt-2">{c.sub}</div>
          </button>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-5">
        {/* Recent contacts */}
        <div className="lg:col-span-2 bg-cafe-snow border border-cafe-line rounded-2xl p-6" data-testid="dashboard-recent-contacts">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-xl text-cafe-ink">Recent messages</h3>
            <button className="text-xs text-cafe-espresso hover:underline" onClick={() => onJump("contacts")}>View all →</button>
          </div>
          <div className="space-y-3">
            {(stats.recent_contacts || []).length === 0 && (
              <p className="text-sm text-cafe-muted py-6 text-center">No messages yet.</p>
            )}
            {(stats.recent_contacts || []).map((c) => (
              <div key={c.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-cafe-cream/50 transition-colors">
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${c.is_read ? "bg-cafe-line" : "bg-cafe-terracotta"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-cafe-ink">{c.name}</span>
                    <span className="text-cafe-muted text-xs">· {c.email}</span>
                    <span className="text-[11px] text-cafe-muted ml-auto whitespace-nowrap">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-cafe-muted line-clamp-2 mt-1">{c.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Menu by category */}
        <div className="bg-cafe-snow border border-cafe-line rounded-2xl p-6">
          <h3 className="font-serif text-xl text-cafe-ink">Menu by category</h3>
          <div className="mt-4 space-y-3">
            {Object.entries(stats.menu_by_category || {}).map(([cat, n]) => {
              const total = stats.menu_count || 1;
              const pct = Math.round((n / total) * 100);
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-cafe-ink">{cat}</span>
                    <span className="text-cafe-muted">{n}</span>
                  </div>
                  <div className="mt-1 h-2 bg-cafe-cream rounded-full overflow-hidden">
                    <div className="h-full bg-cafe-espresso rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {(!stats.menu_by_category || Object.keys(stats.menu_by_category).length === 0) && (
              <p className="text-sm text-cafe-muted">No items yet.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Confirm Dialog ---------- */
function ConfirmDialog({ open, onOpenChange, title, description, onConfirm, confirmLabel = "Delete", danger = true, testId }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid={testId} className="bg-cafe-snow border-cafe-line">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-2xl text-cafe-ink">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-cafe-muted">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full" data-testid="confirm-cancel">Cancel</AlertDialogCancel>
          <AlertDialogAction
            data-testid="confirm-action"
            onClick={onConfirm}
            className={`rounded-full ${danger ? "bg-red-700 hover:bg-red-800" : "bg-cafe-espresso hover:bg-cafe-espressoDark"} text-white`}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ---------- Menu Admin ---------- */
function MenuAdmin({ onChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // id or "new"
  const [form, setForm] = useState(EMPTY_MENU);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [confirm, setConfirm] = useState(null); // {id, name}

  const load = async () => {
    setLoading(true);
    const { data } = await api.get("/menu");
    setItems(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const okCat = filter === "All" || it.category === filter;
      const okQ = !query || it.name.toLowerCase().includes(query.toLowerCase());
      return okCat && okQ;
    });
  }, [items, filter, query]);

  const startNew = () => { setEditing("new"); setForm(EMPTY_MENU); };
  const startEdit = (it) => {
    setEditing(it.id);
    setForm({
      name: it.name, category: it.category, price: it.price,
      description: it.description || "", image: it.image || "",
      is_popular: !!it.is_popular,
    });
  };
  const cancel = () => { setEditing(null); setForm(EMPTY_MENU); };
  const save = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editing === "new") await api.post("/menu", payload);
      else await api.put(`/menu/${editing}`, payload);
      toast.success(editing === "new" ? "Item added" : "Saved changes");
      cancel();
      load();
      onChange?.();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Save failed");
    }
  };
  const togglePopular = async (it) => {
    try {
      await api.put(`/menu/${it.id}`, { ...it, is_popular: !it.is_popular });
      toast.success(it.is_popular ? "Removed from popular" : "Marked as popular");
      load();
      onChange?.();
    } catch (e) {
      toast.error("Update failed");
    }
  };
  const doDelete = async () => {
    if (!confirm) return;
    try {
      await api.delete(`/menu/${confirm.id}`);
      toast.success(`Deleted "${confirm.name}"`);
      setConfirm(null);
      load();
      onChange?.();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <section data-testid="admin-menu-section">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="font-serif text-3xl text-cafe-ink">Menu items</h2>
          <p className="text-sm text-cafe-muted mt-1">{items.length} total · {items.filter(i => i.is_popular).length} popular</p>
        </div>
        <button onClick={startNew} className="btn-primary" data-testid="admin-menu-new">
          <Plus className="w-4 h-4" /> New item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-cafe-snow border border-cafe-line rounded-2xl p-3 mb-4 flex items-center gap-2 flex-wrap" data-testid="admin-menu-filters">
        <div className="flex items-center gap-2 px-3 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-cafe-muted" />
          <input
            placeholder="Search menu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1 py-2"
            data-testid="admin-menu-search"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <Filter className="w-4 h-4 text-cafe-muted mx-2" />
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              data-testid={`admin-menu-filter-${c.toLowerCase()}`}
              className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                filter === c ? "bg-cafe-espresso text-cafe-paper" : "bg-cafe-cream text-cafe-ink hover:bg-cafe-cream/70"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {editing && (
        <div className="bg-cafe-snow border border-cafe-line rounded-2xl p-6 mb-6 grid md:grid-cols-[1fr_200px] gap-6" data-testid="admin-menu-form">
          <div className="grid sm:grid-cols-2 gap-4">
            <input className="input-cafe" placeholder="Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="admin-menu-name" />
            <select className="input-cafe" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })} data-testid="admin-menu-category">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input type="number" className="input-cafe" placeholder="Price ₹" value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })} data-testid="admin-menu-price" />
            <input className="input-cafe" placeholder="Image URL" value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })} data-testid="admin-menu-image" />
            <textarea rows={3} className="input-cafe sm:col-span-2" placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="admin-menu-description" />
            <label className="flex items-center gap-2 text-sm text-cafe-ink sm:col-span-2 cursor-pointer">
              <input type="checkbox" checked={form.is_popular}
                onChange={(e) => setForm({ ...form, is_popular: e.target.checked })} data-testid="admin-menu-popular" />
              Mark as popular (shows on homepage)
            </label>
            <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
              <button onClick={cancel} className="btn-outline" data-testid="admin-menu-cancel"><X className="w-4 h-4" /> Cancel</button>
              <button onClick={save} className="btn-primary" data-testid="admin-menu-save"><Save className="w-4 h-4" /> Save</button>
            </div>
          </div>
          {/* Live image preview */}
          <div className="flex flex-col items-center" data-testid="admin-menu-image-preview">
            <div className="text-[10px] uppercase tracking-widest text-cafe-muted mb-2">Preview</div>
            <div className="w-full aspect-square rounded-xl bg-cafe-cream border border-cafe-line overflow-hidden grid place-items-center">
              {form.image ? (
                <img src={form.image} alt="preview" className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }} />
              ) : (
                <div className="text-cafe-muted flex flex-col items-center gap-2 text-xs">
                  <ImageIcon className="w-6 h-6" />
                  Paste an image URL
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-cafe-snow border border-cafe-line rounded-xl p-4 flex items-center gap-4 animate-pulse">
              <div className="w-16 h-16 rounded-lg bg-cafe-cream" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 bg-cafe-cream rounded" />
                <div className="h-3 w-2/3 bg-cafe-cream rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-cafe-snow border border-cafe-line rounded-2xl p-10 text-center text-cafe-muted">
          No items match your filters.
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((it) => (
            <div key={it.id} className="bg-cafe-snow border border-cafe-line rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow" data-testid={`admin-menu-row-${it.id}`}>
              <div className="w-16 h-16 rounded-lg bg-cafe-cream overflow-hidden shrink-0 grid place-items-center">
                {it.image ? <img src={it.image} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-cafe-muted" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-serif text-lg text-cafe-ink">{it.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cafe-cream text-cafe-espresso">{it.category}</span>
                  {it.is_popular && <span className="text-[10px] uppercase tracking-widest bg-cafe-terracotta/20 text-cafe-terracotta px-2 py-0.5 rounded-full">Popular</span>}
                </div>
                <p className="text-xs text-cafe-muted line-clamp-1 mt-1">{it.description}</p>
              </div>
              <div className="font-medium text-cafe-espresso">₹{Math.round(it.price)}</div>
              <button
                onClick={() => togglePopular(it)}
                className={`p-2 rounded-lg transition-colors ${it.is_popular ? "text-cafe-terracotta hover:bg-cafe-terracotta/10" : "text-cafe-muted hover:bg-cafe-cream"}`}
                title={it.is_popular ? "Unfeature from homepage" : "Mark popular"}
                data-testid={`admin-menu-toggle-popular-${it.id}`}
              >
                <Bookmark className={`w-4 h-4 ${it.is_popular ? "fill-cafe-terracotta" : ""}`} />
              </button>
              <button onClick={() => startEdit(it)} className="p-2 rounded-lg hover:bg-cafe-cream" data-testid={`admin-menu-edit-${it.id}`}><Pencil className="w-4 h-4" /></button>
              <button onClick={() => setConfirm({ id: it.id, name: it.name })} className="p-2 rounded-lg hover:bg-red-50 text-red-700" data-testid={`admin-menu-delete-${it.id}`}><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(v) => !v && setConfirm(null)}
        title="Delete this menu item?"
        description={confirm ? `"${confirm.name}" will be permanently removed from the menu. This cannot be undone.` : ""}
        onConfirm={doDelete}
        testId="admin-menu-confirm-delete"
      />

      <style>{`.input-cafe{ background:#FAF8F5;border:1px solid #E8E0D9;border-radius:.75rem;padding:.7rem 1rem;outline:none;width:100%;transition:border-color .2s; }
        .input-cafe:focus{ border-color:#5C4033; }`}</style>
    </section>
  );
}

/* ---------- Reviews Admin ---------- */
function ReviewsAdmin({ onChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_REVIEW);
  const [view, setView] = useState("all"); // all | pending | approved | featured
  const [confirm, setConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get("/reviews?all=true");
    setItems(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (view === "pending") return items.filter(r => !r.is_approved);
    if (view === "approved") return items.filter(r => r.is_approved);
    if (view === "featured") return items.filter(r => r.is_featured);
    return items;
  }, [items, view]);

  const startEdit = (r) => {
    setEditing(r.id);
    setForm({
      name: r.name, rating: r.rating, comment: r.comment,
      is_featured: !!r.is_featured, is_approved: r.is_approved !== false,
    });
  };
  const cancel = () => { setEditing(null); setForm(EMPTY_REVIEW); };
  const save = async () => {
    try {
      await api.put(`/reviews/${editing}`, { ...form, rating: Number(form.rating) });
      toast.success("Review saved"); cancel(); load(); onChange?.();
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail) || "Save failed"); }
  };
  const doDelete = async () => {
    if (!confirm) return;
    await api.delete(`/reviews/${confirm.id}`);
    toast.success("Review deleted");
    setConfirm(null); load(); onChange?.();
  };
  const toggleFeatured = async (r) => {
    try {
      await api.patch(`/reviews/${r.id}/feature`);
      toast.success(r.is_featured ? "Unfeatured" : "Featured on homepage");
      load(); onChange?.();
    } catch { toast.error("Update failed"); }
  };
  const toggleApproved = async (r) => {
    try {
      await api.patch(`/reviews/${r.id}/approve`);
      toast.success(r.is_approved ? "Review hidden" : "Review approved");
      load(); onChange?.();
    } catch { toast.error("Update failed"); }
  };

  const counts = {
    all: items.length,
    pending: items.filter(r => !r.is_approved).length,
    approved: items.filter(r => r.is_approved).length,
    featured: items.filter(r => r.is_featured).length,
  };

  return (
    <section data-testid="admin-reviews-section">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="font-serif text-3xl text-cafe-ink">Reviews</h2>
          <p className="text-sm text-cafe-muted mt-1">Approve, feature, edit or delete customer reviews.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4" data-testid="admin-reviews-tabs">
        {[
          { id: "all", label: "All" },
          { id: "pending", label: "Pending" },
          { id: "approved", label: "Approved" },
          { id: "featured", label: "Featured" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            data-testid={`admin-reviews-view-${t.id}`}
            className={`text-xs px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
              view === t.id ? "bg-cafe-espresso text-cafe-paper" : "bg-cafe-snow border border-cafe-line text-cafe-ink hover:bg-cafe-cream"
            }`}
          >
            {t.label}
            <span className={`text-[10px] px-1.5 rounded-full ${view === t.id ? "bg-cafe-paper/20" : "bg-cafe-cream"}`}>{counts[t.id]}</span>
          </button>
        ))}
      </div>

      {editing && (
        <div className="bg-cafe-snow border border-cafe-line rounded-2xl p-6 mb-4 grid md:grid-cols-2 gap-4" data-testid="admin-review-form">
          <input className="input-cafe" placeholder="Name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input type="number" min="1" max="5" step="0.5" className="input-cafe" placeholder="Rating" value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })} />
          <textarea rows={3} className="input-cafe md:col-span-2" placeholder="Comment" value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })} />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_approved}
              onChange={(e) => setForm({ ...form, is_approved: e.target.checked })} />
            Approved (visible publicly)
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
            Featured on homepage
          </label>
          <div className="md:col-span-2 flex gap-3 justify-end">
            <button onClick={cancel} className="btn-outline"><X className="w-4 h-4" /> Cancel</button>
            <button onClick={save} className="btn-primary"><Save className="w-4 h-4" /> Save</button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-cafe-muted py-10 text-center">Loading reviews...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-cafe-snow border border-cafe-line rounded-2xl p-10 text-center text-cafe-muted">
          No reviews in this view yet.
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((r) => (
            <div key={r.id} className="bg-cafe-snow border border-cafe-line rounded-xl p-5 flex items-start gap-4 hover:shadow-sm transition-shadow" data-testid={`admin-review-row-${r.id}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-cafe-ink">{r.name}</span>
                  <span className="text-xs text-cafe-muted">· {Number(r.rating).toFixed(1)}★</span>
                  {!r.is_approved && <span className="text-[10px] uppercase tracking-widest bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Pending</span>}
                  {r.is_approved && <span className="text-[10px] uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Approved</span>}
                  {r.is_featured && <span className="text-[10px] uppercase tracking-widest bg-cafe-terracotta/20 text-cafe-terracotta px-2 py-0.5 rounded-full">Featured</span>}
                  <span className="text-[11px] text-cafe-muted ml-auto">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-cafe-muted mt-2 leading-relaxed">{r.comment}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-1 shrink-0">
                <button
                  onClick={() => toggleApproved(r)}
                  className={`p-2 rounded-lg transition-colors ${r.is_approved ? "text-emerald-700 hover:bg-emerald-50" : "text-amber-700 hover:bg-amber-50"}`}
                  title={r.is_approved ? "Unapprove" : "Approve"}
                  data-testid={`admin-review-approve-${r.id}`}
                >
                  {r.is_approved ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => toggleFeatured(r)}
                  className={`p-2 rounded-lg transition-colors ${r.is_featured ? "text-cafe-terracotta hover:bg-cafe-terracotta/10" : "text-cafe-muted hover:bg-cafe-cream"}`}
                  title={r.is_featured ? "Unfeature" : "Feature"}
                  data-testid={`admin-review-feature-${r.id}`}
                >
                  <Star className={`w-4 h-4 ${r.is_featured ? "fill-cafe-terracotta" : ""}`} />
                </button>
                <button onClick={() => startEdit(r)} className="p-2 rounded-lg hover:bg-cafe-cream" data-testid={`admin-review-edit-${r.id}`}><Pencil className="w-4 h-4" /></button>
                <button onClick={() => setConfirm({ id: r.id, name: r.name })} className="p-2 rounded-lg hover:bg-red-50 text-red-700" data-testid={`admin-review-delete-${r.id}`}><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(v) => !v && setConfirm(null)}
        title="Delete this review?"
        description={confirm ? `The review by "${confirm.name}" will be permanently removed.` : ""}
        onConfirm={doDelete}
        testId="admin-review-confirm-delete"
      />

      <style>{`.input-cafe{ background:#FAF8F5;border:1px solid #E8E0D9;border-radius:.75rem;padding:.7rem 1rem;outline:none;width:100%; }`}</style>
    </section>
  );
}

/* ---------- Homepage Admin ---------- */
function HomepageAdmin() {
  const [form, setForm] = useState(null);
  const [popular, setPopular] = useState([]);
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    const [h, m] = await Promise.all([api.get("/homepage"), api.get("/menu")]);
    setForm(h.data);
    setPopular(m.data);
  };
  useEffect(() => { loadAll(); }, []);
  if (!form) return <p className="text-cafe-muted py-10 text-center">Loading...</p>;

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/homepage", form);
      toast.success("Homepage content saved");
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail) || "Save failed"); }
    finally { setSaving(false); }
  };
  const set = (k, v) => setForm({ ...form, [k]: v });

  const togglePopular = async (it) => {
    try {
      await api.put(`/menu/${it.id}`, { ...it, is_popular: !it.is_popular });
      setPopular((prev) => prev.map((p) => p.id === it.id ? { ...p, is_popular: !p.is_popular } : p));
      toast.success(it.is_popular ? "Removed from homepage" : "Added to homepage");
    } catch { toast.error("Update failed"); }
  };

  return (
    <section data-testid="admin-homepage-section">
      <h2 className="font-serif text-3xl text-cafe-ink mb-2">Homepage content</h2>
      <p className="text-sm text-cafe-muted mb-6">Edit the hero copy, info bar values and pick popular items.</p>

      <div className="bg-cafe-snow border border-cafe-line rounded-2xl p-6 mb-6" data-testid="admin-homepage-form">
        <div className="text-xs uppercase tracking-widest text-cafe-muted mb-3">Hero</div>
        <div className="grid md:grid-cols-2 gap-4">
          <input className="input-cafe" value={form.hero_title} onChange={(e) => set("hero_title", e.target.value)} placeholder="Hero title (English)" data-testid="admin-hero-title" />
          <input className="input-cafe" value={form.hero_subtitle} onChange={(e) => set("hero_subtitle", e.target.value)} placeholder="Hero subtitle (Hindi)" data-testid="admin-hero-subtitle" />
          <input className="input-cafe md:col-span-2" value={form.hero_tagline} onChange={(e) => set("hero_tagline", e.target.value)} placeholder="Tagline" data-testid="admin-hero-tagline" />
        </div>

        <div className="text-xs uppercase tracking-widest text-cafe-muted mt-6 mb-3">Info bar</div>
        <div className="grid md:grid-cols-3 gap-4">
          <input type="number" step="0.1" className="input-cafe" value={form.rating} onChange={(e) => set("rating", Number(e.target.value))} placeholder="Rating" />
          <input type="number" className="input-cafe" value={form.review_count} onChange={(e) => set("review_count", Number(e.target.value))} placeholder="Review count" />
          <input className="input-cafe" value={form.price_range} onChange={(e) => set("price_range", e.target.value)} placeholder="Price range" />
        </div>
        <input className="input-cafe mt-4" value={form.services.join(", ")} onChange={(e) => set("services", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="Services (comma-separated)" />

        <div className="text-xs uppercase tracking-widest text-cafe-muted mt-6 mb-3">About & contact</div>
        <textarea rows={4} className="input-cafe" value={form.about_text} onChange={(e) => set("about_text", e.target.value)} placeholder="About text" />
        <div className="grid md:grid-cols-[2fr_1fr] gap-4 mt-4">
          <input className="input-cafe" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Address" />
          <input className="input-cafe" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Phone" />
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60" data-testid="admin-homepage-save">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      {/* Popular items management */}
      <div className="bg-cafe-snow border border-cafe-line rounded-2xl p-6" data-testid="admin-popular-section">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif text-xl text-cafe-ink">Popular items on homepage</h3>
            <p className="text-xs text-cafe-muted mt-1">Click the bookmark to feature an item on the homepage's "Popular at the cafe" section.</p>
          </div>
          <span className="text-xs text-cafe-muted">{popular.filter(p => p.is_popular).length} selected</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {popular.map((it) => (
            <button
              key={it.id}
              onClick={() => togglePopular(it)}
              data-testid={`admin-popular-toggle-${it.id}`}
              className={`text-left flex items-center gap-3 p-3 rounded-xl border transition-all ${
                it.is_popular ? "border-cafe-terracotta bg-cafe-terracotta/5" : "border-cafe-line bg-cafe-paper hover:bg-cafe-cream/50"
              }`}
            >
              <div className="w-12 h-12 rounded-lg bg-cafe-cream overflow-hidden shrink-0 grid place-items-center">
                {it.image ? <img src={it.image} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-cafe-muted" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-cafe-ink truncate">{it.name}</div>
                <div className="text-[10px] uppercase tracking-widest text-cafe-muted">{it.category} · ₹{Math.round(it.price)}</div>
              </div>
              <Bookmark className={`w-4 h-4 shrink-0 ${it.is_popular ? "text-cafe-terracotta fill-cafe-terracotta" : "text-cafe-muted"}`} />
            </button>
          ))}
        </div>
      </div>

      <style>{`.input-cafe{ background:#FAF8F5;border:1px solid #E8E0D9;border-radius:.75rem;padding:.7rem 1rem;outline:none;width:100%; }`}</style>
    </section>
  );
}

/* ---------- Contacts ---------- */
function ContactsAdmin({ onChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("all"); // all | unread | read
  const [confirm, setConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/contact");
      setItems(data);
    } catch { /* unauth handled by router */ }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (view === "unread") return items.filter(c => !c.is_read);
    if (view === "read") return items.filter(c => c.is_read);
    return items;
  }, [items, view]);

  const toggleRead = async (c) => {
    try {
      await api.patch(`/contact/${c.id}/read`);
      load(); onChange?.();
    } catch { toast.error("Update failed"); }
  };
  const doDelete = async () => {
    if (!confirm) return;
    await api.delete(`/contact/${confirm.id}`);
    toast.success("Message deleted");
    setConfirm(null); load(); onChange?.();
  };

  const counts = {
    all: items.length,
    unread: items.filter(c => !c.is_read).length,
    read: items.filter(c => c.is_read).length,
  };

  return (
    <section data-testid="admin-contacts-section">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="font-serif text-3xl text-cafe-ink">Inbox</h2>
          <p className="text-sm text-cafe-muted mt-1">Customer messages from the contact form.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4" data-testid="admin-contacts-tabs">
        {[
          { id: "all", label: "All" },
          { id: "unread", label: "Unread" },
          { id: "read", label: "Read" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            data-testid={`admin-contacts-view-${t.id}`}
            className={`text-xs px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
              view === t.id ? "bg-cafe-espresso text-cafe-paper" : "bg-cafe-snow border border-cafe-line text-cafe-ink hover:bg-cafe-cream"
            }`}
          >
            {t.label}
            <span className={`text-[10px] px-1.5 rounded-full ${view === t.id ? "bg-cafe-paper/20" : "bg-cafe-cream"}`}>{counts[t.id]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-cafe-muted py-10 text-center">Loading messages...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-cafe-snow border border-cafe-line rounded-2xl p-10 text-center text-cafe-muted">
          No messages here.
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className={`border rounded-xl p-5 flex items-start gap-4 transition-all ${
                c.is_read ? "bg-cafe-snow border-cafe-line" : "bg-cafe-snow border-cafe-terracotta/40 shadow-sm"
              }`}
              data-testid={`admin-contact-row-${c.id}`}
            >
              <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${c.is_read ? "bg-cafe-line" : "bg-cafe-terracotta"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm ${c.is_read ? "text-cafe-muted" : "font-medium text-cafe-ink"}`}>{c.name}</span>
                  <span className="text-xs text-cafe-muted">· {c.email}</span>
                  {!c.is_read && <span className="text-[10px] uppercase tracking-widest bg-cafe-terracotta text-cafe-paper px-2 py-0.5 rounded-full">New</span>}
                  <span className="text-[11px] text-cafe-muted ml-auto">{new Date(c.created_at).toLocaleString()}</span>
                </div>
                <p className="mt-2 text-sm text-cafe-muted whitespace-pre-line leading-relaxed">{c.message}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-1 shrink-0">
                <button
                  onClick={() => toggleRead(c)}
                  className="p-2 rounded-lg hover:bg-cafe-cream"
                  title={c.is_read ? "Mark unread" : "Mark read"}
                  data-testid={`admin-contact-toggle-${c.id}`}
                >
                  {c.is_read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <a href={`mailto:${c.email}`} className="p-2 rounded-lg hover:bg-cafe-cream text-cafe-espresso" title="Reply via email">
                  <Mail className="w-4 h-4" />
                </a>
                <button onClick={() => setConfirm({ id: c.id, name: c.name })} className="p-2 rounded-lg hover:bg-red-50 text-red-700" data-testid={`admin-contact-delete-${c.id}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(v) => !v && setConfirm(null)}
        title="Delete this message?"
        description={confirm ? `The message from "${confirm.name}" will be permanently removed.` : ""}
        onConfirm={doDelete}
        testId="admin-contact-confirm-delete"
      />
    </section>
  );
}
