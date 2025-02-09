import * as vscode from 'vscode';

export class UnusedClassCodeLensProvider implements vscode.CodeLensProvider {
    private _onDidChangeCodeLenses = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;
    private unusedClasses: string[] = [];

    provideCodeLenses(): vscode.CodeLens[] {
        if (!this.unusedClasses.length) {
            return [];
        }

        const line = new vscode.Range(0, 0, 0, 0);
        return [
            new vscode.CodeLens(line, {
                title: `⚠️ ${this.unusedClasses.length} unused class(es): ${this.unusedClasses.join(', ')}`,
                command: '',
            }),
        ];
    }

    // Method to manually trigger a refresh
    public refresh(unusedClasses: string[]) {
        this.unusedClasses = unusedClasses;
        this._onDidChangeCodeLenses.fire();
    }
}
