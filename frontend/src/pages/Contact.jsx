import React, { useState } from "react";
import { Phone, MapPin, Send, Mail } from "lucide-react";
import { toast, Toaster } from "sonner";
import { api, formatApiError } from "../lib/api";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/contact", form);
      setForm({ name: "", email: "", message: "" });
      setSent(true);
      toast.success("Thanks! We'll get back to you soon.");
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Couldn't send. Try again.");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="pt-32 pb-24" data-testid="contact-page">
      <Toaster richColors position="top-center" />
      <div className="container-cafe">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">Say hello</span>
          <h1 className="mt-3 font-serif text-5xl md:text-6xl text-cafe-ink">Drop us a line</h1>
          <p className="mt-4 text-cafe-muted">
            Reservations, feedback, or just want to chat about coffee — we're listening.
          </p>
        </div>

        <div className="mt-14 grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-cafe-cream rounded-2xl p-6">
              <div className="w-10 h-10 grid place-items-center rounded-full bg-cafe-espresso text-cafe-paper">
                <Phone className="w-4 h-4" />
              </div>
              <div className="eyebrow mt-4">Call us</div>
              <a href="tel:09911684545" className="block mt-1 font-serif text-2xl text-cafe-ink hover:text-cafe-espresso transition-colors" data-testid="contact-phone">
                099116 84545
              </a>
            </div>
            <div className="bg-cafe-cream rounded-2xl p-6">
              <div className="w-10 h-10 grid place-items-center rounded-full bg-cafe-espresso text-cafe-paper">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="eyebrow mt-4">Visit</div>
              <p className="mt-1 font-serif text-xl text-cafe-ink leading-snug">
                143, Khirki Extension,<br />Malviya Nagar,<br />New Delhi 110017
              </p>
            </div>
            <div className="bg-cafe-cream rounded-2xl p-6">
              <div className="w-10 h-10 grid place-items-center rounded-full bg-cafe-espresso text-cafe-paper">
                <Mail className="w-4 h-4" />
              </div>
              <div className="eyebrow mt-4">Email</div>
              <a href="mailto:hello@coffeecafe9.com" className="block mt-1 font-serif text-xl text-cafe-ink hover:text-cafe-espresso transition-colors">
                hello@coffeecafe9.com
              </a>
            </div>
          </div>

          <div className="lg:col-span-3">
            <form onSubmit={submit} className="bg-cafe-snow border border-cafe-line rounded-2xl p-7 grid gap-4" data-testid="contact-form">
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  required
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-cafe-paper border border-cafe-line rounded-xl px-4 py-3 outline-none focus:border-cafe-espresso transition-colors"
                  data-testid="contact-name"
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-cafe-paper border border-cafe-line rounded-xl px-4 py-3 outline-none focus:border-cafe-espresso transition-colors"
                  data-testid="contact-email"
                />
              </div>
              <textarea
                required
                rows={6}
                placeholder="What's on your mind?"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-cafe-paper border border-cafe-line rounded-xl px-4 py-3 outline-none focus:border-cafe-espresso transition-colors resize-none"
                data-testid="contact-message"
              />
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary justify-self-start disabled:opacity-60"
                data-testid="contact-submit"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Sending..." : "Send message"}
              </button>
              {sent && (
                <p className="text-sm text-cafe-espresso" data-testid="contact-success">
                  ✓ Message received. We'll be in touch shortly.
                </p>
              )}
            </form>

            <div className="mt-6 rounded-2xl overflow-hidden border border-cafe-line shadow-sm">
              <iframe
                title="Map"
                src="https://www.google.com/maps?q=143%20Khirki%20Extension%2C%20Malviya%20Nagar%2C%20New%20Delhi%20110017&output=embed"
                className="w-full h-[300px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                data-testid="contact-map"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
