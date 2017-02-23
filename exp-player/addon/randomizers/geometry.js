/*
 NOTE: you will need to manually add an entry for this file in addon/randomizers/index.js, e.g.:

import geometry from './geometry';
...
export default {
    ...
    geometry: geometry
}
 */

var getRandomElement = function(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
};

var randomizer = function(frameId, frame) {

    var positionOptions = frame.counterbalance['startPositions'];
    var contextOptions  = frame.counterbalance['contexts'];

    var position = getRandomElement(positionOptions);
    var context  = getRandomElement(contextOptions);

    position = (position === 'left');
    context  = (context  === 'fat');

    var frames = [];
    var thisFrame = {};
    for (var iFrame=0; iFrame<4; iFrame++) {
        thisFrame = {
            kind: frame.frameType,
            id: `${frameId}`,
            altOnLeft: position,
            context: context,
            audioSources: [
                {
                    'type': 'audio/mp3',
                    'src': 'https://s3.amazonaws.com/lookitcontents/geometry/mp3/video_0' + (iFrame+1) + '.mp3'
                },
                {
                    'type': 'audio/ogg',
                    'src': 'https://s3.amazonaws.com/lookitcontents/geometry/ogg/video_0' + (iFrame+1) + '.ogg'
                }
            ]
        };
        if (iFrame === 3) {
            thisFrame.endAudioSources = [
                {
                    'type': 'audio/mp3',
                    'src': 'https://s3.amazonaws.com/lookitcontents/geometry/mp3/all_done.mp3'
                },
                {
                    'type': 'audio/ogg',
                    'src': 'https://s3.amazonaws.com/lookitcontents/geometry/ogg/all_done.ogg'
                }
            ];
        }
        Object.assign(thisFrame, frame.frameOptions);

        position = !position;
        //[thisFrame,] = resolveFrame(null, thisFrame);
        frames.push(thisFrame);
    }

    return [frames, {'position': position, 'context': context}];

    // Short version for testing
    //return [[frames[0]], {'position': position, 'context': context}];

   // Random choice...
    // Pick one option at random
    //var sample = Math.floor(Math.random() * frame.options.length);
    //var choice = frame.options[sample];

    // jscs:disable
    //var [frames,] = resolveFrame(choice);
    //return [frames, choice];

    //lib/exp-player/addon/utils/parse-experiment.js

};
export default randomizer;
