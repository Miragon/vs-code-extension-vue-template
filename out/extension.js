"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const jsonEditorProvider_1 = require("./jsonEditorProvider");
function activate(context) {
    context.subscriptions.push(jsonEditorProvider_1.JsonEditorProvider.register(context));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map