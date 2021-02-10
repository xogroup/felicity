'use strict';

const Hoek = require('@hapi/hoek');

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

const expectValidation = (expect) => {

    return (value, schema) => {

        const validationResult = schema.validate(value);

        expect(validationResult.error).to.equal(undefined);
    };
};

module.exports = {
    permutations,
    expectValidation
};
