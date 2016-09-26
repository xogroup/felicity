'use strict';

const ValueGenerator = require('./valueGenerator');

const exampleGenerator = function (schema) {

    const example = {};
    const schemaDescription = schema.describe();
    const children = schemaDescription.children || [];

    Object.keys(children).forEach((key) => {

        const childSchema = children[key];

        example[key] = ValueGenerator[childSchema.type](childSchema);
    });

    return example;
};

module.exports = exampleGenerator;
