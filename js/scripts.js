$(document).ready(function(){

  function Place(data) {
    this.name = ko.observable(data.name);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
  }

  function RecommendationViewModel() {
    var self = this;

    
  }

  ko.applyBindings(new RecommendationViewModel())
});