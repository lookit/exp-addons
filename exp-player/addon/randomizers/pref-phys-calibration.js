// http://stackoverflow.com/a/12646864
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function getConditions(lastSession, frameId) {
    var startType, showStay, whichObjects;
    var lastConditions = lastSession ? lastSession.get(`conditions.${frameId}`): null;
    if (!lastConditions) {
        startType = Math.floor(Math.random() * 4);
        showStay = Math.floor(Math.random() * 2);
        var whichObjectG = Math.floor(Math.random() * 6);
        var whichObjectI = Math.floor(Math.random() * 6);
        var whichObjectS = Math.floor(Math.random() * 6);
        var whichObjectC = Math.floor(Math.random() * 6);
        whichObjects = [whichObjectG, whichObjectI, whichObjectS, whichObjectC];
    } else {
        startType = lastConditions.startType;
        startType++;
        if (startType > 3) {
            startType = 0;
        }

        showStay = lastConditions.showStay;
	//parseInt(prompt("Show support-stay (1) or support-fall (0) last session?", "0/1"));
        showStay = 1 - showStay;
        whichObjects = lastConditions.whichObjects;
        for (var i = 0; i < 4; i++) {
            whichObjects[i]++;
            if (whichObjects[i] > 5) {
                whichObjects[i] = 0;
            }
        }
    }
    return {
	startType: startType,
	showStay: showStay,
	whichObjects: whichObjects
    };
}

