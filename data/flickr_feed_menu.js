// flickr_feed_menu.js

self.on('click',
  function (node, data) {
    var target = node.children[0].href + "sizes/l";
    self.postMessage({ action: data, url: target });
  }
);

// end of file.
