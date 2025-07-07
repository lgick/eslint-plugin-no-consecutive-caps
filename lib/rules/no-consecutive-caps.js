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

    /**
     * Проверяет имя идентификатора и сообщает об ошибке, если это необходимо.
     * @param {import('estree').Identifier} node - Узел идентификатора для проверки.
     */
    function checkIdentifier(node) {
      if (!node || !node.name) {
        return;
      }
      const { name, parent } = node;

      // Игнорируем свойства сторонних библиотек
      if (
        parent.type === 'MemberExpression' &&
        parent.property === node &&
        parent.object.type !== 'ThisExpression'
      ) {
        return;
      }

      // Игнорируем ключи импорта
      if (
        parent.type === 'Property' &&
        parent.key === node &&
        parent.parent.type === 'ObjectPattern' &&
        parent.parent.parent.type === 'VariableDeclarator' &&
        parent.parent.parent.init
      ) {
        return;
      }

      const hasLowercase = /[a-z]/.test(name);
      const hasConsecutiveUppercase = /[A-Z]{2,}/.test(name);

      if (hasLowercase && hasConsecutiveUppercase) {
        const uppercaseGroups = name.match(/[A-Z]{2,}/g) || [];
        if (
          uppercaseGroups.length > 0 &&
          uppercaseGroups.every(group => exceptions.includes(group))
        ) {
          return;
        }

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
            fix: fixer => fixer.replaceText(node, suggestion),
          });
        }
      }
    }

    return {
      // 1. Проверяем все идентификаторы: переменные, параметры, свойства `this`
      Identifier: checkIdentifier,

      // 2. Проверяем объявления функций
      FunctionDeclaration(node) {
        if (node.id) {
          checkIdentifier(node.id);
        }
      },

      // 3. Проверяем объявления классов
      ClassDeclaration(node) {
        if (node.id) {
          checkIdentifier(node.id);
        }
      },

      // 4. Проверяем методы классов и ключи в объектах
      MethodDefinition(node) {
        if (node.key.type === 'Identifier') {
          checkIdentifier(node.key);
        }
      },

      Property(node) {
        if (node.key.type === 'Identifier' && !node.shorthand) {
          checkIdentifier(node.key);
        }
      },
    };
  },
};
