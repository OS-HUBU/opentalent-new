<template>
  <div class="app-container">
    <!-- 关闭按钮 -->
    <div class="dialog-close-btn" @click="handleCloseDialog">
      <el-icon>
        <Close />
      </el-icon>
    </div>

    <div class="form-layout">
      <!-- 实名认证信息表单展示 -->
      <el-card class="verification-card form-column">
        <template #header>
          <div class="card-header">
            <span>实名认证状态</span>
            <el-tag :type="verificationStatusTag.type" style="font-size: 16px;">
              {{ verificationStatusTag.text }}
            </el-tag>
          </div>
        </template>

        <div v-loading="verificationLoading" element-loading-text="加载实名认证信息...">
          <el-alert v-if="!isVerified" title="您尚未完成实名认证" description="请提交实名认证信息以使用完整功能" type="warning" show-icon
            :closable="false" class="verification-alert" />

          <el-form ref="verificationFormRef" :model="verificationForm" :rules="verificationRules" label-width="120px"
            class="verification-form" :disabled="isDisabled">
            <el-form-item label="真实姓名" prop="realName" :disabled="isDisabled">
              <el-input v-model="verificationForm.realName" placeholder="请输入真实姓名" />
            </el-form-item>
            <el-form-item label="证件类型" prop="idType" :disabled="isDisabled">
              <el-select v-model="verificationForm.idType" placeholder="请选择证件类型">
                <el-option v-for="type in credentialTypeList" :key="type.idTypeCode" :label="type.idTypeName"
                  :value="type.idTypeCode" />
              </el-select>
            </el-form-item>
            <el-form-item label="证件号码" prop="idNumber" :disabled="isDisabled">
              <el-input v-model="verificationForm.idNumber" placeholder="请输入证件号码" />
            </el-form-item>

            <el-form-item label="证件正面" prop="idCardFront" :disabled="isDisabled">
              <el-upload class="id-card-upload" action="#" :http-request="(params) => handleUpload(params, 'front')"
                :show-file-list="false" :before-upload="beforeUpload">
                <img v-if="verificationForm.idCardFront" :src="verificationForm.idCardFront" class="id-card-img" />
                <div v-else class="id-card-placeholder">
                  <el-icon>
                    <Camera />
                  </el-icon>
                  <span>点击上传证件正面</span>
                </div>
              </el-upload>
            </el-form-item>

            <el-form-item label="证件背面" prop="idCardBack" v-if="!isSingleCardImage" :disabled="isDisabled">
              <el-upload class="id-card-upload" action="#" :http-request="(params) => handleUpload(params, 'back')"
                :show-file-list="false" :before-upload="beforeUpload">
                <img v-if="verificationForm.idCardBack" :src="verificationForm.idCardBack" class="id-card-img" />
                <div v-else class="id-card-placeholder">
                  <el-icon>
                    <Camera />
                  </el-icon>
                  <span>点击上传证件背面</span>
                </div>
              </el-upload>
            </el-form-item>
          </el-form>
          <el-form-item>
            <div>
              <!-- 未提交状态显示提交按钮  -->
              <el-button v-if="!isVerified" type="primary" :loading="submitting" @click="SubmitVerification"
                class="submit-btn">提交认证</el-button>
              <!-- 已驳回状态显示编辑按钮 可编辑状态 -->
              <el-button v-if="isRejected" type="primary" @click="resetForm" class="reset-btn">重新编辑</el-button>
            </div>
          </el-form-item>
        </div>
      </el-card>

      <!-- 账号绑定表单 -->
      <el-card class="account-card form-column">
        <template #header>
          <div class="card-header">
            <span>账号绑定</span>
          </div>
        </template>
        <div class="account-desc modern-tip">
          <div class="tip-header">
            <el-icon class="shield-icon">
              <User />
            </el-icon>
            <span class="tip-title">账号绑定提示</span>
          </div>
          <p class="tip-content">
            <strong>添加账号</strong> 系统支持关联多个第三方平台账号，每个平台仅允许绑定一个账户。<br>
            <strong>提交绑定</strong> 请务必准确填写相关信息，以便我们能够验证和保护您的账户。<br>
          </p>
        </div>


        <div class="account-form-container">
          <el-form ref="addAccountRef" :model="addAccount" :rules="accountRules" label-width="120px"
            class="account-form">

            <div v-for="(item, index) in addAccount.accounts" :key="index" class="account-item">
              <div class="account-item-row">
                <el-form-item label="平台名称" :prop="`accounts[${index}].platform`" :rules="accountRules.platform"
                  class="account-form-item">
                  <el-select v-model="item.platform" placeholder="请选择平台">
                    <el-option v-for="platform in platformList" :key="platform.platformId"
                      :label="platform.platformName" :value="platform.platformId" />
                  </el-select>
                </el-form-item>

                <el-form-item label="平台用户名" :prop="`accounts[${index}].account`" :rules="accountRules.account"
                  class="account-form-item">
                  <el-input v-model="item.account" placeholder="请输入平台用户名" />
                </el-form-item>

                <el-button v-if="addAccount.accounts.length > 1" type="danger" icon="CircleCloseFilled"
                  @click="removeAccountItem(index)" class="delete-account-btn" size="small">
                  删除
                </el-button>
              </div>
            </div>

            <el-form-item class="add-account-item">
              <el-button type="primary" icon="CirclePlusFilled" @click="addAccountItem" class="add-account-btn">
                添加账号
              </el-button>
              <el-button type="success" :loading="addLoading" @click="submitAccountBinding" class="submit-account-btn">
                提交绑定
              </el-button>
            </el-form-item>

          </el-form>
        </div>

        <div class="bound-account-section">
          <h4 class="bound-account-title">已绑定账号</h4>
          <div v-loading="accountLoading" element-loading-text="加载账号信息..." class="bound-account-list">
            <div v-for="(item, index) in accountList" :key="index" class="bound-account-item">
              <!-- 平台图标 -->
              <div :class="`platform-icon platform-icon--${item.platformId}`">
                <span class="icon-text">{{ getPlatformName(item.platformId)?.charAt(0) || '平' }}</span>
              </div>
              <!-- 平台名称和账号 -->
              <div class="account-info">
                <p class="platform-name">{{ getPlatformName(item.platformId) }}</p>
                <p class="account-username">{{ item.platformUsername }}</p>
              </div>
              <!-- 解绑按钮 -->
              <el-button type="danger" icon="Remove" @click="unbindAccount(index)">
                解绑
              </el-button>
            </div>
            <!-- 无绑定账号提示 -->
            <div class="no-account-tip" v-if="accountList.length === 0">
              <p>暂无绑定账号</p>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, getCurrentInstance } from 'vue'
