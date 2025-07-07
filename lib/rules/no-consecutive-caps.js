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
    const variablesToReport = new Map();

    function getSuggestionForName(name) {
      const hasLowercase = /[a-z]/.test(name);
      const hasConsecutiveUppercase = /[A-Z]{2,}/.test(name);

      if (hasLowercase && hasConsecutiveUppercase) {
        const uppercaseGroups = name.match(/[A-Z]{2,}/g) || [];
        if (
          uppercaseGroups.length > 0 &&
          uppercaseGroups.every(group => exceptions.includes(group))
        ) {
          return null;
        }

        const suggestion = name.replace(/[A-Z]{2,}/g, match =>
          exceptions.includes(match)
            ? match
            : match.charAt(0) + match.slice(1).toLowerCase(),
        );

        return suggestion !== name ? suggestion : null;
      }
      return null;
    }

    return {
      Identifier(node) {
        const { name, parent } = node;

        if (
          // this.myID = ...
          (parent.type === 'MemberExpression' &&
            parent.property === node &&
            parent.object.type === 'ThisExpression') ||
          // { myID: 'value' }
          (parent.type === 'Property' &&
            parent.key === node &&
            !parent.shorthand)
        ) {
          const suggestion = getSuggestionForName(name);
          if (suggestion) {
            context.report({
              node,
              messageId: 'consecutiveCaps',
              data: { name, suggestion },
              fix: fixer => fixer.replaceText(node, suggestion),
            });
          }
          return;
        }

        if (parent.type === 'MemberExpression' && parent.property === node) {
          return;
        }

        const scope = context.sourceCode.getScope(node);
        const variable =
          scope.set.get(name) ||
          scope.through.find(ref => ref.identifier.name === name)?.resolved;

        if (variable && !variablesToReport.has(variable)) {
          const suggestion = getSuggestionForName(variable.name);
          if (suggestion) {
            variablesToReport.set(variable, suggestion);
          }
        }
      },

      'Program:exit'() {
        for (const [variable, suggestion] of variablesToReport.entries()) {
          const fix = fixer => {
            return variable.references.map(ref =>
              fixer.replaceText(ref.identifier, suggestion),
            );
          };

          variable.references.forEach(ref => {
            context.report({
              node: ref.identifier,
              messageId: 'consecutiveCaps',
              data: { name: variable.name, suggestion },
              fix,
            });
          });
        }
      },
    };
  },
};
