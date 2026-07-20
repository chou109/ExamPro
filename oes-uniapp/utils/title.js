import { watch } from 'vue'
import { useUserStore } from '../store/index.js'

export const usePageTitle = (titleKey) => {
  const userStore = useUserStore()
  
  const setTitle = () => {
    const title = userStore.t(titleKey)
    if (title && title !== titleKey) {
      uni.setNavigationBarTitle({
        title: title
      })
    }
  }

  watch(() => userStore.language, () => {
    setTitle()
  }, { immediate: true })

  return { setTitle }
}

export const initPageTitle = (titleKey) => {
  const userStore = useUserStore()
  const title = userStore.t(titleKey)
  if (title && title !== titleKey) {
    uni.setNavigationBarTitle({
      title: title
    })
  }
}