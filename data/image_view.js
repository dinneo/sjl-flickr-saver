// image_view.js

self.on('click',
  function (node, data) {
    self.postMessage(
      { action: data,
        url: window.location.href + "/sizes/l" }
    );
  }
);

// end of file.
