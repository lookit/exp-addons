/*
 NOTE: you will need to manually add an entry for this file in addon/randomizers/index.js, e.g.:

import <%= camelizedModuleName %> from './<%= dasherizedModuleName %>';
...
export default {
    ...
    <%= dasherizedModuleName %>: <%= camelizedModuleName %>
}
 */
var randomizer = function(/*frame, pastSessions, resolveFrame*/) {
    // return [resolvedFrames, conditions]
};
export default randomizer;
