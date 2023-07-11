import {  Routes } from '@angular/router';
import { TableComponent } from '../pages/table/table.component';
import { CountryComponent } from '../pages/country/country.component';
import { CityComponent } from '../pages/city/city.component';
import { PricingComponent } from '../pages/pricing/pricing.component';
import { UsersComponent } from '../pages/users/users.component';
import { DriverComponent } from '../pages/driver/driver.component';
import { CreateRideComponent } from '../pages/create-ride/create-ride.component';
import { ConfirmRideComponent } from '../pages/confirm-ride/confirm-ride.component';
import { RunningreqComponent } from '../pages/runningreq/runningreq.component';
import { HistoryComponent } from '../pages/history/history.component';
import { SettingComponent } from '../pages/setting/setting.component';

export const DashBoardRoutes: Routes = [
  { path: 'table', component: TableComponent },
  { path: 'country', component: CountryComponent },
  { path: 'city', component: CityComponent },
  { path: 'pricing', component: PricingComponent },
  { path: 'users', component: UsersComponent },
  { path: 'driver', component: DriverComponent },
  { path: 'createRide', component: CreateRideComponent },
  { path: 'Confirm', component: ConfirmRideComponent },
  { path: 'runningReq', component: RunningreqComponent },
  { path: 'History', component: HistoryComponent },
  { path: 'Settings', component: SettingComponent },
  
];

export class AppRoutingModule {}
