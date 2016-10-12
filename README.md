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

## Usage
Given a [joi](//www.github.com/hapijs/joi) schema, instantiate a skeleton object:
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

const felicityInstance = new Felicity.skeleton(joiSchema);

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

the skeleton can then be used to generate a randomized example of valid values:
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

if the skeleton is hydrated with data, it can self-validate against the schema it was built upon:
```JavaScript
felicityInstance.key1 = 'A valid string';

let validInstance = felicityInstance.validate();

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
        }
    ]
}
*/
```
<!--
## API

See the [API Reference]().
-->

## Joi features not yet implemented

+ with/without
+ email
+ regex
+ alternatives
