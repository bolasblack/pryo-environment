# pryo-environment [![Build Status](https://travis-ci.com/pryojs/environment.svg?branch=master)](https://travis-ci.com/pryojs/environment) [![Coverage Status](https://coveralls.io/repos/github/pryojs/environment/badge.svg?branch=master)](https://coveralls.io/github/pryojs/environment?branch=master)

Write [yeoman](http://yeoman.io/) generators in project instead of another package.

## Usage

### Folder structure

```
├───package.json
├───src
└───generators/
    ├───app/
    │   └───index.js
    └───router/
        └───index.js
```

Then use <code>&grave;npm bin&grave;/pryo app</code> to execute generator `generators/app/index.js`

You can custom generators by add `generator-folder` field to `package.json`

### Use other installed generators

Simply use `pryo` instead of `yo`.

For example, I installed [generator-angular](https://github.com/yeoman/generator-angular), then you can execute <code>&grave;npm bin&grave;/pryo angular:controller user</code> to generate controller files.

### Example

Read [example](example) for more detail.
