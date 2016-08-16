import Ember from 'ember';
import JamSerializerMixin from '../../../mixins/jam-serializer';
import { module, test } from 'qunit';

module('Unit | Mixin | jam serializer');

// Replace this with your real tests.
test('it works', function(assert) {
  let JamSerializerObject = Ember.Object.extend(JamSerializerMixin);
  let subject = JamSerializerObject.create();
  assert.ok(subject);
});
