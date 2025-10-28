<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="成员姓名" prop="realName">
        <el-input v-model="queryParams.realName" placeholder="请输入姓名" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="证件号" prop="idNumber">
        <el-input v-model="queryParams.idNumber" placeholder="请输入证件号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="证件类型" prop="idType">
        <el-select v-model="queryParams.idType" placeholder="请选择证件类型" clearable style="width: 140px">
          <el-option v-for="type in credentialTypeList" :key="type.idTypeCode" :label="type.idTypeName"
            :value="type.idTypeCode" />
        </el-select>
      </el-form-item>
      <el-form-item label="审核状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择审核状态" clearable style="width: 140px">
          <el-option label="全部" value="" />
          <el-option label="待审核" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="verifyListData">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" width="80">
        <template #default="scope">
          {{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="成员名称" align="center" prop="userName" />
      <el-table-column label="证件类型" align="center" prop="idType" />
      <el-table-column label="证件号码" align="center" prop="idNumber" />
      <el-table-column label="真实姓名" align="center" prop="realName" />
      <el-table-column label="证件照片" align="center" width="140">
        <template #default="scope">
          <div v-if="scope.row.idCardFront || scope.row.idCardBack">
            <el-button
              link
              type="primary"
              icon="View"
              @click="handleViewBothImages(scope.row)"
              title="查看照片"
              size="small"
            >查看</el-button>
            <el-button
              link
              type="success"
              icon="Download"
              @click="handleDownloadBothImages(scope.row)"
              title="下载"
              size="small"
            >下载</el-button>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="提交时间" align="center" prop="submitTime" width="160" />
      <el-table-column label="审核状态" align="center" prop="status">
        <template #default="{ row }">
          <el-tag :type="row.status === 'approved'
            ? 'success'
            : row.status === 'rejected'
              ? 'danger'
              : 'warning'
            ">
            {{
              row.status === "approved"
                ? "已通过"
                : row.status === "rejected"
                  ? "已拒绝"
                  : "待审核"
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="审核时间" align="center" prop="handleTime" width="160" />
      <el-table-column label="操作" align="center" width="200">
        <template #default="{ row }">
          <!-- 只有待审核状态可点击，其他状态灰显 -->
          <el-button :disabled="row.status !== 'pending'" :type="row.status === 'pending' ? 'primary' : 'default'"
            @click="handleAudit(row)">审核</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination v-model:current-page="queryParams.pageNum" v-model:page-size="queryParams.pageSize" :total="total"
      layout="prev, pager, next" :page-sizes="[10, 20, 30]" @size-change="getList" @current-change="getList"
      style="text-align: right; margin-top: 20px" />
  </div>
  <!-- 审核弹窗 -->
  <el-dialog v-model="auditDialogVisible" title="审核实名认证" width="400px">
    <el-form :model="auditForm" label-width="100px">
      <el-form-item label="审核状态">
        <el-select v-model="auditForm.status" placeholder="请选择状态" @change="handleStatusChange">
          <el-option label="通过" value="approved" />
          <el-option label="拒绝" value="rejected" />
        </el-select>
      </el-form-item>
      <el-form-item label="审核意见">
        <el-input v-model="auditForm.handlerOpinion" type="textarea" :rows="3" placeholder="请输入审核意见" />
        <!-- 显示建议列表 -->
        <div class="suggestions" v-if="suggestions.length > 0">
          <p class="suggestions-title">建议（可点击下方建议填充）：</p>
          <div class="suggestion-items">
            <span class="suggestion-item" v-for="(suggestion, index) in suggestions" :key="index"
              @click="useSuggestion(suggestion)">
              {{ suggestion }}
            </span>
          </div>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="auditDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitAudit">提交</el-button>
    </template>
  </el-dialog>

  <!-- 图片查看对话框 -->
  <el-dialog title="证件照片" v-model="imageDialogVisible" width="900px" append-to-body>
    <div class="images-container">
      <div v-if="currentImages.front" class="image-item">
        <h4>正面</h4>
        <el-image
          :src="currentImages.front"
          :preview-src-list="[currentImages.front]"
          fit="contain"
          style="width: 100%; max-height: 400px;"
        />
      </div>
      <div v-if="currentImages.back" class="image-item">
        <h4>反面</h4>
        <el-image
          :src="currentImages.back"
          :preview-src-list="[currentImages.back]"
          fit="contain"
          style="width: 100%; max-height: 400px;"
        />
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleDownloadCurrentImages">下载全部</el-button>
        <el-button @click="imageDialogVisible = false">关 闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, onActivated } from "vue";
import { ElMessage } from "element-plus";
import { getCredentialTypeListForOrgmember } from '@/api/userinfo/userinfo'
import { getVerifyList, auditVerify } from "@/api/verify/verify";


const credentialTypeList = ref([])  // 证件类型列表

// 获取组织内部成员证件类型列表
const fetchCredentialTypeListForOrgmember = async () => {
  try {
    const response = await getCredentialTypeListForOrgmember()
    if (response.code === 200) {
      credentialTypeList.value = response.data || []
      console.log('组织内部成员证件类型列表:', credentialTypeList.value)
    } else {
      ElMessage.error(response.msg || '获取组织内部成员证件类型列表失败')
    }
  } catch (error) {
    console.error('获取组织内部成员证件类型列表异常:', error)
    ElMessage.error('获取组织内部成员证件类型列表异常，请重试')
  }
}

// 控制搜索区域显示
const showSearch = ref(true); // ✅ 增加这一行

// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  realName: "",
  idNumber: "",
  idType: "",
  status: "",
});

// 表格数据
const verifyListData = ref([]);
const total = ref(0);
const loading = ref(false);

// 加载数据
const getList = async () => {
  loading.value = true;
  try {
    const res = await getVerifyList(queryParams.value);
    verifyListData.value = res.rows;
    total.value = res.total;
    console.log(res);
  } finally {
    loading.value = false;
  }
};

// 页面加载时初始化数据
onMounted(() => {
  fetchCredentialTypeListForOrgmember();
  getList();
});

// 组件激活时重新加载数据（解决 keep-alive 缓存导致的空白问题）
// onActivated(() => {
//   fetchCredentialTypeListForOrgmember();
//   getList();
// });

// 搜索按钮
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

// 重置按钮
const resetQuery = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    realName: "",
    idNumber: "",
    idType: "",
    status: "",
  };
  getList();
};

