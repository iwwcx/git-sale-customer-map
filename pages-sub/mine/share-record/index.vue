<template>
  <view class="share-page">
    <scroll-view class="page-scroll" scroll-y refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="onRefresh">
      <!-- ========== 顶部数据概览 (深色科技感 + 环形图 + 数字滚动) ========== -->
      <view class="hero-card">
        <!-- 旋转光晕 -->
        <view class="hero-aurora"></view>
        <!-- 扫光 -->
        <view class="hero-sweep"></view>
        <view class="hero-particles">
          <view class="hero-particle particle-one"></view>
          <view class="hero-particle particle-two"></view>
          <view class="hero-particle particle-three"></view>
          <view class="hero-particle particle-four"></view>
          <view class="hero-particle particle-five"></view>
          <view class="hero-particle particle-six"></view>
        </view>
        <!-- 内容 -->
        <view class="hero-heading">
          <view>
            <text class="hero-kicker">SHARE NETWORK</text>
            <text class="hero-title">转发增长概览</text>
          </view>
          <view class="hero-live"><view class="hero-live-dot"></view><text>实时转发人数</text></view>
        </view>
        <view class="hero-body">
          <!-- 左侧环形图 -->
          <view class="hero-ring" :style="{ background: ringGradient }">
            <view class="hero-ring-halo"><view class="hero-orbit-dot"></view></view>
            <view class="hero-ring-halo halo-2"><view class="hero-orbit-dot orbit-dot-2"></view></view>
            <view class="hero-ring-halo halo-3"><view class="hero-orbit-dot orbit-dot-3"></view><view class="hero-orbit-dot orbit-dot-3b"></view></view>
            <view class="hero-ring-inner">
              <text class="hero-ring-num">{{ displayAll }}</text>
              <text class="hero-ring-label">转发总人数</text>
            </view>
          </view>
          <!-- 右侧数据列表 -->
          <view class="hero-info">
            <view class="hero-info-item">
              <view class="hero-info-icon direct-icon">01</view>
              <view class="hero-info-copy"><text class="hero-info-name">直接转发</text><text class="hero-info-desc">由我直接转发</text></view>
              <text class="hero-info-val">{{ displayDirect }}</text>
            </view>
            <view class="hero-info-item">
              <view class="hero-info-icon indirect-icon">02</view>
              <view class="hero-info-copy"><text class="hero-info-name">子级转发</text><text class="hero-info-desc">子级用户自主转发</text></view>
              <text class="hero-info-val">{{ displayIndirect }}</text>
            </view>
          </view>
        </view>
        <view class="hero-foot">
          <text>直接转发占比</text>
          <view class="hero-progress"><view class="hero-progress-active" :style="{ width: directPercent + '%' }"></view></view>
          <text class="hero-percent">{{ directPercent }}%</text>
        </view>
      </view>

      <!-- ========== 列表标题 ========== -->
      <view class="list-head">
        <view class="list-head-copy"><text class="lh-kicker">NETWORK Tree Map</text><text class="lh-title">转发关系树状图</text></view>
        <view class="lh-count" v-if="treeData"><view class="lh-count-dot"></view><text>{{ totalAll }} 位成员</text></view>
      </view>

      <!-- ========== 树形列表 ========== -->
      <view class="tree-wrap">
        <!-- 骨架屏 -->
        <view v-if="loading" class="skeleton-wrap">
          <view class="skeleton-card" v-for="i in 4" :key="i">
            <view class="skeleton-row">
              <view class="skeleton-avatar"></view>
              <view class="skeleton-info">
                <view class="skeleton-line skeleton-name"></view>
                <view class="skeleton-line skeleton-sub"></view>
              </view>
            </view>
          </view>
        </view>

        <!-- 树形列表 -->
        <template v-else-if="treeData">
          <!-- 裂变源头节点（我自己）- 深色VIP风格 -->
          <view class="root-card">
            <view class="root-aurora"></view>
            <view class="root-sweep"></view>
            <view class="root-deco-circle root-deco-1"></view>
            <view class="root-deco-circle root-deco-2"></view>
            <view class="root-avatar-wrap">
              <view class="root-avatar-ring"><image class="root-avatar" :src="getAvatar(treeData)" mode="aspectFill" @error="onAvatarError(treeData)" /></view>
              <view class="root-status"></view>
            </view>
            <view class="root-info">
              <view class="root-name-row">
                <text class="root-name">{{ showName(treeData) }}</text>
                <view class="root-tag"><text class="root-tag-text">转发发起人</text><view class="root-tag-shine"></view></view>
              </view>
              <!-- 玻璃态企芯片 -->
              <view class="root-chip" v-if="treeData.compName">
                <view class="root-chip-icon">企</view>
                <text class="root-chip-name">{{ treeData.compName }}</text>
              </view>
            </view>
            <view class="root-index"><text>ORIGIN</text><text>01</text></view>
          </view>

          <view class="network-bridge" v-if="treeData.children && treeData.children.length">
            <view class="bridge-track"><view class="bridge-flow-dot"></view></view>
            <view class="bridge-label"><text class="bridge-label-main">一级触达转发</text><text class="bridge-label-sub">{{ totalDirect }} 个直接节点</text></view>
          </view>

          <!-- 一级裂变列表 (外层卡片包裹) -->
          <template v-if="treeData.children && treeData.children.length">
            <view
              class="fission-card"
              v-for="(l1, idx1) in treeData.children"
              :key="l1._id || idx1"
              :style="{ animationDelay: (idx1 * 150 + 200) + 'ms' }"
            >
              <!-- 一级用户节点 -->
              <view class="fission-item l1-item" :class="{ 'l1-item-expanded': l1._expanded && l1.children && l1.children.length }" @tap="toggleL1(l1)">
                <view class="item-avatar-wrap">
                  <view class="avatar-glow"></view>
                  <image class="item-avatar" :src="getAvatar(l1)" mode="aspectFill" @error="onAvatarError(l1)" />
                  <view class="level-mark">L1</view>
                </view>
                <view class="item-info">
                  <view class="item-name-row">
                    <text class="item-name">{{ showName(l1) }}</text>
                    <view class="member-tag" :class="{ 'tag-vip': l1.isMember }">
                      <view class="member-dot" :class="{ 'dot-vip': l1.isMember }"></view>
                      <text class="member-tag-text">{{ l1.isMember ? '正式会员' : '普通用户' }}</text>
                    </view>
                  </view>
                  <!-- 企芯片 -->
                  <view class="cc-company-chip" v-if="l1.compName">
                    <view class="cc-company-chip-icon">企</view>
                    <text class="cc-company-chip-name">{{ l1.compName }}</text>
                  </view>
                </view>

                <view class="item-action" v-if="l1.children && l1.children.length">
                  <view class="fwd-count" :class="{ 'fwd-count-on': l1._expanded }">
                    <view class="fwd-count-dot"></view>
                    <text>{{ l1.children.length }} 位成员</text>
                  </view>
                </view>
                <text class="quiet-text" v-else>暂未转发</text>
              </view>

              <!-- 二级及以下裂变列表 -->
              <share-tree-node v-if="l1._expanded && l1.children && l1.children.length" :nodes="l1.children" :level="2" @toggle="toggleChild" />
            </view>
          </template>

          <!-- 空状态 -->
          <view v-else class="empty-wrap">
            <empty-state title="还没有转发记录" hint="分享给好友后，他们的注册记录会展示在这里" />
          </view>
        </template>

        <!-- 空状态 -->
        <view v-else class="empty-wrap">
          <empty-state title="还没有转发记录" hint="分享给好友后，他们的注册记录会展示在这里" />
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import EmptyState from '@/common/components/empty-state.vue'
import ShareTreeNode from './share-tree-node.vue'
import { inviteTree } from '@/static/api/index.js'
import { showName, getProductImageUrlChat } from '@/common/utils/index.js'

