// photostream_view.js

self.on('click',
  function (node, data) {
    var tgt = node.getElementsByClassName('overlay')[0].href + "sizes/l";
    self.postMessage({
      action: data,
      url: tgt }
    );
  }
);

// end of file.
