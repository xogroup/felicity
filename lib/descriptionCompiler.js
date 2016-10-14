'use strict';

const Joi = require('joi');

module.exports = function descriptionCompiler(description) {

    let base = Joi[description.type]();

    if (description.rules) {
        description.rules.forEach((rule) => {

            if (rule.arg !== undefined) {
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
                base = base[flag](description.flags[flag]);
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
