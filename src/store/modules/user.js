import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import defAva from '@/assets/images/profile.jpg'

const useUserStore = defineStore(
  'user',
  {
    state: () => ({
      token: getToken(),
      id: '',
      name: '',
      avatar: '',
      roles: [],
      permissions: [],
      isActivated: localStorage.getItem('isActivated') === 'true' || false, 
      //isActivated: false,
    }),
    actions: {
      // 登录
      login(userInfo) {
        const username = userInfo.username.trim()
        const password = userInfo.password
        const code = userInfo.code
        const uuid = userInfo.uuid
        return new Promise((resolve, reject) => {
          login(username, password, code, uuid).then(res => {
            setToken(res.token)
            this.token = res.token
            resolve()
          }).catch(error => {
            reject(error)
          })
        })
      },
      // 获取用户信息
      getInfo() {
        return new Promise((resolve, reject) => {
          getInfo().then(res => {
            const user = res.user
            const avatar = (user.avatar == "" || user.avatar == null) ? defAva : import.meta.env.VITE_APP_BASE_API + user.avatar;

            if (res.roles && res.roles.length > 0) { // 验证返回的roles是否是一个非空数组
              this.roles = res.roles
              this.permissions = res.permissions
            } else {
              this.roles = ['ROLE_DEFAULT']
            }
            this.id = user.userId
            this.name = user.userName
            this.avatar = avatar

            // 从localStorage获取激活状态，如果没有则保持当前值
            const storedActivated = localStorage.getItem('isActivated')
            if (storedActivated !== null) {
              this.isActivated = storedActivated === 'true'
            }

            resolve(res)
          }).catch(error => {
            reject(error)
          })
        })
      },

      // 设置激活状态
      setActivated(status) {
        this.isActivated = status
        // 持久化存储到localStorage
        localStorage.setItem('isActivated', status.toString())
      },

      // 退出系统
      logOut() {
        return new Promise((resolve, reject) => {
          logout(this.token).then(() => {
            this.token = ''
            this.roles = []
            this.permissions = []
            this.isActivated = false
            removeToken()
            localStorage.removeItem('isActivated')
            resolve()
          }).catch(error => {
            reject(error)
          })
        })
      },

    }
  })

export default useUserStore
