var fs     = require('fs');
var gulp   = require('gulp');
var log    = require('fancy-log');
var lzma   = require('../');
var nid    = require('nid');
var rename = require('gulp-rename');
var expect = require('chai').expect;
var Stream = require('stream');
var tap    = require('gulp-tap');
var lzmaNative = require('lzma-native');

// monkeys are fixing cwd for gulp-mocha
// node lives in one process/scope/directory
process.chdir('./test');

describe('gulp-lzma', function() {

  describe('config', function() {

    it('should have default config', function(done) {
      var instance = lzma();
      expect(instance.config).to.deep.equal({
        append: true,
        lzmaOptions: {},
        skipGrowingFiles: false,
        threshold:  false
      });
      done();
    });

    it('should merge options with defaults', function(done) {
      var instance = lzma({ append: false });
      expect(instance.config).to.deep.equal({
        append: false,
        lzmaOptions: {},
        skipGrowingFiles: false,
        threshold:  false
      });
      done();
    });
  });

  describe('file extension', function() {

    it('should append .xz to the file extension, by default', function(done) {
      gulp.src('files/small.txt')
        .pipe(lzma())
        .pipe(tap(function(file) {
          expect(file.path).to.match(/\.xz$/);
          done();
        }));
    });

    it('should not append .xz to the file extension receiving { append: false }', function(done) {
      gulp.src('files/small.txt')
        .pipe(lzma({ append: false }))
        .pipe(tap(function(file) {
          expect(file.path).to.not.match(/\.xz$/);
          done();
        }));
    });

    it('should accept an arbitrary extension with the `extension` option', function(done) {
        gulp.src('files/small.txt')
          .pipe(lzma({ extension: 'zip' }))
          .pipe(tap(function(file) {
            expect(file.path).to.match(/\.zip$/);
            done();
          }));
    });

    it('should accept an arbitrary pre-extension with the `preExtension` option', function(done) {
        gulp.src('files/small.txt')
          .pipe(lzma({ preExtension: 'xz' }))
          .pipe(tap(function(file) {
            expect(file.path).to.match(/\.xz\.txt$/);
            done();
          }));
    });
  });

  describe('file type', function() {

    it('should return file contents as a Buffer', function(done) {
      gulp.src('files/small.txt')
        .pipe(lzma())
        .pipe(tap(function(file) {
          expect(file.contents).to.be.an.instanceof(Buffer);
          done();
        }));
    });

    it('should return file contents as a Stream', function(done) {
      gulp.src('files/small.txt', { buffer: false })
        .pipe(lzma())
        .pipe(tap(function(file) {
          expect(file.contents).to.be.an.instanceof(Stream);
          done();
        }));
    });
  });

  describe('file properties', function() {
    it('should not lose any properties from the Vinyl file', function(done) {
      gulp.src('files/small.txt')
        .pipe(tap(function(file) {
          file.test = 'test';
        }))
        .pipe(lzma())
        .pipe(tap(function(file) {
          expect(file).to.have.property('test', 'test');
          done();
        }));
    });

    it('should set `contentEncoding`', function(done) {
      gulp.src('files/small.txt')
        .pipe(lzma())
        .pipe(tap(function(file) {
          expect(file).to.have.property('contentEncoding');
          expect(file.contentEncoding).to.have.include('lzma');
          done();
        }));
    });
  });

  describe('lzma options', function() {

    it('should set lzmaOptions object', function(done) {
      var instance = lzma({ lzmaOptions: { preset: 9, memLevel: 1} });
      expect(instance.config).to.have.property('lzmaOptions');
      expect(instance.config.lzmaOptions).to.have.property('preset', 9);
      expect(instance.config.lzmaOptions).to.have.property('memLevel', 1);
      done();
    });

    it('should handle compression level in buffer mode', function(done) {
      var id_lowest_compression = nid();
      var id_highest_compression = nid();

      var out_lowest_compression = gulp.dest('tmp');
      var out_highest_compression = gulp.dest('tmp');

      var size_lowest_compression = 0;
      var size_highest_compression = 0;

      out_lowest_compression.on('end', function() {
        fs.stat('./tmp/' + id_lowest_compression + '.txt.xz', function (err, stats) {
          size_lowest_compression = stats.size;

          if (size_highest_compression > 0) {
            expect(size_highest_compression).to.be.lessThan(size_lowest_compression);
            done();
          }
        });
      });

      out_highest_compression.on('end', function() {
        fs.stat('./tmp/' + id_highest_compression + '.txt.xz', function (err, stats) {
          size_highest_compression = stats.size;

          if (size_lowest_compression > 0) {
            expect(size_highest_compression).to.be.lessThan(size_lowest_compression);
            done();
          }
        });
      });

      gulp.src('files/big.txt')
        .pipe(rename({ basename: id_lowest_compression }))
        .pipe(lzma({ lzmaOptions: { preset: 1 } }))
        .pipe(out_lowest_compression);

      gulp.src('files/big.txt')
        .pipe(rename({ basename: id_highest_compression }))
        .pipe(lzma({ lzmaOptions: { preset: 9 } }))
        .pipe(out_highest_compression);
    });

    it('should handle compression level in stream mode', function(done) {
      var id_lowest_compression = nid();
      var id_highest_compression = nid();

      var out_lowest_compression = gulp.dest('tmp');
      var out_highest_compression = gulp.dest('tmp');

      var size_lowest_compression = 0;
      var size_highest_compression = 0;

      out_lowest_compression.on('end', function() {
        fs.stat('./tmp/' + id_lowest_compression + '.txt.xz', function (err, stats) {
          size_lowest_compression = stats.size;

          if (size_highest_compression > 0) {
            expect(size_highest_compression).to.be.lessThan(size_lowest_compression);
            done();
          }
        });
      });

      out_highest_compression.on('end', function() {
        fs.stat('./tmp/' + id_highest_compression + '.txt.xz', function (err, stats) {
          size_highest_compression = stats.size;

          if (size_lowest_compression > 0) {
            expect(size_highest_compression).to.be.lessThan(size_lowest_compression);
            done();
          }
        });
      });

      gulp.src('files/big.txt', { buffer: false })
        .pipe(rename({ basename: id_lowest_compression }))
        .pipe(lzma({ lzmaOptions: { preset: 1 } }))
        .pipe(out_lowest_compression);

      gulp.src('files/big.txt', { buffer: false })
        .pipe(rename({ basename: id_highest_compression }))
        .pipe(lzma({ lzmaOptions: { preset: 9 } }))
        .pipe(out_highest_compression);
    });
  });

  describe('threshold option', function() {

    it('should set threshold to false while receiving false', function(done) {
      var instance = lzma({ threshold: false });
      expect(instance.config.threshold).to.be.false;
      done();
    });

    it('should set threshold to 150 while receiving true', function(done) {
      var instance = lzma({ threshold: true });
      expect(instance.config.threshold).to.equal(150);
      done();
    });

    it('should set threshold to Number while receiving Number', function(done) {
      var instance = lzma({ threshold: 1024 });
      expect(instance.config).to.have.property('threshold', 1024);
      done();
    });

    it('should set threshold to 150 while receiving Number < 150', function(done) {
      var instance = lzma({ threshold: 100 });
      expect(instance.config).to.have.property('threshold', 150);
      done();
    });

    it('should set threshold to Number while receiving String (bytes result)', function(done) {
      var instance = lzma({ threshold: '1kb' });
      expect(instance.config).to.have.property('threshold', 1024);
      done();
    });

    it('should set threshold to 150 while receiving String (bytes result < 150)', function(done) {
      var instance = lzma({ threshold: '1kb' });
      expect(instance.config).to.have.property('threshold', 1024);
      done();
    });

    it('should handle threshold of 1kb by passing through small.txt (<1kb)', function(done) {
      var id = nid();
      var out = gulp.dest('tmp');

      out.on('end', function() {
        fs.readFile('./tmp/' + id + '.txt', { encoding: 'utf-8' }, function(err, file) {
          fs.readFile('./files/small.txt', { encoding: 'utf-8' }, function(err, original) {
            expect(file).to.equal(original);
            done();
          });
        });
      });

      gulp.src('files/small.txt')
        .pipe(rename({ basename: id }))
        .pipe(lzma({ threshold: '1kb' }))
        .pipe(out);
    });

    it('should handle threshold of 1kb by compressing big.txt (>1kb)', function(done) {
      var id = nid();
      var out = gulp.dest('tmp');

      out.on('end', function() {
        fs.readFile('./tmp/' + id + '.txt.xz', function(err, file) {
          lzmaNative.decompress(file, function(buffer) {
            file = buffer.toString('utf-8');

            fs.readFile('./files/big.txt', { encoding: 'utf-8' }, function(err, original) {
              expect(file).to.equal(original);
              done();
            });
          });
        });
      });

      gulp.src('files/big.txt')
        .pipe(rename({ basename: id }))
        .pipe(lzma({ threshold: '1kb' }))
        .pipe(out);
    });

    it('should handle threshold of 1kb by passing through small.txt (<1kb)', function(done) {
      var id = nid();
      var out = gulp.dest('tmp');

      out.on('end', function() {
        fs.readFile('./tmp/' + id + '.txt', { encoding: 'utf-8' }, function(err, file) {
          fs.readFile('./files/small.txt', { encoding: 'utf-8' }, function(err, original) {
            expect(file).to.equal(original);
            done();
          });
        });
      });

      gulp.src('files/small.txt', { buffer: false })
        .pipe(rename({ basename: id }))
        .pipe(lzma({ threshold: '1kb' }))
        .pipe(out);
    });

    it('should handle threshold of 1kb by compressing big.txt (>1kb)', function(done) {
      var id = nid();
      var out = gulp.dest('tmp');

      out.on('end', function() {
        fs.readFile('./tmp/' + id + '.txt.xz', function(err, file) {
          lzmaNative.decompress(file, function(buffer) {
            file = buffer.toString('utf-8');

            fs.readFile('./files/big.txt', { encoding: 'utf-8' }, function(err, original) {
              expect(file).to.equal(original);
              done();
            });
          });
        });
      });

      gulp.src('files/big.txt', { buffer: false })
        .pipe(rename({ basename: id }))
        .pipe(lzma({ threshold: '1kb' }))
        .pipe(out);
    });
  });

  describe('delete mode', function() {

    it('should not delete existing xzed files when { deleteMode : false }', function(done) {
      var id = nid();
      var out = gulp.dest('tmp');

      out.on('end', function() {
        fs.readFile('./tmp/' + id + '.txt.xz', function(err, file) {
          expect(err).to.not.exist;
          expect(file).to.exist;
          expect(file).to.not.be.empty;

          var out = gulp.dest('tmp');
          out.on('end', function() {
            fs.readFile('./tmp/' + id + '.txt.xz', function(err, file) {
              expect(err).to.not.exist;
              expect(file).to.exist;
              expect(file).to.not.be.empty;
              done();
            });
          });

          gulp.src('files/small.txt')
            .pipe(rename({ basename: id }))
            .pipe(lzma({ threshold: 1024 }))
            .pipe(out);
        });
      });

      gulp.src('files/big.txt')
        .pipe(rename({ basename: id }))
        .pipe(lzma({ threshold: 1024 }))
        .pipe(out);
    });

    it('should delete existing xzed files if the files changed from big.txt (over threshold) to small.txt (under threshold) when { deleteMode : true }', function(done) {
      var id = nid();
      var out = gulp.dest('tmp');

      out.on('end', function() {
        fs.readFile('./tmp/' + id + '.txt.xz', function(err, file) {
          expect(err).to.not.exist;
          expect(file).to.exist;
          expect(file).to.not.be.empty;

          var out = gulp.dest('tmp');

          out.on('end', function() {
            fs.exists('./tmp/' + id + '.txt.xz', function(exists) {
              expect(exists).to.be.false;
              done();
            });
          });

          gulp.src('files/small.txt')
            .pipe(rename({ basename: id }))
            .pipe(lzma({ threshold: 1024, deleteMode: 'tmp' }))
            .pipe(out);
        });
      });

      gulp.src('files/big.txt')
        .pipe(rename({ basename: id }))
        .pipe(lzma({ threshold: 1024, deleteMode: 'tmp' }))
        .pipe(out);
    });
  });

  describe ('uncompress the compressed file', function() {

    it('should match original in buffer mode', function(done) {
      var id = nid();
      var out = gulp.dest('tmp');

      out.on('end', function() {
        fs.readFile('./tmp/' + id + '.txt.xz', function(err, file) {
          lzmaNative.decompress(file, function(buffer) {
            file = buffer.toString('utf-8', 0, buffer.length);

            fs.readFile('./files/small.txt', { encoding: 'utf-8' }, function(err, original) {
              expect(file).to.equal(original);
              done();
            });
          });
        });
      });

      gulp.src('files/small.txt')
        .pipe(rename({ basename: id }))
        .pipe(lzma())
        .pipe(out);
    });

    it('should match original in stream mode', function(done) {
      var id = nid();
      var out = gulp.dest('tmp');

      out.on('end', function() {
        fs.readFile('./tmp/' + id + '.txt.xz', function(err, file) {
          lzmaNative.decompress(file, function(buffer) {
            file = buffer.toString('utf-8', 0, buffer.length);

            fs.readFile('./files/small.txt', { encoding: 'utf-8' }, function(err, original) {
              expect(file).to.equal(original);
              done();
            });
          });
        });
      });

      gulp.src('files/small.txt', { buffer: false })
        .pipe(rename({ basename: id }))
        .pipe(lzma())
        .pipe(out);
    });
  });

  describe('skip files that get larger after compression', function() {
    it('handles buffers', function(done) {
      var originalBuffer;
      gulp.src('files/too_small.txt')
        .pipe(tap(function(file) {
          originalBuffer = file.contents;
        }))
        .pipe(lzma({ skipGrowingFiles: true }))
        .pipe(tap(function(file) {
          expect(file.contents).to.equal(originalBuffer);
          done();
        }));
    });

    it('handles streams', function(done) {
      var originalStream;
      gulp.src('files/too_small.txt', { buffer: false })
        .pipe(tap(function(file) {
          originalStream = file.contents;
        }))
        .pipe(lzma({ skipGrowingFiles: true }))
        .pipe(tap(function(file) {
          expect(file.contents).to.equal(originalStream);
          done();
        }));
    });
  });
});
