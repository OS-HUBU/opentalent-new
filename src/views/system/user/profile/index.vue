<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <!-- 上方个人信息卡片 -->
      <el-col :span="24">
        <el-card class="profile-card">
          <div class="profile-content">
            <!-- 头像和基本信息 -->
            <div class="profile-header">
              <div class="avatar-section">
                <div class="avatar-wrapper">
                  <userAvatar />

                </div>
                <div class="user-basic-info">
                  <h3 class="user-name">{{ state.user.userName }}</h3>
                  <p class="user-role">{{ state.roleGroup }}</p>
                </div>
                <div v-if="isroleGroup" class="view-profile-btn" @click="handleDetailView">
                  <span>查看实名认证详情</span>
                  <el-icon class="btn-arrow">
                    <ArrowRight />
                  </el-icon>
                </div>
              </div>

              
            </div>
          </div>
          <el-tabs v-model="activeTab" class="profile-tabs" style="flex: 1; display: flex; flex-direction: column;">
            <el-tab-pane label="基本资料" name="userinfo" style="flex: 1; overflow-y: auto;">
              <userInfo :user="state.user" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd" style="flex: 1; overflow-y: auto;">
              <resetPwd />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>


    <!-- 个人信息弹窗 -->
    <el-dialog v-if="showUserProfile" v-model="showUserProfile" :close-on-click-modal="true" :before-close="handleClose"
      width="90%" top="5vh" :show-close="true" class="user-profile-dialog">
      <userProfile :preloaded-Data="preloadedData" :user-Id="state.userId" :role-group="state.roleGroup"
        @refresh="handleRefreshUserDetail" @close="handleClose" />
    </el-dialog>
  </div>
</template>

<script setup name="Profile">
import { ElMessage } from 'element-plus'
import userProfile from "./userProfile";
import userAvatar from "./userAvatar";
import userInfo from "./userInfo";
import resetPwd from "./resetPwd";
import { getUserProfile } from "@/api/system/user";
import { getUserDetail } from '@/api/userinfo/userinfo'
import {
  ArrowRight,// 导入箭头图标
  Phone,
  Message,
  OfficeBuilding,
  UserFilled,
  Calendar
} from '@element-plus/icons-vue';

const showUserProfile = ref(false)  // 控制弹窗显示
const preloadedData = ref(null)    // 预加载的数据
const activeTab = ref("userinfo");
const state = reactive({
  userId: {},
  user: {},
  roleGroup: {},
  postGroup: {}
});
// 定义定时器变量，用于组件卸载时清除
let updateTimer = null;

async function getUser() {
  try {
    // 获取基本用户信息
    const profileResponse = await getUserProfile();
    console.log('getUserProfile response:', profileResponse);
    
    state.userId = profileResponse.data.userId;
    state.roleGroup = profileResponse.roleGroup;
    state.postGroup = profileResponse.postGroup;
    console.log('userId:', state.userId);
    
    // 获取详细用户信息
    const detailResponse = await getUserDetail();
    console.log('getUserDetail response:', detailResponse);
    
    // 合并两个接口的数据
    state.user = {
      ...profileResponse.data,
      // account字段从getUserProfile的userName获取
      account: profileResponse.data.userName,
      // 以下字段从getUserDetail获取
      userName: detailResponse.data?.userName || '',
      contactEmail: detailResponse.data?.contactEmail || '',
      birthDate: detailResponse.data?.birthDate || '',
      sex: detailResponse.data?.sex || '',
      nationality: detailResponse.data?.nationality || '',
      location: detailResponse.data?.location || '',
      major: detailResponse.data?.major || '',
      memberType: detailResponse.data?.memberType || ''
    };
    
    // 同时设置预加载数据，避免重复调用
    if (detailResponse.code === 200) {
      preloadedData.value = detailResponse.data;
      console.log("预加载用户个人信息详情：", preloadedData.value);
    }
    
    console.log('Updated state.user:', state.user);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    // 如果getUserDetail失败，至少保证基本信息可用
    try {
      const profileResponse = await getUserProfile();
      state.userId = profileResponse.data.userId;
      state.roleGroup = profileResponse.roleGroup;
      state.postGroup = profileResponse.postGroup;
      state.user = {
        ...profileResponse.data,
        account: profileResponse.data.userName
      };
    } catch (profileError) {
      console.error('获取基本用户信息也失败:', profileError);
    }
  }
};

const isroleGroup = computed(() => {
  const rolegroup = state.roleGroup;
  return rolegroup === '自由职业者' || rolegroup === '组织内部成员';
})

const handleDetailView = async () => {
  showUserProfile.value = true;
}

const handleClose = () => {
  showUserProfile.value = false;
}

const handleRefreshUserDetail = async () => {
  await fetchUserDetail();
}
// 预加载用户个人信息详情数据
const fetchUserDetail = async () => {
  try {
    const response = await getUserDetail();
    if (response.code === 200) {
      preloadedData.value = response.data;
      console.log("更新的用户个人信息详情：", preloadedData.value);
    } else {
      ElMessage.warning(response.msg || "更新用户个人信息详情失败");
    }
  } catch (error) {
    console.error('获取用户详情数据出错:', error);
  }
}

