# Change Log

## v0.0.3
- Fix filename conflict issue: when multiple files have the same stem (e.g., `logo.png` and `logo.svg`), automatically use extension prefix (generates `png_logo` and `svg_logo`)
- Support recursive pattern `**/*.{png,jpg,jpeg,svg}` with path prefix in export names
- Refactor code: extract logic to separate module for better maintainability
- Add comprehensive unit test coverage

## v0.0.2
- Replace `-` and `@` in name

## v0.0.1
- Initial release
