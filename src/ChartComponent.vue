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
            :date-picker-props="{ max: new Date().toISOString() }"
          />
        </v-col>
        <v-col cols="2">
          <VcsLabel>{{ $st('sensorthings.to') }}</VcsLabel>
        </v-col>
        <v-col class="d-flex align-center">
          {{ new Date().toLocaleDateString() }}
        </v-col>
      </v-row>
    </v-container>
    <v-row no-gutters class="pb-3">
      <v-col>
        <apex-chart
          id="test"
          type="line"
          :options="chartOptions"
          :series="chartSeries"
        />
      </v-col>
    </v-row>
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
  import { VRow, VCol, VDivider, VContainer } from 'vuetify/components';
  import ApexChart from 'vue3-apexcharts';
  import type { ApexOptions } from 'apexcharts';
  import type { VcsUiApp } from '@vcmap/ui';
  import { VcsDatePicker, VcsLabel } from '@vcmap/ui';
  import { getLogger } from '@vcsuite/logger';
  import { useTheme } from 'vuetify';
  import type {
    SensorThingsLayer,
    ThingFeatureProperties,
  } from './sensorThingsLayer.js';
  import {
    queryDatastreamsWithObservations,
    type DatastreamEntity,
    type ObservationEntity,
  } from './sensorThingsAPI.js';
  import { name } from '../package.json';

  const maxObservations = 1000;

  function calcInitialStartDate(initialDayObservationRange: number): Date {
    return new Date(
      new Date().getTime() - initialDayObservationRange * 24 * 60 * 60 * 1000,
    );
  }

  /**
   * This function converts the Datastreams with their Observations to a format that can be used by the ApexChart component.
   * @param datastreams The Datastreams with their Observations in descending order
   */
  function convertDatastreamsToSeries(
    datastreams: (DatastreamEntity & { Observations: ObservationEntity[] })[],
  ): ApexAxisChartSeries {
    return datastreams.map((datastream) => {
      return {
        name: datastream.name,
        data: datastream.Observations.slice()
          .reverse()
          .map((observation) => {
            return [
              new Date(observation.phenomenonTime).getTime(),
              observation.result,
            ];
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

      const startDate = ref(
        calcInitialStartDate(props.initialDayObservationRange),
      );
      const chartSeries = ref<ApexAxisChartSeries>([]);
      const yAxisTitle = ref<string | undefined>();
      const latestUnitSymbol = ref<string | undefined>();
      const chartOptions = computed(
        () =>
          ({
            xaxis: {
              type: 'datetime',
              title: { text: vm.$st('sensorthings.chart.time') },
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
              mode: theme.global.name.value,
            },
          }) as ApexOptions,
      );
      const latestObservation = ref<ObservationEntity | undefined>();
      const observedProperty = ref<string | undefined>();

      async function updateData(): Promise<void> {
        const layer = app.layers.getByKey(props.layerName) as SensorThingsLayer;
        if (!layer?.observedProperty) {
          throw new Error('Layer does not exist or has no observed property');
        }
        observedProperty.value = layer.observedProperty;
        const datastreams = await queryDatastreamsWithObservations(
          layer.url,
          props.featureId,
          layer.observedProperty,
          startDate.value,
          maxObservations,
        );

        if (!datastreams.length) {
          getLogger(name).warning(
            `No datastreams for observed property: ${layer.observedProperty} available`,
          );
        }

        yAxisTitle.value = datastreams[0]?.unitOfMeasurement.name;
        latestUnitSymbol.value = datastreams[0]?.unitOfMeasurement.symbol;
        latestObservation.value = datastreams[0]?.Observations[0];
        chartSeries.value = convertDatastreamsToSeries(datastreams);

        if (
          datastreams.some(
            (datastream) => datastream.Observations.length >= maxObservations,
          )
        ) {
          app.notifier.add({
            message: vm.$st('sensorthings.limitedObservations', {
              maxObservations,
            }),
            type: 'warning',
            timeout: 5000,
          });
        }
      }

      watch(
        [(): string => props.featureId, startDate],
        async () => {
          await updateData();
        },
        { immediate: true },
      );

      return {
        chartOptions,
        chartSeries,
        startDate,
        observedProperty,
        latestObservationValue: computed(
          () => latestObservation.value?.result ?? '-',
        ),
        latestUnitSymbol,
        latestObservationTime: computed(() =>
          latestObservation.value
            ? new Date(latestObservation.value.phenomenonTime).toLocaleString()
            : '-',
        ),
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
