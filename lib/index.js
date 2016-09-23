'use strict';

const Joi          = require('joi');
const JoiGenerator = require('./joiGenerator');

const skeleton = function (schema, input) {

    //this.schema = schema;

    JoiGenerator.call(this, schema, input);
};

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
