import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CityService } from 'src/app/Services/city.service';
import { DriverService } from 'src/app/Services/driver.service';

import { CountryService } from 'src/app/Services/country.service';
import { VehicleService } from 'src/app/Services/vehicle.service';
import { SocketService } from 'src/app/Services/socket.service';
import { PricingService } from 'src/app/Services/pricing.service';

@Component({
  selector: 'app-driver',
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.css'],
})
export class DriverComponent implements OnInit {
  isSearchMode = false;
  DriverForm: FormGroup | any;
  selectedFile: any;
  isSubmitted = false;
  isEditMode = false;
  displayerror = false;
  error: any;
  DriverData: any;
  DriverId: any;
  CityList: any;
  value = false;
  istoggled = false;
  showClass = false;
  driver: any;
  CountryList: any;
  VehicleList: any;
  limit: any = 10;
  page: any = 1;
  totalDriver: any = 1;
  sortColumn: any;

  constructor(
    private driverService: DriverService,
    private pricingService: PricingService,
    private cityService: CityService,
    private countryService: CountryService,
    private socketService: SocketService,
    private cd: ChangeDetectorRef
  ) {
    this.DriverForm = new FormGroup({
      DriverFile: new FormControl(null),
      DriverName: new FormControl(null, [Validators.required]),
      DriverEmail: new FormControl(null, [
        Validators.required,
        Validators.email,
      ]),
      CountryCode: new FormControl(null, [Validators.required]),
      DriverPhone: new FormControl(null, [
        Validators.required,
        Validators.pattern('^((\\+91-?)|0)?[0-9\\s-]{10}$'),
      ]),
      DriverCity: new FormControl(null, [Validators.required]),
      DriverCountry: new FormControl(null, [Validators.required]),
      // ServiceType: new FormControl('', [Validators.required]),
    });

    this.socketService.socket.on('CancelledRide', (data: any) => {
      if (data.Driver) {
        this.getStatus(data.Driver.DriverID, data.Driver.Status);
      }
    });
    this.socketService.socket.on('RejectRide', (data: any) => {
      if (data.Driver) {
        this.getStatus(data.Driver.id, data.Driver.Status);
      }
    });

    this.socketService.socket.on('reqtoSendDriver', (data: any) => {
      this.getStatus(data.DriverInfo._id, data.DriverInfo.status);
    });
    this.socketService.socket.on('noDriverFound', (data: any) => {
      if (data.Driver) {
        this.getStatus(data.Driver.DriverID, data.Driver.Status);
      }
    });

    this.socketService.socket.on('NotReactedRide', (data: any) => {
      console.log(data);
      if (data.Driver) {
        this.getStatus(data.Driver.DriverID, data.Driver.Status);
      }
    });

    this.socketService.socket.on('RideCompleted', (data: any) => {
      if (data.Driver) {
        this.getStatus(data.Driver.DriverID, data.Driver.Status);
      }
    });
  }

  ngOnInit(): void {
    this.getDriverReq();
    this.countryService.initonlyCountry().subscribe({
      next: (data) => {
        this.CountryList = data.sort();
      },
      error: (error) => {
        this.socketService.ToasterService('error', error);
      },
    });
  }

  ///   country change

  onCountrySelect() {
    this.error = null;
    this.DriverForm.get('city')?.setValue('');

    let value = (document.getElementById('DriverCountry') as HTMLSelectElement)
      .value;

    const Value = { Value: value };
    this.countryService.initGetAllCountry(Value).subscribe({
      next: (data) => {
        this.DriverForm.patchValue({
          CountryCode: +data[0]?.countrycode,
        });
      },
      error: (error) => {
        this.socketService.ToasterService('error', error);
      },
    });

    this.cityService.initGetAllCountry(value).subscribe({
      next: (data) => {
        this.CityList = data;
        if (this.CityList.length > 0) {
          this.DriverForm.get('DriverCity')?.setValue(this.CityList[0]._id);
        } else {
          this.DriverForm.get('DriverCity')?.setValue(null);
        }
      },
      error: (error) => {
        this.socketService.ToasterService('error', error);
      },
    });
  }

  /// when form Submitted

  onFormSubmit() {
    this.isSubmitted = true;

    if (!this.DriverForm.valid) {
      return;
    }
    const formData = new FormData();
    if (this.selectedFile) {
      formData.append('profile', this.selectedFile);
    }
    formData.append('DriverName', this.DriverForm.get('DriverName').value);
    formData.append('DriverEmail', this.DriverForm.get('DriverEmail').value);
    formData.append('CountryCode', this.DriverForm.get('CountryCode').value);
    formData.append('DriverPhone', this.DriverForm.get('DriverPhone').value);
    formData.append('DriverCity', this.DriverForm.get('DriverCity').value);
    formData.append(
      'DriverCountry',
      this.DriverForm.get('DriverCountry').value
    );

    if (!this.isEditMode) {
      this.driverService.initDriver(formData).subscribe({
        next: (data) => {
          this.getDriverReq();
          this.initReset();
          this.socketService.ToasterService(
            'success',
            'Driver Created Successfully'
          );
        },
        error: (error) => {
          this.socketService.ToasterService('error', error);
        },
      });
    } else {
      this.initDriverEditReq(formData);
    }
  }

