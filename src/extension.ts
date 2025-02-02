
import * as vscode from 'vscode';
import { extractClassesFromTemplate } from './utils/extract-classes-from-template';
import { extractClassesFromSCSS } from './utils/extract-classes-from-scss';
import { getCorrespondingFileNameByExtension } from './utils/get-corresponding-file-name-by-extension';
import { getFileContent } from './utils/find-file';
import { highlightClasses } from './utils/highlight-classes';
import { checkClasses } from './utils/check-classes';

let outputChannel: vscode.OutputChannel;
let activeDocument: vscode.TextDocument | null;

export function activate(context: vscode.ExtensionContext) { 
	outputChannel = vscode.window.createOutputChannel('Extension - Spot dead styles code');

	vscode.workspace.onDidChangeTextDocument(async (event) => {
		if (activeDocument && event.document.uri === activeDocument.uri) {
            outputChannel.appendLine(`Active document edited: ${activeDocument.uri.fsPath}`);
            handleDocumentChange(event.document);
        }
	});

	vscode.window.onDidChangeActiveTextEditor(async (editor) => {
		if (editor) {
            activeDocument = editor.document;
            outputChannel.appendLine(`Active document changed: ${activeDocument.uri.fsPath}`);
            handleDocumentChange(activeDocument);
        }
	});

	const disposable1 = vscode.commands.registerCommand('spot-dead-styles-ng.check', () => {
		vscode.window.showInformationMessage('spot dead styles is activated');
	});

	context.subscriptions.push(disposable1);
	context.subscriptions.push(outputChannel);

}


export function deactivate() {}


async function handleDocumentChange(document: vscode.TextDocument) {
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
  
	  try {
		  let htmlFilePath = '';
		  let htmlFileContent = '';
		  let scssFilePath = '';
		  let scssFileContent = '';
  
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
  
		  // Extract classes from HTML and SCSS
		  const htmlClasses = extractClassesFromTemplate(htmlFileContent);
		  const scssClasses = extractClassesFromSCSS(scssFileContent);
  
		  // Get the active text editor
		  const activeTextEditor = vscode.window.activeTextEditor;
  
		  if (activeTextEditor) {
			  // Check for classes not mentioned in the other file
			  const classesNotMentioned = filePath.endsWith('.html')
				  ? checkClasses(htmlClasses, scssClasses) // Check HTML classes against SCSS
				  : checkClasses(scssClasses, htmlClasses); // Check SCSS classes against HTML
			
			  
			  outputChannel.appendLine(`html classes: ${htmlClasses}`);
			  outputChannel.appendLine(`scss classes: ${scssClasses}`);
			    
			  outputChannel.appendLine(`classes missing: ${classesNotMentioned}`);

			  // Highlight classes not mentioned
			  highlightClasses(activeTextEditor, classesNotMentioned);
		  }
	  } catch (e) {
		  console.error(e);
		  vscode.window.showWarningMessage(`Error processing file: ${(e as any).message}`);
	  }
}

