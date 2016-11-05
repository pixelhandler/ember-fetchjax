import { ServerError, ClientError, FetchError } from 'ember-fetchjax/utils/errors';
import { module, test } from 'qunit';

module('Unit | Utility | errors');

// Replace this with your real tests.
test('ServerError', function(assert) {
  let error = new ServerError();
  assert.ok(error instanceof Error);
});

test('ClientError', function(assert) {
  let error = new ClientError();
  assert.ok(error instanceof Error);
});

test('FetchError', function(assert) {
  let error = new FetchError();
  assert.ok(error instanceof Error);
});
