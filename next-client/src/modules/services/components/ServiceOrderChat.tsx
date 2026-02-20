'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api/client';
import type { ServiceOrder, ServiceMessage, ActivityLogEntry } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { Button, Badge, Modal } from '@/design-system';
import {
  Send, Clock, CheckCircle, AlertCircle, Package, XCircle,
  Shield, Activity, ChevronDown, ChevronUp,
} from 'lucide-react';

const statusConfig: Record<string, { label: string; variant: 'info' | 'warning' | 'success' | 'error' | 'neutral' }> = {
  requested: { label: 'Requested', variant: 'info' },
  accepted: { label: 'Accepted', variant: 'info' },
  rejected: { label: 'Rejected', variant: 'error' },
  in_progress: { label: 'In Progress', variant: 'warning' },
  delivered: { label: 'Delivered', variant: 'success' },
  revision_requested: { label: 'Revision Requested', variant: 'warning' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'neutral' },
  disputed: { label: 'Disputed', variant: 'error' },
};

const activityIcon: Record<string, string> = {
  order_created: '\u{1F4DD}',
  status_accepted: '\u2705',
  status_in_progress: '\u{1F528}',
  status_delivered: '\u{1F4E6}',
  status_completed: '\u{1F389}',
  status_rejected: '\u274C',
  revision_requested: '\u{1F504}',
  order_cancelled: '\u{1F6AB}',
  dispute_opened: '\u26A0\uFE0F',
  dispute_resolved: '\u2696\uFE0F',
  creator_assigned: '\u{1F464}',
  price_set: '\u{1F4B0}',
};

interface ServiceOrderChatProps {
  orderId: string;
}

