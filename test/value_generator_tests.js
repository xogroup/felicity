'use strict';

const Hoek = require('@hapi/hoek');
const Lab = require('@hapi/lab');
const Moment = require('moment');
const Joi = require('../lib/joi');
const { permutations, expectValidation } = require('./test_helpers');
const ValueGenerator = require('../lib/exampleGenerator');

const { describe, expect, it } = exports.lab = Lab.script();
const ExpectValidation = expectValidation(expect);

describe('Any', () => {

    it('should default to string', () => {

        const schema = Joi.any();
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return an "allow"ed value', () => {

        let schema = Joi.any().allow('allowed');
        ExpectValidation(ValueGenerator(schema), schema);

        let examples = {};
        schema =  Joi.any().allow('allowed1', 'allowed2');

        for (let i = 0; i < 10; ++i) {
            const example = ValueGenerator(schema);
            examples[example] = true;
            ExpectValidation(example, schema);
        }

        expect(examples.allowed1).to.exist();
        expect(examples.allowed2).to.exist();

        examples = {};
        schema = Joi.any().allow(...['first', 'second', true, 10]);

        for (let i = 0; i < 25; ++i) {
            const example = ValueGenerator(schema);
            examples[example] = true;
            ExpectValidation(example, schema);
        }

        expect(['first', 'second', 'true', '10'].filter((valid) => examples[valid] !== undefined).length).to.equal(4);
    });

    it('should ignore "allow"ed values when provided the "ignoreValids" option', () => {

        const schema = Joi.any().allow(null);
        const example = ValueGenerator(schema, { config: { ignoreValids: true } });

        expect(example).to.be.a.string();
        ExpectValidation(example, schema);
    });

    it('should return a "valid" value', () => {

        let schema = Joi.any().valid('allowed');
        let example = ValueGenerator(schema);

        expect(example).to.equal('allowed');
        ExpectValidation(example, schema);

        schema =  Joi.any().valid('allowed1', 'allowed2');
        example = ValueGenerator(schema);

        expect(['allowed1', 'allowed2'].indexOf(example)).to.not.equal(-1);
        ExpectValidation(example, schema);

        schema = Joi.any().valid(...[true, 10]);
        example = ValueGenerator(schema);

        expect([true, 10].indexOf(example)).to.not.equal(-1);
        ExpectValidation(example, schema);
    });

    it('should return an "example" value from a single argument', () => {

        const schema = Joi.any().example(123);
        const example = ValueGenerator(schema);

        expect(example).to.equal(123);
        ExpectValidation(example, schema);
    });

    it('should return an "example" value from multiple arguments', () => {

        const examples = [123, 321];
        const schema = Joi.any().example(examples);
        const example = ValueGenerator(schema);
        const foundExample = examples.find((ex) => ex === example);

        expect(foundExample).to.equal(example);
        ExpectValidation(example, schema);
    });

    it('should return an "example" value from a single array argument', () => {

        const schema = Joi.any().example([123]);
        const example = ValueGenerator(schema);

        expect(example).to.equal(123);
        ExpectValidation(example, schema);
    });

    it('should return an "example" value from multiple single array arguments', () => {

        const examples = [[123], [321]];
        const schema = Joi.any().example(examples);
        const example = ValueGenerator(schema);
        const [foundExample] = examples.find(([ex]) => ex === example);

        expect(foundExample).to.equal(example);
        ExpectValidation(example, schema);
    });

    it('should return a default value', () => {

        const schema = Joi.any().default(123);
        const example = ValueGenerator(schema);

        expect(example).to.equal(123);
        ExpectValidation(example, schema);
    });

    it('should return a dynamic default value', () => {

        const generateDefault = function () {

            return true;
        };

        generateDefault.description = 'generates default';
        const schema = Joi.any().default(generateDefault);
        const example = ValueGenerator(schema);

        expect(example).to.equal(true);
        ExpectValidation(example, schema);
    });
});

