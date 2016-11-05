/*globals self: false */

export default function assertFetchUnsupported(assert) {
  let unsupported = !self.fetch;
  if (unsupported) {
    assert.ok(true, 'skipped, since window.fetch is not supported');
  }
  return unsupported;
}
