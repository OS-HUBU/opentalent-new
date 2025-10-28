<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="组织名称" prop="orgName">
        <el-input
          v-model="queryParams.orgName"
          placeholder="请输入组织名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="组织类型" prop="orgType">
        <el-select v-model="queryParams.orgType" placeholder="请选择组织类型" clearable>
          <el-option
            v-for="dict in dm_organization"
            :key="dict.value"
            :label="dict.label"
            :value="dict.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="项目范围" prop="projectScope">
        <el-select v-model="queryParams.projectScope" placeholder="请选择项目范围" clearable>
          <el-option
            v-for="dict in dm_projectscope"
            :key="dict.value"
            :label="dict.label"
            :value="dict.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="评价模型" prop="evaluateModel">
        <el-select v-model="queryParams.evaluateModel" placeholder="请选择评价模型" clearable>
          <el-option
            v-for="dict in dm_evaluatermodel"
            :key="dict.value"
            :label="dict.label"
            :value="dict.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="分析报告" prop="reportType">
        <el-select v-model="queryParams.reportType" placeholder="请选择分析报告" clearable>
          <el-option
            v-for="dict in dm_orgreport"
            :key="dict.value"
            :label="dict.label"
            :value="dict.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="位置" prop="address">
        <el-input
          v-model="queryParams.address"
          placeholder="请输入位置"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
         <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
        <el-option
            v-for="dict in dm_orgstatus"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker clearable
          v-model="queryParams.createTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择创建时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
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
          v-hasPermi="['organization:organization:add']"
        >新增</el-button>
      </el-col>
     
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['organization:organization:remove']"
        >删除</el-button>
      </el-col>
      
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="organizationList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" width="80">
        <template #default="scope">
          {{ scope.$index + 1 + (queryParams.pageNum - 1) * queryParams.pageSize }}
        </template>
      </el-table-column>
      <el-table-column label="组织名称" align="center" prop="orgName" />
      <el-table-column label="组织类型" align="center" prop="orgType">
      </el-table-column>
      <el-table-column label="项目范围" align="center" prop="projectScope">
      </el-table-column>
      <el-table-column label="组织简介" align="center" prop="orgIntroduction" />
      <el-table-column label="平台权重" align="center" prop="platformWeight">
      </el-table-column>
      <el-table-column label="评价模型" align="center" prop="evaluateModel">
      </el-table-column>
      <el-table-column label="分析报告" align="center" prop="reportType">
      </el-table-column>
      <el-table-column label="联系邮箱" align="center" prop="contactEmail" />
      <el-table-column label="位置" align="center" prop="address" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          {{ dm_orgstatus.find(dict => dict.value === String(scope.row.status))?.label || scope.row.status }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="组织凭证" align="center" width="100">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleViewCredentials(scope.row)" v-hasPermi="['verify:user:identityVerification']">查看</el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['organization:organization:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['organization:organization:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改组织信息对话框 -->
    <el-dialog :title="title" v-model="open" width="900px" append-to-body>
      <el-form ref="organizationRef" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <!-- 左列 -->
          <el-col :span="12">
            <el-form-item label="组织名称" prop="orgName">
              <el-input v-model="form.orgName" placeholder="请输入组织名称" />
            </el-form-item>
            <el-form-item label="组织简介" prop="orgIntroduction">
              <el-input v-model="form.orgIntroduction" type="textarea" placeholder="请输入组织简介" :rows="3" />
            </el-form-item>
            <el-form-item label="联系邮箱" prop="contactEmail">
              <el-input v-model="form.contactEmail" type="email" placeholder="请输入联系邮箱" />
            </el-form-item>
            
            <!-- 新增模式下显示密码字段 -->
            <template v-if="!form.orgId">
              <el-form-item label="登录密码" prop="password">
                <el-input v-model="form.password" type="password" placeholder="请输入登录密码" show-password />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" show-password />
              </el-form-item>
            </template>
            
            <el-form-item label="组织类型" prop="orgType">
              <el-select v-model="form.orgType" placeholder="请选择组织类型" @change="handleOrgTypeChange" style="width: 100%">
                <el-option
                  v-for="dict in dm_organization"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.label"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="项目范围" prop="projectScope">
              <el-select v-model="form.projectScope" placeholder="请选择项目范围" style="width: 100%">
                <el-option
                  v-for="dict in dm_projectscope"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.label"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="平台权重" prop="platformWeight">
              <el-select v-model="form.platformWeight" placeholder="请选择平台权重" style="width: 100%">
                <el-option
                  v-for="dict in dm_platformweight"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.label"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          
          <!-- 右列 -->
          <el-col :span="12">
            <el-form-item label="评价模型" prop="evaluateModel">
              <el-select v-model="form.evaluateModel" placeholder="请选择评价模型" style="width: 100%">
                <el-option
                  v-for="dict in dm_evaluatermodel"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.label"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="分析报告" prop="reportType">
              <el-select v-model="form.reportType" placeholder="请选择分析报告" style="width: 100%">
                <el-option
                  v-for="dict in dm_orgreport"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.label"
                ></el-option>
              </el-select>
            </el-form-item>
            
            <!-- 新增模式下显示组织凭证信息 -->
            <template v-if="!form.orgId">
              <el-form-item :label="formConfig.registrantLabel || '组织注册人姓名'" prop="realName">
                <el-input
                  v-model="form.realName"
                  :placeholder="formConfig.realNamePlaceholder || '请输入组织注册人姓名：'"
                />
              </el-form-item>
              
              <el-form-item label="组织凭证类型" prop="idType">
                <el-select v-model="form.idType" placeholder="请选择组织凭证类型" :loading="idTypesLoading" style="width: 100%">
                  <el-option
                    v-for="idType in idTypesList"
                    :key="idType.idTypeCode"
                    :label="idType.idTypeName"
                    :value="idType.idTypeCode"
                  ></el-option>
                </el-select>
              </el-form-item>
              
              <el-form-item label="组织凭证编号" prop="idNumber">
                <el-input
                  v-model="form.idNumber"
                  :placeholder="formConfig.idNumberPlaceholder || '请输入组织凭证编号'"
                />
              </el-form-item>
              
              <el-form-item label="组织凭证照片" prop="idCardFront">
                <el-upload
                  class="upload-demo"
                  :file-list="fileList"
                  :on-change="handleFileChange"
                  :auto-upload="false"
                  :limit="1"
                  :on-remove="handleFileRemove"
                  :before-upload="beforeFileUpload"
                  accept=".jpg,.png,.jpeg,.pdf"
                >
                  <el-button type="primary">上传凭证</el-button>
                </el-upload>
              </el-form-item>
            </template>
            
            <el-form-item label="地址" prop="address">
              <el-tree-select
                v-model="form.region"
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
          </el-col>
        </el-row>
       
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 组织凭证查看对话框 -->
    <el-dialog title="组织凭证信息" v-model="credentialsDialogVisible" width="700px" append-to-body>
      <div v-if="currentCredentials">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="组织名称">
            {{ currentCredentials.orgName || '暂无' }}
          </el-descriptions-item>
          <el-descriptions-item label="实名认证状态">
            <el-tag :type="currentCredentials.verified ? 'success' : 'danger'">
              {{ currentCredentials.verified ? '已认证' : '未认证' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag 
              :type="currentCredentials.status === '已通过' ? 'success' : 
                     currentCredentials.status === '已驳回' ? 'danger' : 'warning'">
              {{ currentCredentials.status || '未提交' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="证件类型">
            {{ currentCredentials.idType || '暂无' }}
          </el-descriptions-item>
          <el-descriptions-item label="组织注册人姓名">
            {{ currentCredentials.realName || '暂无' }}
          </el-descriptions-item>
          <el-descriptions-item label="组织凭证编号">
            {{ currentCredentials.idNumber || '暂无' }}
          </el-descriptions-item>
          <el-descriptions-item label="组织凭证照片">
            <div v-if="currentCredentials.idCardFront">
              <el-image
                :src="'data:image/jpeg;base64,' + currentCredentials.idCardFront"
                :preview-src-list="['data:image/jpeg;base64,' + currentCredentials.idCardFront]"
                fit="contain"
                style="width: 200px; height: 150px; border: 1px solid #ddd; border-radius: 4px;"
                preview-teleported
              />
            </div>
            <span v-else style="color: #999;">暂无凭证照片</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <div v-else style="text-align: center; padding: 20px; color: #999;">
        暂无凭证信息
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="credentialsDialogVisible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Organization">
import { listOrganization, getOrganization, delOrganization, updateOrganization, getIdTypesByOrgType, getFormConfigByOrgType } from "@/api/organization/organization"
import { registerOrganization } from "@/api/register"
import { getRegionTree } from "@/api/register"
import { getUserIdentityVerification } from "@/api/verify/verify"
import { nextTick, ref, reactive, toRefs, getCurrentInstance, onMounted, onActivated } from "vue"

const { proxy } = getCurrentInstance()
const { dm_evaluatermodel, dm_organization, dm_projectscope, dm_platformweight, dm_orgreport, dm_orgstatus } = proxy.useDict('dm_evaluatermodel', 'dm_organization', 'dm_projectscope', 'dm_platformweight', 'dm_orgreport', 'dm_orgstatus');

// 地区数据
const regionTreeData = ref([])
// 文件上传相关
const fileList = ref([])
// 动态表单相关
const idTypesList = ref([])
const idTypesLoading = ref(false)
const formConfig = ref({
  registrantLabel: '组织注册人姓名',
  idNumberPlaceholder: '请输入组织凭证编号'
})

const organizationList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const selectedItems = ref([]) // 存储包含 orgId 和 userId 的对象数组
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

// 组织凭证查看相关
const credentialsDialogVisible = ref(false)
const currentCredentials = ref(null)

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orgName: null,
    orgType: null,
    projectScope: null,
    evaluateModel: null,
    reportType: null,
    address: null,
    status: null,
    createTime: null,
  },
  rules: {
    orgName: [
      { required: true, message: "组织名称不能为空", trigger: "blur" }
    ],
    contactEmail: [
      { type: "email", message: "请输入有效的邮箱地址", trigger: "blur" }
    ],
    address: [
      { 
        required: true, 
        trigger: "change", 
        validator: (rule, value, callback) => {
          if (!form.value.region || (typeof form.value.region === 'string' && form.value.region.trim() === '') || (Array.isArray(form.value.region) && form.value.region.length === 0)) {
            callback(new Error('请选择地区'));
          } else {
            callback();
          }
        }
      }
    ],
    orgType: [
      { required: true, message: "组织类型不能为空", trigger: "change" }
    ],
    password: [
      { 
        validator: (rule, value, callback) => {
          if (!form.value.orgId && (!value || value.trim() === '')) {
            callback(new Error('请输入登录密码'));
          } else if (!form.value.orgId && (value.length < 5 || value.length > 20)) {
            callback(new Error('密码长度必须介于 5 和 20 之间'));
          } else {
            callback();
          }
        }, 
        trigger: "blur" 
      }
    ],
    confirmPassword: [
      { 
        validator: (rule, value, callback) => {
          if (!form.value.orgId && form.value.password !== value) {
            callback(new Error('两次输入的密码不一致'));
          } else {
            callback();
          }
        }, 
        trigger: "blur" 
      }
    ],
    realName: [
      { 
        validator: (rule, value, callback) => {
          if (!form.value.orgId && (!value || value.trim() === '')) {
            callback(new Error('请输入注册人姓名'));
          } else {
            callback();
          }
        }, 
        trigger: "blur" 
      }
    ],
    idType: [
      { 
        validator: (rule, value, callback) => {
          if (!form.value.orgId && (!value || value.trim() === '')) {
            callback(new Error('请选择组织凭证类型'));
          } else {
            callback();
          }
        }, 
        trigger: "change" 
      }
    ],
    idNumber: [
      { 
        validator: (rule, value, callback) => {
          if (!form.value.orgId && (!value || value.trim() === '')) {
            callback(new Error('请输入组织凭证编号'));
          } else {
            callback();
          }
        }, 
        trigger: "blur" 
      }
    ],
    idCardFront: [
      { 
        validator: (rule, value, callback) => {
          if (!form.value.orgId && (!value || value.trim() === '')) {
            callback(new Error('请上传组织凭证照片'));
          } else {
            callback();
          }
        }, 
        trigger: "change" 
      }
    ],
    projectScope: [
      { required: true, message: "项目类型不能为空", trigger: "change" }
    ],
    platformWeight: [
      { required: true, message: "平台权重不能为空", trigger: "change" }
    ],
    evaluateModel: [
      { required: true, message: "评价模型不能为空", trigger: "change" }
    ],
    reportType: [
      { required: true, message: "分析报告不能为空", trigger: "change" }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询组织信息列表 */
function getList() {
  loading.value = true
  listOrganization(queryParams.value).then(response => {
    //console.log('响应数据:', response)
    organizationList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  form.value = {
    userId:null,
    orgId: null,
    orgName: null,
    orgType: null,
    parentId: null,
    level: null,
    projectScope: null,
    orgIntroduction: null,
    platformWeight: null,
    evaluateModel: null,
    reportType: null,
    contactEmail: null,
    address: null,
    region: null,
    password: null,
    confirmPassword: null,
    realName: null,
    idNumber: null,
    idType: null,
    idCardFront: null,
    status: null,
    createTime: null,
    updateTime: null
  }
  // 重置文件上传
  fileList.value = []
  // 重置动态表单数据
  idTypesList.value = []
  formConfig.value = {
    registrantLabel: '组织注册人姓名',
    idNumberPlaceholder: '请输入组织凭证编号'
  }
  proxy.resetForm("organizationRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  const params = { ...queryParams.value, status: queryParams.value.status ? parseInt(queryParams.value.status, 10) : null };
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.orgId)
  // 同时收集包含 orgId、userId 和 orgName 的对象数组
  selectedItems.value = selection.map(item => ({
    orgId: item.orgId,
    userId: item.userId,
    orgName: item.orgName
  }))
  
  // 控制台输出测试
  //console.log('选中的组织ID数组:', ids.value)
  //console.log('选中的完整数据:', selectedItems.value)
  //console.log('选中项数量:', selection.length)
  
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加组织"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _orgId = row.orgId || ids.value
  getOrganization(_orgId).then(response => {
    form.value = response.data
    // 确保 orgId 被正确设置，避免修改时 orgId 为 null
    form.value.orgId = _orgId
    
    // 设置地区回显逻辑
    const setRegionValue = () => {
      if (form.value.address && regionTreeData.value.length > 0) {
        const regionId = findRegionIdByAddress(regionTreeData.value, form.value.address);
        if (regionId) {
          form.value.region = regionId;
          // 更新地区选择框的显示
          nextTick(() => {
            handleRegionChange(regionId);
          });
        } else {
          // 如果在地区树中找不到对应项，直接将address值填充到下拉框中
          form.value.region = form.value.address;
        }
      }
    };
    
    // 如果地区数据已加载，直接设置
     if (regionTreeData.value.length > 0) {
       setRegionValue();
     } else {
       // 如果地区数据未加载，等待加载完成后再设置
       let attempts = 0;
       const maxAttempts = 50; // 最多等待5秒 (50 * 100ms)
       
       const checkRegionData = () => {
         attempts++;
         if (regionTreeData.value.length > 0) {
           setRegionValue();
         } else if (attempts < maxAttempts) {
           // 继续等待
           setTimeout(checkRegionData, 100);
         } else {
           console.warn('地区数据加载超时，无法设置地区回显');
         }
       };
       
       // 确保地区数据正在加载
       if (regionTreeData.value.length === 0) {
         getRegionData();
       }
       checkRegionData();
     }
    
    open.value = true
    title.value = "修改组织信息"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["organizationRef"].validate(valid => {
    if (valid) {
      if (form.value.orgId != null) {
        // 添加调试信息
        //console.log('提交的表单数据:', form.value)
        ///console.log('orgId 类型:', typeof form.value.orgId, 'orgId 值:', form.value.orgId)
        
        // 确保 orgId 是数字类型
        form.value.orgId = Number(form.value.orgId)
        
        updateOrganization(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        registerOrganization(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  // 构建 orgId 和 userId 一一对应的对象数组
  const deleteParams = row.orgId 
    ? [{ orgId: row.orgId, userId: row.userId }] 
    : selectedItems.value.map(item => ({ orgId: item.orgId, userId: item.userId }))
  
  // 定义组织名数组
  const orgNames = row.orgId ? [row.orgName] : selectedItems.value.map(item => item.orgName)
  const orgNamesStr = orgNames.join('、')
  
  proxy.$modal.confirm('是否确认删除组织：' + orgNamesStr + '？').then(function() {
    // 第一次确认后，弹出二次确认对话框
    return proxy.$modal.confirm('此操作不可恢复，确定要删除组织：' + orgNamesStr + ' 吗？')
  }).then(function() {
    // 两次确认都通过后，执行删除操作，传递 orgId 和 userId 一一对应的对象数组
    return delOrganization(deleteParams)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 查看组织凭证操作 */
function handleViewCredentials(row) {
  // 检查userId是否为null
  const _userId = row.userId
  if (!_userId) {
    proxy.$modal.msgError("获取组织凭证信息失败")
    return
  }
  
  // 调用接口时传递userId 参数
  getUserIdentityVerification(_userId).then(response => {
    // 检查返回数据是否为空或null
    if (!response.data) {
      // 设置空数据对象，显示暂无凭证信息的弹窗
      currentCredentials.value = {
        verified: false,
        idType: '',
        realName: '',
        idNumber: '',
        idCardFront: '',
        idCardBack: '',
        status: '',
        message: '暂无凭证信息',
        orgName: row.orgName || '暂无'
      }
    } else {
      currentCredentials.value = {
        ...response.data,
        orgName: row.orgName || '暂无'
      }
    }
    
    credentialsDialogVisible.value = true
  }).catch(() => {
    proxy.$modal.msgError("获取组织凭证信息失败")
  })
}

// 选择文件后触发
const handleFileChange = (file, fileListNew) => {
  fileList.value = fileListNew;
  
  // 将文件转换为base64字符串
  const reader = new FileReader();
  reader.onload = (e) => {
    // 提取纯净的base64字符串，去除data URL前缀
    const base64String = e.target.result.split(',')[1];
    
    // 验证base64格式和长度
    if (!base64String || base64String.length < 100) {
      ElMessage.error('文件数据不完整，请重新选择文件');
      handleFileRemove();
      return;
    }
    
    // 验证base64字符格式
    if (!/^[A-Za-z0-9+/=]+$/.test(base64String)) {
      ElMessage.error('文件格式转换失败，请重新选择文件');
      handleFileRemove();
      return;
    }
    
    form.value.idCardFront = base64String;
    ElMessage.success('文件上传成功');
  };
  
  reader.onerror = () => {
    ElMessage.error('文件读取失败，请重新选择文件');
    handleFileRemove();
  };
  
  reader.readAsDataURL(file.raw);
};
// 组织凭证，移除文件
const handleFileRemove = () => {
  fileList.value = [];
  form.value.idCardFront = null;
};
// 组织凭证，文件校验（可选）
const beforeFileUpload = (file) => {
  const isImage = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
  if (!isImage) {
    ElMessage.error('只能上传 JPG/PNG/PDF 文件');
    return false;
  }
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    ElMessage.error('文件大小不能超过 5MB');
    return false;
  }
  return true;
};

// 处理组织类型变化
const handleOrgTypeChange = (orgType) => {
  if (!orgType || form.value.orgId) {
    return; // 如果是编辑模式或没有选择组织类型，不执行动态加载
  }
  
  // 重置相关字段
  form.value.idType = null;
  form.value.idNumber = '';
  
  // 并行调用两个接口
  Promise.all([
    loadIdTypesByOrgType(orgType),
    loadFormConfigByOrgType(orgType)
  ]).catch(error => {
    console.error('获取动态表单配置失败:', error);
    proxy.$modal.msgError('获取表单配置失败，请重试');
  });
};

// 根据组织类型获取证件类型列表
const loadIdTypesByOrgType = async (orgType) => {
  try {
    idTypesLoading.value = true;
    const response = await getIdTypesByOrgType(orgType);
    console.log('获取证件类型接口响应:', response);
    
    if (response.code === 200 && response.data) {
      idTypesList.value = response.data;
      // 如果只有一个选项，自动选中
      if (response.data.length === 1) {
        form.value.idType = response.data[0].idTypeCode;
      }
    } else {
      idTypesList.value = [];
      proxy.$modal.msgWarning(response.msg || '该组织类型没有适用的证件类型');
    }
  } catch (error) {
    console.error('获取证件类型失败:', error);
    idTypesList.value = [];
    proxy.$modal.msgError('获取证件类型失败，请重试');
  } finally {
    idTypesLoading.value = false;
  }
};

// 根据组织类型获取表单配置
const loadFormConfigByOrgType = async (orgType) => {
  try {
    const response = await getFormConfigByOrgType(orgType);
    console.log('获取表单配置接口响应:', response);
    
    if (response.code === 200 && response.data) {
      formConfig.value = {
        registrantLabel: response.data.registrantLabel || '组织注册人姓名：',
        realNamePlaceholder: response.data.realNamePlaceholder || '请输入组织注册人姓名：',
        idNumberPlaceholder: response.data.idNumberPlaceholder || '请输入组织凭证编号：'
      };
    }
  } catch (error) {
    console.error('获取表单配置失败:', error);
    // 使用默认配置
    formConfig.value = {
      registrantLabel: '组织注册人姓名',
      idNumberPlaceholder: '请输入组织凭证编号'
    };
  }
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

// 递归查找并更新节点的显示标签
const updateNodeDisplayLabel = (nodes, targetId, newLabel) => {
  for (const node of nodes) {
    if (node.id === targetId) {
      node.name = newLabel;
      return true;
    }
    
    if (node.children && node.children.length > 0) {
      const found = updateNodeDisplayLabel(node.children, targetId, newLabel);
      if (found) return true;
    }
  }
  return false;
};

// 递归重置所有节点的显示标签为原始名称
const resetAllNodeLabels = (nodes) => {
  nodes.forEach(node => {
    node.name = node.displayLabel;
    if (node.children && node.children.length > 0) {
      resetAllNodeLabels(node.children);
    }
  });
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

/** 获取地区数据 */
function getRegionData() {
  getRegionTree().then(response => {
    regionTreeData.value = buildRegionTreeWithPath(response.data)
  })
}

/** 地区选择处理 */
function handleRegionChange(regionId) {
  if (!regionId) {
    // 清空选择时只清空地址
    form.value.address = '';
    return;
  }
  
  // 查找选中节点的完整路径
  const pathNodes = findNodePath(regionTreeData.value, regionId);
  
  if (pathNodes) {
    // 使用originalName构建完整地址字符串，确保使用原始名称
    const fullAddress = pathNodes.map(node => node.originalName).join('');
    
    // 设置组织地址
    form.value.address = fullAddress;
  }
}

// 组件挂载时初始化数据
onMounted(() => {
  getList()
  getRegionData()
})

// 组件激活时重新加载数据（解决 keep-alive 缓存导致的空白问题）
// onActivated(() => {
//   getList()
//   getRegionData()
// })
</script>
