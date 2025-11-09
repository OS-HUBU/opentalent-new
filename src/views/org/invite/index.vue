<template>
  <div class="app-container">
    <!-- header -->
    <div class="header">
      <div class="search">
        <label style="line-height: 31px">搜索：</label>
        <el-input v-model="userName" placeholder="请输入自由职业者的用户名/平台账号" @keyup.enter="handleSearch"
          @input="handleInput"></el-input>
      </div>
    </div>

    <!-- 标签页切换 -->
    <div class="tab-container">
      <el-tabs v-model="activeTab" type="card" @tab-change="handleTabChange">
        <el-tab-pane label="自由职业者" name="freelancers">
          <template #label>
            <span class="tab-label">
              <i class="el-icon-user"></i>
              发送邀请
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="邀请记录" name="invitations">
          <template #label>
            <span class="tab-label">
              <i class="el-icon-document"></i>
              邀请记录
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 发送邀请列表 -->
    <div v-show="activeTab === 'freelancers'" class="content">
      <div class="wrapper">
        <div class="modern-tip">
          <div class="tip-header">
            <el-icon class="shield-icon">
              <User />
            </el-icon>
            <span class="tip-title">发送邀请提示</span>
          </div>
          <p class="tip-content">
            <strong>邀请对象</strong> 当前仅展示自由职业者 <br>
            <strong>操作提示</strong> 您可以通过搜索框查找特定用户，点击"邀请加入"按钮发送邀请 <br>
          </p>
        </div>
        <el-table :data="filteredAndPagedUsers" style="width: 100%" :cell-style="{ textAlign: 'center' }"
          :header-cell-style="{ textAlign: 'center' }" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column label="用户名（角色）">
            <template #default="scope">
              <span class="user-name" v-html="highlightMatch(scope.row.userName, searchKeyword)"></span>
            </template>
          </el-table-column>
          <el-table-column label="平台账号" width="250px">
            <template #default="scope">
              <div v-if="
                scope.row.platformAccounts &&
                scope.row.platformAccounts.length > 0
              " class="platform-accounts-container">
                <el-tag v-for="(account, index) in scope.row.platformAccounts" :key="index" :type="account.platformName === 'GitHub' ? 'primary' : 'success'
                  " size="small" class="platform-tag">
                  {{ account.platformName }}: {{ account.platformUsername }}
                </el-tag>
              </div>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="email" label="邮箱" />
          <el-table-column prop="location" label="位置" />
          <el-table-column label="操作">
            <template #default="scope">
              <el-button type="primary" @click="openInviteDialog(scope.row)">邀请加入</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-container">
           <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[8]"
            :total="filteredUsers.length" background layout="total, sizes, prev, pager, next, jumper"
            @current-change="handleCurrentPageChange" />
        </div>
      </div>
    </div>

    <!-- 邀请记录列表 -->
    <div v-show="activeTab === 'invitations'" class="list">
      <div class="invite-wrapper">
        <div class="modern-tip">
          <div class="tip-header">
            <el-icon class="shield-icon">
              <User />
            </el-icon>
            <span class="tip-title">邀请记录提示</span>
          </div>
          <p class="tip-content">
            <strong>操作提示</strong> 您可以查看已发送的邀请记录，对于状态为"待处理"的邀请可以撤销 <br>
          </p>
        </div>
        <el-table :data="totalData"  style="width: 100%" 
          :cell-style="{ textAlign: 'center' }" 
          :header-cell-style="{ textAlign: 'center' }">
          <el-table-column prop="userName" label="邀请对象" />
          <el-table-column prop="submitTime" label="邀请时间" />
          <el-table-column prop="status" label="当前状态" />
          <el-table-column prop="operation" label="操作">
            <template #default="scope">
              <el-button :disabled="scope.row.status !== '待处理'" :class="{
                danger: scope.row.status === '待处理',
                info: scope.row.status !== '待处理',
              }" @click="handleCancelInvite(scope.row.id)">撤销</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
           <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[8]"
            :total="inviteRecords.length" background layout="total, sizes, prev, pager, next, jumper"
            @current-change="handleCurrentPageChange" />
        </div>
      </div>
    </div>
  </div>

  <!-- 邀请附言弹框 -->
  <el-dialog v-model="inviteDialogVisible" title="邀请用户" width="500px" :before-close="handleInviteDialogClose">
    <div class="invite-dialog-content">
      <p class="invite-tip">
        邀请用户
        <span class="user-name">"{{ selectedUser.userName }}"</span> 加入组织
      </p>

      <el-form :model="inviteForm" ref="inviteFormRef">
        <el-form-item label="邀请附言">
          <el-select v-model="inviteForm.message" filterable allow-create default-first-option placeholder="请选择或输入附言"
            style="width: 100%">
            <el-option v-for="item in defaultMessages" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="inviteDialogVisible = false" type="primary">取消</el-button>
        <el-button type="primary" @click="sendInvite">发送邀请</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import {
  getInviteList,
  getInviteRecord,
  addInviteList,
  cancelInvite,
} from "@/api/invite";
import { ElMessage } from "element-plus";

