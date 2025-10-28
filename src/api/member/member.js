import request from '@/utils/request'


// 查询系统登录账户信息列表
export function listMember(query) {
  return request({
    url: '/member/list',
    method: 'get',
    params: query
  })
}

// 通用登录方法，如系统管理员登录时
export function login(username, password, code, uuid) {
  const data = {
    username,
    password,
    code,
    uuid
  }
  return request({
    url: '/member/login',
    headers: {
      isToken: false,
      repeatSubmit: false
    },
    method: 'post',
    data: data
  })
}

// 组织管理员登录方法
export function orgAdminLogin(username, password, code, uuid) {
  const data = {
    username,
    password,
    code,
    uuid
  }
  return request({
    url: '/member/org-admin/login',
    headers: {
      isToken: false,
      repeatSubmit: false
    },
    method: 'post',
    data: data
  })
}

// 部门管理员登录方法
export function deptAdminLogin(username, password, code, uuid) {
  const data = {
    username,
    password,
    code,
    uuid
  }
  return request({
    url: '/member/dept-admin/login',
    headers: {
      isToken: false,
      repeatSubmit: false
    },
    method: 'post',
    data: data
  })
}

// 组织成员登录方法
export function orgMemberLogin(username, password, code, uuid) {
  const data = {
    username,
    password,
    code,
    uuid
  }
  return request({
    url: '/member/org-member/login',
    headers: {
      isToken: false,
      repeatSubmit: false
    },
    method: 'post',
    data: data
  })
}

// 自由职业者登录方法
export function freelancerLogin(username, password, code, uuid) {
  const data = {
    username,
    password,
    code,
    uuid
  }
  return request({
    url: '/member/freelancer/login',
    headers: {
      isToken: false,
      repeatSubmit: false
    },
    method: 'post',
    data: data
  })
}

// 查询系统登录账户信息详细
export function getMember(userId) {
  return request({
    url: '/member/' + userId,
    method: 'get'
  })
}

// 新增系统登录账户信息
export function addMember(data) {
  return request({
    url: '/member',
    method: 'post',
    data: data
  })
}

// 修改系统登录账户信息
export function updateMember(data) {
  return request({
    url: '/member',
    method: 'put',
    data: data
  })
}

// 删除系统登录账户信息
export function delMember(userId) {
  return request({
    url: '/member/' + userId,
    method: 'delete'
  })
}

// 重置用户密码
export function resetMemberPwd(userId, password) {
  const data = {
    userId,
    password
  }
  return request({
    url: '/member/resetPwd',
    method: 'put',
    data: data
  })
}

// 用户状态修改
export function changeMemberStatus(userId, status) {
  const data = {
    userId,
    status
  }
  return request({
    url: '/member/changeStatus',
    method: 'put',
    data: data
  })
}
