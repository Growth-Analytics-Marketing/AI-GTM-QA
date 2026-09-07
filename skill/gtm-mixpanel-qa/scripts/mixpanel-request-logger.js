// Paste into the site tab (DevTools console or javascript_tool) after the page has loaded.
// Logs every request the Mixpanel SDK sends (track + engage) into sessionStorage.__mplog,
// hooking XHR / sendBeacon / fetch at the prototype level so it survives the SDK replacing window.mixpanel.
// Read it back with:  JSON.parse(sessionStorage.__mplog).flatMap(e => e.d)   (one request can carry several events)
(function(){
  if (window.__mpnet) return 'already installed';
  window.__mpnet = true;
  function dec(body){ try{ var s = typeof body==='string' ? body : (body instanceof URLSearchParams ? body.toString() : '');
    var m = s.match(/(?:^|&)data=([^&]+)/); if (m){ var j = decodeURIComponent(m[1]); try { return JSON.parse(j) } catch(e) { return JSON.parse(atob(j)) } }
    return JSON.parse(s) } catch(e){ return String(body).slice(0,200) } }
  function log(url, body){ try{ if(!/mixpanel\.com\/(track|engage)/.test(url)) return;
    var l = JSON.parse(sessionStorage.__mplog||'[]'); l.push({t:Date.now(), k:/engage/.test(url)?'engage':'track', d:dec(body)}); sessionStorage.__mplog = JSON.stringify(l) } catch(e){} }
  var xo = XMLHttpRequest.prototype.open, xs = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function(m,u){ this.__u = u; return xo.apply(this, arguments) };
  XMLHttpRequest.prototype.send = function(b){ log(this.__u||'', b); return xs.apply(this, arguments) };
  var sb = navigator.sendBeacon; if (sb) navigator.sendBeacon = function(u,b){ log(u,b); return sb.apply(this, arguments) };
  var f = window.fetch; window.fetch = function(u,o){ log(typeof u==='string'?u:(u&&u.url)||'', o&&o.body); return f.apply(this, arguments) };
  return 'installed';
})();
