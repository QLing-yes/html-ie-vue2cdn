define(function() {
  var loaded = {};
  function insertLink(url, cb) {
    if (loaded[url]) { cb(); return; }
    loaded[url] = true;
    var link = document.createElement('link');
    link.rel = 'stylesheet'; link.type = 'text/css'; link.href = url;
    link.onload = function() { cb(); };
    link.onreadystatechange = function() {
      var s = link.readyState;
      if (s === 'loaded' || s === 'complete') { link.onreadystatechange = null; cb(); }
    };
    link.onerror = function() { console.warn('[css] 加载失败: ' + url); cb(); };
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  return {
    load: function(name, req, onload, config) {
      if (config.isBuild) { onload(); return; }
      insertLink(req.toUrl(name + '.css'), onload);
    }
  };
});
