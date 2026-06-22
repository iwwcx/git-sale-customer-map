<!-- 搜资源-AI助手 tab：AI智能搜索助手 -->
<template>
  <view class="search-ai-assistant">
    <view class="control-card">
      <slot name="header" />
    </view>
    {{ aiData.report }} --------
    <view class="content-wrap">
      <div v-html="aiData.report"></div>
    </view>
    <loading-overlay :visible="showLoading" text="AI正在分析..." />
  </view>
</template>

<script>
import { deepseekQuery, getUserConfig } from '@/static/api/index.js'

export default {
  name: 'SearchAiAssistant',
  data() {
    return {
      aiData: null
    }
  },
  mounted() {
    this.getUserConfig()
  },
  methods: {
    async getUserConfig() {
      const resConfig = await getUserConfig()
      const res = await deepseekQuery({
        interestedProducts: resConfig.data.productKeywords,
        lat: uni.getStorageSync('myLatitude'),
        lng: uni.getStorageSync('myLongitude')
      })
      this.aiData = res.data
    }
  }
}
</script>

<style lang="scss" scoped>
.search-ai-assistant {
  width: 100%;
  min-height: 100vh;
  background-color: #f4f6fa;
  padding-bottom: 40rpx;
  box-sizing: border-box;
}

.control-card {
  position: sticky;
  top: 0;
  z-index: 10;
  margin: 0 24rpx 22rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 28rpx;
  box-shadow: 0 8rpx 26rpx rgba(20, 45, 90, 0.06);
  border: 1rpx solid rgba(0, 0, 0, 0.03);
}
</style>
