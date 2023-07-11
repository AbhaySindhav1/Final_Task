import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { DriverService } from 'src/app/Services/driver.service';
import { MapService } from 'src/app/Services/map.service';
import { MessagingService } from 'src/app/Services/messaging.service';
import { RideService } from 'src/app/Services/ride.service';
import { SocketService } from 'src/app/Services/socket.service';
import { VehicleService } from 'src/app/Services/vehicle.service';
import { RideDetailComponent } from 'src/app/popup/ride-detail/ride-detail.component';

@Component({
  selector: 'app-confirm-ride',
  templateUrl: './confirm-ride.component.html',
  styleUrls: ['./confirm-ride.component.css'],
})
export class ConfirmRideComponent implements OnInit {
  RideList: any;
  Status: any;
  VehicleList: any;
  Vehicle: any;
  RideSearchForm: any;
  driverData: any;
  Ride: any = {};
  selectedRowIndex?: any;
  SelectedRow: any;
  limit: any = 10;
  page: any = 1;
  totalRides: any;

  constructor(
    private rideService: RideService,
    private vehicleService: VehicleService,
    private toastr: ToastrService,
    private driverService: DriverService,
    private socketService: SocketService,
    public dialog: MatDialog,
    public mapService: MapService,
    private msgService: MessagingService
  ) {
    this.OnAssign = this.OnAssign.bind(this);
    this.RideSearchForm = new FormGroup({
      Status: new FormControl(null),
      Type: new FormControl(null),
      FromDate: new FormControl(null),
      toDate: new FormControl(null),
      Search: new FormControl(null),
    });

    this.socketService.socket.on('reqtoSendDriver', (data: any) => {
      // console.log('reqtoSendDriver', data);
      this.replaceRow(data);
      if (data.DriverId) {
        const index = this.driverData?.findIndex(
          (driver: any) => driver._id === data.DriverId
        );
        if (index !== -1) {
          this.driverData?.splice(index, 1);
        }
      }
    });

    this.socketService.socket.on('NotReactedRide', (data: any) => {
      // console.log('NotReactedRide', data);
      this.replaceRow(data.rides);
      if (data.Driver && this.driverData) {
        const index = this.driverData.findIndex(
          (driver: any) => driver._id === data.Driver.Driver._id
        );
        if (index !== -1) {
          this.driverData[index] = data.Driver.Driver;
        } else {
          this.driverData.push(data.Driver.Driver);
        }
      }
    });

    this.socketService.socket.on('RejectRide', (data: any) => {
      // console.log('RejectRide', data);
      this.replaceRow(data.ride);
    });

    this.socketService.socket.on('noDriverFound', (data: any) => {
      // console.log('noDriverFound', data);
      this.replaceRow(data.Ride);
    });

    // this.socketService.socket.on('RideCompleted', (data: any) => {
    //   console.log('RideCompleted', data);
    //   this.RideList = this.RideList.filter((ride: any) => {
    //     return ride._id !== data.Ride._id;
    //   });
    // });

    this.socketService.socket.on('CancelledRide', (data: any) => {
      // console.log('CancelledRide', data);
      this.RideList = this.RideList.filter((ride: any) => {
        return ride._id !== data.Ride.RideId;
      });
    });

    this.socketService.socket.on('RideStatus', (data: any) => {
      // console.log('RideStatus', data);
      this.initRideDataChange(data?.RideId, data?.Status);
    });
    this.socketService.socket.on('NoDriverIsThere', (data: any) => {
      console.log("NoDriverIsThere ",data);
      this.msgService.getToken(data);
    });

    this.socketService.socket.on('ReqAcceptedByDriver', (data: any) => {
      // console.log('ReqAcceptedByDriver', data);
      if (data.DriverInfo._id && data.DriverInfo.DriverName) {
        this.initRideDataChange(
          data._id,
          data.Status,
          data.DriverInfo._id,
          data.DriverInfo.DriverName
        );
      }
    });
  }

  ngOnInit(): void {
    this.msgService.PrepareMessaging();
    this.vehicleService.initGetTypesOfVehicles().subscribe({
      next: (data) => {
        this.VehicleList = data;
      },
      error: (error) => {
        this.toastr.error(error.errors);
      },
    });
    this.GetAllData();
  }

  AutoAssign(Ride: any) {
    this.socketService.socket.emit('RideAssignNearestDriver', Ride._id);
  }

