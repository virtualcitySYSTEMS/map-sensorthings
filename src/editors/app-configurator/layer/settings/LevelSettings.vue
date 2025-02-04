<!-- 
  This file is copy pasted from https://gitlab.virtualcitysystems.de/vcsuite/npm/vcmap/app-configurator/-/merge_requests/65
  It can be removed as soon as this MR is merged.
-->
<script lang="ts" setup>
  import type { PropType } from 'vue';
  import { VContainer, VRow, VCol } from 'vuetify/components';
  import {
    useProxiedComplexModel,
    useComponentId,
    VcsLabel,
    VcsTextField,
  } from '@vcmap/ui';
  import type { RasterLayerOptions, VectorTileOptions } from '@vcmap/core';

  type LevelOptions = Pick<
    RasterLayerOptions | VectorTileOptions,
    'minLevel' | 'maxLevel'
  >;

  const props = defineProps({
    modelValue: {
      type: Object as PropType<LevelOptions>,
      default: () => ({ minLevel: 0, maxLevel: 18 }),
    },
  });

  const emit = defineEmits<{
    'update:modelValue': [value: LevelOptions];
  }>() as (event: string, value: LevelOptions) => void;

  const localConfig = useProxiedComplexModel<LevelOptions>(
    props,
    'modelValue',
    emit,
  );
  const cid = useComponentId();
</script>

<template>
  <v-container class="pa-0">
    <v-row no-gutters>
      <v-col cols="6">
        <VcsLabel :html-for="`${cid}-min`">
          {{ $t('appConfigurator.editors.layer.vectorTile.level') }}
        </VcsLabel>
      </v-col>
      <v-col>
        <VcsTextField
          :id="`${cid}-min`"
          type="number"
          step="1"
          prefix="min"
          v-model.number="localConfig.minLevel"
        />
      </v-col>
      <v-col class="px-2">
        <VcsTextField
          :id="`${cid}-max`"
          type="number"
          step="1"
          prefix="max"
          v-model.number="localConfig.maxLevel"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
