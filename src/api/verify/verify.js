import request from '@/utils/request'

// 1、组织成员提交的实名认证记录列表
export function getVerifyList(params) {
    return request({
        url: 'verify/list',
        method: 'get',
        params // 支持分页参数
    })
}

// 审核实名认证
export function auditVerify(data) {
  return request({
    url: '/verify/audit',
    method: 'post',
    data // 注意：POST 请求参数使用 data，GET 使用 params
  })
}

// 获取用户身份验证信息
export function getUserIdentityVerification(userId) {
  return request({
    url: '/verify/userIdentityVerification',
    method: 'get',
    params: {
      userId: userId
    }
  })
}

export function submitVerification(data) {
  return request({
    url: '/verify/submit',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 自由职业者提交的实名记录列表，用来让系统管理员审核
export function getFreelancerAuditVerificationList(params) {
    return request({
        url: 'verify/list',
        method: 'get',
        params // 支持分页参数
    })
}