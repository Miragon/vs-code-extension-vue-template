"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonEditorProvider = void 0;
const vscode = require("vscode");
const utils_1 = require("./utils");
/**
 * Provider for a simple JSON-Editor
 *
 * This editor will open on '.form'-Files in VS-Code.
 *
 */
class JsonEditorProvider {
    constructor(context) {
        this.context = context;
    }
    /**
     * Register the CustomTextEditorProvider
     * @param context The context of our extention
     * @returns a disposable which is stored inside context.subscriptions
     */
    static register(context) {
        const provider = new JsonEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(JsonEditorProvider.viewType, provider);
        return providerRegistration;
    }
    /**
     * Called when the custom editor is opened.
     * @param document Represents the source file (.form)
     * @param webviewPanel The panel which contains the webview
     * @param token A cancellation token that indicates that the result is no longer needed
     */
    async resolveCustomTextEditor(document, webviewPanel, token) {
        // Setup initial content for the webview
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'media'),
                vscode.Uri.joinPath(this.context.extensionUri, 'dist-vue'),
            ]
        };
        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);
        // Send the content from the extension to the webview
        function updateWebview() {
            webviewPanel.webview.postMessage({
                type: 'vuejsoneditor.update',
                text: document.getText(),
            });
        }
        // Event that is emitted when the text document is changed
        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                updateWebview();
            }
        });
        // Make sure we get rid of the listnener when our editor is closed
        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });
        // Receive message from the webview
        webviewPanel.webview.onDidReceiveMessage(e => {
            console.log('Data was send');
            switch (e.type) {
                case 'vuejsoneditor.edit':
                    this.setChangesToDocument(document, e.content);
                    return;
            }
        });
        // initial call
        updateWebview();
    }
    /**
     * Get the HTML-Document which display the webview
     * @param webview Webview belonging to the panel
     * @returns a string which represents the html content
     */
    getHtmlForWebview(webview) {
        const vueAppUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist-vue', 'js/app.js'));
        const vueVendorUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist-vue', 'js/chunk-vendors.js'));
        const styleAppUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist-vue', 'css/app.css'));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'script.js'));
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'reset.css'));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'reset.css'));
        const nonce = (0, utils_1.getNonce)();
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
                <link href="${styleMainUri}" rel="stylesheet" />
                <link href="${styleAppUri}" rel="stylesheet" />

                <title>Json Editor</title>
            </head>
            <body>
                <div id="app"></div>
                <script nonce="${nonce}">
                    <!-- This need to be before the Vue-App is loaded -->
                    const vscode = acquireVsCodeApi();
                </script>
                <script type="text/javascript" src="${vueVendorUri}" nonce="${nonce}"></script>
                <script type="text/javascript" src="${vueAppUri}" nonce="${nonce}"></script>
            </body>
            </html>
        `;
    }
    /**
     * Parse a string to json
     * @param content The string which should be parsed to json
     * @returns an json object
     */
    getContentAsJson(content) {
        const text = content;
        if (text.trim().length === 0) {
            return {};
        }
        try {
            return JSON.parse(text);
        }
        catch {
            vscode.window.showErrorMessage('No valid json');
            throw new Error('Could not get document as json. Content is not valid json');
        }
    }
    /**
     * Saves the changes to the source file
     * @param document The source file
     * @param content The data which was sent from the webview
     * @returns
     */
    setChangesToDocument(document, content) {
        const edit = new vscode.WorkspaceEdit();
        const json = this.getContentAsJson(content);
        edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), JSON.stringify(json, undefined, 4));
        return vscode.workspace.applyEdit(edit);
    }
}
exports.JsonEditorProvider = JsonEditorProvider;
JsonEditorProvider.viewType = 'vuejsoneditor.jsonEditor';
//# sourceMappingURL=jsonEditorProvider.js.map