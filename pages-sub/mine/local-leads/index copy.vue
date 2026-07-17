<template>
  <view class="leads-page">
    <!-- 背景装饰光晕 -->
    <view class="page-decor">
      <view class="decor-blob blob-blue"></view>
      <view class="decor-blob blob-purple"></view>
    </view>

    <scroll-view class="page-scroll" scroll-y refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="onRefresh">
      <!-- ========== 顶部主视觉 ========== -->
      <view class="hero">
        <view class="hero-row">
          <view class="hero-info">
            <view class="hero-title-row">
              <text class="hero-title hero-title-gradient">我的本地线索</text>
              <text class="hero-sparkle">🎯</text>
            </view>
            <text class="hero-desc">根据您的产品关键词，匹配本地区近三天的精准需求</text>
          </view>
          <view class="hero-orb">
            <view class="orb-ring orb-ring-1"></view>
            <view class="orb-ring orb-ring-2"></view>
            <view class="hero-orb-inner">
              <text class="hero-orb-icon">📡</text>
            </view>
          </view>
        </view>

        <!-- 统计卡片组 -->
        <view class="stat-row">
          <view class="stat-tile">
            <view class="stat-ico stat-ico-blue"><text class="stat-ico-txt">🔥</text></view>
            <view class="stat-info">
              <text class="stat-num">{{ animStats.total }}</text>
              <text class="stat-label">线索总数</text>
            </view>
          </view>
          <view class="stat-tile">
            <view class="stat-ico stat-ico-purple"><text class="stat-ico-txt">📥</text></view>
            <view class="stat-info">
              <text class="stat-num">{{ animStats.download }}</text>
              <text class="stat-label">下载行为</text>
            </view>
          </view>
          <view class="stat-tile">
            <view class="stat-ico stat-ico-cyan"><text class="stat-ico-txt">👁</text></view>
            <view class="stat-info">
              <text class="stat-num">{{ animStats.browse }}</text>
              <text class="stat-label">浏览行为</text>
            </view>
          </view>
        </view>
      </view>

      <!-- ========== 接收线索按钮区 ========== -->
      <view class="action-zone" v-if="!hasSearched">
        <view class="receive-card">
          <view class="receive-card-glow"></view>
          <view class="receive-icon-wrap">
            <view class="receive-icon-pulse"></view>
            <text class="receive-icon">📡</text>
          </view>
          <text class="receive-title">接收本地线索</text>
          <text class="receive-desc">点击按钮，系统将搜索近三天内本地区与您产品关键词匹配的下载和浏览记录</text>
          <view class="receive-btn" :class="{ 'is-loading': searching }" @tap="onReceiveLeads">
            <view class="receive-btn-shine"></view>
            <view v-if="searching" class="btn-loading-spinner"></view>
            <text class="receive-btn-text">{{ searching ? '正在搜索...' : '接收线索' }}</text>
            <text v-if="!searching" class="receive-btn-arrow">→</text>
          </view>
        </view>
      </view>

      <!-- ========== 搜索中骨架屏 ========== -->
      <view v-if="searching && !list.length" class="skeleton-wrap">
        <view class="skeleton-card" v-for="i in 4" :key="i">
          <view class="skeleton-line skeleton-title"></view>
          <view class="skeleton-tags">
            <view class="skeleton-tag"></view>
            <view class="skeleton-tag"></view>
          </view>
          <view class="skeleton-line skeleton-short"></view>
        </view>
      </view>

      <!-- ========== 线索列表 ========== -->
      <template v-if="hasSearched && !searching">
        <view class="list-head">
          <view class="lh-bar"></view>
          <text class="lh-title">匹配线索</text>
          <text class="lh-count" v-if="list.length">共 {{ list.length }} 条</text>
        </view>

        <view v-if="list.length" class="leads-list">
          <view class="lead-card" v-for="(item, index) in list" :key="item.id || index" :style="{ animationDelay: (0.05 + index * 0.08) + 's' }">
            <!-- 右上角光晕 -->
            <view class="lc-halo" :class="item.actionType === 'download' ? 'lc-halo-blue' : 'lc-halo-cyan'"></view>

            <!-- 头部：行为类型 + 时间 -->
            <view class="lc-head">
              <view class="lc-action-tag" :class="item.actionType === 'download' ? 'tag-download' : 'tag-browse'">
                <text class="lc-action-icon">{{ item.actionType === 'download' ? '📥' : '👁' }}</text>
                <text class="lc-action-text">{{ item.actionType === 'download' ? '下载' : '浏览' }}</text>
              </view>
              <text class="lc-time">{{ formatTime(item.actionTime) }}</text>
            </view>

            <!-- 产品关键词匹配 -->
            <view class="lc-product">
              <text class="lc-product-label">匹配产品</text>
              <text class="lc-product-name">{{ item.productName }}</text>
            </view>

            <!-- 匹配关键词芯片 -->
            <view class="lc-chips">
              <view class="lc-chip" v-for="(kw, ki) in (item.matchKeywords || []).slice(0, 5)" :key="ki">
                <text class="chip-ico">🔑</text>
                <text class="chip-text">{{ kw }}</text>
              </view>
            </view>

            <!-- 用户信息 -->
            <view class="lc-user-row">
              <view class="lc-user-info">
                <image class="lc-user-avatar" :src="item.userLogo ? getProductImageUrlChat(item.userLogo) : defaultAvatar" mode="aspectFill" />
                <view class="lc-user-text">
                  <text class="lc-user-name">{{ item.userName || '匿名用户' }}</text>
                  <text class="lc-user-company" v-if="item.companyName">{{ item.companyName }}</text>
                </view>
              </view>
              <view class="lc-location" v-if="item.distance">
                <text class="lc-location-icon">📍</text>
                <text class="lc-location-text">距您{{ item.distance }}</text>
              </view>
            </view>

            <!-- 底部操作 -->
            <view class="lc-foot">
              <text class="lc-match-level" :class="item.matchLevel === 'high' ? 'level-high' : 'level-normal'">
                {{ item.matchLevel === 'high' ? '🔥 高度匹配' : '✓ 一般匹配' }}
              </text>
              <view class="lc-btn" @tap="onContactLead(item)">
                <text class="lc-btn-text">联系TA</text>
                <text class="lc-btn-arrow">→</text>
              </view>
            </view>
          </view>

          <view class="footer-tip">
            <text>· 已展示全部线索 ·</text>
          </view>
        </view>

        <!-- 空状态 -->
        <empty-state
          v-else
          title="暂无匹配线索"
          hint="近三天本地区暂无与您产品关键词匹配的下载或浏览记录"
        />
      </template>
    </scroll-view>
  </view>
