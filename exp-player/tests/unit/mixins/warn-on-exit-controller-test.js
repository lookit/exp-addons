import Ember from 'ember';
import WarnOnExitControllerMixin from '../../../mixins/warn-on-exit-controller';
import { module, test } from 'qunit';

module('Unit | Mixin | warn on exit controller');

// Replace this with your real tests.
test('it works', function(assert) {
  let WarnOnExitControllerObject = Ember.Object.extend(WarnOnExitControllerMixin);
  let subject = WarnOnExitControllerObject.create();
  assert.ok(subject);
});
