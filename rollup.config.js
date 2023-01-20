import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import summary from 'rollup-plugin-summary';
import pkg from './package.json' assert { type: "json" };
import terser from '@rollup/plugin-terser';

const devMode = process.env.mode !== 'production';

const name = "Neuroevolution";

/**
 * Terser cannot execute on Android Termux
 * 
 * */
const isTerserCanExecute = !(/(com\.termux)/i.test(String(process.env.NODE)));

console.log("Mode: " + process.env.mode);
console.log("Terser can execute: " + isTerserCanExecute);

export default (cli_args) => {
    const output = []
    
    if(cli_args.umd) {
        delete cli_args.umd;
        output.push({
            file: pkg.unpkg,
            format: 'umd',
            sourcemap: devMode,
            name: name
        })
    }
    
    if(cli_args.node) {
        delete cli_args.node;
        output.push({
            file: pkg.main,
            name: name,
            format: 'es',
            sourcemap: devMode
        })
    }
    
    return {
        input: './src/index.ts',
        output: output,
        treeshake: !devMode,
        plugins: [
            !devMode && isTerserCanExecute &&
                terser({
                    format: {
                        comments: false
                    },
                    compress: false
                }),
            typescript(),
            json(),
            commonjs(),
            summary(),
            resolve({
                preferBuiltins: false,
                // browser: true,
                extensions: ['.ts'],
            }),
        ]
    };
}
