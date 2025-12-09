gulp-lzma
=========

LZMA plugin for [gulp](https://github.com/wearefractal/gulp).

This module is essentially a fork of [gulp-gzip][gulp-tzip] by Jeremy Stuckey,
slightly modified to uze LZMA compression rather than gzip, by way of
[lzma-native][lzma-native], and therefore [liblzma][liblzma]. All credit goes
to the authors of those projects.

 # Install

```
npm install --save-dev gulp-lzma
```

# Options

### append `Boolean`

Appends `.xz` file extension if true. Defaults to true.

```javascript
 lzma({ append: true })
```
`filename.txt` becomes `filename.txt.xz`.

### extension `String`

Appends an arbitrary extension to the filename. Disables `append` and `preExtension` options.

```javascript
 lzma({ extension: 'zip' }) // note that the `.` should not be included in the extension
```
`filename.txt` becomes `filename.txt.zip`.

### preExtension `String`

Appends an arbitrary pre-extension to the filename. Disables `append` and `extension` options.

```javascript
 lzma({ preExtension: 'xz' }) // note that the `.` should not be included in the extension
```
`filename.txt` becomes `filename.xz.txt`.

### threshold `String|Number|Boolean`

Minimum size required to compress a file. Defaults to false.

```javascript
lzma({ threshold: '1kb' })
```

```javascript
lzma({ threshold: 1024 })
```

```javascript
lzma({ threshold: true })
```

### lzmaOptions `Object`

Options object to pass through to lzma-native. See [lzma-native documentation][lzma-options] for more information.

```javascript
lzma({ lzmaOptions: { preset: 9 } })
```

```javascript
lzma({ lzmaOptions: { memLevel: 1 } })
```

### deleteMode `String|Function`

Some webserver modules look for `example.html.xz`, serve it if it exists, else the original `example.html` will be served.

For instance, if `example.html` was 2kb, it would be xzipped and `example.html.xz` was created.

However, if later `example.html` is modified to content less than the threshold, gulp-lzma will only bypass it. Hence, you will end up with a new `example.html` yet old `example.html.xz`. Your webserver will continue to serve old content (`example.html.xz`).

Using this option, gulp-lzma will remove `example.html.xz`.

It takes in the same argument as `gulp.dest` as in `gulp.dest('mydest')`, so it knows where to look for the xzipped files. Defaults to `undefined`.

```javascript
lzma({ threshold: 1024, deleteMode: 'mydest' })
```

If you have `cwd` as in `gulp.dest('mydest', { cwd: mycwd })`. You can configure it using `deleteModeCwd`.

```javascript
lzma({ threshold: 1024, deleteMode: 'mydest', deleteModeCwd: mycwd })
```

### skipGrowingFiles `Boolean`

Some files actually get larger after compression. If true, this option passes along the original, uncompressed file if compression increases the file size. Defaults to false.

```javascript
 lzma({ skipGrowingFiles : true })
```

# Examples

```javascript
var gulp = require('gulp');
var lzma = require('gulp-lzma');

gulp.task('compress', function() {
    gulp.src('./dev/scripts/*.js')
	.pipe(lzma())
	.pipe(gulp.dest('./public/scripts'));
});
```

```javascript
var gulp = require('gulp');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var lzma = require('gulp-lzma');

gulp.task('deployScripts', function() {
	gulp.src('./dev/scripts/*.coffee')
	.pipe(coffee())
	.pipe(concat('all.js'))
	.pipe(uglify())
	.pipe(lzma())
	.pipe(gulp.dest('./public/scripts'));
});
```

```javascript
var gulp = require('gulp');
var tar = require('gulp-tar');
var lzma = require('gulp-lzma');

gulp.task('tarball', function() {
	gulp.src('./files/*')
	.pipe(tar('archive.tar'))
	.pipe(lzma())
	.pipe(gulp.dest('.'));
});
```

[More examples](https://github.com/kmaglione/gulp-lzma/tree/master/examples).


  [gulp-gzip]: https://github.com/jstuckey/gulp-gzip
  [liblzma]: https://github.com/kobolabs/liblzma
  [lzma-native]: https://github.com/addaleax/lzma-native
  [lzma-options]: https://github.com/addaleax/lzma-native#api-options
