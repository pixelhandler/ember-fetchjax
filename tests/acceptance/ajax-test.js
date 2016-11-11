import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import sinon from 'sinon';
import posts from '../fixtures/api/v1/posts';

moduleForAcceptance('Acceptance | ajax', {
  beforeEach() {
    this.sandbox = sinon.sandbox.create();
    this.server = this.sandbox.useFakeServer();
    this.server.autoRespond = true;
  },
  afterEach() {
    this.sandbox.restore();
    delete this.sandbox;
    delete this.server;
  }
});

test('visiting /ajax', function(assert) {
  this.server.respondWith('GET', '/api/v1/posts', [
    200,
    {'Content-Type':'application/vnd.api+json'},
    JSON.stringify(posts) 
  ]);

  visit('/ajax');

  andThen(function() {
    assert.equal(currentURL(), '/ajax', 'url is /ajax');
    assert.equal(find('ol li').length, 5, 'list renders');
  });
});