import { ElMessage } from 'element-plus'
import { Camera, CircleCloseFilled, CirclePlusFilled, Close, InfoFilled, Warning, User } from '@element-plus/icons-vue'
import { submitVerification } from '@/api/verify/verify'
import { getUserDetail, addUserPlatform, getUserPlatformList, deleteUserPlatform, checkUserPlatform, getPlatformList, getCredentialTypeListForFreelancer, getCredentialTypeListForOrgmember } from '@/api/userinfo/userinfo'
const emit = defineEmits(['refresh', 'close'])
const { proxy } = getCurrentInstance()


const submitting = ref(false) //提交认证加载状态
const verificationFormRef = ref(null)
const addAccountRef = ref(null)
const verificationLoading = ref(false) // 实名认证数据加载状态
const accountLoading = ref(false) // 账号数据加载状态
const accountList = ref([])  // 已绑定账号列表
const platformList = ref([]) // 平台名称列表
const addLoading = ref(false) // 添加账号按钮加载状态
const credentialTypeList = ref([])  // 证件类型列表
const addAccount = reactive({
  accounts: [
    {
      platform: '',
      account: ''
    }
  ]
});

const props = defineProps({
  preloadedData: {
    type: Object,
    default: () => ({})
  },
  userId: {
    type: Number,
    default: () => { }
  },
  roleGroup: {
    type: String,
    default: () => { }
  }
})


// 认证状态文本和类型映射
const statusMap = {
  '未提交': { text: '未提交', type: 'warning' },
  'pending': { text: '待审核', type: 'info' },
  'approved': { text: '已通过', type: 'success' },
  'rejected': { text: '已驳回', type: 'danger' },
  '未知状态': { text: '未知状态', type: 'info' } // 默认未知状态样式
};

