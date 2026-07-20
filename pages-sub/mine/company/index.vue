<template>
  <view class="company-page">
    <scroll-view class="page-scroll" scroll-y>
      <!-- ========== 列表区标题 ========== -->
      <view class="list-head">
        <view class="lh-bar"></view>
        <text class="lh-title">企业列表</text>
        <text class="lh-count" v-if="list.length">共 {{ list.length }} 家</text>
        <view class="lh-actions">
          <view class="lh-action-btn" @tap="showAddDirPopup">
            <text class="lh-action-icon">➕</text>
          </view>
          <view class="lh-action-btn lh-action-del" @tap="showDeleteDirSheet" v-if="dirList.length">
            <text class="lh-action-icon">➖</text>
          </view>
        </view>
      </view>

      <!-- ========== 目录选择栏 ========== -->
      <view class="dir-bar">
        <scroll-view class="dir-scroll" scroll-x :show-scrollbar="false">
          <view class="dir-tabs">
            <!-- 全部 -->
            <view class="dir-tab" :class="{ 'dir-tab-active': activeDirId === 0 }" @tap="onDirTap(0)">
              <text class="dir-tab-text">全部</text>
            </view>
            <!-- 各目录 -->
            <view
              class="dir-tab"
              :class="{ 'dir-tab-active': activeDirId === item.DirID }"
              v-for="item in dirList"
              :key="item.DirID"
              @tap="onDirTap(item.DirID)"
            >
              <text class="dir-tab-text">{{ item.DirName }}</text>
              <text class="dir-tab-count" v-if="item.DataCount">{{ item.DataCount }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- ========== 骨架屏 ========== -->
      <view v-if="loading && !list.length" class="skeleton-wrap">
        <view class="skeleton-card" v-for="i in 4" :key="i">
          <view class="skeleton-line skeleton-title"></view>
          <view class="skeleton-tags">
            <view class="skeleton-tag"></view>
            <view class="skeleton-tag"></view>
          </view>
          <view class="skeleton-line skeleton-short"></view>
        </view>
      </view>

      <!-- ========== 公司列表 ========== -->
      <view v-else-if="list.length" class="company-list">
        <view
          class="c-card"
          v-for="(item, index) in list"
          :key="index"
          :style="{ animationDelay: (0.05 + index * 0.08) + 's' }"
          @tap="onCardTap(item)"
        >
          <!-- 右上角柔和光晕 -->
          <view class="cc-halo"></view>

          <!-- 头部：图标 + 公司名称 -->
          <view class="cc-head">
            <view class="cc-icon-wrap" :class="`cc-icon-${index % 4}`">
              <text class="cc-icon-txt">🏢</text>
            </view>
            <text class="cc-title">{{ item.companyName || '未知公司' }}</text>
          </view>

          <!-- 标签芯片 -->
          <view class="cc-chips">
            <view class="cc-chip chip-loc" v-if="getAddressText(item) !== '暂无地址'">
              <text class="chip-ico">📍</text>
              <text class="chip-text">{{ getAddressText(item) }}</text>
            </view>
            <view class="cc-chip chip-fa" v-if="item.faRen">
              <text class="chip-ico">🧑‍💼‍</text>
              <text class="chip-text">法人 {{ item.faRen }}</text>
            </view>
          </view>

          <!-- 底部：查看详情按钮 -->
          <view class="cc-foot">
            <text class="cc-time" v-if="item.distance">⛹ 距您 {{ (parseInt(item.distance) / 1000).toFixed(2) }}km</text>
            <view class="cc-foot-actions">
              <view class="cc-move-btn" @tap.stop="showMoveDirSheet(item)">
                <text class="cc-move-btn-text">修改目录</text>
              </view>
              <view class="cc-btn">
                <text class="cc-btn-text">查看详情</text>
                <text class="cc-btn-arrow">→</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- ========== 空状态 ========== -->
      <empty-state
        v-else
        title="暂无收藏的公司"
        hint="去探客页收藏感兴趣的企业吧"
      />
    </scroll-view>

    <!-- ========== 新建目录弹窗 ========== -->
    <view class="dir-mask" v-if="addDirVisible" @tap="hideAddDirPopup">
      <view class="dir-modal" @tap.stop>
        <!-- 顶部渐变装饰区 -->
        <view class="dir-modal-hero">
          <view class="dir-modal-glow glow-a"></view>
          <view class="dir-modal-glow glow-b"></view>
          <view class="dir-modal-grid"></view>
          <view class="dir-modal-hero-content">
            <view class="dir-modal-icon-wrap">
              <text class="dir-modal-icon">📁</text>
            </view>
            <text class="dir-modal-title">新建目录</text>
            <text class="dir-modal-sub">为收藏的公司创建一个分类目录</text>
          </view>
          <view class="dir-modal-close" @tap="hideAddDirPopup">
            <text class="dir-modal-close-icon">✕</text>
          </view>
        </view>
        <!-- 表单区 -->
        <view class="dir-modal-body">
          <view class="dir-form-item">
            <text class="dir-form-label">目录名称</text>
            <view class="dir-form-input-wrap">
              <input class="dir-form-input" v-model="addDirForm.dirName" placeholder="请输入目录名称" placeholder-class="dir-form-placeholder" maxlength="20" />
              <text class="dir-form-count">{{ addDirForm.dirName.length }}/20</text>
            </view>
          </view>
        </view>
        <!-- 底部按钮 -->
        <view class="dir-modal-footer">
          <view class="dir-modal-btn dir-modal-btn-cancel" @tap="hideAddDirPopup">
            <text class="dir-modal-btn-text">取消</text>
          </view>
          <view class="dir-modal-btn dir-modal-btn-confirm" :class="{ 'btn-disabled': !addDirForm.dirName.trim() || submitting }" @tap="onConfirmAddDir">
            <text class="dir-modal-btn-text">确认创建</text>
          </view>
        </view>
      </view>
    </view>

    <!-- ========== 删除目录弹框 ========== -->
    <view class="del-mask" v-if="deleteDirVisible" @tap="hideDeleteDirSheet">
      <view class="dir-modal" @tap.stop>
        <!-- 顶部渐变装饰区 -->
        <view class="dir-modal-hero del-hero">
          <view class="dir-modal-glow glow-a"></view>
          <view class="dir-modal-glow glow-b"></view>
          <view class="dir-modal-grid"></view>
          <view class="dir-modal-hero-content">
            <view class="dir-modal-icon-wrap del-hero-icon">
              <text class="dir-modal-icon">✖</text>
            </view>
            <text class="dir-modal-title">删除目录</text>
            <text class="dir-modal-sub">选择需要删除的目录</text>
          </view>
          <view class="dir-modal-close" @tap="hideDeleteDirSheet">
            <text class="dir-modal-close-icon">✕</text>
          </view>
        </view>
        <!-- 目录列表 -->
        <view class="dir-modal-body del-modal-list-wrap">
          <scroll-view class="del-modal-list" scroll-y>
            <view class="del-dir-item" v-for="item in dirList" :key="item.DirID" @tap="onTapDeleteDir(item)">
              <text class="del-dir-name">{{ item.DirName }}</text>
              <text class="del-dir-count" v-if="item.DataCount">{{ item.DataCount }} 家</text>
              <text class="del-dir-del">删除</text>
            </view>
          </scroll-view>
        </view>
        <!-- 底部按钮 -->
        <view class="dir-modal-footer">
          <view class="dir-modal-btn dir-modal-btn-cancel" @tap="hideDeleteDirSheet">
            <text class="dir-modal-btn-text">取消</text>
          </view>
        </view>
      </view>
    </view>

    <!-- ========== 删除确认弹框 ========== -->
    <view class="del-confirm-mask" v-if="confirmDeleteVisible" @tap="cancelDelete">
      <view class="del-confirm-modal" @tap.stop>
        <view class="del-confirm-icon-wrap">
          <text class="del-confirm-icon">⚠️</text>
        </view>
        <text class="del-confirm-title">确认删除</text>
        <text class="del-confirm-desc">确定要删除目录「{{ pendingDeleteDir?.DirName }}」吗？删除后不可恢复</text>
        <view class="del-confirm-actions">
          <view class="del-confirm-btn del-confirm-cancel" @tap="cancelDelete">
            <text class="del-confirm-btn-text">取消</text>
          </view>
          <view class="del-confirm-btn del-confirm-ok" :class="{ 'btn-disabled': submitting }" @tap="onConfirmDeleteDir">
            <text class="del-confirm-btn-text">确认删除</text>
          </view>
        </view>
      </view>
    </view>

    <!-- ========== 修改目录弹框 ========== -->
    <view class="move-mask" v-if="moveDirVisible" @tap="hideMoveDirSheet">
      <view class="dir-modal" @tap.stop>
        <view class="dir-modal-hero move-hero">
          <view class="dir-modal-glow glow-a"></view>
          <view class="dir-modal-glow glow-b"></view>
          <view class="dir-modal-grid"></view>
          <view class="dir-modal-hero-content">
            <view class="dir-modal-icon-wrap move-hero-icon">
              <text class="dir-modal-icon">📁</text>
            </view>
            <text class="dir-modal-title">修改目录</text>
            <text class="dir-modal-sub">选择要移动到的目录</text>
          </view>
          <view class="dir-modal-close" @tap="hideMoveDirSheet">
            <text class="dir-modal-close-icon">✕</text>
          </view>
        </view>
        <view class="dir-modal-body del-modal-list-wrap">
          <scroll-view class="del-modal-list" scroll-y>
            <view class="del-dir-item" v-for="item in dirList" :key="item.DirID" @tap="onConfirmMoveDir(item)">
              <text class="del-dir-name">{{ item.DirName }}</text>
              <text class="del-dir-count" v-if="item.DataCount">{{ item.DataCount }} 家</text>
              <text class="move-dir-action">移入</text>
            </view>
          </scroll-view>
        </view>
        <view class="dir-modal-footer">
          <view class="dir-modal-btn dir-modal-btn-cancel" @tap="hideMoveDirSheet">
            <text class="dir-modal-btn-text">取消</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import EmptyState from '@/common/components/empty-state.vue'
import { followEnterpriseList, addCompanyDir, getCompanyDirList, batchDeleteDir, deleteDirData, addDirData } from '@/static/api/index.js'

export default {
  components: {
    EmptyState
  },
  data() {
    return {
      loading: false,      // 加载状态
      list: [],            // 公司列表数据
      activeDirId: 0,      // 当前选中的目录ID，0=全部
      dirList: [],         // 目录列表
      addDirVisible: false, // 新建目录弹窗显隐
      addDirForm: {        // 新建目录表单
        dirName: ''        // 目录名称
      },
      submitting: false,   // 提交中状态
      deleteDirVisible: false, // 删除目录底部弹出层显隐
      confirmDeleteVisible: false, // 删除确认弹框显隐
      pendingDeleteDir: null, // 待删除的目录对象
      moveDirVisible: false, // 修改目录弹窗显隐
      pendingMoveItem: null, // 待修改目录的数据对象
      animStats: { total: 0, dirs: 0, cities: 0 }, // 顶部统计数字（动画补间显示用）
      _tweenTimers: {}     // 内部计时器存储
    }
  },
  computed: {
    // ----------- 覆盖城市数（去重）
    cityCount() {
      const cities = this.list.map(item => item.city).filter(Boolean)
      return new Set(cities).size
    }
  },
  watch: {
    // ----------- 监听列表变化触发统计动画
    list: {
      handler() {
        this.tweenStat('total', this.list.length)
        this.tweenStat('cities', this.cityCount)
      },
      deep: true
    },
    // ----------- 监听目录数量变化
    dirList() {
      this.tweenStat('dirs', this.dirList.length)
    }
  },
  onLoad() {
    this.getCompanyList()
    this.getDirList()
  },
  methods: {
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

    // ----------- 获取公司列表
    async getCompanyList() {
      this.loading = true
      try {
        const params = {
          lat: uni.getStorageSync('myLatitude'),
          lng: uni.getStorageSync('myLongitude')
        }
        // 选了具体目录时传入 dirId
        if (this.activeDirId) {
          params.dirId = this.activeDirId
        }
        const res = await followEnterpriseList(params)
        this.list = res.data?.list || []
      } catch (e) {
        this.list = []
      } finally {
        this.loading = false
      }
    },

    // ----------- 获取目录列表
    async getDirList() {
      try {
        const res = await getCompanyDirList(3137, 0)
        const data = res.Data || res.data || []
        this.dirList = Array.isArray(data) ? data : (data?.list || data?.rows || [])
      } catch (e) {
        this.dirList = []
      }
    },

    // ----------- 拼接地址：省 市 区
    getAddressText(item) {
      const addressList = [item.province, item.city, item.district].filter(Boolean) // 地址字段列表
      return addressList.length ? addressList.join(' ') : '暂无地址'
    },

    // ----------- 点击卡片跳详情
    onCardTap(item) {
      const companyInfo = encodeURIComponent(JSON.stringify({
        ...item,
        compName: item.companyName,
        province: item.province,
        city: item.city,
        district: item.district,
        faRen: item.faRen,
        latitude: item.latitude,
        longitude: item.longitude,
        distance: item.distance
      }))
      const myLatitude = uni.getStorageSync('myLatitude') || '' // 当前定位纬度
      const myLongitude = uni.getStorageSync('myLongitude') || '' // 当前定位经度
      uni.navigateTo({
        url: `/pages-sub/explore/comp-detail/index?companyInfo=${companyInfo}&myLatitude=${myLatitude}&myLongitude=${myLongitude}`
      })
    },

    // ----------- 点击目录标签切换
    onDirTap(dirId) {
      if (this.activeDirId === dirId) return
      this.activeDirId = dirId
      this.getCompanyList()
    },

    // ----------- 显示新建目录弹窗
    showAddDirPopup() {
      this.addDirForm.dirName = ''
      this.addDirVisible = true
    },

    // ----------- 隐藏新建目录弹窗
    hideAddDirPopup() {
      this.addDirVisible = false
    },

    // ----------- 确认新建目录
    async onConfirmAddDir() {
      const dirName = this.addDirForm.dirName.trim()
      if (!dirName) {
        uni.showToast({ title: '请输入目录名称', icon: 'none' })
        return
      }
      if (this.submitting) return
      this.submitting = true
      try {
        await addCompanyDir({
          DirName: dirName,
          OwnerCategoryID: 3137,
          ParentID: 0
        })
        uni.showToast({ title: '创建成功', icon: 'success' })
        this.hideAddDirPopup()
        this.getDirList()
      } catch (e) {
        // 错误已由 request 拦截器处理
      } finally {
        this.submitting = false
      }
    },

    // ----------- 显示删除目录底部弹出层
    showDeleteDirSheet() {
      this.deleteDirVisible = true
    },

    // ----------- 隐藏删除目录底部弹出层
    hideDeleteDirSheet() {
      this.deleteDirVisible = false
    },

    // ----------- 点击某个目录触发删除确认
    onTapDeleteDir(item) {
      this.pendingDeleteDir = item
      this.confirmDeleteVisible = true
    },

    // ----------- 取消删除
    cancelDelete() {
      this.confirmDeleteVisible = false
      this.pendingDeleteDir = null
    },

    // ----------- 确认删除目录
    async onConfirmDeleteDir() {
      if (this.submitting || !this.pendingDeleteDir) return
      this.submitting = true
      const dir = this.pendingDeleteDir
      try {
        // 1. 获取该目录下的所有数据
        const res = await followEnterpriseList({ dirId: dir.DirID })
        const dataList = res.data?.list || []
        // 2. 循环删除目录内每条数据
        if (dataList.length > 0) {
          uni.showLoading({ title: '删除中...', mask: true })
          for (const item of dataList) {
            await deleteDirData(item.id, dir.CategoryID)
          }
          uni.hideLoading()
        }
        // 3. 删除目录本身
        await batchDeleteDir(3137, dir.DirID)
        uni.showToast({ title: '删除成功', icon: 'success' })
        // 如果删除的是当前选中的目录，切回全部
        if (this.activeDirId === dir.DirID) {
          this.activeDirId = 0
          this.getCompanyList()
        }
        this.cancelDelete()
        this.hideDeleteDirSheet()
        this.getDirList()
      } catch (e) {
        uni.hideLoading()
        // 错误已由 request 拦截器处理
      } finally {
        this.submitting = false
      }
    },

    // ----------- 显示修改目录弹窗
    showMoveDirSheet(item) {
      this.pendingMoveItem = item
      this.moveDirVisible = true
    },

    // ----------- 隐藏修改目录弹窗
    hideMoveDirSheet() {
      this.moveDirVisible = false
      this.pendingMoveItem = null
    },

    // ----------- 确认移动到指定目录
    async onConfirmMoveDir(dir) {
      if (this.submitting || !this.pendingMoveItem) return
      this.submitting = true
      try {
        await addDirData({
          dirId: dir.DirID,
          dataId: this.pendingMoveItem.id,
          dirCategoryId: dir.CategoryID
        })
        uni.showToast({ title: '修改成功', icon: 'success' })
        this.hideMoveDirSheet()
        this.getCompanyList()
        this.getDirList()
      } catch (e) {
        // 错误已由 request 拦截器处理
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped lang="scss">
page {
  background: #f5f7fc;
}

.company-page {
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

// ==================== 目录选择栏
.dir-bar {
  display: flex;
  align-items: center;
  margin: 0 0 16rpx;
  padding: 4rpx 24rpx;
  gap: 14rpx;
}

.dir-scroll {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
}

.dir-tabs {
  display: inline-flex;
  align-items: center;
  gap: 14rpx;
}

.dir-tab {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  height: 56rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.7);
  border: 1rpx solid #eef0f6;
  box-shadow: 0 4rpx 14rpx rgba(15, 23, 42, 0.04);
  transition: all 0.25s ease;
  position: relative;
}

.dir-tab-active {
  background: linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #a855f7 100%);
  box-shadow: 0 8rpx 24rpx rgba(99, 102, 241, 0.35);
  border-color: transparent;
}

.dir-tab-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.5rpx;
}

.dir-tab-active .dir-tab-text {
  color: #ffffff;
}

.dir-tab-count {
  font-size: 20rpx;
  color: #94a3b8;
  margin-left: 8rpx;
  padding: 2rpx 10rpx;
  border-radius: 999rpx;
  background: rgba(148, 163, 184, 0.12);
}

.dir-tab-active .dir-tab-count {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.2);
}

// 新建目录按钮样式已移至列表标题区

// ==================== 列表区标题
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
  background: linear-gradient(180deg, #6366f1, #a855f7);
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

// 标题区操作按钮
.lh-actions {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.lh-action-btn {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(99, 102, 241, 0.4);
}


.lh-action-icon {
  font-size: 26rpx;
  color: #ffffff;
  font-weight: bold;
  line-height: 1;
}

// ==================== 公司列表
.company-list,
.skeleton-wrap {
  padding: 0 28rpx 56rpx;
}

.c-card {
  position: relative;
  overflow: hidden;
  margin-bottom: 22rpx;
  padding: 28rpx 30rpx 26rpx;
  border-radius: 28rpx;
  background: #fff;
  border: 1rpx solid #eef0f6;
  box-shadow: 0 10rpx 28rpx rgba(15, 23, 42, 0.05);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:active {
    transform: scale(0.99);
    box-shadow: 0 4rpx 14rpx rgba(15, 23, 42, 0.06);
  }
}

// 卡片右上角柔和光晕
.cc-halo {
  position: absolute;
  right: -80rpx;
  top: -80rpx;
  width: 220rpx;
  height: 220rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(99, 102, 241, 0.06) 40%, transparent 70%);
  pointer-events: none;
}

// 卡片头部：图标 + 公司名称
.cc-head {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.cc-icon-wrap {
  flex-shrink: 0;
  width: 64rpx;
  height: 64rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cc-icon-txt {
  font-size: 32rpx;
}

.cc-icon-0 {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  box-shadow: 0 6rpx 16rpx rgba(59, 130, 246, 0.18);
}

.cc-icon-1 {
  background: linear-gradient(135deg, #ede9fe, #ddd6fe);
  box-shadow: 0 6rpx 16rpx rgba(139, 92, 246, 0.18);
}

.cc-icon-2 {
  background: linear-gradient(135deg, #fce7f3, #fbcfe8);
  box-shadow: 0 6rpx 16rpx rgba(236, 72, 153, 0.18);
}

.cc-icon-3 {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  box-shadow: 0 6rpx 16rpx rgba(16, 185, 129, 0.18);
}

// 公司名称
.cc-title {
  flex: 1;
  min-width: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  font-size: 32rpx;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.45;
}

// 标签芯片
.cc-chips {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 22rpx;
}

.cc-chip {
  display: flex;
  align-items: center;
  gap: 8rpx;
  max-width: 100%;
  padding: 10rpx 18rpx;
  border-radius: 14rpx;
}

.chip-ico {
  font-size: 22rpx;
}

.chip-text {
  font-size: 24rpx;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip-loc {
  background: linear-gradient(135deg, #eef2ff, #ede9fe);
  border: 1rpx solid rgba(99, 102, 241, 0.12);
  border-radius: 40rpx;
  .chip-text { color: #6366f1; }
}

.chip-fa {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border: 1rpx solid rgba(16, 185, 129, 0.12);
  border-radius: 40rpx;
  .chip-text { color: #059669; }
}

// 底部：时间 + 按钮
.cc-foot {
  position: relative;
  margin-top: 24rpx;
  padding-top: 22rpx;
  border-top: 1rpx dashed #eef0f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cc-foot-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.cc-move-btn {
  display: flex;
  align-items: center;
  padding: 12rpx 26rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border: 1rpx solid rgba(59, 130, 246, 0.15);
  box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.12);
}

.cc-move-btn-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #2563eb;
}

.cc-time {
  display: inline-flex;
  align-items: center;
  padding: 6rpx 18rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #ff8d00;
  background: linear-gradient(135deg, #eef2ff, #ede9fe);
  border: 1rpx solid rgba(99, 102, 241, 0.12);
}

.cc-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 26rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  box-shadow: 0 8rpx 18rpx rgba(99, 102, 241, 0.3);
  position: relative;
  overflow: hidden;
}

.cc-btn-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #fff;
  position: relative;
  z-index: 1;
}

.cc-btn-arrow {
  font-size: 26rpx;
  font-weight: 700;
  color: #fff;
  line-height: 1;
  position: relative;
  z-index: 1;
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

@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

// ==================== 新建目录弹窗
.dir-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.55);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: maskFade 0.2s ease;
}

@keyframes maskFade {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dir-modal {
  width: 620rpx;
  border-radius: 32rpx;
  background: #ffffff;
  overflow: hidden;
  animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalIn {
  from {
    transform: scale(0.85) translateY(20rpx);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

// 弹窗顶部装饰区
.dir-modal-hero {
  position: relative;
  padding: 40rpx 36rpx 32rpx;
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #a855f7 100%);
  overflow: hidden;
}

.dir-modal-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(8rpx);
}

.glow-a {
  top: -60rpx;
  right: -30rpx;
  width: 200rpx;
  height: 200rpx;
  background: rgba(255, 255, 255, 0.12);
}

.glow-b {
  bottom: -40rpx;
  left: -20rpx;
  width: 160rpx;
  height: 160rpx;
  background: rgba(196, 181, 253, 0.1);
}

.dir-modal-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.04) 1rpx, transparent 1rpx),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1rpx, transparent 1rpx);
  background-size: 36rpx 36rpx;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.6), transparent 90%);
}

.dir-modal-hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dir-modal-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.15);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}

.dir-modal-icon {
  font-size: 40rpx;
}

.dir-modal-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 1rpx;
}

.dir-modal-sub {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.dir-modal-close {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  z-index: 2;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dir-modal-close-icon {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

// 表单区
.dir-modal-body {
  padding: 36rpx 36rpx 12rpx;
}

.dir-form-item {
  margin-bottom: 8rpx;
}

.dir-form-label {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #334155;
  margin-bottom: 16rpx;
  letter-spacing: 0.5rpx;
}

.dir-form-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.dir-form-input {
  flex: 1;
  height: 88rpx;
  padding: 0 100rpx 0 28rpx;
  border-radius: 20rpx;
  background: #f8fafc;
  border: 2rpx solid #e2e8f0;
  font-size: 30rpx;
  color: #1e293b;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

.dir-form-input:focus {
  border-color: #6366f1;
}

.dir-form-placeholder {
  color: #cbd5e1;
  font-size: 28rpx;
}

.dir-form-count {
  position: absolute;
  right: 24rpx;
  font-size: 22rpx;
  color: #94a3b8;
}

// 底部按钮
.dir-modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 24rpx 36rpx 36rpx;
}

.dir-modal-btn {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 22rpx;
  transition: all 0.15s ease;
}

.dir-modal-btn-cancel {
  background: #f1f5f9;
}

.dir-modal-btn-cancel .dir-modal-btn-text {
  color: #64748b;
}

.dir-modal-btn-confirm {
  background: linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #a855f7 100%);
  box-shadow: 0 10rpx 28rpx rgba(99, 102, 241, 0.3);
}

.dir-modal-btn-confirm .dir-modal-btn-text {
  color: #ffffff;
  font-weight: 600;
  letter-spacing: 1rpx;
}

.btn-disabled {
  opacity: 0.4;
  box-shadow: none;
}

.dir-modal-btn-text {
  font-size: 30rpx;
}

// ==================== 动画
// 通用淡入上移
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28rpx); }
  to { opacity: 1; transform: translateY(0); }
}

// 公司卡片错峰淡入
.c-card {
  animation: fadeUp 0.55s ease-out both;
}

// 卡片光晕呼吸
@keyframes haloBreath {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.12); }
}

