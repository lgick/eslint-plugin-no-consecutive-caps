/** @type {import('eslint').Rule.RuleModule} */
export default {
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
    const propertiesForGlobalFix = new Map();

    /**
     * @param {string} name
     * @returns {string|null}
     */
    function getSuggestionForName(name) {
      if (!name || !/[a-z]/.test(name)) return null;
      const regex = /[A-Z]{2,}(?=[A-Z][a-z]|\d|$)/g;
      const allMatches = name.match(regex);
      if (!allMatches) {
        return null;
      }

      if (allMatches.every(match => exceptions.has(match))) {
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
      Identifier(node) {
        const suggestion = getSuggestionForName(node.name);
        if (!suggestion) {
          return;
        }

        const scope = context.sourceCode.getScope(node);
        const variable = scope.resolve(node)?.resolved;

        if (variable) {
          if (!variablesForGlobalFix.has(variable)) {
            variablesForGlobalFix.set(variable, suggestion);
          }
          return;
        }

        const parent = node.parent;

        const isObjectProperty =
          parent.type === 'Property' && parent.key === node && !parent.computed;
        const isClassMethod =
          parent.type === 'MethodDefinition' && parent.key === node;
        const isThisProperty =
          parent.type === 'MemberExpression' &&
          parent.property === node &&
          !parent.computed &&
          parent.object.type === 'ThisExpression';

        if (isObjectProperty || isClassMethod || isThisProperty) {
          if (!propertiesForGlobalFix.has(node.name)) {
            propertiesForGlobalFix.set(node.name, {
              suggestion,
              nodes: [],
            });
          }
          propertiesForGlobalFix.get(node.name).nodes.push(node);
        }
      },

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

        for (const [name, data] of propertiesForGlobalFix.entries()) {
          const { suggestion, nodes } = data;
          const fix = fixer => nodes.map(n => fixer.replaceText(n, suggestion));

          nodes.forEach(reportNode => {
            context.report({
              node: reportNode,
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
