'use strict';

const Joi  = require('./joi');

const getDefault = function (schemaDescription) {
    if (schemaDescription.flags.default !== null && typeof schemaDescription.flags.default === 'function') {
        return schemaDescription.flags.default();
    }
    return schemaDescription.flags.default;
};

const pickRandomFromArray = function (array) {

    return array[Math.floor(Math.random() * array.length)];
};

// Generate Joi object from description
const descriptionCompiler = function (description) {

    let base = description.schema ? Joi[description.schema.type]() : Joi[description.type]();

    if (description.rules) {
        description.rules.forEach((rule) => {
            if (rule.args !== undefined && rule.args.regex !== undefined) {
                const param = typeof rule.args.regex === 'string' ?
                    new RegExp(rule.args.regex, 'i') : rule.args.regex;
                base = base[rule.name](param);
            }
            else if (rule.args !== undefined) {
                const param = ['max', 'min'].includes(rule.name) ? rule.args.limit : rule.args;
                base = base[rule.name](param);
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
            else if (flag === 'allowOnly') {
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

    if (description.keys) {
        const keys = {};

        Object.keys(description.keys).forEach((childKey) => {
            keys[childKey] = descriptionCompiler(description.keys[childKey]);
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
