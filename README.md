# felicity
Javascript object constructors based on Joi schema.


## Usage
Given a [joi](www.github.com/hapijs/joi) schema, instantiate a skeleton object:
```JavaScript
const Joi      = require('joi'),
      Felicity = require('felicity');

let joiSchema = Joi.object().keys({
    key1: Joi.string().required(),
    key2: Joi.array().items(Joi.string().guid()).min(3).required()
});

let felicityInstance = new Felicity.skeleton(joiSchema);

console.log(felicityInstance);
/*
{
    key1: null,
    key2: []
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
    ]
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
            message: '"key2" is required',
            path   : 'key2',
            type   : 'any.required',
            context: { key: 'key2' }
        }
    ]
}
*/
```