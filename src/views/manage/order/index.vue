<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="订单编号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="订单搜索"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="0-待支付;1-支付完成;2-出货成功;3-出货失败;4-已取消" clearable>
          <el-option
            v-for="dict in order_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" style="width: 308px">
        <el-date-picker
          v-model="daterangeCreateTime"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
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
          v-hasPermi="['manage:order:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['manage:order:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['manage:order:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['manage:order:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="orderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" align="center" prop="id" />
      <el-table-column label="订单编号" align="center" prop="orderNo" />
      
      <el-table-column label="商品名称" align="center" prop="skuName" />
      <el-table-column label="支付金额" align="center" prop="amount" />
      <el-table-column label="设备编号" align="center" prop="innerCode" />
      <el-table-column label="订单状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="order_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="订单日期" align="center" prop="createTime" />
      
      <el-table-column label="支付类型" align="center" prop="payType">
        <template #default="scope">
          <dict-tag :options="pay_type" :value="scope.row.payType"/>
        </template>
      </el-table-column>
      <el-table-column label="支付状态" align="center" prop="payStatus">
        <template #default="scope">
          <dict-tag :options="pay_status" :value="scope.row.payStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['manage:order:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['manage:order:remove']">删除</el-button>
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

    <!-- 添加或修改订单管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="orderRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="订单编号" prop="orderNo">
          <el-input v-model="form.orderNo" placeholder="请输入订单编号" />
        </el-form-item>
        <el-form-item label="第三方平台单号" prop="thirdNo">
          <el-input v-model="form.thirdNo" placeholder="请输入第三方平台单号" />
        </el-form-item>
        <el-form-item label="机器编号" prop="innerCode">
          <el-input v-model="form.innerCode" placeholder="请输入机器编号" />
        </el-form-item>
        <el-form-item label="货道编号" prop="channelCode">
          <el-input v-model="form.channelCode" placeholder="请输入货道编号" />
        </el-form-item>
        <el-form-item label="skuId" prop="skuId">
          <el-input v-model="form.skuId" placeholder="请输入skuId" />
        </el-form-item>
        <el-form-item label="商品名称" prop="skuName">
          <el-input v-model="form.skuName" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品类别Id" prop="classId">
          <el-input v-model="form.classId" placeholder="请输入商品类别Id" />
        </el-form-item>
        <el-form-item label="订单状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in order_status"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="支付金额" prop="amount">
          <el-input v-model="form.amount" placeholder="请输入支付金额" />
        </el-form-item>
        <el-form-item label="商品金额" prop="price">
          <el-input v-model="form.price" placeholder="请输入商品金额" />
        </el-form-item>
        <el-form-item label="支付类型" prop="payType">
          <el-select v-model="form.payType" placeholder="请选择支付类型，1支付宝 2微信">
            <el-option
              v-for="dict in pay_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="支付状态" prop="payStatus">
          <el-radio-group v-model="form.payStatus">
            <el-radio
              v-for="dict in pay_status"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="合作商账单金额" prop="bill">
          <el-input v-model="form.bill" placeholder="请输入合作商账单金额" />
        </el-form-item>
        <el-form-item label="点位地址" prop="addr">
          <el-input v-model="form.addr" placeholder="请输入点位地址" />
        </el-form-item>
        <el-form-item label="所属区域Id" prop="regionId">
          <el-input v-model="form.regionId" placeholder="请输入所属区域Id" />
        </el-form-item>
        <el-form-item label="区域名称" prop="regionName">
          <el-input v-model="form.regionName" placeholder="请输入区域名称" />
        </el-form-item>
        <el-form-item label="所属商圈" prop="businessType">
          <el-select v-model="form.businessType" placeholder="请选择所属商圈">
            <el-option
              v-for="dict in business_type"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="合作商Id" prop="partnerId">
          <el-input v-model="form.partnerId" placeholder="请输入合作商Id" />
        </el-form-item>
        <el-form-item label="跨站身份验证" prop="openId">
          <el-input v-model="form.openId" placeholder="请输入跨站身份验证" />
        </el-form-item>
        <el-form-item label="点位Id" prop="nodeId">
          <el-input v-model="form.nodeId" placeholder="请输入点位Id" />
        </el-form-item>
        <el-form-item label="点位名称" prop="nodeName">
          <el-input v-model="form.nodeName" placeholder="请输入点位名称" />
        </el-form-item>
        <el-form-item label="取消原因" prop="cancelDesc">
          <el-input v-model="form.cancelDesc" placeholder="请输入取消原因" />
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

