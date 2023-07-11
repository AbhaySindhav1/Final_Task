import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { DashboradModule } from './dashborad/dashborad.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthinterceptorInterceptor } from './authinterceptor.interceptor';
import { MatDialogModule } from '@angular/material/dialog';
import { ToastrModule } from 'ngx-toastr';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../environments/environment';
import { BnNgIdleService } from 'bn-ng-idle';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';

import {
  NgxUiLoaderModule,
  NgxUiLoaderRouterModule,
  NgxUiLoaderHttpModule,
  NgxUiLoaderConfig,
  SPINNER,
  POSITION,
  PB_DIRECTION,
} from 'ngx-ui-loader';
import { AsyncPipe } from '@angular/common';
import { FeedbackComponent } from './popup/feedback/feedback.component';
import { ReactiveFormsModule } from '@angular/forms';

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  fgsColor: 'white',
  fgsPosition: POSITION.centerCenter,
  bgsPosition: POSITION.centerCenter,
  fgsSize: 40,
  fgsType: SPINNER.fadingCircle,
  pbDirection: PB_DIRECTION.leftToRight,
  pbThickness: 5,
  text: 'Loading ...',
};

@NgModule({
  declarations: [AppComponent, FeedbackComponent],
  imports: [
    ReactiveFormsModule,
    AppRoutingModule,
    DashboradModule,
    BrowserModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    MatDialogModule,
    MatDialogModule,
    NgbModule,
    NgxUiLoaderModule,
    // NgxUiLoaderRouterModule,
    // NgxUiLoaderHttpModule,
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    // NgxUiLoaderHttpModule.forRoot({ showForeground: true }),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireMessagingModule,
    AngularFireDatabaseModule,
  ],
  providers: [
    BnNgIdleService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthinterceptorInterceptor,
      multi: true,
    },
    AsyncPipe
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
