import request from '@/utils/request'
import { pa } from 'element-plus/es/locales.mjs'


export function getRankList(userId) {
    return request({
        url: `/openrank/developer-ranking?userId=${userId}`,
        method: 'get',
    })
}


