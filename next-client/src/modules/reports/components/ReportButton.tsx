"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { ReportModal } from "./ReportModal";

interface ReportButtonProps {
  targetType: "template" | "review" | "creator" | "user";
  targetId: string;
  variant?: "icon" | "button";
  className?: string;
}

export function ReportButton({
  targetType,
  targetId,
  variant = "icon",
  className = "",
}: ReportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {variant === "icon" ? (
        <button
          onClick={() => setIsModalOpen(true)}
          className={`p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors ${className}`}
          title="Report"
          aria-label="Report content"
        >
          <Flag size={16} />
        </button>
      ) : (
        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors ${className}`}
        >
          <Flag size={14} />
          <span>Report</span>
        </button>
      )}

      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetType={targetType}
        targetId={targetId}
      />
    </>
  );
}