</template>

<script>
import EmptyState from '@/common/components/empty-state.vue'
import { receiveLocalLeads, getLocalLeadsList } from '@/static/api/index.js'
import { getProductImageUrlChat } from '@/common/utils/index.js'

export default {
  components: {
    EmptyState
  },
  data() {
    return {
      list: [], // 线索列表数据
      searching: false, // 是否正在搜索
      hasSearched: false, // 是否已执行过搜索
      refreshing: false, // 下拉刷新状态
      animStats: { total: 0, download: 0, browse: 0 }, // 顶部统计数字（动画补间显示用）
      _tweenTimers: {}, // 内部计时器存储
      defaultAvatar: 'https://img2cdn.global-dsc.cn/dgzz_img/8520f53eeff21f5a388f30b67e54e287.png'
    }
  },
  computed: {
    // ----------- 下载行为数量
    downloadCount() {
      return this.list.filter(item => item.actionType === 'download').length
    },
    // ----------- 浏览行为数量
    browseCount() {
      return this.list.filter(item => item.actionType === 'browse').length
    }
  },
  watch: {
    // ----------- 监听列表总数变化触发动画
    list: {
      handler() {
        this.tweenStat('total', this.list.length)
        this.tweenStat('download', this.downloadCount)
        this.tweenStat('browse', this.browseCount)
      },
      deep: true
    }
  },
  onLoad() {
    // 页面加载时先获取已有线索列表
    this.fetchExistingLeads()
  },
  methods: {
    getProductImageUrlChat,

    // ----------- 数字补间动画：从当前值缓动到目标值
    tweenStat(key, target) {
      const start = this.animStats[key] || 0
      if (start === target) return
      if (this._tweenTimers[key]) clearInterval(this._tweenTimers[key])
      const duration = 900 // 总时长 ms
      const startTime = Date.now()
      this._tweenTimers[key] = setInterval(() => {
        const t = Math.min(1, (Date.now() - startTime) / duration)
        const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic 缓动
        this.animStats[key] = Math.round(start + (target - start) * eased)
        if (t >= 1) clearInterval(this._tweenTimers[key])
      }, 24)
    },

    // ----------- 获取已有线索列表（页面加载时调用）
    async fetchExistingLeads() {
      try {
        const res = await getLocalLeadsList({ days: 3 })
        const data = res?.data || {}
        const items = data.list || []
        if (items.length) {
          this.list = items
          this.hasSearched = true
        }
      } catch (e) {
        // 接口异常静默处理
      }
    },

    // ----------- 点击接收线索按钮，搜索近三天本地下载浏览信息
    async onReceiveLeads() {
      if (this.searching) return
      this.searching = true
      try {
        // TODO: 临时死数据，调试布局用，后续替换为真实接口
        await new Promise(resolve => setTimeout(resolve, 1200))
        const items = [
          {
            id: 1,
            actionType: 'download',
            actionTime: Date.now() - 2 * 3600 * 1000,
            productName: '高精度数控车床 CK6140',
            matchKeywords: ['数控车床', 'CK6140', '高精度'],
            userName: '张工',
            companyName: '深圳精密机械有限公司',
            userLogo: '',
            distance: '3.2km',
            matchLevel: 'high'
          },
          {
            id: 2,
            actionType: 'browse',
            actionTime: Date.now() - 5 * 3600 * 1000,
            productName: '工业机器人六轴机械臂',
            matchKeywords: ['机械臂', '六轴', '工业机器人'],
            userName: '李经理',
            companyName: '东莞自动化设备厂',
            userLogo: '',
            distance: '8.7km',
            matchLevel: 'normal'
          },
          {
            id: 3,
            actionType: 'download',
            actionTime: Date.now() - 26 * 3600 * 1000,
            productName: 'PLC可编程控制器 S7-1200',
            matchKeywords: ['PLC', 'S7-1200', '西门子'],
            userName: '王总',
            companyName: '广州智能科技股份',
            userLogo: '',
            distance: '12.5km',
            matchLevel: 'high'
          },
          {
            id: 4,
            actionType: 'browse',
            actionTime: Date.now() - 48 * 3600 * 1000,
            productName: '液压伺服阀 D633-7350',
            matchKeywords: ['伺服阀', '液压', 'D633'],
            userName: '匿名用户',
            companyName: '',
            userLogo: '',
            distance: '6.1km',
            matchLevel: 'normal'
          }
        ]
        this.list = items
        this.hasSearched = true
        if (items.length) {
          uni.showToast({ title: `找到${items.length}条匹配线索`, icon: 'success' })
        } else {
          uni.showToast({ title: '近三天暂无匹配线索', icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: '搜索失败，请稍后重试', icon: 'none' })
      } finally {
        this.searching = false
      }
    },

    // ----------- 点击联系线索用户
    onContactLead(item) {
      if (!item || !item.userId) {
        uni.showToast({ title: '暂无用户信息', icon: 'none' })
        return
      }
      // 跳转到用户详情页
      uni.navigateTo({
        url: `/common/components/staff-detail?staffInfo=${encodeURIComponent(JSON.stringify(item))}`
      })
    },

    // ----------- 格式化时间戳
    formatTime(ts) {
      if (!ts) return '暂无时间'
      const d = new Date(ts * 1000)
      const M = String(d.getMonth() + 1).padStart(2, '0')
      const D = String(d.getDate()).padStart(2, '0')
      const h = String(d.getHours()).padStart(2, '0')
      const m = String(d.getMinutes()).padStart(2, '0')
      return `${M}-${D} ${h}:${m}`
    },

    // ----------- 下拉刷新
    onRefresh() {
      this.refreshing = true
      this.fetchExistingLeads().finally(() => {
        this.refreshing = false
      })
    }
  }
}
</script>

<style scoped lang="scss">
page {
  background: #f5f7fc;
}

.leads-page {
  position: relative;
  min-height: 100vh;
  background: #f5f7fc;
  overflow: hidden;
}

.page-scroll {
  position: relative;
  z-index: 2;
  height: 100vh;
  box-sizing: border-box;
}

// ==================== 背景光晕装饰
.page-decor {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.decor-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60rpx);
  opacity: 0.55;
}

