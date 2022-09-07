import * as vscode from 'vscode';
import {getContentAsJson, getNonce} from './utils';

/**
 * Provider for a simple JSON-Editor
 * This editor will open on '.form'-Files in VS-Code.
 */
export class JsonEditorProvider implements vscode.CustomTextEditorProvider {

    private static readonly viewType = 'vuejsoneditor.jsonEditor';

    private content: JSON = JSON.parse('{}');

    /**
     * Register the CustomTextEditorProvider
     * @param context The context of our extension
     * @returns a disposable which is stored inside context.subscriptions
     */
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new JsonEditorProvider(context);
        return vscode.window.registerCustomEditorProvider(JsonEditorProvider.viewType, provider);
    }

    constructor(
        private readonly context: vscode.ExtensionContext,
    ) {
    }

    /**
     * Called when the custom editor is opened.
     * @param document Represents the source file (.form)
     * @param webviewPanel The panel which contains the webview
     * @param token A cancellation token that indicates that the result is no longer needed
     */
    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        token: vscode.CancellationToken
    ): Promise<void> {

        let isUpdateFromWebview = false;
        let isBuffer = false;

        this.content = getContentAsJson(document.getText());

        // Setup initial content for the webview
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'resources'),
                vscode.Uri.joinPath(this.context.extensionUri, 'dist'),
            ]
        };

        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, this.context.extensionUri, this.content);

        // Send the content from the extension to the webview
        const updateWebview = (msgType: string) => {
            if (webviewPanel.visible) {
                webviewPanel.webview.postMessage({
                    type: msgType,
                    text: this.content,
                })
                    .then((success) => {
                        if (success) {
                            // ...
                        }
                    }, (reason) => {
                        // If the editor is closed and the changes are not being saved the text editor does an undo,
                        // which will trigger this function and try to send a message to the destroyed webview.
                        if (!document.isClosed) {
                            console.error('Json Editor', reason);
                        }
                    });
            }
        }

        // Receive message from the webview
        webviewPanel.webview.onDidReceiveMessage(e => {
            switch (e.type) {
                case JsonEditorProvider.viewType + '.updateFromWebview': {
                    isUpdateFromWebview = true;
                    this.writeChangesToDocument(document, e.content);
                    break;
                }
            }
        });

        /**
         * When changes are made inside the webview a message to the extension will be sent with the new data.
         * This will also change the model (= document). If the model is changed the onDidChangeTextDocument event
         * will trigger and the SAME data would be sent back to the webview.
         * To prevent this we check from where the changes came from (webview or somewhere else).
         * If the changes are made inside the webview (this.isUpdateFromWebview === true) then we will send NO data
         * to the webview. For example if the changes are made inside a separate editor then the data will be sent to
         * the webview to synchronize it with the current content of the model.
         */
        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString() && e.contentChanges.length !== 0) {

                this.content = getContentAsJson(e.document.getText());

                // If the webview is in the background then no messages can be sent to it.
                // So we have to remember that we need to update its content the next time the webview regain its focus.
                if (!webviewPanel.visible) {
                    isBuffer = true;
                    return;
                }

                // Update the webviews content.
                switch (e.reason) {
                    case 1: {   // Undo
                        updateWebview(JsonEditorProvider.viewType + '.undo');
                        break;
                    }
                    case 2: {   // Redo
                        updateWebview(JsonEditorProvider.viewType + '.redo');
                        break;
                    }
                    case undefined: {
                        // If the initial update came from the webview then we don't need to update the webview.
                        if (!isUpdateFromWebview) {
                            updateWebview(JsonEditorProvider.viewType + '.updateFromExtension');
                        }
                        isUpdateFromWebview = false;
                        break;
                    }
                }
            }
        });

        // Called when the view state changes (e.g. user switch the tab)
        webviewPanel.onDidChangeViewState(() => {
            switch (true) {
                case webviewPanel.active: {
                    this.content = getContentAsJson(document.getText());
                    /* falls through */
                }
                case webviewPanel.visible: {
                    // If changes has been made while the webview was not visible no messages could have been sent to the
                    // webview. So we have to update the webview if it gets its focus back.
                    if (isBuffer) {
                        updateWebview(JsonEditorProvider.viewType + '.updateFromExtension');
                        isBuffer = false;
                    }
                }
            }
        });

        // Cleanup after editor was closed.
        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });
    }

    /**
     * Get the HTML-Document which display the webview
     * @param webview Webview belonging to the panel
     * @param extensionUri
     * @param initialContent
     * @returns a string which represents the html content
     */
    private getHtmlForWebview(webview: vscode.Webview, extensionUri: vscode.Uri, initialContent: JSON): string {
        const vueAppUri = webview.asWebviewUri(vscode.Uri.joinPath(
            extensionUri, 'dist', 'client', 'client.mjs'
        ));

        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(
            extensionUri, 'resources', 'css', 'reset.css'
        ));

        const styleAppUri = webview.asWebviewUri(vscode.Uri.joinPath(
            extensionUri, 'dist', 'client', 'style.css'
        ));

        const nonce = getNonce();

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8" />

                <meta http-equiv="Content-Security-Policy" content="default-src 'none';
                    style-src ${webview.cspSource};
                    img-src ${webview.cspSource};
                    script-src 'nonce-${nonce}';">

                <meta name="viewport" content="width=device-width, initial-scale=1.0">

                <link href="${styleResetUri}" rel="stylesheet" />
                <link href="${styleAppUri}" rel="stylesheet" />

                <title>Json Editor</title>
            </head>
            <body>
                <div id="app"></div>
                <script nonce="${nonce}">
                    // Store the VsCodeAPI in a global variable
                    const vscode = acquireVsCodeApi();
                    // Set the initial state of the webview
                    vscode.setState({
                        viewType: '${JsonEditorProvider.viewType}',
                        text: '${JSON.stringify(initialContent)}'
                    });
                </script>
                <script type="text/javascript" src="${vueAppUri}" nonce="${nonce}"></script>
            </body>
            </html>
        `;
    }

    /**
     * Saves the changes to the source file
     * @param document The source file
     * @param content The data which was sent from the webview
     * @returns
     */
    private writeChangesToDocument(document: vscode.TextDocument, content: JSON): Thenable<boolean> {
        const edit = new vscode.WorkspaceEdit();
        const text = JSON.stringify(content, undefined, 4);

        edit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            text
        );

        return vscode.workspace.applyEdit(edit)
            .then((success) => {
                if (success) {
                    this.content = getContentAsJson(text);
                }
                return success
            });
    }
}