// 实名认证信息表单
const verificationForm = reactive({
  idCardBack: null,
  idCardFront: null,
  idNumber: '',
  idType: '',
  realName: '',
  status: '',
  verified: false,
  // 存储文件对象用于提交
  idCardFrontFile: null,
  idCardBackFile: null
})

// 表单验证规则
const verificationRules = {
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  idType: [
    { required: true, message: '请选择证件类型', trigger: 'change' }
  ],
  idNumber: [
    { required: true, message: '请输入证件号码', trigger: 'blur' }
  ],
  idCardFront: [
    { required: true, message: '请上传证件正面照片', trigger: 'change' }
  ],
  idCardBack: [
    { required: true, message: '请上传证件背面照片', trigger: 'change' }
  ],
}

// 账号绑定验证规则
const accountRules = {
  platform: [
    { required: true, message: '请选择平台名称', trigger: 'change' }
  ],
  account: [
    { required: true, message: '请输入账号用户名', trigger: 'blur' },
    { min: 2, max: 50, message: '用户名长度在 2 到 50 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_-]+$/, message: '用户名只能包含字母、数字、下划线和连字符', trigger: 'blur' }
  ]
}

// 计算认证状态标签
const verificationStatusTag = computed(() => {
  const status = verificationForm.status || '未提交'
  // 如果状态不在映射中，显示未知状态
  return statusMap[status] || statusMap['未知状态']
})

//检查是否已提交
const isVerified = computed(() => {
  const verified = verificationForm.verified;
  return verified === true;
})

const isRejected = computed(() => {
  return verificationForm.status === 'rejected'
})

// 已通过或待审核时禁用表单,已驳回时需要点击“重新编辑”解除禁用表单
const isDisabled = computed(() => {
  const status = verificationForm.status;
  return status === 'approved' || status === 'pending' || status === 'rejected';
})

// 获取用户实名认证信息
const fetchUserIdentityVerification = async () => {
  verificationLoading.value = true;
  try {
    // 优先使用预加载数据
    if (props.preloadedData && Object.keys(props.preloadedData).length > 0) {
      const verification = props.preloadedData.userIdentityVerificationVo;
      updateFormData(verification);
      return;
    }
    await fetchUserDetail();
  } catch (error) {
    console.error('获取用户实名认证信息失败:', error)
    ElMessage.error('获取用户实名认证信息失败，请重试')
  } finally {
    verificationLoading.value = false;
  }
}

const fetchUserDetail = async () => {
  const response = await getUserDetail();
  if (response.code === 200) {
    const verification = response.data.userIdentityVerificationVo;
    console.log(verification);
    updateFormData(verification);
  } else {
    ElMessage.error(response.msg || '获取用户实名认证信息失败')
  }
}
// 提取实名认证信息表单（便于复用）
const updateFormData = (verification) => {
  verificationForm.verified = verification.verified || false
  verificationForm.status = verification.status || ''
  verificationForm.realName = verification.realName || ''
  verificationForm.idType = verification.idType || ''
  verificationForm.idNumber = verification.idNumber || ''
  verificationForm.idCardFront = verification.idCardFront ? `data:image/jpeg;base64,${verification.idCardFront}` : null
  verificationForm.idCardBack = verification.idCardBack ? `data:image/jpeg;base64,${verification.idCardBack}` : null
}


/** 处理图片压缩和格式转换 */
async function compressAndConvertImage(file, quality = 0.8, format = 'jpeg') {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result
      img.onload = () => {
        // 创建canvas元素用于处理图片
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // 计算压缩后的尺寸（保持比例）
        const maxWidth = 1024
        const maxHeight = 1024
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        // 绘制图片到canvas
        ctx.drawImage(img, 0, 0, width, height)

        // 转换格式并压缩
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('图片处理失败'))
            return
          }
          // 将blob转换为file对象
          const compressedFile = new File([blob],
            `${file.name.split('.')[0]}.${format}`,
            { type: `image/${format}` }
          )
          resolve(compressedFile)
        }, `image/${format}`, quality)
      }
      img.onerror = (error) => reject(error)
    }
    reader.onerror = (error) => reject(error)
  })
}

