import express from 'express';
import { CreatorController } from './creator.controller.js';
import { authenticate, can } from '../../middleware/auth.js';
import { uploadOnboarding } from '../../middleware/upload.js';

const router = express.Router();
const creatorController = new CreatorController();

// Onboarding routes (authenticated creators only) — must be before /:identifier
router.get('/onboarding/status', authenticate, can('creators.onboarding'), creatorController.getOnboardingStatus);
router.post('/onboarding/personal-info', authenticate, can('creators.onboarding'), creatorController.savePersonalInfo);
router.post('/onboarding/government-id', authenticate, can('creators.onboarding'), uploadOnboarding, creatorController.saveGovernmentId);
router.post('/onboarding/selfie', authenticate, can('creators.onboarding'), uploadOnboarding, creatorController.saveSelfieVerification);
router.post('/onboarding/bank-details', authenticate, can('creators.onboarding'), creatorController.saveBankDetails);
router.post('/onboarding/creator-reference', authenticate, can('creators.onboarding'), creatorController.saveCreatorReference);
router.post('/onboarding/submit', authenticate, can('creators.onboarding'), creatorController.submitOnboarding);
router.get('/onboarding/search', authenticate, can('creators.onboarding'), creatorController.searchCreators);

// Stripe Connect
router.post('/connect/onboard', authenticate, can('creators.onboarding'), creatorController.connectStripe);
router.get('/connect/status', authenticate, can('creators.onboarding'), creatorController.getConnectStatus);
router.get('/connect/dashboard', authenticate, can('creators.onboarding'), creatorController.getStripeDashboard);

// Public: list all verified creators
router.get('/', creatorController.getAll);

// Public: get creator profile with templates, shots, services
router.get('/:identifier', creatorController.getPublicProfile);

// Public: paginated templates for a creator
router.get('/:identifier/templates', creatorController.getCreatorTemplates);

// Public: paginated shots for a creator
router.get('/:identifier/shots', creatorController.getCreatorShots);

export default router;
