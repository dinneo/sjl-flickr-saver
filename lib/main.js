const {Cc, Ci, Cu} = require("chrome");
Cu.import("resource://gre/modules/osfile.jsm");
Cu.import("resource://gre/modules/Downloads.jsm");
Cu.import("resource://gre/modules/Task.jsm");

var clipBoard = require('sdk/clipboard');
var contextMenu = require('sdk/context-menu');
var notifications = require('sdk/notifications');
var parser = Cc["@mozilla.org/xmlextras/domparser;1"].
               createInstance(Ci.nsIDOMParser);

const titl = 'Flickr Saver';
const shortener_apikey = 'AIzaSyD3oE0s0D_4qfuHRSLkEbf9a8tQ5o5_X6g';
const shortener_base_url = 'https://www.googleapis.com/urlshortener/v1/url';

var menuItems = [
  contextMenu.Item({ label: 'Download the full size image',
                     data: 'save' }),
  contextMenu.Item({ label: 'Open the full size image in a new tab',
                     data: 'tab' }),
  contextMenu.Item({ label: 'Short URL of full size image to clipboard',
                     data: 'shorten' }),
  contextMenu.Item({ label: 'URL of full size image to clipboard',
                     data: 'direct' }),
];

function saveUrlToFile(url, path) {
  var f = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile); 
  f.initWithPath(path)
  Task.spawn(function () { yield Downloads.fetch(url, f.path); });
}

function browse_select(action, url) {
  var req = require('sdk/request').Request;
  var ret = req({
    url: url,
    onComplete: function (resp) {
      doc = parser.parseFromString(resp.text, "text/html");
      src = doc.getElementById('allsizes-photo').
                getElementsByTagName('IMG')[0].src;
      action_select(action, src);
    },
  }).get();
}

function action_select(action, url) {
  switch (action) {
    case 'direct':
      clipBoard.set(url);
      notifications.notify({
        text: 'Image URL copied to clipboard.',
        title: titl,
      });
      break;

    case 'tab':
      require('sdk/tabs').open(url);
      break;

    case 'save':
      var lastDir = require("sdk/preferences/service").
                         get('browser.download.lastDir');
      var dir = Cc["@mozilla.org/file/local;1"].
                  createInstance(Ci.nsILocalFile);
      var fp = Cc["@mozilla.org/filepicker;1"].
                 createInstance(Ci.nsIFilePicker);

      fp.init(require('sdk/window/utils').getMostRecentBrowserWindow(),
              'Save As', Ci.nsIFilePicker.modeSave);
      fp.defaultString = url.substring(url.lastIndexOf('/')+1);
      if (typeof lastDir !== 'undefined') {
        dir.initWithPath(lastDir);
        fp.displayDirectory = dir;
      }

      var ret = fp.show();
      if (ret == Ci.nsIFilePicker.returnOK ||
          ret == Ci.nsIFilePicker.returnReplace)
        saveUrlToFile(url, fp.file.path);

      break;

    case 'shorten':
      require('g.js').googl(url, clipBoard, notifications, true, titl);
      break;
  }
}

var feed_menu = contextMenu.Menu({
  context: [
    contextMenu.SelectorContext('div.session-image-wrapper'),
    contextMenu.URLContext('*.flickr.com'),
  ],
  contentScriptFile: require('sdk/self').data.url('feed_view.js'),
  items: menuItems,
  label: "Flickr Saver: ",
  onMessage: function(j) { browse_select(j['action'], j['url']); },
});

var full_size_menu = contextMenu.Menu({
  context: [
   contextMenu.SelectorContext('div#allsizes-photo'),
   contextMenu.URLContext('*.flickr.com'),
  ],
  contentScriptFile: require('sdk/self').data.url('full_size_view.js'),
  items: menuItems,
  label: "Flickr Saver: ",
  onMessage: function(j) { action_select(j['action'], j['url']); },
});

var image_menu = contextMenu.Menu({
  context: [
   contextMenu.SelectorContext('div.view.photo-well-media-scrappy-view'),
   contextMenu.URLContext('*.flickr.com'),
  ],
  contentScriptFile: require('sdk/self').data.url('image_view.js'),
  items: menuItems,
  label: "Flickr Saver: ",
  onMessage: function(j) { browse_select(j['action'], j['url']); },
});

var photostream_menu = contextMenu.Menu({
  context: [
    contextMenu.SelectorContext('div.view.photo-list-photo-view.requiredToShowOnServer.photostream.awake'),
    contextMenu.URLContext('*.flickr.com'),
  ],
  contentScriptFile: require('sdk/self').data.url('photostream_view.js'),
  items: menuItems,
  label: "Flickr Saver: ",
  onMessage: function(j) { browse_select(j['action'], j['url']); },
});

var search_menu = contextMenu.Menu({
  context: [
    contextMenu.SelectorContext('div.interaction-view'),
    contextMenu.URLContext(/.*flickr.com\/search\?.*/),
  ],
  contentScriptFile: require('sdk/self').data.url('search_view.js'),
  items: menuItems,
  label: "Flickr Saver: ",
  onMessage: function(j) { browse_select(j['action'], j['url']); },
});


// end of file.
