'use strict';

const Code = require('code');
const Felicity = require('../lib');
const Joi = require('joi');
const Lab = require('lab');
const Uuid = require('uuid');
const ExpectValidation = require('./test_helpers').expectValidation;

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;

describe('Felicity Example', () => {

    it('should return a string', (done) => {

        const schema = Joi.string();
        const example = Felicity.example(schema);

        expect(example).to.be.a.string();
        ExpectValidation(example, schema, done);
    });

    it('should return a string that ignores regex lookarounds', (done) => {

        const lookAheadPattern = /abcd(?=efg)/;
        const schema = Joi.string().regex(lookAheadPattern);
        const example = Felicity.example(schema);

        expect(example).to.equal('abcd');
        expect(example.match(lookAheadPattern)).to.equal(null);
        done();
    });

    it('should throw validation error on regex lookarounds when provided strictExample config', (done) => {

        const schema = Joi.string().regex(/abcd(?=efg)/);
        const options = {
            config: {
                strictExample: true
            }
        };
        const callExample = function () {

            return Felicity.example(schema, options);
        };

        expect(callExample).to.throw('\"value\" with value \"abcd\" fails to match the required pattern: /abcd(?=efg)/');
        done();
    });

    it('should not throw validation error on supported regex when provided strictExample config', (done) => {

        const schema = Joi.string().regex(/abcd/);
        const options = {
            config: {
                strictExample: true
            }
        };
        const callExample = function () {

            return Felicity.example(schema, options);
        };

        expect(callExample).to.not.throw();
        ExpectValidation(callExample(), schema, done);
    });

    it('should return a number', (done) => {

        const schema = Joi.number();
        const example = Felicity.example(schema);

        expect(example).to.be.a.number();
        ExpectValidation(example, schema, done);
    });

    it('should return a boolean', (done) => {

        const schema = Joi.boolean();
        const example = Felicity.example(schema);

        expect(example).to.be.a.boolean();
        ExpectValidation(example, schema, done);
    });

    it('should return a buffer', (done) => {

        const schema = Joi.binary();
        const example = Felicity.example(schema);

        expect(example).to.be.a.buffer();
        ExpectValidation(example, schema, done);
    });

    it('should return a date', (done) => {

        const schema = Joi.date();
        const example = Felicity.example(schema);

        expect(example).to.be.a.date();
        ExpectValidation(example, schema, done);
    });

    it('should return a function', (done) => {

        const schema = Joi.func();
        const example = Felicity.example(schema);

        expect(example).to.be.a.function();
        ExpectValidation(example, schema, done);
    });

    it('should return an array', (done) => {

        const schema = Joi.array();
        const example = Felicity.example(schema);

        expect(example).to.be.an.array();
        ExpectValidation(example, schema, done);
    });

    it('should return an object with default values', (done) => {

        const schema = Joi.object().keys({
            string: Joi.string().required().default('-----'),
            number: Joi.number().default(4)
        });
        const example = Felicity.example(schema);

        expect(example.string).to.equal('-----');
        expect(example.number).to.equal(4);
        ExpectValidation(example, schema, done);
    });

    it('should not return an object with default values when provided ignoreDefaults config', (done) => {

        const schema = Joi.object().keys({
            string: Joi.string().alphanum().required().default('-----'),
            number: Joi.number().default(4)
        });
        const options = {
            config: {
                ignoreDefaults: true
            }
        };
        const example = Felicity.example(schema, options);

        expect(example.string).to.not.equal('-----');
        expect(example.number).to.not.equal(4);
        ExpectValidation(example, schema, done);
    });

    it('should return an object without optional keys', (done) => {

        const schema = Joi.object().keys({
            required: Joi.string().required(),
            present : Joi.string(),
            optional: Joi.string().optional()
        });
        const example = Felicity.example(schema);

        expect(example.required).to.be.a.string();
        expect(example.present).to.be.a.string();
        expect(example.optional).to.be.undefined();
        ExpectValidation(example, schema, done);
    });

    it('should return an object with optional keys when given includeOptional config', (done) => {

        const schema = Joi.object().keys({
            required: Joi.string().required(),
            present : Joi.string(),
            optional: Joi.string().optional()
        });
        const options = {
            config: {
                includeOptional: true
            }
        };
        const example = Felicity.example(schema, options);

        expect(example.required).to.be.a.string();
        expect(example.present).to.be.a.string();
        expect(example.optional).to.be.a.string();
        ExpectValidation(example, schema, done);
    });

    it('should return the Joi facebook example', (done) => {

        const passwordPattern = /^[a-zA-Z0-9]{3,30}$/;
        const schema = Joi.object().keys({
            username: Joi.string().alphanum().min(3).max(30).insensitive().required(),
            password: Joi.string().regex(passwordPattern),
            access_token: [Joi.string(), Joi.number()],
            birthyear: Joi.number().integer().min(1900).max(2013),
            email: Joi.string().email()
        }).with('username', 'birthyear').without('password', 'access_token');
        const example = Felicity.example(schema);

        expect(example.password.match(passwordPattern)).to.not.equal(null);
        ExpectValidation(example, schema, done);
    });

    it('should return the Joi facebook example with an optional key', (done) => {

        const passwordPattern = /^[a-zA-Z0-9]{3,30}$/;
        const schema = Joi.object().keys({
            username: Joi.string().alphanum().min(3).max(30).required(),
            password: Joi.string().regex(passwordPattern),
            access_token: [Joi.string(), Joi.number()],
            birthyear: Joi.number().integer().min(1900).max(2013).optional(),
            email: Joi.string().email()
        }).with('username', 'birthyear').without('password', 'access_token');
        const example = Felicity.example(schema);

        expect(example.password.match(passwordPattern)).to.not.equal(null);
        expect(example.birthyear).to.be.a.number();
        ExpectValidation(example, schema, done);
    });
});

