/**
 * Just an object with some helpful functions
 *
 * @type {Object}
 * @namespace Barba.Utils
 */
var Utils = {
  /**
   * 404 page setting, by default, the 404 page locates in /404/index.html, you can change the path by using `Barba.Utils.errorPageUrl = '/path/to/404'`
   * @type {String}
   * @default
   */
  errorPageUrl: '/404/index.html',

  /**
   * Return the current url
   *
   * @memberOf Barba.Utils
   * @return {String} currentUrl
   */
  getCurrentUrl: function() {
    return window.location.protocol + '//' +
           window.location.host +
           window.location.pathname +
           window.location.search;
  },

  /**
   * Given an url, return it without the hash
   *
   * @memberOf Barba.Utils
   * @private
   * @param  {String} url
   * @return {String} newCleanUrl
   */
  cleanLink: function(url) {
    return url.replace(/#.*/, '');
  },

  /**
   * Time in millisecond after the xhr request goes in timeout
   *
   * @memberOf Barba.Utils
   * @type {Number}
   * @default
   */
  xhrTimeout: 5000,

  /**
   * Start an XMLHttpRequest() and return a Promise
   *
   * @memberOf Barba.Utils
   * @param  {String} url
   * @return {Promise}
   */
  xhr: function(url) {
    var deferred = this.deferred();
    var req = new XMLHttpRequest();
    const errorPageUrl = this.errorPageUrl

    req.onreadystatechange = function() {
      if (req.readyState === 4) {
        if (req.status === 200) {
          return deferred.resolve(req.responseText);
        } else {
          if (req.status === 404) {
            /**
             *  if the status is 404, resend the
             *  XMLHttpRequest to get 404 page and prevent
             *  the 404 issue
             *  @private
             *  @param  {Boolean} errorLoaded
             *  to prevent loading loop
             */
            if (req.errorLoaded !== true) {
              const errorUrl = window.location.protocol + '//' + window.location.host + errorPageUrl
              req.errorLoaded = true
              req.open('GET', errorUrl);
              req.timeout = this.xhrTimeout;
              req.setRequestHeader('x-barba', 'yes');
              req.send();
            } else {
              alert('xhr: HTTP code is 404, but cannt find the 404 page')
              window.history.back();
            }
          } else {
            return deferred.reject(new Error('xhr: HTTP code is not 200'));
          }
        }
      }
    };

    req.ontimeout = function() {
      return deferred.reject(new Error('xhr: Timeout exceeded'));
    };

    req.open('GET', url);
    req.timeout = this.xhrTimeout;
    req.setRequestHeader('x-barba', 'yes');
    req.send();

    return deferred.promise;
  },

  /**
   * Get obj and props and return a new object with the property merged
   *
   * @memberOf Barba.Utils
   * @param  {object} obj
   * @param  {object} props
   * @return {object}
   */
  extend: function(obj, props) {
    var newObj = Object.create(obj);

    for(var prop in props) {
      if(props.hasOwnProperty(prop)) {
        newObj[prop] = props[prop];
      }
    }

    return newObj;
  },

  /**
   * Return a new "Deferred" object
   * https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Deferred
   *
   * @memberOf Barba.Utils
   * @return {Deferred}
   */
  deferred: function() {
    return new function() {
      this.resolve = null;
      this.reject = null;

      this.promise = new Promise(function(resolve, reject) {
        this.resolve = resolve;
        this.reject = reject;
      }.bind(this));
    };
  },

  /**
   * Return the port number normalized, eventually you can pass a string to be normalized.
   *
   * @memberOf Barba.Utils
   * @private
   * @param  {String} p
   * @return {Int} port
   */
  getPort: function(p) {
    var port = typeof p !== 'undefined' ? p : window.location.port;
    var protocol = window.location.protocol;

    if (port != '')
      return parseInt(port);

    if (protocol === 'http:')
      return 80;

    if (protocol === 'https:')
      return 443;
  }
};

module.exports = Utils;
