import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UsersService } from 'src/app/Services/users.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CardComponent } from '../card/card.component';
import { Toast, ToastrService } from 'ngx-toastr';
import { CountryService } from 'src/app/Services/country.service';
import { SocketService } from 'src/app/Services/socket.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  error: any;
  displayerror = false;
  isSearchMode = false;
  isSubmitted = false;
  selectedFile: any = null;
  UsersForm: FormGroup | any;
  UsersData: any;
  userId: any;
  isEditMode = false;
  p = 1;
  sortColomn: any;
  totalUser: any;
  limit = 10;
  CountryList: any;

  constructor(
    private usersService: UsersService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private countryService: CountryService,
    private socketService: SocketService
  ) {
    this.UsersForm = new FormGroup({
      UserFile: new FormControl(null),
      UserName: new FormControl(null, [Validators.required]),
      UserEmail: new FormControl(null, [Validators.required, Validators.email]),
      CountryCode: new FormControl(null, [Validators.required]),
      UserCountry: new FormControl(null, [Validators.required]),
      UserPhone: new FormControl(null, [
        Validators.required,
        Validators.pattern('^((\\+91-?)|0)?[0-9\\s-]{10}$'),
      ]),
    });
  }
  openDialog(user: any) {
    const dialogRef = this.dialog.open(CardComponent, {
      width: '800px',
      data: user,
    });
  }
  ngOnInit(): void {
    this.getAllUserReq();
    this.countryService.initonlyCountry().subscribe({
      next: (data) => {
        this.CountryList = data.sort();
      },
      error: (error) => {
        this.socketService.ToasterService('error', error);
      },
    });
  }

  onSubmit() {
    this.isSubmitted = true;

    if (!this.UsersForm.valid) {
      return;
    }
    const formData = new FormData();
    if (!this.selectedFile) {
      formData.append('profile', '');
    } else {
      formData.append('profile', this.selectedFile);
    }

    formData.append('UserName', this.UsersForm.get('UserName').value);
    formData.append('UserEmail', this.UsersForm.get('UserEmail').value);
    formData.append('CountryCode', this.UsersForm.get('CountryCode').value);
    formData.append('UserPhone', this.UsersForm.get('UserPhone').value);
    formData.append('UserCountry', this.UsersForm.get('UserCountry').value);

    if (!this.isEditMode) {
      this.usersService.initUsers(formData).subscribe({
        next: (data) => {
          console.log(data);

          this.getAllUserReq();
          this.initReset();
          this.toastr.success(data.massage);
        },
        error: (error) => {
          console.log(error);
          if (error.error && error.error.sizeError) {
            this.toastr.error(error.error.sizeError);
          } else if (error.error && error.error.fileError) {
            this.toastr.error(error.error.fileError);
          } else {
            this.toastr.error(error.error);
          }
        },
      });
    } else {
      this.usersService.initEditUsers(this.userId, formData).subscribe({
        next: (data: any) => {
          this.getAllUserReq();
          this.initReset();
          this.toastr.success(data.massage);
        },
        error: (error) => {
          console.log(error);
          if (error.error && error.error.sizeError) {
            this.toastr.error(error.error.sizeError);
          } else if (error.error && error.error.fileError) {
            this.toastr.error(error.error.fileError);
          } else {
            this.toastr.error(error.error);
          }
        },
      });
    }
  }

  onSearch() {
    this.isSearchMode = !this.isSearchMode;
    this.getAllUserReq();
  }

  get f() {
    return this.UsersForm.controls;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    console.log(this.selectedFile);
  }

  onSearchUsers(sortColomnn?: any) {
    this.sortColomn = sortColomnn;
    this.getAllUserReq();
  }

  oncencel() {
    this.initReset();
  }

  onEditUser(user: any) {
    this.isEditMode = true;
    this.isSearchMode = false;
    this.userId = user._id;
    const a = user.UserPhone.split('-');
    console.log(user);

    this.UsersForm.patchValue({
      UserName: user.UserName,
      UserEmail: user.UserEmail,
      CountryCode: +a[0],
      UserCountry: user.UserCountry,
      UserPhone: +a[1],
    });
  }

  onDeleteUser(id: any) {
    let Confirm = confirm('Are You Want Delete User');
    if (!Confirm) return;
    this.usersService.initDeleteUsers(id).subscribe({
      next: (data) => {
        this.getAllUserReq();
      },
      error: (error) => {
        this.toastr.error(error.error);
      },
    });
  }

  initReset() {
    this.selectedFile = null;
    this.isSubmitted = false;
    this.displayerror = false;
    this.userId = null;
    this.error = null;
    this.isEditMode = false;
    this.UsersForm.reset();
  }

  getAllUserReq(event?: any) {
    if (this.totalUser < this.limit * this.p) {
      this.p = 1;
    }
    let data = {
      limit: +this.limit,
      filter: (document.getElementById('searchBtn') as HTMLInputElement)?.value,
      page: event ? event : this.p,
      sortColomn: this.sortColomn,
    };

    this.p = event ? event : this.p;

    this.usersService.initGetUsers(data).subscribe({
      next: (data) => {
        this.UsersData = data.users;
        this.totalUser = data.totalCount;
        this.initReset();
      },
      error: (error) => {
        console.log(error.error);
        if (error.error) {
          this.toastr.error(error.error);
          return;
        }
        this.toastr.error(error);
      },
    });
  }

  onCountrySelect() {
    this.error = null;
    this.UsersForm.get('city')?.setValue('');

    let value = (document.getElementById('UserCountry') as HTMLSelectElement)
      .value;

    const Value = { Value: value };
    this.countryService.initGetAllCountry(Value).subscribe({
      next: (data) => {
        this.UsersForm.patchValue({
          CountryCode: +data[0]?.countrycode,
        });
      },
      error: (error) => {
        this.socketService.ToasterService('error', error);
      },
    });
  }

  getImageSource(user: any) {
    return user.profile
      ? `http://localhost:3000/uploads/Users/${user.profile}`
      : 'http://localhost:3000/uploads/nouser.png';
  }
}
