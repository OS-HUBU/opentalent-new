import request from "@/utils/request";

export function handleUserInfo(userId) {
  return request({
    url: "/userinfo/userprofile",
    method: "get",
    params: userId ? { userId } : {},
  });
}

/** 仓库数+环比 */
export function getRepoNum(userId) {
  return request({
    url: "/behavior/user/repo-count-change",
    method: "get",
    params: userId ? { userId } : {},
  });
}

/** 仓库活跃度总和+环比 */
export function getRepoActivity(userId) {
  return request({
    url: "/behavior/user/repo-activity-summary",
    method: "get",
    params: userId ? { userId } : {},
  });
}

/** 用户月度行为数据 */
export function getDetail(userId) {
  return request({
    url: "/behavior/user/monthly/detail",
    method: "get",
    params: userId ? { userId } : {},
  });
}

/**系统行为数据均值 */
export function getAverage(query) {
  return request({
    url: "/behavior/user/monthly/average",
    method: "get",
    params: query,
  });
}

/**系统行为数据最大值 */
export function getMax(query) {
  return request({
    url: "/behavior/user/monthly/maximum",
    method: "get",
    params: query,
  });
}

/** 该用户下仓库openrank趋势 */
export const getOpenrankTrend = (params) => {
  return request({
    url: "/behavior/user/openrank-trend",
    method: "GET",
    params: {
      ...(params?.userId && { userId: params.userId }),
      ...(params?.startDate && { startDate: params.startDate }),
      ...(params?.endDate && { endDate: params.endDate })
    }
  });
};

/** 该用户下仓库活跃度趋势 */
export const getRepoActivityTrend = (params) => {
  return request({
    url: "/behavior/user/repo-activity-trend",
    method: "GET",
    params: {
      ...(params?.userId && { userId: params.userId }),
      ...(params?.startDate && { startDate: params.startDate }),
      ...(params?.endDate && { endDate: params.endDate })
    }
  });
};

/** 查询该用户下当月仓库按 openrank 排序 */
export const getRepoRanking = (userId) => {
  return request({
    url: "/behavior/user/repo-ranking",
    method: "GET",
    params: userId ? { userId } : {} // 仅当userId存在时才传递该参数
  });
};

/**查询的openrank前三的仓库的仓库的语言占比*/
export const getRepoTop3LanguageRatio = (userId) => {
  return request({
    url: "/behavior/user/repo-top3-language-ratio",
    method: "GET",
    params: userId ? { userId } : {}, 
  });
};

/**star+环比 */
export const getStarCountchange = (userId) => {
  return request({
    url: "/behavior/user/star-count-change",
    method: "GET",
    params: userId ? { userId } : {}, 
  });
};

/*组织内部成员openrank排名，以及变化*/
export const getOrgMemOpenrank =(userId) => {
  return request({
    url: "/behavior/user/orgMemOpenrank",
    method: "GET",
    params: userId ? { userId } : {}, 
  });
}