describe('String', () => {

    it('should return a basic string', () => {

        const schema = Joi.string();
        const example = ValueGenerator(schema);

        expect(example).to.be.a.string();
        ExpectValidation(example, schema);
    });

    it('should return a string with valid value', () => {

        const schema = Joi.string().valid('a');
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return a GUID', () => {

        const schema = Joi.string().guid();
        const example = ValueGenerator(schema);

        expect(example).to.be.a.string();
        ExpectValidation(example, schema);
    });

    it('should return a GUID with UUID syntax', () => {

        const schema = Joi.string().uuid();
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return an email', () => {

        const schema = Joi.string().email();
        const example = ValueGenerator(schema);

        expect(example).to.be.a.string();
        ExpectValidation(example, schema);
    });

    it('should return default value', () => {

        const schema = Joi.string().default('fallback');
        const example = ValueGenerator(schema);

        expect(example).to.equal('fallback');
        ExpectValidation(example, schema);
    });

    it('should return default value when valids are ignored', () => {

        const schema = Joi.string().valid(...['value1', 'value2', 'fallback']).default('fallback');
        const example = ValueGenerator(schema, { config: { ignoreValids: true } });

        expect(example).to.equal('fallback');
        ExpectValidation(example, schema);
    });

    it('should utilize dynamic default function', () => {

        const defaultGenerator = function () {

            return 'fallback';
        };

        defaultGenerator.description = 'generates a default';
        const schema = Joi.string().default(defaultGenerator);
        const example = ValueGenerator(schema);

        expect(example).to.equal('fallback');
        ExpectValidation(example, schema);
    });

    it('should return a string which adheres to .min requirement', () => {

        for (let i = 0; i <= 5; ++i) {

            const min = Math.ceil((Math.random() + 1) * Math.pow(1 + i, i));
            const schema = Joi.string().min(min);
            const example = ValueGenerator(schema);

            expect(example.length).to.be.at.least(min);
            ExpectValidation(example, schema);
        }

    });

    it('should return a string which adheres to .max requirement', () => {

        for (let i = 0; i <= 5; ++i) {

            const max = Math.ceil((Math.random() + 1) * Math.pow(1 + i, i));
            const schema = Joi.string().max(max);
            const example = ValueGenerator(schema);

            expect(example.length).to.be.at.most(max);
            ExpectValidation(example, schema);
        }

    });

    it('should return a string which adheres to both .min and .max requirements', () => {

        for (let i = 4; i <= 25; ++i) {

            const max = Math.ceil(Math.random() * i + 1);
            const possibleMin = max - Math.floor(Math.random() * i + 1);
            const min = possibleMin < 1 ? 1 : possibleMin;
            const schema = Joi.string().min(min).max(max);
            const example = ValueGenerator(schema);

            expect(example.length).to.be.at.most(max).and.at.least(min);
            ExpectValidation(example, schema);
        }

        const largeMax = 750;
        const largeMin = 500;
        const largeSchema = Joi.string().min(largeMin).max(largeMax);
        const largeExample = ValueGenerator(largeSchema);

        expect(largeExample.length).to.be.at.most(largeMax).and.at.least(largeMin);
        ExpectValidation(largeExample, largeSchema);
    });

    it('should return a string which adheres to .length requirement', () => {

        for (let i = 0; i <= 5; ++i) {

            const length = Math.ceil((Math.random() + 1) * Math.pow(1 + i, i));
            const schema = Joi.string().length(length);
            const example = ValueGenerator(schema);

            expect(example.length).to.equal(length);
            ExpectValidation(example, schema);
        }

    });

    it('should return a string which adheres to .isoDate requirement', () => {

        const schema = Joi.string().isoDate();
        const example = ValueGenerator(schema);

        expect((new Date(example)).toISOString()).to.equal(example);
        ExpectValidation(example, schema);
    });

    it('should return a string that matches the given regexp', () => {

        const regex = new RegExp(/[a-c]{3}-[d-f]{3}-[0-9]{4}/);
        const schema = Joi.string().regex(regex);
        const example = ValueGenerator(schema);

        expect(example.match(regex)).to.not.equal(null);
        ExpectValidation(example, schema);
    });

    it('should return a string that does not match the inverted regexp', () => {

        const regex = new RegExp(/[a-c]{3}-[d-f]{3}-[0-9]{4}/);
        const schema = Joi.string().pattern(regex, { invert: true });
        const example = ValueGenerator(schema);

        expect(example.match(regex)).to.equal(null);
        ExpectValidation(example, schema);
    });

    it('should return a case-insensitive string', () => {

        const schema = Joi.string().valid('A').insensitive();
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return a Luhn-valid credit card number', () => {

        const schema = Joi.string().creditCard();
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return a hexadecimal string', () => {

        const schema = Joi.string().hex();
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return a hexadecimal string between min and max', () => {

        const schema = Joi.string().hex().min(128).max(130);
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return a token', () => {

        const schema = Joi.string().token();
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return an alphanumeric string', () => {

        const schema = Joi.string().alphanum();
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return a hostname', () => {

        const schema = Joi.string().hostname();
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return a IPv4 when given no options', () => {

        const schema = Joi.string().ip();
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return a IPv4 when given options and cidr is forbidden', () => {

        const schema = Joi.string().ip(
            {
                cidr : 'forbidden'
            });
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return a IPv4 when given options', () => {

        const schema = Joi.string().ip(
            {
                version : ['ipv4']
            });
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return a IPv4 when given options and cidr is forbidden', () => {

        const schema = Joi.string().ip(
            {
                version : ['ipv4'],
                cidr : 'forbidden'
            });
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return a IPv6 when given options', () => {

        const schema = Joi.string().ip(
            {
                version : ['ipv6']
            });
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return a IPv6 when given options and cidr is forbidden', () => {

        const schema = Joi.string().ip(
            {
                version : ['ipv6'],
                cidr : 'forbidden'
            });
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return uppercase value', () => {

        const schema = Joi.string().uppercase();
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return uppercase value for guid to test chaining', () => {

        const schema = Joi.string().guid().uppercase();
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return lowercase value', () => {

        const schema = Joi.string().lowercase();
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return example.com for .uri', () => {

        const schema = Joi.string().uri();
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });
});

