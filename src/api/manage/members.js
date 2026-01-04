import request from '@/utils/request'

// 查询会员管理列表
export function listMembers(query) {
  return request({
    url: '/manage/members/list',
    method: 'get',
    params: query
  })
}

// 查询会员管理详细
export function getMembers(id) {
  return request({
    url: '/manage/members/' + id,
    method: 'get'
  })
}

// 新增会员管理
export function addMembers(data) {
  return request({
    url: '/manage/members',
    method: 'post',
    data: data
  })
}

// 修改会员管理
export function updateMembers(data) {
  return request({
    url: '/manage/members',
    method: 'put',
    data: data
  })
}

// 删除会员管理
export function delMembers(id) {
  return request({
    url: '/manage/members/' + id,
    method: 'delete'
  })
}
