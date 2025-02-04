<!-- 
  This file is copy pasted from https://gitlab.virtualcitysystems.de/vcsuite/npm/vcmap/app-configurator/-/merge_requests/65
  It can be removed as soon as this MR is merged.
-->
<script lang="ts" setup>
  import type { PropType, UnwrapRef } from 'vue';
  import { computed, inject, onUnmounted, ref } from 'vue';
  import { VContainer, VRow, VCol } from 'vuetify/components';
  import type { VcsUiApp } from '@vcmap/ui';
  import {
    useComponentId,
    useProxiedComplexModel,
    VcsLabel,
    VcsSelect,
  } from '@vcmap/ui';
  import type {
    DeclarativeStyleItemOptions,
    StyleItem,
    VectorStyleItemOptions,
    VectorOptions,
  } from '@vcmap/core';
  import { VectorLayer } from '@vcmap/core';

  function getInlineStyleOption(
    app: VcsUiApp,
    key: 'style' | 'highlightStyle',
    config: UnwrapRef<VectorOptions>,
  ): {
    title: string;
    value:
      | DeclarativeStyleItemOptions
      | VectorStyleItemOptions
      | StyleItem
      | string;
  } | null {
    if (config[key] !== null && typeof config[key] === 'object') {
      if (app.styles.hasKey(config[key].name)) {
        // use style name as reference if available
        return {
          title: config[key].name!,
          value: config[key].name!,
        };
      }
      return {
        title: 'appConfigurator.editors.layer.styleSettings.inlineStyle',
        value: config[key],
      };
    }
    return null;
  }

  const props = defineProps({
    modelValue: {
      type: Object as PropType<VectorOptions>,
      default: () => VectorLayer.getDefaultOptions(),
    },
  });

  const emit = defineEmits<{
    'update:modelValue': [value: VectorOptions];
  }>() as (event: string, value: VectorOptions) => void;

  const app = inject<VcsUiApp>('vcsApp')!;
  const localConfig = useProxiedComplexModel<VectorOptions>(
    props,
    'modelValue',
    emit,
  );
  const availableStyles = ref<string[]>([...app.styles].map((s) => s.name));
  const listeners = [
    app.styles.added.addEventListener((item) => {
      availableStyles.value.push(item.name);
    }),
    app.styles.removed.addEventListener(() => {
      availableStyles.value = [...app.styles].map((s) => s.name);
    }),
  ];

  const inlineStyleOption = getInlineStyleOption(
    app,
    'style',
    localConfig.value,
  );
  const styleOptions = computed(() => {
    if (inlineStyleOption) {
      return [
        inlineStyleOption,
        ...availableStyles.value.map((value) => ({ title: value, value })),
      ];
    }
    return availableStyles.value;
  });

  const inlineHighlightStyleOption = getInlineStyleOption(
    app,
    'highlightStyle',
    localConfig.value,
  );
  const highlightFilter = (s: StyleItem): boolean =>
    s.className === 'VectorStyleItem';
  const highlightStyleOptions = computed(() => {
    const highlightStyles = [
      ...availableStyles.value
        .map((name) => app.styles.getByKey(name)!)
        .filter(highlightFilter),
    ].map((s) => ({ title: s.name, value: s.name }));
    if (inlineHighlightStyleOption) {
      return [inlineHighlightStyleOption, ...highlightStyles];
    }
    return highlightStyles;
  });

  onUnmounted(() => {
    listeners.forEach((cb) => cb());
  });

  const cid = useComponentId();

  function setStyle(
    key: 'style' | 'highlightStyle',
    value: DeclarativeStyleItemOptions | VectorStyleItemOptions | StyleItem,
  ): void {
    if (value === inlineStyleOption || value === inlineHighlightStyleOption) {
      localConfig.value[key] = value;
    } else {
      localConfig.value[key] =
        key === 'style' ? value : app.styles.getByKey(value)?.toJSON(); // XXX Remove, when core supports style references for highlightStyle
    }
  }

  function getStyle(
    key: 'style' | 'highlightStyle',
    value: UnwrapRef<VectorOptions>,
  ):
    | DeclarativeStyleItemOptions
    | VectorStyleItemOptions
    | StyleItem
    | string
    | null {
    return (
      getInlineStyleOption(app, key, value)?.value ||
      (value[key]?.name as string) ||
      (value[key] as string) ||
      null
    );
  }
</script>

<template>
  <v-container class="pa-0">
    <v-row no-gutters>
      <v-col cols="6">
        <VcsLabel :html-for="`${cid}-availableStyles`">
          {{
            $t('appConfigurator.editors.layer.styleSettings.availableStyles')
          }}
        </VcsLabel>
      </v-col>
      <v-col>
        <VcsSelect
          :id="`${cid}-availableStyles`"
          multiple
          clearable
          :placeholder="
            $t('appConfigurator.editors.layer.styleSettings.noStyle')
          "
          :items="availableStyles"
          v-model="localConfig.properties!.availableStyles"
        />
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col cols="6">
        <VcsLabel :html-for="`${cid}-style`">
          {{ $t('appConfigurator.editors.layer.styleSettings.style') }}
        </VcsLabel>
      </v-col>
      <v-col>
        <VcsSelect
          :id="`${cid}-style`"
          clearable
          :placeholder="
            $t('appConfigurator.editors.layer.styleSettings.noStyle')
          "
          :items="styleOptions"
          :model-value="getStyle('style', localConfig)"
          @update:modelValue="setStyle('style', $event)"
        />
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col cols="6">
        <VcsLabel :html-for="`${cid}-highlight-style`">
          {{ $t('appConfigurator.editors.layer.styleSettings.highlightStyle') }}
        </VcsLabel>
      </v-col>
      <v-col>
        <VcsSelect
          :id="`${cid}-highlight-style`"
          clearable
          :placeholder="
            $t('appConfigurator.editors.layer.styleSettings.noStyle')
          "
          :items="highlightStyleOptions"
          :model-value="getStyle('highlightStyle', localConfig)"
          @update:modelValue="setStyle('highlightStyle', $event)"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
