import request from '@/utils/request'
import { pa } from 'element-plus/es/locales.mjs'



// 申请列表
export function getApplyList() { 
    return request({
        url: '/invite/application/applications',
        method: 'get',
    })
}


// 审核申请
export function auditApply(id, status, handlerOpinion) { 
    return request({
        url: `/invite/application/handle/${id}`,
        method: 'put',
        params: {
            id,
            status,
            handlerOpinion,
        }
    })
}