<template>
  <div class="department-management">
    <!-- 控制栏 -->
    <div class="department-controls">
      <div class="select-container">
        <label>搜索部门：</label>
        <el-select
          v-model="selectedDepartment"
          filterable
          clearable
          :filter-method="filterMethod"
          placeholder="请输入部门名称搜索"
          style="width: 300px"
        >
          <el-option label="全部部门" value="all"></el-option>
          <el-option
            v-for="dept in filteredOptions"
            :key="dept.departmentId"
            :label="dept.departmentName"
            :value="dept.departmentId"
          >
            <span
              v-html="highlightMatch(dept.departmentName, filterText)"
            ></span>
          </el-option>
        </el-select>
      </div>
      <el-button
        type="danger"
        :disabled="!multipleSelection.length"
        @click="handleBatchDelete"
      >
        批量删除
      </el-button>
      <el-button type="primary" @click="openBatchAddDialog">批量添加</el-button>
      <el-button type="primary" @click="openAddDialog">添加部门</el-button>
    </div>

    <!-- 部门列表 -->
    <div class="department-list">
      <div class="table-container">
        <el-table
          :data="pageData"
          style="width: 100%"
          :cell-style="{ textAlign: 'center' }"
          :header-cell-style="{ textAlign: 'center' }"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="departmentName" label="部门名称" />
          <el-table-column prop="departmentAccount" label="部门账号">
            <template #default="scope">
              {{ scope.row.departmentAccount || "-" }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
                {{ scope.row.status === 0 ? "启用" : "禁用" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="deptMemberCount" label="成员数" />
          <el-table-column prop="createTime" label="创建时间" />
          <el-table-column prop="updateTime" label="更新时间" />
          <el-table-column label="操作">
            <template #default="scope">
              <el-tooltip placement="top" content="编辑">
                <el-button
                  :icon="Edit"
                  @click="
                    EditDialog(scope.row.departmentId, scope.row.departmentName)
                  "
                  size="small"
                >
                </el-button>
              </el-tooltip>
              <el-tooltip placement="top" content="删除">
                <el-button
                  :icon="Delete"
                  @click="
                    deleteDepartment(scope.row.departmentId, scope.row.userId)
                  "
                  size="small"
                >
                </el-button>
              </el-tooltip>
              <el-tooltip placement="top" content="重置密码">
                <el-button
                  :icon="Key"
                  @click="resetDepartmentPassword(scope.row.userId)"
                  size="small"
                >
                </el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>

        <div></div>
      </div>
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="departments.length"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 添加部门弹窗 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加部门"
      width="500px"
      class="add-dialog"
    >
      <el-form
        ref="addFormRef"
        :model="newDepartment"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="部门名称" prop="departmentName">
          <el-input
            v-model="newDepartment.departmentName"
            @input="filterSpace('departmentName')"
          />
        </el-form-item>
        <el-form-item label="部门账号" prop="departmentAccount">
          <el-input
            v-model="newDepartment.departmentAccount"
            @input="filterSpace('departmentAccount')"
            maxlength="20"
          />
        </el-form-item>
        <el-form-item label="部门密码" prop="departmentPassword">
          <el-input
            v-model="newDepartment.departmentPassword"
            show-password
            @input="filterSpace('departmentPassword')"
            maxlength="10"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="newDepartment.confirmPassword"
            type="password"
            show-password
            @input="filterSpace('confirmPassword')"
            maxlength="10"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addOrgDepartment">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量添加部门弹窗 -->
    <el-dialog
      v-model="batchAddDialogVisible"
      title="批量注册部门"
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
          <div class="upload-tip" >
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
          href="../../../../public/orgDepartment/示例文件.xlsx"
          class="download-link"
          download="示例文件.xlsx"
          ><el-icon class="download-icon"><Download /></el-icon>示例文件.xlsx</a
        >
      </div>
      
      <!-- 进度显示已集成到ElLoading中，不再需要独立的进度条 -->
      
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

<script setup>
import { ref, computed, onMounted, onActivated, reactive } from "vue";
import {
  listDepartment,
  addDepartment,
  updateDepartment,
  delDepartment,
  batchImportDepartment,
  getImportProgress,
} from "@/api/department/department";
import { resetMemberPwd } from "@/api/member/member";
import { Edit, Delete, Key } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, ElLoading } from "element-plus";
import * as xlsx from "xlsx"; // 正确写法
import { fi } from "element-plus/es/locales.mjs";
import download from "@/plugins/download"; // 导入下载工具
// 批量添加弹窗状态
const batchAddDialogVisible = ref(false);
// 上传文件列表
const uploadFileList = ref([]);
// 验证通过的有效数据
// const validData = ref([]);
// 存储用户上传的原始文件对象，用于最终提交给后端
const uploadedFile = ref(null);

// // 判断有效信息是否可以导入
// const hasValidData = computed(() => {
//   return validData.value.length > 0;
// });
// 打开批量添加弹窗
const openBatchAddDialog = () => {
  batchAddDialogVisible.value = true;
  // 重置上传状态
  uploadFileList.value = [];
  // validData.value = [];
  uploadedFile.value = null;
};

// 前端动态生成简单模板
const generateTemplate = () => {
  // 1. 定义模板数据（表头 + 示例数据）
  const templateData = [
    ["部门名称", "部门账号", "密码"], // 表头
  ];

  // 2. 创建Excel工作簿和工作表
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.aoa_to_sheet(templateData); // 将数组转换为工作表

  // 设置列宽
  worksheet["!cols"] = [{ wch: 30 }, { wch: 40 }, { wch: 40 }];

  // 3. 将工作表添加到工作簿
  xlsx.utils.book_append_sheet(workbook, worksheet, "sheet1");

  // 4. 生成Excel文件并下载（无需后端）
  xlsx.writeFile(workbook, "部门批量注册模板.xlsx");
};

// 上传前校验
const beforeUpload = (file) => {
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
};
// // 文件清除处理
// const handleFileRemove = (file, fileList) => {
//   // 清空文件列表
//   uploadFileList.value = [];
//   // 清空有效数据
//   //validData.value = [];
//   // 清空上传的文件对象
//   uploadedFile.value = null;
//   ElMessage.success("文件已清除，可重新上传");
// };

// 文件解析
const handleFileUpload = (options) => {
  // 获取上传的文件对象
  const file = options.file;
  uploadedFile.value = file;
  // 创建FileReader对象读取文件内容进行前端验证（不影响原始文件）
  const reader = new FileReader();

  // 文件读取完成后的回调
  reader.onload = (e) => {
    const worker = new Worker(
      new URL("@/workers/excelWorker.js", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (msg) => {
      const { jsonData, duration } = msg.data;
      // console.log("Excel 解析耗时:", duration, "ms");
        // console.log("解析结果:", jsonData);

      //processExcelData(jsonData);
      // 更新文件列表，确保上传区域被禁用
      uploadFileList.value = [{
        name: file.name,
        size: file.size,
        status: 'success',
        uid: Date.now()
      }];
      options.onSuccess();
      worker.terminate(); // 用完关闭 worker
    };

    worker.onerror = (err) => {
      // console.error("Worker 解析出错:", err);
      options.onError();
      worker.terminate();
    };

    // 把文件内容传给 worker
    worker.postMessage({ fileBuffer: e.target.result });
  };

  // 以ArrayBuffer格式读取文件（仅用于前端验证，不影响原始文件）
  reader.readAsArrayBuffer(file);
};


// 确认导入
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
    // console.log("📤 调用后端API接口 batchImportDepartment...");
    // console.log("📤 传递的文件参数:", uploadedFile.value);

    // 调用批量导入接口，直接传递原始文件对象
    // batchImportDepartment函数内部会创建FormData
    response = await batchImportDepartment(uploadedFile.value);

    // console.log("📥 后端API响应:", response);
      // console.log("📥 响应数据结构:", JSON.stringify(response, null, 2));

    // 处理接口响应
    if (response.code === 200) {
      // 检查是否返回了taskId（新的异步处理模式）
      if (response.data?.taskId) {
        // console.log("✅ 批量导入任务已启动，taskId:", response.data.taskId);
        // console.log("📋 任务信息:", response.data.message);
        
        // 启动进度轮询，传递loading实例以便动态更新文本
        await pollProgress(response.data.taskId, loading);
        
      } else {
        // 兼容旧的同步处理模式
        // console.log("✅ 导入成功，成功数量:", response.data?.successCount);
          // console.log("✅ 成功响应数据详情:", response.data);
        loading.close();
        ElMessage.success(
          `导入成功，共导入${response.data?.successCount || 0}条数据`
        );
        batchAddDialogVisible.value = false;
        fetchDepartments(); // 刷新部门列表
      }
    } else {
      // console.log("❌ 导入失败，错误信息:", response.message);
        // console.log("❌ 失败响应数据详情:", response);
      loading.close();
      ElMessage.error(`导入失败: ${response.message || "未知错误"}`);
    }
  } catch (error) {
    // console.error("❌ 导入过程出错:", error);
    // console.error("❌ 错误详情:", {
    //   message: error.message,
    //   stack: error.stack,
    //   response: error.response,
    // });
    loading.close();
    ElMessage.error("导入过程出错，请稍后重试");
  }
};

// 进度相关状态（简化版本，不再包含进度百分比）
const importProgress = ref({
  visible: false,
  status: 'RUNNING',
  message: '正在导入数据，请稍候...',
  taskId: ''
});

// 轮询查询进度
const pollProgress = async (taskId, loading) => {
  let progressInterval;
  
  try {
    progressInterval = setInterval(async () => {
      try {
        // 调用进度查询接口
        const progressResponse = await getImportProgress(taskId);
        
        if (progressResponse.code === 200) {
          const progressData = progressResponse.data;
          // console.log("📊 进度更新:", progressData);
          
          // 动态更新ElLoading的文本内容（不显示百分比）
          const message = progressData.message || '正在处理';
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
              await handleImportComplete(taskId, progressData);
            }, 1000);
            
          } else if (progressData.status === 'FAILED') {
            // 任务失败
            clearInterval(progressInterval);
            loading.close();
            
            ElMessage.error(`导入失败: ${progressData.errorMessage || progressData.message}`);
            // console.error("❌ 导入任务失败:", progressData);
          }
          // 如果状态是RUNNING，继续轮询
        } else {
          // console.error("❌ 查询进度失败:", progressResponse.message);
        }
      } catch (error) {
        // console.error("❌ 查询进度出错:", error);
      }
    }, 2000); // 每2秒查询一次进度
    
    // 设置超时时间（30分钟）
    setTimeout(() => {
      if (progressInterval) {
        clearInterval(progressInterval);
        loading.close();
        ElMessage.error("导入超时，请检查任务状态");
      }
    }, 30 * 60 * 1000);
    
  } catch (error) {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    loading.close();
    // console.error("❌ 进度查询异常:", error);
    ElMessage.error("进度查询异常，请稍后重试");
  }
};

