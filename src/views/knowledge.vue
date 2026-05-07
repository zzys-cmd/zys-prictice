<template>
  <div>
    <pagehead title="知识文章">
      <template #buttons>
        <el-button type="primary" @click="openAddDialog">新建文章</el-button>
      </template>
    </pagehead>
    <TableSearch :formItems="formItems" @search="handleSearch" />

    <div style="overflow-x: auto">
      <el-table :data="articleList" border stripe style="min-width: 900px; margin-top: 20px" v-loading="loading">
        <el-table-column prop="title" label="文章标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="categoryName" label="分类" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success">已发布</el-tag>
            <el-tag v-else-if="row.status === 0" type="info">草稿</el-tag>
            <el-tag v-else-if="row.status === 2" type="danger">已下线</el-tag>
            <el-tag v-else type="warning">未知</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="authorName" label="作者" width="120" />
        <el-table-column prop="readCount" label="阅读量" width="100" />
        <el-table-column prop="publishedAt" label="发布时间" width="180" />
        <el-table-column label="操作" width="260" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
            <el-button v-if="row.status === 1" type="warning" link @click="handleChangeStatus(row, 2)">下线</el-button>
            <el-button v-else type="success" link @click="handleChangeStatus(row, 1)">发布</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div style="display: flex; justify-content: flex-end; margin-top: 20px">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100, 500, 10000]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入文章标题" />
        </el-form-item>
        <el-form-item label="所属分类" prop="categoryId">
          <el-select v-model="formData.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-input v-model="formData.tags" placeholder="请输入标签，多个标签用逗号分隔" />
        </el-form-item>
        <el-form-item label="封面图片" prop="coverImage">
          <div style="display: flex; align-items: flex-start; gap: 12px">
            <div class="cover-upload" @click="triggerUpload">
              <img v-if="formData.coverImage" :src="formData.coverImage" class="cover-preview" />
              <div v-else class="upload-placeholder">
                <el-icon>
                  <Plus />
                </el-icon>
                <span>点击上传</span>
              </div>
            </div>
            <input ref="fileInputRef" type="file" accept="image/*" style="display: none" @change="handleFileChange" />
            <el-input v-model="formData.coverImage" placeholder="或手动输入图片URL" style="flex: 1" />
          </div>
        </el-form-item>
        <el-form-item label="文章摘要" prop="summary">
          <el-input v-model="formData.summary" type="textarea" :rows="3" placeholder="请输入文章摘要" />
        </el-form-item>
        <el-form-item label="文章内容" prop="content">
          <div style="border: 1px solid #ccc">
            <Toolbar :editor="editorRef" :defaultConfig="toolbarConfig" mode="default" />
            <Editor v-model="formData.content" :defaultConfig="editorConfig" mode="default"
              @onCreated="onEditorCreated" />
          </div>
        </el-form-item>
        <el-form-item label="发布状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">立即发布</el-radio>
            <el-radio :value="0">暂存草稿</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, shallowRef } from 'vue';
import Pagehead from '@/components/pagehead.vue';
import TableSearch from '@/components/TableSearch.vue';
import { getCategory, articlePage, addArticle, getArticle, updateArticle, updateArticleStatus, deleteArticle } from '@/api/admin.js';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { fileBaseUrl } from '@/config/index.js';
import request from '@/utils/request.js';
import '@wangeditor/editor/dist/css/style.css';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';

const editorRef = shallowRef();
const toolbarConfig = {};
const editorConfig = { placeholder: '请输入文章内容...' };

const onEditorCreated = (editor) => {
  editorRef.value = editor;
};

onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

const fileInputRef = ref(null);

const triggerUpload = () => {
  fileInputRef.value?.click();
};

const handleFileChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件');
    return;
  }
  if (file.size / 1024 / 1024 > 5) {
    ElMessage.error('图片大小不能超过5MB');
    return;
  }
  const fd = new FormData();
  fd.append('file', file);
  fd.append('businessType', 'ARTICLE');
  fd.append('businessId', formData.id);
  fd.append('businessField', 'cover');
  request
    .post('/file/upload', fd)
    .then((data) => {
      const path = data?.filePath;
      if (path && typeof path === 'string') {
        formData.coverImage = fileBaseUrl + path;
        ElMessage.success('图片上传成功');
      } else {
        ElMessage.error('上传返回数据异常');
      }
    })
    .catch(() => {
      ElMessage.error('图片上传失败');
    })
    .finally(() => {
      e.target.value = '';
    });
};

