# 1.0.0 API Reference

- [Felicity](#felicity)
  - [`entityFor(schema, [options])`](#entityforschema-options)
    - [Constructor methods](#constructor-methods)
    - [Instance methods](#instance-methods)
  - [`example(schema, [options])`](#exampleschema-options)
  - [Options](#options)
    - [EntityFor](#entityfor-options)
    - [Example](#example-options)
  
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
- `example([options])` - Returns a valid pseudo-randomly generated example Javascript Object based on the Constructor's `prototype.schema`. Accepts an optional [`[options]`](#example-options) parameter.
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
  Returns the below validationObject unless `callback` is provided, in which case `callback(errors, validationObject)` is called.
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
- `schema` - The Joi schema provided to `entityFor`. Non-enumerable, inherited from the Constructor.
- `example([options])` - Returns a new valid pseudo-randomly generated example Javascript Object based on the instance's `schema` property.
  Accepts an optional [`[options]`](#example-options) parameter.

  Does not modify the instance.
- `validate([callback])` - Joi-validates the instance against the instance's `schema` property.
  Returns the same validationObject as the [`Constructor.validate`](#constructor-methods) method unless `callback` is provided, in which case `callback(errors, validationObject)` is called.

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

Returns a valid pseudo-randomly generated example Javascript Object based on the provided Joi schema.

Accepts an optional [`[options]`](#example-options) parameter.

```Javascript
const schema = Joi.object().keys({
    name: Joi.string().min(3).required(),
    id  : Joi.string().guid().required(),
    tags: Joi.array().items(Joi.string().max(4)).min(2).required(),
});
const exampleDoc = Felicity.example(schema);

/*
exampleDoc
{ 
    name: 'qgrbddv',
    id  : '6928f0c0-68fa-4b6f-9bc5-961db17d42b0',
    tags: [ 'k2a', '31' ]
}
*/
```

###Options

All options parameters must be an object with property `config`. Properties on the `config` object are detailed by method below.

####`entityFor` Options

- `strictInput` - default `false`. Default behavior is to not run known properties through Joi validation upon object instantiation.

If set to `true`, all input will be validated, and only properties that pass validation will be utilized on the returned object.
All others will be returned in nulled/emptied form as if there was no input for that field.

```Javascript
const schema = Joi.object().keys({
    id: Joi.string().guid()
});
const input = {
    id: '12345678' // not a valid GUID
};
const Document = Felicity.entityFor(schema);
const document = new Document(input); // { id: '12345678' }

const StrictDocument = Felicity.entityFor(schema, { config: { strictInput: true } });
const strictDocument = new StrictDocument(input); // { id: null }
```

- `strictExample` - default `false`. Default behavior is to not run examples through Joi validation before returning.

If set to `true`, example will be validated prior to returning. 

Note: in most cases, there is no difference. The only known cases where this may result in ValidationErrors are with regex patterns containing lookarounds.

```Javascript
    const schema = Joi.object().keys({
        name    : Joi.string().regex(/abcd(?=efg)/)
    });

    const instance = new (Felicity.entityFor(schema)); // instance === { name: null }
    const mockInstance = instance.example(); // mockInstance === { name: 'abcd' }

    const strictInstance = new (Felicity.entityFor(schema, { config: { strictExample: true } })); // strictInstance === { name: null }
    const mockStrict = strictInstance.example(); // ValidationError
```

- `ignoreDefaults` - Default `false`. Default behavior is to stamp instances with defaults.

If set to `true`, then default values of Joi properties with `.default('value')` set will not be stamped into instances.
```Javascript
    const schema = Joi.object().keys({
        name: Joi.string().required().default('felicity')
    });

    const Constructor = Felicity.entityFor(schema);
    const instance = new Constructor(); // instance === { name: 'felicity' }

    const NoDefaults = Felicity.entityFor(schema, { config: { ignoreDefaults: true } });
    const noDefaultInstance = new NoDefaults(); // noDefaultInstance === { name: null }
```

- `includeOptional` - Default `false`. Default behavior is to ignore optional properties entirely.

If set to `true`, then Joi properties with `.optional()` set will be included on instances.
```Javascript
    const schema = Joi.object().keys({
        name    : Joi.string().required(),
        nickname: Joi.string().optional()
    });

    const Constructor = Felicity.entityFor(schema);
    const instance = new Constructor(); // instance === { name: null }

    const WithOptional = Felicity.entityFor(schema, { config: { includeOptional: true } });
    const withOptionalInstance = new WithOptional(); // withOptionalInstance === { name: null, nickname: null }
```

####`example` Options

- `strictExample` - default `false`. Default behavior is to not run examples through Joi validation before returning.

If set to `true`, example will be validated prior to returning. 

Note: in most cases, there is no difference. The only known cases where this may result in no example coming back are with regex patterns containing lookarounds.

```Javascript
    const schema = Joi.object().keys({
        name    : Joi.string().regex(/abcd(?=efg)/)
    });

    const instance = Felicity.example(schema); // instance === { name: 'abcd' }

    const strictInstance = Felicity.example(schema, { config: { strictExample: true } }); // throws ValidationError
```

- `ignoreDefaults` - Default `false`. Default behavior is to stamp instances with default values.

If set to `true`, then default values of Joi properties with `.default('value')` set will not be stamped into instances but will be generated according to the Joi property rules.
```Javascript
    const schema = Joi.object().keys({
        name: Joi.string().required().default('felicity')
    });

    const example = Felicity.example(schema); // example === { name: 'felicity' }

    const noDefaultsExample = Felicity.example(schema, { config: { ignoreDefaults: true } }); // noDefaultsExample === { name: 'nq5yhu4ttq33di' }
```

- `includeOptional` - Default `false`. Default behavior is to ignore optional properties entirely.

If set to `true`, then Joi properties with `.optional()` set will be included on examples.
```Javascript
    const schema = Joi.object().keys({
        name    : Joi.string().required(),
        nickname: Joi.string().optional()
    });

    const instance = Felicity.example(schema); // instance === { name: 'ml9mmn0r8m7snhfr' }

    const withOptional = Felicity.example(schema, { config: { includeOptional: true } }); // withOptional === { name: '3cpffhgccgsw0zfr', nickname: '7pfjuxfa4gxk1emi' }
```
