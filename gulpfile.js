const devStart = require('./tasks/devStart.js');
const packageFiles = require('./tasks/packageFiles.js');
const eslint = require('gulp-eslint');
const { watch, src } = require('gulp');


function devStartTask(cb) {
  watch(['src/**/*.*', '!src/**/*.bundle.js', '!src/**/static/media/**/*.*'], { ignoreInitial: false }, function(cb) {
    devStart();
    cb();
  });
};

function packageTask(cb) {
  packageFiles()
  cb()
}

function eslintTask() {
    return src(['src/**/*.js'])
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());
};


exports.packageTask = packageTask
exports.eslintTask = eslintTask
exports.devStartTask = devStartTask