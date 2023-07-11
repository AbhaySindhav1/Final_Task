import { Component, OnInit } from '@angular/core';
import { Form, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SettingService } from 'src/app/Services/setting.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css'],
})
export class SettingComponent implements OnInit {
  Settinglist: any;
  SettingForm: Form | any;
  constructor(
    private settingService: SettingService,
    private toastr: ToastrService
  ) {
    this.SettingForm = new FormGroup({
      RideStops: new FormControl(this.Settinglist?.RideStops, [
        Validators.required,
      ]),
      ReqCronTime: new FormControl(this.Settinglist?.ReqCronTime, [
        Validators.required,
      ]),
      smsID: new FormControl(this.Settinglist?.smsID, [Validators.required]),
      smsToken: new FormControl(this.Settinglist?.smsToken, [
        Validators.required,
      ]),
      StripePublicKey: new FormControl(this.Settinglist?.StripePublicKey, [
        Validators.required,
      ]),
      StripePrivateKey: new FormControl(this.Settinglist?.StripePrivateKey, [
        Validators.required,
      ]),
      EmailID: new FormControl(this.Settinglist?.EmailID, [
        Validators.required,
      ]),
      EmailSecret: new FormControl(this.Settinglist?.EmailSecret, [
        Validators.required,
      ]),
      EmailToken: new FormControl(this.Settinglist?.EmailToken, [
        Validators.required,
      ]),
    });
  }
  ngOnInit(): void {
    this.getSettings();
  }

  onCancel() {
    this.SettingForm.patchValue({
      RideStops: this.Settinglist.RideStops,
      ReqCronTime: this.Settinglist.ReqCronTime,
    });
  }
  onSave(id: any) {
    
    if (!this.SettingForm.valid) {
      return;
    }
    let formData = new FormData();
    formData.append('id', id);
    formData.append('RideStops', this.SettingForm.get('RideStops').value);
    formData.append('ReqCronTime', this.SettingForm.get('ReqCronTime').value);
    formData.append('smsID', this.SettingForm.get('smsID').value);
    formData.append('smsToken', this.SettingForm.get('smsToken').value);
    formData.append('StripePublicKey', this.SettingForm.get('StripePublicKey').value);
    formData.append('StripePrivateKey', this.SettingForm.get('StripePrivateKey').value);
    formData.append('EmailID', this.SettingForm.get('EmailID').value);
    formData.append('EmailSecret', this.SettingForm.get('EmailSecret').value);
    formData.append('EmailToken', this.SettingForm.get('EmailToken').value);

    this.settingService.initChangeSettings(formData).subscribe({
      next: (data) => {
        this.Settinglist = data;
        this.toastr.success('Setting Updated');
      },
      error: (error) => {
        this.toastr.error(error.message);
      },
    });
  }

  getSettings() {
    this.settingService.initGetSettings().subscribe({
      next: (data: any) => {
        this.Settinglist = data[0];

        if (data[0]) {
          this.SettingForm.patchValue({
            RideStops: data[0]?.RideStops,
            ReqCronTime: data[0]?.ReqCronTime,
            smsID: data[0]?.smsID,
            smsToken: data[0]?.smsToken,
            StripePublicKey: data[0]?.StripePublicKey,
            StripePrivateKey: data[0]?.StripePrivateKey,
            EmailID: data[0]?.EmailID,
            EmailSecret: data[0]?.EmailSecret,
            EmailToken: data[0]?.EmailToken,
          });
        }
      },
      error: (error) => {
        this.toastr.error(error.message);
      },
    });
  }
}