/** 上传预处理 */
function beforeUpload(file) {
  if (file.type.indexOf("image/") === -1) {
    ElMessage.error("文件格式错误，请上传图片类型,如:JPG,PNG后缀的文件。");
    return false;
  }
  return true;
}


/** 上传处理函数，添加压缩转换逻辑 */
async function handleUpload(params, side) {
  const file = params.file;

  try {
    // 图片预处理：压缩并转换为jpeg格式
    const compressedFile = await compressAndConvertImage(
      file,
      0.7,  // 压缩质量 (0-1之间)
      'jpeg' // 目标格式
    )

    // 显示预览
    const reader = new FileReader();
    reader.readAsDataURL(compressedFile);
    reader.onload = (e) => {
      if (side === 'front') {
        verificationForm.idCardFront = e.target.result;
        verificationForm.idCardFrontFile = compressedFile;
      } else {
        verificationForm.idCardBack = e.target.result;
        verificationForm.idCardBackFile = compressedFile;
      }
      ElMessage.success("上传并处理成功");
    };
  } catch (error) {
    ElMessage.error("图片处理失败，请重新上传");
    console.error('图片处理错误:', error);
  }
}

// 提交实名认证
const SubmitVerification = async () => {
  try {
    // 表单验证
    const isValid = await verificationFormRef.value.validate()
    if (!isValid) {
      return ElMessage.error('请完善表单信息')
    }

    // 确认对话框
    const isConfirmed = await proxy.$modal.confirm(
      "请再次确认实名认证信息是否填写正确！",
      "警告"
    )
    if (!isConfirmed) return

    // 准备表单数据
    const formData = new FormData()
    formData.append('idType', verificationForm.idType)
    formData.append('realName', verificationForm.realName)
    formData.append('idNumber', verificationForm.idNumber)
    formData.append('idCardFront', verificationForm.idCardFrontFile)
    formData.append('idCardBack', verificationForm.idCardBackFile)

    // 提交请求
    submitting.value = true
    const response = await submitVerification(formData)

    if (response.code === 200) {
      emit('refresh') // 通知父组件刷新
      verificationLoading.value = true
      await fetchUserDetail()
    } else {
      ElMessage.error(response.msg || '提交失败')
    }
  } catch (error) {
    console.error('提交实名认证失败:', error)
    if (error.message !== 'cancel') { 
      ElMessage.error('操作过程中发生错误')
    }
  } finally {
    submitting.value = false
    verificationLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  verificationFormRef.value.resetFields()
  verificationForm.status = "未知状态"
  verificationForm.verified = false
  verificationForm.idCardFront = null
  verificationForm.idCardBack = null
  verificationForm.idCardFrontFile = null
  verificationForm.idCardBackFile = null
}


const fetchAccountList = async () => {
  if (!props.userId) return;
  accountLoading.value = true;
  try {
    const response = await getUserPlatformList(props.userId)
    if (response.code === 200) {
      accountList.value = response.data || []
    } else {
      ElMessage.error(response.msg || '获取账号列表失败')
    }
  } catch (error) {
    console.error('获取账号列表异常:', error)
    ElMessage.error('获取账号列表异常，请重试')
  } finally {
    accountLoading.value = false;
  }
}

// 获取自由职业者证件类型列表
const fetchCredentialTypeListForFreelancer = async () => {
  try {
    const response = await getCredentialTypeListForFreelancer()
    if (response.code === 200) {
      credentialTypeList.value = response.data || []
      console.log('自由职业者证件类型列表:', credentialTypeList.value)
    } else {
      ElMessage.error(response.msg || '获取自由职业者证件类型列表失败')
    }
  } catch (error) {
    console.error('获取自由职业者证件类型列表异常:', error)
    ElMessage.error('获取自由职业者证件类型列表异常，请重试')
  }
}

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
// 获取平台列表
const fetchPlatformList = async () => {
  try {
    const response = await getPlatformList()
    if (response.code === 200) {
      platformList.value = response.data || []
      console.log('平台列表:', platformList.value)
    } else {
      ElMessage.error(response.msg || '获取平台列表失败')
    }
  } catch (error) {
    console.error('获取平台列表异常:', error)
    ElMessage.error('获取平台列表异常，请重试')
  }
}

// 获取平台名称
const getPlatformName = (platformId) => {
  const platform = platformList.value.find(p => p.platformId === platformId)
  return platform ? platform.platformName : '未知平台'
}

// 添加获取平台图标文本的函数
const getPlatformIconText = (platformId) => {
  const platform = platformList.value.find(p => p.platformId === platformId)
  if (!platform) return '平'
  // 返回平台名称的首个字符
  return platform.platformName?.charAt(0) || '平'
}


// 添加账号项
const addAccountItem = () => {
  addAccount.accounts.push({
    platform: '',
    account: ''
  })
}

// 删除账号项
const removeAccountItem = (index) => {
  if (addAccount.accounts.length > 1) {
    addAccount.accounts.splice(index, 1)
  }
}

// 提交账号绑定
const submitAccountBinding = async () => {
  try {
    const valid = await addAccountRef.value?.validate();
    if (!valid) {
      ElMessage.error('请完善表单信息');
      return;
    }

    // 检查是否有重复的平台选择
    const platforms = addAccount.accounts.map(acc => acc.platform).filter(p => p);
    const uniquePlatforms = [...new Set(platforms)];
    if (platforms.length !== uniquePlatforms.length) {
      ElMessage.error('不能选择重复的平台');
      return;
    }

    addLoading.value = true;


    // 批量提交账号
    const validAccounts = addAccount.accounts.filter(acc => acc.platform && acc.account);
    if (validAccounts.length === 0) {
      ElMessage.error('请至少添加一个有效的账号信息');
      addLoading.value = false;
      return;
    }

    const promises = validAccounts.map(account =>
      addUserPlatform({
        platformId: account.platform,
        platformUsername: account.account,
        userId: props.userId
      })
    );

    const results = await Promise.all(promises);
    const successCount = results.filter(res => res.code === 200).length;
    const totalCount = results.length;

    if (successCount === totalCount) {
      ElMessage.success(`成功绑定 ${successCount} 个账号`);
      // 重置表单
      addAccount.accounts = [{ platform: '', account: '' }];
      // 刷新账号列表
      await fetchAccountList();
    } else if (successCount > 0) {
      ElMessage.warning(`成功绑定 ${successCount} 个账号，${totalCount - successCount} 个失败`);
      await fetchAccountList();
    } else {
      ElMessage.error('所有账号绑定失败，请检查网络连接或重试');
    }
  } catch (error) {
    console.error('账号绑定失败:', error);
    // ElMessage.error('账号绑定失败，请重试');
  } finally {
    addLoading.value = false;
  }
}

// 解绑账号
const unbindAccount = async (index) => {
  const account = accountList.value[index];
  if (!account) return;

  try {
    proxy.$modal.confirm("确定要解除该平台账号的绑定吗？", "警告")
      .then(async () => {
        const res = await deleteUserPlatform(account.recordId);
        if (res.code === 200) {
          proxy.$modal.msgSuccess(res.msg);
          await fetchAccountList();
        }
      })
      .catch(() => { });
  } catch (error) {
    console.error('解绑账号失败:', error);
    proxy.$modal.msgError('解绑账号失败，请重试');
  }
}


// 关闭弹窗
const handleCloseDialog = () => {
  emit('close')
}

// 组件挂载时获取用户信息
onMounted(() => {
  fetchUserIdentityVerification()
  fetchPlatformList()
  if (props.roleGroup == "自由职业者") { fetchCredentialTypeListForFreelancer() }
  else if (props.roleGroup == "组织内部成员") { fetchCredentialTypeListForOrgmember() }
  if (props.userId) {
    fetchAccountList()
  }
})
</script>


<style scoped>
.submit-btn,
.reset-btn {
  display: flex;
  justify-content: center;
  margin-left: 280px;
}

.account-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.platform-icon {
  font-size: 24px;
  color: #333;
}

.app-container {
  width: 100%;
  background-color: #f5f7fa;
  border-radius: 80px;
  margin-top: 20px;
}

/* 关闭按钮样式 */
.dialog-close-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s ease;
  color: white;
  font-size: 18px;
}

