'use strict';

const Code = require('code');
const Joi = require('joi');
const Lab = require('lab');
const Uuid = require('uuid');
const DescriptionCompiler = require('../lib/descriptionCompiler');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;

describe('String', () => {

    it('should return the compiled string schema', (done) => {

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
        done();
    });
});
