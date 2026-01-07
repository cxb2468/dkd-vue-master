<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="会员姓名" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入会员姓名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="职业" prop="profession">
        <el-input
          v-model="queryParams.profession"
          placeholder="请输入职业"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="等级" prop="level">
        <el-input
          v-model="queryParams.level"
          placeholder="请输入等级"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属团队" prop="team">
        <el-input
          v-model="queryParams.team"
          placeholder="请输入所属团队"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['manage:members:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['manage:members:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['manage:members:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['manage:members:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="membersList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="会员ID" align="center" prop="id" /> -->
      <el-table-column label="序号" type="index" align="center" prop="avatar" width="80" />
      <el-table-column label="会员姓名" align="center" prop="name" />
      <el-table-column label="职业" align="center" prop="profession" />
      <el-table-column label="等级" align="center" prop="level" />
      <el-table-column label="性别" align="center" prop="sex">
        <template #default="scope">
          <dict-tag :options="sys_user_sex" :value="scope.row.sex"/>
        </template>
      </el-table-column>
      <el-table-column label="会员级别" align="center" prop="memberLevel">
        <template #default="scope">
          <dict-tag :options="member_level" :value="scope.row.memberLevel"/>
        </template>
      </el-table-column>
      <el-table-column label="所属团队" align="center" prop="team" />
      <el-table-column label="当前DKP" align="center" prop="currentDkp" />
      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createdAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updatedAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updatedAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary"  @click="getDKPDetail(scope.row)" v-hasPermi="['manage:records:list']">查看DKP变更详情</el-button>
          <el-button link type="primary"  @click="handleUpdate(scope.row)" v-hasPermi="['manage:members:edit']">修改</el-button>
          <el-button link type="primary"  @click="handleDelete(scope.row)" v-hasPermi="['manage:members:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改会员管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="membersRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="会员姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入会员姓名" />
        </el-form-item>
        <el-form-item label="职业" prop="profession">
          <el-input v-model="form.profession" placeholder="请输入职业" />
        </el-form-item>
        <el-form-item label="等级" prop="level">
          <el-input v-model="form.level" placeholder="请输入等级" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-select v-model="form.sex" placeholder="请选择性别">
            <el-option
              v-for="dict in sys_user_sex"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="会员级别" prop="memberLevel">
          <el-select v-model="form.memberLevel" placeholder="请选择会员级别(如：精英)">
            <el-option
              v-for="dict in member_level"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属团队" prop="team">
          <el-input v-model="form.team" placeholder="请输入所属团队" />
        </el-form-item>
        <el-form-item label="当前DKP" prop="currentDkp">
          <el-input v-model="form.currentDkp" placeholder="请输入当前DKP" />
        </el-form-item>
        <!-- <el-form-item label="创建时间" prop="createdAt">
          <el-date-picker clearable
            v-model="form.createdAt"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择创建时间">
          </el-date-picker>
        </el-form-item> -->
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog :title="'[' + currentMemberName + ']的DKP变更详情'" v-model="DKPDetailOpen" width="1150px" append-to-body>

      <el-table :data="paginatedRecordsList" border class="black-border-table">
      <!-- <el-table-column type="selection" width="55" align="center" /> -->
      <el-table-column label="序号" type="index" align="center" prop="id" />
    
      <!-- <el-table-column label="会员ID" align="center" prop="memberId" >
        <template #default="scope">
          {{ scope.row.memberId || '' }}  
          <!-- {{ memberList.find(item => item.id === scope.row.memberId)?.name || '' }}
        </template>
      </el-table-column> -->
      <!-- <el-table-column label="会员姓名" align="center" prop="memberName" /> -->
      <!-- <el-table-column label="活动ID" align="center" prop="activityId" >
        <template #default="scope">
          {{ activityList.find(item => item.id === scope.row.activityId)?.activityName || '' }}
        </template>
      </el-table-column> -->
      <el-table-column label="活动名称" align="center" prop="activityName" width="150" />
      <el-table-column label="事件日期" align="center" prop="eventDate" width="100">
        <template #default="scope">
          <span>{{ parseTime(scope.row.eventDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="副本BOSS id" align="center" prop="bossId" >
        <template #default="scope">
          {{ bossList.find(item => item.id === scope.row.bossId)?.bossName || '' }}
        </template>
      </el-table-column> -->
      <el-table-column label="BOSS名称" align="center" prop="bossName" width="110"  />
      <el-table-column label="DKP加分" align="center" prop="dkpAdd" />
      <!-- <el-table-column label="BOSS装备id" align="center" prop="itemId" >
        <template #default="scope">
          {{ itemList.find(item => item.id === scope.row.itemId)?.itemName || '' }}
        </template>
      </el-table-column> -->
      <el-table-column label="获取装备名称" align="center" prop="dkpDeductItem" width="100" />
      <el-table-column label="DKP减分" align="center" prop="dkpDeduct" />
      <el-table-column label="操作后当前DKP" align="center" prop="currentDkp" />
      <el-table-column label="变更原因" align="center" prop="reason" />
      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createdAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="totalRecords>0"
      :total="totalRecords"
      v-model:page="recordsQueryParams.pageNum"
      v-model:limit="recordsQueryParams.pageSize"
      @pagination="handleRecordsPagination"
    />
    </el-dialog>
  </div>
</template>

<script setup name="Members">
import { listMembers, getMembers, delMembers, addMembers, updateMembers } from "@/api/manage/members";
import {listRecords} from "@/api/manage/records";

const { proxy } = getCurrentInstance();
const { sys_user_sex, member_level } = proxy.useDict('sys_user_sex', 'member_level');

const membersList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = "";

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    profession: null,
    level: null,
    team: null,
  },
  rules: {
    name: [
      { required: true, message: "会员姓名不能为空", trigger: "blur" }
    ],
    profession: [
      { required: true, message: "职业不能为空", trigger: "blur" }
    ],
    level: [
      { required: true, message: "等级不能为空", trigger: "blur" }
    ],
    team: [
      { required: true, message: "所属团队不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询会员管理列表 */
function getList() {
  loading.value = true;
  listMembers(queryParams.value).then(response => {
    membersList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    name: null,
    profession: null,
    level: null,
    sex: null,
    memberLevel: null,
    team: null,
    currentDkp: null,
    createdAt: null,
    updatedAt: null
  };
  proxy.resetForm("membersRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加会员管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getMembers(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改会员管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["membersRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateMembers(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addMembers(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除会员管理编号为"' + _ids + '"的数据项？').then(function() {
    return delMembers(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/members/export', {
    ...queryParams.value
  }, `members_${new Date().getTime()}.xlsx`)
}

// 查看DKP变更详情
const DKPDetailOpen = ref(false);
const currentMemberName = ref('');
const recordsList = ref([]);
const paginatedRecordsList = ref([]);
const totalRecords = ref(0);
const recordsQueryParams = reactive({
  pageNum: 1,
  pageSize: 10
});

function handleRecordsPagination() {
  const params = {
    memberId: getCurrentMemberId(), // 获取当前会员ID
    pageNum: recordsQueryParams.pageNum,
    pageSize: recordsQueryParams.pageSize
  };
  listRecords(params).then(response => {
    recordsList.value = response.rows;
    paginatedRecordsList.value = response.rows;
    totalRecords.value = response.total;
  });
}

// 添加一个函数来获取当前会员ID
let currentMemberId = null;
function getCurrentMemberId() {
  return currentMemberId;
}

function getDKPDetail(row) {
    //根据会员id，查询DKP变更详情列表
    currentMemberId = row.id; // 保存当前会员ID
    const params = {
      memberId: row.id,
      pageNum: recordsQueryParams.pageNum,
      pageSize: recordsQueryParams.pageSize
    };
    listRecords(params).then(response => {
      recordsList.value = response.rows;
      currentMemberName.value = row.name; // 保存当前会员姓名
      totalRecords.value = response.total; // 更新总记录数
      paginatedRecordsList.value = response.rows; // 直接使用返回的数据
      DKPDetailOpen.value = true;
    });

}

getList();
</script>

<style scoped>
.black-border-table :deep(.el-table__inner-wrapper) {
  border: 1px solid #000000 !important;
}

.black-border-table :deep(.el-table__cell) {
  border-right: 1px solid #000000 !important;
}

.black-border-table :deep(th.el-table__cell) {
  border-bottom: 1px solid #000000 !important;
}
</style>
