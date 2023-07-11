import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/internal/operators/catchError';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  constructor(private http : HttpClient) { }



InITGetVehicles (){
  return this.http.get<any>('http://localhost:3000/Allvehicle');
}
initAddVehicle(data:FormData){
  return this.http.post('http://localhost:3000/vehicle',data)
}

inItDeleteVehicle(id:any){
    return this.http.delete("http://localhost:3000/vehicle/"+id)
}

initEditVehicle(id:any,data:any){
  return this.http.patch("http://localhost:3000/vehicle/"+id,data)

}

initGetTypesOfVehicles(){
  return this.http.get<any>('http://localhost:3000/vehicle/types')
}

}