.blob-blue {
  top: -120rpx;
  left: -100rpx;
  width: 420rpx;
  height: 420rpx;
  background: #a5b4fc;
}

.blob-purple {
  top: -60rpx;
  right: -120rpx;
  width: 360rpx;
  height: 360rpx;
  background: #c4b5fd;
}

// ==================== 顶部主视觉
.hero {
  padding: 36rpx 32rpx 8rpx;
}

.hero-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-info {
  flex: 1;
}

.hero-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.hero-title {
  font-size: 46rpx;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
  letter-spacing: 0.5rpx;
}

// 标题渐变文字效果 - 蓝紫色系
.hero-title-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #a855f7 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.hero-sparkle {
  font-size: 30rpx;
  line-height: 1;
}

.hero-desc {
  margin-top: 12rpx;
  font-size: 25rpx;
  color: #64748b;
  line-height: 1.45;
}

// Hero Orb - 深蓝金色系
.hero-orb {
  position: relative;
  flex-shrink: 0;
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 14rpx 30rpx rgba(99, 102, 241, 0.35), 0 4rpx 10rpx rgba(168, 85, 247, 0.2);
}

.orb-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2rpx solid rgba(99, 102, 241, 0.45);
  pointer-events: none;
}

.hero-orb-inner {
  width: 86rpx;
  height: 86rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-orb-icon {
  font-size: 36rpx;
  line-height: 1;
}

// 统计卡片组
.stat-row {
  display: flex;
  gap: 14rpx;
  margin-top: 36rpx;
}

.stat-tile {
  flex: 1;
  min-width: 0;
  padding: 22rpx 18rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20rpx);
  border: 1rpx solid transparent;
  box-shadow: 0 8rpx 22rpx rgba(99, 102, 241, 0.08);
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.stat-ico {
  flex-shrink: 0;
  width: 64rpx;
  height: 64rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-ico-txt {
  font-size: 30rpx;
}

.stat-ico-blue {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.18);
}

.stat-ico-purple {
  background: linear-gradient(135deg, #ede9fe, #ddd6fe);
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(139, 92, 246, 0.18);
}

.stat-ico-cyan {
  background: linear-gradient(135deg, #cffafe, #a5f3fc);
  box-shadow: 0 4rpx 12rpx rgba(6, 182, 212, 0.18);
}

.stat-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.stat-num {
  font-size: 34rpx;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
}

.stat-label {
  font-size: 21rpx;
  color: #94a3b8;
}

// ==================== 接收线索按钮区
.action-zone {
  padding: 48rpx 32rpx 32rpx;
}

.receive-card {
  position: relative;
  overflow: hidden;
  padding: 56rpx 40rpx 48rpx;
  border-radius: 32rpx;
  background: linear-gradient(160deg, #eef2ff 0%, #e0e7ff 50%, #f3e8ff 100%);
  border: none;
  box-shadow: 0 16rpx 40rpx rgb(200 201 232);
  text-align: center;
}

.receive-card-glow {
  position: absolute;
  top: -60rpx;
  right: -60rpx;
  width: 240rpx;
  height: 240rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.28) 0%, transparent 70%);
  pointer-events: none;
}

.receive-icon-wrap {
  position: relative;
  width: 120rpx;
  height: 120rpx;
  margin: 0 auto 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.receive-icon-pulse {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.28);
  animation: receivePulse 2s ease-out infinite;
}

.receive-icon-pulse::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2rpx solid rgba(99, 102, 241, 0.25);
  animation: receivePulse 2s ease-out infinite;
  animation-delay: 0.6s;
}

.receive-icon {
  position: relative;
  font-size: 56rpx;
  line-height: 1;
  z-index: 1;
}

.receive-title {
  display: block;
  font-size: 36rpx;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 16rpx;
}

.receive-desc {
  display: block;
  font-size: 25rpx;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 40rpx;
  padding: 0 20rpx;
}

// 接收线索按钮
.receive-btn {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 26rpx 64rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%);
  box-shadow: 0 12rpx 28rpx rgba(99, 102, 241, 0.32);
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.97);
  }

  &.is-loading {
    opacity: 0.85;
  }
}

