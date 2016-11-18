/*globals self: false */
import FetchOrAjax from 'ember-fetchjax/utils/fetchjax';
import { module, test } from 'qunit';
import sinon from 'sinon';
import assertFetchUnsupported from 'dummy/tests/helpers/fetch';
import jQuery from 'jquery';
import Ember from 'ember';
const { RSVP } = Ember;
if (!self.Promise) {
  self.Promise = RSVP.Promise;
}

module('Unit | Utility | fetchjax', {
  beforeEach() {
    this.sandbox = sinon.sandbox.create();
  },
  afterEach() {
    this.sandbox.restore();
    delete this.sandbox;
  }
});

test('FetchOrAjax instance default is set to not use Ajax', function(assert) {
  if (assertFetchUnsupported(assert)) { return; }
  let subject = new FetchOrAjax();
  assert.equal(subject.useFetch, true, 'useFetch is true');
});

test('FetchOrAjax instance can be set to use Ajax', function(assert) {
  if (assertFetchUnsupported(assert)) { return; }
  let subject = new FetchOrAjax({
    ajax: jQuery.ajax,
    useAjax: true
  });
  assert.equal(subject.useFetch, false, 'useFetch is false');
});

test('FetchOrAjax instance can use method to serialize', function(assert) {
  if (assertFetchUnsupported(assert)) { return; }
  let subject = new FetchOrAjax({
    ajax: jQuery.ajax,
    serialize: this.sandbox.spy()
  });
  assert.ok(subject.serialize, 'serialize function passed as option');
});

test('FetchOrAjax instance using Fetch can use method to deserialize', function(assert) {
  if (assertFetchUnsupported(assert)) { return; }
  let subject = new FetchOrAjax({
    deserialize: this.sandbox.spy()
  });
  assert.ok(subject._fetch.deserialize, 'deserialize function passed as fetch option');
});

test('FetchOrAjax instance using Ajax can use method to deserialize', function(assert) {
  if (assertFetchUnsupported(assert)) { return; }
  let subject = new FetchOrAjax({
    ajax: jQuery.ajax,
    useAjax: true,
    deserialize: this.sandbox.spy()
  });
  assert.ok(subject._ajax.deserialize, 'deserialize function passed as ajax option');
});

test('FetchOrAjax instance using Fetch can use method to cacheResponse', function(assert) {
  if (assertFetchUnsupported(assert)) { return; }
  let subject = new FetchOrAjax({
    cacheResponse: this.sandbox.spy()
  });
  assert.ok(subject._fetch.cacheResponse, 'cacheResponse function passed as fetch option');
});

test('FetchOrAjax instance using Ajax can use method to cacheResponse', function(assert) {
  if (assertFetchUnsupported(assert)) { return; }
  let subject = new FetchOrAjax({
    ajax: jQuery.ajax,
    useAjax: true,
    cacheResponse: this.sandbox.spy()
  });
  assert.ok(subject._ajax.cacheResponse, 'cacheResponse function passed as ajax option');
});
