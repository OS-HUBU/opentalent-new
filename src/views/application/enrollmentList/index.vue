<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="组织名称" prop="orgName">
        <el-input v-model="queryParams.orgName" placeholder="请输入组织名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option label="已拒绝" :value="'已拒绝'" />
          <el-option label="已同意" :value="'已同意'" />
          <el-option label="待处理" :value="'待处理'" />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="提交时间" prop="createTime">
        <el-date-picker clearable v-model="queryParams.submitTime" type="date" value-format="YYYY-MM-DD"
          placeholder="请选择提交时间">
        </el-date-picker>
      </el-form-item> -->
      <!-- 修改提交时间的v-model绑定，与queryParams中的字段保持一致 -->
      <el-form-item label="提交时间" prop="submitTime"> <!-- 这里将prop从createTime改为submitTime -->
        <el-date-picker clearable v-model="queryParams.submitTime" type="date" value-format="YYYY-MM-DD"
          placeholder="请选择提交时间">
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

    <el-table v-loading="loading" :data="enrollmentList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="30" align="center" />
      <el-table-column label="编号" width="55" align="center" type="index" :index="(index) => index + 1" />
      <el-table-column label="申请人" align="center" prop="userName" />
      <el-table-column label="组织名称" align="center" prop="orgName" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="statusMap[scope.row.status]?.type || 'info'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="提交时间" align="center" prop="submitTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.submitTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="处理时间" align="center" prop="handleTime" width="100">
        <template #default="scope">
          <span>{{ parseTime(scope.row.handleTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请备注" align="center" prop="remark" />
      <el-table-column label="处理人" align="center" prop="handlerId" />
      <el-table-column label="处理意见" align="center" prop="handlerOpinion" />
    </el-table>

    <!-- <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" /> -->
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" 
  v-model:limit="queryParams.pageSize" @pagination="handlePagination" />

  </div>
</template>



<!-- <script setup name="Aplication">
import { listEnrollment } from "@/api/application/application"
import { nextTick } from "vue"

const statusMap = {
  '待处理': { type: 'warning' },
  '已同意': { type: 'success' },
  '已拒绝': { type: 'danger' }
}
const { proxy } = getCurrentInstance()

const enrollmentList = ref([]) 
const allData = ref([]) 
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const queryRef = ref(null);
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orgName: null,
    userName: null,
    status: null,
    submitTime: null,
  },
})

const { queryParams } = toRefs(data)
// import { listEnrollment } from "@/api/application/application"
// import { nextTick } from "vue"
// const statusMap = {
//   '待处理': { type: 'warning' },
//   '已同意': { type: 'success' },
//   '已拒绝': { type: 'danger' }
// }
// const {proxy } = getCurrentInstance()
// const enrollmentList = ref([])
// const loading = ref(true)
// const showSearch = ref(true)
// const total = ref(0)
// const queryRef = ref(null);
// const data = reactive({
//   queryParams: {
//     pageNum: 1,
//     pageSize: 10,
//     orgId: null,
//     userId: null,
//     status: null,
//     submitTime: null,
//   },
// })
// const { queryParams } = toRefs(data)

/**查询无组织个人申请加入记录列表 */
// function getList() {
//   loading.value = true;
//   listEnrollment(queryParams.value).then(response => {
//     enrollmentList.value = response.rows;
//     //console.log(response);
//     total.value = response.total;
//     loading.value = false;
//   });
// }
/** 获取所有数据 */
function getAllData() {
  loading.value = true;
  // 清空查询条件，获取所有数据
  const params = {
    pageNum: 1,
    pageSize: 10000, // 设置一个较大的值获取所有数据，或者根据实际情况调整
  };
  
  listEnrollment(params).then(response => {
    allData.value = response.rows || [];
    console.log('获取到的所有数据:', allData.value.length, '条');
    // 初始显示所有数据
    enrollmentList.value = allData.value;
    total.value = allData.value.length;
    loading.value = false;
  }).catch(error => {
    console.error('获取数据失败:', error);
    loading.value = false;
  });
}
/** 前端筛选数据 */
function filterData() {
  if (!allData.value.length) {
    enrollmentList.value = [];
    total.value = 0;
    return;
  }

  let filteredData = allData.value;

  // 按组织名称筛选
  if (queryParams.value.orgName) {
    filteredData = filteredData.filter(item => 
      item.orgName && item.orgName.toString().includes(queryParams.value.orgName.toString())
    );
  }

  // 按申请人姓名筛选
  if (queryParams.value.userName) {
    filteredData = filteredData.filter(item => 
      item.userName && item.userName.toString().includes(queryParams.value.userName.toString())
    );
  }

  // 按状态筛选
  if (queryParams.value.status) {
    filteredData = filteredData.filter(item => 
      item.status === queryParams.value.status
    );
  }

  // 按提交时间筛选
  if (queryParams.value.submitTime) {
    filteredData = filteredData.filter(item => {
      if (!item.submitTime) return false;
      const itemDate = proxy.parseTime(item.submitTime, '{y}-{m}-{d}');
      const queryDate = queryParams.value.submitTime;
      return itemDate === queryDate;
    });
  }

  console.log('筛选后的数据:', filteredData.length, '条');
  enrollmentList.value = filteredData;
  total.value = filteredData.length;
}
// 表单重置
function reset() {
  form.value = {
    userName: null,
    orgName: null,
    status: null,
    submitTime: null,
    handleTime: null,
    remark: null,
    handlerId: null,
    handlerOpinion: null
  }
}
// 添加分页处理函数
function handlePagination() {
  // 前端分页逻辑
  const startIndex = (queryParams.value.pageNum - 1) * queryParams.value.pageSize;
  const endIndex = startIndex + queryParams.value.pageSize;
  enrollmentList.value = allData.value.slice(startIndex, endIndex);
}

