<template>
  <div class="login-container">
    <!-- 左侧品牌区域 -->
    <div class="brand-section">
      <div class="brand-content">
        <div class="logo-section">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1 class="brand-title">OpenTalent</h1>
        </div>
        <p class="brand-subtitle">开源人才评价平台</p>
        <p class="brand-description">
          基于开源贡献数据，为开发者提供全面的技能评估和职业发展建议
        </p>
        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon">📊</div>
            <span>数据驱动的人才评估</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🚀</div>
            <span>开源贡献可视化</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🎯</div>
            <span>精准技能匹配</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录区域 -->
    <div class="login-section">
      <div class="login-card">
        <div class="login-header">
          <h2 class="login-title">欢迎回来</h2>
          <p class="login-subtitle">请登录您的账户</p>
        </div>
        
        <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              type="text"
              size="large"
              auto-complete="off"
              placeholder="请输入用户名"
              class="custom-input"
            >
              <template #prefix>
                <el-icon class="input-icon"><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              size="large"
              auto-complete="off"
              placeholder="请输入密码"
              class="custom-input"
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <el-icon class="input-icon"><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item prop="code" v-if="captchaEnabled">
            <div class="captcha-container">
              <el-input
                v-model="loginForm.code"
                size="large"
                auto-complete="off"
                placeholder="验证码"
                class="custom-input captcha-input"
                @keyup.enter="handleLogin"
              >
                <template #prefix>
                  <el-icon class="input-icon"><Key /></el-icon>
                </template>
              </el-input>
              <div class="captcha-image" @click="getCode">
                <img :src="codeUrl" alt="验证码" />
              </div>
            </div>
          </el-form-item>
          
          <div class="login-options">
            <el-checkbox v-model="loginForm.rememberMe" class="remember-me">
              记住密码
            </el-checkbox>
            <router-link to="/forgot" class="forgot-password">忘记密码？</router-link>
          </div>
          
          <el-form-item class="login-button-item">
            <el-button
              :loading="loading"
              size="large"
              type="primary"
              class="login-button"
              @click.prevent="handleLogin"
            >
              <span v-if="!loading">登录</span>
              <span v-else>登录中...</span>
            </el-button>
          </el-form-item>
          
          <div class="register-link" v-if="register">
            <span>还没有账户？</span>
            <a href="#" @click.prevent="goToRegister">立即注册</a>
          </div>
        </el-form>
      </div>
    </div>
    
    <!-- 底部版权信息 -->
    <div class="footer">
      <span>© 2024 OpenTalent. All rights reserved.</span>
    </div>
  </div>
</template>

<script setup>
import { getCodeImg } from "@/api/login";
import { 
  login,
  orgAdminLogin, 
  deptAdminLogin, 
  orgMemberLogin, 
  freelancerLogin,
} from "@/api/member/member";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import { getToken, setToken, removeToken } from "@/utils/auth";
import useUserStore from '@/store/modules/user'
import usePermissionStore from '@/store/modules/permission'
import { User, Lock, Key } from '@element-plus/icons-vue'
import { nextTick } from 'vue'

const userStore = useUserStore()
const permissionStore = usePermissionStore()
const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();

const loginForm = ref({
  username: "",
  password: "",
  rememberMe: false,
  code: "",
  uuid: ""
});
// 初始化loginUserType，从query参数获取userRole
const initLoginUserType = () => {
  const userRole = route.query?.userRole;
  return userRole === 'orgadmin' ? 'org' : 'personal';
};

const loginUserType = ref(initLoginUserType());

watch(route, () => {
  const userRole = route.query?.userRole;
  if (userRole === 'orgadmin') {
    loginUserType.value = 'org';
  } else {
    loginUserType.value = 'personal';
  }
}, { immediate: true });
//  username: "admin",
//   password: "admin123",

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
};

const codeUrl = ref("");
const loading = ref(false);
// 验证码开关
const captchaEnabled = ref(true);
// 注册开关 - 根据userRole信息控制，默认显示注册
const register = computed(() => {
  const userRole = route.query?.userRole;
  // 如果没有userRole信息，默认显示注册
  // 如果有userRole信息，只有orgadmin和freelancer可以注册
  if (!userRole) {
    return true;
  }
  return userRole === 'orgadmin' || userRole === 'freelancer';
});
const redirect = ref(undefined);

watch(route, (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect;
}, { immediate: true });

