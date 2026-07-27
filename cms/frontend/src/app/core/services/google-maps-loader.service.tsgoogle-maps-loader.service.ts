import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GoogleMapsLoaderService {
  private loadPromise: Promise<boolean> | null = null;

  load(): Promise<boolean> {
    if (this.loadPromise) return this.loadPromise;

    const apiKey = environment.googleMapsApiKey;
    const looksLikePlaceholder = !apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY';

    if (looksLikePlaceholder) {
      this.loadPromise = Promise.resolve(false);
      return this.loadPromise;
    }

    if ((window as any).google?.maps) {
      this.loadPromise = Promise.resolve(true);
      return this.loadPromise;
    }

    this.loadPromise = new Promise<boolean>((resolve) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }
}