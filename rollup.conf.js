import babel from 'rollup-plugin-babel'
import json from 'rollup-plugin-json'

export default {
  entry: './src/index.js',
  dest: 'vue-modal.common.js',
  plugins: [
    json({
      // All JSON files will be parsed by default,
      // but you can also specifically include/exclude files
      exclude: [
        'node_modules/**'
      ],
      // for tree-shaking, properties will be declared as
      // variables, using either `var` or `const`
      preferConst: true, // Default: false
      // specify indentation for the generated default export —
      // defaults to '\t'
      indent: '  '
    }),
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      presets: [
        [
          'es2015',
          {
            modules: false
          }
        ],
        'stage-2'
      ],
      plugins: [
        'external-helpers'
      ]
    })
  ],
  format: 'cjs'
}
