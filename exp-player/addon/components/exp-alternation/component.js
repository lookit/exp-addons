import Ember from 'ember';
import layout from './template';
import ExpFrameBaseComponent from '../../components/exp-frame-base/component';

let {
    $
} = Ember;

export default ExpFrameBaseComponent.extend({
    type: 'exp-alternation',
    layout: layout,
    meta: {
        name: 'ExpAlternation',
        description: 'TODO: a description of this frame goes here.',
        parameters: {
            type: 'object',
            properties: {
                context: {
                    type: 'boolean',
                    description: 'True to use big fat triangle as context, or false to use small skinny triangle as context.',
                    default: true
                },
                altOnLeft: {
                    type: 'boolean',
                    description: 'Whether to put the shape+size alternating stream on the left.',
                    default: true
                }
            }
        },
        data: {
            type: 'object',
            properties: {
                altOnLeft: {
                    type: 'boolean'
                }
            }
        }
    },
    stimTimer: null,

    getRandomElement(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    },

    getRandom(min, max) {
      return Math.random() * (max - min) + min;
    },

    drawTriangles(Lshape, LX, LY, LRot, LFlip, LSize, Rshape, RX, RY, RRot, RFlip, RSize) {
        var leftTriangle = '<use xlink:href="#' + Lshape +
            '" transform=" translate(' + LX + ', ' + LY + ') ' +
            'translate(37.5, 56) rotate(' + LRot + ') ' +
            'scale(' + LFlip * LSize + ')" />';
        var rightTriangle = '<use xlink:href="#' + Rshape +
            '" transform=" translate(' + RX + ', ' + RY + ') ' +
            'translate(162.5, 56) rotate(' + RRot + ') ' +
            'scale(' + RFlip * RSize + ')" />';
        $('#stimuli').html(leftTriangle + rightTriangle);
    },

    clearTriangles() {
        $('#stimuli').html('');
    },

    presentTriangles(msBlank, msPresent, Lshapes, Rshapes, XRange, YRange, rotRange, flipVals, sizeRange, LsizeBase, RsizeBase) {
        // select X and Y positions for each shape
        var LX = this.getRandom(XRange[0], XRange[1]);
        var RX = this.getRandom(XRange[0], XRange[1]);
        var LY = this.getRandom(YRange[0], YRange[1]);
        var RY = this.getRandom(YRange[0], YRange[1]);
        // select rotation, flip, size per shape
        var LRot = this.getRandom(rotRange[0], rotRange[1]);
        var RRot = this.getRandom(rotRange[0], rotRange[1]);
        var LFlip = this.getRandomElement(flipVals);
        var RFlip = this.getRandomElement(flipVals);
        var LSize = this.getRandom(sizeRange[0], sizeRange[1]) * LsizeBase[0];
        var RSize = this.getRandom(sizeRange[0], sizeRange[1]) * RsizeBase[0];


        var frame = this;
        frame.send('setTimeEvent', `exp-alternation:clearTriangles`);
        frame.clearTriangles();
        this.set('stimTimer', window.setTimeout(function() {
            // TODO: switch to a sendTimeEvent action once doing recording
            frame.send('setTimeEvent', `exp-alternation:presentTriangles`, {
                        Lshape: Lshapes[0],
                        LX: LX,
                        LY: LY,
                        LRot: LRot,
                        LFlip: LFlip,
                        LSize: LSize,
                        Rshape: Rshapes[0],
                        RX: RX,
                        RY: RY,
                        RRot: RRot,
                        RFlip: RFlip,
                        RSize: RSize
                    });
            frame.drawTriangles(  Lshapes[0], LX, LY, LRot, LFlip, LSize,
                            Rshapes[0], RX, RY, RRot, RFlip, RSize);
            frame.set('stimTimer', window.setTimeout(function(){
                frame.presentTriangles(   msBlank, msPresent,
                                    Lshapes.reverse(), Rshapes.reverse(),
                                    XRange, YRange, rotRange, flipVals, sizeRange,
                                    LsizeBase.reverse(), RsizeBase.reverse());
            }, msPresent));
        }, msBlank));
    },


    didInsertElement() {
        this._super(...arguments);

        // COUNTERBALANCING (2x2):
        //var context = 'fat'; // or 'skinny' -- whether to use big fat triangle or
        // small skinny triangle as context figure. If 'fat', contrasts are
        // big fat/small fat and big fat/small skinny. If 'skinny', contrasts
        // are big skinny/small skinny and big fat/small skinny.
        //var altOnLeft = true; // whether to put size-and-shape alteration on left

        // Implement counterbalancing conditions...

        var diffShapes = ['fat', 'skinny'];
        var sameShapes;
        if (this.get('context')) {
            sameShapes = ['fat'];
        } else {
            sameShapes = ['skinny'];
        }

        var Lshapes, Rshapes;
        if (this.get('altOnLeft')) {
            Lshapes = diffShapes;
            Rshapes = sameShapes;
        } else {
            Lshapes = sameShapes;
            Rshapes = diffShapes;
        }

        // Constant across CB conditions
        var msBlank = 300;
        var msTriangles = 500;
        var LsizeBase = [1, 0.5];
        var RsizeBase = [1, 0.5];
        var XRange = [-5, 5];
        var YRange = [-5, 5];
        var rotRange = [0, 360];
        var flipVals = [-1, 1];
        var sizeRange = [0.75, 1.2];
        var trialLength = this.get('trialLength');

        this.presentTriangles(msBlank, msTriangles, Lshapes, Rshapes, XRange, YRange, rotRange, flipVals, sizeRange, LsizeBase, RsizeBase);
        var frame = this;
        window.setTimeout(function(){
            window.clearTimeout(frame.get('stimTimer'));
            frame.clearTriangles();
            frame.send('next');
        }, trialLength * 1000);
    }

});
