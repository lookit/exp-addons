/*
 NOTE: you will need to manually add an entry for this file in addon/randomizers/index.js, e.g.:
import
import <%= classifiedModuleName %> from './<%= dasherizedModuleName %>';
...
{
    ...
    <%= dasherizedModuleName %>: <%= classifiedModuleName %>
}
 */   
var randomizer = function(/*frame, pastSessions, resolveFrame*/) {
    // return [resolvedFrames, conditions]
};
export default randomizer;
