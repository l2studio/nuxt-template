<template>
  <div class="tw-p-4">
    <p>Counter: {{ counter }}</p>
    <button class="tw-px-3 tw-py-2 tw-bg-blue-600 tw-text-white tw-text-sm tw-rounded" @click="counter++">Add</button>
    <p v-if="api">{{ api.ok ? api : api.message }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'home',
  setup (props, { root }) {
    const counter = ref(0)
    const api = ref()
    const dispose = watch(counter, (newValue) => {
      if (newValue === 10) {
        dispose()
        root.$axios.$get<{ ok: boolean, apikey: string }>('/api', { params: { apikey: 'hello' } })
          .then((data) => { api.value = data })
          .catch((err) => { api.value = err })
      }
    })
    return {
      counter,
      api
    }
  }
})
</script>
