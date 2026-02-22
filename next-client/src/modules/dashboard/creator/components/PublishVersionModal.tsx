"use client";

import { useState } from "react";
import { Button, Modal, Input } from "@/design-system";
import { Plus, X, GitBranch, AlertCircle } from "lucide-react";
import { api } from "@/lib/api/client";
import { showToast } from "@/design-system/Toast";

interface PublishVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  templateTitle: string;
  currentVersion?: string;
  onSuccess?: () => void;
}

export function PublishVersionModal({
  isOpen,
  onClose,
  templateId,
  templateTitle,
  currentVersion = "1.0.0",
  onSuccess,
}: PublishVersionModalProps) {
  const [version, setVersion] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [changes, setChanges] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);

  const handleAddChange = () => {
    setChanges([...changes, ""]);
  };

  const handleRemoveChange = (index: number) => {
    setChanges(changes.filter((_, i) => i !== index));
  };

  const handleChangeUpdate = (index: number, value: string) => {
    const newChanges = [...changes];
    newChanges[index] = value;
    setChanges(newChanges);
  };

  const handleSubmit = async () => {
    if (!version.trim()) {
      showToast("Please enter a version number", "error");
      return;
    }

    const validChanges = changes.filter((c) => c.trim() !== "");
    if (validChanges.length === 0) {
      showToast("Please add at least one change", "error");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/templates/${templateId}/versions`, {
        version: version.trim(),
        releaseNotes: releaseNotes.trim() || undefined,
        changes: validChanges,
      });

      showToast("Version published successfully!", "success");
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      showToast(
        err?.response?.data?.error || "Failed to publish version",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setVersion("");
      setReleaseNotes("");
      setChanges([""]);
      onClose();
    }
  };

  // Auto-suggest next version
  const suggestNextVersion = () => {
    const parts = currentVersion.split(".").map(Number);
    if (parts.length === 3) {
      parts[2]++; // Increment patch version
      setVersion(parts.join("."));
    } else {
      setVersion(currentVersion);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Publish New Version"
      size="lg"
      footer={
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={loading}
            disabled={!version.trim() || changes.every((c) => c.trim() === "")}
            leftIcon={<GitBranch size={16} />}
          >
            Publish Version
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Template Info */}
        <div className="bg-primary-50 border border-primary-100 rounded-lg p-3 flex items-start gap-2">
          <GitBranch size={18} className="text-primary-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-primary-800">
              Publishing new version for <strong>{templateTitle}</strong>
            </p>
            <p className="text-xs text-primary-600 mt-0.5">
              Current version:{" "}
              <code className="font-mono bg-primary-100 px-1 rounded">
                {currentVersion}
              </code>
            </p>
          </div>
        </div>

        {/* Version Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-neutral-700">
              Version Number <span className="text-error">*</span>
            </label>
            <button
              onClick={suggestNextVersion}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Suggest:{" "}
              {currentVersion
                .split(".")
                .map((n, i) => (i === 2 ? parseInt(n) + 1 : n))
                .join(".")}
            </button>
          </div>
          <Input
            placeholder="e.g., 1.0.1"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            leftIcon={<span className="text-neutral-400 font-mono">v</span>}
          />
          <p className="text-xs text-neutral-500 mt-1">
            Use semantic versioning (e.g., 1.0.0, 1.0.1, 1.1.0)
          </p>
        </div>

        {/* Release Notes */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Release Notes <span className="text-neutral-400">(optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Brief summary of this release..."
            value={releaseNotes}
            onChange={(e) => setReleaseNotes(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none text-sm"
          />
        </div>

        {/* Changes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-neutral-700">
              Changes <span className="text-error">*</span>
            </label>
            <button
              onClick={handleAddChange}
              className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <Plus size={14} />
              Add Change
            </button>
          </div>

          <div className="space-y-2">
            {changes.map((change, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Change ${index + 1}`}
                  value={change}
                  onChange={(e) => handleChangeUpdate(index, e.target.value)}
                  className="flex-1"
                />
                {changes.length > 1 && (
                  <button
                    onClick={() => handleRemoveChange(index)}
                    className="p-2 text-neutral-400 hover:text-error hover:bg-error-light rounded-lg transition-colors"
                    aria-label="Remove change"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {changes.length === 0 && (
            <div className="text-center py-4 border border-dashed border-neutral-200 rounded-lg">
              <p className="text-sm text-neutral-500 mb-2">
                No changes added yet
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddChange}
                leftIcon={<Plus size={14} />}
              >
                Add First Change
              </Button>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="flex items-start gap-2 text-sm text-neutral-500 bg-neutral-50 rounded-lg p-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <p>
            Publishing a new version will notify all users who have purchased
            this template. Make sure your changes are accurate before
            publishing.
          </p>
        </div>
      </div>
    </Modal>
  );
}
