'use strict';

const Uuid = require('uuid');

const string = function (schema) {

    const schemaDescription = schema.type ? schema : schema.describe();
    let stringResult =  Math.random().toString(36).substr(2);

    if (schemaDescription.rules) {

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
    let numberResult = Math.random() * 5;

    if (schemaDescription.rules) {

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
            numberResult = numberResult + options.min;
        }

        if (options.max) {
            numberResult = Math.random() * options.max;
        }

        if (options.negative) {
            numberResult = 0 - numberResult;
        }

        if (options.integer) {
            numberResult = Math.ceil(numberResult);
        }

        if (options.precision !== undefined) {
            numberResult = Number(numberResult.toFixed(options.precision));
        }

        if (options.multiple) {
            numberResult = Math.ceil(numberResult) * options.multiple;
        }
    }

    return numberResult;
};

const valueGenerator = {
    string,
    number
};

module.exports = valueGenerator;
