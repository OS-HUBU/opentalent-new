<template>
  <div class="home-page">
    <NavMenu ref="navMenu" @show-ecosystem="showEcosystem" @hide-ecosystem="hideEcosystem"></NavMenu>
    
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
    
    <!-- 主页内容 - 添加过渡动画 -->
    <transition name="content-fade">
      <div v-show="!showIframe" class="container">
        <div class="content">
          <h1 class="main-title"><span class="highlight">Open</span>Talent</h1>
          <div class="rounded-line"></div>
          <p class="sub-title">贡献导向的全球开源人才评价系统</p>
          <p class="description">
            OpenTalent: A Global Talent Evaluation System Based on Open Source
            Contribution
          </p>
          <p class="slogan">北极照耀星空，开源点亮未来</p>

          <div class="search-box">
            <el-select v-model="value" placeholder="请选择">
              <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
            <input type="text" class="transparent-input">
          </div>

          <div class="powered-by">
            <div style="font-size: 20px; display: inline-block; margin-right: 30px" >Powered by</div>
             <img src="@/assets/images/OS-HUBU.png" class="powered-logo">
            <div class="short-line"></div>
            <img src="@/assets/images/XLabLogo-white.png" class="powered-logo">
            <div class="short-line"></div>
            <img src="@/assets/images/openTalentLogo-white.png" class="powered-logo">
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import NavMenu from "@/components/NavMenu/index.vue";

export default {
  name: "Homepage",
  components: {
    NavMenu
  },
  data() {
    return {
      options: [{
        value: '选项1',
        label: '关键指标'
      }],
      value: '选项1',
      showIframe: false,
      iframeSrc: 'https://openatom-dashboard.x-lab.info/'
    }
  },
  methods: {
    showEcosystem() {
      this.showIframe = true;
      // 添加ESC键监听
      document.addEventListener('keydown', this.handleKeyDown);
    },
    hideEcosystem() {
      this.showIframe = false;
      // 移除ESC键监听
      document.removeEventListener('keydown', this.handleKeyDown);
      // 通知NavMenu组件恢复首页选中状态
      this.$refs.navMenu?.updateActiveIndex();
    },
    handleKeyDown(event) {
      // 按ESC键关闭iframe
      if (event.key === 'Escape' && this.showIframe) {
        this.hideEcosystem();
      }
    }
  },
  beforeUnmount() {
    // 组件销毁时移除事件监听
    document.removeEventListener('keydown', this.handleKeyDown);
  }
};
</script>

<style>
.home-page .search-box .el-select {
  width: 130px;
}

.home-page .search-box .el-input__inner {
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  text-align: center;
  color: #fff !important;
  border: 1px solid #326AFF;
  background: #6c63ff !important;
  font-size: 16px;
  letter-spacing: 2px;
}

.home-page .search-box /deep/.el-select-dropdown__item.selected {
  color: #6c63ff !important;
}

.home-page .el-select-dropdown__item{
  color:#6c63ff !important;
}

.home-page .container {
  position: relative;
  height: 100vh;
  width: 100%;
  background-color: #000;
  overflow: hidden;
  color: #fff;
  display: flex;
}

.home-page .content{
  position: absolute;
  left: 10%;
  top: 5%;
}

.home-page .main-title {
  font-size: 6rem;
  font-weight: bold;
  margin-bottom: 40px;
}

.home-page .main-title .highlight {
  color: #6c63ff;
}

.home-page .rounded-line {
  width: 100px;
  height: 3px;
  background-color: #FFF;
  border-radius: 1px;
  overflow: hidden;
}

.home-page .sub-title {
  font-size: 1.6rem;
  margin-top: 30px;
  margin-bottom: 0px;
}

.home-page .description {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 80px;
}

.home-page .slogan{
  font-size: 1.3rem;
  opacity: 0.9;
  margin-bottom: 30px;
}

.home-page .powered-by{
  display: flex;
  align-items: center;
  letter-spacing: 1px;
}

.home-page .powered-logo{
  height: 45px;
}

.home-page .short-line {
  width: 1px;
  height: 30px;
  background-color: white;
  margin: 30px;
}

.home-page .search-box {
  margin-top: 40px;
  margin-bottom: 40px;
  width: 660px;
  height: 50px;
  border: 2px solid #FFFFFF;
  display: flex;
  align-items: center;
  border-radius: 10px;
  padding-left: 6px;
}

.home-page .transparent-input {
  width: 520px;
  margin: 0 10px;
  border: none;
  background-color: transparent;
  color: #FFF;
  font-size: 17px;
  outline: none;
  box-shadow: none;
}

.home-page .transparent-input::placeholder {
  color: #FFF;
}

/* iframe相关样式 */
 .home-page .iframe-container {
   position: fixed;
   top: 60px; /* 调整为更小的值，测试紧贴效果 */
   left: 0;
   right: 0;
   bottom: 0;
   background: #fff;
   z-index: 1000;
 }
 
 .home-page .ecosystem-iframe {
   width: 100%;
   height: 100%; /* 占满容器全部高度 */
   border: none;
   margin: 0;
 }
 
/* iframe过渡动画 */
.iframe-fade-enter-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.iframe-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.iframe-fade-enter-from {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

.iframe-fade-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(1.05);
}

/* 主页内容过渡动画 */
.content-fade-enter-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-fade-enter-from {
  opacity: 0;
  transform: translateY(50px) scale(0.9);
}

.content-fade-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(1.1);
}

/* 内容元素的交错动画效果 */
.home-page .content > * {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 页面加载时的交错动画延迟 */
.home-page .main-title {
  animation: slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;
}

.home-page .rounded-line {
  animation: slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
}

.home-page .sub-title {
  animation: slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both;
}

.home-page .description {
  animation: slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both;
}

.home-page .slogan {
  animation: slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.5s both;
}

.home-page .search-box {
  animation: slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s both;
}

.home-page .powered-by {
  animation: slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.7s both;
}

/* 定义slideInUp动画 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式动画优化 */
@media (prefers-reduced-motion: reduce) {
  .home-page .content > *,
  .iframe-fade-enter-active,
  .iframe-fade-leave-active,
  .content-fade-enter-active,
  .content-fade-leave-active {
    transition: none;
    animation: none;
  }
}
</style>