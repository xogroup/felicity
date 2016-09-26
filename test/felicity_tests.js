'use strict';

const Code = require('code');
const Felicity = require('../lib');
const Joi = require('joi');
const Lab = require('lab');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;

expect(Felicity.skeleton).to.exist();

describe('Felicity Skeleton', () => {

    it('should fail when calling without proper schema', (done) => {

        expect(Felicity.skeleton).to.throw(Error, 'You must pass a valid schema to generate');
        done();
    });

    it('should return an empty object when schema is empty', (done) => {

        const schema = {};
        const felicitySkeleton = new Felicity.skeleton(schema);

        expect(felicitySkeleton).to.equal({});
        done();
    });

    describe('String', () => {

        /*it('should return null', (done) => {

            const schema = Joi.string();
            const felicityInstance = new Felicity.skeleton(schema);

            expect(felicityInstance).to.equal(null);
            done();
        });*/

        it('should return an object with string property set to null', (done) => {

            const schema = Joi.object().keys({
                key1: Joi.string().required()
            });
            const felicityInstance = new Felicity.skeleton(schema);

            expect(felicityInstance.key1).to.equal(null);
            done();
        });

        it('should return object with regex pattern set to null', (done) => {

            const schema = Joi.object().keys({
                key1: Joi.string().regex(/\b(?:0|[1-9][0-9]*)/).required()
            });
            const felicityInstance = new Felicity.skeleton(schema);

            expect(felicityInstance.key1).to.equal(null);
            done();
        });

        it('should return object with guid set to null', (done) => {

            const schema = Joi.object().keys({
                key1: Joi.string().guid().required()
            });
            const felicityInstance = new Felicity.skeleton(schema);

            expect(felicityInstance.key1).to.equal(null);
            done();
        });
    });

    describe('Boolean', () => {

        /*it('should return false', (done) => {

            const schema = Joi.boolean();
            const felicityInstance = new Felicity.skeleton(schema);

            expect(felicityInstance).to.equal(false);
            done();
        });*/

        it('should return an object with boolean property set to false', (done) => {

            const schema = Joi.object().keys({
                key1: Joi.boolean().required()
            });
            const felicityInstance = new Felicity.skeleton(schema);

            expect(felicityInstance.key1).to.equal(false);
            done();
        });
    });

    describe('Date', () => {

        /*it('should return null', (done) => {

            const schema = Joi.date();
            const felicityInstance = new Felicity.skeleton(schema);

            expect(felicityInstance).to.equal(null);
            done();
        });*/

        it('should return an object with date property set to null', (done) => {

            const schema = Joi.object().keys({
                key1: Joi.date().required()
            });
            const felicityInstance = new Felicity.skeleton(schema);

            expect(felicityInstance.key1).to.equal(null);
            done();
        });
    });

    describe('Number', () => {

        it('should return an object with number property set to 0', (done) => {

            const schema = Joi.object().keys({
                key1: Joi.number().required()
            });
            const felicityInstance = new Felicity.skeleton(schema);

            expect(felicityInstance.key1).to.equal(0);
            done();
        });
    });

    describe('Conditional', () => {

        it('should default to the "true" driver', (done) => {

            const schema = Joi.object().keys({
                driver       : true,
                myConditional: Joi.when('driver', {
                    is       : true,
                    then     : Joi.string().required(),
                    otherwise: Joi.number().required()
                })
            });
            const felicityInstance = new Felicity.skeleton(schema);

            expect(felicityInstance.myConditional).to.equal(null);
            done();
        });
    });

    describe('Array', () => {

        it('should return an object with array property set to []', (done) => {

            const schema = Joi.object().keys({
                key1: Joi.array().required()
            });
            const felicityInstance = new Felicity.skeleton(schema);

            expect(felicityInstance.key1).to.equal([]);
            done();
        });
    });

    describe('Object', () => {

        it('should return an object with no keys', (done) => {

            const schema = Joi.object().keys();
            const felicityInstance = new Felicity.skeleton(schema);

            expect(felicityInstance).to.equal({});
            done();
        });

        it('should return an object with keys', (done) => {

            const schema = Joi.object().keys({
                key1: Joi.object().keys().required()
            });
            const felicityInstance = new Felicity.skeleton(schema);

            expect(felicityInstance.key1).to.equal({});
            done();
        });

        it('should return an object with mixed-type keys', (done) => {

            const schema = Joi.object().keys({
                innerObject: Joi.object().keys({
                    innerArray: Joi.array().items(Joi.number()).min(3).max(6).required()
                }).required(),
                string     : Joi.string().email().required(),
                date       : Joi.date().raw().required(),
                bool       : Joi.boolean().required(),
                conditional: Joi.when('bool', {
                    is       : true,
                    then     : Joi.object().keys().required(),
                    otherwise: Joi.boolean().required()
                })
            });
            const felicityInstance = new Felicity.skeleton(schema);

            expect(felicityInstance.innerObject).to.be.an.object();
            expect(felicityInstance.innerObject.innerArray).to.equal([]);
            expect(felicityInstance.string).to.equal(null);
            expect(felicityInstance.date).to.equal(null);
            expect(felicityInstance.bool).to.equal(false);
            expect(felicityInstance.conditional).to.equal({});
            done();
        });
    });
});