// 审核操作
const auditForm = ref({
  userId: null,
  verifyId: null,
  status: "approved",
  handlerOpinion: "",
});
const auditDialogVisible = ref(false);

// 图片查看相关
const imageDialogVisible = ref(false);
const currentRecord = ref(null);
const currentImages = ref({ front: '', back: '' });

// 审核建议
const suggestions = ref([]);
// 审核状态变更时更新建议
const handleStatusChange = (status) => {
  if (status === 'approved') {
    suggestions.value = [
      "信息核实无误，予以通过",
      "证件信息与提交信息一致，审核通过",
      "实名认证信息有效，同意通过"
    ];
  } else if (status === 'rejected') {
    suggestions.value = [
      "证件信息与提交信息不符，予以拒绝",
      "证件模糊不清，无法核实，审核未通过",
      "信息不完整，请补充后重新提交"
    ];
  }
};
// 使用建议
const useSuggestion = (suggestion) => {
  auditForm.value.handlerOpinion = suggestion;
};

const handleAudit = (row) => {
  auditForm.value.userId = row.userId;
  auditForm.value.verifyId = row.verifyId;
  auditForm.value.status = "approved";
  auditForm.value.handlerOpinion = "";
  auditDialogVisible.value = true;
  handleStatusChange(auditForm.value.status);
};

const submitAudit = async () => {
  try {
    await auditVerify(auditForm.value);
    ElMessage.success("审核提交成功");
    auditDialogVisible.value = false;
    getList(); // 刷新数据
  } catch (error) {
    ElMessage.error("审核提交失败");
  }
};

// 图片处理函数
/** 查看正反面图片 */
const handleViewBothImages = (record) => {
  currentRecord.value = record;
  currentImages.value = { front: '', back: '' };
  
  // 处理正面照片
  if (record.idCardFront) {
    currentImages.value.front = formatImageData(record.idCardFront);
  }
  
  // 处理反面照片
  if (record.idCardBack) {
    currentImages.value.back = formatImageData(record.idCardBack);
  }
  
  if (currentImages.value.front || currentImages.value.back) {
    imageDialogVisible.value = true;
  } else {
    ElMessage.error('没有可查看的图片');
  }
};

/** 格式化图片数据 */
const formatImageData = (imageData) => {
  if (!imageData) return '';
  
  if (typeof imageData === 'string') {
    if (imageData.startsWith('data:')) {
      return imageData;
    } else {
      return `data:image/jpeg;base64,${imageData}`;
    }
  }
  return '';
};

/** 下载图片 */
const handleDownloadImage = (imageData, fileName) => {
  if (!imageData) {
    return;
  }
  
  try {
    let base64String = formatImageData(imageData);
    
    if (!base64String) {
      ElMessage.error('不支持的图片数据格式');
      return;
    }
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = base64String;
    link.download = `${fileName}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    ElMessage.success('图片下载成功');
  } catch (error) {
    ElMessage.error('图片下载失败');
  }
};

/** 下载正反面图片 */
const handleDownloadBothImages = (record) => {
  const userName = record.realName || record.userName || '用户';
  
  // 下载正面
  if (record.idCardFront) {
    handleDownloadImage(record.idCardFront, `${userName}_证件正面`);
  }
  
  // 下载反面
  if (record.idCardBack) {
    handleDownloadImage(record.idCardBack, `${userName}_证件反面`);
  }
  
  if (!record.idCardFront && !record.idCardBack) {
    ElMessage.error('没有可下载的图片');
  }
};

/** 下载当前查看的图片 */
const handleDownloadCurrentImages = () => {
  if (currentRecord.value) {
    handleDownloadBothImages(currentRecord.value);
  }
};
</script>

<style scoped>
.suggestions {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #eee;
}

.suggestions-title {
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.suggestion-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-item {
  padding: 4px 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-item:hover {
  background-color: #e4e7ed;
}

/* 图片查看对话框样式 */
.images-container {
  display: flex;
  gap: 20px;
  justify-content: center;
  padding: 20px;
}

.image-item {
  flex: 1;
  text-align: center;
  max-width: 400px;
}

.image-item h4 {
  margin: 0 0 10px 0;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.image-item .el-image {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

/* 当只有一张图片时居中显示 */
.images-container:has(.image-item:only-child) {
  justify-content: center;
}

.images-container:has(.image-item:only-child) .image-item {
  max-width: 500px;
}
</style>