'use strict';

const Code = require('code');
const Lab = require('lab');
const ExpectValidation = require('./test_helpers').expectValidation;
const Examples = require('../examples/example');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;

describe('exampleFromSchema', () => {

    it('should provide a valid example', (done) => {

        Examples.exampleFromSchema(ExpectValidation);
        done();
    });
});

describe('customConstructor', () => {

    it('should provide a Constructor with Felicity methods', (done) => {

        Examples.customConstructor((Conversation, conversation, mockConversation, validation, mockConversation2, externalValidation) => {

            expect(conversation instanceof Conversation).to.equal(true);
            expect(conversation.validate).to.be.a.function();
            expect(conversation.example).to.be.a.function();
            expect(Conversation.validate).to.be.a.function();
            expect(Conversation.example).to.be.a.function();
            expect(externalValidation.success).to.equal(false);
            ExpectValidation(mockConversation2, Conversation.prototype.schema);
            ExpectValidation(mockConversation, conversation.schema, done);
        });
    });
});
