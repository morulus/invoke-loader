const path = require('path')
const resolve = require('resolve');
const loaderUtils = require('loader-utils')

function requireFromCache(name) {
  const cachedModule = require.cache[name]
  let resultModule;
  if (cachedModule && cachedModule.exports) {
    return cachedModule.exports;
  }

  return undefined;
}

function localRequire(name, fromCache) {
  let resultModule;

  if (path.isAbsolute(name)) {
    resultModule = require(name);
  } else {
    if (fromCache) {
      resultModule = requireFromCache(name);
    }

    if (!resultModule) {
      const pathname = resolve.sync(
        name,
        { basedir: this.context }
      )

      if (!pathname) {
        throw new Error(`Module ${JSON.stringify(pathname)} is not found`);
      }

      resultModule = require(pathname);
    }
  }

  /* Support es modules*/
  return resultModule.__esModule
    ? resultModule.default
    : resultModule
};

/* Get loader and options from options */
function getPayload() {
  var options = loaderUtils.getOptions(this) || {};

  /* Resolve & require options */
  var loaderOptionsModule = localRequire.call(
    this,
    options.options,
    Boolean(options.cache)
  );

  /* Resolve & require loader */
  var loader = localRequire.call(
    this,
    options.loader,
    Boolean(options.cache)
  );

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
  const loaderOptions = typeof loaderOptionsModule === 'function'
    ? loaderOptionsModule(options)
    : loaderOptionsModule;

  return {
    loaderOptions,
    loader,
  };
}

module.exports = function(...args) {
  const {
    loaderOptions,
    loader
  } = getPayload.call(this);

  /* Create simple proxy context with query hook */
  const proxyContext = Object.create(this, {
    query: {
      value: loaderOptions
    }
  });

  /* Call user loader in hooked context */
  return Reflect.apply(
    loader,
    proxyContext,
    args
  )
}


/**
 * User loader also may have pitch, so we must support
 *  this case. Unfortunately, we do not know is loader
 *  has own pitch before pitch will execute. Therefore
 *  our pitch will always execute to handle loader
 *  pitch.
 */
module.exports.pitch = function(...args) {
  const {
    loaderOptions,
    loader
  } = getPayload.call(this);

  if (typeof loader.pitch === 'function') {
    const proxyContext = Object.create(this, {
      query: {
        value: loaderOptions
      }
    });

    return Reflect.apply(
      loader.pitch,
      proxyContext,
      args
    )
  } else {
    return undefined;
  }
}
