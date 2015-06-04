// feed_view.js

self.on('click',
  function (node, data) {
    self.postMessage(
      { action: data,
        url: node.children[0].href + "sizes/l" }
    );
  }
);

// end of file.
