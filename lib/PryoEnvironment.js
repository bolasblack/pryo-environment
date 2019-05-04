"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const yeoman_environment_1 = __importDefault(require("yeoman-environment"));
const globby_1 = __importDefault(require("globby"));
const find_up_1 = __importDefault(require("find-up"));
const lodash_1 = require("lodash");
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default('pryo:environment');
class PryoEnvironment extends yeoman_environment_1.default {
    static createEnv(args, opts, adapter) {
        return new PryoEnvironment(args, opts, adapter);
    }
    getNpmPaths() {
        const paths = super.getNpmPaths();
        paths.unshift(path_1.default.resolve(this.cwd, 'node_modules'));
        return paths;
    }
    lookup(cb = lodash_1.noop) {
        this.asyncLookup().then(() => cb(null), cb);
    }
    async asyncLookup() {
        const [localGeneratorModules, packedGeneratorModules] = await Promise.all([
            this.findLocalGenerators(),
            this.findPackedGenerators(),
        ]);
        const localGeneratorRegisterPromises = localGeneratorModules.map(async (pattern) => {
            for (const filename of await globby_1.default('*/index.js', {
                cwd: pattern,
                absolute: true,
                deep: 1,
            })) {
                this.register(filename, this.namespace(filename.replace(pattern, '')));
            }
        });
        const packedGeneratorRegisterPromises = packedGeneratorModules.map(async (pattern) => {
            for (const filename of await globby_1.default('*/index.js', {
                cwd: pattern,
                absolute: true,
                deep: 1,
            })) {
                /* tslint:disable-next-line:no-string-literal */
                this['_tryRegistering'](filename);
            }
        });
        await Promise.all([
            ...localGeneratorRegisterPromises,
            ...packedGeneratorRegisterPromises,
        ]);
    }
    async findLocalGenerators() {
        const pkgFilePath = await find_up_1.default('package.json', { cwd: this.cwd });
        if (!pkgFilePath)
            return [];
        let pkgFileContent;
        try {
            pkgFileContent = JSON.parse((await fs_extra_1.default.readFile(pkgFilePath)).toString());
        }
        catch (err) {
            return [];
        }
        const generatorFolder = pkgFileContent['generator-folder'] || 'generators';
        return [path_1.default.resolve(this.cwd, generatorFolder)];
    }
    // rewrite findGeneratorsIn, use async functions instead of sync functions
    async findPackedGenerators() {
        const nestedModules = await Promise.all(this.getNpmPaths()
            .reverse()
            .map(this.searchGeneratorModulesInPath));
        return lodash_1.flatten(nestedModules.filter((s) => s != null));
    }
    async searchGeneratorModulesInPath(root) {
        if (!root)
            return;
        // Some folders might not be readable to the current user. For those, we add a try
        // catch to handle the error gracefully as globby doesn't have an option to skip
        // restricted folders.
        try {
            const modules = await globby_1.default(['generator-*'], {
                cwd: root,
                onlyFiles: false,
                absolute: true,
                deep: 0,
            });
            // To limit recursive lookups into non-namespace folders within globby,
            // fetch all namespaces in root, then search each namespace separately
            // for generator modules
            const namespaces = await globby_1.default(['@*'], {
                cwd: root,
                onlyFiles: false,
                absolute: true,
                deep: 0,
            });
            const namespacedModules = await Promise.all(namespaces.map(namespace => globby_1.default(['generator-*'], {
                cwd: namespace,
                onlyFiles: false,
                absolute: true,
                deep: 0,
            })));
            return modules.concat(lodash_1.flatten(namespacedModules));
        }
        catch (err) {
            debug('Could not access %s (%s)', root, err);
        }
    }
}
exports.PryoEnvironment = PryoEnvironment;
//# sourceMappingURL=PryoEnvironment.js.map