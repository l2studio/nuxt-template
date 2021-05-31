<template>
  <div class="tw-p-4">
    <p>Counter: {{ counter }}</p>
    <button class="tw-px-3 tw-py-2 tw-bg-blue-600 tw-text-white tw-text-sm tw-rounded" @click="counter++">Add</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'home',
  setup () {
    const counter = ref(0)
    return {
      counter
    }
  }
})
</script>
