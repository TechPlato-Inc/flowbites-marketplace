'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button, Badge, Modal } from '@/design-system';
import { getUploadUrl } from '@/lib/api/client';
import { fetchServicesByTemplate, purchaseTemplate, requestCustomization } from '@/modules/templates/services/templates.service';
import type { Template, ServicePackage } from '@/types';
import {
  ShoppingCart, ExternalLink, Star, Wrench, Clock, RotateCcw,
  CheckCircle, ArrowRight, ChevronRight, Eye, Download,
  Shield, Copy, Heart, Share2, Check,
} from 'lucide-react';

const platformConfig: Record<string, { label: string; color: string }> = {
  webflow: { label: 'Webflow', color: 'bg-blue-100 text-blue-700' },
  framer: { label: 'Framer', color: 'bg-purple-100 text-purple-700' },
  wix: { label: 'Wix Studio', color: 'bg-emerald-100 text-emerald-700' },
};

const deliveryLabel: Record<string, string> = {
  webflow: 'Clone Link',
  framer: 'Remix Link',
  wix: 'File Download',
};

const licenseInfo: Record<string, { label: string; desc: string }> = {
  personal: { label: 'Personal', desc: 'For personal and non-commercial use only' },
  commercial: { label: 'Commercial', desc: 'Use in commercial projects, unlimited end products' },
  extended: { label: 'Extended', desc: 'Unlimited use, including SaaS and resale products' },
};

const IMG_FALLBACK = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyNTAiIGZpbGw9IiNGNUY1RjUiLz48cGF0aCBkPSJNMTc1IDEwNUgyMjVWMTQ1SDE3NVYxMDVaIiBzdHJva2U9IiNEMUQxRDEiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==';

interface TemplateDetailViewProps {
  template: Template;
}

