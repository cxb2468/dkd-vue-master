import request from '@/utils/request'

// 查询活动管理列表
export function listActivities(query) {
  return request({
    url: '/manage/activities/list',
    method: 'get',
    params: query
  })
}

// 查询活动管理详细
export function getActivities(id) {
  return request({
    url: '/manage/activities/' + id,
    method: 'get'
  })
}

// 新增活动管理
export function addActivities(data) {
  return request({
    url: '/manage/activities',
    method: 'post',
    data: data
  })
}

// 修改活动管理
export function updateActivities(data) {
  return request({
    url: '/manage/activities',
    method: 'put',
    data: data
  })
}

// 删除活动管理
export function delActivities(id) {
  return request({
    url: '/manage/activities/' + id,
    method: 'delete'
  })
}
