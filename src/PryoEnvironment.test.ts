import path from 'path'
import { PryoEnvironment } from './PryoEnvironment'

describe(PryoEnvironment.name, () => {
  describe('.createEnv', () => {
    it('return PryoEnvironment instance', () => {
      const env = PryoEnvironment.createEnv([], {
        cwd: path.resolve(__dirname, '../example'),
      })
      expect(env).toBeInstanceOf(PryoEnvironment)
    })
  })

  describe('.getNpmPaths', () => {
    it('consider ${this.cwd}/node_modules', () => {
      const env = PryoEnvironment.createEnv([], {
        cwd: path.resolve(__dirname, '../example'),
      })
      expect(env.getNpmPaths()[0]).toBe(path.resolve(env.cwd, 'node_modules'))
    })
  })

  describe('.lookup', () => {
    let env: PryoEnvironment

    beforeEach(() => {
      env = PryoEnvironment.createEnv([], {
        cwd: path.resolve(__dirname, '../example'),
      })
    })

    it('works', done => {
      env.lookup(err => {
        expect(err).toBe(null)
        expect(env.namespaces().length).toBe(exampleGeneratorNamespaces.length)
        expect(env.namespaces()).toEqual(
          expect.arrayContaining(exampleGeneratorNamespaces),
        )
        done()
      })
    })
  })
})

const exampleGeneratorNamespaces = [
  'component',
  'container',
  'angular:app',
  'angular:constant',
  'angular:common',
  'angular:controller',
  'angular:decorator',
  'angular:directive',
  'angular:factory',
  'angular:filter',
  'angular:main',
  'angular:provider',
  'angular:service',
  'angular:value',
  'angular:view',
  'angular:route',
]
