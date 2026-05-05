import React, { useEffect, useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, formatApiError } from "../lib/api";
import { Toaster, toast } from "sonner";
import { LogOut, Plus, Pencil, Trash2, Save, X, Coffee, Star, Mail, Home as HomeIcon } from "lucide-react";

const TABS = [
  { id: "menu", label: "Menu", icon: Coffee },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "homepage", label: "Homepage", icon: HomeIcon },
  { id: "contacts", label: "Contacts", icon: Mail },
];

const EMPTY_MENU = { name: "", category: "Burgers", price: 0, description: "", image: "", is_popular: false };
const EMPTY_REVIEW = { name: "", rating: 5, comment: "", is_featured: false };

export default function AdminDashboard() {
  const { user, checking, logout } = useAuth();
  const [tab, setTab] = useState("menu");
  const navigate = useNavigate();

  if (checking) return null;
  if (!user) return <Navigate to="/admin/login" replace />;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-cafe-paper" data-testid="admin-dashboard">
      <Toaster richColors position="top-center" />
      <header className="bg-cafe-snow border-b border-cafe-line">
        <div className="container-cafe py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-9 h-9 rounded-full bg-cafe-espresso text-cafe-paper">
              <Coffee className="w-5 h-5" />
            </span>
            <div>
              <div className="font-serif text-xl text-cafe-ink">Admin · Coffee Cafe 9</div>
              <div className="text-xs text-cafe-muted">Signed in as {user.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-cafe-muted hover:text-cafe-espresso">View site</Link>
            <button onClick={handleLogout} className="btn-outline" data-testid="admin-logout">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container-cafe py-10 grid lg:grid-cols-[220px_1fr] gap-8">
        <aside className="bg-cafe-snow border border-cafe-line rounded-2xl p-3 h-fit">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              data-testid={`admin-tab-${t.id}`}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                tab === t.id
                  ? "bg-cafe-espresso text-cafe-paper"
                  : "text-cafe-ink hover:bg-cafe-cream"
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </aside>

        <main>
          {tab === "menu" && <MenuAdmin />}
          {tab === "reviews" && <ReviewsAdmin />}
          {tab === "homepage" && <HomepageAdmin />}
          {tab === "contacts" && <ContactsAdmin />}
        </main>
      </div>
    </div>
  );
}