<script setup name="Order">
import { listOrder, getOrder, delOrder, addOrder, updateOrder } from "@/api/manage/order";

const { proxy } = getCurrentInstance();
const { pay_status, pay_type, order_status, business_type } = proxy.useDict('pay_status', 'pay_type', 'order_status', 'business_type');

const orderList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const daterangeCreateTime = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderNo: null,
    status: null,
    createTime: null,
  },
  rules: {
    orderNo: [
      { required: true, message: "订单编号不能为空", trigger: "blur" }
    ],
    innerCode: [
      { required: true, message: "机器编号不能为空", trigger: "blur" }
    ],
    channelCode: [
      { required: true, message: "货道编号不能为空", trigger: "blur" }
    ],
    skuId: [
      { required: true, message: "skuId不能为空", trigger: "blur" }
    ],
    skuName: [
      { required: true, message: "商品名称不能为空", trigger: "blur" }
    ],
    classId: [
      { required: true, message: "商品类别Id不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "订单状态:0-待支付;1-支付完成;2-出货成功;3-出货失败;4-已取消不能为空", trigger: "change" }
    ],
    amount: [
      { required: true, message: "支付金额不能为空", trigger: "blur" }
    ],
    price: [
      { required: true, message: "商品金额不能为空", trigger: "blur" }
    ],
    payType: [
      { required: true, message: "支付类型，1支付宝 2微信不能为空", trigger: "change" }
    ],
    payStatus: [
      { required: true, message: "支付状态，0-未支付;1-支付完成;2-退款中;3-退款完成不能为空", trigger: "change" }
    ],
    createTime: [
      { required: true, message: "创建时间不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询订单管理列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangeCreateTime && '' != daterangeCreateTime) {
    queryParams.value.params["beginCreateTime"] = daterangeCreateTime.value[0];
    queryParams.value.params["endCreateTime"] = daterangeCreateTime.value[1];
  }
  listOrder(queryParams.value).then(response => {
    orderList.value = response.rows;
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
    orderNo: null,
    thirdNo: null,
    innerCode: null,
    channelCode: null,
    skuId: null,
    skuName: null,
    classId: null,
    status: null,
    amount: null,
    price: null,
    payType: null,
    payStatus: null,
    bill: null,
    addr: null,
    regionId: null,
    regionName: null,
    businessType: null,
    partnerId: null,
    openId: null,
    nodeId: null,
    nodeName: null,
    cancelDesc: null,
    createTime: null,
    updateTime: null
  };
  proxy.resetForm("orderRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  daterangeCreateTime.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  // 使用JSON序列化和反序列化来保持ID的原始格式，避免大整数精度丢失
  ids.value = selection.map(item => {
    // 确保ID以原始格式传递，避免被转换为Number类型
    return item.id;
  });
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加订单管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  
  let _id;
  if (row && row.id) {
    // 从表格行点击调用 - 确保ID作为原始值传递
    _id = String(row.id); // 将ID转换为字符串，防止大整数精度丢失
    console.log("从表格行获取的ID:", _id, typeof _id);
  } else if (ids.value.length > 0) {
    // 从工具栏按钮调用，使用选中项的第一个ID - 确保ID作为原始值传递
    _id = String(ids.value[0]); // 将ID转换为字符串，防止大整数精度丢失
    console.log("从选择项获取的ID:", _id, typeof _id);
  } else {
    proxy.$modal.msgWarning("请选择要修改的订单");
    return;
  }
  
  // 确保ID不为undefined或null
  if (_id === undefined || _id === null || _id === '') {
    proxy.$modal.msgError("订单ID无效");
    return;
  }
  
  console.log("尝试获取订单ID:", _id); // 调试信息
  
  getOrder(_id).then(response => {
    console.log("API响应:", response); // 调试信息
    
    if(response && response.data) {
      form.value = response.data;
      open.value = true;
      title.value = "修改订单管理";
    } else {
      proxy.$modal.msgError("获取订单信息失败，未返回数据");
      console.error("获取订单信息失败，响应内容:", response);
    }
  }).catch(error => {
    console.error("获取订单信息时发生错误:", error);
    proxy.$modal.msgError("获取订单信息失败：" + (error.response?.data?.message || error.message || '未知错误'));
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["orderRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateOrder(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addOrder(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除订单管理编号为"' + _ids + '"的数据项？').then(function() {
    return delOrder(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/order/export', {
    ...queryParams.value
  }, `order_${new Date().getTime()}.xlsx`)
}

getList();
</script>