describe('Number', () => {

    it('should return a number', () => {

        const schema = Joi.number();
        const example = ValueGenerator(schema);

        expect(example).to.be.a.number();
        ExpectValidation(example, schema);
    });

    it('should return a default value > 0', () => {

        const schema = Joi.number().default(9);
        const example = ValueGenerator(schema);

        expect(example).to.equal(9);
        ExpectValidation(example, schema);
    });

    it('should return a default value === 0', () => {

        const schema = Joi.number().default(0);
        const example = ValueGenerator(schema);

        expect(example).to.equal(0);
        ExpectValidation(example, schema);
    });

    it('should return a dynamic default', () => {
        const generateNumber = () => 0;
        generateNumber.description = 'default description';
        const schema = Joi.number().default(generateNumber);
        const example = ValueGenerator(schema);

        expect(example).to.equal(0);
        ExpectValidation(example, schema);
    });

    it('should return a valid value instead of default', () => {

        const schema = Joi.number().valid(2).default(1);
        const example = ValueGenerator(schema);

        expect(example).to.equal(2);
        ExpectValidation(example, schema);
    });

    it('should return a negative number', () => {

        const schema = Joi.number().negative();
        const example = ValueGenerator(schema);

        expect(example).to.be.below(0);
        ExpectValidation(example, schema);
    });

    it('should return an integer', () => {

        const schema = Joi.number().integer();
        const example = ValueGenerator(schema);

        expect(example % 1).to.equal(0);
        ExpectValidation(example, schema);
    });

    it('should return a number which adheres to .min requirement', () => {

        const schema = Joi.number().min(20);
        const example = ValueGenerator(schema);

        expect(example).to.be.at.least(20);
        ExpectValidation(example, schema);
    });

    it('should return a number which adheres to .max requirement', () => {

        const schema = Joi.number().max(2);
        const example = ValueGenerator(schema);

        expect(example).to.be.at.most(2);
        ExpectValidation(example, schema);
    });

    it('should return a number which has equal .min and .max requirements', () => {

        const schema = Joi.number().min(1).max(1);
        const example = ValueGenerator(schema);

        expect(example).to.equal(1);
        ExpectValidation(example, schema);
    });

    it('should return a number which adheres to .greater requirement', () => {

        const schema = Joi.number().greater(20);
        const example = ValueGenerator(schema);

        expect(example).to.be.at.least(20);
        ExpectValidation(example, schema);
    });

    it('should return a number which adheres to .less requirement', () => {

        const schema = Joi.number().less(2);
        const example = ValueGenerator(schema);

        expect(example).to.be.at.most(2);
        ExpectValidation(example, schema);
    });

    it('should return a number which adheres to .precision requirement', () => {

        for (let i = 0; i < 500; ++i) {
            const schema = Joi.number().precision(2);
            const example = ValueGenerator(schema);

            expect(example.toString().split('.')[1].length).to.be.at.most(2);
            ExpectValidation(example, schema);
        }
    });

    it('should return a number which adheres to .multiple requirement', () => {

        const schema = Joi.number().multiple(4);
        const example = ValueGenerator(schema);

        expect(example % 4).to.equal(0);
        ExpectValidation(example, schema);
    });

    it('should return a number which adheres to .multiple requirement in conjunction with min and max', () => {

        const schema = Joi.number().multiple(6).min(5).max(8);
        const example = ValueGenerator(schema);

        expect(example % 2).to.equal(0);
        ExpectValidation(example, schema);
    });

    it('should return numbers which adhere to any valid combination of requirements', () => {

        const requirements = [
            'positive',
            'negative',
            'integer',
            'min',
            'max',
            'greater',
            'less',
            'precision',
            'multiple'
        ];
        const requirementExclusions = {
            positive : ['positive','negative'],
            negative : ['negative','positive'],
            precision: ['precision','integer', 'multiple'],
            integer  : ['integer','precision'],
            multiple : ['multiple','precision'],
            max      : ['max','less'],
            less     : ['less','max'],
            min      : ['min','greater'],
            greater  : ['greater','min']
        };
        const optionArguments = {
            min      : 16,
            max      : 56,
            greater  : 35,
            less     : 45,
            precision: 3,
            multiple : 8
        };

        const numberOptions = permutations(requirements, requirementExclusions);

        numberOptions.forEach((optionSet) => {

            let schema = Joi.number();
            const setContainsNegative = optionSet.indexOf('negative') !== -1;
            const setContainsMinAndMax = Hoek.intersect(optionSet, ['min', 'greater']).length > 0 && Hoek.intersect(optionSet, ['max', 'less']).length > 0;

            optionSet.forEach((option) => {

                let optionArgument = setContainsNegative ? 0 - optionArguments[option] : optionArguments[option];

                if (option === 'multiple' || option === 'precision') {
                    optionArgument = Math.abs(optionArgument);
                }
                else if (setContainsNegative && setContainsMinAndMax && (option === 'min' || option === 'greater') ) {
                    optionArgument = 0 - optionArguments.max;
                }
                else if (setContainsNegative && setContainsMinAndMax && (option === 'max' || option === 'less')) {
                    optionArgument = 0 - optionArguments.min;
                }

                schema = schema[option](optionArgument);
            });

            const example = ValueGenerator(schema);

            ExpectValidation(example, schema);
        });
    });

    it('should return NaN for impossible combinations', () => {

        const impossibleMinSchema = Joi.number().negative().min(1);
        let example = ValueGenerator(impossibleMinSchema);
        expect(example).to.equal(NaN);

        example = 0;
        const impossibleMinMultipleSchema = Joi.number().negative().min(-10).multiple(12);
        example = ValueGenerator(impossibleMinMultipleSchema);
        expect(example).to.equal(NaN);

    });
});

