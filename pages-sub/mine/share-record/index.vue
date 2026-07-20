<template>
  <view class="share-page">
    <scroll-view class="page-scroll" scroll-y refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="onRefresh">
      <!-- ========== 顶部统计卡片 ========== -->
      <view class="hero-card">
        <view class="hero-glow hero-glow-left"></view>
        <view class="hero-glow hero-glow-right"></view>
        <view class="hero-grid"></view>
        <view class="hero-title-row">
          <view class="hero-copy">
            <text class="hero-title">我的转发记录</text>
            <text class="hero-desc">查看你分享的用户及他们的二次转发，追踪传播链路。</text>
          </view>
        </view>
        <view class="hero-stats">
          <view class="hero-stat-item">
            <text class="hero-stat-value">{{ totalDirect }}</text>
            <text class="hero-stat-label">直接转发</text>
          </view>
          <view class="hero-stat-divider"></view>
          <view class="hero-stat-item">
            <text class="hero-stat-value">{{ totalIndirect }}</text>
            <text class="hero-stat-label">间接转发</text>
          </view>
          <view class="hero-stat-divider"></view>
          <view class="hero-stat-item">
            <text class="hero-stat-value">{{ totalAll }}</text>
            <text class="hero-stat-label">总计覆盖</text>
          </view>
        </view>
      </view>

      <view class="section-header">转发树形图</view>

      <!-- ========== 树形列表 ========== -->
      <view class="tree-container">
        <!-- 顶层：自己 -->
        <view class="tree-root">
          <view class="root-card">
            <view class="root-accent"></view>
            <view class="root-avatar-wrap">
              <image
                class="root-avatar"
                :src="myInfo.avatar ? getProductImageUrlChat(myInfo.avatar) : defaultAvatar"
                mode="aspectFill"
              />
              <view class="root-crown">👑</view>
            </view>
            <view class="root-info">
              <view class="root-name-row">
                <text class="root-name">{{ myInfo.name }}</text>
                <view class="root-tag">
                  <text class="root-tag-text">我自己</text>
                </view>
              </view>
              <text class="root-sub">{{ myInfo.phone }} · {{ myInfo.company }}</text>
            </view>
            <view class="root-count">
              <text class="root-count-num">{{ secondLevelList.length }}</text>
              <text class="root-count-label">人</text>
            </view>
          </view>

          <!-- 连接线 -->
          <view class="tree-connector" v-if="secondLevelList.length"></view>

          <!-- 二级列表 -->
          <view class="tree-children" v-if="secondLevelList.length">
            <view
              class="tree-node"
              v-for="node in secondLevelList"
              :key="node.id"
            >
              <!-- 二级节点卡片 -->
              <view class="node-card" :class="{ 'node-card-active': node.expanded }" @tap="toggleNode(node)">
                <view class="node-avatar-wrap">
                  <image
                    class="node-avatar"
                    :src="node.avatar ? getProductImageUrlChat(node.avatar) : defaultAvatar"
                    mode="aspectFill"
                  />
                </view>
                <view class="node-info">
                  <view class="node-name-row">
                    <text class="node-name">{{ node.name }}</text>
                    <view class="node-status" :class="node.isMember ? 'node-status-vip' : 'node-status-normal'">
                      <text class="node-status-text">{{ node.isMember ? '会员' : '普通' }}</text>
                    </view>
                  </view>
                  <text class="node-sub">{{ node.phone }} · {{ node.company || '暂未绑定企业' }}</text>
                  <view class="node-meta">
                    <text class="node-meta-time">转发于 {{ node.shareTime }}</text>
                    <view class="node-meta-children" v-if="node.children && node.children.length">
                      <text class="node-meta-children-icon">👥</text>
                      <text class="node-meta-children-text">{{ node.children.length }}人再转发</text>
                    </view>
                  </view>
                </view>
                <view class="node-action">
                  <view class="node-expand" v-if="node.children && node.children.length">
                    <text class="node-expand-icon" :class="{ 'icon-rotate': node.expanded }">›</text>
                  </view>
                  <view class="node-expand node-expand-empty" v-else>
                    <text class="node-expand-empty-text">无</text>
                  </view>
                </view>
              </view>

              <!-- 三级列表（展开时显示） -->
              <view class="tree-sub-children" v-if="node.expanded && node.children && node.children.length">
                <view class="sub-connector"></view>
                <view class="sub-list">
                  <view
                    class="sub-node"
                    v-for="(child, cIndex) in node.children"
                    :key="child.id"
                  >
                    <view class="sub-dot" :class="{ 'sub-dot-last': cIndex === node.children.length - 1 }"></view>
                    <view class="sub-card">
                      <view class="sub-avatar-wrap">
                        <image
                          class="sub-avatar"
                          :src="child.avatar ? getProductImageUrlChat(child.avatar) : defaultAvatar"
                          mode="aspectFill"
                        />
                      </view>
                      <view class="sub-info">
                        <view class="sub-name-row">
                          <text class="sub-name">{{ child.name }}</text>
                          <view class="sub-status" :class="child.isMember ? 'sub-status-vip' : 'sub-status-normal'">
                            <text class="sub-status-text">{{ child.isMember ? '会员' : '普通' }}</text>
                          </view>
                        </view>
                        <text class="sub-sub">{{ child.phone }} · {{ child.company || '暂未绑定企业' }}</text>
                        <text class="sub-time">转发于 {{ child.shareTime }}</text>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 空状态 -->
          <view v-else class="tree-empty">
            <empty-state title="还没有转发记录" hint="分享给好友后，他们的注册记录会展示在这里" />
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import EmptyState from '@/common/components/empty-state.vue'
import { getProductImageUrlChat } from '@/common/utils/index.js'

