'use strict';

const getDefault = function (schemaDescription) {

    if (schemaDescription.flags.default !== null && typeof schemaDescription.flags.default === 'function') {
        return schemaDescription.flags.default();
    }

    return schemaDescription.flags.default;
};

const pickRandomFromArray = function (array) {

    return array[Math.floor(Math.random() * array.length)];
};

module.exports = {
    pickRandomFromArray,
    getDefault
};
