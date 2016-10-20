'use strict';

const Hoek = require('hoek');
const ValueGenerator = require('./valueGenerator');

const exampleGenerator = function (schema, options) {

    const schemaDescription = schema.describe();
    let schemaType = schemaDescription.type;

    if (schemaType === 'object' && Hoek.reach(schemaDescription, 'flags.func')) {
        schemaType = 'func';
    }

    return ValueGenerator[schemaType](schemaDescription, options);
};

module.exports = exampleGenerator;
