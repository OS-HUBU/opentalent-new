<template>
   <el-form ref="userRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="成员名称" prop="nickName">
         <el-input v-model="form.userName" maxlength="30" :disabled="!isFreelancer" />
      </el-form-item>

      <el-form-item label="联系邮箱" prop="contactEmail">
         <el-input v-model="form.contactEmail" maxlength="50" />
      </el-form-item>
      <el-form-item label="出生日期" prop="birthDate">
         <el-date-picker
            v-model="form.birthDate"
            type="date"
            placeholder="请选择出生日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
         />
      </el-form-item>
      <el-form-item label="性别" prop="sex">
         <el-radio-group v-model="form.sex">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
         </el-radio-group>
      </el-form-item>
      <el-form-item label="国籍" prop="nationality">
         <el-input v-model="form.nationality" maxlength="50" disabled />
      </el-form-item>
      <el-form-item label="所在地区" prop="location">
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
      <el-form-item v-if="!isFreelancer" label="专业" prop="major">
         <el-input v-model="form.major" maxlength="50" disabled />
      </el-form-item>
      <el-form-item v-if="!isFreelancer" label="成员类型" prop="memberType">
         <el-input v-model="form.memberType" maxlength="30" disabled />
      </el-form-item>

      
      <el-form-item>
         <el-button type="primary" @click="submit">保存</el-button>
         <el-button type="danger" @click="close">关闭</el-button>
      </el-form-item>
   </el-form>
</template>

<script setup>
import { updateUserinfo } from "@/api/userinfo/userinfo";
import { getRegionTree } from "@/api/register";
import { ref, getCurrentInstance, watch, onMounted, nextTick, computed } from "vue";
import useUserStore from "@/store/modules/user";

const props = defineProps({
  user: {
    type: Object
  }
});

const { proxy } = getCurrentInstance();
const userStore = useUserStore();

const form = ref({});
// 地区数据
const regionTreeData = ref([]);

// 判断当前用户是否为自由职业者
const isFreelancer = computed(() => {
  return userStore.roles && userStore.roles.includes('freelancer');
});
const rules = ref({
  contactEmail: [
    { required: true, message: "联系邮箱不能为空", trigger: "blur" }, 
    { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }
  ],
  birthDate: [{ required: true, message: "请选择出生日期", trigger: "change" }],
  sex: [{ required: true, message: "请选择性别", trigger: "change" }],
  location: [{ required: true, message: "所在地区不能为空", trigger: "blur" }],
});

/** 提交按钮 */
function submit() {
  proxy.$refs.userRef.validate(valid => {
    if (valid) {
      // 构建提交给后端的数据对象，确保包含所有必传字段
      const submitData = {
        userId: form.value.userId,
        userName: form.value.userName,
        nationality: form.value.nationality,
        contactEmail: form.value.contactEmail,
        sex: form.value.sex,
        birthDate: form.value.birthDate,
        location: form.value.location
      };
      
      // 在保存之前输出传给后端的数据
      console.log('=== 个人基本资料提交数据 ===');
      console.log('传给后端的data数据:', submitData);
      console.log('数据详情:', JSON.stringify(submitData, null, 2));
      console.log('========================');
      
      updateUserinfo(submitData).then(response => {
        proxy.$modal.msgSuccess("修改成功");
        // 更新用户信息
        Object.assign(props.user, form.value);
      });
    }
  });
};

/** 关闭按钮 */
function close() {
  proxy.$tab.closePage();
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
    form.value.location = '';
    return;
  }
  
  // 查找选中节点的完整路径
  const pathNodes = findNodePath(regionTreeData.value, regionId);
  
  if (pathNodes) {
    // 使用originalName构建完整地址字符串，确保使用原始名称
    const fullAddress = pathNodes.map(node => node.originalName).join('');
    
    // 设置用户所在地区
    form.value.location = fullAddress;
  }
}

// 回显当前登录用户信息
watch(() => props.user, user => {
  if (user) {
    form.value = {
      userId: user.userId,
      userName: user.userName || '',
      contactEmail: user.contactEmail || user.email || '',
      sex: user.sex || '',
      birthDate: user.birthDate || '',
      nationality: user.nationality || '',
      location: user.location || '',
      major: user.major || '',
      memberType: user.memberType || '',
      region: '' // 地区选择框的值
    };
    
    // 设置地区回显逻辑
    const setRegionValue = () => {
      if (form.value.location && regionTreeData.value.length > 0) {
        const regionId = findRegionIdByAddress(regionTreeData.value, form.value.location);
        if (regionId) {
          form.value.region = regionId;
          // 更新地区选择框的显示
          nextTick(() => {
            handleRegionChange(regionId);
          });
        } else {
          // 如果在地区树中找不到对应项，直接将location值填充到下拉框中
          form.value.region = form.value.location;
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
  }
},{ immediate: true });

// 组件挂载时初始化数据
onMounted(() => {
  getRegionData();
});
</script>
