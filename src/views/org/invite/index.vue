<template>
  <div class="app-container">
    <!-- header -->
    <div class="header">
      <div class="search">
        <label style="line-height: 31px">搜索：</label>
        <el-input
          v-model="userName"
          placeholder="请输入自由职业者的用户名/平台账号"
          @keyup.enter="handleSearch"
          @input="handleInput"
        ></el-input>
      </div>
    </div>
    <div class="content">
      <div class="wrapper">
        <p class="tips">当前仅展示自由职业者</p>
        <el-table
          :data="filteredUsers"
          height="300px"
          style="width: 100%"
          :cell-style="{ textAlign: 'center' }"
          :header-cell-style="{ textAlign: 'center' }"
        >
          <el-table-column label="用户名（角色）" fixed>
            <template #default="scope">
              <span
                class="user-name"
                v-html="highlightMatch(scope.row.userName, searchKeyword)"
              ></span>
              <span class="sign">自由职业者</span>
            </template>
          </el-table-column>
          <el-table-column label="平台账号" width="250px">
            <template #default="scope">
              <div
                v-if="
                  scope.row.platformAccounts &&
                  scope.row.platformAccounts.length > 0
                "
                class="platform-accounts-container"
              >
                <el-tag
                  v-for="(account, index) in scope.row.platformAccounts"
                  :key="index"
                  :type="
                    account.platformName === 'GitHub' ? 'primary' : 'success'
                  "
                  size="small"
                  class="platform-tag"
                >
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
              <el-button type="primary" @click="openInviteDialog(scope.row)"
                >邀请加入</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div class="list">
      <div class="invite-wrapper">
        <el-table
          :data="totalData"
          style="width: 100%"
          :cell-style="{ textAlign: 'center' }"
          :header-cell-style="{ textAlign: 'center' }"
        >
          <el-table-column prop="userName" label="邀请对象" />
          <el-table-column prop="submitTime" label="邀请时间" />
          <el-table-column prop="status" label="当前状态" />
          <el-table-column prop="operation" label="操作">
            <template #default="scope">
              <el-button
                :disabled="scope.row.status !== '待处理'"
                :class="{
                  danger: scope.row.status === '待处理',
                  info: scope.row.status !== '待处理',
                }"
                @click="handleCancelInvite(scope.row.id)"
                >撤销</el-button
              >
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 30, 50]"
            :total="inviteRecords.length"
            background
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handleCurrentPageChange"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- 邀请附言弹框 -->
  <el-dialog
    v-model="inviteDialogVisible"
    title="邀请用户"
    width="500px"
    :before-close="handleInviteDialogClose"
  >
    <div class="invite-dialog-content">
      <p class="invite-tip">
        邀请用户
        <span class="user-name">"{{ selectedUser.userName }}"</span> 加入组织
      </p>

      <el-form :model="inviteForm" ref="inviteFormRef">
        <el-form-item label="邀请附言">
          <el-select
            v-model="inviteForm.message"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入附言"
            style="width: 100%"
          >
            <el-option
              v-for="item in defaultMessages"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="inviteDialogVisible = false" type="primary"
          >取消</el-button
        >

        <el-button type="primary" @click="sendInvite">发送邀请</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted, onActivated } from "vue";
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
const pageSize = ref(10);

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

// 组件激活时重新加载数据（解决 keep-alive 缓存导致的空白问题）
// onActivated(() => {
//   fetchInviteList();
//   fetchInviteRecord();
// });

const userName = ref("");
//存储筛选实际搜索关键词
const searchKeyword = ref("");

// 根据搜索条件过滤用户
// 根据搜索条件过滤用户
const filteredUsers = computed(() => {
  if (!searchKeyword.value) {
    return inviteList.value;
  }

  const searchValue = searchKeyword.value.toLowerCase();
  return inviteList.value.filter(
    (user) =>
      (user.userName && user.userName.toLowerCase().includes(searchValue)) ||
      // 处理 platformAccounts 数组
      (Array.isArray(user.platformAccounts) &&
        user.platformAccounts.some((account) =>
          account.toLowerCase().includes(searchValue)
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

  // inviteForm.message = defaultMessages[0].value; // 默认选择第一条附言
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
    // 这里应该调用实际的邀请接口
    console.log("发送邀请给用户:", selectedUser.value.userId);
    console.log("附言:", inviteForm.message);
    const data = {
      userId: selectedUser.value.userId,
      remark: inviteForm.message,
    };
    console.log("发送邀请数据", data.userId);

    let result = await addInviteList(data);
    console.log("邀请加入", result);

    fetchInviteRecord();

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
    // status.value = '已撤销';
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
const handleCurrentPageChange = (page) => {
  currentPage.value = page;
};
</script>

<style lang="scss" scoped>
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
.content {
  border-bottom: 1px solid #ddd;
  .wrapper {
    margin: 0 5px;
    .tips {
      padding: 0;
      font-size: 14px;
      opacity: 0.5;
    }
    :deep(.el-table__body) {
      .el-table__row {
        td:nth-child(1) {
          .cell {
            display: flex;
            justify-content: space-between;
            .user-name {
              margin-left: 48px;
              width: 100px;
            }
            .sign {
              width: 60px;
              height: 20px;
              font-size: 11px;
              background-color: #2d87cd38;
            }
          }
        }
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

.list {
  .pagination-container {
    height: 40px;
    margin-top: -2px;
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