  ///  for search driver

  onSearch() {
    this.isSearchMode = !this.isSearchMode;
    this.getDriverReq();
  }

  ///  when  file upload

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  /// for error handling  to get  controls status

  get f() {
    return this.DriverForm.controls;
  }

  ////  search Driver Details

  onSearchDriver(SortColomb?: any) {
    this.sortColumn = SortColomb;
    this.getDriverReq();
  }

  ////  Edit Driver Info

  onEditDriver(Driver: any) {
    this.isEditMode = true;
    this.isSearchMode = false;
    this.DriverId = Driver._id;
    const a = Driver.DriverPhone.split('-');
    console.log(a);

    this.DriverForm.patchValue({
      DriverName: Driver.DriverName,
      DriverEmail: Driver.DriverEmail,
      CountryCode: +a[0],
      DriverPhone: +a[1],
      DriverCountry: Driver.DriverCountry,
      DriverCity: Driver.DriverCity,
      // ServiceType: Driver.ServiceType,
    });
    this.onCountrySelect();
    setTimeout(() => {
      this.DriverForm.patchValue({ DriverCity: Driver.DriverCity });

      this.cd.detectChanges();
    }, 100);
  }

  initDriverEditReq(formData: any) {
    this.driverService.initEditDriver(this.DriverId, formData).subscribe({
      next: (data) => {
        this.getDriverReq();
        this.initReset();
        this.socketService.ToasterService(
          'success',
          'Driver Edited Successfully'
        );
      },
      error: (error) => {
        this.socketService.ToasterService('error', error);
      },
    });
  }

  onupdateDriver(Driver: any) {
    this.initReset();
    let formData = new FormData();
    formData.append('country', Driver?.DriverCountry);
    formData.append('city', Driver?.DriverCity);
    this.DriverId = Driver._id;

    this.pricingService.initGetPricingVehicle(formData).subscribe({
      next: (data) => {
        this.VehicleList = data;
        setTimeout(() => {
          (document.getElementById('ServiceType') as HTMLSelectElement).value =
            Driver.ServiceType;
        }, 100);
      },
      error: (error) => {
        this.socketService.ToasterService('error', error);
      },
    });
  }

  onAssignService() {
    let data = (document.getElementById('ServiceType') as HTMLSelectElement)
      .value;

    let formData = new FormData();
    formData.append('ServiceType', data);
    this.initDriverEditReq(formData);
  }

  ////  Delete  Driver Info

  onDeleteDriver(id: any) {
    let Confirm = confirm('Are You Want Delete Driver');
    if (!Confirm) return;
    this.driverService.initDeleteDriver(id).subscribe({
      next: (data) => {
        this.getDriverReq();
        this.initReset();
        this.socketService.ToasterService('Delete');
      },
      error: (error) => {
        this.socketService.ToasterService('error', error);
      },
    });
  }

  ///  to reset everyThing

  initReset() {
    // this.isSearchMode = false;
    this.selectedFile = null;
    this.isSubmitted = false;
    this.isEditMode = false;
    this.DriverId = null;
    this.error = null;
    this.istoggled = false;
    this.displayerror = false;
    this.DriverForm.reset();
  }

  getDriverReq(event?: any) {
    let data = {
      limit: +this.limit,
      searchValue: (document.getElementById('searchBtn') as HTMLInputElement)
        ?.value,
      page: event ? event : this.page,
      sortColumn: this.sortColumn,
    };
    this.page = event ? event : this.page;

    this.driverService.initGetDriver(data).subscribe({
      next: (data) => {
        this.DriverData = data.drivers;
        this.totalDriver = data.driverCount;
        this.initReset();
      },
      error: (error) => {
        console.log(error);
        this.error = error;
        this.displayerror = true;
      },
    });
  }
  onDriverStatus(id: any, data: any) {
    this.DriverId = id;
    let formData = new FormData();
    formData.append('status', data);
    this.driverService.initEditDriver(id, formData).subscribe({
      next: (data) => {
        this.getDriverReq();
        this.initReset();
      },
      error: (error) => {
        console.log(error);

        if (error.error && error.error.sizeError) {
          this.error = error.error.sizeError;
        } else if (error.error && error.error.fileError) {
          this.error = error.error.fileError;
        } else {
          this.error = error.error;
        }
        this.displayerror = true;
      },
    });
  }

  onStatusUpdate(id: any, data: any) {
    this.DriverId = id;
    let formData = new FormData();
    formData.append('approval', data);
    this.driverService.initEditDriver(id, formData).subscribe({
      next: (data) => {
        this.getDriverReq();
        this.initReset();
      },
      error: (error) => {
        console.log(error);

        if (error.error && error.error.sizeError) {
          this.error = error.error.sizeError;
        } else if (error.error && error.error.fileError) {
          this.error = error.error.fileError;
        } else {
          this.error = error.error;
        }
        this.displayerror = true;
      },
    });
  }

  getImageSource(driver: any) {
    return driver.profile
      ? `http://localhost:3000/uploads/Drivers/${driver.profile}`
      : 'http://localhost:3000/uploads/nouser.png';
  }

  getStatus(driverId: any, Status: any) {
    const driver = this.DriverData.find((r: any) => r._id == driverId);
    driver.status = Status;
  }
}