// 根据用户角色选择对应的登录方法
function getLoginMethod(username) {
  // 首先检查是否为系统管理员账号
  if (isSystemAdmin(username)) {
    return login;
  }
  
  const userRole = route.query?.userRole;
  
  switch(userRole) {
    case 'orgadmin':
      return orgAdminLogin;
    case 'deptadmin':
      return deptAdminLogin;
    case 'orgmember':
      return orgMemberLogin;
    case 'freelancer':
      return freelancerLogin;
    default:
      // 默认使用通用登录方法
      return login;
  }
}

// 判断是否为系统管理员账号
function isSystemAdmin(username) {
  // 可以根据实际需求调整判断逻辑
  const adminUsernames = ['admin', 'administrator', 'root', 'sysadmin'];
  return adminUsernames.includes(username.toLowerCase()) || username.toLowerCase().startsWith('admin');
}

function handleLogin() {
  proxy.$refs.loginRef.validate(valid => {
    if (valid) {
      loading.value = true;
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 });
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 });
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 });
      } else {
        // 否则移除
        Cookies.remove("username");
        Cookies.remove("password");
        Cookies.remove("rememberMe");
      }

      // 根据用户名和角色选择对应的登录方法
      const loginMethod = getLoginMethod(loginForm.value.username);
      const userRole = route.query?.userRole;
      
      console.log('当前登录角色:', userRole);
      console.log('使用的登录方法:', loginMethod.name);

      loginMethod(loginForm.value.username, loginForm.value.password, loginForm.value.code, loginForm.value.uuid)
        .then(loginRes => {
          // 设置token到本地存储和store
          if (loginRes.token) {
            setToken(loginRes.token);
            userStore.token = loginRes.token;
          }
          
          // 处理后端返回的用户角色信息
          if (loginRes.userRole) {
            console.log('后端返回的用户角色:', loginRes.userRole);
          }
          
          // 处理激活状态
          if (loginRes.isActivated === false) {
            proxy.$modal.msgWarning(loginRes.message || "账号未激活，请前往个人中心完善信息并进行实名认证");
          }
          
          // 登录成功后获取用户信息
          return userStore.getInfo();
        })
        .then(() => {
          // 获取用户信息成功后，生成动态路由
          return permissionStore.generateRoutes();
        })
        .then(() => {
          // 动态路由加载完成后，进行跳转
          loading.value = false;
          
          // 获取用户角色（从roles数组中获取）
          const userRoles = userStore.roles || []; // 确保是数组
          const userRole = userRoles.length > 0 ? userRoles[0] : null; // 获取第一个角色
          console.log('登录成功后的用户角色:', userRole);
          console.log("token值",userStore.token);

          // 根据角色确定跳转路径
          let targetPath = '/'; // 默认首页
          
         switch(userRole) {
          case 'admin':
            targetPath = '/system/user'; // 系统管理员跳转到用户管理
            break;
          case 'root':
            targetPath = '/admin/member'; // 系统管理员跳转到用户管理
            break;
          case 'org_admin':
            targetPath = '/org/orgcenter'; // 组织管理员跳转到组织中心
            break;
          case 'dept_admin':
            targetPath = '/dept/userinfo'; // 部门管理员跳转到部门管理
            break;
          case 'org_member':
            targetPath = '/user/profile'; // 组织成员跳转到个人中心
            break;
          case 'freelancer':
            targetPath = '/'; // 自由职业者跳转到首页
            break;
          default:
            targetPath = '/'; // 默认首页
        }
          
          // 跳转到目标页面
          router.push({ path: targetPath });
        })
        .catch(loginErr => {
          console.log('登录失败:', loginErr);
          loading.value = false;
          
          // 显示错误信息
          if (loginErr.message) {
            proxy.$modal.msgError(loginErr.message);
          }
          
          // 重新获取验证码
          if (captchaEnabled.value) {
            getCode();
          }
        });
    }
  });
}

function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled;
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img;
      loginForm.value.uuid = res.uuid;
    }
  });
}

function getCookie() {
  const username = Cookies.get("username");
  const password = Cookies.get("password");
  const rememberMe = Cookies.get("rememberMe");
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  };
}

function goToRegister() {
  // 使用query参数传递type参数
  router.push({
    path: '/register',
    query: { type: loginUserType.value}
  });
}

getCode();
getCookie();
</script>

<style lang='scss' scoped>
@import '@/assets/styles/login.scss';
</style>
