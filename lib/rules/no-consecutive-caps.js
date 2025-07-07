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

    /**
     * Проверяет имя и возвращает предложенное исправление.
     * @param {string} name
     * @returns {string|null}
     */
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

    /**
     * Сообщает об ошибке с локальным фиксом (только для одного узла).
     * @param {import('estree').Identifier} node
     */
    function reportLocal(node) {
      const suggestion = getSuggestionForName(node.name);
      if (suggestion) {
        context.report({
          node,
          messageId: 'consecutiveCaps',
          data: { name: node.name, suggestion },
          fix: fixer => fixer.replaceText(node, suggestion),
        });
      }
    }

    return {
      // 1. Обрабатываем все случаи, где глобальный фикс сложен или не нужен.
      // Это методы, ключи объектов и свойства `this`.
      'MethodDefinition, Property[key.type="Identifier"]:not([shorthand=true])'(
        node,
      ) {
        reportLocal(node.key);
      },

      'MemberExpression[object.type="ThisExpression"][property.type="Identifier"]'(
        node,
      ) {
        reportLocal(node.property);
      },

      // 2. Игнорируем свойства других объектов
      'MemberExpression[property.type="Identifier"]'(node) {
        if (node.object.type !== 'ThisExpression') {
          // Игнорируем, так как это не `this.prop`
        }
      },

      // 3. Собираем лексические переменные для глобального фикса.
      Identifier(node) {
        const scope = context.sourceCode.getScope(node);
        // Мы ищем только переменные, а не свойства
        const variable =
          scope.set.get(node.name) ||
          scope.through.find(ref => ref.identifier.name === node.name)
            ?.resolved;

        // Если это переменная, и мы еще ее не обработали, добавляем в список.
        if (variable && !variablesToReport.has(variable)) {
          const suggestion = getSuggestionForName(variable.name);
          if (suggestion) {
            variablesToReport.set(variable, suggestion);
          }
        }
      },

      // 4. В конце генерируем отчеты с глобальным фиксом для всех собранных переменных.
      'Program:exit'() {
        for (const [variable, suggestion] of variablesToReport.entries()) {
          const fix = fixer =>
            variable.references.map(ref =>
              fixer.replaceText(ref.identifier, suggestion),
            );

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
