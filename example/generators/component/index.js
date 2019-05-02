const Generator = require('yeoman-generator')
const _camelCase = require('lodash/camelCase')
const _upperFirst = require('lodash/upperFirst')

module.exports = class extends Generator {
  constructor() {
    super()
    this.templateInfo = {
      componentName: _upperFirst(_camelCase(this.args[0])),
      fileName: this.args[0] + '.jsx',
    }
  }

  generateFile() {
    this.fs.copyTpl(
      this.templatePath('main.jsx'),
      this.destinationPath(`scripts/components/${this.templateInfo.fileName}`),
      this.templateInfo,
    )
  }

  generateTestFile() {
    if (this.options.test === false) return

    this.fs.copyTpl(
      this.templatePath('test.jsx'),
      this.destinationPath(
        `scripts/components/__tests__/${this.templateInfo.fileName}`,
      ),
      this.templateInfo,
    )
  }
}
