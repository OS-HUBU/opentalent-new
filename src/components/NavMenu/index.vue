<template>
  <el-header>
    <div class="logo" v-on:click="goToHome">
      <img src="@/assets/images/headerlogo.png" alt="OpenTalent Logo" class="logo-image" />
      <span class="logo-text">OpenTalent</span>
    </div>
    <el-menu mode="horizontal" :router="false" :default-active="activeIndex">
      <el-menu-item index="/index" @click="handleMenuClick('/index')">首页</el-menu-item>
      <el-menu-item v-if="shouldShowContribution" index="/contribution" @click="handleMenuClick('/contribution')">个人开源贡献详情</el-menu-item>
      <el-menu-item v-if="shouldShowOrgRanking" index="/org-ranking" @click="handleMenuClick('/org-ranking')">组织贡献度排行榜</el-menu-item>
      <el-menu-item v-if="shouldShowDevRanking" index="/dev-ranking" @click="handleMenuClick('/dev-ranking')">开发者贡献度排行榜</el-menu-item>
      <el-menu-item index="ecosystem" @click="handleEcosystemClick($event)">全球开源生态全景图</el-menu-item>
    </el-menu>

    <!-- 未登录状态 -->
    <div v-if="!isLoggedIn" class="user-actions">
      <el-button link class="login-btn" @click="handleLogin('personal')">个人登录</el-button>

      <el-dropdown trigger="hover" @command="handleOrgLogin">
        <el-button link class="login-btn">组织登录</el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="admin">管理员登录</el-dropdown-item>
            <el-dropdown-item command="dept_admin">部门管理员登录</el-dropdown-item>
            <el-dropdown-item command="member">成员登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 已登录状态 -->
    <div v-else class="user-profile">
      <el-dropdown @command="handleCommand">
        <span class="user-avatar">
          <el-avatar :size="32" :src="avatar" />
          <span class="username">{{ username }}</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人中心</el-dropdown-item>
            <el-dropdown-item divided command="logout">注销登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script>
import { ElMessageBox } from 'element-plus'
import { getToken } from '@/utils/auth'
import useUserStore from '@/store/modules/user'

