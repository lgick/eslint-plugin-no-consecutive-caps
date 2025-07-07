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
    const exceptions = new Set(options.exceptions || []);
    const variablesForGlobalFix = new Map();

    /**
     * @param {string} name
     * @returns {string|null}
     */
    function getSuggestionForName(name) {
      if (!name || !/[a-z]/.test(name)) return null;
      const regex = /[A-Z]{2,}(?=[A-Z][a-z]|\d|$)/g;
      if (!name.match(regex)) return null;

      const allMatches = name.match(regex) || [];
      if (
        allMatches.length > 0 &&
        allMatches.every(match => exceptions.has(match))
      ) {
        return null;
      }

      const suggestion = name.replace(regex, match =>
        exceptions.has(match)
          ? match
          : match.charAt(0) + match.slice(1).toLowerCase(),
      );

      return suggestion !== name ? suggestion : null;
    }

    return {
      // collect all problems using a single, powerful visitor
      Identifier(node) {
        const suggestion = getSuggestionForName(node.name);
        if (!suggestion) {
          return;
        }

        const scope = context.sourceCode.getScope(node);
        const variable = scope.resolve(node)?.resolved;

        // if a variable is found, it's a candidate for a global fix
        if (variable) {
          if (!variablesForGlobalFix.has(variable)) {
            variablesForGlobalFix.set(variable, suggestion);
          }
          return; // important: exit to avoid double-processing
        }

        // if no variable is found, it must be a local-only case (property/method key)
        const parent = node.parent;
        if (
          (parent.type === 'Property' &&
            parent.key === node &&
            !parent.computed) ||
          (parent.type === 'MethodDefinition' && parent.key === node)
        ) {
          context.report({
            node,
            messageId: 'consecutiveCaps',
            data: { name: node.name, suggestion },
            fix: fixer => fixer.replaceText(node, suggestion),
          });
        }
      },

      // report all collected variables with a global fix
      'Program:exit'() {
        for (const [variable, suggestion] of variablesForGlobalFix.entries()) {
          const uniqueNodesMap = new Map();

          variable.defs.forEach(def => {
            if (def.name)
              uniqueNodesMap.set(def.name.range.join('-'), def.name);
          });
          variable.references.forEach(ref => {
            uniqueNodesMap.set(ref.identifier.range.join('-'), ref.identifier);
          });

          const nodesToReport = Array.from(uniqueNodesMap.values());
          const fix = fixer =>
            nodesToReport.map(n => fixer.replaceText(n, suggestion));

          nodesToReport.forEach(reportNode => {
            context.report({
              node: reportNode,
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
