import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ComplaintService } from '../../core/services/complaint.service';
import { ExecutiveService } from '../../core/services/executive.service';
import { GeolocationService } from '../../core/services/geolocation.service';
import { Complaint } from '../../core/models/complaint.model';

@Component({
  selector: 'app-executive-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <h1>My Assigned Complaints</h1>
    <div class="grid">
      @for (c of complaints(); track c.id) {
        <mat-card class="card">
          <h3>{{ c.complaint_number }}</h3>
          <p>{{ c.subject }}</p>
          <span class="status-badge">{{ c.status }}</span>
        </mat-card>
      } @empty {
        <p>No complaints assigned right now.</p>
      }
    </div>
    <p class="hint">Location is reported automatically every {{ pingIntervalSeconds }}s while this app is open.
      Uses the native GPS plugin when running as the installed Android app, or the browser's geolocation
      API when running as a PWA / in a normal browser tab.</p>
    @if (locationError()) {
      <p class="error">{{ locationError() }}</p>
    }
  `,
  styles: [`.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;margin-bottom:16px}
    .card{padding:16px}.hint{color:#6b7280;font-size:13px}.error{color:#d32f2f;font-size:13px}`]
})
export class ExecutiveDashboardComponent implements OnInit, OnDestroy {
  readonly complaints = signal<Complaint[]>([]);
  readonly locationError = signal<string | null>(null);
  readonly pingIntervalSeconds = 30;
  private pingTimer: any;

  constructor(
    private complaintService: ComplaintService,
    private executiveService: ExecutiveService,
    private geolocation: GeolocationService
  ) {}

  ngOnInit(): void {
    this.complaintService.list().subscribe((res) => this.complaints.set(res.data.rows));
    this.startLocationPing();
  }

  private async startLocationPing(): Promise<void> {
    const granted = await this.geolocation.requestPermission();
    if (!granted) {
      this.locationError.set('Location permission denied — live tracking will not work until granted in device settings.');
      return;
    }

    const ping = async () => {
      try {
        const pos = await this.geolocation.getCurrentPosition();
        this.executiveService.updateLocation(pos.latitude, pos.longitude).subscribe();
        this.locationError.set(null);
      } catch (err) {
        this.locationError.set('Could not read device location.');
      }
    };

    ping(); // send one immediately, then on the regular interval
    this.pingTimer = setInterval(ping, this.pingIntervalSeconds * 1000);
  }

  ngOnDestroy(): void {
    if (this.pingTimer) clearInterval(this.pingTimer);
  }
}
