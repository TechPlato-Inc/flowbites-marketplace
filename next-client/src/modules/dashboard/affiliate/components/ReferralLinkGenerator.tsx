"use client";

import { useState } from "react";
import { Button, Input } from "@/design-system";
import { generateReferralLink } from "../services/affiliates.service";
import {
  Link2,
  Copy,
  Check,
  Share2,
  Mail,
  Twitter,
  Facebook,
  Linkedin,
  Percent,
  Clock,
} from "lucide-react";

interface ReferralLinkGeneratorProps {
  referralCode: string;
  commissionRate: number;
  cookieDuration: number;
}

export function ReferralLinkGenerator({
  referralCode,
  commissionRate,
  cookieDuration,
}: ReferralLinkGeneratorProps) {
  const [campaign, setCampaign] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const defaultLink = `${baseUrl}/?ref=${referralCode}`;
  const displayLink = generatedLink || defaultLink;

  const handleGenerateLink = async () => {
    if (!campaign.trim()) return;

    try {
      setGenerating(true);
      const result = await generateReferralLink({
        campaign: campaign.trim(),
        source: "affiliate_dashboard",
      });
      setGeneratedLink(result.referralLink);
    } catch (err) {
      // Fallback: generate manually
      const url = new URL(baseUrl);
      url.searchParams.set("ref", referralCode);
      url.searchParams.set("utm_campaign", campaign.trim());
      url.searchParams.set("utm_source", "affiliate");
      setGeneratedLink(url.toString());
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async (platform: string) => {
    const text = `Check out Flowbites - premium templates for Webflow, Framer & Wix!`;
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(displayLink)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(displayLink)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(displayLink)}`,
      email: `mailto:?subject=${encodeURIComponent("Check out Flowbites")}&body=${encodeURIComponent(text + "\n\n" + displayLink)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-200 rounded-xl p-5 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
            <Link2 size={18} className="text-primary-600" />
            Your Referral Link
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            Share this link to earn commissions on referrals
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-primary-200">
            <Percent size={14} className="text-primary-600" />
            <span className="text-sm font-medium text-neutral-700">
              {commissionRate}% commission
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-primary-200">
            <Clock size={14} className="text-primary-600" />
            <span className="text-sm font-medium text-neutral-700">
              {cookieDuration} day cookie
            </span>
          </div>
        </div>
      </div>

      {/* Main Referral Link */}
      <div className="bg-white border border-neutral-200 rounded-lg p-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 min-w-0">
            <Input
              value={displayLink}
              readOnly
              className="!bg-neutral-50 !border-neutral-200"
              leftIcon={<Link2 size={16} className="text-neutral-400" />}
            />
          </div>
          <Button
            onClick={handleCopy}
            variant={copied ? "primary" : "outline"}
            leftIcon={copied ? <Check size={16} /> : <Copy size={16} />}
            className="shrink-0"
          >
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>
      </div>

      {/* Campaign Tracking */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Add Campaign Tracking (Optional)
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="e.g., newsletter, social, blog"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
            />
          </div>
          <Button
            onClick={handleGenerateLink}
            isLoading={generating}
            disabled={!campaign.trim()}
            variant="outline"
            className="shrink-0"
          >
            Generate Tracking Link
          </Button>
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          Add a campaign name to track which sources generate the most referrals
        </p>
      </div>

      {/* Share Buttons */}
      <div>
        <p className="text-sm font-medium text-neutral-700 mb-3 flex items-center gap-2">
          <Share2 size={14} />
          Share on Social Media
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleShare("twitter")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1DA1F2]/10 text-[#1DA1F2] rounded-lg hover:bg-[#1DA1F2]/20 transition-colors text-sm font-medium"
          >
            <Twitter size={16} />
            Twitter
          </button>
          <button
            onClick={() => handleShare("facebook")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1877F2]/10 text-[#1877F2] rounded-lg hover:bg-[#1877F2]/20 transition-colors text-sm font-medium"
          >
            <Facebook size={16} />
            Facebook
          </button>
          <button
            onClick={() => handleShare("linkedin")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A66C2]/10 text-[#0A66C2] rounded-lg hover:bg-[#0A66C2]/20 transition-colors text-sm font-medium"
          >
            <Linkedin size={16} />
            LinkedIn
          </button>
          <button
            onClick={() => handleShare("email")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors text-sm font-medium"
          >
            <Mail size={16} />
            Email
          </button>
        </div>
      </div>
    </div>
  );
}
