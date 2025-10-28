import router from './router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isHttp } from '@/utils/validate'
import { isRelogin } from '@/utils/request'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

NProgress.configure({ showSpinner: false });

const whiteList = ['/register', '/', '/index'];
const loginRequiredPages = ['/contribution', '/org-ranking', '/dev-ranking'];

// 角色权限验证函数
const checkRolePermission = (userRoles, path) => {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }
  
  // 自由职业者角色限制
  if (userRoles.includes('freelancer')) {
    if (path === '/org-ranking' || path === '/dev-ranking') {
      return false;
    }
  }
  
  // 组织管理员和部门管理员角色限制
  if (userRoles.includes('orgadmin') || userRoles.includes('dept_admin')) {
    if (path === '/contribution') {
      return false;
    }
  }
  
  return true;
};

router.beforeEach((to, from, next) => {
  NProgress.start()
  if (getToken()) {
    to.meta.title && useSettingsStore().setTitle(to.meta.title)
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else if (whiteList.indexOf(to.path) !== -1) {
      // 白名单页面直接放行，不需要验证用户信息
      next()
    } else {
      if (useUserStore().roles.length === 0) {
        isRelogin.show = true
        // 判断当前用户是否已拉取完user_info信息
        useUserStore().getInfo().then(() => {
          isRelogin.show = false
          usePermissionStore().generateRoutes().then(accessRoutes => {
            // 根据roles权限生成可访问的路由表
            accessRoutes.forEach(route => {
              if (!isHttp(route.path)) {
                router.addRoute(route) // 动态添加可访问路由表
              }
            })
            next({ ...to, replace: true }) // hack方法 确保addRoutes已完成
          })
        }).catch(err => {
          useUserStore().logOut().then(() => {
            ElMessage.error(err)
            next({ path: '/' })
          })
        })
      } else {
        // 检查角色权限
        const userRoles = useUserStore().roles;
        if (!checkRolePermission(userRoles, to.path)) {
          ElMessage({
            message: '您没有权限访问该页面',
            type: 'warning',
            duration: 3000,
            showClose: true
          });
          next('/'); // 重定向到首页
          NProgress.done();
          return;
        }
        next()
      }
    }
  } else {
    // 没有token
    if (to.path === '/login') {
      // 检查是否有有效的userRole信息（从query参数获取）
      const userRole = to.query?.userRole;
      //console.log('路由守卫 - to.query:', to.query);
      //console.log('路由守卫 - userRole:', userRole);
      
      if (!userRole) {
        // 如果没有userRole信息，重定向到首页
        ElMessage({
          message: '请先从首页选择登录方式',
          type: 'warning',
          duration: 3000,
          showClose: true
        });
        next('/');
        NProgress.done();
        return;
      }
      next();
    } else if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next()
    } else if (loginRequiredPages.indexOf(to.path) !== -1) {
      // 需要登录的页面，显示提示信息
      ElMessage({
        message: '该功能需要登录后才能查看，请先登录',
        type: 'warning',
        duration: 3000,
        showClose: true
      });
      next('/'); // 跳转到首页
      window.dispatchEvent(new CustomEvent('resetActiveIndex'));
      NProgress.done();
    } else {
      next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
