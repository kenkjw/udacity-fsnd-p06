/**
 * @fileoverview Description of file, its uses and information
 * about its dependencies.
 */

/**
 * @typedef {Object} Coordinates
 * @property {number} lat Latitude
 * @property {number} lng Longitude
 */

/**
 * Knockout model class representing a subset of a Yelp Business's data.
 * @class
 * @Constructor
 * @param {Object} data An object with data to initialize the Place
 * @param {string} data.id Yelp ID for this business
 * @param {string} [data.title] The name of the business
 * @param {Coordinate} [data.position] The map coordinates of the business
 */
function Place(data) {
  var self = this;

  /**
   * Yelp ID for this business.
   * @type {string}
   */
  this.id = data.id;

  /**
   * Name of this business.
   * @type {string}
   */
  this.title = ko.observable(data.title);

  /**
   * Yelp ID for this business.
   * @type {string}
   */
  this.position = ko.observable();

  /**
   * A list of category name that this business is associated with.
   * @type {Array.string}
   */
  this.categories = ko.observable();

  /**
   * Snippet text associated with this business.
   * @type {string}
   */
  this.review = ko.observable();

  /**
   * Address for this business formatted for display. Includes all
   * address fields, cross streets and city, state_code, etc.
   * @type {Array.string}
   */
  this.address = ko.observable();

  /**
   * URL for business page on Yelp.
   * @type {string}
   */
  this.url = ko.computed(function(){
    return "http://www.yelp.com/biz/" + self.id;
  });

  /**
   * Rating for this business.
   * @type {numer}
   */
  this.rating = ko.observable();

  /**
   * URL to star rating image for this business.
   * @type {string}
   */
  this.rating_img = ko.observable();

  /**
   * Phone number for this business formatted for display.
   * @type {string}
   */
  this.phone = ko.observable();

  /**
   * Boolean representing whether this Place has been updated with API data.
   * @type {boolean}
   */
  this.hasApiData = ko.observable(false);

  /**
   * Boolean representing whether there was an error retrieving API data.
   * @type {boolean}
   */
  this.hasApiError = ko.observable(false);

  /**
   * Google Maps marker for this Place.
   * @type {google.maps.Marker}
   */
  this.marker = new google.maps.Marker({
        position: this.position(),
        title: this.title()
  });

  //Private helper method for updating the google maps marker's location.
  this._updateMarkerPosition = function () {
    this.marker.setPosition(this.position());
  };
  //Subscribe the helper method to any changes to the Place's position.
  this.position.subscribe(this._updateMarkerPosition,this);
  //Initialize position to trigger marker location update.
  if(data.position) {
    this.position(data.position);
  }
}

/**
 * Creates a list of hard-coded Places
 *
 * @return {Array.Place} An array of Places.
 */
function getDefaultPlaces() {
  return [
    new Place({
      title: 'Phnom Penh',
      id: 'phnom-penh-vancouver',
      position: {lat: 49.278360, lng: -123.098231}
    }),
    new Place({
      title: 'Guu Original Thurlow',
      id: 'guu-original-thurlow-vancouver',
      position: {lat: 49.284005, lng: -123.125435}
    }),
    new Place({
      title: "Rodney's Oyster House",
      id: 'rodneys-oyster-house-vancouver',
      position: {lat: 49.274307, lng: -123.123136}}),
    new Place({
      title: 'Landmark Hotpot House',
      id: 'landmark-hotpot-house-vancouver',
      position: {lat: 49.249836, lng: -123.115540}}),
    new Place({
      title: 'Granville Island Brewing',
      id: 'granville-island-brewing-vancouver',
      position: {lat: 49.270616, lng: -123.135774}})
  ];
}

/**
 * Initiates the google map on element with id "map"
 *
 * @param {Coordinates} center Coordinates to center map around
 * @return {google.maps.Map} The map instantiated by Google Maps Api
 */
function initMap(center) {
  return new google.maps.Map(document.getElementById('map'), {
    center: center,
    zoom: 12
  });
}

/**
 * Calculates the center coordinates of a list of places.
 * Places beyond a threshold difference are ignored.
 *
 * @param {Array.Place} places Array of Places to calculate center of.
 *
 * @return {Coordinates} Coordinates to the center of the Places.
 */
function getCenter(places) {
  var latMin, latMax;
  var lngMin, lngMax;
  //Threshold difference for latitude/longitude values to differ from min/max
  var threshold = 0.025;

  //Return a default location if no places are given.
  if(1 > places.length) {
    return {lat: 49.277634, lng: -123.122264}
  }

  //Begin by centering map on first place.
  latMin = latMax = places[0].position.lat;
  lngMin = lngMax = places[0].position.lng;
  for(var i=1;i<places.length;i++) {
    var lat = places[i].position.lat;
    var lng = places[i].position.lng;
    //Check that coordinates are within threshold then update min/max
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

/**
 * Check whether a Place satisfies a filter string.
 * Currently only checks that Place's title contains every word in filter.
 *
 * @param {Place} place The Place to be filtered
 * @param {string} filter The filter string to apply to place.
 *
 * @return {boolean} Whether the place passes the check or not.
 */
function passFilter(place, filter) {
  //If filter is an empty string, automatic pass.
  if(1>filter.trim().length)
    return true;
  //Split the filter string into words.
  var filters = filter.trim().split(" ");
  //Iterate through the filter words
  for(var j=0;j<filters.length;j++) {
    var f = filters[j];
    var pass = false;
    //Ignore empty string
    if(1>f.length)
      continue;
    //Check if title contains filter word
    if(-1 < place.title().toLowerCase().
      indexOf(f.toLowerCase()))
      pass = true;
    //If any filter word fails, filter check returns false.
    if(!pass)
      return false;
  }
  //All filter words passed.
  return true;
}

/**
 * Knockout ViewModel class for a webpage that lists out data for several
 * Yelp businesses and displays them on a Google Map.
 * @class
 * @Constructor
 */
function YelpViewModel() {
  var self = this;

  //Closure for map Marker listener.
  //Performs same action as clicking on list item
  this.onClickMarker = function(place) {
    return function() {
      self.onClickListItem(place);
    }
  };

  //Listener for when a list item is clicked.
  this.onClickListItem = function(place) {
    //Stop previous selected Place animation
    if(self.displayedPlace())
      self.displayedPlace().marker.setAnimation(null);
    //If selected Place is the same as previous Place, deselect Place.
    if(self.displayedPlace() == place) {
      self.displayedPlace(null);
      return;
    }
    //Pan to map position and animate marker.
    self.map.panTo(place.position());
    place.marker.setAnimation(google.maps.Animation.BOUNCE);
    //Set place as currently selected Place.
    self.displayedPlace(place)
    //Retrieve updated API data from Yelp.
    yelpApi.getBusiness(place)
  }

  //Full list of yelp businesses
  this.places = ko.observableArray(getDefaultPlaces());
  //Find the center
  var center = getCenter(this.places)
  this.map = initMap(center);
  //The filter text string
  this.filterText = ko.observable("")
  //The currently selected Place
  this.displayedPlace = ko.observable(null);

  //List of Places from this.places that pass the filter: this.filterText
  this.filteredPlaces = ko.computed(function() {
    var filtered = [];
    self.displayedPlace(null)
    for(var i=0;i<self.places().length;i++) {
          var place = self.places()[i]
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

  //Retrieve API data for the initial set of Places.
  for(var i=0;i<this.places().length;i++) {
    yelpApi.getBusiness(this.places()[i]);
  }

}
//Apply knockout bindings
ko.applyBindings(new YelpViewModel())
