// h/t http://stackoverflow.com/questions/12331077/does-handlebars-js-replace-newline-characters-with-br
import Ember from 'ember';

export function breaklines(text/*, hash*/) {
    text = Ember.Handlebars.Utils.escapeExpression(text);
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    return new Ember.Handlebars.SafeString(text);
}

export default Ember.Helper.helper(breaklines);
