<template>
  <div>
    <table class="sensor-things-table">
      <tbody>
        <tr>
          <td>{{ $st('sensorthings.name') }}</td>
          <td>{{ attributes.name }}</td>
        </tr>
        <tr>
          <td>{{ $st('sensorthings.observedProperty') }}</td>
          <td>{{ observedProperty }}</td>
        </tr>
        <tr>
          <td>{{ $st('sensorthings.latestObservation') }}</td>
          <td>
            {{ `${latestObservationValue} ${latestUnitSymbol ?? ''}` }}
            <span class="opacity-50">({{ latestObservationTime }})</span>
          </td>
        </tr>
      </tbody>
    </table>
    <v-divider />
    <v-container class="px-1 py-0">
      <v-row no-gutters>
        <v-col cols="2">
          <VcsLabel>{{ $st('sensorthings.from') }}</VcsLabel>
        </v-col>
        <v-col>
          <VcsDatePicker
            v-model="startDate"
            :date-picker-props="{
              min: calenderMinMax[0],
              max: calenderMinMax[1],
            }"
          />
        </v-col>
        <v-col cols="2">
          <VcsLabel>{{ $st('sensorthings.to') }}</VcsLabel>
        </v-col>
        <v-col>
          <VcsDatePicker
            v-model="endDate"
            :date-picker-props="{
              min: startDate,
              max: calenderMinMax[1],
            }"
          />
        </v-col>
      </v-row>
    </v-container>
    <v-row no-gutters class="pb-3 pt-3 pl-1">
      <v-col>
        <apex-chart type="line" :options="chartOptions" :series="chartSeries" />
      </v-col>
    </v-row>
    <v-overlay
      :model-value="loadingData"
      contained
      persistent
      class="d-flex justify-center align-center"
    >
      <v-icon size="x-large" color="primary"> $vcsProgress </v-icon>
    </v-overlay>
  </div>
</template>

