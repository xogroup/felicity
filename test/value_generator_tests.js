'use strict';

const Code = require('code');
const Hoek = require('hoek');
const Joi = require('joi');
const Lab = require('lab');
const Permutations = require('./permutations');
const ValueGenerator = require('../lib/valueGenerator');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;

const expectValidation = function (value, schema) {

    const validationResult = Joi.validate(value, schema);

    expect(validationResult.error).to.equal(null);
};

describe('String', () => {

    it('should return a basic string', (done) => {

        const schema = Joi.string();
        const example = ValueGenerator.string(schema);

        expect(example).to.be.a.string();
        expectValidation(example, schema);
        done();
    });

    it('should return a GUID', (done) => {

        const schema = Joi.string().guid();
        const example = ValueGenerator.string(schema);

        expect(example).to.be.a.string();
        expectValidation(example, schema);
        done();
    });

    it('should return an email', (done) => {

        const schema = Joi.string().email();
        const example = ValueGenerator.string(schema);

        expect(example).to.be.a.string();
        expectValidation(example, schema);
        done();
    });

    it('should return default value', (done) => {

        const schema = Joi.string().default('fallback');
        const example = ValueGenerator.string(schema);

        expect(example).to.equal('fallback');
        expectValidation(example, schema);
        done();
    });

    it('should return a string which adheres to .min requirement', (done) => {

        for (let i = 0; i <= 5; ++i) {

            const min = Math.ceil((Math.random() + 1) * Math.pow(1 + i, i));
            const schema = Joi.string().min(min);
            const example = ValueGenerator.string(schema);

            expect(example.length).to.be.at.least(min);
            expectValidation(example, schema);
        }

        done();
    });

    it('should return a string which adheres to .max requirement', (done) => {

        for (let i = 0; i <= 5; ++i) {

            const max = Math.ceil((Math.random() + 1) * Math.pow(1 + i, i));
            const schema = Joi.string().max(max);
            const example = ValueGenerator.string(schema);

            expect(example.length).to.be.at.most(max);
            expectValidation(example, schema);
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

            expect(example.length).to.be.at.most(max);
            expect(example.length).to.be.at.least(min);
            expectValidation(example, schema);
        }

        const largeMax = 750;
        const largeMin = 500;
        const largeSchema = Joi.string().min(largeMin).max(largeMax);
        const largeExample = ValueGenerator.string(largeSchema);

        expect(largeExample.length).to.be.at.most(largeMax);
        expect(largeExample.length).to.be.at.least(largeMin);
        expectValidation(largeExample, largeSchema);
        done();
    });

    it('should return a string which adheres to .length requirement', (done) => {

        for (let i = 0; i <= 5; ++i) {

            const length = Math.ceil((Math.random() + 1) * Math.pow(1 + i, i));
            const schema = Joi.string().length(length);
            const example = ValueGenerator.string(schema);

            expect(example.length).to.equal(length);
            expectValidation(example, schema);
        }

        done();
    });

    it('should return a string which adheres to .isoDate requirement', (done) => {

        const schema = Joi.string().isoDate();
        const example = ValueGenerator.string(schema);

        expect((new Date(example)).toISOString()).to.equal(example);
        expectValidation(example, schema);
        done();
    });
});

