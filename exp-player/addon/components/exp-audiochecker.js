import Ember from 'ember';
import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from '../templates/components/exp-audiochecker';

export default ExpFrameBaseComponent.extend({
    layout: layout,
    meta: {
        name: 'Audio checker',
        description: 'Component that plays a test sound clip',
        parameters: {
            type: 'object',
            properties: {
                autoplay: {
                    type: 'boolean',
                    description: 'Whether to autoplay the audio on load',
                    default: true,
                },
                mustPlay: {
                    type: 'boolean',
                    description: 'Should the user be forced to play the clip before leaving the page?',
                    default: true,
                },
                prompts: {
                    type: 'array',
                    description: 'Text of any header/prompt pararaphs to show the user',
                    default: true,
                },
                sources: {
                    type: 'string',
                    description: 'List of objects specifying audio src and type',
                    default: []
                }
            }
        }
    },

    data: {
        // This video does not explicitly capture any parameters from the user
    },

    // TODO: Write an onended action that sets variable, to be checked by next-action
});
