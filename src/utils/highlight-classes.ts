import * as vscode from 'vscode';

let hoverProviderDisposable: vscode.Disposable | undefined;

export function highlightClasses(editor: vscode.TextEditor, classes: string[]) {
	const decorations: vscode.DecorationOptions[] = [];

    // Define a decoration style for the underline
    const decorationType = vscode.window.createTextEditorDecorationType({
        textDecoration: 'underline rgba(255, 215, 0, 0.5) wavy', // Gold wavy underline
    });

    // Find all occurrences of the classes in the document
    const document = editor.document;
    for (const className of classes) {
        // Regex to match class names in HTML (class="...") and SCSS (e.g., .something)
        const regex = new RegExp(`(class=["'][^"']*\\b${className}\\b[^"']*["']|\\.${className}\\b)`, 'g');
        const text = document.getText();
        let match;
        while ((match = regex.exec(text)) !== null) {
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);
            decorations.push({ range });
        }
    }

    // Apply the decorations
    editor.setDecorations(decorationType, decorations);

    // Unregister any existing hover provider
    if (hoverProviderDisposable) {
        hoverProviderDisposable.dispose();
    }

    // Register a new hover provider for both HTML and SCSS
    hoverProviderDisposable = vscode.Disposable.from(
        vscode.languages.registerHoverProvider('html', {
            provideHover(document, position, token) {
                return getHoverMessage(document, position, classes);
            },
        }),
        vscode.languages.registerHoverProvider('scss', {
            provideHover(document, position, token) {
                return getHoverMessage(document, position, classes);
            },
        })
    );
  }

  function getHoverMessage(document: vscode.TextDocument, position: vscode.Position, classes: string[]): vscode.Hover | null {
    // Match class names in HTML (class="...") or SCSS (e.g., .something)
    const range = document.getWordRangeAtPosition(position, /(class=["'][^"']*(\b\w+\b)[^"']*["']|\.(\w+)\b)/);
    if (range) {
        const word = document.getText(range);
        let className: string | undefined;

        // Extract class name from HTML (class="...")
        const htmlMatch = word.match(/class=["'][^"']*\b(\w+)\b[^"']*["']/);
        if (htmlMatch) {
            className = htmlMatch[1];
        }

        // Extract class name from SCSS (e.g., .something)
        const scssMatch = word.match(/\.(\w+)\b/);
        if (scssMatch) {
            className = scssMatch[1];
        }

        // Show hover message if the class is in the target list
        if (className && classes.includes(className)) {
            return new vscode.Hover(`Class: **${className}**\n\nThis class is used in the component's template.`);
        }
    }
    return null;
}
