"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, Button, Input } from "@/design-system";
import { createConversation } from "../services/messages.service";
import { Search, User, AlertCircle, Package } from "lucide-react";

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRecipient?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  relatedTemplate?: {
    _id: string;
    title: string;
    thumbnail: string;
  };
  relatedOrder?: {
    _id: string;
    orderNumber: string;
  };
}

export function NewMessageModal({
  isOpen,
  onClose,
  defaultRecipient,
  relatedTemplate,
  relatedOrder,
}: NewMessageModalProps) {
  const router = useRouter();
  const [recipientId, setRecipientId] = useState(defaultRecipient?._id || "");
  const [recipientName, setRecipientName] = useState(
    defaultRecipient?.name || "",
  );
  const [recipientSearch, setRecipientSearch] = useState(
    defaultRecipient?.name || "",
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<
    Array<{
      _id: string;
      name: string;
      avatar?: string;
      role: string;
    }>
  >([]);
  const [searching, setSearching] = useState(false);

  // Search for users when typing
  const handleSearch = async (query: string) => {
    setRecipientSearch(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const { api } = await import("@/lib/api/client");
      const { data } = await api.get(
        `/conversations/search-users?q=${encodeURIComponent(query)}&limit=5`,
      );
      setSearchResults(data.data.users || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectRecipient = (user: {
    _id: string;
    name: string;
    avatar?: string;
  }) => {
    setRecipientId(user._id);
    setRecipientName(user.name);
    setRecipientSearch(user.name);
    setSearchResults([]);
  };

  const handleSubmit = async () => {
    if (!recipientId.trim() || !message.trim()) {
      setError("Please select a recipient and enter a message");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const conversation = await createConversation(
        recipientId,
        message.trim(),
        {
          relatedTemplateId: relatedTemplate?._id,
          relatedOrderId: relatedOrder?._id,
        },
      );

      // Close modal and navigate to the conversation
      onClose();
      router.push(`/dashboard/messages/${conversation._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setRecipientId(defaultRecipient?._id || "");
      setRecipientName(defaultRecipient?.name || "");
      setRecipientSearch(defaultRecipient?.name || "");
      setMessage("");
      setError(null);
      setSearchResults([]);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Message" size="md">
      <div className="space-y-4">
        {error && (
          <div className="bg-error-light border border-error/20 rounded-lg p-3 flex items-center gap-2 text-error text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Recipient */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            To <span className="text-error">*</span>
          </label>
          {defaultRecipient ? (
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              {defaultRecipient.avatar ? (
                <img
                  src={defaultRecipient.avatar}
                  alt={defaultRecipient.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                  {defaultRecipient.name.charAt(0)}
                </div>
              )}
              <span className="font-medium">{defaultRecipient.name}</span>
            </div>
          ) : (
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                size={18}
              />
              <input
                type="text"
                value={recipientSearch}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search for a user..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
              />

              {/* Search results */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-10">
                  {searchResults.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => handleSelectRecipient(user)}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-neutral-50 text-left"
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-neutral-500 capitalize">
                          {user.role}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searching && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 p-4 text-center text-sm text-neutral-500">
                  Searching...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related Item */}
        {(relatedTemplate || relatedOrder) && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Related to
            </label>
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <Package size={18} className="text-neutral-400" />
              <span className="text-sm">
                {relatedTemplate?.title ||
                  `Order #${relatedOrder?.orderNumber}`}
              </span>
            </div>
          </div>
        )}

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Message <span className="text-error">*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
            rows={4}
            className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={loading}
            disabled={!recipientId || !message.trim()}
          >
            Send Message
          </Button>
        </div>
      </div>
    </Modal>
  );
}
