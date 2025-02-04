<!-- 
  This file is copy pasted from https://gitlab.virtualcitysystems.de/vcsuite/npm/vcmap/app-configurator/-/merge_requests/65
  It can be removed as soon as this MR is merged.
-->
<template>
  <VcsFormSection
    :heading="heading"
    expandable
    :disabled="disabled"
    v-if="localConfig"
  >
    <v-container class="py-0 px-1" v-if="localConfig.properties">
      <v-row no-gutters>
        <v-col>
          <VcsLabel :html-for="`${cid}-tooltip`">
            {{ $t('appConfigurator.editors.settings.information.tooltip') }}
          </VcsLabel>
        </v-col>
        <v-col>
          <VcsTextField
            :id="`${cid}-tooltip`"
            clearable
            :placeholder="
              $t('appConfigurator.editors.settings.information.tooltipTooltip')
            "
            v-model.trim="localConfig.properties.tooltip"
          />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col>
          <VcsLabel :html-for="`${cid}-icon`">
            {{ $t('appConfigurator.editors.settings.information.icon') }}
          </VcsLabel>
        </v-col>
        <v-col>
          <VcsTextField
            :id="`${cid}-icon`"
            clearable
            v-model.trim="localConfig.properties.icon"
          />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col>
          <VcsLabel :html-for="`${cid}-infoUrl`">
            {{ $t('appConfigurator.editors.settings.information.infoUrl') }}
          </VcsLabel>
        </v-col>
        <v-col>
          <VcsTextField
            :id="`${cid}-infoUrl`"
            clearable
            v-model.trim="localConfig.properties.infoUrl"
          />
        </v-col>
      </v-row>
      <AttributionsEditor v-model="localConfig.properties.attributions" />
    </v-container>
  </VcsFormSection>
</template>

<script lang="ts" setup>
  import { VContainer, VRow, VCol } from 'vuetify/components';
  import {
    useComponentId,
    useProxiedComplexModel,
    VcsFormSection,
    VcsLabel,
    VcsTextField,
  } from '@vcmap/ui';
  import { type VcsObjectOptions } from '@vcmap/core';
  import { type AttributionOptions } from '@vcmap/ui';
  import AttributionsEditor from './AttributionsEditor.vue';

  type ObjectInformation = Record<string, unknown> & {
    tooltip: string;
    icon: string;
    infoUrl: string;
    attributions: AttributionOptions | Array<AttributionOptions>;
  };

  const props = defineProps({
    modelValue: {
      type: Object,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    heading: {
      type: String,
      default: 'appConfigurator.editors.settings.information.title',
    },
  });

  const emit = defineEmits<{
    'update:modelValue': [value: VcsObjectOptions];
  }>() as (event: string, value: VcsObjectOptions) => void;

  const localConfig = useProxiedComplexModel<
    VcsObjectOptions & { properties: ObjectInformation }
  >(props, 'modelValue', emit);
  const cid = useComponentId();
</script>

<style scoped></style>
