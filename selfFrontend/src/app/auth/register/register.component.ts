import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';
import { AuthService } from 'src/app/Services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  signUpForm: FormGroup | any;

  private sub: Subscription | any;

  constructor(private authService: AuthService) {}

  passwordValidator = Validators.compose([
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(20),
    Validators.pattern(
      "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*()\\-_=+{}[\\]|;:',.<>/?])([A-Za-z\\d!@#$%^&*()\\-_=+{}[\\]|;:',.<>/?]){8,}$"
    ),
  ]);

  ngOnInit(): void {
    this.signUpForm = new FormGroup({
      // profile: new FormControl(null, []),
      Name: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, this.passwordValidator),
    });
  }

  onFileSelected(e: any): void {
    const file = e.target.files[0];
    this.signUpForm.get('profile').setValue(file);
  }

  onSubmit() {
    if (!this.signUpForm.valid) {
      return;
    }
    this.sub = this.authService
      .InitCreateUSer(this.signUpForm.value)
      .subscribe({
        next: (data) => {
          console.log(data);
        },
        error: (error) => {
          console.log(error);
        },
      });
  }
}
