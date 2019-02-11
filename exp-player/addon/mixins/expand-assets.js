import Ember from 'ember';

let {
    $
} = Ember;

/**
 * @module exp-player
 * @submodule mixins
 */

/**
 * Allow components to specify fullscreen capabilities based on minimal configuration options
 * @class ExpandAssets
 */
export default Ember.Mixin.create({
    /**
     * Object describing which properties may need expansion
     * @property {String} assetsToExpand
     */
    assetsToExpand: {},

    meta: {
        parameters: {
            type: 'object',
            properties: {
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
        }
    },

    // Utility to expand stubs into either full URLs (for images) or
    // array of {src: 'url', type: 'MIMEtype'} objects (for audio/video).
    expandAsset(asset, type) {
        var fullAsset = asset;
        var _this = this;

        var typesDict = {
            'audio': this.get('audioTypes'),
            'video': this.get('videoTypes')
            };

        switch (type) {
          case 'image':
            if (typeof asset === 'string' && !(asset.includes('://'))) {
                // Image: replace stub with full URL if needed
                fullAsset = this.baseDir + 'img/' + asset;
            }
            return fullAsset;
            break;
          case 'audio':
          case 'video':
            var types = typesDict[type];
            // Replace any string sources with the appropriate expanded source objects
            if (typeof asset === 'string' && asset) {
                fullAsset = [];
                for (var iType = 0; iType < types.length; iType++) {
                    fullAsset.push({
                        src: _this.baseDir + types[iType] + '/' + asset + '.' + types[iType],
                        type: type + '/' + types[iType]
                    });
                }
            }
            return fullAsset;
            break;
          default:
            throw "Unrecognized type of asset to expand. Options are 'image', 'audio', and 'video'.";
        }
    },



    didInsertElement() {

        this._super(...arguments);

        var _this = this;
        var assetTypes = ['audio', 'video', 'image'];

        assetTypes.forEach((type) => {
            if (_this.get('assetsToExpand', {}).hasOwnProperty(type)) {
                var srcParameterNames = _this.get('assetsToExpand', {})[type];
                srcParameterNames.forEach((paraName) => {
                    var paraPieces = paraName.split('/');
                    if (paraPieces.length == 1) { // If we have the full parameter name, just expand that param
                        var sources = _this.get(paraName);
                        if (sources) {
                            _this.set(paraName + '_parsed', _this.expandAsset(sources, type));
                        }
                    } else if (paraPieces.length == 2) {
                        // If we have something of the form parameterName/propName,
                        // we want to process either this[parameterName][propName] for
                        // an object, or this[parameterName][i][propName] for all i for a
                        // list.
                        var baseName = paraPieces[0];
                        var propName = paraPieces[1]; //paraPieces.slice(1,).join('/');
                        var sources = _this.get(baseName, {});
                        if (sources) {
                            if (Array.isArray(sources)) {  //expand this[parameterName][i][propName] for all i
                                sources.forEach( (elem) => {
                                    if (elem.hasOwnProperty(propName)) {
                                        elem[propName] = _this.expandAsset(elem[propName], type);
                                    }
                                });
                                _this.set(baseName + '_parsed', sources);
                            } else { //expand this[parameterName][propName]
                                if (sources.hasOwnProperty(propName)) {
                                    sources[propName] = _this.expandAsset(sources[propName], type);
                                }
                                _this.set(baseName + '_parsed', sources);
                            }
                        }
                    } else { // Have something like 'a/b/c' with two or more slashes, not handled yet
                        throw "Nesting of parameter names to expand beyond two levels not supported (max one slash).";
                    }

                });
            }
        });
    }

});
