<template>
  <view class="child-container">
    <view class="child-list">
      <view class="child-wrapper" v-for="item in visibleNodes" :key="item.node._id" :style="getNodeStyle(item.level)">
        <view class="fission-item child-item" :class="{ 'child-item-expanded': item.node._expanded && item.node.children && item.node.children.length }" @tap.stop="toggleNode(item.node)">
          <view class="item-avatar-wrap">
            <view class="avatar-glow"></view>
            <image class="item-avatar" :class="{ 'avatar-deep': item.level > 2 }" :src="getAvatar(item.node)" mode="aspectFill" @error="onAvatarError(item.node)" />
            <view class="level-mark" :class="{ 'level-mark-deep': item.level > 2 }">L{{ item.level }}</view>
          </view>
          <view class="item-info">
            <view class="item-name-row">
              <text class="item-name" :class="{ 'name-deep': item.level > 2 }">{{ showName(item.node) }}</text>
              <view class="member-tag" :class="{ 'tag-vip': item.node.isMember }">
                <view class="member-dot" :class="{ 'dot-vip': item.node.isMember }"></view>
                <text class="member-tag-text">{{ item.node.isMember ? '正式会员' : '普通用户' }}</text>
              </view>
            </view>
            <view class="cc-company-chip" :class="{ 'chip-deep': item.level > 2 }" v-if="item.node.compName">
              <view class="cc-company-chip-icon">企</view>
              <text class="cc-company-chip-name">{{ item.node.compName }}</text>
            </view>
          </view>
          <view class="item-action" v-if="item.node.children && item.node.children.length">
            <view class="fwd-count" :class="{ 'fwd-count-on': item.node._expanded }">
              <view class="fwd-count-dot"></view>
              <text>{{ item.node.children.length }} 位成员</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { showName, getProductImageUrlChat } from '@/common/utils/index.js'

export default {
  name: 'ShareTreeNode',
  emits: ['toggle'], // 节点展开事件
  props: {
    nodes: { // 当前层级节点列表
      type: Array,
      default: () => []
    },
    level: { // 当前节点层级
      type: Number,
      default: 2
    }
  },
  data() {
    return {
      defaultAvatar: 'https://img2cdn.global-dsc.cn/dgzz_img/8520f53eeff21f5a388f30b67e54e287.png', // 默认头像
    }
  },
  computed: {
    // ----------- 递归获取当前需要展示的全部节点
    visibleNodes() {
      const result = [] // 当前可见节点
      const appendNodes = (nodes, currentLevel) => {
        nodes.forEach((node) => {
          result.push({ node, level: currentLevel })
          if (node._expanded && node.children && node.children.length) {
            appendNodes(node.children, currentLevel + 1)
          }
        })
      }
      appendNodes(this.nodes, this.level)
      return result
    }
  },
  methods: {
    showName,

    // ----------- 获取用户头像
    getAvatar(node) {
      if (!node.userLogo) return this.defaultAvatar
      try {
        return getProductImageUrlChat(node.userLogo)
      } catch (e) {
        return this.defaultAvatar
      }
    },

    // ----------- 头像加载失败时回退默认头像
    onAvatarError(node) {
      node.userLogo = '' // 清空头像地址，下次渲染使用默认头像
    },

    // ----------- 展开或收起当前节点
    toggleNode(node) {
      if (!node.children || !node.children.length) return
      this.$emit('toggle', node)
    },

    // ----------- 获取不同层级节点的缩进样式
    getNodeStyle(currentLevel) {
      const indent = Math.min(Math.max(currentLevel - this.level, 0) * 12, 36) // 当前节点缩进
      return { marginLeft: `${indent}rpx` }
    }
  }
}
</script>

