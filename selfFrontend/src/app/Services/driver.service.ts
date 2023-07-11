import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DriverService {
  constructor(private http: HttpClient) {}

  initDriver(formData: any) {
    return this.http.post<any>('http://localhost:3000/Driver', formData);
  }

  initGetDriver(data?: any, sortData?: any) {
    return this.http.post<any>('http://localhost:3000/Driver/GetAllDriver',data);
  }

  initDeleteDriver(id: any) {
    return this.http.delete('http://localhost:3000/Driver/' + id);
  }

  initEditDriver(id: any, data: any) {
    return this.http.patch('http://localhost:3000/Driver/' + id, data);
  }

  initSpeceficDrivers(formData: any) {
    return this.http.post<any>('http://localhost:3000/Driver/List', formData);
  }
}
