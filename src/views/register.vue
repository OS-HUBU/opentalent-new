<template>
  <div class="register-container">
    <div class="register-section">
      <div class="register-card">
        <!-- 移除tabs组件，直接根据registerType显示对应表单 -->
        <!-- 个人注册表单 -->
        <el-form v-if="registerType === 'personal'" ref="personalRegisterRef" :model="personalForm" :rules="personalRules" class="register-form">
          <h3 class="title">个人注册</h3>
          <el-form-item label="账号名称" prop="account">
            <el-input 
              v-model="personalForm.account" 
              type="text" 
              size="large" 
              auto-complete="off" 
              placeholder="请输入账号"
            />
          </el-form-item>
          <el-form-item label="联系邮箱" prop="contactEmail">
            <el-input 
              v-model="personalForm.contactEmail" 
              type="email" 
              size="large" 
              auto-complete="off" 
              placeholder="请输入联系邮箱"
            />
          </el-form-item>
          <el-form-item label="地址" prop="location">
            <el-tree-select
              v-model="personalForm.region"
              :data="regionTreeData"
              placeholder="请选择地区"
              :props="{ children: 'children', label: 'fullPath', value: 'id' }"
              @change="handleRegionChange"
              clearable
              :render-after-expand="false"
              check-strictly
            >
              <template #default="{ data }">
                {{ data.name }}
              </template>
            </el-tree-select>
          </el-form-item>
          <el-form-item label="性别" prop="sex">
            <el-radio-group v-model="personalForm.sex" size="large">
              <el-radio label="男">男</el-radio>
              <el-radio label="女">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="出生年月" prop="birthDate">
            <el-date-picker
              v-model="personalForm.birthDate"
              type="date"
              placeholder="请选择出生日期"
              size="large"
              style="width: 100%;"
              :disabled-date="(time) => time.getTime() > Date.now()"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item label="输入密码" prop="password">
            <el-input
              v-model="personalForm.password"
              type="password"
              size="large"
              auto-complete="off"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="personalForm.confirmPassword"
              type="password"
              size="large"
              auto-complete="off"
              placeholder="请再次输入密码"
              show-password
            />
          </el-form-item>
          <el-form-item style="width:100%;">
            <el-button
              :loading="personalLoading"
              size="large"
              type="primary"
              class="login-button"
              style="width:100%;"
              @click.prevent="handlePersonalRegister"
            >
              <span v-if="!personalLoading">立即注册</span>
              <span v-else>注册中...</span>
            </el-button>
            <div style="float: right; margin-top: 16px;">
              <a href="#" @click.prevent="goToLogin" class="link-type">已有账户？立即登录</a>
            </div>
          </el-form-item>
        </el-form>

        <!-- 组织注册表单 -->
        <el-form v-if="registerType === 'org'" ref="registerRef" :model="registerForm" :rules="registerRules" class="register-form">
          <h3 class="title">组织注册</h3>

          <el-form-item label="组织名称" prop="orgName">
            <el-input 
              v-model="registerForm.orgName" 
              type="text" 
              size="large" 
              auto-complete="off" 
              placeholder="请输入组织名称"
            />
          </el-form-item>

          <el-form-item label="组织介绍" prop="orgIntroduction">
            <el-input 
              v-model="registerForm.orgIntroduction" 
              type="text" 
              size="large" 
              auto-complete="off" 
              placeholder="请输入组织介绍"
            />
          </el-form-item>

          <el-form-item label="联系邮箱" prop="contactEmail">
            <el-input 
              v-model="registerForm.contactEmail" 
              type="email" 
              size="large" 
              auto-complete="off" 
              placeholder="请输入联系邮箱"
            />
          </el-form-item>

          <el-form-item label="地址" prop="address">
            <el-tree-select
              v-model="registerForm.region"
              :data="regionTreeData"
              placeholder="请选择地区"
              :props="{ children: 'children', label: 'fullPath', value: 'id' }"
              @change="handleRegionChange"
              clearable
              :render-after-expand="false"
              check-strictly
            >
              <template #default="{ data }">
                {{ data.name }}
              </template>
            </el-tree-select>
          </el-form-item>

          <el-form-item label="输入密码" prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              size="large"
              auto-complete="off"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>

          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              size="large"
              auto-complete="off"
              placeholder="请再次输入密码"
              show-password
            />
          </el-form-item>

          <el-form-item label="组织类型" prop="orgType">
            <el-radio-group v-model="registerForm.orgType" @change="handleOrgTypeChange">
              <el-radio label="高校/科研院所">高校/科研院所</el-radio>
              <el-radio label="企业">企业</el-radio>
              <el-radio label="开源团队">开源团队</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="项目范围" prop="projectScope">
            <el-radio-group v-model="registerForm.projectScope" class="long-text">
              <el-radio label="开源项目">开源项目</el-radio>
              <el-radio label="国家重点发展项目" disabled>国家重点发展项目</el-radio>
              <el-radio label="全球影响力排名前10000项目" disabled>全球影响力排名前10000项目</el-radio>
              <el-radio label="CCF开源项目" disabled>CCF开源项目</el-radio>
              <el-radio label="个性化定制" disabled>个性化定制</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="平台权重" prop="platformWeight">
            <el-radio-group v-model="registerForm.platformWeight" class="long-text">
              <el-radio label="全球化模式（GitHub,Gitee,Atomgit）：1:0:0">全球化模式（GitHub,Gitee,Atomgit）：1:0:0</el-radio>
              <el-radio label="中国优先模式（Gitee,Atomgit,GitHub）：2:2:1" disabled>中国优先模式（Gitee,Atomgit,GitHub）：2:2:1</el-radio>
              <el-radio label="基金会优先模式（Atomgit,Gitee,GitHub）：5:3:2" disabled>基金会优先模式（Atomgit,Gitee,GitHub）：5:3:2</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="评价模型" prop="evaluateModel">
            <el-radio-group v-model="registerForm.evaluateModel" class="long-text">
              <el-radio label="工信部标准院标准：网络模型">工信部标准院标准：网络模型</el-radio>
              <el-radio label="工信标准院标准：统计模型" disabled>工信标准院标准：统计模型</el-radio>
              <el-radio label="个性化定制" disabled>个性化定制</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="分析报告" prop="reportType">
            <el-radio-group v-model="registerForm.reportType">
              <el-radio label="普通版">普通版</el-radio>
              <el-radio label="专业版" disabled>专业版</el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 以下为组织实名认证字段 -->
          <el-form-item label="组织注册人姓名" prop="realName">
            <el-input
              v-model="registerForm.realName"
              size="large"
              auto-complete="off"
              :placeholder="formConfig.realNamePlaceholder"
            />
          </el-form-item>

          <el-form-item label="组织凭证类型" prop="idType">
            <el-select v-model="registerForm.idType" placeholder="请选择组织凭证类型" :loading="idTypesLoading" size="large" style="width: 100%;">
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
              v-model="registerForm.idNumber"
              size="large"
              auto-complete="off"
              :placeholder="formConfig.idNumberPlaceholder"
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

          <!-- 提交按钮 -->
          <el-form-item style="width:100%;">
            <el-button
              :loading="loading"
              size="large"
              type="primary"
              class="login-button"
              style="width:100%;"
              @click.prevent="handleOrgRegister"
            >
              <span v-if="!loading">立即注册</span>
              <span v-else>注册中...</span>
            </el-button>
            <div style="float: right; margin-top: 16px;">
              <a href="#" @click.prevent="goToLogin" class="link-type">已有账户？立即登录</a>
            </div>
          </el-form-item>
        </el-form>
        <div class="el-register-footer">
          <span>Copyright © 2024 OpenTalent. All Rights Reserved.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox } from "element-plus";
