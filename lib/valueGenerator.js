'use strict';

const Hoek = require('hoek');
const Joi  = require('./joi');
const RandExp = require('randexp');
const Uuid = require('uuid');
const Moment = require('moment');
const Helpers = require('./helpers');

const internals = {
    JoiArrayProto : Reflect.getPrototypeOf(Joi.array()),
    JoiBoolProto  : Reflect.getPrototypeOf(Joi.boolean()),
    JoiFuncProto  : Reflect.getPrototypeOf(Joi.func()),
    JoiNumberProto: Reflect.getPrototypeOf(Joi.number())
};

internals.getType = function (schema) {

    const {
        JoiFuncProto,
        JoiNumberProto,
        JoiBoolProto,
        JoiArrayProto
    } = internals;
    const schemaDescription = schema.describe();
    let exampleType = schemaDescription.type;

    if (Examples[exampleType] === undefined) {
        exampleType = 'any';
        if ((schema instanceof JoiNumberProto.constructor)) {
            exampleType = 'number';
        }
        else if ((schema instanceof JoiBoolProto.constructor)) {
            exampleType = 'boolean';
        }
        else if ((schema instanceof JoiArrayProto.constructor)) {
            exampleType = 'array';
        }
        else if ((schema instanceof JoiFuncProto.constructor)) {
            exampleType = 'func';
        }
    }
    else if (exampleType === 'object' && Hoek.reach(schemaDescription, 'flags.func')) {
        exampleType = 'func';
    }

    return exampleType;
};

class Any {

    constructor(schema, options) {

        this._schema = schema;
        this._options = options && options.config;
    }

    generate() {

        const schemaDescription = this._schema.describe();

        if (Hoek.reach(schemaDescription, 'valids')) {
            if (Hoek.reach(this._options, 'ignoreValids') !== true) {
                return Helpers.pickRandomFromArray(schemaDescription.valids);
            }
        }

        if (Hoek.reach(this, '_options.ignoreDefaults') !== true && Hoek.reach(schemaDescription, 'flags.default') !== undefined) {
            return this._getDefaults();
        }

        if (Hoek.reach(schemaDescription, 'examples')) {
            return Helpers.pickRandomFromArray(schemaDescription.examples).value;
        }

        const rules = this._buildRules();

        return this._generate(rules);
    }

    _generate(rules) {

        return Math.random().toString(36).substr(2);
    }

    _buildRules() {

        const rules = this._schema.describe().rules || [];
        const options = {};

        rules.forEach((rule) => {

            options[rule.name] = rule.arg === undefined || rule.arg === null ? true : rule.arg;
        });

        return options;

    }

    _getDefaults() {

        return Helpers.getDefault(this._schema.describe());
    }
}

class StringExample extends Any {

