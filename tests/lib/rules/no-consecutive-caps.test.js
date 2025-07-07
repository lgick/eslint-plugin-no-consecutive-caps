import { RuleTester } from 'eslint';
import rule from '../../../lib/rules/no-consecutive-caps.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
});

ruleTester.run('no-consecutive-caps', rule, {
  valid: [
    { code: 'const userId = 1;' },
    { code: 'function getUser() {}' },
    { code: 'class HttpConnector {}' },
    { code: 'console.log(window.localStorage.someUglyID);' },
    { code: "element.innerHTML = 'test';" },
    { code: 'const MY_CONSTANT = 1;' },
    { code: 'const MY_API = "xyz";' },
    { code: 'const Uuid = "test";' },
    {
      code: 'function generateUUID() {}',
      options: [{ exceptions: ['UUID'] }],
    },
    {
      code: 'const timeoutMS = 500;',
      options: [{ exceptions: ['MS'] }],
    },
    {
      code: 'const myAPIKey = "key";',
      options: [{ exceptions: ['API', 'Key'] }],
    },
  ],

  invalid: [
    {
      code: 'function getURL() {}; const url = getURL();',
      output: 'function getUrl() {}; const url = getUrl();',
      errors: [
        {
          messageId: 'consecutiveCaps',
          data: { name: 'getURL', suggestion: 'getUrl' },
        },
        {
          messageId: 'consecutiveCaps',
          data: { name: 'getURL', suggestion: 'getUrl' },
        },
      ],
    },
    {
      code: 'class ChatGPT {}; const model = new ChatGPT(); export default ChatGPT;',
      output:
        'class ChatGpt {}; const model = new ChatGpt(); export default ChatGpt;',
      errors: [
        {
          messageId: 'consecutiveCaps',
          data: { name: 'ChatGPT', suggestion: 'ChatGpt' },
        },
        {
          messageId: 'consecutiveCaps',
          data: { name: 'ChatGPT', suggestion: 'ChatGpt' },
        },
        {
          messageId: 'consecutiveCaps',
          data: { name: 'ChatGPT', suggestion: 'ChatGpt' },
        },
      ],
    },
    {
      code: 'let myAPIKey = "abc"; myAPIKey = "xyz";',
      output: 'let myApiKey = "abc"; myApiKey = "xyz";',
      errors: [
        {
          messageId: 'consecutiveCaps',
          data: { name: 'myAPIKey', suggestion: 'myApiKey' },
        },
        {
          messageId: 'consecutiveCaps',
          data: { name: 'myAPIKey', suggestion: 'myApiKey' },
        },
      ],
    },
    {
      code: 'const obj = { myID: 1 };',
      output: 'const obj = { myId: 1 };',
      errors: [
        {
          messageId: 'consecutiveCaps',
          data: { name: 'myID', suggestion: 'myId' },
        },
      ],
    },
    {
      code: 'class Parser { parseHTML() {} }',
      output: 'class Parser { parseHtml() {} }',
      errors: [
        {
          messageId: 'consecutiveCaps',
          data: { name: 'parseHTML', suggestion: 'parseHtml' },
        },
      ],
    },
    {
      code: 'const myAPIKey = "key"; const newUUID = "id";',
      output: 'const myApiKey = "key"; const newUUID = "id";',
      options: [{ exceptions: ['UUID'] }],
      errors: [
        {
          messageId: 'consecutiveCaps',
          data: { name: 'myAPIKey', suggestion: 'myApiKey' },
        },
      ],
    },
    {
      code: 'class A { constructor() { this.fameIDH = 4; console.log(this.fameIDH); } }',
      output:
        'class A { constructor() { this.fameIdh = 4; console.log(this.fameIdh); } }',
      errors: [
        {
          messageId: 'consecutiveCaps',
          data: { name: 'fameIDH', suggestion: 'fameIdh' },
        },
        {
          messageId: 'consecutiveCaps',
          data: { name: 'fameIDH', suggestion: 'fameIdh' },
        },
      ],
    },
    {
      code: 'function C() { this._fameIDH = 4; return this._fameIDH; }',
      output: 'function C() { this._fameIdh = 4; return this._fameIdh; }',
      errors: [
        {
          messageId: 'consecutiveCaps',
          data: { name: '_fameIDH', suggestion: '_fameIdh' },
        },
        {
          messageId: 'consecutiveCaps',
          data: { name: '_fameIDH', suggestion: '_fameIdh' },
        },
      ],
    },
  ],
});
