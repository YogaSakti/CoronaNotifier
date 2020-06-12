module.exports = {
    "env": {
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "extends": 'standard',
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
        "eqeqeq": 0,
        "indent": 0,
        "no-unused-vars": 0,
        "no-unused-expressions":0,
        "no-self-assign": 0,
        "no-undef": 0,
        "no-async-promise-executor": 0,
        "prefer-promise-reject-errors": 0
    }
};