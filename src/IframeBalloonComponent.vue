<script setup lang="ts">
  import { BalloonComponent, IframeComponent, VcsButton } from '@vcmap/ui';

  defineProps<{
    balloonTitle: string;
    balloonSubtitle: string;
    src: string;
  }>();

  function openLink(src: string): void {
    window.open(src, '_blank');
  }
</script>

<template>
  <BalloonComponent
    :balloon-title="balloonTitle"
    :balloon-subtitle="balloonSubtitle"
    v-bind="$attrs"
  >
    <template #balloon-title>
      <div class="d-flex align-center justify-space-between">
        <div>
          <v-list-item-title>
            <h3 class="font-weight-bold">
              {{ $st(balloonTitle) }}
            </h3>
          </v-list-item-title>
          <v-list-item-subtitle v-if="balloonSubtitle">
            {{ $st(balloonSubtitle) }}
          </v-list-item-subtitle>
        </div>
        <VcsButton
          icon="$vcsExternalLink"
          tooltip="sensorthings.dashboard.openInNewTab"
          class="px-1"
          @click="openLink(src)"
        />
      </div>
    </template>
    <IframeComponent :src="src" v-bind="$attrs" />
  </BalloonComponent>
</template>
