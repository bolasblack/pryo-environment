const {<%= componentName %>, mapStateToProps, mapDispatchToProps} = require('../<%= fileName %>')

describe('<<%= componentName %> />', () => {
  let React

  beforeEach(() => {
    jest.resetModules()
    React = require('react')
  })

  describe('dom tree', () => {
    let renderer

    beforeEach(() => {
      renderer = require('react-test-renderer')
    })

    it('successfully rendered')
  })

  describe('behavior', () => {
    let mount, shallow

    beforeEach(() => {
      const enzyme = require('enzyme')
      mount = enzyme.mount
      shallow = enzyme.shallow
    })

    it('works')
  })

  describe('.mapStateToProps', () => {
  })

  describe('.mapDispatchToProps', () => {
  })
})