function assignVideos(startType, showStay, whichObjects, NPERTYPE) {
    // Types of comparisons for each event type (gravity, inertia, support-fall, support-stay,
    // control). Format [event, outcomeMoreProb, outcomeLessProb]
    var comparisonsG = [
        ["table", "down", "continue"],
        ["table", "down", "up"],
        ["table", "continue", "up"],
        ["ramp", "down", "up"],
        ["ramp", "down", "up"],
        ["toss", "down", "up"]
    ];
    var comparisonsI = [
        ["stop", "hand", "nohand"],
        ["reverse", "barrier", "nobarrier"]
    ];
    var comparisonsSF = [
        ["fall", "slightly", "mostly"],
        ["fall", "next", "mostly"],
        ["fall", "near", "mostly"],
        ["fall", "next", "slightly"],
        ["fall", "near", "slightly"],
        ["fall", "near", "next"]
    ];
    var comparisonsSS = [
        ["stay", "slightly", "mostly"],
        ["stay", "next", "mostly"],
        ["stay", "near", "mostly"],
        ["stay", "next", "slightly"],
        ["stay", "near", "slightly"],
        ["stay", "near", "next"]
    ];
    var comparisonsC = [
        ["same", "A", "B"],
        ["salience", "interesting", "boring"]
    ];


    var videotypes = ["gravity", "inertia", "support", "control"];
    var compTypes = [comparisonsG, comparisonsI, [], comparisonsC]; // assign [2] after choosing
    // what to show for support
    var nReps = [1, 3, 1, 3]; // how many times does each comparison type listed need to be shown
    // to get to NPERTYPE for that event type?

    // Choose which videos to show for support
    if (showStay === 0) {
        videotypes[2] = "fall";
        compTypes[2] = comparisonsSF;
    } else if (showStay === 1) {
        videotypes[2] = "stay";
        compTypes[2] = comparisonsSS;
    } /* else {
        alert("invalid value for showStay (should be '0' or '1'), using '0'");
        videotypes[2] = "fall";
        compTypes[2] = comparisonsSF;
    } */

    // Objects to use: elements correspond to videotypes
    var objects = [
        ["apple", "cup", "orangeball", "lotion", "spray", "whiteball"],
        ["train", "marker", "toycar", "sunglasses", "flashlight", "block"],
        ["hammer", "tissues", "duck", "book", "shoe", "bowl"],
        ["box", "funnel", "eraser", "scissors", "spoon", "wrench"]
    ];

    // Options for videos, organized by event
    var cameraAngles = {};
    cameraAngles['table'] = ["c1", "c2"];
    cameraAngles['ramp'] = ["c1", "c2"];
    cameraAngles['toss'] = ["c1", "c2"];
    cameraAngles['stop'] = ["c1", "c2"];
    cameraAngles['reverse'] = ["c1", "c2"];
    cameraAngles['fall'] = ["c1"];
    cameraAngles['stay'] = ["c1"];
    cameraAngles['same'] = ["c1"];
    cameraAngles['salience'] = ["c1"];

    var backgrounds = {};
    backgrounds['table'] = ["b1", "b2"];
    backgrounds['ramp'] = ["b1", "b2"];
    backgrounds['toss'] = ["b1"];
    backgrounds['stop'] = ["b1"];
    backgrounds['reverse'] = ["b1"];
    backgrounds['fall'] = ["b1"];
    backgrounds['stay'] = ["b1"];
    backgrounds['same'] = ["b1"];
    backgrounds['salience'] = ["b1"];

    var flips = {};
    flips['table'] = ["NR"];
    flips['ramp'] = ["NN", "RR", "NR", "RN"];
    flips['toss'] = ["NN", "RR"];
    flips['stop'] = ["NR"];
    flips['reverse'] = ["RN"];
    flips['fall'] = ["NN", "NR", "RN", "RR"];
    flips['stay'] = ["NN", "NR", "RN", "RR"];
    flips['same'] = ["NN", "RR", "NR", "RN"];
    flips['salience'] = ["NN", "NR", "RN", "RR"];

    // Create list of TYPES (e.g. gravity, inertia, ...)
    var typeOrder = videotypes.slice(startType, videotypes.length);
    typeOrder = typeOrder.concat(videotypes.slice(0, startType));

    var playlistsByType = {};
    for (var iType = 0; iType < videotypes.length; iType++) { // for each video type

        // make list of objects to use with canonically-ordered comparison types
        var objList = objects[iType].slice(whichObjects[iType], objects[iType].length);
        objList = objList.concat(objects[iType].slice(0, whichObjects[iType]));

        // make canonical comparison type list
        var eventTypeList = compTypes[iType];
        for (var iRep = 1; iRep < nReps[iType]; iRep++) {
            eventTypeList = eventTypeList.concat(compTypes[iType]);
        }

        // choose placement of more/less surprising outcomes (balanced)
        var onLeft = ["moreProb", "moreProb", "moreProb", "lessProb", "lessProb", "lessProb"];
        onLeft = shuffleArray(onLeft);

        // pair objects and comparison types
        var events = [];
        for (var iEvent = 0; iEvent < eventTypeList.length; iEvent++) {
	    var outcomeL, outcomeR;
            if (onLeft[iEvent] === "moreProb") {
                outcomeL = eventTypeList[iEvent][1];
                outcomeR = eventTypeList[iEvent][2];
            } else {
                outcomeL = eventTypeList[iEvent][2];
                outcomeR = eventTypeList[iEvent][1];
            }

            // choose camera angle, background, and NN/NR/RN/RR randomly
            var iCamera = Math.floor(Math.random() *
                cameraAngles[eventTypeList[iEvent][0]].length);
            var iBackground = Math.floor(Math.random() *
                backgrounds[eventTypeList[iEvent][0]].length);
            var iFlip = Math.floor(Math.random() *
                flips[eventTypeList[iEvent][0]].length);

            events.push({
                compType: eventTypeList[iEvent][0],
                outcomeL: outcomeL,
                outcomeR: outcomeR,
                object: objList[iEvent],
                camera: cameraAngles[eventTypeList[iEvent][0]][iCamera],

		background: backgrounds[eventTypeList[iEvent][0]][iBackground],
                flip: flips[eventTypeList[iEvent][0]][iFlip]
            });
        }

        // choose order of events randomly
        events = shuffleArray(events);
        playlistsByType[videotypes[iType]] = events;
    }

    // Put list together
    var allEvents = [];
    var filenames = [];
    var eventNum = 1;
    for (var nEvents = 0; nEvents < NPERTYPE; nEvents++) {
        for (iType = 0; iType < typeOrder.length; iType++) {
            var e = playlistsByType[typeOrder[iType]][nEvents];

            var fname = `sbs_${e.compType}_${e.outcomeL}_${e.outcomeR}_${e.object}_${e.camera}_${e.background}_${e.flip}`;
            filenames.push(fname);
            var altName = `sbs_${e.compType}_${e.outcomeR}_${e.outcomeL}_${e.object}_${e.camera}_${e.background}_${e.flip}`;
            e.fname = fname;
            e.altName = altName;
            e.index = eventNum;
            allEvents.push(e);
            eventNum++;
        }
    }

    return [allEvents, filenames];
}