describe('Felicity EntityFor', () => {

    it('should fail when calling without proper schema', (done) => {

        expect(Felicity.entityFor).to.throw(Error, 'You must provide a Joi schema');
        done();
    });

    it('should return a constructor function', (done) => {

        const schema = {};
        const Constructor = Felicity.entityFor(schema);

        expect(Constructor).to.be.a.function();

        const skeleton = new Constructor();

        expect(skeleton).to.be.an.object();
        done();
    });

    it('should enforce "new" instantiation on returned Contructor', (done) => {

        const schema = {};
        const Constructor = Felicity.entityFor(schema);

        expect(Constructor).to.be.a.function();

        expect(() => {

            return Constructor();
        }).to.throw('Objects must be instantiated using new');
        done();
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
            const felicityInstance = new (Felicity.entityFor(schema));

            expect(felicityInstance.myConditional).to.equal(null);
            expect(felicityInstance.validate).to.be.a.function();
            done();
        });
    });

    describe('Object', () => {

        it('should return an object with no keys', (done) => {

            const schema = Joi.object().keys();
            const felicityInstance = new (Felicity.entityFor(schema));

            expect(felicityInstance).to.be.an.object();
            expect(felicityInstance.validate).to.be.a.function();
            done();
        });

        it('should return an object with keys', (done) => {

            const schema = Joi.object().keys({
                key1: Joi.object().keys().required()
            });
            const felicityInstance = new (Felicity.entityFor(schema));

            expect(felicityInstance.key1).to.equal({});
            expect(felicityInstance.validate).to.be.a.function();
            done();
        });

        it('should return an object with mixed-type keys', (done) => {

            const schema = Joi.object().keys({
                innerObject: Joi.object().keys({
                    innerArray: Joi.array().items(Joi.number()).min(3).max(6).required(),
                    number    : Joi.number()
                }),
                string     : Joi.string().email().required(),
                date       : Joi.date().raw().required(),
                bool       : Joi.boolean().required(),
                conditional: Joi.when('bool', {
                    is       : true,
                    then     : Joi.object().keys().required(),
                    otherwise: Joi.boolean().required()
                })
            });
            const felicityInstance = new (Felicity.entityFor(schema));

            expect(felicityInstance.innerObject).to.be.an.object();
            expect(felicityInstance.innerObject.innerArray).to.equal([]);
            expect(felicityInstance.innerObject.number).to.equal(0);
            expect(felicityInstance.string).to.equal(null);
            expect(felicityInstance.date).to.equal(null);
            expect(felicityInstance.bool).to.equal(false);
            expect(felicityInstance.conditional).to.equal({});
            expect(felicityInstance.validate).to.be.a.function();
            done();
        });

        it('should return an object with mixed-type keys for non-compiled schema', (done) => {

            const schema = {
                innerObject: Joi.object().keys({
                    innerArray: Joi.array().items(Joi.number()).min(3).max(6).required(),
                    number    : Joi.number()
                }),
                string     : Joi.string().email().required(),
                date       : Joi.date().raw().required(),
                bool       : Joi.boolean().required(),
                conditional: Joi.when('bool', {
                    is       : true,
                    then     : Joi.object().keys().required(),
                    otherwise: Joi.boolean().required()
                }),
                optional   : Joi.string().optional(),
                otherCond  : Joi.alternatives().when('bool', {
                    is       : true,
                    then     : Joi.string().required(),
                    otherwise: Joi.boolean().required()
                })
            };
            const felicityInstance = new (Felicity.entityFor(schema));

            expect(felicityInstance.innerObject).to.be.an.object();
            expect(felicityInstance.innerObject.innerArray).to.equal([]);
            expect(felicityInstance.innerObject.number).to.equal(0);
            expect(felicityInstance.string).to.equal(null);
            expect(felicityInstance.date).to.equal(null);
            expect(felicityInstance.bool).to.equal(false);
            expect(felicityInstance.conditional).to.equal({});
            expect(felicityInstance.optional).to.be.undefined();
            expect(felicityInstance.otherCond).to.equal(null);
            expect(felicityInstance.validate).to.be.a.function();
            done();
        });

        it('should not include keys with "optional" flag', (done) => {

            const schema = Joi.object().keys({
                key1: Joi.string().required(),
                key2: Joi.string(),
                key3: Joi.string().optional()
            });
            const felicityInstance = new (Felicity.entityFor(schema));

            expect(felicityInstance.key1).to.equal(null);
            expect(felicityInstance.key2).to.equal(null);
            expect(felicityInstance.key3).to.not.exist();
            expect(felicityInstance.validate).to.be.a.function();
            done();
        });

        it('should include keys with "optional" flag if provided includeOptional config', (done) => {

            const schema = Joi.object().keys({
                key1: Joi.string().required(),
                key2: Joi.string(),
                key3: Joi.string().optional()
            });
            const options = {
                config: {
                    includeOptional: true
                }
            };
            const felicityInstance = new (Felicity.entityFor(schema, options));

            expect(felicityInstance.key1).to.equal(null);
            expect(felicityInstance.key2).to.equal(null);
            expect(felicityInstance.key3).to.equal(null);
            expect(felicityInstance.validate).to.be.a.function();
            done();
        });

        it('should utilize default values', (done) => {

            const schema = Joi.object().keys({
                version  : Joi.string().min(5).default('1.0.0'),
                number   : Joi.number().default(10),
                identity : Joi.object().keys({
                    id: Joi.string().default('abcdefg')
                }),
                condition: Joi.alternatives().when('version', {
                    is       : Joi.string(),
                    then     : Joi.string().default('defaultValue'),
                    otherwise: Joi.number()
                })
            });
            const felicityInstance = new (Felicity.entityFor(schema));

            expect(felicityInstance.version).to.equal('1.0.0');
            expect(felicityInstance.number).to.equal(10);
            expect(felicityInstance.identity.id).to.equal('abcdefg');
            expect(felicityInstance.condition).to.equal('defaultValue');
            done();
        });

        it('should not utilize default values when provided ignoreDefaults config', (done) => {

            const schema = Joi.object().keys({
                version  : Joi.string().min(5).default('1.0.0'),
                number   : Joi.number().default(10),
                identity : Joi.object().keys({
                    id: Joi.string().default('abcdefg')
                }),
                condition: Joi.alternatives().when('version', {
                    is       : Joi.string(),
                    then     : Joi.string().default('defaultValue'),
                    otherwise: Joi.number()
                })
            });
            const options = {
                config: {
                    ignoreDefaults: true
                }
            };
            const felicityInstance = new (Felicity.entityFor(schema, options));

            expect(felicityInstance.version).to.equal(null);
            expect(felicityInstance.number).to.equal(0);
            expect(felicityInstance.identity.id).to.equal(null);
            expect(felicityInstance.condition).to.equal(null);
            done();
        });

        it('should utilize default values for non-compiled schema', (done) => {

            const schema = {
                version  : Joi.string().min(5).default('1.0.0'),
                number   : Joi.number().default(10),
                identity : Joi.object().keys({
                    id: Joi.string().default('abcdefg')
                }),
                condition: Joi.alternatives().when('version', {
                    is       : Joi.string(),
                    then     : Joi.string().default('defaultValue'),
                    otherwise: Joi.number()
                })
            };
            const felicityInstance = new (Felicity.entityFor(schema));

            expect(felicityInstance.version).to.equal('1.0.0');
            expect(felicityInstance.number).to.equal(10);
            expect(felicityInstance.identity.id).to.equal('abcdefg');
            expect(felicityInstance.condition).to.equal('defaultValue');
            done();
        });

        it('should not utilize default values for non-compiled schema when provided ignoreDefaults config', (done) => {

            const schema = {
                version  : Joi.string().min(5).default('1.0.0'),
                number   : Joi.number().default(10),
                identity : Joi.object().keys({
                    id: Joi.string().default('abcdefg')
                }),
                condition: Joi.alternatives().when('version', {
                    is       : Joi.string(),
                    then     : Joi.string().default('defaultValue'),
                    otherwise: Joi.number()
                })
            };
            const options = {
                config: {
                    ignoreDefaults: true
                }
            };
            const felicityInstance = new (Felicity.entityFor(schema, options));

            expect(felicityInstance.version).to.equal(null);
            expect(felicityInstance.number).to.equal(0);
            expect(felicityInstance.identity.id).to.equal(null);
            expect(felicityInstance.condition).to.equal(null);
            done();
        });
    });

    describe('Input', () => {

        it('should include valid input', (done) => {

            const schema = {
                string: Joi.string().guid().required(),
                number: Joi.number().multiple(13).min(26).required(),
                object: Joi.object().keys({
                    id: Joi.string().min(3).default('OKC').required(),
                    code: Joi.number().required()
                }).required()
            };
            const hydratedInput = {
                string: Uuid.v4(),
                number: 39,
                object: {
                    id: 'ATX',
                    code: 200
                }
            };
            const felicityInstance = new (Felicity.entityFor(schema))(hydratedInput);

            expect(felicityInstance.string).to.equal(hydratedInput.string);
            expect(felicityInstance.number).to.equal(hydratedInput.number);
            expect(felicityInstance.object).to.equal(hydratedInput.object);
            done();
        });

        it('should include valid and strip invalid/unknown input values', (done) => {

            const schema = Joi.object().keys({
                innerObject: Joi.object().keys({
                    innerArray: Joi.array().items(Joi.number()).min(3).max(6).required(),
                    number    : Joi.number().required().default(3),
                    innerString: Joi.string().required()
                }),
                string     : Joi.string().email().required(),
                date       : Joi.date().raw().required(),
                binary     : Joi.binary().required(),
                bool       : Joi.boolean().required(),
                conditional: Joi.when('bool', {
                    is       : true,
                    then     : Joi.object().keys().required(),
                    otherwise: Joi.boolean().required()
                })
            });
            const hydrationData = {
                innerObject: {
                    innerString: false
                },
                string: 'example@email.com',
                date  : 'not a date',
                binary: 74,
                fake  : true,
                bool  : false,
                conditional: true
            };
            const felicityInstance = new (Felicity.entityFor(schema))(hydrationData);

            expect(felicityInstance.innerObject).to.be.an.object();
            expect(felicityInstance.innerObject.innerArray).to.equal([]);
            expect(felicityInstance.innerObject.innerString).to.equal(null);
            expect(felicityInstance.innerObject.number).to.equal(3);
            expect(felicityInstance.string).to.equal(hydrationData.string);
            expect(felicityInstance.date).to.equal(null);
            expect(felicityInstance.binary).to.equal(null);
            expect(felicityInstance.fake).to.be.undefined();
            expect(felicityInstance.bool).to.equal(hydrationData.bool);
            expect(felicityInstance.conditional).to.equal(hydrationData.conditional);
            expect(felicityInstance.validate).to.be.a.function();
            done();
        });
    });

    describe('Skeleton Validate', () => {

        it('should return an object when no callback is provided', (done) => {

            const schema = Joi.object().keys({
                key1: Joi.string(),
                key2: Joi.number(),
                key3: Joi.array().min(4)
            });
            const felicityInstance = new (Felicity.entityFor(schema));
            const instanceValidity = felicityInstance.validate();

            expect(instanceValidity).to.be.an.object();
            expect(instanceValidity.errors).to.be.an.array();
            expect(instanceValidity.success).to.equal(false);
            expect(instanceValidity.value).to.be.an.object();
            done();
        });

        it('should set properties when validation is successful', (done) => {

            const schema = Joi.object().keys({
                key1: Joi.string()
            });
            const felicityInstance = new (Felicity.entityFor(schema));

            felicityInstance.key1 = 'A string';

            const instanceValidity = felicityInstance.validate();

            expect(instanceValidity.errors).to.equal(null);
            expect(instanceValidity.success).to.equal(true);
            expect(instanceValidity.value).to.be.an.object();

            done();
        });

        it('should accept a callback', (done) => {

            const schema = Joi.object().keys({
                key1: Joi.string()
            });
            const felicityInstance = new (Felicity.entityFor(schema));
            const validationCallback = function (err, result) {

                expect(err).to.be.an.array();
                expect(result).to.not.exist();
                done();
            };

            felicityInstance.validate(validationCallback);
        });

        it('should pass (err, success) to callback when validation is successful', (done) => {

            const schema = Joi.object().keys({
                key1: Joi.string()
            });
            const felicityInstance = new (Felicity.entityFor(schema));

            felicityInstance.key1 = 'A string.';

            const validationCallback = function (err, result) {

                expect(err).to.equal(null);
                expect(result.success).to.equal(true);
                expect(result.value).to.be.an.object();
                done();
            };

            felicityInstance.validate(validationCallback);
        });
    });

    describe('Skeleton Example', () => {

        it('should return an empty instance', (done) => {

            const schema = Joi.object();
            const felicityInstance = new (Felicity.entityFor(schema));
            const felicityExample = felicityInstance.example();

            expect(felicityExample).to.be.an.object();
            expect(Object.keys(felicityExample).length).to.equal(0);
            done();
        });

        it('should return an a hydrated valid instance', (done) => {

            const schema = Joi.object().keys({
                key1: Joi.string().creditCard(),
                key2: Joi.number().integer(),
                key3: Joi.boolean()
            });
            const felicityInstance = new (Felicity.entityFor(schema));
            const felicityExample = felicityInstance.example();

            expect(felicityExample.key1).to.be.a.string();
            expect(felicityExample.key2).to.be.a.number();
            expect(felicityExample.key3).to.be.a.boolean();
            ExpectValidation(felicityExample, felicityInstance.schema, done);
        });

        it('should respect "strictExample" config at Constructor declaration', (done) => {

            const schema = Joi.object().keys({
                name: Joi.string().regex(/abcd(?=efg)/)
            });
            const options = {
                config: {
                    strictExample: true
                }
            };
            const Constructor = Felicity.entityFor(schema, options);
            const instance = new Constructor();

            expect(() => {

                return instance.example();
            }).to.throw('child \"name\" fails because [\"name\" with value \"abcd\" fails to match the required pattern: /abcd(?=efg)/]');
            done();
        });

        it('should respect "strictExample" config at instance example call', (done) => {

            const schema = Joi.object().keys({
                name: Joi.string().regex(/abcd(?=efg)/)
            });
            const options = {
                config: {
                    strictExample: true
                }
            };
            const Constructor = Felicity.entityFor(schema);
            const instance = new Constructor();

            expect(instance.example().name).to.equal('abcd');
            expect(() => {

                return instance.example(options);
            }).to.throw('child \"name\" fails because [\"name\" with value \"abcd\" fails to match the required pattern: /abcd(?=efg)/]');
            done();
        });
    });
});
