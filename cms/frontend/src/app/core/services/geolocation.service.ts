import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export interface GeoPosition {
  latitude: number;
  longitude: number;
}

@Injectable({ providedIn: 'root' })
export class GeolocationService {
  // Capacitor.isNativePlatform() is true only when running inside the
  // compiled Android/iOS shell — false in a normal browser tab or a PWA,
  // where we fall back to the standard navigator.geolocation API.
  private readonly isNative = Capacitor.isNativePlatform();

  async requestPermission(): Promise<boolean> {
    if (!this.isNative) {
      // Browser permission is requested implicitly on first getCurrentPosition
      // call; nothing to pre-authorize.
      return true;
    }
    const status = await Geolocation.requestPermissions();
    return status.location === 'granted' || status.coarseLocation === 'granted';
  }

  async getCurrentPosition(): Promise<GeoPosition> {
    if (this.isNative) {
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    }

    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation not supported in this browser'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }
}
