import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.css']
})
export class TimerComponent {
  @Input() timeout: number = 0;
  timeRemaining: number = 0;
  intervalId: any;

  ngOnInit() {
    this.startTimer();
  }

  startTimer() {
    this.timeRemaining = this.timeout;
    this.intervalId = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
      } else {
        clearInterval(this.intervalId);
      }
    }, 1000);
  }
}
