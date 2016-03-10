import Ember from 'ember';
import WarnOnExitRouteMixin from '../../../mixins/warn-on-exit-route';
import { module, test } from 'qunit';

module('Unit | Mixin | warn on exit route');

// Replace this with your real tests.
test('it works', function(assert) {
  let WarnOnExitRouteObject = Ember.Object.extend(WarnOnExitRouteMixin);
  let subject = WarnOnExitRouteObject.create();
  assert.ok(subject);
});
