var _consumer_key = 'QXzwe4kuZzzFix0KCe7j-Q',
_oauth_token = 'V2hGN6Wt5vDVHUJrhAbkseCqrWiFAkD1',
_consumer_secret = 'NSq_TjXOYhcq4q5KW4p2igxN3SU',
_token_secret = 'W-X_6POjlJaaoPM0HhdD8zFjV2s';

function generateNonce() {
    var length = 16;
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var result = '';
    for(var i=0;i<length;i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;

}

function getSignature(id) {
    var httpMethod = 'GET',
    yelp_url = 'https://api.yelp.com/v2/business/' + id,
    parameters = {
        oauth_consumer_key : _consumer_key,
        oauth_token : _oauth_token,
        oauth_nonce : generateNonce(),
        oauth_timestamp : '1191242096',
        oauth_signature_method : 'HMAC-SHA1',
        oauth_version : '1.0'
    },
    consumerSecret = _consumer_secret,
    tokenSecret = _token_secret,
    // generates a RFC 3986 encoded, BASE64 encoded HMAC-SHA1 hash
    encodedSignature = oauthSignature.generate(httpMethod, yelp_url, parameters, consumerSecret, tokenSecret);
    return encodedSignature;

}

function yelpApiBusinessGet(place) {
    var url = 'https://api.yelp.com/v2/business/' + place.id;
    var httpMethod = 'GET';
    var parameters = {
        oauth_consumer_key : _consumer_key,
        oauth_token : _oauth_token,
        oauth_nonce : generateNonce(),
        oauth_timestamp : Math.floor(Date.now()/1000),
        oauth_signature_method : 'HMAC-SHA1',
        oauth_version : '1.0',
        callback: 'cb'
    }
    encodedSignature = oauthSignature.generate(httpMethod, url, parameters, _consumer_secret, _token_secret);
    parameters.oauth_signature = encodedSignature;
    var settings = {
        url: url,
        data: parameters,
        timeout: 3000,
        cache: true,
        dataType: 'jsonp',
        success: function(results) {
            var categories = results.categories.map(function(x){return x[0];});
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
            place.hasApiData(true);
        },
        error: function(a,b,c) {
            place.hasApiError(true);
        }
    }
    $.ajax(settings);
}
