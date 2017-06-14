// // npm install gulp-sass express gulp-sourcemaps gulp-autoprefixer gulp-concat gulp-uglifycss run-sequence gulp-clean gulp-livereload --save-dev
// // dev-server 
// 'use strict';
// const path = require('path')
// const gulp = require('gulp');
// const sass = require('gulp-sass');
// const express = require('express');
// const sourcemaps = require('gulp-sourcemaps');
// const autoprefixer = require('gulp-autoprefixer');
// const concat = require('gulp-concat');
// const uglifycss = require('gulp-uglifycss');
// const runSequence = require('run-sequence');
// const gcmq = require('gulp-group-css-media-queries');

// const clean = require('gulp-clean');
// const livereload = require('gulp-livereload');
// const postcss = require('gulp-postcss');
// var uncss = require('gulp-uncss'); // remove unused css

// // production build
// var minifyHtml = require("gulp-minify-html");
// var ngHtml2Js = require("gulp-ng-html2js");
// var uglify = require('gulp-uglify');
// var ngAnnotate = require('gulp-ng-annotate');
// var htmlreplace = require('gulp-html-replace');
// var bytediff = require('gulp-bytediff');
// var ngmin = require('gulp-ngmin');
// livereload({ start: true })
//     // server to serve in development mode
// gulp.task('serve', function(done) {
//     var express = require('express');
//     var app = express();
//     livereload({ start: true })

//     app.use('/node_modules', express.static(__dirname + '/node_modules'));
//     app.use('/bower_components', express.static(__dirname + '/bower_components'));
//     app.use(express.static(path.join(__dirname, 'public')));
//     app.get('*', function(req, res) {
//         res.sendFile('index.html', { root: __dirname });
//     });
//     app.use(require('connect-livereload')());
//     app.listen(7001, function() {
//         done(runSequence('watch-dev'));
//     });
// });
// gulp.task('clean-dev', function() {
//     return gulp.src([
//         path.join(__dirname, './public/assets/css/style.css'),
//         path.join(__dirname, './public/assets/css/style.css.map')
//     ], { read: false }).pipe(clean({ force: true }))
// })

// gulp.task('sass-dev', function() {
//     console.log('in sassD')
//     return gulp
//         .src('./public/scss/app.scss')
//         .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
//         .pipe(sourcemaps.init()) // create sourcemaps and minify as we intend to copy assets from client to build on as is basis
//         .pipe(autoprefixer({ "remove": false, "browsers": ["last 2 versions"] }))
//         .pipe(concat('style.css'))
//         .pipe(uncss({ // we may use it for development mode only
//             html: ['./index.html', './public/app/templates/**/*.html']
//         }))
//         .pipe(postcss([require('postcss-flexbugs-fixes')]))
//         .pipe(gcmq()) // put alike media queries in a single block : I found the app loading more quickly
//         .pipe(sourcemaps.write('.'))
// dev-server 
'use strict';
const path = require('path')
const gulp = require('gulp');
const sass = require('gulp-sass');
const express = require('express');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const uglifycss = require('gulp-uglifycss');
const runSequence = require('run-sequence');
const gcmq = require('gulp-group-css-media-queries');

const clean = require('gulp-clean');
const livereload = require('gulp-livereload');
const postcss = require('gulp-postcss');
var uncss = require('gulp-uncss'); // remove unused css

// production build
var minifyHtml = require("gulp-minify-html");
var ngHtml2Js = require("gulp-ng-html2js");
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var htmlreplace = require('gulp-html-replace');
var bytediff = require('gulp-bytediff');
var ngmin = require('gulp-ngmin');
var templateCache = require('gulp-angular-templatecache');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');


livereload({ start: true })
    // server to serve in development mode
