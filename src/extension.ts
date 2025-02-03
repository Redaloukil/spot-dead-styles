import * as vscode from 'vscode';
import { extractClassesFromTemplate } from './utils/extract-classes-from-template';
import { extractClassesFromSCSS } from './utils/extract-classes-from-scss';
import { getCorrespondingFileNameByExtension } from './utils/get-corresponding-file-name-by-extension';
import { getFileContent } from './utils/find-file';
import { checkClasses } from './utils/check-classes';

const CONFIGURATION_KEY = 'spotDeadStyles';

let outputChannel: vscode.OutputChannel;
let activeDocument: vscode.TextDocument | null;

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel('Extension - spot dead styles ng');

    const config = vscode.workspace.getConfiguration(CONFIGURATION_KEY);
    const ignoreClassPrefixes = config.get<string[]>('ignoreClassPrefixes', []);

    vscode.workspace.onDidChangeTextDocument(async (event) => {
        if (activeDocument && event.document.uri === activeDocument.uri) {
            outputChannel.appendLine(`Active document edited: ${activeDocument.uri.fsPath}`);
            handleDocumentChange(event.document, ignoreClassPrefixes);
        }
    });

    vscode.window.onDidChangeActiveTextEditor(async (editor) => {
        if (editor) {
            activeDocument = editor.document;
            outputChannel.appendLine(`Active document changed: ${activeDocument.uri.fsPath}`);
            handleDocumentChange(activeDocument, ignoreClassPrefixes);
        }
    });

    const disposable1 = vscode.commands.registerCommand('spot-dead-styles-ng.check', () => {
        vscode.window.showInformationMessage('spot dead styles is activated');
    });

    context.subscriptions.push(disposable1);
    context.subscriptions.push(outputChannel);
}

export function deactivate() {}

async function handleDocumentChange(
    document: vscode.TextDocument,
    ignoreClassPrefixes: string[] = []
) {
    // Get the file path of the opened document
    const filePath = document.uri.fsPath;

    outputChannel.appendLine(`Processing file: ${document.uri.fsPath}`);

    if (!filePath) {
        outputChannel.appendLine('File path is undefined.');
        return;
    }

    // Check if the file is an HTML or SCSS file
    if (!filePath.endsWith('.component.html') && !filePath.endsWith('.component.scss')) {
        return;
    }

    outputChannel.appendLine('File content loaded.');
    const fileContent = document.getText();

    let htmlFilePath = '';
    let htmlFileContent = '';
    let scssFilePath = '';
    let scssFileContent = '';

    try {
        // If the file is an HTML file
        if (filePath.endsWith('.html')) {
            htmlFilePath = filePath;
            htmlFileContent = fileContent;

            outputChannel.appendLine(`HTML file detected: ${htmlFilePath}`);

            scssFilePath = getCorrespondingFileNameByExtension(htmlFilePath);
            outputChannel.appendLine(`Corresponding SCSS file path: ${scssFilePath}`);

            scssFileContent = await getFileContent(scssFilePath);
            outputChannel.appendLine('SCSS file content loaded.');
        }
        // If the file is an SCSS file
        else if (filePath.endsWith('.scss')) {
            scssFilePath = filePath;
            scssFileContent = fileContent;

            outputChannel.appendLine(`SCSS file detected: ${scssFilePath}`);

            htmlFilePath = getCorrespondingFileNameByExtension(scssFilePath);
            outputChannel.appendLine(`Corresponding HTML file path: ${htmlFilePath}`);
            htmlFileContent = await getFileContent(htmlFilePath);
            outputChannel.appendLine('HTML file content loaded.');
        }

        // remove all ignored class prefixes
        let htmlClasses = extractClassesFromTemplate(htmlFileContent);
        let scssClasses = extractClassesFromSCSS(scssFileContent);

        ignoreClassPrefixes.forEach((prefix) => {
            htmlClasses = htmlClasses.filter((className) => !className.startsWith(prefix));
            scssClasses = scssClasses.filter((className) => !className.startsWith(prefix));
        });

        outputChannel.appendLine(`HTML classes ${htmlClasses}`);

        outputChannel.appendLine(`SCSS classes ${scssClasses}`);

        const activeTextEditor = vscode.window.activeTextEditor;

        if (activeTextEditor) {
            // Check for classes not mentioned in the other file
            const classesNotMentioned = filePath.endsWith('.html')
                ? checkClasses(htmlClasses, scssClasses)
                : checkClasses(scssClasses, htmlClasses);

            outputChannel.appendLine(`classes missing: ${classesNotMentioned}`);
        }
    } catch (e) {
        console.error(e);
        vscode.window.showWarningMessage(`Error processing file: ${(e as any).message}`);
    }
}
