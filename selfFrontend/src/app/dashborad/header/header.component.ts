import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from 'src/app/Services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  constructor(private authService: AuthService) {}
  @Output() sideNavEve = new EventEmitter<boolean>();
  menuStatus = false;
  NavToggeler() {
    this.menuStatus = !this.menuStatus;
    this.sideNavEve.emit(this.menuStatus);
  }

  InItLogout() {
    this.authService.ReqLogout();
  }
}
