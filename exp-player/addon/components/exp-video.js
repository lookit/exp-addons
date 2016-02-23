import Ember from 'ember';
import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from '../templates/components/exp-video';

export default ExpFrameBaseComponent.extend({
    layout: layout,
    meta: {
        name: 'Video player',
        description: 'Component that plays a video',
        parameters: {
            type: 'object',
            properties: {
                autoforwardOnEnd: {
                    type: 'boolean',
                    description: 'Whether to automatically advance to the next frame when the video is complete',
                    default: true,
                },
                autoplay: {
                    type: 'boolean',
                    description: 'Whether to autoplay the video on load',
                    default: true,
                },
                fullscreen: {
                    type: 'boolean',
                    description: 'Whether to show video as fullscreen',
                    default: true,
                },
                poster: {
                    type: 'string',
                    description: 'A still image to show until the video starts playing',
                    default: ''
                },
                sources: {
                    type: 'string',
                    description: 'List of objects specifying video src and type'
                }
            }
        }
    },

    data: {
        // This video does not explicitly capture any parameters from the user
    }

    // TODO: Implement ability to auto-forward to next frame at end of video
    // TODO: Implement ability to go full screen automatically at start
});
