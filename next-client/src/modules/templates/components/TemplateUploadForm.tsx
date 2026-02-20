'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api/client';
import type { Category } from '@/types';
import { Button, Input } from '@/design-system';
import {
  Upload, X, Image as ImageIcon, FileArchive, Link2, Info,
  ChevronRight, ChevronLeft, Check, DollarSign, Eye,
  Globe, Figma, Monitor, AlertCircle, Send, Gift,
  ShieldCheck, Clock, XCircle, ClipboardList, Loader2,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Schema                                                             */
/* ------------------------------------------------------------------ */

const templateSchema = z.object({
  title: z.string().min(1, 'Template name is required').max(200, 'Name must be under 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description must be under 5,000 characters'),
  metaDescription: z.string().max(160, 'Meta description must be under 160 characters').optional().or(z.literal('')),
  platform: z.enum(['webflow', 'framer', 'wix'], { required_error: 'Please select a platform' }),
  category: z.string().min(1, 'Please select a category'),
  price: z.coerce.number().min(0, 'Price must be 0 or more'),
  licenseType: z.enum(['personal', 'commercial', 'extended']),
  demoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  deliveryUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type TemplateForm = z.infer<typeof templateSchema>;

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STEPS = [
  { id: 'basics', label: 'Basics', description: 'Name, platform & category' },
  { id: 'details', label: 'Details & Pricing', description: 'Description, pricing & license' },
  { id: 'media', label: 'Media & Delivery', description: 'Images and template files' },
  { id: 'review', label: 'Review & Submit', description: 'Review and publish' },
];

const PLATFORMS = [
  {
    value: 'webflow' as const,
    label: 'Webflow',
    description: 'Clone link delivery',
    Icon: Globe,
    accent: 'blue',
  },
  {
    value: 'framer' as const,
    label: 'Framer',
    description: 'Remix link delivery',
    Icon: Figma,
    accent: 'purple',
  },
  {
    value: 'wix' as const,
    label: 'Wix',
    description: 'File download delivery',
    Icon: Monitor,
    accent: 'amber',
  },
];

const LICENSES = [
  { value: 'personal' as const, label: 'Personal', description: 'For personal, non-commercial projects' },
  { value: 'commercial' as const, label: 'Commercial', description: 'For client work and commercial use' },
  { value: 'extended' as const, label: 'Extended', description: 'Unlimited usage including resale' },
];

const PLATFORM_ACCENTS: Record<string, { bg: string; border: string; activeBorder: string; text: string; ring: string }> = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   activeBorder: 'border-blue-500',   text: 'text-blue-600',   ring: 'ring-blue-500/20' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', activeBorder: 'border-purple-500', text: 'text-purple-600', ring: 'ring-purple-500/20' },
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-200',  activeBorder: 'border-amber-500',  text: 'text-amber-600',  ring: 'ring-amber-500/20' },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function extractError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    return (err as { response?: { data?: { error?: string } } }).response?.data?.error || '';
  }
  return '';
}

function getDeliveryType(platform: string) {
  if (platform === 'webflow') return 'clone_link';
  if (platform === 'framer') return 'remix_link';
  return 'file_download';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const CharCounter = ({ current, max }: { current: number; max: number }) => (
  <span className={`text-xs tabular-nums ${current > max ? 'text-error font-medium' : current > max * 0.85 ? 'text-amber-500' : 'text-neutral-400'}`}>
    {current.toLocaleString()}/{max.toLocaleString()}
  </span>
);

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type OnboardingStatus = 'loading' | 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected' | 'error';

export const TemplateUploadForm = () => {
  const router = useRouter();

  // ── Verification gate ──
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>('loading');
  const [rejectionReason, setRejectionReason] = useState('');

  // ── Step state ──
  const [currentStep, setCurrentStep] = useState(0);

  // ── Data state ──
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFree, setIsFree] = useState(true);
  const [agreed, setAgreed] = useState(false);

  // ── File state ──
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [templateFile, setTemplateFile] = useState<File | null>(null);

  // ── UI state ──
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [thumbDrag, setThumbDrag] = useState(false);
  const [galleryDrag, setGalleryDrag] = useState(false);

  // ── Form ──
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<TemplateForm>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      platform: 'webflow',
      licenseType: 'personal',
      price: 0,
      metaDescription: '',
      demoUrl: '',
      deliveryUrl: '',
    },
  });

  const selectedPlatform = watch('platform');
  const descriptionValue = watch('description') || '';
  const metaDescValue = watch('metaDescription') || '';

  // ── Effects ──

  // Check creator verification status
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/creators/onboarding/status');
        const status = data.data?.onboarding?.status || 'pending';
        setOnboardingStatus(status);
        if (status === 'rejected') {
          setRejectionReason(data.data?.onboarding?.rejectionReason || '');
        }
      } catch {
        setOnboardingStatus('error');
      }
    })();
  }, []);

  useEffect(() => {
    if (onboardingStatus !== 'approved') return;
    (async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data.data);
      } catch {
        /* silent – categories just won't load */
      }
    })();
  }, [onboardingStatus]);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setError('');
  }, [currentStep]);

  // ── File handlers ──
  const setThumbnailFile = useCallback((file: File) => {
    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  }, []);

  const removeThumbnail = useCallback(() => {
    setThumbnail(null);
    setThumbnailPreview(null);
  }, []);

  const handleThumbnailInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setThumbnailFile(file);
  }, [setThumbnailFile]);

  const handleThumbDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setThumbDrag(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleThumbDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setThumbDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) setThumbnailFile(file);
  }, [setThumbnailFile]);

  const handleGalleryInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - gallery.length;
    if (remaining <= 0) return;
    const toAdd = files.slice(0, remaining);
    setGallery(prev => [...prev, ...toAdd]);
    setGalleryPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
  }, [gallery.length]);

  const handleGalleryDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setGalleryDrag(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleGalleryDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setGalleryDrag(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    const remaining = 5 - gallery.length;
    if (remaining <= 0) return;
    const toAdd = files.slice(0, remaining);
    setGallery(prev => [...prev, ...toAdd]);
    setGalleryPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
  }, [gallery.length]);

  const removeGalleryImage = useCallback((index: number) => {
    setGallery(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleTemplateFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setTemplateFile(file);
  }, []);

  // ── Free/paid toggle ──
  const handleFreeToggle = useCallback((free: boolean) => {
    setIsFree(free);
    if (free) setValue('price', 0);
  }, [setValue]);

  // ── Platform change (reset delivery) ──
  const handlePlatformChange = useCallback((platform: 'webflow' | 'framer' | 'wix') => {
    setValue('platform', platform, { shouldValidate: true });
    setValue('deliveryUrl', '');
    setTemplateFile(null);
  }, [setValue]);

  // ── Step validation ──
  const validateStep = async (step: number): Promise<boolean> => {
    setError('');
    switch (step) {
      case 0:
        return trigger(['title', 'platform', 'category']);
      case 1: {
        const valid = await trigger(['description', 'metaDescription', 'demoUrl', 'price']);
        return valid;
      }
      case 2: {
        if (!thumbnail) { setError('Please upload a thumbnail image'); return false; }
        const plat = getValues('platform');
        if (plat === 'webflow' && !getValues('deliveryUrl')) {
          setError('Webflow clone link is required');
          return false;
        }
        if (plat === 'framer' && !getValues('deliveryUrl')) {
          setError('Framer remix link is required');
          return false;
        }
        if (plat === 'wix' && !templateFile) {
          setError('Template file (.zip) is required for Wix');
          return false;
        }
        if (getValues('deliveryUrl')) {
          return trigger(['deliveryUrl']);
        }
        return true;
      }
      default:
        return true;
    }
  };

  const goNext = async () => {
    const valid = await validateStep(currentStep);
    if (valid) setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const goBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  // ── Submit ──
  const onSubmit = async (values: TemplateForm, submitForReview: boolean) => {
    if (!thumbnail) { setError('Please upload a thumbnail image'); return; }

    const deliveryType = getDeliveryType(values.platform);

    if (deliveryType === 'clone_link' && !values.deliveryUrl) {
      setError('Webflow clone link is required'); return;
    }
    if (deliveryType === 'remix_link' && !values.deliveryUrl) {
      setError('Framer remix link is required'); return;
    }
    if (deliveryType === 'file_download' && !templateFile) {
      setError('Template file (.zip) is required'); return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('platform', values.platform);
      formData.append('category', values.category);
      formData.append('price', String(isFree ? 0 : values.price));
      formData.append('deliveryType', deliveryType);
      if (values.deliveryUrl) formData.append('deliveryUrl', values.deliveryUrl);
      if (values.licenseType) formData.append('licenseType', values.licenseType);
      if (values.demoUrl) formData.append('demoUrl', values.demoUrl);
      if (values.metaDescription) formData.append('metaDescription', values.metaDescription);
      formData.append('thumbnail', thumbnail);
      gallery.forEach(file => formData.append('gallery', file));
      if (templateFile) formData.append('templateFile', templateFile);

      const { data } = await api.post('/templates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (submitForReview) {
        await api.post(`/templates/${data.data._id}/submit`);
      }

      router.push('/dashboard/creator');
    } catch (err: unknown) {
      setError(extractError(err) || 'Failed to submit template. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  const platformInfo = PLATFORMS.find(p => p.value === selectedPlatform)!;
  const accent = PLATFORM_ACCENTS[platformInfo.accent];

  /* ── Verification gate ── */
  if (onboardingStatus !== 'approved') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center">
          {onboardingStatus === 'loading' && (
            <>
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 size={28} className="text-neutral-400 animate-spin" />
              </div>
              <h1 className="text-2xl font-display font-bold text-neutral-900 mb-2">
                Checking your account...
              </h1>
              <p className="text-neutral-500">
                Verifying your creator status. This will only take a moment.
              </p>
            </>
          )}

          {(onboardingStatus === 'pending' || onboardingStatus === 'in_progress') && (
            <>
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ClipboardList size={28} className="text-amber-500" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-neutral-900 mb-3">
                Complete Your Verification
              </h1>
              <p className="text-neutral-500 mb-8 max-w-md mx-auto">
                Before you can submit templates, you need to complete the creator onboarding process.
                This helps us verify your identity and set up your payout information.
              </p>
              <div className="space-y-3">
                <Link href="/dashboard/creator/onboarding">
                  <Button size="lg" leftIcon={<ShieldCheck size={20} />}>
                    Complete Onboarding
                  </Button>
                </Link>
                <div>
                  <Link href="/dashboard/creator" className="text-sm text-neutral-500 hover:text-neutral-700">
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </>
          )}

          {onboardingStatus === 'submitted' && (
            <>
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock size={28} className="text-blue-500" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-neutral-900 mb-3">
                Verification Under Review
              </h1>
              <p className="text-neutral-500 mb-4 max-w-md mx-auto">
                Your creator application has been submitted and is being reviewed by our team.
                You&apos;ll be able to submit templates once your account is approved.
              </p>
              <div className="inline-flex items-start gap-3 text-left bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 max-w-md">
                <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-800">
                  Reviews typically take 1–3 business days. You&apos;ll receive an email notification
                  when your application is approved.
                </p>
              </div>
              <div>
                <Link href="/dashboard/creator" className="text-sm text-neutral-500 hover:text-neutral-700">
                  Back to Dashboard
                </Link>
              </div>
            </>
          )}

          {onboardingStatus === 'rejected' && (
            <>
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle size={28} className="text-red-500" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-neutral-900 mb-3">
                Verification Not Approved
              </h1>
              <p className="text-neutral-500 mb-4 max-w-md mx-auto">
                Your creator application was not approved. Please review the feedback below
                and update your onboarding information to resubmit.
              </p>
              {rejectionReason && (
                <div className="inline-flex items-start gap-3 text-left bg-red-50 border border-red-200 rounded-xl p-4 mb-8 max-w-md">
                  <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
                  <div className="text-sm text-red-800">
                    <p className="font-semibold mb-1">Reason</p>
                    <p>{rejectionReason}</p>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                <Link href="/dashboard/creator/onboarding">
                  <Button size="lg" leftIcon={<ShieldCheck size={20} />}>
                    Update Onboarding
                  </Button>
                </Link>
                <div>
                  <Link href="/dashboard/creator" className="text-sm text-neutral-500 hover:text-neutral-700">
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </>
          )}

          {onboardingStatus === 'error' && (
            <>
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={28} className="text-neutral-400" />
              </div>
              <h1 className="text-2xl font-display font-bold text-neutral-900 mb-3">
                Unable to Verify Status
              </h1>
              <p className="text-neutral-500 mb-8 max-w-md mx-auto">
                We couldn&apos;t check your creator verification status. Please try again or contact support.
              </p>
              <div className="space-y-3">
                <Button size="lg" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
                <div>
                  <Link href="/dashboard/creator" className="text-sm text-neutral-500 hover:text-neutral-700">
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">

      {/* ── Header ── */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900 mb-2">
          Submit a Template
        </h1>
        <p className="text-neutral-500 max-w-lg mx-auto">
          Share your work with thousands of creators. Fill in the details below
          and submit your template for review.
        </p>
      </div>

      {/* ── Mobile progress ── */}
      <div className="sm:hidden mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-neutral-600 font-medium">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <span className="text-neutral-500">{STEPS[currentStep].label}</span>
        </div>
        <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Desktop stepper ── */}
      <div className="hidden sm:flex items-center mb-10">
        {STEPS.map((step, i) => {
          const isActive = i === currentStep;
          const isComplete = i < currentStep;
          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => { if (isComplete) setCurrentStep(i); }}
                disabled={!isComplete && !isActive}
                className={`flex items-center gap-3 transition-colors ${
                  isComplete ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                    : isComplete
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-neutral-100 text-neutral-400'
                }`}>
                  {isComplete ? <Check size={16} /> : i + 1}
                </div>
                <div className="text-left">
                  <div className={`text-sm font-medium ${isActive ? 'text-neutral-900' : isComplete ? 'text-primary-600' : 'text-neutral-400'}`}>
                    {step.label}
                  </div>
                  <div className={`text-xs ${isActive ? 'text-neutral-500' : 'text-neutral-400'} hidden lg:block`}>
                    {step.description}
                  </div>
                </div>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-4 ${isComplete ? 'bg-primary-300' : 'bg-neutral-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 animate-in fade-in">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="text-sm flex-1">{error}</div>
          <button type="button" onClick={() => setError('')} className="text-red-400 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Form ── */}
      <form onSubmit={(e) => e.preventDefault()}>

        {/* ============================================================ */}
        {/*  STEP 0 — Basics                                             */}
        {/* ============================================================ */}
        {currentStep === 0 && (
          <div className="space-y-8">

            {/* Template Name */}
            <div>
              <Input
                label="Template Name"
                placeholder="e.g. Horizon — SaaS Landing Page"
                error={errors.title?.message}
                helperText="Choose a unique, descriptive name. No generic names or keyword stuffing."
                {...register('title')}
              />
            </div>

            {/* Platform */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Platform <span className="text-error">*</span>
              </label>
              <p className="text-sm text-neutral-500 mb-3">
                Select the platform your template is built for. This determines how buyers will receive it.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PLATFORMS.map((p) => {
                  const isSelected = selectedPlatform === p.value;
                  const a = PLATFORM_ACCENTS[p.accent];
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => handlePlatformChange(p.value)}
                      className={`relative flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? `${a.bg} ${a.activeBorder} ring-2 ${a.ring}`
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                      <p.Icon size={28} className={isSelected ? a.text : 'text-neutral-400'} />
                      <div className="font-semibold text-sm text-neutral-900">{p.label}</div>
                      <div className="text-xs text-neutral-500">{p.description}</div>
                    </button>
                  );
                })}
              </div>
              {errors.platform && <p className="text-sm text-error mt-2">{errors.platform.message}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Category <span className="text-error">*</span>
              </label>
              <p className="text-sm text-neutral-500 mb-3">
                Choose the category that best describes your template.
              </p>
              <select
                className={`w-full h-11 rounded-lg border bg-white text-neutral-900 px-4
                  focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none
                  transition-colors duration-200
                  ${errors.category ? 'border-error' : 'border-neutral-300'}`}
                {...register('category')}
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-sm text-error mt-1.5">{errors.category.message}</p>}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/*  STEP 1 — Details & Pricing                                  */}
        {/* ============================================================ */}
        {currentStep === 1 && (
          <div className="space-y-8">

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-neutral-700">
                  Description <span className="text-error">*</span>
                </label>
                <CharCounter current={descriptionValue.length} max={5000} />
              </div>
              <p className="text-sm text-neutral-500 mb-3">
                Describe what your template includes, who it&apos;s for, and what makes it stand out.
              </p>
              <textarea
                rows={7}
                className={`w-full rounded-xl border bg-white text-neutral-900 px-4 py-3
                  placeholder:text-neutral-400
                  focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none
                  transition-colors duration-200 resize-y
                  ${errors.description ? 'border-error' : 'border-neutral-300'}`}
                placeholder="A modern, fully responsive SaaS landing page template built with..."
                {...register('description')}
              />
              {errors.description && <p className="text-sm text-error mt-1.5">{errors.description.message}</p>}
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-neutral-700">
                  Short Description
                </label>
                <CharCounter current={metaDescValue.length} max={160} />
              </div>
              <p className="text-sm text-neutral-500 mb-3">
                A brief summary for search results and social sharing (max 160 characters).
              </p>
              <textarea
                rows={2}
                className={`w-full rounded-xl border bg-white text-neutral-900 px-4 py-3
                  placeholder:text-neutral-400
                  focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none
                  transition-colors duration-200 resize-none
                  ${errors.metaDescription ? 'border-error' : 'border-neutral-300'}`}
                placeholder="A clean SaaS landing page template with CMS integration and responsive design."
                {...register('metaDescription')}
              />
              {errors.metaDescription && <p className="text-sm text-error mt-1.5">{errors.metaDescription.message}</p>}
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-200" />

            {/* Free / Paid */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Pricing <span className="text-error">*</span>
              </label>
              <p className="text-sm text-neutral-500 mb-3">
                Is this a free or paid template?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleFreeToggle(true)}
                  className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all duration-200 ${
                    isFree
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <Gift size={24} className={isFree ? 'text-primary-600' : 'text-neutral-400'} />
                  <div className="font-semibold text-sm text-neutral-900">Free</div>
                  <div className="text-xs text-neutral-500">No charge for buyers</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleFreeToggle(false)}
                  className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all duration-200 ${
                    !isFree
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <DollarSign size={24} className={!isFree ? 'text-primary-600' : 'text-neutral-400'} />
                  <div className="font-semibold text-sm text-neutral-900">Paid</div>
                  <div className="text-xs text-neutral-500">Set your own price</div>
                </button>
              </div>
            </div>

            {/* Price Input */}
            {!isFree && (
              <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                <Input
                  label="Price (USD)"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="49"
                  leftIcon={<DollarSign size={16} />}
                  error={errors.price?.message}
                  helperText="Set a competitive price. You'll earn 80% of each sale."
                  {...register('price')}
                />
              </div>
            )}

            {/* License Type */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                License Type <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {LICENSES.map((lic) => {
                  const isSelected = watch('licenseType') === lic.value;
                  return (
                    <button
                      key={lic.value}
                      type="button"
                      onClick={() => setValue('licenseType', lic.value, { shouldValidate: true })}
                      className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                      <div className="font-semibold text-sm text-neutral-900 mb-0.5">{lic.label}</div>
                      <div className="text-xs text-neutral-500">{lic.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Demo URL */}
            <Input
              label="Demo / Preview URL"
              type="url"
              placeholder="https://preview.example.com"
              error={errors.demoUrl?.message}
              helperText="A live preview link so buyers can see the template in action (optional)."
              leftIcon={<Eye size={16} />}
              {...register('demoUrl')}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/*  STEP 2 — Media & Delivery                                   */}
        {/* ============================================================ */}
        {currentStep === 2 && (
          <div className="space-y-8">

            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Primary Thumbnail <span className="text-error">*</span>
              </label>
              <p className="text-sm text-neutral-500 mb-3">
                This is the main image buyers will see in search results and listings.
                Use a high-quality screenshot or mockup (recommended 1200 x 800px).
              </p>
              <div
                onDragEnter={handleThumbDrag}
                onDragLeave={handleThumbDrag}
                onDragOver={handleThumbDrag}
                onDrop={handleThumbDrop}
                className={`rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden ${
                  thumbDrag
                    ? 'border-primary-500 bg-primary-50/50'
                    : thumbnailPreview
                      ? 'border-transparent'
                      : 'border-neutral-300 hover:border-neutral-400'
                }`}
              >
                {thumbnailPreview ? (
                  <div className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-64 sm:h-72 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-medium cursor-pointer hover:bg-neutral-100 transition-colors">
                        <Upload size={16} /> Replace
                        <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailInput} />
                      </label>
                      <button
                        type="button"
                        onClick={removeThumbnail}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                      >
                        <X size={16} /> Remove
                      </button>
                    </div>
                    {thumbnail && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                        {thumbnail.name} — {formatFileSize(thumbnail.size)}
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center py-16 cursor-pointer hover:bg-neutral-50 transition-colors">
                    <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
                      <Upload size={24} className="text-neutral-400" />
                    </div>
                    <p className="text-sm font-medium text-neutral-700 mb-1">
                      Drag and drop or click to upload
                    </p>
                    <p className="text-xs text-neutral-500">
                      PNG, JPG, or WebP — max 10 MB
                    </p>
                    <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailInput} />
                  </label>
                )}
              </div>
            </div>

            {/* Gallery */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-neutral-700">
                  Gallery Images
                </label>
                <span className="text-xs text-neutral-400">{gallery.length}/5</span>
              </div>
              <p className="text-sm text-neutral-500 mb-3">
                Add up to 5 additional screenshots to showcase different pages or sections.
                Prefer actual page screenshots over composed mockups.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {galleryPreviews.map((src, i) => (
                  <div key={i} className="relative group aspect-[16/10] rounded-xl overflow-hidden border border-neutral-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/50 text-white text-[10px] rounded">
                      {gallery[i]?.name}
                    </div>
                  </div>
                ))}

                {gallery.length < 5 && (
                  <label
                    onDragEnter={handleGalleryDrag}
                    onDragLeave={handleGalleryDrag}
                    onDragOver={handleGalleryDrag}
                    onDrop={handleGalleryDrop}
                    className={`flex flex-col items-center justify-center aspect-[16/10] rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                      galleryDrag
                        ? 'border-primary-500 bg-primary-50/50'
                        : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
                    }`}
                  >
                    <ImageIcon size={20} className="text-neutral-400 mb-1" />
                    <span className="text-xs text-neutral-500 font-medium">Add Image</span>
                    <span className="text-[10px] text-neutral-400 mt-0.5">{5 - gallery.length} remaining</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryInput} />
                  </label>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-200" />

            {/* Delivery — platform-specific */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Template Delivery <span className="text-error">*</span>
              </label>
              <p className="text-sm text-neutral-500 mb-3">
                Provide the file or link buyers will use to access your template after purchase.
              </p>

              {/* Webflow */}
              {selectedPlatform === 'webflow' && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Webflow Clone Link</p>
                      <p>Buyers will use this link to clone your template into their Webflow account. Go to your project → Share → Copy cloneable link.</p>
                    </div>
                  </div>
                  <div className="relative">
                    <Link2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="url"
                      className={`w-full h-11 rounded-lg border bg-white text-neutral-900 pl-10 pr-4
                        focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none
                        transition-colors duration-200 placeholder:text-neutral-400
                        ${errors.deliveryUrl ? 'border-error' : 'border-neutral-300'}`}
                      placeholder="https://webflow.com/made-in-webflow/website/your-template"
                      {...register('deliveryUrl')}
                    />
                  </div>
                  {errors.deliveryUrl && <p className="text-sm text-error">{errors.deliveryUrl.message}</p>}
                </div>
              )}

              {/* Framer */}
              {selectedPlatform === 'framer' && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <Info size={16} className="text-purple-600 mt-0.5 shrink-0" />
                    <div className="text-sm text-purple-800">
                      <p className="font-semibold mb-1">Framer Remix Link</p>
                      <p>Buyers will use this link to remix your template into their Framer workspace. Go to your project → Share → Copy remix link.</p>
                    </div>
                  </div>
                  <div className="relative">
                    <Link2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="url"
                      className={`w-full h-11 rounded-lg border bg-white text-neutral-900 pl-10 pr-4
                        focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none
                        transition-colors duration-200 placeholder:text-neutral-400
                        ${errors.deliveryUrl ? 'border-error' : 'border-neutral-300'}`}
                      placeholder="https://framer.com/projects/your-template--xxxx"
                      {...register('deliveryUrl')}
                    />
                  </div>
                  {errors.deliveryUrl && <p className="text-sm text-error">{errors.deliveryUrl.message}</p>}
                </div>
              )}

              {/* Wix */}
              {selectedPlatform === 'wix' && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <Info size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-sm text-amber-800">
                      <p className="font-semibold mb-1">Template File (.zip)</p>
                      <p>Upload your Wix template as a .zip file. Buyers will download it after purchase and our team will assist with the transfer process.</p>
                    </div>
                  </div>
                  {templateFile ? (
                    <div className="flex items-center gap-3 p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                      <FileArchive size={22} className="text-primary-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-neutral-900 truncate">{templateFile.name}</div>
                        <div className="text-xs text-neutral-500">{formatFileSize(templateFile.size)}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTemplateFile(null)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-3 p-4 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all duration-200">
                      <Upload size={20} className="text-neutral-400" />
                      <div>
                        <div className="text-sm font-medium text-neutral-700">Choose .zip file</div>
                        <div className="text-xs text-neutral-500">Max 100 MB</div>
                      </div>
                      <input type="file" accept=".zip" className="hidden" onChange={handleTemplateFileInput} />
                    </label>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/*  STEP 3 — Review & Submit                                    */}
        {/* ============================================================ */}
        {currentStep === 3 && (
          <div className="space-y-6">

            {/* Summary Card */}
            <div className="bg-neutral-50 rounded-2xl p-6 sm:p-8 space-y-6">
              <h3 className="text-lg font-display font-bold text-neutral-900">Template Summary</h3>

              {/* Thumbnail preview */}
              {thumbnailPreview && (
                <div className="rounded-xl overflow-hidden border border-neutral-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-48 sm:h-56 object-cover" />
                </div>
              )}

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <SummaryField label="Template Name" value={getValues('title')} />
                <SummaryField label="Platform" value={
                  <span className="inline-flex items-center gap-1.5">
                    <platformInfo.Icon size={14} className={accent.text} />
                    {platformInfo.label}
                  </span>
                } />
                <SummaryField
                  label="Category"
                  value={categories.find(c => c._id === getValues('category'))?.name || '—'}
                />
                <SummaryField
                  label="Price"
                  value={isFree ? 'Free' : `$${getValues('price')}`}
                />
                <SummaryField
                  label="License"
                  value={LICENSES.find(l => l.value === getValues('licenseType'))?.label || '—'}
                />
                <SummaryField
                  label="Demo URL"
                  value={getValues('demoUrl') || '—'}
                  truncate
                />
              </div>

              {/* Description preview */}
              <div>
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Description</span>
                <p className="text-sm text-neutral-700 mt-1 line-clamp-4 whitespace-pre-line">
                  {getValues('description')}
                </p>
              </div>

              {/* Gallery preview */}
              {galleryPreviews.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2 block">
                    Gallery ({galleryPreviews.length} image{galleryPreviews.length !== 1 ? 's' : ''})
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {galleryPreviews.map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={src} alt={`Gallery ${i + 1}`} className="w-24 h-16 object-cover rounded-lg border border-neutral-200 shrink-0" />
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery info */}
              <div>
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Delivery</span>
                <p className="text-sm text-neutral-700 mt-1">
                  {selectedPlatform === 'wix'
                    ? templateFile ? `File: ${templateFile.name} (${formatFileSize(templateFile.size)})` : '—'
                    : getValues('deliveryUrl') || '—'
                  }
                </p>
              </div>
            </div>

            {/* Edit hint */}
            <p className="text-sm text-neutral-500 text-center">
              Need to make changes? Click on a previous step above to go back and edit.
            </p>

            {/* Compliance */}
            <div className="border border-neutral-200 rounded-xl p-5">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700 leading-relaxed">
                  I confirm this template is my original work and complies with the{' '}
                  <a href="/creator-guidelines" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">
                    Creator Guidelines
                  </a>{' '}
                  and{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">
                    Terms of Service
                  </a>.
                </span>
              </label>
            </div>

            {/* Submission info */}
            <div className="flex items-start gap-3 bg-primary-50 border border-primary-200 rounded-xl p-4">
              <Info size={16} className="text-primary-600 mt-0.5 shrink-0" />
              <div className="text-sm text-primary-800">
                <p className="font-semibold mb-1">What happens next?</p>
                <p>
                  After submitting for review, our team will review your template within 3–5 business days.
                  You&apos;ll receive an email notification when your template is approved or if changes are needed.
                  Saving as a draft lets you come back and edit before submitting.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/*  Navigation                                                  */}
        {/* ============================================================ */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-neutral-200">
          {currentStep > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              leftIcon={<ChevronLeft size={18} />}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={goNext}
              rightIcon={<ChevronRight size={18} />}
            >
              Continue
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={handleSubmit((v) => onSubmit(v, false))}
              >
                {submitting ? 'Saving...' : 'Save as Draft'}
              </Button>
              <Button
                type="button"
                disabled={submitting || !agreed}
                isLoading={submitting}
                onClick={handleSubmit((v) => onSubmit(v, true))}
                leftIcon={!submitting ? <Send size={16} /> : undefined}
              >
                Submit for Review
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Summary field (used in Review step)                                */
/* ------------------------------------------------------------------ */

function SummaryField({ label, value, truncate }: { label: string; value: React.ReactNode; truncate?: boolean }) {
  return (
    <div className="min-w-0">
      <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{label}</span>
      <div className={`text-sm font-medium text-neutral-900 mt-0.5 ${truncate ? 'truncate' : ''}`}>
        {value || '—'}
      </div>
    </div>
  );
}
