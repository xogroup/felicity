'use strict';

const Hoek = require('hoek');
const Joi  = require('joi');
const RandExp = require('randexp');
const Uuid = require('uuid');

const internals = {};

internals.pickRandomFromArray = function (array) {

    return array[Math.floor(Math.random() * array.length)];
};

internals.luhnCard = function () {

    let creditCardNumber = '';
    let sum = 0;

    while (creditCardNumber.length < 11) {
        const randomInt = Math.floor(Math.random() * 10);

        creditCardNumber = randomInt.toString() + creditCardNumber;

        if (creditCardNumber.length % 2 !== 0) {
            const doubleInt = randomInt * 2;
            const digit = doubleInt > 9 ?
            doubleInt - 9 :
                doubleInt;

            sum = sum + digit;
        }
        else {
            sum = sum + randomInt;
        }
    }

    const guardDigit = (sum * 9) % 10;

    return creditCardNumber + guardDigit.toFixed();
};

internals.any = function (schema, options) {

    const schemaDescription = schema.type ? schema : schema.describe();
    let anyResult = internals.string(schema, options);

    if (Hoek.reach(schemaDescription, 'valids')) {
        anyResult = internals.pickRandomFromArray(schemaDescription.valids);
    }
    else if (Hoek.reach(schemaDescription, 'examples')) {
        anyResult = internals.pickRandomFromArray(schemaDescription.examples);
    }

    return anyResult;
};

internals.string = function (schema, options) {

    const schemaDescription = schema.type ? schema : schema.describe();
    let stringResult =  Math.random().toString(36).substr(2);
    let minLength = 1;

    if (Hoek.reach(schemaDescription, 'valids')) {
        stringResult = internals.pickRandomFromArray(schemaDescription.valids);
    }
    else if (Hoek.reach(schemaDescription, 'flags.default') && !(Hoek.reach(options, 'config.ignoreDefaults'))) {
        stringResult = schemaDescription.flags.default;
    }
    else if (schemaDescription.rules) {

        const stringOptions = {};

        schemaDescription.rules.forEach((rule) => {

            stringOptions[rule.name] = rule.arg === undefined ? true : rule.arg;
        });

        if (stringOptions.alphanum) {
            stringResult = new RandExp(/[a-zA-Z0-9]+/).gen();
        }

        if (stringOptions.hostname) {
            const randexp = new RandExp(/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/);
            randexp.max = 5;
            stringResult = randexp.gen();
        }
        else if (stringOptions.token) {
            stringResult = new RandExp(/[a-zA-Z0-9_]+/).gen();
        }
        else if (stringOptions.hex) {
            stringResult = new RandExp(stringOptions.hex).gen();
        }
        else if (stringOptions.creditCard) {
            stringResult = internals.luhnCard();
        }
        else if (stringOptions.regex) {
            stringResult = new RandExp(stringOptions.regex).gen();
        }
        else if (stringOptions.guid) {
            stringResult = Uuid.v4();
        }
        else if (stringOptions.email) {
            const domains = [
                'email.com',
                'gmail.com',
                'example.com',
                'domain.io',
                'email.net'
            ];

            stringResult = stringResult + '@' + internals.pickRandomFromArray(domains);
        }
        else if (stringOptions.isoDate) {
            stringResult = (new Date()).toISOString();
        }
        else if (stringOptions.length) {
            if (stringResult.length < stringOptions.length) {

                while (stringResult.length < stringOptions.length) {

                    stringResult = stringResult + Math.random().toString(36).substr(2);
                }
            }

            stringResult = stringResult.substr(0, stringOptions.length);
        }
        else if (stringOptions.max && stringOptions.min !== undefined) {
            if (stringResult.length < stringOptions.min) {

                while (stringResult.length < stringOptions.min) {

                    stringResult = stringResult + Math.random().toString(36).substr(2);
                }
            }

            const length = stringOptions.min + Math.floor(Math.random() * (stringOptions.max - stringOptions.min));

            stringResult = stringResult.substr(0, length);
        }
        else if (stringOptions.max) {
            if (stringResult.length > stringOptions.max) {

                const length = Math.floor(stringOptions.max * Math.random()) + 1;

                stringResult = stringResult.substr(0, length);
            }
        }
        else {
            if (stringOptions.min !== undefined) {
                minLength = stringOptions.min;
            }

            if (stringResult.length < minLength) {

                while (stringResult.length < stringOptions.min) {

                    stringResult = stringResult + Math.random().toString(36).substr(2);
                }
            }

            const length = Math.ceil(minLength * (Math.random() + 1)) + 1;

            stringResult = stringResult.substr(0, length);
        }
    }

    return stringResult;
};

