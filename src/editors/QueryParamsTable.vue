<script setup lang="ts">
  import type { VcsAction } from '@vcmap/ui';
  import {
    VcsFormSection,
    VcsDataTable,
    VcsActionButtonList,
    VcsTextField,
  } from '@vcmap/ui';
  import { computed, onUnmounted, ref, watch } from 'vue';

  const url = defineModel<string>({ required: true });

  const parsedUrl = new URL(url.value);
  const searchParams = ref(Array.from(parsedUrl.searchParams.entries()));
  const queryParamItems = computed(() => {
    return searchParams.value.map(([key, value], index) => ({
      seperator: index === 0 ? '?' : '&',
      key,
      equals: '=',
      value,
      actions: [
        {
          name: key,
          icon: 'mdi-delete',
          title: 'sensorthings.editors.dashboard.delete',
          callback(): void {
            searchParams.value.splice(index, 1);
          },
        },
      ],
    }));
  });

  const urlSearchParamEntry = ref<[string, string]>(['', '']);
  const urlSearchParamEntryActions = ref<VcsAction[]>([]);

  function addSearchParamEntry(): void {
    if (!urlSearchParamEntryActions.value[1]?.disabled) {
      searchParams.value.push([...urlSearchParamEntry.value]);
      urlSearchParamEntry.value = ['', ''];
      document.getElementById('dashboard-searchparam-key')?.focus();
    }
  }

  urlSearchParamEntryActions.value = [
    {
      name: 'delete-entries',
      icon: 'mdi-delete',
      title: 'sensorthings.editors.dashboard.deleteAll',
      callback(): void {
        searchParams.value = [];
      },
    },
    {
      name: 'add-entry',
      icon: 'mdi-check',
      title: 'sensorthings.editors.dashboard.addEntry',
      disabled: true,
      callback(): void {
        addSearchParamEntry();
      },
    },
  ];

  watch(
    urlSearchParamEntry,
    (entry) => {
      urlSearchParamEntryActions.value[1].disabled = !(entry[0] && entry[1]);
    },
    { deep: true, immediate: true },
  );

  function decodeTemplateBraces(encodedUrl: string): string {
    return encodedUrl.replace(/([&=?])%7B%7B.*?%7D%7D([&=]|$)/g, (match) =>
      match.replace(/%7B%7B/g, '{{').replace(/%7D%7D/g, '}}'),
    );
  }

  onUnmounted(() => {
    parsedUrl.search = '';
    searchParams.value.forEach(([key, value]) => {
      parsedUrl.searchParams.append(key, value);
    });
    url.value = decodeTemplateBraces(parsedUrl.toString());
  });
</script>

<template>
  <VcsFormSection heading="sensorthings.editors.dashboard.queryParams">
    <VcsDataTable
      :items="queryParamItems"
      :headers="[
        {
          title: '',
          key: 'seperator',
          width: '2ch',
          sortable: false,
        },
        {
          title: 'sensorthings.editors.dashboard.queryKey',
          key: 'key',
          sortable: false,
        },
        {
          title: '',
          key: 'equals',
          width: '2ch',
          sortable: false,
        },
        {
          title: 'sensorthings.editors.dashboard.queryValue',
          key: 'value',
          sortable: false,
        },
        {
          title: '',
          key: 'actions',
          sortable: false,
          align: 'end',
          width: '10px',
        },
      ]"
      :show-searchbar="false"
      :items-per-page="5"
      :no-data-text="$st('sensorthings.editors.dashboard.tableNoData')"
    >
      <template #item.actions="{ item }">
        <VcsActionButtonList :actions="item.actions" right />
      </template>
      <template #body.prepend>
        <tr>
          <td></td>
          <td class="px-1">
            <VcsTextField
              id="dashboard-searchparam-key"
              v-model="urlSearchParamEntry[0]"
              @keydown.enter.prevent="addSearchParamEntry"
              placeholder="param1"
            />
          </td>
          <td>=</td>
          <td class="px-1">
            <VcsTextField
              v-model="urlSearchParamEntry[1]"
              placeholder="A"
              @keydown.enter.prevent="addSearchParamEntry"
            />
          </td>
          <td class="d-flex justify-end align-center">
            <VcsActionButtonList
              :actions="urlSearchParamEntryActions"
              right
              :overflow-count="3"
            />
          </td>
        </tr>
      </template>
    </VcsDataTable>
  </VcsFormSection>
</template>
