import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { ExecutiveService } from '../../core/services/executive.service';
import { SocketService } from '../../core/services/socket.service';
import { Executive } from '../../core/models/executive.model';
import { GoogleMapsLoaderService } from '../../core/services/google-maps-loader.service.tsgoogle-maps-loader.service';

interface LocationPing { executiveId: number; latitude: number; longitude: number; }

@Component({
  selector: 'app-executive-tracking-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './executive-tracking-map.component.html',
  styleUrl: './executive-tracking-map.component.scss'
})
export class ExecutiveTrackingMapComponent implements OnInit, OnDestroy {
  readonly executives = signal<Executive[]>([]);
  readonly center = signal<google.maps.LatLngLiteral>({ lat: 19.076, lng: 72.8777 });
  readonly zoom = 11;
  readonly mapsReady = signal<boolean | null>(null);

  constructor(
    private executiveService: ExecutiveService,
    private socket: SocketService,
    private mapsLoader: GoogleMapsLoaderService
  ) {}

  ngOnInit(): void {
    this.mapsLoader.load().then((ready) => this.mapsReady.set(ready));

    this.executiveService.list().subscribe((res) => this.executives.set(res.data.rows));

    this.socket.connect();
    this.socket.on<LocationPing>('executive:location', (ping) => {
      this.executives.update((list) =>
        list.map((e) => (e.id === ping.executiveId
          ? { ...e, current_latitude: ping.latitude, current_longitude: ping.longitude, is_online: true }
          : e))
      );
    });
  }

  ngOnDestroy(): void {
    this.socket.off('executive:location');
  }

  markerPosition(e: Executive): google.maps.LatLngLiteral | null {
    if (e.current_latitude == null || e.current_longitude == null) return null;
    return { lat: Number(e.current_latitude), lng: Number(e.current_longitude) };
  }
}