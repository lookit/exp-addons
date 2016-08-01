/* jshint node: true */
'use strict';
var path = require('path');
var Funnel = require('broccoli-funnel');
var generate = require('broccoli-auto-generated');
var BroccoliMergeTrees = require('broccoli-merge-trees');


module.exports = {
  name: 'exp-player',

  isDevelopingAddon: function() {
      return true;
  },

  included: function(app) {
    this.app.import(path.join(this.app.bowerDirectory, 'swfobject/swfobject/src/swfobject.js'));
  },

  treeForPublic: function(app) {
    var clientConfig = this.app.options.emberWowza || {};
    clientConfig.php = clientConfig.php || {};
    clientConfig.asp = clientConfig.asp || {};

    var config = {};
    config.php = Object.keys(DEFAULT_OPTIONS).reduce(function(acc, key) {
      acc[key] = clientConfig.php[key] || DEFAULT_OPTIONS[key];
      return acc;
    }, {});
    config.asp = Object.keys(DEFAULT_OPTIONS).reduce(function(acc, key) {
      acc[key] = clientConfig.asp[key] || DEFAULT_OPTIONS[key];
      return acc;
    }, {});

    return new BroccoliMergeTrees([
      generate(null, {
        file: 'avc_settings.php',
        template: '{{php}}',
          values: {
            php: Object.keys(config.php).map(function(key) {
              return key + '=' + config.php[key];
            }).join('&')
          }
      }),
      generate(null, {
        file: 'avc_settings.asp',
        template: '{{asp}}',
          values: {
            asp: Object.keys(config.asp).map(function(key) {
              return key + '=' + config.asp[key];
            }).join('&')
          }
      }),
      new Funnel(path.join(this.project.root, 'lib/exp-player/public'), {
        srcDir: '/',
        destDir: '/',
        include: ['**/*.swf', '**/*.gif', '**/*.png', '**/*.xml', '**/*.php']
      })
    ]);
  }
};


