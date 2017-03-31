import random from './random';
import shuffle from './shuffle';
import rotate from './rotate';
import next from './next';
import prefphys from './pref-phys';
import prefphyspilot from './pref-phys-pilot';
import prefPhysCalibration from './pref-phys-calibration';
import geometry from './geometry';
import randomParameterSet from './random-parameter-set';
import permute from './permute';

export default {
    random: random,
    shuffle: shuffle,
    rotate: rotate,
    next: next,
    permute: permute,
    prefphys: prefphys,
    prefphyspilot: prefphyspilot,
    'prefphys-calibration': prefPhysCalibration,
    geometry: geometry,
    'random-parameter-set': randomParameterSet
};
