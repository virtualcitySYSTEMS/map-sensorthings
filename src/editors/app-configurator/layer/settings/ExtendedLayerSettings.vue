<!-- 
  This file is copy pasted from https://gitlab.virtualcitysystems.de/vcsuite/npm/vcmap/app-configurator/-/merge_requests/65
  It can be removed as soon as this MR is merged.
-->
<script lang="ts" setup>
  import type { PropType } from 'vue';
  import { VContainer, VRow, VCol } from 'vuetify/components';
  import {
    VcsFormSection,
    VcsLabel,
    VcsCheckbox,
    useProxiedComplexModel,
    useComponentId,
  } from '@vcmap/ui';
  import type { LayerOptions } from '@vcmap/core';

  const props = defineProps({
    modelValue: {
      type: Object as PropType<LayerOptions>,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    hideShowInOverviewMap: {
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

  const cid = useComponentId();
</script>

<template>
  <VcsFormSection
    heading="appConfigurator.editors.layer.extended.title"
    expandable
    :disabled="disabled"
    v-if="localConfig"
  >
    <v-container class="py-0 px-1">
      <slot name="prepend" />
      <slot name="default">
        <v-row
          no-gutters
          v-if="localConfig.properties && !hideShowInOverviewMap"
        >
          <v-col>
            <VcsLabel :html-for="`${cid}-showInOverviewMap`">
              {{
                $t('appConfigurator.editors.layer.extended.showInOverviewMap')
              }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsCheckbox
              :id="`${cid}-showInOverviewMap`"
              v-model.number="localConfig.properties.showInOverviewMap"
            />
          </v-col>
        </v-row>
      </slot>
      <slot name="append" />
    </v-container>
  </VcsFormSection>
</template>

<style scoped></style>
