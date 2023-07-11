import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboradComponent } from './dashborad/dashborad.component';
import { AuthGuardService } from './Services/auth-guard.service';

const appRoutes: Routes =[
  {path:"",redirectTo:"dashboard",pathMatch: 'full'},
  {
    path: '',
    component: DashboradComponent,
    canActivate: [AuthGuardService],
    children: [
      {
        path: '',
        loadChildren: () => import('src/app/dashborad/dashborad.module').then(m => m.DashboradModule)
      }
    ]
  },
  // {path:"signup",component:RegisterComponent},
  {path:"login",component:LoginComponent},
  {path:"dashboard",component:DashboradComponent , canActivate: [AuthGuardService]},
  { path: '**', redirectTo:""}
]

@NgModule({
  imports: [  RouterModule.forRoot(appRoutes, {
    useHash: true
  })],
  exports: [RouterModule]
})


export class AppRoutingModule { 
}
