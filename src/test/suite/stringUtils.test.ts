import * as assert from 'assert';
import { normalizeIdentifier, isValidIdentifier } from '../../utils/stringUtils';

suite('String Utils Test Suite', () => {
  suite('normalizeIdentifier', () => {
    test('Should replace spaces with underscores', () => {
      assert.strictEqual(normalizeIdentifier('my file'), 'my_file');
      assert.strictEqual(normalizeIdentifier('my  file'), 'my__file');
    });

    test('Should replace hyphens with underscores', () => {
      assert.strictEqual(normalizeIdentifier('my-file'), 'my_file');
      assert.strictEqual(normalizeIdentifier('my-file-name'), 'my_file_name');
    });

    test('Should replace dots with underscores', () => {
      assert.strictEqual(normalizeIdentifier('my.file'), 'my_file');
      assert.strictEqual(normalizeIdentifier('my.file.name'), 'my_file_name');
    });

    test('Should replace @ symbols with underscores', () => {
      assert.strictEqual(normalizeIdentifier('my@file'), 'my_file');
      assert.strictEqual(normalizeIdentifier('@myfile'), '_myfile');
    });

    test('Should replace path separators with underscores', () => {
      assert.strictEqual(normalizeIdentifier('path/to/file'), 'path_to_file');
      assert.strictEqual(normalizeIdentifier('path\\to\\file'), 'path_to_file');
    });

    test('Should handle multiple special characters', () => {
      assert.strictEqual(normalizeIdentifier('my-file.name@test'), 'my_file_name_test');
      assert.strictEqual(normalizeIdentifier('path/to my-file.name'), 'path_to_my_file_name');
    });

    test('Should handle empty string', () => {
      assert.strictEqual(normalizeIdentifier(''), '_');
    });

    test('Should handle string with no special characters', () => {
      assert.strictEqual(normalizeIdentifier('myfile'), 'myfile');
      assert.strictEqual(normalizeIdentifier('myFile123'), 'myFile123');
    });

    test('Should handle string starting with special characters', () => {
      assert.strictEqual(normalizeIdentifier('-myfile'), '_myfile');
      assert.strictEqual(normalizeIdentifier('.myfile'), '_myfile');
      assert.strictEqual(normalizeIdentifier('@myfile'), '_myfile');
      assert.strictEqual(normalizeIdentifier(' myfile'), '_myfile');
    });
  });

  suite('isValidIdentifier', () => {
    test('Should return true for valid identifiers starting with letter', () => {
      assert.strictEqual(isValidIdentifier('myFile'), true);
      assert.strictEqual(isValidIdentifier('MyFile'), true);
      assert.strictEqual(isValidIdentifier('myFile123'), true);
      assert.strictEqual(isValidIdentifier('a'), true);
    });

    test('Should return true for valid identifiers starting with underscore', () => {
      assert.strictEqual(isValidIdentifier('_myFile'), true);
      assert.strictEqual(isValidIdentifier('_123'), true);
      assert.strictEqual(isValidIdentifier('_'), true);
    });

    test('Should return true for valid identifiers starting with dollar sign', () => {
      assert.strictEqual(isValidIdentifier('$myFile'), true);
      assert.strictEqual(isValidIdentifier('$123'), true);
      assert.strictEqual(isValidIdentifier('$'), true);
    });

    test('Should return false for identifiers starting with number', () => {
      assert.strictEqual(isValidIdentifier('123'), false);
      assert.strictEqual(isValidIdentifier('123myFile'), false);
    });

    test('Should return false for identifiers starting with special characters', () => {
      assert.strictEqual(isValidIdentifier('-myFile'), false);
      assert.strictEqual(isValidIdentifier('.myFile'), false);
      assert.strictEqual(isValidIdentifier('@myFile'), false);
      assert.strictEqual(isValidIdentifier(' myFile'), false);
      assert.strictEqual(isValidIdentifier('/myFile'), false);
      assert.strictEqual(isValidIdentifier('\\myFile'), false);
    });

    test('Should return false for empty string', () => {
      assert.strictEqual(isValidIdentifier(''), false);
    });

    test('Should handle normalized identifiers', () => {
      // After normalization, these should be valid
      assert.strictEqual(isValidIdentifier(normalizeIdentifier('my-file')), true);
      assert.strictEqual(isValidIdentifier(normalizeIdentifier('my file')), true);
      
      // After normalization, these should still be invalid (start with number)
      assert.strictEqual(isValidIdentifier(normalizeIdentifier('123-file')), false);
      assert.strictEqual(isValidIdentifier(normalizeIdentifier('123')), false);
    });
  });
});

