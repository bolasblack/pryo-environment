import fs from 'fs-extra'
import path from 'path'
import YoEnvironment, { Adapter } from 'yeoman-environment'
import globby from 'globby'
import findUp from 'find-up'
import { flatten, noop } from 'lodash'
import _debug from 'debug'

const debug = _debug('pryo:environment')

export class PryoEnvironment<
  O extends YoEnvironment.Options = YoEnvironment.Options
> extends YoEnvironment<O> {
  static createEnv<O extends YoEnvironment.Options = YoEnvironment.Options>(
    args?: string | string[],
    opts?: O,
    adapter?: Adapter,
  ): PryoEnvironment<O> {
    return new PryoEnvironment(args, opts, adapter)
  }

  getNpmPaths() {
    const paths = super.getNpmPaths()
    paths.unshift(path.resolve(this.cwd, 'node_modules'))
    return paths
  }

  lookup(cb: (err: Error | null) => void = noop): void {
    this.asyncLookup().then(() => cb(null), cb)
  }

  private async asyncLookup() {
    const [localGeneratorModules, packedGeneratorModules] = await Promise.all([
      this.findLocalGenerators(),
      this.findPackedGenerators(),
    ])

    const localGeneratorRegisterPromises = localGeneratorModules.map(
      async pattern => {
        for (const filename of await globby('*/index.js', {
          cwd: pattern,
          absolute: true,
          deep: 1,
        })) {
          this.register(filename, this.namespace(filename.replace(pattern, '')))
        }
      },
    )

    const packedGeneratorRegisterPromises = packedGeneratorModules.map(
      async pattern => {
        for (const filename of await globby('*/index.js', {
          cwd: pattern,
          absolute: true,
          deep: 1,
        })) {
          /* tslint:disable-next-line:no-string-literal */
          this['_tryRegistering'](filename)
        }
      },
    )

    await Promise.all([
      ...localGeneratorRegisterPromises,
      ...packedGeneratorRegisterPromises,
    ])
  }

  private async findLocalGenerators() {
    const pkgFilePath = await findUp('package.json', { cwd: this.cwd })

    if (!pkgFilePath) return []

    let pkgFileContent
    try {
      pkgFileContent = JSON.parse((await fs.readFile(pkgFilePath)).toString())
    } catch (err) {
      return []
    }

    const generatorFolder = pkgFileContent['generator-folder'] || 'generators'
    return [path.resolve(this.cwd, generatorFolder)]
  }

  // rewrite findGeneratorsIn, use async functions instead of sync functions
  private async findPackedGenerators(): Promise<string[]> {
    const nestedModules = await Promise.all(
      this.getNpmPaths()
        .reverse()
        .map(this.searchGeneratorModulesInPath),
    )

    return flatten(nestedModules.filter((s): s is string[] => s != null))
  }

  private async searchGeneratorModulesInPath(
    root: string,
  ): Promise<string[] | void> {
    if (!root) return

    // Some folders might not be readable to the current user. For those, we add a try
    // catch to handle the error gracefully as globby doesn't have an option to skip
    // restricted folders.
    try {
      const modules = await globby(['generator-*'], {
        cwd: root,
        onlyFiles: false,
        absolute: true,
        deep: 0,
      })

      // To limit recursive lookups into non-namespace folders within globby,
      // fetch all namespaces in root, then search each namespace separately
      // for generator modules
      const namespaces = await globby(['@*'], {
        cwd: root,
        onlyFiles: false,
        absolute: true,
        deep: 0,
      })

      const namespacedModules = await Promise.all(
        namespaces.map(namespace =>
          globby(['generator-*'], {
            cwd: namespace,
            onlyFiles: false,
            absolute: true,
            deep: 0,
          }),
        ),
      )

      return modules.concat(flatten(namespacedModules))
    } catch (err) {
      debug('Could not access %s (%s)', root, err)
    }
  }
}
