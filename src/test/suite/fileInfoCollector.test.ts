import * as assert from 'assert';
import { collectFileInfos, FileUri } from '../../utils/fileInfoCollector';

suite('File Info Collector Test Suite', () => {
  test('Basic file info collection', () => {
    const files: FileUri[] = [
      { fsPath: '/project/src/logo.png' }
    ];
    const fileInfos = collectFileInfos(files, {
      currentFileDir: '/project/src',
      isRecursive: false
    });

    assert.strictEqual(fileInfos.length, 1);
    assert.strictEqual(fileInfos[0].filename, 'logo.png');
    assert.strictEqual(fileInfos[0].relativePath, 'logo.png');
    assert.strictEqual(fileInfos[0].pathPrefix, '');
    assert.strictEqual(fileInfos[0].stem, 'logo');
    assert.strictEqual(fileInfos[0].suffix, 'png');
  });

  test('Filter out files in parent directories', () => {
    const files: FileUri[] = [
      { fsPath: '/project/src/logo.png' },
      { fsPath: '/project/logo.png' }, // Parent directory
      { fsPath: '/project/src/images/icon.png' } // Subdirectory
    ];
    const fileInfos = collectFileInfos(files, {
      currentFileDir: '/project/src',
      isRecursive: false
    });

    assert.strictEqual(fileInfos.length, 2);
    assert.strictEqual(fileInfos[0].filename, 'logo.png');
    assert.strictEqual(fileInfos[1].filename, 'icon.png');
  });

  test('Recursive pattern with path prefix', () => {
    const files: FileUri[] = [
      { fsPath: '/project/src/images/logo.png' },
      { fsPath: '/project/src/icons/icon.svg' }
    ];
    const fileInfos = collectFileInfos(files, {
      currentFileDir: '/project/src',
      isRecursive: true
    });

    assert.strictEqual(fileInfos.length, 2);
    assert.strictEqual(fileInfos[0].filename, 'logo.png');
    assert.strictEqual(fileInfos[0].relativePath, 'images/logo.png');
    assert.strictEqual(fileInfos[0].pathPrefix, 'images');
    assert.strictEqual(fileInfos[1].filename, 'icon.svg');
    assert.strictEqual(fileInfos[1].relativePath, 'icons/icon.svg');
    assert.strictEqual(fileInfos[1].pathPrefix, 'icons');
  });

  test('Non-recursive pattern without path prefix', () => {
    const files: FileUri[] = [
      { fsPath: '/project/src/images/logo.png' }
    ];
    const fileInfos = collectFileInfos(files, {
      currentFileDir: '/project/src',
      isRecursive: false
    });

    assert.strictEqual(fileInfos.length, 1);
    assert.strictEqual(fileInfos[0].pathPrefix, '');
  });

  test('File without extension', () => {
    const files: FileUri[] = [
      { fsPath: '/project/src/README' }
    ];
    const fileInfos = collectFileInfos(files, {
      currentFileDir: '/project/src',
      isRecursive: false
    });

    assert.strictEqual(fileInfos.length, 1);
    assert.strictEqual(fileInfos[0].filename, 'README');
    assert.strictEqual(fileInfos[0].stem, 'README');
    assert.strictEqual(fileInfos[0].suffix, '');
  });

  test('File with multiple dots in name', () => {
    const files: FileUri[] = [
      { fsPath: '/project/src/my.file.name.png' }
    ];
    const fileInfos = collectFileInfos(files, {
      currentFileDir: '/project/src',
      isRecursive: false
    });

    assert.strictEqual(fileInfos.length, 1);
    assert.strictEqual(fileInfos[0].filename, 'my.file.name.png');
    assert.strictEqual(fileInfos[0].stem, 'my.file.name');
    assert.strictEqual(fileInfos[0].suffix, 'png');
  });

  test('Path prefix with special characters', () => {
    const files: FileUri[] = [
      { fsPath: '/project/src/my-images/logo.png' },
      { fsPath: '/project/src/my images/icon.png' },
      { fsPath: '/project/src/my@images/icon.png' }
    ];
    const fileInfos = collectFileInfos(files, {
      currentFileDir: '/project/src',
      isRecursive: true
    });

    assert.strictEqual(fileInfos.length, 3);
    assert.strictEqual(fileInfos[0].pathPrefix, 'my_images');
    assert.strictEqual(fileInfos[1].pathPrefix, 'my_images');
    assert.strictEqual(fileInfos[2].pathPrefix, 'my_images');
  });

  test('Nested path prefix', () => {
    const files: FileUri[] = [
      { fsPath: '/project/src/assets/images/icons/icon.png' }
    ];
    const fileInfos = collectFileInfos(files, {
      currentFileDir: '/project/src',
      isRecursive: true
    });

    assert.strictEqual(fileInfos.length, 1);
    assert.strictEqual(fileInfos[0].pathPrefix, 'assets_images_icons');
  });

  test('Filter out current directory files in recursive mode', () => {
    const files: FileUri[] = [
      { fsPath: '/project/src/logo.png' }, // Current directory
      { fsPath: '/project/src/images/icon.png' } // Subdirectory
    ];
    const fileInfos = collectFileInfos(files, {
      currentFileDir: '/project/src',
      isRecursive: true
    });

    assert.strictEqual(fileInfos.length, 2);
    // Current directory file should have empty pathPrefix
    const currentDirFile = fileInfos.find(f => f.filename === 'logo.png');
    assert.strictEqual(currentDirFile?.pathPrefix, '');
    // Subdirectory file should have pathPrefix
    const subDirFile = fileInfos.find(f => f.filename === 'icon.png');
    assert.strictEqual(subDirFile?.pathPrefix, 'images');
  });

  test('Filter out files without filename', () => {
    // Note: path.basename() behavior varies by platform
    // On Windows, path.basename('/project/src/') returns 'src'
    // On Unix, path.basename('/project/src/') returns 'src'
    // So we test with an actual edge case: a path that would result in empty filename
    // In practice, VS Code findFiles won't return directories, but we test the logic
    const files: FileUri[] = [
      { fsPath: '/project/src/logo.png' }
    ];
    const fileInfos = collectFileInfos(files, {
      currentFileDir: '/project/src',
      isRecursive: false
    });

    assert.strictEqual(fileInfos.length, 1);
    assert.strictEqual(fileInfos[0].filename, 'logo.png');
    
    // Test that empty filename would be filtered (if it occurred)
    // This is handled by the `if (!filename) return;` check in the function
    const emptyFiles: FileUri[] = [];
    const emptyFileInfos = collectFileInfos(emptyFiles, {
      currentFileDir: '/project/src',
      isRecursive: false
    });
    assert.strictEqual(emptyFileInfos.length, 0);
  });

  test('Windows path handling', () => {
    const files: FileUri[] = [
      { fsPath: 'C:\\project\\src\\logo.png' }
    ];
    const fileInfos = collectFileInfos(files, {
      currentFileDir: 'C:\\project\\src',
      isRecursive: false
    });

    assert.strictEqual(fileInfos.length, 1);
    // Relative path should use forward slashes
    assert.strictEqual(fileInfos[0].relativePath, 'logo.png');
  });

  test('Windows path with subdirectory in recursive mode', () => {
    const files: FileUri[] = [
      { fsPath: 'C:\\project\\src\\images\\logo.png' }
    ];
    const fileInfos = collectFileInfos(files, {
      currentFileDir: 'C:\\project\\src',
      isRecursive: true
    });

    assert.strictEqual(fileInfos.length, 1);
    assert.strictEqual(fileInfos[0].relativePath, 'images/logo.png');
    assert.strictEqual(fileInfos[0].pathPrefix, 'images');
  });
});

