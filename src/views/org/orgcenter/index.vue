<template>
  <div class="organization-page">
    <el-card class="organization-data">
      <!-- 头部 -->
      <template #header>
        <div class="card-header">
          <span>组织详细信息</span>
        </div>
      </template>

      <!-- 基础信息展示 -->
      <div class="basic-info">
        <h4 class="basic-info">基础信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="组织名称">{{
            staticData.orgName
          }}</el-descriptions-item>
          <el-descriptions-item label="组织类型">{{
            staticData.orgType
          }}</el-descriptions-item>
          <el-descriptions-item label="项目范围">{{
            staticData.projectScope
          }}</el-descriptions-item>
          <el-descriptions-item label="组织简介">{{
            staticData.orgIntroduction
          }}</el-descriptions-item>
          <el-descriptions-item label="平台权重">{{
            staticData.platformWeight
          }}</el-descriptions-item>
          <el-descriptions-item label="评估模型">{{
            staticData.evaluateModel
          }}</el-descriptions-item>
          <el-descriptions-item label="报告类型">{{
            staticData.reportType
          }}</el-descriptions-item>
          <el-descriptions-item label="联系邮箱">{{
            staticData.contactEmail
          }}</el-descriptions-item>
          <el-descriptions-item label="地址">{{
            staticData.address
          }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 凭证信息（只读） -->
      <div class="credentials-info">
        <h4 class="org-info">组织凭证信息</h4>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="实名认证状态">
            <el-tag :type="staticData.userIdentityVerificationVo?.verified ? 'success' : 'danger'">
              {{ staticData.userIdentityVerificationVo?.verified ? '已认证' : '未认证' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag 
              :type="staticData.userIdentityVerificationVo?.status === '已通过' ? 'success' : 
                     staticData.userIdentityVerificationVo?.status === '已驳回' ? 'danger' : 'warning'">
              {{ staticData.userIdentityVerificationVo?.status || '未提交' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="证件类型">
            {{ staticData.userIdentityVerificationVo?.idType || '暂无' }}
          </el-descriptions-item>
          <el-descriptions-item label="组织注册人姓名">
            {{ staticData.userIdentityVerificationVo?.realName || '暂无' }}
          </el-descriptions-item>
          <el-descriptions-item label="组织凭证编号">
            {{ staticData.userIdentityVerificationVo?.idNumber || '暂无' }}
          </el-descriptions-item>
          <el-descriptions-item label="组织凭证照片">
            <div v-if="staticData.userIdentityVerificationVo?.idCardFront">
              <el-image
                :src="'data:image/jpeg;base64,' + staticData.userIdentityVerificationVo.idCardFront"
                :preview-src-list="['data:image/jpeg;base64,' + staticData.userIdentityVerificationVo.idCardFront]"
                fit="contain"
                style="width: 200px; height: 150px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px;"
                preview-teleported
              />
              <div>
                <el-button type="primary" size="small" @click="downloadCertificateImage">
                  下载凭证照片
                </el-button>
              </div>
            </div>
            <span v-else style="color: #999;">暂无凭证照片</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>



      <!-- 底部编辑按钮 -->
      <div class="edit-footer">
        <el-button type="primary" @click="openEditModal">
          编辑基础信息
        </el-button>
      </div>
    </el-card>

    <!-- 认证文件弹窗 -->
    <el-dialog v-model="showPreview" title="认证文件预览"  center>
      <img
        :src="previewImageUrl"
        alt="预览"
        style="max-width: 100%; max-height: 80vh"
      />
    </el-dialog>

    <!-- 编辑模态框 -->
    <el-dialog
      v-model="showEditModal"
      title="编辑组织基础信息"
      width="600px"
      :before-close="closeEditModal"
      class="edit-modal"
    >
      <el-form
        :model="editableData"
        label-width="120px"
        label-position="left"
        :rules="rules"
      >
        <el-form-item label="组织名称" prop="orgName">
          <el-input v-model="editableData.orgName" disabled="true"></el-input>
        </el-form-item>

        <el-form-item label="组织类型" prop="orgType">
          <el-input v-model="editableData.orgType" disabled="true"></el-input>
        </el-form-item>

        <el-form-item label="项目范围" prop="projectScope">
          <el-select v-model="editableData.projectScope" disabled="true">
            <el-option label="开源项目"></el-option>
            <el-option label="国家重点发展项目"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="组织简介" prop="orgIntroduction">
          <el-input
            v-model="editableData.orgIntroduction"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
          >
            ></el-input
          >
        </el-form-item>

        <el-form-item label="平台权重" prop="platformWeight">
          <el-input
            v-model="editableData.platformWeight"
            disabled="true"
          ></el-input>
        </el-form-item>

        <el-form-item label="评估模型" prop="evaluateModel">
          <el-select v-model="editableData.evaluateModel"></el-select>
          <!-- <el-input v-model="editableData.evaluateModel"></el-input> -->
        </el-form-item>

        <el-form-item label="报告类型" prop="reportType">
          <el-input
            v-model="editableData.reportType"
            disabled="true"
          ></el-input>
        </el-form-item>

        <el-form-item label="联系邮箱" prop="contactEmail">
          <el-input v-model="editableData.contactEmail" type="email"></el-input>
        </el-form-item>

        <el-form-item label="位置" prop="location">
          <el-tree-select
            v-model="editableData.region"
            :data="regionTreeData"
            placeholder="请选择地区"
            :props="{ children: 'children', label: 'fullPath', value: 'id' }"
            @change="handleRegionChange"
            clearable
            :render-after-expand="false"
            check-strictly
            style="width: 100%"
          >
            <template #default="{ data }">
              {{ data.name }}
            </template>
          </el-tree-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeEditModal">取消</el-button>
          <el-button type="primary" @click="saveChanges">保存更改</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, reactive } from "vue";
import { ElMessage } from "element-plus";
import { getOrgCenter, updateOrgCenter } from "@/api/orgcenter";
import { getRegionTree } from "@/api/register";
import idCardImg from "@/assets/testimg/idCardImg.png";
const staticData = reactive({
  orgId: 0,
  orgName: "",
  orgType: "",
  projectScope: "",
  orgIntroduction: "",
  platformWeight: "",
  evaluateModel: "",
  reportType: "",
  contactEmail: "",
  address: "",
  userIdentityVerificationVo: {
    idCardBack: "",
    idCardFront: "",
    idNumber: "",
    idType: "",
    realName: "",
    status: "",
    verified: false,
  },
});

// 模态框状态
const showEditModal = ref(false);
const editableData = ref({});


// 认证文件弹窗状态
const showPreview = ref(false);
const previewImageUrl = ref("");


// 地区数据
const regionTreeData = ref([]);

// 邮箱校验
const validateEmailUnique = async (rule, value, callback) => {
  if (!value) {
    return callback();
  }

  // 邮箱格式验证
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(value)) {
    return callback(
      new Error("邮箱格式不正确，请输入有效的邮箱地址，例如：user@example.com")
    );
  }

  // 如果是编辑且邮箱未改变，则跳过验证
  if (editableData.value.orgId && editableData.value.originalEmail === value) {
    return callback();
  }

  try {
    // 调用接口验证邮箱是否已存在
    const response = await checkEmailExists(value);
    if (response.exists) {
      callback(new Error("该邮箱已被其他组织使用"));
    } else {
      callback();
    }
  } catch (error) {
    console.error("邮箱验证失败:", error);
    callback();
  }
};
const rules = ref({
  orgName: { required: true, message: "请输入组织名称", trigger: "blur" },
  orgType: { required: true, message: "请选择组织类型", trigger: "change" },
  projectScope: {
    required: true,
    message: "请选择项目范围",
    trigger: "change",
  },
  contactEmail: [
    {
      required: true,
      message: "请输入有效的联系邮箱，例如：user@example.com",
      trigger: "blur",
    },
    {
      type: "email",
      message: "请输入有效的联系邮箱，例如：user@example.com",
      trigger: ["blur", "change"],
    },
    { validator: validateEmailUnique, trigger: "blur" },
  ],
});

// 下载凭证照片
const downloadCertificateImage = () => {
  if (!staticData.userIdentityVerificationVo?.idCardFront) {
    ElMessage.warning('暂无凭证照片可下载');
    return;
  }
  
  try {
    let base64String = '';
    const imageData = staticData.userIdentityVerificationVo.idCardFront;
    
    // 处理base64数据
    if (typeof imageData === 'string') {
      if (imageData.startsWith('data:')) {
        // 已经是完整的data URL
        base64String = imageData;
      } else {
        // 纯base64字符串，添加前缀
        base64String = `data:image/jpeg;base64,${imageData}`;
      }
    } else {
      ElMessage.error('不支持的图片数据格式');
      return;
    }
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = base64String;
    link.download = `${staticData.orgName || '组织'}_凭证照片.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    ElMessage.success('凭证照片下载成功');
  } catch (error) {
    console.error('下载凭证照片失败:', error);
    ElMessage.error('凭证照片下载失败');
  }
};

// 认证文件预览

const previewImage = (url) => {
  previewImageUrl.value = url;
  showPreview.value = true;
};


// 关闭预览
const closePreview = () => {
  showPreview.value = false;
};



// 递归构建完整的地区数据，为每个节点添加完整路径信息
const buildRegionTreeWithPath = (nodes, parentPath = '') => {
  return nodes.map(node => {
    const currentPath = parentPath ? `${parentPath}${node.name}` : node.name;
    
    const processedNode = {
      ...node,
      originalName: node.name, // 保存原始名称
      fullPath: currentPath, // 完整路径
      isLeaf: !node.children || node.children.length === 0
    };
    
    if (node.children && node.children.length > 0) {
      processedNode.children = buildRegionTreeWithPath(node.children, currentPath);
    }
    
    return processedNode;
  });
};

// 递归查找节点并返回完整路径
const findNodePath = (nodes, targetId, currentPath = []) => {
  for (const node of nodes) {
    const newPath = [...currentPath, node];
    
    if (node.id === targetId) {
      return newPath;
    }
    
    if (node.children && node.children.length > 0) {
      const result = findNodePath(node.children, targetId, newPath);
      if (result) {
        return result;
      }
    }
  }
  return null;
};

// 加载地区数据
const loadRegionData = () => {
  getRegionTree().then(response => {
    regionTreeData.value = buildRegionTreeWithPath(response.data);
  }).catch(error => {
    console.error('获取地区数据失败:', error);
    regionTreeData.value = [];
  });
};

// 地区选择处理
const handleRegionChange = (regionId) => {
  if (!regionId) {
    // 清空选择时只清空地址
    editableData.value.address = '';
    return;
  }
  
  // 查找选中节点的完整路径
  const pathNodes = findNodePath(regionTreeData.value, regionId);
  
  if (pathNodes) {
    // 使用originalName构建完整地址字符串，确保使用原始名称
    const fullAddress = pathNodes.map(node => node.originalName).join('');
    
    // 设置组织地址
    editableData.value.address = fullAddress;
  }
};

// 根据地区路径反向查找地区ID
const findRegionIdByAddress = (nodes, address) => {
  if (!address) return null;
  
  for (const node of nodes) {
    // 检查当前节点的完整路径是否匹配
    if (node.fullPath === address) {
      return node.id;
    }
    
    // 递归查找子节点
    if (node.children && node.children.length > 0) {
      const result = findRegionIdByAddress(node.children, address);
      if (result) {
        return result;
      }
    }
  }
  return null;
};

// 查看组织信息
const fetchOrgCenter = async () => {
  try {
    const response = await getOrgCenter();
    // 这里应该将获取到的数据赋值给 staticData
    console.log("查看组织信息", response);

    Object.assign(staticData, response.data);

    // 测试图片展示效果
    if (response.data.userIdentityVerificationVo.idCardFront === null) {
      staticData.userIdentityVerificationVo.idCardFront = idCardImg;
    }
  } catch (error) {
    console.error("获取组织信息失败:", error);
  }
};

// 打开编辑模态框
const openEditModal = () => {
  showEditModal.value = true;
  editableData.value = { ...staticData };

  // 设置地区回显逻辑
  if (editableData.value.address && regionTreeData.value.length > 0) {
    const regionId = findRegionIdByAddress(regionTreeData.value, editableData.value.address);
    if (regionId) {
      editableData.value.region = regionId;
    }
  }
};


// 关闭编辑模态框
const closeEditModal = () => {
  showEditModal.value = false;
};

// 保存更改
const saveChanges = async () => {
  try {
    // 这里应该调用更新接口
    await updateOrgCenter(editableData.value);

    // 更新静态数据
    Object.assign(staticData, editableData.value);
    closeEditModal();

    ElMessage.success("组织基础信息已更新！");
  } catch (error) {
    console.error("更新失败:", error);
    ElMessage.error("更新失败，请重试");
  }
};




onMounted(() => {
  fetchOrgCenter();
  loadRegionData();
});

// 组件激活时重新加载数据（解决 keep-alive 缓存导致的空白问题）
// onActivated(() => {
//   fetchOrgCenter();
//   loadRegionData();
// });

</script>

<style lang="scss" scoped>
.organization-page {
  max-width: 90%;
  margin: 0 auto;
  padding: 20px;

  .organization-data {
    :deep(.el-card__header) {
      background-color: #f5f7fa;
      border-bottom: 1px solid #ebeef5;
    }

    .card-header {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    h4 {
      color: #606266;
      margin: 20px 0 15px;
      font-size: 16px;
      font-weight: 500;

      &:first-child {
        margin-top: 0;
      }
      &.org-info {
        margin-top: 15px;
      }
    }

    .credentials-info {
      .status-container {
        display: flex;
        align-items: center;
        gap: 10px;

        .view-btn {
          padding: 0;
        }
      }
    }

    .edit-footer {
      margin-top: 30px;
      text-align: right;
    }
  }

  :deep(.el-descriptions) {
    .el-descriptions__label {
      width: 120px;
      font-weight: 500;
    }

    .el-descriptions__content {
      color: #606266;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}

// 编辑模态框样式
:deep(.edit-modal) {
  .el-form {
    .el-form-item {
      .el-form-item__label {
        padding-left: 10px;
      }
      &:nth-child(1),
      &:nth-child(2),
      &:nth-child(3),
      &:nth-child(8) {
        .el-form-item__label {
          padding-left: 0;
        }
      }
    }
  }
}
</style>
