import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface AppConfig {
  apiUrl: string;
  apiTimeout: number;
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config: AppConfig = {
    apiUrl: 'https://api.ejemplo.com',
    apiTimeout: 30000,
  };

  constructor(private http: HttpClient) {}

  /**
   * Carga la configuración desde config.json
   * Se ejecuta en el APP_INITIALIZER antes de que la app se inicie
   */
  async loadConfig(): Promise<void> {
    try {
      const data = await firstValueFrom(this.http.get<AppConfig>('/config.json'));
      this.config = data;
    } catch (error) {
      console.warn('Error cargando config.json, usando valores por defecto', error);
    }
  }

  getApiUrl(): string {
    return this.config.apiUrl;
  }

  getApiTimeout(): number {
    return this.config.apiTimeout;
  }

  getConfig(): AppConfig {
    return this.config;
  }
}