describe('Boolean', () => {

    it('should return a boolean', () => {

        const schema = Joi.boolean();
        const example = ValueGenerator(schema);

        expect(example).to.be.a.boolean();
        ExpectValidation(example, schema);
    });

    it('should return default "true" value', () => {

        for (let i = 0; i < 10; ++i) {
            const schema = Joi.boolean().default(true);
            const example = ValueGenerator(schema);

            expect(example).to.equal(true);
        }
    });

    it('should return default "false" value', () => {

        for (let i = 0; i < 10; ++i) {
            const schema = Joi.boolean().default(false);
            const example = ValueGenerator(schema);

            expect(example).to.equal(false);
        }
    });

    it('should return valid value', () => {

        for (let i = 0; i < 10; ++i) {
            const schema = Joi.boolean().valid(true).default(false);
            const example = ValueGenerator(schema);

            expect(example).to.equal(true);
        }
    });

    it('should return a truthy value when singlar number', () => {

        const schema = Joi.boolean().truthy(1);
        const example = ValueGenerator(schema);

        expect(example).to.be.a.number();
        expect(example).to.equal(1);
        ExpectValidation(example, schema);
    });

    it('should return a truthy value when singlar string', () => {

        const schema = Joi.boolean().truthy('y');
        const example = ValueGenerator(schema);

        expect(example).to.be.a.string();
        expect(example).to.equal('y');
        ExpectValidation(example, schema);
    });

    it('should return a truthy value when pluralized', () => {

        const schema = Joi.boolean().truthy(...[1, 'y']);
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return a falsy value when singlar number', () => {

        const schema = Joi.boolean().falsy(0);
        const example = ValueGenerator(schema);

        expect(example).to.be.a.number();
        expect(example).to.equal(0);
        ExpectValidation(example, schema);
    });

    it('should return a falsy value when singlar string', () => {

        const schema = Joi.boolean().falsy('n');
        const example = ValueGenerator(schema);

        expect(example).to.be.a.string();
        expect(example).to.equal('n');
        ExpectValidation(example, schema);
    });

    it('should return a falsy value when pluralized', () => {

        const schema = Joi.boolean().falsy(...[0, 'n']);
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should validate when a mix of truthy and falsy is set', () => {

        const schema = Joi.boolean().truthy(...[1, 'y']).falsy(...[0, 'n']);
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });
});

describe('Binary', () => {

    it('should return a buffer', () => {

        const schema = Joi.binary();
        const example = ValueGenerator(schema);

        expect(example).to.be.a.buffer();
        ExpectValidation(example, schema);
    });

    it('should return a string with specified encoding', () => {

        const supportedEncodings = [
            'base64',
            'utf8',
            'ascii',
            'utf16le',
            'ucs2',
            'hex'
        ];

        supportedEncodings.forEach((encoding) => {

            const schema = Joi.binary().encoding(encoding);
            const example = ValueGenerator(schema);

            expect(example).to.be.a.string();
            ExpectValidation(example, schema);
        });

    });

    it('should return a buffer of minimum size', () => {

        const schema = Joi.binary().min(100);
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return a buffer of maximum size', () => {

        const schema = Joi.binary().max(100);
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return a buffer of specified size', () => {

        const schema = Joi.binary().length(75);
        const example = ValueGenerator(schema);

        expect(example.length).to.equal(75);
        ExpectValidation(example, schema);
    });

    it('should return a buffer of size between min and max', () => {

        const schema = Joi.binary().min(27).max(35);
        const example = ValueGenerator(schema);

        expect(example.length).to.be.at.least(27).and.at.most(35);
        ExpectValidation(example, schema);
    });

    it('should return a dynamic default buffer', () => {

        const defaultBuffer = Buffer.alloc(10);
        const generateDefault = () => defaultBuffer;
        generateDefault.description = 'generates default';
        const schema = Joi.binary().default(generateDefault);
        const example = ValueGenerator(schema);

        expect(example).to.be.a.buffer();
        expect(example).to.equal(defaultBuffer);
        ExpectValidation(example, schema);
    });
});

