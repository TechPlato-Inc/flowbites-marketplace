import { z } from 'zod';
import { SearchQueryService } from './search.queryService.js';

const searchQuerySchema = z.object({
  q: z.string().min(2).max(200).optional(),
});

const autocompleteQuerySchema = z.object({
  q: z.string().min(2).max(200),
});

const searchQueryService = new SearchQueryService();

export class SearchController {
  async search(req, res, next) {
    try {
      const parsed = searchQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.json({ success: true, data: { templates: [], services: [], creators: [] } });
      }
      const { q } = parsed.data;
      if (!q) {
        return res.json({ success: true, data: { templates: [], services: [], creators: [] } });
      }

      const data = await searchQueryService.search(q);

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async autocomplete(req, res, next) {
    try {
      const parsed = autocompleteQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.json({ success: true, data: { suggestions: [] } });
      }
      const { q } = parsed.data;

      const data = await searchQueryService.autocomplete(q);

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async popular(req, res, next) {
    try {
      const data = await searchQueryService.popular();

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
