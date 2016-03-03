import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('exp-video-config', 'Integration | Component | exp video config', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{exp-video-config}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  this.render(hbs`
    {{#exp-video-config}}
      template block text
    {{/exp-video-config}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
