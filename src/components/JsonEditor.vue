<template>
   <div>
      <h1>My Json-Editor</h1>
      <textarea id="editor" ref="textEditor"
                @keydown.tab.prevent="enableTab"
                @input.prevent="sendData">
      </textarea>
   </div>
</template>

<script lang="ts">
import {defineComponent, inject, Ref, ref} from "vue";
import {VsCode} from "src/types/VSCodeApi";

export default defineComponent({
   name: "JsonEditor",
   props: ['viewType'],
   setup(props) {
      const vscode = inject('vscode') as VsCode;
      const textEditor: Ref<HTMLTextAreaElement | null> = ref(null);

      let cursorPosition = 0;
      let textLength = 0;

      /**
       * Enable tabs inside a textarea, so it will not lose focus.
       */
      function enableTab(): void {
         const el = textEditor.value
         const start = el?.selectionStart ?? 0;
         const end = el?.selectionEnd ?? 0;

         el!.value = el?.value.substring(0, start) + '\t' + el?.value.substring(end);
         el!.selectionStart = el!.selectionEnd = start + 1;
      }

      /**
       * Send data back to the extension.
       */
      function sendData(): void {
         if (textEditor.value) {
             cursorPosition = textEditor.value.selectionEnd; // save current cursor position
             textLength = textEditor.value.value.length;     // save the current text length

             vscode.setState({
                viewType: props.viewType,
                text: textEditor.value.value
             });

             vscode.postMessage({
                type: props.viewType + '.updateFromWebview',
                content: JSON.parse(textEditor.value.value)
             });
         }
      }

      /**
       * Update the hole text inside the textarea.
       * @param text: New value.
       * @param isSetCursorPos On undo and redo the position of the cursor have to benn set.
       */
      function updateContent(text: JSON, isSetCursorPos = false): void {
         vscode.setState({
            viewType: props.viewType,
            text: JSON.stringify(text)
         });

         if (textEditor.value) {
            // Because we set a new value for the textarea the cursor would be set to the end of the text.
            // So we have to set the cursor position to the values we saved before sending the data to the extension.
            textEditor.value.value = JSON.stringify(text, undefined, 4);
            if (isSetCursorPos) {
               let diffLength = textEditor.value.value.length - textLength;
               textEditor.value.selectionStart = textEditor.value.selectionEnd = cursorPosition + diffLength;
            }
         }
      }

      return {
         textEditor,
         updateContent,    // Make the function executable from the Parent-Component
         enableTab,
         sendData
      }
   },
})
</script>

<style scoped>
div {
   font-family: sans-serif;
   font-size: 18px;
   height: 1000px;
   margin: 0;
   width: 100%;
}

#editor {
   cursor: text;
   font-family: sans-serif;
   font-size: 16px;
   height: 100%;
   tab-size: 4;
   width: 100%;
}
</style>