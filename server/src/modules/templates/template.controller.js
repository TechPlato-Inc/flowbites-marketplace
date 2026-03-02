import { Template } from './template.model.js';
import { TemplateQueryService } from './template.queryService.js';
import { TemplateWriteService } from './template.writeService.js';
import { AnalyticsService } from '../analytics/analytics.service.js';
import { rbacService } from '../rbac/rbac.service.js';
import { listTemplatesQuerySchema } from './template.validator.js';
import { eventBus, EVENTS } from '../../shared/eventBus.js';

const queryService = new TemplateQueryService();
const writeService = new TemplateWriteService();
const analyticsService = new AnalyticsService();

// In-memory view dedup: templateId:ip -> timestamp
const viewDedup = new Map();
const VIEW_DEDUP_TTL = 60 * 60 * 1000; // 1 hour

export class TemplateController {
  async create(req, res, next) {
    try {
      const isAdmin = rbacService.hasPermission(req.user.permissions, 'templates.approve');
      const template = await writeService.create(req.user._id, req.body, req.files, isAdmin);
      res.status(201).json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const parsed = listTemplatesQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: 'Invalid query parameters', details: parsed.error.issues });
      }
      const result = await queryService.getAll(parsed.data);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getMyTemplates(req, res, next) {
    try {
      const parsed = listTemplatesQuerySchema.safeParse(req.query);
      const filters = parsed.success ? parsed.data : {};
      const result = await queryService.getAll({ creatorId: req.user._id, ...filters });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const template = await queryService.getById(req.params.id);
      res.json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  }

  async trackView(req, res, next) {
    try {
      const { id } = req.params;
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const dedupKey = `${id}:${ip}`;

      // Check dedup — 1 view per IP per template per hour
      const lastView = viewDedup.get(dedupKey);
      if (lastView && Date.now() - lastView < VIEW_DEDUP_TTL) {
        return res.json({ success: true, data: { counted: false } });
      }

      viewDedup.set(dedupKey, Date.now());

      // Increment view counter
      await Template.findByIdAndUpdate(id, { $inc: { 'stats.views': 1 } });

      // Emit domain event
      eventBus.emit(EVENTS.TEMPLATE_VIEWED, { templateId: id, viewerIp: ip });

      // Track analytics event (non-blocking)
      analyticsService.trackEvent('view_template', req.user?._id || null, {
        templateId: id,
      }, {
        page: req.headers.referer,
        userAgent: req.headers['user-agent'],
        ipAddress: ip,
      }).catch(() => {});

      res.json({ success: true, data: { counted: true } });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const template = await writeService.update(req.params.id, req.user._id, req.body, req.files || {});
      res.json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await writeService.delete(req.params.id, req.user._id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async submit(req, res, next) {
    try {
      const template = await writeService.submitForReview(req.params.id, req.user._id);
      res.json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  }
}
