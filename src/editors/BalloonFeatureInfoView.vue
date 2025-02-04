<!-- 
  This file is copy pasted from https://gitlab.virtualcitysystems.de/vcsuite/npm/vcmap/app-configurator/
  It should be removed as soon as https://gitlab.virtualcitysystems.de/vcsuite/npm/vcmap/app-configurator/-/merge_requests/65 MR is merged.
-->
<template>
  <VcsFormSection
    heading="appConfigurator.editors.featureInfo.balloon.title"
    expandable
  >
    <v-container class="py-0 px-1">
      <v-row no-gutters>
        <v-col>
          <VcsLabel :html-for="`${cid}-balloonTitle`">
            {{
              $st('appConfigurator.editors.featureInfo.balloon.balloonTitle')
            }}
          </VcsLabel>
        </v-col>
        <v-col>
          <VcsTextField
            :id="`${cid}-balloonTitle`"
            clearable
            placeholder="layerName"
            v-model="localConfig.balloonTitle"
          />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col>
          <VcsLabel :html-for="`${cid}-balloonSubtitle`">
            {{
              $st('appConfigurator.editors.featureInfo.balloon.balloonSubtitle')
            }}
          </VcsLabel>
        </v-col>
        <v-col>
          <VcsTextField
            :id="`${cid}-balloonSubtitle`"
            clearable
            placeholder="featureId"
            v-model="localConfig.balloonSubtitle"
          />
        </v-col>
      </v-row>
      <slot />
    </v-container>
  </VcsFormSection>
</template>

<script lang="ts">
  import type { PropType } from 'vue';
  import { defineComponent } from 'vue';
  import { VContainer, VRow, VCol } from 'vuetify/components';
  import type { BalloonFeatureInfoViewOptions } from '@vcmap/ui';
  import {
    useProxiedComplexModel,
    useComponentId,
    VcsFormSection,
    VcsLabel,
    VcsTextField,
  } from '@vcmap/ui';

  export default defineComponent({
    name: 'BalloonFeatureInfoView',
    components: {
      VContainer,
      VRow,
      VCol,
      VcsFormSection,
      VcsLabel,
      VcsTextField,
    },
    props: {
      modelValue: {
        type: Object as PropType<BalloonFeatureInfoViewOptions>,
        required: true,
      },
    },
    setup(props, { emit }) {
      const localConfig = useProxiedComplexModel<BalloonFeatureInfoViewOptions>(
        props,
        'modelValue',
        emit,
      );
      const cid = useComponentId();

      return {
        cid,
        localConfig,
      };
    },
  });
</script>

<style scoped></style>
