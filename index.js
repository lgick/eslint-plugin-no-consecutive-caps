import noConsecutiveCaps from './lib/rules/no-consecutive-caps.js';

export default /** @type {import('eslint').ESLint.Plugin} */ ({
  rules: {
    'no-consecutive-caps': noConsecutiveCaps,
  },
});