const dialogVisible = ref(false);
const formRef = ref(null);
const submitting = ref(false);
const editingId = ref(null);
const isEdit = computed(() => editingId.value !== null);

const dialogTitle = computed(() => isEdit.value ? '编辑文章' : '新增文章');

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

const getDefaultForm = () => ({
  id: generateId(),
  title: '',
  content: '',
  coverImage: '',
  categoryId: null,
  summary: '',
  tags: '',
  status: 1,
});

const formData = reactive(getDefaultForm());

const rules = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入文章内容', trigger: 'change' }],
  tags: [{ required: true, message: '请输入标签', trigger: 'blur' }],
};

const openAddDialog = () => {
  editingId.value = null;
  Object.assign(formData, getDefaultForm());
  formRef.value?.clearValidate();
  dialogVisible.value = true;
};

const openEditDialog = async (row) => {
  editingId.value = row.id;
  dialogVisible.value = true;
  try {
    const detail = await getArticle(row.id);
    Object.assign(formData, {
      id: detail.id ?? row.id,
      title: detail.title ?? '',
      content: detail.content ?? '',
      coverImage: detail.coverImage ?? '',
      categoryId: detail.categoryId ?? null,
      summary: detail.summary ?? '',
      tags: detail.tags ?? '',
      status: detail.status ?? 1,
    });
    formRef.value?.clearValidate();
  } catch {
    ElMessage.error('获取文章详情失败');
    dialogVisible.value = false;
  }
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除文章"${row.title}"吗？`, '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    });
  } catch {
    return;
  }
  try {
    await deleteArticle(row.id);
    ElMessage.success('删除成功');
    fetchArticles();
  } catch {
    ElMessage.error('删除失败');
  }
};

const handleChangeStatus = async (row, newStatus) => {
  const label = newStatus === 1 ? '发布' : '下线';
  try {
    await updateArticleStatus(row.id, newStatus);
    ElMessage.success(`${label}成功`);
    fetchArticles();
  } catch {
    ElMessage.error(`${label}失败`);
  }
};

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  try {
    if (isEdit.value) {
      await updateArticle(editingId.value, { ...formData });
      ElMessage.success('编辑成功');
    } else {
      await addArticle({ ...formData });
      ElMessage.success('新增成功');
    }
    dialogVisible.value = false;
    handleSearch();
  } finally {
    submitting.value = false;
  }
};

const categoryOptions = ref([]);
const articleList = ref([]);
const loading = ref(false);

onMounted(async () => {
  const res = await getCategory();
  categoryOptions.value = res.map((item) => ({
    label: item.categoryName,
    value: item.id,
  }));
});

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const lastSearchParams = ref({});

const fetchArticles = async (overrides) => {
  loading.value = true;
  try {
    const params = {
      currentPage: currentPage.value,
      size: pageSize.value,
      ...lastSearchParams.value,
      ...overrides,
    };
    const data = await articlePage(params);
    articleList.value = data.records ?? [];
    total.value = data.total ?? 0;
  } finally {
    loading.value = false;
  }
};

const handleSearch = (formDataRef) => {
  const values = formDataRef?.value ?? {};
  lastSearchParams.value = values;
  currentPage.value = 1;
  fetchArticles();
};

const handlePageChange = (page) => {
  fetchArticles({ currentPage: page });
  currentPage.value = page;
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchArticles();
};

fetchArticles();
const formItems = computed(() => [
  {
    label: '文章标题',
    prop: 'title',
    type: 'input',
    placeholder: '请输入文章标题',
  },
  {
    label: '分类',
    prop: 'categoryId',
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

<style scoped>
:deep(.w-e-toolbar) {
  border-bottom: 1px solid #ccc;
}

:deep(.w-e-text-container) {
  min-height: 300px;
}

.cover-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;
}

.cover-upload:hover {
  border-color: #409eff;
}

.upload-placeholder {
  width: 100px;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8c939d;
  font-size: 12px;
  gap: 4px;
}

.upload-placeholder .el-icon {
  font-size: 24px;
}

.cover-preview {
  width: 100px;
  height: 100px;
  object-fit: cover;
  display: block;
}
</style>