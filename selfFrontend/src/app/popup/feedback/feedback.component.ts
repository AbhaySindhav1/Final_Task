import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css'],
})
export class FeedbackComponent implements OnInit {
  FeedbackForm: FormGroup | any;
  IsSubmitted: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.FeedbackForm = new FormGroup({
      FeedBack: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required, Validators.email]),
    });
  }

  onSubmit(id: any) {
    this.IsSubmitted = true;

    if (!this.FeedbackForm.valid) {
      this.toaster.warning('Please Enter Valid Details');
      return;
    }

    let feedForm = document.getElementById('feedbackForm') as HTMLFormElement;
    let formData = new FormData(feedForm);
    this.http.post('http://localhost:3000/FeedBack/' + id, formData).subscribe({
      next: (data: any) => {
        this.toaster.success(data.msg);
        this.FeedbackForm.reset();
        this.IsSubmitted = false;
      },
      error: (error) => {
        this.toaster.error(error.error);
      },
    });
  }
}
