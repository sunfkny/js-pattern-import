// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import { generateExportName, buildStemCountMap } from "./utils/exportNameGenerator";
import { collectFileInfos } from "./utils/fileInfoCollector";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "js-pattern-import" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand("js-pattern-import.main", async () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user

    const activeUri = vscode.window.activeTextEditor?.document.uri;
    if (!activeUri) {
      vscode.window.showErrorMessage("No file is open");
      return;
    }

    const currentFileDir = path.dirname(activeUri.fsPath);

    const pattern = await vscode.window.showInputBox({
      title: `Enter the pattern you want to import at ${vscode.workspace.asRelativePath(currentFileDir, true)}`,
      value: vscode.workspace.getConfiguration().get("js.pattern.import.pattern") || "*.{png,jpg,jpeg,svg}",
    });

    if (!pattern) {
      return;
    }

    // Check if pattern contains ** (recursive pattern)
    const isRecursive = pattern.includes("**");
    // Always use current file directory as search folder, even for recursive patterns
    const searchFolder = currentFileDir;

    const files = await vscode.workspace.findFiles(new vscode.RelativePattern(searchFolder, pattern));

    // First pass: collect all file stems to detect duplicates
    const fileInfos = collectFileInfos(files, {
      currentFileDir,
      isRecursive,
    });

    // Count stem occurrences (considering path prefix for recursive patterns)
    const stemCount = buildStemCountMap(fileInfos, isRecursive);

    // Second pass: generate import/export statements
    const exportStatements: string[] = [];
    const importStatements: string[] = [];
    fileInfos.forEach((info) => {
      const { relativePath } = info;
      const exportName = generateExportName(info, { isRecursive, stemCount });

      // Use relative path for import statement
      const importPath = relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
      importStatements.push(`import ${exportName} from "${importPath}";`);
      exportStatements.push(exportName);
    });


    if (importStatements.length !== exportStatements.length) {
      vscode.window.showErrorMessage("The number of import statements and export statements does not match");
      return;
    }

    const keyValuePairs = importStatements.map((importStatement, index) => {
      return { key: importStatement, value: exportStatements[index] };
    });
    keyValuePairs.sort((a, b) => {
      if (a.key < b.key) {
        return -1;
      }
      if (a.key > b.key) {
        return 1;
      }
      return 0;
    });
    const sortedImportStatements = keyValuePairs.map((keyValue) => keyValue.key);
    const sortedExportStatements = keyValuePairs.map((keyValue) => keyValue.value);

    const importStatementString = sortedImportStatements.join("\n");
    const exportStatementString = `export { ${sortedExportStatements.join(", ")} };`;

    vscode.window.activeTextEditor?.edit((editBuilder: vscode.TextEditorEdit) => {
      // if some text is selected, replace it with the import statements
      const selection = vscode.window.activeTextEditor?.selection;
      if (selection) {
        editBuilder.replace(selection, `${importStatementString}\n\n${exportStatementString}\n`);
      }
      // if no text is selected, insert the import statements at the top of the file
      else {
        const position = new vscode.Position(0, 0);
        editBuilder.insert(position, `${importStatementString}\n\n${exportStatementString}\n`);
      }
    });
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
