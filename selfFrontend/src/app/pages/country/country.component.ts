import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CountryService } from 'src/app/Services/country.service';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css'],
})
export class CountryComponent implements OnInit {
  Countries: any;
  CountryList: any;
  changed: any;
  error: any;
  isSearchMode = false;
  isSubmitted = false;

  CountryForm: FormGroup | any;
  selectedCountryData: any = {
    countryname: '',
    currency: '',
    timeZone: '',
    // flag: 'flag',
    countrycode: '',
    flagimage: '',
  };

  constructor(
    private countryService: CountryService,
    private toaster: ToastrService
  ) {}
  ngOnInit(): void {
    this.countryService
      .initgetRequest('https://restcountries.com/v3.1/all')
      .subscribe((data: any) => {
        this.Countries = data.sort((a: any, b: any) =>
          a.name.common.localeCompare(b.name.common)
        );
      });

    this.countryService.initGetAllCountry().subscribe({
      next: (data) => {
        this.CountryList = data;
      },
    });

    this.CountryForm = new FormGroup({
      selectedCountry: new FormControl(null, [Validators.required]),
      timezone: new FormControl({ value: null, disabled: true }, [
        Validators.required,
      ]),
      currency: new FormControl({ value: '', disabled: true }, [
        Validators.required,
      ]),
      countrycode: new FormControl({ value: '', disabled: true }, [
        Validators.required,
      ]),
      flag: new FormControl(
        { value: null, disabled: true },
        Validators.required
      ),
    });
  }

  onCountrySelect() {
    const selectedCountry = this.CountryForm.get('selectedCountry')?.value;
    console.log('selectedCountry', selectedCountry);

    if (!selectedCountry) {
      this.error = 'Please Select Country';

      this.changed = false;
      this.selectedCountryData = {
        countryname: '',
        currency: 'currency',
        timeZone: 'timeZone',
        // flag: 'flag',
        countrycode: 'countrycode',
      };
      return;
    } else {
      this.changed = true;
    }

    this.countryService
      .initgetRequest('https://restcountries.com/v3.1/alpha/' + selectedCountry)
      .subscribe({
        next: (data: any) => {
          let currenciesy;
          let symbol;
          if (data[0].currencies) {
            currenciesy = Object.keys(data[0].currencies);
            symbol = data[0].currencies[currenciesy[0]].symbol;
          } else {
            symbol = '';
          }

          this.selectedCountryData.countryname = data[0].name.common || '';
          this.selectedCountryData.currency = symbol;
          this.selectedCountryData.timeZone = data[0].timezones[0] || '';
          this.selectedCountryData.flag = data[0].flag || '';

          if (data[0].idd && data[0].idd.root && data[0].idd.suffixes[0]) {
            this.selectedCountryData.countrycode =
              data[0].idd.root + data[0].idd.suffixes[0];
          } else {
            this.selectedCountryData.countrycode = '';
          }
          if (data[0].flags && data[0].flags.png) {
            this.selectedCountryData.flagimage = data[0].flags.png;
          } else {
            this.selectedCountryData.flagimage = '';
          }
        },
        error: (error) => {
          console.log(error);
        },
        complete: () => {},
      });
  }

  onSubmit() {
    console.log(this.CountryForm);

    if (
      !this.CountryForm.valid ||
      this.selectedCountryData.countryname == 'Antarctica'
    ) {
      this.toaster.error('Please Add Valid Data');
      return;
    }
    this.CountryForm.get('selectedCountry').touched = true;

    if (!this.selectedCountryData.countryname) {
      this.error = 'please select country ';
      return;
    }
    let formData = new FormData();
    formData.append('countryname', this.selectedCountryData.countryname);
    formData.append('countrycode', this.selectedCountryData.countrycode);
    formData.append('currency', this.selectedCountryData.currency);
    formData.append('flagimage', this.selectedCountryData.flagimage);
    formData.append('timeZone', this.selectedCountryData.timeZone);

    console.log(formData);
    this.countryService.initCountry(formData)?.subscribe({
      next: (data) => {
        this.countryService.initGetAllCountry().subscribe({
          next: (data) => {
            this.CountryList = data;
          },
        });
        this.toaster.success('Country Added SuccessFully');
      },
      error: (error) => {
        if (error.error.code == 11000 && error.error.keyValue.countryname) {
          this.toaster.error(
            error.error.keyValue.countryname + ' is  already added'
          );
          // this.error = error.error.keyValue.countryname + ' is  already added';
          // this.changed = false;
        } else {
          this.toaster.error(error.message);

          this.error = error.message;
          this.changed = false;
        }
      },
      complete: () => {},
    });
  }

  oncencel() {
    this.CountryForm.reset();

    this.error = 'Please Select Country';
    this.changed = false;
  }

  onDelete(id: any) {
    this.countryService.initDeleteCountry(id).subscribe({
      next: (data) => {
        console.log(data);
        this.countryService.initGetAllCountry().subscribe({
          next: (data) => {
            this.CountryList = data;
          },
          error: (error) => {
            this.error = error.message;
            this.changed = false;
          },
        });
      },
      error: (error) => {
        this.error = error.message;
        this.changed = false;
      },
    });
  }

  onSearch() {
    this.isSearchMode = !this.isSearchMode;
    if (!this.isSearchMode) {
      this.countryService.initGetAllCountry().subscribe({
        next: (data) => {
          this.CountryList = data;
        },
        error: (error) => {
          this.error = error.message;
          this.changed = false;
        },
      });
    }
  }

  onSearchCountry() {
    let searchValue = (document.getElementById('searchBtn') as HTMLInputElement)
      .value;
    console.log(searchValue);
    const Value = { Value: searchValue };
    this.countryService.initGetAllCountry(Value).subscribe({
      next: (data) => {
        this.CountryList = data;
      },
      error: (error) => {
        this.error = error.message;
        this.changed = false;
      },
    });
  }
}