// 处理导入完成 
const handleImportComplete = async (taskId, progressData) => { 
  try { 
    // console.log("✅ 导入完成，结果:", progressData); 
    
    // 显示成功消息 
    const successMsg = `导入完成！成功: ${progressData.success || 0}条，失败: ${progressData.failed || 0}条`; 
    ElMessage.success(successMsg); 
    
    // 如果有失败记录，提供下载选项 
    if (progressData.failed > 0) { 
      // console.log('🔍 检测到失败记录:', progressData.failed, '条，taskId:', taskId);
      ElMessageBox.confirm( 
        `检测到 ${progressData.failed} 条记录导入失败，是否下载失败记录文件？`, 
        '导入结果', 
        { 
          confirmButtonText: '下载失败记录', 
          cancelButtonText: '稍后下载', 
          type: 'warning' 
        }).then(() => { 
        // 打印从后端获取的文件名信息
        // console.log('📄 后端返回的failedRecordsExcelUrl:', progressData.failedRecordsExcelUrl);
        
        // 从后端返回的URL中提取实际文件名
        const actualFileName = extractFileNameFromUrl(progressData.failedRecordsExcelUrl);
        // console.log('🔍 extractFileNameFromUrl函数提取的文件名:', actualFileName);
        
        if (actualFileName) {
          // console.log('✅ 最终使用的文件名:', actualFileName);
          downloadFailedRecords(actualFileName, progressData.failedRecordsExcelUrl); 
        } else {
          // 降级处理：使用原来的方式
          const fallbackFileName = `failed_records_${taskId}.xlsx`;
          // console.log('⚠️ 降级处理，最终使用的文件名:', fallbackFileName);
          downloadFailedRecords(fallbackFileName);
        }
      }).catch(() => { 
        // console.log('用户取消下载失败记录'); 
      }); 
    } else {
      // console.log('✅ 无失败记录，不显示下载选项');
    } 
    
    // 关闭对话框并刷新列表 
    batchAddDialogVisible.value = false; 
    fetchDepartments(); 
    
  } catch (error) { 
    // console.error("❌ 处理导入完成出错:", error); 
    ElMessage.error("处理导入完成出错"); 
  } 
}; 

