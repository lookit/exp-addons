import layout from './template';

import ExpFrameBaseComponent from '../../components/exp-frame-base/component';

/**
 * @module exp-player
 * @submodule frames
 */

/**
This is a frame for offering parents the option to preview videos for the "Your baby the physicist" study, with hardcoded text. Use {{#crossLink "ExpLookitPreviewExplanation"}}{{/crossLink}} (followed by {{#crossLink "ExpVideoPreview"}}{{/crossLink}}) instead.


@class ExpPhysicsPreviewExplanation
@extends ExpFrameBase
@deprecated
*/

export default ExpFrameBaseComponent.extend({
    type: 'exp-physics-preview-explanation',
    layout: layout,
    meta: {
        name: 'ExpPhysicsPreviewExplanation',
        description: 'Let parents know about blinding, give option to preview videos.',
        parameters: {
            type: 'object',
            properties: {
                // define parameters here
            }
        },
        data: {
            type: 'object',
            properties: {
                // define data structure here
            }
        }
    },
    actions: {
        skipone: function() {
            this.get('skipone')();
        }
    }
});