function parse_name(fname) {
    var pieces = fname.split('_');
    var features = {};


    features.eventType = pieces[1];
    features.leftEvent = pieces[2];
    features.rightEvent = pieces[3];
    features.object = pieces[4];
    features.camera = pieces[5];
    features.bg = pieces[6];
    var variantExt = pieces[7];
    features.variant = (variantExt.split('.'))[0];

    //quick hack for dummy clips which have wrong names for some objects
    // (so we can get a correct intro name)
    switch (features.object) {
        case "A":
            features.object = "box";
            break;
        case "B":
            features.object = "eraser";
            break;
        case "C":
            features.object = "funnel";
            break;
        case "D":
            features.object = "scissors";
            break;
        case "E":
            features.object = "spoon";
            break;
        case "F":
            features.object = "wrench";
            break;
    }

    return features;

}

function audioSourceObjs(path, shortname) {
    return  [
                {
                    "src": path + shortname + '.ogg',
                    "type": "audio/ogg"
                },
                {
                    "src": path + shortname + '.mp3',
                    "type": "audio/mp3"
                }
            ];
}

function videoSourceObjs(path, shortname, organizedByType) {
    if (!organizedByType) {
        return  [
                    {
                        "src": path + shortname + '.webm',
                        "type": "video/webm"
                    },
                    {
                        "src": path + shortname + '.mp4',
                        "type": "video/mp4"
                    }
                ];
    } else {
        return  [
                {
                    "src": path + 'webm/' + shortname + '.webm',
                    "type": "video/webm"
                },
                {
                    "src": path + 'mp4/' + shortname + '.mp4',
                    "type": "video/mp4"
                }
            ];
    }
}

function toFrames(frameId, eventVideos, BASE_DIR) {
    var nVideos = eventVideos.length;
    return eventVideos.map((e) => {
        if (e.index === nVideos) {
            return {
                kind: 'exp-video-physics',
                id: `${frameId}`,
                autoplay: true,
                isLast: true,
                audioSources: audioSourceObjs(
                    BASE_DIR + 'audio/',
                    'all_done'
		),
                attnSources: videoSourceObjs(
                    BASE_DIR + 'stimuli/attention/',
                    'attentiongrabber'
		)
            };
        }
        var features = parse_name(e.fname);
        var allMusic = ['music_01', 'music_02', 'music_03', 'music_04', 'music_06', 'music_07', 'music_09', 'music_10'];
        var musicName = allMusic[Math.floor(Math.random() * allMusic.length)];

        return {
            kind: 'exp-video-physics',
            id: `${frameId}`,
            autoplay: true,
            testLength: 20,
            isLast: false,
            audioSources: audioSourceObjs(
                BASE_DIR + 'audio/',
                'video_' + ("00" + (e.index)).slice(-2)),
            musicSources: audioSourceObjs(
                BASE_DIR + 'audio/',
                musicName),
            introSources: videoSourceObjs(
                BASE_DIR + 'stimuli/intro/',
                `cropped_${features.object}`),
            attnSources: videoSourceObjs(
                BASE_DIR + 'stimuli/attention/',
                'attentiongrabber'),
            sources: [{
                src: 'http://www.mit.edu/~kimscott/video/testpattern.mp4',
                type: 'video/mp4'
            }],
            altSources: [{
                src: 'http://www.mit.edu/~kimscott/video/testpattern.mp4',
                type: 'video/mp4'
            }]
        };
    });
}

var randomizer = function(frameId, frame, pastSessions, resolveFrame) {
    var MAX_VIDEOS = 4; // for testing only - limit number of videos. Change to 24 for prod.
    var BASE_DIR = 'https://s3.amazonaws.com/lookitcontents/exp-physics/';

    pastSessions = pastSessions.filter(function(session) {
        return session.get('conditions');
    });
    pastSessions.sort(function(a, b) {
        return a.get('createdOn') > b.get('createdOn') ? -1: 1;
    });
    var conditions = getConditions(pastSessions[0], frame.id);
    conditions.NPERTYPE = 6;
    var {
	startType,
	showStay,
	whichObjects,
	NPERTYPE
    } = conditions;

    var [eventVideos, ] = assignVideos(startType, showStay, whichObjects, NPERTYPE);

    eventVideos = eventVideos.slice(0,MAX_VIDEOS);
    eventVideos.push({index: MAX_VIDEOS+1});

    // allEvents and filenames are a function of conditions (no need to store)
    var resolved = [];
    toFrames(frameId, eventVideos, BASE_DIR).forEach((frame) => {
	return resolved.push(...resolveFrame(null, frame)[0]);
    });
    return [resolved, conditions];
};
export default randomizer;
