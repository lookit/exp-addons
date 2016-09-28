import Ember from 'ember';
import ExpPlayerRouteMixin from 'exp-player/mixins/exp-player-route';
import { module, test } from 'qunit';

module('Unit | Mixin | exp player route');

// Replace this with your real tests.
test('it works', function(assert) {
  let ExpPlayerRouteObject = Ember.Object.extend(ExpPlayerRouteMixin);
  let subject = ExpPlayerRouteObject.create();
  assert.ok(subject);
});
