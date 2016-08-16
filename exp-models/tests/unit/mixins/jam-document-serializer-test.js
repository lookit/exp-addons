import Ember from 'ember';
import JamDocumentSerializerMixin from '../../../mixins/jam-document-serializer';
import { module, test } from 'qunit';

module('Unit | Mixin | jam document serializer');

// Replace this with your real tests.
test('it works', function(assert) {
  let JamDocumentSerializerObject = Ember.Object.extend(JamDocumentSerializerMixin);
  let subject = JamDocumentSerializerObject.create();
  assert.ok(subject);
});
