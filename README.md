# felicity
Felicity provides object constructors capable of validation along with example structures using the [Joi](//www.github.com/hapijs/joi) schema description language and validator.

<!--
Badges go here once we're public and pushed to npm
+ https://badge.fury.io/
+ https://nodesecurity.io/
+ https://snyk.io
+ gitter? CI?
-->

Lead Maintainer: [Wes Tyler](https://github.com/WesTyler)

## Introduction
Felicity extends Joi by allowing validation to be contained cleanly and nicely in constructors while also allowing easy example generation for documentation, tests and more.

## Installation
```
npm install felicity
```

## Usage
Given a [joi](//www.github.com/hapijs/joi) schema, create an object Constructor and instantiate skeleton objects:
```JavaScript
const Joi      = require('joi'),
      Felicity = require('felicity');

const joiSchema = Joi.object().keys({
    key1: Joi.string().required(),
    key2: Joi.array().items(Joi.string().guid()).min(3).required(),
    key3: Joi.object().keys({
        innerKey: Joi.number()
    })
});

const FelicityConstructor = Felicity.entityFor(joiSchema);
const felicityInstance = new FelicityConstructor();

console.log(felicityInstance);
/*
{
    key1: null,
    key2: [],
    key3: {
        innerKey: 0
    }
}
*/
```

the instance can then be used to generate a randomized example of valid values:
```JavaScript
let felicityExample = felicityInstance.example();

console.log(felicityExample);
/*
{
    key1: 'qrypceectvg3ppc59rat43a',
    key2: [
        '14fd2e5a-71c9-4079-9a96-ab3afd232cb2',
        '701ac87c-6c55-44f7-b1db-65a628ed9f4e',
        'aeaeff69-dc67-4cba-b3f6-f407358c2e52'
    ],
    key3: {
        innerKey: 12
    }
}
*/
```

if the instance is hydrated with data, it can self-validate against the schema it was built upon:
```JavaScript
felicityInstance.key1 = 'A valid string';

const validInstance = felicityInstance.validate();

console.log(validInstance);
/*
{
    success: false,
    errors : [
        {
            "message": "\"key2\" must contain at least 3 items",
            "path": "key2",
            "type": "array.min",
            "context": {
                "limit": 3,
                "value": [],
                "key": "key2"
            }
        },
        // ...
    ]
}
*/
```

Alternatively, Felicity can be used to pseudo-randomly generate valid examples directly from a Joi schema:
```Javascript
const stringSchema = Joi.string().regex(/[a-c]{3}-[d-f]{3}-[0-9]{4}/);
const sampleString = Felicity.example(stringSchema); // sampleString === 'caa-eff-5144'

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

See the [API Reference](http://github.com/xogroup/felicity/blob/master/API.md).

## Node Dependency
Node versions to use to avoid polyfill of `Buffer.alloc`.

- v4.5.x+
- v5.10.x+
- v6.0.x+
- v7.0.x+

## Contributing

We love community and contributions! Please check out our [guidelines](http://github.com/xogroup/felicity/blob/master/CONTRIBUTING.md) before making any PRs.

## Setting up for development

Getting yourself setup and bootstrapped is easy.  Use the following commands after you clone down.

```
npm install && npm test
```

Felicity makes use of the Node.js `Buffer.alloc` function instead of the unsafe and deprecated `Buffer` constructor.
As a result, one of the following minimum versions of [Node.js](//nodejs.org/en/download/releases/) is required:

- v4.5.0+
- v5.10.0+
- v6.0.0+
- v7.0.0+

## Joi features not yet supported

Some Joi schema options are not yet fully supported. Most unsupported features should not cause errors, but may be disregarded by Felicity or may result in behavior other than that documented in the Joi api.

A feature is considered Felicity-supported when it is explicitly covered in tests on both `entityFor` (and associated instance methods) and `example`.

- String
  - `truncate`
  - `replace`
  - `ip`
  - `uri`
  - `lowercase/uppercase`
  - `trim`
- Function
  - `ref`
- Array
  - `single`
  - `unique`
- Object
  - `pattern`
  - `and`
  - `or`
  - `rename`
  - `unknown`
  - `type`
  - `schema`
  - `requiredKeys`
  - `optionalKeys`
