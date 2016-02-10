import Ember from 'ember';
import layout from '../templates/components/exp-player';

export default Ember.Component.extend({
    layout: layout,
    frames: null,
    frameIndex: null,
    _last: null,
    ctx: {
        data: {}
    },
    startTime: Date.now(),
    eventTimings: null,   // TODO: Move to expData?

    onInit: function() {
        this.set('frameIndex', this.get('frameIndex') || 0);
        this.set('eventTimings', this.get('eventTimings') || {});
    }.on('didReceiveAttrs'),
    currentFrame: Ember.computed('frames', 'frameIndex', function() {
        var frames = this.get('frames') || [];
        var frameIndex = this.get('frameIndex');
        return frames[frameIndex];
    }),
    noFrames: Ember.computed.empty('frames'),
    currentFrameType: Ember.computed('currentFrame', function() {
        var currentFrame = this.get('currentFrame');
        return !!currentFrame ? currentFrame.type : '';
    }),
    currentFrameTemplate: Ember.computed('currentFrame', function() {
        var currentFrame = this.get('currentFrame');
        var componentName = `exp-${currentFrame.type}`;

        if (!this.container.lookup(`component:${componentName}`)) {
            console.warn(`No component named ${componentName} is registered.`);
        }
        return componentName;
    }),
    currentFrameId: Ember.computed('currentFrame', function() {
        var currentFrame = this.get('currentFrame');
        return currentFrame.id;
    }),
    currentFrameData: Ember.computed('currentFrame', function() {
        var currentFrame = this.get('currentFrame');
        var context = this.get('ctx');

        if (!context[currentFrame.id]) {
            context[currentFrame.id] = null;
        }
        return context[currentFrame.id];
    }),
    currentFrameCtx: Ember.computed('currentFrame', function() {
        // deepcopy global context
        var ctx = Ember.copy(this.get('ctx'));
        ctx.frameIndex = this.get('frameIndex');

        return ctx;
    }),
    actions: {
        startTimer() {
            // Reset 0-index of the timer
            this.set('startTime', Date.now());
        },

        setTimeEvent(eventName, frameId, extra) {
            // Track a particular timing event
            var curTime = (Date.now() - this.get('startTime')) / 1000;  // All times expressed in seconds relative to start.
            // TODO: Do we really want times to be relative? There are advantages to absolute times, and we could process for readability after the fact.
            var eventData = {
                eventType: eventName,
                timestamp: curTime
            };
            Ember.merge(eventData, extra || {});
            // Copy timing event into parent dict; TODO is there a more elegant way?
            var timings = this.get('eventTimings');
            timings[frameId] = timings[frameId] || [];
            timings[frameId].push(eventData);
            this.set('eventTimings', timings);
        },

        saveFrame(frameId, frameData) {
            // TODO: Implement
            console.log('Save frame action called', frameId, frameData);
        },

        next() {
            console.log('next');

            var frameIndex = this.get('frameIndex');
            if (frameIndex < (this.get('frames').length - 1)) {
                this.set('frameIndex', frameIndex + 1);
            }
            // TODO: It may be better to intercept transition events, once exp-player pagination mechanism is fleshed out
            this.send('setTimeEvent', 'nextFrame', frameIndex); //{additionalKey: 'this is a sample event'});
        },
        previous() {
            console.log('previous');

            var frameIndex = this.get('frameIndex');
            if (frameIndex !== 0) {
                this.set('frameIndex', frameIndex - 1);
            }
        },
        last() {
            // TODO
            console.log('last');
        },
        skipTo(index) {
            this.set('frameIndex', index);
        }
    }
});
