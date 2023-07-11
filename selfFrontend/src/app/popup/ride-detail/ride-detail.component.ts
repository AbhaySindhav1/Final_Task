import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

declare var google: any;

@Component({
  selector: 'app-ride-detail',
  templateUrl: './ride-detail.component.html',
  styleUrls: ['./ride-detail.component.css'],
})
export class RideDetailComponent implements OnInit {
  Ride: any;
  map: google.maps.Map | any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    if (typeof this.data.Stops === 'string') {
      this.data.Stops = JSON.parse(this.data.Stops);
    }
    this.Ride = this.data;
    if (this.Ride.Map) {
      setTimeout(() => {
        this.initMap();
      }, 10);
    }
  }

  initMap(lat = 23, lng = 73, zoom = 7) {
    let loc = { lat: +lat, lng: +lng };

    this.map = new google.maps.Map(document.getElementById('map'), {
      center: loc,
      zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    });

    var locationNames = [
      this.Ride.PickupPoint,
      ...this.Ride.Stops,
      this.Ride.DropPoint,
    ];

    // Create a geocoder instance
    var directionsService = new google.maps.DirectionsService();

    let markers: any[] = [];

    // Create a DirectionsRenderer instance to display the directions on the map

    // Geocode each location name and get the LatLng coordinates
    var waypoints = locationNames.map(function (locationName) {
      return {
        location: locationName,
      };
    });

    // Configure the directions request
    var request = {
      origin: locationNames[0],
      destination: locationNames[locationNames.length - 1],
      waypoints: waypoints.slice(1, -1),
      travelMode: google.maps.TravelMode.DRIVING,
    };

    // Send the directions request

    directionsService.route(request, (response: any, status: any) => {
      if (status === google.maps.DirectionsStatus.OK) {
        // Extract the polyline from the directions response
        var polyline = response.routes[0].overview_polyline;
        console.log('polyline', polyline);

        // Decode the polyline into an array of LatLng coordinates
        var decodedPolyline =
          google.maps.geometry.encoding.decodePath(polyline);

        console.log('decodedPolyline', decodedPolyline);

        // Create a new polyline instance
        var drawnPolyline = new google.maps.Polyline({
          path: decodedPolyline,
          geodesic: true,
          strokeColor: '#3D5A80',
          strokeOpacity: 1.0,
          strokeWeight: 5,
        });

        // Display the polyline on the map
        drawnPolyline.setMap(this.map);

        // Create a marker for the pickup point
        var pickupMarker = new google.maps.Marker({
          position: response.routes[0].legs[0].start_location,
          map: this.map,
          label: 'P',
        });
        markers.push(pickupMarker);

        // Create markers for each location
        for (var i = 1; i < locationNames.length - 1; i++) {
          var marker = new google.maps.Marker({
            position: response.routes[0].legs[i].start_location,
            map: this.map,
            label: (i + 1).toString(),
          });
          markers.push(marker);
        }

        // Create a marker for the destination place
        var destinationMarker = new google.maps.Marker({
          position:
            response.routes[0].legs[response.routes[0].legs.length - 1]
              .end_location,
          map: this.map,
          label: 'D',
        });
        markers.push(destinationMarker);

        this.map.fitBounds(response.routes[0]?.bounds);
        var mapCenter = response.routes[0]?.bounds.getCenter();

        this.map.setCenter(mapCenter);
      }
    });
  }
}
