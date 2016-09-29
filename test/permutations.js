'use strict';

const Hoek = require('hoek');

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
                requirementSet.slice(index + 1).forEach((requirement, position, set) => {

                    return recursivePermutations(set.slice(position), newCumulativeSet);
                });
            }
        });
    };

    recursivePermutations(requirements, []);

    return Object.keys(overallSet).map((set) => {

        return set.split(',');
    });
};

module.exports = permutations;
