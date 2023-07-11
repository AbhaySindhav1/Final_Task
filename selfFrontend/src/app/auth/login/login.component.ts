import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthGuardService } from 'src/app/Services/auth-guard.service';
import { AuthService } from 'src/app/Services/auth.service';
import { SocketService } from 'src/app/Services/socket.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  error: any;
  LoginForm: FormGroup | any;
  constructor(
    private authService: AuthService,
    private router: Router,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.LoginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
      ]),
    });
  }

  onSubmit() {
    this.authService
      .InItLogin(this.LoginForm.value.email, this.LoginForm.value.password)
      .subscribe({
        next: (data) => {
          this.router.navigate(['dashboard']);
          this.toaster.success('Login Successfully');
        },
        error: (error) => {
          if (error.error) {
            this.toaster.error(error.error);
          } else {
            this.toaster.error(error.error);
          }
        },
        complete: () => {},
      });
    this.LoginForm.reset();
  }
}
