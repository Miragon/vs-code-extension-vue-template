<template>
   <div id="app">
      <json-editor ref="jsonEditor" :viewType="viewType"></json-editor>
   </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, onUnmounted, provide, ref} from "vue";
import {VsCode} from "src/types/VSCodeApi";
import JsonEditor from "./components/JsonEditor.vue";

declare const vscode: VsCode;

export default defineComponent({
   name: 'App',
   components: {JsonEditor},
   setup() {
      const jsonEditor = ref<InstanceType<typeof JsonEditor>>()
      const viewType = ref('');

      /**
       * Receive and process the content of the message.
       * @param event Message which was sent from the extension.
       */
      function getDataFromExtension(event: MessageEvent): void {
         const message = event.data;
         const text: JSON = message.text;

         switch (message.type) {
            case viewType.value + '.updateFromExtension': {
               jsonEditor.value?.updateContent(text);
               break;
            }
            case viewType.value + '.undo':
            case viewType.value + '.redo': {
               jsonEditor.value?.updateContent(text, true);
               break;
            }
            default: break;
         }
      }

      onMounted(() => {
         const state = vscode.getState();
         if (state) {
            viewType.value = state.viewType;
            jsonEditor.value?.updateContent(JSON.parse(state.text));
         }

         // Add event listener for receiving messages from the extension
         window.addEventListener('message', getDataFromExtension);
      })

      onUnmounted(() => {
         window.removeEventListener('message', getDataFromExtension);
      })

      // Publish the VSCodeAPI to all components
      provide('vscode', vscode);

      return {
         jsonEditor,
         viewType
      }
   }
});
</script>

<style>
#app {
   font-family: Avenir, Helvetica, Arial, sans-serif;
   -webkit-font-smoothing: antialiased;
   -moz-osx-font-smoothing: grayscale;
   text-align: center;
   color: papayawhip;
   margin-top: 20px;
}
</style>
