import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CityService } from 'src/app/Services/city.service';
import { CountryService } from 'src/app/Services/country.service';
import { PricingService } from 'src/app/Services/pricing.service';
import { VehicleService } from 'src/app/Services/vehicle.service';

function validateMaxSpace(
  control: AbstractControl
): { [key: string]: any } | null {
  const value = control.value;
  if (!value || value < 0 || value % 1 !== 0) {
    return { invalidMaxSpace: true };
  }
  return null;
}

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css'],
})
export class PricingComponent implements OnInit {
  ContryList: any;
  PricingForm: FormGroup;
  CityList: any = [];
  PricingList: any;
  VehicleList: any;
  error: any;
  issubmitted: any = false;
  displayerror = false;
  isEditMode = false;
  userId: any;
  limit: any = 10;
  page: any = 1;
  totalPriceList: any;
  @ViewChild('PricingCountry') PricingCountry: any;

  constructor(
    private cityService: CityService,
    private vehicleService: VehicleService,
    private priceService: PricingService,
    private countryService: CountryService,
    private cd: ChangeDetectorRef
  ) {
    this.PricingForm = new FormGroup({
      country: new FormControl(null, [Validators.required]),
      city: new FormControl(null, [Validators.required]),
      type: new FormControl(null, [Validators.required]),
      DriverProfit: new FormControl(null, [Validators.required]),
      MinFarePrice: new FormControl(null, [Validators.required]),
      BasePriceDistance: new FormControl('', [Validators.required]),
      BasePrice: new FormControl(null, [Validators.required]),
      DistancePrice: new FormControl(null, [Validators.required]),
      TimePrice: new FormControl(null, [Validators.required]),
      MaxSpace: new FormControl(null, [Validators.required, validateMaxSpace]),
    });
  }

  ngOnInit(): void {
    this.countryService.initonlyCountry().subscribe({
      next: (data) => {
        this.ContryList = data.sort();
      },
    });

    this.vehicleService.initGetTypesOfVehicles().subscribe({
      next: (data) => {
        this.VehicleList = data;
      },
      error: (error) => {
        this.error = error;
        this.displayerror = true;
      },
    });

    this.getData();
  }

  onCountrySelect() {
    this.error = null;
    this.PricingForm.get('city')?.setValue('');
    let value = this.PricingForm.get('country')?.value;

    const selectedCountryName =
      this.PricingCountry.nativeElement.options[
        this.PricingCountry.nativeElement.selectedIndex
      ].innerText;
    console.log(selectedCountryName);
    console.log(value);

    this.cityService.initGetAllCountry(value).subscribe({
      next: (data) => {
        this.CityList = data;
        console.log(this.CityList);

        // Update the value of the city form control to the first item in the list
        if (this.CityList.length > 0) {
          this.PricingForm.get('city')?.setValue(this.CityList[0]._id);
        }
      },
      error: (error) => {
        this.error = error;
        this.displayerror = true;
      },
    });
  }

  initSubmit() {
    this.error = null;

    this.issubmitted = true;

    if (!this.PricingForm.valid) {
      return;
    }

    console.log(this.PricingForm.value);

    if (!this.isEditMode) {
      this.priceService.initAddPriceData(this.PricingForm.value).subscribe({
        next: (data) => {
          console.log(data);

          this.getData();
          this.initReset();
        },
        error: (error) => {
          if (error.error && error.error.code === 39) {
            this.error = error.error.message;
            this.displayerror = true;
          }
        },
      });
    } else {
      this.priceService
        .initEditPricing(this.userId, this.PricingForm.value)
        .subscribe({
          next: (data) => {
            this.getData();
            this.initReset();
          },
          error: (error) => {
            console.log(error);
            if (error.error && error.error.code === 39) {
              this.error = error.error.message;
              this.displayerror = true;
            }
          },
        });
    }
  }

  getData(event?: any) {
    let data = {
      limit: +this.limit,
      // searchValue: (document.getElementById('searchBtn') as HTMLInputElement)
      //   ?.value,
      page: event ? event : this.page,
    };
    this.page = event ? event : this.page;
    this.priceService.initGetAllZonePricing(data).subscribe({
      next: (data) => {
        console.log(data);
        this.PricingList = data.prices;
        this.totalPriceList = data.priceCount;
      },
      error: (error) => {
        this.displayerror = true;
        console.log(error);
      },
    });
  }

  initReset() {
    this.error = null;
    this.issubmitted = false;
    this.displayerror = false;
    this.CityList = [];
    this.userId = null;
    this.isEditMode = false;
    this.PricingForm.reset();
  }

  onEdit(Price: any) {
    this.isEditMode = true;
    this.userId = Price._id;

    this.PricingForm.patchValue({ country: null, city: null, type: null });

    this.PricingForm.patchValue({
      country: Price.country,
      // city: Price.city,
      type: Price.type,
      DriverProfit: Price.DriverProfit,
      MinFarePrice: Price.MinFarePrice,
      BasePriceDistance: Price.BasePriceDistance,
      BasePrice: Price.BasePrice,
      DistancePrice: Price.DistancePrice,
      TimePrice: Price.TimePrice,
      MaxSpace: Price.MaxSpace,
    });

    this.cityService.initGetAllCountry(Price.country).subscribe({
      next: (data) => {
        this.CityList = data;
        this.cd.detectChanges();

        // Update the value of the city form control to the first item in the list
        if (this.CityList.length > 0) {
          this.PricingForm.get('city')?.setValue(Price.city);
        }
      },
      error: (error) => {
        this.error = error;
        this.displayerror = true;
      },
    });
  }

  onDelete(id: any) {
    this.priceService.initDeleteZonePricing(id).subscribe({
      next: (data) => {
        this.getData();
      },
      error: (error) => {
        this.error = error.message;
        this.displayerror = true;
      },
    });
  }
}
