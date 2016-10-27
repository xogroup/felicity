# 1.0.0 API Reference

- [Felicity](#felicity)
  - [`entityFor(schema, [options])`](#entityforschema-options)
    - [Constructor methods](#constructor-methods)
    - [Instance methods](#instance-methods)
  - [`example(schema, [options])`](#exampleschema-options)
  - [Options](#options)
    - [EntityFor](#entityfor-options)
    - [Example](#example-options)
    - [Validate](#validate-options)
  
## Felicity

###`entityFor(schema, [options])`

Creates a Constructor function based on the provided Joi schema. Accepts an optional [`[options]`](#entityfor-options) parameter.
Instances created by `new Constructor()` are "empty skeletons" of the provided Joi schema, and have sugary prototypal [methods](#instance-methods).
The returned Constructor function accepts an optional `input` parameter. Any input provided that passes Joi validation against the schema provided to entityFor will be used to hydrate the `new` object.
 
```Javascript
const schema = Joi.object().keys({
    name: Joi.string().min(3).required(),
    id  : Joi.string().guid().required(),
    keys: Joi.array().items(Joi.object().keys({id: Joi.string().guid()})).min(3).required()
});
const Conversation = Felicity.entityFor(schema);
const convoInstance = new Conversation();
const partialInstance = new Conversation({name: 'Felicity', fakeKey: 'invalid'});

/*
convoInstance
{
    name: null,
    id  : null,
    keys: []
}

partialInstance
{
    name: 'Felicity',
    id  : null,
    keys: []
}
*/
```

####Constructor methods

The Constructor function returned by `entityFor` has the following properties/methods available for use without instantiation of `new` objects.
- `prototype.schema` - The Joi validation schema provided to `entityFor`.
- `example([options])` - Returns a valid pseudo-randomly generated example based on the Constructor's `prototype.schema`. Accepts an optional [`[options]`](#example-options) parameter.
  ```Javascript
  // using schema and Conversation constructor from "entityFor" code example:
  const exampleConversation = Conversation.example();
  /*
  exampleConversation
  {
    name: 'taut9',
    id  : 'b227cd4c-4e7a-4ba4-a613-30747f7267b8',
    keys: [
        { id: '401a7324-8753-4ae2-abcc-6ae96216500e' },
        { id: 'c83c4a88-db1e-4402-8345-8b92be551b4e' },
        { id: 'e4194c87-541c-41f7-9473-783bf0e790fe' }
    ]
  }
  */
  ```
- `validate(input, [callback])` - Joi-validates the provided input against the Constructor's `prototype.schema`.
  Returns the below validationObject unless `callback` is provided, in which case `callback(validationObject)` is called.
  - `validationObject` - the result of Joi validation has properties:
    - `success` - boolean. `true` if Joi validation is successful, `false` if input fails Joi validation.
    - `errors` - null if successful validation, array of all Joi validation error details if unsuccessful validation
    - `value` - Validated input value after any native Joi type conversion is applied (if applicable. see [Joi](https://github.com/hapijs/joi/blob/master/API.md#validatevalue-schema-options-callback) docs for more details)
    ```Javascript
    // Examples
    const successValidationObject = {
        success: true,
        errors : null,
        value  : {/*...*/}
    }
    
    const failureValidationObject = {
        success: false,
        errors : [
            {
                message: '"name" is required',
                path: 'name',
                type: 'any.required',
                context: { key: 'name' }
            } 
        ],
        value  : {/*...*/}
    }
    ```
    
####Instance methods

The `new` instances of the Constructor function returned by `entityFor` have the following properties/methods available.
- `schema` - The Joi validation schema provided to `entityFor`. Non-enumerable property inherited from the Constructor.
- `example([options])` - Returns a valid pseudo-randomly generated example based on the instance's `schema` property. Accepts an optional [`[options]`](#example-options) parameter.
- `validate([callback])` - Joi-validates the instance against the instance's `schema` property.
  Returns the same validationObject as the [`Constructor.validate`](#constructor-methods) method unless `callback` is provided, in which case `callback(validationObject)` is called.

```Javascript
const schema = Joi.object().keys({
    name: Joi.string().required(),
    id  : Joi.string().guid().required()
);
const Constructor = Felicity.entityFor(schema);
const instance = new Constructor(); // instance === { name: null, id: null }

const instanceValidation = instance.validate(); // instanceValidation === { success: false, errors: [ { message: '"name" must be a string', path: 'name', type: 'string.base', context: [Object] },{ message: '"id" must be a string', path: 'id', type: 'string.base', context: [Object] }], value: {name: null, id: null} }

instance.name = 'Felicity';
instance.id = 'e7db5468-2551-4e42-98ea-47cc57606258';

const retryValidation = instance.validate(); // retryValidation === { success: true, errors: null, value: {name: 'Felicity', id: 'e7db5468-2551-4e42-98ea-47cc57606258'}}
```

###`example(schema, [options])`