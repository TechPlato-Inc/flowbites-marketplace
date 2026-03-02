import { ServicePackage } from './service.model.js';
import { Template } from '../templates/template.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { eventBus, EVENTS } from '../../shared/eventBus.js';

export class ServiceWriteService {
  /**
   * Create a new service package linked to a creator's template.
   */
  async create(creatorId, data) {
    const template = await Template.findOne({ _id: data.templateId, creatorId });
    if (!template) {
      throw new AppError('Template not found or unauthorized', 404);
    }

    const servicePackage = await ServicePackage.create({
      ...data,
      creatorId,
    });

    eventBus.emit(EVENTS.SERVICE_CREATED, {
      serviceId: servicePackage._id.toString(),
      creatorId: creatorId.toString(),
      templateId: data.templateId,
      name: servicePackage.name,
    });

    return servicePackage;
  }

  /**
   * Update an existing service package owned by the creator.
   */
  async update(id, creatorId, data) {
    const servicePackage = await ServicePackage.findOne({ _id: id, creatorId });
    if (!servicePackage) {
      throw new AppError('Service package not found or unauthorized', 404);
    }

    const editableFields = [
      'name', 'description', 'price', 'deliveryDays', 'revisions',
      'features', 'category', 'requirements', 'tags', 'isActive',
    ];

    const changedFields = [];
    for (const field of editableFields) {
      if (data[field] !== undefined) {
        servicePackage[field] = data[field];
        changedFields.push(field);
      }
    }

    await servicePackage.save();

    eventBus.emit(EVENTS.SERVICE_UPDATED, {
      serviceId: servicePackage._id.toString(),
      creatorId: creatorId.toString(),
      changedFields,
    });

    return servicePackage;
  }

  /**
   * Soft-delete (deactivate) a service package.
   */
  async delete(id, creatorId) {
    const servicePackage = await ServicePackage.findOne({ _id: id, creatorId });
    if (!servicePackage) {
      throw new AppError('Service package not found or unauthorized', 404);
    }

    servicePackage.isActive = false;
    await servicePackage.save();

    return { message: 'Service package deleted successfully' };
  }
}
