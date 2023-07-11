import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppRoutingModule, DashBoardRoutes } from './dashboard.routing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';

import { DropdownDirective } from '../Shared/drop-down.directive';
import { LoginComponent } from '../auth/login/login.component';
import { RegisterComponent } from '../auth/register/register.component';
import { TableComponent } from '../pages/table/table.component';
import { DashboradComponent } from './dashborad.component';
import { HeaderComponent } from './header/header.component';
import { SideNavbarComponent } from './side-navbar/side-navbar.component';
import { CommonModule } from '@angular/common';
import { CountryComponent } from '../pages/country/country.component';
import { CityComponent } from '../pages/city/city.component';
import { PricingComponent } from '../pages/pricing/pricing.component';
import { UsersComponent } from '../pages/users/users.component';
import { DriverComponent } from '../pages/driver/driver.component';
import { PagesComponent } from '../pages/pages.component';
import { CreateRideComponent } from '../pages/create-ride/create-ride.component';
import { DurationPipePipe } from '../pipes/duration-pipe.pipe';
import { ConfirmRideComponent } from '../pages/confirm-ride/confirm-ride.component';
import { RunningreqComponent } from '../pages/runningreq/runningreq.component';
import { HistoryComponent } from '../pages/history/history.component';
import { CardComponent } from '../pages/card/card.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NgxPaginationModule } from 'ngx-pagination';
import { SettingComponent } from '../pages/setting/setting.component';
import { RideDetailComponent } from '../popup/ride-detail/ride-detail.component';
import { TimerComponent } from '../Shared/timer/timer.component';

@NgModule({
  declarations: [
    SideNavbarComponent,
    LoginComponent,
    RegisterComponent,
    DashboradComponent,
    HeaderComponent,
    DropdownDirective,
    TableComponent,
    CountryComponent,
    CityComponent,
    PricingComponent,
    UsersComponent,
    DriverComponent,
    PagesComponent,
    CreateRideComponent,
    DurationPipePipe,
    ConfirmRideComponent,
    RunningreqComponent,
    HistoryComponent,
    CardComponent,
    SettingComponent,
    RideDetailComponent,
    TimerComponent
  ],
  imports: [
    RouterModule.forChild(DashBoardRoutes),
    FormsModule,
    ReactiveFormsModule,
    MatSidenavModule,
    MatIconModule,
    HttpClientModule,
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    NgxPaginationModule,
  ],
  providers: [],
  bootstrap: [],
})
export class DashboradModule {}
