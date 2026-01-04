import request from '@/utils/request'

// 查询装备积分管理列表
export function listItemScores(query) {
  return request({
    url: '/manage/itemScores/list',
    method: 'get',
    params: query
  })
}

// 查询装备积分管理详细
export function getItemScores(id) {
  return request({
    url: '/manage/itemScores/' + id,
    method: 'get'
  })
}

// 新增装备积分管理
export function addItemScores(data) {
  return request({
    url: '/manage/itemScores',
    method: 'post',
    data: data
  })
}

// 修改装备积分管理
export function updateItemScores(data) {
  return request({
    url: '/manage/itemScores',
    method: 'put',
    data: data
  })
}

// 删除装备积分管理
export function delItemScores(id) {
  return request({
    url: '/manage/itemScores/' + id,
    method: 'delete'
  })
}
