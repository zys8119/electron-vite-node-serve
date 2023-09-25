<template>
  <div>
    <input v-model="text" type="text" placeholder="百度搜索" @keyup.enter="search" />
    <button @click="search">搜索</button>
    <div v-if="info.code === 200">
      <div v-for="(item, key) in info.data" :key="key">{{ item }}</div>
    </div>
    <div v-else>{{ info.data }}</div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const text = ref('')
const info = ref<any>({})
const search = async () => {
  info.value = await fetch(`http://localhost:80/test?search=${text.value}`).then((res) =>
    res.json()
  )
}
</script>
<style lang="less">
@import './assets/css/styles.less';
</style>
