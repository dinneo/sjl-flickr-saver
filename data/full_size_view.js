// image_view.js

self.on('click',
  function (node, data) {
    self.postMessage(
      { action: data,
        url: node.getElementsByTagName('IMG')[0].src }
    );
  }
);

// end of file.
