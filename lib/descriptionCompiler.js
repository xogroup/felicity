'use strict';

const Joi = require('joi');

module.exports = (description) => {

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

    return base;
};