<style scoped lang="scss">
@keyframes nodeOpen {
  from { opacity: 0; transform: translateY(-12rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes avatarAura {
  0%, 100% { opacity: 0.15; transform: scale(0.9); }
  50% { opacity: 0.5; transform: scale(1.1); }
}

.child-container {
  position: relative;
  padding: 16rpx 8rpx 14rpx 16rpx;
  background: #f5f6fa;
  animation: nodeOpen 0.28s ease-out both;
}

.child-container .child-container {
  padding: 12rpx 4rpx 10rpx 12rpx;
  background: #ebedf3;
}

.child-container.deep-container {
  padding-left: 4rpx;
}

.child-list {
  min-width: 0;
}

.child-wrapper {
  min-width: 0;
  margin-bottom: 10rpx;
  overflow: hidden;
  border: 1rpx solid #edeff4;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(15, 23, 42, 0.2);

  &:last-child {
    margin-bottom: 0;
  }
}

.fission-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 22rpx 20rpx;
  transition: background 0.2s ease;

  &:active {
    background: #f8f9fc;
  }
}

.child-item-expanded {
  border-bottom: 1rpx solid #f5f6fa;
}

.item-avatar-wrap {
  position: relative;
  flex-shrink: 0;
  margin-right: 20rpx;
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

.child-wrapper:nth-child(2n) .avatar-glow {
  animation-delay: -1.7s;
}

.item-avatar {
  width: 64rpx;
  height: 64rpx;
  border: 2rpx solid #edeff4;
  border-radius: 50%;
  background: #f8f9fc;
}

.item-avatar.avatar-deep {
  width: 56rpx;
  height: 56rpx;
}

.level-mark {
  position: absolute;
  right: -8rpx;
  bottom: -2rpx;
  min-width: 30rpx;
  height: 22rpx;
  padding: 0 4rpx;
  border: 2rpx solid #fff;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #56a7ff, #4d8cf5);
  color: #fff;
  font-size: 14rpx;
  font-weight: 700;
  line-height: 22rpx;
  text-align: center;
  box-sizing: content-box;
}

.level-mark.level-mark-deep {
  min-width: 28rpx;
  height: 20rpx;
  font-size: 12rpx;
  line-height: 20rpx;
}

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
  overflow: hidden;
  margin-right: 20rpx;
  color: #0f172a;
  font-size: 26rpx;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-name.name-deep {
  font-size: 24rpx;
}

.member-tag {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6rpx;

  &.tag-vip .member-tag-text {
    color: #d99224;
    font-weight: 700;
  }
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
  color: #8a96a3;
  font-size: 20rpx;
  line-height: 1;
}

.cc-company-chip {
  display: flex;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  padding: 2rpx 10rpx 2rpx 4rpx;
  border: 1rpx solid #b9d6ff;
  border-radius: 999rpx;
  background: #eef5ff;
  box-sizing: border-box;
}

.cc-company-chip-icon {
  flex-shrink: 0;
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: #4a8cff;
  color: #fff;
  font-size: 16rpx;
  font-weight: 700;
  line-height: 24rpx;
  text-align: center;
}

.cc-company-chip-name {
  min-width: 0;
  overflow: hidden;
  margin-left: 6rpx;
  color: #3f7edb;
  font-size: 22rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip-deep {
  padding: 2rpx 8rpx 2rpx 2rpx;

  .cc-company-chip-icon {
    width: 20rpx;
    height: 20rpx;
    font-size: 14rpx;
    line-height: 20rpx;
  }

  .cc-company-chip-name {
    font-size: 20rpx;
  }
}

.item-action {
  flex-shrink: 0;
  margin-left: 12rpx;
}

.fwd-count {
  display: flex;
  align-items: center;
  padding: 8rpx 12rpx;
  border: 1rpx solid #dbe5f5;
  border-radius: 999rpx;
  color: #7b8798;
  font-size: 20rpx;
  white-space: nowrap;
}

.fwd-count-on {
  border-color: #b9d6ff;
  background: #eef5ff;
  color: #4a8cff;
}

.fwd-count-dot {
  width: 8rpx;
  height: 8rpx;
  margin-right: 8rpx;
  border-radius: 50%;
  background: #4a8cff;
}
</style>
