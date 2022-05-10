<template>
   <div>
      <h1>My Json-Editor</h1>
      <textarea id="editor" ref="textEditor" @keydown.tab.prevent="enableTab"
                @input.prevent="sendData"></textarea>
   </div>
</template>

<script lang="ts">
import {defineComponent, inject, onMounted, onUnmounted, Ref, ref} from "@vue/composition-api";
import {VsCode} from "@/types/VSCodeApi";

export default defineComponent({
   name: "JsonEditor",
   setup() {
      const textEditor: Ref<HTMLTextAreaElement | null> = ref(null);
      const cursorPosition = ref(0);

      const vscode = inject('vscode') as VsCode;

      function enableTab() {
         const start = textEditor.value?.selectionStart ?? 0;
         const end = textEditor.value?.selectionEnd ?? 0;

         textEditor.value!.value = textEditor.value?.value.substring(0, start) +
             "\t" + textEditor.value?.value.substring(end);

         textEditor.value!.selectionStart = textEditor.value!.selectionEnd = start + 1;
      }

      function isStringJson(str: string): boolean {
         try {
            JSON.parse(str);
         } catch {
            return false;
         }
         return true;
      }

      function getData(event: MessageEvent): void {
         switch (event.data.type) {
            case 'vuejsoneditor.update': {
               const text: string = event.data.text;
               updateContent(text);
               vscode.setState({text});
            }
         }
      }

      function sendData() {
         cursorPosition.value = textEditor.value!.selectionEnd;
         if (isStringJson(textEditor.value!.value)) {
            vscode.postMessage({type: 'vuejsoneditor.edit', content: textEditor.value?.value});
         }
      }

      function updateContent(text: string): void {
         let json;
         try {
            if (!text) {
               text = '{}';
            }
            json = JSON.parse(text);
            textEditor.value!.value = JSON.stringify(json, undefined, 4);
            textEditor.value?.focus();
            console.log('updateContent()', cursorPosition.value);
            textEditor.value!.selectionEnd = cursorPosition.value + 4;
         } catch {
            console.error('No valid json.');
         }
      }

      const state = vscode.getState();
      if (state) {
         updateContent(state.text);
      }

      onMounted(() => {
         window.addEventListener('message', getData);
      })

      onUnmounted(() => {
         window.removeEventListener('message', getData);
      })

      return {
         textEditor,
         //data,
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

.errorContainer {
   width: 100%;
   height: 30px;
   border-radius: 4px;
   border: 2px solid indianred;
   color: indianred;
   text-align: center;
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