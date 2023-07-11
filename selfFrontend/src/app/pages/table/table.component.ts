import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { VehicleService } from 'src/app/Services/vehicle.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit {
  @ViewChild('file') fileInput: ElementRef | any; //9574148173
  updateButton = false;
  UserId: any;
  cards: any;
  file: any;
  vehicleForm: FormGroup | any;
  submitted: boolean | any;
  error: any;
  constructor(
    private vehicleService: VehicleService,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.vehicleService.InITGetVehicles().subscribe((data) => {
      if (data) {
        this.cards = data;
      }
    });
    if (!this.updateButton) {
      this.vehicleForm = new FormGroup({
        types: new FormControl(null, [Validators.required]),
        // name: new FormControl(null, [Validators.required]),
        profile: new FormControl(null, [Validators.required]),
      });
    }
  }

  onCencel() {
    this.vehicleForm.reset();
    this.error = null;
    this.submitted = false;
  }

  OnSubmit(form: any) {
    this.submitted = true;

    if (!form.valid) {
      return;
    }

    this.file = this.fileInput.nativeElement.files[0];
    form.value.profile = this.file;
    let formData = new FormData();
    formData.append('types', form.value.types);
    // formData.append('name', form.value.name);
    if (this.file) {
      formData.append('profile', this.file);
    }

    if (this.updateButton) {
      this.vehicleService.initEditVehicle(this.UserId, formData).subscribe({
        next: () => {
          this.vehicleService.InITGetVehicles().subscribe({
            next: (data) => {
              this.cards = data;

              this.submitted = false;
              this.updateButton = false;
              this.vehicleForm
                .get('profile')
                .setValidators([Validators.required]);
              this.vehicleForm.get('profile').updateValueAndValidity();

              this.vehicleForm.reset();
              this.toaster.success('Taxi Edited Succesfully');
              this.onCencel();
            },
            error: (error) => {
              if (error.error && error.error.error) {
                this.toaster.error(error.error.error);
              } else if (error.error) {
                this.toaster.error(error.error);
              } else {
                this.toaster.error(error);
              }
            },
            complete: () => {},
          });
        },
        error: (error): any => {
          if (error.error.keyPattern) {
            this.toaster.error('types is Required');
            return;
          }
          if (error.error && error.error.error) {
            this.toaster.error(error.error.error);
          } else if (error.error) {
            this.toaster.error(error.error);
          } else {
            this.toaster.error(error);
          }
        },
      });
    }

    ///                                                       ///                Add Taxi        ///                          //////
    else {
      this.vehicleService.initAddVehicle(formData).subscribe({
        next: (data) => {
          this.vehicleService.InITGetVehicles().subscribe({
            next: (data) => {
              this.cards = data;
              this.toaster.success('Taxi Added Succesfully');
              this.onCencel();
            },
            error: (error) => {
              if (error.error && error.error.error) {
                this.toaster.error(error.error.error);
              } else if (error.error) {
                this.toaster.error(error.error);
              } else {
                this.toaster.error(error);
              }
            },
          });
        },
        error: (error): any => {
          if (error.error.keyPattern) {
            this.toaster.error('types is Already Added');
            return;
          }
          if (error.error && error.error.error) {
            this.toaster.error(error.error.error);
          } else if (error.error) {
            this.toaster.error(error.error);
          } else {
            this.toaster.error(error);
          }
        },
        complete: () => {},
      });
    }
  }

  onDelete(id: any) {
    this.vehicleService.inItDeleteVehicle(id).subscribe({
      next: (data) => {
        this.vehicleService.InITGetVehicles().subscribe({
          next: (data) => {
            this.cards = data;
          },
          error: (error) => {
            if (error.error && error.error.error) {
              this.toaster.error(error.error.error);
            } else if (error.error) {
              this.toaster.error(error.error);
            } else {
              this.toaster.error(error);
            }
          },
          complete: () => {},
        });
      },
      error: (error) => {
        if (error.error && error.error.error) {
          this.toaster.error(error.error.error);
        } else if (error.error) {
          this.toaster.error(error.error);
        } else {
          this.toaster.error(error);
        }
      },
      complete: () => {},
    });
  }

  onEdit(id: any, card: any, form: any) {
    this.updateButton = true;
    this.UserId = id;

    this.vehicleForm.get('profile').clearValidators();
    this.vehicleForm.get('profile').updateValueAndValidity();

    this.vehicleForm.setValue({
      types: card.types,
      // name: card.name,
      profile: null,
    });
  }
}
