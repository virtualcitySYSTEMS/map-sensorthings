<script setup lang="ts">
  import { VRow, VCol } from 'vuetify/components';
  import {
    VcsImportComponent,
    VcsLabel,
    VcsSelect,
    VcsCheckbox,
    VcsFormSection,
  } from '@vcmap/ui';
  import { ref } from 'vue';
  import { parseId } from '../dashboardFeatureInfoView.js';

  const emit = defineEmits<{ imported: (number | string)[][][] }>();
  const props = defineProps<{ maximumRows?: number }>();

  const hasHeading = ref(true);
  const encodings = [
    'utf-8', // Universal encoding, most common
    'utf-16le', // Windows Unicode
    'utf-16be', // Big endian UTF-16
    'iso-8859-1', // Western European
    'iso-8859-2', // Central European
    'iso-8859-15', // Updated Western European with Euro sign
    'windows-1252', // Windows Western European
    'windows-1250', // Windows Central European
    'ascii', // Basic ASCII, fallback option
  ];
  const selectedEncoding = ref(encodings[0]);
  const delimiter = [
    { value: ';', title: ';' },
    { value: ',', title: ',' },
    { value: ' ', title: '[Space]' },
    { value: '\t', title: '[Tab]' },
    { value: '|', title: '|' },
  ];
  const selectedDelimiter = ref(delimiter[0].value);

  function readCsv(files: File[]): Promise<boolean> {
    return new Promise((resolve) => {
      if (!files[0]) {
        resolve(false);
      }

      const reader = new FileReader();
      const startIndex = hasHeading.value ? 1 : 0;
      const endIndex = props.maximumRows
        ? startIndex + props.maximumRows
        : undefined;

      reader.onload = (): void => {
        const parsedResult = (reader.result as string)
          .split(/\r?\n/)
          .slice(startIndex, endIndex)
          .filter((row) => row.trim() !== '')
          .map((row) => row.split(selectedDelimiter.value).map(parseId));
        emit('imported', parsedResult);
        resolve(true);
      };

      reader.onerror = (): void => {
        resolve(false);
        throw new Error(
          'Reading the file failed. Please make sure the csv file is valid.',
        );
      };

      reader.readAsText(files[0], selectedEncoding.value);
    });
  }
</script>

<template>
  <VcsImportComponent
    :import-files="readCsv"
    :file-types="['.csv']"
    :multiple="false"
  >
    <template #default>
      <VcsFormSection
        heading="sensorthings.editors.csv.options"
        expandable
        start-open
        class="pt-2"
      >
        <template #help v-if="maximumRows">
          {{ $st('sensorthings.editors.csv.limit', { maximumRows }) }}
        </template>
        <v-row no-gutters>
          <v-col>
            <VcsLabel html-for="csv-encoding">{{
              $st('sensorthings.editors.csv.encoding')
            }}</VcsLabel>
          </v-col>
          <v-col>
            <VcsSelect
              v-model="selectedEncoding"
              :items="encodings"
              id="csv-encoding"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel html-for="csv-delimiter">{{
              $st('sensorthings.editors.csv.delimiter')
            }}</VcsLabel>
          </v-col>
          <v-col>
            <VcsSelect
              v-model="selectedDelimiter"
              :items="delimiter"
              id="csv-delimiter"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsCheckbox
              label="sensorthings.editors.csv.hasHeading"
              v-model="hasHeading"
            />
          </v-col>
        </v-row>
      </VcsFormSection>
    </template>
  </VcsImportComponent>
</template>
