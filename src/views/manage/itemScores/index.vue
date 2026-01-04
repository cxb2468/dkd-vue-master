<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="装备名称" prop="itemName">
        <el-input
          v-model="queryParams.itemName"
          placeholder="请输入装备名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="副本名称" prop="location">
        <el-input
          v-model="queryParams.location"
          placeholder="请输入副本名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="BOSS名称" prop="bossName">
        <el-input
          v-model="queryParams.bossName"
          placeholder="请输入BOSS名称"
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
          v-hasPermi="['manage:itemScores:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['manage:itemScores:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['manage:itemScores:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['manage:itemScores:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="itemScoresList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="装备名称" align="center" prop="itemName" width="180" />
      <el-table-column label="副本名称" align="center" prop="location" />
      <el-table-column label="BOSS名称" align="center" prop="bossName" />
      <el-table-column label="装备DKP分值" align="center" prop="itemDkpCost" />
      <el-table-column label="备注" align="center" prop="description" />
      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createdAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['manage:itemScores:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['manage:itemScores:remove']">删除</el-button>
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

    <!-- 添加或修改装备积分管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="itemScoresRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="装备名称" prop="itemName">
          <el-input v-model="form.itemName" placeholder="请输入装备名称" />
        </el-form-item>
        <el-form-item label="副本名称" prop="location">
          <el-input v-model="form.location" placeholder="请输入副本名称" />
        </el-form-item>
        <el-form-item label="BOSS名称" prop="bossName">
          <el-input v-model="form.bossName" placeholder="请输入BOSS名称" />
        </el-form-item>
        <el-form-item label="装备DKP分值(扣除分数)" prop="itemDkpCost">
          <el-input v-model="form.itemDkpCost" placeholder="请输入装备DKP分值(扣除分数)" />
        </el-form-item>
        <el-form-item label="备注" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="创建时间" prop="createdAt">
          <el-date-picker clearable
            v-model="form.createdAt"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择创建时间">
          </el-date-picker>
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

<script setup name="ItemScores">
import { listItemScores, getItemScores, delItemScores, addItemScores, updateItemScores } from "@/api/manage/itemScores";

const { proxy } = getCurrentInstance();

const itemScoresList = ref([]);
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
    itemName: null,
    location: null,
    bossName: null,
  },
  rules: {
    itemName: [
      { required: true, message: "装备名称不能为空", trigger: "blur" }
    ],
    location: [
      { required: true, message: "副本名称不能为空", trigger: "blur" }
    ],
    bossName: [
      { required: true, message: "BOSS名称不能为空", trigger: "blur" }
    ],
    itemDkpCost: [
      { required: true, message: "装备DKP分值(扣除分数)不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询装备积分管理列表 */
function getList() {
  loading.value = true;
  listItemScores(queryParams.value).then(response => {
    itemScoresList.value = response.rows;
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
    itemName: null,
    location: null,
    bossName: null,
    itemDkpCost: null,
    description: null,
    createdAt: null
  };
  proxy.resetForm("itemScoresRef");
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
  title.value = "添加装备积分管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getItemScores(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改装备积分管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["itemScoresRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateItemScores(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addItemScores(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除装备积分管理编号为"' + _ids + '"的数据项？').then(function() {
    return delItemScores(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/itemScores/export', {
    ...queryParams.value
  }, `itemScores_${new Date().getTime()}.xlsx`)
}

getList();
</script>
