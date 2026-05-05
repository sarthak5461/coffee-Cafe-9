import React, { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Coffee, ArrowLeft } from "lucide-react";

export default function AdminLogin() {
  const { user, login, checking } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  if (checking) return null;
  if (user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    const res = await login(email, password);
    setBusy(false);
    if (res.ok) navigate("/admin");
    else setError(res.error);
  };

  return (
    <div className="min-h-screen grid place-items-center bg-cafe-paper px-6" data-testid="admin-login-page">
      <div className="w-full max-w-md">
        <Link to="/" className="text-sm text-cafe-muted inline-flex items-center gap-2 hover:text-cafe-espresso transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to site
        </Link>
        <div className="bg-cafe-snow border border-cafe-line rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-full bg-cafe-espresso text-cafe-paper">
              <Coffee className="w-5 h-5" />
            </span>
            <div>
              <div className="font-serif text-2xl text-cafe-ink">Admin Login</div>
              <div className="text-xs text-cafe-muted">Coffee Cafe 9 · Content Manager</div>
            </div>
          </div>

          <form onSubmit={submit} className="mt-7 grid gap-4">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-cafe-paper border border-cafe-line rounded-xl px-4 py-3 outline-none focus:border-cafe-espresso"
              data-testid="admin-login-email"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-cafe-paper border border-cafe-line rounded-xl px-4 py-3 outline-none focus:border-cafe-espresso"
              data-testid="admin-login-password"
            />
            {error && <p className="text-sm text-red-700" data-testid="admin-login-error">{error}</p>}
            <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60" data-testid="admin-login-submit">
              {busy ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="mt-5 text-xs text-cafe-muted">
            Default seed: admin@coffeecafe9.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
