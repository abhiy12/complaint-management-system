import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { VendorService } from '../../core/services/vendor.service';
import { Vendor } from '../../core/models/vendor.model';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule, MatChipsModule],
  templateUrl: './vendor-list.component.html',
  styleUrl: './vendor-list.component.scss'
})
export class VendorListComponent implements OnInit {
  readonly vendors = signal<Vendor[]>([]);
  readonly displayedColumns = ['vendor_code', 'vendor_name', 'city', 'email', 'phone', 'status', 'actions'];

  constructor(private vendorService: VendorService) {}

  ngOnInit(): void {
    this.vendorService.list().subscribe((res) => this.vendors.set(res.data.rows));
  }
}
