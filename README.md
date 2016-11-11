# Ember-fetchjax

Ember Addon to use Fetch or AJAX.

The default behavior is to use Fetch when available, otherwise to use AJAX.

- Provides a set utils to use in an Ember app, however the utils do
  not require Ember, they are just JavaScript classes
  - See the addon/utils directory
- No polyfill for `window.fetch` or `window.Promise` required
  - If you want to use a polyfill see the bower projects `es6-promise`
    and `fetch`
- Setup a `fetchjax.fetch` method to use AJAX or Fetch
  - `FetchOrAjax` constructor requires dependencies, e.g. `jQuery.ajax`
  - Instance defaults to native Fetch and Promise, unless you pass in
    `Ember.RSVP.Promise`, or another `fetch` method
- See the `dummy` app and acceptance tests for example use


## Usage

Example route the forces the use of XHR:

```js
import Ember from 'ember';
import FetchOrAjax from 'ember-fetchjax/utils/fetchjax';

const fetchjax = new FetchOrAjax({useAjax: true, ajax: Ember.$.ajax});

export default Ember.Route.extend({
  model() {
    return fetchjax.fetch('/api/v1/posts', {method: 'GET'});
  }
});

```

Example route that defaults to use Fetch, but falls back to AJAX:

```js
import Ember from 'ember';
import FetchOrAjax from 'ember-fetchjax/utils/fetchjax';

const fetchjax = new FetchOrAjax({useAjax: true, ajax: Ember.$.ajax});

export default Ember.Route.extend({
  model() {
    return fetchjax.fetch('/api/v1/posts', {method: 'GET'});
  }
});

```


## Installation

Install addon…

* `ember install ember-fetchjax`

Install for local development…

* `git clone <repository-url>` this repository
* `cd ember-fetchjax`
* `npm install`
* `bower install`

## Running

* `ember serve --proxy http://api.pixelhandler.com`
* Try with Fetch or AJAX [http://localhost:4200/fetch](http://localhost:4200/fetch).
* AJAX only [http://localhost:4200/ajax](http://localhost:4200/ajax).

## Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://ember-cli.com/](http://ember-cli.com/).
