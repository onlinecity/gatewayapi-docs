function getCookie(key) {
  try {
    var result = '';
    if (document.cookie) {
      if (document.cookie.indexOf(key) !== -1) {
        var beginpos = document.cookie.indexOf(key) + key.length + 1;
        var endpos = document.cookie.indexOf(';', beginpos);
        result = document.cookie.substring(beginpos, endpos !== -1 ? endpos : document.cookie.length);
      }
    }
    return result;
  } catch (e) {
  }
}

try {
  if (getCookie('cookie-policy-classes').indexOf('marketing') !== -1) {
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({
        'gtm.start': new Date().getTime(), event: 'gtm.js'
      });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src =
        'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', 'GTM-KV8W3HS');
  }
  if (getCookie('matomodisablecookies') !== '1') {
    var _paq = window._paq = window._paq || [];
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    (function () {
      var u = 'https://gatewayapi.matomo.cloud/';
      _paq.push(['setTrackerUrl', u + 'matomo.php']);
      _paq.push(['setSiteId', '2']);
      var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
      g.type = 'text/javascript';
      g.async = true;
      g.src = '//cdn.matomo.cloud/gatewayapi.matomo.cloud/matomo.js';
      s.parentNode.insertBefore(g, s);
    })();
    var _mtm = window._mtm = window._mtm || [];
    _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
    var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
    g.type = 'text/javascript';
    g.async = true;
    g.src = 'https://cdn.matomo.cloud/gatewayapi.matomo.cloud/container_tGamsaIK.js';
    s.parentNode.insertBefore(g, s);
  }
} catch (e) {
}
