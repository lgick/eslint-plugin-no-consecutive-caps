'use strict';

/** @type {import('eslint').ESLint.Plugin} */
module.exports = {
  rules: {
    'no-consecutive-caps': require('./lib/rules/no-consecutive-caps'),
  },
};
