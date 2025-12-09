var del  = require('del');
var gulp = require('gulp');
var lzma = require('../../index');

var config = {
  threshold: '1kb'
};

gulp.task('clean', function(cb) {
  return del('tmp', cb);
});

gulp.task('small', function() {
  return gulp.src('../files/small.txt')
    .pipe(lzma(config))
    .pipe(gulp.dest('tmp'));
});

gulp.task('big', function() {
  return gulp.src('../files/big.txt')
    .pipe(lzma(config))
    .pipe(gulp.dest('tmp'));
});

gulp.task('large', function() {
  return gulp.src('../files/large.txt', { buffer: false })
    .pipe(lzma(config))
    .pipe(gulp.dest('tmp'));
});

gulp.task('default', gulp.series('clean', 'small', 'big', 'large'));
