<script setup lang="ts">
  import { BalloonComponent, IframeComponent } from '@vcmap/ui';
</script>

<template>
  <BalloonComponent v-bind="{ ...$attrs }">
    <IframeComponent v-bind="{ ...$attrs }" />
  </BalloonComponent>
</template>
