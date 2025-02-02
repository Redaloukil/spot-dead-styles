import * as vscode from 'vscode';


export async function getFileContent(filePath:string): Promise<string> {
  try {
      // Convert the file path to a URI
      const fileUri = vscode.Uri.file(filePath);

      // Read the file content
      const fileContent = await vscode.workspace.fs.readFile(fileUri);
      const content = new TextDecoder().decode(fileContent);

      return content;
  } catch (error) {
      throw new Error(`File not found: ${filePath}`);
  }
}