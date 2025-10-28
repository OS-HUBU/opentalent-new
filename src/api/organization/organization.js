import request from '@/utils/request'

// 查询组织信息列表
export function listOrganization(query) {
  return request({
    url: '/organization/list',
    method: 'get',
    params: query
  })
}

// 查询组织信息详细
export function getOrganization(orgId) {
  return request({
    url: '/organization/' + orgId,
    method: 'get'
  })
}

// 新增组织信息
export function addOrganization(data) {
  return request({
    url: '/organization/',
    method: 'post',
    data: data
  })
}

// 修改组织信息
export function updateOrganization(data) {
  return request({
    url: '/organization/',
    method: 'put',
    data: data
  })
}

// 删除组织信息
export function delOrganization(deleteParams) {
  return request({
    url: '/organization/delete-exclude-admin',
    method: 'post',
    data: deleteParams
  })
}

// 系统管理员查看所有组织审核列表
export function getOrganizationAuditList(query) {
  return request({
    url: '/organization/admin/audit-list',
    method: 'get',
    params: query
  })
}

// 系统管理员审核组织管理员实名认证申请
export function auditVerification(verifyId, data) {
  return request({
    url: `/organization/audit-verification/${verifyId}`,
    method: 'post',
    params: data
  })
}

// 根据组织类型获取证件类型列表
export function getIdTypesByOrgType(orgType) {
  return request({
    url: '/register/idTypes',
    method: 'get',
    params: { orgType }
  })
}

// 根据组织类型获取动态表单配置
export function getFormConfigByOrgType(orgType) {
  return request({
    url: '/register/formConfig',
    method: 'get',
    params: { orgType }
  })
}

// 自由职业者查看可申请组织列表
export function commonOrganizationList(query) {
  return request({
    url: '/organization/commonlist',
    method: 'get',
    params: query
  })
}
