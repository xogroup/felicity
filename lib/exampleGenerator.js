'use strict';

const Hoek = require('hoek');
const Joi = require('./joi');
const Helpers = require('./helpers');
const ValueGenerator = Helpers.valueGenerator;

const exampleGenerator = function (schema, options) {

    const exampleResult = ValueGenerator(schema, options);

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
