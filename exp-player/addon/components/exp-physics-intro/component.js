import layout from './template';
import ExpFrameBaseComponent from '../../components/exp-frame-base/component';

/**
 * @module exp-player
 * @submodule frames
 */

/**
This is a frame for introducing the "Your baby the physicist" study, with hardcoded text. Use {{#crossLink "ExpLookitText"}}{{/crossLink}}  instead.

@class ExpPhysicsIntro
@extends ExpFrameBase
@deprecated
*/

// Generate a random string of length len made up of the characters in charSet (optional)
function randomString(len, charSet) {
    charSet = charSet || 'HKLMNTVWXYZbdgjpqr02468';
    var randString = '';
    for (var charPos = 0; charPos < len; charPos++) {
        var randomInd = Math.floor(Math.random() * charSet.length);
        randString += charSet.substring(randomInd, randomInd + 1);
    }
    return randString;
}

export default ExpFrameBaseComponent.extend({
    type: 'exp-physics-intro',
    layout: layout,
    meta: {
        name: 'ExpPhysicsIntro',
        description: 'Basic intro to physics study--first frame the user sees after consent.',
        parameters: {
            type: 'object',
            properties: {
                // define parameters here
            }
        },
        data: {
            type: 'object',
            properties: {
                confirmationCode: {
                    type: 'string',
                    default: randomString(5)
                }
            }
        }
    }
});
