const { failure } = require('../utils/apiResponse');

// Usage: validate(schema, 'body' | 'query' | 'params')
function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });
    if (error) {
      const errors = error.details.map((d) => d.message);
      return failure(res, 'Validation failed', 422, errors);
    }
    req[property] = value;
    return next();
  };
}

module.exports = validate;
