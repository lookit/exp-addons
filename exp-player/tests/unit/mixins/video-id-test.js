import Ember from 'ember';
import VideoIdMixin from '../../../mixins/video-id';
import { module, test } from 'qunit';

module('Unit | Mixin | video id');

// Replace this with your real tests.
test('it works', function(assert) {
  let VideoIdObject = Ember.Object.extend(VideoIdMixin);
  let subject = VideoIdObject.create();
  assert.ok(subject);
});
