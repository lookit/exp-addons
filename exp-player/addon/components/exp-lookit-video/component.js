import Ember from 'ember';
import layout from './template';
import ExpFrameBaseComponent from '../../components/exp-frame-base/component';
import FullScreen from '../../mixins/full-screen';
import MediaReload from '../../mixins/media-reload';
import VideoRecord from '../../mixins/video-record';

let {
    $
} = Ember;

/**
 * @module exp-player
 * @submodule frames
 */

/**
* Basic video display for looking measures (e.g. preferential looking, looking time).
* Trial consists of four phases, each of which is optional.
*
* 1. Announcement: The audio in audioSources is played while the attnSources video is played centrally, looping as needed. This lasts for announceLength seconds or the duration of the audio, whichever is longer. To skip this phase, set announceLength to 0 and do not provide audioSources.
*
* 2. Intro: The introSources video is played centrally until it ends. To skip this phase, do not provide introSources.
*
* 3. Calibration: The video in calibrationVideoSources is played (looping as needed) in each of the locations specified in calibrationPositions in turn, remaining in each position for calibrationLength ms. At the start of each position the audio in calibrationAudioSources is played once. (Audio will be paused and restarted if it is longer than calibrationLength.) Set calibrationLength to 0 to skip calibration.
*
* 4. Test: The video in sources and audio in musicSources (optional) are played until either: testLength seconds have elapsed (with video looping if needed), or the video has been played testCount times. If testLength is set, it overrides testCount - for example if testCount is 1 and testLength is 30, a 10-second video will be played 3 times. If the participant pauses the study during the test phase, then after restarting the trial, the video in altSources will be used again (defaulting to the same video if altSources is not provided). To skip this phase, do not provide sources.
*
* Specifying media locations:
* For any parameters that expect a list of audio/video sources, you can EITHER provide
* a list of src/type pairs with full paths like this:
```json
    [
        {
            'src': 'http://.../video1.mp4',
            'type': 'video/mp4'
        },
        {
            'src': 'http://.../video1.webm',
            'type': 'video/webm'
        }
    ]
```
* OR you can provide a list with a single object with a 'stub', which will be expanded
* based on the parameter baseDir and the media types expected - either audioTypes or
* videoTypes as appropriate. For example, if you provide the audio source
```json
    [
        {
            'stub': 'intro'
        }
    ]
```
* and baseDir is https://mystimuli.org/mystudy/, with audioTypes ['mp3', 'ogg'], then this
* will be expanded to:
```json
                 [
                        {
                            src: 'https://mystimuli.org/mystudy/mp3/intro.mp3',
                            type: 'audio/mp3'
                        },
                        {
                            src: 'https://mystimuli.org/mystudy/ogg/intro.ogg',
                            type: 'audio/ogg'
                        }
                ]
```
* This allows you to simplify your JSON document a bit and also easily switch to a
* new version of your stimuli without changing every URL. You can mix source objects with
* full URLs and those using stubs within the same directory. However, any stimuli
* specified using stubs MUST be
* organized as expected under baseDir/MEDIATYPE/filename.MEDIATYPE.
*
* This frame is displayed fullscreen; if the frame before it is not, that frame
* needs to include a manual "next" button so that there's a user interaction
* event to trigger fullscreen mode. (Browsers don't allow us to switch to FS
* without a user event.)
*
* Example usage:

```json
        "sample-intermodal-trial-2": {
            "id": "sample-intermodal-trial-2",
            "kind": "exp-lookit-video",
            "isLast": false,
            "baseDir": "https://s3.amazonaws.com/lookitcontents/intermodal/",
            "sources": [
                {
                    "stub": "sbs_ramp_down_up_apple_c1_b1_NN"
                }
            ],
            "testCount": 2,
            "altSources": [
                {
                    "stub": "sbs_ramp_up_down_apple_c1_b1_NN"
                }
            ],
            "audioTypes": [
                "ogg",
                "mp3"
            ],
            "pauseAudio": [
                {
                    "stub": "pause"
                }
            ],
            "videoTypes": [
                "webm",
                "mp4"
            ],
            "attnSources": [
                {
                    "stub": "attentiongrabber"
                }
            ],
            "audioSources": [
                {
                    "stub": "video_02"
                }
            ],
            "introSources": [
                {
                    "stub": "cropped_book"
                }
            ],
            "musicSources": [
                {
                    "stub": "music_02"
                }
            ],
            "unpauseAudio": [
                {
                    "stub": "return_after_pause"
                }
            ],
            "calibrationLength": 3000,
            "calibrationAudioSources": [
                {
                    "stub": "chimes"
                }
            ],
            "calibrationVideoSources": [
                {
                    "stub": "attentiongrabber"
                }
            ]
        }

* ```
* @class ExpLookitVideo
* @extends ExpFrameBase
* @uses FullScreen
* @uses MediaReload
* @uses VideoRecord
*/