describe('Number', () => {

    it('should return a number', (done) => {

        const schema = Joi.number();
        const example = ValueGenerator.number(schema);

        expect(example).to.be.a.number();
        expectValidation(example, schema);
        done();
    });

    it('should return a default value > 0', (done) => {

        const schema = Joi.number().default(9);
        const example = ValueGenerator.number(schema);

        expect(example).to.equal(9);
        expectValidation(example, schema);
        done();
    });

    it('should return a default value === 0', (done) => {

        const schema = Joi.number().default(0);
        const example = ValueGenerator.number(schema);

        expect(example).to.equal(0);
        expectValidation(example, schema);
        done();
    });

    it('should return a negative number', (done) => {

        const schema = Joi.number().negative();
        const example = ValueGenerator.number(schema);

        expect(example).to.be.below(0);
        expectValidation(example, schema);
        done();
    });

    it('should return an integer', (done) => {

        const schema = Joi.number().integer();
        const example = ValueGenerator.number(schema);

        expect(example % 1).to.equal(0);
        expectValidation(example, schema);
        done();
    });

    it('should return a number which adheres to .min requirement', (done) => {

        const schema = Joi.number().min(20);
        const example = ValueGenerator.number(schema);

        expect(example).to.be.at.least(20);
        expectValidation(example, schema);
        done();
    });

    it('should return a number which adheres to .max requirement', (done) => {

        const schema = Joi.number().max(2);
        const example = ValueGenerator.number(schema);

        expect(example).to.be.at.most(2);
        expectValidation(example, schema);
        done();
    });

    it('should return a number which adheres to .greater requirement', (done) => {

        const schema = Joi.number().greater(20);
        const example = ValueGenerator.number(schema);

        expect(example).to.be.at.least(20);
        expectValidation(example, schema);
        done();
    });

    it('should return a number which adheres to .less requirement', (done) => {

        const schema = Joi.number().less(2);
        const example = ValueGenerator.number(schema);

        expect(example).to.be.at.most(2);
        expectValidation(example, schema);
        done();
    });

    it('should return a number which adheres to .precision requirement', (done) => {

        const schema = Joi.number().precision(2);
        const example = ValueGenerator.number(schema);

        expect(example).to.be.a.number();
        expect(example.toString().split('.')[1].length).to.be.at.most(2);
        expectValidation(example, schema);
        done();
    });

    it('should return a number which adheres to .multiple requirement', (done) => {

        const schema = Joi.number().multiple(4);
        const example = ValueGenerator.number(schema);

        expect(example % 4).to.equal(0);
        expectValidation(example, schema);
        done();
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

            expectValidation(example, schema);
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
        done();
    });
});

describe('Boolean', () => {

    it('should return a boolean', (done) => {

        const schema = Joi.boolean();
        const example = ValueGenerator.boolean(schema);

        expect(example).to.be.a.boolean();
        expectValidation(example, schema);
        done();
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
});

describe('Date', () => {

    it('should return a date', (done) => {

        const schema = Joi.date();
        const example = ValueGenerator.date(schema);

        expect(example).to.be.a.date();
        expectValidation(example, schema);
        done();
    });

    it('should return a Date more recent than .min value', (done) => {

        const schema = Joi.date().min('1/01/3016');
        const example = ValueGenerator.date(schema);

        expect(example).to.be.above(new Date('1/01/3016'));
        expectValidation(example, schema);
        done();
    });

    it('should return a Date more recent than "now"', (done) => {

        const schema = Joi.date().min('now');
        const now = new Date();
        const example = ValueGenerator.date(schema);

        expect(example).to.be.above(now);
        expectValidation(example, schema);
        done();
    });

    it('should return a Date less recent than .max value', (done) => {

        const schema = Joi.date().max('1/01/1968');
        const example = ValueGenerator.date(schema);

        expect(example).to.be.below(new Date(0));
        expectValidation(example, schema);
        done();
    });

    it('should return a Date less recent than "now"', (done) => {

        const schema = Joi.date().max('now');
        const now = new Date();
        const example = ValueGenerator.date(schema);

        expect(example).to.be.below(now);
        expectValidation(example, schema);
        done();
    });

    it('should return a Date between .min and .max values', (done) => {

        for (let i = 1; i <= 10; ++i) {
            const minYear = Math.ceil((Math.random() * 4000));
            const maxYear = minYear + Math.ceil((Math.random()) * 10);
            const min = '1/01/' + minYear.toString();
            const max = '1/01/' + maxYear.toString();
            const schema = Joi.date().min(min).max(max);
            const example = ValueGenerator.date(schema);

            expect(example).to.be.above(new Date(min)).and.below(new Date(max));
            expectValidation(example, schema);
        }

        const smallMin = '1/01/2016';
        const smallMax = '3/01/2016';
        const smallSchema = Joi.date().min(smallMin).max(smallMax);
        const smallExample = ValueGenerator.date(smallSchema);

        expectValidation(smallExample, smallSchema);
        done();
    });

    it('should return a Date in ISO format', (done) => {

        const schema = Joi.date().iso();
        const example = ValueGenerator.date(schema);

        expect(example).to.be.a.string();
        expectValidation(example, schema);
        done();
    });

    it('should return a timestamp', (done) => {

        const schema = Joi.date().timestamp();
        const example = ValueGenerator.date(schema);

        expect(example).to.be.a.number();
        expectValidation(example, schema);
        done();
    });

    it('should return a unix timestamp', (done) => {

        const schema = Joi.date().timestamp('unix');
        const example = ValueGenerator.date(schema);

        expect(example).to.be.a.number();
        expectValidation(example, schema);
        done();
    });
});
