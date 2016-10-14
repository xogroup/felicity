'use strict';

const Joi          = require('joi');
const JoiGenerator = require('./joiGenerator');
const Example      = require('./exampleGenerator');

const example = Example;

const skeleton = function (schema, input) {

    Object.defineProperty(this, 'schema', {
        value: schema
    });

    JoiGenerator.call(this, schema, input);
};

skeleton.prototype.validate = function (callback) {

    const result = Joi.validate(this, this.schema, {
        abortEarly: false
    });

    const validationResult = {
        success: result.error === null,
        errors : result.error && result.error.details
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

skeleton.prototype.example = function () {

    return Example(this.schema);
};

module.exports = {
    skeleton,
    example
};
