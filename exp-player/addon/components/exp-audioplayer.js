import Ember from 'ember';
import layout from '../templates/components/exp-audioplayer';

import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import MediaReload from '../mixins/media-reload';


export default ExpFrameBaseComponent.extend(MediaReload, {
    layout: layout,
    didFinishSound: false,
    meta: {
        name: 'Audio checker',
        description: 'Component that plays a test sound clip',
        parameters: {
            type: 'object',
            properties: {
                autoplay: {
                    type: 'boolean',
                    description: 'Whether to autoplay the audio on load',
                    default: true
                },
                fullControls: {
                    type: 'boolean',
                    description: 'Whether to use the full player controls. If false, display a single button to play audio from the start.',
                    // TODO: Implement and add a style
                    default: true
                },
                mustPlay: {
                    type: 'boolean',
                    description: 'Should the user be forced to play the clip before leaving the page?',
                    default: true
                },
                images: {
                    type: 'array',
                    description: 'List of objects specifying image src, alt, and title',
                    default: []
                },
                prompts: {
                    type: 'array',
                    description: 'Text of any header/prompt pararaphs to show the user',
                    default: []
                },
                sources: {
                    type: 'string',
                    description: 'List of objects specifying audio src and type',
                    default: []
                },
                title: {
                    type: 'string'
                },
                titlePrompt: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string'
                        },
                        text: {
                            type: 'string'
                        }
                    }
                }
            }
        },
        data: {
            type: 'object',
            properties: {  // We don't *need* to tell the server about this, but it might be nice to track usage of the setup page
                didFinishSound: {
                    type: 'boolean',
                    default: false
                }
            },
            required: ['didFinishSound']
        }
    },

    actions: {
        loopSound() {
            var elem = this.$("#player-audio")[0];
            elem.currentTime = 0;
            elem.play();
        },
        soundPlayed() {
            this.set('didFinishSound', true);
        }
    },

    preventNext: Ember.computed('mustPlay', 'didFinishSound', function() {
        if (!this.get('mustPlay')) {
            return false;
        } else {
            // Optionally force user to listen to clip before continuing
            return !this.get('didFinishSound');
        }
    })
});