    _generate(rules) {

        const specials = {
            hostname: () => {

                const randexp = new RandExp(/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/);
                randexp.max = 5;
                return randexp.gen();
            },
            token: () => {

                return new RandExp(/[a-zA-Z0-9_]+/).gen();
            },
            hex: () => {

                return new RandExp(rules.hex).gen();
            },
            creditCard: () => {

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
            },
            regex: () => {

                const pattern = rules.regex.invert ? /[a-f]{3}/ : rules.regex.pattern;

                return new RandExp(pattern).gen();
            },
            guid: () => {

                return Uuid.v4();
            },
            ip: () => {

                const possibleResults = [];
                let isIPv4 = true;
                let isIPv6 = false;
                let isCIDR = true;

                if (rules.ip.version) {
                    isIPv4 = rules.ip.version.indexOf('ipv4') > -1;
                    isIPv6 = rules.ip.version.indexOf('ipv6') > -1;
                }

                if (rules.ip.cidr === 'forbidden') {
                    isCIDR = false;
                }

                if (isIPv4) {
                    possibleResults.push('224.109.242.85');

                    if (isCIDR) {
                        possibleResults.push('224.109.242.85/24');
                    }
                }

                if (isIPv6) {
                    possibleResults.push('8194:426e:9389:5963:1a5:9c75:31ae:ccbb');

                    if (isCIDR) {
                        // TODO : this needs to be replaced with a IPv6 CIDR.  I think Joi has issues validating a real CIRD atm.
                        possibleResults.push('8194:426e:9389:5963:1a5:9c75:31ae:ccbb');
                    }
                }

                return possibleResults[Math.floor(Math.random() * (possibleResults.length))];
            },
            email: () => {

                const domains = [
                    'email.com',
                    'gmail.com',
                    'example.com',
                    'domain.io',
                    'email.net'
                ];

                return Math.random().toString(36).substr(2) + '@' + Helpers.pickRandomFromArray(domains);
            },
            isoDate: () => {

                return (new Date()).toISOString();
            },
            uri: () => {

                return `${['http', 'https', 'ftp'][Math.floor(Math.random() * 3)]}://www.${Math.random().toString(36).substr(2)}.${['com', 'net', 'gov'][Math.floor(Math.random() * 3)]}`;
            }
        };

        const specialRules = Hoek.intersect(Object.keys(specials), Object.keys(rules));
        let stringGen = () => Math.random().toString(36).substr(2);

        if (specialRules.length > 0) {
            if (specialRules[0] === 'hex') {
                stringGen = specials[specialRules[0]];
            }
            else {
                return specials[specialRules[0]]();
            }
        }

        let stringResult = stringGen();
        let minLength = 1;

        if (rules.length) {
            if (stringResult.length < rules.length) {

                while (stringResult.length < rules.length) {

                    stringResult = stringResult + stringGen();
                }
            }

            stringResult = stringResult.substr(0, rules.length);
        }
        else if (rules.max && rules.min !== undefined) {
            if (stringResult.length < rules.min) {

                while (stringResult.length < rules.min) {

                    stringResult = stringResult + stringGen();
                }
            }

            const length = rules.min + Math.floor(Math.random() * (rules.max - rules.min));

            stringResult = stringResult.substr(0, length);
        }
        else if (rules.max) {
            if (stringResult.length > rules.max) {

                const length = Math.floor(rules.max * Math.random()) + 1;

                stringResult = stringResult.substr(0, length);
            }
        }
        else if (rules.min) {
            minLength = rules.min;

            if (stringResult.length < minLength) {

                while (stringResult.length < rules.min) {

                    stringResult = stringResult + stringGen();
                }
            }

            const length = Math.ceil(minLength * (Math.random() + 1)) + 1;

            stringResult = stringResult.substr(0, length);
        }

        if (rules.uppercase !== undefined) {
            stringResult = stringResult.toLocaleUpperCase();
        }
        else if (rules.lowercase) {
            stringResult = stringResult.toLocaleLowerCase();
        }

        return stringResult;
    }
}

class NumberExample extends Any {
    _generate(rules) {

        let incrementor = 1;
        let min = 1;
        let max = 5;
        let numberResult;
        let lockMin;
        let lockMax;

        const randNum = (maxVal, minVal, increment) => {

            let rand;
            if (increment > 1) {
                rand = Math.random() * Math.floor((maxVal - minVal) / increment);
            }
            else {
                rand = Math.random() * (maxVal - minVal);
            }

            if (rules.integer !== undefined || rules.multiple !== undefined) {
                return Math.floor(rand) * increment;
            }

            return rand;
        };

        const setMin = (value) => {

            if (lockMin !== true || value > min) {
                min = value;
            }
        };

        const setMax = (value) => {

            if (lockMax !== true || value < max) {
                max = value;
            }
        };

        if (rules.min !== undefined || rules.greater !== undefined) {
            min = rules.min !== undefined ? rules.min : rules.greater + 1;
            lockMin = true;

            if (rules.max === undefined && rules.less === undefined) {
                max = min + 5;
            }
        }

        if (rules.max !== undefined || rules.less !== undefined) {
            max = rules.max !== undefined ? rules.max : rules.less - 1;
            lockMax = true;
        }

        if (rules.negative !== undefined) {
            let cacheMax = max;
            setMax(max < 0 ? max : 0);
            if (!(min < 0)) {
                if (cacheMax === max) {
                    cacheMax = 5;
                }

                setMin(max - cacheMax);
            }
        }

        if (rules.multiple !== undefined) {
            incrementor = rules.multiple;

            if (min % incrementor !== 0) {
                let diff;
                if (min > 0) {
                    diff = min < incrementor ?
                        incrementor - min :
                        incrementor - (min % incrementor);
                }
                else {
                    diff = Math.abs(min) < incrementor ?
                        0 - (min + incrementor) :
                        0 - (min % incrementor);
                }

                setMin(min + diff);

                if (max > 0) {
                    if ((min + incrementor) >= max) {
                        setMax(min + Math.floor(max / incrementor));
                    }
                }
            }
        }

        numberResult = min + randNum(max, min, incrementor);
        if (min === max) {
            numberResult = min;
        }

        if (rules.precision !== undefined) {
            let fixedDigits = numberResult.toFixed(rules.precision);

            if (fixedDigits.split('.')[1] === '00') {
                fixedDigits = fixedDigits.split('.').map((digitSet, index) => {

                    return index === 0 ?
                        digitSet :
                        '05';
                }).join('.');
            }

            numberResult = Number(fixedDigits);
        }

        const impossible = this._schema.validate(numberResult).error !== null;

        return impossible ? NaN : numberResult;
    }
}

