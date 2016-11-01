$(document).ready(function(){

  function Place(data) {
    this.title = data.title;
    this.id = data.id;
    this.position = data.position;
    this.categories = ko.observableArray([]);
    this.reviews = ko.observableArray([]);
    this.marker = new google.maps.Marker({
          position: this.position,
          title: this.title
    });
  }

  function getDefaultPlaces() {
    return [
      new Place({title: "Phnom Penh", id: "phnom-penh-vancouver", position: {lat: 49.278360, lng: -123.098231}}),
      new Place({title: "Guu Original Thurlow", id: "guu-original-thurlow-vancouver", position: {lat: 49.284005, lng: -123.125435}}),
      new Place({title: "Rodney's Oyster House", id: "rodneys-oyster-house-vancouver", position: {lat: 49.274307, lng: -123.123136}}),
      new Place({title: "Landmark Hot Pot House", id: "landmark-hotpot-house-vancouver", position: {lat: 49.249836, lng: -123.115540}}),
      new Place({title: "Granville Island Brewing", id: "granville-island-brewing-vancouver", position: {lat: 49.270616, lng: -123.135774}})
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
    var center = getCenter(this.places)
    this.map = initMap(center);
    this.filterText = ko.observable("")
    this.displayedPlace = ko.observable(null);
    this.filteredPlaces = ko.computed(function() {
      var filtered = [];
      for(var i=0;i<self.places().length;i++) {
            if(passFilter(self.places()[i],self.filterText())) {
              filtered.push(self.places()[i]);
              self.places()[i].marker.setMap(self.map);
            }
            else {
              self.places()[i].marker.setMap(null);
            }
      }
      return filtered;
    });


    this.clickListItem = function() {
      if(self.displayedPlace())
        self.displayedPlace().marker.setAnimation(null);
      if(self.displayedPlace() == this) {
        self.displayedPlace(null);
        return;
      }
      self.map.panTo(this.position);
      this.marker.setAnimation(google.maps.Animation.BOUNCE);
      self.displayedPlace(this)
    }
  }

  ko.applyBindings(new RecommendationViewModel())
});