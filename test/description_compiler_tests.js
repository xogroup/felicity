'use strict';

const Joi = require('../lib/joi');
const Lab = require('lab');
const Uuid = require('uuid');
const DescriptionCompiler = require('../lib/helpers').descriptionCompiler;

const { describe, expect, it } = exports.lab = Lab.script();

describe('String', () => {

    it('should return the compiled string schema', () => {

        const invalidExample = 'abcd';
        const validExample = Uuid.v4();
        const description = Joi.string().min(5).guid().required().default('default value').describe();
        const schema = DescriptionCompiler(description);

        Joi.validate(validExample, schema, (err, value) => {

            expect(err).to.equal(null);
        });
        Joi.validate(invalidExample, schema, (err, value) => {

            expect(err.details[0].message).to.equal('"value" length must be at least 5 characters long');
        });
    });

    it('should return the compiled object schema', () => {

        const invalidExample = {
            string: '1243'
        };
        const validExample = {
            string: '1234567890'
        };
        const originSchema = Joi.object().keys({
            string: Joi.string().min(5).required()
        });
        const description = originSchema.describe();
        const schema = DescriptionCompiler(description);

        Joi.validate(validExample, schema, (err) => {

            expect(err).to.equal(null);
        });
        Joi.validate(invalidExample, schema, (err) => {

            expect(err).to.not.equal(null);
            expect(err.details[0].message).to.equal('"string" length must be at least 5 characters long');
        });
    });
});