export default {
  components: { EmptyState, ShareTreeNode },
  data() {
    return {
      loading: false, // 加载状态
      refreshing: false, // 下拉刷新状态
      treeData: null, // 原始树数据
      defaultAvatar: 'https://img2cdn.global-dsc.cn/dgzz_img/8520f53eeff21f5a388f30b67e54e287.png', // 默认头像
      displayAll: 0, // 数字滚动展示值-总人数
      displayDirect: 0, // 数字滚动展示值-直接
      displayIndirect: 0, // 数字滚动展示值-间接
    }
  },
  computed: {
    // ----------- 直接一级的数量
    totalDirect() {
      return this.treeData?.children?.length || 0
    },
    // ----------- 间接裂变数量（递归计算所有子孙后代）
    totalIndirect() {
      if (!this.treeData?.children) return 0
      const countDeep = (nodes) => {
        if (!nodes) return 0
        let count = 0
        for (const node of nodes) {
          if (node.children && node.children.length) {
            count += node.children.length
            count += countDeep(node.children)
          }
        }
        return count
      }
      return countDeep(this.treeData.children)
    },
    // ----------- 总裂变网络覆盖规模
    totalAll() {
      return this.totalDirect + this.totalIndirect
    },
    // ----------- 直接裂变占比
    directPercent() {
      if (!this.totalAll) return 0
      return Math.round(this.totalDirect / this.totalAll * 100)
    },
    // ----------- 间接裂变占比
    indirectPercent() {
      if (!this.totalAll) return 0
      return Math.round(this.totalIndirect / this.totalAll * 100)
    },
    // ----------- 环形图 conic-gradient（冰蓝+薄荷青，与深海蓝卡片一致）
    ringGradient() {
      if (!this.totalAll) {
        return 'conic-gradient(rgba(112,202,255,0.12) 0deg, 360deg)'
      }
      const directDeg = Math.round(this.directPercent / 100 * 360) // 直接转发对应角度
      return `conic-gradient(#61d9c5 0deg ${directDeg}deg, #65bfff ${directDeg}deg 360deg)`
    }
  },
  onLoad() {
    this.fetchTreeData()
  },
  methods: {
    showName,
    getProductImageUrlChat,

    // ----------- 获取头像
    getAvatar(node) {
      if (node.userLogo) {
        try {
          return getProductImageUrlChat(node.userLogo)
        } catch (e) {
          return this.defaultAvatar
        }
      }
      return this.defaultAvatar
    },

    // ----------- 头像加载失败时回退默认头像
    onAvatarError(node) {
      node.userLogo = '' // 清空头像地址，下次渲染使用默认头像
    },

    // ----------- 获取转发树数据
    async fetchTreeData() {
      this.loading = true
      try {
        const res = await inviteTree()
        const rootData = res?.Data || res?.data || null
        if (rootData) {
          // 从缓存读取当前用户信息，覆盖根节点（自己）的名称和头像
          const cachedUser = uni.getStorageSync('userInfo') || {}
          if (cachedUser.NickName) rootData.nickName = cachedUser.NickName
          if (cachedUser.UserLogo) rootData.userLogo = cachedUser.UserLogo
          if (cachedUser.CompName) rootData.compName = cachedUser.CompName
          this.treeData = this.processNode(rootData, 'root', 0)
          this.$nextTick(() => {
            this.animateNumbers()
          })
        }
      } catch (e) {
        // 错误已由 request 拦截器处理
      } finally {
        this.loading = false
      }
    },

    // ----------- 递归树形字段注入，保证控制层级
    processNode(node, id, level) {
      const children = node.children || []
      const processed = {
        ...node,
        _id: id,
        _level: level,
        _expanded: level === 1, // 第一层子级默认展开
        _childCount: children.length
      }
      processed.children = children.map((child, i) => {
        return this.processNode(child, `${id}_${i}`, level + 1)
      })
      return processed
    },

    // ----------- 点击一级节点展开折叠
    toggleL1(node) {
      if (!node.children || !node.children.length) return
      node._expanded = !node._expanded
    },

    // ----------- 点击二级及以下节点展开折叠
    toggleChild(node) {
      node._expanded = !node._expanded
    },

    // ----------- 下拉刷新
    onRefresh() {
      this.refreshing = true
      this.fetchTreeData().finally(() => {
        this.refreshing = false
      })
    },

    // ----------- 数字滚动动画
    animateNumbers() {
      const duration = 1000 // 动画时长1秒
      const steps = 30 // 分30步
      const stepTime = duration / steps
      const targetAll = this.totalAll
      const targetDirect = this.totalDirect
      const targetIndirect = this.totalIndirect
      let currentStep = 0
      this.displayAll = 0
      this.displayDirect = 0
      this.displayIndirect = 0
      const timer = setInterval(() => {
        currentStep++
        const progress = currentStep / steps
        // easeOutQuart 缓动
        const eased = 1 - Math.pow(1 - progress, 4)
        this.displayAll = Math.round(targetAll * eased)
        this.displayDirect = Math.round(targetDirect * eased)
        this.displayIndirect = Math.round(targetIndirect * eased)
        if (currentStep >= steps) {
          clearInterval(timer)
          this.displayAll = targetAll
          this.displayDirect = targetDirect
          this.displayIndirect = targetIndirect
        }
      }, stepTime)
    }
  }
}
</script>

<style scoped lang="scss">
page {
  background: #f0f1f5;
}

.share-page {
  min-height: 100vh;
  background: #f0f1f5;
}

.page-scroll {
  height: 100vh;
  box-sizing: border-box;
}

// ==================== 动效关键帧
@keyframes auroraSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes sweepShine {
  0% { left: -70%; }
  50% { left: 130%; }
  100% { left: 130%; }
}

