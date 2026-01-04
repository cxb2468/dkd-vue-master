import request from '@/utils/request'

// 查询DKP变更管理列表
export function listRecords(query) {
  return request({
    url: '/manage/records/list',
    method: 'get',
    params: query
  })
}

// 查询DKP变更管理详细
export function getRecords(id) {
  return request({
    url: '/manage/records/' + id,
    method: 'get'
  })
}

// 新增DKP变更管理
export function addRecords(data) {
  return request({
    url: '/manage/records',
    method: 'post',
    data: data
  })
}

// 修改DKP变更管理
export function updateRecords(data) {
  return request({
    url: '/manage/records',
    method: 'put',
    data: data
  })
}

// 删除DKP变更管理
export function delRecords(id) {
  return request({
    url: '/manage/records/' + id,
    method: 'delete'
  })
}