var DEFAULT_OPTIONS = {
  connectionstring: '',

  recorderId: '',
  //languagefile:String
  //description: path to the XML file containing words and phrases to be used in the video recorder interface, use this setting to switch between languages while maintaining several language files
  //values: URL paths to the translation files
  //default: 'translations/en.xml'
  languagefile: 'translations/en.xml',

  //qualityurl: String
  //desc: path to the .xml file describing video and audio quality to use for recording, this variable has higher priority than the qualityurl flash var from the .html files
  //values: URL paths to the audio/video quality profile files
  //default: '' (in which case the qualityurl flash var is being used, it's found in the .html files embedding videorecorder.swf)
  // qualityurl: '',
  qualityurl: 'audio_video_quality_profiles/640x480x30x90.xml',

  //maxRecordingTime: Number
  //desc: the maximum recording time in seconds. If set to -1, the 'mrt' flash var parameter will be used, this way the maximum recording time can be set through this flash param specifically if needed.
  //values: any number greater than 0 OR -1;
  //default:120
  maxRecordingTime: 120,

  //userId: String
  //desc: the id of the user logged into the website, not mandatory, this var is passed back to the save_video_to_db.php file via GET when the [SAVE] button in the recorder is pressed, this variable can also be passed via flash vars like this: videorecorder.swf?userId=XXX, but the value in this file, if not empty, takes precedence. If $config["useUserId"]="true", the value of this variable is also used in the stream name.
  //values: strings or numbers will do
  //by default its empty: ""
  userId: '',

  //outgoingBuffer: Number
  //desc: Specifies how long the buffer for the outgoing audio/video data can grow before Flash Player starts dropping frames. On a high-speed connection, buffer time will not affect anything because data is sent almost as quickly as it is captured and there is no need to buffer it. On a slow connection, however, there might be a significant difference between how fast Flash Player can capture audio and video data data and how fast it can be sent to the client, thus the surplus needs to be buffered. HDFVR will increase the value specified here as much as possible (if the buffer fills more than 90% of the available buffer, we double the available buffer) to prevent Flash Player from dumping the data in the buffer when it's full.
  //values: 30,60,etc...
  //default:60
  outgoingBuffer: 60,

  //playbackBuffer: Number
  //desc: specifies how much video time (in seconds) to buffer when reviewing/playing the recorded video
  //values: 1, 10,20,30,60,etc...
  //default:1
  playbackBuffer: 1,

  //autoPlay: String
  //desc: weather the recorded video should play automatically after recording it or if HDFVR should  wait for the user to press the PLAY button
  //values: false, true
  //default: 'false'
  autoPlay: 'false',

  //deleteUnsavedFlv: String
  //desc: weather the recorded videos for which the user has not pressed [SAVE] will be deleted from the media server or not
  //values: false, true
  //default: 'false'
  deleteUnsavedFlv: 'false',

  //hideSaveButton:Number
  //desc: makes the [SAVE] button invisible. When the [SAVE] button is pressed the save_video_to_db.xxx script is called and the corresponding JS functions. The creation/existence of the new video file and corresponding snapshot do not depend on pressing this button.
  //An invisible SAVE button can be used to move the SAVE action to the HTML page where there can be other form fields that can be submitted together with the info about the vid.
  //When the SAVE button is hidden you can use the onUploadDone java script hook to get some info about the newly recorded flv file and redirect the user/enable a button on the HTML page/populate some hidden FORM vars/etc... .
  //NOTE: when hiding this button some functions/calls will never be performed: save_video_to_db.php will never be called, onSaveOk and onSaveFailed JS functions will not be called
  //Also see the autoSaveVideo variable which hides the button but stille xecuts the server side script
  //values: 1 for hidden, 0 for visible
  //default: 0 (visible)
  hideSaveButton: 0,

  //onSaveSuccessURL:String
  //desc: when the [SAVE] button is pressed (if it's enabled) save_video_to_db.php (or .asp) is called. If the save operation succeeds AND if this variable is NOT EMPTY, the user will be taken to the URL
  //values: any URL you want the user directed to after he presses the [Save] button
  //default: ""
  onSaveSuccessURL: "",

  //snapshotSec:Number
  //desc: the snapshot is taken when the recording reaches this length/time
  //NOTE: THE SNAPSHOT IS SAVED TO THE WEB SERVER AS A JPG WHEN THE USER PRESSES THE SAVE BUTTON. If Save is not pressed the snapshot is not saved.
  //values: any number  greater or equal to 0,  if 0 then the snap shot is taken when the [REC] button is pressed
  //default: 5
  snapshotSec: 5,

  //snapshotEnable:Number
  //desc: if set to true the recorder will take a snapshot
  //values: true or false
  //default: 'true'
  snapshotEnable: "true",

  //minRecordTime:Number
  //desc: the minimum number of seconds a recording must be in length. The STOP button will be disabled until the recording reaches this length!
  //values: any number lower them maxRecordingTime
  //default: 5
  minRecordTime: 5,

  //backgroundColor:Hex number
  //desc: color of background area inside the video recorder around the video area
  //values: any color in hex format
  //default:0x990000 (dark red)
  backgroundColor: "0xf6f6f6",

  //menuColor:Hex number
  //desc: the color of the lower area of the recorder containing the buttons and the scrub bar
  //values:any color in hex format
  //default:0x333333 (dark grey)
  menuColor: "0xe9e9e9",

  //radiusCorner:Number
  //desc: the radius of the 4 corners of the video recorder
  //values: 0 for no rounded corners, 4,8,16,etc...
  //default: 16
  radiusCorner: 8,

  //showFps:String
  //desc: Shows or hides the FPS counter
  //values: 'false' to hide it 'true' to show it
  //default: 'true'
  showFps: 'false',

  //recordAgain:String
  //desc:if set to true the user will be able to record again and again until he is happy with the result. If set to false he only has 1 shot!
  //values:'false' for one recording, 'true' for multiple recordings
  //default: 'true'
  recordAgain:  'true',

  //useUserId:String
  //desc:if set to 'true' the stream name will be {prefix}{userId}{timestamp_random} instead of {prefix}{timestamp_random}. {userId} will be reaplced by HDFVR with the value of $config['userId'] from this file.
  //values:'false' for not using the userId in the file name, 'true' for using it
  //default: 'false'
  useUserId:  'true',

  //streamPrefix:String
  //desc: adds a prefix to the video file name on the media server like this: {prefix}{timestamp_random} or {prefix}{userId}{timestamp_random} if the useUserId option is set to true
  //values: a string
  //default: "videoStream_"
  streamPrefix: "videoStream_",

  //streamName:String
  //desc: By default the application generates a random name ({prefix}_{timestamp_random}) for the video file. If you want to use a certain name set this variable and it will overwrite the pattern {prefix}_{timestamp_random}. The stream extension (.flv , .mp4 or .f4v) should NOT be used in the stream name.
  //values: a string
  //default: ""
  streamName: "",

  //disableAudio:String
  //desc: By default the application records audio and video. If you want to disable audio recording set this var to 'true'.
  //values: 'false' to include audio in the recording, 'true' to record without audio
  //default: 'false'
  disableAudio: 'false',

  //chmodStreams:String
  //desc: If you want to change the permissions on the newly recorded video file after it is saved to the disk on the media server you can use this variable. This works only on Red5 and Wowza.
  //values: "0666","0777", etc.
  //default: ""
  chmodStreams: "",

  //countdownTimer:String
  //desc: set to true if you want the timer to decrease from the upper limit (maxRecordingTime) down to 0
  //values: "true", "false"
  //defaut: "false"
  countdownTimer: "false",

  //overlayPath:String
  //desc: realtive URL path to the image to be shown as overlay
  //values: any realtive path
  //defaut: "" //no overlay
  overlayPath: "",

  //overlayPosition:String
  //desc: position of the overlay image mentioned above
  //values: "tr" for top right, "tl" for top left and "cen" for centered, no other positions are supported
  //defaut: "tr"
  overlayPosition: "tr",

  //loopbackMic:String
  //desc: whether or not the sound should be also played back in the speakers/heaphones during recording
  //values: "true" for yes, "false" for no
  //defaut: "false"
  loopbackMic: "false",

  //showMenu:String
  //desc: whether or not the bottom menu in the HDFVR shoud show, some people choose to control the HDFVR via JS and they do ot need the menu, when not using the menu you can decrease the height of HDFVR by 32 (3o is the height of the button 2 is the default padding value in this config file)
  //values: "true" to show, "false" to hide
  //default: "true"
  showMenu: "true",

  //showTimer:String
  //desc: Show or hides the timer
  //values: 'false' to hide it 'true' to show it
  //default: 'true'
  showTimer: 'true',

  //showSoundBar:String
  //desc: Shows or hides the sound bar
  //values: 'false' to hide it 'true' to show it
  //default: 'true'
  showSoundBar: 'true',

  //flipImageHorizontally: String
  //desc: When set to 'false' HDFVR will show the webcam feed exactly as it comes from the webcam (direct mode). When set to 'true' HDFVR shows the webcam feed (while recording and reviewing the recorded video, the actual video file will not be flipped) flipped horizontally, in a similar way to a mirror or the iPhone's front facing camera.
  //values: 'true' to flip it (mirror mode), 'false' to show the feed as it comes from the webcam (direct mode)
  //default: 'false'
  flipImageHorizontally: 'false',

  //hidePlayButton:Number
  //desc: This controls whether or not the play/pause button is visible in the controls menu of HDFVR
  //values: 1 for hidden, 0 for visible
  //default: 0 (visible)
  hidePlayButton: 1,

  //enablePauseWhileRecording:Number
  //desc: This controls whether or not HDFVR can be paused/resumed during a recording. Pausing the video on Red5 1.0.2 is known to cause issues with the consistency of the final recording produced
  //values: 1 for enabled, 0 for disabled
  //default: 0 (disabled)
  enablePauseWhileRecording: 1,

  //enableBlinkingRec:Number
  //desc: This controls whether or not HDFVR will display the Rec blinking animation while recording
  //values: 1 for enabled, 0 for disabled
  //default: 1 (enabled)
  enableBlinkingRec: 1,

  //microphoneGain:Number
  //desc: This controls the amount by which the microphone boosts the signal. Altough this value is applied and reflects the recording level, the setting does not update Flash Player's  "Record Volume" slider in Flash Player Settings > Microphone. This seems to be a bug in Flash Player.
  //values: 0 to 100
  //default: 50
  microphoneGain: 50,

  //allowAudioOnlyRecording:Number
  //desc: This controls whether or not HDFVR is permitted to record audio only when a webcam is missing and only a microphone is detected.
  //values:1 for enabled, 0 for disasbled
  //default: 1 (enabled)
  allowAudioOnlyRecording: 0,

  //enableFFMPEGConverting:Number
  //desc: This controls whether or not HDFVR will trigger server side the execution of FFMPEG converting once the stream finished uploading.
  //values:1 for enabled, 0 for disasbled
  //default: 0 (disabled)
  enableFFMPEGConverting: 0,

  //ffmpegCommand:String
  //desc: This sets the conversion command that will be executed with FFMPEG when enableFFMPEGConverting is set to 1. The command has the following pattern: "ffmpeg -i [THE_INPUT_FLV_FILE]  [codec parameters audio/video] [THE_OUTPUT_MP4_FILE]" . The [THE_INPUT_FLV_FILE] and [THE_OUTPUT_MP4_FILE] parts must not be changed, both the path to ffmpeg and to the video files will be detected and set automatically by the media server. Only the codec parameters will be taken into account. The command is expressed like this to put it more into context as opposed to just sending the codec parameters.
  //values:Example command: ffmpeg -i [THE_INPUT_FLV_FILE] -c:v libx264 [THE_OUTPUT_MP4_FILE]
  //default: ffmpeg -i [THE_INPUT_FLV_FILE] -c:v libx264 [THE_OUTPUT_MP4_FILE]
  ffmpegCommand: "ffmpeg -i [THE_INPUT_FLV_FILE] -c:v libx264 [THE_OUTPUT_MP4_FILE]",

  //autoSave:Number
  //desc: This controls whether or not HDFVR will automatically call the save_video_to_db script, having the same effect as pressing the [SAVE] button in menu. To eliminate the issue of double entries in the database, enabling this setting will automatically hide the [SAVE] button.
  //values:1 for enabled, 0 for disasbled
  //default: 1 (enabled)
  autoSave: 1,

  //payload: String
  //desc: The payload var is used to transmit data in the form of strings or JSON encoded string, not mandatory, this var is passed back to the save_video_to_db.php file via GET when the [SAVE] button in the recorder is pressed, this variable can also be passed via flash vars like this: videorecorder.swf?payload=XXX.
  //values: strings, numbers, JSON encoded strings
  //by default its empty: ""
  payload: '',

  //normalColor:Hex number
  //desc: color of the text and icons
  //values: any color in hex format
  //default:0x333333
  normalColor: "0x334455",

  //overColor:Hex number
  //desc: color applied to text and icons on mouse over
  //values: any color in hex format
  //default:0xdf8f90 (dark red)
  overColor: "0x556677",

  //skipInitialScreen:Number
  //desc: If this settings is enabled HDFVR won't show the initial pre-recording screen introduced in HDFVR 2.0
  //values: 1 for enabled, 0 for disasbled
  //default:0 (disabled)
  skipInitialScreen: 0,

  //hideDeviceSettingsButtons:Number
  //desc: If this settings is enabled HDFVR won't display the camera and microphone settings buttons when the showMenu setting is set to FALSE. This is especially helpfull if you are integrating HDFVR on a platform that will use the same hardware specifications and no changing of the devices will be needed.
  //values: 1 for enabled, 0 for disasbled
  //default:0 (disabled)
  hideDeviceSettingsButtons: 0,

  proxyType: null
};
