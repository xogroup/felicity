'use strict';

const Hoek = require('hoek');
const Joi  = require('joi');
const Uuid = require('uuid');
const DescriptionCompiler = require('./descriptionCompiler');

const internals = {};

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
                incrementor = 0 - incrementor;

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

const binary = function (schema) {

    const schemaDescription = schema.type ? schema : schema.describe();
    let bufferSize = 10;

    if (schemaDescription.rules) {
        const bufferOptions = {};

        schemaDescription.rules.forEach((rule) => {

            bufferOptions[rule.name] = rule.arg;
        });

        if (bufferOptions.length >= 0) {
            bufferSize = bufferOptions.length;
        }
        else if (bufferOptions.min >= 0 && bufferOptions.max >= 0) {
            bufferSize = bufferOptions.min + Math.floor(Math.random() * (bufferOptions.max - bufferOptions.min));
        }
        else if (bufferOptions.min >= 0) {
            bufferSize = Math.ceil(bufferOptions.min * (Math.random() + 1));
        }
        else if (bufferOptions.max >= 0) {
            bufferSize = Math.ceil(bufferOptions.max * Math.random());
        }
    }

    const encodingFlag = Hoek.reach(schemaDescription, 'flags.encoding');
    const encoding = encodingFlag || 'utf8';
    const bufferResult = Buffer.alloc(bufferSize, Math.random().toString(36).substr(2));
    return encodingFlag ? bufferResult.toString(encoding) : bufferResult;
};

const date = function (schema) {

    const schemaDescription = schema.type ? schema : schema.describe();
    let dateModifier = Math.random() * (new Date()).getTime() / 5;
    let msSinceEpoch = Math.ceil((new Date()).getTime() +  dateModifier);

    if (schemaDescription.rules) {

        const options = {};
        let min = 0;
        let max = (new Date(min + dateModifier)).getTime();

        schemaDescription.rules.forEach((rule) => {

            options[rule.name] = rule.arg;
        });

        if (options.min) {
            min = options.min === 'now' ?
                  (new Date()).getTime() :
                  (new Date(options.min)).getTime();

            if (options.max === undefined) {
                max = min + dateModifier;
            }
        }

        if (options.max) {
            max = options.max === 'now' ?
                (new Date()).getTime()
                : (new Date(options.max)).getTime();

            if (options.min === undefined) {
                min = max - dateModifier;
            }
        }

        dateModifier = Math.random() * (max - min);

        msSinceEpoch = min + dateModifier;
    }

    let dateResult = new Date(msSinceEpoch);

    if (schemaDescription.flags) {
        if (schemaDescription.flags.format) {
            dateResult = dateResult.toISOString();
        }
        else if (schemaDescription.flags.timestamp) {
            dateResult = dateResult.getTime() / Number(schemaDescription.flags.multiplier);
        }
    }

    return dateResult;
};

const func = function () {

    return function (param1) {};
};

const array = function (schema) {

    const schemaDescription = schema.type ? schema : schema.describe();
    const arrayIsSparse = schemaDescription.flags.sparse;
    let arrayResult = [];

    if (!arrayIsSparse) {
        if (schemaDescription.orderedItems) {
            for (let i = 0; i < schemaDescription.orderedItems.length; ++i) {
                const itemType = schemaDescription.orderedItems[i].type;

                const itemExample = valueGenerator[itemType](schemaDescription.orderedItems[i]);

                arrayResult.push(itemExample);
            }
        }

        if (schemaDescription.items) {
            for (let i = 0; i < schemaDescription.items.length; ++i) {
                const itemType = schemaDescription.items[i].type;

                if (!(schemaDescription.items[i].flags && schemaDescription.items[i].flags.presence === 'forbidden')) {
                    const itemExample = valueGenerator[itemType](schemaDescription.items[i]);

                    arrayResult.push(itemExample);
                }
            }
        }

        if (schemaDescription.rules) {
            const arrayOptions = {};

            schemaDescription.rules.forEach((rule) => {

                arrayOptions[rule.name] = rule.arg;
            });

            const itemsToAdd = schemaDescription.items ? schemaDescription.items : [
                {
                    type: 'string'
                },
                {
                    type: 'number'
                }
            ];
            const numberOfOptions = itemsToAdd.length;

            if (arrayOptions.length && arrayResult.length !== arrayOptions.length) {
                if (arrayResult.length > arrayOptions.length) {
                    arrayResult = arrayResult.slice(0, arrayOptions.length);
                }
                else {
                    while (arrayResult.length < arrayOptions.length) {
                        const itemToAdd = itemsToAdd[Math.floor(Math.random() * numberOfOptions)];
                        const itemExample = valueGenerator[itemToAdd.type](itemToAdd);

                        arrayResult.push(itemExample);
                    }
                }
            }

            if (arrayOptions.min && arrayResult.length < arrayOptions.min) {
                while (arrayResult.length < arrayOptions.min) {
                    const itemToAdd = itemsToAdd[Math.floor(Math.random() * numberOfOptions)];
                    const itemExample = valueGenerator[itemToAdd.type](itemToAdd);

                    arrayResult.push(itemExample);
                }
            }

            if (arrayOptions.max && arrayResult.length === 0) {
                const arrayLength = Math.ceil(Math.random() * arrayOptions.max);

                while (arrayResult.length < arrayLength) {
                    const itemToAdd = itemsToAdd[Math.floor(Math.random() * numberOfOptions)];
                    const itemExample = valueGenerator[itemToAdd.type](itemToAdd);

                    arrayResult.push(itemExample);
                }
            }
        }
    }

    return arrayResult;
};

