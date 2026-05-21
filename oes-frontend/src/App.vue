<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from './store'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

onMounted(async () => {
  userStore.initLoginState()
  if (userStore.token) {
    const isValid = await userStore.verifyLoginState()
    if (!isValid) {
      router.push('/login')
    }
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: 'Inter', 'system-ui', sans-serif;
}

#app {
  height: 100%;
}
</style>
