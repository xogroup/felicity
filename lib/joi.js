'use strict';

const Joi               = require('joi');
const JoiDateExtensions = require('joi-date-extensions');

module.exports = Joi.extend(JoiDateExtensions);