gulp.task('serve', function(done) {
    var express = require('express');
    var app = express();
    livereload({ start: true })

    app.use('/node_modules', express.static(__dirname + '/node_modules'));
    app.use('/bower_components', express.static(__dirname + '/bower_components'));
    app.use(express.static(path.join(__dirname, 'public')));
    app.get('*', function(req, res) {
        res.sendFile('index.html', { root: __dirname });
    });
    app.use(require('connect-livereload')());
    app.listen(7001, function() {
        done(runSequence('watch-dev'));
    });
});
gulp.task('clean-dev', function() {
    return gulp.src([
        path.join(__dirname, './public/assets/css/style.css'),
        path.join(__dirname, './public/assets/css/style.css.map')
    ], { read: false }).pipe(clean({ force: true }))
})

gulp.task('sass-dev', function() {
    console.log('in sassD')
    return gulp
        .src('./public/scss/app.scss')
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
        .pipe(sourcemaps.init()) // create sourcemaps and minify as we intend to copy assets from client to build on as is basis
        .pipe(autoprefixer({ "remove": false, "browsers": ["last 2 versions"] }))
        .pipe(concat('style.css'))
        .pipe(uncss({ // we may use it for development mode only
            html: ['./index.html', './public/app/templates/**/*.html']
        }))
        .pipe(postcss([require('postcss-flexbugs-fixes')]))
        .pipe(gcmq()) // put alike media queries in a single block : I found the app loading more quickly
        .pipe(sourcemaps.write('.'))
        .pipe(uglifycss({ "maxLineLen": 80, "uglyComments": true }))

    .pipe(gulp.dest(path.join(__dirname, 'public/assets/css')))
        .pipe(livereload());

});


gulp.task('js-html-watch', function() {
    gulp.src(['index.html', 'public/**/*.html', 'public/app/**/*.js'])
        .pipe(livereload());
});

gulp.task('watch-dev', function() {
    livereload.listen();

    gulp.watch(path.join(__dirname, 'public/**/*.scss'), function() {
        runSequence('clean-dev', 'sass-dev')
    });
    gulp.watch(['./index.html', './public/**/*.html', './public/app/**/*.js'], function() {

        // runSequence('js-html-watch'); // use this line if uncss is not required;
        runSequence('clean-dev', 'sass-dev', 'js-html-watch'); // use this if un used css-clean is required
    });



});


var Server = require('karma').Server;

/**
 * Run test once and exit
 */
gulp.task('test', function(done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

/**
 * Run test and start watching
 */
gulp.task('tdd', function(done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: false
    }, done).start();
});
// https://www.npmjs.com/package/sprity

var mapTemplatePathToName = {
    'dashboard_layout.html': '../app/templates/dashboard_layout.html',
    'dashboard_header.tpl.html': 'app/templates/dashboard_header.tpl.html',
    'dashboard_content.tpl.html': 'app/templates/dashboard_content.tpl.html',
    'dashboard_footer.tpl.html': 'app/templates/dashboard_footer.tpl.html',
    'album.modal.tpl.html': 'app/templates/album.modal.tpl.html',
    'track.modal.tpl.html': 'app/templates/track.modal.tpl.html'
};

var build = {
    bundle: [
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/angular/angular.min.js',
        'node_modules/angular-animate/angular-animate.min.js',
        'node_modules/angular-ui-router/release/angular-ui-router.min.js',
        'public/assets/vendor/nanoScroll.js'

    ],
    app: [

        'public/app/modules/redux.module.js',
        'public/app/app.js',
        'public/app/templates/templates.js',
        'public/app/controllers/app.controller.js',
        'public/app/controllers/dashboard.controller.js',
        'public/app/directives/delete-landing-page.directive.js',
        'public/app/services/store.service.js',
        'public/app/services/spotify.service.js'

    ]
}
var time = new Date().getTime();

function nameIt(name) {
    return name + '.' + time + '.min.js'
}

gulp.task('template', function() {
    return gulp.src('public/app/templates/*.html')
        .pipe(templateCache({
            transformUrl: function(url) {
                var temp = url.split('/').pop();
                if (temp in mapTemplatePathToName) {
                    return mapTemplatePathToName[temp];
                }
            },
            module: 'dashboard'

        }))
        .pipe(gulp.dest('public/app/templates'));
});

