import request from '@/utils/request'

// 查询人员角色列表
export function listRole(query) {
  return request({
    url: '/manage/role/list',
    method: 'get',
    params: query
  })
}

// 查询人员角色详细
export function getRole(roleId) {
  return request({
    url: '/manage/role/' + roleId,
    method: 'get'
  })
}

// 新增人员角色
export function addRole(data) {
  return request({
    url: '/manage/role',
    method: 'post',
    data: data
  })
}

// 修改人员角色
export function updateRole(data) {
  return request({
    url: '/manage/role',
    method: 'put',
    data: data
  })
}

// 删除人员角色
export function delRole(roleId) {
  return request({
    url: '/manage/role/' + roleId,
    method: 'delete'
  })
}
