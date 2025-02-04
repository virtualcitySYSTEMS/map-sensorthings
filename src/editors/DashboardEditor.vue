<template>
  <VcsFormSection
    heading="sensorthings.editors.dashboard.title"
    expandable
    start-open
  >
    <v-container class="py-0 px-1">
      <v-row no-gutters>
        <v-col cols="6">
          <VcsLabel :html-for="`${cid}-title`">
            {{ $st('appConfigurator.editors.featureInfo.iframe.iframeTitle') }}
          </VcsLabel>
        </v-col>
        <v-col cols="6">
          <VcsTextField
            :id="`${cid}-title`"
            clearable
            v-model="localConfig.title"
          />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="6">
          <VcsLabel :html-for="`${cid}-url`">
            {{ $st('sensorthings.editors.dashboard.url') }}
          </VcsLabel>
        </v-col>
        <v-col cols="6">
          <VcsTextField
            :id="`${cid}-url`"
            clearable
            v-model="localConfig.url"
            placeholder="https://example.org"
          />
        </v-col>
      </v-row>
    </v-container>
    <v-divider />
    <v-container class="py-0 px-0">
      <v-row no-gutters>
        <v-col class="px-0">
          <v-form v-model="csvInputValidity">
            <VcsDataTable
              v-if="tableItems"
              :items="tableItems"
              :headers="[
                { title: 'sensorthings.id', key: 'id' },
                {
                  title: 'sensorthings.editors.dashboard.dashboardUrl',
                  key: 'dashboard',
                },
                {
                  title: '',
                  key: 'actions',
                  sortable: false,
                  align: 'end',
                },
              ]"
              :show-searchbar="false"
              items-per-page="5"
            >
              <template #item.actions="{ item }">
                <VcsActionButtonList :actions="item.actions" right />
              </template>
              <template #body.prepend>
                <tr>
                  <td class="px-1">
                    <VcsTextField
                      id="dashboard-mapping-thing-id"
                      v-model="dashboardMappingEntry.thingId"
                      @keydown.enter.prevent="addEntry"
                      placeholder="123"
                      :rules="[
                        (v: number | string) =>
                          !localConfig.thingDashboardMapping?.some(
                            (entry) => entry[0] == v,
                          ) || 'sensorthings.editors.dashboard.unique',
                      ]"
                    />
                  </td>
                  <td class="px-1">
                    <VcsTextField
                      v-model="dashboardMappingEntry.dashboard"
                      placeholder="https://example.org"
                      @keydown.enter.prevent="addEntry"
                    />
                  </td>
                  <td class="d-flex justify-end align-center">
                    <VcsActionButtonList
                      :actions="dashboardMappingEntryActions"
                      right
                      :overflow-count="3"
                    />
                    <v-dialog
                      v-model="dashboardMappingUploadDialog"
                      width="400"
                    >
                      <CsvImport
                        :maximum-rows="200"
                        @close="dashboardMappingUploadDialog = false"
                        @imported="addCsvEntries"
                      ></CsvImport>
                    </v-dialog>
                  </td>
                </tr>
              </template>
            </VcsDataTable>
          </v-form>
        </v-col>
      </v-row>
    </v-container>
  </VcsFormSection>
</template>

