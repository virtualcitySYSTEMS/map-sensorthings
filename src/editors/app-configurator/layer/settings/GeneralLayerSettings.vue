<!-- 
  This file is copy pasted from https://gitlab.virtualcitysystems.de/vcsuite/npm/vcmap/app-configurator/-/merge_requests/65
  It can be removed as soon as this MR is merged.
-->
<script lang="ts" setup>
  import type { PropType } from 'vue';
  import { VCol, VContainer, VRow } from 'vuetify/components';
  import {
    useProxiedComplexModel,
    useComponentId,
    VcsFormSection,
    VcsLabel,
    VcsTextField,
  } from '@vcmap/ui';
  import type { LayerOptions } from '@vcmap/core';
  import { isRequiredString } from '../../validation.js';

  const props = defineProps({
    modelValue: {
      type: Object as PropType<LayerOptions>,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    nameRules: {
      type: Array,
      default: () => [isRequiredString],
    },
    hideUrl: {
      type: Boolean,
      default: false,
    },
    requiredUrl: {
      type: Boolean,
      default: true,
    },
    urlRules: {
      type: Array,
      default: (p: { requiredUrl: boolean }) =>
        p.requiredUrl ? [isRequiredString] : [],
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
    heading="appConfigurator.editors.layer.general.title"
    expandable
    :disabled="disabled"
    :start-open="true"
    v-if="localConfig"
  >
    <v-container class="py-0 px-1">
      <slot name="prepend" />
      <slot name="default">
        <v-row no-gutters>
          <v-col>
            <VcsLabel :html-for="`${cid}-name`" required>
              {{ $t('appConfigurator.editors.layer.general.name') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              :id="`${cid}-name`"
              clearable
              v-model.trim="localConfig.name"
              :rules="nameRules"
            />
          </v-col>
        </v-row>
        <v-row no-gutters v-if="localConfig.properties">
          <v-col>
            <VcsLabel :html-for="`${cid}-title`">
              {{ $t('appConfigurator.editors.layer.general.layerTitle') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              :id="`${cid}-title`"
              clearable
              :placeholder="localConfig.name"
              v-model.trim="localConfig.properties.title"
            />
          </v-col>
        </v-row>
        <v-row no-gutters v-if="!hideUrl">
          <v-col>
            <VcsLabel :html-for="`${cid}-url`" :required="requiredUrl">
              {{ $t('appConfigurator.editors.layer.general.url') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              :id="`${cid}-url`"
              clearable
              v-model.trim="localConfig.url"
              :rules="urlRules"
            />
          </v-col>
        </v-row>
      </slot>
      <slot name="append" />
    </v-container>
  </VcsFormSection>
</template>

<style scoped></style>
