<template>
  <div class="nav-layout-wrapper">
    <!-- 顶部导航栏 -->
    <div class="nav-header">
      <nav-menu @show-ecosystem="showEcosystem" @hide-ecosystem="hideEcosystem" />
    </div>
    
    <!-- iframe容器 - 添加过渡动画 -->
    <transition name="iframe-fade" appear>
      <div v-if="showIframe" class="iframe-container">
        <iframe 
          :src="iframeSrc" 
          class="ecosystem-iframe"
          frameborder="0"
          allowfullscreen>
        </iframe>
      </div>
    </transition>
    
    <!-- 主内容区域 -->
    <div v-show="!showIframe" class="nav-main-container">
      <router-view v-slot="{ Component, route }">
        <keep-alive :include="tagsViewStore.cachedViews">
          <component v-if="!route.meta.link" :is="Component" :key="route.path"/>
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import NavMenu from '@/components/NavMenu/index.vue'
import useTagsViewStore from '@/store/modules/tagsView'

const tagsViewStore = useTagsViewStore()

// iframe相关状态
const showIframe = ref(false)
const iframeSrc = ref('https://openatom-dashboard.x-lab.info/')

// 显示生态全景图
const showEcosystem = () => {
  showIframe.value = true
  // 添加ESC键监听
  document.addEventListener('keydown', handleKeyDown)
}

// 隐藏生态全景图
const hideEcosystem = () => {
  showIframe.value = false
  // 移除ESC键监听
  document.removeEventListener('keydown', handleKeyDown)
}

// ESC键处理
const handleKeyDown = (event) => {
  // 按ESC键关闭iframe
  if (event.key === 'Escape' && showIframe.value) {
    hideEcosystem()
  }
}

// 组件销毁时移除事件监听
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style lang="scss" scoped>
.nav-layout-wrapper {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.nav-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-main-container {
  flex: 1;
  width: 100%;
  height: calc(100vh - 60px); /* 固定主内容高度，避免外层滚动 */
  overflow: auto;
}

/* iframe容器样式 */
.iframe-container {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  z-index: 1000;
}

.ecosystem-iframe {
  width: 100%;
  height: 100%;
  border: none;
  margin: 0;
}

/* iframe过渡动画 */
.iframe-fade-enter-active,
.iframe-fade-leave-active {
  transition: opacity 0.3s ease;
}

.iframe-fade-enter-from,
.iframe-fade-leave-to {
  opacity: 0;
}

.iframe-fade-enter-to,
.iframe-fade-leave-from {
  opacity: 1;
}
</style>