<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="姓名" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入姓名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="国籍" prop="nationality">
        <el-select
          v-model="queryParams.nationality"
          placeholder="请选择国籍"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="item in nationalityOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="成员类型" prop="userTypeNames">
        <el-tree-select
          v-model="queryParams.userTypeNames"
          :data="userTypeOptions"
          :props="{ label: 'name', value: 'userTypeId', children: 'children' }"
          placeholder="请选择成员类型"
          clearable
          check-strictly
          style="width: 240px"
        />
      </el-form-item>

      <el-form-item label="是否激活" prop="isActivated">
        <el-select
          v-model="queryParams.isActivated"
          placeholder="请选择激活状态"
          clearable
          style="width: 240px"
        >
          <el-option label="激活" :value="1" />
          <el-option label="未激活" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-select
          v-model="queryParams.sex"
          placeholder="请选择性别"
          clearable
          style="width: 240px"
        >
          <el-option label="男" value="男" />
          <el-option label="女" value="女" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['register:register:adddeptmember']"
          >注册成员</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Upload"
          @click="openBatchAddDialog"
          v-hasPermi="['register:register:addbatchdeptmembers']"
          >批量注册成员</el-button
        >
      </el-col>
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="userinfoList"
      @selection-change="handleSelectionChange"
      style="width: 100%"
    >
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="序号" align="center" type="index" width="60" />
      <el-table-column label="账号" align="center" prop="account" min-width="100" show-overflow-tooltip />
      <el-table-column label="姓名" align="center" prop="userName" min-width="80" show-overflow-tooltip />
      <el-table-column label="性别" align="center" prop="sex" width="60" />
      <el-table-column label="出生年月" align="center" prop="birthDate" min-width="100">
        <template #default="scope">
          <span>{{ parseTime(scope.row.birthDate, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column label="国籍" align="center" prop="nationality" min-width="80" show-overflow-tooltip />
      <el-table-column label="联系邮箱" align="center" prop="contactEmail" min-width="120" show-overflow-tooltip />
      <el-table-column label="成员类型" align="center" prop="userTypeNames" min-width="100" show-overflow-tooltip />
      <el-table-column label="专业" align="center" prop="major" width="100" show-overflow-tooltip />
      <el-table-column label="实名认证" align="center" width="80">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleViewCredentials(scope.row)" v-hasPermi="['verify:user:identityVerification']">查看</el-button>
        </template>
      </el-table-column>
      <el-table-column label="激活状态" align="center" prop="isActivated" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.isActivated === 1 ? 'success' : 'info'" size="small">
            {{ scope.row.isActivated === 1 ? "激活" : "未激活" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="激活时间"
        align="center"
        prop="activationTime"
        min-width="100"
      >
        <template #default="scope">
          <span>{{ parseTime(scope.row.activationTime, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        min-width="100"
      >
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="120"
        class-name="small-padding fixed-width"
        fixed="right"
      >
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            size="small"
            >编辑</el-button
          >

        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改用户基础信息对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form
        ref="userinfoRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="学号" prop="studentId">
          <el-input v-model="form.studentId" placeholder="请输入学号" :disabled="title === '修改成员信息'" />
        </el-form-item>
        <el-form-item label="姓名" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="form.sex">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生年月" prop="birthDate">
          <el-date-picker
            v-model="form.birthDate"
            type="date"
            placeholder="请选择出生年月"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledDate"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="国籍" prop="nationality">
          <el-select v-model="form.nationality" placeholder="请选择国籍" style="width: 100%">
            <el-option
              v-for="item in nationalityOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="联系邮箱" prop="contactEmail">
          <el-input v-model="form.contactEmail" placeholder="请输入联系邮箱" />
        </el-form-item>
         <el-form-item label="成员专业" prop="major">
          <el-input v-model="form.major" placeholder="请输入成员专业" />
        </el-form-item>
       <el-form-item label="成员类型" prop="userTypeId">
          <el-tree-select
            v-model="form.userTypeId"
            :data="userTypeOptions"
            :props="{ label: 'name', value: 'userTypeId', children: 'children' }"
            placeholder="请选择成员类型"
            clearable
            check-strictly
            style="width: 100%"
          />
        </el-form-item>

        <!-- 平台账号信息 - 仅在新增时显示 -->
        <div v-if="title !== '修改成员信息'">
          <el-divider content-position="left">平台账号信息</el-divider>
          
          <el-form-item label="平台账号" prop="platformAccounts">
            <div v-if="form.platformAccounts && form.platformAccounts.length > 0">
              <div 
                v-for="(account, index) in form.platformAccounts" 
                :key="index" 
                style="display: flex; align-items: center; margin-bottom: 10px;"
              >
                <el-select 
                  v-model="account.platformId" 
                  placeholder="选择平台" 
                  style="width: 150px; margin-right: 10px;"
                >
                  <el-option
                    v-for="platform in platformList"
                    :key="platform.platformId"
                    :label="platform.platformName"
                    :value="platform.platformId"
                  />
                </el-select>
                <el-input 
                  v-model="account.platformUsername" 
                  placeholder="平台用户名" 
                  style="flex: 1; margin-right: 10px;"
                />
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="removePlatformAccount(index)"
                  icon="Delete"
                >
                  删除
                </el-button>
              </div>
            </div>
            <el-button 
              type="primary" 
              size="small" 
              @click="addPlatformAccount"
              icon="Plus"
            >
              添加平台账号
            </el-button>
          </el-form-item>
        </div>

      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>



    <!-- 实名认证信息查看弹窗 -->
    <el-dialog v-model="credentialsDialogVisible" title="成员实名认证信息" width="700px" append-to-body>
      <div v-if="currentCredentials">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="成员姓名">{{ currentCredentials.userName }}</el-descriptions-item>
          <el-descriptions-item label="实名认证状态">
            <el-tag :type="currentCredentials.verified ? 'success' : 'danger'">
              {{ currentCredentials.verified ? '已认证' : '未认证' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag v-if="currentCredentials.status" :type="getStatusType(currentCredentials.status)">
              {{ getStatusText(currentCredentials.status) }}
            </el-tag>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="证件类型">{{ currentCredentials.idType || '-' }}</el-descriptions-item>
          <el-descriptions-item label="真实姓名">{{ currentCredentials.realName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="证件号码">{{ currentCredentials.idNumber || '-' }}</el-descriptions-item>
        </el-descriptions>
        
        <!-- 证件照片 -->
        <div v-if="currentCredentials.idCardFront || currentCredentials.idCardBack" style="margin-top: 20px;">
          <h4>证件照片</h4>
          <div style="display: flex; gap: 20px; margin-top: 10px;">
            <div v-if="currentCredentials.idCardFront">
              <p>身份证正面</p>
              <el-image
                :src="'data:image/jpeg;base64,' + currentCredentials.idCardFront"
                style="width: 200px; height: 120px; border: 1px solid #ddd; border-radius: 4px;"
                fit="contain"
                :preview-src-list="['data:image/jpeg;base64,' + currentCredentials.idCardFront]"
                preview-teleported
              />
            </div>
            <div v-if="currentCredentials.idCardBack">
              <p>身份证反面</p>
              <el-image
                :src="'data:image/jpeg;base64,' + currentCredentials.idCardBack"
                style="width: 200px; height: 120px; border: 1px solid #ddd; border-radius: 4px;"
                fit="contain"
                :preview-src-list="['data:image/jpeg;base64,' + currentCredentials.idCardBack]"
                preview-teleported
              />
            </div>
          </div>
        </div>
        
        <!-- 暂无认证信息提示 -->
        <div v-if="currentCredentials.message" style="text-align: center; padding: 20px; color: #999;">
          {{ currentCredentials.message }}
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="credentialsDialogVisible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量注册成员弹窗 -->
    <el-dialog
      v-model="batchAddDialogVisible"
      title="批量注册成员"
      width="500px"
      class="batch-add-dialog"
    >
      <!-- 上传 -->
      <div class="file-upload">
        <el-upload
          class="upload-component"
          drag
          :http-request="handleFileUpload"
          :before-upload="beforeUpload"
          accept=".xlsx"
          :limit="1"
          :file-list="uploadFileList"
          :show-file-list="true"
          list-type="text"
        >
          <el-icon class="upload-icon"><Upload /></el-icon>
          <div class="upload-text" v-if="uploadFileList.length === 0">
            拖拽文件到此处，或<span>点击上传</span>
          </div>
          <div class="upload-text" v-else>
            文件已上传，若需要更改文件，请先清除当前文件后重新上传
          </div>
          <div class="upload-tip">
            支持单个Excel文件，大小不超过5MB
          </div>
        </el-upload>
      </div>
      <!-- 下载 -->
      <div class="download-container">
        <!-- 下载空白模板 -->
        <a role="button" @click="generateTemplate" class="download-btn"
          ><el-icon class="download-icon"><Download /></el-icon>模板文件.xlsx</a
        >
        <!-- 下载示例文件 -->
        <a
          href="../../../../public/orgMember/示例文件.xlsx"
          class="download-link"
          download="示例文件.xlsx"
          ><el-icon class="download-icon"><Download /></el-icon>示例文件.xlsx</a
        >
      </div>
      
      <!-- 底部 -->
      <template #footer>
        <el-button @click="batchAddDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="confirmImport"
        >
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Userinfo">
import { ref, reactive, toRefs, getCurrentInstance, onMounted, onActivated, onBeforeUnmount } from "vue";
import { ElMessage, ElLoading, ElMessageBox } from "element-plus";
import {
  listDeptMemberInfo,
  updateUserinfo,
  getUserTypeTree,
  getNationalityList as fetchNationalityList,
  getPlatformList,
  batchUploadDeptMembersFileOptimized,
  getProgress,
} from "@/api/userinfo/userinfo";
import { registerDeptMember } from "@/api/register";
import * as XLSX from "xlsx";
import { getUserIdentityVerification } from "@/api/verify/verify";
import download from "@/plugins/download";

const { proxy } = getCurrentInstance();

const userinfoList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const userTypeOptions = ref([]);
const nationalityOptions = ref([]);
const departmentOptions = ref([]);

// 平台账号相关
const platformList = ref([]);

// 实名认证弹窗相关
const credentialsDialogVisible = ref(false);
const currentCredentials = ref(null);

// 批量注册成员相关
const batchAddDialogVisible = ref(false);
const uploadFileList = ref([]);
const uploadedFile = ref(null);
const excelData = ref([]);
const validData = ref([]);
const invalidData = ref([]);
const isImporting = ref(false);
const importProgress = ref(0);
const importTaskId = ref(null);
const progressInterval = ref(null);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    account: null,
    userName: null,
    userTypeNames: null,
    nationality: null,
    contactEmail: null,
    isActivated: null,
    sex: null,
  },
  rules: {
    userCode: [{ required: true, message: "账号不能为空", trigger: "blur" }],
    studentId: [{ required: true, message: "学号不能为空", trigger: "blur" }],
    userName: [{ required: true, message: "姓名不能为空", trigger: "blur" }],
    sex: [{ required: true, message: "请选择性别", trigger: "change" }],
    birthDate: [{ required: true, message: "请选择出生年月", trigger: "change" }],
    major: [{ required: true, message: "请输入成员专业", trigger: "blur" }],
    nationality: [{ required: true, message: "请选择国籍", trigger: "change" }],
    contactEmail: [
      { type: "email", message: "请输入正确的邮箱格式", trigger: "blur" }
    ],
    userTypeNames: [{ required: true, message: "请选择成员类型", trigger: "change" }],platformAccounts: [
      {
        validator: (rule, value, callback) => {
          if (value && value.length > 0) {
            for (let i = 0; i < value.length; i++) {
              const account = value[i];
              if (!account.platformId) {
                callback(new Error(`第${i + 1}个平台账号的平台不能为空`));
                return;
              }
              if (!account.platformUsername) {
                callback(new Error(`第${i + 1}个平台账号的用户名不能为空`));
                return;
              }
            }
          }
          callback();
        },
        trigger: "blur"
      }
    ]
  },

});

const { queryParams, form, rules } = toRefs(data);

/** 查询当前部门下成员基础信息列表 */
function getList() {
  loading.value = true;
  // 获取成员类型数据
  getUserTypeTree().then((response) => {
    //console.log("userTypeOptions:", response.data);
    userTypeOptions.value = response.data;
  });
  
  listDeptMemberInfo(queryParams.value).then((response) => {
    console.log("查询参数:", queryParams.value);
    console.log("listDeptMemberInfo:", response.data);
    console.log("完整响应:", response);
    console.log("数据行数:", response.rows?.length, "总数:", response.total);
    userinfoList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    userId: null,
    account: null,
    studentId: null,
    userName: null,
    sex: null,
    birthDate: null,
    major: null,
    userTypeId: null,
    nationality: null,
    contactEmail: null,
    departmentNames: [],
    platformAccounts: [],
    isActivated: 0,
    activationTime: null,
    createTime: null,
    updateTime: null,
  };
  proxy.resetForm("userinfoRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  // console.log('=== 搜索参数详情 ===');
  // console.log('姓名:', queryParams.value.userName);
  // console.log('国籍:', queryParams.value.nationality);
  // console.log('成员类型:', queryParams.value.userTypeNames);
  // console.log('激活状态:', queryParams.value.isActivated);
  // console.log('性别:', queryParams.value.sex);
  // console.log('完整查询参数:', queryParams.value);
  // console.log('==================');
  
  queryParams.value.pageNum = 1;
  getList();
}

// 获取国籍列表
function getNationalityList() {
  fetchNationalityList().then((response) => {
    //console.log('获取到的国籍数据:', response.data);
    // 确保数据存在且为数组
    if (response.data && Array.isArray(response.data)) {
      // 将接口返回的数据转换为下拉框需要的格式，value使用中文名称
      nationalityOptions.value = response.data
        .filter(item => item && item.id && item.countryNameZh)
        .map(item => ({
          value: item.countryNameZh,  // 使用中文名称作为value
          label: item.countryNameZh   // 显示中文名称
        }));
      //console.log('转换后的国籍选项:', nationalityOptions.value);
    } else {
      //console.warn('国籍数据格式不正确:', response.data);
      nationalityOptions.value = [];
    }
  }).catch((error) => {
    //console.error('获取国籍列表失败:', error);
    nationalityOptions.value = [];
  });
}



// 禁用未来日期
function disabledDate(time) {
  return time.getTime() > Date.now();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  queryParams.value.sex = null;
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.userId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  // 确保国籍数据已加载
  if (nationalityOptions.value.length === 0) {
    getNationalityList();
  }
  open.value = true;
  title.value = "添加成员";
}

// 递归查找树形结构中匹配的成员类型
function findUserTypeInTree(treeData, targetName) {
  for (const node of treeData) {
    // 检查当前节点是否匹配
    if (node.name === targetName) {
      return node.userTypeId;
    }
    // 如果有子节点，递归查找
    if (node.children && node.children.length > 0) {
      const result = findUserTypeInTree(node.children, targetName);
      if (result !== null) {
        return result;
      }
    }
  }
  return null;
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  // 确保国籍数据已加载
  if (nationalityOptions.value.length === 0) {
    getNationalityList();
  }
  
  // 处理部门数据格式 - 确保是数组格式
  let departmentNamesArray = [];
  if (row.departmentNames) {
    if (Array.isArray(row.departmentNames)) {
      departmentNamesArray = row.departmentNames;
    } else if (typeof row.departmentNames === 'string') {
      // 如果是字符串，按逗号分割转为数组
      departmentNamesArray = row.departmentNames.split(',').map(item => item.trim()).filter(item => item);
    }
  }

   // 根据 userTypeNames 查找对应的 userTypeId（支持树形结构）
  let userTypeId = null;
  if (row.userTypeNames && userTypeOptions.value.length > 0) {
    userTypeId = findUserTypeInTree(userTypeOptions.value, row.userTypeNames);
  }
  
  // 直接使用表格行数据绑定到表单
  form.value = {
    userId: row.userId,
    userName: row.userName,
    studentId: row.account,  // 学号绑定account字段
    sex: row.sex,  // 性别绑定sex字段
    birthDate: row.birthDate,  // 出生年月绑定birthDate字段
    major: row.major,  // 专业绑定major字段
    nationality: row.nationality,
    contactEmail: row.contactEmail,  // 联系邮箱绑定contactEmail字段
    userTypeId: userTypeId,  // 根据userTypeNames查找对应的userTypeId
    departmentNames: departmentNamesArray,  // 部门绑定处理后的数组格式
    isActivated: row.isActivated,
    createTime: row.createTime,
    updateTime: row.updateTime
  };
  
  // console.log('编辑弹窗数据绑定:', {
  //   '原始部门数据': row.departmentNames,
  //   '处理后部门数据': departmentNamesArray,
  //   '表单数据': form.value
  // });
  
  open.value = true;
  title.value = "修改成员信息";
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["userinfoRef"].validate((valid) => {
    if (valid) {
      if (form.value.userId != null) {
        updateUserinfo(form.value).then((response) => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        form.value.account = form.value.studentId;  // 将学号绑定到account字段
        // 将平台账号数据传递给后端
        const submitData = {
          ...form.value,
          platformAccounts: form.value.platformAccounts || []
        };
        
        // 输出提交给后端的请求体数据，方便调试
        console.log('=== 注册成员请求体数据 ===');
        console.log('完整请求体:', submitData);
        console.log('各字段详情:');
        console.log('  account (账号):', submitData.account);
        console.log('  userName (昵称/姓名):', submitData.userName);
        console.log('  major (成员专业):', submitData.major);
        console.log('  userTypeId (成员类型ID):', submitData.userTypeId);
        console.log('  nationality (国籍):', submitData.nationality);
        console.log('  contactEmail (联系邮箱):', submitData.contactEmail);
        console.log('  platformAccounts (平台账号信息列表):', submitData.platformAccounts);
        console.log('  sex (性别):', submitData.sex);
        console.log('  birthDate (出生日期):', submitData.birthDate);
        console.log('========================');
        
        registerDeptMember(submitData).then((response) => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}







/** 查看成员实名认证操作 */
function handleViewCredentials(row) {
  // 检查userId是否为null
  const _userId = row.userId
  if (!_userId) {
    proxy.$modal.msgError("获取成员实名认证信息失败")
    return
  }
  
  // 调用接口时传递userId 参数
  getUserIdentityVerification(_userId).then(response => {
    // 检查返回数据是否为空或null
    if (!response.data) {
      // 设置空数据对象，显示暂无认证信息的弹窗
      currentCredentials.value = {
        verified: false,
        idType: '',
        realName: '',
        idNumber: '',
        idCardFront: '',
        idCardBack: '',
        status: '',
        message: '暂无认证信息',
        userName: row.userName || '暂无'
      }
    } else {
      currentCredentials.value = {
        ...response.data,
        userName: row.userName || '暂无'
      }
    }
    
    credentialsDialogVisible.value = true
  }).catch(() => {
    proxy.$modal.msgError("获取成员实名认证信息失败")
  })
}

/** 获取审核状态类型 */
function getStatusType(status) {
  switch (status) {
    case 'APPROVED':
    case 'approved':
      return 'success'
    case 'REJECTED':
    case 'rejected':
      return 'danger'
    case 'PENDING':
    case 'pending':
      return 'warning'
    default:
      return 'info'
  }
}

/** 获取审核状态文本 */
function getStatusText(status) {
  switch (status) {
    case 'APPROVED':
    case 'approved':
      return '审核通过'
    case 'REJECTED':
    case 'rejected':
      return '审核拒绝'
    case 'PENDING':
    case 'pending':
      return '待审核'
    default:
      return status || '未知状态'
  }
}

/** 打开批量注册成员弹窗 */
function openBatchAddDialog() {
  batchAddDialogVisible.value = true;
  // 重置上传状态
  uploadFileList.value = [];
  uploadedFile.value = null;
  excelData.value = [];
  validData.value = [];
  invalidData.value = [];
}

/** 文件上传前校验 */
function beforeUpload(file) {
  // 检查是否已有文件，如果有则阻止上传
  if (uploadFileList.value.length > 0) {
    ElMessage.warning("已有文件，请先清除现有文件后再上传新文件");
    return false;
  }

  // 校验文件格式
  const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
  if (!isExcel) {
    ElMessage.error("请上传.xlsx或.xls格式的Excel文件");
    return false;
  }

  // 校验文件大小（不超过5MB）
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    ElMessage.error("文件大小不能超过5MB");
    return false;
  }

  return true;
}

/** 处理文件上传 */
function handleFileUpload(options) {
  const file = options.file;
  uploadedFile.value = file;
  
  // 读取Excel文件
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // 处理Excel数据
      processExcelData(jsonData);
    } catch (error) {
      // console.error('文件解析失败:', error);
      proxy.$modal.msgError('文件解析失败，请检查文件格式');
    }
  };
  reader.readAsArrayBuffer(file);
}

/** 处理Excel数据 */
function processExcelData(jsonData) {
  if (jsonData.length < 2) {
    proxy.$modal.msgError('Excel文件内容为空或格式不正确');
    return;
  }
  
  // 获取表头
  const headers = jsonData[0];
  const expectedHeaders = ['学号', '姓名', '性别', '出生年月', '成员类型', '专业', '国籍', '联系邮箱', 'GitHub平台账号', 'Gitee平台账号'];
  
  // 检查表头是否正确
  const hasRequiredHeaders = expectedHeaders.every(header => 
    headers.includes(header)
  );
  
  if (!hasRequiredHeaders) {
    proxy.$modal.msgError(`Excel表头不正确，应包含：${expectedHeaders.join('、')}`);
    return;
  }
  
  // 处理数据行
  const dataRows = jsonData.slice(1);
  const processedData = [];
  const valid = [];
  const invalid = [];
  
  dataRows.forEach((row, index) => {
    if (row.length === 0 || row.every(cell => !cell)) {
      return; // 跳过空行
    }
    
    const rowData = {
      rowIndex: index + 2, // Excel行号（从2开始）
      学号: row[headers.indexOf('学号')] || '',
      姓名: row[headers.indexOf('姓名')] || '',
      性别: row[headers.indexOf('性别')] || '',
      出生年月: row[headers.indexOf('出生年月')] || '',
      成员类型: row[headers.indexOf('成员类型')] || '',
      专业: row[headers.indexOf('专业')] || '',
      国籍: row[headers.indexOf('国籍')] || '',
      联系邮箱: row[headers.indexOf('联系邮箱')] || '',
      'GitHub平台账号': row[headers.indexOf('GitHub平台账号')] || '',
      'Gitee平台账号': row[headers.indexOf('Gitee平台账号')] || ''
    };
    
    // 数据校验
    const errors = [];
    if (!rowData.学号) errors.push('学号不能为空');
    if (!rowData.姓名) errors.push('姓名不能为空');
    if (!rowData.性别) errors.push('性别不能为空');
    if (rowData.性别 && !['男', '女'].includes(rowData.性别)) {
      errors.push('性别只能是男或女');
    }
    if (!rowData.成员类型) errors.push('成员类型不能为空');
    if (rowData.联系邮箱 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rowData.联系邮箱)) {
      errors.push('联系邮箱格式不正确');
    }
    
    if (errors.length === 0) {
      valid.push(rowData);
    } else {
      invalid.push({ ...rowData, errors });
    }
    
    processedData.push(rowData);
  });
  
  excelData.value = processedData;
  validData.value = valid;
  invalidData.value = invalid;
  
  // console.log('处理结果:', {
  //   total: processedData.length,
  //   valid: valid.length,
  //   invalid: invalid.length
  // });
}

/** 确认导入 */
const confirmImport = async () => {
  // console.log("🚀 开始确认导入流程...");

  // // 验证是否有有效数据
  // if (validData.value.length === 0) {
  //   // console.log("⚠️ 没有有效数据，终止导入");
  //   ElMessage.warning("没有可导入的有效数据");
  //   return;
  // }
  // console.log("✅ 有效数据验证通过，数量:", validData.value.length);

  // 验证是否有上传的文件
  if (!uploadedFile.value) {
    // console.log("❌ 未找到上传的文件对象");
    ElMessage.error("未找到上传的文件，请重新上传");
    return;
  }

  // 详细验证文件对象完整性
  // console.log("📋 准备传输的文件对象详情:", {
  //   name: uploadedFile.value.name,
  //   size: uploadedFile.value.size,
  //   type: uploadedFile.value.type,
  //   lastModified: uploadedFile.value.lastModified,
  //   constructor: uploadedFile.value.constructor.name
  // });

  // 验证文件是否为空
  if (uploadedFile.value.size === 0) {
    // console.log("❌ 文件大小为0，可能是空文件");
    ElMessage.error("文件为空，请重新上传");
    return;
  }
  // console.log("✅ 文件对象验证通过");

  // 显示加载状态
  const loading = ElLoading.service({ text: "正在导入数据..." });
  let response = null;

  try {
    // console.log("📤 调用后端API接口 batchUploadOrgMembersFileOptimized...");
    // console.log("📤 传递的文件参数:", uploadedFile.value);

    isImporting.value = true;
    importProgress.value = 0;

    // 调用批量导入接口，直接传递原始文件对象
    // batchUploadOrgMembersFileOptimized函数内部会创建FormData
    response = await batchUploadDeptMembersFileOptimized(uploadedFile.value);

    // console.log("📥 后端API响应:", response);
    // console.log("📥 响应数据结构:", JSON.stringify(response, null, 2));

    // 处理接口响应
    if (response.code === 200) {
      // 检查是否为异步处理
      if (response.data && response.data.taskId) {
        // console.log("🔄 异步处理，开始轮询进度，taskId:", response.data.taskId);
        pollProgress(response.data.taskId, loading);
      } else {
        // 同步处理完成
        // console.log("✅ 同步导入成功，响应数据:", response.data);
        loading.close();
        isImporting.value = false;
        ElMessage.success(
          `导入成功，共导入${response.data?.successCount || 0}条数据`
        );
        batchAddDialogVisible.value = false;
        getList(); // 刷新成员列表
      }
    } else {
      // console.log("❌ 导入失败，错误信息:", response.message);
      // console.log("❌ 失败响应数据详情:", response);
      loading.close();
      isImporting.value = false;
      ElMessage.error(`导入失败: ${response.message || response.msg || "未知错误"}`);
    }
  } catch (error) {
    // console.error("❌ 导入过程出错:", error);
    // console.error("❌ 错误详情:", {
    //   message: error.message,
    //   stack: error.stack,
    //   response: error.response,
    // });
    loading.close();
    isImporting.value = false;
    ElMessage.error("导入过程出错，请稍后重试");
  }
};

/** 轮询进度 */
const pollProgress = async (taskId, loading) => {
  let progressInterval;
  
  try {
    progressInterval = setInterval(async () => {
      try {
        // 调用进度查询接口
        const progressResponse = await getProgress(taskId);
        
        // 打印完整的查询进度接口返回信息
        // console.log('📊 批量注册成员查询进度接口返回信息:', {
        //   taskId: taskId,
        //   timestamp: new Date().toISOString(),
        //   response: progressResponse
        // });
        
        if (progressResponse.code === 200) {
          const progressData = progressResponse.data;
          
          // 动态更新ElLoading的文本内容
          const message = progressData.message || '正在导入成员数据';
          const loadingText = `${message}...`;
          
          // 更新loading文本
          if (loading && loading.setText) {
            loading.setText(loadingText);
          } else if (loading) {
            // 尝试直接设置text属性
            loading.text = loadingText;
          }
          
          // 检查任务状态
          if (progressData.status === 'COMPLETED') {
            // 任务完成
            clearInterval(progressInterval);
            
            // 显示完成状态
            if (loading && loading.setText) {
              loading.setText('导入完成...');
            } else if (loading) {
              // 尝试直接设置text属性
              loading.text = '导入完成...';
            }
            
            // 延迟一下让用户看到完成状态
            setTimeout(async () => {
              loading.close();
              isImporting.value = false;
              await handleImportComplete(taskId, progressData);
            }, 1000);
            
          } else if (progressData.status === 'FAILED') {
            // 任务失败
            clearInterval(progressInterval);
            loading.close();
            isImporting.value = false;
            
            ElMessage.error(`导入失败: ${progressData.errorMessage || progressData.message}`);
          }
          // 如果状态是RUNNING，继续轮询
        }
      } catch (error) {
        // console.error('查询进度出错:', error);
      }
    }, 2000); // 每2秒查询一次进度
    
    // 设置超时时间（30分钟）
    setTimeout(() => {
      if (progressInterval) {
        clearInterval(progressInterval);
        loading.close();
        isImporting.value = false;
        ElMessage.error("导入超时，请检查任务状态");
      }
    }, 30 * 60 * 1000);
    
  } catch (error) {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    loading.close();
    isImporting.value = false;
    ElMessage.error("进度查询异常，请稍后重试");
  }
};

/** 从URL中提取文件名 */
const extractFileNameFromUrl = (url) => {
  try {
    if (!url) return null;
    
    // 移除查询参数
    const urlWithoutQuery = url.split('?')[0];
    
    // 提取文件名
    const fileName = urlWithoutQuery.split('/').pop();
    
    // 验证文件名是否有效
    if (fileName && fileName.includes('.')) {
      return fileName;
    }
    
    return null;
  } catch (error) {
    // console.error('提取文件名失败:', error);
    return null;
  }
};

/** 下载失败记录文件 */
const downloadFailedRecords = async (fileName, fullUrl = null) => {
  try {
    // 如果提供了完整URL，直接使用；否则构建下载URL
    const downloadUrl = fullUrl || `/register/download/failed-records/${fileName}`;
    
    // 使用系统下载工具，会自动携带认证头
    download.zip(downloadUrl, fileName);
    
    // console.log("📥 开始下载失败记录文件:", fileName);
    proxy.$modal.msgSuccess("开始下载失败记录文件");
    
  } catch (error) {
    // console.error('下载失败记录文件失败:', error);
    proxy.$modal.msgError('下载失败，请重试');
  }
};

/** 处理导入完成 */
const handleImportComplete = async (taskId, progressData) => {
  // 添加详细的调试日志和参数验证
  // console.log("🔍 handleImportComplete 函数开始执行");
  // console.log("📋 传入参数 taskId:", taskId);
  // console.log("📋 传入参数 progressData:", progressData);
  
  // 参数验证
  if (!progressData) {
    // console.error("❌ progressData 参数为空或未定义");
    ElMessage.error("导入结果数据异常，请重试");
    return;
  }
  
  if (typeof progressData !== 'object') {
    // console.error("❌ progressData 参数类型错误:", typeof progressData);
    ElMessage.error("导入结果数据格式异常，请重试");
    return;
  }
  
  try {
    // 步骤1: 处理消息显示逻辑
    // console.log("🔄 步骤1: 开始处理消息显示逻辑");
    try {
      // 安全地获取数值，确保为数字类型
      const successCount = Number(progressData.success) || 0;
      const failedCount = Number(progressData.failed) || 0;
      const totalCount = Number(progressData.total) || 0;
      
      // console.log("📊 统计数据 - 成功:", successCount, "失败:", failedCount, "总计:", totalCount);
      
      let message;
      let messageType;
      
      if (successCount > 0 && failedCount > 0) {
        // 部分成功
        message = `导入完成！成功: ${successCount}条，失败: ${failedCount}条`;
        messageType = 'warning';
      } else if (successCount > 0 && failedCount === 0) {
        // 全部成功
        message = `导入完成！成功导入 ${successCount} 条记录`;
        messageType = 'success';
      } else if (successCount === 0 && failedCount > 0) {
        // 全部失败
        message = `导入完成！所有 ${failedCount} 条记录均导入失败，请检查数据格式`;
        messageType = 'warning';
      } else {
        // 异常情况
        message = `导入完成！处理了 ${totalCount} 条记录`;
        messageType = 'info';
      }
      
      // console.log("💬 准备显示消息:", message, "类型:", messageType);
      
      // 显示消息
      if (messageType === 'success') {
        ElMessage.success(message);
      } else if (messageType === 'warning') {
        ElMessage.warning(message);
      } else {
        ElMessage.info(message);
      }
      
      // console.log("✅ 步骤1: 消息显示完成");
    } catch (messageError) {
      // console.error("❌ 步骤1: 消息显示出错:", messageError);
      // console.error("❌ 错误详情:", {
      //   message: messageError.message,
      //   stack: messageError.stack,
      //   progressData: progressData
      // });
      // 显示默认消息
      ElMessage.info("导入任务已完成");
    }
    
    // 步骤2: 处理失败记录下载逻辑
    // console.log("🔄 步骤2: 开始处理失败记录下载逻辑");
    try {
      const failedCount = Number(progressData.failed) || 0;
      const failedRecordsUrl = progressData.failedRecordsExcelUrl;
      
      //console.log("📊 失败记录检查 - 失败数量:", failedCount, "下载URL:", failedRecordsUrl);
      
      if (failedCount > 0 && failedRecordsUrl) {
        //console.log("🔍 检测到失败记录，显示下载选项");
        
        ElMessageBox.confirm(
          `检测到 ${failedCount} 条记录导入失败，是否下载失败记录文件？`,
          '导入结果',
          {
            confirmButtonText: '下载失败记录',
            cancelButtonText: '稍后下载',
            type: 'warning'
          }
        ).then(() => {
          //console.log("👤 用户选择下载失败记录");
          try {
            // 从后端返回的URL中提取实际文件名
            const actualFileName = extractFileNameFromUrl(failedRecordsUrl);
            //console.log("📄 提取的文件名:", actualFileName);
            
            if (actualFileName) {
              //console.log("✅ 使用提取的文件名下载");
              downloadFailedRecords(actualFileName, failedRecordsUrl);
            } else {
              // 降级处理：使用原来的方式
              const fallbackFileName = `failed_records_${taskId}.xlsx`;
              //console.log("⚠️ 降级处理，使用文件名:", fallbackFileName);
              downloadFailedRecords(fallbackFileName);
            }
          } catch (downloadError) {
            //console.error("❌ 下载失败记录出错:", downloadError);
            ElMessage.error("下载失败记录文件出错，请稍后重试");
          }
        }).catch(() => {
          //console.log("👤 用户取消下载失败记录");
        });
      } else {
        //console.log("✅ 无失败记录或无下载URL，跳过下载选项");
      }
      
      //console.log("✅ 步骤2: 失败记录下载逻辑处理完成");
    } catch (downloadError) {
      //console.error("❌ 步骤2: 失败记录下载逻辑出错:", downloadError);
      //console.error("❌ 错误详情:", {
      //   message: downloadError.message,
      //   stack: downloadError.stack,
      //   progressData: progressData
      // });
      // 不影响主流程，继续执行
    }
    
    // 步骤3: 关闭对话框并刷新列表
    //console.log("🔄 步骤3: 开始关闭对话框并刷新列表");
    try {
      //console.log("🔒 关闭批量添加对话框");
      batchAddDialogVisible.value = false;
      
      //console.log("🔄 刷新成员列表");
      await getList();
      
      //console.log("✅ 步骤3: 对话框关闭和列表刷新完成");
    } catch (cleanupError) {
      //console.error("❌ 步骤3: 对话框关闭和列表刷新出错:", cleanupError);
      //console.error("❌ 错误详情:", {
      //   message: cleanupError.message,
      //   stack: cleanupError.stack
      // });
      // 尝试单独执行每个操作
      try {
        batchAddDialogVisible.value = false;
      } catch (dialogError) {
        //console.error("❌ 关闭对话框失败:", dialogError);
      }
      
      try {
        getList();
      } catch (listError) {
        //console.error("❌ 刷新列表失败:", listError);
      }
    }
    
    //console.log("✅ handleImportComplete 函数执行完成");
    
  } catch (error) {
    // console.error("❌ handleImportComplete 函数执行出错:", error);
    // console.error("❌ 完整错误信息:", {
    //   message: error.message,
    //   stack: error.stack,
    //   name: error.name,
    //   taskId: taskId,
    //   progressData: progressData
    // });
    
    // 显示用户友好的错误消息
    ElMessage.error(`处理导入完成时出错: ${error.message || '未知错误'}`);
  }
};

/** 生成模板文件 */
function generateTemplate() {
  // 创建工作簿
  const wb = XLSX.utils.book_new();
  
  // 创建表头数据
  const headers = ['学号', '姓名', '性别', '出生年月', '成员类型', '专业', '国籍', '联系邮箱', 'Github平台账号', 'Gitee平台账号'];
  const wsData = [headers];
  
  // 创建工作表
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // 设置列宽
  ws['!cols'] = [
    { wch: 15 }, // 学号
    { wch: 15 }, // 姓名
    { wch: 10 }, // 性别
    { wch: 15 }, // 出生年月
    { wch: 15 }, // 成员类型
    { wch: 20 }, // 专业
    { wch: 10 }, // 国籍
    { wch: 25 }, // 联系邮箱
    { wch: 20 }, // Github平台账号
    { wch: 20 }  // Gitee平台账号
  ];
  
  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(wb, ws, '成员信息');
  
  // 导出文件
  XLSX.writeFile(wb, '成员批量注册模板.xlsx');
}

// 获取平台列表
function loadPlatformList() {
  getPlatformList().then((response) => {
    platformList.value = response.data || [];
  }).catch((error) => {
    console.error('获取平台列表失败:', error);
    platformList.value = [];
  });
}

// 添加平台账号
function addPlatformAccount() {
  if (!form.value.platformAccounts) {
    form.value.platformAccounts = [];
  }
  form.value.platformAccounts.push({
    platformId: '',
    platformUsername: ''
  });
}

// 删除平台账号
function removePlatformAccount(index) {
  form.value.platformAccounts.splice(index, 1);
}

// 组件挂载时初始化数据
onMounted(() => {
  // 获取国籍数据
  getNationalityList();
  // 获取平台列表
  loadPlatformList();
  // 获取列表数据
  getList();
});



// 组件卸载时清理定时器
onBeforeUnmount(() => {
  if (progressInterval.value) {
    clearInterval(progressInterval.value);
  }
});
</script>

<style scoped>
.batch-add-dialog .file-upload {
  margin-bottom: 20px;
}

.batch-add-dialog .upload-component {
  width: 100%;
}

.batch-add-dialog .upload-icon {
  font-size: 67px;
  color: #c0c4cc;
  margin-bottom: 16px;
  line-height: 50px;
}

.batch-add-dialog .upload-text {
  color: #606266;
  font-size: 14px;
  text-align: center;
}

.batch-add-dialog .upload-text span {
  color: #409eff;
}

.batch-add-dialog .upload-tip {
  color: #909399;
  font-size: 12px;
  text-align: center;
  margin-top: 7px;
}

.batch-add-dialog .download-container {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.batch-add-dialog .download-btn,
.batch-add-dialog .download-link {
  display: inline-flex;
  align-items: center;
  color: #409eff;
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
}

.batch-add-dialog .download-btn:hover,
.batch-add-dialog .download-link:hover {
  color: #66b1ff;
}

.batch-add-dialog .download-icon {
  margin-right: 5px;
  font-size: 16px;
}
</style>
