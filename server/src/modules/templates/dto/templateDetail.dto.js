import { toTemplateListItemDTO } from './templateListItem.dto.js';

export function toTemplateDetailDTO(doc) {
  return {
    ...toTemplateListItemDTO(doc),
    description: doc.description,
    tags: doc.tags || [],
    version: doc.version || '1.0.0',
    licenseType: doc.licenseType || 'personal',
    deliveryType: doc.deliveryType,
    deliveryUrl: doc.deliveryUrl || null,
    metaDescription: doc.metaDescription || null,
    keywords: doc.keywords || [],
    status: doc.status,
  };
}
