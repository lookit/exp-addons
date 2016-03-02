import Ember from 'ember';
import VideoRecorderInitializer from '../../../initializers/video-recorder';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | video recorder', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  VideoRecorderInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
