import * as assert from 'assert';
import { generateExportName, buildStemCountMap, FileInfo } from '../../utils/exportNameGenerator';

suite('Export Name Generator Test Suite', () => {
  test('Basic export name generation', () => {
    const info: FileInfo = {
      filename: 'logo.png',
      relativePath: 'logo.png',
      pathPrefix: '',
      stem: 'logo',
      suffix: 'png'
    };
    const stemCount = new Map<string, number>([['logo', 1]]);
    const exportName = generateExportName(info, { isRecursive: false, stemCount });
    assert.strictEqual(exportName, 'logo');
  });

  test('Export name with spaces replaced with underscores', () => {
    const info: FileInfo = {
      filename: 'my image.png',
      relativePath: 'my image.png',
      pathPrefix: '',
      stem: 'my image',
      suffix: 'png'
    };
    const stemCount = new Map<string, number>([['my image', 1]]);
    const exportName = generateExportName(info, { isRecursive: false, stemCount });
    assert.strictEqual(exportName, 'my_image');
  });

  test('Export name with hyphens replaced with underscores', () => {
    const info: FileInfo = {
      filename: 'my-image.png',
      relativePath: 'my-image.png',
      pathPrefix: '',
      stem: 'my-image',
      suffix: 'png'
    };
    const stemCount = new Map<string, number>([['my-image', 1]]);
    const exportName = generateExportName(info, { isRecursive: false, stemCount });
    assert.strictEqual(exportName, 'my_image');
  });

  test('Export name starting with number uses underscore prefix and double underscore suffix', () => {
    const info: FileInfo = {
      filename: '123.png',
      relativePath: '123.png',
      pathPrefix: '',
      stem: '123',
      suffix: 'png'
    };
    const stemCount = new Map<string, number>([['123', 1]]);
    const exportName = generateExportName(info, { isRecursive: false, stemCount });
    assert.strictEqual(exportName, '_123__png');
  });

  test('Duplicate stem uses double underscore suffix', () => {
    const info1: FileInfo = {
      filename: 'logo.png',
      relativePath: 'logo.png',
      pathPrefix: '',
      stem: 'logo',
      suffix: 'png'
    };
    const info2: FileInfo = {
      filename: 'logo.svg',
      relativePath: 'logo.svg',
      pathPrefix: '',
      stem: 'logo',
      suffix: 'svg'
    };
    const stemCount = buildStemCountMap([info1, info2], false);
    
    const exportName1 = generateExportName(info1, { isRecursive: false, stemCount });
    const exportName2 = generateExportName(info2, { isRecursive: false, stemCount });
    
    assert.strictEqual(exportName1, 'logo__png');
    assert.strictEqual(exportName2, 'logo__svg');
  });

  test('Recursive pattern with path prefix', () => {
    const info: FileInfo = {
      filename: 'logo.png',
      relativePath: 'images/logo.png',
      pathPrefix: 'images',
      stem: 'logo',
      suffix: 'png'
    };
    const stemCount = new Map<string, number>([['images_logo', 1]]);
    const exportName = generateExportName(info, { isRecursive: true, stemCount });
    assert.strictEqual(exportName, 'images_logo');
  });

  test('Recursive pattern with nested path prefix', () => {
    const info: FileInfo = {
      filename: 'icon.svg',
      relativePath: 'assets/images/icons/icon.svg',
      pathPrefix: 'assets_images_icons',
      stem: 'icon',
      suffix: 'svg'
    };
    const stemCount = new Map<string, number>([['assets_images_icons_icon', 1]]);
    const exportName = generateExportName(info, { isRecursive: true, stemCount });
    assert.strictEqual(exportName, 'assets_images_icons_icon');
  });

  test('Recursive pattern with duplicate stem in different paths', () => {
    const info1: FileInfo = {
      filename: 'logo.png',
      relativePath: 'images/logo.png',
      pathPrefix: 'images',
      stem: 'logo',
      suffix: 'png'
    };
    const info2: FileInfo = {
      filename: 'logo.svg',
      relativePath: 'images/logo.svg',
      pathPrefix: 'images',
      stem: 'logo',
      suffix: 'svg'
    };
    const stemCount = buildStemCountMap([info1, info2], true);
    
    const exportName1 = generateExportName(info1, { isRecursive: true, stemCount });
    const exportName2 = generateExportName(info2, { isRecursive: true, stemCount });
    
    assert.strictEqual(exportName1, 'images_logo__png');
    assert.strictEqual(exportName2, 'images_logo__svg');
  });

  test('Recursive pattern with same stem in different directories', () => {
    const info1: FileInfo = {
      filename: 'logo.png',
      relativePath: 'images/logo.png',
      pathPrefix: 'images',
      stem: 'logo',
      suffix: 'png'
    };
    const info2: FileInfo = {
      filename: 'logo.png',
      relativePath: 'icons/logo.png',
      pathPrefix: 'icons',
      stem: 'logo',
      suffix: 'png'
    };
    const stemCount = buildStemCountMap([info1, info2], true);
    
    const exportName1 = generateExportName(info1, { isRecursive: true, stemCount });
    const exportName2 = generateExportName(info2, { isRecursive: true, stemCount });
    
    // Different path prefixes should result in different export names
    assert.strictEqual(exportName1, 'images_logo');
    assert.strictEqual(exportName2, 'icons_logo');
  });

  test('File without extension', () => {
    const info: FileInfo = {
      filename: 'README',
      relativePath: 'README',
      pathPrefix: '',
      stem: 'README',
      suffix: ''
    };
    const stemCount = new Map<string, number>([['README', 1]]);
    const exportName = generateExportName(info, { isRecursive: false, stemCount });
    assert.strictEqual(exportName, 'README');
  });

  test('File with multiple dots in name', () => {
    const info: FileInfo = {
      filename: 'my.file.name.png',
      relativePath: 'my.file.name.png',
      pathPrefix: '',
      stem: 'my.file.name',
      suffix: 'png'
    };
    const stemCount = new Map<string, number>([['my.file.name', 1]]);
    const exportName = generateExportName(info, { isRecursive: false, stemCount });
    assert.strictEqual(exportName, 'my_file_name');
  });

  test('Build stem count map for non-recursive pattern', () => {
    const fileInfos: FileInfo[] = [
      { filename: 'logo.png', relativePath: 'logo.png', pathPrefix: '', stem: 'logo', suffix: 'png' },
      { filename: 'logo.svg', relativePath: 'logo.svg', pathPrefix: '', stem: 'logo', suffix: 'svg' },
      { filename: 'icon.png', relativePath: 'icon.png', pathPrefix: '', stem: 'icon', suffix: 'png' }
    ];
    const stemCount = buildStemCountMap(fileInfos, false);
    
    assert.strictEqual(stemCount.get('logo'), 2);
    assert.strictEqual(stemCount.get('icon'), 1);
  });

  test('Build stem count map for recursive pattern', () => {
    const fileInfos: FileInfo[] = [
      { filename: 'logo.png', relativePath: 'images/logo.png', pathPrefix: 'images', stem: 'logo', suffix: 'png' },
      { filename: 'logo.svg', relativePath: 'images/logo.svg', pathPrefix: 'images', stem: 'logo', suffix: 'svg' },
      { filename: 'logo.png', relativePath: 'icons/logo.png', pathPrefix: 'icons', stem: 'logo', suffix: 'png' }
    ];
    const stemCount = buildStemCountMap(fileInfos, true);
    
    assert.strictEqual(stemCount.get('images_logo'), 2);
    assert.strictEqual(stemCount.get('icons_logo'), 1);
  });
});

