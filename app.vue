<script setup lang="ts">
useSeoMeta({
  ogImage: 'https://fastsend.ing/ogImg.webp',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Fast Send',
  twitterDescription: 'Fast peer-to-peer file and directory transfers',
  twitterImage: 'https://fastsend.ing/ogImg.webp',
  twitterSite: 'https://fastsend.ing',
  twitterCreator: 'ShouChen_'
})

const deferredPrompt = useState('deferredPrompt')

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    deferredPrompt.value = e
    // console.log(e)
  })
  useFullScreenLoader(false)

  fetch('/banner.txt')
    .then((res) => res.text())
    .then(console.log)
})
</script>

<template>
  <NuxtPwaManifest />
  <NuxtRouteAnnouncer />
  <FullScreenLoader />
  <Toast position="top-right" />
  <NavBar />
  <NuxtPage />
  <AppFooter />
  <ScrollTop />
  <InstallPWA />
  <DocPanel />
</template>
