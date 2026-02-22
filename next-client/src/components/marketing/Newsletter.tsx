"use client";

import { useState } from "react";
import { Button, Input } from "@/design-system";
import { Mail, ArrowRight, Check, Sparkles } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);

    // Simulate API call - replace with actual newsletter signup
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSubmitted(true);
    setLoading(false);
    setEmail("");
  };

  return (
    <section className="bg-gradient-to-br from-primary-600 to-secondary-600 py-16 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-white/90 text-sm font-medium mb-6">
          <Sparkles size={14} />
          Join 5,000+ designers
        </div>

        <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-4">
          Get the best templates delivered to your inbox
        </h2>

        <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
          Subscribe to receive weekly curated templates, design tips, and
          exclusive discounts. No spam, unsubscribe anytime.
        </p>

        {submitted ? (
          <div className="flex items-center justify-center gap-3 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Check size={24} />
            </div>
            <div className="text-left">
              <p className="font-semibold">You&apos;re subscribed!</p>
              <p className="text-sm text-white/70">
                Check your inbox for a welcome email.
              </p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <div className="relative flex-1">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                size={20}
              />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="!pl-12 !h-12 !bg-white !border-0"
                required
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="!h-12 !bg-white !text-primary-600 hover:!bg-neutral-100"
              disabled={loading}
              rightIcon={<ArrowRight size={18} />}
            >
              {loading ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
        )}

        <p className="text-white/60 text-sm mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
