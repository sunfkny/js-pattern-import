// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import { assert } from "console";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "js-pattern-import" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("js-pattern-import.main", async () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user

    const activeUri = vscode.window.activeTextEditor?.document.uri;
    if (!activeUri) {
      vscode.window.showErrorMessage("No file is open");
      return;
    }

    let folder = path.dirname(activeUri.fsPath);

    const pattern = await vscode.window.showInputBox({
      title: `Enter the pattern you want to import at ${vscode.workspace.asRelativePath(folder, true)}`,
      value: vscode.workspace.getConfiguration().get("js.pattern.import.pattern") || "*.{png,jpg,jpeg,svg}",
    });

    if (!pattern) {
      return;
    }

    const files = await vscode.workspace.findFiles(new vscode.RelativePattern(folder, pattern));
    const exportStatements: string[] = [];
    const importStatements: string[] = [];
    files.forEach((file) => {
      const filename = file.path.split("/").pop();
      if (!filename) {
        return;
      }
      let filenameWithoutSuffix = filename.split(".").shift();
      const fileSuffix = filename.split(".").pop();
      if (!filenameWithoutSuffix) {
        return;
      }

      filenameWithoutSuffix = filenameWithoutSuffix.replace(/\s/g, "_").replace(/-/g, "_").replace(/@/g, "_");
      if (!filenameWithoutSuffix.match(/^[a-zA-Z_$].*$/)) {
        filenameWithoutSuffix = `${fileSuffix}_${filenameWithoutSuffix}`;
      }

      importStatements.push(`import ${filenameWithoutSuffix} from "./${filename}";`);
      exportStatements.push(filenameWithoutSuffix);
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

    vscode.window.activeTextEditor?.edit((editBuilder) => {
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
export function deactivate() {}
