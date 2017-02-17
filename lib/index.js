'use strict';

const Hoek         = require('hoek');
const Joi          = require('./joi');
const JoiGenerator = require('./joiGenerator');
const Example      = require('./exampleGenerator');
const DescribeSchema = require('./helpers').describeSchema;

const example = Example;

const internals = {};

internals.skeleton = function (schema, options) {

    JoiGenerator.call(this, schema, options);
};

internals.skeleton.validate = function (input, callback) {

    const result = Joi.validate(input, this.prototype.schema, {
        abortEarly: false
    });

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

internals.skeleton.prototype.validate = function (callback) {

    return this.constructor.validate(this, callback);
};

internals.skeleton.example = function (options) {

    return Example(this.prototype.schema, options);
};

internals.skeleton.prototype.example = function (options) {

    const configurations = options || {};

    configurations.config = configurations.config || {};
    configurations.config.strictExample = this.strictExample || configurations.config.strictExample;

    return this.constructor.example(configurations);
};

const entityFor = function (schema, options) {

    if (!schema) {
        throw new Error('You must provide a Joi schema');
    }

    const schemaDescription = DescribeSchema(schema);

    if (schemaDescription.type !== 'object') {
        throw new Error('Joi schema must describe an object for constructor functions');
    }

    const Constructor = function (input) {

        const self = this;

        Hoek.assert(self instanceof Constructor, 'Objects must be instantiated using new');

        const configurations = options || {};

        if (input) {
            configurations.input = input;
        }

        if (Hoek.reach(configurations, 'config.strictExample')) {
            Object.defineProperty(self, 'strictExample', {
                value: true
            });
        }

        internals.skeleton.call(self, schema, configurations);
    };

    Constructor.prototype = Object.create(internals.skeleton.prototype);
    Constructor.prototype.constructor = Constructor;

    Object.keys(internals.skeleton).forEach((staticProp) => {

        Constructor[staticProp] = internals.skeleton[staticProp];
    });

    Constructor.prototype.schema = schema;

    return Constructor;
};

const Felicity = {
    example,
    entityFor
};

module.exports = Felicity;