const inviteList = ref([]);
const inviteRecords = ref([]);

const currentPage = ref(1);
const pageSize = ref(8);

// 当前激活的标签页
const activeTab = ref("freelancers");

const fetchInviteList = async () => {
  const data = await getInviteList();
  inviteList.value = data.rows;
  console.log("无组织成员列表", inviteList.value);
};

const fetchInviteRecord = async () => {
  const data = await getInviteRecord();
  inviteRecords.value = data.rows;
  console.log("邀请记录", inviteRecords.value);
};

onMounted(() => {
  fetchInviteList();
  fetchInviteRecord();
});

// 标签页切换处理
const handleTabChange = (tabName) => {
  activeTab.value = tabName;
  // 切换到邀请记录时刷新数据
  if (tabName === 'invitations') {
    fetchInviteRecord();
  }
};

const userName = ref("");
//存储筛选实际搜索关键词
const searchKeyword = ref("");

// 根据搜索条件过滤用户
const filteredUsers = computed(() => {
  if (!searchKeyword.value) {
    return inviteList.value;
  }

  const searchValue = searchKeyword.value.toLowerCase();
  return inviteList.value.filter((user) =>
    (user.userName && user.userName.toLowerCase().includes(searchValue)) ||
    (Array.isArray(user.platformAccounts) &&
      user.platformAccounts.some(
        (account) =>
          (account.platformName &&
            account.platformName.toLowerCase().includes(searchValue)) ||
          (account.platformUsername &&
            account.platformUsername.toLowerCase().includes(searchValue))
      ))
  );
});

// 实时输入处理
const handleInput = () => {
  searchKeyword.value = userName.value;
};

const handleSearch = () => {
  searchKeyword.value = userName.value;
};

// 高亮匹配文本（支持数组）
const highlightMatch = (text, query) => {
  if (!query) return text;

  if (Array.isArray(text)) {
    return text
      .map((item) => {
        const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
        return item.replace(
          regex,
          '<span style="color: #409EFF; font-weight: bold;">$1</span>'
        );
      })
      .join(", ");
  }

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

// 邀请弹框相关
const inviteDialogVisible = ref(false);
const selectedUser = ref({});
const inviteFormRef = ref();
const inviteForm = reactive({
  message: "",
});
// 默认邀请附言
const defaultMessages = [
  {
    label: "诚邀您加入我们的组织，一起协作共赢！",
    value: "诚邀您加入我们的组织，一起协作共赢！",
  },
  {
    label: "我们团队需要您的专业技能，期待您的加入！",
    value: "我们团队需要您的专业技能，期待您的加入！",
  },
  {
    label: "加入我们，共同打造更好的产品！",
    value: "加入我们，共同打造更好的产品！",
  },
  {
    label: "您的技能与经验正是我们所需要的！",
    value: "您的技能与经验正是我们所需要的！",
  },
];

const openInviteDialog = (user) => {
  selectedUser.value = user;
  inviteDialogVisible.value = true;
};

// 关闭邀请弹框
const handleInviteDialogClose = (done) => {
  inviteFormRef.value.resetFields();
  done();
};

// 发送邀请
const sendInvite = async () => {
  try {
    const data = {
      userId: selectedUser.value.userId,
      remark: inviteForm.message,
    };
    console.log("发送邀请数据", data.userId);

    let result = await addInviteList(data);
    console.log("邀请加入", result);

    fetchInviteRecord();

    // 发送邀请后切换到邀请记录页
    activeTab.value = 'invitations';

    // 关闭弹框
    inviteDialogVisible.value = false;

    // 显示成功提示
    ElMessage.success("邀请已发送");
  } catch (error) {
    console.error("发送邀请失败:", error);
    ElMessage.error("发送邀请失败");
  }
};

// 撤销组织成员
const handleCancelInvite = async (inviteId) => {
  console.log("撤销组织成员", inviteId);
  try {
    const result = await cancelInvite(inviteId);
    console.log("撤销邀请", result);
    console.log("撤销邀请记录", inviteRecords.value);

    fetchInviteRecord();
    ElMessage.success("撤销邀请成功");
  } catch (error) {
    Promise.reject(error);
    ElMessage.error("撤销邀请失败");
  }
};

// 处理分页
const totalData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return inviteRecords.value.slice(start, end);
});
const filteredAndPagedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredUsers.value.slice(start, end);
});
const handleCurrentPageChange = (page) => {
  currentPage.value = page;
};
</script>

