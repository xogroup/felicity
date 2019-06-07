# felicity
Felicity supports [Joi](https://www.github.com/hapijs/joi) schema management by providing 2 primary functions:

  1. **Testing support** - Felicity will leverage your Joi schema to generate randomized data directly from the schema. This can be used for database seeding or fuzz testing.
  2. **Model management in source code** - Felicity can additionally leverage your Joi schema to create constructor functions that contain immutable copies of the Joi schema as well as a simple `.validate()` method that will run Joi validation of the object instance values against the referenced Joi schema.

[![npm version](https://badge.fury.io/js/felicity.svg)](https://badge.fury.io/js/felicity)
[![Build Status](https://travis-ci.org/xogroup/felicity.svg?branch=master)](https://travis-ci.org/xogroup/felicity)
[![Known Vulnerabilities](https://snyk.io/test/github/xogroup/felicity/badge.svg)](https://snyk.io/test/github/xogroup/felicity)

Lead Maintainer: [Wes Tyler](https://github.com/WesTyler)

## Introduction
> **fe·lic·i·ty** *noun* intense happiness; the ability to find appropriate expression for one's thoughts or intentions.

Felicity provides object instances, or expressions, of the data intentions represented by Joi schema.

Felicity builds upon Joi by allowing validation to be contained cleanly and nicely in constructors while also allowing easy example generation for documentation, tests, and more.

## Installation
```
npm install felicity
```

## Usage
### Model Management
Given a [joi](https://www.github.com/hapijs/joi) schema, create an object Constructor and instantiate skeleton objects:
```JavaScript
const Joi      = require('@hapi/joi');
const Felicity = require('felicity');

const joiSchema = Joi.object().keys({
    key1: Joi.string().required(),
    key2: Joi.array().items(Joi.string().guid()).min(3).required(),
    key3: Joi.object().keys({
        innerKey: Joi.number()
    })
});

const FelicityModelConstructor = Felicity.entityFor(joiSchema);
const modelInstance = new FelicityModelConstructor({ key1: 'some value' });

console.log(modelInstance);
/*
{
    key1: 'some value',
    key2: [],
    key3: {
        innerKey: 0
    }
}
*/
```

These model instances can self-validate against the schema they were built upon:
```JavaScript
modelInstance.key3.innerKey = 42;

const validationResult = modelInstance.validate(); // uses immutable copy of the Joi schema provided to `Felicity.entityFor()` above

console.log(validationResult);
/*
{
    success: false,
    errors : [
        {
            "message": "\"key2\" must contain at least 3 items",
            "path": [ "key2" ],
            "type": "array.min",
            "context": {
                "limit": 3,
                "value": [],
                "key": "key2",
                "label": "key2"
            }
        },
        // ...
    ]
}
*/
```

### Testing Usage
Additionally, Felicity can be used to randomly generate valid examples from either your [Felicity Models](#model-management) or directly from a Joi schema:
```Javascript
const randomModelValue = FelicityModelConstructor.example(); // built in by `Felicity.entityFor()`
/*
{
    key1: '2iwf8af2v4n',
    key2:[
        '077750a4-6e6d-4b74-84e2-cd34de80e95b',
        '1a8eb515-72f6-4007-aa73-a33cd4c9accb',
        'c9939d71-0790-417a-b615-6448ca95c30b'
    ],
    key3: { innerKey: 3.8538257114788257 }
}
*/

// directly from Joi schemas:
const stringSchema = Joi.string().regex(/[a-c]{3}-[d-f]{3}-[0-9]{4}/);
const sampleString = Felicity.example(stringSchema);
// sampleString === 'caa-eff-5144'

const objectSchema = Joi.object().keys({
    id      : Joi.string().guid(),
    username: Joi.string().min(6).alphanum(),
    numbers : Joi.array().items(Joi.number().min(1))
});
const sampleObject = Felicity.example(objectSchema);
/*
sampleObject
{
    id: '0e740417-1708-4035-a495-6bccce560583',
    username: '4dKp2lHj',
    numbers: [ 1.0849635479971766 ]
}
*/
```

## API

For full usage documentation, see the [API Reference](https://github.com/xogroup/felicity/blob/master/API.md).

## Contributing

We love community and contributions! Please check out our [guidelines](https://github.com/xogroup/felicity/blob/master/.github/CONTRIBUTING.md) before making any PRs.

## Setting up for development

Getting yourself setup and bootstrapped is easy.  Use the following commands after you clone down.

```
npm install && npm test
```

## Joi features not yet supported

Some Joi schema options are not yet fully supported. Most unsupported features should not cause errors, but may be disregarded by Felicity or may result in behavior other than that documented in the Joi api.

A feature is considered Felicity-supported when it is explicitly covered in tests on both `entityFor` (and associated instance methods) and `example`.

- Function
  - `ref`
- Array
  - `unique`
- Object
  - `requiredKeys`
  - `optionalKeys`