import { registerOrganization, registerFreelancer, getRegionTree } from "@/api/register";
import { getIdTypesByOrgType, getFormConfigByOrgType } from "@/api/organization/organization";
import { ref, onMounted, getCurrentInstance, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const { proxy } = getCurrentInstance();

// 根据router state设置默认注册类型
const registerType = ref('personal');
const userRole = ref('freelancer');

// 初始化函数，从query参数获取type参数
const initRegisterType = () => {
  const type = route.query?.type;
  return type || 'personal';
};

// 监听路由变化，从query参数获取参数
watch(route, () => {
  const type = route.query?.type;
  registerType.value = type || 'personal';
  userRole.value = type === 'org' ? 'orgadmin' : 'freelancer';
}, { immediate: true });

// 初始化注册类型
registerType.value = initRegisterType();
userRole.value = registerType.value === 'org' ? 'orgadmin' : 'freelancer';

// 确保registerType用于控制显示个人或组织注册表单
const personalForm = ref({
  account: "",
  contactEmail: "",
  location: "",
  region: "",
  sex: "",
  birthDate: "",
  password: "",
  confirmPassword: ""
});

const registerForm = ref({
  // —— 组织基本信息 ——
  orgName: "",             // 组织名称
  orgIntroduction: "",     // 组织简介
  contactEmail: "",        // 联系邮箱
  address: "",             // 地区完整路径（如“中国湖北省武汉市”）
  region: "",       // 选中的地区 ID，供 el-tree-select 使用

  // —— 分类信息 ——
  orgType: "高校/科研院所",              // 组织类型
  projectScope: "开源项目",              // 项目范围
  platformWeight: "全球化模式（GitHub,Gitee,Atomgit）：1:0:0",   // 平台权重模式
  evaluateModel: "工信部标准院标准：网络模型",  // 评估模型类型
  reportType: "普通版",                 // 报告类型

  // —— 登录密码字段 ——
  password: "",
  confirmPassword: "",

  // —— 实名认证字段 ——
  realName: "",                   // 法人或负责人真实姓名
  idNumber: "",                   // 证件号码
  idType: "",                     // 证件类型（动态选择）
  idCardFront: null               // 证件正面图像（二进制或File对象）
});



const datePickerOptions = {
  disabledDate(time) {
    return time.getTime() > Date.now();
  }
};

// 个人注册表单校验密码一致性
const equalToPersonalPassword = (rule, value, callback) => {
  if (personalForm.value.password !== value) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

// 组织注册表单校验密码一致性
const equalToPassword = (rule, value, callback) => {
  if (registerForm.value.password !== value) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

// 个人注册表单校验规则
const personalRules = {
  username: [
    { required: true, trigger: "blur", message: "请输入用户名称" }
  ],
  contactEmail: [
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  location: [
    { 
      required: true, 
      trigger: "change", 
      validator: (rule, value, callback) => {
        if (!value || value.trim() === '') {
          callback(new Error('请选择地区'));
        } else {
          callback();
        }
      }
    }
  ],
  sex: [
    { required: true, trigger: "change", message: "请选择性别" }
  ],
  birthDate: [
    { required: true, trigger: "change", message: "请选择出生日期" }
  ],
  password: [
    { required: true, trigger: "blur", message: "请输入密码" },
    { min: 5, max: 20, message: "密码长度必须介于 5 和 20 之间", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, trigger: "blur", message: "请再次输入密码" },
    { validator: equalToPersonalPassword, trigger: "blur" }
  ]
};

// 组织注册表单校验规则
const registerRules = {
  orgName: [
    { required: true, trigger: "blur", message: "请输入组织名称" }
  ],
  orgIntroduction: [
    { required: true, trigger: "blur", message: "请输入组织介绍" }
  ],
  contactEmail: [
    { type: "email", message: "请输入有效的邮箱地址", trigger: "blur" }
  ],
  address: [
    { 
      required: true, 
      trigger: "change", 
      validator: (rule, value, callback) => {
        if (!value || value.trim() === '') {
          callback(new Error('请选择地区'));
        } else {
          callback();
        }
      }
    }
  ],
  orgType: [
     { required: true, trigger: "change", message: "请选择组织类型" }
   ],
   idType: [
     { required: true, trigger: "change", message: "请选择组织凭证类型" }
   ],
  password: [
    { required: true, trigger: "blur", message: "请输入密码" },
    { min: 5, max: 20, message: "密码长度必须介于 5 和 20 之间", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, trigger: "blur", message: "请再次输入密码" },
    { validator: equalToPassword, trigger: "blur" }
  ],
  realName: [
    { required: true, trigger: "blur", message: "请输入注册人姓名" }
  ],
  idType: [
    { required: true, trigger: "change", message: "请选择组织凭证类型" }
  ],
  idNumber: [
    { 
      validator: (rule, value, callback) => {
        if (!value || value.trim() === '') {
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
        if (!value || value.trim() === '') {
          callback(new Error('请上传组织凭证照片'));
        } else {
          callback();
        }
      }, 
      trigger: "change" 
    }
  ]
};

const loading = ref(false);
const personalLoading = ref(false);

// 动态凭证类型相关
const idTypesList = ref([]);
const idTypesLoading = ref(false);
const formConfig = ref({
  realNamePlaceholder: '请输入组织注册人姓名：',
  idNumberPlaceholder: '请输入组织凭证编号：'
});

// 组织凭证，文件上传状态
const fileList = ref([]);
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
    
    registerForm.value.idCardFront = base64String;
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
  registerForm.value.idCardFront = null;
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

// 组织注册提交
function handleOrgRegister() {
  proxy.$refs.registerRef.validate(valid => {
    if (valid) {
      loading.value = true;
      // 准备提交数据，移除region字段（仅用于UI选择）
      const submitData = { ...registerForm.value };
      delete submitData.region;
      
      // 调用组织注册接口
      registerOrganization(submitData).then(res => {
        proxy.$modal.msgSuccess("组织注册成功，请等待系统管理员审核！");
        router.push({
          path: '/login',
          query: { userRole: 'orgadmin'}
        });
      }).catch(() => {
        loading.value = false;
      });
    }
  });
}

// 个人注册提交
function handlePersonalRegister() {
  proxy.$refs.personalRegisterRef.validate(valid => {
    if (valid) {
      personalLoading.value = true;
      // 准备提交数据，移除region字段（仅用于UI选择）
      const submitData = { ...personalForm.value };
      delete submitData.region;
      
      // 调用自由职业者注册接口
      registerFreelancer(submitData).then(res => {
        ElMessageBox.alert("<font color='red'>恭喜你，个人注册成功！</font>", "系统提示", {
          dangerouslyUseHTMLString: true,
          type: "success",
        }).then(() => {
          router.push({
            path: '/login',
            query: { userRole: 'freelancer'}
          });
        }).catch(() => {});
      }).catch(() => {
        personalLoading.value = false;
      });
    }
  });
}

function goToLogin() {
  // 使用query参数传递userRole参数
  router.push({
    path: '/login',
    query: { userRole: userRole.value, _t: Date.now() }
  });
}

const regionTreeData = ref([]);

// 递归构建地区树，并为每个节点添加完整路径信息
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

// 加载地区数据
const loadRegionData = () => {
  getRegionTree().then(res => {
    regionTreeData.value = buildRegionTreeWithPath(res.data);
    //console.log('处理后的地区数据:', regionTreeData.value);
  }).catch(error => {
    regionTreeData.value = [];
    //console.debug('地区数据获取失败:', error.message);
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
    node.name = node.originalName; // 使用原始名称而不是displayLabel
    if (node.children && node.children.length > 0) {
      resetAllNodeLabels(node.children);
    }
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
        registerForm.value.idType = response.data[0].idTypeCode;
      }
    } else {
      idTypesList.value = [];
      proxy.$modal.msgWarning(response.msg || '该组织类型没有适用的证件类型');
    }
  } catch (error) {
    console.error('获取证件类型失败:', error);
    idTypesList.value = [];
    proxy.$modal.msgError('获取证件类型失败，请稍后重试');
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
        realNamePlaceholder: response.data.realNamePlaceholder || '请输入组织注册人姓名：',
        idNumberPlaceholder: response.data.idNumberPlaceholder || '请输入组织凭证编号：'
      };
    }
  } catch (error) {
    console.error('获取表单配置失败:', error);
    // 使用默认配置
    formConfig.value = {
      realNamePlaceholder: '请输入组织注册人姓名：',
      idNumberPlaceholder: '请输入组织凭证编号：'
    };
  }
};

// 处理组织类型变化
const handleOrgTypeChange = (orgType) => {
  console.log('组织类型变化:', orgType);
  
  if (orgType) {
    // 清空之前选择的证件类型
    registerForm.value.idType = '';
    
    // 并行加载证件类型列表和表单配置
    Promise.all([
      loadIdTypesByOrgType(orgType),
      loadFormConfigByOrgType(orgType)
    ]).catch(error => {
      console.error('加载组织类型相关配置失败:', error);
    });
  } else {
    // 清空相关数据
    idTypesList.value = [];
    registerForm.value.idType = '';
    formConfig.value = {
      realNamePlaceholder: '请输入组织注册人姓名：',
      idNumberPlaceholder: '请输入组织凭证编号：'
    };
  }
};

const handleRegionChange = (regionId) => {
  //console.log('选择的地区ID:', regionId);
  
  if (!regionId) {
    // 清空选择时只清空地址，不修改树形结构
    if (registerType.value === 'personal') {
      personalForm.value.location = '';
    } else if (registerType.value === 'org') {
      registerForm.value.address = '';
    }
    return;
  }
  
  // 查找选中节点的完整路径
  const pathNodes = findNodePath(regionTreeData.value, regionId);
  //console.log('找到的路径节点:', pathNodes);
  
  if (pathNodes) {
    // 使用originalName构建完整地址字符串，确保使用原始名称
    const fullAddress = pathNodes.map(node => node.originalName).join('');
    //console.log('完整地址:', fullAddress);
    
    // 更新表单中的地址字段
    if (registerType.value === 'personal') {
      personalForm.value.location = fullAddress;
      //console.log('设置个人地址:', personalForm.value.location);
    } else if (registerType.value === 'org') {
      registerForm.value.address = fullAddress;
      //console.log('设置组织地址:', registerForm.value.address);
    }
  }
};




onMounted(() => {
  // 个人注册和组织注册都需要加载地区数据
  loadRegionData();
  
  // 如果是组织注册，初始化加载默认组织类型对应的凭证类型和表单配置
  if (registerType.value === 'org' && registerForm.value.orgType) {
    handleOrgTypeChange(registerForm.value.orgType);
  }
});

// 监听注册类型变化，确保地区数据已加载
watch(registerType, () => {
  if (regionTreeData.value.length === 0) {
    loadRegionData();
  }
});
</script>

<style lang='scss' scoped>
@import '@/assets/styles/register.scss';
</style>