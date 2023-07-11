import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  Countries: any;

  constructor(private http: HttpClient) {
    this.initgetRequest('https://restcountries.com/v3.1/all').subscribe(
      (data: any) => {
        this.Countries = data.sort((a: any, b: any) =>
          a.name.common.localeCompare(b.name.common)
        );
      }
    );
  }

  initgetRequest(url: any) {
    return this.http.get(url);
  }

  initCountry(countryData: FormData | any) {
    if (!countryData) {
      return;
    }
    return this.http.post<any>('http://localhost:3000/country', countryData);
  }

  initGetAllCountry(data?: any) {
    if (data) {
      return this.http.get<any>('http://localhost:3000/Countries', {
        params: data,
      });
    } else {
      return this.http.get<any>('http://localhost:3000/Countries');
    }
  }
  initonlyCountry() {
    return this.http.get<any>('http://localhost:3000/country');
  }

  initDeleteCountry(id: any) {
    return this.http.delete('http://localhost:3000/country/' + id);
  }
}
