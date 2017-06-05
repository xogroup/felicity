'use strict';

const Hoek = require('hoek');
const Joi  = require('./joi');

const getDefault = function (schemaDescription, rawSchema) {

    // TODO: Can be refactored away from _flags when Joi descriptions include dynamic defaults
    if (typeof Hoek.reach(rawSchema, '_flags.default') === 'function') {
        return rawSchema._flags.default();
    }

    return schemaDescription.flags.default;
};

const pickRandomFromArray = function (array) {

    return array[Math.floor(Math.random() * array.length)];
};

// Generate Joi object from description
const descriptionCompiler = function (description) {

    let base = Joi[description.type]();

    if (description.rules) {
        description.rules.forEach((rule) => {

            if (rule.arg !== undefined && rule.arg.pattern !== undefined) {
                base = base[rule.name](rule.arg.pattern);
            }
            else if (rule.arg !== undefined) {
                base = base[rule.name](rule.arg);
            }
            else {
                base = base[rule.name]();
            }
        });
    }

    if (description.flags) {
        Object.keys(description.flags).forEach((flag) => {

            if (flag === 'presence') {
                base = base[description.flags[flag]]();
            }
            else if (flag === 'allowOnly' && description.valids) {
                description.valids.forEach((validValue) => {

                    base = base.valid(validValue);
                });
            }
            else {
                if (typeof base[flag] === 'function') {
                    base = base[flag](description.flags[flag]);
                }
            }
        });
    }

    if (description.children) {
        const keys = {};

        Object.keys(description.children).forEach((childKey) => {

            keys[childKey] = descriptionCompiler(description.children[childKey]);
        });

        base = base.keys(keys);
    }

    return base;
};

module.exports = {
    descriptionCompiler,
    pickRandomFromArray,
    getDefault
};
