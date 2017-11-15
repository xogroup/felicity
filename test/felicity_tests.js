'use strict';

const Felicity = require('../lib');
const Joi = require('../lib/joi');
const Lab = require('lab');
const Uuid = require('uuid');
const Moment = require('moment');

const { describe, expect, it } = exports.lab = Lab.script();
const ExpectValidation = require('./test_helpers').expectValidation.bind({}, expect);

describe('Felicity Example', () => {

    it('should return a string', () => {

        const schema = Joi.string();
        const example = Felicity.example(schema);

        expect(example).to.be.a.string();
        ExpectValidation(example, schema);
    });

    it('should return a string that ignores regex lookarounds', () => {

        const lookAheadPattern = /abcd(?=efg)/;
        const schema = Joi.string().regex(lookAheadPattern);
        const example = Felicity.example(schema);

        expect(example).to.equal('abcd');
        expect(example.match(lookAheadPattern)).to.equal(null);
    });

    it('should throw validation error on regex lookarounds when provided strictExample config', () => {

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
    });

    it('should not throw validation error on supported regex when provided strictExample config', () => {

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
        ExpectValidation(callExample(), schema);
    });

    it('should return a number', () => {

        const schema = Joi.number();
        const example = Felicity.example(schema);

        expect(example).to.be.a.number();
        ExpectValidation(example, schema);
    });

    it('should return a boolean', () => {

        const schema = Joi.boolean();
        const example = Felicity.example(schema);

        expect(example).to.be.a.boolean();
        ExpectValidation(example, schema);
    });

    it('should return a buffer', () => {

        const schema = Joi.binary();
        const example = Felicity.example(schema);

        expect(example).to.be.a.buffer();
        ExpectValidation(example, schema);
    });

    it('should return a date', () => {

        const schema = Joi.date();
        const example = Felicity.example(schema);

        expect(example).to.be.a.date();
        ExpectValidation(example, schema);
    });

    it('should return a moment formatted date', () => {

        const fmt = 'HH:mm';
        const schema = Joi.date().format(fmt);
        const example = Felicity.example(schema);
        const moment = new Moment(example, fmt, true);

        expect(example).to.be.a.string();
        expect(moment.isValid()).to.equal(true);
        ExpectValidation(example, schema);
    });

    it('should return a function', () => {

        const schema = Joi.func();
        const example = Felicity.example(schema);

        expect(example).to.be.a.function();
        ExpectValidation(example, schema);
    });

    it('should return an array', () => {

        const schema = Joi.array();
        const example = Felicity.example(schema);

        expect(example).to.be.an.array();
        ExpectValidation(example, schema);
    });

    it('should return an object with default values', () => {

        const schema = Joi.object().keys({
            string: Joi.string().required().default('-----'),
            number: Joi.number().default(4)
        });
        const example = Felicity.example(schema);

        expect(example.string).to.equal('-----');
        expect(example.number).to.equal(4);
        ExpectValidation(example, schema);
    });

    it('should return an object with dynamic defaults', () => {

        const generateDefaultString = () => {

            return '-----';
        };
        generateDefaultString.description = 'generates default';
        const generateDefaultNumber = () => {

            return 4;
        };
        generateDefaultNumber.description = 'generates default';
        const generateDefaultBool = () => {

            return true;
        };
        generateDefaultBool.description = 'generates default';
        const schema = Joi.object().keys({
            string: Joi.string().required().default(generateDefaultString),
            number: Joi.number().default(generateDefaultNumber),
            bool  : Joi.boolean().default(generateDefaultBool)
        });
        const example = Felicity.example(schema);

        expect(example.string).to.equal('-----');
        expect(example.number).to.equal(4);
        expect(example.bool).to.equal(true);
        ExpectValidation(example, schema);
    });

    it('should return an object with specified valid properties', () => {

        const schema = Joi.object().keys({
            string: Joi.string().required().valid('-----'),
            number: Joi.number().valid(4)
        });
        const example = Felicity.example(schema);

        expect(example.string).to.equal('-----');
        expect(example.number).to.equal(4);
        ExpectValidation(example, schema);
    });

    it('should return an object with "allowed" values', () => {

        const schema = Joi.object().keys({
            string: Joi.string().allow(null).required()
        });
        const example = Felicity.example(schema);

        expect(example.string).to.equal(null);
        ExpectValidation(example, schema);
    });

    it('should ignore "allowed" values when provided "ignoreValids" config', () => {

        const schema = Joi.object().keys({
            string: Joi.string().allow(null).required()
        });
        const options = {
            config: {
                ignoreValids: true
            }
        };
        const example = Felicity.example(schema, options);

        expect(example.string).to.not.equal(null);
        expect(example.string).to.be.a.string();
        ExpectValidation(example, schema);
    });

    it('should return an object with custom type', () => {

        const Class1 = function () {};
        Class1.prototype.testFunc = function () {};

        const schema = Joi.object().type(Class1);
        const example = Felicity.example(schema);

        expect(example).to.be.an.instanceof(Class1);
        expect(example.testFunc).to.be.a.function();
        ExpectValidation(example, schema);
    });

    it('should not return an object with default values when provided ignoreDefaults config', () => {

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
        ExpectValidation(example, schema);
    });

    it('should return an object without optional keys', () => {

        const schema = Joi.object().keys({
            required: Joi.string().required(),
            present : Joi.string(),
            optional: Joi.string().optional()
        });
        const example = Felicity.example(schema);

        expect(example.required).to.be.a.string();
        expect(example.present).to.be.a.string();
        expect(example.optional).to.be.undefined();
        ExpectValidation(example, schema);
    });

    it('should return an object without optional keys when using .options({ presence: "optional" }) syntax', () => {

        const schema = Joi.object().keys({
            required      : Joi.string().required(),
            parentOptional: Joi.string(),
            optional      : Joi.string().optional()
        }).options({ presence: 'optional' });
        const example = Felicity.example(schema);

        expect(example.required).to.be.a.string();
        expect(example.parentOptional).to.be.undefined();
        expect(example.optional).to.be.undefined();
        ExpectValidation(example, schema);
    });

    it('should return an object with optional keys when given includeOptional config', () => {

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
        ExpectValidation(example, schema);
    });

    it('should return the Joi facebook example', () => {

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
        ExpectValidation(example, schema);
    });

    it('should return the Joi facebook example with an optional key', () => {

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
        ExpectValidation(example, schema);
    });
});

