'use strict';

const Joi               = require('joi');
const JoiDateExtensions = require('@hapi/joi-date');

module.exports = Joi.extend(JoiDateExtensions);