.cc-halo {
  animation: haloBreath 4s ease-in-out infinite;
}

// 渐变按钮光带扫过
.cc-btn::after {
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

@keyframes btnShimmer {
  0% { left: -60%; }
  55%, 100% { left: 160%; }
}

// 按钮箭头微移
@keyframes arrowSlide {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(4rpx); }
}

.cc-btn-arrow {
  animation: arrowSlide 1.6s ease-in-out infinite;
}

// ==================== 删除目录弹框（复用新建弹窗风格）
.del-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

// 红色渐变头部
.del-hero {
  background: linear-gradient(135deg, #e11d48 0%, #f43f5e 50%, #fb7185 100%) !important;
}

.del-hero-icon {
  background: rgba(255, 255, 255, 0.25) !important;
  box-shadow: 0 8rpx 24rpx rgba(244, 63, 94, 0.3) !important;
}

// 目录列表区
.del-modal-list-wrap {
  padding: 20rpx 36rpx 12rpx !important;
}

.del-modal-list {
  max-height: 400rpx;
}

.del-dir-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  margin-bottom: 12rpx;
  border-radius: 16rpx;
  background: #f8fafc;
  border: 1rpx solid #f1f5f9;
  transition: all 0.2s;

  &:active {
    background: #fef2f2;
    border-color: #fecdd3;
  }

  &:last-child { margin-bottom: 0; }
}

