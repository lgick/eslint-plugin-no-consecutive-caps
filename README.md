# eslint-plugin-no-consecutive-caps

[![NPM Version](https://img.shields.io/npm/v/eslint-plugin-no-consecutive-caps.svg)](https://www.npmjs.com/package/eslint-plugin-no-consecutive-caps)
[![NPM Downloads](https://img.shields.io/npm/dm/eslint-plugin-no-consecutive-caps.svg)](https://www.npmjs.com/package/eslint-plugin-no-consecutive-caps)
[![License](https://img.shields.io/npm/l/eslint-plugin-no-consecutive-caps.svg)](https://github.com/lgick/eslint-plugin-no-consecutive-caps/blob/main/LICENSE)

An ESLint plugin to enforce a stricter camelCase convention by disallowing consecutive uppercase letters in identifiers within **your own code**, while intelligently ignoring external libraries and browser APIs.

---

## ✨ Key Features

- **Strict Naming Style:** Disallows acronyms like `userID` or `APIKey` in favor of `userId` and `apiKey` for improved consistency.
- **Intelligent Detection:** Uses scope analysis to determine which identifiers are declared within your codebase. **It will not trigger errors** on properties and methods from third-party libraries or built-in browser APIs.
- **Comprehensive Fixer:** Automatically renames all occurrences of a variable, function, or class throughout its scope with a single command.
- **Flexible Exceptions:** Allows you to specify a list of permitted acronyms if needed.
- **Flat Config Ready:** Designed for the modern `eslint.config.js` format.

## 🤔 Why is this important?

The standard ESLint `camelcase` rule allows writing acronyms in uppercase (`userID`, `fetchURL`, `myAPIKey`). This often leads to team debates and inconsistencies in the codebase.

This plugin solves the problem by proposing a single, strict style.

| Identifier  | Standard `camelcase` | `no-consecutive-caps` (this plugin) |
| :---------- | :------------------: | :---------------------------------: |
| `myUserID`  |        ✅ Ok         |        ❌ Error (`myUserId`)        |
| `apiURL`    |        ✅ Ok         |         ❌ Error (`apiUrl`)         |
| `parseHTML` |        ✅ Ok         |       ❌ Error (`parseHtml`)        |
| `userId`    |        ✅ Ok         |                ✅ Ok                |

### Key Advantage: Ignoring Third-Party Code

The biggest problem with similar rules is false positives on code you don't control. This plugin uses **ESLint's scope analysis** to solve this:

```javascript
// ✅ This code will not cause errors, as the plugin understands
//    that these are properties of external objects.

// Third-party library
import someLibrary from 'some-library';
console.log(someLibrary.someUglyID); // OK

// Built-in browser APIs
element.innerHTML = '...'; // OK
const range = document.createRange(); // OK
```

The plugin only checks identifiers that you declare and control: variables, functions, classes, and their parameters.

## 💿 Installation

You'll need [ESLint](https://eslint.org/) installed.

```bash
npm install --save-dev eslint eslint-plugin-no-consecutive-caps
```

## 🚀 Usage

This plugin is designed for use with ESLint's new "flat" config format (`eslint.config.js`).

1.  Import the plugin into your `eslint.config.js`.
2.  Add it to a configuration object under the `plugins` key.
3.  Enable and configure the rule under the `rules` key.

**Example `eslint.config.js`:**

```javascript
import js from '@eslint/js';
import noConsecutiveCapsPlugin from 'eslint-plugin-no-consecutive-caps';

export default [
  // Base recommended ESLint rules
  js.configs.recommended,

  // Your project's configuration
  {
    plugins: {
      'no-consecutive-caps': noConsecutiveCapsPlugin,
    },
    rules: {
      // It's a good idea to use the standard rule alongside this one
      camelcase: 'error',

      // Enable the rule from our plugin
      // Format: "plugin-name/rule-name"
      'no-consecutive-caps/no-consecutive-caps': 'error',
    },
    // Optional: apply these rules only to your source files
    // files: ["src/**/*.js"],
  },
];
```

## 📖 Rules

### `no-consecutive-caps/no-consecutive-caps`

Disallows using two or more consecutive uppercase letters in identifiers that you declare in your code. The autofix for variables, functions, and classes will rename all instances within the file.

**❌ Examples of incorrect code (will trigger an error):**

```javascript
const myAPIKey = '...'; // Error: 'API'
let userID = 123; // Error: 'ID'

function getNewURL() {
  // Error: 'URL'
  // ...
}

class HTMLParser {
  // Error: 'HTML'
  constructor() {
    this.rootElement = null;
  }
}
```

**✅ Examples of correct code:**

```javascript
const myApiKey = '...';
let userId = 123;

function getNewUrl() {
  // ...
}

class HtmlParser {
  constructor() {
    this.rootElement = null;
  }
}
```

#### Configuring Exceptions

Sometimes you need to allow specific acronyms (e.g., due to third-party API requirements or internal conventions). You can add them to the exceptions list.

Exceptions are specified as an array of strings in the rule's options. Each string must **exactly match, case-sensitively**, the group of uppercase letters you want to allow.

**Example configuration with exceptions:**

In this example, we allow `UUID` and `MS` (milliseconds) but still disallow `API`.

```javascript
// eslint.config.js
export default [
  {
    rules: {
      'no-consecutive-caps/no-consecutive-caps': [
        'error',
        {
          exceptions: ['UUID', 'MS'],
        },
      ],
    },
  },
];
```

**✅ Code that is now considered correct (with this configuration):**

```javascript
function generateUUID() {
  // Ok: 'UUID' is in the exceptions list
  // ...
}

const timeoutMS = 500; // Ok: 'MS' is in the exceptions list
```

**❌ Code that will still be considered incorrect:**

```javascript
const primaryAPIKey = '...'; // Error: 'API' was not added to the exceptions
```

## 💡 How It Works (A Look Under the Hood)

The plugin's intelligence comes from a two-phase process that leverages ESLint's scope analysis:

1.  **Collection Phase:** As ESLint traverses your code, the plugin inspects every `Identifier`. It uses scope analysis to determine if the identifier belongs to a variable you declared (a function, class, `const`, `let`, or parameter) or if it's a standalone entity (like an object key or method name).

    - **Global cases** (variables) are collected in a list for later processing.
    - **Local cases** (like object keys) are reported immediately with a simple, local fix.

2.  **Reporting Phase (`Program:exit`):** After the entire file has been analyzed, the plugin processes the collected variables. For each variable, it finds all its references (declaration and usages) and generates a single **global fix** to rename them all at once. This ensures that an autofix corrects the identifier everywhere, maintaining code integrity.

## ❤️ Contributing

Contributions are welcome! Please feel free to open an [issue](https://github.com/lgick/eslint-plugin-no-consecutive-caps/issues) or submit a [pull request](https://github.com/lgick/eslint-plugin-no-consecutive-caps/pulls).

## 📄 License

[MIT](https://github.com/lgick/eslint-plugin-no-consecutive-caps/blob/main/LICENSE)

## ❤️ Supporting the Project

If you find this plugin useful and want to support its development, starring the project on GitHub is a great way to show your appreciation!

Donations are also welcome via Bitcoin. Every contribution helps sustain the project and is greatly appreciated.

| Currency | Address                                      | QR Code                                                                                                                                            |
| :------- | :------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BTC**  | `bc1q0fnakv2jean57p3rjqzhq826jklygpj6gc7evu` | <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=bc1q0fnakv2jean57p3rjqzhq826jklygpj6gc7evu" alt="BTC QR Code" width="120"> |
