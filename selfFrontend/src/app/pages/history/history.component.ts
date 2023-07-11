import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MapService } from 'src/app/Services/map.service';
import { RideService } from 'src/app/Services/ride.service';
import { SocketService } from 'src/app/Services/socket.service';
import { RideDetailComponent } from 'src/app/popup/ride-detail/ride-detail.component';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})
export class HistoryComponent implements OnInit {
  VehicleList: any;
  RideSearchForm: any;

  RideList: any;
  limit: any = 10;
  page: any = 1;
  totalRides: any;
  constructor(
    private rideService: RideService,
    public dialog: MatDialog,
    private mapService: MapService,
    private socketService: SocketService
  ) {
    this.RideSearchForm = new FormGroup({
      Status: new FormControl(null),
      Type: new FormControl(null),
      FromDate: new FormControl(null),
      toDate: new FormControl(null),
      Search: new FormControl(null),
    });

    this.socketService.socket.on('RideCompleted', (data: any) => {
      this.RideList = this.RideList.push(data.Ride);
    });
  }
  ngOnInit(): void {
    this.GetRideHistory();
  }

  Oninformation(Ride: any) {
    console.log(Ride);
  }

  Filter(event?: any) {
    let form = {
      Search: this.RideSearchForm.get('Search').value,
      Type: this.RideSearchForm.get('Type').value,
      FromDate: this.RideSearchForm.get('FromDate').value,
      toDate: this.RideSearchForm.get('toDate').value,
      Status: this.RideSearchForm.get('Status').value,
    };

    this.GetRideHistory(event, form);
  }

  GetRideHistory(event?: any, Data?: any) {
    if (this.totalRides < this.limit * this.page) {
      this.page = 1;
    }
    let data = {
      limit: +this.limit,
      page: event ? event : this.page,
      filter: Data ? Data : null,
      status: [0, 5],
    };

    this.page = event ? event : this.page;

    this.rideService.initGetAllRides(data).subscribe({
      next: (data) => {
        this.RideList = data.Rides;
        this.totalRides = data.totalRide;
      },
    });
  }

  DownloadHistory() {
    let Find = {
      Search: this.RideSearchForm.get('Search').value,
      Type: this.RideSearchForm.get('Type').value,
      FromDate: this.RideSearchForm.get('FromDate').value,
      toDate: this.RideSearchForm.get('toDate').value,
      Status: this.RideSearchForm.get('Status').value,
    };

    let data = {
      status: [0, 5],
      filter: Find ? Find : null,
    };

    this.rideService.initRideHistory(data).subscribe({
      next: (data) => {
        this.mapService.onDownload(data);
        console.log(data);
      },
    });
  }

  openDialog(Ride: any) {
    Ride.Map = true;

    const dialogRef = this.dialog.open(RideDetailComponent, {
      data: Ride,
    });
  }
}
