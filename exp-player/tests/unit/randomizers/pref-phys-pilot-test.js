import { getConditions } from '../../../randomizers/pref-phys-pilot';
import { module, test } from 'qunit';

module('Unit | Randomizer | pref phys pilot');

// Replace this with your real tests.
test('Previous conditions are recognized and cause next session to be counted', function(assert) {
  let result = lastSegment([42]);
  assert.ok(result);
});
