// flickr_menu.js

self.on('click',
  function (node, data) {
    var target = node.getElementsByTagName('IMG')[0].src;
    self.postMessage({ action: data, url: target }); });

// end of file.
