'use strict';

const Hoek = require('hoek');
const Joi  = require('joi');

const joiDictionary = {
    string      : null,
    boolean     : false,
    date        : null,
    number      : 0,
    array       : [],
    object      : {},
    alternatives: null
};

const generate = function (schemaInput, input) {

    const self = this;

    //TODO: Implement xor functionality, and alternatives functionality
    if (!schemaInput) {
        throw new Error('You must pass a valid schema to generate');
    }

    const schemaMapper = function (target, schema) {

        if (schema.isJoi) {
            schema._inner.children.map((childSchema) => {

                const keyType = childSchema.schema._type;

                if (childSchema.schema._flags && childSchema.schema._flags.presence === 'optional') {
                    return;
                }
                else if (keyType === 'object' && childSchema.schema._inner && childSchema.schema._inner.children) {
                    target[childSchema.key] = {};
                    schemaMapper(target[childSchema.key], childSchema.schema);
                }
                else {
                    target[childSchema.key] = keyType === 'object' || keyType === 'array' ?
                        JSON.parse(JSON.stringify(joiDictionary[keyType]))
                        : joiDictionary[keyType];
                }
            });
        }
        else {
            Object.keys(schema).map((key) => {

                const keyType = schema[key]._type;

                if (schema[key]._flags && schema[key]._flags.presence === 'optional') {
                    return;
                }
                else if (keyType === 'object' && schema[key]._inner && schema[key]._inner.children) {
                    target[key] = {};
                    schemaMapper(target[key], schema[key]);
                }
                else {
                    target[key] = keyType === 'object' || keyType === 'array' ?
                        JSON.parse(JSON.stringify(joiDictionary[keyType]))
                        : joiDictionary[keyType];
                }
            });
        }
    };

    schemaMapper(self, schemaInput);

    Object.keys(schemaInput).forEach((key) => {

        if (schemaInput[key]._flags && schemaInput[key]._flags.default) {
            self[key] = schemaInput[key]._flags.default;
        }
    });

    if (input) {
        const validateOptions = {
            stripUnknown: true,
            abortEarly  : false
        };

        input = Joi.validate(input, schema, validateOptions).value;

        Hoek.merge(this, input);
    }
};

module.exports = generate;
