self.on('click',
  function (node, data) {
    var target = node.childNodes[3].src;
    self.postMessage({
    action: data,
    url: target }); });