// 修改筛选函数，加入分页
function filterData() {
  if (!allData.value.length) {
    enrollmentList.value = [];
    total.value = 0;
    return;
  }

  let filteredData = allData.value;

  // ... 筛选逻辑保持不变 ...

  console.log('筛选后的数据:', filteredData.length, '条');
  total.value = filteredData.length;
  
  // 应用分页
  const startIndex = (queryParams.value.pageNum - 1) * queryParams.value.pageSize;
  const endIndex = startIndex + queryParams.value.pageSize;
  enrollmentList.value = filteredData.slice(startIndex, endIndex);
}
/** 搜索按钮操作 */
// function handleQuery() {
//   queryParams.value.pageNum = 1
//   getList()
// }

/** 重置按钮操作 */
// function resetQuery() {
//   proxy.resetForm("queryRef")
//   handleQuery()
// }
/** 重置按钮操作 */
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  filterData();
}

/** 重置按钮操作 */
function resetQuery() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    orgId: null,
    userId: null,
    status: null,
    submitTime: null,
  };
  if (queryRef.value) {
    queryRef.value.resetFields();
  }
  // 重置后显示所有数据
  enrollmentList.value = allData.value;
  total.value = allData.value.length;
}
getAllData()
</script> -->
<script setup name="Aplication">
import { listEnrollment } from "@/api/application/application"
import { nextTick } from "vue"

const statusMap = {
  '待处理': { type: 'warning' },
  '已同意': { type: 'success' },
  '已拒绝': { type: 'danger' }
}
const { proxy } = getCurrentInstance()

const enrollmentList = ref([]) 
const allData = ref([]) 
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const queryRef = ref(null);
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

const { queryParams } = toRefs(data)

/** 获取所有数据 */
function getAllData() {
  loading.value = true;
  // 清空查询条件，获取所有数据
  const params = {
    pageNum: 1,
    pageSize: 10000, // 设置一个较大的值获取所有数据
  };
  
  listEnrollment(params).then(response => {
    allData.value = response.rows || [];
    console.log('原始数据:', response.rows || []);
    console.log('获取到的所有数据:', allData.value.length, '条');
    // 初始显示所有数据
    applyPagination();
    loading.value = false;
  }).catch(error => {
    console.error('获取数据失败:', error);
    loading.value = false;
  });
}

/** 应用分页 */
function applyPagination() {
  const startIndex = (queryParams.value.pageNum - 1) * queryParams.value.pageSize;
  const endIndex = startIndex + queryParams.value.pageSize;
  enrollmentList.value = allData.value.slice(startIndex, endIndex);
  total.value = allData.value.length;
}

/** 前端筛选数据 */
function filterData() {
  if (!allData.value.length) {
    enrollmentList.value = [];
    total.value = 0;
    return;
  }

  let filteredData = allData.value;

  // 按组织名称筛选
  if (queryParams.value.orgName) {
    filteredData = filteredData.filter(item => 
      item.orgName && item.orgName.includes(queryParams.value.orgName)
    );
  }

  // 按状态筛选
  if (queryParams.value.status) {
    filteredData = filteredData.filter(item => 
      item.status === queryParams.value.status
    );
  }

  // 按提交时间筛选
  if (queryParams.value.submitTime) {
    filteredData = filteredData.filter(item => {
      if (!item.submitTime) return false;
      const itemDate = proxy.parseTime(item.submitTime, '{y}-{m}-{d}');
      const queryDate = queryParams.value.submitTime;
      return itemDate === queryDate;
    });
  }

  console.log('筛选后的数据:', filteredData.length, '条');
  total.value = filteredData.length;
  
  // 应用分页到筛选后的数据
  const startIndex = (queryParams.value.pageNum - 1) * queryParams.value.pageSize;
  const endIndex = startIndex + queryParams.value.pageSize;
  enrollmentList.value = filteredData.slice(startIndex, endIndex);
}

// 表单重置
function reset() {
  form.value = {
    userId: null,
    orgId: null,
    userName: null,
    orgName: null,
    status: null,
    submitTime: null,
    handleTime: null,
    remark: null,
    handlerId: null,
    handlerOpinion: null
  }
}

// 分页处理函数
function handlePagination() {
  filterData();
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  filterData();
}

/** 重置按钮操作 */
function resetQuery() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    orgName: null,
    userName: null,
    status: null,
    submitTime: null,
  };
  if (queryRef.value) {
    queryRef.value.resetFields();
  }
  // 重置后显示所有数据
  applyPagination();
}

getAllData()
</script>