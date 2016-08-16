import Ember from 'ember';

export function expFormat(text /*, hash*/ ) {
    text = Ember.Handlebars.Utils.escapeExpression(text);

    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    text = text.replace(/\t/gm, '&nbsp;&nbsp;&nbsp;&nbsp;');

    return new Ember.Handlebars.SafeString(text);
}

export default Ember.Helper.helper(expFormat);