export function TemplateDetailView({ template }: TemplateDetailViewProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [services, setServices] = useState<ServicePackage[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestRequirements, setRequestRequirements] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (template._id) {
      fetchServicesByTemplate(template._id)
        .then(setServices)
        .catch(() => setServices([]))
        .finally(() => setServicesLoading(false));
    }
  }, [template._id]);

  const handlePurchase = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    setPurchasing(true);
    setPurchaseError('');
    try {
      const { sessionUrl } = await purchaseTemplate(template._id);
      window.location.href = sessionUrl;
    } catch (err: any) {
      setPurchaseError(err?.response?.data?.error || 'Purchase failed. Please try again.');
      setPurchasing(false);
    }
  };

  const handleRequestCustomization = async () => {
    if (!requestRequirements.trim()) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    setRequesting(true);
    try {
      await requestCustomization(template._id, requestRequirements);
      setRequestSuccess(true);
    } catch (err: any) {
      setPurchaseError(err?.response?.data?.error || 'Request failed. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const closeRequestModal = () => {
    setShowRequestModal(false);
    setRequestRequirements('');
    setRequestSuccess(false);
  };

  const allImages = [template.thumbnail, ...(template.gallery || [])].filter(Boolean);
  const platform = platformConfig[template.platform] || { label: template.platform, color: 'bg-neutral-100 text-neutral-700' };
  const license = licenseInfo[template.licenseType || 'personal'] || licenseInfo.personal;
  const creator = typeof template.creatorProfileId === 'object' ? template.creatorProfileId : null;
  const creatorName = creator?.displayName || 'Creator';
  const creatorUsername = creator?.username;
  const creatorAvatar = creator?.avatar;
  const creatorLink = creatorUsername ? `/creators/${creatorUsername}` : creator?._id ? `/creators/${creator._id}` : '#';
  const formatPrice = (price: number) => price === 0 ? 'Free' : `$${price}`;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-6 pb-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-neutral-500">
          <Link href="/templates" className="hover:text-neutral-900 transition-colors">Templates</Link>
          <ChevronRight size={14} className="text-neutral-300" />
          {typeof template.category === 'object' && template.category?.name && (
            <>
              <Link href={`/templates?category=${template.category._id}`} className="hover:text-neutral-900 transition-colors">
                {template.category.name}
              </Link>
              <ChevronRight size={14} className="text-neutral-300" />
            </>
          )}
          <span className="text-neutral-900 font-medium truncate max-w-[200px]">{template.title}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              <div className="relative aspect-[16/10] bg-neutral-100 rounded-xl overflow-hidden mb-3">
                {allImages[activeImage] && (
                  <img
                    src={getUploadUrl(`images/${allImages[activeImage]}`)}
                    alt={`${template.title} — preview ${activeImage + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = IMG_FALLBACK; }}
                  />
                )}
                {template.isFeatured && (
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full shadow-sm">
                    <Star size={12} className="fill-white" /> Featured
                  </span>
                )}
                {template.madeByFlowbites && (
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 bg-primary-500 text-white text-xs font-semibold rounded-full shadow-sm">
                    <Shield size={12} /> Official
                  </span>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImage === i
                          ? 'border-primary-500 ring-2 ring-primary-500/20'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={getUploadUrl(`images/${img}`)}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).src = IMG_FALLBACK; }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Creator */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full ${platform.color}`}>
                  {platform.label}
                </span>
                {typeof template.category === 'object' && template.category?.name && (
                  <Badge variant="neutral" size="sm">{template.category.name}</Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-neutral-900 leading-tight mb-3">
                {template.title}
              </h1>

              <div className="flex items-center gap-3">
                <Link href={creatorLink} className="flex items-center gap-2.5 group">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm">
                    {creatorName.charAt(0)}
                  </div>
                  <span className="text-sm text-neutral-600 group-hover:text-primary-600 transition-colors font-medium">
                    {creatorName}
                  </span>
                </Link>
                {creator?.isVerified && (
                  <span className="inline-flex items-center gap-1 text-xs text-primary-600">
                    <CheckCircle size={14} className="fill-primary-100" /> Verified
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6 py-5 border-y border-neutral-200 mb-8">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Eye size={16} className="text-neutral-400" />
                <span className="font-medium">{(template.stats?.views || 0).toLocaleString()}</span>
                <span className="text-neutral-400">views</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Download size={16} className="text-neutral-400" />
                <span className="font-medium">{template.stats?.purchases || 0}</span>
                <span className="text-neutral-400">sales</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Heart size={16} className="text-neutral-400" />
                <span className="font-medium">{template.stats?.likes || 0}</span>
                <span className="text-neutral-400">likes</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-display font-bold text-neutral-900 mb-3">About this template</h2>
              <div className="text-neutral-600 leading-relaxed whitespace-pre-wrap">
                {template.description}
              </div>
            </div>

            {/* Tags */}
            {template.tags && template.tags.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-display font-bold text-neutral-900 mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag) => (
                    <Link
                      key={typeof tag === 'object' ? tag._id : tag}
                      href={`/templates?q=${encodeURIComponent(typeof tag === 'object' ? tag.name : tag)}`}
                      className="px-3 py-1.5 bg-neutral-100 text-neutral-600 text-sm rounded-lg hover:bg-neutral-200 transition-colors"
                    >
                      {typeof tag === 'object' ? tag.name : tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Customization Services */}
            {!servicesLoading && (
              <div className="mt-4 pt-8 border-t border-neutral-200" id="customization-section">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Wrench size={18} className="text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold text-neutral-900">Need help customizing?</h2>
                    <p className="text-sm text-neutral-500">Professional customization services available</p>
                  </div>
                </div>

                {services.length > 0 ? (
                  <>
                    <div className="space-y-3 mb-4">
                      {services.map((pkg) => (
                        <Link
                          key={pkg._id}
                          href={`/services/${pkg.slug}`}
                          className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/30 transition-all group"
                        >
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors">
                              {pkg.name}
                            </h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500">
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {pkg.deliveryDays}-day delivery
                              </span>
                              <span className="flex items-center gap-1">
                                <RotateCcw size={14} />
                                {pkg.revisions === 0 ? 'Unlimited' : pkg.revisions} revision{pkg.revisions !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            <span className="text-lg font-bold text-neutral-900">${pkg.price}</span>
                            <ArrowRight size={18} className="text-neutral-400 group-hover:text-primary-600 transition-colors" />
                          </div>
                        </Link>
                      ))}
                    </div>
                    <p className="text-sm text-neutral-500">
                      Need something different?{' '}
                      <button
                        onClick={() => {
                          if (!isAuthenticated) { router.push('/login'); return; }
                          setShowRequestModal(true);
                        }}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Request custom work
                      </button>
                    </p>
                  </>
                ) : (
                  <div className="border border-dashed border-neutral-300 rounded-xl p-6 bg-neutral-50/50">
                    <p className="text-neutral-600 mb-4">
                      The creator doesn&apos;t offer customization services for this template yet.
                      Our <strong>Flowbites team</strong> can customize it for you.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Wrench size={16} />}
                      onClick={() => {
                        if (!isAuthenticated) { router.push('/login'); return; }
                        setShowRequestModal(true);
                      }}
                    >
                      Request Customization
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-20 space-y-4">
              {/* Purchase Card */}
              <div className="border border-neutral-200 rounded-xl p-5 sm:p-6 bg-white">
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="text-3xl font-display font-bold text-neutral-900">
                    {formatPrice(template.price)}
                  </span>
                </div>

                {purchaseError && (
                  <div className="bg-error-light border border-error/20 text-error-dark rounded-lg px-3 py-2 text-sm mb-4">
                    {purchaseError}
                  </div>
                )}

                <div className="space-y-2.5 mb-5">
                  <Button className="w-full" size="lg" leftIcon={<ShoppingCart size={18} />} onClick={handlePurchase} isLoading={purchasing}>
                    {template.price === 0 ? 'Get for Free' : 'Purchase Template'}
                  </Button>
                  {template.demoUrl && (
                    <Button className="w-full" variant="outline" size="lg" rightIcon={<ExternalLink size={16} />}
                      onClick={() => window.open(template.demoUrl, '_blank', 'noopener,noreferrer')}>
                      Live Preview
                    </Button>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-t border-neutral-100">
                    <span className="text-neutral-500">Platform</span>
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${platform.color}`}>
                      {platform.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Delivery</span>
                    <span className="font-medium text-neutral-900 flex items-center gap-1.5">
                      <Copy size={13} className="text-neutral-400" />
                      {deliveryLabel[template.platform] || 'Download'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">License</span>
                    <span className="font-medium text-neutral-900 capitalize">{license.label}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <div className="flex items-start gap-2">
                    <Shield size={16} className="text-success mt-0.5 shrink-0" />
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      {license.desc}. <Link href="/licenses" className="text-primary-500 hover:text-primary-600">Learn more</Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Creator Card */}
              <div className="border border-neutral-200 rounded-xl p-5 bg-white">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Created by</h3>
                <Link href={creatorLink} className="flex items-center gap-3 group">
                  <div className="w-11 h-11 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
                    {creatorName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors truncate">
                      {creatorName}
                    </div>
                    {creatorUsername && <div className="text-xs text-neutral-400">@{creatorUsername}</div>}
                  </div>
                  <ArrowRight size={16} className="ml-auto text-neutral-300 group-hover:text-primary-500 transition-colors shrink-0" />
                </Link>
                {creator?.stats && (
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
                    <span>{creator.stats.templateCount || 0} templates</span>
                    <span>{creator.stats.totalSales || 0} sales</span>
                  </div>
                )}
              </div>

              {/* Share */}
              <div className="border border-neutral-200 rounded-xl p-5 bg-white">
                <button onClick={handleShare} className="w-full flex items-center justify-center gap-2 py-2 text-sm text-neutral-600 hover:text-neutral-900 font-medium transition-colors">
                  {copied ? (
                    <><Check size={16} className="text-success" /><span className="text-success">Link copied!</span></>
                  ) : (
                    <><Share2 size={16} />Share this template</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-neutral-200 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] z-40">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="shrink-0">
            <span className="text-xl font-display font-bold text-neutral-900">{formatPrice(template.price)}</span>
          </div>
          <Button className="flex-1" size="lg" leftIcon={<ShoppingCart size={18} />} onClick={handlePurchase} isLoading={purchasing}>
            {template.price === 0 ? 'Get Free' : 'Purchase'}
          </Button>
        </div>
      </div>
      <div className="h-20 lg:hidden" />

      {/* Request Customization Modal */}
      <Modal isOpen={showRequestModal} onClose={closeRequestModal}
        title={requestSuccess ? 'Request Submitted' : 'Request Customization'} size="md"
        footer={requestSuccess ? (<Button onClick={closeRequestModal}>Close</Button>) : (
          <div className="flex gap-3">
            <Button variant="ghost" onClick={closeRequestModal}>Cancel</Button>
            <Button onClick={handleRequestCustomization} isLoading={requesting} disabled={!requestRequirements.trim()}>
              Submit Request
            </Button>
          </div>
        )}>
        {requestSuccess ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={24} className="text-success" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Request received!</h3>
            <p className="text-neutral-600">The Flowbites team will review your request and get back to you within 24 hours.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-primary-50 rounded-lg p-3 text-sm">
              <p className="text-primary-800"><strong>Template:</strong> {template.title}</p>
              <p className="text-primary-700 mt-1">Our team will review your requirements and assign an experienced creator or handle it in-house.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">What do you need customized? *</label>
              <textarea value={requestRequirements} onChange={(e) => setRequestRequirements(e.target.value)} rows={5}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none text-sm"
                placeholder="Describe what you need — custom colors, new sections, content changes, integrations, etc." />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
