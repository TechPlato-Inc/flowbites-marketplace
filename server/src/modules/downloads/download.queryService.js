import { License } from './license.model.js';

export class DownloadQueryService {
  async getUserLicenses(userId) {
    const licenses = await License.find({ buyerId: userId, isActive: true })
      .populate('templateId', 'title thumbnail price platform deliveryType deliveryUrl templateFile')
      .populate('orderId', 'orderNumber paidAt')
      .sort({ createdAt: -1 });

    return licenses;
  }
}
