import { DownloadQueryService } from './download.queryService.js';
import { DownloadWriteService } from './download.writeService.js';

// Backward-compatible facade — delegates to QueryService and WriteService.
// New code should import DownloadQueryService or DownloadWriteService directly.
export class DownloadService {
  constructor() {
    this._query = new DownloadQueryService();
    this._write = new DownloadWriteService();
  }

  getUserLicenses(userId) { return this._query.getUserLicenses(userId); }
  generateDownloadToken(userId, templateId) { return this._write.generateDownloadToken(userId, templateId); }
  downloadFile(token) { return this._write.downloadFile(token); }
}