describe('Date', () => {

    it('should return a date', () => {

        const schema = Joi.date();
        const example = ValueGenerator(schema);

        expect(example).to.be.a.date();
        ExpectValidation(example, schema);
    });

    it('should return a Date more recent than .min value', () => {

        const schema = Joi.date().min('1/01/3016');
        const example = ValueGenerator(schema);

        expect(example).to.be.above(new Date('1/01/3016'));
        ExpectValidation(example, schema);
    });

    it('should return a Date more recent than "now"', () => {

        const schema = Joi.date().min('now');
        const now = new Date();
        const example = ValueGenerator(schema);

        expect(example).to.be.above(now);
        ExpectValidation(example, schema);
    });

    it('should return a Date less recent than .max value', () => {

        const schema = Joi.date().max('1/01/1968');
        const example = ValueGenerator(schema);

        expect(example).to.be.below(new Date(0));
        ExpectValidation(example, schema);
    });

    it('should return a Date less recent than "now"', () => {

        const schema = Joi.date().max('now');
        const now = new Date();
        const example = ValueGenerator(schema);

        expect(example).to.be.below(now);
        ExpectValidation(example, schema);
    });

    it('should return a Date between .min and .max values', () => {

        for (let i = 1; i <= 20; ++i) {
            const minYear = 2000 + Math.ceil((Math.random() * 100));
            const maxYear = minYear + Math.ceil((Math.random()) * 10);
            const min = '1/01/' + minYear.toString();
            const max = '1/01/' + maxYear.toString();
            const schema = Joi.date().min(min).max(max);
            const example = ValueGenerator(schema);

            expect(example).to.be.above(new Date(min)).and.below(new Date(max));
            ExpectValidation(example, schema);
        }

        const smallMin = '1/01/2016';
        const smallMax = '3/01/2016';
        const smallSchema = Joi.date().min(smallMin).max(smallMax);
        const smallExample = ValueGenerator(smallSchema);

        ExpectValidation(smallExample, smallSchema);
    });

    it('should return a Date in ISO format', () => {

        const schema = Joi.date().iso();
        const example = ValueGenerator(schema);

        expect(example).to.be.a.string();
        ExpectValidation(example, schema);
    });

    it('should return a timestamp', () => {

        const schema = Joi.date().timestamp();
        const example = ValueGenerator(schema);

        expect(example).to.be.a.number();
        ExpectValidation(example, schema);
    });

    it('should return a unix timestamp', () => {

        const schema = Joi.date().timestamp('unix');
        const example = ValueGenerator(schema);

        expect(example).to.be.a.number();
        ExpectValidation(example, schema);
    });

    it('should return a moment formatted date', () => {

        const fmt = 'HH:mm';
        const schema = Joi.date().format(fmt);
        const example = ValueGenerator(schema);
        const moment = new Moment(example, fmt, true);

        expect(example).to.be.a.string();
        expect(moment.isValid()).to.equal(true);
        ExpectValidation(example, schema);
    });

    it('should return a moment formatted date with Joi version <= 10.2.1', () => {

        const fmt = 'HH:mm';
        const schema = Joi.date().format(fmt);
        schema._flags.momentFormat = fmt;
        const example = ValueGenerator(schema);
        const moment = new Moment(example, fmt, true);

        expect(example).to.be.a.string();
        expect(moment.isValid()).to.equal(true);
        ExpectValidation(example, schema);
    });

    it('should return one of the allowed moment formatted dates', () => {

        const fmt = ['HH:mm', 'YYYY/MM/DD'];
        const schema = Joi.date().format(fmt);
        const example = ValueGenerator(schema);
        const moment = new Moment(example, fmt, true);

        expect(example).to.be.a.string();
        expect(moment.isValid()).to.equal(true);
        ExpectValidation(example, schema);
    });
});

describe('Function', () => {

    it('should return a function', () => {

        const schema = Joi.func();
        const example = ValueGenerator(schema);

        expect(example).to.be.a.function();
        ExpectValidation(example, schema);
    });

    it('should return a function with arity(1)', () => {

        const schema = Joi.func().arity(1);
        const example = ValueGenerator(schema);

        expect(example).to.be.a.function();
        ExpectValidation(example, schema);
    });

    it('should return a function with arity(10)', () => {

        const schema = Joi.func().arity(10);
        const example = ValueGenerator(schema);

        expect(example).to.be.a.function();
        ExpectValidation(example, schema);
    });

    it('should return a function with minArity(3)', () => {

        const schema = Joi.func().minArity(3);
        const example = ValueGenerator(schema);

        expect(example).to.be.a.function();
        ExpectValidation(example, schema);
    });

    it('should return a function with maxArity(4)', () => {

        const schema = Joi.func().maxArity(4);
        const example = ValueGenerator(schema);

        expect(example).to.be.a.function();
        ExpectValidation(example, schema);
    });

    it('should return a function with minArity(3) and maxArity(4)', () => {

        const schema = Joi.func().minArity(3).maxArity(4);
        const example = ValueGenerator(schema);

        expect(example).to.be.a.function();
        ExpectValidation(example, schema);
    });
});

