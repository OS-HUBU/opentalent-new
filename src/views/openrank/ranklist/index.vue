<template>
  <div class="app-container">
    <el-main>
      <!-- title -->
      <h2 class="title" style="font-size: 24px; margin-bottom: 30px">
        开发者贡献度排行榜
        <span style="font-size: 14px; margin-left: 10px">
          ({{ currentDate }})</span
        >
      </h2>
      <div class="filters">
        <el-select
          v-model="selectedOrg"
          style="width: 200px"
          clearable
          :placeholder="organizationName"
          disabled
        >
        </el-select>
        <el-input
          v-model.trim="searchName"
          placeholder="搜索姓名"
          style="width: 250px"
          class="search-name"
        ></el-input>
      </div>

      <!-- Rank List -->
      <div class="rank-list">
        <el-table :data="currentTableData">
          <el-table-column prop="rank" label="排名"></el-table-column>
          <el-table-column prop="name" label="姓名">
            <template #default="scope">
              <span
                v-html="highlightMatch(scope.row.name, searchName)"
                class="highlight-text"
              ></span> </template
          ></el-table-column>
          <el-table-column
            prop="platformUsername"
            label="平台名称"
          ></el-table-column>
          <el-table-column prop="OpenRankValue" label="OpenRank">
            <template #header>
              <span>OpenRank</span>
              <el-button
                link
                @click="setSortOrder('openrankCurrent', 'asc')"
                :class="{ active: sortOrder === 'asc' }"
              >
                <el-icon>
                  <CaretTop />
                </el-icon>
              </el-button>
              <el-button
                link
                @click="setSortOrder('openrankCurrent', 'desc')"
                :class="{ active: sortOrder === 'desc' }"
              >
                <el-icon>
                  <CaretBottom />
                </el-icon>
              </el-button>
            </template>
            <template #default="scope">
              {{ Math.ceil(scope.row.openrankPrevious || 0) }}
              <img :src="(scope.row.openrankPrevious || 0) < scope.row.openrankCurrent
                  ? increaseIcon
                  : downIcon
                " style="margin: 0 7px; width: 16px; height: 16px" />
              {{ Math.ceil(scope.row.openrankCurrent) }}
            </template>
          </el-table-column>
          <el-table-column prop="organization" label="学校"></el-table-column>
          <el-table-column prop="community" label="参与社区"></el-table-column>
          <el-table-column prop="location" label="位置"></el-table-column>
          <el-table-column prop="detailPage" label="详情页面">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                @click="goToDetail(scope.row)"
              >
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          @current-change="handleCurrentChange"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        />
      </div>
    </el-main>
  </div>
</template>

<script setup>
import { CaretTop, CaretBottom } from "@element-plus/icons-vue";
import increaseIcon from "@/assets/images/increase.svg";
import downIcon from "@/assets/images/down.png";
import { ref, onMounted, onActivated, computed } from "vue";
import { getRankList } from "@/api/openrank";
import { storeToRefs } from "pinia";
import useUserStore from "@/store/modules/user";
const userStore = useUserStore();
const { name } = storeToRefs(userStore);

import { useRouter } from "vue-router";
const router = useRouter();

const selectedOrg = ref("");
const sortOrder = ref("desc");
const sortField = ref("openrankCurrent");
const pageSize = ref(10);
const currentPage = ref(1);
const total = ref(0); // 总条数，从接口获取
const currentDate = ref("");
const searchName = ref("");

// 表格数据（来自接口）
const tableData = ref([]);

// 组织名称显示
const organizationName = computed(() => {
  if (tableData.value.length === 0) {
    return '';
  }
  return tableData.value[0].organization || '';
});

// 获取排行榜数据
const fetchRankList = async () => {
  try {
    const data = await getRankList(name.value);
    console.log(name.value);
    console.log("API 返回数据:", data);

    currentDate.value = data.rows[0].date;
    // console.log("currentDate:", currentDate.value)

    // 映射字段并处理 null 值
    tableData.value = data.rows.map((item) => ({
      userId: item.userid, // 添加 userId 字段
      rank: item.rank,
      name: item.username,
      platformUsername: item.platformName,
      openrankPrevious: item.openrankPrevious || 0,
      openrankCurrent: item.openrankCurrent,
      organization: item.orgName,
      community: item.community,
      detailPage: "详情页面",
      location: item.userlocation,
    }));
    total.value = data.rows.length;
  } catch (error) {
    console.error("获取排行榜失败:", error);
  }
};