gulp.task('tempCache', function(done) { // either use template or tempCache
    return gulp.src("public/app/templates/**/*.html")
        .pipe(minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe(ngHtml2Js({
            declareModule: true,
            rename: function(url) {
                var temp = url.split('/').pop();
                if (temp in mapTemplatePathToName) {
                    return mapTemplatePathToName[temp];
                }
            },
            moduleName: 'dashboard'
        }))
        .pipe(sourcemaps.init())
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(concat('templates.js'))
        .pipe(gulp.dest("public/app/templates"));

});



gulp.task('bundle', function() {
    return gulp.src(build.bundle)
        .pipe(concat(nameIt('bundle')))
        .pipe(gulp.dest('doc/js'))
})
gulp.task('app', function(done) {

    return gulp.src(build.app)
        .pipe(plumber())
        .pipe(sourcemaps.init( /*{ largeFile: true }*/ ))
        .pipe(concat(nameIt('app'), { newLine: ';' }))
        .pipe(ngAnnotate({}))
        .pipe(bytediff.start())
        .pipe(uglify())
        .pipe(bytediff.stop())
        .pipe(sourcemaps.write('./'))
        .pipe(plumber.stop())
        .pipe(gulp.dest('doc/js'));

});

gulp.task('sass', function() {
    console.log('in sassD')
    return gulp
        .src('./public/scss/app.scss')
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
        .pipe(sourcemaps.init()) // create sourcemaps and minify as we intend to copy assets from client to build on as is basis
        .pipe(autoprefixer({ "remove": false, "browsers": ["last 2 versions"] }))
        .pipe(concat('style.css'))
        .pipe(uncss({ // we may use it for development mode only
            html: ['./index.html', './public/app/templates/**/*.html']
        }))
        .pipe(postcss([require('postcss-flexbugs-fixes')]))
        .pipe(gcmq()) // put alike media queries in a single block : I found the app loading more quickly
        .pipe(sourcemaps.write('.'))
        .pipe(uglifycss({ "maxLineLen": 80, "uglyComments": true }))
        .pipe(gulp.dest(path.join(__dirname, 'public/assets/css')))


});
gulp.task('clean-prebuild', function() {
    return gulp.src([
        'public/assets/css/style.css',
        'public/assets/css/style.css.map',
        'public/app/templates/template.js',
        'doc'


    ], { read: false }).pipe(clean({ force: true }))
});
gulp.task('copy', function() {
    return gulp.src(['!public/assets/vendor/*.*', 'public/assets/**/*.*'])
        .pipe(gulp.dest('doc/assets'))
});
gulp.task('clean-postbuild', function() {
    return gulp.src([
        '.tmp'
    ], { read: false }).pipe(clean({ force: true }))
});


gulp.task('build-html', function(done) {
    return gulp.src('public/app/index.html')
        .pipe(htmlreplace({
            'css': ['assets/css/style.css', 'assets/css/nano.css'],
            'js': ['js/' + nameIt('bundle'), 'js/' + nameIt('app')]

        }))
        .pipe(gulp.dest('doc'));

});

// gulp.task('_build', function() {
//     return gulp.src(build.build)
//         .pipe(plumber())
//         .pipe(concat('bundle.js', { newLine: ';' }))
//         .pipe(ngAnnotate({ add: true }))
//         .pipe(plumber.stop())
//         .pipe(gulp.dest('.tmp/'));
// });




// gulp.task('build-dep', ['_build'], function() {
//     return gulp.src('.tmp/bundle.js')
//         .pipe(plumber())
//         .pipe(bytediff.start())
//         .pipe(uglify({ mangle: true }))
//         .pipe(bytediff.stop())
//         .pipe(rename(nameIt('bundle')))
//         .pipe(plumber.stop())
//         .pipe(gulp.dest('doc/js'));
// });

gulp.task('prod', function() {
    runSequence('clean-prebuild', 'sass', 'copy', 'template', 'app', 'bundle', 'build-html')
});

gulp.task('default', function() {
    runSequence('clean-dev', 'sass-dev', 'serve')
});