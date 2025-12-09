var del  = require('del');
var gulp = require('gulp');
var lzma = require('../../index');

gulp.task('clean', function(cb) {
  return del('tmp', cb);
});

gulp.task('compress', gulp.series('clean', function() {
  return gulp.src('../files/small.txt')
    .pipe(lzma())
    .pipe(gulp.dest('tmp'));
}));

gulp.task('default', gulp.series('compress'));
