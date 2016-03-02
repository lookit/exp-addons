import Ember from 'ember';
import MediaReloadMixin from '../../../mixins/media-reload';
import { module, test } from 'qunit';

module('Unit | Mixin | media reload');

// Replace this with your real tests.
test('it works', function(assert) {
  let MediaReloadObject = Ember.Object.extend(MediaReloadMixin);
  let subject = MediaReloadObject.create();
  assert.ok(subject);
});
