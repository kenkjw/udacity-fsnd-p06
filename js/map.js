var map;
function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 49.282, lng: -123.132},
      zoom: 12
    });

    /*
    var infoWindow = new google.maps.InfoWindow({map: map});

  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
  }
  */
}
