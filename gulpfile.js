var gulp = require("gulp");
var uglify = require('gulp-uglify-es').default;
var pump = require('pump')

gulp.task('compress', function (cb) {
    pump([
            // gulp.src(['reasy-html-hint-node/common/*.js','reasy-html-hint-node/libs/*.js','reasy-html-hint-node/bin/*.js','reasy-html-hint-node/*.js']),
            gulp.src(["reasy-html-hint-node/!(test|custom-csslint|custom-htmlhint)/*.js", "reasy-html-hint-node/*.js"]),
            uglify(),
            gulp.dest('compressed')
        ]
    );
    pump([
        gulp.src(["reasy-html-hint-node/package.json", "reasy-html-hint-node/README.md", "reasy-html-hint-node/bin"]),
        gulp.dest("compressed")
    ]);
    pump([
        gulp.src(["reasy-html-hint-node/bin/r-check"]),
        gulp.dest("compressed/bin")
    ]);
    pump([
        gulp.src(["reasy-html-hint-node/custom-csslint/**/*.js"]),
        uglify(),
        gulp.dest("compressed/custom-csslint")
    ]);
    pump([
        gulp.src(["reasy-html-hint-node/custom-htmlhint/**/*.js"]),
        uglify(),
        gulp.dest("compressed/custom-htmlhint")
    ], cb);
});