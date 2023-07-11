import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PricingService {
  constructor(private http: HttpClient) {}

  initAddPriceData(formData: any) {
    return this.http.post<any>('http://localhost:3000/price', formData);
  }

  initGetAllZonePricing(data?: any) {
    return this.http.post<any>('http://localhost:3000/price/GetAllPrice', data);
  }

  initGetPricingForZone(formData: any) {
    return this.http.post<any>('http://localhost:3000/price/pricing', formData);
  }

  initGetPricingVehicle(formData: any) {
    return this.http.post<any>(
      'http://localhost:3000/price/GetVehicleOfCity',
      formData
    );
  }

  initGetAllVehicle(data?: any) {
    const Value = { Value: data };

    if (data) {
      return this.http.get<any>('http://localhost:3000/price/Vehicle', {
        params: Value,
      });
    } else {
      return this.http.get<any>('http://localhost:3000/price/Vehicle');
    }
  }

  initDeleteZonePricing(id: any) {
    return this.http.delete('http://localhost:3000/price/' + id);
  }

  initEditPricing(id: any, data: any) {
    return this.http.patch('http://localhost:3000/price/' + id, data);
  }
}
