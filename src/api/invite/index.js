import request from '@/utils/request'

// 无组织成员列表
export function getInviteList() { 
    return request({
        url: '/userinfo/freelancer/list',
        method: 'get',
    })
}


// 邀请无组织成员
export function addInviteList(data) {
    return request({
        url: '/invite/application/invite',
        method: 'post',
        params:data
    })
}


// 邀请记录
export function getInviteRecord() {
    return request({
        url: '/invite/application/myInvites',
        method: 'get',
    })
}


// 撤销邀请
export function cancelInvite(id) { 
    return request({
        url: `/invite/application/cancel/${id}`,
        method: 'put',
    })
}
