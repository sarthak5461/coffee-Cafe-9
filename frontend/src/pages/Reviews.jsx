import React, { useEffect, useState } from "react";
import ReviewCard from "../components/ReviewCard";
import Loading from "../components/Loading";
import ErrorState from "../components/ErrorState";
import { api, formatApiError } from "../lib/api";
import { Star, Send } from "lucide-react";
import { toast, Toaster } from "sonner";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({ name: "", rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get("/reviews");
      setReviews(data);
    } catch {
      setError("Could not fetch reviews.");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.comment.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/reviews", { ...form, rating: Number(form.rating) });
      setForm({ name: "", rating: 5, comment: "" });
      toast.success("Thanks! Your review is pending approval and will appear shortly.");
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24" data-testid="reviews-page">
      <Toaster richColors position="top-center" />
      <div className="container-cafe">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">Stories from our guests</span>
          <h1 className="mt-3 font-serif text-5xl md:text-6xl text-cafe-ink">Reviews</h1>
          <p className="mt-4 text-cafe-muted">
            What people whisper between sips. We read every single one.
          </p>
        </div>

        {/* Submit form */}
        <form
          onSubmit={submit}
          className="mt-14 max-w-2xl mx-auto bg-cafe-snow border border-cafe-line rounded-2xl p-7 grid gap-4"
          data-testid="review-form"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              required
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-cafe-paper border border-cafe-line rounded-xl px-4 py-3 outline-none focus:border-cafe-espresso transition-colors"
              data-testid="review-name"
            />
            <div className="flex items-center justify-between bg-cafe-paper border border-cafe-line rounded-xl px-4 py-3">
              <span className="text-sm text-cafe-muted">Your rating</span>
              <div className="flex gap-1" data-testid="review-rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setForm({ ...form, rating: n })}
                    aria-label={`${n} stars`}
                    data-testid={`review-rating-${n}`}
                  >
                    <Star className={`w-5 h-5 ${n <= form.rating ? "fill-cafe-terracotta text-cafe-terracotta" : "text-cafe-line"}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <textarea
            required
            placeholder="Share your experience..."
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            rows={4}
            className="w-full bg-cafe-paper border border-cafe-line rounded-xl px-4 py-3 outline-none focus:border-cafe-espresso transition-colors resize-none"
            data-testid="review-comment"
          />
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary justify-self-end disabled:opacity-60"
            data-testid="review-submit"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Sending..." : "Post review"}
          </button>
        </form>

        {/* List */}
        <div className="mt-16">
          {loading ? <Loading label="Steeping reviews..." />
            : error ? <ErrorState message={error} onRetry={load} />
            : reviews.length === 0 ? (
              <div className="text-center py-16 text-cafe-muted">No reviews yet — be the first!</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7" data-testid="reviews-grid">
                {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
