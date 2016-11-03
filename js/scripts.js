$(document).ready(function(){

  function Place(data) {
    var self = this
    this.id = data.id;
    this.title = ko.observable(data.title);
    this.position = ko.observable();
    this.categories = ko.observable();
    this.review = ko.observable();
    this.address = ko.observable();
    this.url = ko.computed(function(){
      return "http://www.yelp.com/biz/" + self.id;
    });
    this.rating = ko.observable();
    this.rating_img = ko.observable();
    this.phone = ko.observable();
    this.hasApiData = ko.observable(false);
    this.hasApiError = ko.observable(false);
    this.marker = new google.maps.Marker({
          position: this.position(),
          title: this.title()
    });

    this._updateMarkerPosition = function () {
      this.marker.setPosition(this.position())
    }
    this.position.subscribe(this._updateMarkerPosition,this)
    if(data.position) {
      this.position(data.position);
    }

  }

  /**
   * Creates a list of hard-coded Places
   *
   */
  function getDefaultPlaces() {
    return [
      new Place({title: "Phnom Penh", id: "phnom-penh-vancouver", position: {lat: 49.278360, lng: -123.098231}}),
      new Place({title: "Guu Original Thurlow", id: "guu-original-thurlow-vancouver", position: {lat: 49.284005, lng: -123.125435}}),
      new Place({title: "Rodney's Oyster House", id: "rodneys-oyster-house-vancouver", position: {lat: 49.274307, lng: -123.123136}}),
      new Place({title: "Landmark Hotpot House", id: "landmark-hotpot-house-vancouver", position: {lat: 49.249836, lng: -123.115540}}),
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
      pass = false;
      if(1>filter.length)
        continue;
      if(-1 < place.title().toLowerCase().indexOf(filter.toLowerCase()))
        pass = true;
      if(!pass)
        return false;
    }
    return true;
  }

  function RecommendationViewModel() {
    var self = this;

    this.onClickMarker = function(place) {
      return function() {
        self.onClickListItem(place);
      }
    };

    this.onClickListItem = function(place) {
      if(self.displayedPlace())
        self.displayedPlace().marker.setAnimation(null);
      if(self.displayedPlace() == place) {
        self.displayedPlace(null);
        return;
      }
      self.map.panTo(place.position());
      place.marker.setAnimation(google.maps.Animation.BOUNCE);
      self.displayedPlace(place)
      yelpApiBusinessGet(place)
    }

    this.addLocation = function() {
      self.newLocation("")
    }

    this.places = ko.observableArray(getDefaultPlaces());
    var center = getCenter(this.places)
    this.map = initMap(center);
    this.filterText = ko.observable("")
    this.displayedPlace = ko.observable(null);
    this.newLocation = ko.observable()
    this.filteredPlaces = ko.computed(function() {
      var filtered = [];
      self.displayedPlace(null)
      for(var i=0;i<self.places().length;i++) {
            place = self.places()[i]
            if(passFilter(place,self.filterText())) {
              filtered.push(place);
              place.marker.setMap(self.map);
              place.marker.addListener('click', self.onClickMarker(place))
            }
            else {
              place.marker.setMap(null);
            }
      }
      return filtered;
    });

    for(var i=0;i<this.places().length;i++) {
      yelpApiBusinessGet(this.places()[i]);
    }

  }

  ko.applyBindings(new RecommendationViewModel())
});