.dialog-close-btn:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

.form-layout {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 0 20px;
  width: 100%;
}

.form-column {
  flex: 1;
  min-width: 280px;
}

.form-column:hover {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.12);
}

.verification-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
}

.verification-alert {
  margin-bottom: 20px;
}

.verification-form {
  margin-top: 20px;
}

.id-card-upload {
  width: 200px;
  height: 126px;
  border: 1px dashed #d9d9d9;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.id-card-upload:hover {
  border-color: #409eff;
}

.id-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.id-card-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #8c939d;
}

.id-card-placeholder .el-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.id-card-placeholder span {
  font-size: 12px;
}


/* 右侧账号绑定表单样式*/
.account-card {
  margin-bottom: 20px;
}

/* 账号绑定说明文本 */
.account-desc {
  font-size: 14px;
  color: #8c939d;
  margin: 0 0 20px 120px;
}

.modern-tip {
  margin: 0 0 20px 120px;
  padding: 16px;
  background: linear-gradient(135deg, #f6f8ff 0%, #f0f7ff 100%);
  border: 1px solid #d1e9ff;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  margin-left: 10px;
}

.modern-tip::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, #409eff, #79bbff);
}

.tip-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.shield-icon {
  color: #409eff;
  margin-right: 8px;
  font-size: 18px;
}

