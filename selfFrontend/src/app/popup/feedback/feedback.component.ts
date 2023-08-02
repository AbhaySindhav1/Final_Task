import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from 'src/app/Services/socket.service';

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
    private toaster: ToastrService,
    private socketService: SocketService
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

    console.log("hsadbhsgd");
    

    let feedForm = document.getElementById('feedbackForm') as HTMLFormElement;
    let formData = new FormData(feedForm);
    this.http.post('http://localhost:3000/FeedBack/' + id, formData).subscribe({
      next: (data: any) => {
        this.toaster.success(data.msg);
        this.socketService.socket.emit('ModelClose', true);
        this.FeedbackForm.reset();
        this.IsSubmitted = false;
      },
      error: (error) => {
        this.toaster.error(error.error);
      },
    });
  }
}