<script lang="ts">
  import type { PropType } from 'vue';
  import {
    computed,
    defineComponent,
    getCurrentInstance,
    inject,
    ref,
    watch,
  } from 'vue';
  import {
    VContainer,
    VRow,
    VCol,
    VDialog,
    VForm,
    VDivider,
  } from 'vuetify/components';
  import type { VcsAction, VcsUiApp } from '@vcmap/ui';
  import {
    useComponentId,
    VcsFormSection,
    VcsLabel,
    VcsTextField,
    VcsDataTable,
    VcsActionButtonList,
    useProxiedComplexModel,
    NotificationType,
  } from '@vcmap/ui';
  import {
    parseId,
    type DashboardFeatureInfoViewOptions,
  } from '../dashboardFeatureInfoView.js';
  import CsvImport from './CsvImport.vue';

  function isValidValue(v?: string | number): v is string | number {
    return !!v || v === 0;
  }

  export default defineComponent({
    name: 'DashboardEditor',
    components: {
      VContainer,
      VRow,
      VCol,
      VForm,
      VcsFormSection,
      VcsLabel,
      VcsTextField,
      VcsDataTable,
      VcsActionButtonList,
      VDialog,
      VDivider,
      CsvImport,
    },
    props: {
      modelValue: {
        type: Object as PropType<DashboardFeatureInfoViewOptions>,
        required: true,
      },
    },
    setup(props, { emit }) {
      const app = inject<VcsUiApp>('vcsApp')!;
      const vm = getCurrentInstance()!.proxy!;

      const cid = useComponentId();
      const localConfig =
        useProxiedComplexModel<DashboardFeatureInfoViewOptions>(
          props,
          'modelValue',
          emit,
        );

      if (!localConfig.value.thingDashboardMapping) {
        localConfig.value.thingDashboardMapping = [];
      }

      const tableItems = computed(
        (): {
          id: number | string;
          dashboard: number | string;
          actions: VcsAction[];
        }[] => {
          return localConfig.value.thingDashboardMapping!.map((item, index) => {
            return {
              id: item[0],
              dashboard: item[1],
              actions: [
                {
                  name: item[0]?.toString(),
                  icon: 'mdi-delete',
                  title: 'sensorthings.editors.dashboard.delete',
                  callback(): void {
                    localConfig.value.thingDashboardMapping?.splice(index, 1);
                  },
                },
              ],
            };
          });
        },
      );

      const dashboardMappingEntry = ref<{
        thingId?: string | number;
        dashboard?: string | number;
      }>({
        thingId: undefined,
        dashboard: undefined,
      });

      const csvInputValidity = ref(true);
      function addEntry(): void {
        if (
          csvInputValidity.value &&
          isValidValue(dashboardMappingEntry.value.thingId) &&
          isValidValue(dashboardMappingEntry.value.dashboard)
        ) {
          localConfig.value.thingDashboardMapping?.unshift([
            parseId(dashboardMappingEntry.value.thingId),
            dashboardMappingEntry.value.dashboard,
          ]);
          dashboardMappingEntry.value.thingId = undefined;
          dashboardMappingEntry.value.dashboard = undefined;
          document.getElementById('dashboard-mapping-thing-id')?.focus();
        }
      }
      const dashboardMappingUploadDialog = ref(false);
      const dashboardMappingEntryActions = ref<VcsAction[]>([
        {
          name: 'delete-entries',
          icon: 'mdi-delete',
          title: 'sensorthings.editors.dashboard.deleteAll',
          callback(): void {
            localConfig.value.thingDashboardMapping = [];
          },
        },
        {
          name: 'upload-entries',
          icon: '$vcsUpload',
          title: 'sensorthings.editors.dashboard.uploadEntries',
          callback(): void {
            dashboardMappingUploadDialog.value = true;
          },
        },
        {
          name: 'add-entry',
          icon: 'mdi-check',
          title: 'sensorthings.editors.dashboard.addEntry',
          disabled: true,
          callback(): void {
            addEntry();
          },
        },
      ]);
      watch(
        [dashboardMappingEntry, csvInputValidity],
        () => {
          dashboardMappingEntryActions.value[2].disabled =
            !(
              isValidValue(dashboardMappingEntry.value.thingId) &&
              isValidValue(dashboardMappingEntry.value.dashboard)
            ) || !csvInputValidity.value;
        },
        { deep: true, immediate: true },
      );
      return {
        cid,
        localConfig,
        nonEmpty: (v: string): boolean | string =>
          (v && v !== '') || 'sensorthings.editors.dashboard.emptySrc',
        tableItems,
        addEntry,
        csvInputValidity,
        addCsvEntries(data: (string | number)[][]): void {
          const filteredData = data.filter(
            (row) => isValidValue(row[0]) && isValidValue(row[1]),
          ) as [number | string, number | string][];

          const uniqueData = new Map(filteredData);

          const numberInvalid = data.length - filteredData.length;
          const numberDublicate = filteredData.length - uniqueData.size;
          if (numberInvalid !== 0 || numberDublicate !== 0) {
            app.notifier.add({
              message: vm.$st('sensorthings.editors.dashboard.importFeedback', {
                numberInvalid,
                numberDublicate,
              }),
              type: NotificationType.WARNING,
            });
          }

          const { thingDashboardMapping: mapping } = localConfig.value;
          if (mapping?.length) {
            uniqueData.forEach((dashboard, id) => {
              const idAlreadyExists = mapping.some((row) => row[0] === id);
              if (!idAlreadyExists) {
                mapping.push([id, dashboard]);
              }
            });
          } else {
            localConfig.value.thingDashboardMapping = Array.from(uniqueData);
          }
        },
        dashboardMappingEntry,
        dashboardMappingEntryActions,
        dashboardMappingUploadDialog,
      };
    },
  });
</script>

<style scoped></style>
