import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-side-navbar',
  templateUrl: './side-navbar.component.html',
  styleUrls: ['./side-navbar.component.css'],
})
export class SideNavbarComponent implements OnInit {
  parentElement: any;
  ngOnInit(): void { 
  }

 @Input() isClassToggled: boolean = false;
  

  sidebar() {
    this.isClassToggled = !this.isClassToggled
  }
  buttonState: boolean = false;
  arrowList = document.getElementsByClassName("arrow") as any
  
  // toggleButton(val : any) {
    
  //   let arrow = val.target
  //   const grandparentEl = this.parentElement.parentElement as HTMLElement
      
    
  //   this.buttonState = !this.buttonState;
  //   console.log('Button state:', this.buttonState);
  //   console.log(this.arrowList);
    
  //   // Here you can handle the state change as desired, for example by updating the UI
  // }
}
