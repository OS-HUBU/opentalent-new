<template>
  <div class="app-container">
    <el-form>
      <el-form-item label="申请人:">
        <el-input
          placeholder="请输入申请人"
          style="width: 300px"
          v-model.trim="userName"
          @input="handleSearchInput"
        ></el-input>
      </el-form-item>
      <el-form-item label="状态:" class="select">
        <el-select v-model="status" @change="handleStatusChange">
          <el-option label="所有" value=""></el-option>
          <el-option label="待处理" value="2"></el-option>
          <el-option label="同意" value="3"></el-option>
          <el-option label="拒绝" value="4"></el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <el-table
      :data="paginatedData"
      style="width: 100%"
      :cell-style="{ textAlign: 'center' }"
      :header-cell-style="{ textAlign: 'center' }"
    >
      <el-table-column prop="userName" label="申请人" width="180">
        <template #default="scope">
          <span
            v-html="highlightMatch(scope.row.userName, searchKeyword)"
          ></span>
        </template>
      </el-table-column>
      <el-table-column prop="applyAccount" label="账号" width="180" />
      <el-table-column prop="submitTime" label="时间" />
      <el-table-column prop="status" label="状态">
      </el-table-column>
      <el-table-column prop="applyAction" label="操作">
        <template #default="scope">
          <el-button
            type="success"
            :disabled="scope.row.status !== '待处理'"
            :class="{ info: scope.row.status !== '待处理' }"
            @click="openApprovalDialog(scope.row, 'approved')"
            >同意</el-button
          >

          <el-button
            type="danger"
            :disabled="scope.row.status !== '待处理'"
            :class="{ info: scope.row.status !== '待处理' }"
            @click="openApprovalDialog(scope.row, 'rejected')"
            >拒绝</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 审批意见弹窗 -->
    <el-dialog v-model="approvalDialogVisible" title="提示" width="500px">
      <el-form :model="approvalForm" label-width="80px">
        <el-form-item label="审批意见">
          <el-select
            v-model="approvalForm.handlerOpinion"
            placeholder="请选择或输入审批意见"
            allow-create
            filterable
            default-first-option
            style="width: 100%"
          >
            <el-option
              v-for="opinion in defaultOpinions"
              :key="opinion"
              :label="opinion"
              :value="opinion"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="approvalDialogVisible = false">取消</el-button>
          <el-button
            :type="approvalAction === 'approved' ? 'success' : 'danger'"
            @click="submitApproval"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        @current-change="handleCurrentChange"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10,20,30,50]"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="filteredTableData.length"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onActivated } from "vue";
import { ElMessage } from "element-plus";
import { getApplyList, auditApply } from "@/api/apply";
const userName = ref("");
const status = ref("");
const currentPage = ref(1);
const pageSize = ref(10);
const tableData = ref([]);
const searchKeyword = ref("");
// 审批意见相关
const approvalDialogVisible = ref(false);
const approvalAction = ref(""); // 同意或拒绝
const currentRow = ref(null); // 当前行数据

const approvalForm = ref({
  handlerOpinion: "",
  id: "",
  status: "",
});

const fetchApplyList = async () => {
  const res = await getApplyList();
  tableData.value = res.rows;
  console.log(tableData.value);
};

onMounted(() => {
  fetchApplyList();
});

// // 组件激活时重新加载数据（解决 keep-alive 缓存导致的空白问题）
// onActivated(() => {
//   fetchApplyList();
// });

// 默认审批意见选项
const defaultOpinions = ref([
 "同意申请，欢迎加入",
  "资料审核通过",
  "符合加入条件",
  "申请信息不完整，请补充",
  "不符合加入条件",
  "暂不接受申请",
]);

// 打开审批对话框
const openApprovalDialog = (row, action) => {
  currentRow.value = row;
  approvalAction.value = action;
  approvalForm.value.handlerOpinion = ""; // 修正字段名
  approvalForm.value.id = row.id; // 设置当前行的 id
  approvalForm.value.status = action;
  approvalDialogVisible.value = true

  if (action === "approved") {
    defaultOpinions.value = [
      "同意申请，欢迎加入",
      "资料审核通过",
      "符合加入条件",
    ];
  } else if (action === "rejected") {
    defaultOpinions.value = [
      "申请信息不完整，请补充",
      "不符合加入条件",
      "暂不接受申请",
    ];
  }
}
// 提交审批
const submitApproval = async () => {
  try {
    console.log(
      approvalForm.value.id,
      approvalForm.value.status,
      approvalForm.value.handlerOpinion
    );
    const data = {
      id: approvalForm.value.id,
      status: approvalForm.value.status,
      handlerOpinion: approvalForm.value.handlerOpinion,
    };

    await auditApply(approvalForm.value.id, approvalForm.value.status, approvalForm.value.handlerOpinion);
    console.log(data);
    ElMessage.success("审批操作成功");
    fetchApplyList();
    approvalDialogVisible.value = false;
  } catch (error) {
    Promise.reject(error);
    ElMessage.error("审批操作失败");
    return;
  }
};

// 根据状态过滤数据
// 根据状态和申请人过滤数据
const filteredTableData = computed(() => {
  let filteredData = tableData.value;

  // 根据状态筛选
  if (status.value) {
    const statusMap = {
      '2': '待处理',
      '3': '同意',
      '4': '拒绝'
    };
    const statusValue = statusMap[status.value];
    if (statusValue) {
      filteredData = filteredData.filter(item => item.status === statusValue);
    }
  }

  // 根据申请人姓名筛选
  if (userName.value) {
    filteredData = filteredData.filter((item) =>
      item.userName.includes(userName.value)
    );
  }

  return filteredData;
});

// 处理搜索输入
const handleSearchInput = () => {
  searchKeyword.value = userName.value;
};

// 高亮匹配文本
const highlightMatch = (text, query) => {
  if (!query) return text;

  const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
  return text.replace(
    regex,
    '<span style="color: #409EFF; font-weight: bold;">$1</span>'
  );
};

// 转义正则表达式特殊字符
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// 计算分页后的数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredTableData.value.slice(start, end);
});

// 状态改变时重置到第一页
const handleStatusChange = () => {
  currentPage.value = 1;
};

// 跳转详情页面
// const goToDetail = () => {
//   console.log("跳转详情页面");
//   // router.push({ path: "/openrank/detail" });
// };

const handleCurrentChange = (page) => {
  currentPage.value = page;
};
</script>

<style lang="scss">

.el-form {
  display: flex;
  .select {
    margin-left: 10px;
    .el-select {
      width: 90px;
    }
  }
}

.active {
  color: #fff;
}

.info {
  background-color: #ddd;
  color: #909399;
  border-color: #ddd;
}
</style>