.receive-btn-shine {
  position: absolute;
  top: 0;
  left: -60%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent);
  transform: skewX(-20deg);
  animation: btnShimmer 3.5s ease-in-out infinite;
}

.receive-btn-text {
  position: relative;
  z-index: 1;
  font-size: 30rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2rpx;
}

.receive-btn-arrow {
  position: relative;
  z-index: 1;
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.btn-loading-spinner {
  position: relative;
  z-index: 1;
  width: 30rpx;
  height: 30rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

// ==================== 列表区标题
.list-head {
  display: flex;
  align-items: center;
  margin: 44rpx 32rpx 20rpx;
}

.lh-bar {
  width: 8rpx;
  height: 28rpx;
  border-radius: 6rpx;
  margin-right: 14rpx;
  background: linear-gradient(180deg, #3b82f6, #8b5cf6);
}

.lh-title {
  flex: 1;
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
}

.lh-count {
  font-size: 22rpx;
  color: #94a3b8;
}

// ==================== 线索列表
.leads-list,
.skeleton-wrap {
  padding: 0 28rpx 56rpx;
}

.lead-card {
  position: relative;
  overflow: hidden;
  margin-bottom: 22rpx;
  padding: 28rpx 30rpx 26rpx;
  border-radius: 28rpx;
  background: #fff;
  border: none;
  box-shadow: 0 10rpx 28rpx rgba(15, 23, 42, 0.06);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:active {
    transform: scale(0.99);
    box-shadow: 0 4rpx 14rpx rgba(15, 23, 42, 0.06);
  }
}

// 卡片右上角光晕
.lc-halo {
  position: absolute;
  right: -80rpx;
  top: -80rpx;
  width: 220rpx;
  height: 220rpx;
  border-radius: 50%;
  pointer-events: none;
}

.lc-halo-blue {
  background: radial-gradient(circle, rgba(99, 102, 241, 0.16) 0%, rgba(168, 85, 247, 0.07) 40%, transparent 70%);
}

.lc-halo-cyan {
  background: radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.06) 40%, transparent 70%);
}

// 头部：行为标签 + 时间
.lc-head {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18rpx;
}

.lc-action-tag {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
}

.tag-download {
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  border: none;
  box-shadow: 0 2rpx 8rpx rgba(99, 102, 241, 0.1);
}

.tag-browse {
  background: linear-gradient(135deg, #ecfeff, #cffafe);
  border: none;
  box-shadow: 0 2rpx 8rpx rgba(6, 182, 212, 0.1);
}

.lc-action-icon {
  font-size: 24rpx;
}

.lc-action-text {
  font-size: 24rpx;
  font-weight: 700;
}

.tag-download .lc-action-text {
  color: #4f46e5;
}

.tag-browse .lc-action-text {
  color: #0891b2;
}

.lc-time {
  font-size: 24rpx;
  color: #94a3b8;
}

// 产品匹配
.lc-product {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 18rpx;
}

.lc-product-label {
  font-size: 24rpx;
  color: #94a3b8;
  flex-shrink: 0;
}

.lc-product-name {
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 关键词芯片
.lc-chips {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 22rpx;
}

.lc-chip {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  background: linear-gradient(135deg, #ede9fe, #ddd6fe);
  border: none;
  box-shadow: 0 2rpx 8rpx rgba(139, 92, 246, 0.1);

  .chip-ico {
    font-size: 20rpx;
  }

  .chip-text {
    font-size: 23rpx;
    font-weight: 600;
    color: #6d28d9;
  }
}

// 用户信息行
.lc-user-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-top: 1rpx dashed #eef0f6;
}

.lc-user-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
  min-width: 0;
}

.lc-user-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  flex-shrink: 0;
  background: #f0f2f5;
}

.lc-user-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.lc-user-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lc-user-company {
  font-size: 23rpx;
  color: #94a3b8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lc-location {
  display: flex;
  align-items: center;
  gap: 4rpx;
  flex-shrink: 0;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: #f0f9ff;
}

.lc-location-icon {
  font-size: 22rpx;
}

.lc-location-text {
  font-size: 22rpx;
  color: #0284c7;
}

// 底部操作
.lc-foot {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20rpx;
  border-top: 1rpx dashed #eef0f6;
}

.lc-match-level {
  font-size: 24rpx;
  font-weight: 600;
}

.level-high {
  color: #7c3aed;
}

.level-normal {
  color: #64748b;
}

.lc-btn {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 26rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  box-shadow: 0 8rpx 18rpx rgba(99, 102, 241, 0.28);
}

.lc-btn-text {
  position: relative;
  z-index: 1;
  font-size: 24rpx;
  font-weight: 600;
  color: #fff;
}

.lc-btn-arrow {
  position: relative;
  z-index: 1;
  font-size: 26rpx;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

// ==================== 骨架屏
.skeleton-card {
  margin-bottom: 22rpx;
  padding: 28rpx;
  border-radius: 26rpx;
  background: #fff;
  box-shadow: 0 10rpx 26rpx rgba(33, 57, 96, 0.05);
}

.skeleton-line {
  height: 28rpx;
  border-radius: 8rpx;
  background: #e9eef5;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-title {
  width: 75%;
  height: 32rpx;
  margin-bottom: 24rpx;
}

.skeleton-tags {
  display: flex;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.skeleton-tag {
  width: 110rpx;
  height: 40rpx;
  border-radius: 999rpx;
  background: #e9eef5;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-short {
  width: 40%;
}

// ==================== 底部提示
.footer-tip {
  padding: 28rpx 0 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  font-size: 23rpx;
  color: #94a3b8;
  letter-spacing: 4rpx;
}

// ==================== 动画
@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// 通用淡入上移
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28rpx); }
  to { opacity: 1; transform: translateY(0); }
}

