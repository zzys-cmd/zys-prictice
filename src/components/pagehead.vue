<template>
  <div class="page-head">
    <p class="page-title">{{ props.title }}</p>
    <div class="page-actions">
      <slot name="buttons"></slot>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  title: {
    type: String,
    default: '页面标题'
  }
})

</script>
<style lang="scss">
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .page-title {
    font-size: 24px;
    font-weight: 500;
    color: #2d3748;
  }


}
</style>