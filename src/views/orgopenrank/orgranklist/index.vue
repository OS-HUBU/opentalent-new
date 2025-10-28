<template>
  <div class="app-container">
    <el-main>
      <!-- Title -->
      <h2 class="title" style="font-size: 24px; margin-bottom: 30px">
        组织贡献度排行榜<span style="font-size: 14px; margin-left: 10px"
          >({{ currentDate }})</span
        >
      </h2>

      <div class="filters">
        <el-select
          v-model="selectedOrg"
          placeholder="选择组织"
          style="width: 240px"
          clearable
          filterable
          :filter-method="filterOrgOptions"
          @change="fetchOrgRankList"

        >
          <el-option label="全部组织" value="all"></el-option>
          <el-option
            v-for="item in filteredOptions"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          >
            <span v-html="highlightMatch(item.label, searchQuery)"></span>
          </el-option>
        </el-select>
      </div>

      <!-- Rank List -->
      <div class="rank-list">
        <el-table :data="currentTableData">
          <el-table-column prop="rank" label="排名"></el-table-column>
          <el-table-column prop="name" label="组织名称"></el-table-column>
          <el-table-column prop="OpenRankValue" label="OpenRank">
            <template #header>
              <span>OpenRank</span>
              <el-button
                link
                @click="setSortOrder('openRankSumLatest', 'asc')"
                :class="{ active: sortOrder === 'asc' }"
              >
                <el-icon><CaretTop /></el-icon>
              </el-button>
              <el-button
                link
                @click="setSortOrder('openRankSumLatest', 'desc')"
                :class="{ active: sortOrder === 'desc' }"
              >
                <el-icon><CaretBottom /></el-icon>
              </el-button>
            </template>
            <template #default="scope">
              {{ Math.ceil(scope.row.openRankSumPrevMonth || 0) }}
              <img
                :src="
                  (scope.row.openRankSumPrevMonth || 0) <
                  scope.row.openRankSumLatest
                    ? increaseIcon
                    : downIcon
                "
                style="margin: 0 7px; width: 16px; height: 16px"
              />
              {{ Math.ceil(scope.row.openRankSumLatest) }}
            </template>
          </el-table-column>
          <el-table-column prop="studentCount" label="参赛学生数">
            <template #header>
              <span>参赛学生数</span>
            </template>
            <template #default="scope">
              {{ scope.row.memberCountPrevMonth || 0 }}
              <img
                :src="
                  (scope.row.memberCountPrevMonth || 0) <
                  scope.row.memberCountLatestMonth
                    ? increaseIcon
                    : downIcon
                "
                style="margin: 0 7px; width: 16px; height: 16px"
              />
              {{ scope.row.memberCountLatestMonth }}
            </template>
          </el-table-column>
          <el-table-column prop="avgOpenRank" label="人均OpenRank">
            <template #header>
              <span>人均OpenRank</span>
            </template>
            <template #default="scope">
              {{ (scope.row.avgOpenRankPrevMonth || 0).toFixed(2) }}
              <img
                :src="
                  (scope.row.avgOpenRankPrevMonth || 0) <
                  scope.row.avgOpenRankLastMonth
                    ? increaseIcon
                    : downIcon
                "
                style="margin: 0 7px; width: 16px; height: 16px"
              />
              {{ scope.row.avgOpenRankLastMonth.toFixed(2) }}
            </template>
          </el-table-column>

          <el-table-column prop="location" label="位置"></el-table-column>
        </el-table>
      </div>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          @current-change="handleCurrentChange"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredTableData.length"
        />
      </div>
    </el-main>
  </div>
</template>

<script setup name="Orgranklist">
import { CaretTop, CaretBottom } from "@element-plus/icons-vue";
import increaseIcon from "@/assets/images/increase.svg";
import downIcon from "@/assets/images/down.png";
import { ref, computed, onMounted, onActivated } from "vue";
import { getOrgOpenRankList } from "@/api/orgopenrank";

