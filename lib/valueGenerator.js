'use strict';

const Uuid = require('uuid');

const string = function (schema) {

    const schemaDescription = schema.type ? schema : schema.describe();
    let stringResult =  Math.random().toString(36).substr(2);

    if (schemaDescription.flags && schemaDescription.flags.default) {
        stringResult = schemaDescription.flags.default;
    }
    else if (schemaDescription.rules) {

        const options = {};

        schemaDescription.rules.forEach((rule) => {

            options[rule.name] = rule.arg === undefined ? true : rule.arg;
        });

        if (options.guid) {
            stringResult = Uuid.v4();
        }
        else if (options.email) {
            const domains = [
                'email.com',
                'gmail.com',
                'example.com',
                'domain.io',
                'email.net'
            ];

            stringResult = stringResult + '@' + domains[Math.floor(Math.random() * 5)];
        }
        else if (options.isoDate) {
            return new Date().toISOString();
        }
        else if (options.length) {
            if (stringResult.length < options.length) {

                while (stringResult.length < options.length) {

                    stringResult = stringResult + Math.random().toString(36).substr(2);
                }
            }

            stringResult = stringResult.substr(0, options.length);
        }
        else if (options.max && options.min !== undefined) {
            if (stringResult.length < options.min) {

                while (stringResult.length < options.min) {

                    stringResult = stringResult + Math.random().toString(36).substr(2);
                }
            }

            const length = options.min + Math.floor(Math.random() * (options.max - options.min));

            stringResult = stringResult.substr(0, length);
        }
        else if (options.max) {
            if (stringResult.length > options.max) {

                const length = Math.floor(options.max * Math.random()) + 1;

                stringResult = stringResult.substr(0, length);
            }
        }
        else if (options.min !== undefined) {
            if (stringResult.length < options.min) {

                while (stringResult.length < options.min) {

                    stringResult = stringResult + Math.random().toString(36).substr(2);
                }
            }

            const length = Math.ceil(options.min * (Math.random() + 1)) + 1;

            stringResult = stringResult.substr(0, length);
        }
    }

    return stringResult;
};

const number = function (schema) {

    const schemaDescription = schema.type ? schema : schema.describe();

    let incrementor = 1;
    let min = 1;
    let max = 5;
    let numberResult = Math.random() + incrementor;
    let impossible = false;

    if (schemaDescription.flags && schemaDescription.flags.default !== undefined) {
        numberResult = schemaDescription.flags.default;
    }
    else if (schemaDescription.rules) {

        const options = {};

        schemaDescription.rules.forEach((rule) => {

            if (rule.name === 'greater') {
                rule.name = 'min';
            }
            else if (rule.name === 'less') {
                rule.name = 'max';
            }

            options[rule.name] = rule.arg === undefined ? true : rule.arg;
        });

        if (options.min) {
            min = options.min;

            if (options.max === undefined && min > max) {
                max = min + incrementor + 5;
            }
        }

        if (options.max) {
            max = options.max;
        }

        if (options.negative) {
            if ((options.min && options.min > 0) || (options.max && options.max > 0)) {
                impossible = true;
            }
            else {
                numberResult = 0 - numberResult;
                incrementor = incrementor > 0 ? 0 - incrementor : incrementor;

                if (options.min !== undefined && options.max === undefined) {
                    max = 0;
                }
                else if (options.max !== undefined && options.min === undefined) {
                    min = options.max - 5;
                }
                else if (options.min === undefined && options.max === undefined) {
                    min = 0 - max;
                    max = 0 - min;
                }
            }
        }

        if (options.multiple) {
            if (options.max === undefined && options.negative === undefined && (max - min) < options.multiple) {
                max = max * options.multiple;
            }
            else if (options.max === undefined && max < options.multiple) {
                max = max + options.multiple;
            }
            else if (options.negative === undefined && max <= options.multiple) {
                impossible = true;
            }

            if (options.negative && options.min === undefined) {
                min = min - options.multiple;
            }
            else if (options.negative && Math.abs(min) <= options.multiple) {
                impossible = true;
            }

            incrementor = options.negative ? 0 - options.multiple : options.multiple;
            const newResult = options.negative ? -1 : 1;

            numberResult = newResult * options.multiple;
        }

        if (options.integer) {
            numberResult = Math.ceil(numberResult);
        }

        if (options.precision !== undefined) {
            numberResult = Number(numberResult.toFixed(options.precision));
        }

        if (!impossible && !(numberResult > min && numberResult < max)) {
            while (!(numberResult > min && numberResult < max)) {
                numberResult += incrementor;
            }
        }
    }

    return impossible ? NaN : numberResult;
};

const boolean = function (schema) {

    const schemaDescription = schema.type ? schema : schema.describe();
    const booleanResult = Math.random() > 0.5;
    const defaultValue = schemaDescription.flags && schemaDescription.flags.default;

    return defaultValue === undefined ? booleanResult : defaultValue;
};

const valueGenerator = {
    string,
    number,
    boolean
};

module.exports = valueGenerator;
