"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export type ToastVariant = "success" | "error";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose?: () => void;
}

export function Toast({
  message,
  variant = "success",
  duration = 3000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor =
    variant === "success"
      ? "bg-green-50 border-green-200"
      : "bg-red-50 border-red-200";
  const textColor = variant === "success" ? "text-green-800" : "text-red-800";
  const iconColor = variant === "success" ? "text-green-500" : "text-red-500";

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg
        transition-all duration-300 transform
        ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
        ${bgColor}
      `}
    >
      {variant === "success" ? (
        <CheckCircle className={iconColor} size={20} />
      ) : (
        <XCircle className={iconColor} size={20} />
      )}
      <span className={`text-sm font-medium ${textColor}`}>{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300);
        }}
        className={`ml-2 ${textColor} hover:opacity-70 transition-opacity`}
      >
        <X size={16} />
      </button>
    </div>
  );
}

// Simple toast state management
let toastListeners: ((
  toast: { message: string; variant: ToastVariant } | null,
) => void)[] = [];

export function showToast(message: string, variant: ToastVariant = "success") {
  toastListeners.forEach((listener) => listener({ message, variant }));
}

export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    variant: ToastVariant;
  } | null>(null);

  useEffect(() => {
    toastListeners.push(setToast);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToast);
    };
  }, []);

  return {
    toast,
    dismissToast: () => setToast(null),
  };
}

export function ToastContainer() {
  const { toast, dismissToast } = useToast();

  if (!toast) return null;

  return (
    <Toast
      message={toast.message}
      variant={toast.variant}
      onClose={dismissToast}
    />
  );
}
