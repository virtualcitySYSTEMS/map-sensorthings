<!-- 
  This file is a modified version from https://gitlab.virtualcitysystems.de/vcsuite/npm/vcmap/app-configurator/
  It should be removed as soon as https://gitlab.virtualcitysystems.de/vcsuite/npm/vcmap/app-configurator/-/merge_requests/65 MR is merged.
-->
<template>
  <AbstractConfigEditor @submit="submit" @cancel="cancel">
    <VcsFormSection
      heading="appConfigurator.editors.featureInfo.general.title"
      expandable
      start-open
    >
      <v-container class="py-0 px-1">
        <v-row no-gutters>
          <v-col>
            <VcsLabel :html-for="`${cid}-name`" required>
              {{ $st('appConfigurator.editors.featureInfo.general.name') }}
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
      </v-container>
    </VcsFormSection>
    <BalloonFeatureInfoViewComponent
      v-if="
        localConfig.type === 'DashboardBalloonFeatureInfoView' ||
        localConfig.type === 'ChartBalloonFeatureInfoView'
      "
      v-model="localConfig"
    />
    <component :is="getComponent(localConfig.type)" v-model="localConfig" />
    <WindowSettings
      v-if="localConfig.window"
      v-model="localConfig.window"
      :is-balloon="localConfig.type?.includes('Balloon')"
    />
  </AbstractConfigEditor>
</template>

<script lang="ts">
  import type { Component, PropType, Ref } from 'vue';
  import { defineComponent, inject, ref, toRaw } from 'vue';
  import { VCol, VContainer, VRow } from 'vuetify/components';
  import type {
    VcsUiApp,
    FeatureInfoViewOptions,
    WindowPositions,
    WindowStateOptions,
  } from '@vcmap/ui';
  import {
    AbstractConfigEditor,
    WindowSlot,
    useComponentId,
    VcsFormSection,
    VcsLabel,
    VcsTextField,
  } from '@vcmap/ui';
  import WindowSettings from './WindowSettings.vue';
  import BalloonFeatureInfoViewComponent from './BalloonFeatureInfoView.vue';
  import DashboardEditor from './DashboardEditor.vue';
  import ChartEditor from './ChartEditor.vue';

  export default defineComponent({
    name: 'FeatureInfoEditor',
    components: {
      AbstractConfigEditor,
      DashboardEditor,
      ChartEditor,
      BalloonFeatureInfoViewComponent,
      WindowSettings,
      VcsFormSection,
      VContainer,
      VRow,
      VCol,
      VcsLabel,
      VcsTextField,
    },
    props: {
      getConfig: {
        type: Function as PropType<() => FeatureInfoViewOptions>,
        required: true,
      },
      setConfig: {
        type: Function as PropType<(config?: FeatureInfoViewOptions) => void>,
        required: true,
      },
      actions: {
        type: Array,
        default: () => [],
      },
      nameRules: {
        type: Array,
        default: () => [],
      },
    },

    setup(props) {
      const app = inject<VcsUiApp>('vcsApp')!;

      const config = props.getConfig();
      if (!config.window) {
        config.window = {};
      }
      if (!config.window.state) {
        config.window.state = {};
      }
      if (!config.window.position) {
        config.window.position = {};
      }
      if (!config.attributeKeys) {
        config.attributeKeys = [];
      }

      const localConfig: Ref<FeatureInfoViewOptions> = ref(config);

      const getComponent = (
        type: string | undefined,
      ): Component | undefined => {
        if (type) {
          const featureInfoViewClass =
            app.featureInfoClassRegistry.getClass(type);
          if (featureInfoViewClass) {
            if (
              type === 'DashboardFeatureInfoView' ||
              type === 'DashboardBalloonFeatureInfoView'
            ) {
              return DashboardEditor as Component;
            } else if (
              type === 'ChartFeatureInfoView' ||
              type === 'ChartBalloonFeatureInfoView'
            ) {
              return ChartEditor as Component;
            }
          }
        }
        return undefined;
      };

      const submit = (): void => {
        if (localConfig.value.window?.slot === WindowSlot.DYNAMIC_LEFT) {
          delete localConfig.value.window.slot;
        }

        // XXX probably clean up this entire block after refactor, since it would no longer be needed
        (
          Object.keys(
            localConfig.value.window?.state ?? {},
          ) as (keyof WindowStateOptions)[]
        ).forEach((key) => {
          if (localConfig.value.window?.state?.[key] == null) {
            delete localConfig.value.window!.state![key];
          }
        });

        if (Object.keys(localConfig.value.window?.state ?? {}).length < 1) {
          delete localConfig.value.window!.state;
        }

        (
          Object.keys(
            localConfig.value.window?.position ?? {},
          ) as (keyof WindowPositions)[]
        ).forEach((key) => {
          if (localConfig.value.window?.position?.[key] == null) {
            delete localConfig.value.window!.position![key];
          }
        });

        if (Object.keys(localConfig.value.window?.position ?? {}).length < 1) {
          delete localConfig.value.window!.position;
        }

        if (Object.keys(localConfig.value.window ?? {}).length < 1) {
          delete localConfig.value.window;
        }

        props.setConfig(toRaw(localConfig.value));
      };

      const cancel = (): void => {
        props.setConfig();
      };

      const cid = useComponentId();

      return {
        localConfig,
        getComponent,
        submit,
        cancel,
        cid,
      };
    },
  });
</script>

<style scoped></style>
