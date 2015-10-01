'use strict';

var gulp = tars.packages.gulp;
var gutil = tars.packages.gutil;
var concat = tars.packages.concat;
var sass = tars.packages.sass;
var autoprefixer = tars.packages.autoprefixer;
tars.packages.promisePolyfill.polyfill();
var postcss = tars.packages.postcss;
var replace = tars.packages.replace;
var plumber = tars.packages.plumber;
var notifier = tars.helpers.notifier;
var browserSync = tars.packages.browserSync;

var postcssProcessors = tars.config.postcss;
var scssFolderPath = './markup/' + tars.config.fs.staticFolderName + '/scss';
var scssFilesToConcatinate = [
        scssFolderPath + '/normalize.scss',
        scssFolderPath + '/libraries/**/*.scss',
        scssFolderPath + '/libraries/**/*.css',
        scssFolderPath + '/mixins.scss',
        scssFolderPath + '/sprites-scss/sprite_96.scss'
    ];
var patterns = [];
var processors = [];

if (postcssProcessors && postcssProcessors.length) {
    postcssProcessors.forEach(function (processor) {
        processors.push(require(processor.name)(processor.options));
    });
}

processors.push(autoprefixer({browsers: ['ie 8']}));

if (tars.config.useSVG) {
    scssFilesToConcatinate.push(
        scssFolderPath + '/sprites-scss/svg-fallback-sprite.scss'
    );
}

scssFilesToConcatinate.push(
    scssFolderPath + '/sprites-scss/sprite-ie.scss',
    scssFolderPath + '/fonts.scss',
    scssFolderPath + '/vars.scss',
    scssFolderPath + '/GUI.scss',
    scssFolderPath + '/common.scss',
    scssFolderPath + '/plugins/**/*.scss',
    scssFolderPath + '/plugins/**/*.css',
    './markup/modules/*/*.scss',
    './markup/modules/*/ie/ie8.scss',
    scssFolderPath + '/etc/**/*.scss',
    '!./**/_*.scss',
    '!./**/_*.css'
);

patterns.push(
    {
        match: '%=staticPrefixForCss=%',
        replacement: tars.config.staticPrefixForCss()
    }
);

/**
 * Scss compilation for IE8
 */
module.exports = function () {
    return gulp.task('css:compile-css-for-ie8', function (cb) {
        if (tars.flags.ie8 || tars.flags.ie) {
            return gulp.src(scssFilesToConcatinate, { base: process.cwd() })
                .pipe(plumber({
                    errorHandler: function (error) {
                        notifier.error('An error occurred while compiling css for IE8.', error);
                        this.emit('end');
                    }
                }))
                .pipe(replace({
                    patterns: patterns,
                    usePrefix: false
                }))
                .pipe(sass({
                    outputStyle: 'expanded'
                }))
                .pipe(postcss(processors))
                .pipe(concat({cwd: process.cwd(), path: 'main_ie8' + tars.options.build.hash + '.css'}))
                .pipe(gulp.dest('./dev/' + tars.config.fs.staticFolderName + '/css/'))
                .pipe(browserSync.reload({ stream: true }))
                .pipe(
                    notifier.success('Scss-files for IE8 have been compiled')
                );
        } else {
            gutil.log('!Stylies for IE8 are not used!');
            cb(null);
        }
    });
};
