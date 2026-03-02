import { UIShot, ShotLike, ShotSave } from './uiShort.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { AuditLog } from '../audit/auditLog.model.js';
import { toUiShortDTO, toAdminUiShortDTO } from './dto/uiShort.dto.js';

export class UIShotWriteService {
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