describe('Array', () => {

    it('should return an array', () => {

        const schema = Joi.array();
        const example = ValueGenerator(schema);

        expect(example).to.be.an.array();
        ExpectValidation(example, schema);
    });

    it('should return an array with valid items', () => {

        const schema = Joi.array().items(Joi.number().required(), Joi.string().guid().required(), Joi.array().items(Joi.number().integer().min(43).required()).required());
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return an array with valid items and without forbidden items', () => {

        const schema = Joi.array().items(Joi.string().forbidden(), Joi.number().multiple(3));
        const example = ValueGenerator(schema);

        const stringItems = example.filter((item) => {

            return typeof item === 'string';
        });

        expect(stringItems.length).to.equal(0);
        ExpectValidation(example, schema);
    });

    it('should return an empty array with "sparse"', () => {

        const schema = Joi.array()
            .items(Joi.number())
            .sparse();
        const example = ValueGenerator(schema);

        expect(example.length).to.equal(0);
        ExpectValidation(example, schema);
    });

    it('should return an ordered array', () => {

        const schema = Joi.array().ordered(Joi.string().max(3).required(), Joi.number().negative().integer().required(), Joi.boolean().required());
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return an array with "length" random items', () => {

        const schema = Joi.array().length(4);
        const example = ValueGenerator(schema);

        expect(example.length).to.equal(4);
        ExpectValidation(example, schema);
    });

    it('should return an array with examples that match item types and in the same order', () => {

        const schema = Joi.array().length(2).items(Joi.string(), Joi.number().integer());
        const example = ValueGenerator(schema);

        expect(example.length).to.equal(2);
        expect(example[0]).to.be.a.string();
        expect(example[1]).to.be.a.number();
        ExpectValidation(example, schema);
    });

    it('should return an array with "length" specified items', () => {

        const schema = Joi.array()
            .items(Joi.number().integer(), Joi.string().guid(), Joi.boolean())
            .length(10);
        const example = ValueGenerator(schema);

        expect(example.length).to.equal(10);
        ExpectValidation(example, schema);
    });

    it('should return an array with no more than "length" specified items', () => {

        const schema = Joi.array()
            .items(Joi.number().integer(), Joi.string().guid(), Joi.boolean())
            .length(2);
        const example = ValueGenerator(schema);

        expect(example.length).to.equal(2);
        ExpectValidation(example, schema);
    });

    it('should return an array with "min" random items', () => {

        const schema = Joi.array().min(4);
        const example = ValueGenerator(schema);

        expect(example.length).to.equal(4);
        ExpectValidation(example, schema);
    });

    it('should return an array with "min" specified items', () => {

        const schema = Joi.array()
            .items(Joi.number().integer(), Joi.string().guid(), Joi.boolean())
            .min(3);
        const example = ValueGenerator(schema);

        expect(example.length).to.equal(3);
        ExpectValidation(example, schema);
    });

    it('should return an array with "min" specified items that all match the provided types', () => {

        const schema = Joi.array()
            .items(Joi.number().integer(), Joi.string().guid())
            .min(4);
        const example = ValueGenerator(schema);
        const eitherIntOrGuid = example.some((ex) => {

            return typeof ex === 'string' || typeof ex === 'number';
        });

        expect(example.length).to.equal(4);
        expect(eitherIntOrGuid).to.equal(true);
        ExpectValidation(example, schema);
    });

    it('should return an array with "max" random items', () => {

        const schema = Joi.array().max(4);
        const example = ValueGenerator(schema);

        expect(example.length).to.be.at.least(1);
        expect(example.length).to.be.at.most(4);
        ExpectValidation(example, schema);
    });

    it('should return an array with "max" specified items', () => {

        const schema = Joi.array()
            .items(Joi.number().integer(), Joi.string().guid(), Joi.boolean())
            .max(10);
        const example = ValueGenerator(schema);

        expect(example.length).to.be.at.least(1);
        expect(example.length).to.be.at.most(10);
        ExpectValidation(example, schema);
    });

    it('should return an array with "min" and "max" random items', () => {

        const schema = Joi.array()
            .min(4)
            .max(5);
        const example = ValueGenerator(schema);

        expect(example.length).to.be.at.least(4);
        expect(example.length).to.be.at.most(5);
        ExpectValidation(example, schema);
    });

    it('should return an array with "min" and "max" specified items', () => {

        const schema = Joi.array()
            .items(Joi.number().integer(), Joi.string().guid(), Joi.boolean())
            .min(10)
            .max(15);
        const example = ValueGenerator(schema);

        expect(example.length).to.be.at.least(10);
        expect(example.length).to.be.at.most(15);
        ExpectValidation(example, schema);
    });

    it('should return a semi-ordered array with "min" specified items', () => {

        const schema = Joi.array()
            .ordered(Joi.string(), Joi.number())
            .items(Joi.boolean().required())
            .min(6);
        const example = ValueGenerator(schema);

        expect(example[0]).to.be.a.string();
        expect(example[1]).to.be.a.number();
        expect(example.length).to.be.at.least(6);
        ExpectValidation(example, schema);
    });

    it('should return a single item array with a number', () => {

        const schema = Joi.array().items(Joi.number().required()).single();
        const example = ValueGenerator(schema);
        expect(example).to.be.a.number();
        ExpectValidation(example, schema);
    });

    it('should return a single item with a number', () => {

        const schema = Joi.array().items(Joi.number().required()).single(false);
        const example = ValueGenerator(schema);
        expect(example[0]).to.be.a.number();
        ExpectValidation(example, schema);
    });

    it('should return a default array', () => {

        const schema = Joi.array().default([1, 2, 3]);
        const example = ValueGenerator(schema);
        expect(example[0]).to.be.a.number();
        ExpectValidation(example, schema);
    });
});

describe('Alternatives', () => {

    it('should return one of the "try" schemas', () => {

        const schema = Joi.alternatives()
            .try(Joi.string(), Joi.number());
        const example = ValueGenerator(schema);

        expect(example).to.not.be.undefined();
        ExpectValidation(example, schema);
    });

    it('should return the single "try" schema', () => {

        const schema = Joi.alternatives()
            .try(Joi.string());
        const example = ValueGenerator(schema);

        expect(example).to.be.a.string();
        ExpectValidation(example, schema);
    });

    it('should return the single "try" object schema', () => {

        const schema = Joi.alternatives()
            .try(Joi.object().keys({ a: Joi.string() }));
        const example = ValueGenerator(schema);

        expect(example).to.be.an.object();
        ExpectValidation(example, schema);
    });

    it('should return the single "try" object schema with additional key constraints', () => {

        const schema = Joi.alternatives()
            .try(Joi.object().keys({
                a: Joi.string().lowercase(),
                b: Joi.string().guid(),
                c: Joi.string().regex(/a{3}b{3}c{3}/),
                d: Joi.object().keys({
                    e: Joi.string().alphanum().uppercase()
                })
            }));
        const example = ValueGenerator(schema);

        expect(example).to.be.an.object();
        ExpectValidation(example, schema);
    });

    it('should return "when" alternative', () => {

        const schema = Joi.object().keys({
            dependent: Joi.alternatives().when('sibling.driver', {
                is  : Joi.string(),
                then: Joi.string().lowercase()
            }),
            sibling  : Joi.object().keys({
                driver: Joi.string()
            })
        });
        const example = ValueGenerator(schema);

        expect(example.dependent).to.be.a.string();
        ExpectValidation(example, schema);
    });

    it('should return "when.otherwise" alternative', () => {

        const schema = Joi.object().keys({
            dependent: Joi.alternatives().when('sibling.driver', {
                is       : Joi.string(),
                then     : Joi.string(),
                otherwise: Joi.number().integer()
            }),
            sibling  : Joi.object().keys({
                driver: Joi.boolean()
            })
        });
        const example = ValueGenerator(schema);

        expect(example.dependent).to.be.a.number();
        ExpectValidation(example, schema);
    });

    it('should return the base value when "when.otherwise" is undefined', () => {

        const schema = Joi.object().keys({
            dependent: Joi.string().when('sibling.driver', {
                is       : Joi.exist(),
                then     : Joi.string().guid()
            }),
            sibling  : Joi.object()
        });
        const example = ValueGenerator(schema);

        expect(example.dependent).to.be.a.string();
        ExpectValidation(example, schema);
    });
});