export default {
  components: {
    EmptyState
  },
  data() {
    return {
      refreshing: false, // 下拉刷新状态
      defaultAvatar: 'https://img2cdn.global-dsc.cn/dgzz_img/8520f53eeff21f5a388f30b67e54e287.png', // 默认头像
      // ----------- 顶层：自己的信息（写死数据）
      myInfo: {
        name: '张伟',
        phone: '138****6688',
        company: '苏州智造科技有限公司',
        avatar: ''
      },
      // ----------- 二级转发列表（写死数据）
      secondLevelList: [
        {
          id: 1,
          name: '李明',
          phone: '139****2233',
          company: '上海精密机械有限公司',
          avatar: '',
          isMember: true,
          shareTime: '2025-07-15',
          expanded: false,
          children: [
            {
              id: 11,
              name: '王芳',
              phone: '137****8899',
              company: '杭州自动化设备公司',
              avatar: '',
              isMember: true,
              shareTime: '2025-07-18'
            },
            {
              id: 12,
              name: '赵强',
              phone: '135****5566',
              company: '南京工业控制技术',
              avatar: '',
              isMember: false,
              shareTime: '2025-07-20'
            }
          ]
        },
        {
          id: 2,
          name: '陈静',
          phone: '136****7788',
          company: '深圳智能装备公司',
          avatar: '',
          isMember: true,
          shareTime: '2025-07-10',
          expanded: false,
          children: [
            {
              id: 21,
              name: '刘洋',
              phone: '138****1122',
              company: '广州机器人技术公司',
              avatar: '',
              isMember: false,
              shareTime: '2025-07-22'
            }
          ]
        },
        {
          id: 3,
          name: '周涛',
          phone: '133****4455',
          company: '暂未绑定企业',
          avatar: '',
          isMember: false,
          shareTime: '2025-07-19',
          expanded: false,
          children: []
        },
        {
          id: 4,
          name: '孙琳',
          phone: '131****9900',
          company: '北京精密仪器公司',
          avatar: '',
          isMember: true,
          shareTime: '2025-07-05',
          expanded: false,
          children: [
            {
              id: 41,
              name: '吴磊',
              phone: '132****3344',
              company: '天津机械制造公司',
              avatar: '',
              isMember: false,
              shareTime: '2025-07-25'
            },
            {
              id: 42,
              name: '郑雪',
              phone: '134****6677',
              company: '济南自动化科技公司',
              avatar: '',
              isMember: true,
              shareTime: '2025-07-26'
            },
            {
              id: 43,
              name: '冯刚',
              phone: '130****8899',
              company: '暂未绑定企业',
              avatar: '',
              isMember: false,
              shareTime: '2025-07-28'
            }
          ]
        }
      ]
    }
  },
  computed: {
    // ----------- 直接转发数量（二级总数）
    totalDirect() {
      return this.secondLevelList.length
    },
    // ----------- 间接转发数量（三级总数）
    totalIndirect() {
      return this.secondLevelList.reduce((sum, node) => {
        return sum + (node.children ? node.children.length : 0)
      }, 0)
    },
    // ----------- 总计覆盖人数
    totalAll() {
      return this.totalDirect + this.totalIndirect
    }
  },
  onLoad() {
    // 页面加载时初始化
  },
  methods: {
    // ----------- 展开/折叠二级节点
    toggleNode(node) {
      node.expanded = !node.expanded
    },

    // ----------- 下拉刷新
    onRefresh() {
      this.refreshing = true
      // 模拟刷新
      setTimeout(() => {
        this.refreshing = false
      }, 800)
    },

    getProductImageUrlChat
  }
}
</script>

