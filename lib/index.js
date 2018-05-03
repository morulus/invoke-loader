'use strict';

var path = require('path');
var resolve = require('resolve');
var loaderUtils = require('loader-utils');

function requireFromCache(name) {
  var cachedModule = require.cache[name];
  var resultModule = void 0;
  if (cachedModule && cachedModule.exports) {
    return cachedModule.exports;
  }

  return undefined;
}

function localRequire(name, fromCache) {
  var resultModule = void 0;

  if (path.isAbsolute(name)) {
    resultModule = require(name);
  } else {
    if (fromCache) {
      resultModule = requireFromCache(name);
    }

    if (!resultModule) {
      var pathname = resolve.sync(name, { basedir: this.context });

      if (!pathname) {
        throw new Error(`Module ${JSON.stringify(pathname)} is not found`);
      }

      resultModule = require(pathname);
    }
  }

  /* Support es modules*/
  return resultModule.__esModule ? resultModule.default : resultModule;
};

/* Get loader second-level-options and loader module */
function getPayload() {
  var options = loaderUtils.getOptions(this) || {};

  /* Resolve & require options */
  var loaderOptionsModule = localRequire.call(this, options.options, Boolean(options.cache));

  /* Resolve & require loader */
  var loader = localRequire.call(this, options.loader, Boolean(options.cache));

  if (!loader) {
    throw new Error(`Missed loader`);
  }

  if (!loaderOptionsModule) {
    throw new Error(`Missed loader options for loader ${options.loader} with pathname ${options.options}`);
  }

  /**
   * Support factory of options. Means that options module can be a function,
    * that returns options. This function accepts current options, thus final
    * options can be created dinamically.
   */
  var loaderOptions = typeof loaderOptionsModule === 'function' ? loaderOptionsModule(options) : loaderOptionsModule;

  return {
    loaderOptions,
    loader
  };
}

module.exports = function () {
  var _getPayload$call = getPayload.call(this),
      loaderOptions = _getPayload$call.loaderOptions,
      loader = _getPayload$call.loader;

  /* Create simple proxy context with query hook */


  var proxyContext = Object.create(this, {
    query: {
      value: loaderOptions
    }
  });

  /* Call user loader in hooked context */

  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return Reflect.apply(loader, proxyContext, args);
};

/**
 * User loader also may have pitch, so we must support
 *  this case. Unfortunately, we do not know is loader
 *  has own pitch before pitch will execute. Therefore
 *  our pitch will always execute to handle loader
 *  pitch.
 */
module.exports.pitch = function () {
  var _getPayload$call2 = getPayload.call(this),
      loaderOptions = _getPayload$call2.loaderOptions,
      loader = _getPayload$call2.loader;

  if (typeof loader.pitch === 'function') {
    var proxyContext = Object.create(this, {
      query: {
        value: loaderOptions
      }
    });

    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return Reflect.apply(loader.pitch, proxyContext, args);
  } else {
    return undefined;
  }
};
