import Ember from 'ember';


import {moduleForModel, test} from 'ember-qunit';

moduleForModel('experiment', 'Unit | Model | experiment', {
    // Specify the other units that are required for this test.
    needs: ['model:history'],

    beforeEach() {
        this.experiment = this.subject({
            eligibilityMinAge: '4 months',
            eligibilityMaxAge: '14 months'
        });
    }
});

test('Eligibility methods reject a participant who is too young', function(assert) {
    // Stub participant with age reported in days
    const age = 30;
    const participant = Ember.Object.create({age: age});

    const ageCheck = this.experiment._ageCheck(age);
    assert.ok(ageCheck < 0);
    assert.notOk(this.experiment.isEligible(participant));
    assert.notOk(this.experiment.isOldEnough(participant));
});

test('Eligibility methods accept a participant in range', function(assert) {
    // Stub participant with age reported in days
    const age = 180;
    const participant = Ember.Object.create({age: age});

    const ageCheck = this.experiment._ageCheck(age);
    assert.equal(ageCheck, 0);
    assert.ok(this.experiment.isEligible(participant));
    assert.ok(this.experiment.isOldEnough(participant));
});

test('Eligibility methods reject a participant who is too old', function(assert) {
    // Stub participant with age reported in days
    const age = 1000;
    const participant = Ember.Object.create({age: age});

    const ageCheck = this.experiment._ageCheck(age);
    assert.ok(ageCheck > 0);
    assert.notOk(this.experiment.isEligible(participant));
    assert.ok(this.experiment.isOldEnough(participant));
});
