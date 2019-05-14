'use strict';

const Joi               = require('@hapi/joi');
const JoiDateExtensions = require('@hapi/joi-date');

module.exports = Joi.extend(JoiDateExtensions);