// 缩放淡入
@keyframes popIn {
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}

// 背景光晕漂浮
@keyframes blobDrift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30rpx, 20rpx) scale(1.1); }
}

.blob-blue {
  animation: blobDrift 11s ease-in-out infinite;
}

.blob-purple {
  animation: blobDrift 13s ease-in-out infinite reverse;
}

// Hero 信息淡入
.hero-info {
  animation: fadeUp 0.6s 0.05s ease-out both;
}

// 标题表情扭动
@keyframes sparkleTwinkle {
  0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
  50% { opacity: 0.55; transform: scale(1.25) rotate(18deg); }
}

.hero-sparkle {
  display: inline-block;
  animation: sparkleTwinkle 2.2s ease-in-out infinite;
}

// Hero Orb 弹入 + 呼吸
@keyframes orbBreath {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 14rpx 30rpx rgba(99, 102, 241, 0.35), 0 4rpx 10rpx rgba(168, 85, 247, 0.2);
  }
  50% {
    transform: scale(1.06);
    box-shadow: 0 18rpx 40rpx rgba(99, 102, 241, 0.5), 0 6rpx 16rpx rgba(168, 85, 247, 0.3);
  }
}

.hero-orb {
  animation: popIn 0.6s 0.2s ease-out both, orbBreath 3s ease-in-out infinite 0.9s;
}

