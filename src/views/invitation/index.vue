<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="组织编号" prop="orgId">
        <el-input
          v-model="queryParams.orgId"
          placeholder="请输入组织编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
         <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option label="拒绝" :value="rejected" />
          <el-option label="接受" :value="approved" />
          <el-option label="待处理" :value="pending" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="invitationList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" width="55" align="center" type="index" :index="(index) => index + 1" />
      <el-table-column label="邀请组织名" align="center" prop="orgName" />
      <el-table-column label="处理状态" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="statusMap[scope.row.status].type">
            {{ statusMap[scope.row.status].text }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="邀请时间" align="center" prop="submitTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.submitTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="邀请备注" align="center" prop="remark" />
      <el-table-column label="处理时间" align="center" prop="handleTime" width="100">
        <template #default="scope">
          <span>{{ parseTime(scope.row.handleTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      
      <el-table-column label="处理意见" align="center" prop="handlerOpinion" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
            <div v-if ="scope.row.status === 'pending'">
              <el-space>
                <el-button type="success" icon="CircleCheck" @click="handleAccept(scope.row)" size="default">接受</el-button>
                <el-button type="danger" icon="Remove" @click="handleReject(scope.row)" size="default">拒绝</el-button>
              </el-space>
            </div>
            <span v-else style="color: #909399;">已处理</span>
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

    <!-- 处理意见对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" append-to-body>
      <el-form ref="opinionFormRef" :model="opinionForm" :rules="opinionRules" label-width="80px">
        <el-form-item label="处理意见" prop="handlerOpinion">
          <el-input
            v-model="opinionForm.handlerOpinion"
            type="textarea"
            :rows="4"
            placeholder="请输入处理意见"
            maxlength="500"
            show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submitOpinion">确 定</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>     
        
   


<script setup name="invitation">
import { listInvitation,approveInvitation } from "@/api/invitation/invitation"
import { nextTick, ref, reactive, toRefs, getCurrentInstance } from "vue"

const statusMap = {
  pending: { text: '待处理', type: 'warning' },
  approved: { text: '已接受', type: 'success' },
  rejected: { text: '已拒绝', type: 'danger' }
}
const { proxy } = getCurrentInstance()

const invitationList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)

//处理意见相关
const dialogVisible = ref(false)
const submitLoading = ref(false)
const dialogTitle = ref('')
const currentAction = ref('') // 当前操作类型accept\reject
const currentRecordId = ref(null) // 当前操作的记录ID
const opinionForm = reactive({
  handlerOpinion: ''
})

// 处理意见验证规则
const opinionRules = {
  handlerOpinion: [
    { required: true, message: '处理意见不能为空', trigger: 'blur' },
    { min: 5, message: '处理意见至少5个字符', trigger: 'blur' }
  ]
}

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orgId: null,
    userId: null,
    status: null,
    submitTime: null,
  },
})

const { queryParams} = toRefs(data)

/**查询当前登录用户收到的邀请列表 */
function getList() {
  loading.value=true;
  listInvitation(queryParams.value).then(response => {
    if(response.code === 200){
      invitationList.value = response.rows;
      total.value = response.total;
      loading.value = false;
      console.log(response)
    }else{
      proxy.$modal.msgError(response.msg || "查询失败")
    }
});
}

// 表单重置
function reset() {
  form.value = {
    userId:null,
    orgId: null,
    status: null,
    submitTime: null,
    handleTime:null,
    remark:null,
    handlerId:null,
    handlerOpinion:null
  }
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 接受邀请 */
function handleAccept(row) {
  currentAction.value='accept'
  currentRecordId.value = row.id
  dialogTitle.value = '接受邀请'
  opinionForm.handlerOpinion = ''
  dialogVisible.value = true
  nextTick(() => {
    proxy.$refs['opinionFormRef'].clearValidate()
  })
}
/** 拒绝邀请 */
function handleReject(row) {
  currentAction.value='reject'
  currentRecordId.value = row.id
  dialogTitle.value = '拒绝邀请'
  opinionForm.handlerOpinion = ''
  dialogVisible.value = true
  nextTick(() => {
    proxy.$refs['opinionFormRef'].clearValidate()
  })
}

/** 提交处理意见 */
function submitOpinion() {
  if (!proxy.$refs.opinionFormRef) return
  
  proxy.$refs.opinionFormRef.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      
      // 确定状态值
      const status = currentAction.value === 'accept' ? 'approved' : 'rejected'
      
      // 调用API处理邀请
      processInvitation(currentRecordId.value, status, opinionForm.handlerOpinion)
        .then(response => {
          submitLoading.value = false
          if (response.code === 200) {
            proxy.$modal.msgSuccess("处理成功")
            dialogVisible.value = false
            getList() 
          } else {
            proxy.$modal.msgError(response.msg || "处理失败")
          }
        })
        .catch(error => {
          submitLoading.value = false
          proxy.$modal.msgError("处理失败，请稍后重试")
          console.error("处理错误:", error)
        })
    } else {
      proxy.$modal.msgError('请填写处理意见')
      return false
    }
  })
}
getList()
</script>
