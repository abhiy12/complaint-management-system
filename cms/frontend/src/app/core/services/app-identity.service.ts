import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { UserRole } from '../models/user.model';

// Both native shells (mobile/vendor-app, mobile/executive-app) load the exact
// same Angular bundle — the only thing that differs between them is the
// appId baked into each shell's capacitor.config.ts. Reading it at runtime
// via @capacitor/app lets one shared codebase still enforce "only vendors
// log into the Vendor app, only executives into the Executive app" without
// needing two separate builds.
const APP_ID_ROLE_MAP: Record<string, UserRole[]> = {
  'com.cms.vendor': ['vendor_admin', 'vendor_sub_user'],
  'com.cms.executive': ['executive']
};

@Injectable({ providedIn: 'root' })
export class AppIdentityService {
  private cachedAppId: string | null = null;

  async getAllowedRoles(): Promise<UserRole[] | null> {
    // On web/PWA there's no native shell distinction — every role is allowed
    // (the admin portal, for instance, is web-only by design and has no
    // native shell at all).
    if (!Capacitor.isNativePlatform()) return null;

    if (!this.cachedAppId) {
      const info = await App.getInfo();
      this.cachedAppId = info.id;
    }
    return APP_ID_ROLE_MAP[this.cachedAppId] ?? null;
  }

  async isRoleAllowed(role: UserRole): Promise<boolean> {
    const allowed = await this.getAllowedRoles();
    if (!allowed) return true; // web/PWA or an unrecognized appId: don't block
    return allowed.includes(role);
  }
}