export function ServiceOrderChat({ orderId }: ServiceOrderChatProps) {
  const { user } = useAuthStore();
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputing, setDisputing] = useState(false);

  const [timelineOpen, setTimelineOpen] = useState(true);

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (!orderId || !order) return;
    const interval = setInterval(() => {
      fetchOrder(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [orderId, order]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [order?.messages]);

  const fetchOrder = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get(`/services/orders/${orderId}`);
      setOrder(data.data);
    } catch {
      // Silent
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || sending) return;
    setSending(true);
    try {
      const { data } = await api.post(`/services/orders/${orderId}/messages`, {
        message: messageText.trim(),
      });
      setOrder(data.data);
      setMessageText('');
    } catch {
      // Silent
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (status: string, endpoint = 'status') => {
    try {
      const { data } = await api.patch(`/services/orders/${orderId}/${endpoint}`, { status });
      setOrder(data.data);
    } catch (err: unknown) {
      const msg = (err && typeof err === 'object' && 'response' in err)
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      alert(msg || 'Failed to update status.');
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    setCancelling(true);
    try {
      const { data } = await api.post(`/services/orders/${orderId}/cancel`, {
        reason: cancelReason.trim(),
      });
      setOrder(data.data);
      setShowCancelModal(false);
      setCancelReason('');
    } catch (err: unknown) {
      const msg = (err && typeof err === 'object' && 'response' in err)
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      alert(msg || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  const handleOpenDispute = async () => {
    if (!disputeReason.trim()) return;
    setDisputing(true);
    try {
      const { data } = await api.post(`/services/orders/${orderId}/dispute`, {
        reason: disputeReason.trim(),
      });
      setOrder(data.data);
      setShowDisputeModal(false);
      setDisputeReason('');
    } catch (err: unknown) {
      const msg = (err && typeof err === 'object' && 'response' in err)
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      alert(msg || 'Failed to open dispute.');
    } finally {
      setDisputing(false);
    }
  };

  if (loading) {
    return <div className="max-w-8xl mx-auto px-4 py-8">Loading...</div>;
  }

  if (!order) {
    return <div className="max-w-8xl mx-auto px-4 py-8">Order not found</div>;
  }

  const creatorIdVal = typeof order.creatorId === 'object' ? order.creatorId._id : order.creatorId;
  const assignedCreatorIdVal = order.assignedCreatorId
    ? (typeof order.assignedCreatorId === 'object' ? order.assignedCreatorId._id : order.assignedCreatorId)
    : null;
  const isCreator = user?._id === creatorIdVal || user?._id === assignedCreatorIdVal;
  const isBuyer = user?._id === (typeof order.buyerId === 'object' ? order.buyerId._id : order.buyerId);
  const otherParty = isCreator
    ? (typeof order.buyerId === 'object' ? order.buyerId.name : 'Buyer')
    : (typeof order.creatorId === 'object' ? order.creatorId.name : 'Creator');
  const status = statusConfig[order.status] || statusConfig.requested;

  const isTerminal = ['completed', 'cancelled', 'rejected'].includes(order.status);
  const canCancel = !isTerminal && order.status !== 'disputed';
  const canDispute = isBuyer && ['delivered', 'revision_requested', 'in_progress'].includes(order.status) && !order.dispute?.openedAt;

  return (
    <div className="max-w-8xl mx-auto px-4 md:px-6 lg:px-8 py-4 sm:py-8">
      {/* Order Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-neutral-900 truncate">
              {order.packageName}
            </h1>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="text-sm text-neutral-500">
            Order #{order.orderNumber} &middot; with {otherParty}
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-neutral-600">
          <span className="font-semibold text-lg">${order.price}</span>
          {order.dueDate && (
            <span className="flex items-center gap-1">
              <Clock size={14} />
              Due {new Date(order.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Dispute Banner */}
      {order.status === 'disputed' && order.dispute && (
        <div className="mb-6 border border-error/30 bg-error/5 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield size={20} className="text-error mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-error mb-1">Dispute Open</h3>
              <p className="text-sm text-neutral-700">{order.dispute.reason}</p>
              <p className="text-xs text-neutral-500 mt-1">
                Opened by {typeof order.dispute.openedBy === 'object' ? order.dispute.openedBy.name : 'buyer'} on {new Date(order.dispute.openedAt).toLocaleDateString()}
              </p>
              {order.dispute.resolution && (
                <div className="mt-3 pt-3 border-t border-error/20">
                  <p className="text-sm font-medium text-neutral-800">Resolution: {order.dispute.resolution}</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Outcome: <strong className="capitalize">{order.dispute.outcome?.replace(/_/g, ' ')}</strong>
                    {order.dispute.resolvedBy && typeof order.dispute.resolvedBy === 'object' && (
                      <> by {order.dispute.resolvedBy.name}</>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages */}
        <div className="lg:col-span-2 border border-neutral-200 rounded-lg flex flex-col h-[400px] sm:h-[500px] lg:h-[600px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="bg-neutral-50 rounded-lg p-4 text-sm">
              <p className="font-medium text-neutral-700 mb-1">Project Requirements:</p>
              <p className="text-neutral-600 whitespace-pre-wrap">{order.requirements}</p>
            </div>

            {order.messages.map((msg: ServiceMessage, i: number) => {
              const senderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
              const isOwn = senderId === user?._id;
              return (
                <div key={msg._id || i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-2.5 ${
                      isOwn ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-900'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <span className={`text-xs mt-1 block ${isOwn ? 'text-primary-100' : 'text-neutral-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {!isTerminal && (
            <div className="border-t border-neutral-200 p-4 flex gap-2">
              <input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 h-10 px-4 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button onClick={sendMessage} isLoading={sending} disabled={!messageText.trim()} leftIcon={<Send size={16} />}>
                Send
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Details */}
          <div className="border border-neutral-200 rounded-lg p-4">
            <h3 className="font-semibold text-neutral-900 mb-3">Order Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Price</span>
                <span className="font-medium">${order.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Delivery</span>
                <span className="font-medium">{order.deliveryDays} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Revisions</span>
                <span className="font-medium">
                  {order.revisions === 0 ? 'Unlimited' : `${order.revisionsUsed || 0}/${order.revisions} used`}
                </span>
              </div>
              {order.acceptedAt && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Accepted</span>
                  <span className="font-medium">{new Date(order.acceptedAt).toLocaleDateString()}</span>
                </div>
              )}
              {order.deliveredAt && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Delivered</span>
                  <span className="font-medium">{new Date(order.deliveredAt).toLocaleDateString()}</span>
                </div>
              )}
              {order.completedAt && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Completed</span>
                  <span className="font-medium">{new Date(order.completedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Activity Timeline */}
          {order.activityLog && order.activityLog.length > 0 && (
            <div className="border border-neutral-200 rounded-lg p-4">
              <button onClick={() => setTimelineOpen(!timelineOpen)} className="flex items-center justify-between w-full">
                <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                  <Activity size={16} />
                  Activity Timeline
                </h3>
                {timelineOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {timelineOpen && (
                <div className="mt-3 space-y-0">
                  {order.activityLog.map((entry: ActivityLogEntry, i: number) => {
                    const performer = typeof entry.performedBy === 'object' ? entry.performedBy.name : '';
                    const icon = activityIcon[entry.action] || '\u2022';
                    return (
                      <div key={entry._id || i} className="flex gap-3 relative">
                        {i < order.activityLog.length - 1 && (
                          <div className="absolute left-[11px] top-6 bottom-0 w-px bg-neutral-200" />
                        )}
                        <span className="text-sm mt-0.5 shrink-0 w-6 text-center z-10">{icon}</span>
                        <div className="pb-4 min-w-0">
                          <p className="text-sm text-neutral-800">{entry.details}</p>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {performer && <>{performer} &middot; </>}
                            {new Date(entry.createdAt).toLocaleString([], {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Deliverables */}
          {order.deliveryNote && (
            <div className="border border-neutral-200 rounded-lg p-4">
              <h3 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                <Package size={16} />
                Delivery Note
              </h3>
              <p className="text-sm text-neutral-700">{order.deliveryNote}</p>
            </div>
          )}

          {/* Creator Actions */}
          {isCreator && !isTerminal && order.status !== 'disputed' && (
            <div className="border border-neutral-200 rounded-lg p-4">
              <h3 className="font-semibold text-neutral-900 mb-3">Actions</h3>
              <div className="space-y-2">
                {order.status === 'requested' && (
                  <>
                    <Button className="w-full" onClick={() => updateStatus('accepted')}>
                      <CheckCircle size={16} className="mr-2" />
                      Accept Order
                    </Button>
                    <Button className="w-full" variant="danger" onClick={() => updateStatus('rejected')}>
                      Reject Order
                    </Button>
                  </>
                )}
                {order.status === 'accepted' && (
                  <Button className="w-full" onClick={() => updateStatus('in_progress')}>
                    Start Working
                  </Button>
                )}
                {(order.status === 'in_progress' || order.status === 'revision_requested') && (
                  <Button className="w-full" onClick={() => updateStatus('delivered')}>
                    <Package size={16} className="mr-2" />
                    Mark as Delivered
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Buyer Actions */}
          {isBuyer && order.status === 'delivered' && (
            <div className="border border-neutral-200 rounded-lg p-4">
              <h3 className="font-semibold text-neutral-900 mb-3">Actions</h3>
              <div className="space-y-2">
                <Button className="w-full" onClick={() => updateStatus('completed', 'buyer-status')}>
                  <CheckCircle size={16} className="mr-2" />
                  Mark as Complete
                </Button>
                {(order.revisions === 0 || (order.revisionsUsed || 0) < order.revisions) ? (
                  <Button className="w-full" variant="outline" onClick={() => updateStatus('revision_requested', 'buyer-status')}>
                    <AlertCircle size={16} className="mr-2" />
                    Request Revision
                    {order.revisions > 0 && (
                      <span className="ml-1 text-xs opacity-70">({(order.revisionsUsed || 0)}/{order.revisions})</span>
                    )}
                  </Button>
                ) : (
                  <p className="text-sm text-neutral-500 text-center py-2">All {order.revisions} revisions used</p>
                )}
              </div>
            </div>
          )}

          {/* Cancel & Dispute */}
          {(canCancel || canDispute) && (
            <div className="border border-neutral-200 rounded-lg p-4">
              <h3 className="font-semibold text-neutral-900 mb-3">Resolution</h3>
              <div className="space-y-2">
                {canDispute && (
                  <Button className="w-full" variant="danger" onClick={() => setShowDisputeModal(true)}>
                    <Shield size={16} className="mr-2" />
                    Open Dispute
                  </Button>
                )}
                {canCancel && (
                  <Button className="w-full" variant="outline" onClick={() => setShowCancelModal(true)}>
                    <XCircle size={16} className="mr-2" />
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Order"
        size="md"
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowCancelModal(false)}>Back</Button>
            <Button variant="danger" onClick={handleCancel} isLoading={cancelling} disabled={!cancelReason.trim()}>
              Confirm Cancellation
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-warning/10 rounded-lg p-3 text-sm flex items-start gap-2">
            <AlertCircle size={16} className="text-warning mt-0.5 shrink-0" />
            <p className="text-neutral-700">This action cannot be undone. The order will be permanently cancelled.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Reason for cancellation *</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
              placeholder="Explain why you need to cancel this order..."
            />
          </div>
        </div>
      </Modal>

      {/* Dispute Modal */}
      <Modal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        title="Open Dispute"
        size="md"
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowDisputeModal(false)}>Back</Button>
            <Button variant="danger" onClick={handleOpenDispute} isLoading={disputing} disabled={!disputeReason.trim()}>
              Submit Dispute
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-error/10 rounded-lg p-3 text-sm flex items-start gap-2">
            <Shield size={16} className="text-error mt-0.5 shrink-0" />
            <p className="text-neutral-700">
              A dispute will pause the order and escalate it to the Flowbites team for review.
              The admin will review both sides and decide the outcome (refund, redo, or release payment).
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">What&apos;s the issue? *</label>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
              placeholder="Describe the problem - e.g., work doesn't match requirements, quality issues, unresponsive creator..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
