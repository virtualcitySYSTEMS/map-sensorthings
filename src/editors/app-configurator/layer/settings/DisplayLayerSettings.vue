<!-- 
  This file is copy pasted from https://gitlab.virtualcitysystems.de/vcsuite/npm/vcmap/app-configurator/-/merge_requests/65
  It can be removed as soon as this MR is merged.
-->
<script lang="ts" setup>
  import type { PropType } from 'vue';
  import { VContainer } from 'vuetify/components';
  import { VcsFormSection, useProxiedComplexModel } from '@vcmap/ui';
  import type { LayerOptions } from '@vcmap/core';
  import StyleSettings from './StyleSettings.vue';

  const props = defineProps({
    modelValue: {
      type: Object as PropType<LayerOptions>,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits<{
    'update:modelValue': [value: LayerOptions];
  }>() as (event: string, value: LayerOptions) => void;

  const localConfig = useProxiedComplexModel<LayerOptions>(
    props,
    'modelValue',
    emit,
  );
</script>

<template>
  <VcsFormSection
    heading="appConfigurator.editors.layer.display.title"
    expandable
    v-if="localConfig"
    :disabled="disabled"
  >
    <v-container class="py-0 px-1">
      <slot name="prepend" />
      <slot name="default">
        <StyleSettings v-model="localConfig" />
      </slot>
      <slot name="append" />
    </v-container>
  </VcsFormSection>
</template>

<style scoped></style>
