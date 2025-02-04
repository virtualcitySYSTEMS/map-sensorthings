<!-- 
  This file is copy pasted from https://gitlab.virtualcitysystems.de/vcsuite/npm/vcmap/app-configurator/-/merge_requests/65
  It can be removed as soon as this MR is merged.
-->
<template>
  <VcsFormSection
    heading="appConfigurator.editors.settings.extent.title"
    expandable
    :header-actions="actions"
    v-if="localConfig.extent"
  >
    <VcsExtent v-model="localConfig.extent" :disabled="disabled" />
  </VcsFormSection>
</template>

<script lang="ts">
  import type { PropType } from 'vue';
  import { computed, defineComponent, inject, onUnmounted } from 'vue';
  import type { VcsUiApp } from '@vcmap/ui';
  import {
    setupExtentComponentActions,
    VcsFormSection,
    VcsExtent,
    useProxiedComplexModel,
  } from '@vcmap/ui';
  import type { LayerOptions } from '@vcmap/core';
  import { Extent } from '@vcmap/core';

  export default defineComponent({
    name: 'ExtentSettings',
    components: {
      VcsFormSection,
      VcsExtent,
    },
    props: {
      modelValue: {
        type: Object as PropType<LayerOptions>,
        required: true,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },
    setup(props, { emit }) {
      const app = inject<VcsUiApp>('vcsApp')!;
      const localConfig = useProxiedComplexModel<LayerOptions>(
        props,
        'modelValue',
        emit,
      );

      const extent = computed({
        get() {
          return new Extent(localConfig.value.extent);
        },
        set(value) {
          localConfig.value.extent = value.toJSON();
        },
      });

      const { actions, destroy } = setupExtentComponentActions(app, extent);

      if (props.disabled) {
        actions.forEach((action) => {
          if (action.name !== 'components.extent.zoom') {
            action.disabled = true;
          }
        });
      }

      onUnmounted(() => {
        destroy();
      });

      return {
        localConfig,
        actions,
      };
    },
  });
</script>

<style scoped></style>
