import YoEnvironment, { Adapter } from 'yeoman-environment';
export declare class PryoEnvironment<O extends YoEnvironment.Options = YoEnvironment.Options> extends YoEnvironment<O> {
    static createEnv<O extends YoEnvironment.Options = YoEnvironment.Options>(args?: string | string[], opts?: O, adapter?: Adapter): PryoEnvironment<O>;
    getNpmPaths(): string[];
    lookup(cb?: (err: Error | null) => void): void;
    private asyncLookup;
    private findLocalGenerators;
    private findPackedGenerators;
    private searchGeneratorModulesInPath;
}
//# sourceMappingURL=PryoEnvironment.d.ts.map