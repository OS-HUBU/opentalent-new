import request from '@/utils/request'


// 
export function getOrgCenter() { 
    return request({
        url: '/userinfo/orgprofile',
        method: 'get',
    })
}


export function updateOrgCenter(data) { 
    return request({
        url: '/organization',
        method: 'put',
        data:data
    })
}



