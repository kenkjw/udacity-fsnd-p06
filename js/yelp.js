/**
 * Constants required for Yelp's API authentication.
 */
var _CONSUMER_KEY = 'QXzwe4kuZzzFix0KCe7j-Q',
    _OAUTH_TOKEN = 'V2hGN6Wt5vDVHUJrhAbkseCqrWiFAkD1',
    _CONSUMER_SECRET = 'NSq_TjXOYhcq4q5KW4p2igxN3SU',
    _TOKEN_SECRET = 'W-X_6POjlJaaoPM0HhdD8zFjV2s';

var yelpApi = {}

/**
 * Generate a random string
 *
 * @return {string} A randomly generated string of
 *      alphanumeric characters 16 characters long.
 */
function generateNonce() {
    var length=16,
      chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var result = '';
    for(var i=0;i<length;i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;

}

/**
 * Send an API request to Yelp's business endpoint. Store
 * the resulting data in the provided Place object.
 *
 * @param {Place} place A place object that contains the id of
 *      the business to search
 * @return {undefined}
 */
yelpApi.getBusiness = function (place) {
    var url = 'https://api.yelp.com/v2/business/' + place.id;
    var httpMethod = 'GET';
    var parameters = {
        oauth_consumer_key : _CONSUMER_KEY,
        oauth_token : _OAUTH_TOKEN,
        oauth_nonce : generateNonce(),
        oauth_timestamp : Math.floor(Date.now()/1000),
        oauth_signature_method : 'HMAC-SHA1',
        oauth_version : '1.0',
        callback: 'cb'
    }
    //Generate the signature required for Yelp's Oauth 1.0 authentication.
    var encodedSignature = oauthSignature.generate(
        httpMethod, url, parameters, _CONSUMER_SECRET, _TOKEN_SECRET);
    parameters.oauth_signature = encodedSignature;

    //Settings for jquery ajax call
    var settings = {
        url: url,
        data: parameters,
        timeout: 3000,
        cache: true,
        dataType: 'jsonp',
        success: function(results) {
            //Only need first index of categories array
            var categories = results.categories.map(function(x){return x[0];});
            //Store resulting data into place object
            place.categories(categories)
            place.title(results.name)
            place.review(results.snippet_text);
            place.address(results.location.display_address);
            place.phone(results.display_phone);
            place.rating(results.rating);
            place.rating_img(results.rating_img_url);
            place.position({
                lat: results.location.coordinate.latitude,
                lng: results.location.coordinate.longitude
            });
            //Mark place as successfully accessed Yelp's api data.
            place.hasApiData(true);
        },
        error: function() {
            //Mark place as having an error.
            place.hasApiError(true);
        }
    }
    //Make the ajax call with jquery
    $.ajax(settings);
}
