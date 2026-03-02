import express from 'express';
import { SearchController } from './search.controller.js';
import { cacheResponse } from '../../middleware/cache.js';

const router = express.Router();
const searchController = new SearchController();

// Main search endpoint (templates + services + creators)
router.get('/', cacheResponse(15), searchController.search);

// Public search endpoints (cached briefly)
router.get('/autocomplete', cacheResponse(15), searchController.autocomplete);
router.get('/popular', cacheResponse(120), searchController.popular);

export default router;