class BooleanExample extends Any {

    _generate() {

        const schemaDescription = this._schema.describe();
        const possibleResult = schemaDescription.truthy.slice(1).concat(schemaDescription.falsy.slice(1));

        return possibleResult.length > 0
            ? Helpers.pickRandomFromArray(possibleResult)
            : Math.random() > 0.5;
    }
}

class BinaryExample extends Any {

    _generate(rules) {

        let bufferSize = 10;

        if (rules.length >= 0) {
            bufferSize = rules.length;
        }
        else if (rules.min >= 0 && rules.max >= 0) {
            bufferSize = rules.min + Math.floor(Math.random() * (rules.max - rules.min));
        }
        else if (rules.min >= 0) {
            bufferSize = Math.ceil(rules.min * (Math.random() + 1));
        }
        else {
            bufferSize = Math.ceil(rules.max * Math.random());
        }

        const encodingFlag = Hoek.reach(this._schema.describe(), 'flags.encoding');
        const encoding = encodingFlag || 'utf8';
        const bufferResult = Buffer.alloc(bufferSize, Math.random().toString(36).substr(2));

        return encodingFlag ? bufferResult.toString(encoding) : bufferResult;
    }
}

class DateExample extends Any {

    _generate(rules) {

        const schemaDescription = this._schema.describe();

        let dateModifier = Math.random() * (new Date()).getTime() / 5;

        let min = 0;
        let max = (new Date(min + dateModifier)).getTime();

        if (rules.min) {
            min = rules.min === 'now' ?
                (new Date()).getTime() :
                (new Date(rules.min)).getTime();

            if (rules.max === undefined) {
                max = min + dateModifier;
            }
        }

        if (rules.max) {
            max = rules.max === 'now' ?
                (new Date()).getTime()
                : (new Date(rules.max)).getTime();

            if (rules.min === undefined) {
                min = max - dateModifier;
            }
        }

        dateModifier = Math.random() * (max - min);

        let dateResult = new Date(min + dateModifier);

        if (schemaDescription.flags) {
            if (schemaDescription.flags.format) {
                //ISO formatting is nested as a ISO Regex in format.
                //But since date.format() API is no longer natively supported,
                //regex pattern does not need to be acknowledged and ISO
                //output is implied.
                dateResult = dateResult.toISOString();
            }

            if (schemaDescription.flags.timestamp) {
                dateResult = dateResult.getTime() / Number(schemaDescription.flags.multiplier);
            }

            if (schemaDescription.flags.momentFormat) {
                const moment = new Moment(dateResult);
                const targetFormat = Array.isArray(schemaDescription.flags.momentFormat) ?
                    Helpers.pickRandomFromArray(schemaDescription.flags.momentFormat) :
                    schemaDescription.flags.momentFormat;
                dateResult = moment.format(targetFormat);
            }
        }

        return dateResult;
    }
}

class FunctionExample extends Any {

    _generate(rules) {

        const parameterNames = [];
        let idealArityCount = 0;
        const arityCount = rules.arity === undefined ? null : rules.arity;
        const minArityCount = rules.minArity === undefined ? null : rules.minArity;
        const maxArityCount = rules.maxArity === undefined ? null : rules.maxArity;

        if (arityCount) {
            idealArityCount = arityCount;
        }
        else if (minArityCount && maxArityCount) {
            idealArityCount = Math.floor(Math.random() * (maxArityCount - minArityCount) + minArityCount);
        }
        else if (minArityCount) {
            idealArityCount = minArityCount;
        }
        else if (maxArityCount) {
            idealArityCount = maxArityCount;
        }

        for (let i = 0; i < idealArityCount; ++i) {
            parameterNames.push('param' + i);
        }

        return new Function(parameterNames.join(','), 'return 0;');
    }
}