const object = function (schema) {

    const schemaDescription = schema.describe ? schema.describe() : schema;
    const objectResult = {};

    if (schemaDescription.children) {
        Object.keys(schemaDescription.children).forEach((childKey) => {

            const childSchema = schemaDescription.children[childKey];

            if (childSchema.type === 'alternatives' && childSchema.alternatives.length === 1 && childSchema.alternatives[0].ref) {

                // Process driver example first, then continue with alternatives example
                const driverPath = childSchema.alternatives[0].ref.split(':')[1];
                const driverRoot = driverPath.split('.')[0];
                const driverRootSchema = schemaDescription.children[driverRoot];

                objectResult[driverRoot] = objectResult[driverRoot] === undefined ?
                    valueGenerator[driverRootSchema.type](driverRootSchema, schemaDescription, objectResult) :
                    objectResult[driverRoot];
            }

            objectResult[childKey] = objectResult[childKey] === undefined ?
                valueGenerator[childSchema.type](childSchema, schemaDescription, objectResult) :
                objectResult[childKey];
        });
    }

    if (schemaDescription.rules) {
        const objectOptions = {};

        schemaDescription.rules.forEach((rule) => {

            objectOptions[rule.name] = rule.arg;
        });

        let keyCount = 0;

        if (objectOptions.min && Object.keys(objectResult).length < objectOptions.min) {
            keyCount = objectOptions.min;
        }
        else if (objectOptions.max && Object.keys(objectResult).length === 0) {
            keyCount = objectOptions.max - 1;
        }
        else if (objectOptions.length && Object.keys(objectResult).length === 0) {
            keyCount = objectOptions.length;
        }

        while (Object.keys(objectResult).length < keyCount) {
            const randString = Math.random().toString(36).substr(2);

            objectResult[randString.substr(0, 4)] = randString;
        }
    }

    if (schemaDescription.dependencies) {
        const objectDependencies = {};

        schemaDescription.dependencies.forEach((dependency) => {

            objectDependencies[dependency.type] = dependency.peers === undefined ? true : dependency.peers;
        });

        if (objectDependencies.nand || objectDependencies.xor) {
            const peers = objectDependencies.nand || objectDependencies.xor;

            peers.splice(Math.floor(Math.random() * peers.length), 1);

            peers.forEach((keyToDelete) => {

                delete objectResult[keyToDelete];
            });
        }
    }

    return objectResult;
};

const alternatives = function (schema, parentSchema, hydratedParent) {

    const schemaDescription = schema.describe ? schema.describe() : schema;
    let resultSchema;

    if (schemaDescription.alternatives.length > 1) {
        const potentialValues = schemaDescription.alternatives;
        resultSchema = potentialValues[Math.floor(Math.random() * potentialValues.length)];
    }
    else if (schemaDescription.alternatives.length === 1) {
        if (schemaDescription.alternatives[0].ref) {
            const driverPath = schemaDescription.alternatives[0].ref.split(':')[1];
            const driverSchema = internals.schemaReach(parentSchema, driverPath);
            const driverValue = hydratedParent ? Hoek.reach(hydratedParent, driverPath) :
                valueGenerator[driverSchema.type](driverSchema);

            let driverIsTruthy = false;
            Joi.validate(driverValue, DescriptionCompiler(schemaDescription.alternatives[0].is), (err) => {

                if (!err) {
                    driverIsTruthy = true;
                }
            });

            if (driverIsTruthy) {
                resultSchema = schemaDescription.alternatives[0].then;
            }
            else {
                resultSchema = schemaDescription.alternatives[0].otherwise;
            }

        }
        else {
            resultSchema = schemaDescription.alternatives[0];
        }
    }

    return valueGenerator[resultSchema.type](resultSchema);

};

internals.schemaReach = function (parentSchema, childPath) {

    const splitPath = childPath.split('.');

    return parentSchema.children ? (splitPath.length > 1 ?
        internals.schemaReach(parentSchema.children[splitPath[0]], splitPath.slice(1).join('.')) :
        parentSchema.children[splitPath[0]]) :
        null;
};

const valueGenerator = {
    string,
    number,
    boolean,
    binary,
    date,
    func,
    array,
    object,
    alternatives
};

module.exports = valueGenerator;
