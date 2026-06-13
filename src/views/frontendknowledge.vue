<template>
  <div class="knowledge-container">
    <!-- ========== 头部（仅列表页显示） ========== -->
    <div v-if="viewMode === 'list'" class="header-section">
      <div class="header-content">
        <div class="header-icon">📖</div>
        <div>
          <h1 class="header-title">心理健康知识库</h1>
          <p class="header-subtitle">探索心理健康知识，呵护心灵成长</p>
        </div>
      </div>
    </div>

    <!-- ========== 列表视图 ========== -->
    <template v-if="viewMode === 'list'">
      <div class="main-body">
        <!-- 左侧：推荐阅读 -->
        <aside class="sidebar">
          <div class="recommend-card">
            <div class="recommend-title">推荐阅读</div>
            <div class="recommend-list">
              <div
                v-for="(item, index) in recommendList"
                :key="item.id"
                class="recommend-item"
                @click="openDetail(item)"
              >
                <div class="rank-bar" :class="'rank-' + (index + 1)"></div>
                <div class="recommend-info">
                  <div class="recommend-article-title">{{ item.title }}</div>
                  <div class="recommend-meta">阅读量：{{ item.readCount || item.viewCount || 0 }}</div>
                </div>
              </div>
              <div v-if="recommendList.length === 0" class="no-data">暂无推荐</div>
            </div>
          </div>
        </aside>

        <!-- 右侧：文章列表 -->
        <main class="article-area">
          <div class="category-tabs" v-if="categories.length > 0">
            <span class="category-tab" :class="{ active: currentCategory === '' }" @click="handleCategoryChange('')">全部</span>
            <span v-for="cat in categories" :key="cat.id" class="category-tab" :class="{ active: currentCategory === cat.id }" @click="handleCategoryChange(cat.id)">{{ cat.name }}</span>
          </div>

          <div class="article-list" v-loading="loading">
            <div v-if="articleList.length === 0 && !loading" class="empty-state">
              <div class="empty-icon">📭</div>
              <p>暂无文章</p>
            </div>
            <div v-for="article in articleList" :key="article.id" class="article-card" @click="openDetail(article)">
              <div class="card-thumbnail">
                <img v-if="article.coverImage" :src="article.coverImage" :alt="article.title" class="thumbnail-img" />
                <div v-else class="thumbnail-placeholder"><span>🧠</span></div>
              </div>
              <div class="card-body">
                <div class="card-header">
                  <h3 class="card-title">{{ article.title }}</h3>
                  <span v-if="article.categoryName" class="card-tag">{{ getTagName(article.categoryName) }}</span>
                </div>
                <div class="card-meta">
                  <span class="meta-item"><span class="meta-icon">👤</span>{{ article.author || '系统管理员' }}</span>
                  <span class="meta-item"><span class="meta-icon">📅</span>{{ formatDate(article.createTime || article.publishDate || article.createdAt) }}</span>
                  <span class="meta-item"><span class="meta-icon">👁️</span>观看人数：{{ article.readCount || article.viewCount || 0 }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="pagination-wrapper" v-if="total > pageSize">
            <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="total" layout="prev, pager, next" background @current-change="handlePageChange" />
          </div>
        </main>
      </div>
    </template>

    <!-- ========== 详情视图 ========== -->
    <template v-else>
      <div class="detail-body">
        <!-- 分类标签 + 日期 -->
        <div class="detail-top-bar">
          <span v-if="detail.categoryName" class="detail-category-tag" @click="backToCategory(getTagName(detail.categoryName))">{{ getTagName(detail.categoryName) }}</span>
          <span class="detail-date">📅 {{ formatDate(detail.createTime || detail.publishDate || detail.createdAt) }}</span>
        </div>

        <!-- 标题 -->
        <h1 class="detail-title">{{ detail.title }}</h1>

        <!-- 摘要横幅 -->
        <div v-if="detail.summary" class="detail-summary">
          <div class="summary-bar"></div>
          <p>{{ detail.summary }}</p>
        </div>

        <!-- 元信息 -->
        <div class="detail-meta-row">
          <span class="meta-item">👤 {{ detail.author || '系统管理员' }}</span>
          <span class="meta-item">💬 {{ detail.readCount || detail.viewCount || 0 }} 次阅读</span>
        </div>

        <!-- 正文 -->
        <div class="detail-content-card">
          <MarkdownRenderer v-if="detail.content" :content="detail.content" :is-ai-message="false" />
          <div v-else class="no-content">暂无内容</div>
        </div>

        <!-- 相关标签 -->
        <div v-if="detailTags.length > 0" class="detail-tags-section">
          <h3 class="tags-title">相关标签</h3>
          <div class="tags-row">
            <span v-for="tag in detailTags" :key="tag" class="detail-tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { articlePage, getCategory as fetchCategoryTree, getArticle } from '@/api/admin.js'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'

// 视图模式：list | detail
const viewMode = ref('list')

// 列表状态
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)
const currentCategory = ref('')
const articleList = ref([])
const recommendList = ref([])
const categories = ref([])

