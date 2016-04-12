/*
 NOTE: you will need to manually add an entry for this file in addon/randomizers/index.js, e.g.:
import
import <%= camelizedModuleName %> from './<%= dasherizedModuleName %>';
...
{
    ...
    <%= dasherizedModuleName %>: <%= camelizedModuleName %>
}
 */
var randomizer = function(/*frame, pastSessions, resolveFrame*/) {
    // return [resolvedFrames, conditions]
};
export default randomizer;
