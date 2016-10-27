# 1.0.0 API Reference

- [Felicity](#felicity)
  - [`entityFor(schema, [options])`](#entityforschema-options)
    - [Constructor methods](#constructor-methods)
  - [`example(schema, [options])`](#exampleschema-options)
  - [Options](#options)
    - [EntityFor](#entityfor-options)
    - [Example](#example-options)
    - [Validate](#validate-options)
  
## Felicity

###`entityFor(schema, [options])`

Creates a Constructor function based on the provided Joi schema. Accepts an optional [`[options]`](#entityfor-options) parameter.

####Constructor methods

The Constructor function returned by `entityFor` has the following properties/methods available for use without instantiation of `new` objects.
- `prototype.schema` - The Joi validation schema provided to `entityFor`.
- `example([options])` - Returns a valid pseudo-randomly generated example based on the Constructor's `prototype.schema`. Accepts an optional [`[options]`](#example-options) parameter.
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