/* ---------- Menu Admin ---------- */
function MenuAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // id or "new"
  const [form, setForm] = useState(EMPTY_MENU);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get("/menu");
    setItems(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

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
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editing === "new") await api.post("/menu", payload);
      else await api.put(`/menu/${editing}`, payload);
      toast.success("Saved");
      cancel();
      load();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Save failed");
    }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await api.delete(`/menu/${id}`);
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-3xl text-cafe-ink">Menu items</h2>
        <button onClick={startNew} className="btn-primary" data-testid="admin-menu-new">
          <Plus className="w-4 h-4" /> New item
        </button>
      </div>

      {editing && (
        <div className="bg-cafe-snow border border-cafe-line rounded-2xl p-6 mb-6 grid md:grid-cols-2 gap-4" data-testid="admin-menu-form">
          <input className="input-cafe" placeholder="Name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="admin-menu-name" />
          <select className="input-cafe" value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })} data-testid="admin-menu-category">
            {["Burgers", "Pasta", "Coffee", "Drinks", "Desserts"].map((c) => <option key={c}>{c}</option>)}
          </select>
          <input type="number" className="input-cafe" placeholder="Price ₹" value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })} data-testid="admin-menu-price" />
          <input className="input-cafe" placeholder="Image URL" value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })} data-testid="admin-menu-image" />
          <textarea rows={3} className="input-cafe md:col-span-2" placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="admin-menu-description" />
          <label className="flex items-center gap-2 text-sm text-cafe-ink md:col-span-2">
            <input type="checkbox" checked={form.is_popular}
              onChange={(e) => setForm({ ...form, is_popular: e.target.checked })} data-testid="admin-menu-popular" />
            Mark as popular
          </label>
          <div className="md:col-span-2 flex gap-3 justify-end">
            <button onClick={cancel} className="btn-outline" data-testid="admin-menu-cancel"><X className="w-4 h-4" /> Cancel</button>
            <button onClick={save} className="btn-primary" data-testid="admin-menu-save"><Save className="w-4 h-4" /> Save</button>
          </div>
        </div>
      )}

      {loading ? <p className="text-cafe-muted">Loading...</p>
        : (
          <div className="grid gap-3">
            {items.map((it) => (
              <div key={it.id} className="bg-cafe-snow border border-cafe-line rounded-xl p-4 flex items-center gap-4" data-testid={`admin-menu-row-${it.id}`}>
                <div className="w-16 h-16 rounded-lg bg-cafe-cream overflow-hidden shrink-0">
                  {it.image ? <img src={it.image} alt="" className="w-full h-full object-cover" /> : null}
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
                <button onClick={() => startEdit(it)} className="p-2 rounded-lg hover:bg-cafe-cream" data-testid={`admin-menu-edit-${it.id}`}><Pencil className="w-4 h-4" /></button>
                <button onClick={() => remove(it.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-700" data-testid={`admin-menu-delete-${it.id}`}><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
      <style>{`.input-cafe{ background:#FAF8F5;border:1px solid #E8E0D9;border-radius:.75rem;padding:.7rem 1rem;outline:none;width:100%; }`}</style>
    </section>
  );
}

/* ---------- Reviews Admin ---------- */
function ReviewsAdmin() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_REVIEW);

  const load = async () => {
    const { data } = await api.get("/reviews");
    setItems(data);
  };
  useEffect(() => { load(); }, []);

  const startEdit = (r) => {
    setEditing(r.id);
    setForm({ name: r.name, rating: r.rating, comment: r.comment, is_featured: !!r.is_featured });
  };
  const cancel = () => { setEditing(null); setForm(EMPTY_REVIEW); };
  const save = async () => {
    try {
      await api.put(`/reviews/${editing}`, { ...form, rating: Number(form.rating) });
      toast.success("Saved"); cancel(); load();
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail) || "Save failed"); }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    await api.delete(`/reviews/${id}`); toast.success("Deleted"); load();
  };
  const toggleFeatured = async (r) => {
    await api.put(`/reviews/${r.id}`, { name: r.name, rating: r.rating, comment: r.comment, is_featured: !r.is_featured });
    load();
  };

  return (
    <section>
      <h2 className="font-serif text-3xl text-cafe-ink mb-6">Reviews</h2>
      {editing && (
        <div className="bg-cafe-snow border border-cafe-line rounded-2xl p-6 mb-6 grid md:grid-cols-2 gap-4" data-testid="admin-review-form">
          <input className="input-cafe" placeholder="Name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input type="number" min="1" max="5" step="0.5" className="input-cafe" placeholder="Rating" value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })} />
          <textarea rows={3} className="input-cafe md:col-span-2" placeholder="Comment" value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })} />
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
            Feature on homepage
          </label>
          <div className="md:col-span-2 flex gap-3 justify-end">
            <button onClick={cancel} className="btn-outline"><X className="w-4 h-4" /> Cancel</button>
            <button onClick={save} className="btn-primary"><Save className="w-4 h-4" /> Save</button>
          </div>
        </div>
      )}
      <div className="grid gap-3">
        {items.map((r) => (
          <div key={r.id} className="bg-cafe-snow border border-cafe-line rounded-xl p-4 flex items-start gap-4" data-testid={`admin-review-row-${r.id}`}>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-cafe-ink">{r.name}</span>
                <span className="text-xs text-cafe-muted">· {Number(r.rating).toFixed(1)}★</span>
                {r.is_featured && <span className="text-[10px] uppercase tracking-widest bg-cafe-terracotta/20 text-cafe-terracotta px-2 py-0.5 rounded-full">Featured</span>}
              </div>
              <p className="text-sm text-cafe-muted mt-1">{r.comment}</p>
            </div>
            <button onClick={() => toggleFeatured(r)} className="p-2 rounded-lg hover:bg-cafe-cream text-xs">{r.is_featured ? "Unfeature" : "Feature"}</button>
            <button onClick={() => startEdit(r)} className="p-2 rounded-lg hover:bg-cafe-cream"><Pencil className="w-4 h-4" /></button>
            <button onClick={() => remove(r.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-700"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <style>{`.input-cafe{ background:#FAF8F5;border:1px solid #E8E0D9;border-radius:.75rem;padding:.7rem 1rem;outline:none;width:100%; }`}</style>
    </section>
  );
}

/* ---------- Homepage Admin ---------- */
function HomepageAdmin() {
  const [form, setForm] = useState(null);
  useEffect(() => { api.get("/homepage").then((r) => setForm(r.data)); }, []);
  if (!form) return <p className="text-cafe-muted">Loading...</p>;
  const save = async () => {
    try {
      await api.put("/homepage", form);
      toast.success("Homepage updated");
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail) || "Save failed"); }
  };
  const set = (k, v) => setForm({ ...form, [k]: v });
  return (
    <section>
      <h2 className="font-serif text-3xl text-cafe-ink mb-6">Homepage content</h2>
      <div className="bg-cafe-snow border border-cafe-line rounded-2xl p-6 grid md:grid-cols-2 gap-4" data-testid="admin-homepage-form">
        <input className="input-cafe" value={form.hero_title} onChange={(e) => set("hero_title", e.target.value)} placeholder="Hero title" />
        <input className="input-cafe" value={form.hero_subtitle} onChange={(e) => set("hero_subtitle", e.target.value)} placeholder="Hero subtitle (Hindi)" />
        <input className="input-cafe md:col-span-2" value={form.hero_tagline} onChange={(e) => set("hero_tagline", e.target.value)} placeholder="Tagline" />
        <input type="number" step="0.1" className="input-cafe" value={form.rating} onChange={(e) => set("rating", Number(e.target.value))} placeholder="Rating" />
        <input type="number" className="input-cafe" value={form.review_count} onChange={(e) => set("review_count", Number(e.target.value))} placeholder="Review count" />
        <input className="input-cafe" value={form.price_range} onChange={(e) => set("price_range", e.target.value)} placeholder="Price range" />
        <input className="input-cafe" value={form.services.join(", ")} onChange={(e) => set("services", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="Services (comma-separated)" />
        <textarea rows={4} className="input-cafe md:col-span-2" value={form.about_text} onChange={(e) => set("about_text", e.target.value)} placeholder="About text" />
        <input className="input-cafe md:col-span-2" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Address" />
        <input className="input-cafe" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Phone" />
        <div className="md:col-span-2 flex justify-end">
          <button onClick={save} className="btn-primary" data-testid="admin-homepage-save"><Save className="w-4 h-4" /> Save changes</button>
        </div>
      </div>
      <style>{`.input-cafe{ background:#FAF8F5;border:1px solid #E8E0D9;border-radius:.75rem;padding:.7rem 1rem;outline:none;width:100%; }`}</style>
    </section>
  );
}

/* ---------- Contacts ---------- */
function ContactsAdmin() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/contact").then((r) => setItems(r.data)).catch(() => {}); }, []);
  return (
    <section>
      <h2 className="font-serif text-3xl text-cafe-ink mb-6">Customer messages</h2>
      <div className="grid gap-3">
        {items.length === 0 && <p className="text-cafe-muted">No messages yet.</p>}
        {items.map((c) => (
          <div key={c.id} className="bg-cafe-snow border border-cafe-line rounded-xl p-5">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-cafe-ink">{c.name}</span>
              <span className="text-cafe-muted">· {c.email}</span>
              <span className="text-xs text-cafe-muted ml-auto">{new Date(c.created_at).toLocaleString()}</span>
            </div>
            <p className="mt-2 text-sm text-cafe-muted whitespace-pre-line">{c.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
