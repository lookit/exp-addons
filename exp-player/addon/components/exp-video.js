import layout from '../templates/components/exp-video';

import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import FullScreen from '../mixins/full-screen';
import MediaReload from '../mixins/media-reload';


export default ExpFrameBaseComponent.extend(FullScreen, MediaReload, {
    layout: layout,

    displayFullscreen: true,  // force fullscreen for all uses of this component, always
    fullScreenElementId: 'player-video',

    meta: {
        name: 'Video player',
        description: 'Component that plays a video',
        parameters: {
            type: 'object',
            properties: {
                autoforwardOnEnd: {  // Generally leave this true, since controls will be hidden for fullscreen videos
                    type: 'boolean',
                    description: 'Whether to automatically advance to the next frame when the video is complete',
                    default: true
                },
                autoplay: {
                    type: 'boolean',
                    description: 'Whether to autoplay the video on load',
                    default: true
                },
                poster: {
                    type: 'string',
                    description: 'A still image to show until the video starts playing',
                    default: ''
                },
                sources: {
                    type: 'string',
                    description: 'List of objects specifying video src and type',
                    default: []
                }
            }
        },
        data: {
            // This video does not explicitly capture any parameters from the user
        }
    }
});
