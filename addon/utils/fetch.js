/*globals self: false */
import { ServerError, ClientError, FetchError } from './errors';

export default class Fetch {

  /**
    @method constructor
    @param {Object} options
      - `{fetch, promise, serialze, deserialize, cacheResponse, errorParser, errorMessage}`
  */
  constructor(options = {}) {
    this.FETCH = options.fetch || self.fetch.bind(self);
    this.PROMISE = options.promise || self.Promise;
    this.deserialize = options.deserialize;
    this.cacheResponse = options.cacheResponse;
    this.errorMessage = options.errorMessage || parseFetchErrorMessage;
    this.errorParser = options.errorParser || parseFetchErrorText;
  }

  /**
    Makes a fetch request via Fetch API (perhaps use a polyfill)
    See http://updates.html5rocks.com/2015/03/introduction-to-fetch

    @method fetch
    @param {String} url
    @param {Object} options - e.g. headers or other options
    @return {Promise}
  */
  fetch(url, options) {
    return new this.PROMISE((resolve, reject) => {
      this.FETCH(url, options).then((response) => {
        if (response.status >= 500) {
          this.fetchServerErrorHandler(response, reject);
        } else if (response.status >= 400) {
          this.fetchClientErrorHandler(response, reject);
        } else if (response.status === 204) {
          this.fetchNoContentHandler(response, resolve);
        } else {
          return this.fetchSuccessHandler(response, resolve, options);
        }
      }).catch((error) => {
        this.fetchErrorHandler(error, reject);
      });
    });
  }

  /**
    Fetch server error handler ~ status >= 500

    @method fetchServerErrorHandler
    @param {Response} response - Fetch response
    @param {Function} reject - Promise reject handler
  */
  fetchServerErrorHandler(response, reject) {
    response.text().then((respText) => {
      let msg = this.errorMessage(response);
      let json = this.errorParser(respText, response);
      reject(new ServerError(msg, json));
    });
  }

  /**
    Fetch client error handler ~ status >= 400

    @method fetchClientErrorHandler
    @param {Response} response - Fetch response
    @param {Function} reject - Promise reject handler
  */
  fetchClientErrorHandler(response, reject) {
    response.text().then((respText) => {
      let msg = this.errorMessage(response);
      let json = this.errorParser(respText, response);
      reject(new ClientError(msg, json));
    });
  }

  /**
    Fetch generic error handler

    @method fetchErrorHandler
    @param {Error|Response} error - Fetch error or response object
    @param {Function} reject - Promise reject handler
  */
  fetchErrorHandler(error, reject) {
    let msg = 'Unable to Fetch resource(s)';
    if (error instanceof Error) {
      msg = (error && error.message) ? error.message : msg;
      reject(new FetchError(msg, error));
    } else if (typeof error.text === 'function') {
      error.text().then((respText) => {
        msg = this.errorMessage(error);
        reject(new FetchError(msg, this.errorParser(respText, error)));
      });
    } else {
      reject(new FetchError(msg, error));
    }
  }

  /**
    Fetch 204 No Content handler

    @method fetchNoContentHandler
    @param {Response} response - Fetch response
    @param {Function} resolve - Promise resolve handler
  */
  fetchNoContentHandler(response, resolve) {
    return response.text().then(function(resp) {
      resolve(resp || '');
    });
  }

  /**
    Fetch 20x Success handler

    @method fetchSuccessHandler
    @param {Response} response - Fetch response
    @param {Function} resolve - Promise resolve handler
    @param {Boolean} isUpdate - Used with patch to update a resource
  */
  fetchSuccessHandler(response, resolve, options) {
    return response.json().then((json) => {
      let payload = json;
      if (typeof this.deserialize === 'function') {
        payload = this.deserialize(json, response.headers);
      }
      if (typeof this.cacheResponse === 'function') {
        this.cacheResponse({
          payload: payload, headers: response.headers, options: options
        });
      }
      resolve(payload);
    });
  }

}

function parseFetchErrorText(text, response) {
  let json;
  try {
    json = JSON.parse(text);
  } catch (err) {
    self.console.warn(err);
    json = {
      "errors": [{
        "status": response.status,
        "detail": text
      }]
    };
  }
  json = json || {};
  json.status = response.status;
  return json;
}

function parseFetchErrorMessage(response) {
  return [
    'The API responded with a ',
    response.status,
    (response.statusText) ? ' (' + response.statusText + ') ' : '',
    ' error.'
  ].join('');
}