@keyframes ringReveal {
  0% { transform: scale(0) rotate(-180deg); opacity: 0; }
  60% { transform: scale(1.1) rotate(0deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

@keyframes infoSlideIn {
  0% { transform: translateX(50rpx); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

@keyframes avatarAura {
  0%, 100% { opacity: 0.15; transform: scale(0.9); }
  50% { opacity: 0.5; transform: scale(1.1); }
}

@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

// ==================== 顶部数据卡 (深紫金渐变 + 环形图 + 数字滚动)
.hero-card {
  position: relative;
  overflow: hidden;
  margin: 24rpx 24rpx 0;
  border-radius: 24rpx;
  padding: 40rpx 36rpx;
  background: linear-gradient(135deg, #5b4b9e 0%, #7c5fb8 45%, #a78bd8 100%);
  box-shadow: 0 14rpx 36rpx rgba(80, 60, 140, 0.3),
              inset 0 0 60rpx rgba(255, 215, 130, 0.06);
  border: 1rpx solid rgba(255, 215, 130, 0.25);

  // 顶部金色高光条
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2rpx;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(255, 215, 130, 0.85) 50%,
      transparent 100%);
    z-index: 3;
  }
}

// 旋转光晕 (金色+紫色+蓝色，与 mine/index.vue VIP 卡一致)
.hero-aurora {
  position: absolute;
  top: -40%;
  left: -20%;
  width: 140%;
  height: 180%;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 200, 120, 0.32) 0%, transparent 35%),
    radial-gradient(circle at 70% 60%, rgba(180, 130, 255, 0.30) 0%, transparent 40%),
    radial-gradient(circle at 50% 80%, rgba(120, 180, 255, 0.22) 0%, transparent 38%);
  filter: blur(20rpx);
  pointer-events: none;
  z-index: 0;
  animation: auroraSpin 12s linear infinite;
}

// 扫光 (金色光泽，与 mine/index.vue 一致)
.hero-sweep {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 60%;
  height: 200%;
  background: linear-gradient(115deg,
    transparent 0%,
    rgba(255, 235, 180, 0.18) 45%,
    rgba(255, 255, 255, 0.32) 50%,
    rgba(255, 235, 180, 0.18) 55%,
    transparent 100%);
  transform: rotate(8deg);
  pointer-events: none;
  z-index: 1;
  animation: sweepShine 5s ease-in-out infinite;
}

// 内容主体 (左环形右列表)
.hero-body {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 36rpx;
}

// 左侧环形图
.hero-ring {
  flex-shrink: 0;
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ringReveal 1.5s ease-out;
  transition: background 1.3s ease;
}

// 环形图内圈 (挖空中心，用深紫底)
.hero-ring-inner {
  width: 130rpx;
  height: 130rpx;
  border-radius: 50%;
  background: #5b4b9e;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
}

.hero-ring-num {
  font-size: 44rpx;
  font-weight: 800;
  line-height: 1;
  color: #fff;
}

.hero-ring-label {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 1rpx;
}

// 右侧数据列表
.hero-info {
  flex: 1;
  min-width: 0;
  animation: infoSlideIn 0.6s ease-out 0.3s both;
}

.hero-info-title {
  font-size: 26rpx;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 2rpx;
  margin-bottom: 24rpx;
}

.hero-info-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 0;

  & + & {
    border-top: 1rpx solid rgba(255, 255, 255, 0.06);
  }
}

// 脉冲圆点
.hero-info-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-direct {
  background: #ffd782;
  color: rgba(255, 215, 130, 0.3);
  animation: dotPulse 2s ease-in-out infinite;
}

.dot-indirect {
  background: rgba(180, 130, 255, 0.7);
  color: rgba(180, 130, 255, 0.3);
  animation: dotPulse 2s ease-in-out infinite 1s;
}

.hero-info-name {
  flex: 1;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.hero-info-val {
  font-size: 36rpx;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}

// ==================== 列表标题
.list-head {
  display: flex;
  align-items: center;
  margin: 36rpx 32rpx 20rpx;
}

.lh-bar {
  width: 8rpx;
  height: 28rpx;
  border-radius: 6rpx;
  margin-right: 14rpx;
  background: linear-gradient(180deg, #ffc657, #f1a82d);
}

.lh-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
}

.lh-count {
  flex: 1;
  margin-left: 12rpx;
  font-size: 22rpx;
  color: #94a3b8;
}

// ==================== 树形列表容器
.tree-wrap {
  padding: 0 24rpx 56rpx;
}

// ==================== 裂变源头（深色VIP风格）
.root-card {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 36rpx 32rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #2a2350 0%, #4a3a8a 50%, #6c4fb8 100%);
  box-shadow: 0 12rpx 32rpx rgba(60, 40, 120, 0.3),
              inset 0 0 50rpx rgba(255, 215, 130, 0.06);
  border: 1rpx solid rgba(255, 215, 130, 0.3);
  margin-bottom: 24rpx;
}

.root-top-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2rpx;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(255, 215, 130, 0.85) 50%,
    transparent 100%);
  z-index: 3;
}

.root-aurora {
  position: absolute;
  top: -40%;
  left: -20%;
  width: 140%;
  height: 180%;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 200, 120, 0.25) 0%, transparent 35%),
    radial-gradient(circle at 70% 60%, rgba(180, 130, 255, 0.22) 0%, transparent 40%);
  filter: blur(20rpx);
  pointer-events: none;
  z-index: 1;
  animation: auroraRotate 15s linear infinite;
}

.root-sweep {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 60%;
  height: 200%;
  background: linear-gradient(115deg,
    transparent 0%,
    rgba(255, 235, 180, 0.12) 45%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 235, 180, 0.12) 55%,
    transparent 100%);
  transform: rotate(8deg);
  pointer-events: none;
  z-index: 1;
  animation: sweepShine 7s ease-in-out infinite;
}

.root-deco-circle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}

.root-deco-1 {
  width: 220rpx;
  height: 220rpx;
  top: -80rpx;
  right: -60rpx;
  background: radial-gradient(circle, rgba(255, 215, 130, 0.2) 0%, transparent 70%);
  animation: decoBreath1 6s ease-in-out infinite;
}

.root-deco-2 {
  width: 140rpx;
  height: 140rpx;
  bottom: -40rpx;
  left: -20rpx;
  background: radial-gradient(circle, rgba(180, 130, 255, 0.15) 0%, transparent 70%);
  animation: decoBreath2 7.5s ease-in-out infinite;
}

.root-avatar-wrap {
  position: relative;
  flex-shrink: 0;
  margin-right: 24rpx;
  z-index: 2;
}

.root-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 215, 130, 0.4);
  box-shadow: 0 4rpx 16rpx rgba(255, 215, 130, 0.2);
}

.root-crown {
  position: absolute;
  top: -14rpx;
  right: -12rpx;
  font-size: 30rpx;
  transform: rotate(15deg);
  filter: drop-shadow(0 2rpx 4rpx rgba(255, 180, 50, 0.5));
  z-index: 3;
}

.root-info {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 2;
}