// 详情状态
const detail = ref({})
const detailTags = ref([])

// 从数据中提取真正文章（过滤分类数据）
const isArticle = (item) => item && typeof item.title === 'string' && item.title.length > 0 && item.sortOrder === undefined

// 获取分类名（兼容字符串/对象）
const getTagName = (cat) => {
  if (!cat) return ''
  if (typeof cat === 'string') return cat
  if (typeof cat === 'object') return cat.name || cat.categoryName || ''
  return String(cat)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ===== 列表相关 =====
const fetchArticles = async () => {
  loading.value = true
  try {
    const res = await articlePage({ sortField: 'createTime', sortDirection: 'desc', currentPage: String(currentPage.value), size: String(pageSize.value) })
    let list = Array.isArray(res) ? res : (res?.records || res?.list || [])
    articleList.value = list.filter(isArticle)
    total.value = res?.total || articleList.value.length
  } catch (e) {
    articleList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const fetchRecommend = async () => {
  try {
    const res = await articlePage({ sortField: 'readCount', sortDirection: 'desc', currentPage: '1', size: '5' })
    let list = Array.isArray(res) ? res : (res?.records || res?.list || [])
    recommendList.value = list.filter(isArticle)
  } catch (e) { recommendList.value = [] }
}

const fetchCategories = async () => {
  try {
    const res = await fetchCategoryTree()
    if (Array.isArray(res)) categories.value = res
    else if (res && Array.isArray(res.list)) categories.value = res.list
    else if (res && Array.isArray(res.tree)) categories.value = res.tree
    else categories.value = []
  } catch (e) { categories.value = [] }
}

const handleCategoryChange = (catId) => { currentCategory.value = catId; currentPage.value = 1; fetchArticles() }
const handlePageChange = (page) => { currentPage.value = page; fetchArticles() }

// ===== 详情相关 =====
const openDetail = async (article) => {
  if (article.content) {
    detail.value = { ...article }
  } else {
    try {
      const res = await getArticle(article.id)
      detail.value = { ...article, ...(res || {}) }
    } catch (e) {
      detail.value = { ...article }
    }
  }
  // 提取标签（兼容多种字段名）
  const tags = detail.value.tags || detail.value.relatedTags || detail.value.tagList || []
  detailTags.value = typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags
  viewMode.value = 'detail'
  window.scrollTo(0, 0)
}

// 返回列表（可按分类筛选）
const backToCategory = (catName) => {
  viewMode.value = 'list'
  detail.value = {}
  detailTags.value = []
  // 尝试匹配分类
  const cat = categories.value.find(c => c.name === catName || c.categoryName === catName)
  if (cat) {
    currentCategory.value = cat.id
    fetchArticles()
  }
}

onMounted(() => {
  fetchArticles()
  fetchRecommend()
  fetchCategories()
})
</script>

<style lang="scss" scoped>
.knowledge-container { min-height: 100vh; background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%); }

// ===== 头部 =====
.header-section {
  background: linear-gradient(135deg, #F5A623 0%, #9B51E0 100%);
  color: white; padding: 40px 60px; display: flex; align-items: center;
  .header-content { display: flex; align-items: center; gap: 16px;
    .header-icon { font-size: 42px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15)); }
    .header-title { font-size: 30px; font-weight: 700; margin: 0; }
    .header-subtitle { font-size: 15px; margin: 6px 0 0; opacity: 0.85; }
  }
}

// ===== 列表 - 两栏 =====
.main-body { margin: 0 auto; width: 1100px; padding: 24px 20px; display: flex; gap: 24px; align-items: flex-start; }

.sidebar { width: 280px; flex-shrink: 0; }
.recommend-card {
  background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); position: sticky; top: 20px;
  .recommend-title { font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #f3f4f6; }
  .recommend-list { display: flex; flex-direction: column; gap: 2px;
    .recommend-item { display: flex; align-items: stretch; cursor: pointer; border-radius: 8px; overflow: hidden; transition: 0.2s;
      &:hover { background: #f9fafb; }
      .rank-bar { width: 4px; flex-shrink: 0; border-radius: 2px; margin: 8px 0;
        &.rank-1 { background: #ef4444; } &.rank-2 { background: #f59e0b; } &.rank-3 { background: #10b981; } &.rank-4 { background: #3b82f6; } &.rank-5 { background: #8b5cf6; }
      }
      .recommend-info { padding: 10px 12px; flex: 1; min-width: 0;
        .recommend-article-title { font-size: 14px; font-weight: 500; color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
        .recommend-meta { font-size: 12px; color: #9ca3af; }
      }
    }
    .no-data { text-align: center; color: #9ca3af; font-size: 14px; padding: 20px 0; }
  }
}

.article-area { flex: 1; min-width: 0; }
.category-tabs { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap;
  .category-tab { padding: 6px 18px; border-radius: 20px; font-size: 14px; color: #6b7280; background: #f3f4f6; cursor: pointer; transition: 0.2s;
    &:hover { color: #F5A623; background: #fef3c7; }
    &.active { color: #fff; background: linear-gradient(135deg, #F5A623, #9B51E0); font-weight: 500; }
  }
}

.article-list { display: flex; flex-direction: column; gap: 16px; }
.article-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; gap: 16px; cursor: pointer; transition: 0.3s;
  &:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.1); transform: translateY(-2px); }
  .card-thumbnail { width: 120px; height: 80px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: #fef9e7;
    .thumbnail-img { width: 100%; height: 100%; object-fit: cover; }
    .thumbnail-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 32px; background: linear-gradient(135deg, #fdf2e9, #fef9e7); }
  }
  .card-body { flex: 1; min-width: 0;
    .card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
      .card-title { font-size: 18px; font-weight: 600; color: #1f2937; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
      .card-tag { flex-shrink: 0; padding: 3px 10px; border-radius: 12px; font-size: 12px; color: #3b82f6; background: #eff6ff; font-weight: 500; }
    }
    .card-meta { display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
      .meta-item { font-size: 13px; color: #9ca3af; display: flex; align-items: center; gap: 4px; .meta-icon { font-size: 14px; } }
    }
  }
}
.empty-state { text-align: center; padding: 60px 0; color: #9ca3af; .empty-icon { font-size: 48px; margin-bottom: 12px; } p { font-size: 16px; } }
.pagination-wrapper { margin-top: 24px; display: flex; justify-content: center; }

// ===== 详情 - 单栏布局 =====
.detail-body {
  margin: 0 auto;
  max-width: 800px;
  padding: 32px 20px 60px;
  background: #fff;
}

.detail-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  .detail-category-tag {
    display: inline-block;
    padding: 4px 14px;
    border-radius: 14px;
    font-size: 13px;
    color: #1e40af;
    background: #dbeafe;
    cursor: pointer;
    font-weight: 500;
    transition: 0.2s;

    &:hover { background: #bfdbfe; }
  }

  .detail-date {
    font-size: 14px;
    color: #6b7280;
  }
}

.detail-title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 16px;
  line-height: 1.4;
}

.detail-summary {
  display: flex;
  gap: 12px;
  background: #f0fdf4;
  border-radius: 8px;
  padding: 14px 18px;
  margin-bottom: 16px;

  .summary-bar {
    width: 4px;
    flex-shrink: 0;
    background: #22c55e;
    border-radius: 2px;
  }

  p {
    margin: 0;
    font-size: 15px;
    color: #374151;
    line-height: 1.6;
  }
}

.detail-meta-row {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;

  .meta-item {
    font-size: 14px;
    color: #6b7280;
  }
}

.detail-content-card {
  font-size: 15px;
  color: #374151;
  line-height: 1.8;

  :deep(h1) { font-size: 24px; margin: 28px 0 14px; color: #111827; }
  :deep(h2) { font-size: 20px; margin: 24px 0 12px; color: #1f2937; }
  :deep(h3) { font-size: 17px; margin: 20px 0 10px; color: #1f2937; }
  :deep(h4) { font-size: 15px; margin: 16px 0 8px; color: #374151; }
  :deep(p) { line-height: 1.8; margin: 0 0 14px; color: #374151; }
  :deep(ul), :deep(ol) { padding-left: 24px; margin: 8px 0 18px;
    li { line-height: 1.8; margin-bottom: 6px; color: #374151; }
  }
  :deep(blockquote) { border-left: 4px solid #e5e7eb; padding: 10px 18px; margin: 14px 0; background: #f9fafb; border-radius: 0 6px 6px 0; color: #6b7280; }
  :deep(code) { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
  :deep(pre) { background: #1f2937; color: #e5e7eb; padding: 16px; border-radius: 8px; overflow-x: auto; code { background: none; padding: 0; } }
  :deep(img) { max-width: 100%; border-radius: 8px; }
  :deep(table) { width: 100%; border-collapse: collapse; margin: 16px 0;
    th, td { border: 1px solid #e5e7eb; padding: 10px 14px; text-align: left; }
    th { background: #f9fafb; font-weight: 600; }
  }

  .no-content { text-align: center; color: #9ca3af; padding: 60px 0; font-size: 16px; }
}

// 相关标签
.detail-tags-section {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #f3f4f6;

  .tags-title {
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    margin: 0 0 12px;
  }

  .tags-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;

    .detail-tag {
      padding: 6px 16px;
      border-radius: 16px;
      font-size: 13px;
      color: #6b7280;
      background: #f3f4f6;
    }
  }
}

// ===== 响应式 =====
@media (max-width: 1024px) {
  .header-section { padding: 28px 24px; }
  .main-body { width: 100%; flex-direction: column; padding: 16px; }
  .sidebar { width: 100%; }
  .recommend-card { position: static; }
  .article-card { flex-direction: column; .card-thumbnail { width: 100%; height: 160px; } }
  .detail-body { padding: 24px 16px 40px; }
}
</style>
