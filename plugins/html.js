define(function() {
  return {
    load: function(name, req, onload, config) {
      if (config.isBuild) { onload(); return; }
      var xhr = new XMLHttpRequest();
      xhr.open('GET', req.toUrl(name), true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return;        
        if (xhr.status === 200 || xhr.status === 0) onload(xhr.responseText);
        else { console.error('[html] 加载失败: ' + name); onload(''); }
      };
      xhr.send(null);
    }
  };
});
