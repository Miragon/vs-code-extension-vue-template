import * as vscode from 'vscode';
import { JsonEditorProvider } from './jsonEditorProvider';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(JsonEditorProvider.register(context));
}