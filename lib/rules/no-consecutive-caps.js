'use strict';

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow consecutive uppercase letters (caps) in identifiers',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          exceptions: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      consecutiveCaps:
        "Identifier '{{name}}' should not contain consecutive caps. Consider renaming to '{{suggestion}}'.",
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const exceptions = options.exceptions || [];
    return {
      Identifier(node) {
        const { name, parent } = node;
        if (
          parent.type === 'MemberExpression' &&
          parent.property === node &&
          parent.object.type !== 'ThisExpression'
        )
          return;
        if (
          parent.type === 'Property' &&
          parent.key === node &&
          !parent.shorthand
        )
          return;
        const hasLowercase = /[a-z]/.test(name);
        const hasConsecutiveUppercase = /[A-Z]{2,}/.test(name);
        if (hasLowercase && hasConsecutiveUppercase) {
          const uppercaseGroups = name.match(/[A-Z]{2,}/g) || [];
          if (
            uppercaseGroups.length > 0 &&
            uppercaseGroups.every(group => exceptions.includes(group))
          )
            return;
          const suggestion = name.replace(/[A-Z]{2,}/g, match =>
            exceptions.includes(match)
              ? match
              : match.charAt(0) + match.slice(1).toLowerCase(),
          );
          if (suggestion !== name) {
            context.report({
              node,
              messageId: 'consecutiveCaps',
              data: { name, suggestion },
            });
          }
        }
      },
    };
  },
};