describe('Felicity EntityFor', () => {

    it('should fail when calling without proper schema', () => {

        expect(Felicity.entityFor).to.throw(Error, 'You must provide a Joi schema');
    });

    it('should return a constructor function', () => {

        const schema = {};
        const Constructor = Felicity.entityFor(schema);

        expect(Constructor).to.be.a.function();

        const skeleton = new Constructor();

        expect(skeleton).to.be.an.object();
    });

    it('should enforce "new" instantiation on returned Constructor', () => {

        const schema = {};
        const Constructor = Felicity.entityFor(schema);

        expect(Constructor).to.be.a.function();

        expect(() => {

            return Constructor();
        }).to.throw(TypeError);
    });

    it('should error on non-object schema', () => {

        const numberSchema = Joi.number().max(1);
        const entityFor = function () {

            return Felicity.entityFor(numberSchema);
        };

        expect(entityFor).to.throw(Error, 'Joi schema must describe an object for constructor functions');
    });

    it('should provide an example with dynamic defaults', () => {

        const schema = Joi.object().keys({
            version  : Joi.string().min(5).default('1.0.0'),
            number   : Joi.number().default(10),
            identity : Joi.object().keys({
                id: Joi.string().guid().default(() => Uuid.v4(), 'Generates UUIDs')
            }),
            array    : Joi.array().items(Joi.object().keys({
                id: Joi.string().guid().default(() => Uuid.v4(), 'Generates UUIDs')
            })),
            condition: Joi.alternatives().when('version', {
                is       : Joi.string(),
                then     : Joi.string().default('defaultValue'),
                otherwise: Joi.number()
            }),
            dynamicCondition: Joi.alternatives().when('version', {
                is       : Joi.string(),
                then     : Joi.string().default(() => 'dynamic default', 'generates a default'),
                otherwise: Joi.number()
            })
        });
        const Entity = Felicity.entityFor(schema);
        const example = Entity.example();

        expect(example.version).to.equal('1.0.0');
        expect(example.number).to.equal(10);
        expect(example.array.length).to.be.above(0);
        expect(example.array[0].id).to.be.a.string();
        expect(example.identity.id).to.be.a.string();
        expect(example.condition).to.equal('defaultValue');
        expect(example.dynamicCondition).to.equal('dynamic default');
    });

    describe('Constructor functions', () => {

        it('should accept override options', () => {

            const defaultOptions = {
                includeOptional: false,
                ignoreDefaults : true
            };
            const schema = Joi.object().keys({
                version: Joi.string().optional(),
                name: Joi.string().default('default value')
            });
            const Entity = Felicity.entityFor(schema, { config: defaultOptions });
            const instance = new Entity();
            const instanceWithOptional = new Entity(null, { includeOptional: true });
            const instanceWithDefault = new Entity(null, { ignoreDefaults: false });
            const instanceWithBothOptions = new Entity(null, { includeOptional: true, ignoreDefaults: false });

            expect(instance.version).to.equal(undefined);
            expect(instance.name).to.equal(null);

            expect(instanceWithOptional.version).to.equal(null);
            expect(instanceWithOptional.name).to.equal(null);

            expect(instanceWithDefault.version).to.equal(undefined);
            expect(instanceWithDefault.name).to.equal('default value');

            expect(instanceWithBothOptions.version).to.equal(null);
            expect(instanceWithBothOptions.name).to.equal('default value');
        });

        it('should accept options', () => {

            const schema = Joi.object().keys({
                version: Joi.string().optional(),
                name: Joi.string().default('default value')
            });
            const Entity = Felicity.entityFor(schema);
            const instance = new Entity();
            const instanceWithOptional = new Entity(null, { includeOptional: true });
            const instanceWithDefault = new Entity(null, { ignoreDefaults: true });
            const instanceWithBothOptions = new Entity(null, { includeOptional: true, ignoreDefaults: true });

            expect(instance.version).to.equal(undefined);
            expect(instance.name).to.equal('default value');

            expect(instanceWithOptional.version).to.equal(null);
            expect(instanceWithOptional.name).to.equal('default value');

            expect(instanceWithDefault.version).to.equal(undefined);
            expect(instanceWithDefault.name).to.equal(null);

            expect(instanceWithBothOptions.version).to.equal(null);
            expect(instanceWithBothOptions.name).to.equal(null);
        });

        it('should validate input when given validateInput: true', () => {

            const subSchema = Joi.object().keys({
                name : Joi.string(),
                title: Joi.string()
            }).options({
                presence: 'required'
            });
            const schema = Joi.object().keys({
                title    : Joi.string(),
                director : Joi.number(),
                producers: Joi.array().items(subSchema).allow(null, '').optional().default(null)
            });
            const Constructor = Felicity.entityFor(schema);
            const input = {
                name     : 'Blade Runner',
                director : 'Denis Villeneuve',
                writers: [
                    {
                        name: 'Hampton Fancher'
                    }
                ]
            };

            const instance = new Constructor(input);
            expect(instance.title).to.equal(null);
            expect(instance.producers).to.equal(null);
            expect(instance.director).to.equal(input.director);

            expect(() => new Constructor(input, { validateInput: true })).to.throw('child "director" fails because ["director" must be a number]');
        });

        it('should not validate input when given validateInput: false', () => {

            const subSchema = Joi.object().keys({
                name : Joi.string(),
                title: Joi.string()
            }).options({
                presence: 'required'
            });
            const schema = Joi.object().keys({
                title    : Joi.string(),
                director : Joi.number(),
                producers: Joi.array().items(subSchema).allow(null, '').optional().default(null)
            });
            const Constructor = Felicity.entityFor(schema, { config: { validateInput: true } });
            const input = {
                name     : 'Blade Runner',
                director : 'Denis Villeneuve',
                writers: [
                    {
                        name: 'Hampton Fancher'
                    }
                ]
            };

            expect(() => new Constructor(input)).to.throw('child "director" fails because ["director" must be a number]');

            const instance = new Constructor(input, { validateInput: false });
            expect(instance.title).to.equal(null);
            expect(instance.producers).to.equal(null);
            expect(instance.director).to.equal(input.director);
        });
    });

    describe('Constructor instances', () => {

        it('should accept override options when validating', () => {

            const schema = Joi.object().keys({
                a: Joi.string()
            });
            const options = { stripUnknown: true };

            const Subject = Felicity.entityFor(schema);
            const subject = new Subject({ a: 'a' });
            subject.b = 'b';

            subject.validate((err) => {

                expect(err).to.be.null();
            }, options);
        });

        it('should return a validation object', () => {

            const schema = Joi.object().keys({
                name: Joi.string().required()
            });
            const Thing = Felicity.entityFor(schema);
            const thing = new Thing();

            expect(thing.validate().success).to.exist().and.equal(false);
            expect(thing.validate().errors).to.exist().and.be.an.array();
            expect(thing.validate().value).to.exist().and.equal({
                name: null
            });
        });

        it('should follow the standard Node callback signature for .validate', () => {

            const schema = Joi.object().keys({
                name: Joi.string().required()
            });
            const Thing = Felicity.entityFor(schema);
            const thing = new Thing();

            thing.validate((err, result) => {

                expect(err).to.exist();
                expect(err).to.exist().and.be.an.array();
                expect(result).to.be.null();

                const validThing = new Thing({
                    name: 'pass'
                });

                validThing.validate((err, validationResult) => {

                    expect(err).to.be.null();
                    expect(validationResult).to.be.an.object();
                    expect(validationResult.success).to.exist().and.equal(true);
                    expect(validationResult.value).to.exist().and.be.an.object();
                    expect(validationResult.errors).to.be.null();
                });
            });
        });

        it('should not trigger V8 JSON.stringify bug in Node v4.x', () => {

            const schema = Joi.object();
            const Thing = Felicity.entityFor(schema);
            const thing = new Thing();
            expect(JSON.stringify(thing, null, null)).to.equal('{}');
        });
    });

    describe('"Action" schema options', () => {

        it('should not interfere with String.truncate', () => {

            const schema = Joi.object().keys({
                name: Joi.string().max(5).truncate()
            });
            const Constructor = Felicity.entityFor(schema);
            const instance = new Constructor();
            const example = instance.example();
            const validation = Constructor.validate({
                name: 'longer than 5 chars'
            });

            expect(instance.name).to.equal(null);
            expect(example.name.length).to.be.at.most(5);
            expect(validation.errors).to.equal(null);
            expect(validation.value).to.equal({ name: 'longe' });
            ExpectValidation(example, schema);
        });

        it('should not interfere with String.replace', () => {

            const schema = Joi.object().keys({
                name: Joi.string().replace(/b/gi, 'a')
            });
            const Constructor = Felicity.entityFor(schema);
            const instance = new Constructor();
            const example = instance.example();
            const validation = Constructor.validate({ name: 'abbabba' });

            expect(instance.name).to.equal(null);
            expect(validation.errors).to.equal(null);
            expect(validation.value).to.equal({ name: 'aaaaaaa' });
            ExpectValidation(example, schema);
        });

        it('should not interfere with String.trim', () => {

            const schema = Joi.object().keys({
                name: Joi.string().trim()
            });
            const Constructor = Felicity.entityFor(schema);
            const instance = new Constructor({ name: '   abbabba   ' });
            const example = instance.example();
            const validation = instance.validate();

            expect(instance.name).to.equal('abbabba');
            expect(validation.errors).to.equal(null);
            expect(validation.value).to.equal({ name: 'abbabba' });
            ExpectValidation(example, schema);
        });
    });

    describe('"Presence" object binary schema options', () => {

        it('should not interfere with and', () => {

            const schema = Joi.object().keys({
                a: Joi.string(),
                b: Joi.string()
            }).and('a', 'b');
            const Constructor = Felicity.entityFor(schema);
            const instance = new Constructor({ a:'abc', b:'xyz' });
            const example = instance.example();

            ExpectValidation(example, schema);
        });

        it('should not interfere with or', () => {

            const schema = Joi.object().keys({
                a: Joi.string(),
                b: Joi.string()
            }).or('a', 'b');
            const Constructor = Felicity.entityFor(schema);
            const instance = new Constructor({ a:'abc', b:'xyz' });
            const example = instance.example();

            ExpectValidation(example, schema);
        });
    });

    describe('"Presence" object property check schema options', () => {

        it('should not interfere with unknown when set to true', () => {

            const schema = Joi.object().keys({
                a: Joi.string(),
                b: Joi.string()
            }).unknown(true);
            const Constructor = Felicity.entityFor(schema);
            const instance = new Constructor({ a:'abc', b:'xyz' });
            const example = instance.example();

            ExpectValidation(example, schema);
        });

        it('should not interfere with unknown when set to false', () => {

            const schema = Joi.object().keys({
                a: Joi.string(),
                b: Joi.string()
            }).unknown(false);
            const Constructor = Felicity.entityFor(schema);
            const instance = new Constructor({ a:'abc', b:'xyz' });
            const example = instance.example();

            ExpectValidation(example, schema);
        });
    });

    describe('Conditional', () => {

        it('should default to the "true" driver', () => {

            const schema = Joi.object().keys({
                driver       : true,
                myConditional: Joi.when('driver', {
                    is       : true,
                    then     : Joi.string().required(),
                    otherwise: Joi.number().required()
                })
            });
            const Entity = Felicity.entityFor(schema);
            const felicityInstance = new Entity();

            expect(felicityInstance.myConditional).to.equal(null);
            expect(felicityInstance.validate).to.be.a.function();
        });
    });

    describe('Object', () => {

        it('should return an object with no keys', () => {

            const schema = Joi.object().keys();
            const Entity = Felicity.entityFor(schema);
            const felicityInstance = new Entity();

            expect(felicityInstance).to.be.an.object();
            expect(felicityInstance.validate).to.be.a.function();
        });

        it('should return an object with keys', () => {

            const schema = Joi.object().keys({
                key1: Joi.object().keys().required()
            });
            const Entity = Felicity.entityFor(schema);
            const felicityInstance = new Entity();

            expect(felicityInstance.key1).to.equal({});
            expect(felicityInstance.validate).to.be.a.function();
        });

        it('should return an object with mixed-type keys', () => {

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
                }),
                any        : Joi.any(),
                anyStrip   : Joi.any().strip(),
                anyForbid  : Joi.any().forbidden()
            });
            const Entity = Felicity.entityFor(schema);
            const felicityInstance = new Entity();

            expect(felicityInstance.innerObject).to.be.an.object();
            expect(felicityInstance.innerObject.innerArray).to.equal([]);
            expect(felicityInstance.innerObject.number).to.equal(0);
            expect(felicityInstance.string).to.equal(null);
            expect(felicityInstance.date).to.equal(null);
            expect(felicityInstance.bool).to.equal(false);
            expect(felicityInstance.conditional).to.equal({});
            expect(felicityInstance.any).to.equal(null);
            expect(felicityInstance.anyStrip).to.equal(null);
            expect(felicityInstance.anyForbid).to.be.undefined();
            expect(felicityInstance.validate).to.be.a.function();

            const mockInstance = felicityInstance.example();

            ExpectValidation(mockInstance, schema);
        });

        it('should return an object with mixed-type keys for non-compiled schema', () => {

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
            const Entity = Felicity.entityFor(schema);
            const felicityInstance = new Entity();

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
        });

        it('should not include keys with "optional" flag', () => {

            const schema = Joi.object().keys({
                key1: Joi.string().required(),
                key2: Joi.string(),
                key3: Joi.string().optional()
            });
            const Entity = Felicity.entityFor(schema);
            const felicityInstance = new Entity();

            expect(felicityInstance.key1).to.equal(null);
            expect(felicityInstance.key2).to.equal(null);
            expect(felicityInstance.key3).to.not.exist();
            expect(felicityInstance.validate).to.be.a.function();
        });

        it('should not include keys with "optional" flag when using .options({ presence: "optional" }) syntax', () => {

            const schema = Joi.object().keys({
                key1: Joi.string().required(),
                key2: Joi.string(),
                key3: Joi.string().optional(),
                key4: Joi.object().keys({
                    a: Joi.string()
                })
            }).options({ presence: 'optional' });
            const Entity = Felicity.entityFor(schema);
            const felicityInstance = new Entity();

            expect(felicityInstance.key1).to.equal(null);
            expect(felicityInstance.key2).to.not.exist();
            expect(felicityInstance.key3).to.not.exist();
            expect(felicityInstance.key4).to.not.exist();
            expect(felicityInstance.validate).to.be.a.function();
        });

        it('should include keys with "optional" flag if provided includeOptional config', () => {

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
            const Entity = Felicity.entityFor(schema, options);
            const felicityInstance = new Entity();

            expect(felicityInstance.key1).to.equal(null);
            expect(felicityInstance.key2).to.equal(null);
            expect(felicityInstance.key3).to.equal(null);
            expect(felicityInstance.validate).to.be.a.function();
        });

        it('should utilize default values', () => {

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
            const Entity = Felicity.entityFor(schema);
            const felicityInstance = new Entity();

            expect(felicityInstance.version).to.equal('1.0.0');
            expect(felicityInstance.number).to.equal(10);
            expect(felicityInstance.identity.id).to.equal('abcdefg');
            expect(felicityInstance.condition).to.equal('defaultValue');
        });

        it('should not utilize default values when provided ignoreDefaults config', () => {

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
            const Entity = Felicity.entityFor(schema, options);
            const felicityInstance = new Entity();

            expect(felicityInstance.version).to.equal(null);
            expect(felicityInstance.number).to.equal(0);
            expect(felicityInstance.identity.id).to.equal(null);
            expect(felicityInstance.condition).to.equal(null);
        });

        it('should utilize default values for non-compiled schema', () => {

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
            const Entity = Felicity.entityFor(schema);
            const felicityInstance = new Entity();

            expect(felicityInstance.version).to.equal('1.0.0');
            expect(felicityInstance.number).to.equal(10);
            expect(felicityInstance.identity.id).to.equal('abcdefg');
            expect(felicityInstance.condition).to.equal('defaultValue');
        });

        it('should not utilize default values for non-compiled schema when provided ignoreDefaults config', () => {

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
            const Entity = Felicity.entityFor(schema, options);
            const felicityInstance = new Entity();

            expect(felicityInstance.version).to.equal(null);
            expect(felicityInstance.number).to.equal(0);
            expect(felicityInstance.identity.id).to.equal(null);
            expect(felicityInstance.condition).to.equal(null);
        });

        it('should utilize dynamic default values', () => {

            const schema = Joi.object().keys({
                version  : Joi.string().min(5).default('1.0.0'),
                number   : Joi.number().default(10),
                identity : Joi.object().keys({
                    id: Joi.string().guid().default(() => Uuid.v4(), 'Generates UUIDs')
                }),
                condition: Joi.alternatives().when('version', {
                    is       : Joi.string(),
                    then     : Joi.string().default('defaultValue'),
                    otherwise: Joi.number()
                })
            });
            const Entity = Felicity.entityFor(schema);
            const felicityInstance = new Entity();

            expect(felicityInstance.version).to.equal('1.0.0');
            expect(felicityInstance.number).to.equal(10);
            expect(felicityInstance.identity.id).to.be.a.string();
            expect(felicityInstance.condition).to.equal('defaultValue');
        });

        it('should not utilize dynamic default values when provided ignoreDefaults config', () => {

            const schema = Joi.object().keys({
                version  : Joi.string().min(5).default('1.0.0'),
                number   : Joi.number().default(10),
                identity : Joi.object().keys({
                    id: Joi.string().guid().default(() => Uuid.v4(), 'Generates UUIDs')
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
            const Entity = Felicity.entityFor(schema, options);
            const felicityInstance = new Entity();

            expect(felicityInstance.version).to.equal(null);
            expect(felicityInstance.number).to.equal(0);
            expect(felicityInstance.identity.id).to.equal(null);
            expect(felicityInstance.condition).to.equal(null);
        });

        it('should utilize dynamic default values for non-compiled schema', () => {

            const schema = {
                version  : Joi.string().min(5).default('1.0.0'),
                number   : Joi.number().default(10),
                identity : Joi.object().keys({
                    id: Joi.string().guid().default(() => Uuid.v4(), 'Generates UUIDs')
                }),
                condition: Joi.alternatives().when('version', {
                    is       : Joi.string(),
                    then     : Joi.string().default('defaultValue'),
                    otherwise: Joi.number()
                })
            };
            const Entity = Felicity.entityFor(schema);
            const felicityInstance = new Entity();

            expect(felicityInstance.version).to.equal('1.0.0');
            expect(felicityInstance.number).to.equal(10);
            expect(felicityInstance.identity.id).to.be.a.string();
            expect(felicityInstance.condition).to.equal('defaultValue');
        });

        it('should not utilize dynamic default values for non-compiled schema when provided ignoreDefaults config', () => {

            const schema = {
                version  : Joi.string().min(5).default('1.0.0'),
                number   : Joi.number().default(10),
                identity : Joi.object().keys({
                    id: Joi.string().guid().default(() => Uuid.v4(), 'Generates UUIDs')
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
            const Entity = Felicity.entityFor(schema, options);
            const felicityInstance = new Entity();

            expect(felicityInstance.version).to.equal(null);
            expect(felicityInstance.number).to.equal(0);
            expect(felicityInstance.identity.id).to.equal(null);
            expect(felicityInstance.condition).to.equal(null);
        });

        it('should return an object with alternatives keys', () => {

            const schema = Joi.object({
                id: Joi.alternatives().try(Joi.number().integer().min(1), Joi.string().guid().lowercase()).required()
            });
            const Entity = Felicity.entityFor(schema);
            const felicityInstance = new Entity();

            expect(felicityInstance.id).to.equal(0);
        });
    });

    describe('Input', () => {

        it('should include valid input', () => {

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
        });

        it('should include valid input with strictInput set to true', () => {

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
            const felicityInstance = new (Felicity.entityFor(schema, { config: { strictInput: true } }))(hydratedInput);

            expect(felicityInstance.string).to.equal(hydratedInput.string);
            expect(felicityInstance.number).to.equal(hydratedInput.number);
            expect(felicityInstance.object).to.equal(hydratedInput.object);
        });

        it('should strip unknown input values', () => {

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
            expect(felicityInstance.innerObject.innerString).to.equal(hydrationData.innerObject.innerString);
            expect(felicityInstance.innerObject.number).to.equal(3);
            expect(felicityInstance.string).to.equal(hydrationData.string);
            expect(felicityInstance.date).to.equal(hydrationData.date);
            expect(felicityInstance.binary).to.equal(hydrationData.binary);
            expect(felicityInstance.fake).to.be.undefined();
            expect(felicityInstance.bool).to.equal(hydrationData.bool);
            expect(felicityInstance.conditional).to.equal(hydrationData.conditional);
            expect(felicityInstance.validate).to.be.a.function();
        });

        it('should strip unknown and invalid input values with strictInput set to true', () => {

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
            const felicityInstance = new (Felicity.entityFor(schema, { config: { strictInput: true } }))(hydrationData);

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
        });

        it('should utilize dynamic defaults for missing input', () => {

            const generateUuid = () => Uuid.v4();
            const schema = Joi.object().keys({
                id: Joi.string().guid().required().default(generateUuid, 'generate uuids')
            });
            const felicityInstance = new (Felicity.entityFor(schema))({});

            expect(felicityInstance.id).to.be.a.string();
        });
    });

    describe('Skeleton Validate', () => {

        it('should return an object when no callback is provided', () => {

            const schema = Joi.object().keys({
                key1: Joi.string(),
                key2: Joi.number(),
                key3: Joi.array().min(4)
            });
            const Entity = Felicity.entityFor(schema);
            const felicityInstance = new Entity();
            const instanceValidity = felicityInstance.validate();

            expect(instanceValidity).to.be.an.object();
            expect(instanceValidity.errors).to.be.an.array();
            expect(instanceValidity.success).to.equal(false);
            expect(instanceValidity.value).to.be.an.object();
        });

        it('should set properties when validation is successful', () => {

            const schema = Joi.object().keys({
                key1: Joi.string()
            });
            const Entity = Felicity.entityFor(schema);
            const felicityInstance = new Entity();

            felicityInstance.key1 = 'A string';

            const instanceValidity = felicityInstance.validate();

            expect(instanceValidity.errors).to.equal(null);
            expect(instanceValidity.success).to.equal(true);
            expect(instanceValidity.value).to.be.an.object();

        });

        it('should accept a callback', () => {

            const schema = Joi.object().keys({
                key1: Joi.string()
            });
            const Entity = Felicity.entityFor(schema);
            const felicityInstance = new Entity();
            const validationCallback = function (err, result) {

                expect(err).to.be.an.array();
                expect(result).to.not.exist();
            };

            felicityInstance.validate(validationCallback);
        });

        it('should pass (err, success) to callback when validation is successful', () => {

            const schema = Joi.object().keys({
                key1: Joi.string()
            });
            const Entity = Felicity.entityFor(schema);
            const felicityInstance = new Entity();

            felicityInstance.key1 = 'A string.';

            const validationCallback = function (err, result) {

                expect(err).to.equal(null);
                expect(result.success).to.equal(true);
                expect(result.value).to.be.an.object();
            };

            felicityInstance.validate(validationCallback);
        });
    });

    describe('Skeleton Example', () => {

        it('should return an empty instance', () => {

            const schema = Joi.object();
            const Entity = Felicity.entityFor(schema);
            const felicityInstance = new Entity();
            const felicityExample = felicityInstance.example();

            expect(felicityExample).to.be.an.object();
            expect(Object.keys(felicityExample).length).to.equal(0);
        });

        it('should return an a hydrated valid instance', () => {

            const schema = Joi.object().keys({
                key1: Joi.string().creditCard(),
                key2: Joi.number().integer(),
                key3: Joi.boolean()
            });
            const Entity = Felicity.entityFor(schema);
            const felicityInstance = new Entity();
            const felicityExample = felicityInstance.example();

            expect(felicityExample.key1).to.be.a.string();
            expect(felicityExample.key2).to.be.a.number();
            expect(felicityExample.key3).to.be.a.boolean();
            ExpectValidation(felicityExample, felicityInstance.schema);
        });

        it('should respect "strictExample" config at Constructor declaration', () => {

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
        });

        it('should respect "strictExample" config at instance example call', () => {

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
        });

        it('should respect "includeOptional" config for static example call', () => {

            const schema = Joi.object().keys({
                required        : Joi.string().required(),
                optional        : Joi.string().optional(),
                implicitOptional: Joi.string()
            }).options({ presence: 'optional' });
            const options = {
                config: {
                    includeOptional: true
                }
            };
            const Constructor = Felicity.entityFor(schema);
            const example = Constructor.example(options);

            expect(example.required).to.be.a.string();
            expect(example.optional).to.be.a.string();
            expect(example.implicitOptional).to.be.a.string();

            const exampleWithoutOptions = Constructor.example();
            expect(exampleWithoutOptions.required).to.be.a.string();
            expect(exampleWithoutOptions.optional).to.be.undefined();
            expect(exampleWithoutOptions.implicitOptional).to.be.undefined();
        });
    });
});
