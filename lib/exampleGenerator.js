'use strict';

const Hoek = require('@hapi/hoek');
const ValueGenerator = require('./valueGenerator');

const exampleGenerator = function (schema, options) {

    const exampleResult = ValueGenerator(schema, options);

    if (Hoek.reach(options, 'config.strictExample')) {
        const validationResult = schema.validate(exampleResult, {
            abortEarly: false
        });

        if (validationResult.error) {
            throw validationResult.error;
        }
    }

    return exampleResult;
};

module.exports = exampleGenerator;
