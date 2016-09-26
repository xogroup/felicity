'use strict';

const Joi          = require('joi');
const JoiGenerator = require('./joiGenerator');

let schemaInput;

const skeleton = function (schema, input) {

    schemaInput = schema;

    JoiGenerator.call(this, schema, input);
};

Object.defineProperty(skeleton.prototype, 'schema', {
    value: schemaInput
});

skeleton.prototype.validate = function () {

    const result = Joi.validate(this, this.schema, {
        abortEarly: false
    });

    return {
        success: result.error === null,
        errors : result.error && result.error.details
    };
};

skeleton.prototype.example = function () {

    return {};
};

module.exports = {
    skeleton
};