.root-name-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-bottom: 14rpx;
}

.root-name {
  font-size: 34rpx;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

// 金色金属质感"裂变源头"徽章
.root-tag {
  position: relative;
  display: flex;
  align-items: center;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg,
    #fff5d1 0%,
    #ffd76b 25%,
    #f5b73a 55%,
    #d99224 85%,
    #ffe49a 100%);
  box-shadow:
    0 4rpx 12rpx rgba(217, 146, 36, 0.5),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.7),
    inset 0 -1rpx 0 rgba(140, 80, 0, 0.3);
  overflow: hidden;
}

.root-tag-text {
  font-size: 18rpx;
  font-weight: 800;
  color: #5a3300;
  letter-spacing: 1rpx;
  text-shadow: 0 1rpx 0 rgba(255, 255, 255, 0.5);
}

.root-tag-shine {
  position: absolute;
  top: 0;
  left: -60%;
  width: 60%;
  height: 100%;
  background: linear-gradient(120deg,
    transparent 0%,
    rgba(255, 255, 255, 0.65) 50%,
    transparent 100%);
  transform: skewX(-20deg);
  animation: sweepShine 4s ease-in-out infinite;
}

// 玻璃态企芯片 (深色卡专用)
.root-chip {
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 6rpx 14rpx 6rpx 6rpx;
  background: rgba(255, 255, 255, 0.12);
  border: 1rpx solid rgba(255, 255, 255, 0.15);
  border-radius: 999rpx;
  backdrop-filter: blur(10rpx);
}

.root-chip-icon {
  width: 28rpx;
  height: 28rpx;
  line-height: 28rpx;
  text-align: center;
  flex-shrink: 0;
  font-size: 18rpx;
  font-weight: 700;
  color: #5a3300;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffd76b, #f5b73a);
}

.root-chip-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
}

// ==================== 统一企芯片 (白色卡片区用)
.cc-company-chip {
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 4rpx 12rpx 4rpx 6rpx;
  background: #eef5ff;
  border: 1rpx solid #b9d6ff;
  border-radius: 999rpx;

  &.chip-sm {
    padding: 2rpx 10rpx 2rpx 4rpx;
    .cc-company-chip-icon { width: 24rpx; height: 24rpx; line-height: 24rpx; font-size: 16rpx; }
    .cc-company-chip-name { font-size: 22rpx; }
  }

  &.chip-xs {
    padding: 2rpx 8rpx 2rpx 2rpx;
    .cc-company-chip-icon { width: 20rpx; height: 20rpx; line-height: 20rpx; font-size: 14rpx; }
    .cc-company-chip-name { font-size: 20rpx; }
  }
}

.cc-company-chip-icon {
  width: 28rpx;
  height: 28rpx;
  line-height: 28rpx;
  text-align: center;
  flex-shrink: 0;
  font-size: 18rpx;
  font-weight: 700;
  color: #fff;
  border-radius: 50%;
  background: #4a8cff;
}

.cc-company-chip-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 24rpx;
  color: #3f7edb;
}

// ==================== 一级裂变卡片
.fission-card {
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid #edeff4;
  box-shadow: 0 6rpx 24rpx rgba(15, 23, 42, 0.04);
  overflow: hidden;
}

// ==================== 统一用户行
.fission-item {
  display: flex;
  align-items: center;
  padding: 24rpx 28rpx;
  position: relative;
  transition: background 0.2s ease;

  &:active {
    background: #f8f9fc;
  }
}

// 一级项目 (展开时底部加分隔线)
.l1-item {
  &.l1-item-expanded {
    border-bottom: 1rpx solid #f0f2f8;
  }
}

// 头像
.item-avatar-wrap {
  position: relative;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.item-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  border: 2rpx solid #edeff4;
  background: #f8f9fc;

  &.avatar-sm { width: 64rpx; height: 64rpx; }
  &.avatar-xs { width: 56rpx; height: 56rpx; }
}

// 信息区
.item-info {
  flex: 1;
  min-width: 0;
}

.item-name-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 10rpx;
}

.item-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 20rpx;

  &.name-sm { font-size: 26rpx; }
  &.name-xs { font-size: 24rpx; }
}

