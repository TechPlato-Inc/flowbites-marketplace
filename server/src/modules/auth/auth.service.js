import { AuthQueryService } from './auth.queryService.js';
import { AuthWriteService } from './auth.writeService.js';

/**
 * Backwards-compatible facade.
 *
 * If any external module imports AuthService and calls its methods, those
 * calls are transparently delegated to either AuthQueryService or
 * AuthWriteService.  This keeps all existing call-sites working without
 * any changes while the real logic lives in the split services.
 */
export class AuthService {
  constructor() {
    this._query = new AuthQueryService();
    this._write = new AuthWriteService();
  }

  // ─── Read operations (delegated to queryService) ──────────────────────────

  refreshAccessToken(refreshToken) {
    return this._query.refreshAccessToken(refreshToken);
  }

  // ─── Write operations (delegated to writeService) ─────────────────────────

  register(data) {
    return this._write.register(data);
  }

  login(data) {
    return this._write.login(data);
  }

  logout(userId, refreshToken) {
    return this._write.logout(userId, refreshToken);
  }

  updateProfile(userId, updates) {
    return this._write.updateProfile(userId, updates);
  }

  changePassword(userId, data) {
    return this._write.changePassword(userId, data);
  }

  forgotPassword(data) {
    return this._write.forgotPassword(data);
  }

  resetPassword(data) {
    return this._write.resetPassword(data);
  }

  verifyEmail(data) {
    return this._write.verifyEmail(data);
  }

  resendVerificationEmail(userId) {
    return this._write.resendVerificationEmail(userId);
  }
}