internals.number = function (schema, options) {

    const schemaDescription = schema.type ? schema : schema.describe();

    let incrementor = 1;
    let min = 1;
    let max = 5;
    let numberResult = Math.random() + incrementor;
    let impossible = false;

    if (Hoek.reach(schemaDescription, 'flags.allowOnly')) {
        numberResult = internals.pickRandomFromArray(schemaDescription.valids);
    }
    else if (Hoek.reach(schemaDescription, 'flags.default') !== undefined && !(Hoek.reach(options, 'config.ignoreDefaults'))) {
        numberResult = schemaDescription.flags.default;
    }
    else if (schemaDescription.rules) {

        const numberOptions = {};

        schemaDescription.rules.forEach((rule) => {

            if (rule.name === 'greater') {
                rule.name = 'min';
            }
            else if (rule.name === 'less') {
                rule.name = 'max';
            }

            numberOptions[rule.name] = rule.arg === undefined ? true : rule.arg;
        });

        if (numberOptions.min) {
            min = numberOptions.min;

            if (numberOptions.max === undefined && min > max) {
                max = min + incrementor + 5;
            }
        }

        if (numberOptions.max) {
            max = numberOptions.max;
        }

        if (numberOptions.negative) {
            if ((numberOptions.min && numberOptions.min > 0) || (numberOptions.max && numberOptions.max > 0)) {
                impossible = true;
            }
            else {
                numberResult = 0 - numberResult;
                incrementor = 0 - incrementor;

                if (numberOptions.min !== undefined && numberOptions.max === undefined) {
                    max = 0;
                }
                else if (numberOptions.max !== undefined && numberOptions.min === undefined) {
                    min = numberOptions.max - 5;
                }
                else if (numberOptions.min === undefined && numberOptions.max === undefined) {
                    min = 0 - max;
                    max = 0 - min;
                }
            }
        }

        if (numberOptions.multiple) {
            if (numberOptions.max === undefined && numberOptions.negative === undefined && (max - min) < numberOptions.multiple) {
                max = max * numberOptions.multiple;
            }
            else if (numberOptions.max === undefined && max < numberOptions.multiple) {
                max = max + numberOptions.multiple;
            }
            else if (numberOptions.negative === undefined && max <= numberOptions.multiple) {
                impossible = true;
            }

            if (numberOptions.negative && numberOptions.min === undefined) {
                min = min - numberOptions.multiple;
            }
            else if (numberOptions.negative && Math.abs(min) <= numberOptions.multiple) {
                impossible = true;
            }

            incrementor = numberOptions.negative ? 0 - numberOptions.multiple : numberOptions.multiple;
            const newResult = numberOptions.negative ? -1 : 1;

            numberResult = newResult * numberOptions.multiple;
        }

        if (numberOptions.integer) {
            numberResult = Math.ceil(numberResult);
        }

        if (numberOptions.precision !== undefined) {
            let fixedDigits = numberResult.toFixed(numberOptions.precision);

            if (fixedDigits.split('.')[1] === '00') {
                fixedDigits = fixedDigits.split('.').map((digitSet, index) => {

                    return index === 0 ?
                        digitSet :
                        '05';
                }).join('.');
            }
            numberResult = Number(fixedDigits);
        }

        if (!impossible && !(numberResult > min && numberResult < max)) {
            while (!(numberResult > min && numberResult < max)) {
                numberResult += incrementor;
            }
        }
    }

    return impossible ? NaN : numberResult;
};

internals.boolean = function (schema) {

    const schemaDescription = schema.type ? schema : schema.describe();
    const booleanResult = Math.random() > 0.5;
    const defaultValue = schemaDescription.flags && schemaDescription.flags.default;

    return defaultValue === undefined ? booleanResult : defaultValue;
};

