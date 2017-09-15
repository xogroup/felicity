'use strict';

const Hoek = require('hoek');
const Joi  = require('./joi');
const Helpers = require('./helpers');

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

internals.reachDelete = function (target, splitPath) {

    if (!Array.isArray(splitPath)) {
        splitPath = [splitPath];
    }

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

const generate = function (instance, schemaInput, options) {

    let input = Hoek.reach(options, 'input');
    const config = Hoek.reach(options, 'config');
    const ignoreDefaults  = Hoek.reach(config, 'ignoreDefaults');

    const schemaMapper = function (target, schema) {

        const schemaDescription = schema.describe();

        if (schemaDescription.children) {
            const parentPresence = Hoek.reach(schemaDescription, 'options.presence');
            const childrenKeys = Object.keys(schemaDescription.children);

            childrenKeys.forEach((childKey) => {

                const childSchemaDescription = schemaDescription.children[childKey];
                const flagsPresence = Hoek.reach(childSchemaDescription, 'flags.presence');
                const childIsRequired = flagsPresence === 'required';
                const childIsOptional = (flagsPresence === 'optional') || (parentPresence === 'optional' && !childIsRequired);
                const childIsForbidden = flagsPresence === 'forbidden';

                if (childIsForbidden || (childIsOptional && !(Hoek.reach(config, 'includeOptional')))) {
                    return;
                }

                const childType = childSchemaDescription.type;
                const childSchemaRaw = schema._inner.children.filter((child) => {

                    return child.key === childKey;
                })[0].schema;

                if (childType === 'object') {
                    target[childKey] = {};
                    schemaMapper(target[childKey], childSchemaRaw);
                }
                else if (childType === 'alternatives') {

                    const hasTrueCase = childSchemaDescription.alternatives.filter((option) => {

                        return option.ref && option.then;
                    }).length > 0;
                    const chosenAlternative = hasTrueCase ?
                        childSchemaDescription.alternatives[0].then :
                        childSchemaDescription.alternatives[0];

                    if (chosenAlternative.type === 'object') {
                        target[childKey] = {};
                        schemaMapper(target[childKey], Helpers.descriptionCompiler(chosenAlternative));
                    }
                    else {
                        const alternativeHasDefault = Hoek.reach(chosenAlternative, 'flags.default');
                        target[childKey] = (alternativeHasDefault && !ignoreDefaults) ?
                            Helpers.getDefault(chosenAlternative, Helpers.descriptionCompiler(chosenAlternative)) :
                            Hoek.clone(internals.joiDictionary[chosenAlternative.type]);
                    }
                }
                else {
                    const childHasDefault = Hoek.reach(childSchemaDescription, 'flags.default');
                    target[childKey] = (childHasDefault && !ignoreDefaults) ?
                        Helpers.getDefault(childSchemaDescription, childSchemaRaw) :
                        Hoek.clone(internals.joiDictionary[childType]);
                }
            });
        }
    };

    schemaMapper(instance, schemaInput);

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

        Hoek.merge(instance, input);
    }
};

module.exports = generate;
