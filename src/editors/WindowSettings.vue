<!-- 
  This file is copy pasted from https://gitlab.virtualcitysystems.de/vcsuite/npm/vcmap/app-configurator/
  It should be removed as soon as https://gitlab.virtualcitysystems.de/vcsuite/npm/vcmap/app-configurator/-/merge_requests/65 MR is merged.
-->
<template>
  <VcsFormSection
    heading="appConfigurator.editors.featureInfo.window.title"
    expandable
  >
    <v-container class="py-0 px-1">
      <WindowStateSettings v-if="!isBalloon" v-model="localValue.state" />
      <WindowPositionSettings v-model="localValue.position" />
    </v-container>
  </VcsFormSection>
</template>
<script lang="ts">
  import { VContainer } from 'vuetify/components';
  import type {
    WindowComponentOptions,
    WindowPositionOptions,
    WindowState,
  } from '@vcmap/ui';
  import { useProxiedComplexModel, VcsFormSection } from '@vcmap/ui';
  import type { PropType } from 'vue';
  import { defineComponent } from 'vue';
  import WindowStateSettings from './WindowStateSettings.vue';
  import WindowPositionSettings from './WindowPositionSettings.vue';

  export default defineComponent({
    name: 'WindowSettings',
    components: {
      VContainer,
      VcsFormSection,
      WindowStateSettings,
      WindowPositionSettings,
    },
    props: {
      modelValue: {
        type: Object as PropType<Partial<WindowComponentOptions>>,
        default: () => {},
      },
      isBalloon: {
        type: Boolean,
        default: false,
      },
    },
    setup(props, { emit }) {
      const localValue = useProxiedComplexModel<{
        state: WindowState;
        position: WindowPositionOptions;
      }>(props, 'modelValue', emit);

      return {
        localValue,
      };
    },
  });
</script>

<style scoped></style>
