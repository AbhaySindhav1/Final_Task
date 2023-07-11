import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CityService } from 'src/app/Services/city.service';
import { CountryService } from 'src/app/Services/country.service';

declare var google: any;

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.css'],
})
export class CityComponent implements OnInit {
  @ViewChild('mySelect') selectElement: any;
  Citylist: any;
  array = [];
  ContryList: any;
  isPolygonDrawn: any;
  polygon: any;
  polygons: any = [];
  Allpolygone: any;
  drawingManager: any;
  uniqueCities: any;
  map: google.maps.Map | any;
  changed = false;
  country: any;
  zone: any;
  EditingZone: any;
  IsEditMode = false;
  UserID: any;
  coordinates: any = [];
  autocomplete: google.maps.places.Autocomplete | any;
  city: any;
  page: any = 1;
  limit: any = 10;
  totalZones: any;
  constructor(
    private cityService: CityService,
    private countryService: CountryService,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    // this.changed = true;
    this.cityService
      .initGetDataFromUrl('https://restcountries.com/v3.1/all')
      .subscribe((data: any) => {
        this.array = data;
      });
    this.countryService.initonlyCountry().subscribe({
      next: (data) => {
        this.ContryList = data.sort();
      },
    });
    this.initMap();
    this.getAllZones();
  }

