<!-- 
  This file is copy pasted from https://gitlab.virtualcitysystems.de/vcsuite/npm/vcmap/app-configurator/
  It should be removed as soon as https://gitlab.virtualcitysystems.de/vcsuite/npm/vcmap/app-configurator/-/merge_requests/65 MR is merged.
-->
<template>
  <v-container class="py-0 px-1">
    <v-row no-gutters v-for="{ key, input, placeholder } in inputs" :key="key">
      <v-col>
        <VcsLabel :html-for="`${cid}-${key}`">
          {{ $st(`appConfigurator.editors.featureInfo.window.state.${key}`) }}
        </VcsLabel>
      </v-col>
      <v-col>
        <VcsTextField
          :id="`${cid}-${key}`"
          clearable
          :placeholder="placeholder"
          v-model.trim="input.value"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts">
  import type { PropType, Ref, WritableComputedRef } from 'vue';
  import { computed, defineComponent } from 'vue';
  import { VContainer, VRow, VCol } from 'vuetify/components';
  import type { WindowState } from '@vcmap/ui';
  import {
    useProxiedComplexModel,
    useComponentId,
    VcsLabel,
    VcsTextField,
  } from '@vcmap/ui';

  export default defineComponent({
    name: 'WindowStateSettings',
    components: {
      VContainer,
      VRow,
      VCol,
      VcsLabel,
      VcsTextField,
    },
    props: {
      modelValue: {
        type: Object as PropType<WindowState>,
        required: true,
      },
    },
    setup(props, { emit }) {
      const localValue: Ref<WindowState> = useProxiedComplexModel(
        props,
        'modelValue',
        emit,
      );
      const positionKeys = ['headerTitle', 'headerIcon'] as const;
      const placeholder = {
        headerTitle:
          'appConfigurator.editors.featureInfo.window.state.headerTitlePlaceholder',
        headerIcon: '$vcsInfo',
      };

      const inputs = computed(() => {
        return positionKeys.reduce(
          (acc, key) => {
            acc[key] = {
              key,
              input: computed({
                get() {
                  return localValue.value[key];
                },
                set(value) {
                  localValue.value[key] = value as
                    | string
                    | (string[] & string)
                    | undefined;
                },
              }),
              placeholder: placeholder[key],
            };
            return acc;
          },
          {} as Record<
            keyof WindowState,
            {
              key: keyof WindowState;
              input: WritableComputedRef<string | string[] | undefined>;
              placeholder: string | null | undefined;
            }
          >,
        );
      });

      const cid = useComponentId();

      return {
        cid,
        inputs,
      };
    },
  });
</script>

<style scoped></style>
