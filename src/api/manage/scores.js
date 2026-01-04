import request from '@/utils/request'

// 查询BOSS积分管理列表
export function listScores(query) {
  return request({
    url: '/manage/scores/list',
    method: 'get',
    params: query
  })
}

// 查询BOSS积分管理详细
export function getScores(id) {
  return request({
    url: '/manage/scores/' + id,
    method: 'get'
  })
}

// 新增BOSS积分管理
export function addScores(data) {
  return request({
    url: '/manage/scores',
    method: 'post',
    data: data
  })
}

// 修改BOSS积分管理
export function updateScores(data) {
  return request({
    url: '/manage/scores',
    method: 'put',
    data: data
  })
}

// 删除BOSS积分管理
export function delScores(id) {
  return request({
    url: '/manage/scores/' + id,
    method: 'delete'
  })
}
