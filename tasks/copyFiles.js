const { src, dest } = require('gulp');
const vinylPaths = require('vinyl-paths');
const del = require('del');

const files = [
  'src/**/*.*',
  '!src/**/images/**/*.*',
  '!src/**/components/**/*.*',
  '!src/**/styles/**/*.*',
  '!src/views/*/index.js',
  '!src/main.js',
  'package.json',
  'config/**/*.*'
];

function copyFiles() {
  return src(files)
  .pipe(dest('./dev-build/'))
}

exports.copyFiles = copyFiles;