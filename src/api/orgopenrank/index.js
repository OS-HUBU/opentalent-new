import request from '@/utils/request'



// 组织排行榜列表信息
export function getOrgOpenRankList() {
    return request({
        url: '/openrank/org-ranking',
        method: 'get',
        data: {
            platformName:'github',
            orgType: '湖北大学',

        },
    })
}