// 从URL中提取文件名的辅助函数
const extractFileNameFromUrl = (url) => {
  if (!url) return null;
  try {
    const parts = url.split('/');
    return parts[parts.length - 1]; // 获取URL最后一部分作为文件名
  } catch (error) {
    // console.error('提取文件名失败:', error);
    return null;
  }
};

// 下载失败记录文件 
const downloadFailedRecords = async (fileName, fullUrl = null) => { 
  try { 
    // 如果提供了完整URL，直接使用；否则构建下载URL
    const downloadUrl = fullUrl || `/register/download/failed-records/${fileName}`; 
    
    // 使用系统下载工具，会自动携带认证头
    download.zip(downloadUrl, fileName);
    
    //console.log("📥 开始下载失败记录文件:", fileName); 
    ElMessage.success("开始下载失败记录文件"); 
    
  } catch (error) { 
    //console.error("❌ 下载失败记录文件出错:", error); 
    ElMessage.error(`下载失败: ${error.message || '未知错误'}`); 
  } 
};


// 部门数据（从接口获取）
const departments = ref([]);

const selectedDepartment = ref("");

const filterText = ref("");

// 添加三个独立的状态变量

const currentPage = ref(1);
const pageSize = ref(10);

// 修改 rules 配置
const rules = ref({
  departmentName: [
    { required: true, message: "请输入部门名称", trigger: ["blur", "change"] },
  ],
  departmentAccount: [
    { required: true, message: "请输入部门账号", trigger: ["blur", "change"] },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error("请输入部门账号"));
          return;
        }

        // 长度检查
        if (value.length < 5 || value.length > 20) {
          callback(new Error("部门账号长度必须在5到20个字符之间"));
          return;
        }

        // 字符类型检查
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          callback(new Error("部门账号只能包含字母、数字、下划线"));
          return;
        }

        // 不能以下划线开头或结尾
        if (value.startsWith("_") || value.endsWith("_")) {
          callback(new Error("部门账号不能以下划线开头或结尾"));
          return;
        }

        // 不能包含连续的下划线
        if (value.includes("__")) {
          callback(new Error("部门账号不能包含连续的下划线"));
          return;
        }

        // 单字符账号必须是字母或数字
        if (value.length === 1 && !/^[a-zA-Z0-9]$/.test(value)) {
          callback(new Error("单字符账号必须是字母或数字"));
          return;
        }

        callback();
      },
      trigger: ["blur", "change"],
    },
  ],
  departmentPassword: [
    { required: true, message: "请输入部门密码", trigger: ["blur", "change"] },
    {
      min: 6,
      max: 10,
      message: "密码长度必须在6到10个字符之间",
      trigger: ["blur", "change"],
    },
  ],
  confirmPassword: [
    { required: true, message: "请再次输入密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== newDepartment.departmentPassword) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
});

