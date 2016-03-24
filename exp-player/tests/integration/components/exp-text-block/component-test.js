import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('exp-text-block', 'Integration | Component | exp text block', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{exp-text-block}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  this.render(hbs`
    {{#exp-text-block}}
      template block text
    {{/exp-text-block}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
