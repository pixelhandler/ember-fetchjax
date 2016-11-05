/*globals self: false */
import Fetch from 'ember-fetchjax/utils/fetch';
import { module, test } from 'qunit';
import sinon from 'sinon';
import assertFetchUnsupported from 'dummy/tests/helpers/fetch';
import Ember from 'ember';
const { RSVP } = Ember;
if (!self.Promise) {
  self.Promise = RSVP.Promise;
}

module('Unit | Utility | fetch', {
  beforeEach() {
    this.sandbox = sinon.sandbox.create();
  },
  afterEach() {
    this.sandbox.restore();
    delete this.sandbox;
    delete this.subject;
  }
});

test('#fetch handles 5xx (ServerError) response status', function(assert) {
  const done = assert.async();
  if (assertFetchUnsupported(assert)) { return done(); }
  this.subject = new Fetch();

  this.sandbox.stub(this.subject, 'FETCH', function () {
    return new self.Promise(function(resolve/*, reject*/) {
      resolve({ // reject throws FetchError
        "status": 500,
        "text": function() {
          return self.Promise.resolve('');
        }
      });
    });
  });
  let promise = this.subject.fetch('/posts', {method: 'POST', body: 'json string here'});

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.catch((error) => {
    assert.equal(error.name, 'ServerError', '5xx response throws a custom error');
    assert.equal(error.code, 500, 'error code 500');
    done();
  });
});

test('#fetch handles 4xx (Client Error) response status', function(assert) {
  const done = assert.async();
  if (assertFetchUnsupported(assert)) { return done(); }
  this.subject = new Fetch();

  const mockError = {errors: [{status: 404, title: 'I am an error'}]};
  this.sandbox.stub(this.subject, 'FETCH', function () {
    return self.Promise.resolve({
      "status": 404,
      "text": function() {
        return self.Promise.resolve(JSON.stringify(mockError));
      }
    });
  });
  let promise = this.subject.fetch('/posts', { method: 'POST', body: 'json string here' });
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.catch((error) => {
    assert.ok(error.name, 'Client Error', '4xx response throws a custom error');
    assert.equal(error.code, 404, 'error code 404 from response status');
    assert.ok(Array.isArray(error.errors), 'response includes errors from `text`');
    assert.deepEqual(error.errors, mockError.errors, 'response errors object intact');
    done();
  });
});

test('#fetch handles 204 (Success, no content) response status w/o calling deserialize/cacheResponse', function(assert) {
  const done = assert.async();
  if (assertFetchUnsupported(assert)) { return done(); }
  this.subject = new Fetch();

  this.sandbox.stub(this.subject, 'FETCH', function () {
    return self.Promise.resolve({
      "status": 204,
      "text": function() { return self.Promise.resolve(''); }
    });
  });
  this.subject.cacheResponse = this.sandbox.spy();
  this.subject.deserialize = this.sandbox.spy();
  let promise = this.subject.fetch('/posts', {method: 'PATCH', body: 'json string here'});

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    assert.ok(!this.subject.cacheResponse.called, '#cacheResponse method NOT called');
    assert.ok(!this.subject.deserialize.called, '#deserialize method NOT called');
    done();
  });
});

test('#fetch handles 200 (Success) response status', function(assert) {
  const done = assert.async();
  if (assertFetchUnsupported(assert)) { return done(); }
  this.subject = new Fetch();

  this.sandbox.stub(this.subject, 'FETCH', function () {
    return self.Promise.resolve({
      "status": 200,
      "json": function() {
        return self.Promise.resolve({
          data: {
            id: 1,
            type: 'posts',
            attributes: {
              title: 'Yo Post'
            }
          }
        });
      }
    });
  });
  this.subject.deserialize = this.sandbox.spy();
  this.subject.cacheResponse = this.sandbox.spy();
  let promise = this.subject.fetch('/posts/1', { method: 'GET' });

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    assert.ok(this.subject.cacheResponse.calledOnce, '#cacheResponse method called');
    assert.ok(this.subject.deserialize.calledOnce, '#deserialize method called');
    done();
  });
});
