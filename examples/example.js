'use strict';

const Joi = require('../lib/joi');
const Felicity = require('../lib/index');

const exampleFromSchema = function (callback) {

    const schema = Joi.object().keys({
        id  : Joi.string().guid().required(),
        meta: Joi.object().keys({
            timestamp: Joi.date().raw().required(),
            name     : Joi.string().required(),
            sequence : Joi.number().integer().required()
        }).required()
    });
    const example = Felicity.example(schema);

    return callback(example, schema);
};

const customConstructor = function (callback) {

    const schema = Joi.object().keys({
        name: Joi.string().required()
    });
    const Conversation = Felicity.entityFor(schema);

    const conversation = new Conversation();

    const validation = conversation.validate();
    const mockConversation = conversation.example();

    const mockConversation2 = Conversation.example();
    const externalValidation = Conversation.validate({});

    return callback(Conversation, conversation, mockConversation, validation, mockConversation2, externalValidation);
};

module.exports = {
    exampleFromSchema,
    customConstructor
};
