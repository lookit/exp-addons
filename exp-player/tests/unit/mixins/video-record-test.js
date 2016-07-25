import Ember from 'ember';
import VideoRecordMixin from '../../../mixins/video-record';
import { module, test } from 'qunit';

module('Unit | Mixin | video record');

// Replace this with your real tests.
test('it works', function(assert) {
  let VideoRecordObject = Ember.Object.extend(VideoRecordMixin);
  let subject = VideoRecordObject.create();
  assert.ok(subject);
});
