'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUploadUrl } from '@/lib/api/client';
import { useAuthStore } from '@/stores/authStore';
import type { ServicePackage } from '@/types';
import { Button, Badge, Modal } from '@/design-system';
import { Clock, RotateCcw, CheckCircle, ShoppingCart, ExternalLink, AlertTriangle } from 'lucide-react';
import { orderService } from '@/modules/services/services/services.service';

interface ServiceDetailViewProps {
  service: ServicePackage;
}

export function ServiceDetailView({ service: pkg }: ServiceDetailViewProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState('');

  const handleOrder = async () => {
    if (!requirements.trim()) return;
    setOrdering(true);
    setOrderError('');
    try {
      const result = await orderService(pkg._id, requirements);
      window.location.href = result.sessionUrl;
    } catch (err: unknown) {
      const msg = (err && typeof err === 'object' && 'response' in err)
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      setOrderError(msg || 'Failed to place order. Please try again.');
      setOrdering(false);
    }
  };

  const creator = typeof pkg.creatorId === 'object' ? pkg.creatorId : null;

  return (
    <div className="max-w-8xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Title */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="neutral">{pkg.category.replace(/-/g, ' ')}</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-neutral-900 mb-2">
              {pkg.name}
            </h1>
            {creator && (
              <p className="text-lg text-neutral-600">
                By{' '}
                <Link
                  href={`/creators/${creator._id}`}
                  className="hover:text-primary-600 transition-colors"
                >
                  {creator.name}
                </Link>
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">About this service</h2>
            <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">{pkg.description}</p>
          </div>

          {/* Features */}
          {pkg.features.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-3">What&apos;s included</h2>
              <ul className="space-y-2">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle size={18} className="text-success mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {pkg.requirements && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-3">What you&apos;ll need to provide</h2>
              <p className="text-neutral-700">{pkg.requirements}</p>
            </div>
          )}

          {/* Linked Template */}
          {pkg.templateId && typeof pkg.templateId === 'object' && (
            <div className="mb-8 p-4 border border-neutral-200 rounded-xl">
              <h2 className="text-sm font-semibold text-neutral-500 uppercase mb-3">Based on template</h2>
              <Link
                href={`/templates/${pkg.templateId.slug}`}
                className="flex items-center gap-3 hover:bg-neutral-50 -m-2 p-2 rounded-lg transition-colors"
              >
                <div className="w-16 h-10 bg-neutral-200 rounded overflow-hidden flex-shrink-0">
                  {pkg.templateId.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getUploadUrl(`images/${pkg.templateId.thumbnail}`)} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">{pkg.templateId.title}</p>
                  <p className="text-sm text-neutral-500">{pkg.templateId.price === 0 ? 'Free' : `$${pkg.templateId.price}`}</p>
                </div>
                <ExternalLink size={16} className="text-neutral-400" />
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <div className="border border-neutral-200 rounded-xl p-4 sm:p-6 lg:sticky lg:top-20">
            <div className="text-3xl sm:text-4xl font-display font-bold text-neutral-900 mb-2">
              ${pkg.price}
            </div>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex items-center gap-2 text-neutral-600">
                <Clock size={16} />
                <span>{pkg.deliveryDays} day delivery</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <RotateCcw size={16} />
                <span>{pkg.revisions === 0 ? 'Unlimited' : pkg.revisions} revision{pkg.revisions !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <CheckCircle size={16} />
                <span>{pkg.stats.completed} completed orders</span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              leftIcon={<ShoppingCart size={20} />}
              onClick={() => {
                if (!isAuthenticated) {
                  router.push('/login');
                  return;
                }
                setShowOrderModal(true);
              }}
            >
              Order This Service
            </Button>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => { setShowOrderModal(false); setOrderError(''); }}
        title="Place Service Order"
        size="md"
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => { setShowOrderModal(false); setOrderError(''); }}>
              Cancel
            </Button>
            <Button
              onClick={handleOrder}
              isLoading={ordering}
              disabled={!requirements.trim()}
            >
              Place Order &mdash; ${pkg.price}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {orderError && (
            <div className="bg-error-light border border-error/20 text-error-dark rounded-lg px-3 py-2 text-sm flex items-center gap-2">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{orderError}</span>
            </div>
          )}
          <div>
            <p className="text-sm text-neutral-600 mb-4">
              Describe your project requirements so the creator can get started. Be as detailed as possible.
            </p>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Project Requirements *
            </label>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none text-sm"
              placeholder="Describe what you need, including any specific details, colors, content, etc."
            />
          </div>
          <div className="bg-neutral-50 rounded-lg p-3 text-sm text-neutral-600">
            <p><strong>Delivery:</strong> {pkg.deliveryDays} day{pkg.deliveryDays > 1 ? 's' : ''}</p>
            <p><strong>Revisions:</strong> {pkg.revisions === 0 ? 'Unlimited' : pkg.revisions}</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
