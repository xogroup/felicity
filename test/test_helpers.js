'use strict';

const Code = require('code');
const Hoek = require('hoek');
const Joi = require('../lib/joi');
const expect = Code.expect;

const permutations = function (requirements, exclusionSet) {

    const overallSet = {};

    const recursivePermutations = function (requirementSet, cumulativeSet) {

        requirementSet.forEach((currentRequirement, index) => {

            const newCumulativeSet = Hoek.clone(cumulativeSet);

            if (Hoek.intersect(newCumulativeSet, exclusionSet[currentRequirement]).length === 0) {
                newCumulativeSet.push(currentRequirement);

                const stringSet = newCumulativeSet.toString();
                overallSet[stringSet] = true;
            }

            if (requirementSet.slice(index + 1).length > 0) {
                return recursivePermutations(requirementSet.slice(index + 1), newCumulativeSet);
            }
        });
    };

    recursivePermutations(requirements, []);

    return Object.keys(overallSet).map((set) => {

        return set.split(',');
    });
};

const expectValidation = function (value, schema, done) {

    const validationResult = Joi.validate(value, schema);

    expect(validationResult.error).to.equal(null);

    if (done) {
        done();
    }
};

module.exports = {
    permutations,
    expectValidation
};
