'use strict';

const Code = require('code');
const Hoek = require('hoek');
const Joi = require('../lib/joi');
const Lab = require('lab');
const Permutations = require('./test_helpers').permutations;
const ExpectValidation = require('./test_helpers').expectValidation;
const ValueGenerator = require('../lib/helpers').valueGenerator;
const Moment = require('moment');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;

describe('Any', () => {

    it('should default to string', (done) => {

        const schema = Joi.any();
        const example = ValueGenerator.any(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return an "allow"ed value', (done) => {

        let schema = Joi.any().allow('allowed');
        let example = ValueGenerator.any(schema);

        expect(example).to.equal('allowed');
        ExpectValidation(example, schema);

        schema =  Joi.any().allow('allowed1', 'allowed2');
        example = ValueGenerator.any(schema);

        expect(['allowed1', 'allowed2'].indexOf(example)).to.not.equal(-1);
        ExpectValidation(example, schema);

        schema = Joi.any().allow(['first', 'second', true, 10]);
        example = ValueGenerator.any(schema);

        expect(['first', 'second', true, 10].indexOf(example)).to.not.equal(-1);
        ExpectValidation(example, schema, done);
    });

    it('should return a "valid" value', (done) => {

        let schema = Joi.any().valid('allowed');
        let example = ValueGenerator.any(schema);

        expect(example).to.equal('allowed');
        ExpectValidation(example, schema);

        schema =  Joi.any().valid('allowed1', 'allowed2');
        example = ValueGenerator.any(schema);

        expect(['allowed1', 'allowed2'].indexOf(example)).to.not.equal(-1);
        ExpectValidation(example, schema);

        schema = Joi.any().valid([true, 10]);
        example = ValueGenerator.any(schema);

        expect([true, 10].indexOf(example)).to.not.equal(-1);
        ExpectValidation(example, schema, done);
    });

    it('should return an "example" value', (done) => {

        const schema = Joi.any().example(123);
        const example = ValueGenerator.any(schema);

        expect(example).to.equal(123);
        ExpectValidation(example, schema, done);
    });
});

describe('String', () => {

    it('should return a basic string', (done) => {

        const schema = Joi.string();
        const example = ValueGenerator.string(schema);

        expect(example).to.be.a.string();
        ExpectValidation(example, schema, done);
    });

    it('should return a string with valid value', (done) => {

        const schema = Joi.string().valid('a');
        const example = ValueGenerator.string(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return a GUID', (done) => {

        const schema = Joi.string().guid();
        const example = ValueGenerator.string(schema);

        expect(example).to.be.a.string();
        ExpectValidation(example, schema, done);
    });

    it('should return a GUID with UUID syntax', (done) => {

        const schema = Joi.string().uuid();
        const example = ValueGenerator.string(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return an email', (done) => {

        const schema = Joi.string().email();
        const example = ValueGenerator.string(schema);

        expect(example).to.be.a.string();
        ExpectValidation(example, schema, done);
    });

    it('should return default value', (done) => {

        const schema = Joi.string().default('fallback');
        const example = ValueGenerator.string(schema);

        expect(example).to.equal('fallback');
        ExpectValidation(example, schema, done);
    });

    it('should return a string which adheres to .min requirement', (done) => {

        for (let i = 0; i <= 5; ++i) {

            const min = Math.ceil((Math.random() + 1) * Math.pow(1 + i, i));
            const schema = Joi.string().min(min);
            const example = ValueGenerator.string(schema);

            expect(example.length).to.be.at.least(min);
            ExpectValidation(example, schema);
        }

        done();
    });

    it('should return a string which adheres to .max requirement', (done) => {

        for (let i = 0; i <= 5; ++i) {

            const max = Math.ceil((Math.random() + 1) * Math.pow(1 + i, i));
            const schema = Joi.string().max(max);
            const example = ValueGenerator.string(schema);

            expect(example.length).to.be.at.most(max);
            ExpectValidation(example, schema);
        }

        done();
    });

    it('should return a string which adheres to both .min and .max requirements', (done) => {

        for (let i = 4; i <= 25; ++i) {

            const max = Math.ceil(Math.random() * i + 1);
            const possibleMin = max - Math.floor(Math.random() * i + 1);
            const min = possibleMin < 1 ? 1 : possibleMin;
            const schema = Joi.string().min(min).max(max);
            const example = ValueGenerator.string(schema);

            expect(example.length).to.be.at.most(max).and.at.least(min);
            ExpectValidation(example, schema);
        }

        const largeMax = 750;
        const largeMin = 500;
        const largeSchema = Joi.string().min(largeMin).max(largeMax);
        const largeExample = ValueGenerator.string(largeSchema);

        expect(largeExample.length).to.be.at.most(largeMax).and.at.least(largeMin);
        ExpectValidation(largeExample, largeSchema);
        done();
    });

    it('should return a string which adheres to .length requirement', (done) => {

        for (let i = 0; i <= 5; ++i) {

            const length = Math.ceil((Math.random() + 1) * Math.pow(1 + i, i));
            const schema = Joi.string().length(length);
            const example = ValueGenerator.string(schema);

            expect(example.length).to.equal(length);
            ExpectValidation(example, schema);
        }

        done();
    });

    it('should return a string which adheres to .isoDate requirement', (done) => {

        const schema = Joi.string().isoDate();
        const example = ValueGenerator.string(schema);

        expect((new Date(example)).toISOString()).to.equal(example);
        ExpectValidation(example, schema, done);
    });

    it('should return a string that matches the given regexp', (done) => {

        const regex = new RegExp(/[a-c]{3}-[d-f]{3}-[0-9]{4}/);
        const schema = Joi.string().regex(regex);
        const example = ValueGenerator.string(schema);

        expect(example.match(regex)).to.not.equal(null);
        ExpectValidation(example, schema, done);
    });

    it('should return a string that does not match the inverted regexp', (done) => {

        const regex = new RegExp(/[a-c]{3}-[d-f]{3}-[0-9]{4}/);
        const schema = Joi.string().regex(regex, { invert: true });
        const example = ValueGenerator.string(schema);

        expect(example.match(regex)).to.equal(null);
        ExpectValidation(example, schema, done);
    });

    it('should return a case-insensitive string', (done) => {

        const schema = Joi.string().valid('A').insensitive();
        const example = ValueGenerator.string(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return a Luhn-valid credit card number', (done) => {

        const schema = Joi.string().creditCard();
        const example = ValueGenerator.string(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return a hexadecimal string', (done) => {

        const schema = Joi.string().hex();
        const example = ValueGenerator.string(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return a token', (done) => {

        const schema = Joi.string().token();
        const example = ValueGenerator.string(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return an alphanumeric string', (done) => {

        const schema = Joi.string().alphanum();
        const example = ValueGenerator.string(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return a hostname', (done) => {

        const schema = Joi.string().hostname();
        const example = ValueGenerator.string(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return a IPv4 when given no options', (done) => {

        const schema = Joi.string().ip();
        const example = ValueGenerator.string(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return a IPv4 when given options and cidr is forbidden', (done) => {

        const schema = Joi.string().ip(
            {
                cidr : 'forbidden'
            });
        const example = ValueGenerator.string(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return a IPv4 when given options', (done) => {

        const schema = Joi.string().ip(
            {
                version : ['ipv4']
            });
        const example = ValueGenerator.string(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return a IPv4 when given options and cidr is forbidden', (done) => {

        const schema = Joi.string().ip(
            {
                version : ['ipv4'],
                cidr : 'forbidden'
            });
        const example = ValueGenerator.string(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return a IPv6 when given options', (done) => {

        const schema = Joi.string().ip(
            {
                version : ['ipv6']
            });
        const example = ValueGenerator.string(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return a IPv6 when given options and cidr is forbidden', (done) => {

        const schema = Joi.string().ip(
            {
                version : ['ipv6'],
                cidr : 'forbidden'
            });
        const example = ValueGenerator.string(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return uppercase value', (done) => {

        const schema = Joi.string().uppercase();
        const example = ValueGenerator.string(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return uppercase value for guid to test chaining', (done) => {

        const schema = Joi.string().guid().uppercase();
        const example = ValueGenerator.string(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return lowercase value', (done) => {

        const schema = Joi.string().lowercase();
        const example = ValueGenerator.string(schema);

        ExpectValidation(example, schema, done);
    });
});

describe('Number', () => {

    it('should return a number', (done) => {

        const schema = Joi.number();
        const example = ValueGenerator.number(schema);

        expect(example).to.be.a.number();
        ExpectValidation(example, schema, done);
    });

    it('should return a default value > 0', (done) => {

        const schema = Joi.number().default(9);
        const example = ValueGenerator.number(schema);

        expect(example).to.equal(9);
        ExpectValidation(example, schema, done);
    });

    it('should return a default value === 0', (done) => {

        const schema = Joi.number().default(0);
        const example = ValueGenerator.number(schema);

        expect(example).to.equal(0);
        ExpectValidation(example, schema, done);
    });

    it('should return a valid value instead of default', (done) => {

        const schema = Joi.number().valid(2).default(1);
        const example = ValueGenerator.number(schema);

        expect(example).to.equal(2);
        ExpectValidation(example, schema, done);
    });

    it('should return a negative number', (done) => {

        const schema = Joi.number().negative();
        const example = ValueGenerator.number(schema);

        expect(example).to.be.below(0);
        ExpectValidation(example, schema, done);
    });

    it('should return an integer', (done) => {

        const schema = Joi.number().integer();
        const example = ValueGenerator.number(schema);

        expect(example % 1).to.equal(0);
        ExpectValidation(example, schema, done);
    });

    it('should return a number which adheres to .min requirement', (done) => {

        const schema = Joi.number().min(20);
        const example = ValueGenerator.number(schema);

        expect(example).to.be.at.least(20);
        ExpectValidation(example, schema, done);
    });

    it('should return a number which adheres to .max requirement', (done) => {

        const schema = Joi.number().max(2);
        const example = ValueGenerator.number(schema);

        expect(example).to.be.at.most(2);
        ExpectValidation(example, schema, done);
    });

    it('should return a number which adheres to .greater requirement', (done) => {

        const schema = Joi.number().greater(20);
        const example = ValueGenerator.number(schema);

        expect(example).to.be.at.least(20);
        ExpectValidation(example, schema, done);
    });

    it('should return a number which adheres to .less requirement', (done) => {

        const schema = Joi.number().less(2);
        const example = ValueGenerator.number(schema);

        expect(example).to.be.at.most(2);
        ExpectValidation(example, schema, done);
    });

    it('should return a number which adheres to .precision requirement', (done) => {

        for (let i = 0; i < 500; ++i) {
            const schema = Joi.number().precision(2);
            const example = ValueGenerator.number(schema);

            expect(example.toString().split('.')[1].length).to.be.at.most(2);
            ExpectValidation(example, schema);
        }
        done();
    });

    it('should return a number which adheres to .multiple requirement', (done) => {

        const schema = Joi.number().multiple(4);
        const example = ValueGenerator.number(schema);

        expect(example % 4).to.equal(0);
        ExpectValidation(example, schema, done);
    });

    it('should return numbers which adhere to any valid combination of requirements', (done) => {

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

        const numberOptions = Permutations(requirements, requirementExclusions);

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

            const example = ValueGenerator.number(schema);

            ExpectValidation(example, schema);
        });
        done();
    });

    it('should return NaN for impossible combinations', (done) => {

        const impossibleMinSchema = Joi.number().negative().min(1);
        let example = ValueGenerator.number(impossibleMinSchema);

        expect(example).to.equal(NaN);

        example = 0;
        const impossibleMultipleSchema = Joi.number().max(10).multiple(12);
        example = ValueGenerator.number(impossibleMultipleSchema);

        expect(example).to.equal(NaN);

        example = 0;
        const impossibleMinMultipleSchema = Joi.number().negative().min(-10).multiple(12);
        example = ValueGenerator.number(impossibleMinMultipleSchema);

        expect(example).to.equal(NaN);

        example = 0;
        const impossibleMaxSchema = Joi.number().negative().max(10);
        example = ValueGenerator.number(impossibleMaxSchema);

        expect(example).to.equal(NaN);
        done();
    });
});

describe('Boolean', () => {

    it('should return a boolean', (done) => {

        const schema = Joi.boolean();
        const example = ValueGenerator.boolean(schema);

        expect(example).to.be.a.boolean();
        ExpectValidation(example, schema, done);
    });

    it('should return default "true" value', (done) => {

        for (let i = 0; i < 10; ++i) {
            const schema = Joi.boolean().default(true);
            const example = ValueGenerator.boolean(schema);

            expect(example).to.equal(true);
        }
        done();
    });

    it('should return default "false" value', (done) => {

        for (let i = 0; i < 10; ++i) {
            const schema = Joi.boolean().default(false);
            const example = ValueGenerator.boolean(schema);

            expect(example).to.equal(false);
        }
        done();
    });

    it('should return a truthy value when singlar number', (done) => {

        const schema = Joi.boolean().truthy(1);
        const example = ValueGenerator.boolean(schema);

        expect(example).to.be.a.number();
        expect(example).to.equal(1);
        ExpectValidation(example, schema, done);
    });

    it('should return a truthy value when singlar string', (done) => {

        const schema = Joi.boolean().truthy('y');
        const example = ValueGenerator.boolean(schema);

        expect(example).to.be.a.string();
        expect(example).to.equal('y');
        ExpectValidation(example, schema, done);
    });

    it('should return a truthy value when pluralized', (done) => {

        const schema = Joi.boolean().truthy([1, 'y']);
        const example = ValueGenerator.boolean(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return a falsy value when singlar number', (done) => {

        const schema = Joi.boolean().falsy(0);
        const example = ValueGenerator.boolean(schema);

        expect(example).to.be.a.number();
        expect(example).to.equal(0);
        ExpectValidation(example, schema, done);
    });

    it('should return a falsy value when singlar string', (done) => {

        const schema = Joi.boolean().falsy('n');
        const example = ValueGenerator.boolean(schema);

        expect(example).to.be.a.string();
        expect(example).to.equal('n');
        ExpectValidation(example, schema, done);
    });

    it('should return a falsy value when pluralized', (done) => {

        const schema = Joi.boolean().falsy([0, 'n']);
        const example = ValueGenerator.boolean(schema);

        ExpectValidation(example, schema, done);
    });

    it('should validate when a mix of truthy and falsy is set', (done) => {

        const schema = Joi.boolean().truthy([1, 'y']).falsy([0, 'n']);
        const example = ValueGenerator.boolean(schema);

        ExpectValidation(example, schema, done);
    });
});

describe('Binary', () => {

    it('should return a buffer', (done) => {

        const schema = Joi.binary();
        const example = ValueGenerator.binary(schema);

        expect(example).to.be.a.buffer();
        ExpectValidation(example, schema, done);
    });

    it('should return a string with specified encoding', (done) => {

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
            const example = ValueGenerator.binary(schema);

            expect(example).to.be.a.string();
            ExpectValidation(example, schema);
        });

        done();
    });

    it('should return a buffer of minimum size', (done) => {

        const schema = Joi.binary().min(100);
        const example = ValueGenerator.binary(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return a buffer of maximum size', (done) => {

        const schema = Joi.binary().max(100);
        const example = ValueGenerator.binary(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return a buffer of specified size', (done) => {

        const schema = Joi.binary().length(75);
        const example = ValueGenerator.binary(schema);

        expect(example.length).to.equal(75);
        ExpectValidation(example, schema, done);
    });

    it('should return a buffer of size between min and max', (done) => {

        const schema = Joi.binary().min(27).max(35);
        const example = ValueGenerator.binary(schema);

        expect(example.length).to.be.at.least(27).and.at.most(35);
        ExpectValidation(example, schema, done);
    });

});

describe('Date', () => {

    it('should return a date', (done) => {

        const schema = Joi.date();
        const example = ValueGenerator.date(schema);

        expect(example).to.be.a.date();
        ExpectValidation(example, schema, done);
    });

    it('should return a Date more recent than .min value', (done) => {

        const schema = Joi.date().min('1/01/3016');
        const example = ValueGenerator.date(schema);

        expect(example).to.be.above(new Date('1/01/3016'));
        ExpectValidation(example, schema, done);
    });

    it('should return a Date more recent than "now"', (done) => {

        const schema = Joi.date().min('now');
        const now = new Date();
        const example = ValueGenerator.date(schema);

        expect(example).to.be.above(now);
        ExpectValidation(example, schema, done);
    });

    it('should return a Date less recent than .max value', (done) => {

        const schema = Joi.date().max('1/01/1968');
        const example = ValueGenerator.date(schema);

        expect(example).to.be.below(new Date(0));
        ExpectValidation(example, schema, done);
    });

    it('should return a Date less recent than "now"', (done) => {

        const schema = Joi.date().max('now');
        const now = new Date();
        const example = ValueGenerator.date(schema);

        expect(example).to.be.below(now);
        ExpectValidation(example, schema, done);
    });

    it('should return a Date between .min and .max values', (done) => {

        for (let i = 1; i <= 20; ++i) {
            const minYear = 2000 + Math.ceil((Math.random() * 100));
            const maxYear = minYear + Math.ceil((Math.random()) * 10);
            const min = '1/01/' + minYear.toString();
            const max = '1/01/' + maxYear.toString();
            const schema = Joi.date().min(min).max(max);
            const example = ValueGenerator.date(schema);

            expect(example).to.be.above(new Date(min)).and.below(new Date(max));
            ExpectValidation(example, schema);
        }

        const smallMin = '1/01/2016';
        const smallMax = '3/01/2016';
        const smallSchema = Joi.date().min(smallMin).max(smallMax);
        const smallExample = ValueGenerator.date(smallSchema);

        ExpectValidation(smallExample, smallSchema);
        done();
    });

    it('should return a Date in ISO format', (done) => {

        const schema = Joi.date().iso();
        const example = ValueGenerator.date(schema);

        expect(example).to.be.a.string();
        ExpectValidation(example, schema, done);
    });

    it('should return a timestamp', (done) => {

        const schema = Joi.date().timestamp();
        const example = ValueGenerator.date(schema);

        expect(example).to.be.a.number();
        ExpectValidation(example, schema, done);
    });

    it('should return a unix timestamp', (done) => {

        const schema = Joi.date().timestamp('unix');
        const example = ValueGenerator.date(schema);

        expect(example).to.be.a.number();
        ExpectValidation(example, schema, done);
    });

    it('should return a moment formatted date', (done) => {

        const fmt = 'HH:mm';
        const schema = Joi.date().format(fmt);
        const example = ValueGenerator.date(schema);
        const moment = new Moment(example, fmt, true);

        expect(example).to.be.a.string();
        expect(moment.isValid()).to.equal(true);
        ExpectValidation(example, schema, done);
    });
});

describe('Function', () => {

    it('should return a function', (done) => {

        const schema = Joi.func();
        const example = ValueGenerator.func(schema);

        expect(example).to.be.a.function();
        ExpectValidation(example, schema, done);
    });

    it('should return a function with arity(1)', (done) => {

        const schema = Joi.func().arity(1);
        const example = ValueGenerator.func(schema);

        expect(example).to.be.a.function();
        ExpectValidation(example, schema, done);
    });

    it('should return a function with arity(10)', (done) => {

        const schema = Joi.func().arity(10);
        const example = ValueGenerator.func(schema);

        expect(example).to.be.a.function();
        ExpectValidation(example, schema, done);
    });

    it('should return a function with minArity(3)', (done) => {

        const schema = Joi.func().minArity(3);
        const example = ValueGenerator.func(schema);

        expect(example).to.be.a.function();
        ExpectValidation(example, schema, done);
    });

    it('should return a function with maxArity(4)', (done) => {

        const schema = Joi.func().maxArity(4);
        const example = ValueGenerator.func(schema);

        expect(example).to.be.a.function();
        ExpectValidation(example, schema, done);
    });

    it('should return a function with minArity(3) and maxArity(4)', (done) => {

        const schema = Joi.func().minArity(3).maxArity(4);
        const example = ValueGenerator.func(schema);

        expect(example).to.be.a.function();
        ExpectValidation(example, schema, done);
    });
});

describe('Array', () => {

    it('should return an array', (done) => {

        const schema = Joi.array();
        const example = ValueGenerator.array(schema);

        expect(example).to.be.an.array();
        ExpectValidation(example, schema, done);
    });

    it('should return an array with valid items', (done) => {

        const schema = Joi.array().items(Joi.number().required(), Joi.string().guid().required(), Joi.array().items(Joi.number().integer().min(43).required()).required());
        const example = ValueGenerator.array(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return an array with valid items and without forbidden items', (done) => {

        const schema = Joi.array().items(Joi.string().forbidden(), Joi.number().multiple(3));
        const example = ValueGenerator.array(schema);

        const stringItems = example.filter((item) => {

            return typeof item === 'string';
        });

        expect(stringItems.length).to.equal(0);
        ExpectValidation(example, schema, done);
    });

    it('should return an empty array with "sparse"', (done) => {

        const schema = Joi.array()
            .items(Joi.number())
            .sparse();
        const example = ValueGenerator.array(schema);

        expect(example.length).to.equal(0);
        ExpectValidation(example, schema, done);
    });

    it('should return an ordered array', (done) => {

        const schema = Joi.array().ordered(Joi.string().max(3).required(), Joi.number().negative().integer().required(), Joi.boolean().required());
        const example = ValueGenerator.array(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return an array with "length" random items', (done) => {

        const schema = Joi.array().length(4);
        const example = ValueGenerator.array(schema);

        expect(example.length).to.equal(4);
        ExpectValidation(example, schema, done);
    });

    it('should return an array with "length" specified items', (done) => {

        const schema = Joi.array()
            .items(Joi.number().integer(), Joi.string().guid(), Joi.boolean())
            .length(10);
        const example = ValueGenerator.array(schema);

        expect(example.length).to.equal(10);
        ExpectValidation(example, schema, done);
    });

    it('should return an array with no more than "length" specified items', (done) => {

        const schema = Joi.array()
            .items(Joi.number().integer(), Joi.string().guid(), Joi.boolean())
            .length(2);
        const example = ValueGenerator.array(schema);

        expect(example.length).to.equal(2);
        ExpectValidation(example, schema, done);
    });

    it('should return an array with "min" random items', (done) => {

        const schema = Joi.array().min(4);
        const example = ValueGenerator.array(schema);

        expect(example.length).to.equal(4);
        ExpectValidation(example, schema, done);
    });

    it('should return an array with "min" specified items', (done) => {

        const schema = Joi.array()
            .items(Joi.number().integer(), Joi.string().guid(), Joi.boolean())
            .min(10);
        const example = ValueGenerator.array(schema);

        expect(example.length).to.equal(10);
        ExpectValidation(example, schema, done);
    });

    it('should return an array with "max" random items', (done) => {

        const schema = Joi.array().max(4);
        const example = ValueGenerator.array(schema);

        expect(example.length).to.be.at.least(1);
        expect(example.length).to.be.at.most(4);
        ExpectValidation(example, schema, done);
    });

    it('should return an array with "max" specified items', (done) => {

        const schema = Joi.array()
            .items(Joi.number().integer(), Joi.string().guid(), Joi.boolean())
            .max(10);
        const example = ValueGenerator.array(schema);

        expect(example.length).to.be.at.least(1);
        expect(example.length).to.be.at.most(10);
        ExpectValidation(example, schema, done);
    });

    it('should return an array with "min" and "max" random items', (done) => {

        const schema = Joi.array()
            .min(4)
            .max(5);
        const example = ValueGenerator.array(schema);

        expect(example.length).to.be.at.least(4);
        expect(example.length).to.be.at.most(5);
        ExpectValidation(example, schema, done);
    });

    it('should return an array with "min" and "max" specified items', (done) => {

        const schema = Joi.array()
            .items(Joi.number().integer(), Joi.string().guid(), Joi.boolean())
            .min(10)
            .max(15);
        const example = ValueGenerator.array(schema);

        expect(example.length).to.be.at.least(10);
        expect(example.length).to.be.at.most(15);
        ExpectValidation(example, schema, done);
    });

    it('should return a semi-ordered array with "min" specified items', (done) => {

        const schema = Joi.array()
            .ordered(Joi.string(), Joi.number())
            .items(Joi.boolean().required(), Joi.array().items(Joi.boolean().required()).required())
            .min(6);
        const example = ValueGenerator.array(schema);

        expect(example[0]).to.be.a.string();
        expect(example[1]).to.be.a.number();
        expect(example.length).to.be.at.least(6);
        ExpectValidation(example, schema, done);
    });

    it('should return a single item array with a number', (done) => {

        const schema = Joi.array().items(Joi.number().required()).single();
        const example = ValueGenerator.array(schema);
        expect(example).to.be.a.number();
        ExpectValidation(example, schema, done);
    });

    it('should return a single item with a number', (done) => {

        const schema = Joi.array().items(Joi.number().required()).single(false);
        const example = ValueGenerator.array(schema);
        expect(example[0]).to.be.a.number();
        ExpectValidation(example, schema, done);
    });
});

describe('Alternatives', () => {

    it('should return one of the "try" schemas', (done) => {

        const schema = Joi.alternatives()
            .try(Joi.string(), Joi.number());
        const example = ValueGenerator.alternatives(schema);

        expect(example).to.not.be.undefined();
        ExpectValidation(example, schema, done);
    });

    it('should return the single "try" schema', (done) => {

        const schema = Joi.alternatives()
            .try(Joi.string());
        const example = ValueGenerator.alternatives(schema);

        expect(example).to.be.a.string();
        ExpectValidation(example, schema, done);
    });

    it('should return "when" alternative', (done) => {

        const schema = Joi.object().keys({
            dependent: Joi.alternatives().when('sibling.driver', {
                is  : Joi.string(),
                then: Joi.string()
            }),
            sibling  : Joi.object().keys({
                driver: Joi.string()
            })
        });
        const example = ValueGenerator.object(schema);

        expect(example.dependent).to.be.a.string();
        ExpectValidation(example, schema, done);
    });

    it('should return "when.otherwise" alternative', (done) => {

        const schema = Joi.object().keys({
            dependent: Joi.alternatives().when('sibling.driver', {
                is       : Joi.string(),
                then     : Joi.string(),
                otherwise: Joi.number()
            }),
            sibling  : Joi.object().keys({
                driver: Joi.boolean()
            })
        });
        const example = ValueGenerator.object(schema);

        expect(example.dependent).to.be.a.number();
        ExpectValidation(example, schema, done);
    });
});

describe('Object', () => {

    it('should return an object', (done) => {

        const schema = Joi.object();
        const example = ValueGenerator.object(schema);

        expect(example).to.be.an.object();
        ExpectValidation(example, schema, done);
    });

    it('should return an object with specified keys', (done) => {

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
        const example = ValueGenerator.object(schema);

        expect(example).to.be.an.object();
        expect(example.string).to.be.a.string();
        expect(example.number).to.be.a.number();
        expect(example.boolean).to.be.a.boolean();
        expect(example.time).to.be.a.date();
        expect(example.buffer).to.be.a.buffer();
        expect(example.array).to.be.an.array();
        expect(example.innerObj).to.be.an.object();
        expect(example.innerObj.innerString).to.be.a.string();
        ExpectValidation(example, schema, done);
    });

    it('should return an object with min number of keys', (done) => {

        const schema = Joi.object().min(5);
        const example = ValueGenerator.object(schema);

        expect(Object.keys(example).length).to.be.at.least(5);
        ExpectValidation(example, schema, done);
    });

    it('should return an object with max number of keys', (done) => {

        const schema = Joi.object().max(5);
        const example = ValueGenerator.object(schema);

        expect(Object.keys(example).length).to.be.at.most(5).and.at.least(1);
        ExpectValidation(example, schema, done);
    });

    it('should return an object with exact number of keys', (done) => {

        const schema = Joi.object().length(5);
        const example = ValueGenerator.object(schema);

        expect(Object.keys(example).length).to.equal(5);
        ExpectValidation(example, schema, done);
    });

    it('should return an object with one of two "nand" keys', (done) => {

        const schema = Joi.object()
            .keys({
                a: Joi.string(),
                b: Joi.string(),
                c: Joi.string()
            })
            .nand('a', 'b');
        const example = ValueGenerator.object(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return an object with one of two "xor" keys', (done) => {

        const schema = Joi.object()
            .keys({
                a: Joi.string(),
                b: Joi.string(),
                c: Joi.string()
            })
            .xor('a', 'b');
        const example = ValueGenerator.object(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return an object with alternatives', (done) => {

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
            const example = ValueGenerator.object(schema);

            ExpectValidation(example, schema);
        }
        done();
    });

    it('should return an object with array-syntax alternatives', (done) => {

        const schema = Joi.object().keys({
            access_token: [Joi.string(), Joi.number()],
            birthyear   : Joi.number().integer().min(1900).max(2013)
        });
        const example = ValueGenerator.object(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return an object without key set as Any.forbidden()', (done) => {

        const schema = Joi.object().keys({
            allowed  : Joi.any(),
            forbidden: Joi.any().forbidden(),
            forbidStr: Joi.string().forbidden(),
            forbidNum: Joi.number().forbidden()
        });
        const example = ValueGenerator.object(schema);

        expect(example.forbidden).to.be.undefined();
        expect(example.forbidStr).to.be.undefined();
        expect(example.forbidNum).to.be.undefined();
        ExpectValidation(example, schema, done);
    });

    it('should return an object without key set as Any.strip()', (done) => {

        const schema = Joi.object().keys({
            allowed   : Joi.any(),
            private   : Joi.any().strip(),
            privateStr: Joi.string().strip(),
            privateNum: Joi.number().strip()
        });
        const example = ValueGenerator.object(schema);

        expect(example.private).to.be.undefined();
        expect(example.privateStr).to.be.undefined();
        expect(example.privateNum).to.be.undefined();
        ExpectValidation(example, schema, done);
    });

    it('should return an object with single rename() invocation', (done) => {

        const schema = Joi.object().keys({
            b : Joi.number()
        }).rename('a','b');
        const example = ValueGenerator.object(schema);

        expect(example.a).to.be.a.number();
        ExpectValidation(example, schema, done);
    });

    it('should return an object with double rename() invocation', (done) => {

        const schema = Joi.object().keys({
            b : Joi.number()
        }).rename('a','b').rename('c','b', { multiple: true });
        const example = ValueGenerator.object(schema);

        expect(example.a).to.be.a.number();
        ExpectValidation(example, schema, done);
    });

    it('should return a schema object with schema() invocation', (done) => {

        const schema = Joi.object().schema();
        const example = ValueGenerator.object(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return an object of type Regex', (done) => {

        const schema = Joi.object().type(RegExp);
        const example = ValueGenerator.object(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return an object of type Error', (done) => {

        const schema = Joi.object().type(Error);
        const example = ValueGenerator.object(schema);

        ExpectValidation(example, schema, done);
    });

    it('should return an object of custom type', (done) => {

        const Class1 = function () {};
        Class1.prototype.testFunc = function () {};

        const schema = Joi.object().type(Class1);
        const example = ValueGenerator.object(schema);

        expect(example.testFunc).to.be.a.function();
        ExpectValidation(example, schema, done);
    });
});
