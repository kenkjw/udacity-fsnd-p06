$(document).ready(function(){

  function Place(data) {
    this.title = data.title;
    this.position = data.position;
    this.reviews = ko.observableArray([]);
    this.marker = new google.maps.Marker({
          position: this.position,
          title: this.title
    });
  }

  function getDefaultPlaces() {
    return [
      new Place({title: "Phnom Penh Restaurant", position: {lat: 49.278360, lng: -123.098231}}),
      new Place({title: "Guu Japanese Restaurant", position: {lat: 49.284005, lng: -123.125435}}),
      new Place({title: "Rodney's Oyster House", position: {lat: 49.274307, lng: -123.123136}}),
      new Place({title: "Landmark Hot Pot House", position: {lat: 49.249836, lng: -123.115540}}),
      new Place({title: "Granville Island Brewing", position: {lat: 49.270616, lng: -123.135774}})
    ];
  }

  function initMap(center) {
    return new google.maps.Map(document.getElementById('map'), {
      center: center,
      zoom: 12
    });
  }

  function getCenter(places) {
    var latMin, latMax;
    var lngMin, lngMax;
    var threshold = 0.025;
    if(1 > places.length) {
      return {lat: 49.277634, lng: -123.122264}
    }
    latMin = latMax = places[0].position.lat;
    lngMin = lngMax = places[0].position.lng;
    for(var i=1;i<places.length;i++) {
      var lat = places[i].position.lat;
      var lng = places[i].position.lng;
      if(lat > latMax && lat < latMin + threshold)
        latMax = lat;
      if(lat < latMin && lat > latMax - threshold)
        latMin = lat;
      if(lng > lngMax && lng < lngMin + threshold)
        lngMax = lng;
      if(lng < lngMin && lng > lngMin - threshold)
        lngMin = lng;
    }
    return {lat: (latMin+latMax)/2, lng: (lngMin+lngMax)/2}
  }

  function setMapOnPlaces(places,map) {
    for (var i=0;i<places.length;i++) {
          places[i].marker.setMap(map);
    }
  }

  function passFilter(place, filter) {
    if(1>filter.trim().length)
      return true;
    var filters = filter.trim().split(" ");
    for(var j=0;j<filters.length;j++) {
      filter = filters[j];
      if(1>filter.length)
        continue;
      if(-1==place.title.toLowerCase().indexOf(filter.toLowerCase()))
        return false;
    }
    return true;
  }

  function RecommendationViewModel() {
    var self = this;
    this.places = ko.observableArray(getDefaultPlaces());
    this.filterText = ko.observable("")
    this.filteredPlaces = ko.computed(function() {
      var filtered = [];
      for(var i=0;i<self.places().length;i++) {
            if(passFilter(self.places()[i],self.filterText())) {
              filtered.push(self.places()[i]);
            }
      }
      return filtered;
    });

    var center = getCenter(this.filteredPlaces())

    this.map = initMap(center);


    setMapOnPlaces(this.places(),null);
    setMapOnPlaces(this.filteredPlaces(),this.map);
    /*
    this.filterPlaces = function (newFilter) {
      var filters = newFilter.split(" ")
      console.log(filters);
      console.log(self.places)
      console.log(self.filteredPlaces())
      console.log(self)
      for(var i=0;i<self.places.length;i++) {
        console.log(self.places[i])
        for(var j=0;j<filters.length;j++) {
          if(-1 < self.places[i].title.indexOf(filters[j])) {
            console.log(self.places[i])
            self.filteredPlaces.push(self.places[i]);
            break;
          }
        }
      }
    };

    this.filterText.subscribe(this.filterPlaces,this);
    */
  }

  ko.applyBindings(new RecommendationViewModel())
});