export default {
  name: 'NavMenu',
  data() {
    return {
      activeIndex: '/index',
      username: '',
      avatar: '',
      tokenCheckInterval: null
    }
  },
  computed: {
    isLoggedIn() {
      return !!getToken();
    },
    userRoles() {
      const userStore = useUserStore();
      return userStore.roles || [];
    },
    shouldShowContribution() {
      // 未登录时显示所有菜单项
      if (!this.isLoggedIn) return true;
      // 组织管理员和部门管理员不显示个人开源贡献详情
      return !this.userRoles.includes('orgadmin') && !this.userRoles.includes('dept_admin');
    },
    shouldShowOrgRanking() {
      // 未登录时显示所有菜单项
      if (!this.isLoggedIn) return true;
      // 自由职业者不显示组织贡献度排行榜
      return !this.userRoles.includes('freelancer');
    },
    shouldShowDevRanking() {
      // 未登录时显示所有菜单项
      if (!this.isLoggedIn) return true;
      // 自由职业者不显示开发者贡献度排行榜
      return !this.userRoles.includes('freelancer');
    }
  },
  created() {
    this.updateActiveIndex();
    this.updateUserInfo();
    // 定期检查token状态变化
    this.tokenCheckInterval = setInterval(() => {
      this.$forceUpdate();
    }, 1000);
    window.addEventListener('resetActiveIndex', this.resetActiveIndex);
  },
  beforeUnmount() {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }
    window.removeEventListener('resetActiveIndex', this.resetActiveIndex);
  },
  // beforeUnmount() {
  //   if (this.tokenCheckInterval) {
  //     clearInterval(this.tokenCheckInterval);
  //   }
  // },
  watch: {
    '$route'(to) {
      this.updateActiveIndex();
      // 当路由变化到首页时，重置菜单选中状态
      if (to.path === '/' || to.path === '/index') {
        this.activeIndex = '/index';
      }
    },
    isLoggedIn: {
      handler(newVal) {
        if (newVal) {
          this.updateUserInfo();
        } else {
          this.username = '';
          this.avatar = '';
        }
      },
      immediate: true
    }
  },
  methods: {
    handleMenuClick(path) {
      // 如果当前显示iframe，先关闭它
      this.$emit('hide-ecosystem');
      // 设置当前菜单项为选中状态
      this.activeIndex = path;
      // 手动处理路由跳转
      this.$router.push(path).catch(() => {
        // 如果路由跳转失败（比如被路由守卫拦截），重置为首页选中状态
        this.activeIndex = '/index';
      });
    },
    resetActiveIndex() {
      this.activeIndex = '/index';
    },
    goToHome() {
      this.handleMenuClick('/index');
    },
    updateActiveIndex() {
      // 设置当前激活的菜单项，默认为首页
      const currentPath = this.$route.path;
      if (currentPath === '/' || currentPath === '/index') {
        this.activeIndex = '/index';
      } else {
        this.activeIndex = currentPath;
      }
    },
    handleLogin(command) {
      let userRole = 'freelancer'; // 个人登录默认为freelancer
      if (command === 'personal') {
        userRole = 'freelancer';
      }
      //console.log('个人登录 - userRole:', userRole);
      // 使用query参数传递角色信息，但设置为临时参数
      this.$router.push({
        path: '/login',
        query: { userRole: userRole }
      });
    },
    handleOrgLogin(command) {
      let userRole = 'orgadmin'; // 默认为组织管理员
      if (command === 'admin') {
        userRole = 'orgadmin';
      } else if (command === 'dept_admin') {
        userRole = 'dept_admin';
      } else if (command === 'member') {
        userRole = 'org_member';
      }
      //console.log('组织登录 - userRole:', userRole);
      // 使用query参数传递角色信息，但设置为临时参数
      this.$router.push({
        path: '/login',
        query: { userRole: userRole }
      });
    },
    handleCommand(command) {
      if (command === 'profile') {
        this.$router.push('/user/profile');
      } else if (command === 'logout') {
        this.logout();
      }
    },
    updateUserInfo() {
      if (this.isLoggedIn) {
        const userStore = useUserStore();
        this.username = userStore.name || '用户';
        this.avatar = userStore.avatar || '';
      }
    },
    logout() {
      ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const userStore = useUserStore();
        userStore.logOut().then(() => {
          location.href = '/index';
        })
      }).catch(() => { });
    },
    handleEcosystemClick(event) {
      // 阻止默认的路由跳转
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      if (event && typeof event.stopPropagation === 'function') {
        event.stopPropagation();
      }
      // 先关闭可能存在的iframe
      this.$emit('hide-ecosystem');
      // 设置生态全景图为选中状态
      this.activeIndex = 'ecosystem';
      // 发出事件通知父组件显示iframe
      this.$emit('show-ecosystem');
    }
  }
}
</script>

<style scoped>
.el-header {
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1001;
  /* 确保导航栏始终在iframe之上 */
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 20px;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
  color: #33548d;
  margin-left: 10px;
}

.logo-image {
  height: 40px;
}

.el-menu {
  flex: 1;
  border-bottom: none;
}

/* 菜单项过渡动画 */
.el-menu-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.el-menu-item:hover {
  background-color: rgba(64, 158, 255, 0.1) !important;
  color: #409EFF !important;
  transform: translateY(-1px);
}

.el-menu-item.is-active {
  background-color: rgba(64, 158, 255, 0.15) !important;
  color: #409EFF !important;
  font-weight: 600;
}

/* 菜单项底部指示器动画 */
.el-menu-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 3px;
  background: linear-gradient(90deg, #409EFF, #67C23A);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(-50%);
  border-radius: 2px;
}

.el-menu-item:hover::after {
  width: 80%;
}

.el-menu-item.is-active::after {
  width: 100%;
  background: linear-gradient(90deg, #409EFF, #409EFF);
}

/* 菜单项文字动画 */
.el-menu-item span {
  transition: all 0.2s ease;
  display: inline-block;
}

.el-menu-item:hover span {
  transform: scale(1.05);
}

.el-menu-item.is-active span {
  transform: scale(1.02);
}

.user-actions,
.user-profile {
  margin-left: 20px;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.login-btn {
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 150ms ease;
  outline: none;
}

.login-btn:hover {
  color: #409EFF;
}

.user-profile {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.user-avatar {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.user-avatar:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.username {
  margin-left: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  color: #606266;
  cursor: pointer;
}

.el-button--primary {
  background-color: #131313;
  border-color: #131313;
}

.el-button--primary:focus,
.el-button--primary:hover {
  background: #303030;
  border-color: #303030;
}
</style>