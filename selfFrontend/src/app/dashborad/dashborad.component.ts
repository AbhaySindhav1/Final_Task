import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-dashborad',
  templateUrl: './dashborad.component.html',
  styleUrls: ['./dashborad.component.css']
})
export class DashboradComponent {
  @Input() NavigationStatus: boolean = false;
 
}