onMounted(async () => {
  await getUser();
  if (isroleGroup.value) {
    console.log("进入定时更新流程");
    // 设置每3分钟（180000毫秒）更新一次数据
    updateTimer = setInterval(() => {
      fetchUserDetail();
    }, 180000);
  }
})

onUnmounted(() => {
  if (updateTimer) {
    clearInterval(updateTimer);
    updateTimer = null;
  }
})
</script>

<style lang="scss" scoped>
//查看认证信息按钮样式
.view-profile-btn {
  margin-left: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  background-color: #409eff;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.2);
  transition: all 0.3s ease;
  border: none;

  // 按钮内部间距
  span {
    margin-right: 6px;
  }

  // 箭头图标基础样式
  .btn-arrow {
    font-size: 14px;
    transition: transform 0.3s ease;
  }

  // 悬停状态：上浮、箭头移动、阴影增强
  &:hover {
    background-color: #3388ee;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(64, 158, 255, 0.3);

    .btn-arrow {
      transform: translateX(2px);
    }
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(64, 158, 255, 0.2);

    .btn-arrow {
      transform: translateX(0);
    }
  }
}

/* 弹窗样式 */
:deep(.user-profile-dialog) {
  .el-dialog {
    margin: 0 !important;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    overflow: hidden;
    max-width: 500px;
  }

  .el-dialog__header {
    padding: 0;
    margin: 0;
    border-bottom: none;
    display: none;
  }

  .el-dialog__body {
    padding: 0;
    margin: 0;
    flex: 1;
    overflow: auto;
    background: #f5f7fa;
  }

  .el-dialog__footer {
    padding: 0;
    margin: 0;
    border-top: none;
    display: none;
  }

  .el-dialog__headerbtn {
    display: none;
  }
}

.profile-container {
  padding: 10px;
  background-color: #f5f7fa;
  height: calc(100vh - 84px);
  overflow: hidden;

  .profile-card {
    border-radius: 12px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border: none;
    height: calc(100vh - 104px);
    display: flex;
    flex-direction: column;

    .profile-content {
      .profile-header {
        .avatar-section {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #eee;
          margin-bottom: 0;

          .avatar-wrapper {
            margin-right: 16px;
            width: 100px;
            height: 100px;
            border-radius: 50%;
            overflow: hidden;
            border: 2px solid #ebeef5;
          }

          .user-basic-info {
            .user-name {
              margin: 0 0 3px 0;
              font-size: 20px;
              font-weight: 600;
              color: #303133;
            }

            .user-role {
              color: #909399;
              font-size: 14px;
              margin: 0;
            }
          }
        }

        .profile-details {
          padding: 0 20px 20px;

          .info-item {
            display: flex;
            flex-direction: column;
            padding: 15px;
            background-color: #fafafa;
            border-radius: 8px;
            height: 100%;
            transition: all 0.3s;

            &:hover {
              background-color: #f0f0f0;
              transform: translateY(-2px);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            .info-label {
              display: flex;
              align-items: center;
              color: #606266;
              font-size: 14px;
              margin-bottom: 8px;

              .el-icon {
                margin-right: 8px;
                font-size: 16px;
                color: #409eff;
              }
            }

            .info-value {
              color: #303133;
              font-size: 16px;
              font-weight: 500;
              word-break: break-all;
            }
          }
        }
      }
    }
  }

  .content-card {
    border-radius: 12px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border: none;

    :deep(.el-card__header) {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
      border-radius: 12px 12px 0 0;
      padding: 15px 20px;
    }

    .profile-tabs {
      :deep(.el-tabs__header) {
        margin-bottom: 10px;
        flex-shrink: 0;

        .el-tabs__nav-wrap::after {
          display: none;
        }

        .el-tabs__item {
          font-size: 14px;
          font-weight: 500;
          padding: 0 20px;

          &.is-active {
            color: #409eff;
            font-weight: 600;
          }
        }

        .el-tabs__active-bar {
          background-color: #409eff;
          height: 3px;
        }
      }

      :deep(.el-tabs__content) {
        padding: 0 16px 10px;
        flex: 1;
        overflow: hidden;
      }

      :deep(.el-tab-pane) {
        height: 100%;
        overflow-y: auto;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .profile-container {
    padding: 10px;

    .profile-card {
      .profile-content {
        .profile-header {
          .avatar-section {
            flex-direction: column;
            text-align: center;

            .avatar-wrapper {
              margin-right: 0;
              margin-bottom: 15px;
              width: 90px;
              height: 90px;
            }

            .profile-details {
              padding: 0 10px 15px;

              .el-col {
                margin-bottom: 10px;
              }

              .info-item {
                padding: 12px;

                .info-label {
                  font-size: 13px;
                }

                .info-value {
                  font-size: 14px;
                }
              }
            }
          }
        }
      }

      .content-card {
        :deep(.el-card__header) {
          padding: 12px 15px;
        }

        .profile-tabs {
          :deep(.el-tabs__item) {
            font-size: 14px;
            padding: 0 20px;
          }
        }
      }
    }
  }
}
</style>