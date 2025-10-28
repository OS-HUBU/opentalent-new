<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" type="card" @tab-change="handleTabChange">
      <!-- 待审核记录标签页 -->
      <el-tab-pane label="待审核记录" name="pending">
        <el-form :model="pendingQueryParams" ref="pendingQueryRef" :inline="true" v-show="showSearch" label-width="80px">
          <el-form-item label="组织名称" prop="orgName">
            <el-input
              v-model="pendingQueryParams.orgName"
              placeholder="请输入组织名称"
              clearable
              @keyup.enter="handlePendingQuery"
            />
          </el-form-item>
          <el-form-item label="提交时间" style="width: 308px;">
            <el-date-picker
              v-model="pendingDateRange"
              value-format="YYYY-MM-DD"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handlePendingQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetPendingQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="success"
              plain
              icon="Check"
              :disabled="pendingMultiple"
              @click="handleBatchAudit('已通过')"
              v-hasPermi="['organization:organization:audit']"
            >批量通过</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              plain
              icon="Close"
              :disabled="pendingMultiple"
              @click="handleBatchAudit('已拒绝')"
              v-hasPermi="['organization:organization:audit']"
            >批量驳回</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getPendingList"></right-toolbar>
        </el-row>

        <el-table v-loading="pendingLoading" :data="pendingList" @selection-change="handlePendingSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="序号" align="center" width="80">
            <template #default="{ $index }">
              {{ $index + 1 }}
            </template>
          </el-table-column>
          <el-table-column label="组织名称" align="center" prop="orgName" />
          <el-table-column label="组织类型" align="center" prop="orgType">
            <template #default="scope">
              <span>{{ scope.row.orgType || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="账号" align="center" prop="adminAccount" width="120" />
          <el-table-column label="组织注册人姓名" align="center" prop="realName">
            <template #default="scope">
              <span>{{ scope.row.realName || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="组织凭证编号" align="center" prop="idNumber" width="180">
            <template #default="scope">
              <span>{{ scope.row.idNumber || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="证件类型" align="center" prop="idType">
            <template #default="scope">
              <span v-if="scope.row.idType === 'organization_license'">组织机构代码证</span>
              <span v-else-if="scope.row.idType === 'id_card'">身份证</span>
              <span v-else-if="scope.row.idType === 'student_card'">学生证</span>
              <span v-else>{{ scope.row.idType || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="组织凭证照片" align="center" width="120">
            <template #default="scope">
              <div v-if="scope.row.idCardFront">
                <el-button
                  link
                  type="primary"
                  icon="View"
                  @click="handleViewImage(scope.row.idCardFront)"
                  title="查看照片"
                ></el-button>
                <el-button
                  link
                  type="success"
                  icon="Download"
                  @click="handleDownloadImage(scope.row.idCardFront, scope.row.orgName + '_凭证照片')"
                  title="下载照片"
                ></el-button>
              </div>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="联系邮箱" align="center" prop="contactEmail" width="180">
            <template #default="scope">
              <span>{{ scope.row.contactEmail || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="注册时间" align="center" prop="submitTime" width="160">
            <template #default="scope">
              <span>{{ scope.row.submitTime ? parseTime(scope.row.submitTime, '{y}-{m}-{d} {h}:{i}:{s}') : '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="认证状态" align="center" prop="verifyStatus">
            <template #default="scope">
              <el-tag type="warning">
                {{ scope.row.verifyStatus || '待审核' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="组织状态" align="center" prop="status">
            <template #default="scope">
              <el-tag
                :type="scope.row.status === 0 ? 'success' : 
                       scope.row.status === 1 ? 'info' : 
                       scope.row.status === 2 ? 'warning' : 'danger'"
              >
                {{ scope.row.status === 0 ? '正常' : 
                   scope.row.status === 1 ? '停用' : 
                   scope.row.status === 2 ? '待审核' : '审核拒绝' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button
                link
                type="success"
                icon="Check"
                @click="handleAudit(scope.row, '已通过')"
                v-hasPermi="['organization:organization:audit']"
              >通过</el-button>
              <el-button
                link
                type="danger"
                icon="Close"
                @click="handleAudit(scope.row, '已拒绝')"
                v-hasPermi="['organization:organization:audit']"
              >拒绝</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <pagination
          v-show="pendingTotal > 0"
          :total="pendingTotal"
          v-model:page="pendingQueryParams.pageNum"
          v-model:limit="pendingQueryParams.pageSize"
          @pagination="getPendingList"
        />
      </el-tab-pane>

      <!-- 已审核记录标签页 -->
      <el-tab-pane label="已审核记录" name="audited">
        <el-form :model="auditedQueryParams" ref="auditedQueryRef" :inline="true" v-show="showSearch" label-width="80px">
          <el-form-item label="组织名称" prop="orgName">
            <el-input
              v-model="auditedQueryParams.orgName"
              placeholder="请输入组织名称"
              clearable
              @keyup.enter="handleAuditedQuery"
            />
          </el-form-item>
          <el-form-item label="认证状态" prop="verifyStatus">
            <el-select v-model="auditedQueryParams.verifyStatus" placeholder="请选择认证状态" clearable>
              <el-option label="已通过" value="approved" />
              <el-option label="已拒绝" value="rejected" />
            </el-select>
          </el-form-item>
          <el-form-item label="审核时间" style="width: 308px;">
            <el-date-picker
              v-model="auditedDateRange"
              value-format="YYYY-MM-DD"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleAuditedQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetAuditedQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getAuditedList"></right-toolbar>
        </el-row>

        <div class="table-container-wide">
          <el-table 
            v-loading="auditedLoading" 
            :data="auditedList" 
            table-layout="auto"
            class="audited-table-full"
          >
            <el-table-column label="序号" align="center" width="60">
              <template #default="{ $index }">
                {{ $index + 1 }}
              </template>
            </el-table-column>
            <el-table-column label="组织名称" align="center" prop="orgName" min-width="140" show-overflow-tooltip>
              <template #default="scope">
                <span>{{ scope.row.orgName || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="组织类型" align="center" prop="orgType" min-width="100">
              <template #default="scope">
                <span>{{ scope.row.orgType || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="账号" align="center" prop="adminAccount" width="90" show-overflow-tooltip>
              <template #default="scope">
                <span class="ellipsis-text">{{ scope.row.adminAccount || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="组织注册人姓名" align="center" prop="realName" width="90" show-overflow-tooltip>
              <template #default="scope">
                <span class="ellipsis-text">{{ scope.row.realName || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="组织凭证编号" align="center" prop="idNumber" width="85" show-overflow-tooltip>
              <template #default="scope">
                <span class="ellipsis-text">{{ scope.row.idNumber || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="证件类型" align="center" prop="idType" min-width="80">
              <template #default="scope">
                <span v-if="scope.row.idType === 'organization_license'">组织机构代码证</span>
                <span v-else-if="scope.row.idType === 'id_card'">身份证</span>
                <span v-else-if="scope.row.idType === 'student_card'">学生证</span>
                <span v-else>{{ scope.row.idType || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="组织凭证照片" align="center" min-width="120">
               <template #default="scope">
                 <div v-if="scope.row.idCardFront">
                   <el-button
                     link
                     type="primary"
                     icon="View"
                     @click="handleViewImage(scope.row.idCardFront)"
                     title="查看照片"
                   ></el-button>
                   <el-button
                     link
                     type="success"
                     icon="Download"
                     @click="handleDownloadImage(scope.row.idCardFront, scope.row.orgName + '_凭证照片')"
                     title="下载照片"
                   ></el-button>
                 </div>
                 <span v-else>-</span>
               </template>
             </el-table-column>
            <el-table-column label="联系邮箱" align="center" prop="contactEmail" width="120" show-overflow-tooltip>
              <template #default="scope">
                <span class="ellipsis-text">{{ scope.row.contactEmail || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="注册时间" align="center" prop="submitTime" min-width="140">
              <template #default="scope">
                <span>{{ scope.row.submitTime ? parseTime(scope.row.submitTime, '{y}-{m}-{d} {h}:{i}:{s}') : '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="审核时间" align="center" prop="handleTime" min-width="140">
              <template #default="scope">
                <span v-if="scope.row.handleTime">{{ parseTime(scope.row.handleTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="认证状态" align="center" prop="verifyStatus" min-width="100">
              <template #default="scope">
                <el-tag
                  :type="scope.row.verifyStatus === '已通过' ? 'success' : 'danger'"
                >
                  {{ scope.row.verifyStatus || '待审核' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="组织状态" align="center" prop="status" min-width="100">
              <template #default="scope">
                <el-tag
                  :type="scope.row.status === 0 ? 'success' : 
                         scope.row.status === 1 ? 'info' : 
                         scope.row.status === 2 ? 'warning' : 'danger'"
                >
                  {{ scope.row.status === 0 ? '正常' : 
                     scope.row.status === 1 ? '停用' : 
                     scope.row.status === 2 ? '待审核' : '审核拒绝' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="100" class-name="small-padding fixed-width">
              <template #default="scope">
                <el-button
                  link
                  type="info"
                  icon="Document"
                  @click="handleViewAuditRecord(scope.row)"
                >详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <pagination
          v-show="auditedTotal > 0"
          :total="auditedTotal"
          v-model:page="auditedQueryParams.pageNum"
          v-model:limit="auditedQueryParams.pageSize"
          @pagination="getAuditedList"
        />
      </el-tab-pane>
    </el-tabs>



    <!-- 审核对话框 -->
    <el-dialog :title="auditTitle" v-model="auditDialogVisible" width="500px" append-to-body>
      <el-form ref="auditFormRef" :model="auditForm" :rules="auditRules" label-width="100px">
        <el-form-item label="审核状态">
          <el-tag :type="auditForm.status === '已通过' ? 'success' : 'danger'">
            {{ auditForm.status === '已通过' ? '通过' : '拒绝' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="处理意见" prop="handlerOpinion">
          <!-- 默认意见下拉选择 -->
          <el-select
            v-model="selectedOpinion"
            placeholder="请选择默认意见或自定义输入"
            clearable
            @change="handleOpinionSelect"
            style="width: 100%; margin-bottom: 10px;"
          >
            <el-option
              v-for="opinion in defaultOpinions"
              :key="opinion"
              :label="opinion"
              :value="opinion"
            />
          </el-select>
          <el-input
            v-model="auditForm.handlerOpinion"
            type="textarea"
            :rows="4"
            :placeholder="auditForm.status === '已通过' ? '请输入通过意见（可选）' : '请输入拒绝原因'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitAudit">确 定</el-button>
          <el-button @click="handleCancelAudit">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 审核记录查看对话框 -->
    <el-dialog title="审核记录" v-model="recordDialogVisible" width="600px" append-to-body>
      <div v-if="currentRecord">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="审核状态">
            <el-tag
              :type="currentRecord.status === '已通过' ? 'success' : 'danger'"
            >
              {{ currentRecord.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="审核时间">
            {{ parseTime(currentRecord.auditTime, '{y}-{m}-{d} {h}:{i}:{s}') }}
          </el-descriptions-item>
          <el-descriptions-item label="审核人员">
            {{ currentRecord.auditor || '系统管理员' }}
          </el-descriptions-item>
          <el-descriptions-item label="处理意见">
            {{ currentRecord.handlerOpinion || '无' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="recordDialogVisible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 图片查看对话框 -->
    <el-dialog title="凭证照片" v-model="imageDialogVisible" width="800px" append-to-body>
      <div class="image-container">
        <el-image
          :src="currentImage"
          :preview-src-list="[currentImage]"
          fit="contain"
          style="width: 100%; max-height: 500px;"
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleDownloadCurrentImage">下载图片</el-button>
          <el-button @click="imageDialogVisible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="OrganizationVerify">
import { ref, reactive, toRefs, getCurrentInstance, computed, onMounted, onActivated } from 'vue'
import { getOrganizationAuditList, auditVerification } from "@/api/organization/organization"
import useUserStore from '@/store/modules/user'

const { proxy } = getCurrentInstance()
const userStore = useUserStore()

// Tab相关
const activeTab = ref('pending')

// 待审核记录相关数据
const pendingList = ref([])
const pendingLoading = ref(true)
const pendingMultiple = ref(true)
const pendingTotal = ref(0)
const pendingDateRange = ref([])

// 已审核记录相关数据
const auditedList = ref([])
const auditedLoading = ref(true)
const auditedTotal = ref(0)
const auditedDateRange = ref([])

// 通用数据
const showSearch = ref(true)
const ids = ref([])
const selectedItems = ref([])
const single = ref(true)
const multiple = ref(true)

// 查询参数
const pendingQueryParams = ref({
  pageNum: 1,
  pageSize: 10,
  orgName: undefined,
  verifyStatus: 'pending'
})

const auditedQueryParams = ref({
  pageNum: 1,
  pageSize: 10,
  orgName: undefined,
  verifyStatus: undefined,
  status: undefined
})



// 对话框相关
const auditDialogVisible = ref(false)
const recordDialogVisible = ref(false)
const imageDialogVisible = ref(false)
const currentRecord = ref(null)
const currentImage = ref('')
const currentImageName = ref('')
const auditTitle = ref('')
const selectedOpinion = ref('')

// 默认处理意见选项
const approveOpinions = [
  '资料齐全，审核通过',
  '组织信息真实有效，予以通过',
  '符合认证要求，审核通过',
  '证件信息完整，审核通过'
]

const rejectOpinions = [
  '资料不完整，请补充相关证明',
  '证件信息不清晰，请重新上传',
  '组织信息与证件不符，审核不通过',
  '证件已过期，请更新后重新提交'
]

// 根据审核状态显示对应的默认意见
const defaultOpinions = computed(() => {
  return auditForm.value.status === '已通过' ? approveOpinions : rejectOpinions
})

const data = reactive({
  auditForm: {
    verifyId: null,
    orgId: null,
    status: null,
    handlerOpinion: null
  },
  auditRules: {
    handlerOpinion: [
      {
        validator: (rule, value, callback) => {
          if (auditForm.value.status === '已拒绝' && (!value || value.trim() === '')) {
            callback(new Error('拒绝时必须填写处理意见'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
  }
})

const { auditForm, auditRules } = toRefs(data)

/** 查询待审核记录列表 */
function getPendingList() {
  pendingLoading.value = true
  const baseParams = {
    orgName: pendingQueryParams.value.orgName,
    status: 2,
    verifyStatus: pendingQueryParams.value.verifyStatus || 'pending',
    pageNum: pendingQueryParams.value.pageNum,
    pageSize: pendingQueryParams.value.pageSize
  }
  const params = proxy.addDateRange(baseParams, pendingDateRange.value)
  
  console.log('调用待审核记录接口，传递参数:', params)
  getOrganizationAuditList(params).then(response => {
    console.log('待审核记录接口返回数据:', response)
    pendingList.value = response.rows || response.data || []
    pendingTotal.value = response.total || 0
    pendingLoading.value = false
  }).catch(() => {
    pendingLoading.value = false
  })
}

/** 查询已审核记录列表 */
function getAuditedList() {
  auditedLoading.value = true
  const baseParams = {
    orgName: auditedQueryParams.value.orgName,
    pageNum: auditedQueryParams.value.pageNum,
    pageSize: auditedQueryParams.value.pageSize
  }
  
  
  // 根据后端接口，如果用户没有在搜索表单中指定 verifyStatus，
  // 我们需要分别查询 approved 和 rejected 状态的记录
  if (!auditedQueryParams.value.verifyStatus) {
    // 先查询已通过的记录
    const approvedParams = proxy.addDateRange({ ...baseParams, status:0, verifyStatus: 'approved' }, auditedDateRange.value)
    const rejectedParams = proxy.addDateRange({ ...baseParams, status:4, verifyStatus: 'rejected' }, auditedDateRange.value)
    
    //console.log('调用已审核记录接口（已通过），传递参数:', approvedParams)
    //console.log('调用已审核记录接口（已拒绝），传递参数:', rejectedParams)
    Promise.all([
      getOrganizationAuditList(approvedParams),
      getOrganizationAuditList(rejectedParams)
    ]).then(responses => {
      //console.log('已审核记录接口返回数据:', responses)
      const approvedRecords = responses[0].rows || responses[0].data || []
      const rejectedRecords = responses[1].rows || responses[1].data || []
      const allRecords = [...approvedRecords, ...rejectedRecords]
      
      auditedList.value = allRecords
      auditedTotal.value = allRecords.length
      auditedLoading.value = false
    }).catch(() => {
      auditedLoading.value = false
    })
  } else {
    // 用户指定了状态，直接查询
    const params = proxy.addDateRange({ ...baseParams, verifyStatus: auditedQueryParams.value.verifyStatus }, auditedDateRange.value)
    //console.log('调用已审核记录接口（指定状态），传递参数:', params)
    getOrganizationAuditList(params).then(response => {
      //console.log('已审核记录接口返回数据:', response)
      auditedList.value = response.rows || response.data || []
      auditedTotal.value = response.total || 0
      auditedLoading.value = false
    }).catch(() => {
      auditedLoading.value = false
    })
  }
}


/** 搜索待审核记录按钮操作 */
function handlePendingQuery() {
  // console.log('待审核记录搜索条件:', {
  //   orgName: pendingQueryParams.value.orgName,
  //   verifyStatus: pendingQueryParams.value.verifyStatus,
  //   dateRange: pendingDateRange.value,
  //   pageNum: pendingQueryParams.value.pageNum,
  //   pageSize: pendingQueryParams.value.pageSize
  // })
  pendingQueryParams.value.pageNum = 1
  getPendingList()
}

/** 待审核记录重置按钮操作 */
function resetPendingQuery() {
  pendingDateRange.value = []
  proxy.resetForm("pendingQueryRef")
  handlePendingQuery()
}

/** 搜索已审核记录按钮操作 */
function handleAuditedQuery() {
  console.log('已审核记录搜索条件:', {
    orgName: auditedQueryParams.value.orgName,
    verifyStatus: auditedQueryParams.value.verifyStatus,
    status: auditedQueryParams.value.status,
    dateRange: auditedDateRange.value,
    pageNum: auditedQueryParams.value.pageNum,
    pageSize: auditedQueryParams.value.pageSize
  })
  auditedQueryParams.value.pageNum = 1
  getAuditedList()
}

/** 已审核记录重置按钮操作 */
function resetAuditedQuery() {
  auditedDateRange.value = []
  proxy.resetForm("auditedQueryRef")
  handleAuditedQuery()
}

/** 搜索按钮操作 */
function handleQuery() {
  if (activeTab.value === 'pending') {
    handlePendingQuery()
  } else {
    handleAuditedQuery()
  }
}

/** 重置按钮操作 */
function resetQuery() {
  if (activeTab.value === 'pending') {
    resetPendingQuery()
  } else {
    resetAuditedQuery()
  }
}

/** 待审核记录多选框选中数据 */
function handlePendingSelectionChange(selection) {
  ids.value = selection.map(item => item.verifyId)
  selectedItems.value = selection.map(item => ({
    verifyId: item.verifyId,
    orgId: item.orgId,
    orgName: item.orgName
  }))
  single.value = selection.length !== 1
  pendingMultiple.value = !selection.length
}



/** 审核操作 */
function handleAudit(row, status) {
  auditForm.value = {
    verifyId: row.verifyId,
    orgId: row.orgId,
    status: status,
    handlerOpinion: null
  }
  selectedOpinion.value = ''
  auditTitle.value = status === '已通过' ? '审核通过' : '审核驳回'
  auditDialogVisible.value = true
  // 清理表单验证状态
  proxy.$nextTick(() => {
    proxy.$refs.auditFormRef?.clearValidate()
  })
}

/** 批量审核 */
function handleBatchAudit(status) {
  if (selectedItems.value.length === 0) {
    proxy.$modal.msgError('请选择要审核的记录')
    return
  }
  
  const action = status === '已通过' ? '通过' : '拒绝'
  const orgNames = selectedItems.value.map(item => item.orgName).join('、')
  
  // 将中文状态转换为后端需要的英文状态
  const statusMap = {
    '已通过': 'approved',
    '已拒绝': 'rejected'
  }
  
  proxy.$modal.confirm(`确认要${action}以下组织的实名认证申请吗？\n${orgNames}`).then(() => {
    const promises = selectedItems.value.map(item => {
      const params = {
        status: statusMap[status] || status,
        handlerOpinion: status === '已通过' ? '批量审核通过' : '批量审核拒绝',
        orgId: item.orgId
      }
      console.log('批量审核传递给后端的参数:', {
        verifyId: item.verifyId,
        params: params
      })
      return auditVerification(item.verifyId, params)
    })
    
    Promise.all(promises).then(() => {
      proxy.$modal.msgSuccess(`批量${action}成功`)
      getPendingList()
      // 清空选择
      ids.value = []
      selectedItems.value = []
      single.value = true
      multiple.value = true
    }).catch(() => {
      proxy.$modal.msgError(`批量${action}失败`)
    })
  })
  // 清理表单验证状态
  proxy.$nextTick(() => {
    proxy.$refs.auditFormRef?.clearValidate()
  })
}

/** 提交审核 */
function submitAudit() {
  proxy.$refs.auditFormRef.validate(valid => {
    if (valid) {
      // 将中文状态转换为后端需要的英文状态
      const statusMap = {
        '已通过': 'approved',
        '已拒绝': 'rejected'
      }
      
      const params = {
        status: statusMap[auditForm.value.status] || auditForm.value.status,
        handlerOpinion: auditForm.value.handlerOpinion,
        orgId: auditForm.value.orgId
      }
      
      auditVerification(auditForm.value.verifyId, params).then(() => {
        proxy.$modal.msgSuccess('审核成功')
        auditDialogVisible.value = false
        // 清理表单验证状态
        proxy.$nextTick(() => {
          proxy.$refs.auditFormRef?.clearValidate()
          proxy.$refs.auditFormRef?.resetFields()
        })
        // 刷新待审核列表
        getPendingList()
      })
    }
  })
}

/** 查看审核记录 */
function handleViewAuditRecord(row) {
  currentRecord.value = {
    status: row.verifyStatus,
    auditTime: row.handleTime || row.updateTime,
    auditor: row.auditor,
    handlerOpinion: row.handlerOpinion
  }
  recordDialogVisible.value = true
}

/** 取消审核对话框 */
function handleCancelAudit() {
  selectedOpinion.value = ''
  // 清理表单验证状态
  proxy.$nextTick(() => {
    proxy.$refs.auditFormRef?.clearValidate()
    proxy.$refs.auditFormRef?.resetFields()
  })
  auditDialogVisible.value = false
}

/** 处理意见下拉选择 */
function handleOpinionSelect(opinion) {
  if (opinion) {
    auditForm.value.handlerOpinion = opinion
    // 清除验证错误
    proxy.$nextTick(() => {
      proxy.$refs.auditFormRef?.clearValidate('handlerOpinion')
    })
  }
}

/** 查看图片 */
function handleViewImage(imageData) {
  if (imageData) {
    let base64String = ''
    
    // 前端现在可以直接使用返回的Base64字符串
    if (typeof imageData === 'string') {
      if (imageData.startsWith('data:')) {
        // 已经是完整的data URL
        base64String = imageData
      } else {
        // 纯base64字符串，直接使用
        base64String = `data:image/jpeg;base64,${imageData}`
      }
    } else {
      proxy.$modal.msgError('不支持的图片数据格式')
      return
    }
    
    currentImage.value = base64String
    imageDialogVisible.value = true
  }
}

/** 下载图片 */
function handleDownloadImage(imageData, fileName) {
  if (!imageData) {
    return
  }
  
  try {
    let base64String = ''
    
    // 前端现在可以直接使用返回的Base64字符串
    if (typeof imageData === 'string') {
      if (imageData.startsWith('data:')) {
        // 已经是完整的data URL
        base64String = imageData
      } else {
        // 纯base64字符串，直接使用
        base64String = `data:image/jpeg;base64,${imageData}`
      }
    } else {
      proxy.$modal.msgError('不支持的图片数据格式')
      return
    }
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = base64String
    link.download = `${fileName}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    proxy.$modal.msgSuccess('图片下载成功')
  } catch (error) {
    proxy.$modal.msgError('图片下载失败')
  }
}

/** 下载当前查看的图片 */
function handleDownloadCurrentImage() {
  if (currentImage.value) {
    const fileName = currentImageName.value || '凭证照片'
    handleDownloadImage(currentImage.value, fileName)
  }
}

/** 标签页切换事件 */
function handleTabChange(tabName) {
  activeTab.value = tabName;
  if (tabName === 'pending') {
    getPendingList();
  } else if (tabName === 'audited') {
    getAuditedList();
  }
}

onMounted(() => {
  getPendingList()
})

// 组件激活时重新加载数据（解决 keep-alive 缓存导致的空白问题）
// onActivated(() => {
//   getPendingList()
// })
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.mb8 {
  margin-bottom: 8px;
}

.dialog-footer {
  text-align: right;
}

.el-descriptions {
  margin-top: 20px;
}

.el-image {
  display: block;
  margin: 10px 0;
}

.image-container {
  text-align: center;
  padding: 20px;
}

.image-container .el-image {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

/* 表格容器样式 - 宽屏布局 */
.table-container-wide {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

/* 已审核记录表格样式优化 - 完整显示所有列 */
.audited-table-full {
  width: 100%;
  table-layout: fixed;
}

.audited-table-full :deep(.el-table__body-wrapper) {
  overflow-x: auto;
}

.audited-table-full :deep(.el-table__cell) {
  padding: 8px 6px;
  font-size: 13px;
  white-space: nowrap;
}

.audited-table-full :deep(.el-table__header-wrapper) {
  overflow-x: auto;
}

/* 省略号文本样式 */
.ellipsis-text {
  display: inline-block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 响应式设计 - 保持所有列显示 */
@media (min-width: 1600px) {
  .table-container-wide {
    min-width: 100%;
    overflow-x: hidden;
  }
  
  .audited-table-full {
    min-width: 100%;
  }
}

@media (max-width: 1399px) {
  .table-container-wide {
    overflow-x: auto;
  }
  
  .audited-table-full :deep(.el-table__cell) {
    padding: 6px 4px;
    font-size: 12px;
  }
  
  .audited-table-full :deep(.el-tag) {
    font-size: 11px;
    padding: 2px 6px;
  }
}

@media (max-width: 1200px) {
  .audited-table-full :deep(.el-table__cell) {
    padding: 4px 3px;
    font-size: 11px;
  }
  
  .audited-table-full :deep(.el-button) {
    padding: 2px 4px;
    font-size: 11px;
  }
}
</style>