// 重置密码
const resetDepartmentPassword = async (userId) => {
  try {
    const { value: newPassword } = await ElMessageBox.prompt(
      "请输入新密码:",
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputType: "password",
        inputPattern: /^.{6,10}$/,
        inputErrorMessage: "密码长度必须介于 6 和 10 之间",
        inputOptions: {
          // 实时过滤空格和长度限制
          oninput: function () {
            // 实时替换输入框中的空格
            let value = this.value.replace(/\s/g, "");
            // 限制长度为10个字符
            if (value.length > 10) {
              value = value.slice(0, 10);
            }
            this.value = value;
          },
          // 也可以添加onkeydown来阻止空格键输入
          onkeydown: function (e) {
            // 阻止空格键输入
            if (e.key === " " || e.keyCode === 32) {
              e.preventDefault();
            }
          },
        },
        inputValidator: (value) => {
          // 验证时再次清理值
          const cleanValue = value.replace(/\s/g, "");

          if (!cleanValue) {
            return "密码不能为空";
          }
          if (cleanValue.length < 6 || cleanValue.length > 10) {
            return "密码长度必须介于 6 和 10 之间";
          }
          return true;
        },
      }
    );
    const cleanPassword = newPassword.replace(/\s/g, "");
    await resetMemberPwd(userId, newPassword);
    ElMessage.success("密码重置成功");
    fetchDepartments();
  } catch (error) {
    Promise.reject(error);
  }
};
// 过滤空格
const filterSpace = (field) => {
  newDepartment[field] = newDepartment[field].replace(/\s+/g, "");
};

