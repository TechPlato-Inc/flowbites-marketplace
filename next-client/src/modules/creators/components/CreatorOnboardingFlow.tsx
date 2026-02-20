'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import { Input } from '@/design-system';
import {
  User,
  CreditCard,
  FileCheck,
  Camera,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  AlertCircle,
  Loader2,
  Send,
  Search,
  Shield,
} from 'lucide-react';

/* ===== TYPES ===== */

interface OnboardingData {
  status: string;
  completedSteps: string[];
  onboarding: Record<string, unknown>;
}

const STEPS = [
  { key: 'personal_info', label: 'Personal Info', icon: User },
  { key: 'government_id', label: 'Government ID', icon: FileCheck },
  { key: 'selfie_verification', label: 'ID Verification', icon: Camera },
  { key: 'bank_details', label: 'Bank Details', icon: CreditCard },
  { key: 'creator_reference', label: 'Creator Reference', icon: Users },
];

/* ===== MAIN COMPONENT ===== */

export const CreatorOnboardingFlow = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    displayName: '',
    phone: '',
    country: '',
    city: '',
    address: '',
  });

  const [govId, setGovId] = useState({
    govIdType: 'national_id' as string,
    govIdNumber: '',
  });
  const [govIdFrontFile, setGovIdFrontFile] = useState<File | null>(null);
  const [govIdBackFile, setGovIdBackFile] = useState<File | null>(null);

  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankRoutingNumber: '',
    bankSwiftCode: '',
    bankCountry: '',
  });

  const [creatorRef, setCreatorRef] = useState({
    referenceCreatorUsername: '',
    referenceNote: '',
  });
  const [searchResults, setSearchResults] = useState<Array<{ displayName: string; username: string }>>([]);
  const [searching, setSearching] = useState(false);

  // Fetch onboarding status
  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await api.get('/creators/onboarding/status');
      setOnboardingData(data.data);
      const completed = data.data.completedSteps || [];
      // Pre-fill form data from saved onboarding
      const ob = data.data.onboarding || {};
      if (ob.fullName) setPersonalInfo(p => ({ ...p, fullName: ob.fullName, phone: ob.phone || '', country: ob.country || '', city: ob.city || '', address: ob.address || '' }));
      if (ob.govIdType) setGovId({ govIdType: ob.govIdType, govIdNumber: ob.govIdNumber || '' });
      if (ob.bankName) setBankDetails({
        bankName: ob.bankName || '',
        bankAccountName: ob.bankAccountName || '',
        bankAccountNumber: ob.bankAccountNumber || '',
        bankRoutingNumber: ob.bankRoutingNumber || '',
        bankSwiftCode: ob.bankSwiftCode || '',
        bankCountry: ob.bankCountry || '',
      });
      if (ob.referenceCreatorUsername) setCreatorRef({
        referenceCreatorUsername: ob.referenceCreatorUsername || '',
        referenceNote: ob.referenceNote || '',
      });

      // Set to first incomplete step
      const firstIncomplete = STEPS.findIndex(s => !completed.includes(s.key));
      if (firstIncomplete >= 0) setCurrentStep(firstIncomplete);
      else setCurrentStep(STEPS.length - 1);

      if (data.data.status === 'submitted') {
        setSuccess('Your application has been submitted and is under review.');
      }
      if (data.data.status === 'approved') {
        setSuccess('Your account has been verified! You can start selling.');
      }
    } catch (err) {
      console.error('Failed to fetch onboarding status', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const isStepComplete = (stepKey: string) => {
    return onboardingData?.completedSteps?.includes(stepKey) || false;
  };

  const isSubmitted = onboardingData?.status === 'submitted' || onboardingData?.status === 'approved';

  // Save step handlers
  const savePersonalInfo = async () => {
    if (!personalInfo.fullName || !personalInfo.phone || !personalInfo.country) {
      setError('Please fill in all required fields');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post('/creators/onboarding/personal-info', personalInfo);
      setOnboardingData(prev => prev ? { ...prev, completedSteps: [...(prev.completedSteps || []), 'personal_info'] } : prev);
      setCurrentStep(1);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const saveGovernmentId = async () => {
    if (!govId.govIdType || !govId.govIdNumber) {
      setError('Please fill in all required fields');
      return;
    }
    if (!govIdFrontFile && !onboardingData?.onboarding?.govIdFront) {
      setError('Please upload the front of your ID');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('govIdType', govId.govIdType);
      formData.append('govIdNumber', govId.govIdNumber);
      if (govIdFrontFile) formData.append('govIdFront', govIdFrontFile);
      if (govIdBackFile) formData.append('govIdBack', govIdBackFile);

      await api.post('/creators/onboarding/government-id', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setOnboardingData(prev => prev ? { ...prev, completedSteps: [...new Set([...(prev.completedSteps || []), 'government_id'])] } : prev);
      setCurrentStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const saveSelfie = async () => {
    if (!selfieFile && !onboardingData?.onboarding?.selfieWithId) {
      setError('Please upload a selfie holding your ID');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      if (selfieFile) formData.append('selfieWithId', selfieFile);

      await api.post('/creators/onboarding/selfie', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setOnboardingData(prev => prev ? { ...prev, completedSteps: [...new Set([...(prev.completedSteps || []), 'selfie_verification'])] } : prev);
      setCurrentStep(3);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const saveBankInfo = async () => {
    if (!bankDetails.bankName || !bankDetails.bankAccountName || !bankDetails.bankAccountNumber) {
      setError('Please fill in all required fields');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post('/creators/onboarding/bank-details', bankDetails);
      setOnboardingData(prev => prev ? { ...prev, completedSteps: [...new Set([...(prev.completedSteps || []), 'bank_details'])] } : prev);
      setCurrentStep(4);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const saveReference = async () => {
    if (!creatorRef.referenceCreatorUsername) {
      setError('Please provide a creator reference username');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post('/creators/onboarding/creator-reference', creatorRef);
      setOnboardingData(prev => prev ? { ...prev, completedSteps: [...new Set([...(prev.completedSteps || []), 'creator_reference'])] } : prev);
      setSuccess('All steps completed! You can now submit your application.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const submitApplication = async () => {
    setSaving(true);
    setError('');
    try {
      await api.post('/creators/onboarding/submit');
      setSuccess('Application submitted successfully! We will review your profile and get back to you.');
      setOnboardingData(prev => prev ? { ...prev, status: 'submitted' } : prev);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit');
    } finally {
      setSaving(false);
    }
  };

  // Search creators for reference
  const searchCreators = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const { data } = await api.get(`/creators/onboarding/search?q=${encodeURIComponent(query)}`);
      setSearchResults(data.data || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const stepSaveHandlers = [savePersonalInfo, saveGovernmentId, saveSelfie, saveBankInfo, saveReference];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const allComplete = STEPS.every(s => isStepComplete(s.key));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-primary-500" />
          <h1 className="text-2xl font-bold text-neutral-900">Creator Verification</h1>
        </div>
        <p className="text-neutral-500">
          Complete all steps to verify your identity and start selling on Flowbites Marketplace.
        </p>
      </div>

      {/* Submitted / Approved State */}
      {isSubmitted && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <h2 className="font-semibold text-green-800">
              {onboardingData?.status === 'approved' ? 'Account Verified' : 'Application Submitted'}
            </h2>
          </div>
          <p className="text-green-700 text-sm">
            {onboardingData?.status === 'approved'
              ? 'Your creator account is verified. You can now upload and sell templates.'
              : 'Your application is under review. We\'ll notify you once it\'s been processed. This typically takes 1-3 business days.'}
          </p>
          {onboardingData?.status === 'approved' && (
            <button
              onClick={() => router.push('/dashboard/creator')}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Rejected State */}
      {onboardingData?.status === 'rejected' && (
        <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h2 className="font-semibold text-red-800">Application Rejected</h2>
          </div>
          <p className="text-red-700 text-sm">
            {onboardingData.onboarding?.rejectionReason as string || 'Your application was rejected. Please update the required information and resubmit.'}
          </p>
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STEPS.map((step, i) => {
          const completed = isStepComplete(step.key);
          const active = i === currentStep;
          return (
            <button
              key={step.key}
              onClick={() => !isSubmitted && setCurrentStep(i)}
              disabled={isSubmitted}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                active
                  ? 'bg-primary-500 text-white'
                  : completed
                  ? 'bg-green-100 text-green-700'
                  : 'bg-neutral-100 text-neutral-500'
              } ${isSubmitted ? 'opacity-60 cursor-default' : 'cursor-pointer hover:opacity-80'}`}
            >
              {completed ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <step.icon className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{i + 1}</span>
            </button>
          );
        })}
      </div>

      {/* Error / Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      {success && !isSubmitted && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}

      {/* Step Content */}
      {!isSubmitted && (
        <div className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8">
          {/* Step 1: Personal Info */}
          {currentStep === 0 && (
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-1">Personal Information</h2>
              <p className="text-sm text-neutral-500 mb-6">Tell us about yourself. This information is used for identity verification.</p>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Full Legal Name *"
                  type="text"
                  value={personalInfo.fullName}
                  onChange={e => setPersonalInfo(p => ({ ...p, fullName: e.target.value }))}
                  placeholder="As it appears on your ID"
                  inputSize="sm"
                />
                <Input
                  label="Display Name"
                  type="text"
                  value={personalInfo.displayName}
                  onChange={e => setPersonalInfo(p => ({ ...p, displayName: e.target.value }))}
                  placeholder="Your public creator name"
                  inputSize="sm"
                />
                <Input
                  label="Phone Number *"
                  type="tel"
                  value={personalInfo.phone}
                  onChange={e => setPersonalInfo(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+1 (555) 000-0000"
                  inputSize="sm"
                />
                <Input
                  label="Country *"
                  type="text"
                  value={personalInfo.country}
                  onChange={e => setPersonalInfo(p => ({ ...p, country: e.target.value }))}
                  placeholder="United States"
                  inputSize="sm"
                />
                <Input
                  label="City"
                  type="text"
                  value={personalInfo.city}
                  onChange={e => setPersonalInfo(p => ({ ...p, city: e.target.value }))}
                  placeholder="San Francisco"
                  inputSize="sm"
                />
                <Input
                  label="Address"
                  type="text"
                  value={personalInfo.address}
                  onChange={e => setPersonalInfo(p => ({ ...p, address: e.target.value }))}
                  placeholder="123 Main Street"
                  inputSize="sm"
                />
              </div>
            </div>
          )}

          {/* Step 2: Government ID */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-1">Government ID</h2>
              <p className="text-sm text-neutral-500 mb-6">Upload a valid government-issued photo ID for identity verification.</p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">ID Type *</label>
                <select
                  value={govId.govIdType}
                  onChange={e => setGovId(p => ({ ...p, govIdType: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="national_id">National ID Card</option>
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver's License</option>
                </select>
              </div>

              <div className="mb-4">
                <Input
                  label="ID Number *"
                  type="text"
                  value={govId.govIdNumber}
                  onChange={e => setGovId(p => ({ ...p, govIdNumber: e.target.value }))}
                  placeholder="Enter your ID number"
                  inputSize="sm"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FileUploadBox
                  label="Front of ID *"
                  file={govIdFrontFile}
                  onFileChange={setGovIdFrontFile}
                  existing={onboardingData?.onboarding?.govIdFront as string}
                />
                <FileUploadBox
                  label="Back of ID (if applicable)"
                  file={govIdBackFile}
                  onFileChange={setGovIdBackFile}
                  existing={onboardingData?.onboarding?.govIdBack as string}
                />
              </div>
            </div>
          )}

          {/* Step 3: Selfie Verification */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-1">ID Verification Selfie</h2>
              <p className="text-sm text-neutral-500 mb-6">Take a clear selfie of yourself holding your government ID next to your face. Both your face and the ID should be clearly visible.</p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-amber-800 mb-2">Photo Requirements:</h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>- Your face and ID must both be clearly visible</li>
                  <li>- Ensure good lighting — no heavy shadows</li>
                  <li>- The ID text should be readable in the photo</li>
                  <li>- Do not wear sunglasses or a hat</li>
                </ul>
              </div>

              <FileUploadBox
                label="Selfie with ID *"
                file={selfieFile}
                onFileChange={setSelfieFile}
                existing={onboardingData?.onboarding?.selfieWithId as string}
              />
            </div>
          )}

          {/* Step 4: Bank Details */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-1">Bank Details</h2>
              <p className="text-sm text-neutral-500 mb-6">Provide your bank account details for receiving payouts. All information is encrypted and stored securely.</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Bank Name *</label>
                  <input
                    type="text"
                    value={bankDetails.bankName}
                    onChange={e => setBankDetails(p => ({ ...p, bankName: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g. Chase, Bank of America"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Account Holder Name *</label>
                  <input
                    type="text"
                    value={bankDetails.bankAccountName}
                    onChange={e => setBankDetails(p => ({ ...p, bankAccountName: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Full name on account"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Account Number *</label>
                  <input
                    type="text"
                    value={bankDetails.bankAccountNumber}
                    onChange={e => setBankDetails(p => ({ ...p, bankAccountNumber: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Account number or IBAN"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Routing Number</label>
                  <input
                    type="text"
                    value={bankDetails.bankRoutingNumber}
                    onChange={e => setBankDetails(p => ({ ...p, bankRoutingNumber: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="ABA routing number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">SWIFT/BIC Code</label>
                  <input
                    type="text"
                    value={bankDetails.bankSwiftCode}
                    onChange={e => setBankDetails(p => ({ ...p, bankSwiftCode: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="For international transfers"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Bank Country</label>
                  <input
                    type="text"
                    value={bankDetails.bankCountry}
                    onChange={e => setBankDetails(p => ({ ...p, bankCountry: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Country where bank is located"
                  />
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Security:</strong> Your bank details are encrypted at rest and only used for processing payouts.
                  We never share your financial information with third parties.
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Creator Reference */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-1">Creator Reference</h2>
              <p className="text-sm text-neutral-500 mb-6">
                Provide a reference from an existing creator on Flowbites Marketplace. This helps us verify that you are a legitimate creator.
                The referenced creator should be someone who can vouch for your work.
              </p>

              <div className="mb-4 relative">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Creator Username *</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={creatorRef.referenceCreatorUsername}
                    onChange={e => {
                      setCreatorRef(p => ({ ...p, referenceCreatorUsername: e.target.value }));
                      searchCreators(e.target.value);
                    }}
                    className="w-full pl-9 pr-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Search by creator username..."
                  />
                  {searching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-neutral-400" />
                  )}
                </div>
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {searchResults.map(creator => (
                      <button
                        key={creator.username}
                        onClick={() => {
                          setCreatorRef(p => ({ ...p, referenceCreatorUsername: creator.username }));
                          setSearchResults([]);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
                          {creator.displayName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{creator.displayName}</p>
                          <p className="text-xs text-neutral-500">@{creator.username}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">How do you know this creator?</label>
                <textarea
                  value={creatorRef.referenceNote}
                  onChange={e => setCreatorRef(p => ({ ...p, referenceNote: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Describe your relationship with this creator (e.g. colleague, fellow designer, community member)..."
                />
              </div>

              <div className="mt-4 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
                <p className="text-sm text-neutral-600">
                  <strong>Why do we need a reference?</strong> References from established creators help us maintain
                  marketplace quality and trust. The referenced creator may be contacted to verify your identity.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200">
            <button
              onClick={() => { setCurrentStep(c => c - 1); setError(''); setSuccess(''); }}
              disabled={currentStep === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-3">
              {allComplete && (
                <button
                  onClick={submitApplication}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Application
                </button>
              )}
              <button
                onClick={() => { setError(''); stepSaveHandlers[currentStep](); }}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-semibold disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Save & Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ===== FILE UPLOAD BOX ===== */

const FileUploadBox = ({
  label,
  file,
  onFileChange,
  existing,
}: {
  label: string;
  file: File | null;
  onFileChange: (f: File | null) => void;
  existing?: string;
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>
      <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all">
        {file ? (
          <div className="text-center px-4">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-neutral-700 font-medium truncate max-w-[200px]">{file.name}</p>
            <p className="text-xs text-neutral-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : existing ? (
          <div className="text-center px-4">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-green-600 font-medium">Previously uploaded</p>
            <p className="text-xs text-neutral-400">Click to replace</p>
          </div>
        ) : (
          <div className="text-center px-4">
            <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-sm text-neutral-500">Click to upload</p>
            <p className="text-xs text-neutral-400">JPG, PNG up to 10MB</p>
          </div>
        )}
        <input
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={e => onFileChange(e.target.files?.[0] || null)}
        />
      </label>
    </div>
  );
};
