import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RideService {
  constructor(private http: HttpClient) {}

  initGetAllZones(data?: any) {
    const Value = { Value: data };

    if (data) {
      return this.http.get<any>('http://localhost:3000/CityCountryZone', {
        params: Value,
      });
    } else {
      return this.http.get<any>('http://localhost:3000/CityCountryZone');
    }
  }

  initGetAllRides(data: any) {
    return this.http.post<any>('http://localhost:3000/GetRides', data);
  }

  GetAllRides() {
    return this.http.get<any>('http://localhost:3000/Ride/Assigned');
  }

  initGetLocationValidation(array: any, city: any) {
    return this.http.get<any>(
      `http://localhost:3000/CityCordinates?loc=${array}&city=${city}`
    );
  }

  initAddRideDetails(FormData: any) {
    return this.http.post<any>('http://localhost:3000/Ride', FormData);
  }

  initEditRide(id: any, FormData: any) {
    return this.http.patch<any>('http://localhost:3000/Ride/' + id, FormData);
  }

  initFilterRide(FormData: any) {
    return this.http.post<any>('http://localhost:3000/RideFilter', FormData);
  }

  initRideHistory(data: any) {
    return this.http.post<any>('http://localhost:3000/History', data);
  }

  initProgressRide(id: any, Status: any) {
    let data = { Status: Status };
    return this.http.patch<any>('http://localhost:3000/RideStatus/' + id, data);
  }

  initGetStatus(Status: any) {
    if (Status == 0) {
      return 'Cancelled';
    } else if (Status == 1) {
      return 'pending';
    } else if (Status == 2) {
      return 'Accepted';
    } else if (Status == 3) {
      return 'Arrived';
    } else if (Status == 4) {
      return 'Started';
    } else if (Status == 5) {
      return 'Completed';
    } else if (Status == 100) {
      return 'Assigning';
    }
    return 'Unknown';
  }
}