<style scoped lang="scss">
page {
  background: linear-gradient(180deg, #f6f8fc 0%, #eef3fb 100%);
}

.share-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f6f8fc 0%, #eef3fb 100%);
}

.page-scroll {
  height: 100vh;
  box-sizing: border-box;
}

/* ========== 顶部统计卡片 ========== */
.hero-card {
  position: relative;
  margin: 24rpx 24rpx 20rpx;
  padding: 32rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #6d28d9 0%, #8b5cf6 50%, #a78bfa 100%);
  box-shadow: 0 18rpx 40rpx rgba(109, 40, 217, 0.22);
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(6rpx);
}

.hero-glow-left {
  top: -80rpx;
  left: -40rpx;
  width: 240rpx;
  height: 240rpx;
  background: rgba(255, 255, 255, 0.14);
}

.hero-glow-right {
  top: 20rpx;
  right: -50rpx;
  width: 280rpx;
  height: 280rpx;
  background: rgba(196, 181, 253, 0.1);
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1rpx, transparent 1rpx),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1rpx, transparent 1rpx);
  background-size: 44rpx 44rpx;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.8), transparent 92%);
}

.hero-title-row {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.hero-copy {
  flex: 1;
  min-width: 0;
}

.hero-title {
  font-size: 42rpx;
  font-weight: 700;
  line-height: 1.28;
  color: #ffffff;
}

.hero-desc {
  display: block;
  margin-top: 18rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.82);
}

.hero-stats {
  position: relative;
  z-index: 1;
  margin-top: 28rpx;
  display: flex;
  align-items: center;
  padding: 20rpx 12rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
}

.hero-stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.hero-stat-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #ffffff;
}

.hero-stat-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.78);
}

.hero-stat-divider {
  width: 1rpx;
  height: 52rpx;
  background: rgba(255, 255, 255, 0.22);
}

/* ========== 区块标题 ========== */
.section-header {
  margin: 30rpx 24rpx 20rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
}

/* ========== 树形容器 ========== */
.tree-container {
  padding: 0 24rpx 40rpx;
}

.tree-root {
  position: relative;
}

/* ========== 顶层根节点 ========== */
.root-card {
  position: relative;
  display: flex;
  align-items: center;
  padding: 28rpx 26rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #ffffff 0%, #f5f0ff 100%);
  border: 2rpx solid rgba(139, 92, 246, 0.2);
  box-shadow: 0 18rpx 44rpx rgba(109, 40, 217, 0.1);
  overflow: hidden;
}

.root-accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 10rpx;
  background: linear-gradient(180deg, #8b5cf6 0%, #a78bfa 100%);
}

.root-avatar-wrap {
  position: relative;
  flex-shrink: 0;
  margin-right: 22rpx;
}

.root-avatar {
  width: 86rpx;
  height: 86rpx;
  border-radius: 50%;
  border: 3rpx solid rgba(139, 92, 246, 0.3);
}

.root-crown {
  position: absolute;
  top: -10rpx;
  right: -6rpx;
  font-size: 28rpx;
}

.root-info {
  flex: 1;
  min-width: 0;
}

.root-name-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.root-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.root-tag {
  flex-shrink: 0;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
}

.root-tag-text {
  font-size: 22rpx;
  font-weight: 600;
  color: #ffffff;
}

.root-sub {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.root-count {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 16rpx;
  padding: 12rpx 20rpx;
  border-radius: 20rpx;
  background: rgba(139, 92, 246, 0.08);
}

.root-count-num {
  font-size: 36rpx;
  font-weight: 700;
  color: #7c3aed;
  line-height: 1.1;
}

.root-count-label {
  font-size: 22rpx;
  color: #94a3b8;
  margin-top: 4rpx;
}

/* ========== 连接线 ========== */
.tree-connector {
  width: 3rpx;
  height: 32rpx;
  margin-left: 68rpx;
  background: linear-gradient(180deg, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.15) 100%);
}

