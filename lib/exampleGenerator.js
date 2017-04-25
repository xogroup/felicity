'use strict';

const Hoek = require('hoek');
const Joi = require('./joi');
const Helpers = require('./helpers');
const ValueGenerator = Helpers.valueGenerator;

const exampleGenerator = function (schema, options) {

    const schemaDescription = schema.describe();
    let exampleResult;

    const hasValids = Hoek.reach(schemaDescription, 'flags.allowOnly') !== undefined;
    const useDefault = Hoek.reach(schemaDescription, 'flags.default') !== undefined && !(Hoek.reach(options, 'config.ignoreDefaults'));
    if (hasValids) {
        exampleResult = Helpers.pickRandomFromArray(schemaDescription.valids);
    }
    else if (useDefault) {
        exampleResult = Helpers.getDefault(schemaDescription, schema);
    }
    else {
        let schemaType = schemaDescription.type;

        if (schemaType === 'object' && Hoek.reach(schemaDescription, 'flags.func')) {
            schemaType = 'func';
        }

        exampleResult = ValueGenerator[schemaType](schema, options);
    }

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