.tip-title {
  font-weight: 600;
  color: #409eff;
  font-size: 14px;
}

.tip-content {
  margin: 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  padding-left: 26px;
}

/* 账号表单容器 */
.account-form-container {
  padding: 0 0 20px 0;
}

/* 账号表单 */
.account-form {
  margin-top: 0;
}

/* 单个账号项 */
.account-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  position: relative;
}

/* 账号行双列布局 */
.account-item-row {
  display: flex;
  gap: 15px;
  flex: 1;
}

/* 账号表单项（调整宽度） */
.account-form-item {
  flex: 1;
  margin-bottom: 0;
}

/* 账号表单标签（添加必填星号） */
.account-form-item .el-form-item__label::after {
  content: '*';
  color: #ff4d4f;
  margin-left: 4px;
}

/* 删除账号按钮 */
.delete-btn {
  color: #ff4d4f;
  margin-left: 10px;
}

/* 添加账号按钮（靠右对齐，匹配图片） */
.add-account-item {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-right: 30px;
}

.add-account-btn {
  background-color: #409eff;
  border-color: #409eff;
}

.add-account-btn:hover {
  background-color: #1890ff;
  border-color: #1890ff;
}

.submit-account-btn {
  background-color: #67c23a;
  border-color: #67c23a;
}

.submit-account-btn:hover {
  background-color: #529b2e;
  border-color: #529b2e;
}

/* 删除账号按钮 */
.delete-account-btn {
  margin-left: 10px;
  flex-shrink: 0;
}

/* 已绑定账号区域 */
.bound-account-section {
  margin-top: 30px;
  padding: 20px;
  background: #fafbfc;
  border-radius: 12px;
  border: 1px solid #eaeef2;
}

/* 已绑定账号标题 */
.bound-account-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
}

.bound-account-title::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 16px;
  background: linear-gradient(135deg, #409eff, #79bbff);
  border-radius: 2px;
  margin-right: 8px;
}

/* 已绑定账号列表 */
.bound-account-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 单个已绑定账号项 */
.bound-account-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.bound-account-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, #409eff, #79bbff);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.bound-account-item:hover {
  border-color: #d1e9ff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
  transform: translateY(-2px);
}

.bound-account-item:hover::before {
  opacity: 1;
}

/* 平台图标样式 */
.platform-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.bound-account-item:hover .platform-icon {
  transform: scale(1.05);
}

.icon-text {
  font-weight: 700;
  font-size: 25px;
  color: #000;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

/* 平台名称和账号信息 */
.account-info {
  flex: 1;
}

/* 平台名称 */
.platform-name {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 账号用户名 */
.account-username {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  font-family: 'Monaco', 'Consolas', monospace;
  background: #f8f9fa;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unbind-btn:hover {
  color: #dc2626;
}

/* 无绑定账号提示 */
.no-account-tip {
  text-align: center;
  padding: 40px 20px;
}

.no-account-tip :deep(.el-empty__description) {
  margin-top: 16px;
  color: #6b7280;
}

.no-account-tip :deep(.el-empty__image) {
  opacity: 0.6;
}
</style>
