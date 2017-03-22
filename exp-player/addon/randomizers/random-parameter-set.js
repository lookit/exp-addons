/*
 NOTE: you will need to manually add an entry for this file in addon/randomizers/index.js, e.g.:

import randomParameterSet from './random-parameter-set';
...
export default {
    ...
    random-parameter-set: randomParameterSet
}
 */

/**
* @module exp-player
* @submodule randomizers
*/

/**
* Randomizer to implement counterbalancing for geometry alternation study.
* To use, define a frame with "kind": "choice" and "sampler": "random-parameter-set",
* as shown below, in addition to the parameters described under 'properties'.
*
```json
"frames": {
     "trials": {
        "sampler": "random-parameter-set",
        "kind": "choice"
    }
}

* ```
* @class randomParameterSet
*/

var randomizer = function(/*frameId, frameConfig, pastSessions, resolveFrame*/) {
    // return [resolvedFrames, conditions]
};
export default randomizer;
