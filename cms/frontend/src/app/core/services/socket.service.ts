import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;
  readonly connected = signal(false);

  constructor(private auth: AuthService) {}

  connect(): void {
    if (this.socket?.connected) return;
    const token = this.auth.getAccessToken();
    if (!token) return;

    this.socket = io(environment.socketUrl, { auth: { token } });

    this.socket.on('connect', () => this.connected.set(true));
    this.socket.on('disconnect', () => this.connected.set(false));
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.connected.set(false);
  }

  on<T>(event: string, handler: (payload: T) => void): void {
    this.socket?.on(event, handler);
  }

  off(event: string): void {
    this.socket?.off(event);
  }

  emit(event: string, payload: unknown): void {
    this.socket?.emit(event, payload);
  }
}
