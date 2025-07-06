# eslint-plugin-no-consecutive-caps

[![NPM Version](https://img.shields.io/npm/v/eslint-plugin-no-consecutive-caps.svg)](https://www.npmjs.com/package/eslint-plugin-no-consecutive-caps)
[![NPM Downloads](https://img.shields.io/npm/dm/eslint-plugin-no-consecutive-caps.svg)](https://www.npmjs.com/package/eslint-plugin-no-consecutive-caps)
[![License](https://img.shields.io/npm/l/eslint-plugin-no-consecutive-caps.svg)](https://github.com/lgick/eslint-plugin-no-consecutive-caps/blob/main/LICENSE)

An ESLint plugin to enforce a stricter camelCase convention by disallowing consecutive uppercase letters in identifiers within **your own code**, while intelligently ignoring external libraries and browser APIs.

---

## ✨ Key Features

- **Strict Naming Style:** Disallows acronyms like `userID` or `APIKey` in favor of `userId` and `apiKey` for consistency.
- **Intelligent Detection:** **The plugin only analyzes your code.** It will not trigger errors on properties and methods from third-party libraries or built-in browser APIs.
- **Flexible Exceptions:** Allows you to specify a list of permitted acronyms if needed.
- **Flat Config Compatible:** Designed for the modern `eslint.config.js` format.

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

The biggest problem with similar rules is false positives on code you don't control. This plugin solves it:

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

The plugin will only check the identifiers you declare yourself: variables, functions, classes, and properties via `this`.

## 💿 Installation

You'll need [ESLint](https://eslint.org/) installed.

```bash
npm install --save-dev eslint eslint-plugin-no-consecutive-caps
```

## 🚀 Usage

This plugin is designed for use with ESLint's new "flat" config format (`eslint.config.js`).

1.  Import the plugin into your `eslint.config.js`.
2.  Add the plugin to the `plugins` section. ESLint will automatically convert the name `eslint-plugin-no-consecutive-caps` to the key `'no-consecutive-caps'`.
3.  Enable the rule in the `rules` section.

**Example `eslint.config.js`:**

```javascript
import js from '@eslint/js';
import noConsecutiveCapsPlugin from 'eslint-plugin-no-consecutive-caps';

export default [
  // Base recommended ESLint rules
  js.configs.recommended,

  // Register our plugin
  {
    plugins: {
      'no-consecutive-caps': noConsecutiveCapsPlugin,
    },
  },

  // Configure rules for the entire project
  {
    rules: {
      // Your other rules...
      camelcase: 'error', // Recommended to use alongside the standard rule

      // Enable the rule from our plugin
      // Format: "plugin-name/rule-name"
      'no-consecutive-caps/no-consecutive-caps': 'error',
    },
  },
];
```

## 📖 Rules

### `no-consecutive-caps/no-consecutive-caps`

Disallows using two or more consecutive uppercase letters in identifiers that you declare in your code.

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
    this.someID = 42; // Error: 'ID'
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
    this.someId = 42;
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
