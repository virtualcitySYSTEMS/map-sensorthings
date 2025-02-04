<!-- 
  This file is copy pasted from https://gitlab.virtualcitysystems.de/vcsuite/npm/vcmap/app-configurator/-/merge_requests/65
  It can be removed as soon as this MR is merged.
-->
<template>
  <v-container class="pa-0">
    <v-row no-gutters>
      <v-col cols="6">
        <VcsLabel :html-for="`${cid}-attributions`">
          {{ $t('appConfigurator.editors.settings.attributions.title') }}
        </VcsLabel>
      </v-col>
      <v-col>
        <VcsTextField
          :id="`${cid}-attributions`"
          disabled
          v-model="attributionsLine"
        />
      </v-col>
      <v-col cols="1">
        <v-dialog v-model="dialog" width="75%">
          <template #activator="{ props }">
            <VcsButton v-bind="props" icon="$vcsEdit" class="ma-1 float-end" />
          </template>
          <v-card>
            <v-card-title class="font-weight-bold ma-0">
              {{ $t('appConfigurator.editors.settings.attributions.title') }}
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-2">
              <vcs-radio :items="addOptions" v-model="selectedOption" inline />
              <v-form
                @submit.prevent="submit"
                v-model="isValid"
                ref="formRef"
                class="pa-0"
              >
                <v-container class="px-1 py-0">
                  <v-row no-gutters v-if="selectedOption === 'adopt'">
                    <v-col>
                      <VcsLabel :html-for="`${cid}-provider`" required>
                        {{
                          $t(
                            'appConfigurator.editors.settings.attributions.from',
                          )
                        }}
                      </VcsLabel>
                    </v-col>
                    <v-col>
                      <vcs-select
                        :items="entries"
                        item-title="title"
                        item-value="key"
                        v-model="selectedEntry"
                        :placeholder="
                          $t(
                            'appConfigurator.editors.settings.attributions.select',
                          )
                        "
                        :rules="[
                          (v: string | null) =>
                            !!v ||
                            'appConfigurator.editors.settings.attributions.select',
                        ]"
                      ></vcs-select>
                    </v-col>
                  </v-row>
                  <template v-else>
                    <v-row no-gutters>
                      <v-col>
                        <VcsLabel :html-for="`${cid}-provider`" required>
                          {{
                            $t(
                              'appConfigurator.editors.settings.attributions.provider',
                            )
                          }}
                        </VcsLabel>
                      </v-col>
                      <v-col>
                        <VcsTextField
                          :id="`${cid}-provider`"
                          clearable
                          :placeholder="
                            $t(
                              'appConfigurator.editors.settings.attributions.placeholder',
                            )
                          "
                          v-model.trim="newAttribution.provider"
                          :rules="[isRequiredString]"
                        />
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <VcsLabel :html-for="`${cid}-url`">
                          {{
                            $t(
                              'appConfigurator.editors.settings.attributions.url',
                            )
                          }}
                        </VcsLabel>
                      </v-col>
                      <v-col>
                        <VcsTextField
                          :id="`${cid}-url`"
                          clearable
                          v-model.trim="newAttribution.url"
                        />
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <VcsLabel :html-for="`${cid}-year`">
                          {{
                            $t(
                              'appConfigurator.editors.settings.attributions.year',
                            )
                          }}
                        </VcsLabel>
                      </v-col>
                      <v-col>
                        <VcsTextField
                          :id="`${cid}-year`"
                          clearable
                          v-model.number="newAttribution.year"
                        />
                      </v-col>
                    </v-row>
                  </template>
                  <v-row no-gutters>
                    <v-col class="d-flex justify-end">
                      <VcsFormButton
                        type="submit"
                        variant="filled"
                        :disabled="!isValid"
                        class="mr-1 mt-1"
                      >
                        {{
                          $t(
                            `appConfigurator.editors.settings.attributions.${selectedOption}`,
                          )
                        }}
                      </VcsFormButton>
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
              <VcsDataTable
                :items="attributionItems"
                item-key="provider"
                :headers="headers"
                :show-searchbar="false"
              >
                <!-- eslint-disable-next-line -->
                <template #item.actions="{ item }">
                  <VcsActionButtonList
                    v-if="item.actions"
                    :actions="item.actions"
                    :block-overflow="true"
                    :overflow-count="2"
                  />
                </template>
              </VcsDataTable>
            </v-card-text>
            <v-card-actions>
              <VcsFormButton @click="dialog = false" variant="filled">
                {{ $t('appConfigurator.apply') }}
              </VcsFormButton>
              <VcsFormButton @click="clear" class="ml-1">
                {{ $t('appConfigurator.editors.settings.attributions.clear') }}
              </VcsFormButton>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
  import type { PropType } from 'vue';
  import { computed, defineComponent, inject, nextTick, ref, toRaw } from 'vue';
  import {
    VContainer,
    VRow,
    VCol,
    VDialog,
    VCard,
    VCardTitle,
    VCardText,
    VCardActions,
    VForm,
    VDivider,
  } from 'vuetify/components';
  import type {
    AttributionEntry,
    VcsAction,
    AttributionOptions,
    VcsUiApp,
  } from '@vcmap/ui';
  import {
    VcsLabel,
    VcsRadio,
    VcsSelect,
    VcsTextField,
    VcsButton,
    VcsFormButton,
    VcsDataTable,
    VcsActionButtonList,
    useComponentId,
  } from '@vcmap/ui';
  import type { ObliqueCollection, Layer, VcsMap } from '@vcmap/core';
  import { isRequiredString } from './validation.js';

  function addEntry(
    object: VcsMap | Layer | ObliqueCollection,
  ): AttributionEntry | undefined {
    const { attributions } = object.properties;
    if (attributions) {
      return {
        key: `${object.className}_${object.name}`,
        title:
          (object.properties?.title as string) ??
          `${object.className}: ${object.name}`,
        attributions: Array.isArray(attributions)
          ? attributions
          : [attributions],
      };
    }
    return undefined;
  }

  function getAttributionEntries(app: VcsUiApp): Array<AttributionEntry> {
    return [
      ...[...app.maps].map(addEntry),
      ...[...app.layers].map(addEntry),
      ...[...app.obliqueCollections].map(addEntry),
    ]
      .flat()
      .filter((e) => !!e);
  }

  export default defineComponent({
    name: 'AttributionsEditor',
    components: {
      VContainer,
      VRow,
      VCol,
      VDialog,
      VCard,
      VCardTitle,
      VCardText,
      VCardActions,
      VForm,
      VDivider,
      VcsLabel,
      VcsRadio,
      VcsSelect,
      VcsTextField,
      VcsButton,
      VcsFormButton,
      VcsDataTable,
      VcsActionButtonList,
    },
    props: {
      modelValue: {
        type: [Object, Array] as PropType<
          AttributionOptions | Array<AttributionOptions>
        >,
        default: () => [],
      },
    },
    setup(props, { emit }) {
      const app = inject<VcsUiApp>('vcsApp')!;
      const dialog = ref(false);
      const formRef = ref<HTMLElement & { resetValidation: () => void }>();
      const isValid = ref(false);
      const newAttribution = ref<AttributionOptions>({
        provider: '',
        url: '',
        year: new Date().getFullYear(),
      });

      const entries = getAttributionEntries(app);
      const selectedOption = ref('add');
      const selectedEntry = ref<string | null>(null);

      const localAttributionsArray = computed({
        get() {
          return Array.isArray(props.modelValue)
            ? props.modelValue
            : [props.modelValue];
        },
        set(value) {
          if (value.length === 1) {
            emit('update:modelValue', toRaw(value[0]));
          } else {
            emit(
              'update:modelValue',
              value.map((a) => toRaw(a)),
            );
          }
        },
      });
      const attributionItems = ref<
        Array<AttributionOptions & { actions: VcsAction[] }>
      >([]);
      const attributionsLine = computed(() => {
        let text = attributionItems.value[0]?.provider;
        if (attributionItems.value.length > 1) {
          text += ` (+${attributionItems.value.length - 1})`;
        }
        return text;
      });

      const createActions = (a: AttributionOptions): Array<VcsAction> => {
        return [
          {
            name: 'edit-attribution',
            icon: '$vcsEdit',
            title: 'appConfigurator.editors.settings.attributions.edit',
            callback(): void {
              newAttribution.value = a;
              dialog.value = true;
            },
          },
          {
            name: 'remove-attribution',
            icon: '$vcsTrashCan',
            title: 'appConfigurator.editors.settings.attributions.remove',
            callback(): void {
              attributionItems.value.splice(
                attributionItems.value.findIndex(
                  (item) =>
                    item.year === a.year &&
                    item.provider === a.provider &&
                    item.url === a.url,
                ),
                1,
              );
              localAttributionsArray.value.splice(
                localAttributionsArray.value.indexOf(a),
                1,
              );
            },
          },
        ];
      };

      attributionItems.value = localAttributionsArray.value.map((a) => ({
        ...a,
        actions: createActions(a),
      }));

      const addAttribution = async (): Promise<void> => {
        const idx = localAttributionsArray.value.findIndex(
          ({ provider, url, year }) =>
            provider === newAttribution.value.provider &&
            url === newAttribution.value.url &&
            year === newAttribution.value.year,
        );
        const attributionsItem = {
          ...newAttribution.value,
          actions: createActions(newAttribution.value),
        };
        if (idx > -1) {
          Object.assign(localAttributionsArray.value[idx], {
            ...newAttribution.value,
          });
          Object.assign(attributionItems.value[idx], attributionsItem);
        } else {
          localAttributionsArray.value = [
            ...localAttributionsArray.value,
            { ...newAttribution.value },
          ];
          attributionItems.value = [
            ...attributionItems.value,
            attributionsItem,
          ];
        }

        newAttribution.value = {
          provider: '',
          url: '',
          year: new Date().getFullYear(),
        };
        await nextTick();
        formRef.value?.resetValidation();
      };

      const adoptAttribution = async (): Promise<void> => {
        if (selectedEntry.value) {
          const entry = entries.find(
            (item) => item.key === selectedEntry.value,
          );
          if (entry) {
            const attributions = Array.isArray(entry.attributions)
              ? entry.attributions
              : [entry.attributions];
            localAttributionsArray.value = [
              ...localAttributionsArray.value,
              ...attributions,
            ];
            attributionItems.value = [
              ...attributionItems.value,
              ...attributions.map((a) => ({
                ...a,
                actions: createActions(a),
              })),
            ];
          }
        }
        await nextTick();
        formRef.value?.resetValidation();
      };

      const submit = async (): Promise<void> => {
        if (selectedOption.value === 'adopt') {
          await adoptAttribution();
        } else {
          await addAttribution();
        }
      };

      const clear = (): void => {
        localAttributionsArray.value = [];
        attributionItems.value = [];
      };

      const headers = [
        {
          title: 'appConfigurator.editors.settings.attributions.provider',
          value: 'provider',
        },
        {
          title: 'appConfigurator.editors.settings.attributions.url',
          value: 'url',
        },
        {
          title: 'appConfigurator.editors.settings.attributions.year',
          value: 'year',
        },
        {
          title: 'appConfigurator.editors.settings.attributions.actions',
          value: 'actions',
          sortable: false,
        },
      ];

      const addOptions = [
        {
          label: 'appConfigurator.editors.settings.attributions.addTooltip',
          value: 'add',
        },
        {
          label: 'appConfigurator.editors.settings.attributions.adoptTooltip',
          value: 'adopt',
        },
      ];

      const cid = useComponentId();

      return {
        cid,
        dialog,
        isValid,
        formRef,
        addOptions,
        selectedOption,
        selectedEntry,
        entries,
        newAttribution,
        submit,
        clear,
        headers,
        attributionItems,
        attributionsLine,
        isRequiredString,
      };
    },
  });
</script>

<style scoped></style>