describe('Object', () => {

    it('should return an object', () => {

        const schema = Joi.object();
        const example = ValueGenerator(schema);

        expect(example).to.be.an.object();
        ExpectValidation(example, schema);
    });

    it('should return an object with specified keys', () => {

        const schema = Joi.object().keys({
            string : Joi.string().required(),
            number : Joi.number().required(),
            boolean: Joi.bool().required(),
            time   : Joi.date().required(),
            buffer : Joi.binary().required(),
            array  : Joi.array().items(Joi.string().required()).required(),
            innerObj: Joi.object().keys({
                innerString: Joi.string().required()
            }).required()
        });
        const example = ValueGenerator(schema);

        expect(example).to.be.an.object();
        expect(example.string).to.be.a.string();
        expect(example.number).to.be.a.number();
        expect(example.boolean).to.be.a.boolean();
        expect(example.time).to.be.a.date();
        expect(example.buffer).to.be.a.buffer();
        expect(example.array).to.be.an.array();
        expect(example.innerObj).to.be.an.object();
        expect(example.innerObj.innerString).to.be.a.string();
        ExpectValidation(example, schema);
    });

    it('should return an object with min number of keys', () => {

        const schema = Joi.object().keys({
            child1: Joi.string()
        }).min(1).options({ allowUnknown: true });
        const example = ValueGenerator(schema);

        expect(Object.keys(example).length).to.be.at.least(1);
        ExpectValidation(example, schema);
    });

    it('should not get stuck on static key pattern generation', () => {

        const schema = Joi.object().pattern(/abc/, Joi.string()).min(5).options({ allowUnknown: true });
        const example = ValueGenerator(schema);

        expect(Object.keys(example).length).to.be.at.least(5);
        ExpectValidation(example, schema);
    });

    it('should return an object with max number of keys', () => {

        const schema = Joi.object().max(5);
        const example = ValueGenerator(schema);

        expect(Object.keys(example).length).to.be.at.most(5).and.at.least(1);
        ExpectValidation(example, schema);
    });

    it('should return an object with max number of keys that are typed correctly', () => {

        const schema = Joi.object().keys({
            prop: Joi.string(),
            prop2: Joi.number()
        }).max(2);
        const example = ValueGenerator(schema);

        expect(Object.keys(example).length).to.be.at.most(2).and.at.least(1);
        expect(example.prop).to.be.a.string();
        expect(example.prop2).to.be.a.number();
        ExpectValidation(example, schema);
    });

    it('should return an object with exact number of keys', () => {

        const schema = Joi.object().length(5);
        const example = ValueGenerator(schema);

        expect(Object.keys(example).length).to.equal(5);
        ExpectValidation(example, schema);
    });

    it('should return an object with keys that match the given pattern', () => {

        const schema = Joi.object().pattern(/^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/, Joi.object().keys({
            id  : Joi.string().guid().required(),
            tags: Joi.array().items(Joi.string()).required()
        })).min(2);
        const example = ValueGenerator(schema);

        expect(Object.keys(example).length).to.be.at.least(2);
        ExpectValidation(example, schema);
    });

    it('should return an object with one of two "nand" keys', () => {

        const schema = Joi.object()
            .keys({
                a: Joi.string(),
                b: Joi.string(),
                c: Joi.string()
            })
            .nand('a', 'b');
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return an object with one of two "xor" keys', () => {

        const schema = Joi.object()
            .keys({
                a: Joi.string(),
                b: Joi.string(),
                c: Joi.string()
            })
            .xor('a', 'b');
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return an ojbect with at least a key or peer', () => {

        const schema = Joi.object().keys({ password: Joi.string() }).with('username', 'password');
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return an object with alternatives', () => {

        for (let i = 0; i < 10; ++i) {
            const schema = Joi.object().keys({
                dependent: Joi.alternatives().when('sibling.driver', {
                    is       : true,
                    then     : Joi.string().guid(),
                    otherwise: Joi.number().multiple(4).min(16)
                }),
                unrelated: Joi.number(),
                sibling  : Joi.object().keys({
                    driver   : Joi.boolean()
                })
            });
            const example = ValueGenerator(schema);

            ExpectValidation(example, schema);
        }
    });

    it('should return an object with array-syntax alternatives', () => {

        const schema = Joi.object().keys({
            access_token: [Joi.string(), Joi.number()],
            birthyear   : Joi.number().integer().min(1900).max(2013)
        });
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return an object without key set as Any.forbidden()', () => {

        const schema = Joi.object().keys({
            allowed  : Joi.any(),
            forbidden: Joi.any().forbidden(),
            forbidStr: Joi.string().forbidden(),
            forbidNum: Joi.number().forbidden()
        });
        const example = ValueGenerator(schema);

        expect(example.forbidden).to.be.undefined();
        expect(example.forbidStr).to.be.undefined();
        expect(example.forbidNum).to.be.undefined();
        ExpectValidation(example, schema);
    });

    it('should return an object without key set as Any.strip()', () => {

        const schema = Joi.object().keys({
            allowed   : Joi.any(),
            private   : Joi.any().strip(),
            privateStr: Joi.string().strip(),
            privateNum: Joi.number().strip()
        });
        const example = ValueGenerator(schema);

        expect(example.private).to.be.undefined();
        expect(example.privateStr).to.be.undefined();
        expect(example.privateNum).to.be.undefined();
        ExpectValidation(example, schema);
    });

    it('should return an object with single rename() invocation', () => {

        const schema = Joi.object().keys({
            b : Joi.number()
        }).rename('a','b', { ignoreUndefined: true });
        const example = ValueGenerator(schema);

        expect(example.b).to.be.a.number();
        ExpectValidation(example, schema);
    });

    it('should return an object with double rename() invocation', () => {

        const schema = Joi.object().keys({
            b : Joi.number()
        }).rename('a','b', { ignoreUndefined: true }).rename('c','b', { multiple: true, ignoreUndefined: true });
        const example = ValueGenerator(schema);

        expect(example.b).to.be.a.number();
        ExpectValidation(example, schema);
    });

    it('should return a schema object with schema() invocation', () => {

        const schema = Joi.object().schema();
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return an object of type Regex', () => {

        const schema = Joi.object().type(RegExp);
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return an object of type Error', () => {

        const schema = Joi.object().type(Error);
        const example = ValueGenerator(schema);

        ExpectValidation(example, schema);
    });

    it('should return an object of custom type', () => {

        const Class1 = function () {};
        Class1.prototype.testFunc = function () {};

        const schema = Joi.object().type(Class1);
        const example = ValueGenerator(schema);

        expect(example.testFunc).to.be.a.function();
        ExpectValidation(example, schema);
    });

    it('should return a default object', () => {

        const schema = Joi.object().default({ a: 1 });
        const example = ValueGenerator(schema);

        expect(example.a).to.be.a.number();
        ExpectValidation(example, schema);
    });
});

