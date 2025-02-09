import * as vscode from 'vscode';
import { extractClassesFromTemplate } from './helpers/extract-classes-from-template';
import { extractClassesFromSCSS } from './helpers/extract-classes-from-scss';
import { getCorrespondingFileNameByExtension } from './helpers/get-corresponding-file-name-by-extension';
import { getFileContent } from './helpers/find-file';
import { checkClassesDifference } from './helpers/check-classes-difference';
import { UnusedClassCodeLensProvider } from './vs-code-utils/unused-class-code-lense-provider';

const CONFIGURATION_ENTRY_KEY = 'spotDeadStyles';
const OUTPUT_ENTRY_KEY = 'Extension - spot dead styles ng';

let outputChannel: vscode.OutputChannel;
let activeDocument: vscode.TextDocument | null;
let unusedClasses: string[] = [];

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel(OUTPUT_ENTRY_KEY);

    const config = vscode.workspace.getConfiguration(CONFIGURATION_ENTRY_KEY);
    const ignoreClassPrefixes = config.get<string[]>('ignoreClassPrefixes', []);

    const provider = new UnusedClassCodeLensProvider();

    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider({ scheme: 'file' }, provider)
    );

    vscode.workspace.onDidChangeTextDocument(async (event) => {
        if (activeDocument && event.document.uri === activeDocument.uri) {
            outputChannel.appendLine(`Active document edited: ${activeDocument.uri.fsPath}`);
            unusedClasses = await handleDocumentChange(event.document, ignoreClassPrefixes);
            provider.refresh(unusedClasses);
        }
    });

    vscode.window.onDidChangeActiveTextEditor(async (editor) => {
        if (editor) {
            activeDocument = editor.document;
            outputChannel.appendLine(`Active document changed: ${activeDocument.uri.fsPath}`);
            unusedClasses = await handleDocumentChange(activeDocument, ignoreClassPrefixes);
            provider.refresh(unusedClasses);
        }
    });

    const disposable = vscode.commands.registerCommand('spot-dead-styles-ng.check', () => {
        vscode.window.showInformationMessage('spot dead styles is activated');
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(outputChannel);
}

export function deactivate() {}

async function handleDocumentChange(
    document: vscode.TextDocument,
    ignoreClassPrefixes: string[] = []
): Promise<string[]> {
    const filePath = document.uri.fsPath;

    outputChannel.appendLine(`Processing file: ${document.uri.fsPath}`);

    if (!filePath) {
        return [];
    }

    if (!filePath.endsWith('.component.html') && !filePath.endsWith('.component.scss')) {
        return [];
    }

    outputChannel.appendLine('File content loaded.');
    const fileContent = document.getText();

    let htmlFilePath = '';
    let htmlFileContent = '';
    let scssFilePath = '';
    let scssFileContent = '';

    try {
        if (filePath.endsWith('.html')) {
            htmlFilePath = filePath;
            htmlFileContent = fileContent;
            scssFilePath = getCorrespondingFileNameByExtension(htmlFilePath);
            scssFileContent = await getFileContent(scssFilePath);
        } else if (filePath.endsWith('.scss')) {
            scssFilePath = filePath;
            scssFileContent = fileContent;
            htmlFilePath = getCorrespondingFileNameByExtension(scssFilePath);
            htmlFileContent = await getFileContent(htmlFilePath);
        }

        let htmlClasses = extractClassesFromTemplate(htmlFileContent);
        let scssClasses = extractClassesFromSCSS(scssFileContent);

        ignoreClassPrefixes.forEach((prefix) => {
            htmlClasses = htmlClasses.filter((className) => !className.startsWith(prefix));
            scssClasses = scssClasses.filter((className) => !className.startsWith(prefix));
        });

        const classesNotMentioned = filePath.endsWith('.html')
            ? checkClassesDifference(htmlClasses, scssClasses)
            : checkClassesDifference(scssClasses, htmlClasses);

        outputChannel.appendLine(`Classes not mentioned : ${classesNotMentioned.join(', ')}`);
        return classesNotMentioned;
    } catch (e) {
        console.error(e);
        vscode.window.showWarningMessage(`Error processing file: ${(e as any).message}`);
        return [];
    }
}
