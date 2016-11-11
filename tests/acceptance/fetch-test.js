import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import Ember from 'ember';
import sinon from 'sinon';
import posts from '../fixtures/api/v1/posts';
import assertFetchUnsupported from 'dummy/tests/helpers/fetch';

const { RSVP } = Ember;

moduleForAcceptance('Acceptance | fetch', {
  beforeEach: function() {
    this.sandbox = sinon.sandbox.create();
  },

  afterEach: function() {
    this.sandbox.restore();
  }
});

test('visiting /fetch', function(assert) {
  const done = assert.async();
  if (assertFetchUnsupported(assert)) { return done(); }

  this.sandbox.stub(window, 'fetch', function (/*url, options*/) {
    return RSVP.Promise.resolve({
      status: 200,
      json() {
        let resp = JSON.parse(JSON.stringify(posts));
        return RSVP.Promise.resolve(resp);
      }
    });
  });

  visit('/fetch');

  andThen(function() {
    assert.equal(currentURL(), '/fetch', 'url is /fetch');
    assert.equal(find('ol li').length, 5, 'list renders');
    done();
  });
});
