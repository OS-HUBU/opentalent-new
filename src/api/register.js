import request from '@/utils/request'

/**
 * 组织注册
 * @param {Object} data 组织注册数据
 */
export function registerOrganization(data) {
  return request({
    url: '/register/org',
    headers: {
      isToken: false,
      repeatSubmit: false
    },
    method: 'post',
    data: data
  })
}

/**
 * 自由职业者注册
 * @param {Object} data 自由职业者注册数据
 */
export function registerFreelancer(data) {
  return request({
    url: '/register/freeman',
    headers: {
      isToken: false,
      repeatSubmit: false
    },
    method: 'post',
    data: data
  })
}

/**
 * 组织管理员为单个成员注册
 * @param {Object} data 组织成员注册数据
 */
export function registerOrgMember(data) {
  return request({
    url: '/register/org/member',
    method: 'post',
    data: data
  })
}


/**
 * 部门管理员为单个成员注册
 * @param {Object} data 部门成员注册数据
 */
export function registerDeptMember(data) {
  return request({
    url: '/register/dept/member',
    method: 'post',
    data: data
  })
}


/**
 * 获取地区树数据
 */
export function getRegionTree() {
  return request({
    url: '/regions/tree',
    headers: {
      isToken: false
    },
    method: 'get'
  })
}
