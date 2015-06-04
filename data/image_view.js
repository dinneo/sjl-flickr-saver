// image_view.js

self.on('click',
  function (node, data) {
    tgt = window.location.href;
    if (tgt.match(/(.*)\/in\/.*/))
      tgt = tgt.replace(/(.*)\/in\/.*/, "$1" + "/sizes/l");
    else
      tgt = tgt + "/sizes/l";
    self.postMessage(
      { action: data,
        url: tgt }
    );
  }
);

// end of file.