onMounted(() => {
  fetchRankList();
});


// 高亮匹配的文字
const highlightMatch = (text, query) => {
  if (!query) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return text;

  // 分割文本为前缀、匹配部分和后缀
  const prefix = text.substring(0, index);
  const match = text.substring(index, index + query.length);
  const suffix = text.substring(index + query.length);
  // 返回带有高亮标记的HTML
  return `${prefix}<span class="highlight">${match}</span>${suffix}`;
};

// 过滤后的数据
const filteredData = computed(() => {
  if (!searchName.value) {
    return sortedData.value;
  }

  const lowerQuery = searchName.value.toLowerCase();
  return sortedData.value.filter((item) =>
    item.name.toLowerCase().includes(lowerQuery)
  );
});



// 分页数据
const currentTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredData.value.slice(start, end);
});

// 排序数据
const sortedData = computed(() => {
  const data = [...tableData.value];

  // 先按原始排名排序
  data.sort((a, b) => a.rank - b.rank);

  // 再按选择的字段排序
  if (sortField.value) {
    data.sort((a, b) => {
      const valueA = a[sortField.value];
      const valueB = b[sortField.value];
      return sortOrder.value === "asc" ? valueA - valueB : valueB - valueA;
    });
  }

  return data;
});

// 设置排序
const setSortOrder = (field, defaultOrder = "asc") => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortOrder.value = defaultOrder;
  }
};

// 跳转详情
const goToDetail = (rowData) => {
  router.push({
    path: "/contribution",
    query: {
      userId: rowData.userId,
    },
  });
};

// 分页切换
const handleCurrentChange = (page) => {
  currentPage.value = page;
};
</script>

<style lang="scss" scoped>
.app-container {
  margin: 10px auto;
  // width: 1100px;
  display: flex;
  justify-content: center;
  text-align: center;

  .el-main {
    border-radius: 16px;
    background-color: #111e33;

    .title {
      color: #7d9ee1;
      margin: 0 auto;
    }
    .filters {
      margin: 0 auto;
      width: 800px;

      .search-name {
        margin-left: 20px;
        margin-right: 5px;
        :deep(.el-input__wrapper) {
          &.is-focus {
            box-shadow: none !important;
          }
        }
      }
    }

    .rank-list {
      .el-header {
        background: #fff;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      }

      .el-button.active {
        color: #409eff;
        margin-left: 0;
      }
    }

    .pagination-container {
      //   margin-left: 106px;
      // width: 600px;
      height: 50px;
      //   background-color: #f9f9f9;
    }

    .pagination-container :deep(.el-pagination) {
      color: white;
      /* 文字默认白色 */

      /* 普通页码按钮 */
      .el-pager li {
        background-color: rgba(255, 255, 255, 0.1);
        /* 半透明白 */
        color: white;

        &:hover {
          background-color: rgba(255, 255, 255, 0.2);
          /* 悬停稍亮 */
        }
      }

      /* 当前选中页 */
      .el-pager li.is-active {
        color: #2d8cf0;
        /* 与表格高亮一致的蓝色 */
        // color: white;
      }

      /* 箭头按钮 */
      .btn-prev,
      .btn-next {
        background-color: transparent;
        color: white;

        &:hover {
          color: #2d8cf0;
          /* 悬停变蓝 */
        }

        &.disabled {
          color: rgba(255, 255, 255, 0.3);
          /* 禁用状态半透明 */
        }
      }

      /* 页码输入框 */
      .el-pagination__jump {
        color: white;

        .el-pagination__editor {
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          border-radius: 4px;

          &:focus {
            outline: none !important;
            /* 移除浏览器默认轮廓 */
            box-shadow: none !important;
            /* 移除可能的阴影 */
            border-color: #fff !important;
            /* 保持原有边框色 */
          }
        }
      }

      /* "前往"和"页"文字 */
      .el-pagination__jump,
      .el-pagination__total {
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
}

:deep(.el-table th.el-table__cell) {
  background-color: #111e33 !important;
  color: #fff;
}

:deep(.el-table td.el-table__cell) {
  background-color: #213046 !important;
  color: #fff;
}

:deep(.el-table .cell) {
  text-align: center;
  width: 140px;
}

// 高亮样式
:deep(.highlight) {
  color: #409eff;
  font-weight: bold;
}
</style>
