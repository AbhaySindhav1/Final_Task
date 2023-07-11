import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/internal/operators/map';

@Injectable({
  providedIn: 'root',
})
export class CityService {
  constructor(private http: HttpClient) {}

  initGetDataFromUrl(url: any) {
    return this.http.get(url);
  }

  initAddCityData(formData: any) {
    return this.http.post<any>('http://localhost:3000/city', formData);
  }

  initGetAllCities(data?: any) {
    return this.http.post<any>('http://localhost:3000/Cities/GetAll', data);
  }

  initGetAllCountry(data?: any) {
    const Value = { Value: data };

    if (data) {
      return this.http.get<any>('http://localhost:3000/CityCountry', {
        params: Value,
      });
    } else {
      return this.http.get<any>('http://localhost:3000/CityCountry');
    }
  }

  initDeleteCountry(id: any) {
    return this.http.delete('http://localhost:3000/city/' + id);
  }

  initEditCity(id: any, data: any) {
    return this.http.patch('http://localhost:3000/city/' + id, data);
  }

  travreseArray(data: any, CountryArray: any[]) {
    let countryObj = CountryArray.filter((country: any) => {
      return country.name.common === data.trim();
    });
    return countryObj;
  }
}
