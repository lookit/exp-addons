import Ember from 'ember';
import layout from '../templates/components/exp-player';

export default Ember.Component.extend({
    layout: layout,
    store: Ember.inject.service('store'),

    frames: null,
    frameIndex: null,
    _last: null,
    ctx: {
        data: {}
    },
    expData: {},
    onInit: function() {
        this.set('frameIndex', this.get('frameIndex') || 0);  // TODO: Is this necessary?
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
        saveFrame(frameId, frameData) {
            // Save the data from a completed frame to the session data item
            var expData = this.get('expData');
            expData[frameId] = frameData;
            this.set('expData', expData);
        },
        saveSession() {
            var payload = {
                profileId: 'experimenter.profiles.prof2',
                experimentId: 'experimenter.experiments.test1',
                expData: this.get('expData'),
                parameters: {IAmTheVery: 'ModelOfAMajorGeneral', information: 'AnimalVegetableMineral'},
                timestamp: new Date(),
            };
            var record = this.get('store').createRecord('session', payload);
            record.save();
        },
        next() {
            console.log('next');

            var frameIndex = this.get('frameIndex');
            if (frameIndex < (this.get('frames').length - 1)) {
                this.set('frameIndex', frameIndex + 1);
            } else {
                // TODO Very ugly hack for demo purposes only: clicking next on final frame acts as a save instead
                this.send('saveSession');
            }
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
        },

    }
});
