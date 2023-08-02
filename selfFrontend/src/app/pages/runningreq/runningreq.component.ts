import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RideService } from 'src/app/Services/ride.service';
import { SocketService } from 'src/app/Services/socket.service';
import { FeedbackComponent } from 'src/app/popup/feedback/feedback.component';
import { RideDetailComponent } from 'src/app/popup/ride-detail/ride-detail.component';

@Component({
  selector: 'app-runningreq',
  templateUrl: './runningreq.component.html',
  styleUrls: ['./runningreq.component.css'],
  providers: [NgbModalConfig, NgbModal],
})
export class RunningreqComponent implements OnInit {
  @ViewChild('staticBackdrop', { static: false }) staticBackdrop: any;

  Trip: any = {};
  RideList: any;
  Interval: any;
  timeoutValue: any = 10000;
  limit: any = 10;
  page: any = 1;
  totalRides: any;
  dialogRef: any;

  constructor(
    config: NgbModalConfig,
    private socketService: SocketService,
    private rideService: RideService,
    public dialog: MatDialog
  ) {
    config.backdrop = 'static';
    config.keyboard = false;

    this.socketService.socket.on('reqtoSendDriver', (data: any) => {
      this.initChange(data);
    });

    this.socketService.socket.on('RejectRide', (data: any) => {
      console.log('RejectRide');
      this.initChange(data?.ride);
    });

    this.socketService.socket.on('RideStatus', (data: any) => {
      this.initRideDataChange(data?.RideId, data?.Status);
    });

    this.socketService.socket.on('ReqAcceptedByDriver', (data: any) => {
      this.initChange(data);
    });

    this.socketService.socket.on('noDriverFound', (data: any) => {
      console.log('noDriverFound');
      this.RideList = this.RideList.filter((ride: any) => {
        return ride._id !== data.Ride._id;
      });
    });

    this.socketService.socket.on('NotReactedRide', (data: any) => {
      console.log('NotReactedRide', data);
      this.initChange(data.rides);
    });

    this.socketService.socket.on('CancelledRide', (data: any) => {
      this.CancelRide(data.Ride);
    });

    this.socketService.socket.on('ModelClose', (data: any) => {
      if (this.dialogRef) {
        this.dialogRef.close();
      }
    });
  }

  ngOnInit(): void {
    this.GetRides();
  }

  OnAccept(Ride: any) {
    this.socketService.socket.emit('DriverResponse', { Ride, Status: 2 });
  }

  OnNotReactedByDriver(Ride: any) {
    this.socketService.socket.emit('DriverResponse', { Ride, Status: 1 });
    this.RideList = this.RideList.filter((ride: any) => {
      return ride._id !== Ride._id;
    });
    if (this.Interval) {
      clearTimeout(this.Interval);
    }
  }

  CancelRide(Ride: any) {
    this.RideList = this.RideList.filter((ride: any) => {
      return ride._id !== Ride.RideId;
    });
  }

  RejectRide(Ride: any) {
    this.socketService.socket.emit('DriverResponse', { Ride, Status: 0 });
  }

  GetRides(event?: any) {
    if (this.totalRides < this.limit * this.page) {
      this.page = 1;
    }
    let data = {
      limit: +this.limit,
      page: event ? event : this.page,
      status: [2, 3, 4, 100],
    };

    this.page = event ? event : this.page;

    this.rideService.initGetAllRides(data).subscribe({
      next: (data) => {
        // console.log(data);
        this.RideList = data.Rides;
        this.totalRides = data.totalRide;
      },
    });
  }

  initRideDataChange(
    rideID: any,
    RideStatus: any,
    RideDriverId?: any,
    RideDriver?: any
  ) {
    if (!rideID) return;
    if (this.RideList) {
      const ride = this.RideList.find((r: any) => r._id === rideID);

      if (RideStatus) {
        ride.Status = RideStatus;
      }
      if (RideDriverId) {
        ride.DriverId = RideDriverId;
      }
      if (RideDriver) {
        ride.Driver = RideDriver;
      }
    }
  }

  initStatus(status: any) {
    return this.rideService.initGetStatus(status);
  }

  ChangeStatus(id: any, Status: any) {
    // console.log(id, Status);
    this.rideService.initProgressRide(id, Status).subscribe({
      next: (data) => {
        let updatedStatus = this.rideService.initGetStatus(Status);

        if (Status == 5) {
          this.dialogRef = this.dialog.open(FeedbackComponent, {
            width: '600px',
            data: id,
          });
          this.RideList = this.RideList.filter((ride: any) => {
            return ride._id !== id;
          });
        }
        this.socketService.ToasterService('success', updatedStatus);
      },
      error: (error) => {
        this.socketService.ToasterService('error', 'Something Went Wrong');
      },
    });
  }

  openDialog(Ride: any) {
    this.dialogRef = this.dialog.open(RideDetailComponent, {
      data: Ride,
    });
  }

  openFeedbackForm(ID: any) {
    
  }

  initChange(data: any) {
    const index = this.RideList?.findIndex(
      (ride: any) => ride._id === data._id
    );
    if (index !== -1) {
      this.RideList[index] = data;
    } else {
      this.RideList.push(data);
    }
  }

  open(content?: any) {
    this.staticBackdrop.nativeElement.classList.add('show');
    this.staticBackdrop.nativeElement.style.display = 'block';
  }
  closeModel() {
    this.staticBackdrop.nativeElement.classList.remove('show');
    this.staticBackdrop.nativeElement.style.display = 'none';
  }
}
