import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SettingService {
  constructor(private http: HttpClient) {}

  initGetSettings() {
    return this.http.get('http://localhost:3000/Setting');
  }
  initChangeSettings(FormData?: any) {
    return this.http.patch('http://localhost:3000/Setting', FormData);
  }
}
