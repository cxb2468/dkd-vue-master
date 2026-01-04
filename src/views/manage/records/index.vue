<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="会员姓名" prop="memberName">
        <el-input
          v-model="queryParams.memberName"
          placeholder="请输入会员姓名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="事件日期" prop="eventDate">
        <el-date-picker clearable
          v-model="queryParams.eventDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择事件日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="DKP加分" prop="dkpAdd">
        <el-input
          v-model="queryParams.dkpAdd"
          placeholder="请输入DKP加分"
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
          v-hasPermi="['manage:records:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['manage:records:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['manage:records:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['manage:records:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="recordsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" align="center" prop="id" />
      <el-table-column label="会员ID" align="center" prop="memberId" >
        <template #default="scope">
          {{ memberList.find(item => item.id === scope.row.memberId)?.name || '' }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="会员姓名" align="center" prop="memberName" /> -->
      <el-table-column label="活动ID" align="center" prop="activityId" >
        <template #default="scope">
          {{ activityList.find(item => item.id === scope.row.activityId)?.activityName || '' }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="活动名称" align="center" prop="activityName" /> -->
      <el-table-column label="事件日期" align="center" prop="eventDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.eventDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="副本BOSS id" align="center" prop="bossId" >
        <template #default="scope">
          {{ bossList.find(item => item.id === scope.row.bossId)?.bossName || '' }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="BOSS名称" align="center" prop="bossName" /> -->
      <el-table-column label="DKP加分" align="center" prop="dkpAdd" />
      <el-table-column label="BOSS装备id" align="center" prop="itemId" >
        <template #default="scope">
          {{ itemList.find(item => item.id === scope.row.itemId)?.itemName || '' }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="DKP减分项目(装备名称)" align="center" prop="dkpDeductItem" /> -->
      <el-table-column label="DKP减分" align="center" prop="dkpDeduct" />
      <el-table-column label="操作后当前DKP" align="center" prop="currentDkp" />
      <el-table-column label="变更原因" align="center" prop="reason" />
      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createdAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['manage:records:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['manage:records:remove']">删除</el-button>
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

    <!-- 添加或修改DKP变更记录对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="recordsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="会员选择" prop="memberId">
          <el-select v-model="form.memberId" placeholder="请选择会员" clearable>
            <el-option
              v-for="item in memberList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="活动选择" prop="activityId">
          <el-select v-model="form.activityId" placeholder="请选择活动" clearable>
            <el-option
              v-for="item in activityList"
              :key="item.id"
              :label="item.activityName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="BOSS选择" prop="bossId">
          <el-select v-model="form.bossId" placeholder="请选择BOSS" @change="handleBossChange" clearable>
            <el-option
              v-for="item in bossList"
              :key="item.id"
              :label="item.bossName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <!-- 三级联动选择器：副本区域 -> Boss -> 物品 -->
        <el-form-item label="副本区域">
          <el-select v-model="form.location" @change="onLocationChange" placeholder="请选择副本区域">
            <el-option
              v-for="loc in locations"
              :key="loc"
              :label="loc"
              :value="loc"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Boss">
          <el-select v-model="form.bossName" @change="onBossChange" placeholder="请选择Boss">
            <el-option
              v-for="boss in bosses"
              :key="boss"
              :label="boss"
              :value="boss"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="物品" prop="itemId">
          <el-select v-model="form.itemId" placeholder="请选择物品">
            <el-option
              v-for="item in items"
              :key="item.id"
              :label="item.itemName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="DKP加分" prop="dkpAdd">
          <el-input v-model="form.dkpAdd" placeholder="请输入DKP加分" />
        </el-form-item>
        <el-form-item label="DKP减分" prop="dkpDeduct">
          <el-input v-model="form.dkpDeduct" placeholder="请输入DKP减分" />
        </el-form-item>
        <!-- <el-form-item label="操作后当前DKP" prop="currentDkp">
          <el-input v-model="form.currentDkp" placeholder="请输入操作后当前DKP" />
        </el-form-item> -->
        <el-form-item label="变更原因" prop="reason">
          <el-input v-model="form.reason" placeholder="请输入变更原因" />
        </el-form-item>

      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Records">
import { listRecords, getRecords, delRecords, addRecords, updateRecords } from "@/api/manage/records";
import {listMembers} from "@/api/manage/members";
import {listActivities} from "@/api/manage/activities";
import {listScores} from "@/api/manage/scores";
import {listItemScores} from "@/api/manage/itemScores";
import {loadAllParams} from "@/api/page";
import { ref, computed, reactive, getCurrentInstance, toRefs } from "vue";




const { proxy } = getCurrentInstance();

const recordsList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    memberId: null,
    memberName: null,
    activityId: null,
    eventDate: null,
    bossId: null,
    dkpAdd: null,
    itemId: null,
  },
  rules: {
    memberId: [
      { required: false, message: "会员ID不能为空", trigger: "change" }
    ],
    activityId: [
      { required: false, message: "活动ID不能为空", trigger: "change" }
    ],
    dkpAdd: [
      {
        validator: (rule, value, callback) => {
          if (value === null || value === undefined || value === '') {
            callback(); // 允许为空
          } else {
            const numValue = Number(value);
            if (isNaN(numValue) || numValue < 0) {
              callback(new Error('请输入大于等于0的数值'));
            } else {
              callback();
            }
          }
        },
        trigger: 'blur'
      }
    ],
    itemId: [
      { required: false, message: "BOSS装备id不能为空", trigger: "change" }
    ],
    dkpDeduct: [
      {
        validator: (rule, value, callback) => {
          if (value === null || value === undefined || value === '') {
            callback(); // 允许为空
          } else {
            const numValue = Number(value);
            if (isNaN(numValue) || numValue < 0) {
              callback(new Error('请输入大于等于0的数值'));
            } else {
              callback();
            }
          }
        },
        trigger: 'blur'
      }
    ],
    currentDkp: [
      {
        validator: (rule, value, callback) => {
          if (value === null || value === undefined || value === '') {
            callback(); // 允许为空
          } else {
            const numValue = Number(value);
            if (isNaN(numValue)) {
              callback(new Error('请输入有效数值'));
            } else {
              callback();
            }
          }
        },
        trigger: 'blur'
      }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询DKP变更记录列表 */
function getList() {
  loading.value = true;
  listRecords(queryParams.value).then(response => {
    recordsList.value = response.rows;
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
    memberId: null,
    memberName: null,
    activityId: null,
    activityName: null,
    eventDate: null,
    bossId: null,
    bossName: null,
    dkpAdd: null,
    itemId: null,
    dkpDeductItem: null,
    dkpDeduct: null,
    currentDkp: null,
    reason: null,
    createdAt: null,
    location: null
  };
  proxy.resetForm("recordsRef");
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
  title.value = "添加DKP变更记录";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getRecords(_id).then(response => {
    form.value = response.data;
    
    // 如果有itemId，尝试查找对应的location和bossName
    if (response.data.itemId) {
      const item = itemList.value.find(i => i.id === response.data.itemId);
      if (item) {
        form.value.location = item.location;
        form.value.bossName = item.bossName;
      }
    }
    
    open.value = true;
    title.value = "修改DKP变更记录";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["recordsRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateRecords(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addRecords(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除DKP变更记录编号为"' + _ids + '"的数据项？').then(function() {
    return delRecords(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/records/export', {
    ...queryParams.value
  }, `records_${new Date().getTime()}.xlsx`)
}

// 查询会员列表
const memberList = ref([]);
function getMemberlist() {
    listMembers(loadAllParams).then(response => {
      memberList.value = response.rows;
    });
}
// 查询活动列表
const activityList = ref([]);
function getActivitylist() {
    listActivities(loadAllParams).then(response => {
      activityList.value = response.rows;
    }); 
  }
//查询BOSS列表
const bossList = ref([]);
function getBosslist() {
    listScores(loadAllParams).then(response => {
      bossList.value = response.rows;
    });
  }

// 当选择BOSS时，自动将该BOSS的dkpScore值回显到DKP加分字段
function handleBossChange(bossId) {
  if (bossId) {
    const selectedBoss = bossList.value.find(boss => boss.id === bossId);
    if (selectedBoss && selectedBoss.dkpScore) {
      form.value.dkpAdd = selectedBoss.dkpScore;
    }
  } else {
    // 如果清空了选择，则清空dkpAdd字段
    form.value.dkpAdd = null;
  }
}

//查询装备列表
const itemList = ref([]);
function getItemlist() {
    listItemScores(loadAllParams).then(response => {
      itemList.value = response.rows;
    }); 
  }

// 获取所有唯一的 location
const locations = computed(() => [...new Set(itemList.value.map(item => item.location))]);

// 根据 location 获取对应的 boss_name
const bosses = computed(() => {
  if (!form.value.location) return [];
  return [...new Set(itemList.value
    .filter(item => item.location === form.value.location)
    .map(item => item.bossName))];
});

// 根据 location 和 boss_name 获取对应的 item
const items = computed(() => {
  if (!form.value.location || !form.value.bossName) return [];
  return itemList.value.filter(item =>
    item.location === form.value.location && item.bossName === form.value.bossName
  );
});

// 计算属性：检查当前三级联动选择是否完整且 itemId 是否有效
const currentItemValid = computed(() => {
  if (!form.value.location || !form.value.bossName || !form.value.itemId) {
    return false;
  }
  // 检查所选 itemId 是否存在于当前筛选出的物品列表中
  return items.value.some(item => item.id === form.value.itemId);
});

// 监听 location 变化，重置后续字段
const onLocationChange = () => {
  form.value.bossName = '';
  form.value.itemId = '';
};

// 监听 bossName 变化，重置 item
const onBossChange = () => {
  form.value.itemId = '';
};

getMemberlist();
getActivitylist();
getBosslist();
getItemlist();  

getList();
</script>
