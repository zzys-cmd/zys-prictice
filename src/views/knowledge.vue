<template>
  <div>
    <div>
      <pagehead title="知识文章">
        <template #buttons>
          <el-button type="primary">操作一</el-button>
        </template>
      </pagehead>
    </div>
    <TableSearch :formItems="formItems" @search="handleSearch" />

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import Pagehead from '@/components/pagehead.vue';
import TableSearch from '@/components/TableSearch.vue';
import { getCategory } from '@/api/admin.js';
import { articlePage } from '@/api/admin.js';

const categoryOptions = ref([]);

onMounted(async () => {
  const res = await getCategory();
  categoryOptions.value = res.map((item) => {
    return {
      label: item.categoryName,
      value: item.id,
    }
  })
})


const handleSearch = (formData) => {
  console.log('搜索条件：', formData)

}
const formItems = computed(() => [
  {
    label: '文章标题',
    prop: 'title',
    type: 'input',
    placeholder: '请输入文章标题',
  },
  {
    label: '分类',
    prop: 'category',
    type: 'select',
    options: categoryOptions.value,
    placeholder: '请选择分类',
  },
  {
    label: '状态',
    prop: 'status',
    type: 'select',
    options: [
      { label: '已发布', value: '1' },
      { label: '草稿', value: '0' },
      { label: '已下线', value: '2' },
    ],
    placeholder: '请选择状态',
  }
]);
</script>