# js-pattern-import

A VS Code extension for batch importing files in a folder with pattern matching and automatic generation of import/export statements. Perfect for batch importing image assets.

## ✨ Features

- 🎯 **Pattern Matching Import**: Support glob patterns (e.g., `*.{png,jpg,jpeg,svg}`) to batch import files
- 🔄 **Recursive Search**: Support recursive patterns (`**/*.png`) to search files in subdirectories
- 🏷️ **Smart Naming**: Automatically generate export names that comply with JavaScript naming conventions
  - Spaces, hyphens, dots, and @ symbols in filenames are replaced with underscores
  - If a filename doesn't start with a letter, an underscore prefix is automatically added with the extension suffix
  - Handle filename conflicts by automatically adding extension suffixes to distinguish them
  - In recursive mode, use path prefixes to distinguish files with the same name in different directories
- 📝 **Auto-generate Code**: Automatically generate import and export statements, sorted alphabetically
- ⚙️ **Configurable**: Support custom default import patterns

## 📦 Installation

### Install from VS Code Marketplace

1. Open VS Code
2. Press `Ctrl+Shift+X` (Mac: `Cmd+Shift+X`) to open the Extensions marketplace
3. Search for "js-pattern-import"
4. Click Install

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/sunfkny/js-pattern-import.git

# Navigate to the directory
cd js-pattern-import

# Install dependencies
npm install

# Compile
npm run compile

# Package the extension
npm run package
```

Then press `F5` in VS Code to run the extension, or use `code --install-extension js-pattern-import-0.0.3.vsix` to install the packaged extension.

## 🚀 Usage

1. In a JavaScript file, right-click in the editor
2. Select the "Js Pattern Import" command
3. Enter the file pattern you want to import (e.g., `*.{png,jpg,jpeg,svg}` or `**/*.png`)
4. The extension will automatically:
   - Search for matching files in the current file's directory (and subdirectories if using recursive patterns)
   - Generate import and export statements
   - Replace selected text if text is selected; otherwise, insert code at the top of the file

### Examples

#### Example 1: Import image files from current directory

**Input pattern**: `*.{png,jpg,jpeg,svg}`

**Generated code**:
```javascript
import logo from "./logo.png";
import icon from "./icon.svg";

export { icon, logo };
```

#### Example 2: Recursively import files from subdirectories

**Input pattern**: `**/*.{png,svg}`

**File structure**:
```
src/
  ├── images/
  │   ├── logo.png
  │   └── icon.svg
  └── icons/
      └── home.svg
```

**Generated code**:
```javascript
import images_icon from "./images/icon.svg";
import images_logo from "./images/logo.png";
import icons_home from "./icons/home.svg";

export { icons_home, images_icon, images_logo };
```

#### Example 3: Handle duplicate filenames

**File structure**:
```
src/
  ├── logo.png
  └── logo.svg
```

**Generated code**:
```javascript
import logo__png from "./logo.png";
import logo__svg from "./logo.svg";

export { logo__png, logo__svg };
```

#### Example 4: Handle special character filenames

**File structure**:
```
src/
  ├── my-image.png
  ├── my image.jpg
  └── 123.png
```

**Generated code**:
```javascript
import _123__png from "./123.png";
import my_image from "./my image.jpg";
import my_image_png from "./my-image.png";

export { _123__png, my_image, my_image_png };
```

## ⚙️ Configuration

You can configure the default import pattern in VS Code settings:

1. Open Settings (`Ctrl+,` or `Cmd+,`)
2. Search for "js.pattern.import.pattern"
3. Set the default pattern, e.g., `*.{png,jpg,jpeg,svg}`

Or configure directly in `settings.json`:

```json
{
  "js.pattern.import.pattern": "*.{png,jpg,jpeg,svg}"
}
```

## 📋 Naming Rules

The extension generates export names according to the following rules:

1. **Character Replacement**: Spaces, hyphens (`-`), dots (`.`), and `@` symbols are replaced with underscores (`_`)
2. **Invalid Identifier Handling**: If a filename doesn't start with a letter, underscore, or dollar sign:
   - Add an underscore prefix
   - Add the extension suffix with double underscore separator (e.g., `_123__png`)
3. **Duplicate Handling**: If multiple files have the same base name, add extension suffixes with double underscore separator (e.g., `logo__png`, `logo__svg`)
4. **Recursive Mode**: In recursive mode, use path prefixes to distinguish files with the same name in different directories (e.g., `images_logo`, `icons_logo`)

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- <https://github.com/sunfkny/js-pattern-import>
- <https://marketplace.visualstudio.com/items?itemName=sunfkny.js-pattern-import>
