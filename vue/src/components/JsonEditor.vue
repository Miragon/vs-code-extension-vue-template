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
import {defineComponent, inject, onMounted, onUnmounted, Ref, ref} from "@vue/composition-api";
import {VsCode} from "@/types/VSCodeApi";

export default defineComponent({
   name: "JsonEditor",
   setup() {
      const vscode = inject('vscode') as VsCode;
      const textEditor: Ref<HTMLTextAreaElement | null> = ref(null);

      let cursorPosition = 0;
      let textLength = 0;

      onMounted(() => {
         const state = vscode.getState();
         if (state) {
            updateContent(state.text);
         }
         window.addEventListener('message', getData);
      })

      onUnmounted(() => {
         window.removeEventListener('message', getData);
      })

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
            return false;
         }
         return true;
      }

      /**
       * Receive and process the content of the message.
       * @param event Message which contain the data.
       */
      function getData(event: MessageEvent): void {
         const message = event.data;
         const text = message.text;

         switch (message.type) {
            case 'vuejsoneditor.update': {
               updateContent(text);
               break;
            }
            case 'vuejsoneditor.undo': {
               updateContent(text, true);
               break;
            }
            case 'vuejsoneditor.redo': {
               updateContent(text, true);
               break;
            }
            default: break;
         }
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
       * Update the value of the textarea.
       * @param text: New value.
       * @param isSetCursorPos On undo and redo the position of the cursor have to benn set.
       */
      function updateContent(text: string, isSetCursorPos = false): void {
         vscode.setState({text});

         if (textEditor.value) {
            // Because we set a new value for the textarea the cursor would be set to the end of the text.
            // So we have to set the cursor position to the values we saved before sending the data back
            // to the extension.
            textEditor.value!.value = text;
            if (isSetCursorPos) {
               let diffLength = text.length - textLength;
               textEditor.value!.selectionStart = textEditor.value!.selectionEnd = cursorPosition + diffLength;
            }
         }
      }

      return {
         textEditor,
         enableTab,
         sendData
      }
   },
})
</script>

<style scoped>
div {
   margin: 0;
   width: 100%;
   height: 1000px;
   font-family: sans-serif;
   font-size: 18px;
}

#editor {
   width: 100%;
   height: 100%;
   overflow: hidden;
   tab-size: 4;
   font-family: sans-serif;
   font-size: 16px;
   cursor: text;
}
</style>