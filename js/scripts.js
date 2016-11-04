/**
 * @fileoverview Knockout JS application for displaying a list of
 * Yelp businesses data and displaying the locations on a Google map.
 *
 * Requires the Google Map API and the accompanying yelp.js for Yelp API calls.
 */

/**
 * @typedef {Object} Coordinates
 * @property {number} lat Latitude
 * @property {number} lng Longitude
 */

/**
 * A wrapper class for the Google Maps Marker class.
 * Should provide functionality if Google Maps fails to load.
 * Currently does nothing if google maps not loaded.
 *
 * @constructor
 * @param {Object} params Parameters to initiate the marker.
 * @param {Coordinates} params.position Coordinates for the marker.
 * @param {sstring} params.title A title for the marker
 */
function Marker(params) {
  this.position = params.position;
  this.title = params.title;
  this._marker = null;
  if(typeof google !== 'undefined') {
    this._marker = new google.maps.Marker({
        position: this.position,
        title: this.title
    });
  }

  this.setPosition = function(position) {
    if(this._marker)
      this._marker.setPosition(position);
  };

  this.setMap = function(map) {
    if(this._marker)
      this._marker.setMap(map);
  };

  this.animate = function(animate) {
    if(this._marker) {
      animate ?
        this._marker.setAnimation(google.maps.Animation.BOUNCE) :
        this._marker.setAnimation(null);
    }
  };

  this.addListener = function(event,func) {
    if(this._marker) {
      this._marker.addListener(event,func);
    }
  };

}


function Map() {
  this.panTo = function(position) {
  };
}

/**
 * Initiates the google map on element with id "map"
 *
 * @param {Coordinates} places List of places to center map around
 * @return {Map|google.maps.Map} The map instantiated by Google Maps Api
 *    or the empty class Map if Google Maps failed to load.
 */
 Map.initMap = function(places) {
    if(typeof google === 'undefined') {
      return new Map();
    }

    var bounds = new google.maps.LatLngBounds();
    for(var i=0;i<places.length;i++) {
      bounds.extend(places[i].position());
    }
    var map = new google.maps.Map(document.getElementById('map'), {
      center: bounds.getCenter()
    });
    map.fitBounds(bounds);
    return map;
  };
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
    return 'http://www.yelp.com/biz/' + self.id;
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
  this.ratingImg = ko.observable();

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

  this.marker = new Marker({
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
  var filters = filter.trim().split(' ');
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
    };
  };

  //Listener for when a list item is clicked.
  this.onClickListItem = function(place) {
    //Stop previous selected Place animation
    if(self.displayedPlace())
      self.displayedPlace().marker.animate(false);
    //If selected Place is the same as previous Place, deselect Place.
    if(self.displayedPlace() == place) {
      self.displayedPlace(null);
      return;
    }
    //Pan to map position and animate marker.
    self.map.panTo(place.position());
    place.marker.animate(true);
    //Set place as currently selected Place.
    self.displayedPlace(place);
    //Retrieve updated API data from Yelp.
    yelpApi.getBusiness(place);
  };

  //Full list of yelp businesses
  this.places = ko.observableArray(getDefaultPlaces());
  //Initiate the map.
  this.map = Map.initMap(this.places());

  //The filter text string
  this.filterText = ko.observable('');
  //The currently selected Place
  this.displayedPlace = ko.observable(null);

  //List of Places from this.places that pass the filter: this.filterText
  this.filteredPlaces = ko.computed(function() {
    var filtered = [];
    self.displayedPlace(null);
    for(var i=0;i<self.places().length;i++) {
      var place = self.places()[i];
      if(passFilter(place,self.filterText())) {
        filtered.push(place);
        place.marker.setMap(self.map);
        place.marker.addListener('click', self.onClickMarker(place));
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

function onMapLoad() {
  //Check to see if google maps api loaded properly
  if(typeof google !== 'undefined'){
    mapLoaded = true;
    //Apply knockout bindings
    ko.applyBindings(new YelpViewModel());
  }
  else {
    onMapError();
  }
}

//If Google Map fails to load.
function onMapError() {
  $('#map').text('Oops! There was an error loading the map api.');
  ko.applyBindings(new YelpViewModel());
}