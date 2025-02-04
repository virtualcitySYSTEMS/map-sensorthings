<!-- 
  This file is copy pasted from https://gitlab.virtualcitysystems.de/vcsuite/npm/vcmap/app-configurator/-/merge_requests/65
  It can be removed as soon as this MR is merged.
-->
<script setup lang="ts">
  import { VCol, VRow } from 'vuetify/components';
  import type { VcsUiApp } from '@vcmap/ui';
  import {
    useComponentId,
    useProxiedAtomicModel,
    VcsLabel,
    VcsSelect,
  } from '@vcmap/ui';
  import { inject, onUnmounted, shallowRef } from 'vue';

  const props = defineProps({
    modelValue: {
      type: String,
      default: '',
    },
  });

  const emit = defineEmits<{
    'update:modelValue': [value: string];
  }>() as (event: string, value: string) => void;

  const localValue = useProxiedAtomicModel(props, 'modelValue', emit);

  const app = inject<VcsUiApp>('vcsApp')!;

  const availableFeatureInfos = shallowRef(
    [...app.featureInfo].map((f) => f.name),
  );

  const listeners = [
    app.featureInfo.added.addEventListener((item) => {
      availableFeatureInfos.value.push(item.name);
    }),
    app.featureInfo.removed.addEventListener(() => {
      availableFeatureInfos.value = [...app.featureInfo].map((f) => f.name);
    }),
  ];

  onUnmounted(() => {
    listeners.forEach((cb) => cb());
  });

  const cid = useComponentId();
</script>

<template>
  <v-row no-gutters>
    <v-col>
      <VcsLabel :html-for="`${cid}-featureInfo`">
        {{ $t('appConfigurator.editors.layer.mapHandling.featureInfo') }}
      </VcsLabel>
    </v-col>
    <v-col>
      <VcsSelect
        :id="`${cid}-featureInfo`"
        clearable
        :placeholder="
          $t('appConfigurator.editors.layer.mapHandling.nofeatureInfo')
        "
        :items="availableFeatureInfos"
        v-model.trim="localValue"
      />
    </v-col>
  </v-row>
</template>

<style scoped></style>
