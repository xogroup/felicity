'use strict';

const Hoek         = require('hoek');
const Joi          = require('./joi');
const JoiGenerator = require('./joiGenerator');
const Example      = require('./exampleGenerator');

const entityFor = function (schema, options) {

    if (!schema) {
        throw new Error('You must provide a Joi schema');
    }

    if (!schema.isJoi) {
        schema = Joi.compile(schema);
    }

    const schemaDescription = schema.describe();

    if (schemaDescription.type !== 'object') {
        throw new Error('Joi schema must describe an object for constructor functions');
    }


    const validateInput = function (input, callback, override) {

        const baseConfig = {
            abortEarly: false
        };

        const config = Object.assign({}, baseConfig, override);

        const result = Joi.validate(input, Constructor.schema, config);

        const validationResult = {
            success: result.error === null,
            errors : result.error && result.error.details,
            value  : result.value
        };

        if (callback && validationResult.success) {
            callback(null, validationResult);
        }
        else if (callback) {
            callback(validationResult.errors, null);
        }
        else {
            return validationResult;
        }
    };

    class Constructor {

        constructor(input) {

            const configurations = options || {};

            if (input) {
                configurations.input = input;
            }

            if (Hoek.reach(configurations, 'config.strictExample')) {
                Object.defineProperty(this, 'strictExample', {
                    value: true
                });
            }

            JoiGenerator(this, schema, configurations);
        }

        get schema() {

            return schema;
        }

        validate(callback, config) {

            return validateInput(this, callback, config);
        }

        example(config) {

            const configurations = config || {};

            configurations.config = configurations.config || {};
            configurations.config.strictExample = this.strictExample || configurations.config.strictExample;

            return Example(this.schema, configurations);
        }

        static get schema() {

            return schema;
        }

        static validate(input, callback, config) {

            return validateInput(input, callback);
        }

        static example(config) {

            const configurations = config || {};

            configurations.config = configurations.config || {};

            return Example(this.schema, configurations);
        }
    }

    return Constructor;
};

const Felicity = {
    example: Example,
    entityFor
};

module.exports = Felicity;
