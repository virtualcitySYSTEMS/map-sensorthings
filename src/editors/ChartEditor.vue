<script setup lang="ts">
  import {
    useComponentId,
    useProxiedComplexModel,
    VcsFormSection,
    VcsLabel,
    VcsTextField,
  } from '@vcmap/ui';
  import { VContainer, VRow, VCol } from 'vuetify/components';
  import type { ChartFeatureInfoViewOptions } from '../chartFeatureInfoView.js';
  import type { DashboardFeatureInfoViewOptions } from '../dashboardFeatureInfoView.js';

  const cid = useComponentId();

  const props = defineProps<{ modelValue: DashboardFeatureInfoViewOptions }>();

  const emit = defineEmits<{
    'update:modelValue': [value: ChartFeatureInfoViewOptions];
  }>();

  const localConfig = useProxiedComplexModel<ChartFeatureInfoViewOptions>(
    props,
    'modelValue',
    emit as (event: string, value: ChartFeatureInfoViewOptions) => void,
  );

  if (!localConfig.value.initialDayObservationRange) {
    localConfig.value.initialDayObservationRange = 1;
  }
</script>

<template>
  <VcsFormSection
    heading="sensorthings.editors.chart.title"
    expandable
    start-open
  >
    <v-container class="py-0 px-1">
      <v-row no-gutters>
        <v-col cols="6">
          <VcsLabel :html-for="`${cid}-title`">
            {{ $st('sensorthings.editors.chart.initialDayObservationRange') }}
          </VcsLabel>
        </v-col>
        <v-col cols="6">
          <VcsTextField
            :id="`${cid}-title`"
            v-model.number="localConfig.initialDayObservationRange"
            type="number"
            min="1"
            placeholder="1"
            :rules="[
              (v: number) =>
                (Number.isInteger(v) && v > 0) || v == undefined || 'error',
            ]"
          />
        </v-col>
      </v-row>
    </v-container>
  </VcsFormSection>
</template>