internals.binary = function (schema) {

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
        else {
            bufferSize = Math.ceil(bufferOptions.max * Math.random());
        }
    }

    const encodingFlag = Hoek.reach(schemaDescription, 'flags.encoding');
    const encoding = encodingFlag || 'utf8';
    const bufferResult = Buffer.alloc(bufferSize, Math.random().toString(36).substr(2));

    return encodingFlag ? bufferResult.toString(encoding) : bufferResult;
};

internals.date = function (schema) {

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

internals.func = function () {

    return function (param1) {};
};

internals.array = function (schema) {

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

internals.object = function (schema, options) {

    const schemaDescription = schema.describe ? schema.describe() : schema;
    const objectResult = {};

    if (schemaDescription.children) {
        Object.keys(schemaDescription.children).forEach((childKey) => {

            const childSchema = schemaDescription.children[childKey];
            const childIsOptional = Hoek.reach(childSchema, 'flags.presence') === 'optional';
            const childIsForbidden = Hoek.reach(childSchema, 'flags.presence') === 'forbidden';
            const shouldStrip = Hoek.reach(childSchema, 'flags.strip');

            if (shouldStrip || childIsForbidden || (childIsOptional && !(Hoek.reach(options, 'config.includeOptional')))) {
                return;
            }

            const childOptions = {
                schemaDescription,
                objectResult,
                config: Hoek.reach(options, 'config')
            };
            objectResult[childKey] = valueGenerator[childSchema.type](childSchema, childOptions);
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
        else {
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

            if (dependency.type === 'with') {
                objectDependencies[dependency.type] = {
                    peers: dependency.peers,
                    key  : dependency.key
                };
            }
            else {
                objectDependencies[dependency.type] = dependency.peers;
            }
        });

        if (objectDependencies.nand || objectDependencies.xor || objectDependencies.without) {
            const peers = objectDependencies.nand || objectDependencies.xor || objectDependencies.without;

            if (peers.length > 1) {
                peers.splice(Math.floor(Math.random() * peers.length), 1);
            }

            peers.forEach((keyToDelete) => {

                delete objectResult[keyToDelete];
            });
        }

        if (objectDependencies.with && Hoek.reach(objectResult, objectDependencies.with.key) !== undefined) {
            objectDependencies.with.peers.forEach((peerKey) => {

                if (Hoek.reach(objectResult, peerKey) === undefined) {
                    const peerSchema = Joi.reach(descriptionCompiler(schemaDescription), peerKey).describe();

                    const peerOptions = {
                        schemaDescription,
                        objectResult,
                        config: Hoek.reach(options, 'config')
                    };
                    objectResult[peerKey] = valueGenerator[peerSchema.type](peerSchema, peerOptions);
                }
            });
        }
    }

    return objectResult;
};

internals.alternatives = function (schema, options) {

    const schemaDescription = schema.describe ? schema.describe() : schema;
    const hydratedParent = Hoek.reach(options, 'objectResult');
    let resultSchema;

    if (schemaDescription.alternatives.length > 1) {
        const potentialValues = schemaDescription.alternatives;
        resultSchema = internals.pickRandomFromArray(potentialValues);
    }
    else {
        if (schemaDescription.alternatives[0].ref) {
            const driverPath = schemaDescription.alternatives[0].ref.split(':')[1];
            const driverValue = Hoek.reach(hydratedParent, driverPath);

            let driverIsTruthy = false;
            Joi.validate(driverValue, descriptionCompiler(schemaDescription.alternatives[0].is), (err) => {

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

    return valueGenerator[resultSchema.type](resultSchema, options);

};

const descriptionCompiler = function (description) {

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

const valueGenerator = {
    any         : internals.any,
    string      : internals.string,
    number      : internals.number,
    boolean     : internals.boolean,
    binary      : internals.binary,
    date        : internals.date,
    func        : internals.func,
    array       : internals.array,
    object      : internals.object,
    alternatives: internals.alternatives
};

module.exports = {
    descriptionCompiler,
    valueGenerator
};
