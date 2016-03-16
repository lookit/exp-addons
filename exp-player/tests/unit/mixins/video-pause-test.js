import Ember from 'ember';
import VideoPauseMixin from '../../../mixins/video-pause';
import { module, test } from 'qunit';

module('Unit | Mixin | video pause');

// Replace this with your real tests.
test('it works', function(assert) {
  let VideoPauseObject = Ember.Object.extend(VideoPauseMixin);
  let subject = VideoPauseObject.create();
  assert.ok(subject);
});
