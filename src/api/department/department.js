import request from '@/utils/request'
import { pa } from 'element-plus/es/locales.mjs'


// 查询组织下属部门列表
export function listDepartment() {
  return request({
    url: '/department/list',
    method: 'get',
  })
}

// 查询组织下属部门详细
export function getDepartment(departmentId) {
  return request({
    url: '/department/department/' + departmentId,
    method: 'get'
  })
}

// 新增组织下属部门
export function addDepartment(data) {
  return request({
    url: `/register/dept`,
    method: 'post',
    data: data
  })
}

// 修改组织下属部门
export function updateDepartment(data) {
  return request({
    url: '/department',
    method: 'put',
    data: data
  })
}

// 删除组织下属部门
export function delDepartment(data) {
  return request({
    url: '/department/removeDepartment',
    method: 'delete',
    data:data
  })
}


// 批量添加部门
export function batchImportDepartment(file) {
  const formData = new FormData();
  formData.append('file', file);
  return request({
    url: '/register/batchUploadDeptAdminsFile',
    method: 'post',
    data: formData,
    // 为批量导入设置更长的超时时间（3分钟）
    timeout: 180000,
  });
}

// 查询导入进度
export const getImportProgress = async (taskId) => {
  return await request({
    url: `/register/getProgress/${taskId}`,
    method: 'GET'
  });
};