/* ========== 二级节点 ========== */
.tree-children {
  position: relative;
  padding-left: 48rpx;
  border-left: 3rpx dashed rgba(139, 92, 246, 0.2);
  margin-left: 68rpx;
}

.tree-node {
  position: relative;
  margin-top: 20rpx;
}

/* 节点前的圆点 */
.tree-node::before {
  content: '';
  position: absolute;
  left: -51rpx;
  top: 40rpx;
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #8b5cf6;
  border: 3rpx solid #ede9fe;
  z-index: 1;
}

.node-card {
  display: flex;
  align-items: center;
  padding: 24rpx 22rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.96);
  border: 1rpx solid rgba(226, 232, 240, 0.95);
  box-shadow: 0 12rpx 32rpx rgba(15, 23, 42, 0.06);
  transition: all 0.2s ease;
}

.node-card-active {
  border-color: rgba(139, 92, 246, 0.3);
  box-shadow: 0 12rpx 32rpx rgba(109, 40, 217, 0.1);
}

.node-avatar-wrap {
  flex-shrink: 0;
  margin-right: 20rpx;
}

.node-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(226, 232, 240, 0.8);
}

.node-info {
  flex: 1;
  min-width: 0;
}

.node-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.node-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-status {
  flex-shrink: 0;
  padding: 2rpx 12rpx;
  border-radius: 999rpx;
}

.node-status-vip {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.node-status-vip .node-status-text {
  color: #b45309;
}

.node-status-normal {
  background: #f1f5f9;
}

.node-status-normal .node-status-text {
  color: #64748b;
}

.node-status-text {
  font-size: 22rpx;
  font-weight: 600;
}

.node-sub {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #94a3b8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-meta {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-top: 10rpx;
}

.node-meta-time {
  font-size: 22rpx;
  color: #cbd5e1;
}

.node-meta-children {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 2rpx 10rpx;
  border-radius: 999rpx;
  background: rgba(139, 92, 246, 0.08);
}

.node-meta-children-icon {
  font-size: 20rpx;
}

.node-meta-children-text {
  font-size: 22rpx;
  font-weight: 600;
  color: #7c3aed;
}

.node-action {
  flex-shrink: 0;
  margin-left: 12rpx;
}

.node-expand {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(139, 92, 246, 0.06);
}

.node-expand-icon {
  font-size: 36rpx;
  color: #8b5cf6;
  font-weight: bold;
  transition: transform 0.3s ease;
  transform: rotate(0deg);
}

.icon-rotate {
  transform: rotate(90deg);
}

.node-expand-empty {
  background: transparent;
}

.node-expand-empty-text {
  font-size: 22rpx;
  color: #cbd5e1;
}

/* ========== 三级节点 ========== */
.tree-sub-children {
  position: relative;
  margin-top: 16rpx;
  padding-left: 20rpx;
}

.sub-connector {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 20rpx;
  width: 3rpx;
  background: linear-gradient(180deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%);
}

.sub-list {
  position: relative;
}

.sub-node {
  position: relative;
  padding-left: 28rpx;
  margin-bottom: 14rpx;
}

.sub-dot {
  position: absolute;
  left: -2rpx;
  top: 28rpx;
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #c4b5fd;
  border: 2rpx solid #ede9fe;
  z-index: 1;
}

.sub-card {
  display: flex;
  align-items: center;
  padding: 18rpx 20rpx;
  border-radius: 20rpx;
  background: rgba(250, 245, 255, 0.6);
  border: 1rpx solid rgba(196, 181, 253, 0.15);
}

.sub-avatar-wrap {
  flex-shrink: 0;
  margin-right: 16rpx;
}

.sub-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(196, 181, 253, 0.2);
}

.sub-info {
  flex: 1;
  min-width: 0;
}

.sub-name-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.sub-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sub-status {
  flex-shrink: 0;
  padding: 2rpx 10rpx;
  border-radius: 999rpx;
}

.sub-status-vip {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.sub-status-vip .sub-status-text {
  color: #b45309;
}

.sub-status-normal {
  background: #f1f5f9;
}

.sub-status-normal .sub-status-text {
  color: #64748b;
}

.sub-status-text {
  font-size: 20rpx;
  font-weight: 600;
}

.sub-sub {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #94a3b8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sub-time {
  display: block;
  margin-top: 4rpx;
  font-size: 20rpx;
  color: #cbd5e1;
}

/* ========== 空状态 ========== */
.tree-empty {
  padding: 40rpx 0;
}
</style>
