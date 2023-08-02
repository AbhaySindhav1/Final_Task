import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { io } from 'socket.io-client';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  socket: any;
  data: any;
  error: any;

  constructor(private toaster: ToastrService) {
    this.socket = io('http://localhost:3000', {
      forceNew: true,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('connected');
    });

    this.socket.on('connect_error', (err: any) => {
      console.log(err);
    });
  }

  RunningReqData(): Observable<any> {
    return new Observable<any>((observer) => {
      observer.next(this.data);
    });
  }

  ToasterService(type: any, msg?: any) {
    if (type == 'success') {
      this.toaster.success(msg);
    } else if (type == 'error') {
      if (msg && msg.error && msg.error.sizeError) {
        this.error = msg.error.sizeError;
      } else if (msg && msg.error && msg.error.fileError) {
        this.error = msg.error.fileError;
      } else if (msg && msg.error && msg.error.error) {
        this.error = msg.error.error;
      } else if (msg && msg.error) {
        this.error = msg.error;
      } else {
        this.error = msg;
      }
      this.toaster.warning(this.error);
    } else if ((type = 'Delete')) {
      this.toaster.error('Delete Successfully');
    }
  }
}