<script lang="ts">
  import type { PropType } from 'vue';
  import {
    computed,
    defineComponent,
    inject,
    ref,
    watch,
    getCurrentInstance,
  } from 'vue';
  import {
    VRow,
    VCol,
    VDivider,
    VContainer,
    VOverlay,
    VIcon,
  } from 'vuetify/components';
  import ApexChart from 'vue3-apexcharts';
  import type { ApexOptions } from 'apexcharts';
  import type { VcsUiApp } from '@vcmap/ui';
  import { NotificationType, VcsDatePicker, VcsLabel } from '@vcmap/ui';
  import { getLogger } from '@vcsuite/logger';
  import { useTheme } from 'vuetify';
  import apexLocales from './apexLocales.js';
  import type {
    SensorThingsLayer,
    ThingFeatureProperties,
  } from './sensorThingsLayer.js';
  import type {
    DatastreamWithObservations,
    ObservationEntity,
  } from './sensorThingsAPI.js';
  import {
    queryDatastreamsWithObservations,
    queryDatastreamWithLatestObservation,
    queryFirstObservation,
  } from './sensorThingsAPI.js';
  import { name } from '../package.json';

  const maxObservations = 1000;

  function calcInitialStartDate(
    latestPhenomenonTime: Date,
    initialDayObservationRange: number,
  ): Date {
    return new Date(
      latestPhenomenonTime.getTime() -
        initialDayObservationRange * 24 * 60 * 60 * 1000,
    );
  }

  /**
   * This function ensures a single point of time. In case phenomenon time is time span it just returns start time. Otherwise returns input string.
   * @param phenomenonTime Time or start time of time span.
   */
  function ensurePointInTime(phenomenonTime: string): string {
    return phenomenonTime.indexOf('/') === -1
      ? phenomenonTime
      : phenomenonTime.slice(0, phenomenonTime.indexOf('/'));
  }

  /**
   * This function converts the Datastreams with their Observations to a format that can be used by the ApexChart component.
   * @param datastreams The Datastreams with their Observations in descending order
   */
  function convertDatastreamsToSeries(
    datastreams: DatastreamWithObservations[],
  ): ApexAxisChartSeries {
    return datastreams.map((datastream) => {
      return {
        name: datastream.name,
        data: datastream.Observations.slice()
          .reverse()
          .map((observation) => {
            const time = ensurePointInTime(observation.phenomenonTime);
            return [new Date(time).getTime(), observation.result];
          }),
      };
    });
  }

  export default defineComponent({
    name: 'ChartComponent',
    components: {
      VContainer,
      VRow,
      VCol,
      VDivider,
      ApexChart,
      VcsLabel,
      VcsDatePicker,
      VOverlay,
      VIcon,
    },
    props: {
      featureId: {
        type: String,
        required: true,
      },
      layerName: {
        type: String,
        required: true,
      },
      attributes: {
        type: Object as PropType<ThingFeatureProperties>,
        required: true,
      },
      initialDayObservationRange: {
        type: Number,
        default: 1,
      },
    },
    setup(props) {
      const vm = getCurrentInstance()!.proxy!;
      const app = inject('vcsApp') as VcsUiApp;
      const theme = useTheme();

      const startDate = ref<Date | undefined>();
      const endDate = ref<Date | undefined>();
      const chartSeries = ref<ApexAxisChartSeries>([]);
      const yAxisTitle = ref<string | undefined>();
      const latestUnitSymbol = ref<string | undefined>();
      const latestObservation = ref<ObservationEntity | undefined>();
      const observedProperty = ref<string | undefined>();
      const loadingData = ref(false);
      const chartOptions = computed(
        (): ApexOptions => ({
          chart: {
            id: 'sensorthings-chart',
            // @ts-expect-error {while functionality was already added in version 3.4, type was added in version https://github.com/apexcharts/apexcharts.js/releases/tag/v4.6.0}
            nonce: window.vcs?.styleNonce,
            locales: apexLocales,
            defaultLocale:
              apexLocales.find((l) => l.name === vm.$i18n.locale)?.name || 'en',
            toolbar: {
              export: {
                csv: {
                  columnDelimiter: ';',
                  headerCategory: 'datetime',
                  categoryFormatter(x): string | undefined {
                    if (x !== undefined) {
                      return new Date(x).toISOString();
                    } else {
                      return x;
                    }
                  },
                },
              },
            },
          },
          xaxis: {
            type: 'datetime',
            title: { text: vm.$st('sensorthings.chart.time') },
            labels: {
              datetimeUTC: false,
            },
          },
          yaxis: {
            title: {
              text: vm.$st(yAxisTitle.value || 'sensorthings.chart.count'),
            },
          },
          stroke: {
            width: 2,
          },
          tooltip: {
            x: {
              format: 'dd MMM HH:mm',
            },
            y: {
              title: {
                formatter(): string {
                  return '';
                },
              },
            },
          },
          theme: {
            mode: theme.global.name.value as 'light' | 'dark',
          },
        }),
      );
      const calenderMinMax = ref<string[]>([]);

      async function updateChartData(): Promise<void> {
        const layer = app.layers.getByKey(props.layerName) as SensorThingsLayer;

        if (!observedProperty.value || !startDate.value || !endDate.value) {
          throw new Error('Input data for datastreams query is missing');
        }

        const datastreams = await queryDatastreamsWithObservations(
          layer.url,
          props.featureId,
          observedProperty.value,
          startDate.value,
          endDate.value,
          maxObservations,
        );

        if (!datastreams.length) {
          getLogger(name).warning(
            `No datastreams for observed property: ${layer.observedProperty} available`,
          );
        }

        chartSeries.value = convertDatastreamsToSeries(datastreams);

        datastreams.forEach((datastream) => {
          if (datastream.Observations.length >= maxObservations) {
            app.notifier.add({
              message: vm.$st('sensorthings.limitedObservations', {
                datastream: datastream.name,
                maxObservations,
              }),
              type: NotificationType.WARNING,
              timeout: 10000,
            });
          } else if (!datastream.Observations.length) {
            app.notifier.add({
              message: vm.$st('sensorthings.noObservations', {
                datastream: datastream.name,
              }),
              type: NotificationType.INFO,
              timeout: 10000,
            });
          }
        });
      }

      async function updateGeneralData(): Promise<void> {
        const layer = app.layers.getByKey(props.layerName) as SensorThingsLayer;
        if (!layer?.observedProperty) {
          throw new Error('Layer does not exist or has no observed property');
        }
        observedProperty.value = layer.observedProperty;

        const datastreamWithLatestObservation =
          await queryDatastreamWithLatestObservation(
            layer.url,
            props.featureId,
            layer.observedProperty,
          );
        yAxisTitle.value =
          datastreamWithLatestObservation.unitOfMeasurement.name;
        latestUnitSymbol.value =
          datastreamWithLatestObservation.unitOfMeasurement.symbol;

        latestObservation.value =
          datastreamWithLatestObservation.Observations[0];

        endDate.value = new Date(
          ensurePointInTime(latestObservation.value.phenomenonTime),
        );
        startDate.value = calcInitialStartDate(
          endDate.value,
          props.initialDayObservationRange,
        );

        queryFirstObservation(
          layer.url,
          props.featureId,
          layer.observedProperty,
        )
          .then((observation) => {
            calenderMinMax.value[0] = ensurePointInTime(
              observation.phenomenonTime,
            );
            if (latestObservation.value) {
              calenderMinMax.value[1] = ensurePointInTime(
                latestObservation.value.phenomenonTime,
              );
            }
          })
          .catch((e) => {
            getLogger(name).warning(`Querying first observation failed`, e);
          });
      }

      watch(
        (): string => props.featureId,
        async () => {
          loadingData.value = true;
          await updateGeneralData();
          loadingData.value = false;
        },
        { immediate: true },
      );

      watch([startDate, endDate], async () => {
        if (
          startDate.value &&
          endDate.value &&
          startDate.value > endDate.value
        ) {
          const newEndDate = new Date(startDate.value);
          endDate.value = newEndDate;
        }
        await updateChartData();
      });

      return {
        chartOptions,
        chartSeries,
        startDate,
        endDate,
        observedProperty,
        latestObservationValue: computed(
          () => latestObservation.value?.result ?? '-',
        ),
        latestUnitSymbol,
        latestObservationTime: computed(() => {
          return latestObservation.value
            ? new Date(
                ensurePointInTime(latestObservation.value.phenomenonTime),
              ).toLocaleString(vm.$i18n.locale)
            : '-';
        }),
        calenderMinMax,
        loadingData,
      };
    },
  });
</script>

<style scoped>
  .sensor-things-table {
    border-spacing: 0;
    overflow-wrap: anywhere;
    width: 100%;
  }
  .sensor-things-table tbody tr:nth-child(2n + 1) {
    background-color: rgb(var(--v-theme-base-lighten-4)) !important;
  }
  .sensor-things-table td {
    padding: 0 8px;
    height: calc(var(--v-vcs-font-size) * 2 + 6px);
  }
</style>