  initMap(lat = 23, lng = 73, zoom = 7) {
    let loc = { lat: +lat, lng: +lng };

    this.map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      { center: loc, zoom, mapTypeId: google.maps.MapTypeId.ROADMAP }
    );
    this.initAutoComplete(null);
    this.initPolygon();
  }
  initPolygon() {
    this.drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ['polygon'],
      },
    });
    this.drawingManager.setMap(this.map);

    google.maps.event.addListener(
      this.drawingManager,
      'overlaycomplete',
      (event: any) => {
        // if (this.isPolygonDrawn) {
        //   this.polygon.setMap(null);
        // }
        this.isPolygonDrawn = true;
        this.polygon = event.overlay;
        var ArrayOfZoneCordinates: any = [];
        var cordinatesAraa: any = [];
        var path = this.polygon.getPath();

        path.forEach((latLng: any) => {
          ArrayOfZoneCordinates.push({
            lng: latLng.lng(),
            lat: latLng.lat(),
          });

          this.coordinates = [];

          cordinatesAraa.push([latLng.lng(), latLng.lat()]);
        });

        this.coordinates = [...cordinatesAraa, cordinatesAraa[0]];

        this.zone = ArrayOfZoneCordinates;

        this.polygon.setEditable(false);
        this.drawingManager.setDrawingMode(null);
      }
    );
  }

  ///////////////////////////////////////////////////////////////////   On Country Change   ///////////////////////////////////////////////////////////////////////

  onCountrySelect() {
    this.changed = false;
    this.country = '';

    const selectCountry =
      this.selectElement.nativeElement.options[
        this.selectElement.nativeElement.selectedIndex
      ].value;

    const selectedCountryName =
      this.selectElement.nativeElement.options[
        this.selectElement.nativeElement.selectedIndex
      ].innerText;

    if (selectCountry == 'null' && selectedCountryName == 'null') {
      this.Toaster('error', 'Please Select Country');
      this.changed = false;
      return;
    } else {
      this.changed = true;
    }
    this.country = selectCountry;

    let contryobject: any = this.cityService.travreseArray(
      selectedCountryName,
      this.array
    );

    this.updateAutoComplete(contryobject[0].cca2);

    this.getAllZones();

    (document.getElementById('city') as HTMLInputElement).value = '';

    if (!contryobject) {
      return;
    }
  }
  ///

  Toaster(type: any, massage: any) {
    if (type == 'error') {
      this.toaster.error(massage);
    } else if ((type = 'success')) {
      this.toaster.success(massage);
    }
  }

  ///////////////////////////////////////////////////////////////////   On Form Submit   ///////////////////////////////////////////////////////////////////////

  onSubmit() {
    this.changed = false;
    if (!this.country && !this.zone && !this.city) {
      this.Toaster('error', 'Country, zone, and city are required');
      return;
    } else if (!this.country && !this.zone) {
      this.Toaster('error', 'Country and zone are required');
      return;
    } else if (!this.country && !this.city) {
      this.Toaster('error', 'Country and city are required');
      return;
    } else if (!this.zone && !this.city) {
      this.Toaster('error', 'Zone and city are required');
      return;
    } else if (!this.country) {
      this.Toaster('error', 'Country is required');
      return;
    } else if (!this.zone) {
      this.Toaster('error', 'Zone is required');
      return;
    } else if (!this.city) {
      this.Toaster('error', 'Correct City is required');
      return;
    }

    let formData = new FormData();

    formData.append('country', this.country);
    formData.append('city', this.city);
    formData.append('zone', JSON.stringify(this.zone));

    if (!this.IsEditMode) {
      formData.append(
        'Location',
        JSON.stringify({ type: 'Polygon', coordinates: [this.coordinates] })
      );
      this.cityService.initAddCityData(formData).subscribe({
        next: (data) => {
          this.changed = true;
          this.Toaster('success', 'Zone Is Created');
          this.onReset();
          this.getAllZones();
        },
        error: (error) => {
          this.Toaster('error', error.error);
        },
      });
    } else {
      formData.append(
        'Location',
        JSON.stringify({ type: 'Polygon', coordinates: this.coordinates })
      );
      this.cityService.initEditCity(this.UserID, formData).subscribe({
        next: async (data) => {
          this.Toaster('success', 'Zone Is Edited');
          this.getAllZones();
          this.onReset();
          this.IsEditMode = false;
          this.drawingManager.setMap(this.map);
        
        },
        error: (error) => {
          this.Toaster('error', error.error);
        },
      });
    }
  }

  ///////////////////////////////////////////////////////////////////   On Country Edit   ///////////////////////////////////////////////////////////////////////

  onEdit(city: any) {
    this.coordinates = city.Location.coordinates;

    this.UserID = city._id;
    this.city = city.city;
    // if (this.polygon) {
    //   this.polygon.setMap(null);
    // }

    this.polygons.forEach((polygon: any) => {
      polygon.setMap(null);
    });

    this.IsEditMode = true;

    this.zone = city.zone;

    const polygon = new google.maps.Polygon({
      paths: this.zone,
      editable: true,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillOpacity: 0.35,
    });

    // Add event listeners to the polygon's path
    const path = polygon.getPath();

    google.maps.event.addListener(path, 'set_at', (index: any) => {
      this.getCordinates(path);
    });

    google.maps.event.addListener(path, 'insert_at', (index: any) => {
      this.getCordinates(path);
    });

    google.maps.event.addListener(path, 'remove_at', (index: any) => {
      this.getCordinates(path);
    });

    // Disable Adding for any other polygons on the map

    if (this.drawingManager) {
      this.drawingManager.setMap(null);
    }

    // Add the polygon to the map
    this.EditingZone = polygon;

    this.EditingZone.setMap(this.map);
    this.polygons.push(polygon);
    const bounds = new google.maps.LatLngBounds();
    for (let i = 0; i < city.zone.length; i++) {
      bounds.extend(city.zone[i]);
    }
    this.map.fitBounds(bounds);

    this.selectElement.nativeElement.value = city.country; /// id should given
    this.country = city.country;

    (document.getElementById('city') as HTMLInputElement).value = city.city;
  }

  getCordinates(path: any) {
    let ArrayOfZoneCordinates: any = [];
    const cord: any = []; //
    path.forEach((latLng: any) => {
      ArrayOfZoneCordinates.push({
        lng: latLng.lng(),
        lat: latLng.lat(),
      });
      cord.push([latLng.lng(), latLng.lat()]); ///
    });

    let newCord = [...cord, cord[0]];
    this.coordinates = [newCord];

    this.zone = ArrayOfZoneCordinates;
  }

  initAutoComplete(country: any) {
    this.autocomplete = new google.maps.places.Autocomplete(
      document.getElementById('city') as HTMLInputElement,
      {
        types: ['(cities)'],
        componentRestrictions: { country: country },
      }
    );

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace();

      this.city = place.formatted_address;
      if (!place.geometry) {
        console.error(`No geometry for ${place.name}`);
        return;
      }

      this.map.fitBounds(place.geometry.viewport);
    });
  }

  updateAutoComplete(country: any) {
    this.autocomplete.setComponentRestrictions({ country: country });
  }

  onReset() {
    this.selectElement.nativeElement.value = null;
    this.country = null;
    this.IsEditMode = false;
    this.zone = null;
    this.changed = false;
    this.UserID = null;
    (document.getElementById('city') as HTMLInputElement).value = '';
    if (this.drawingManager) {
      this.drawingManager.setMap(this.map);
    }
  }

  getAllZones(event?: any) {
    let selectCountry;
    if (this.selectElement) {
      selectCountry =
        this.selectElement.nativeElement.options[
          this.selectElement.nativeElement.selectedIndex
        ].value;
    }

    if (this.totalZones < this.page * this.limit) {
      this.page = 1;
    }
    let data: any = {
      limit: +this.limit,
      page: event ? event : this.page,
    };

    if (selectCountry) {
      data.Country = selectCountry;
    }

    this.page = event ? event : this.page;

    this.cityService.initGetAllCities(data).subscribe({
      next: (data) => {
        // this.onReset();
        if (this.Allpolygone) {
          this.Allpolygone.setMap(null);
          this.Allpolygone = [];
        }
        if (this.EditingZone) {
          this.EditingZone.setMap(null);
        }
        this.Citylist = data.cities;
        this.totalZones = data.ZoneCount[0]?.total;
        this.Allpolygone = data.ZoneCount[0]?.Zone;
        this.DrawPolygon(this.Allpolygone);
      },
      error: (error) => {
        this.Toaster('error', error.error);
      },
    });
  }

  DrawPolygon(Array: any) {
    this.Allpolygone = new google.maps.Polygon({
      paths: Array,
      editable: false,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillOpacity: 0.35,
    });
    this.Allpolygone.setMap(this.map);
  }
}
