import { UIShot, ShotLike, ShotSave } from './uiShort.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { AuditLog } from '../audit/auditLog.model.js';
import { toUiShortDTO, toAdminUiShortDTO } from './dto/uiShort.dto.js';

export class UIShotService {
  async create(creatorId, data, imageFile) {
    if (!imageFile) {
      throw new AppError('Image is required', 400);
    }

    const shot = await UIShot.create({
      ...data,
      creatorId,
      image: imageFile.filename
    });

    return toUiShortDTO(shot);
  }

  async getAll(filters = {}) {
    const { page = 1, limit = 20, sort = 'recent', search } = filters;

    let sortOption = {};
    switch (sort) {
      case 'recent':
        sortOption = { createdAt: -1 };
        break;
      case 'popular':
        sortOption = { 'stats.likes': -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const query = { isPublished: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const [shots, total] = await Promise.all([
      UIShot.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('creatorId', 'name avatar')
        .populate('templateId', 'title price')
        .lean(),
      UIShot.countDocuments(query)
    ]);

    return {
      shots: shots.map(toUiShortDTO),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async toggleLike(userId, shotId) {
    const existingLike = await ShotLike.findOne({ shotId, userId });

    if (existingLike) {
      await existingLike.deleteOne();
      await UIShot.findByIdAndUpdate(shotId, { $inc: { 'stats.likes': -1 } });
      return { liked: false };
    } else {
      await ShotLike.create({ shotId, userId });
      await UIShot.findByIdAndUpdate(shotId, { $inc: { 'stats.likes': 1 } });
      return { liked: true };
    }
  }

  async toggleSave(userId, shotId) {
    const existingSave = await ShotSave.findOne({ shotId, userId });

    if (existingSave) {
      await existingSave.deleteOne();
      await UIShot.findByIdAndUpdate(shotId, { $inc: { 'stats.saves': -1 } });
      return { saved: false };
    } else {
      await ShotSave.create({ shotId, userId });
      await UIShot.findByIdAndUpdate(shotId, { $inc: { 'stats.saves': 1 } });
      return { saved: true };
    }
  }

  /**
   * Admin: get all shots including unpublished.
   */
  async adminGetAll({ page = 1, limit = 20, creatorId } = {}) {
    const skip = (page - 1) * limit;
    const query = {};
    if (creatorId) query.creatorId = creatorId;

    const [shots, total] = await Promise.all([
      UIShot.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('creatorId', 'name email avatar')
        .lean(),
      UIShot.countDocuments(query),
    ]);

    return {
      shots: shots.map(toAdminUiShortDTO),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Admin: delete a shot.
   */
  async adminDelete(shotId, adminId, reason) {
    const shot = await UIShot.findById(shotId);
    if (!shot) throw new AppError('Shot not found', 404);

    await UIShot.findByIdAndDelete(shotId);
    await ShotLike.deleteMany({ shotId });
    await ShotSave.deleteMany({ shotId });

    AuditLog.create({
      adminId,
      action: 'content_removed',
      targetType: 'shot',
      targetId: shotId,
      details: { title: shot.title, reason, creatorId: shot.creatorId },
    }).catch(() => {});

    return { deleted: true };
  }

  /**
   * Admin: toggle published status.
   */
  async adminTogglePublished(shotId, adminId) {
    const shot = await UIShot.findById(shotId);
    if (!shot) throw new AppError('Shot not found', 404);

    shot.isPublished = !shot.isPublished;
    await shot.save();

    return toAdminUiShortDTO(shot);
  }
}
