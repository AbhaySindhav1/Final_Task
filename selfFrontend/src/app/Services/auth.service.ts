import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { User } from '../user.model';
import { tap } from 'rxjs/internal/operators/tap';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnInit {
  ngOnInit(): void {}
  constructor(
    private http: HttpClient,
    private router: Router,
    private toaster: ToastrService
  ) {}

  user = new BehaviorSubject<any>(true);

  InitAutoLogin() {
    return !!localStorage.getItem('userData');
  }

  InItLogin(email: string, password: string) {
    console.log(email, password);

    return this.http
      .post<any>('http://localhost:3000/UserLogin', {
        email,
        password,
      })
      .pipe(
        tap((res) => {
          console.log(res);

          this.handleAuthentication(
            res.email,
            res.id,
            res.token,
            res.expirationDate
          );
        })
      );
  }
  InitCreateUSer(postData: any) {
    return this.http.post<any>('http://localhost:3000/User', postData).pipe(
      tap((res) => {
        this.handleAuthentication(
          res.email,
          res.id,
          res.token,
          res.expirationDate
        );
      })
    );
  }

  ReqLogout() {
    this.http.get('http://localhost:3000/Logout').subscribe({
      next: (data: any) => {
        if (data.data === 'logout Success') {
          this.logout();
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  logout() {
    console.log("sdbhbhgsa");
    
    this.user.next(null);
    localStorage.removeItem('userData');
    this.router.navigate(['login']);
    this.toaster.warning('You logoutted out');
  }

  private handleAuthentication(
    email: string,
    userId: string,
    token: string,
    expiresIn: Date
  ) {
    const expirationDate = expiresIn;
    const user = new User(email, userId, token, expirationDate);
    this.user.next(user);
    localStorage.setItem('userData', JSON.stringify(user));
  }
}

// autoLogin() {
//   const userData: {
//     email: string;
//     id: string;
//     _token: string;
//     _tokenExpirationDate: string;
//   } = JSON.parse(localStorage.getItem('userData'));
//   if (!userData) {
//     return;
//   }

//   const loadedUser = new User(
//     userData.email,
//     userData.id,
//     userData._token,
//     new Date(userData._tokenExpirationDate)
//   );

//   if (loadedUser.token) {
//     this.user.next(loadedUser);
//     const expirationDuration =
//       new Date(userData._tokenExpirationDate).getTime() -
//       new Date().getTime();
//     this.autoLogout(expirationDuration);
//   }
// }

// localStorage.setItem('TimeOut', (Date.now() + 5 * 1000).toString());

// autoLogout(expirationDuration: number) {
//   this.tokenExpirationTimer = setTimeout(() => {
//     this.logout();
//   }, expirationDuration);
// }
