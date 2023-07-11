import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private http: HttpClient) {}

  initUsers(formData: any) {
    return this.http.post<any>('http://localhost:3000/MyUser', formData);
  }

  onDeleteCard(data: any) {
    return this.http.post<any>(
      'http://localhost:3000/StripeInt/delete/' + data,
      data
    );
  }

  initDefaultCard(id: any, data: any) {
    return this.http.post<any>(
      'http://localhost:3000/StripeInt/update/' + id,
      data
    );
  }

  initGetUsers(data?: any) {
    return this.http.post<any>('http://localhost:3000/MyUser/getUsers', data);
  }

  initDeleteUsers(id: any) {
    return this.http.delete('http://localhost:3000/MyUser/' + id);
  }

  initEditUsers(id: any, data: any) {
    return this.http.patch('http://localhost:3000/MyUser/' + id, data);
  }
}