class ArrayExample extends Any {

    _generate(rules) {

        const schemaDescription = this._schema.describe();

        const childOptions = {
            schemaDescription,
            config: this._options
        };

        const arrayIsSparse = schemaDescription.flags.sparse;
        const arrayIsSingle = schemaDescription.flags.single;
        let arrayResult = [];

        if (!arrayIsSparse) {
            if (schemaDescription.orderedItems) {
                for (let i = 0; i < schemaDescription.orderedItems.length; ++i) {
                    const itemRawSchema = Hoek.reach(this._schema, '_inner.ordereds')[i];
                    const itemType = internals.getType(itemRawSchema);
                    const Item = new Examples[itemType](itemRawSchema, childOptions);

                    arrayResult.push(Item.generate());
                }
            }

            if (schemaDescription.items) {
                for (let i = 0; i < schemaDescription.items.length; ++i) {
                    const itemIsForbidden = schemaDescription.items[i].flags && schemaDescription.items[i].flags.presence === 'forbidden';
                    if (!itemIsForbidden) {
                        const itemRawSchema = Hoek.reach(this._schema, '_inner.items')[i];
                        const itemType = internals.getType(itemRawSchema);
                        const Item = new Examples[itemType](itemRawSchema, childOptions);

                        arrayResult.push(Item.generate());
                    }
                }
            }

            const itemsToAdd = schemaDescription.items ? schemaDescription.items : [
                {
                    type: 'string'
                },
                {
                    type: 'number'
                }
            ];

            if (rules.length && arrayResult.length !== rules.length) {
                if (arrayResult.length > rules.length) {
                    arrayResult = arrayResult.slice(0, rules.length);
                }
                else {
                    while (arrayResult.length < rules.length) {
                        const itemToAdd = Helpers.pickRandomFromArray(itemsToAdd);
                        const itemExample = new Examples[itemToAdd.type](Helpers.descriptionCompiler(itemToAdd));

                        arrayResult.push(itemExample.generate());
                    }
                }
            }

            if (rules.min && arrayResult.length < rules.min) {
                while (arrayResult.length < rules.min) {
                    const itemToAdd = Helpers.pickRandomFromArray(itemsToAdd);
                    const itemExample = new Examples[itemToAdd.type](Helpers.descriptionCompiler(itemToAdd));

                    arrayResult.push(itemExample.generate());
                }
            }

            if (rules.max && arrayResult.length === 0) {
                const arrayLength = Math.ceil(Math.random() * rules.max);

                while (arrayResult.length < arrayLength) {
                    const itemToAdd = Helpers.pickRandomFromArray(itemsToAdd);
                    const itemExample = new Examples[itemToAdd.type](Helpers.descriptionCompiler(itemToAdd));

                    arrayResult.push(itemExample.generate());
                }
            }
        }

        if (arrayResult.length > 0 && arrayIsSingle) {
            arrayResult = arrayResult.pop();
        }

        return arrayResult;
    }
}

class ObjectExample extends Any {

