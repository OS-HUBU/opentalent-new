import request from '@/utils/request'

// 查询无组织个人申请加入记录列表
export function listEnrollment(query) {
  return request({
    url: '/invite/application/myApplications',
    method: 'get',
    params: query
  })
}

// 提交加入组织申请
export function applyEnrollment(orgId, remark) {
  return request({
    url: '/invite/application/apply',
    method: 'post',
    params: {
      orgId: orgId,
      remark: remark
    }
  })
}