<template>
  <el-form ref="ruleFormRef" :model="formData">
    <el-row :gutter="24">
      <el-col v-bind="item.col" v-for="item in formItemsAttrs" :key="item.prop" :label="item.label">
        <el-form-item :label="item.label" :prop="item.prop">
          <!-- <el-input v-if="item.type === 'input'" :placeholder="item.placeholder" />
      <el-select v-else-if="item.type === 'select'" :placeholder="item.placeholder">
        <el-option v-for="option in item.options" :key="option.value" :label="option.label" :value="option.value" />
      </el-select> -->
          <component v-model="formData[item.prop]" :is="item.type === 'input' ? 'el-input' : 'el-select'"
            :placeholder="item.placeholder">
            <template v-if="item.type === 'select'" #default>
              <el-option v-for="option in item.options" :key="option.value" :label="option.label"
                :value="option.value" />
            </template>
          </component>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
  <el-row>
    <el-button type="primary" @click="handleSearch">搜索</el-button>
    <el-button @click="handleReset(ruleFormRef)">重置</el-button>
  </el-row>
</template>


<script setup>

import { defineProps } from 'vue'
import { ref, reactive, computed } from 'vue'
const emit = defineEmits(['search'])



const ruleFormRef = ref()
const formData = ref({})
const props = defineProps({
  formItems: {
    type: Array,
    default: () => []
  }
})



const formItemsAttrs = computed(() => {
  // 初始化 formData，确保每个 prop 都有一个初始值
  props.formItems.forEach((item) => {
    item.col = {
      xs: 24,
      sm: 12,
      md: 8,
      lg: 6,
      xl: 6,

    }

  }
  )
  return props.formItems

})


const handleSearch = () => {
  // console.log('搜索条件：', formData.value)
  // 在这里可以将 formData.value 发送到后端进行查询
  emit('search', formData)
}
const handleReset = (formEl) => {
  if (!formEl) return
  formEl.resetFields()
  emit('search', formData)
}
</script>