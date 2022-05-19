<template>
   <div>
      <h1>My Json-Editor</h1>
      <textarea id="editor" ref="textEditor"
                @keydown.tab.prevent="enableTab"
                @input.prevent="sendData">
      </textarea>
      <div id="error_container" v-if="!isJson">No valid JSON</div>
   </div>
</template>

<script lang="ts">
import {defineComponent, inject, Ref, ref} from "@vue/composition-api";
import {VsCode} from "@/types/VSCodeApi";

export default defineComponent({
   name: "JsonEditor",
   setup() {
      const vscode = inject('vscode') as VsCode;
      const textEditor: Ref<HTMLTextAreaElement | null> = ref(null);
      const isJson = ref(true);

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
       * Small helper function to check if a string is valid json.
       * @param str String which is checked.
       */
      function isStringJson(str: string): boolean {
         try {
            JSON.parse(str);
         } catch {
            isJson.value = false;
            return false;
         }
         isJson.value = true;
         return true;
      }

      /**
       * Send data back to the extension.
       */
      function sendData(): void {
         if (isStringJson(textEditor.value!.value)) {
            cursorPosition = textEditor.value!.selectionEnd; // save current cursor position
            textLength = textEditor.value!.value.length; // save the current text length

            vscode.postMessage({type: 'vuejsoneditor.edit', content: textEditor.value?.value});
            vscode.setState({text: textEditor.value?.value});
         }
      }

      /**
       * Update the hole text inside the textarea.
       * @param text: New value.
       * @param isSetCursorPos On undo and redo the position of the cursor have to benn set.
       */
      function updateContent(text: string, isSetCursorPos = false): void {
         vscode.setState({text});

         if (textEditor.value) {
            // Because we set a new value for the textarea the cursor would be set to the end of the text.
            // So we have to set the cursor position to the values we saved before sending the data to the extension.
            textEditor.value!.value = text;
            if (isSetCursorPos) {
               let diffLength = text.length - textLength;
               textEditor.value!.selectionStart = textEditor.value!.selectionEnd = cursorPosition + diffLength;
            }
         }
      }

      return {
         textEditor,
         isJson,
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
   overflow: hidden;
   tab-size: 4;
   width: 100%;
}

#error_container {
   border: solid 2px red;
   border-radius: 8px;
   bottom: 100px;
   color: red;
   height: 40px;
   line-height: 36px;
   position: absolute;
   right: 10px;
   text-align: center;
   vertical-align: middle;
   width: 400px;
}
</style>