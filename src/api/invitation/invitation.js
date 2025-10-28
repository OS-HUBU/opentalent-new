import request from '@/utils/request'

// 查询邀请列表
export function listInvitation(query) {
  return request({
    url: '/invite/application/invites',
    method: 'get',
    params: query
  })
}


export function approveInvitation(id, status,handlerOpinion) {
  return request({
    url: '/invite/application/handle/{id}',
    method: 'put',
    params: {
      id: id,
      status: status,
      handlerOpinion: handlerOpinion
    }
  })
}