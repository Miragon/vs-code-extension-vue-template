<template>
   <div>
      <h1>My Json-Editor</h1>
      <textarea id="editor" ref="textEditor" @keydown.tab.prevent="enableTab" @keydown.enter="preventSendData"
                @input.prevent="sendData"></textarea>
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
      let numOfTabs = 0;
      let isEnter = false;

      onMounted(() => {
         window.addEventListener('message', getData);
      })

      onUnmounted(() => {
         window.removeEventListener('message', getData);
      })

      function enableTab(): void {
         const el = textEditor.value
         const start = el?.selectionStart ?? 0;
         const end = el?.selectionEnd ?? 0;

         el!.value = el?.value.substring(0, start) + '\t' + el?.value.substring(end);
         el!.selectionStart = el!.selectionEnd = start + 1;

         numOfTabs += 1;
      }

      function preventSendData(): void {
         isEnter = true;
         numOfTabs = 0;
      }

      function saveCursorPosition(): void {
         if (numOfTabs > 0) {
            cursorPosition = textEditor.value!.selectionStart + (4 * (numOfTabs - 1)) + 1;
         }
         else {
            cursorPosition = textEditor.value!.selectionStart;
         }

         numOfTabs = 0;
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

      function sendData(): void {
         if (!isEnter && isStringJson(textEditor.value!.value)) {
            saveCursorPosition();
            vscode.postMessage({type: 'vuejsoneditor.edit', content: textEditor.value?.value});
         }

         isEnter = false;
      }

      function updateContent(text: string): void {
         if (textEditor.value) {
            textEditor.value.value = text;
            textEditor.value.selectionStart = textEditor.value.selectionEnd = cursorPosition;
         }
      }

      const state = vscode.getState();
      if (state) {
         updateContent(state.text);
      }

      return {
         textEditor,
         enableTab,
         preventSendData,
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