  OnAssign(Ride: any) {
    let formdata = new FormData();
    formdata.append('ServiceType', Ride.type);
    formdata.append('RideCity', Ride.RideCity);

    this.driverService.initSpeceficDrivers(formdata).subscribe({
      next: (data) => {
        this.driverData = data;
      },
      error: (error) => {
        console.log(error);
        this.toastr.error(error);
      },
    });
    this.Ride = Ride;
    this.selectedRowIndex = null;
    this.SelectedRow = null;
  }

  CancelRide(Ride: any, Status?: any) {
    if (Status == 0) {
      let Confirm = confirm('Are You Want Cancel Ride');
      if (!Confirm) return;

      this.socketService.socket.emit('ride', {
        rideID: Ride._id,
        Status: Status,
        driverID: Ride.DriverId,
      });
    }
  }

  initStatus(status: any) {
    return this.rideService.initGetStatus(status);
  }

  AssignDriver(ride: any, Status?: any) {
    if (!ride) return;
    this.socketService.socket.emit('ride', {
      rideID: ride._id,
      driverID: this.SelectedRow._id,
      Status: Status,
    });
  }

  getTrData(index: any, row: any) {
    this.selectedRowIndex = index;
    this.SelectedRow = row;
  }

  initRideDataChange(
    rideID: any,
    RideStatus: any,
    RideDriverId?: any,
    RideDriver?: any
  ) {
    
    if (!rideID) return;
    const ride = this.RideList.find((r: any) => r._id === rideID);
    console.log("ride",ride);
    if (RideStatus) {
      ride.Status = RideStatus;
    }
    if (RideDriverId && RideDriver) {
      ride.DriverId = RideDriverId;
      ride.Driver = RideDriver;
    }
  }

  ////////////////////////////////////////////////////////////    Get  Filter  Rides      /////////////////////////////////////////////////////////////////////

  Filter(event?: any) {
    let form = {
      Search: this.RideSearchForm.get('Search').value,
      Type: this.RideSearchForm.get('Type').value,
      FromDate: this.RideSearchForm.get('FromDate').value,
      toDate: this.RideSearchForm.get('toDate').value,
      Status: this.RideSearchForm.get('Status').value,
    };

    this.GetAllData(event, form);
  }

  ////////////////////////////////////////////////////////////    Get   All  Rides      /////////////////////////////////////////////////////////////////////

  GetAllData(event?: any, formdata?: any) {
    if (this.totalRides < this.limit * this.page) {
      this.page = 1;
    }
    let data = {
      limit: +this.limit,
      page: event ? event : this.page,
      status: [1, 100], //2, 3, 4, 5,
      filter: formdata ? formdata : null,
    };

    this.page = event ? event : this.page;

    this.rideService.initGetAllRides(data).subscribe({
      next: (data) => {
        data.Rides.forEach((element: any) => {
          if (element.Stops) {
            element.Stops = JSON.parse(element.Stops);
          }
        });
        this.RideList = data.Rides;
        this.totalRides = data.totalRide;
      },
    });
  }

  ////////////////////////////////////////////////////////////    Get  Rides  Download     /////////////////////////////////////////////////////////////////////

  DownloadHistory() {
    let Find = {
      Search: this.RideSearchForm.get('Search').value,
      Type: this.RideSearchForm.get('Type').value,
      FromDate: this.RideSearchForm.get('FromDate').value,
      toDate: this.RideSearchForm.get('toDate').value,
      Status: this.RideSearchForm.get('Status').value,
    };

    let data = {
      status: [1, 100], //2, 3, 4, 5,
      filter: Find ? Find : null,
    };

    this.rideService.initRideHistory(data).subscribe({
      next: (data) => {
        if (data && data.length < 0) return;
        this.mapService.onDownload(data);
        // console.log(data);
      },
    });
  }

  ////////////////////////////////////////////////////////////    Get  Rides  Details     /////////////////////////////////////////////////////////////////////
  openDialog(Ride: any) {
    // console.log('ahugdhu');
    const dialogRef = this.dialog.open(RideDetailComponent, {
      data: Ride,
    });
  }

  replaceRow(data: any) {
    // console.log(data);
    const index = this.RideList?.findIndex(
      (ride: any) => ride._id === data._id
    );
    if (this.isJSON(data.Stops)) {
      data.Stops = JSON.parse(data.Stops);
    }
    if (index !== -1) {
      this.RideList[index] = data;
    } else {
      this.RideList.push(data);
    }
  }

  isJSON(data: any) {
    try {
      JSON.parse(data);
      return true;
    } catch (error) {
      return false;
    }
  }
}