    _generate(rules) {

        const schemaDescription = this._schema.describe();
        const parentPresence = Hoek.reach(schemaDescription, 'options.presence');

        const objectResult = {};
        const randomChildGenerator = function () {

            const randString = Math.random().toString(36).substr(2);
            objectResult[randString.substr(0, 4)] = randString;
        };

        let objectChildGenerator = randomChildGenerator;

        if (schemaDescription.children) {
            Object.keys(schemaDescription.children).forEach((childKey) => {

                const childSchemaRaw = this._schema._inner.children.filter((child) => {

                    return child.key === childKey;
                })[0].schema;
                const childSchema = schemaDescription.children[childKey];
                const flagsPresence = Hoek.reach(childSchema, 'flags.presence');
                const childIsRequired = flagsPresence === 'required';
                const childIsOptional = (flagsPresence === 'optional') || (parentPresence === 'optional' && !childIsRequired);
                const childIsForbidden = flagsPresence === 'forbidden';
                const shouldStrip = Hoek.reach(childSchema, 'flags.strip');

                if (shouldStrip || childIsForbidden || (childIsOptional && !(Hoek.reach(this._options, 'includeOptional')))) {
                    return;
                }

                const childOptions = {
                    schemaDescription,
                    objectResult,
                    config: this._options
                };
                const childType = internals.getType(childSchemaRaw);

                const child = new Examples[childType](childSchemaRaw, childOptions);
                objectResult[childKey] = child.generate();
            });
        }

        if (schemaDescription.patterns) {
            const pattern = Helpers.pickRandomFromArray(schemaDescription.patterns);
            const patternRaw = this._schema._inner.patterns.filter((patternSchema) => {

                return patternSchema.regex.toString() === pattern.regex;
            })[0].rule;
            const options = this._options;
            objectChildGenerator = function () {

                const initialKeyLength = Object.keys(objectResult).length;
                const key = new RandExp(pattern.regex.substr(1, pattern.regex.length - 2)).gen();
                const child = new Examples[pattern.rule.type](patternRaw, { config: options });
                objectResult[key] = child.generate();
                if (initialKeyLength === Object.keys(objectResult).length) {
                    objectChildGenerator = randomChildGenerator;
                }
            };
        }

        if (rules.schema) {
            return this._schema;
        }

        if (rules.type) {
            return new rules.type.ctor();
        }

        let keyCount = 0;

        if (rules.min && Object.keys(objectResult).length < rules.min) {
            keyCount = rules.min;
        }
        else if (rules.max && Object.keys(objectResult).length === 0) {
            keyCount = rules.max - 1;
        }
        else {
            keyCount = rules.length;
        }

        while (Object.keys(objectResult).length < keyCount) {
            objectChildGenerator();
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
                const options = this._options;
                objectDependencies.with.peers.forEach((peerKey) => {

                    if (Hoek.reach(objectResult, peerKey) === undefined) {
                        const peerSchema = Joi.reach(Helpers.descriptionCompiler(schemaDescription), peerKey);

                        const peerOptions = {
                            schemaDescription,
                            objectResult,
                            config: options
                        };
                        const peer = new Examples[peerSchema.describe().type](peerSchema, peerOptions);
                        objectResult[peerKey] = peer.generate();
                    }
                });
            }
        }

        return objectResult;
    }
}

class AlternativesExample extends Any {

    constructor(schema, options) {

        super(schema, options);
        this._hydratedParent = options && options.objectResult;
    }

    _generate(rules) {

        const schemaDescription = this._schema.describe();

        let resultSchema;
        let resultSchemaRaw;

        if (schemaDescription.alternatives.length > 1) {
            const potentialValues = schemaDescription.alternatives;
            resultSchema = Helpers.pickRandomFromArray(potentialValues);
        }
        else {
            if (schemaDescription.alternatives[0].ref) {
                const driverPath = schemaDescription.alternatives[0].ref.split(':')[1];
                const driverValue = Hoek.reach(this._hydratedParent, driverPath);

                let driverIsTruthy = false;

                Joi.validate(driverValue, Helpers.descriptionCompiler(schemaDescription.alternatives[0].is), (err) => {

                    if (!err) {
                        driverIsTruthy = true;
                    }
                });

                if (driverIsTruthy) {
                    resultSchema = schemaDescription.alternatives[0].then;

                    resultSchemaRaw = Hoek.reach(this._schema, '_inner.matches')[0].then;
                }
                else {
                    resultSchema = schemaDescription.alternatives[0].otherwise;

                    if (resultSchema === undefined) {
                        resultSchema = schemaDescription.base;
                        resultSchemaRaw = Helpers.descriptionCompiler(schemaDescription.base);
                    }
                    else {
                        resultSchemaRaw = Hoek.reach(this._schema, '_inner.matches')[0].otherwise;
                    }
                }
            }
            else {
                resultSchema = schemaDescription.alternatives[0];
            }
        }

        const schema = resultSchemaRaw === undefined ? Helpers.descriptionCompiler(resultSchema) : resultSchemaRaw;
        const type = internals.getType(schema);
        const result = new Examples[type](schema, { config: this._options });

        return result.generate();
    }
}

const Examples = {
    any         : Any,
    string      : StringExample,
    number      : NumberExample,
    boolean     : BooleanExample,
    binary      : BinaryExample,
    date        : DateExample,
    func        : FunctionExample,
    array       : ArrayExample,
    object      : ObjectExample,
    alternatives: AlternativesExample
};

const valueGenerator = (schema, options) => {

    const exampleType = internals.getType(schema);

    const Example = Examples[exampleType];
    const example = new Example(schema, options);

    return example.generate();
};

module.exports = valueGenerator;
