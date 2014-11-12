var gulp = require('gulp');
var spritesmith = require('gulp.spritesmith');
var gulpif = require('gulp-if');
var notify = require('gulp-notify');
var gutil = require('gulp-util');
var projectConfig = require('../../projectConfig');
var notifyConfig = projectConfig.notifyConfig;
var modifyDate = require('../helpers/modifyDateFormatter');
var browserSync = require('browser-sync');

/**
 * Make sprite and scss for this sprite
 * Return pipe with scss for sprite
 * @param  {object} buildOptions
 */
module.exports = function(buildOptions) {

    return gulp.task('make-fallback-for-svg', function(cb) {

        if (projectConfig.useSVG && projectConfig.useIE8Stylies) {
            var spriteData = '';

            spriteData = gulp.src('./dev/' + projectConfig.fs.staticFolderName + '/' + projectConfig.fs.imagesFolderName + '/rasterSvgImages/*.png')
                .pipe(
                    spritesmith(
                        {
                            imgName: 'svg-fallback-sprite.png',
                            cssName: 'svg-fallback-sprite.scss',
                            Algorithms: 'diagonal',
                            engineOpts: {
                                imagemagick: true
                            },
                            cssTemplate: './markup/' + projectConfig.fs.staticFolderName + '/scss/spriteGeneratorTemplates/scss.svgFallbackSprite.mustache'
                        }
                    )
                )
                .on('error', notify.onError(function (error) {
                    return '\nAn error occurred while making fallback for svg.\nLook in the console for details.\n' + error;
                }));

            spriteData.img.pipe(gulp.dest('./dev/' + projectConfig.fs.staticFolderName + '/' + projectConfig.fs.imagesFolderName + '/rasterSvgSprite/'))
                .pipe(
                    gulpif(notifyConfig.useNotify,
                        notify({
                            onLast: true,
                            sound: notifyConfig.sounds.onSuccess,
                            title: notifyConfig.title,
                            message: 'Sprite img for svg is ready. \n'+ notifyConfig.taskFinishedText +'<%= options.date %>',
                            templateOptions: {
                                date: modifyDate.getTimeOfModify()
                            }
                        })
                    )
                );

            return spriteData.css.pipe(gulp.dest('./markup/' + projectConfig.fs.staticFolderName + '/scss/spritesScss/'))
                    .pipe(browserSync.reload({stream:true}))
                    .pipe(
                        gulpif(notifyConfig.useNotify,
                            notify({
                                onLast: true,
                                sound: notifyConfig.sounds.onSuccess,
                                title: notifyConfig.title,
                                message: 'Scss for svg-sprite is ready. \n'+ notifyConfig.taskFinishedText +'<%= options.date %>',
                                templateOptions: {
                                    date: modifyDate.getTimeOfModify()
                                }
                            })
                        )
                    );
        } else {
            gutil.log('!SVG is not used!');
            cb(null);
        }
    });
};