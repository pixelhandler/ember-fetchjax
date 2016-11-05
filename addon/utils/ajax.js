/*globals self: false */
import { ServerError, ClientError, FetchError } from './errors';

export default class Ajax {

  /**
    @method constructor
    @param {Object} options
      - `{ajax, promise, serialze, deserialize, cacheResponse, xhrErrorParser}`
  */
  constructor(options = {}) {
    this.AJAX = options.ajax; // requires $.ajax (jQuery.ajax)
    if (!this.AJAX) {
      throw new Error('Ajax constructor requires options.ajax!');
    }
    this.PROMISE = options.promise || self.Promise;
    this.deserialize = options.deserialize;
    this.cacheResponse = options.cacheResponse;
    this.errorParser = options.xhrErrorParser || parseXhrErrorResponse;
  }

  /**
    Makes an XHR request via AJAX method passed to constructor (jQuery.ajax)

    @method ajax
    @param {String} url
    @param {Object} options - may include a query object or an update flag
    @param {Boolean} isUpdate
    @return {Promise}
    @requires jQuery
  */
  ajax(url, options, isUpdate) {
    options.data = options.body;
    delete options.body;
    return new this.PROMISE(function(resolve, reject) {
      this.AJAX(url, options)
        .done(this.ajaxDoneHandler(resolve, isUpdate))
        .fail(this.ajaxFailHandler(reject));
    }.bind(this));
  }

  /**
    @private
    @method ajaxFailHandler
    @param {Function} reject - Promise reject handler
    @return {Function} closure with reject handler
  */
  ajaxFailHandler(reject) {
    let _reject = reject;
    /*
      @param {Object} jqXHR
      @param {String} textStatus
      @param {String} errorThrown
    */
    return function(jqXHR, textStatus, errorThrown) {
      if (jqXHR.status >= 500) {
        this.ajaxServerErrorHandler(jqXHR, textStatus, errorThrown, _reject);
      } else if (jqXHR.status >= 400) {
        this.ajaxClientErrorHandler(jqXHR, textStatus, errorThrown, _reject);
      } else {
        this.ajaxErrorHandler(jqXHR, textStatus, errorThrown, _reject);
      }
    }.bind(this);
  }

  /**
    @private
    @method ajaxDoneHandler
    @param {Function} resolve - Promise resolve handler
    @param {Object} options - original options for request
    @return {Function} closure with resolve handler
  */
  ajaxDoneHandler(resolve, options) {
    let _resolve = resolve, _options = options;
    /*
      @param {Object} json - payload
      @param {String} textStatus
      @param {jqXHR} jqXHR
    */
    return function(json, textStatus, jqXHR) {
      if (jqXHR.status === 204) {
        this.ajaxNoContentHandler(json, textStatus, jqXHR, _resolve);
      } else {
        this.ajaxSuccessHandler(json, textStatus, jqXHR, _resolve, _options);
      }
    }.bind(this);
  }

  /**
    Ajax server error handler ~ status >= 500

    @private
    @method ajaxServerErrorHandler
    @param {Object} jqXHR
    @param {String} textStatus
    @param {String} errorThrown
    @param {Function} reject - Promise reject handler
  */
  ajaxServerErrorHandler(jqXHR, textStatus, errorThrown, reject) {
    let msg = 'The Service responded with ' + textStatus + ' ' + jqXHR.status;
    let json = parseXhrErrorResponse(jqXHR, errorThrown);
    reject(new ServerError(msg, json));
  }

  /**
    Ajax client error handler ~ status >= 400

    @private
    @method ajaxClientErrorHandler
    @param {Object} jqXHR
    @param {String} textStatus
    @param {String} errorThrown
    @param {Function} reject - Promise reject handler
  */
  ajaxClientErrorHandler(jqXHR, textStatus, errorThrown, reject) {
    let msg = 'The API responded with a '+ jqXHR.status +' error.';
    let json = parseXhrErrorResponse(jqXHR, errorThrown);
    reject(new ClientError(msg, json));
  }

  /**
    Ajax Generic error handler

    @private
    @method ajaxErrorHandler
    @param {Object} jqXHR
    @param {String} textStatus
    @param {String} errorThrown
    @param {Function} reject - Promise reject handler
  */
  ajaxErrorHandler(jqXHR, textStatus, errorThrown, reject) {
    let msg = (errorThrown) ? errorThrown : 'Unable to Fetch resource(s)';
    let json = this.errorParser(jqXHR, errorThrown);
    reject(new FetchError(msg, json));
  }

  /**
    Ajax 204 No Content handler

    @private
    @method ajaxNoContentHandler
    @param {Object} json - payload should be empty
    @param {String} textStatus
    @param {jqXHR} jqXHR
    @param {Function} resolve - Promise resolve handler
  */
  ajaxNoContentHandler(json, textStatus, jqXHR, resolve) {
    resolve(json || '');
  }

  /**
    Ajax 20x Success handler

    @private
    @method ajaxSuccessHandler
    @param {Object} json - payload
    @param {String} textStatus
    @param {jqXHR} jqXHR
    @param {Function} resolve - Promise resolve handler
    @param {Object} options - original options for request
  */
  ajaxSuccessHandler(json, textStatus, jqXHR, resolve, options) {
    let headers = this._getAjaxHeaders(jqXHR);
    let payload = json;
    if (typeof this.deserialize === 'function') {
      payload = this.deserialize(json, headers);
    }
    if (typeof this.cacheResponse === 'function') {
      this.cacheResponse({
        payload: payload, headers: headers, options: options
      });
    }
    resolve(payload);
  }

  /**
    @private
    @method _getXHRHeaders
    @param {Object} jqXHR
    @return {Object}
  */
  _getAjaxHeaders(jqXHR) {
    let headers = jqXHR.getAllResponseHeaders();
    headers = headers.split('\n');
    let headersDictionary = {}, key, value, header;
    for (let i = 0; i < headers.length; i++) {
      header = headers[i].split(': ');
      if (header[0].trim() !== '') {
        key = header[0].trim();
        value = header[1].trim();
        headersDictionary[key] = value;
      }
    }
    return headersDictionary;
  }

}

function parseXhrErrorResponse(jqXHR, errorThrown) {
  let json = jqXHR.responseJSON;
  if (!json) {
    try {
      if (jqXHR.responseText) {
        json = JSON.parse(jqXHR.responseText);
      }
    } catch(err) {
      self.console.warn(err);
    }
  }
  json = json || {};
  json.status = jqXHR.status;
  json.errors = json.errors || [{
    status: jqXHR.status,
    detail: jqXHR.responseText,
    message: errorThrown
  }];
  return json;
}
