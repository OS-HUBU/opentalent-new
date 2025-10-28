<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户昵称" prop="nickname">
        <el-input
          v-model="queryParams.nickname"
          placeholder="请输入用户昵称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
    <el-form-item label="角色类型" prop="roleType">
        <el-select v-model="queryParams.roleType" placeholder="请选择角色类型" clearable>
          <el-option
            v-for="option in roleTypeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="专业" prop="major">
        <el-input
          v-model="queryParams.major"
          placeholder="请输入专业"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="账号状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择账号状态" clearable>
          <el-option
            v-for="dict in sys_common_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" style="width: 308px;">
        <el-date-picker
          v-model="dateRange"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="memberList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" width="80">
        <template #default="scope">
          {{ scope.$index + 1 + (queryParams.pageNum - 1) * queryParams.pageSize }}
        </template>
      </el-table-column>
      <el-table-column label="账号" align="center" prop="account" width="120" />
      <el-table-column label="密码" align="center" prop="password" width="120" />
      <el-table-column label="用户昵称" align="center" prop="nickname" width="120" />
      <el-table-column label="角色类型" align="center" prop="roleType" width="130" />
      <el-table-column label="所在组织" align="center" prop="organizationName" width="150">
        <template #default="scope">
          <span v-if="scope.row.organizationName" style="color: #606266;">
            {{ scope.row.organizationName }}
          </span>
          <span v-else style="color: #c0c4cc;">
            暂无
          </span>
        </template>
      </el-table-column>
      <el-table-column label="所在部门" align="center" width="200">
        <template #default="scope">
          <div v-if="getDepartmentArray(scope.row.department).length === 0">
            <span style="color: #c0c4cc;">暂无</span>
          </div>
          <div v-else-if="getDepartmentArray(scope.row.department).length <= 3">
            {{ getDepartmentArray(scope.row.department).join(', ') }}
          </div>
          <div v-else>
            <span v-if="!scope.row.expanded">
              {{ getDepartmentArray(scope.row.department).slice(0, 3).join(', ') }}
              <el-button 
                link 
                type="primary" 
                size="small" 
                @click="toggleDepartmentExpand(scope.row)"
                style="margin-left: 4px;"
              >
                ...
              </el-button>
            </span>
            <span v-else>
              {{ getDepartmentArray(scope.row.department).join(', ') }}
              <el-button 
                link 
                type="primary" 
                size="small" 
                @click="toggleDepartmentExpand(scope.row)"
                style="margin-left: 4px;"
              >
                收起
              </el-button>
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="专业" align="center" prop="major" width="120">
        <template #default="scope">
          <span v-if="scope.row.major" style="color: #606266;">
            {{ scope.row.major }}
          </span>
          <span v-else style="color: #c0c4cc;">
            暂无
          </span>
        </template>
      </el-table-column>
      <el-table-column label="成员类型" align="center" prop="memberType" width="120">
        <template #default="scope">
          <span v-if="scope.row.memberType" style="color: #606266;">
            {{ scope.row.memberType }}
          </span>
          <span v-else style="color: #c0c4cc;">
            暂无
          </span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="120">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账号状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="0"
            inactive-value="1"
            :before-change="() => beforeStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template #default="scope">        
          <el-tooltip content="重置密码" placement="top">
            <el-button link type="primary" icon="Key" @click="handleResetPwd(scope.row)" v-hasPermi="['member:member:resetPwd']"></el-button>
          </el-tooltip>
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
  </div>
</template>

<script setup name="Member">
import { ref, reactive, toRefs, getCurrentInstance, onMounted, onActivated } from 'vue'
import { listMember, resetMemberPwd , changeMemberStatus} from "@/api/member/member"


const { proxy } = getCurrentInstance()
const { sys_common_status } = proxy.useDict('sys_common_status')

// 角色类型选项
const roleTypeOptions = [
  { value: '组织管理员', label: '组织管理员' },
  { value: '部门管理员', label: '部门管理员' },
  { value: '组织内部成员', label: '组织内部成员' },
  { value: '自由职业者', label: '自由职业者' }
]

const memberList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const dateRange = ref([])

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    nickname: null,
    roleType: null,
    major: null,
    status: null,
  },
  rules: {
    nickname: [
      { required: true, message: "用户名称不能为空", trigger: "blur" }
    ],
    roleType: [
      { required: true, message: "角色类型不能为空", trigger: "blur" }
    ],
    password: [
      { required: true, message: "密码不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "账号状态不能为空", trigger: "change" }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询系统登录账户信息列表 */
function getList() {
  loading.value = true
  const params = proxy.addDateRange(queryParams.value, dateRange.value)
  //console.log('调用 listMember 接口前的参数:', params)
  listMember(params).then(response => {
    console.log('listMember response:', response);
    memberList.value = response.rows.map(item => ({
      userId: item.userId,
      account: item.account,
      password: item.password,
      nickname: item.nickname,
      organizationName: item.organizationName,
      department: item.departmentNames || null,
      major: item.major || null,
      memberType: item.userType || null,
      roleType: item.roleType,
      status: String(item.status),
      createTime: item.createTime,
      expanded: false // 添加展开状态
    }))
    total.value = response.total
    loading.value = false
  })
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  // 将status字段从字符串转换为数值类型
  if (queryParams.value.status !== null && queryParams.value.status !== undefined && queryParams.value.status !== '') {
    queryParams.value.status = parseInt(queryParams.value.status)
  }
  //console.log('搜索参数值:', queryParams.value);
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  proxy.resetForm("queryRef")
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    nickname: null,
    roleType: null,
    major: null,
    status: null,
  }
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.userId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}


/** 状态修改前确认 */
function beforeStatusChange(row) {
    // 当前状态为0(启用)时，要执行的操作是"停用"，目标状态是1
    // 当前状态为1(停用)时，要执行的操作是"启用"，目标状态是0
    let text = row.status === "0" ? "停用" : "启用";
    let targetStatus = row.status === 0 ? 1 : 0; // 转换为数值类型
    
    return proxy.$modal.confirm('确认要"' + text + '""' + row.account + '"用户吗?').then(function () {
      return changeMemberStatus(row.userId, targetStatus).then(() => {
        proxy.$modal.msgSuccess(text + "成功");
        return true;
      });
    }).catch(function () {
      // 如果操作失败，保持原状态不变
      return false;
    });
};



/** 重置密码按钮操作 */
function handleResetPwd(row) {
  proxy.$prompt('请输入"' + row.account + '"的新密码', "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    inputPattern: /^.{5,20}$/,
    inputErrorMessage: "用户密码长度必须介于 5 和 20 之间",
  }).then(({ value }) => {
    resetMemberPwd(row.userId, value).then(response => {
      proxy.$modal.msgSuccess("修改成功，新密码是：" + value)
    })
  }).catch(() => {})
}

/** 获取部门数组 */
function getDepartmentArray(department) {
  if (!department || department === null || department === undefined || department === '') return []
  if (Array.isArray(department)) {
    return department.filter(item => item && item.trim())
  }
  if (typeof department === 'string') {
    return department.split(',').map(item => item.trim()).filter(item => item)
  }
  return []
}

/** 切换部门展开/收起状态 */
function toggleDepartmentExpand(row) {
  row.expanded = !row.expanded
}

// 组件挂载时初始化数据
onMounted(() => {
  getList()
})

// // 组件激活时重新加载数据（解决 keep-alive 缓存导致的空白问题）
// onActivated(() => {
//   getList()
// })
</script>
