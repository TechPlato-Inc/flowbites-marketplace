import { UIShot, ShotLike, ShotSave } from './uiShort.model.js';
import { AppError } from '../../middleware/errorHandler.js';

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

    return shot;
  }

  async getAll(filters = {}) {
    const { page = 1, limit = 20, sort = 'recent' } = filters;

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

    const [shots, total] = await Promise.all([
      UIShot.find({ isPublished: true })
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('creatorId', 'name avatar')
        .populate('templateId', 'title price'),
      UIShot.countDocuments({ isPublished: true })
    ]);

    return {
      shots,
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
}
