// jscs:disable
import Ember from 'ember';

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

/**
 * Select the first matching session from an array of options, according to the specified rules
 *
 * @method getLastSession
 * @param {Session[]} pastSessions An array of session records. This returns the first match, eg assumes newest-first sort order
 * @returns {Session} The model representing the last session in which the user participated
 */
function getLastSession(pastSessions) {
    // Base randomization on the newest (last completed) session for which the participant got at
    // least as far as recording data for a single video ID.
    for (let i = 0; i < pastSessions.length; i++) {
        let session = pastSessions[i];
        // Frames might be numbered differently in different experiments... rather than check for a frame ID, check that at least one frame referencing the videos exists at all.
        let expData = session.get('expData') || {};
        let keys = Object.keys(expData);
        for (let i = 0; i < keys.length; i++) {
            let frameKeyName = keys[i];
            let frameData = expData[frameKeyName];
            if (frameKeyName.indexOf('pref-phys-videos') !== -1 && frameData && frameData.videoId) {
                return session;
            }
        }
    }
    // If no match found, explicitly return null
    return null;
}

function getConditions(lastSession, frameId) {
    var startType, showStay, whichObjects;
    var cb = counterbalancingLists();
    // The last session payload refers to the frame we want by number (#-frameName), but frames aren't numbered until the sequence
    //   has been resolved (eg until we expand pref-phys-videos into a series of video frames, we won't know how many
    //   frames there are or in what order)
    // To find the last conditions, we take the last (and presumably only) key of session.conditions that looks like
    //  the name (without the leading number part)

    // This works insofar as this function only targets one sort of frame that we expect to occur only once in
    // the pref-phys experiment. Otherwise this function would get confused.
    let lastConditions = lastSession ? lastSession.get('conditions') : null;
    let lastFrameConditions;
    Object.keys(lastConditions || {}).forEach((keyName) => {
        if (keyName.indexOf(frameId) !== -1) {
            lastFrameConditions = lastConditions[keyName];
        }
    });

    if (!lastFrameConditions) {
        startType = Math.floor(Math.random() * cb.conceptOrderRotation.length);
        showStay = Math.floor(Math.random() * cb.useFallRotation.length);
        var whichObjectG = Math.floor(Math.random() * 6);
        var whichObjectI = Math.floor(Math.random() * 6);
        var whichObjectS = Math.floor(Math.random() * 6);
        var whichObjectC = Math.floor(Math.random() * 6);
        whichObjects = [whichObjectG, whichObjectI, whichObjectS, whichObjectC];
    } else {

        startType = lastFrameConditions.startType;
        startType++;
        if (startType >= cb.conceptOrderRotation.length) {
            startType = 0;
        }

        showStay = lastFrameConditions.showStay;
        showStay++;
        if (showStay >= cb.useFallRotation.length) {
            showStay = 0;
        }

        whichObjects = Ember.copy(lastFrameConditions.whichObjects);
        for (var i = 0; i < 4; i++) {
            whichObjects[i]++;
            if (whichObjects[i] >= cb.objectRotations[i].length) {
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

function counterbalancingLists() {

    // List of comparisons to show 'fall' videos for; each session, increment
    // position in this list so that kids see a variety of stay/fall groupings.
    var useFallRotation = [
        [0, 2, 5],
        [0, 2, 3],
        [1, 2, 4],
        [3, 4, 5],
        [0, 1, 4],
        [0, 4, 5],
        [1, 2, 3],
        [1, 3, 5],
        [1, 4, 5],
        [0, 1, 3],
        [0, 3, 4],
        [1, 2, 5],
        [2, 4, 5],
        [1, 3, 4],
        [2, 3, 4],
        [0, 2, 4],
        [0, 3, 5],
        [2, 3, 5],
        [0, 1, 5],
        [0, 1, 2]
    ];

    var conceptOrderRotation = [
        ['control', 'inertia', 'support', 'gravity'],
        ['support', 'gravity', 'control', 'inertia'],
        ['support', 'inertia', 'gravity', 'control'],
        ['support', 'control', 'gravity', 'inertia'],
        ['gravity', 'support', 'control', 'inertia'],
        ['control', 'gravity', 'inertia', 'support'],
        ['gravity', 'control', 'support', 'inertia'],
        ['inertia', 'control', 'gravity', 'support'],
        ['gravity', 'inertia', 'control', 'support'],
        ['inertia', 'control', 'support', 'gravity'],
        ['control', 'support', 'inertia', 'gravity'],
        ['support', 'inertia', 'control', 'gravity'],
        ['gravity', 'support', 'inertia', 'control'],
        ['control', 'gravity', 'support', 'inertia'],
        ['support', 'gravity', 'inertia', 'control'],
        ['inertia', 'support', 'gravity', 'control'],
        ['inertia', 'support', 'control', 'gravity'],
        ['support', 'control', 'inertia', 'gravity'],
        ['control', 'support', 'gravity', 'inertia'],
        ['inertia', 'gravity', 'control', 'support'],
        ['control', 'inertia', 'gravity', 'support'],
        ['gravity', 'control', 'inertia', 'support'],
        ['inertia', 'gravity', 'support', 'control'],
        ['gravity', 'inertia', 'support', 'control']
    ];

    var gravityObjectRotation = [
        ['apple', 'whiteball', 'orangeball', 'cup', 'spray', 'lotion'],
        ['orangeball', 'lotion', 'apple', 'spray', 'cup', 'whiteball'],
        ['orangeball', 'apple', 'cup', 'spray', 'lotion', 'whiteball'],
        ['cup', 'orangeball', 'lotion', 'apple', 'spray', 'whiteball'],
        ['whiteball', 'orangeball', 'lotion', 'apple', 'cup', 'spray'],
        ['orangeball', 'lotion', 'cup', 'spray', 'apple', 'whiteball'],
        ['orangeball', 'cup', 'lotion', 'apple', 'spray', 'whiteball'],
        ['orangeball', 'lotion', 'apple', 'cup', 'whiteball', 'spray'],
        ['apple', 'orangeball', 'lotion', 'cup', 'spray', 'whiteball'],
        ['whiteball', 'orangeball', 'apple', 'lotion', 'cup', 'spray'],
        ['cup', 'lotion', 'orangeball', 'whiteball', 'apple', 'spray'],
        ['whiteball', 'cup', 'apple', 'lotion', 'spray', 'orangeball'],
        ['orangeball', 'whiteball', 'lotion', 'cup', 'apple', 'spray'],
        ['whiteball', 'orangeball', 'cup', 'lotion', 'apple', 'spray'],
        ['apple', 'cup', 'orangeball', 'lotion', 'spray', 'whiteball'],
        ['whiteball', 'orangeball', 'lotion', 'apple', 'spray', 'cup'],
        ['lotion', 'apple', 'orangeball', 'cup', 'spray', 'whiteball'],
        ['apple', 'orangeball', 'whiteball', 'cup', 'lotion', 'spray'],
        ['lotion', 'orangeball', 'whiteball', 'spray', 'cup', 'apple'],
        ['orangeball', 'apple', 'cup', 'lotion', 'spray', 'whiteball'],
        ['orangeball', 'apple', 'lotion', 'whiteball', 'spray', 'cup'],
        ['whiteball', 'apple', 'lotion', 'spray', 'cup', 'orangeball'],
        ['lotion', 'orangeball', 'apple', 'whiteball', 'spray', 'cup'],
        ['apple', 'lotion', 'orangeball', 'whiteball', 'spray', 'cup'],
        ['whiteball', 'orangeball', 'lotion', 'cup', 'spray', 'apple'],
        ['apple', 'orangeball', 'cup', 'lotion', 'whiteball', 'spray'],
        ['apple', 'orangeball', 'lotion', 'spray', 'whiteball', 'cup'],
        ['cup', 'orangeball', 'apple', 'spray', 'lotion', 'whiteball'],
        ['cup', 'whiteball', 'apple', 'spray', 'lotion', 'orangeball'],
        ['lotion', 'whiteball', 'orangeball', 'apple', 'cup', 'spray'],
        ['apple', 'lotion', 'whiteball', 'spray', 'cup', 'orangeball'],
        ['orangeball', 'whiteball', 'cup', 'apple', 'spray', 'lotion'],
        ['orangeball', 'cup', 'whiteball', 'apple', 'lotion', 'spray'],
        ['cup', 'orangeball', 'lotion', 'whiteball', 'apple', 'spray'],
        ['orangeball', 'apple', 'whiteball', 'cup', 'lotion', 'spray'],
        ['cup', 'whiteball', 'orangeball', 'spray', 'lotion', 'apple'],
        ['lotion', 'apple', 'cup', 'spray', 'whiteball', 'orangeball'],
        ['cup', 'whiteball', 'orangeball', 'lotion', 'spray', 'apple'],
        ['lotion', 'whiteball', 'cup', 'spray', 'apple', 'orangeball'],
        ['lotion', 'whiteball', 'apple', 'spray', 'cup', 'orangeball'],
        ['lotion', 'orangeball', 'cup', 'whiteball', 'spray', 'apple'],
        ['lotion', 'cup', 'whiteball', 'spray', 'apple', 'orangeball'],
        ['cup', 'orangeball', 'lotion', 'whiteball', 'spray', 'apple'],
        ['cup', 'orangeball', 'apple', 'spray', 'whiteball', 'lotion'],
        ['lotion', 'orangeball', 'apple', 'cup', 'whiteball', 'spray'],
        ['cup', 'orangeball', 'apple', 'lotion', 'spray', 'whiteball'],
        ['apple', 'orangeball', 'whiteball', 'spray', 'cup', 'lotion'],
        ['orangeball', 'cup', 'whiteball', 'spray', 'lotion', 'apple'],
        ['orangeball', 'apple', 'whiteball', 'cup', 'spray', 'lotion'],
        ['apple', 'lotion', 'whiteball', 'cup', 'spray', 'orangeball'],
        ['whiteball', 'lotion', 'orangeball', 'cup', 'apple', 'spray'],
        ['orangeball', 'apple', 'whiteball', 'lotion', 'spray', 'cup'],
        ['lotion', 'orangeball', 'cup', 'apple', 'spray', 'whiteball'],
        ['apple', 'orangeball', 'whiteball', 'spray', 'lotion', 'cup'],
        ['orangeball', 'lotion', 'apple', 'whiteball', 'spray', 'cup'],
        ['lotion', 'cup', 'apple', 'whiteball', 'spray', 'orangeball'],
        ['apple', 'orangeball', 'cup', 'spray', 'lotion', 'whiteball'],
        ['apple', 'whiteball', 'cup', 'spray', 'lotion', 'orangeball'],
        ['lotion', 'orangeball', 'cup', 'apple', 'whiteball', 'spray'],
        ['cup', 'lotion', 'orangeball', 'spray', 'whiteball', 'apple'],
        ['lotion', 'orangeball', 'apple', 'spray', 'cup', 'whiteball'],
        ['cup', 'lotion', 'apple', 'whiteball', 'spray', 'orangeball'],
        ['cup', 'orangeball', 'whiteball', 'spray', 'lotion', 'apple'],
        ['apple', 'orangeball', 'lotion', 'whiteball', 'cup', 'spray'],
        ['apple', 'cup', 'orangeball', 'spray', 'whiteball', 'lotion'],
        ['cup', 'whiteball', 'orangeball', 'lotion', 'apple', 'spray'],
        ['apple', 'orangeball', 'cup', 'whiteball', 'lotion', 'spray'],
        ['apple', 'orangeball', 'cup', 'whiteball', 'spray', 'lotion'],
        ['whiteball', 'orangeball', 'apple', 'cup', 'spray', 'lotion'],
        ['cup', 'apple', 'orangeball', 'lotion', 'spray', 'whiteball'],
        ['orangeball', 'lotion', 'whiteball', 'apple', 'cup', 'spray'],
        ['orangeball', 'lotion', 'apple', 'spray', 'whiteball', 'cup'],
        ['whiteball', 'orangeball', 'apple', 'cup', 'lotion', 'spray'],
        ['orangeball', 'whiteball', 'lotion', 'apple', 'spray', 'cup'],
        ['lotion', 'apple', 'cup', 'whiteball', 'spray', 'orangeball'],
        ['orangeball', 'whiteball', 'apple', 'lotion', 'cup', 'spray'],
        ['orangeball', 'apple', 'lotion', 'whiteball', 'cup', 'spray'],
        ['lotion', 'cup', 'orangeball', 'apple', 'whiteball', 'spray'],
        ['lotion', 'whiteball', 'orangeball', 'cup', 'apple', 'spray'],
        ['whiteball', 'lotion', 'cup', 'spray', 'apple', 'orangeball'],
        ['lotion', 'cup', 'orangeball', 'spray', 'apple', 'whiteball'],
        ['whiteball', 'cup', 'apple', 'spray', 'lotion', 'orangeball'],
        ['cup', 'orangeball', 'whiteball', 'apple', 'lotion', 'spray'],
        ['whiteball', 'cup', 'orangeball', 'spray', 'apple', 'lotion'],
        ['cup', 'apple', 'orangeball', 'whiteball', 'lotion', 'spray'],
        ['orangeball', 'apple', 'whiteball', 'spray', 'lotion', 'cup'],
        ['lotion', 'orangeball', 'cup', 'spray', 'whiteball', 'apple'],
        ['cup', 'apple', 'lotion', 'whiteball', 'spray', 'orangeball'],
        ['lotion', 'whiteball', 'orangeball', 'cup', 'spray', 'apple'],
        ['orangeball', 'lotion', 'whiteball', 'cup', 'apple', 'spray'],
        ['whiteball', 'cup', 'orangeball', 'lotion', 'apple', 'spray'],
        ['apple', 'lotion', 'orangeball', 'whiteball', 'cup', 'spray'],
        ['cup', 'lotion', 'orangeball', 'spray', 'apple', 'whiteball'],
        ['lotion', 'whiteball', 'orangeball', 'spray', 'apple', 'cup'],
        ['whiteball', 'orangeball', 'cup', 'spray', 'apple', 'lotion'],
        ['lotion', 'orangeball', 'apple', 'whiteball', 'cup', 'spray'],
        ['orangeball', 'lotion', 'cup', 'whiteball', 'apple', 'spray'],
        ['lotion', 'apple', 'orangeball', 'spray', 'cup', 'whiteball'],
        ['orangeball', 'lotion', 'cup', 'whiteball', 'spray', 'apple'],
        ['apple', 'orangeball', 'whiteball', 'lotion', 'spray', 'cup'],
        ['cup', 'orangeball', 'apple', 'whiteball', 'spray', 'lotion'],
        ['whiteball', 'orangeball', 'apple', 'spray', 'lotion', 'cup'],
        ['orangeball', 'whiteball', 'cup', 'lotion', 'spray', 'apple'],
        ['lotion', 'orangeball', 'whiteball', 'cup', 'apple', 'spray'],
        ['orangeball', 'cup', 'apple', 'spray', 'lotion', 'whiteball'],
        ['whiteball', 'apple', 'cup', 'lotion', 'spray', 'orangeball'],
        ['orangeball', 'whiteball', 'lotion', 'cup', 'spray', 'apple'],
        ['lotion', 'cup', 'orangeball', 'whiteball', 'apple', 'spray'],
        ['lotion', 'orangeball', 'cup', 'spray', 'apple', 'whiteball'],
        ['orangeball', 'lotion', 'cup', 'apple', 'spray', 'whiteball'],
        ['orangeball', 'whiteball', 'cup', 'apple', 'lotion', 'spray'],
        ['lotion', 'orangeball', 'whiteball', 'apple', 'spray', 'cup'],
        ['apple', 'orangeball', 'cup', 'lotion', 'spray', 'whiteball'],
        ['orangeball', 'whiteball', 'lotion', 'spray', 'cup', 'apple'],
        ['whiteball', 'lotion', 'orangeball', 'spray', 'apple', 'cup'],
        ['lotion', 'whiteball', 'apple', 'cup', 'spray', 'orangeball'],
        ['orangeball', 'cup', 'whiteball', 'lotion', 'apple', 'spray'],
        ['orangeball', 'apple', 'lotion', 'spray', 'cup', 'whiteball'],
        ['orangeball', 'apple', 'cup', 'whiteball', 'lotion', 'spray'],
        ['lotion', 'apple', 'whiteball', 'cup', 'spray', 'orangeball'],
        ['apple', 'orangeball', 'whiteball', 'cup', 'spray', 'lotion'],
        ['apple', 'cup', 'lotion', 'spray', 'whiteball', 'orangeball'],
        ['lotion', 'orangeball', 'whiteball', 'apple', 'cup', 'spray'],
        ['orangeball', 'cup', 'apple', 'whiteball', 'spray', 'lotion'],
        ['orangeball', 'apple', 'lotion', 'cup', 'spray', 'whiteball'],
        ['apple', 'lotion', 'orangeball', 'cup', 'spray', 'whiteball'],
        ['apple', 'whiteball', 'orangeball', 'cup', 'lotion', 'spray'],
        ['whiteball', 'apple', 'orangeball', 'lotion', 'spray', 'cup'],
        ['lotion', 'cup', 'whiteball', 'apple', 'spray', 'orangeball'],
        ['cup', 'lotion', 'orangeball', 'apple', 'spray', 'whiteball'],
        ['orangeball', 'cup', 'lotion', 'spray', 'whiteball', 'apple'],
        ['orangeball', 'apple', 'cup', 'spray', 'whiteball', 'lotion'],
        ['lotion', 'whiteball', 'cup', 'apple', 'spray', 'orangeball'],
        ['orangeball', 'apple', 'cup', 'whiteball', 'spray', 'lotion'],
        ['orangeball', 'cup', 'apple', 'whiteball', 'lotion', 'spray'],
        ['orangeball', 'whiteball', 'apple', 'lotion', 'spray', 'cup'],
        ['orangeball', 'whiteball', 'cup', 'spray', 'apple', 'lotion'],
        ['whiteball', 'orangeball', 'cup', 'lotion', 'spray', 'apple'],
        ['cup', 'apple', 'whiteball', 'lotion', 'spray', 'orangeball'],
        ['orangeball', 'lotion', 'whiteball', 'cup', 'spray', 'apple'],
        ['orangeball', 'lotion', 'cup', 'spray', 'whiteball', 'apple'],
        ['orangeball', 'apple', 'lotion', 'spray', 'whiteball', 'cup'],
        ['apple', 'cup', 'lotion', 'whiteball', 'spray', 'orangeball'],
        ['cup', 'whiteball', 'orangeball', 'apple', 'lotion', 'spray'],
        ['whiteball', 'lotion', 'orangeball', 'cup', 'spray', 'apple'],
        ['lotion', 'cup', 'apple', 'spray', 'whiteball', 'orangeball'],
        ['whiteball', 'orangeball', 'cup', 'apple', 'lotion', 'spray'],
        ['cup', 'lotion', 'orangeball', 'apple', 'whiteball', 'spray'],
        ['orangeball', 'cup', 'whiteball', 'apple', 'spray', 'lotion'],
        ['whiteball', 'orangeball', 'apple', 'spray', 'cup', 'lotion'],
        ['orangeball', 'cup', 'apple', 'lotion', 'spray', 'whiteball'],
        ['orangeball', 'whiteball', 'cup', 'lotion', 'apple', 'spray'],
        ['orangeball', 'cup', 'lotion', 'whiteball', 'apple', 'spray'],
        ['whiteball', 'orangeball', 'lotion', 'cup', 'apple', 'spray'],
        ['whiteball', 'apple', 'lotion', 'cup', 'spray', 'orangeball'],
        ['lotion', 'whiteball', 'orangeball', 'apple', 'spray', 'cup'],
        ['whiteball', 'apple', 'orangeball', 'cup', 'spray', 'lotion'],
        ['apple', 'lotion', 'orangeball', 'spray', 'cup', 'whiteball'],
        ['orangeball', 'lotion', 'whiteball', 'spray', 'apple', 'cup'],
        ['apple', 'orangeball', 'lotion', 'cup', 'whiteball', 'spray'],
        ['apple', 'cup', 'orangeball', 'lotion', 'whiteball', 'spray'],
        ['cup', 'apple', 'whiteball', 'spray', 'lotion', 'orangeball'],
        ['orangeball', 'cup', 'apple', 'lotion', 'whiteball', 'spray'],
        ['orangeball', 'whiteball', 'apple', 'spray', 'cup', 'lotion'],
        ['apple', 'cup', 'whiteball', 'spray', 'lotion', 'orangeball'],
        ['whiteball', 'lotion', 'apple', 'cup', 'spray', 'orangeball'],
        ['apple', 'cup', 'orangeball', 'whiteball', 'spray', 'lotion'],
        ['whiteball', 'lotion', 'orangeball', 'spray', 'cup', 'apple'],
        ['cup', 'lotion', 'orangeball', 'whiteball', 'spray', 'apple'],
        ['apple', 'lotion', 'orangeball', 'cup', 'whiteball', 'spray'],
        ['lotion', 'apple', 'orangeball', 'spray', 'whiteball', 'cup'],
        ['cup', 'orangeball', 'lotion', 'apple', 'whiteball', 'spray'],
        ['lotion', 'cup', 'orangeball', 'apple', 'spray', 'whiteball'],
        ['apple', 'orangeball', 'lotion', 'whiteball', 'spray', 'cup'],
        ['whiteball', 'orangeball', 'lotion', 'spray', 'cup', 'apple'],
        ['orangeball', 'cup', 'lotion', 'whiteball', 'spray', 'apple'],
        ['orangeball', 'whiteball', 'lotion', 'apple', 'cup', 'spray'],
        ['apple', 'whiteball', 'orangeball', 'lotion', 'cup', 'spray'],
        ['cup', 'orangeball', 'whiteball', 'spray', 'apple', 'lotion'],
        ['cup', 'apple', 'orangeball', 'spray', 'lotion', 'whiteball'],
        ['cup', 'whiteball', 'lotion', 'apple', 'spray', 'orangeball'],
        ['lotion', 'apple', 'orangeball', 'whiteball', 'cup', 'spray'],
        ['apple', 'lotion', 'cup', 'whiteball', 'spray', 'orangeball'],
        ['orangeball', 'whiteball', 'apple', 'spray', 'lotion', 'cup'],
        ['cup', 'apple', 'orangeball', 'spray', 'whiteball', 'lotion'],
        ['cup', 'whiteball', 'apple', 'lotion', 'spray', 'orangeball'],
        ['cup', 'orangeball', 'apple', 'whiteball', 'lotion', 'spray'],
        ['lotion', 'cup', 'orangeball', 'whiteball', 'spray', 'apple'],
        ['whiteball', 'apple', 'cup', 'spray', 'lotion', 'orangeball'],
        ['apple', 'cup', 'orangeball', 'spray', 'lotion', 'whiteball'],
        ['orangeball', 'lotion', 'cup', 'apple', 'whiteball', 'spray'],
        ['whiteball', 'apple', 'orangeball', 'lotion', 'cup', 'spray'],
        ['apple', 'orangeball', 'lotion', 'spray', 'cup', 'whiteball'],
        ['orangeball', 'apple', 'lotion', 'cup', 'whiteball', 'spray'],
        ['orangeball', 'cup', 'whiteball', 'lotion', 'spray', 'apple'],
        ['orangeball', 'lotion', 'whiteball', 'spray', 'cup', 'apple'],
        ['cup', 'lotion', 'whiteball', 'apple', 'spray', 'orangeball'],
        ['apple', 'whiteball', 'orangeball', 'lotion', 'spray', 'cup'],
        ['whiteball', 'cup', 'orangeball', 'apple', 'lotion', 'spray'],
        ['lotion', 'apple', 'orangeball', 'cup', 'whiteball', 'spray'],
        ['orangeball', 'apple', 'whiteball', 'lotion', 'cup', 'spray'],
        ['lotion', 'orangeball', 'whiteball', 'cup', 'spray', 'apple'],
        ['whiteball', 'cup', 'orangeball', 'spray', 'lotion', 'apple'],
        ['lotion', 'apple', 'orangeball', 'whiteball', 'spray', 'cup'],
        ['lotion', 'apple', 'whiteball', 'spray', 'cup', 'orangeball'],
        ['orangeball', 'whiteball', 'lotion', 'spray', 'apple', 'cup'],
        ['whiteball', 'lotion', 'cup', 'apple', 'spray', 'orangeball'],
        ['orangeball', 'cup', 'lotion', 'apple', 'whiteball', 'spray'],
        ['cup', 'whiteball', 'orangeball', 'apple', 'spray', 'lotion'],
        ['cup', 'apple', 'orangeball', 'whiteball', 'spray', 'lotion'],
        ['orangeball', 'cup', 'apple', 'spray', 'whiteball', 'lotion'],
        ['apple', 'cup', 'whiteball', 'lotion', 'spray', 'orangeball'],
        ['apple', 'orangeball', 'whiteball', 'lotion', 'cup', 'spray'],
        ['apple', 'whiteball', 'orangeball', 'spray', 'lotion', 'cup'],
        ['lotion', 'whiteball', 'orangeball', 'spray', 'cup', 'apple'],
        ['lotion', 'orangeball', 'whiteball', 'spray', 'apple', 'cup'],
        ['whiteball', 'lotion', 'apple', 'spray', 'cup', 'orangeball'],
        ['orangeball', 'lotion', 'whiteball', 'apple', 'spray', 'cup'],
        ['orangeball', 'whiteball', 'cup', 'spray', 'lotion', 'apple'],
        ['whiteball', 'orangeball', 'cup', 'spray', 'lotion', 'apple'],
        ['lotion', 'orangeball', 'apple', 'cup', 'spray', 'whiteball'],
        ['cup', 'orangeball', 'whiteball', 'lotion', 'apple', 'spray'],
        ['lotion', 'orangeball', 'apple', 'spray', 'whiteball', 'cup'],
        ['cup', 'whiteball', 'lotion', 'spray', 'apple', 'orangeball'],
        ['orangeball', 'cup', 'lotion', 'spray', 'apple', 'whiteball'],
        ['apple', 'whiteball', 'lotion', 'cup', 'spray', 'orangeball'],
        ['whiteball', 'apple', 'orangeball', 'spray', 'cup', 'lotion'],
        ['cup', 'whiteball', 'orangeball', 'spray', 'apple', 'lotion'],
        ['orangeball', 'lotion', 'apple', 'whiteball', 'cup', 'spray'],
        ['whiteball', 'orangeball', 'lotion', 'spray', 'apple', 'cup'],
        ['whiteball', 'cup', 'lotion', 'spray', 'apple', 'orangeball'],
        ['apple', 'cup', 'orangeball', 'whiteball', 'lotion', 'spray'],
        ['orangeball', 'lotion', 'apple', 'cup', 'spray', 'whiteball'],
        ['apple', 'lotion', 'cup', 'spray', 'whiteball', 'orangeball'],
        ['cup', 'orangeball', 'lotion', 'spray', 'apple', 'whiteball'],
        ['whiteball', 'orangeball', 'cup', 'apple', 'spray', 'lotion'],
        ['cup', 'lotion', 'whiteball', 'spray', 'apple', 'orangeball'],
        ['cup', 'orangeball', 'lotion', 'spray', 'whiteball', 'apple'],
        ['lotion', 'cup', 'orangeball', 'spray', 'whiteball', 'apple'],
        ['lotion', 'orangeball', 'cup', 'whiteball', 'apple', 'spray'],
        ['apple', 'whiteball', 'cup', 'lotion', 'spray', 'orangeball'],
        ['cup', 'lotion', 'apple', 'spray', 'whiteball', 'orangeball'],
        ['apple', 'lotion', 'orangeball', 'spray', 'whiteball', 'cup'],
        ['whiteball', 'cup', 'orangeball', 'apple', 'spray', 'lotion'],
        ['whiteball', 'apple', 'orangeball', 'spray', 'lotion', 'cup'],
        ['whiteball', 'cup', 'lotion', 'apple', 'spray', 'orangeball'],
        ['apple', 'orangeball', 'cup', 'spray', 'whiteball', 'lotion'],
        ['whiteball', 'apple', 'orangeball', 'cup', 'lotion', 'spray'],
        ['apple', 'whiteball', 'orangeball', 'spray', 'cup', 'lotion'],
        ['cup', 'apple', 'orangeball', 'lotion', 'whiteball', 'spray'],
        ['cup', 'orangeball', 'apple', 'lotion', 'whiteball', 'spray'],
        ['whiteball', 'cup', 'orangeball', 'lotion', 'spray', 'apple'],
        ['orangeball', 'whiteball', 'apple', 'cup', 'spray', 'lotion'],
        ['whiteball', 'orangeball', 'apple', 'lotion', 'spray', 'cup'],
        ['cup', 'orangeball', 'whiteball', 'apple', 'spray', 'lotion'],
        ['apple', 'whiteball', 'lotion', 'spray', 'cup', 'orangeball'],
        ['orangeball', 'cup', 'whiteball', 'spray', 'apple', 'lotion'],
        ['orangeball', 'apple', 'cup', 'lotion', 'whiteball', 'spray'],
        ['cup', 'apple', 'lotion', 'spray', 'whiteball', 'orangeball'],
        ['orangeball', 'apple', 'whiteball', 'spray', 'cup', 'lotion'],
        ['cup', 'orangeball', 'whiteball', 'lotion', 'spray', 'apple'],
        ['orangeball', 'whiteball', 'apple', 'cup', 'lotion', 'spray'],
        ['whiteball', 'lotion', 'orangeball', 'apple', 'spray', 'cup'],
        ['whiteball', 'lotion', 'orangeball', 'apple', 'cup', 'spray']
    ];

    var supportObjectRotation = [
        ['brush', 'hammer', 'book', 'shoe', 'duck', 'tissues'],
        ['tissues', 'duck', 'shoe', 'hammer', 'brush', 'book'],
        ['brush', 'book', 'hammer', 'shoe', 'duck', 'tissues'],
        ['duck', 'brush', 'hammer', 'book', 'tissues', 'shoe'],
        ['tissues', 'duck', 'shoe', 'book', 'brush', 'hammer'],
        ['brush', 'duck', 'book', 'shoe', 'tissues', 'hammer'],
        ['duck', 'brush', 'tissues', 'book', 'shoe', 'hammer'],
        ['brush', 'shoe', 'tissues', 'duck', 'book', 'hammer'],
        ['book', 'brush', 'hammer', 'shoe', 'tissues', 'duck'],
        ['duck', 'brush', 'book', 'tissues', 'shoe', 'hammer'],
        ['duck', 'tissues', 'brush', 'shoe', 'hammer', 'book'],
        ['brush', 'book', 'duck', 'hammer', 'tissues', 'shoe'],
        ['hammer', 'book', 'brush', 'shoe', 'duck', 'tissues'],
        ['duck', 'shoe', 'hammer', 'book', 'tissues', 'brush'],
        ['duck', 'tissues', 'brush', 'shoe', 'book', 'hammer'],
        ['book', 'shoe', 'duck', 'hammer', 'brush', 'tissues'],
        ['duck', 'brush', 'shoe', 'hammer', 'book', 'tissues'],
        ['book', 'tissues', 'duck', 'shoe', 'hammer', 'brush'],
        ['book', 'duck', 'brush', 'tissues', 'hammer', 'shoe'],
        ['brush', 'tissues', 'hammer', 'shoe', 'book', 'duck'],
        ['brush', 'tissues', 'duck', 'hammer', 'shoe', 'book'],
        ['tissues', 'duck', 'book', 'hammer', 'brush', 'shoe'],
        ['duck', 'brush', 'book', 'tissues', 'hammer', 'shoe'],
        ['brush', 'duck', 'shoe', 'book', 'tissues', 'hammer'],
        ['hammer', 'tissues', 'shoe', 'duck', 'book', 'brush'],
        ['brush', 'book', 'duck', 'tissues', 'shoe', 'hammer'],
        ['book', 'brush', 'hammer', 'tissues', 'duck', 'shoe'],
        ['duck', 'shoe', 'hammer', 'tissues', 'brush', 'book'],
        ['brush', 'tissues', 'hammer', 'book', 'duck', 'shoe'],
        ['tissues', 'duck', 'brush', 'shoe', 'hammer', 'book'],
        ['shoe', 'hammer', 'book', 'brush', 'duck', 'tissues'],
        ['duck', 'hammer', 'shoe', 'brush', 'tissues', 'book'],
        ['tissues', 'hammer', 'book', 'shoe', 'brush', 'duck'],
        ['shoe', 'duck', 'brush', 'book', 'hammer', 'tissues'],
        ['hammer', 'duck', 'shoe', 'brush', 'tissues', 'book'],
        ['tissues', 'hammer', 'brush', 'shoe', 'duck', 'book'],
        ['book', 'duck', 'brush', 'shoe', 'tissues', 'hammer'],
        ['book', 'duck', 'hammer', 'shoe', 'brush', 'tissues'],
        ['duck', 'tissues', 'hammer', 'shoe', 'book', 'brush'],
        ['hammer', 'shoe', 'duck', 'tissues', 'book', 'brush'],
        ['tissues', 'brush', 'hammer', 'book', 'duck', 'shoe'],
        ['hammer', 'tissues', 'brush', 'duck', 'book', 'shoe'],
        ['hammer', 'tissues', 'duck', 'shoe', 'brush', 'book'],
        ['shoe', 'duck', 'brush', 'book', 'tissues', 'hammer'],
        ['brush', 'duck', 'tissues', 'shoe', 'book', 'hammer'],
        ['tissues', 'hammer', 'brush', 'duck', 'shoe', 'book'],
        ['duck', 'tissues', 'brush', 'book', 'hammer', 'shoe'],
        ['brush', 'duck', 'book', 'tissues', 'hammer', 'shoe'],
        ['shoe', 'book', 'hammer', 'brush', 'duck', 'tissues'],
        ['shoe', 'book', 'brush', 'tissues', 'duck', 'hammer'],
        ['shoe', 'duck', 'hammer', 'brush', 'tissues', 'book'],
        ['tissues', 'shoe', 'brush', 'book', 'hammer', 'duck'],
        ['tissues', 'book', 'duck', 'brush', 'shoe', 'hammer'],
        ['shoe', 'book', 'duck', 'brush', 'hammer', 'tissues'],
        ['book', 'tissues', 'shoe', 'duck', 'brush', 'hammer'],
        ['duck', 'tissues', 'shoe', 'hammer', 'book', 'brush'],
        ['hammer', 'brush', 'tissues', 'duck', 'book', 'shoe'],
        ['shoe', 'book', 'tissues', 'hammer', 'duck', 'brush'],
        ['duck', 'hammer', 'brush', 'shoe', 'tissues', 'book'],
        ['book', 'hammer', 'shoe', 'tissues', 'brush', 'duck'],
        ['duck', 'book', 'tissues', 'hammer', 'shoe', 'brush'],
        ['shoe', 'hammer', 'duck', 'tissues', 'brush', 'book'],
        ['brush', 'shoe', 'hammer', 'duck', 'tissues', 'book'],
        ['duck', 'shoe', 'book', 'brush', 'hammer', 'tissues'],
        ['tissues', 'book', 'shoe', 'hammer', 'brush', 'duck'],
        ['hammer', 'tissues', 'duck', 'book', 'brush', 'shoe'],
        ['brush', 'shoe', 'hammer', 'book', 'tissues', 'duck'],
        ['shoe', 'hammer', 'brush', 'duck', 'book', 'tissues'],
        ['shoe', 'tissues', 'duck', 'book', 'hammer', 'brush'],
        ['shoe', 'duck', 'book', 'hammer', 'brush', 'tissues'],
        ['hammer', 'shoe', 'book', 'tissues', 'brush', 'duck'],
        ['shoe', 'book', 'brush', 'tissues', 'hammer', 'duck'],
        ['shoe', 'hammer', 'duck', 'book', 'tissues', 'brush'],
        ['hammer', 'duck', 'shoe', 'brush', 'book', 'tissues'],
        ['tissues', 'brush', 'duck', 'book', 'hammer', 'shoe'],
        ['tissues', 'duck', 'hammer', 'brush', 'book', 'shoe'],
        ['brush', 'hammer', 'duck', 'book', 'tissues', 'shoe'],
        ['book', 'duck', 'shoe', 'hammer', 'tissues', 'brush'],
        ['duck', 'shoe', 'hammer', 'book', 'brush', 'tissues'],
        ['brush', 'tissues', 'shoe', 'hammer', 'book', 'duck'],
        ['duck', 'shoe', 'hammer', 'brush', 'tissues', 'book'],
        ['book', 'duck', 'tissues', 'hammer', 'shoe', 'brush'],
        ['shoe', 'tissues', 'hammer', 'duck', 'book', 'brush'],
        ['brush', 'shoe', 'book', 'duck', 'tissues', 'hammer'],
        ['hammer', 'brush', 'book', 'tissues', 'shoe', 'duck'],
        ['book', 'tissues', 'duck', 'hammer', 'brush', 'shoe'],
        ['hammer', 'book', 'brush', 'tissues', 'shoe', 'duck'],
        ['shoe', 'hammer', 'book', 'brush', 'tissues', 'duck'],
        ['brush', 'duck', 'hammer', 'tissues', 'book', 'shoe'],
        ['brush', 'hammer', 'duck', 'shoe', 'book', 'tissues'],
        ['book', 'hammer', 'brush', 'tissues', 'shoe', 'duck'],
        ['brush', 'duck', 'hammer', 'book', 'tissues', 'shoe'],
        ['shoe', 'book', 'brush', 'duck', 'tissues', 'hammer'],
        ['brush', 'hammer', 'duck', 'book', 'shoe', 'tissues'],
        ['hammer', 'brush', 'duck', 'shoe', 'tissues', 'book'],
        ['brush', 'shoe', 'duck', 'tissues', 'book', 'hammer'],
        ['hammer', 'book', 'duck', 'shoe', 'brush', 'tissues'],
        ['shoe', 'book', 'tissues', 'brush', 'duck', 'hammer'],
        ['hammer', 'book', 'brush', 'shoe', 'tissues', 'duck'],
        ['tissues', 'brush', 'hammer', 'shoe', 'duck', 'book'],
        ['book', 'shoe', 'tissues', 'duck', 'hammer', 'brush'],
        ['hammer', 'brush', 'book', 'duck', 'tissues', 'shoe'],
        ['shoe', 'brush', 'duck', 'book', 'hammer', 'tissues'],
        ['shoe', 'brush', 'duck', 'tissues', 'book', 'hammer'],
        ['tissues', 'duck', 'shoe', 'brush', 'book', 'hammer'],
        ['book', 'hammer', 'brush', 'tissues', 'duck', 'shoe'],
        ['tissues', 'duck', 'hammer', 'book', 'brush', 'shoe'],
        ['tissues', 'book', 'duck', 'shoe', 'hammer', 'brush'],
        ['shoe', 'brush', 'hammer', 'tissues', 'duck', 'book'],
        ['duck', 'tissues', 'hammer', 'shoe', 'brush', 'book'],
        ['tissues', 'book', 'hammer', 'shoe', 'brush', 'duck'],
        ['book', 'duck', 'tissues', 'hammer', 'brush', 'shoe'],
        ['hammer', 'duck', 'shoe', 'tissues', 'book', 'brush'],
        ['brush', 'book', 'duck', 'shoe', 'hammer', 'tissues'],
        ['brush', 'book', 'tissues', 'shoe', 'duck', 'hammer'],
        ['book', 'tissues', 'hammer', 'brush', 'duck', 'shoe'],
        ['brush', 'duck', 'hammer', 'tissues', 'shoe', 'book'],
        ['book', 'tissues', 'hammer', 'shoe', 'brush', 'duck'],
        ['tissues', 'hammer', 'book', 'duck', 'brush', 'shoe'],
        ['brush', 'book', 'tissues', 'shoe', 'hammer', 'duck'],
        ['tissues', 'shoe', 'hammer', 'duck', 'brush', 'book'],
        ['tissues', 'duck', 'book', 'brush', 'shoe', 'hammer'],
        ['hammer', 'brush', 'book', 'shoe', 'tissues', 'duck'],
        ['book', 'brush', 'tissues', 'hammer', 'duck', 'shoe'],
        ['tissues', 'hammer', 'book', 'brush', 'shoe', 'duck'],
        ['brush', 'tissues', 'shoe', 'hammer', 'duck', 'book'],
        ['book', 'shoe', 'hammer', 'tissues', 'duck', 'brush'],
        ['shoe', 'duck', 'tissues', 'brush', 'hammer', 'book'],
        ['book', 'duck', 'brush', 'tissues', 'shoe', 'hammer'],
        ['tissues', 'hammer', 'shoe', 'brush', 'duck', 'book'],
        ['tissues', 'brush', 'duck', 'shoe', 'book', 'hammer'],
        ['tissues', 'shoe', 'book', 'brush', 'duck', 'hammer'],
        ['book', 'tissues', 'duck', 'shoe', 'brush', 'hammer'],
        ['book', 'duck', 'tissues', 'brush', 'shoe', 'hammer'],
        ['brush', 'hammer', 'book', 'duck', 'tissues', 'shoe'],
        ['brush', 'shoe', 'hammer', 'duck', 'book', 'tissues'],
        ['book', 'shoe', 'duck', 'tissues', 'hammer', 'brush'],
        ['tissues', 'brush', 'book', 'shoe', 'duck', 'hammer'],
        ['hammer', 'brush', 'tissues', 'book', 'shoe', 'duck'],
        ['brush', 'shoe', 'duck', 'book', 'hammer', 'tissues'],
        ['duck', 'book', 'hammer', 'shoe', 'tissues', 'brush'],
        ['tissues', 'hammer', 'shoe', 'book', 'brush', 'duck'],
        ['book', 'tissues', 'brush', 'duck', 'hammer', 'shoe'],
        ['hammer', 'book', 'shoe', 'duck', 'tissues', 'brush'],
        ['tissues', 'duck', 'brush', 'hammer', 'book', 'shoe'],
        ['book', 'brush', 'duck', 'tissues', 'shoe', 'hammer'],
        ['hammer', 'shoe', 'brush', 'duck', 'tissues', 'book'],
        ['hammer', 'shoe', 'duck', 'book', 'tissues', 'brush'],
        ['duck', 'book', 'hammer', 'tissues', 'brush', 'shoe'],
        ['duck', 'tissues', 'book', 'brush', 'shoe', 'hammer'],
        ['shoe', 'tissues', 'hammer', 'brush', 'book', 'duck'],
        ['hammer', 'tissues', 'duck', 'shoe', 'book', 'brush'],
        ['shoe', 'tissues', 'book', 'brush', 'duck', 'hammer'],
        ['brush', 'hammer', 'shoe', 'tissues', 'book', 'duck'],
        ['duck', 'brush', 'hammer', 'shoe', 'tissues', 'book'],
        ['brush', 'tissues', 'hammer', 'shoe', 'duck', 'book'],
        ['hammer', 'shoe', 'brush', 'tissues', 'book', 'duck'],
        ['tissues', 'duck', 'brush', 'book', 'shoe', 'hammer'],
        ['book', 'hammer', 'brush', 'shoe', 'tissues', 'duck'],
        ['book', 'tissues', 'shoe', 'hammer', 'duck', 'brush'],
        ['hammer', 'shoe', 'brush', 'book', 'tissues', 'duck'],
        ['tissues', 'shoe', 'book', 'hammer', 'brush', 'duck'],
        ['duck', 'book', 'hammer', 'tissues', 'shoe', 'brush'],
        ['shoe', 'brush', 'tissues', 'duck', 'hammer', 'book'],
        ['duck', 'shoe', 'brush', 'tissues', 'hammer', 'book'],
        ['hammer', 'tissues', 'brush', 'shoe', 'duck', 'book'],
        ['shoe', 'tissues', 'hammer', 'brush', 'duck', 'book'],
        ['book', 'brush', 'duck', 'shoe', 'tissues', 'hammer'],
        ['book', 'brush', 'shoe', 'duck', 'tissues', 'hammer'],
        ['hammer', 'shoe', 'brush', 'duck', 'book', 'tissues'],
        ['hammer', 'shoe', 'duck', 'tissues', 'brush', 'book'],
        ['brush', 'tissues', 'duck', 'book', 'hammer', 'shoe'],
        ['duck', 'brush', 'hammer', 'tissues', 'shoe', 'book'],
        ['shoe', 'hammer', 'tissues', 'duck', 'brush', 'book'],
        ['brush', 'duck', 'tissues', 'hammer', 'book', 'shoe'],
        ['brush', 'duck', 'tissues', 'book', 'hammer', 'shoe'],
        ['shoe', 'hammer', 'brush', 'duck', 'tissues', 'book'],
        ['book', 'shoe', 'hammer', 'duck', 'tissues', 'brush'],
        ['book', 'tissues', 'hammer', 'shoe', 'duck', 'brush'],
        ['shoe', 'tissues', 'hammer', 'book', 'brush', 'duck'],
        ['shoe', 'duck', 'book', 'hammer', 'tissues', 'brush'],
        ['tissues', 'hammer', 'book', 'duck', 'shoe', 'brush'],
        ['duck', 'brush', 'shoe', 'book', 'tissues', 'hammer'],
        ['brush', 'duck', 'tissues', 'hammer', 'shoe', 'book'],
        ['shoe', 'hammer', 'book', 'duck', 'brush', 'tissues'],
        ['tissues', 'brush', 'shoe', 'book', 'duck', 'hammer'],
        ['hammer', 'tissues', 'book', 'brush', 'shoe', 'duck'],
        ['shoe', 'duck', 'book', 'brush', 'hammer', 'tissues'],
        ['brush', 'book', 'duck', 'tissues', 'hammer', 'shoe'],
        ['tissues', 'brush', 'shoe', 'hammer', 'duck', 'book'],
        ['hammer', 'brush', 'shoe', 'duck', 'tissues', 'book'],
        ['shoe', 'book', 'duck', 'tissues', 'brush', 'hammer'],
        ['book', 'duck', 'shoe', 'brush', 'tissues', 'hammer'],
        ['book', 'shoe', 'brush', 'tissues', 'hammer', 'duck'],
        ['book', 'shoe', 'brush', 'duck', 'tissues', 'hammer'],
        ['hammer', 'duck', 'shoe', 'book', 'tissues', 'brush'],
        ['book', 'tissues', 'shoe', 'hammer', 'brush', 'duck'],
        ['shoe', 'duck', 'brush', 'tissues', 'hammer', 'book'],
        ['book', 'shoe', 'brush', 'duck', 'hammer', 'tissues'],
        ['shoe', 'book', 'hammer', 'duck', 'tissues', 'brush'],
        ['tissues', 'brush', 'duck', 'shoe', 'hammer', 'book'],
        ['shoe', 'brush', 'duck', 'book', 'tissues', 'hammer'],
        ['tissues', 'duck', 'brush', 'hammer', 'shoe', 'book'],
        ['shoe', 'hammer', 'book', 'tissues', 'duck', 'brush'],
        ['brush', 'book', 'tissues', 'hammer', 'duck', 'shoe'],
        ['book', 'brush', 'tissues', 'hammer', 'shoe', 'duck'],
        ['shoe', 'duck', 'tissues', 'brush', 'book', 'hammer'],
        ['brush', 'duck', 'shoe', 'tissues', 'book', 'hammer'],
        ['book', 'duck', 'tissues', 'brush', 'hammer', 'shoe'],
        ['tissues', 'brush', 'shoe', 'book', 'hammer', 'duck'],
        ['tissues', 'duck', 'shoe', 'book', 'hammer', 'brush'],
        ['book', 'shoe', 'brush', 'hammer', 'duck', 'tissues'],
        ['shoe', 'hammer', 'book', 'tissues', 'brush', 'duck'],
        ['duck', 'book', 'hammer', 'brush', 'shoe', 'tissues'],
        ['brush', 'duck', 'hammer', 'book', 'shoe', 'tissues'],
        ['duck', 'book', 'hammer', 'brush', 'tissues', 'shoe'],
        ['tissues', 'brush', 'book', 'shoe', 'hammer', 'duck'],
        ['brush', 'tissues', 'shoe', 'book', 'duck', 'hammer'],
        ['brush', 'duck', 'shoe', 'hammer', 'tissues', 'book'],
        ['book', 'brush', 'duck', 'hammer', 'shoe', 'tissues'],
        ['shoe', 'brush', 'book', 'tissues', 'hammer', 'duck'],
        ['tissues', 'brush', 'duck', 'book', 'shoe', 'hammer'],
        ['tissues', 'duck', 'book', 'hammer', 'shoe', 'brush'],
        ['duck', 'book', 'shoe', 'tissues', 'brush', 'hammer'],
        ['duck', 'tissues', 'brush', 'hammer', 'shoe', 'book'],
        ['duck', 'hammer', 'book', 'tissues', 'shoe', 'brush'],
        ['tissues', 'duck', 'hammer', 'shoe', 'book', 'brush'],
        ['brush', 'hammer', 'duck', 'shoe', 'tissues', 'book'],
        ['duck', 'shoe', 'brush', 'tissues', 'book', 'hammer'],
        ['brush', 'tissues', 'book', 'duck', 'shoe', 'hammer'],
        ['hammer', 'duck', 'brush', 'shoe', 'tissues', 'book'],
        ['brush', 'hammer', 'duck', 'tissues', 'book', 'shoe'],
        ['tissues', 'duck', 'book', 'brush', 'hammer', 'shoe'],
        ['book', 'duck', 'brush', 'shoe', 'hammer', 'tissues'],
        ['duck', 'hammer', 'brush', 'tissues', 'shoe', 'book'],
        ['hammer', 'duck', 'brush', 'tissues', 'shoe', 'book'],
        ['shoe', 'tissues', 'brush', 'duck', 'book', 'hammer'],
        ['tissues', 'shoe', 'hammer', 'brush', 'duck', 'book'],
        ['duck', 'brush', 'shoe', 'book', 'hammer', 'tissues'],
        ['hammer', 'shoe', 'tissues', 'book', 'brush', 'duck'],
        ['book', 'duck', 'tissues', 'shoe', 'brush', 'hammer'],
        ['shoe', 'brush', 'hammer', 'tissues', 'book', 'duck'],
        ['shoe', 'book', 'tissues', 'hammer', 'brush', 'duck'],
        ['duck', 'book', 'brush', 'hammer', 'shoe', 'tissues'],
        ['duck', 'brush', 'shoe', 'tissues', 'book', 'hammer'],
        ['duck', 'tissues', 'book', 'hammer', 'brush', 'shoe'],
        ['brush', 'duck', 'shoe', 'hammer', 'book', 'tissues'],
        ['brush', 'book', 'hammer', 'tissues', 'shoe', 'duck'],
        ['hammer', 'book', 'duck', 'shoe', 'tissues', 'brush'],
        ['shoe', 'tissues', 'book', 'hammer', 'duck', 'brush'],
        ['tissues', 'book', 'brush', 'duck', 'hammer', 'shoe'],
        ['tissues', 'duck', 'shoe', 'brush', 'hammer', 'book'],
        ['shoe', 'hammer', 'tissues', 'duck', 'book', 'brush'],
        ['shoe', 'book', 'tissues', 'duck', 'brush', 'hammer'],
        ['brush', 'hammer', 'duck', 'tissues', 'shoe', 'book'],
        ['book', 'tissues', 'brush', 'hammer', 'shoe', 'duck'],
        ['hammer', 'tissues', 'book', 'brush', 'duck', 'shoe'],
        ['tissues', 'brush', 'duck', 'hammer', 'book', 'shoe'],
        ['shoe', 'brush', 'duck', 'hammer', 'tissues', 'book'],
        ['brush', 'shoe', 'hammer', 'book', 'duck', 'tissues'],
        ['shoe', 'duck', 'tissues', 'book', 'brush', 'hammer'],
        ['hammer', 'shoe', 'book', 'tissues', 'duck', 'brush'],
        ['tissues', 'book', 'brush', 'duck', 'shoe', 'hammer'],
        ['tissues', 'book', 'shoe', 'brush', 'duck', 'hammer'],
        ['hammer', 'book', 'tissues', 'duck', 'shoe', 'brush'],
        ['brush', 'shoe', 'duck', 'hammer', 'book', 'tissues'],
        ['duck', 'shoe', 'brush', 'hammer', 'book', 'tissues'],
        ['book', 'duck', 'brush', 'hammer', 'shoe', 'tissues'],
        ['hammer', 'duck', 'book', 'tissues', 'shoe', 'brush'],
        ['tissues', 'shoe', 'brush', 'book', 'duck', 'hammer'],
        ['tissues', 'shoe', 'duck', 'brush', 'book', 'hammer'],
        ['duck', 'hammer', 'book', 'shoe', 'brush', 'tissues'],
        ['brush', 'shoe', 'tissues', 'book', 'duck', 'hammer'],
        ['book', 'tissues', 'hammer', 'duck', 'shoe', 'brush'],
        ['book', 'shoe', 'duck', 'brush', 'hammer', 'tissues'],
        ['tissues', 'shoe', 'brush', 'duck', 'book', 'hammer'],
        ['book', 'duck', 'shoe', 'tissues', 'hammer', 'brush'],
        ['brush', 'tissues', 'shoe', 'duck', 'hammer', 'book'],
        ['book', 'shoe', 'brush', 'tissues', 'duck', 'hammer'],
        ['brush', 'tissues', 'book', 'shoe', 'hammer', 'duck'],
        ['hammer', 'duck', 'brush', 'book', 'tissues', 'shoe'],
        ['shoe', 'tissues', 'hammer', 'book', 'duck', 'brush'],
        ['tissues', 'shoe', 'book', 'hammer', 'duck', 'brush'],
        ['shoe', 'tissues', 'duck', 'book', 'brush', 'hammer'],
        ['tissues', 'shoe', 'duck', 'book', 'brush', 'hammer'],
        ['book', 'brush', 'shoe', 'duck', 'hammer', 'tissues'],
        ['brush', 'tissues', 'duck', 'shoe', 'hammer', 'book'],
        ['tissues', 'shoe', 'hammer', 'book', 'brush', 'duck'],
        ['shoe', 'brush', 'tissues', 'book', 'duck', 'hammer'],
        ['duck', 'book', 'tissues', 'brush', 'shoe', 'hammer'],
        ['book', 'tissues', 'hammer', 'duck', 'brush', 'shoe'],
        ['tissues', 'book', 'duck', 'brush', 'hammer', 'shoe'],
        ['shoe', 'duck', 'book', 'tissues', 'hammer', 'brush'],
        ['shoe', 'hammer', 'duck', 'book', 'brush', 'tissues'],
        ['tissues', 'shoe', 'hammer', 'duck', 'book', 'brush'],
        ['duck', 'tissues', 'brush', 'hammer', 'book', 'shoe'],
        ['shoe', 'hammer', 'brush', 'book', 'tissues', 'duck'],
        ['shoe', 'hammer', 'duck', 'tissues', 'book', 'brush'],
        ['tissues', 'book', 'shoe', 'hammer', 'duck', 'brush'],
        ['tissues', 'duck', 'brush', 'book', 'hammer', 'shoe'],
        ['brush', 'hammer', 'book', 'tissues', 'shoe', 'duck'],
        ['book', 'tissues', 'shoe', 'duck', 'hammer', 'brush'],
        ['brush', 'tissues', 'duck', 'hammer', 'book', 'shoe'],
        ['duck', 'shoe', 'book', 'tissues', 'hammer', 'brush'],
        ['shoe', 'brush', 'tissues', 'hammer', 'duck', 'book'],
        ['book', 'shoe', 'tissues', 'duck', 'brush', 'hammer'],
        ['brush', 'hammer', 'shoe', 'duck', 'book', 'tissues'],
        ['tissues', 'brush', 'duck', 'hammer', 'shoe', 'book'],
        ['duck', 'book', 'shoe', 'hammer', 'brush', 'tissues'],
        ['brush', 'tissues', 'book', 'hammer', 'shoe', 'duck'],
        ['duck', 'shoe', 'hammer', 'tissues', 'book', 'brush'],
        ['tissues', 'hammer', 'book', 'shoe', 'duck', 'brush'],
        ['brush', 'shoe', 'hammer', 'tissues', 'duck', 'book'],
        ['tissues', 'book', 'brush', 'shoe', 'hammer', 'duck'],
        ['shoe', 'duck', 'hammer', 'tissues', 'brush', 'book'],
        ['duck', 'hammer', 'tissues', 'shoe', 'brush', 'book'],
        ['brush', 'duck', 'shoe', 'tissues', 'hammer', 'book'],
        ['book', 'shoe', 'brush', 'hammer', 'tissues', 'duck'],
        ['tissues', 'hammer', 'duck', 'book', 'shoe', 'brush'],
        ['shoe', 'tissues', 'book', 'brush', 'hammer', 'duck'],
        ['hammer', 'duck', 'book', 'brush', 'tissues', 'shoe'],
        ['brush', 'tissues', 'hammer', 'book', 'shoe', 'duck'],
        ['tissues', 'brush', 'hammer', 'shoe', 'book', 'duck'],
        ['book', 'hammer', 'tissues', 'duck', 'brush', 'shoe'],
        ['shoe', 'book', 'duck', 'hammer', 'brush', 'tissues'],
        ['shoe', 'hammer', 'brush', 'tissues', 'book', 'duck'],
        ['shoe', 'brush', 'book', 'tissues', 'duck', 'hammer'],
        ['shoe', 'brush', 'book', 'duck', 'tissues', 'hammer'],
        ['hammer', 'shoe', 'book', 'duck', 'brush', 'tissues'],
        ['duck', 'book', 'brush', 'shoe', 'hammer', 'tissues'],
        ['book', 'brush', 'shoe', 'tissues', 'duck', 'hammer'],
        ['shoe', 'brush', 'duck', 'hammer', 'book', 'tissues'],
        ['hammer', 'tissues', 'brush', 'duck', 'shoe', 'book'],
        ['shoe', 'duck', 'hammer', 'brush', 'book', 'tissues'],
        ['book', 'brush', 'tissues', 'shoe', 'duck', 'hammer'],
        ['hammer', 'shoe', 'duck', 'brush', 'tissues', 'book'],
        ['book', 'duck', 'hammer', 'shoe', 'tissues', 'brush'],
        ['duck', 'hammer', 'book', 'shoe', 'tissues', 'brush'],
        ['hammer', 'shoe', 'tissues', 'duck', 'brush', 'book'],
        ['duck', 'hammer', 'brush', 'book', 'shoe', 'tissues'],
        ['shoe', 'tissues', 'book', 'duck', 'brush', 'hammer'],
        ['hammer', 'book', 'tissues', 'shoe', 'duck', 'brush'],
        ['duck', 'book', 'shoe', 'brush', 'hammer', 'tissues'],
        ['tissues', 'hammer', 'shoe', 'duck', 'brush', 'book'],
        ['tissues', 'book', 'hammer', 'brush', 'shoe', 'duck'],
        ['book', 'tissues', 'brush', 'shoe', 'hammer', 'duck'],
        ['tissues', 'hammer', 'duck', 'book', 'brush', 'shoe'],
        ['tissues', 'shoe', 'brush', 'duck', 'hammer', 'book'],
        ['hammer', 'tissues', 'book', 'shoe', 'duck', 'brush'],
        ['duck', 'tissues', 'shoe', 'brush', 'hammer', 'book'],
        ['brush', 'book', 'shoe', 'hammer', 'duck', 'tissues'],
        ['shoe', 'tissues', 'book', 'duck', 'hammer', 'brush'],
        ['tissues', 'hammer', 'duck', 'brush', 'shoe', 'book'],
        ['duck', 'hammer', 'book', 'brush', 'tissues', 'shoe'],
        ['brush', 'shoe', 'duck', 'hammer', 'tissues', 'book'],
        ['hammer', 'duck', 'book', 'tissues', 'brush', 'shoe'],
        ['hammer', 'shoe', 'brush', 'book', 'duck', 'tissues'],
        ['book', 'tissues', 'shoe', 'brush', 'duck', 'hammer'],
        ['shoe', 'brush', 'book', 'duck', 'hammer', 'tissues'],
        ['duck', 'book', 'tissues', 'shoe', 'hammer', 'brush'],
        ['duck', 'shoe', 'book', 'hammer', 'brush', 'tissues'],
        ['shoe', 'duck', 'book', 'brush', 'tissues', 'hammer'],
        ['brush', 'hammer', 'tissues', 'shoe', 'book', 'duck'],
        ['shoe', 'brush', 'duck', 'tissues', 'hammer', 'book'],
        ['brush', 'shoe', 'hammer', 'tissues', 'book', 'duck'],
        ['book', 'brush', 'hammer', 'shoe', 'duck', 'tissues'],
        ['tissues', 'brush', 'book', 'hammer', 'duck', 'shoe'],
        ['duck', 'tissues', 'book', 'shoe', 'brush', 'hammer'],
        ['duck', 'hammer', 'brush', 'book', 'tissues', 'shoe'],
        ['shoe', 'duck', 'brush', 'hammer', 'book', 'tissues'],
        ['duck', 'book', 'shoe', 'hammer', 'tissues', 'brush'],
        ['book', 'tissues', 'duck', 'hammer', 'shoe', 'brush'],
        ['duck', 'shoe', 'tissues', 'brush', 'book', 'hammer'],
        ['tissues', 'book', 'shoe', 'duck', 'brush', 'hammer'],
        ['book', 'shoe', 'hammer', 'brush', 'tissues', 'duck'],
        ['book', 'shoe', 'tissues', 'hammer', 'duck', 'brush'],
        ['book', 'tissues', 'shoe', 'brush', 'hammer', 'duck'],
        ['book', 'tissues', 'brush', 'shoe', 'duck', 'hammer'],
        ['duck', 'hammer', 'tissues', 'brush', 'shoe', 'book'],
        ['brush', 'tissues', 'hammer', 'duck', 'shoe', 'book'],
        ['book', 'tissues', 'duck', 'brush', 'hammer', 'shoe'],
        ['duck', 'brush', 'book', 'shoe', 'hammer', 'tissues'],
        ['hammer', 'brush', 'tissues', 'book', 'duck', 'shoe'],
        ['tissues', 'book', 'hammer', 'duck', 'brush', 'shoe'],
        ['hammer', 'book', 'shoe', 'brush', 'duck', 'tissues'],
        ['shoe', 'hammer', 'tissues', 'brush', 'book', 'duck'],
        ['tissues', 'book', 'hammer', 'brush', 'duck', 'shoe'],
        ['shoe', 'book', 'hammer', 'tissues', 'duck', 'brush'],
        ['duck', 'shoe', 'book', 'brush', 'tissues', 'hammer'],
        ['hammer', 'duck', 'tissues', 'brush', 'book', 'shoe'],
        ['book', 'brush', 'duck', 'tissues', 'hammer', 'shoe'],
        ['hammer', 'book', 'shoe', 'tissues', 'duck', 'brush'],
        ['book', 'hammer', 'tissues', 'brush', 'duck', 'shoe'],
        ['tissues', 'shoe', 'book', 'brush', 'hammer', 'duck'],
        ['hammer', 'brush', 'duck', 'tissues', 'book', 'shoe'],
        ['shoe', 'brush', 'hammer', 'book', 'duck', 'tissues'],
        ['hammer', 'duck', 'tissues', 'shoe', 'book', 'brush'],
        ['tissues', 'brush', 'shoe', 'duck', 'hammer', 'book'],
        ['book', 'hammer', 'duck', 'brush', 'tissues', 'shoe'],
        ['brush', 'shoe', 'duck', 'tissues', 'hammer', 'book'],
        ['duck', 'brush', 'tissues', 'book', 'hammer', 'shoe'],
        ['hammer', 'shoe', 'tissues', 'duck', 'book', 'brush'],
        ['tissues', 'brush', 'hammer', 'book', 'shoe', 'duck'],
        ['tissues', 'hammer', 'duck', 'shoe', 'book', 'brush'],
        ['duck', 'shoe', 'tissues', 'brush', 'hammer', 'book'],
        ['book', 'brush', 'tissues', 'duck', 'hammer', 'shoe'],
        ['tissues', 'book', 'hammer', 'shoe', 'duck', 'brush'],
        ['tissues', 'shoe', 'brush', 'hammer', 'duck', 'book'],
        ['shoe', 'book', 'duck', 'tissues', 'hammer', 'brush'],
        ['book', 'shoe', 'tissues', 'brush', 'duck', 'hammer'],
        ['book', 'shoe', 'duck', 'tissues', 'brush', 'hammer'],
        ['shoe', 'brush', 'hammer', 'book', 'tissues', 'duck'],
        ['book', 'hammer', 'tissues', 'duck', 'shoe', 'brush'],
        ['hammer', 'book', 'brush', 'tissues', 'duck', 'shoe'],
        ['hammer', 'brush', 'book', 'shoe', 'duck', 'tissues'],
        ['hammer', 'tissues', 'duck', 'brush', 'book', 'shoe'],
        ['brush', 'duck', 'tissues', 'book', 'shoe', 'hammer'],
        ['hammer', 'brush', 'tissues', 'shoe', 'duck', 'book'],
        ['hammer', 'brush', 'book', 'tissues', 'duck', 'shoe'],
        ['duck', 'book', 'brush', 'tissues', 'hammer', 'shoe'],
        ['hammer', 'brush', 'shoe', 'tissues', 'duck', 'book'],
        ['brush', 'hammer', 'tissues', 'shoe', 'duck', 'book'],
        ['book', 'hammer', 'brush', 'duck', 'shoe', 'tissues'],
        ['brush', 'book', 'shoe', 'duck', 'tissues', 'hammer'],
        ['hammer', 'duck', 'tissues', 'brush', 'shoe', 'book'],
        ['tissues', 'book', 'shoe', 'duck', 'hammer', 'brush'],
        ['brush', 'book', 'duck', 'shoe', 'tissues', 'hammer'],
        ['duck', 'hammer', 'shoe', 'brush', 'book', 'tissues'],
        ['book', 'hammer', 'duck', 'tissues', 'brush', 'shoe'],
        ['brush', 'hammer', 'book', 'duck', 'shoe', 'tissues'],
        ['duck', 'hammer', 'tissues', 'book', 'brush', 'shoe'],
        ['tissues', 'hammer', 'shoe', 'duck', 'book', 'brush'],
        ['tissues', 'duck', 'hammer', 'brush', 'shoe', 'book'],
        ['tissues', 'book', 'shoe', 'brush', 'hammer', 'duck'],
        ['duck', 'brush', 'book', 'hammer', 'tissues', 'shoe'],
        ['shoe', 'duck', 'brush', 'tissues', 'book', 'hammer'],
        ['brush', 'book', 'shoe', 'tissues', 'duck', 'hammer'],
        ['hammer', 'tissues', 'brush', 'book', 'shoe', 'duck'],
        ['tissues', 'book', 'brush', 'shoe', 'duck', 'hammer'],
        ['book', 'hammer', 'tissues', 'shoe', 'duck', 'brush'],
        ['duck', 'hammer', 'tissues', 'book', 'shoe', 'brush'],
        ['brush', 'duck', 'shoe', 'book', 'hammer', 'tissues'],
        ['brush', 'shoe', 'book', 'hammer', 'duck', 'tissues'],
        ['tissues', 'book', 'brush', 'hammer', 'duck', 'shoe'],
        ['tissues', 'duck', 'shoe', 'hammer', 'book', 'brush'],
        ['tissues', 'hammer', 'brush', 'shoe', 'book', 'duck'],
        ['tissues', 'shoe', 'duck', 'hammer', 'brush', 'book'],
        ['hammer', 'book', 'shoe', 'duck', 'brush', 'tissues'],
        ['shoe', 'hammer', 'duck', 'brush', 'book', 'tissues'],
        ['shoe', 'tissues', 'brush', 'duck', 'hammer', 'book'],
        ['tissues', 'shoe', 'hammer', 'brush', 'book', 'duck'],
        ['tissues', 'book', 'brush', 'hammer', 'shoe', 'duck'],
        ['book', 'brush', 'shoe', 'hammer', 'duck', 'tissues'],
        ['brush', 'tissues', 'duck', 'book', 'shoe', 'hammer'],
        ['book', 'hammer', 'duck', 'shoe', 'tissues', 'brush'],
        ['brush', 'book', 'hammer', 'shoe', 'tissues', 'duck'],
        ['duck', 'book', 'brush', 'tissues', 'shoe', 'hammer'],
        ['book', 'brush', 'tissues', 'shoe', 'hammer', 'duck'],
        ['book', 'hammer', 'shoe', 'brush', 'duck', 'tissues'],
        ['hammer', 'shoe', 'tissues', 'brush', 'book', 'duck'],
        ['book', 'hammer', 'brush', 'shoe', 'duck', 'tissues'],
        ['shoe', 'hammer', 'duck', 'brush', 'tissues', 'book'],
        ['shoe', 'duck', 'hammer', 'tissues', 'book', 'brush'],
        ['book', 'brush', 'hammer', 'duck', 'shoe', 'tissues'],
        ['duck', 'brush', 'hammer', 'shoe', 'book', 'tissues'],
        ['tissues', 'book', 'duck', 'hammer', 'brush', 'shoe'],
        ['brush', 'hammer', 'shoe', 'duck', 'tissues', 'book'],
        ['shoe', 'tissues', 'duck', 'hammer', 'book', 'brush'],
        ['tissues', 'book', 'hammer', 'duck', 'shoe', 'brush'],
        ['hammer', 'duck', 'brush', 'book', 'shoe', 'tissues'],
        ['brush', 'duck', 'book', 'hammer', 'shoe', 'tissues'],
        ['hammer', 'book', 'duck', 'tissues', 'shoe', 'brush'],
        ['brush', 'shoe', 'book', 'tissues', 'hammer', 'duck'],
        ['hammer', 'tissues', 'shoe', 'book', 'duck', 'brush'],
        ['tissues', 'duck', 'hammer', 'book', 'shoe', 'brush'],
        ['shoe', 'tissues', 'brush', 'book', 'hammer', 'duck'],
        ['shoe', 'book', 'brush', 'duck', 'hammer', 'tissues'],
        ['shoe', 'tissues', 'brush', 'book', 'duck', 'hammer'],
        ['brush', 'hammer', 'shoe', 'tissues', 'duck', 'book'],
        ['shoe', 'tissues', 'brush', 'hammer', 'book', 'duck'],
        ['tissues', 'hammer', 'shoe', 'book', 'duck', 'brush'],
        ['tissues', 'hammer', 'shoe', 'brush', 'book', 'duck'],
        ['shoe', 'duck', 'tissues', 'book', 'hammer', 'brush'],
        ['duck', 'hammer', 'shoe', 'book', 'tissues', 'brush'],
        ['shoe', 'brush', 'tissues', 'hammer', 'book', 'duck'],
        ['brush', 'tissues', 'duck', 'shoe', 'book', 'hammer'],
        ['brush', 'shoe', 'tissues', 'hammer', 'duck', 'book'],
        ['hammer', 'tissues', 'book', 'duck', 'shoe', 'brush'],
        ['shoe', 'duck', 'book', 'tissues', 'brush', 'hammer'],
        ['duck', 'tissues', 'hammer', 'book', 'brush', 'shoe'],
        ['shoe', 'hammer', 'book', 'duck', 'tissues', 'brush'],
        ['duck', 'brush', 'tissues', 'hammer', 'shoe', 'book'],
        ['brush', 'duck', 'book', 'hammer', 'tissues', 'shoe'],
        ['brush', 'book', 'shoe', 'hammer', 'tissues', 'duck'],
        ['brush', 'shoe', 'book', 'tissues', 'duck', 'hammer'],
        ['shoe', 'brush', 'book', 'hammer', 'tissues', 'duck'],
        ['book', 'shoe', 'duck', 'hammer', 'tissues', 'brush'],
        ['brush', 'shoe', 'tissues', 'book', 'hammer', 'duck'],
        ['book', 'brush', 'duck', 'hammer', 'tissues', 'shoe'],
        ['duck', 'book', 'tissues', 'hammer', 'brush', 'shoe'],
        ['brush', 'hammer', 'shoe', 'book', 'duck', 'tissues'],
        ['brush', 'hammer', 'book', 'tissues', 'duck', 'shoe'],
        ['duck', 'book', 'tissues', 'brush', 'hammer', 'shoe'],
        ['tissues', 'shoe', 'book', 'duck', 'hammer', 'brush'],
        ['book', 'shoe', 'tissues', 'brush', 'hammer', 'duck'],
        ['book', 'duck', 'shoe', 'brush', 'hammer', 'tissues'],
        ['hammer', 'duck', 'book', 'brush', 'shoe', 'tissues'],
        ['duck', 'hammer', 'brush', 'tissues', 'book', 'shoe'],
        ['hammer', 'tissues', 'brush', 'shoe', 'book', 'duck'],
        ['tissues', 'shoe', 'book', 'duck', 'brush', 'hammer'],
        ['duck', 'hammer', 'shoe', 'tissues', 'book', 'brush'],
        ['duck', 'hammer', 'tissues', 'shoe', 'book', 'brush'],
        ['shoe', 'brush', 'hammer', 'duck', 'book', 'tissues'],
        ['shoe', 'duck', 'brush', 'hammer', 'tissues', 'book'],
        ['book', 'hammer', 'brush', 'duck', 'tissues', 'shoe'],
        ['shoe', 'duck', 'hammer', 'book', 'brush', 'tissues'],
        ['hammer', 'brush', 'shoe', 'duck', 'book', 'tissues'],
        ['shoe', 'tissues', 'duck', 'hammer', 'brush', 'book'],
        ['brush', 'duck', 'hammer', 'shoe', 'tissues', 'book'],
        ['book', 'hammer', 'duck', 'brush', 'shoe', 'tissues'],
        ['brush', 'book', 'hammer', 'duck', 'shoe', 'tissues'],
        ['brush', 'book', 'tissues', 'duck', 'hammer', 'shoe'],
        ['book', 'hammer', 'shoe', 'brush', 'tissues', 'duck'],
        ['hammer', 'book', 'shoe', 'brush', 'tissues', 'duck'],
        ['shoe', 'brush', 'tissues', 'book', 'hammer', 'duck'],
        ['brush', 'shoe', 'book', 'duck', 'hammer', 'tissues'],
        ['book', 'hammer', 'shoe', 'tissues', 'duck', 'brush'],
        ['tissues', 'brush', 'hammer', 'duck', 'book', 'shoe'],
        ['tissues', 'shoe', 'duck', 'book', 'hammer', 'brush'],
        ['shoe', 'book', 'duck', 'hammer', 'tissues', 'brush'],
        ['brush', 'shoe', 'book', 'hammer', 'tissues', 'duck'],
        ['duck', 'book', 'shoe', 'tissues', 'hammer', 'brush'],
        ['hammer', 'tissues', 'book', 'duck', 'brush', 'shoe'],
        ['duck', 'shoe', 'tissues', 'book', 'hammer', 'brush'],
        ['shoe', 'book', 'tissues', 'duck', 'hammer', 'brush'],
        ['hammer', 'brush', 'duck', 'shoe', 'book', 'tissues'],
        ['tissues', 'book', 'duck', 'hammer', 'shoe', 'brush'],
        ['book', 'shoe', 'hammer', 'brush', 'duck', 'tissues'],
        ['book', 'hammer', 'tissues', 'shoe', 'brush', 'duck'],
        ['tissues', 'duck', 'hammer', 'shoe', 'brush', 'book'],
        ['brush', 'shoe', 'tissues', 'hammer', 'book', 'duck'],
        ['book', 'shoe', 'duck', 'brush', 'tissues', 'hammer'],
        ['duck', 'book', 'tissues', 'shoe', 'brush', 'hammer'],
        ['book', 'hammer', 'tissues', 'brush', 'shoe', 'duck'],
        ['hammer', 'shoe', 'tissues', 'brush', 'duck', 'book'],
        ['shoe', 'book', 'brush', 'hammer', 'duck', 'tissues'],
        ['shoe', 'tissues', 'duck', 'brush', 'hammer', 'book'],
        ['book', 'duck', 'hammer', 'tissues', 'brush', 'shoe'],
        ['tissues', 'hammer', 'book', 'brush', 'duck', 'shoe'],
        ['book', 'brush', 'hammer', 'duck', 'tissues', 'shoe'],
        ['hammer', 'brush', 'tissues', 'shoe', 'book', 'duck'],
        ['book', 'shoe', 'tissues', 'hammer', 'brush', 'duck'],
        ['brush', 'tissues', 'book', 'duck', 'hammer', 'shoe'],
        ['shoe', 'book', 'duck', 'brush', 'tissues', 'hammer'],
        ['tissues', 'shoe', 'duck', 'hammer', 'book', 'brush'],
        ['book', 'tissues', 'brush', 'hammer', 'duck', 'shoe'],
        ['brush', 'book', 'shoe', 'tissues', 'hammer', 'duck'],
        ['hammer', 'shoe', 'duck', 'brush', 'book', 'tissues'],
        ['duck', 'hammer', 'book', 'tissues', 'brush', 'shoe'],
        ['book', 'hammer', 'duck', 'shoe', 'brush', 'tissues'],
        ['duck', 'brush', 'hammer', 'book', 'shoe', 'tissues'],
        ['duck', 'shoe', 'tissues', 'hammer', 'brush', 'book'],
        ['brush', 'duck', 'tissues', 'shoe', 'hammer', 'book'],
        ['book', 'shoe', 'hammer', 'tissues', 'brush', 'duck'],
        ['duck', 'shoe', 'tissues', 'hammer', 'book', 'brush'],
        ['hammer', 'tissues', 'shoe', 'brush', 'book', 'duck'],
        ['book', 'duck', 'hammer', 'tissues', 'shoe', 'brush'],
        ['tissues', 'shoe', 'hammer', 'book', 'duck', 'brush'],
        ['hammer', 'duck', 'book', 'shoe', 'brush', 'tissues'],
        ['brush', 'duck', 'hammer', 'shoe', 'book', 'tissues'],
        ['duck', 'shoe', 'tissues', 'book', 'brush', 'hammer'],
        ['tissues', 'brush', 'hammer', 'duck', 'shoe', 'book'],
        ['hammer', 'book', 'shoe', 'tissues', 'brush', 'duck'],
        ['duck', 'tissues', 'shoe', 'brush', 'book', 'hammer'],
        ['book', 'brush', 'shoe', 'hammer', 'tissues', 'duck'],
        ['shoe', 'brush', 'tissues', 'duck', 'book', 'hammer'],
        ['shoe', 'hammer', 'brush', 'book', 'duck', 'tissues'],
        ['shoe', 'brush', 'book', 'hammer', 'duck', 'tissues'],
        ['hammer', 'duck', 'shoe', 'tissues', 'brush', 'book'],
        ['duck', 'brush', 'book', 'shoe', 'tissues', 'hammer'],
        ['brush', 'tissues', 'book', 'shoe', 'duck', 'hammer'],
        ['brush', 'hammer', 'tissues', 'book', 'shoe', 'duck'],
        ['shoe', 'hammer', 'tissues', 'brush', 'duck', 'book'],
        ['duck', 'brush', 'tissues', 'shoe', 'hammer', 'book'],
        ['brush', 'book', 'tissues', 'hammer', 'shoe', 'duck'],
        ['duck', 'hammer', 'book', 'brush', 'shoe', 'tissues'],
        ['tissues', 'shoe', 'duck', 'brush', 'hammer', 'book'],
        ['duck', 'brush', 'hammer', 'tissues', 'book', 'shoe'],
        ['shoe', 'book', 'hammer', 'brush', 'tissues', 'duck'],
        ['book', 'duck', 'tissues', 'shoe', 'hammer', 'brush'],
        ['tissues', 'duck', 'book', 'shoe', 'hammer', 'brush'],
        ['hammer', 'book', 'duck', 'brush', 'shoe', 'tissues'],
        ['tissues', 'brush', 'shoe', 'duck', 'book', 'hammer'],
        ['duck', 'brush', 'tissues', 'hammer', 'book', 'shoe'],
        ['brush', 'hammer', 'shoe', 'book', 'tissues', 'duck'],
        ['hammer', 'brush', 'shoe', 'tissues', 'book', 'duck'],
        ['book', 'brush', 'shoe', 'tissues', 'hammer', 'duck'],
        ['hammer', 'book', 'duck', 'tissues', 'brush', 'shoe'],
        ['brush', 'book', 'duck', 'hammer', 'shoe', 'tissues'],
        ['hammer', 'tissues', 'brush', 'book', 'duck', 'shoe'],
        ['duck', 'shoe', 'brush', 'book', 'tissues', 'hammer'],
        ['duck', 'hammer', 'tissues', 'brush', 'book', 'shoe'],
        ['shoe', 'duck', 'tissues', 'hammer', 'book', 'brush'],
        ['hammer', 'book', 'brush', 'duck', 'tissues', 'shoe'],
        ['hammer', 'shoe', 'tissues', 'book', 'duck', 'brush'],
        ['book', 'brush', 'tissues', 'duck', 'shoe', 'hammer'],
        ['book', 'brush', 'duck', 'shoe', 'hammer', 'tissues'],
        ['shoe', 'duck', 'hammer', 'book', 'tissues', 'brush'],
        ['hammer', 'tissues', 'duck', 'brush', 'shoe', 'book'],
        ['duck', 'book', 'brush', 'shoe', 'tissues', 'hammer'],
        ['duck', 'shoe', 'book', 'hammer', 'tissues', 'brush'],
        ['shoe', 'brush', 'hammer', 'duck', 'tissues', 'book'],
        ['brush', 'tissues', 'shoe', 'duck', 'book', 'hammer'],
        ['book', 'hammer', 'shoe', 'duck', 'brush', 'tissues'],
        ['shoe', 'book', 'tissues', 'brush', 'hammer', 'duck'],
        ['book', 'shoe', 'hammer', 'duck', 'brush', 'tissues'],
        ['hammer', 'brush', 'duck', 'tissues', 'shoe', 'book'],
        ['brush', 'tissues', 'hammer', 'duck', 'book', 'shoe'],
        ['shoe', 'book', 'brush', 'hammer', 'tissues', 'duck'],
        ['brush', 'book', 'hammer', 'tissues', 'duck', 'shoe'],
        ['duck', 'tissues', 'book', 'shoe', 'hammer', 'brush'],
        ['hammer', 'shoe', 'book', 'brush', 'tissues', 'duck'],
        ['duck', 'shoe', 'brush', 'hammer', 'tissues', 'book'],
        ['duck', 'tissues', 'hammer', 'brush', 'book', 'shoe'],
        ['shoe', 'tissues', 'book', 'hammer', 'brush', 'duck'],
        ['tissues', 'brush', 'shoe', 'hammer', 'book', 'duck'],
        ['duck', 'tissues', 'brush', 'book', 'shoe', 'hammer'],
        ['book', 'duck', 'shoe', 'hammer', 'brush', 'tissues'],
        ['hammer', 'brush', 'shoe', 'book', 'tissues', 'duck'],
        ['book', 'tissues', 'hammer', 'brush', 'shoe', 'duck'],
        ['hammer', 'book', 'duck', 'brush', 'tissues', 'shoe'],
        ['duck', 'tissues', 'shoe', 'hammer', 'brush', 'book'],
        ['book', 'duck', 'hammer', 'brush', 'shoe', 'tissues'],
        ['tissues', 'duck', 'brush', 'shoe', 'book', 'hammer'],
        ['hammer', 'duck', 'brush', 'shoe', 'book', 'tissues'],
        ['hammer', 'brush', 'book', 'duck', 'shoe', 'tissues'],
        ['hammer', 'tissues', 'shoe', 'book', 'brush', 'duck'],
        ['hammer', 'book', 'tissues', 'brush', 'shoe', 'duck'],
        ['shoe', 'book', 'hammer', 'tissues', 'brush', 'duck'],
        ['book', 'tissues', 'brush', 'duck', 'shoe', 'hammer'],
        ['brush', 'hammer', 'tissues', 'book', 'duck', 'shoe'],
        ['shoe', 'tissues', 'duck', 'brush', 'book', 'hammer'],
        ['hammer', 'shoe', 'book', 'brush', 'duck', 'tissues'],
        ['tissues', 'hammer', 'brush', 'book', 'shoe', 'duck'],
        ['book', 'duck', 'hammer', 'brush', 'tissues', 'shoe'],
        ['shoe', 'hammer', 'brush', 'tissues', 'duck', 'book'],
        ['tissues', 'book', 'duck', 'shoe', 'brush', 'hammer'],
        ['shoe', 'tissues', 'hammer', 'duck', 'brush', 'book'],
        ['duck', 'tissues', 'shoe', 'book', 'brush', 'hammer'],
        ['hammer', 'shoe', 'brush', 'tissues', 'duck', 'book'],
        ['shoe', 'hammer', 'tissues', 'book', 'duck', 'brush'],
        ['hammer', 'duck', 'brush', 'tissues', 'book', 'shoe'],
        ['duck', 'hammer', 'brush', 'shoe', 'book', 'tissues'],
        ['duck', 'brush', 'tissues', 'shoe', 'book', 'hammer'],
        ['brush', 'duck', 'book', 'shoe', 'hammer', 'tissues'],
        ['duck', 'tissues', 'hammer', 'book', 'shoe', 'brush'],
        ['duck', 'book', 'hammer', 'shoe', 'brush', 'tissues'],
        ['brush', 'tissues', 'shoe', 'book', 'hammer', 'duck'],
        ['duck', 'brush', 'shoe', 'hammer', 'tissues', 'book'],
        ['book', 'duck', 'shoe', 'tissues', 'brush', 'hammer'],
        ['tissues', 'hammer', 'duck', 'shoe', 'brush', 'book'],
        ['duck', 'brush', 'book', 'hammer', 'shoe', 'tissues'],
        ['duck', 'hammer', 'shoe', 'book', 'brush', 'tissues'],
        ['duck', 'shoe', 'hammer', 'brush', 'book', 'tissues'],
        ['tissues', 'hammer', 'duck', 'brush', 'book', 'shoe'],
        ['brush', 'book', 'hammer', 'duck', 'tissues', 'shoe'],
        ['hammer', 'brush', 'tissues', 'duck', 'shoe', 'book'],
        ['brush', 'shoe', 'duck', 'book', 'tissues', 'hammer'],
        ['hammer', 'book', 'tissues', 'duck', 'brush', 'shoe'],
        ['tissues', 'duck', 'book', 'shoe', 'brush', 'hammer'],
        ['shoe', 'book', 'hammer', 'duck', 'brush', 'tissues'],
        ['hammer', 'brush', 'shoe', 'book', 'duck', 'tissues'],
        ['brush', 'duck', 'book', 'tissues', 'shoe', 'hammer'],
        ['brush', 'tissues', 'book', 'hammer', 'duck', 'shoe'],
        ['hammer', 'brush', 'duck', 'book', 'shoe', 'tissues'],
        ['duck', 'tissues', 'book', 'brush', 'hammer', 'shoe'],
        ['hammer', 'tissues', 'shoe', 'duck', 'brush', 'book'],
        ['tissues', 'brush', 'book', 'hammer', 'shoe', 'duck'],
        ['book', 'hammer', 'duck', 'tissues', 'shoe', 'brush'],
        ['brush', 'book', 'tissues', 'duck', 'shoe', 'hammer'],
        ['book', 'brush', 'hammer', 'tissues', 'shoe', 'duck'],
        ['book', 'hammer', 'shoe', 'duck', 'tissues', 'brush'],
        ['hammer', 'brush', 'duck', 'book', 'tissues', 'shoe'],
        ['duck', 'book', 'brush', 'hammer', 'tissues', 'shoe'],
        ['hammer', 'tissues', 'book', 'shoe', 'brush', 'duck'],
        ['hammer', 'duck', 'tissues', 'book', 'shoe', 'brush'],
        ['duck', 'tissues', 'hammer', 'brush', 'shoe', 'book'],
        ['hammer', 'book', 'tissues', 'brush', 'duck', 'shoe'],
        ['shoe', 'hammer', 'tissues', 'book', 'brush', 'duck'],
        ['hammer', 'shoe', 'book', 'duck', 'tissues', 'brush'],
        ['hammer', 'shoe', 'duck', 'book', 'brush', 'tissues'],
        ['book', 'duck', 'brush', 'hammer', 'tissues', 'shoe'],
        ['hammer', 'book', 'tissues', 'shoe', 'brush', 'duck'],
        ['tissues', 'shoe', 'brush', 'hammer', 'book', 'duck'],
        ['tissues', 'brush', 'book', 'duck', 'shoe', 'hammer'],
        ['hammer', 'duck', 'shoe', 'book', 'brush', 'tissues'],
        ['duck', 'hammer', 'shoe', 'tissues', 'brush', 'book'],
        ['duck', 'tissues', 'shoe', 'book', 'hammer', 'brush'],
        ['tissues', 'brush', 'book', 'duck', 'hammer', 'shoe'],
        ['duck', 'shoe', 'brush', 'book', 'hammer', 'tissues'],
        ['duck', 'shoe', 'book', 'tissues', 'brush', 'hammer'],
        ['hammer', 'book', 'brush', 'duck', 'shoe', 'tissues'],
        ['brush', 'shoe', 'tissues', 'duck', 'hammer', 'book'],
        ['brush', 'book', 'shoe', 'duck', 'hammer', 'tissues'],
        ['hammer', 'duck', 'tissues', 'book', 'brush', 'shoe'],
        ['tissues', 'hammer', 'brush', 'duck', 'book', 'shoe'],
        ['duck', 'tissues', 'book', 'hammer', 'shoe', 'brush'],
        ['book', 'tissues', 'duck', 'brush', 'shoe', 'hammer'],
        ['brush', 'hammer', 'tissues', 'duck', 'shoe', 'book'],
        ['hammer', 'duck', 'tissues', 'shoe', 'brush', 'book'],
        ['hammer', 'tissues', 'shoe', 'brush', 'duck', 'book'],
        ['shoe', 'tissues', 'brush', 'hammer', 'duck', 'book'],
        ['hammer', 'duck', 'book', 'shoe', 'tissues', 'brush'],
        ['hammer', 'tissues', 'duck', 'book', 'shoe', 'brush'],
        ['tissues', 'hammer', 'brush', 'book', 'duck', 'shoe'],
        ['duck', 'brush', 'shoe', 'tissues', 'hammer', 'book'],
        ['duck', 'book', 'shoe', 'brush', 'tissues', 'hammer'],
        ['brush', 'hammer', 'book', 'shoe', 'tissues', 'duck'],
        ['brush', 'hammer', 'tissues', 'duck', 'book', 'shoe'],
        ['shoe', 'duck', 'tissues', 'hammer', 'brush', 'book']
    ];

    var controlObjectRotation = [
        ['scissors', 'spoon', 'wrench', 'box', 'eraser', 'funnel'],
        ['funnel', 'scissors', 'spoon', 'box', 'eraser', 'wrench'],
        ['funnel', 'scissors', 'wrench', 'box', 'eraser', 'spoon'],
        ['eraser', 'scissors', 'wrench', 'box', 'funnel', 'spoon'],
        ['eraser', 'funnel', 'wrench', 'box', 'scissors', 'spoon'],
        ['box', 'scissors', 'spoon', 'eraser', 'funnel', 'wrench'],
        ['eraser', 'funnel', 'scissors', 'box', 'spoon', 'wrench'],
        ['eraser', 'funnel', 'spoon', 'box', 'scissors', 'wrench'],
        ['box', 'eraser', 'funnel', 'scissors', 'spoon', 'wrench'],
        ['box', 'funnel', 'spoon', 'eraser', 'scissors', 'wrench'],
        ['box', 'eraser', 'spoon', 'funnel', 'scissors', 'wrench'],
        ['box', 'funnel', 'scissors', 'eraser', 'spoon', 'wrench'],
        ['box', 'eraser', 'scissors', 'funnel', 'spoon', 'wrench'],
        ['funnel', 'spoon', 'wrench', 'box', 'eraser', 'scissors'],
        ['box', 'eraser', 'wrench', 'funnel', 'scissors', 'spoon'],
        ['box', 'scissors', 'wrench', 'eraser', 'funnel', 'spoon'],
        ['box', 'spoon', 'wrench', 'eraser', 'funnel', 'scissors'],
        ['box', 'funnel', 'wrench', 'eraser', 'scissors', 'spoon'],
        ['eraser', 'spoon', 'wrench', 'box', 'funnel', 'scissors'],
        ['eraser', 'scissors', 'spoon', 'box', 'funnel', 'wrench']
    ];

    var inertiaObjectRotation = [
        ['marker', 'train', 'flashlight', 'toycar', 'block', 'sunglasses'],
        ['train', 'sunglasses', 'flashlight', 'toycar', 'marker', 'block'],
        ['marker', 'block', 'flashlight', 'train', 'sunglasses', 'toycar'],
        ['flashlight', 'train', 'marker', 'toycar', 'sunglasses', 'block'],
        ['marker', 'flashlight', 'block', 'train', 'sunglasses', 'toycar'],
        ['train', 'block', 'marker', 'flashlight', 'toycar', 'sunglasses'],
        ['train', 'toycar', 'sunglasses', 'block', 'marker', 'flashlight'],
        ['train', 'flashlight', 'block', 'marker', 'sunglasses', 'toycar'],
        ['flashlight', 'marker', 'sunglasses', 'train', 'block', 'toycar'],
        ['toycar', 'block', 'train', 'marker', 'flashlight', 'sunglasses'],
        ['block', 'train', 'sunglasses', 'toycar', 'marker', 'flashlight'],
        ['toycar', 'sunglasses', 'flashlight', 'train', 'block', 'marker'],
        ['toycar', 'flashlight', 'marker', 'block', 'sunglasses', 'train'],
        ['marker', 'block', 'sunglasses', 'train', 'toycar', 'flashlight'],
        ['train', 'toycar', 'flashlight', 'block', 'marker', 'sunglasses'],
        ['toycar', 'block', 'train', 'flashlight', 'sunglasses', 'marker'],
        ['marker', 'flashlight', 'toycar', 'sunglasses', 'block', 'train'],
        ['block', 'sunglasses', 'train', 'toycar', 'marker', 'flashlight'],
        ['marker', 'sunglasses', 'block', 'toycar', 'flashlight', 'train'],
        ['train', 'sunglasses', 'marker', 'flashlight', 'block', 'toycar'],
        ['train', 'sunglasses', 'block', 'toycar', 'marker', 'flashlight'],
        ['sunglasses', 'marker', 'flashlight', 'train', 'block', 'toycar'],
        ['flashlight', 'train', 'marker', 'sunglasses', 'block', 'toycar'],
        ['toycar', 'block', 'sunglasses', 'marker', 'train', 'flashlight'],
        ['flashlight', 'sunglasses', 'train', 'block', 'marker', 'toycar'],
        ['block', 'flashlight', 'sunglasses', 'train', 'marker', 'toycar'],
        ['marker', 'toycar', 'train', 'sunglasses', 'block', 'flashlight'],
        ['block', 'flashlight', 'sunglasses', 'toycar', 'train', 'marker'],
        ['sunglasses', 'train', 'marker', 'toycar', 'flashlight', 'block'],
        ['flashlight', 'toycar', 'marker', 'train', 'block', 'sunglasses'],
        ['toycar', 'marker', 'flashlight', 'block', 'train', 'sunglasses'],
        ['flashlight', 'sunglasses', 'marker', 'train', 'toycar', 'block'],
        ['toycar', 'flashlight', 'block', 'sunglasses', 'marker', 'train'],
        ['flashlight', 'sunglasses', 'block', 'marker', 'toycar', 'train'],
        ['sunglasses', 'flashlight', 'block', 'toycar', 'marker', 'train'],
        ['sunglasses', 'toycar', 'train', 'marker', 'block', 'flashlight'],
        ['sunglasses', 'flashlight', 'toycar', 'marker', 'block', 'train'],
        ['marker', 'sunglasses', 'train', 'block', 'flashlight', 'toycar'],
        ['toycar', 'marker', 'flashlight', 'sunglasses', 'block', 'train'],
        ['block', 'sunglasses', 'toycar', 'marker', 'flashlight', 'train'],
        ['block', 'flashlight', 'toycar', 'marker', 'sunglasses', 'train'],
        ['block', 'marker', 'sunglasses', 'toycar', 'train', 'flashlight'],
        ['train', 'toycar', 'flashlight', 'sunglasses', 'marker', 'block'],
        ['flashlight', 'train', 'block', 'toycar', 'sunglasses', 'marker'],
        ['toycar', 'flashlight', 'train', 'block', 'sunglasses', 'marker'],
        ['block', 'train', 'marker', 'toycar', 'flashlight', 'sunglasses'],
        ['train', 'flashlight', 'block', 'sunglasses', 'toycar', 'marker'],
        ['toycar', 'marker', 'train', 'block', 'sunglasses', 'flashlight'],
        ['sunglasses', 'train', 'marker', 'block', 'toycar', 'flashlight'],
        ['marker', 'train', 'sunglasses', 'toycar', 'block', 'flashlight'],
        ['toycar', 'block', 'sunglasses', 'train', 'marker', 'flashlight'],
        ['block', 'sunglasses', 'flashlight', 'toycar', 'marker', 'train'],
        ['marker', 'block', 'toycar', 'train', 'sunglasses', 'flashlight'],
        ['toycar', 'flashlight', 'sunglasses', 'marker', 'block', 'train'],
        ['toycar', 'flashlight', 'sunglasses', 'train', 'block', 'marker'],
        ['sunglasses', 'block', 'flashlight', 'train', 'toycar', 'marker'],
        ['block', 'train', 'flashlight', 'sunglasses', 'toycar', 'marker'],
        ['flashlight', 'train', 'sunglasses', 'toycar', 'marker', 'block'],
        ['flashlight', 'block', 'train', 'toycar', 'marker', 'sunglasses'],
        ['toycar', 'sunglasses', 'marker', 'block', 'train', 'flashlight'],
        ['block', 'train', 'marker', 'sunglasses', 'toycar', 'flashlight'],
        ['marker', 'train', 'block', 'flashlight', 'sunglasses', 'toycar'],
        ['train', 'sunglasses', 'flashlight', 'block', 'marker', 'toycar'],
        ['sunglasses', 'marker', 'train', 'toycar', 'block', 'flashlight'],
        ['block', 'train', 'flashlight', 'toycar', 'sunglasses', 'marker'],
        ['toycar', 'sunglasses', 'block', 'flashlight', 'marker', 'train'],
        ['toycar', 'sunglasses', 'marker', 'flashlight', 'block', 'train'],
        ['toycar', 'train', 'block', 'marker', 'sunglasses', 'flashlight'],
        ['train', 'marker', 'flashlight', 'sunglasses', 'toycar', 'block'],
        ['block', 'marker', 'sunglasses', 'flashlight', 'train', 'toycar'],
        ['block', 'marker', 'toycar', 'flashlight', 'sunglasses', 'train'],
        ['flashlight', 'block', 'marker', 'sunglasses', 'train', 'toycar'],
        ['marker', 'flashlight', 'sunglasses', 'block', 'toycar', 'train'],
        ['block', 'toycar', 'flashlight', 'sunglasses', 'marker', 'train'],
        ['sunglasses', 'block', 'marker', 'train', 'toycar', 'flashlight'],
        ['block', 'flashlight', 'marker', 'train', 'toycar', 'sunglasses'],
        ['toycar', 'train', 'marker', 'sunglasses', 'block', 'flashlight'],
        ['marker', 'train', 'sunglasses', 'block', 'flashlight', 'toycar'],
        ['marker', 'train', 'block', 'toycar', 'flashlight', 'sunglasses'],
        ['toycar', 'block', 'marker', 'flashlight', 'train', 'sunglasses'],
        ['sunglasses', 'block', 'marker', 'flashlight', 'train', 'toycar'],
        ['marker', 'sunglasses', 'flashlight', 'block', 'train', 'toycar'],
        ['marker', 'toycar', 'train', 'flashlight', 'sunglasses', 'block'],
        ['toycar', 'sunglasses', 'train', 'block', 'flashlight', 'marker'],
        ['marker', 'sunglasses', 'toycar', 'flashlight', 'block', 'train'],
        ['flashlight', 'marker', 'toycar', 'train', 'block', 'sunglasses'],
        ['toycar', 'marker', 'block', 'sunglasses', 'train', 'flashlight'],
        ['flashlight', 'marker', 'toycar', 'block', 'train', 'sunglasses'],
        ['toycar', 'train', 'flashlight', 'marker', 'block', 'sunglasses'],
        ['sunglasses', 'flashlight', 'train', 'toycar', 'block', 'marker']
    ];

    return {
        useFallRotation: useFallRotation,
        conceptOrderRotation: conceptOrderRotation,
        objectRotations: [  gravityObjectRotation,
                            inertiaObjectRotation,
                            supportObjectRotation,
                            controlObjectRotation]
    };
}


function assignVideos(startType, showStay, whichObjects) {

    var cb = counterbalancingLists();

    // Types of comparisons for each event type.
    // Format [event, outcome1, outcome2]
    var comparisonsGravity = [
        ['table', 'down', 'continue'],
        ['table', 'down', 'up'],
        ['table', 'continue', 'up'],
        ['ramp', 'down', 'up'],
        ['ramp', 'down', 'up'],
        ['toss', 'down', 'up']
    ];
    var comparisonsInertia = [
        ['stop', 'hand', 'nohand'],
        ['reverse', 'barrier', 'nobarrier']
    ];

    var comparisonsControl = [
        ['same', 'A', 'B'],
        ['salience', 'interesting', 'boring']
    ];

    // Start off with support comparisons all 'stay'; change appropriate ones
    // to 'fall' based on counterbalancing.
    var comparisonsSupport = [
        ['stay', 'slightly-on', 'mostly-on'],
        ['stay', 'next-to', 'mostly-on'],
        ['stay', 'near', 'mostly-on'],
        ['stay', 'next-to', 'slightly-on'],
        ['stay', 'near', 'slightly-on'],
        ['stay', 'near', 'next-to']
    ];

    // Choose which videos to show for support
    if (showStay < 0 || showStay >= cb.useFallRotation.length) {
        console.log('invalid value for showStay, using only stay videos');
    } else {
        var useFall = cb.useFallRotation[showStay];
        for (var iFall = 0; iFall < useFall.length; iFall++) {
            comparisonsSupport[useFall[iFall]][0] = 'fall';
        }
    }

    var videotypes = ['gravity', 'inertia', 'support', 'control'];
    var compTypes = [   comparisonsGravity,
                        comparisonsInertia,
                        comparisonsSupport,
                        comparisonsControl ];
    // how many times does each comparison type listed need to be shown?
    var nReps = [1, 2, 1, 3];

    // Create ordered list of TYPES to show (e.g. gravity, inertia, ...)
    var typeOrder;
    if (startType < 0 || startType >= cb.conceptOrderRotation.length) {
        console.log('invalid value for startType, using order 0');
        typeOrder = cb.conceptOrderRotation[startType];
    } else {
        typeOrder = cb.conceptOrderRotation[startType];
    }

    // Create lists of objects-per-comparison for each type
    var objectPairingsByType = [[], [], [], []];
    if (whichObjects.length !== 4) {
        console.log('Unexpected whichObjects parameter length; using default object pairings');
        whichObjects = [0, 0, 0, 0];
    }
    for (iType=0; iType<4; iType++) {
        if (whichObjects[iType] < 0 || whichObjects[iType] >= cb.objectRotations[iType].length) {
            console.log('Invalid value for whichObjects type ' + iType + ', using default object pairings');
            objectPairingsByType[iType] = cb.objectRotations[iType][0];
        } else {
            objectPairingsByType[iType] = cb.objectRotations[iType][whichObjects[iType]];
        }
    }

    // Options for videos, organized by event
    var cameraAngles = {};
    cameraAngles['table'] = ['c1', 'c2'];
    cameraAngles['ramp'] = ['c1', 'c2'];
    cameraAngles['toss'] = ['c1', 'c2'];
    cameraAngles['stop'] = ['c1', 'c2'];
    cameraAngles['reverse'] = ['c1', 'c2'];
    cameraAngles['fall'] = ['c2'];
    cameraAngles['stay'] = ['c2'];
    cameraAngles['same'] = ['c1'];
    cameraAngles['salience'] = ['c1'];

    var backgrounds = {};
    backgrounds['table'] = ['1'];
    backgrounds['ramp'] = ['b1', 'b2'];
    backgrounds['toss'] = ['b1'];
    backgrounds['stop'] = ['b1'];
    backgrounds['reverse'] = ['b1'];
    backgrounds['fall'] = ['green'];
    backgrounds['stay'] = ['green'];
    backgrounds['same'] = ['b1'];
    backgrounds['salience'] = ['b1'];

    var flips = {};
    flips['table'] = ['NR'];
    flips['ramp'] = ['NN', 'RR', 'NR', 'RN'];
    flips['toss'] = ['NN', 'RR'];
    flips['stop'] = ['NR'];
    flips['reverse'] = ['NN', 'RR', 'NR', 'RN'];
    flips['fall'] = ['NN', 'RR'];
    flips['stay'] = ['NN', 'RR'];
    flips['same'] = ['NN', 'RN', 'RR'];
    flips['salience'] = ['NN', 'RN', 'RR'];

    var playlistsByType = {};
    for (var iType = 0; iType < videotypes.length; iType++) { // for each video type

        // get list of objects to use with canonically-ordered comparison types
        var objList = objectPairingsByType[iType];

        // make canonical comparison type list
        var eventTypeList = compTypes[iType];
        for (var iRep = 1; iRep < nReps[iType]; iRep++) {
            eventTypeList = eventTypeList.concat(compTypes[iType]);
        }

        // choose placement of more/less surprising outcomes (balanced)
        var onLeft = [  'moreProb', 'lessProb',
                        'moreProb', 'lessProb',
                        'moreProb', 'lessProb'];
        onLeft = onLeft.slice(0, eventTypeList.length);
        onLeft = shuffleArray(onLeft);

        // pair objects and comparison types
        var events = [];
        for (var iEvent = 0; iEvent < eventTypeList.length; iEvent++) {
	        var outcomeL, outcomeR;
            if (onLeft[iEvent] === 'moreProb') {
                outcomeL = eventTypeList[iEvent][1];
                outcomeR = eventTypeList[iEvent][2];
            } else {
                outcomeL = eventTypeList[iEvent][2];
                outcomeR = eventTypeList[iEvent][1];
            }

            // choose camera angle, background, and flip randomly
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

        // for inertia, also add calibration events before shuffling
        if (videotypes[iType] === 'inertia') {
            events.push({
                compType: 'calibration',
                object: objList[4],
                flip: 'LR'
            });
            events.push({
                compType: 'calibration',
                object: objList[5],
                flip: 'RL'
            });
        }

        // choose order of events randomly w/i type
        events = shuffleArray(events);
        playlistsByType[videotypes[iType]] = events;
    }

    // Put list together
    var allEvents = [];
    var filenames = [];
    var eventNum = 1;
    for (var nEvents = 0; nEvents < 6; nEvents++) {
        for (iType = 0; iType < typeOrder.length; iType++) {
            var e = playlistsByType[typeOrder[iType]][nEvents];

            var fname;
            var altName;
            if (e.compType === 'calibration') {
                fname = `sbs_calibration_${e.flip}`;
                filenames.push(fname);
                altName = `sbs_calibration_${e.flip}`;
                e.fname = fname;
                e.altName = altName;
            } else {
                fname = `sbs_${e.compType}_${e.outcomeL}_${e.outcomeR}_${e.object}_${e.camera}_${e.background}_${e.flip}`;
                filenames.push(fname);
                altName = `sbs_${e.compType}_${e.outcomeR}_${e.outcomeL}_${e.object}_${e.camera}_${e.background}_${e.flip}`;
                e.fname = fname;
                e.altName = altName;
            }
            e.index = eventNum;
            allEvents.push(e);
            eventNum++;
        }
    }
    return [allEvents, filenames];
}

function audioSourceObjs(path, shortname) {
    return  [
                {
                    src: path + shortname + '.ogg',
                    type: 'audio/ogg'
                },
                {
                    src: path + shortname + '.mp3',
                    type: 'audio/mp3'
                }
            ];
}

function videoSourceObjs(path, shortname, organizedByType) {
    if (!organizedByType) {
        return  [
                    {
                        'src': path + shortname + '.webm',
                        'type': 'video/webm'
                    },
                    {
                        'src': path + shortname + '.mp4',
                        'type': 'video/mp4'
                    }
                ];
    } else {
        return  [
                {
                    'src': path + 'webm/' + shortname + '.webm',
                    'type': 'video/webm'
                },
                {
                    'src': path + 'mp4/' + shortname + '.mp4',
                    'type': 'video/mp4'
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
                    'all_done'),
                attnSources: videoSourceObjs(
                    BASE_DIR + 'stimuli/attention/',
                    'attentiongrabber', true),
            };
        }
        var allMusic = ['music_01', 'music_02', 'music_03', 'music_04', 'music_06', 'music_07', 'music_09', 'music_10'];
        var musicName = allMusic[Math.floor(Math.random() * allMusic.length)];

        return {
            kind: 'exp-video-physics',
            id: `${frameId}`,
            autoplay: true,
            testLength: 24, // length of test trial in seconds
            isLast: false,
            audioSources: audioSourceObjs(
                BASE_DIR + 'audio/',
                'video_' + ('00' + (e.index)).slice(-2)),
            musicSources: audioSourceObjs(
                BASE_DIR + 'audio/',
                musicName),
            introSources: videoSourceObjs(
                BASE_DIR + 'stimuli/intro/',
                `cropped_${e.object}`, true),
            attnSources: videoSourceObjs(
                BASE_DIR + 'stimuli/attention/',
                'attentiongrabber', true),
            sources: videoSourceObjs(
		BASE_DIR + 'stimuli/' + e.compType + '/',
		e.fname, true),
            altSources: videoSourceObjs(
                BASE_DIR + 'stimuli/' + e.compType + '/',
                e.altName, true)
        };
    });
}

var randomizer = function(frameId, frame, pastSessions, resolveFrame) {
    var MAX_VIDEOS = 24;
    var BASE_DIR = 'https://s3.amazonaws.com/lookitcontents/exp-physics-final/';

   // TODO: In the future, we may want to identify the specific frame # to fetch instead of generic frame name
    pastSessions = pastSessions.filter(function (session) {
        return session.get('conditions');
    });
    let lastSession = getLastSession(pastSessions);
    var conditions = getConditions(lastSession, frameId);

    var {
	startType,
	showStay,
	whichObjects
    } = conditions;

    var [eventVideos, ] = assignVideos(startType, showStay, whichObjects);

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

// Export helper functions to support unit testing
export { getConditions, getLastSession };
