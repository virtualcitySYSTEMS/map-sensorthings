<script setup lang="ts">
  import { BalloonComponent } from '@vcmap/ui';
  import ChartComponent from './ChartComponent.vue';
  import type { ThingFeatureProperties } from './sensorThingsLayer.js';
</script>

<template>
  <BalloonComponent v-bind="{ ...$attrs }">
    <ChartComponent
      :feature-id="$attrs.featureId as string"
      :attributes="$attrs.attributes as ThingFeatureProperties"
      :layer-name="$attrs.layerName as string"
      :initial-day-observation-range="
        $attrs.initialDayObservationRange as number
      "
    />
  </BalloonComponent>
</template>