// Orb 内核旋转高光环
.hero-orb-inner {
  position: relative;
  overflow: hidden;
}

.hero-orb-inner::after {
  content: '';
  position: absolute;
  inset: -50%;
  background: conic-gradient(from 0deg, transparent 60%, rgba(255, 255, 255, 0.5) 75%, transparent 90%);
  animation: spin 4s linear infinite;
}

// 统计卡片错峰淡入
.stat-tile {
  animation: fadeUp 0.55s ease-out both;
}

.stat-tile:nth-child(1) { animation-delay: 0.25s; }
.stat-tile:nth-child(2) { animation-delay: 0.35s; }
.stat-tile:nth-child(3) { animation-delay: 0.45s; }

// 图标悬浮微弹
@keyframes icoBob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4rpx); }
}

.stat-ico {
  animation: icoBob 3s ease-in-out infinite;
}

.stat-tile:nth-child(2) .stat-ico { animation-delay: 0.4s; }
.stat-tile:nth-child(3) .stat-ico { animation-delay: 0.8s; }

// 列表标题淡入
.list-head {
  animation: fadeUp 0.5s 0.55s ease-out both;
}

// 线索卡片错峰淡入
.lead-card {
  animation: fadeUp 0.55s ease-out both;
}

// 接收按钮光带扫过
@keyframes btnShimmer {
  0% { left: -60%; }
  55%, 100% { left: 160%; }
}

// 接收图标脉冲扩散
@keyframes receivePulse {
  0% { transform: scale(1); opacity: 0.7; }
  100% { transform: scale(2.2); opacity: 0; }
}

// 接收卡片淡入
.receive-card {
  animation: fadeUp 0.6s 0.3s ease-out both;
}

// Orb 外圈脉冲环
@keyframes orbRingPulse {
  0% { transform: scale(1); opacity: 0.7; }
  100% { transform: scale(2); opacity: 0; }
}

.orb-ring {
  animation: orbRingPulse 2.4s ease-out infinite;
}

.orb-ring-2 {
  animation-delay: 1.2s;
}

// 卡片光晕呼吸
@keyframes haloBreath {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.12); }
}

.lc-halo {
  animation: haloBreath 4s ease-in-out infinite;
}

// 标题渐变流动
@keyframes gradientFlow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.hero-title-gradient {
  background-size: 200% 200%;
  animation: gradientFlow 5s ease-in-out infinite;
}

// 联系按钮光带
.lc-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: -60%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent);
  transform: skewX(-20deg);
  animation: btnShimmer 3.5s ease-in-out infinite;
}

// 按钮箭头微移
@keyframes arrowSlide {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(4rpx); }
}

.lc-btn-arrow {
  animation: arrowSlide 1.6s ease-in-out infinite;
}
</style>
