const {Cc, Ci, Cu} = require("chrome");
Cu.import("resource://gre/modules/osfile.jsm");
Cu.import("resource://gre/modules/Downloads.jsm");
Cu.import("resource://gre/modules/Task.jsm");

const titl = 'Flickr Saver';
const shortener_apikey = 'AIzaSyD3oE0s0D_4qfuHRSLkEbf9a8tQ5o5_X6g';
const shortener_base_url = 'https://www.googleapis.com/urlshortener/v1/url';

var clipBoard = require('sdk/clipboard');
var contextMenu = require('sdk/context-menu');
var notifications = require('sdk/notifications');

function saveUrlToFile(url, path) {
  var f = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile); 

  f.initWithPath(path)

  var dl = Cc["@mozilla.org/network/io-service;1"].
             getService(Ci.nsIIOService).newURI(url, null, null);
  var p = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].
            createInstance(Ci.nsIWebBrowserPersist);

  Task.spawn(function () {
               yield Downloads.fetch(url, f.path);
             });
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
      var dir = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
      var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);

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

var flickr_menu = contextMenu.Menu({
  context: [
   contextMenu.SelectorContext('div#allsizes-photo'),
   contextMenu.URLContext('*.flickr.com'),
  ],
  contentScriptFile: require('sdk/self').data.url('flickr_menu.js'),
  items: [
    contextMenu.Item({ label: 'Direct URL to clipboard', data: 'direct' }),
    contextMenu.Item({ label: 'Download image', data: 'save' }),
    contextMenu.Item({ label: 'Open image in new tab', data: 'tab' }),
    contextMenu.Item({ label: 'Shortened URL to clipboard', data: 'shorten' }),
  ],
  label: "Flickr Saver: ",
  onMessage: function(j) { action_select(j['action'], j['url']); },
});

var flickr_browse_menu = contextMenu.Menu({
  context: [
    contextMenu.SelectorContext('href#ui-display-link'),
    contextMenu.URLContext('*.flickr.com'),
  ],
  contentScriptFile: require('sdk/self').data.url('flickr_browse_menu.js'),
  items: [
    contextMenu.Item({ label: 'Full size image URL to clipboard',
                       data: 'direct' }),
    contextMenu.Item({ label: 'Download full size image', data: 'save' }),
  ],
  label: "Flickr Saver: ",
  onMessage: function(j) { action_select(j['action'], j['url']); },
});