describe('Extensions', () => {

    it('should fall back to baseType of string', () => {

        const customJoi = Joi.extend({
            type: 'myType'
        });

        const schema = customJoi.myType();
        const example = ValueGenerator(schema);

        expect(example).to.be.a.string();
        ExpectValidation(example, schema);
    });

    it('should fall back to baseType of number when possible', () => {

        const customJoi = Joi.extend({
            type: 'myNumber',
            base: Joi.number()
        });

        const schema = customJoi.myNumber();
        const example = ValueGenerator(schema);

        expect(example).to.be.a.number();
        ExpectValidation(example, schema);
    });

    it('should fall back to baseType of boolean when possible', () => {

        const customJoi = Joi.extend({
            type: 'myBoolean',
            base: Joi.boolean()
        });

        const schema = customJoi.myBoolean();
        const example = ValueGenerator(schema);

        expect(example).to.be.a.boolean();
        ExpectValidation(example, schema);
    });

    it('should fall back to baseType of array when possible', () => {

        const customJoi = Joi.extend({
            type: 'myArray',
            base: Joi.array()
        });

        const schema = customJoi.myArray();
        const example = ValueGenerator(schema);

        expect(example).to.be.an.array();
        ExpectValidation(example, schema);
    });

    it('should fall back to baseType of func when possible', () => {

        const customJoi = Joi.extend({
            type: 'myFunc',
            base: Joi.func()
        });

        const schema = customJoi.myFunc();
        const example = ValueGenerator(schema);

        expect(example).to.be.a.function();
        ExpectValidation(example, schema);
    });

    it('should support child extensions', () => {

        const customJoi = Joi.extend({
            type: 'myType'
        });

        const schema = Joi.object().keys({ custom: customJoi.myType() });
        const example = ValueGenerator(schema);

        expect(example.custom).to.be.a.string();
        ExpectValidation(example, schema);
    });

    it('should support extensions in arrays', () => {

        const customJoi = Joi.extend({
            type: 'myType'
        });

        const schema = Joi.array().items( customJoi.myType() );
        const example = ValueGenerator(schema);

        expect(example[0]).to.be.a.string();
        ExpectValidation(example, schema);
    });

    it('should support extensions in alternatives', () => {

        const customJoi = Joi.extend({
            type: 'myType'
        });

        const schema = Joi.object().keys({
            driver: Joi.any(),
            child : Joi.alternatives().when('driver', {
                is       : Joi.string(),
                then     : customJoi.myType()
            })
        });
        const example = ValueGenerator(schema);

        expect(example.child).to.be.a.string();
        ExpectValidation(example, schema);
    });
});
