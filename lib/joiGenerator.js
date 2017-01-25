'use strict';

const Hoek = require('hoek');
const Joi  = require('./joi');
const DescribeSchema = require('./helpers').describeSchema;

const internals = {};

internals.joiDictionary = {
    string      : null,
    boolean     : false,
    date        : null,
    binary      : null,
    number      : 0,
    array       : [],
    object      : {},
    alternatives: null,
    any         : null
};

internals.reachDelete = function (target, path) {

    const splitPath = path.split('.');
    if (splitPath.length === 1) {
        delete target[splitPath[0]];
    }
    else {
        const newTarget = target[splitPath[0]];
        const newPath = splitPath.slice(1).join('.');
        const newPathExists = Hoek.reach(newTarget, newPath) !== undefined;

        if (newPathExists) {
            internals.reachDelete(newTarget, newPath);
        }
    }
};

const generate = function (schemaInput, options) {

    const self = this;
    let input = Hoek.reach(options, 'input');
    const config = Hoek.reach(options, 'config');
    const ignoreDefaults  = Hoek.reach(config, 'ignoreDefaults');

    const schemaMapper = function (target, schema) {

        const schemaDescription = DescribeSchema(schema);

        if (schemaDescription.children) {
            const childrenKeys = Object.keys(schemaDescription.children);

            childrenKeys.forEach((childKey) => {

                const childIsOptional = Hoek.reach(schemaDescription.children[childKey], 'flags.presence') === 'optional';
                const childIsForbidden = Hoek.reach(schemaDescription.children[childKey], 'flags.presence') === 'forbidden';

                if (childIsForbidden || (childIsOptional && !(Hoek.reach(config, 'includeOptional')))) {
                    return;
                }

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
                        const trueHasDefault = Hoek.reach(trueCase, 'flags.default');
                        target[childKey] = (trueHasDefault && !ignoreDefaults) ?
                            trueHasDefault :
                            Hoek.clone(internals.joiDictionary[trueCase.type]);
                    }
                }
                else {
                    const childHasDefault = Hoek.reach(schemaDescription.children[childKey], 'flags.default');
                    target[childKey] = (childHasDefault && !ignoreDefaults) ?
                        childHasDefault :
                        Hoek.clone(internals.joiDictionary[childType]);
                }
            });
        }
    };

    schemaMapper(self, schemaInput);

    if (input) {
        const validateOptions = {
            stripUnknown: true,
            abortEarly  : false
        };

        const validation = Joi.validate(input, schemaInput, validateOptions);

        input = validation.value;

        if (Hoek.reach(config, 'strictInput')) {
            const invalidInputValues = Hoek.reach(validation, 'error.details');

            if (invalidInputValues) {
                invalidInputValues.forEach((error) => {

                    internals.reachDelete(input, error.path);
                });
            }
        }

        Hoek.merge(this, input);
    }
};

module.exports = generate;
