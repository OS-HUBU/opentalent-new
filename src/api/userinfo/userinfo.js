import request from '@/utils/request'

// 查询当前组织下成员基础信息列表
export function listOrgMemberInfo(query) {
  return request({
    url: '/userinfo/org/memberlist',
    method: 'get',
    params: query
  })
}

// 查询当前部门下成员基础信息列表
export function listDeptMemberInfo(query) {
  return request({
    url: '/userinfo/dept/memberlist',
    method: 'get',
    params: query
  })
}

// 查询用户基础信息详细
export function getUserinfo(userId) {
  return request({
    url: `/userinfo/${userId}`,
    method: 'get',
  })
}

// 新增用户基础信息
export function addUserinfo(data) {
  return request({
    url: '/userinfo',
    method: 'post',
    data: data
  })
}


// 修改用户基础信息
export function updateUserinfo(data) {
  return request({
    url: '/userinfo',
    method: 'put',
    data: data
  })
}

// 删除用户基础信息
export function delUserinfo(userId) {
  return request({
    url: '/userinfo/' + userId,
    method: 'delete'
  })
}

// 查询用户类型树
export function getUserTypeTree() {
  return request({
  url: '/userinfo/usertype/tree',
  method: 'get'
  })
}

// 查询用户个人信息
export function getUserDetail() {
  return request({
    url: '/userinfo/userprofile',
    method: 'get',
  })
}

//查询所有启用状态的平台列表
export function getPlatformList() {
  return request({
    url: '/platform/list',
    method: 'get'
  })
}

//获取自由职业者实名认证证件类型列表
export function getCredentialTypeListForFreelancer() {
  return request({
    url: '/register/freelancer/idTypes',
    method: 'get'
  })
}

//获取组织内部成员实名认证证件类型列表
export function getCredentialTypeListForOrgmember() {
  return request({
    url: '/register/orgmember/idTypes',
    method: 'get'
  })
}

//增加平台账号信息
export function addUserPlatform(data) {
  return request({
    url: '/userPlatform',
    method: 'post',
    data : data
  })
}

//修改平台账号信息
export function updateUserPlatform(data) {
  return request({
    url: '/userPlatform',
    method: 'put',
    data : data
  })
}

//删除平台账号信息
export function deleteUserPlatform(recordId) {
  return request({
    url: `/userPlatform/${recordId}`,
    method: 'delete'
  })
}

//获取用户平台账号列表
export function getUserPlatformList(userId) {
  return request({
    url: `/userPlatform/list/${userId}`,
    method: 'get'
  })
}

//校验平台账号唯一性
export function checkUserPlatform(platformId,platformUsername,userId) {
  return request({
    url: '/userPlatform/check-unique',
    method: 'get',
    params: {
      platformId: platformId,
      platformUsername: platformUsername,
      userId: userId
    }
  })
}

// 获取国籍列表
export function getNationalityList() {
  return request({
    url: '/nationality/list',
    method: 'get'
  })
}

// 分配用户部门
export function assignUserDepartments(data) {
  return request({
    url: '/department/assign',
    method: 'post',
    data: data
  })
}

// 批量注册组织成员（异步处理）
export function batchUploadOrgMembersFileOptimized(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/register/batchUploadOrgMembersFileOptimized',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 批量注册部门成员（异步处理）
export function batchUploadDeptMembersFileOptimized(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/register/batchUploadDeptMembersFile',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 查询批量注册进度
export function getProgress(taskId) {
  return request({
    url: `/register/getProgress/${taskId}`,
    method: 'get'
  })
}

//自由职业者实名认证记录列表
export function getFreelancerIdentityVerificationList(params) {
    return request({
        url: '/userinfo/freelancer/verificationlist',
        method: 'get',
        params // 支持分页参数
    })
}


//系统管理员审核自由职业者实名认证记录
export function auditFreelancerIdentityVerification(verifyId, data) {
  return request({
    url: `/userinfo/audit-verification/${verifyId}`,
    method: 'post',
    params: data
  })
}