const currentPage = ref(1);
const pageSize = ref(10);
const sortOrder = ref("desc");
const sortField = ref("openRankSumLatest");
const selectedOrg = ref(null);
const searchQuery = ref(""); // 用于存储搜索关键词
const allOptions = ref([]); // 存储所有组织选项
const filteredOptions = ref([]); // 存储过滤后的组织选项
const currentDate = ref("");
// 所有原始数据（用于排序和过滤）
const allTableData = ref([]);
// 获取组织排行榜数据
const fetchOrgRankList = async () => {
  try {
    const response = await getOrgOpenRankList();
    console.log("API 返回数据:", response);

    currentDate.value = response.data[0].date;
    const listData = response.data || [];

    if (!Array.isArray(listData)) {
      console.error("返回数据不是数组:", listData);
      return;
    }

    // 映射字段并处理 null 值
    allTableData.value = listData.map((item) => ({
      name: item.orgName,
      rank: item.rank,
      openRankSumLatest: item.openRankSumLatest,
      openRankSumPrevMonth: item.openRankSumPrevMonth,
      avgOpenRankLastMonth: item.avgOpenRankLastMonth,
      avgOpenRankPrevMonth: item.avgOpenRankPrevMonth,
      memberCountLatestMonth: item.memberCountLatestMonth,
      memberCountPrevMonth: item.memberCountPrevMonth,
      location: item.orgAddress,
    }));

    // 更新组织选项列表
    allOptions.value = allTableData.value.map((org, index) => ({
      id: index,
      label: org.name,
      value: org.name,
    }));
    // 初始过滤
    filterOrgOptions(searchQuery.value);
    currentPage.value = 1; // 切换组织时重置到第一页
  } catch (error) {
    console.error("获取组织排行榜失败:", error);
  }
};

onMounted(() => {
  fetchOrgRankList();
});

// 组件激活时重新加载数据（解决 keep-alive 缓存导致的空白问题）
// onActivated(() => {
//   fetchOrgRankList();
// });

// 过滤组织选项的方法
const filterOrgOptions = (query) => {
  searchQuery.value = query || '';
  
  if (!searchQuery.value) {
    // 如果搜索为空，显示所有选项
    filteredOptions.value = [...allOptions.value];
  } else {
    // 否则根据搜索词过滤
    const lowerQuery = searchQuery.value.toLowerCase();
    filteredOptions.value = allOptions.value.filter(option => 
      option.label.toLowerCase().includes(lowerQuery)
    );
  }
};

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




























// 排序后的数据
const sortedData = computed(() => {
  let data = [...allTableData.value];

  if (sortField.value && sortOrder.value) {
    data.sort((a, b) => {
      const modifier = sortOrder.value === "asc" ? 1 : -1;
      return (a[sortField.value] - b[sortField.value]) * modifier;
    });
  }

  return data;
});

// 过滤数据（按组织）
const filteredTableData = computed(() => {
  if (!selectedOrg.value || selectedOrg.value === "all") {
    return sortedData.value;
  }
  return sortedData.value.filter((item) => item.name === selectedOrg.value);
});

// 当前页显示的数据
const currentTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;

  const dataToShow = filteredTableData.value.slice(start, end);

  // 添加 rank 字段（基于当前排序顺序）
  return dataToShow.map((item, index) => ({
    ...item,
    rank: start + index + 1,
  }));
});

// 设置排序
const setSortOrder = (field, order) => {
  sortField.value = field;
  sortOrder.value = order;
};

// 分页切换
const handleCurrentChange = (page) => {
  currentPage.value = page;
};
</script>

<style lang="scss" scoped>
.app-container {
  margin: 10px auto;
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
      .el-select {
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
      }
    }

    .pagination-container :deep(.el-pagination) {
      color: white;

      .el-pager li {
        background-color: rgba(255, 255, 255, 0.1);
        color: white;

        &:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
      }

      .el-pager li.is-active {
        color: #2d8cf0;
      }

      .btn-prev,
      .btn-next {
        background-color: transparent;
        color: white;

        &:hover {
          color: #2d8cf0;
        }

        &.disabled {
          color: rgba(255, 255, 255, 0.3);
        }
      }

      .el-pagination__jump {
        color: white;

        .el-pagination__editor {
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          border-radius: 4px;

          &:focus {
            outline: none !important;
            box-shadow: none !important;
            border-color: #fff !important;
          }
        }
      }

      .el-pagination__jump,
      .el-pagination__total {
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
}

// 高亮样式
:deep(.highlight) {
  color: #409eff;
  font-weight: bold;
}



:deep(.el-table th.el-table__cell) {
  background-color: #111e33 !important;
  color: #fff;
}

:deep(.el-table td.el-table__cell) {
  background-color: #213046 !important;
  color: #fff;
}
</style>