// 会员标识 (圆点+文字)
.member-tag {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 6rpx;

  &.tag-vip .member-tag-text { color: #d99224; font-weight: 700; }
}

.member-dot {
  flex-shrink: 0;
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #c4cdd6;

  &.dot-vip {
    background: linear-gradient(135deg, #ffd76b, #f5b73a);
    box-shadow: 0 0 6rpx rgba(217, 146, 36, 0.5);
  }
}

.member-tag-text {
  font-size: 20rpx;
  color: #8a96a3;
  line-height: 1;
}

// ==================== 二级裂变区域 (左侧渐变色带 + 柔和灰底)
.l2-container {
  background: #f5f6fa;
  padding: 16rpx 0 14rpx 16rpx;
  position: relative;
}

.l2-list {
  padding: 0 8rpx;
}

.l2-wrapper {
  margin-bottom: 10rpx;
  background: #fff;
  border-radius: 16rpx;
  border: 1rpx solid #edeff4;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(15, 23, 42, 0.2);

  &:last-child { margin-bottom: 0; }
}

.l2-item {
  padding: 22rpx 20rpx;

  &.l2-item-expanded {
    border-bottom: 1rpx solid #f5f6fa;
  }
}

// ==================== 三级裂变区域 (更深一级灰底)
.l3-container {
  background: #ebedf3;
  padding: 12rpx 0 10rpx 12rpx;
}

.l3-list {
  padding: 0 4rpx;
}

.l3-item {
  padding: 16rpx 16rpx;
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 8rpx;
  border: 1rpx solid #e8eaf2;
  box-shadow: 0 3rpx 12rpx rgba(15, 23, 42, 0.2);

  &:last-child { margin-bottom: 0; }
}

// ==================== 空状态
.empty-wrap {
  padding: 60rpx 0;
}

// ==================== 骨架屏
.skeleton-card {
  margin-bottom: 18rpx;
  padding: 26rpx 24rpx;
  border-radius: 24rpx;
  background: #fff;
  border: 1rpx solid #edeff4;
  box-shadow: 0 8rpx 22rpx rgba(15, 23, 42, 0.04);
}

.skeleton-row {
  display: flex;
  align-items: center;
}

.skeleton-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #e9eef5;
  margin-right: 20rpx;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-info { flex: 1; }

.skeleton-line {
  height: 24rpx;
  border-radius: 8rpx;
  background: #e9eef5;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-name { width: 40%; margin-bottom: 12rpx; }
.skeleton-sub { width: 60%; }

@keyframes pageRise {
  from { opacity: 0; transform: translateY(30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes cardRise {
  from { opacity: 0; transform: translateY(40rpx) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes meshFloat {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(20rpx, -18rpx, 0) scale(1.08); }
}

@keyframes livePulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(91, 235, 202, 0.42); }
  50% { opacity: 0.65; box-shadow: 0 0 0 10rpx rgba(91, 235, 202, 0); }
}

@keyframes progressGrow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@keyframes nodeOpen {
  from { opacity: 0; transform: translateY(-12rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.share-page {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 100% 0%, rgba(93, 138, 255, 0.12), transparent 36%),
    linear-gradient(180deg, #f3f6fb 0%, #f7f9fc 48%, #eef2f8 100%);
}

.share-page::before,
.share-page::after {
  content: '';
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(6rpx);
}

.share-page::before {
  top: 140rpx;
  right: -180rpx;
  width: 420rpx;
  height: 420rpx;
  background: rgba(85, 126, 255, 0.06);
  animation: meshFloat 9s ease-in-out infinite;
}

.share-page::after {
  bottom: 120rpx;
  left: -220rpx;
  width: 460rpx;
  height: 460rpx;
  background: rgba(83, 221, 203, 0.05);
  animation: meshFloat 11s ease-in-out infinite reverse;
}

.page-scroll {
  position: relative;
  z-index: 1;
}

.hero-card {
  margin: 28rpx 28rpx 0;
  padding: 36rpx 34rpx 30rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.12);
  border-radius: 32rpx;
  background: linear-gradient(145deg, #0b1733 0%, #10254a 54%, #173b63 100%);
  box-shadow: 0 24rpx 60rpx rgba(17, 35, 72, 0.2), inset 0 1rpx 0 rgba(255, 255, 255, 0.12);
  animation: pageRise 1s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.hero-card::before {
  width: 44%;
  height: 2rpx;
  left: 28%;
  right: auto;
  background: linear-gradient(90deg, transparent, #72d7ff, transparent);
}

.hero-aurora {
  top: -80%;
  left: 35%;
  width: 100%;
  height: 170%;
  background: radial-gradient(circle, rgba(46, 185, 255, 0.2) 0%, rgba(66, 115, 255, 0.08) 34%, transparent 65%);
  filter: blur(4rpx);
  animation: meshFloat 8s ease-in-out infinite;
}

.hero-sweep {
  width: 34%;
  opacity: 0.55;
  animation-duration: 7s;
}

.hero-heading {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 34rpx;
}

.hero-kicker,
.hero-title,
.lh-kicker,
.lh-title {
  display: block;
}

.hero-kicker {
  margin-bottom: 8rpx;
  color: rgba(132, 211, 255, 0.64);
  font-size: 18rpx;
  animation: kickerGlow 3s ease-in-out infinite;
  font-weight: 600;
  letter-spacing: 4rpx;
}

.hero-title {
  color: #ffffff;
  font-size: 34rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
  animation: titleShimmer 4s ease-in-out infinite;
}

.hero-live {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 9rpx 15rpx;
  color: rgba(218, 248, 244, 0.82);
  font-size: 19rpx;
  border: 1rpx solid rgba(108, 231, 213, 0.2);
  border-radius: 999rpx;
  background: rgba(87, 213, 194, 0.08);
}

.hero-live-dot,
.lh-count-dot {
  width: 9rpx;
  height: 9rpx;
  border-radius: 50%;
  background: #5bebca;
  animation: livePulse 2s ease-in-out infinite;
}

.hero-body {
  gap: 32rpx;
}

.hero-ring {
  position: relative;
  width: 188rpx;
  height: 188rpx;
  padding: 2rpx;
  box-shadow: 0 0 45rpx rgba(76, 170, 255, 0.14);
}

.hero-ring-halo {
  position: absolute;
  inset: -12rpx;
  border: 1rpx solid rgba(112, 202, 255, 0.12);
  border-radius: 50%;
}

.halo-2 {
  inset: -22rpx;
  border-color: rgba(108, 235, 213, 0.08);
  animation: orbitRotateReverse 18s linear infinite;
}

.halo-3 {
  inset: -32rpx;
  border-color: rgba(196, 168, 255, 0.06);
  animation: orbitRotate 24s linear infinite;
}

.hero-ring-inner {
  position: relative;
  width: 140rpx;
  height: 140rpx;
  gap: 7rpx;
  background: linear-gradient(145deg, #0d1b39, #142c50);
  box-shadow: inset 0 0 28rpx rgba(85, 166, 255, 0.1);
}

.hero-ring-num {
  font-size: 50rpx;
  font-weight: 700;
  letter-spacing: -2rpx;
}

.hero-ring-label {
  color: rgba(194, 215, 237, 0.55);
  font-size: 18rpx;
  letter-spacing: 1rpx;
}

.hero-info {
  animation: infoSlideIn 0.9s ease-out 0.4s both;
}

.hero-info-item {
  gap: 14rpx;
  padding: 14rpx 0;
  animation: itemFadeIn 0.6s ease-out both;
}

.hero-info-item:nth-child(1) {
  animation-delay: 0.5s;
}

.hero-info-item:nth-child(2) {
  animation-delay: 0.7s;
}

.hero-info-item + .hero-info-item {
  border-top-color: rgba(255, 255, 255, 0.08);
}

.hero-info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44rpx;
  height: 44rpx;
  flex-shrink: 0;
  color: #86d8ff;
  font-size: 17rpx;
  font-weight: 700;
  border: 1rpx solid rgba(116, 203, 255, 0.2);
  border-radius: 14rpx;
  background: rgba(78, 175, 255, 0.1);
}

.indirect-icon {
  color: #7ce3cf;
  border-color: rgba(104, 224, 202, 0.2);
  background: rgba(89, 211, 190, 0.09);
}

.hero-info-copy {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 3rpx;
}

.hero-info-name {
  color: rgba(238, 246, 255, 0.86);
  font-size: 23rpx;
}

.hero-info-desc {
  color: rgba(170, 195, 220, 0.42);
  font-size: 18rpx;
}

.hero-info-val {
  font-size: 38rpx;
  font-weight: 650;
}

.hero-foot {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 30rpx;
  padding-top: 22rpx;
  color: rgba(184, 207, 230, 0.48);
  font-size: 19rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.07);
  animation: footSlideIn 0.8s ease-out 0.9s both;
}

.hero-progress {
  flex: 1;
  height: 5rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.08);
}

.hero-progress-active {
  position: relative;
  height: 100%;
  border-radius: inherit;
  transform-origin: left center;
  background: linear-gradient(90deg, #54d9c0, #66c4ff);
  box-shadow: 0 0 12rpx rgba(83, 216, 191, 0.6);
  animation: progressGrow 1.4s ease-out 0.7s both;
  overflow: hidden;
}

.hero-progress-active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 40%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent);
  animation: progressShimmer 2.5s ease-in-out 2s infinite;
}

.hero-percent {
  min-width: 58rpx;
  color: #73d8cf;
  text-align: right;
  font-weight: 600;
}

.list-head {
  justify-content: space-between;
  margin: 46rpx 34rpx 22rpx;
  animation: pageRise 0.9s ease-out 0.2s both;
}

.list-head-copy {
  display: flex;
  flex-direction: column;
}

.lh-kicker {
  margin-bottom: 4rpx;
  color: #8d9bad;
  font-size: 17rpx;
  font-weight: 600;
  letter-spacing: 3rpx;
}

.lh-title {
  color: #142033;
  font-size: 31rpx;
  font-weight: 700;
}

.lh-count {
  display: flex;
  align-items: center;
  flex: none;
  gap: 9rpx;
  margin-left: 0;
  padding: 10rpx 16rpx;
  color: #758397;
  font-size: 20rpx;
  border: 1rpx solid rgba(134, 151, 176, 0.14);
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 6rpx 20rpx rgba(24, 43, 74, 0.04);
}

.lh-count-dot {
  width: 8rpx;
  height: 8rpx;
  background: #4f82ff;
  animation: none;
}

.tree-wrap {
  padding: 0 28rpx 72rpx;
}

.root-card {
  min-height: 116rpx;
  padding: 30rpx 30rpx;
  border: 1rpx solid rgba(58, 107, 178, 0.14);
  border-radius: 28rpx;
  background: linear-gradient(135deg, #122342 0%, #19365c 62%, #1b4569 100%);
  box-shadow: 0 18rpx 42rpx rgba(20, 45, 79, 0.16), inset 0 1rpx 0 rgba(255, 255, 255, 0.1);
  animation: cardRise 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s both;
}

.root-top-line {
  left: 32rpx;
  right: auto;
  width: 88rpx;
  background: linear-gradient(90deg, #58d9c1, transparent);
}

.root-aurora {
  background: radial-gradient(circle at 70% 30%, rgba(72, 174, 229, 0.18), transparent 50%);
  animation: meshFloat 9s ease-in-out infinite;
}

.root-deco-1 {
  background: radial-gradient(circle, rgba(80, 196, 229, 0.12), transparent 70%);
}

.root-deco-2 {
  background: radial-gradient(circle, rgba(79, 221, 190, 0.08), transparent 70%);
}

.root-avatar-wrap {
  margin-right: 22rpx;
}

.root-avatar-ring {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 94rpx;
  height: 94rpx;
  border: 2rpx solid rgba(110, 219, 210, 0.5);
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.14), 0 0 16rpx rgba(110, 219, 210, 0.25);
  animation: ringPulse 2.5s ease-in-out infinite;
}

.root-avatar {
  width: 82rpx;
  height: 82rpx;
  border: 0;
  border-radius: 25rpx;
  box-shadow: none;
}

.root-status {
  position: absolute;
  right: -2rpx;
  bottom: -2rpx;
  width: 17rpx;
  height: 17rpx;
  border: 4rpx solid #19365c;
  border-radius: 50%;
  background: #5bebca;
  box-shadow: 0 0 12rpx rgba(91, 235, 202, 0.6);
  animation: dotPulse 2s ease-in-out infinite;
}

.root-name-row {
  margin-bottom: 12rpx;
}

.root-name {
  font-size: 31rpx;
  font-weight: 650;
}

.root-tag {
  padding: 6rpx 13rpx;
  border: 1rpx solid rgba(96, 226, 204, 0.28);
  background: rgba(75, 211, 187, 0.1);
  box-shadow: none;
}

.root-tag-text {
  color: #84e3d4;
  font-size: 17rpx;
  font-weight: 600;
  text-shadow: none;
}

.root-chip {
  max-width: 390rpx;
  border-color: rgba(255, 255, 255, 0.09);
  background: rgba(255, 255, 255, 0.07);
}

.root-chip-icon {
  color: #e5f6ff;
  background: rgba(92, 180, 238, 0.32);
}

.root-chip-name {
  font-size: 22rpx;
  color: rgba(222, 237, 249, 0.7);
}

.root-index {
  position: relative;
  z-index: 2;
  display: flex;
  flex-shrink: 0;
  margin-left: 14rpx;
  flex-direction: column;
  align-items: flex-end;
  color: rgba(147, 190, 220, 0.4);
  font-size: 15rpx;
  letter-spacing: 2rpx;
}

.root-index text:last-child {
  margin-top: 2rpx;
  color: rgba(150, 216, 232, 0.6);
  font-size: 28rpx;
  letter-spacing: 0;
}

.fission-card {
  position: relative;
  overflow: visible;
  margin-bottom: 18rpx;
  border: 1rpx solid rgba(135, 151, 176, 0.12);
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 12rpx 32rpx rgba(24, 43, 74, 0.06);
  opacity: 0;
  animation: cardRise 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.fission-card::before {
  content: '';
  position: absolute;
  top: -25rpx;
  left: 52rpx;
  width: 2rpx;
  height: 25rpx;
  background: linear-gradient(180deg, rgba(76, 131, 205, 0.12), rgba(76, 131, 205, 0.32));
}

.fission-item {
  min-height: 92rpx;
  padding: 24rpx 26rpx;
}

.fission-item:active {
  background: rgba(239, 245, 252, 0.8);
}

.item-avatar-wrap {
  margin-right: 18rpx;
}

.item-avatar {
  width: 74rpx;
  height: 74rpx;
  border: 4rpx solid #ffffff;
  box-shadow: 0 5rpx 16rpx rgba(36, 61, 94, 0.14);
}

.item-name {
  color: #1b293d;
  font-weight: 650;
}


.cc-company-chip {
  max-width: 360rpx;
  border-color: #d9e6f7;
  background: #f2f7fd;
}

.cc-company-chip-icon {
  background: linear-gradient(135deg, #588aff, #4ebacb);
}

.cc-company-chip-name {
  color: #5682b6;
}

.l2-container {
  border-radius: 0 0 24rpx 24rpx;
  background: linear-gradient(180deg, #f5f8fc, #f0f4f9);
  animation: nodeOpen 0.28s ease-out both;
}

.l2-container::before {
  left: 24rpx;
  top: 16rpx;
  bottom: 16rpx;
  width: 3rpx;
  border-radius: 999rpx;
  background: repeating-linear-gradient(180deg, rgba(108, 207, 196, 0.8) 0, rgba(108, 207, 196, 0.8) 6rpx, rgba(95, 136, 205, 0.1) 6rpx, rgba(95, 136, 205, 0.1) 14rpx);
  background-size: 100% 28rpx;
  animation: connectorFlow 1.2s linear infinite;
}

.l2-wrapper {
  border-color: rgba(137, 153, 177, 0.12);
  border-radius: 18rpx;
  box-shadow: 0 6rpx 22rpx rgba(32, 55, 86, 0.2);
}

.l3-container {
  background: #eef3f8;
  animation: nodeOpen 0.25s ease-out both;
}

.l3-item {
  border-color: rgba(134, 153, 179, 0.12);
  border-radius: 15rpx;
  box-shadow: 0 4rpx 14rpx rgba(32, 55, 86, 0.2);
}

.skeleton-card {
  border-color: rgba(135, 151, 176, 0.1);
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 10rpx 28rpx rgba(24, 43, 74, 0.05);
}

.skeleton-avatar,
.skeleton-line {
  background: linear-gradient(90deg, #e9eef5 25%, #f5f7fa 50%, #e9eef5 75%);
  background-size: 200% 100%;
}

@keyframes particleDrift {
  0%, 100% { opacity: 0.2; transform: translate3d(0, 0, 0) scale(0.8); }
  50% { opacity: 0.85; transform: translate3d(10rpx, -22rpx, 0) scale(1.15); }
}

@keyframes particleDrift2 {
  0%, 100% { opacity: 0.15; transform: translate3d(0, 0, 0) scale(0.6); }
  50% { opacity: 0.7; transform: translate3d(-14rpx, 18rpx, 0) scale(1.2); }
}

@keyframes particleDrift3 {
  0%, 100% { opacity: 0.1; transform: translate3d(0, 0, 0) scale(0.5); }
  33% { opacity: 0.6; transform: translate3d(12rpx, 14rpx, 0) scale(1); }
  66% { opacity: 0.4; transform: translate3d(-8rpx, -16rpx, 0) scale(0.8); }
}

@keyframes kickerGlow {
  0%, 100% { opacity: 0.5; text-shadow: 0 0 0 rgba(132, 211, 255, 0); }
  50% { opacity: 0.85; text-shadow: 0 0 16rpx rgba(132, 211, 255, 0.4); }
}

@keyframes titleShimmer {
  0%, 100% { text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2); }
  50% { text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2), 0 0 20rpx rgba(113, 215, 255, 0.25); }
}

@keyframes footSlideIn {
  from { opacity: 0; transform: translateY(16rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes progressShimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

@keyframes ringBreathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes itemFadeIn {
  from { opacity: 0; transform: translateX(30rpx); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes orbitRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes orbitRotateReverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

@keyframes numberBreath {
  0%, 100% { text-shadow: 0 0 0 rgba(104, 205, 255, 0); transform: translateY(0); }
  50% { text-shadow: 0 0 20rpx rgba(104, 205, 255, 0.34); transform: translateY(-2rpx); }
}

@keyframes connectorFlow {
  from { background-position: 0 0; }
  to { background-position: 0 16rpx; }
}

@keyframes statusFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2rpx); }
}

@keyframes skeletonFlow {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}

.hero-particles {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
}

.hero-particle {
  position: absolute;
  width: 7rpx;
  height: 7rpx;
  border-radius: 50%;
  background: #89dcff;
  box-shadow: 0 0 15rpx rgba(113, 211, 255, 0.8);
  animation: particleDrift 4.6s ease-in-out infinite;
}

.particle-one {
  top: 24%;
  right: 25%;
}

.particle-two {
  top: 64%;
  right: 8%;
  width: 5rpx;
  height: 5rpx;
  background: #70ead1;
  animation-delay: -1.5s;
  animation-duration: 5.5s;
}

.particle-three {
  bottom: 14%;
  left: 35%;
  width: 4rpx;
  height: 4rpx;
  animation-delay: -3s;
  animation-duration: 6.2s;
}

.particle-four {
  top: 40%;
  left: 12%;
  width: 6rpx;
  height: 6rpx;
  background: #a8e8ff;
  box-shadow: 0 0 12rpx rgba(168, 232, 255, 0.7);
  animation: particleDrift2 5.8s ease-in-out infinite;
  animation-delay: -0.8s;
}

.particle-five {
  bottom: 30%;
  right: 30%;
  width: 5rpx;
  height: 5rpx;
  background: #5bebca;
  box-shadow: 0 0 14rpx rgba(91, 235, 202, 0.7);
  animation: particleDrift3 7s ease-in-out infinite;
  animation-delay: -2.2s;
}

.particle-six {
  top: 16%;
  right: 10%;
  width: 3rpx;
  height: 3rpx;
  background: #c4a8ff;
  box-shadow: 0 0 10rpx rgba(196, 168, 255, 0.6);
  animation: particleDrift2 6.5s ease-in-out infinite;
  animation-delay: -4s;
}

.hero-ring-halo {
  animation: orbitRotate 12s linear infinite;
}

.halo-2 {
  animation: orbitRotateReverse 18s linear infinite;
}

.halo-3 {
  animation: orbitRotate 24s linear infinite;
}

.hero-orbit-dot {
  position: absolute;
  top: -5rpx;
  left: 50%;
  width: 10rpx;
  height: 10rpx;
  margin-left: -5rpx;
  border-radius: 50%;
  background: #8be9da;
  box-shadow: 0 0 18rpx rgba(108, 235, 213, 0.95);
}

.orbit-dot-2 {
  background: #8bc8ff;
  box-shadow: 0 0 16rpx rgba(139, 200, 255, 0.9);
  width: 8rpx;
  height: 8rpx;
  margin-left: -4rpx;
}

.orbit-dot-3 {
  background: #c4a8ff;
  box-shadow: 0 0 14rpx rgba(196, 168, 255, 0.85);
  width: 7rpx;
  height: 7rpx;
  margin-left: -3.5rpx;
}

.orbit-dot-3b {
  top: auto;
  bottom: -4rpx;
  background: #5bebca;
  box-shadow: 0 0 12rpx rgba(91, 235, 202, 0.7);
  width: 6rpx;
  height: 6rpx;
  margin-left: -3rpx;
}

.hero-ring-num,
.hero-info-val {
  animation: numberBreath 3.2s ease-in-out infinite;
}

.hero-info-item:nth-child(2) .hero-info-val {
  animation-delay: -1.6s;
}

.hero-info-icon {
  transition: transform 0.24s ease, background 0.24s ease;
  animation: statusFloat 3.8s ease-in-out infinite;
}

.hero-info-item:nth-child(2) .hero-info-icon {
  animation-delay: -1.9s;
}

.root-avatar-ring {
  animation: ringPulse 2.5s ease-in-out infinite;
}

.root-status {
  animation: dotPulse 2s ease-in-out infinite;
}

.fission-card::before {
  background: repeating-linear-gradient(180deg, rgba(82, 211, 194, 0.85) 0, rgba(82, 211, 194, 0.85) 6rpx, rgba(76, 131, 205, 0.08) 6rpx, rgba(76, 131, 205, 0.08) 14rpx);
  background-size: 100% 28rpx;
  animation: connectorFlow 1s linear infinite;
}

.fission-item {
  transition: transform 0.2s ease, background 0.2s ease;
}

.fission-item:active {
  transform: scale(0.985);
}

.l2-wrapper {
  animation: nodeOpen 0.32s ease-out both;
}

.l2-wrapper:nth-child(2) { animation-delay: 45ms; }
.l2-wrapper:nth-child(3) { animation-delay: 90ms; }
.l2-wrapper:nth-child(4) { animation-delay: 135ms; }
.l2-wrapper:nth-child(5) { animation-delay: 180ms; }

.l3-item {
  animation: nodeOpen 0.28s ease-out both;
}

.l3-item:nth-child(2) { animation-delay: 45ms; }
.l3-item:nth-child(3) { animation-delay: 90ms; }
.l3-item:nth-child(4) { animation-delay: 135ms; }
.l3-item:nth-child(5) { animation-delay: 180ms; }

.skeleton-avatar,
.skeleton-line {
  animation: skeletonFlow 1.45s linear infinite;
}

@keyframes bridgeTravel {
  0% { opacity: 0; transform: translateY(-12rpx) scale(0.5); }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { opacity: 0; transform: translateY(72rpx) scale(1.2); }
}

@keyframes ringPulse {
  0%, 100% { transform: scale(1); box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.14), 0 0 12rpx rgba(110, 219, 210, 0.2); border-color: rgba(110, 219, 210, 0.5); }
  50% { transform: scale(1.08); box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.14), 0 0 28rpx rgba(110, 219, 210, 0.5); border-color: rgba(110, 219, 210, 0.85); }
}

@keyframes dotPulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 12rpx rgba(91, 235, 202, 0.6); }
  50% { transform: scale(1.15); box-shadow: 0 0 20rpx rgba(91, 235, 202, 0.8), 0 0 36rpx rgba(91, 235, 202, 0.3); }
}

@keyframes sourceSweep {
  0%, 58% { left: -45%; opacity: 0; }
  68% { opacity: 0.8; }
  88%, 100% { left: 120%; opacity: 0; }
}

@keyframes edgeGlow {
  0%, 100% { opacity: 0.35; transform: scaleY(0.35); }
  50% { opacity: 1; transform: scaleY(1); }
}

.network-bridge {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 82rpx;
  animation: pageRise 0.8s ease-out 0.3s both;
}

.bridge-track {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 54rpx;
  width: 2rpx;
  overflow: visible;
  background: linear-gradient(180deg, rgba(81, 212, 193, 0.65), rgba(75, 126, 195, 0.14));
}

.bridge-track::before,
.bridge-track::after {
  content: '';
  position: absolute;
  left: 50%;
  width: 9rpx;
  height: 9rpx;
  border-radius: 50%;
  transform: translateX(-50%);
  background: #6bdbc8;
  box-shadow: 0 0 14rpx rgba(79, 216, 193, 0.65);
}

.bridge-track::before { top: -3rpx; }
.bridge-track::after { bottom: -3rpx; background: #72a9e6; }

.bridge-flow-dot {
  position: absolute;
  top: 0;
  left: 50%;
  width: 7rpx;
  height: 16rpx;
  margin-left: -3rpx;
  border-radius: 999rpx;
  background: linear-gradient(180deg, rgba(122, 239, 219, 0), #79ead7);
  box-shadow: 0 0 16rpx rgba(91, 232, 207, 0.8);
  animation: bridgeTravel 1.2s ease-in-out infinite;
}

.bridge-label {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-left: 58rpx;
  padding: 9rpx 16rpx;
  border: 1rpx solid rgba(117, 142, 174, 0.11);
  border-radius: 999rpx;
  background: rgba(248, 251, 255, 0.88);
  box-shadow: 0 7rpx 20rpx rgba(30, 54, 85, 0.045);
  backdrop-filter: blur(12rpx);
}

.bridge-label-main {
  color: #3a526f;
  font-size: 22rpx;
  font-weight: 650;
}

.bridge-label-sub {
  padding-left: 12rpx;
  color: #94a2b4;
  font-size: 22rpx;
  border-left: 1rpx solid #dce4ed;
}

.item-avatar-wrap {
  isolation: isolate;
}

.avatar-glow {
  position: absolute;
  inset: -10rpx;
  z-index: -1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(81, 192, 219, 0.35), rgba(91, 143, 218, 0.06) 62%, transparent 70%);
  animation: avatarAura 3.4s ease-in-out infinite;
}

.l2-wrapper:nth-child(2n) .avatar-glow,
.l3-item:nth-child(2n) .avatar-glow {
  animation-delay: -1.7s;
}

.level-mark {
  position: absolute;
  right: -8rpx;
  bottom: -6rpx;
  z-index: 3;
  min-width: 27rpx;
  height: 22rpx;
  padding: 0 4rpx;
  color: #ffffff;
  font-size: 13rpx;
  font-weight: 700;
  line-height: 22rpx;
  text-align: center;
  letter-spacing: 0;
  border: 3rpx solid #ffffff;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #4e7ee5, #52b9c9);
  box-shadow: 0 3rpx 9rpx rgba(57, 101, 167, 0.24);
}

.level-mark-sm {
  right: -7rpx;
  bottom: -5rpx;
  transform: scale(0.92);
}

.level-mark-xs {
  right: -9rpx;
  bottom: -7rpx;
  transform: scale(0.84);
}

.root-card::after {
  content: '';
  position: absolute;
  top: -35%;
  left: -45%;
  z-index: 1;
  width: 25%;
  height: 170%;
  pointer-events: none;
  transform: rotate(14deg);
  background: linear-gradient(90deg, transparent, rgba(145, 225, 255, 0.14), transparent);
  animation: sourceSweep 6.5s ease-in-out infinite;
}

.fission-card:nth-child(2n)::after {
  animation-delay: -1.8s;
}


@keyframes badgePulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

@keyframes arrowLineGrow {
  from { width: 0; }
  to { width: 11rpx; }
}

.fwd-count {
  display: flex;
  align-items: center;
  gap: 9rpx;
  padding: 10rpx 16rpx;
  color: #758397;
  font-size: 20rpx;
  border: 1rpx solid rgba(134, 151, 176, 0.14);
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 6rpx 20rpx rgba(24, 43, 74, 0.04);
  transition: all 0.25s ease;
}

.fwd-count-sm {
  padding: 8rpx 14rpx;
  font-size: 20rpx;
}

.fwd-count:active {
  transform: scale(0.95);
}

.fwd-count-on {
  border-color: rgba(79, 130, 255, 0.3);
  background: rgba(79, 130, 255, 0.06);
}

.fwd-count-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #4f82ff;
  flex-shrink: 0;
}

.fwd-count-on .fwd-count-dot {
  background: #3a6bd5;
}

.quiet-text {
  color: red;
  font-size: 22rpx;
  letter-spacing: 0.5rpx;
}

@media (prefers-reduced-motion: reduce) {
  .hero-particle,
  .hero-ring-halo,
  .hero-ring-num,
  .hero-info-val,
  .hero-info-icon,
  .root-avatar-ring,
  .root-status,
  .bridge-flow-dot,
  .avatar-glow,
  .fission-card::before,
  .fission-card::after,
  .root-card::after {
    animation: none;
  }
}
</style>
