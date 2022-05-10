<template>
   <div id="app">
      <json-editor></json-editor>
   </div>
</template>

<script lang="ts">
import {defineComponent, provide} from "@vue/composition-api";
import {VsCode} from "@/types/VSCodeApi";
import JsonEditor from "@/components/JsonEditor.vue";

declare const vscode: VsCode;

export default defineComponent({
   name: 'App',
   components: {JsonEditor},
   setup() {
      provide('vscode', vscode);
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
