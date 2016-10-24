'use strict';

const Hoek = require('hoek');
const Joi = require('joi');
const ValueGenerator = require('./valueGenerator');

const exampleGenerator = function (schema, options) {

    const schemaDescription = schema.describe();
    let schemaType = schemaDescription.type;

    if (schemaType === 'object' && Hoek.reach(schemaDescription, 'flags.func')) {
        schemaType = 'func';
    }

    const exampleResult = ValueGenerator[schemaType](schemaDescription, options);

    if (Hoek.reach(options, 'config.strictExample')) {
        const validationResult = Joi.validate(exampleResult, schema, {
            abortEarly: false
        });

        if (validationResult.error) {
            throw validationResult.error;
        }
    }
    return exampleResult;
};

module.exports = exampleGenerator;
