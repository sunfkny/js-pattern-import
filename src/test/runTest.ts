import * as path from 'path';
import { runTests } from "@vscode/test-electron";

export async function run(): Promise<void> {
	const extensionDevelopmentPath = path.resolve(__dirname, '../../');
	const extensionTestsPath = path.resolve(__dirname, './suite/index');
	await runTests({
		extensionDevelopmentPath,
		extensionTestsPath,
	});
}

run();