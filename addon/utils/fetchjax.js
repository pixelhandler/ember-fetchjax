/*globals self: false */

import Fetch from './fetch';
import Ajax from './ajax';

const CAN_FETCH = !!self.fetch;

/**
  Use Fetch or Ajax

  @class FetchOrAjax
  @constructor
*/
export default class FetchOrAjax {

  /**
    @method constructor
    @param {Object} options `{promise, fetch, serialize, deserialize, useAjax, ajax}`
      - See <https://developers.google.com/web/fundamentals/getting-started/primers/promises>
  */
  constructor(options = {}) {
    this._useAjax = (typeof options.useAjax === 'boolean') ? options.useAjax : false;
    if (this.useFetch) {
      this._fetch = new Fetch(options);
    } else {
      this._ajax = new Ajax(options);
    }
    this.serialize = options.serialize;
  }

  /**
    Flag indicates whether to use window.fetch or not, computed from `useAjax`

    @public
    @property useFetch
    @type Boolean
  */
  get useFetch() {
    return !this.useAjax && CAN_FETCH;
  }

  /**
    Flag to use $.ajax instead of window.fetch

    @public
    @property useAjax
    @type Boolean
  */
  get useAjax() {
    return this._useAjax;
  }

  /**
    Fetch data using Fetch API or XMLHttpRequest

    - See <https://developers.google.com/web/updates/2015/03/introduction-to-fetch>

    @public
    @method fetch
    @param {String} url
    @param {Object} options e.g. method, body, headers, credentials, mode, etc.
      - options are passed to success handler
    @return {Promise}
  */
  fetch(url, options = {}) {
    if (!!options.serialize && typeof options.body !== 'string' &&
        typeof this.serialize === 'function') {
      options.body = this.serialize(options.body);
    }
    if (this.useFetch) {
      return this._fetch.fetch(url, options);
    } else {
      return this._ajax.ajax(url, options);
    }
  }

}