// 获取部门列表
const fetchDepartments = async () => {
  try {
    const response = await listDepartment();
    const listData = response.rows || [];
    // console.log("获取部门列表成功:", listData);

    departments.value = listData.map((item) => ({
      departmentId: item.departmentId,
      departmentName: item.departmentName,
      departmentAccount: item.departmentAccount || "",
      userId: item.userId,
      status: item.status,
      createTime: item.createTime,
      updateTime: item.updateTime,
      deptMemberCount: item.deptMemberCount,
    }));
  } catch (error) {
    // console.error("获取部门列表失败:", error);
  }
};
onMounted(() => {
  fetchDepartments();
});

// // 组件激活时重新加载数据（解决 keep-alive 缓存导致的空白问题）
// onActivated(() => {
//   fetchDepartments();
// });

// 根据选择状态过滤部门列表
const filteredDepartments = computed(() => {
  const filtered = selectedDepartment.value === "all" || selectedDepartment.value === ""
    ? departments.value
    : departments.value.filter(
        (dept) => dept.departmentId === selectedDepartment.value
      );
  
  // 按成员数量从多到少排序
  return filtered.sort((a, b) => {
    const countA = Number(a.deptMemberCount) || 0;
    const countB = Number(b.deptMemberCount) || 0;
    return countB - countA;
  });
});

// 显示当前页数据
const pageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredDepartments.value.slice(start, end);
});

const handleCurrentChange = (value) => {
  currentPage.value = value;
};

// 添加部门相关,对话框的显示状态
const addDialogVisible = ref(false);
// 添加表单引用
const addFormRef = ref();
const newDepartment = reactive({
  departmentName: "",
  departmentAccount: "",
  departmentPassword: "",
  confirmPassword: "",
});

const openAddDialog = () => {
  // 重置表单
  Object.assign(newDepartment, {
    departmentName: "",
    departmentAccount: "",
    departmentPassword: "",
    confirmPassword: "",
  });
  // 清除表单校验结果
  if (addFormRef.value) {
    addFormRef.value.resetFields();
  }
  addDialogVisible.value = true;
};

const addOrgDepartment = () => {
  addFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 表单校验通过，执行添加逻辑
        // console.log("@@@:", newDepartment);
        const response = await addDepartment({
          departmentName: newDepartment.departmentName,
          account: newDepartment.departmentAccount,
          password: newDepartment.departmentPassword,
        });
        // console.log("添加部门:", response);
        ElMessage.success("部门添加成功");
        addDialogVisible.value = false;
        fetchDepartments(); // 重新获取部门列表
      } catch (error) {
        // console.error("添加部门失败:", error);
        ElMessage.error("部门添加失败: " + (error.message || "未知错误"));
      }
    } else {
      // 表单校验不通过
      ElMessage.error("请正确填写表单信息");
      return false;
    }
  });
};

// 修改部门
const EditDialog = async (departmentId, departmentName) => {
  try {
    const { value: newDeptName } = await ElMessageBox.prompt(
      "请输入新的部门名称:",
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputValue: departmentName,
      }
    );
    await updateDepartment({ departmentId, departmentName: newDeptName });
    // console.log("部门修改成功", departmentId, newDeptName);
    ElMessage.success("部门修改成功");
    fetchDepartments(); // 重新获取部门列表
  } catch (error) {
    Promise.reject(error);
  }
};

