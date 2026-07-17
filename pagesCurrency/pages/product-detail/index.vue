<template>
  <view class="bridge-page">
    <loading-overlay :visible="true" text="正在跳转产品详情..." />
  </view>
</template>

<script>
import LoadingOverlay from '@/common/components/loading-overlay.vue'
export default {
  components: { LoadingOverlay },
  data() {
    return {
      prodId: '' // 产品ID，从路由参数获取
    }
  },
  onLoad(options) {
    this.prodId = options.prodId || ''
    this.goProductDetail()
  },
  methods: {
    // ----------- 跳转到大工程师小程序的产品详情页
    goProductDetail() {
      if (!this.prodId) {
        uni.showToast({ title: '产品ID缺失', icon: 'none' })
        setTimeout(() => uni.navigateBack(), 1500)
        return
      }
      // 跳转到大国工匠小程序的产品详情页
      uni.navigateToMiniProgram({
        appId: 'wx795238050c6d6512',
        path: `/pagesCurrency/pages/product-detail/index?prodId=${this.prodId}`,
        success: () => {
          // 跳转成功后返回上一页，避免用户返回时停留在桥接页
          setTimeout(() => uni.navigateBack(), 500)
        },
        fail: (err) => {
          console.error('跳转小程序失败:', err)
          uni.showToast({ title: '跳转失败', icon: 'none' })
          setTimeout(() => uni.navigateBack(), 1500)
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
page {
  background: #f5f7fa;
}
.bridge-page {
  height: 100vh;
}
</style>
