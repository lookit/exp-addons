import Ember from 'ember';
import FullScreenMixin from '../../../mixins/full-screen';
import { module, test } from 'qunit';

module('Unit | Mixin | full screen');

// Replace this with your real tests.
test('it works', function(assert) {
  let FullScreenObject = Ember.Object.extend(FullScreenMixin);
  let subject = FullScreenObject.create();
  assert.ok(subject);
});