// TODO: refactor into cleaner structure with segments announcement, intro, calibration, test, with more general logic for transitions. Construct list at start since some elements optional. Then proceed through - instead of setting task manually, use utility to move to next task within list.

export default ExpFrameBaseComponent.extend(FullScreen, MediaReload, VideoRecord, {
    layout: layout,
    type: 'exp-lookit-video',

    displayFullscreen: true, // force fullscreen for all uses of this component
    fullScreenElementId: 'experiment-player',
    fsButtonID: 'fsButton',

    // Override setting in VideoRecord mixin - only use camera if doing recording
    doUseCamera: Ember.computed.alias('doRecording'),

    completedAnnouncementAudio: false,
    completedAnnouncementTime: false,

    doingAnnouncement: Ember.computed('videoSources', function() {
        return (this.get('currentTask') === 'announce');
    }),

    doingIntro: Ember.computed('videoSources', function() {
        return (this.get('currentTask') === 'intro');
    }),

    doingTest: Ember.computed('videoSources', function() {
        return (this.get('currentTask') === 'test');
    }),
    testTimer: null, // reference to timer counting how long video has been playing, if time-based limit
    calTimer: null, // reference to timer counting how long calibration segment has played
    announceTimer: null, // reference to timer counting announcement segment

    testTime: 0,
    testVideosTimesPlayed: 0, // how many times the test video has been played, if count-based limit

    skip: false,
    hasBeenPaused: false,
    useAlternate: false,
    currentTask: null, // announce, intro, calibration, or test.
    isPaused: false,

    meta: {
        name: 'Video player',
        description: 'Component that plays a video',
        parameters: {
            type: 'object',
            properties: {
                /**
                Array of objects specifying video src and type for test video (these should be the same video, but multiple sources--e.g. mp4 and webm--are generally needed for cross-browser support). If none provided, skip test phase.

                Example value:

                ```[{'src': 'http://.../video1.mp4', 'type': 'video/mp4'}, {'src': 'http://.../video1.webm', 'type': 'video/webm'}]```
                @property {Array} sources
                    @param {String} src
                    @param {String} type
                @default []
                */
                sources: {
                    type: 'string',
                    description: 'List of objects specifying video src and type for test videos',
                    default: []
                },

                /**
                Array of objects specifying video src and type for alternate test video, as for sources. Alternate test video will be shown if the first test is paused, after restarting the trial. If alternate test video is also paused, we just move on. If altSources is not provided, defaults to playing same test video again (but still only one pause of test video allowed per trial).
                @property {Array} altSources
                    @param {String} src
                    @param {String} type
                @default []
                */
                altSources: {
                    type: 'string',
                    description: 'List of objects specifying video src and type for alternate test videos',
                    default: []
                },

                /**
                Array of objects specifying intro video src and type, as for sources.
                If empty, intro segment will be skipped.
                @property {Array} introSources
                    @param {String} src
                    @param {String} type
                @default []
                */
                introSources: {
                    type: 'string',
                    description: 'List of objects specifying intro video src and type',
                    default: []
                },

                /**
                Array of objects specifying attention-grabber video src and type, as for sources. The attention-grabber video is shown (looping) during the announcement phase and when the study is paused.
                @property {Array} attnSources
                    @param {String} src
                    @param {String} type
                @default []
                */
                attnSources: {
                    type: 'string',
                    description: 'List of objects specifying attention-grabber video src and type',
                    default: []
                },
                /**
                 * minimum amount of time to show attention-getter in seconds. Announcement phase (attention-getter plus audio) will last the minimum of announceLength and the duration of any announcement audio.
                 *
                 * @property {Number} announceLength
                 * @default 2
                 */
                announceLength: {
                    type: 'number',
                    description: 'minimum duration of announcement phase in seconds',
                    default: 2
                },
                /**
                List of objects specifying intro announcement src and type. If empty and minimum announceLength is 0, announcement is skipped.
                Example: `[{'src': 'http://.../audio1.mp3', 'type': 'audio/mp3'}, {'src': 'http://.../audio1.ogg', 'type': 'audio/ogg'}]`
                @property {Array} audioSources
                    @param {String} src
                    @param {String} type
                @default []
                */
                audioSources: {
                    type: 'string',
                    description: 'List of objects specifying intro announcement audio src and type',
                    default: []
                },

                /**
                List of objects specifying music audio src and type, as for audioSources.
                If empty, no music is played.
                @param musicSources
                @property {Array} musicSources
                    @param {String} src
                    @param {String} type
                @default []
                */
                musicSources: {
                    type: 'string',
                    description: 'List of objects specifying music audio src and type',
                    default: []
                },

                /**
                Length to loop test videos, in seconds. Set if you want a time-based limit. E.g., setting testLength to 20 means that the first 20 seconds of the video will be played, with shorter videos looping until they get to 20s. Leave out or set to Infinity  to play the video through to the end a set number of times instead. If a testLength is set, it overrides any value set in testCount.
                @property {Number} testLength
                @default Infinity
                */
                testLength: {
                    type: 'number',
                    description: 'Length of test videos in seconds',
                    default: Infinity
                },

                /**
                Number of times to play test video before moving on. This is ignored if
                testLength is set to a finite value.
                @property {Number} testCount
                @default 1
                */
                testCount: {
                    type: 'number',
                    description: 'Number of times to play test video',
                    default: 1
                },

                /**
                Whether to do any video recording during this frame. Default true. Set to false for e.g. last frame where just doing an announcement.
                @property {Boolean} doRecording
                @default true
                */
                doRecording: {
                    type: 'boolean',
                    description: 'Whether to do video recording',
                    default: true
                },
                /**
                 * length of single calibration segment in ms. 0 to skip calibration.
                 *
                 * @property {Number} calibrationLength
                 * @default 3000
                 */
                calibrationLength: {
                    type: 'number',
                    description: 'length of single calibration segment in ms',
                    default: 3000
                },
                /**
                 * Ordered list of positions to show calibration segment in. Options are
                 * "center", "left", "right". Ignored if calibrationLength is 0.
                 *
                 * @property {Array} calibrationPositions
                 * @default ["center", "left", "right", "center"]
                 */
                calibrationPositions: {
                    type: 'Array',
                    description: 'Ordered list of positions to show calibration',
                    default: ['center', 'left', 'right', 'center']
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
                 * calibration audio (played at each calibration position).
                 * Ignored if calibrationLength is 0.
                 *
                 * @property {Object[]} calibrationAudioSources
                 * @default []
                 */
                calibrationAudioSources: {
                    type: 'array',
                    description: 'list of objects specifying audio src and type for calibration audio',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            }
                        }
                    }
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
                 * calibration video (played from start at each calibration position).
                 * Ignored if calibrationLength is 0.
                 *
                 * @property {Object[]} calibrationVideoSources
                 * @default []
                 */
                calibrationVideoSources: {
                    type: 'array',
                    description: 'list of objects specifying video src and type for calibration audio',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            }
                        }
                    }
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
                 * audio played upon pausing study
                 *
                 * @property {Object[]} pauseAudio
                 * @default []
                 */
                pauseAudio: {
                    type: 'array',
                    description: 'List of objects specifying audio src and type for audio played when pausing study',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            }
                        }
                    }
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
                 * audio played upon unpausing study
                 *
                 * @property {Object[]} unpauseAudio
                 * @default []
                 */
                unpauseAudio: {
                    type: 'array',
                    description: 'List of objects specifying audio src and type for audio played when unpausing study',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            }
                        }
                    }
                },
                /**
                 * Text to show under "Study paused / Press space to resume" when study is paused.
                 * Default: (You'll have a moment to turn around again.)
                 *
                 * @property {String} pauseText
                 * @default []

                 */
                pauseText: {
                    type: 'string',
                    description: 'Text to show under Study paused when study is paused.',
                    default: "(You'll have a moment to turn around again.)"
                },
                /**
                 * Base directory for where to find stimuli. Any image src
                 * values that are not full paths will be expanded by prefixing
                 * with `baseDir` + `img/`. Any audio/video src values that give
                 * a value for 'stub' rather than 'src' and 'type' will be
                 * expanded out to
                 * `baseDir/avtype/[stub].avtype`, where the potential avtypes
                 * are given by audioTypes and videoTypes.
                 *
                 * Note that baseDir SHOULD include a trailing slash
                 * (e.g., `http://stimuli.org/myexperiment/`, not
                 * `http://stimuli.org/myexperiment`)
                 *
                 * @property {String} baseDir
                 * @default ''
                 */
                baseDir: {
                    type: 'string',
                    default: '',
                    description: 'Base directory for all stimuli'
                },
                /**
                 * List of audio types to expect for any audio specified just
                 * with a string rather than with a list of src/type pairs.
                 * If audioTypes is ['typeA', 'typeB'] and an audio source
                 * is given as [{'stub': 'intro'}], the audio source will be
                 * expanded out to
                 *
```json
                 [
                        {
                            src: 'baseDir' + 'typeA/intro.typeA',
                            type: 'audio/typeA'
                        },
                        {
                            src: 'baseDir' + 'typeB/intro.typeB',
                            type: 'audio/typeB'
                        }
                ]
```
                 *
                 * @property {String[]} audioTypes
                 * @default ['mp3', 'ogg']
                 */
                audioTypes: {
                    type: 'array',
                    default: ['mp3', 'ogg'],
                    description: 'List of audio types to expect for any audio sources specified as strings rather than lists of src/type pairs'
                },
                /**
                 * List of video types to expect for any video specified just
                 * with a string rather than with a list of src/type pairs.
                 * If audioTypes is ['typeA', 'typeB'] and an video source
                 * is given as [{'stub': 'intro'}], the video source will be
                 * expanded out to
                 *
```json
                 [
                        {
                            src: 'baseDir' + 'typeA/intro.typeA',
                            type: 'audio/typeA'
                        },
                        {
                            src: 'baseDir' + 'typeB/intro.typeB',
                            type: 'audio/typeB'
                        }
                ]
```
                 *
                 * @property {String[]} videoTypes
                 * @default ['mp4', 'webm']
                 */
                videoTypes: {
                    type: 'array',
                    default: ['mp4', 'webm'],
                    description: 'List of audio types to expect for any video sources specified as strings rather than lists of src/type pairs'
                }
            }
        },
        data: {
            type: 'object',
            /**
             * Parameters captured and sent to the server
             *
             * @method serializeContent
             * @param {Array} videosShown Sources of videos (potentially) shown during this trial: [source of test video, source of alternate test video].
             * @param {Object} eventTimings
             * @param {String} videoID The ID of any webcam video recorded during this frame
             * @return {Object} The payload sent to the server
             */
            properties: {
                videosShown: {
                    type: 'string',
                    default: []
                },
                videoId: {
                    type: 'string'
                }
            },
            // No fields are required
        }
    },

    videoSources: Ember.computed('isPaused', 'currentTask', 'useAlternate', function() {
        if (this.get('isPaused')) {
            return this.get('attnSources_parsed');
        } else {
            switch (this.get('currentTask')) {
                case 'announce':
                    return this.get('attnSources_parsed');
                case 'intro':
                    return this.get('introSources_parsed');
                case 'test':
                    if (this.get('useAlternate')) {
                        if (this.get('altSources').length) {
                            return this.get('altSources_parsed');
                        } else { // default to playing same test video again
                            return this.get('sources_parsed');
                        }
                    } else {
                        return this.get('sources_parsed');
                    }
            }
        }
        return [];
    }),

    shouldLoop: Ember.computed('videoSources', function() {
        return (this.get('isPaused') || (this.get('currentTask') === 'announce' || this.get('currentTask') === 'test'));
    }),

    onFullscreen() {
        if (this.get('isDestroyed')) {
            return;
        }
        this._super(...arguments);
        if (!this.checkFullscreen()) {
            if (!this.get('isPaused')) {
                this.pauseStudy();
            }
        }
    },

    actions: {

        announcementEnded() {
            this.set('completedAnnouncementAudio', true);
            if (this.get('completedAnnouncementTime')) {
                this.set('currentTask', 'intro');
            }
        },

        videoStarted() {
            if (this.get('currentTask') === 'test' && !this.get('isPaused')) {
                // Check that we haven't played it enough times already
                this.set('testVideosTimesPlayed', this.get('testVideosTimesPlayed') + 1);
                if ((this.get('testVideosTimesPlayed') > this.get('testCount')) && (this.get('testLength') === Infinity)) {
                    this.send('finish');
                } else {
                    if (this.get('testTime') === 0) {
                        this.setTestTimer();
                    }
                    if ($('audio#exp-music').length) {
                        $('audio#exp-music')[0].play();
                    }
                    if (this.get('useAlternate')) {
                        this.send('setTimeEvent', 'startAlternateVideo');
                    } else {
                        this.send('setTimeEvent', 'startTestVideo');
                    }
                }
            }
        },

        videoStopped() {
            var currentTask = this.get('currentTask');
            if (this.get('testTime') >= this.get('testLength')) {
                this.send('finish');
            } else if (this.get('shouldLoop')) {
                this.set('_lastTime', 0);
                this.$('#player-video')[0].play();
            } else {
                this.send('setTimeEvent', 'videoStopped', {
                    currentTask
                });
                if (this.get('currentTask') === 'intro') {
                    this.set('currentTask', 'calibration');
                }
            }
        },

        finish() { // Move to next frame altogether
            // Call this something separate from test because stopRecorder promise needs
            // to call next AFTER recording is stopped and we don't want this to have
            // already been destroyed at that point.
            window.clearInterval(this.get('testTimer'));
            window.clearInterval(this.get('announceTimer'));
            window.clearInterval(this.get('calTimer'));
            this.set('testTime', 0);
            this.set('testVideosTimesPlayed', 0);
            this.set('completedAnnouncementAudio', false);
            this.set('completedAnnouncementTime', false);
            if ($('audio#exp-music').length) {
                $('audio#exp-music')[0].pause();
            }
            var _this = this;
            if (this.get('doRecording')) {
                this.stopRecorder().then(() => {
                    _this.set('stoppedRecording', true);
                    _this.send('next');
                    return;
                }, () => {
                    _this.send('next');
                    return;
                });
            } else {
                _this.send('next');
            }
        }
    },

    segmentObserver: Ember.observer('currentTask', function(frame) {
        if (frame.get('currentTask') === 'announce') {
            frame.startAnnouncement();
        } else if (frame.get('currentTask') === 'intro') {
            frame.startIntro();
        } else if (frame.get('currentTask') === 'calibration') {
            frame.startCalibration();
        } else if (frame.get('currentTask') === 'test') {
            // Skip test phase if no videos provided
            if (!frame.get('sources').length) {
                frame.send('finish');
            }
        }
    }),

    startAnnouncement() {
        window.clearInterval(this.get('announceTimer'));

        // Skip if no announcement audio provided
        if (!this.get('isPaused') && !this.get('audioSources').length && this.get('announceLength') === 0) {
            this.startIntro();
            return;
        }
        if (!this.get('audioSources').length) { // Audio counts as complete if none provided
            this.set('completedAnnouncementAudio', true);
        }
        this.send('setTimeEvent', 'startAnnouncement');
        // Actual starting audio is handled by autoplay on the template.
        var _this = this; // Require at least attnLength duration of announcement phase
        this.set('announceTimer', window.setTimeout(function() {
                _this.set('completedAnnouncementTime', true);
                if (_this.get('completedAnnouncementAudio')) {
                    _this.set('currentTask', 'intro');
                }
            }, _this.get('announceLength') * 1000));
    },

    startIntro() {
        if (this.get('skip')) { // If we need to skip because both test & alternate have been used
            this.send('finish');
            return;
        }
        if (!this.get('isPaused')) {
            this.send('setTimeEvent', 'startIntro');
            // If no intro video provided, skip intro.
            if (!this.get('introSources').length) {
                this.set('currentTask', 'calibration');
            }
        }
    },

    startCalibration() {
        var _this = this;

        // First check whether any calibration video provided. If not, skip.
        if (!this.get('calibrationLength')) {
            this.set('currentTask', 'test');
            return;
        }

        var calAudio = $('#player-calibration-audio')[0];
        var calVideo = $('#player-calibration-video')[0];
        $('#player-calibration-video').show();

        // Show the calibration segment at center, left, right, center, each
        // time recording an event and playing the calibration audio.
        var doCalibrationSegments = function(calList, lastLoc) {
            if (calList.length === 0) {
                $('#player-calibration-video').hide();
                _this.set('currentTask', 'test');
            } else {
                var thisLoc = calList.shift();
                /**
                 * Start of EACH calibration segment
                 *
                 * @event startCalibration
                 * @param {String} location location of calibration ball, relative to child: 'left', 'right', or 'center'
                 */
                _this.send('setTimeEvent', 'startCalibration',
                    {location: thisLoc});
                calAudio.pause();
                calAudio.currentTime = 0;
                calAudio.play().then(
                    _ => {  // eslint-disable-line no-unused-vars
                    })
                    .catch(error => {  // eslint-disable-line no-unused-vars
                        calAudio.play();
                    }
                );

                $('#player-calibration-video').removeClass(lastLoc);
                $('#player-calibration-video').addClass(thisLoc);
                calVideo.pause();
                calVideo.currentTime = 0;
                calVideo.play();
                _this.set('calTimer', window.setTimeout(function() {
                    doCalibrationSegments(calList, thisLoc);
                }, _this.get('calibrationLength')));
            }
        };

        doCalibrationSegments(this.get('calibrationPositions').slice(), '');

    },

    setTestTimer() {
        window.clearInterval(this.get('testTimer'));
        this.set('testTime', 0);
        this.set('_lastTime', 0);

        var testLength = this.get('testLength');

        this.set('testTimer', window.setInterval(() => {
            var videoTime = this.$('#player-video')[0].currentTime;
            var lastTime = this.get('_lastTime');
            var diff = videoTime - lastTime;
            this.set('_lastTime', videoTime);

            var testTime = this.get('testTime');
            if ((testTime + diff) >= (testLength - 0.02)) {
                this.send('finish');
            } else {
                this.set('testTime', testTime + diff);
            }
        }, 100));
    },

    pauseStudy(pause) { // only called in FS mode
        Ember.run.once(this, () => {
            try {
                this.set('hasBeenPaused', true);
            } catch (_) {
                return;
            }
            var wasPaused = this.get('isPaused');
            var currentState = this.get('currentTask');

            // Currently paused: restart
            if (!pause && wasPaused) {
                //this.hideRecorder();
                this.set('isPaused', false);
                // reset announcement to start

                if (currentState === 'test') {
                    if (this.get('useAlternate')) {
                        this.set('skip', true);
                    }
                    this.set('useAlternate', true);

                }
                if (this.get('currentTask') === 'announce') {
                    // if task isn't changing, won't trigger announcement start naturally
                    this.segmentObserver(this);
                }
                this.set('currentTask', 'announce');

                try {
                    this.resumeRecorder();
                } catch (_) {
                    return;
                }
            } else if (pause || !wasPaused) { // Not currently paused: pause
                //this.showRecorder();
                window.clearInterval(this.get('testTimer'));
                window.clearInterval(this.get('announceTimer'));
                window.clearInterval(this.get('calTimer'));
                this.set('completedAnnouncementAudio', false);
                this.set('completedAnnouncementTime', false);
                this.set('testTime', 0);
                this.set('testVideosTimesPlayed', 0);
                this.send('setTimeEvent', 'pauseVideo', {
                    currentTask: this.get('currentTask')
                });
                this.pauseRecorder(true);
                $('#player-calibration-video').removeClass(this.get('calibrationPositions').join(' '));
                $('#player-calibration-video').hide();
                this.set('isPaused', true);
            }
        });
    },

    // Utility to expand stubs into either full URLs (for images) or
    // array of {src: 'url', type: 'MIMEtype'} objects (for audio/video).
    expandAsset(asset, type) {
        var fullAsset = asset;
        var _this = this;

        if (type === 'image' && typeof asset === 'string' && !(asset.includes('://'))) {
            // Image: replace stub with full URL if needed
            fullAsset = this.baseDir + 'img/' + asset;
        } else {
            var types;
            if (type === 'audio') {
                types = this.audioTypes;
            } else if (type === 'video') {
                types = this.videoTypes;
            }
            // Replace any source objects that have a
            // 'stub' attribute with the appropriate expanded source
            // objects
            fullAsset = [];
            asset.forEach(function(srcObj) {
                if (srcObj.hasOwnProperty('stub')) {
                    for (var iType = 0; iType < types.length; iType++) {
                        fullAsset.push({
                            src: _this.baseDir + types[iType] + '/' + srcObj.stub + '.' + types[iType],
                            type: type + '/' + types[iType]
                        });
                    }
                } else {
                    fullAsset.push(srcObj);
                }
            });
        }
        return fullAsset;
    },

    didInsertElement() {
        this._super(...arguments);

        // Expand any audio/video src stubs
        var audSrcParameterNames = [
            'audioSources',
            'musicSources',
            'calibrationAudioSources',
            'pauseAudio',
            'unpauseAudio'
        ];
        var vidSrcParameterNames = [
            'sources',
            'altSources',
            'introSources',
            'attnSources',
            'calibrationVideoSources'
        ];

        var _this = this;
        audSrcParameterNames.forEach((paraName) => {
            var sources = _this.get(paraName);
            if (sources) {
                _this.set(paraName + '_parsed', _this.expandAsset(sources, 'audio'));
            }
        });
        vidSrcParameterNames.forEach((paraName) => {
            var sources = _this.get(paraName);
            if (sources) {
                _this.set(paraName + '_parsed', _this.expandAsset(sources, 'video'));
            }
        });

        $(document).on('keyup.pauser', (e) => {
            if (this.checkFullscreen()) {
                if (e.which === 32) { // space: pause/unpause study
                    this.pauseStudy();
                }
            }
        });

        this.send('showFullscreen');
        if (this.get('sources').length) {
            this.set('videosShown', [this.get('sources')[0].src, this.get('altSources')[0].src]);
        } else {
            this.set('videosShown', []);
        }
        this.set('currentTask', 'announce');
        this.segmentObserver(this);
    },

    /**
     * Observer that starts recording once recorder is ready. Override to do additional
     * stuff at this point!
     * @method whenPossibleToRecord
     */
    whenPossibleToRecord: function() {
        if (this.get('doRecording')) {
            var _this = this;
            if (this.get('recorder.hasCamAccess') && this.get('recorderReady')) {
                this.startRecorder().then(() => {
                    _this.set('recorderReady', false);
                });
            }
        }
    }.observes('recorder.hasCamAccess', 'recorderReady'),

    willDestroyElement() { // remove event handler
        $(document).off('keyup.pauser');
        this._super(...arguments);
    }
});
