'use strict';

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow consecutive uppercase letters (caps) in identifiers',
      recommended: true,
    },
    fixable: 'code',
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
    const reportedVariables = new Set();

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

          const scope = context.sourceCode.getScope(node);
          const variable =
            scope.set.get(name) ||
            scope.through.find(ref => ref.identifier.name === name)?.resolved;

          if (!variable || reportedVariables.has(variable)) {
            return;
          }

          reportedVariables.add(variable);

          const suggestion = name.replace(/[A-Z]{2,}/g, match =>
            exceptions.includes(match)
              ? match
              : match.charAt(0) + match.slice(1).toLowerCase(),
          );

          if (suggestion === name) {
            return;
          }

          const fix = fixer => {
            return variable.references.map(ref =>
              fixer.replaceText(ref.identifier, suggestion),
            );
          };

          variable.references.forEach(ref => {
            context.report({
              node: ref.identifier,
              messageId: 'consecutiveCaps',
              data: { name, suggestion },
              fix,
            });
          });
        }
      },
    };
  },
};
