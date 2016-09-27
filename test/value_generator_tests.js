'use strict';

const Code = require('code');
const ValueGenerator = require('../lib/valueGenerator');
const Joi = require('joi');
const Lab = require('lab');

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
});