.del-dir-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #1e293b;
}

.del-dir-count {
  font-size: 22rpx;
  color: #cbd5e1;
  margin-left: 16rpx;
}

.del-dir-del {
  margin-left: auto;
  font-size: 24rpx;
  color: #f43f5e;
  font-weight: 600;
}

// ==================== 修改目录弹框
.move-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.move-hero {
  background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%) !important;
}

.move-hero-icon {
  background: rgba(255, 255, 255, 0.25) !important;
  box-shadow: 0 8rpx 24rpx rgba(14, 165, 233, 0.3) !important;
}

.move-dir-action {
  margin-left: auto;
  font-size: 24rpx;
  color: #0ea5e9;
  font-weight: 600;
}

// ==================== 删除确认弹框
.del-confirm-mask {
  position: fixed;
  inset: 0;
  z-index: 1001;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.del-confirm-modal {
  width: 560rpx;
  background: #ffffff;
  border-radius: 28rpx;
  padding: 40rpx 36rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: popIn 0.25s ease-out;
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}

.del-confirm-icon-wrap {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.del-confirm-icon {
  font-size: 40rpx;
}

.del-confirm-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 12rpx;
}

.del-confirm-desc {
  font-size: 26rpx;
  color: #64748b;
  text-align: center;
  line-height: 1.5;
  margin-bottom: 36rpx;
}

.del-confirm-actions {
  display: flex;
  gap: 20rpx;
  width: 100%;
}

.del-confirm-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.del-confirm-cancel {
  background: #f1f5f9;
}

.del-confirm-cancel .del-confirm-btn-text {
  color: #64748b;
}

.del-confirm-ok {
  background: linear-gradient(135deg, #f43f5e 0%, #fb7185 100%);
  box-shadow: 0 8rpx 20rpx rgba(244, 63, 94, 0.3);
}

.del-confirm-ok .del-confirm-btn-text {
  color: #ffffff;
}

.del-confirm-btn-text {
  font-size: 28rpx;
  font-weight: 600;
}
</style>
