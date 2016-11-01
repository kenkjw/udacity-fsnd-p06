$(document).ready(function(){

  function Place(data) {
    this.name = ko.observable(data.name);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
  }

  function getDefaultPlaces() {
    return ko.observableArray([
      new Place({name: "Phnom Penh Restaurant", lat: 49.278360, lng: -123.098231}),
      new Place({name: "Guu Japanese Restaurant", lat: 49.284005, lng: -123.125435}),
      new Place({name: "Rodney's Oyster House", lat: 49.274307, lng: -123.123136}),
      new Place({name: "Landmark Hot Pot House", lat: 49.249836, lng: -123.115540}),
      new Place({name: "Granville Island Brewing", lat: 49.270616, lng: -123.135774})
    ]);
  }

  function RecommendationViewModel() {
    var self = this;
    var places = getDefaultPlaces()

  }

  ko.applyBindings(new RecommendationViewModel())
});