// 批量删除
const multipleSelection = ref([]); //选中的行数据
// 监听选中变化
const handleSelectionChange = (val) => {
  multipleSelection.value = val;
};

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${multipleSelection.value.length} 条记录吗？`,
      "提示",
      { type: "warning" }
    );

    const id = multipleSelection.value.map((item) => item.departmentId);
    const userId = multipleSelection.value.map((item) => item.userId);
    const filterData = ref([]);
    filterData.value = multipleSelection.value.map((item) => ({
      deptId: item.departmentId,
      userId: item.userId,
    }));
    // console.log("批量删除数据", filterData.value);
    await delDepartment(filterData.value);

    ElMessage.success("批量删除成功");
    fetchDepartments(); // 重新加载表格数据
  } catch (err) {
    // console.log(err);
  }
};

// 删除部门
const deleteDepartment = async (id, userId) => {
  try {
    await ElMessageBox.confirm(`是否删除部门编号为"${id}"的组织?`, "系统提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    const data = [
      {
        deptId: id,
        userId,
      },
    ];
    await delDepartment(data);
    // console.log("删除部门ID:", id);
    ElMessage.success("部门删除成功");
    fetchDepartments(); // 重新获取部门列表
  } catch (error) {
    // 用户取消或删除失败
    // console.log("删除操作已取消或失败:", error);
  }
};

// 过滤选项
const filteredOptions = computed(() => {
  if (!filterText.value) {
    return departments.value;
  }

  const searchText = filterText.value.toLowerCase();
  return departments.value.filter((dept) =>
    dept.departmentName.toLowerCase().includes(searchText)
  );
});

// 自定义过滤方法
const filterMethod = (query) => {
  filterText.value = query;
  // 当搜索条件改变时，重置到第一页
  currentPage.value = 1;
  fetchDepartments();
};

// 高亮匹配文本
const highlightMatch = (text, query) => {
  if (!query) return text;

  const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
  return text.replace(
    regex,
    '<span style="color: #409EFF; font-weight: bold;">$1</span>'
  );
};

// 转义正则表达式特殊字符
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
</script>

<style lang="scss" scoped>
.department-management {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  font-family: "Arial", sans-serif;
  color: #333;
  // 控制栏样式
  .department-controls {
    margin-bottom: 30px;
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 20px;

    .select-container {
      flex-grow: 1;
    }
  }
  // 部门列表样式
  .department-list {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    .table-container {
      overflow-x: auto;
      :deep(.el-table__cell) {
        text-align: center;
      }
    }
  }
  // 批量添加弹窗样式
  :deep(.batch-add-dialog) {
    // 下载模块样式
    .download-container {
      display: flex;
      flex-direction: column;
      margin-top: 10px;
      width: 100px;
      // background-color: pink;
      .download-link,
      .download-btn {
        font-size: 12px;
        text-decoration: underline;
        color: #0066cc;
        .download-icon {
          vertical-align: middle;
          font-size: 14px;
        }
      }
    }
    // 上传模块样式
    .file-upload {
      margin-top: 5px;
      .upload-text {
        span {
          color: #409eff;
        }
      }
    }
    
    // 导入状态容器样式（简化版本，不再显示进度条）
    .import-status-container {
      margin: 20px 0;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
      text-align: center;
      
      .status-message {
        color: #333;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
}

// 表格样式
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

th,
td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

th {
  background-color: #f5f5f5;
  font-weight: bold;
  color: #424242;
}

tbody tr:hover {
  background-color: #f5f5f5;
}

// 状态标签样式
.status {
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;

  &.active {
    color: #4caf50;
    background-color: #e8f5e9;
  }

  &.inactive {
    color: #f44336;
    background-color: #ffebee;
  }
}

// 分页样式

.cell {
  text-align: center;
}

// 工具提示按钮样式
.el-tooltip__trigger {
  border: none;
  background: transparent;
}

// 弹窗
:deep(.el-dialog__header) {
  height: 32px;
  margin-bottom: 10px;
  margin-right: 0;
  padding: 5px 0 0 10px;
  background-color: #eee;
  .el-dialog__headerbtn {
    top: -9px;
  }
}

// 对话框样式
:deep(.el-dialog__body) {
  margin-top: -40px;
  .el-form--label-right {
    margin-top: 20px;
  }
}

.dialog-message {
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
  font-weight: bold;

  .department-name {
    font-weight: bold;
    color: #409eff;
  }
}

// 图标样式
:deep(.el-icon) {
  svg {
    color: #409eff;

    &:hover {
      color: #9fceff;
    }
  }
}

// 表单样式
.form-item {
  margin: 15px 0 0 -20px;
}

.password-input {
  margin-left: 15px;
}

.el-table--fit {
  :deep(.el-table__header-wrapper) {
    :deep(.el-table__header) {
      width: 1315px !important;
    }
  }
}

:deep(.el-table__body-wrapper) {
  :deep(.el-table__body) {
    width: 1305px;
  }
}
</style>
