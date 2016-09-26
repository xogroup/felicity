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

        if (schema.isJoi || schema.type) {
            const schemaDescription = schema.isJoi ?
                schema.describe() :
                schema;

            if (schemaDescription.type === 'object' && schemaDescription.children) {
                const childrenKeys = Object.keys(schemaDescription.children);

                childrenKeys.forEach((childKey) => {

                    const childType = schemaDescription.children[childKey].type;

                    if (childType === 'object') {
                        target[childKey] = {};
                        schemaMapper(target[childKey], schemaDescription.children[childKey]);
                    }
                    else if (childType === 'alternatives') {

                        const trueCase = schemaDescription.children[childKey].alternatives[0].then;

                        if (trueCase.type === 'object') {
                            target[childKey] = {};
                            schemaMapper(target[childKey], trueCase);
                        }
                        else {
                            target[childKey] = Hoek.clone(joiDictionary[childType]);
                        }
                    }
                    else {
                        target[childKey] = Hoek.clone(joiDictionary[childType]);
                    }
                });
            }
            else {
                target = Hoek.clone(joiDictionary[schemaDescription.type]);
            }
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
                    target[key] = Hoek.clone(joiDictionary[keyType]);
                }
            });
        }
    };

    schemaMapper(self, schemaInput);

    //Object.keys(schemaInput).forEach((key) => {
    //
    //    if (schemaInput[key]._flags && schemaInput[key]._flags.default) {
    //        self[key] = schemaInput[key]._flags.default;
    //    }
    //});

    if (input) {
        const validateOptions = {
            stripUnknown: true,
            abortEarly  : false
        };

        input = Joi.validate(input, schemaInput, validateOptions).value;

        Hoek.merge(this, input);
    }
};

module.exports = generate;