<style lang="scss" scoped>
.modern-tip {
  margin: 0 0 20px 120px;
  padding: 16px;
  background: linear-gradient(135deg, #f6f8ff 0%, #f0f7ff 100%);
  border: 1px solid #d1e9ff;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  margin-left: 10px;
}

.modern-tip::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, #409eff, #79bbff);
}

.tip-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.shield-icon {
  color: #409eff;
  margin-right: 8px;
  font-size: 18px;
}

.tip-title {
  font-weight: 600;
  color: #409eff;
  font-size: 14px;
}

.tip-content {
  margin: 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  padding-left: 26px;
}

.header {
  padding: 5px 5px 0;
  border-bottom: 1px solid #ddd;

  .search {
    display: flex;
    margin-bottom: 5px;
    width: 400px;

    .el-input--default {
      flex: 1;
      margin-right: 10px;
    }
  }
}

.tab-container {
  margin: 15px 5px 20px;

  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }

  :deep(.el-tabs__nav-wrap) {
    &::after {
      height: 1px;
      background-color: #e4e7ed;
    }
  }

  :deep(.el-tabs__item) {
    height: 40px;
    line-height: 40px;
    padding: 0 20px;
    font-weight: 500;
    transition: all 0.3s ease;

    &.is-active {
      color: #409eff;
      background-color: #ecf5ff;
      border-bottom: 2px solid #409eff;
    }

    &:hover {
      color: #409eff;
    }
  }

  .tab-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
  }
}

.content,
.list {
  margin: 0 5px;

  .tips-container {
    margin-bottom: 20px;
    padding: 12px 16px;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 6px;

    .tips {
      font-size: 14px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 6px;
      display: flex;
      align-items: center;

      &::before {
        content: "💡";
        margin-right: 8px;
        font-size: 12px;
      }
    }

    .sub-tips {
      font-size: 13px;
      color: #6c757d;
      margin: 0;
      line-height: 1.5;
    }
  }
}

:deep(.el-table__body) {
  .el-table__row {
    td:nth-child(1) {
      .cell {
        display: flex;
        justify-content: center; 
      }
    }
  }
}

// 平台账号标签样式
.platform-accounts-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.platform-tag {
  margin: 2px 0;
  font-size: 12px;
  white-space: nowrap;
}
.content,
.list {
  .pagination-container {
    height: 40px;
    margin-top: 5px;
    margin-right: 10px;
  }
}

.el-button--default {
  color: #fff;
}

.danger {
  background-color: #f56c6c;
}

.info {
  background-color: #909399;
  color: #fff;
}

.el-button--info.is-disabled,
.el-button--info[disabled] {
  background-color: #909399 !important;
  border-color: #909399 !important;
  color: #fff !important;
  opacity: 1 !important;
}

.el-button.is-disabled {
  background-color: #909399 !important;
  border-color: #909399 !important;
  color: #fff !important;
  opacity: 1 !important;
}

.invite-dialog-content {
  margin-top: -30px;

  .invite-tip {
    margin-bottom: 20px;
    font-size: 14px;
    font-weight: bold;

    .user-name {
      font-weight: bold;
      color: #409eff;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>