<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="组织名称" prop="orgName">
                <el-input v-model="queryParams.orgName" placeholder="请输入组织名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="组织类型" prop="orgType">
                <el-select v-model="queryParams.orgType" placeholder="请选择组织类型" clearable>
                    <el-option v-for="dict in dm_organization" :key="dict.value" :label="dict.label"
                        :value="dict.label" />
                </el-select>
            </el-form-item>
            <el-form-item label="位置" prop="address">
                <el-input v-model="queryParams.address" placeholder="请输入位置" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="创建时间" prop="createTime">
                <el-date-picker clearable v-model="queryParams.createTime" type="date" value-format="YYYY-MM-DD"
                    placeholder="请选择创建时间">
                </el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="organizationList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="30" align="center" />
            <el-table-column label="编号" width="55" align="center" type="index" :index="(index) => index + 1" />
            <el-table-column label="组织名称" align="center" prop="orgName" />
            <el-table-column label="组织类型" align="center" prop="orgType">
            </el-table-column>
            <el-table-column label="组织简介" align="center" prop="orgIntroduction" />
            <el-table-column label="位置" align="center" prop="location" />
            <el-table-column label="组织成员数" align="center" prop="orgMemberCount">
                <template #default="scope">
                    {{scope.row.orgMemberCount || '0'}}
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button type="success" icon="Edit" @click="handleApply(scope.row)"
                        size="default">申请加入</el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize" @pagination="getList" />

        <!-- 提交申请理由对话框 -->
        <el-dialog title="提交加入组织的申请理由" v-model="applyDialogVisible" align="center" width="500px" append-to-body>
            <el-form ref="applyFormRef" :model="applyForm" label-width="100px">
                <el-form-item label="组织名称" prop="orgName">
                    <el-input v-model="applyForm.orgName" disabled></el-input>
                </el-form-item>
                <el-form-item label="申请理由" prop="remark">
                    <el-input v-model="applyForm.remark" type="textarea" placeholder="请输入申请加入该组织的理由"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="applyDialogVisible = false">取 消</el-button>
                    <el-button type="primary" :loading="applyLoading" @click="submitApply">确 认</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup name="enrollment">
import { commonOrganizationList } from "@/api/organization/organization"
import { applyEnrollment } from "@/api/application/application"
const { proxy } = getCurrentInstance()
const { dm_evaluatermodel, dm_organization, dm_projectscope, dm_platformweight, dm_orgreport, dm_orgstatus } = proxy.useDict('dm_evaluatermodel', 'dm_organization', 'dm_projectscope', 'dm_platformweight', 'dm_orgreport', 'dm_orgstatus');


const organizationList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const selectedItems = ref([]) // 存储包含 orgId 和 userId 的对象数组
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

// 提交申请理由相关
const applyDialogVisible = ref(false)
const applyFormRef = ref(null)
const applyForm = reactive({
    orgId: null,
    orgName: '',
    remark: ''
})
const applyLoading = ref(false) // 添加加载状态
const data = reactive({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        orgName: null,
        orgType: null,
        address: null,
    },

})

const { queryParams, form } = toRefs(data)

/** 查询组织信息列表 */
function getList() {
    loading.value = true
    commonOrganizationList(queryParams.value).then(response => {
        console.log('响应数据:', response)
        // 按组织成员数量由多到少排列
        const sortedRows = response.rows.sort((a, b) => {
            const countA = parseInt(a.orgMemberCount) || 0
            const countB = parseInt(b.orgMemberCount) || 0
            return countB - countA
        })
        organizationList.value = sortedRows
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
        userId: null,
        orgId: null,
        orgName: null,
        orgType: null,
        orgIntroduction: null,
        address: null,
        region: null,
    }
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

    single.value = selection.length != 1
    multiple.value = !selection.length
}

/** 打开申请理由对话框 */
function handleApply(organization) {
    applyDialogVisible.value = true;
    applyForm.orgId = organization.orgId;
    applyForm.orgName = organization.orgName;
    applyForm.remark = '';
}
/**提交申请 */
function submitApply() {
  if (!applyFormRef.value) return
  applyFormRef.value.validate((valid) => {
    if (valid) {
      // 设置加载状态
      applyLoading.value = true
      
      applyEnrollment(
        applyForm.orgId, applyForm.remark
      ).then(response => {
        // 请求成功
        applyLoading.value = false
        if (response.code === 200) {
          proxy.$modal.msgSuccess("申请提交成功")
          applyDialogVisible.value = false
        } else {
          proxy.$modal.msgError(response.msg || "申请提交失败")
        }
      }).catch(error => {
        applyLoading.value = false
        proxy.$modal.msgError("申请提交失败，请稍后重试")
        console.error("申请提交错误:", error)
      })
    } else {
      proxy.$modal.msgError('请完善申请信息')
      return false
    }
  })
}

getList()
</script>
