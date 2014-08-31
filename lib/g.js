const apikey = 'AIzaSyD3oE0s0D_4qfuHRSLkEbf9a8tQ5o5_X6g';
const base_url = 'https://www.googleapis.com/urlshortener/v1/url';

function googl(url, clipBoard, notifications, ntfy, titl) {
  var req_c = '{ "key": "' + apikey + '",' +
                 '"longUrl": "' + encodeURI(url) + '" }';
  var req = require("sdk/request");

  req.Request( {
    content: req_c,
    contentType: 'application/json',
    onComplete:
      function(r) {
        if (r.status == 200) {
          clipBoard.set(r.json['id']);
          if (ntfy)
            notifications.notify( {
              iconURL: require("sdk/self").data.url('icon48.png'),
              title: titl,
              text: 'Shortened URL copied to clipboard.' });
        } else {
          notifications.notify( {
            iconURL: require("sdk/self").data.url('icon48.png'),
            text: "Error: " + r.statusText + "/" + r.status,
            title: titl });
        }
      },
    url: base_url
  }).post();
}

exports.googl = googl;

// end of file.
