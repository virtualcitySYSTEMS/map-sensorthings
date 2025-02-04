<!-- 
  This file is copy pasted from https://gitlab.virtualcitysystems.de/vcsuite/npm/vcmap/app-configurator/-/merge_requests/65
  It can be removed as soon as this MR is merged.
-->
<script lang="ts" setup>
  import type { PropType } from 'vue';
  import { inject, onUnmounted, shallowRef } from 'vue';
  import { VContainer, VRow, VCol } from 'vuetify/components';
  import type { VcsUiApp } from '@vcmap/ui';
  import {
    VcsFormSection,
    VcsLabel,
    VcsTextField,
    VcsSelect,
    VcsChipArrayInput,
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
    rules: {
      type: Array,
      default: () => [],
    },
  });

  const emit = defineEmits<{
    'update:modelValue': [value: LayerOptions];
  }>() as (event: string, value: LayerOptions) => void;

  const app = inject<VcsUiApp>('vcsApp')!;
  const localConfig = useProxiedComplexModel(props, 'modelValue', emit);

  const availableMaps = shallowRef([...app.maps].map((m) => m.name));
  const availableViewpoints = shallowRef(
    [...app.viewpoints].map((v) => v.name),
  );
  const listeners = [
    app.maps.added.addEventListener(() => {
      availableMaps.value = [...app.maps].map((m) => m.name);
    }),
    app.maps.removed.addEventListener(() => {
      availableMaps.value = [...app.maps].map((m) => m.name);
    }),
    app.viewpoints.added.addEventListener(() => {
      availableViewpoints.value = [...app.viewpoints].map((m) => m.name);
    }),
    app.viewpoints.removed.addEventListener(() => {
      availableViewpoints.value = [...app.viewpoints].map((m) => m.name);
    }),
  ];

  onUnmounted(() => {
    listeners.forEach((cb) => cb());
  });

  const cid = useComponentId();
</script>

<template>
  <VcsFormSection
    heading="appConfigurator.editors.layer.mapHandling.title"
    expandable
    :disabled="disabled"
    v-if="localConfig"
  >
    <v-container class="py-0 px-1">
      <slot name="prepend" />
      <slot name="default">
        <v-row no-gutters>
          <v-col>
            <VcsLabel :html-for="`${cid}-exclusiveGroups`">
              {{
                $t('appConfigurator.editors.layer.mapHandling.exclusiveGroups')
              }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsChipArrayInput
              :id="`${cid}-exclusiveGroups`"
              column
              placeholder="group1"
              :input-width="100"
              v-model.trim="localConfig.exclusiveGroups"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel :html-for="`${cid}-mapNames`">
              {{ $t('appConfigurator.editors.layer.mapHandling.mapNames') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsSelect
              :id="`${cid}-mapNames`"
              :placeholder="
                $t(
                  'appConfigurator.editors.layer.mapHandling.mapNamesPlaceholder',
                )
              "
              clearable
              multiple
              :items="availableMaps"
              v-model.trim="localConfig.mapNames"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel :html-for="`${cid}-hiddenObjectIds`">
              {{
                $t('appConfigurator.editors.layer.mapHandling.hiddenObjectIds')
              }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsChipArrayInput
              :id="`${cid}-hiddenObjectIds`"
              :placeholder="
                $t(
                  'appConfigurator.editors.layer.mapHandling.hiddenObjectIdsPlaceholder',
                )
              "
              column
              :input-width="150"
              v-model="localConfig.hiddenObjectIds"
            />
          </v-col>
        </v-row>

        <v-row no-gutters>
          <v-col>
            <VcsLabel :html-for="`${cid}-zIndex`">
              {{ $t('appConfigurator.editors.layer.mapHandling.zIndex') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              :id="`${cid}-zIndex`"
              type="number"
              step="1"
              v-model.number="localConfig.zIndex"
            />
          </v-col>
        </v-row>
        <v-row no-gutters v-if="localConfig.properties">
          <v-col>
            <VcsLabel :html-for="`${cid}-defaultViewpoint`">
              {{
                $t('appConfigurator.editors.layer.mapHandling.defaultViewpoint')
              }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsSelect
              :id="`${cid}-defaultViewpoint`"
              clearable
              :placeholder="
                $t(
                  'appConfigurator.editors.layer.mapHandling.noDefaultViewpoint',
                )
              "
              :items="availableViewpoints"
              v-model="localConfig.properties.defaultViewpoint"
            />
          </v-col>
        </v-row>
      </slot>
      <slot name="append" />
    </v-container>
  </VcsFormSection>
</template>

<style scoped></style>
