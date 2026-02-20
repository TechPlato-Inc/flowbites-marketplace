import express from 'express';
import { CreatorController } from './creator.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { uploadOnboarding } from '../../middleware/upload.js';

const router = express.Router();
const creatorController = new CreatorController();

// Onboarding routes (authenticated creators only) — must be before /:identifier
router.get('/onboarding/status', authenticate, authorize('creator', 'admin'), creatorController.getOnboardingStatus);
router.post('/onboarding/personal-info', authenticate, authorize('creator', 'admin'), creatorController.savePersonalInfo);
router.post('/onboarding/government-id', authenticate, authorize('creator', 'admin'), uploadOnboarding, creatorController.saveGovernmentId);
router.post('/onboarding/selfie', authenticate, authorize('creator', 'admin'), uploadOnboarding, creatorController.saveSelfieVerification);
router.post('/onboarding/bank-details', authenticate, authorize('creator', 'admin'), creatorController.saveBankDetails);
router.post('/onboarding/creator-reference', authenticate, authorize('creator', 'admin'), creatorController.saveCreatorReference);
router.post('/onboarding/submit', authenticate, authorize('creator', 'admin'), creatorController.submitOnboarding);
router.get('/onboarding/search', authenticate, authorize('creator', 'admin'), creatorController.searchCreators);

// Public: get creator profile with templates, shots, services
router.get('/:identifier', creatorController.getPublicProfile);

// Public: paginated templates for a creator
router.get('/:identifier/templates', creatorController.getCreatorTemplates);

// Public: paginated shots for a creator
router.get('/:identifier/shots', creatorController.getCreatorShots);

export default router;
