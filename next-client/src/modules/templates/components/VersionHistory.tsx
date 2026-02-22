"use client";

import { useEffect, useState } from "react";
import { Button } from "@/design-system";
import {
  GitBranch,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Tag,
  Clock,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { showToast } from "@/design-system/Toast";

interface TemplateVersion {
  _id: string;
  templateId: string;
  version: string;
  releaseNotes?: string;
  changes: string[];
  publishedBy: { _id: string; name: string };
  createdAt: string;
}

interface VersionHistoryProps {
  templateId: string;
}

export function VersionHistory({ templateId }: VersionHistoryProps) {
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchVersions();
  }, [templateId]);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/templates/${templateId}/versions`);
      setVersions(data.data.versions || []);
      // Expand the first (latest) version by default
      if (data.data.versions?.length > 0) {
        setExpandedId(data.data.versions[0]._id);
      }
    } catch (err) {
      setError("Failed to load version history");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white border border-neutral-200 rounded-xl p-4 animate-pulse"
          >
            <div className="h-5 bg-neutral-200 rounded w-1/4 mb-2" />
            <div className="h-4 bg-neutral-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-light border border-error/20 rounded-xl p-6 text-center">
        <AlertCircle size={32} className="text-error mx-auto mb-2" />
        <p className="text-neutral-600 mb-3">{error}</p>
        <Button size="sm" onClick={fetchVersions}>
          Retry
        </Button>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
        <GitBranch size={48} className="text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-700 mb-1">
          No version history
        </h3>
        <p className="text-sm text-neutral-500">
          This template hasn&apos;t been updated yet. Versions will appear here
          when the creator publishes updates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">
          Version History
          <span className="ml-2 text-sm font-normal text-neutral-400">
            ({versions.length})
          </span>
        </h3>
      </div>

      <div className="space-y-3">
        {versions.map((version, index) => {
          const isExpanded = expandedId === version._id;
          const isLatest = index === 0;

          return (
            <div
              key={version._id}
              className={`bg-white border rounded-xl overflow-hidden transition-all ${
                isLatest ? "border-primary-200" : "border-neutral-200"
              }`}
            >
              {/* Header */}
              <button
                onClick={() => toggleExpand(version._id)}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isLatest
                        ? "bg-primary-50 text-primary-500"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    <Tag size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900">
                        v{version.version}
                      </span>
                      {isLatest && (
                        <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                          Latest
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-sm text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(version.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {version.publishedBy?.name || "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-400">
                    {version.changes.length} change
                    {version.changes.length !== 1 ? "s" : ""}
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-neutral-400" />
                  ) : (
                    <ChevronDown size={18} className="text-neutral-400" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-neutral-100 px-4 py-4">
                  {version.releaseNotes && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-neutral-700 mb-1.5">
                        Release Notes
                      </h5>
                      <p className="text-sm text-neutral-600 whitespace-pre-wrap">
                        {version.releaseNotes}
                      </p>
                    </div>
                  )}

                  {version.changes.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-neutral-700 mb-2">
                        Changes
                      </h5>
                      <ul className="space-y-1.5">
                        {version.changes.map((change, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-neutral-600"
                          >
                            <span className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-1.5 shrink-0" />
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
