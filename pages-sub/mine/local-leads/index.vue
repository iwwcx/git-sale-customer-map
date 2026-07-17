<template>
  <view class="leads-page">
    <!-- 自定义 toast -->
    <view class="custom-toast-mask" v-if="toastVisible">
      <view class="custom-toast" :class="toastIcon ? 'custom-toast-' + toastIcon : ''">
        <text class="custom-toast-icon" v-if="toastIcon === 'success'">✓</text>
        <text class="custom-toast-icon" v-else-if="toastIcon === 'error'">✕</text>
        <text class="custom-toast-icon" v-else>ℹ</text>
        <text class="custom-toast-text">{{ toastTitle }}</text>
      </view>
    </view>

    <!-- 自定义确认弹窗 -->
    <view class="confirm-mask" v-if="confirmVisible" @tap="cancelConfirm">
      <view class="confirm-popup" @tap.stop>
        <view class="confirm-icon" :class="'confirm-icon-' + confirmType">
          <text v-if="confirmType === 'delete'">🚫</text>
          <text v-else>🚫</text>
        </view>
        <text class="confirm-title">{{ confirmTitle }}</text>
        <text class="confirm-content">{{ confirmContent }}</text>
        <view class="confirm-btns">
          <view class="confirm-btn confirm-btn-cancel" @tap="cancelConfirm">取消</view>
          <view class="confirm-btn confirm-btn-ok" :class="'confirm-btn-' + confirmType" @tap="okConfirm">确定</view>
        </view>
      </view>
    </view>

    <!-- 背景装饰光晕 -->
    <view class="page-decor">
      <view class="decor-blob blob-blue"></view>
      <view class="decor-blob blob-purple"></view>
    </view>

    <!-- ========== 顶部渐变区（hero + tab-bar） ========== -->
    <view class="top-section">
      <!-- ========== 顶部主视觉 ========== -->
      <view class="hero">
        <view class="hero-row">
          <view class="hero-info">
            <view class="hero-title-row">
              <text class="hero-sparkle">🎯</text>
              <text class="hero-title hero-title-gradient">我的线索</text>
            </view>
            <text class="hero-desc">根据您的<text style="color: red;"> 所在位置 </text> 和 <text style="color: red;">产品关键词</text>，匹配<text style="color: red;"> 近三天 </text>的精准需求<text style="color: #ad6a07;">（如何设置产品关键词，请与您的服务商或推荐官联系）</text></text>
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
    </view>

    <!-- ========== Tab 切换栏 ========== -->
    <view class="tab-bar">
      <view class="tab-slider" :class="{ 'slider-right': activeTab === 'history' }"></view>
      <view class="tab-item" :class="{ active: activeTab === 'fetch' }" @tap="switchTab('fetch')">
        <text class="tab-text">本地线索</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'history' }" @tap="switchTab('history')">
        <text class="tab-text">历史线索</text>
      </view>
    </view>

    <scroll-view class="page-scroll" scroll-y refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="onRefresh" @scrolltolower="onLoadMore" lower-threshold="100">
      <!-- ========== 获取线索 Tab ========== -->
      <template v-if="activeTab === 'fetch'">
        <!-- 接收线索按钮区 -->
        <view class="action-zone" v-if="!hasSearched">
          <view class="receive-card">
            <view class="receive-card-glow"></view>
            <view class="receive-icon-wrap">
              <view class="receive-icon-pulse"></view>
              <text class="receive-icon">📡</text>
            </view>
            <text class="receive-title">接收本地线索</text>
            <text class="receive-desc">点击按钮，系统将搜索<text style="color: red;"> 近三天内 </text>本地区与您<text style="color: red;"> 产品关键词 </text>匹配的<text style="color: #0086f0;"> 下载和浏览记录</text></text>
            <view class="receive-btn" :class="{ 'is-loading': searching }" @tap="onReceiveLeads">
              <view class="receive-btn-shine"></view>
              <view v-if="searching" class="btn-loading-spinner"></view>
              <text class="receive-btn-text">{{ searching ? '正在搜索...' : '接收线索' }}</text>
              <text v-if="!searching" class="receive-btn-arrow">→</text>
            </view>
          </view>
        </view>

        <!-- 搜索中骨架屏 -->
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

        <!-- 线索列表 -->
        <template v-if="hasSearched && !searching">
          <view class="list-head">
            <view class="lh-bar"></view>
            <text class="lh-title">本地线索</text>
            <view v-if="list.length" class="lh-badge">{{ list.length }}</view>
          </view>

          <view v-if="list.length" class="leads-list">
            <view class="lead-card" v-for="(item, index) in list" :key="item.clueId || item.userId || index" :style="{ animationDelay: index < 10 ? (0.05 + index * 0.08) + 's' : '0s' }">
              <!-- 右上角光晕 -->
              <view class="lc-halo" :class="item.type === 2 ? 'lc-halo-blue' : 'lc-halo-cyan'"></view>

              <!-- 提示文案 -->
              <view class="lc-tip">
                <text class="lc-tip-text">
                  <text class="lc-tip-user">{{ showName(item) }}</text>
                  于 {{ formatFullTime(item.operationTime) }}
                  <text class="lc-tip-action"> {{ item.type === 2 ? '下载' : '浏览' }}</text>
                  了 <text class="lc-tip-product"> {{ item.prodName || '相关产品' }}</text>，可能与您销售的产品类似，请及时关注跟进。
                </text>
              </view>

              <!-- 用户信息 -->
              <view class="lc-user-row">
                <view class="lc-user-info">
                  <image class="lc-user-avatar" :src="item.userLogo && !item._logoErr ? getProductImageUrlChat(item.userLogo) : (item.sex == 2 ? 'https://img2cdn.global-dsc.cn/dgzz_img/6842d00b7f7db24082ed4f59f2bba02a.png' : 'https://img2cdn.global-dsc.cn/dgzz_img/8520f53eeff21f5a388f30b67e54e287.png')" mode="aspectFill" @error="item._logoErr = true" />
                  <view class="lc-user-text">
                    <text class="lc-user-name">{{ showName(item) }}</text>
                    <text class="lc-user-company" v-if="item.compName">{{ item.compName }}</text>
                    <view class="lc-meta" v-if="item._distance || item.CProvince">
                      <text class="lc-meta-loc" v-if="item.CProvince">📍{{ [item.CProvince, item.CCity, item.CDistrict].filter(Boolean).join(' ') }}</text>
                      <text class="lc-meta-dist" v-if="item._distance">⛹ 距您 {{ item._distance }}</text>
                    </view>
                  </view>
                </view>
              </view>

              <!-- 底部操作按钮组 -->
              <view class="lc-actions">
                <view class="lc-action-btn lc-btn-follow" @tap="onFollowLead(item)">
                  <text class="lc-action-icon">🔍</text>
                  <text class="lc-action-label">跟进</text>
                </view>
                <view class="lc-action-btn lc-btn-ignore" @tap="onIgnoreLead(item)">
                  <text class="lc-action-icon">🚫</text>
                  <text class="lc-action-label">忽略</text>
                </view>
                <view class="lc-action-btn lc-btn-save" @tap="onSaveLead(item)">
                  <text class="lc-action-icon">⚡</text>
                  <text class="lc-action-label">保存</text>
                </view>
              </view>
            </view>

            <view class="footer-tip" v-if="hasSearched">
              <text v-if="loadingMore">· 加载中... ·</text>
              <text v-else-if="hasMore" @tap="onLoadMore">· 点击加载更多 ·</text>
              <text v-else>· 没有更多线索了 ·</text>
            </view>
          </view>

          <!-- 空状态 -->
          <empty-state
            v-else
            title="暂无匹配线索"
            hint="近三天本地区暂无与您产品关键词匹配的下载或浏览记录"
          />
        </template>
      </template>

      <!-- ========== 历史线索 Tab ========== -->
      <template v-if="activeTab === 'history'">
        <view class="list-head">
          <view class="lh-bar"></view>
          <text class="lh-title">历史线索</text>
          <view v-if="savedList.length" class="lh-badge">{{ savedList.length }}</view>
        </view>

        <view v-if="savedList.length" class="leads-list">
          <view class="lead-card saved-card" v-for="(item, index) in savedList" :key="item.clueId || item.userId || index" :style="{ animationDelay: index < 10 ? (0.05 + index * 0.08) + 's' : '0s' }">
            <view class="lc-halo" :class="item.type === 2 ? 'lc-halo-blue' : 'lc-halo-cyan'"></view>

            <!-- 提示文案 -->
            <view class="lc-tip">
              <text class="lc-tip-text">
                <text class="lc-tip-user">{{ showName(item) }}</text>
                于 {{ formatFullTime(item.operationTime) }}
                <text class="lc-tip-action"> {{ item.type === 2 ? '下载' : '浏览' }}</text>
                了 <text class="lc-tip-product"> {{ item.prodName || '相关产品' }}</text>，可能与您销售的产品类似，请及时关注跟进。
              </text>
            </view>

            <!-- 用户信息 -->
            <view class="lc-user-row">
              <view class="lc-user-info">
                <image class="lc-user-avatar" :src="item.userLogo && !item._logoErr ? getProductImageUrlChat(item.userLogo) : (item.sex == 2 ? 'https://img2cdn.global-dsc.cn/dgzz_img/6842d00b7f7db24082ed4f59f2bba02a.png' : 'https://img2cdn.global-dsc.cn/dgzz_img/8520f53eeff21f5a388f30b67e54e287.png')" mode="aspectFill" @error="item._logoErr = true" />
                <view class="lc-user-text">
                  <text class="lc-user-name">{{ showName(item) }}</text>
                  <text class="lc-user-company" v-if="item.compName">{{ item.compName }}</text>
                  <view class="lc-meta" v-if="item._distance || item.CProvince">
                    <text class="lc-meta-loc" v-if="item.CProvince">📍{{ [item.CProvince, item.CCity, item.CDistrict].filter(Boolean).join(' ') }}</text>
                    <text class="lc-meta-dist" v-if="item._distance">⛹ 距您 {{ item._distance }}</text>
                  </view>
                </view>
              </view>
            </view>

            <!-- 底部操作：删除 + 查看详情 -->
            <view class="lc-actions">
              <view class="lc-action-btn lc-btn-delete" @tap="onDeleteLead(item, index)">
                <text class="lc-action-icon">🚫</text>
                <text class="lc-action-label">删除</text>
              </view>
              <view class="lc-action-btn lc-btn-detail" @tap="onViewDetail(item)">
                <text class="lc-action-icon">🔍</text>
                <text class="lc-action-label">查看详情</text>
              </view>
            </view>
          </view>

          <view class="footer-tip">
            <text v-if="historyLoadingMore">· 加载中... ·</text>
            <text v-else-if="historyHasMore" @tap="onLoadMoreHistory">· 点击加载更多 ·</text>
            <text v-else>· 没有更多历史线索了 ·</text>
          </view>
        </view>

        <!-- 空状态 -->
        <empty-state
          v-else
          title="暂无历史线索"
          hint="在获取线索中保存的线索会显示在这里"
        />
      </template>
    </scroll-view>

    <!-- ========== 线索详情弹窗 ========== -->
    <view v-if="detailVisible" class="detail-mask" @tap="detailVisible = false">
      <view class="detail-popup" @tap.stop>
        <view class="detail-header">
          <text class="detail-title">线索详情</text>
          <text class="detail-close" @tap="detailVisible = false">✕</text>
        </view>
        <scroll-view class="detail-body" scroll-y v-if="detailData">
          <view class="detail-row">
            <text class="detail-label">用户姓名</text>
            <text class="detail-value">{{ showName(detailData) }}</text>
          </view>
          <view class="detail-row" v-if="detailData.compName">
            <text class="detail-label">所属公司</text>
            <text class="detail-value">{{ detailData.compName }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">行为类型</text>
            <text class="detail-value">{{ detailData.type === 2 ? '下载' : '浏览' }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">发生时间</text>
            <text class="detail-value">{{ formatFullTime(detailData.operationTime) }}</text>
          </view>
          <view class="detail-row" v-if="detailData.prodName">
            <text class="detail-label">产品名称</text>
            <text class="detail-value">{{ detailData.prodName }}</text>
          </view>
          <view class="detail-row" v-if="detailData._distance">
            <text class="detail-label">距离</text>
            <text class="detail-value">{{ detailData._distance }}</text>
          </view>
          <view class="detail-row" v-if="detailData.CProvince">
            <text class="detail-label">所在地区</text>
            <text class="detail-value">{{ [detailData.CProvince, detailData.CCity, detailData.CDistrict].filter(Boolean).join(' ') }}</text>
          </view>
          <view class="detail-row" v-if="detailData.browseCount != null">
            <text class="detail-label">浏览总数</text>
            <text class="detail-value">{{ detailData.browseCount }}</text>
          </view>
          <view class="detail-row" v-if="detailData.downloadCount != null">
            <text class="detail-label">下载总数</text>
            <text class="detail-value">{{ detailData.downloadCount }}</text>
          </view>
        </scroll-view>
        <view class="detail-footer">
          <view class="detail-btn detail-btn-contact" @tap="onFollowLead(detailData); detailVisible = false">
            <text>📞 跟进</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import EmptyState from '@/common/components/empty-state.vue'
import { searchUsersByAdvert, clueViewList, saveClueView, deleteClueView } from '@/static/api/index.js'
import { getProductImageUrlChat } from '@/common/utils/index.js'
import { showName } from '@/common/utils/index.js'

export default {
  components: {
    EmptyState
  },
  data() {
    return {
      // 自定义 toast 状态
      toastVisible: false, // 是否显示
      toastTitle: '', // 提示文字
      toastIcon: '', // 图标类型：success/error/none
      toastTimer: null, // 自动关闭定时器
      // 自定义确认弹窗状态
      confirmVisible: false, // 是否显示
      confirmTitle: '', // 标题
      confirmContent: '', // 内容
      confirmType: 'ignore', // 类型：ignore/delete
      confirmCallback: null, // 确认回调
      activeTab: 'fetch', // 当前激活的 Tab：fetch=获取线索，history=历史线索
      list: [], // 获取线索列表数据
      savedList: [], // 历史线索（已保存）列表数据
      searching: false, // 是否正在搜索
      hasSearched: false, // 是否已执行过搜索
      refreshing: false, // 下拉刷新状态
      page: 1, // 当前页码
      pageSize: 20, // 每页条数，默认20
      hasMore: true, // 是否还有更多数据
      loadingMore: false, // 是否正在加载更多
      historyPage: 1, // 历史线索当前页码
      historyPageSize: 20, // 历史线索每页条数
      historyHasMore: true, // 历史线索是否还有更多
      historyLoadingMore: false, // 历史线索是否正在加载更多
      detailVisible: false, // 详情弹窗是否显示
      detailData: null, // 详情弹窗数据
      animStats: { total: 0, download: 0, browse: 0 }, // 顶部统计数字（动画补间显示用）
      _tweenTimers: {}, // 内部计时器存储
      defaultAvatar: 'https://img2cdn.global-dsc.cn/dgzz_img/8520f53eeff21f5a388f30b67e54e287.png'
    }
  },
  computed: {
    // ----------- 下载行为数量
    downloadCount() {
      return this.list.filter(item => item.type === 2).length
    },
    // ----------- 浏览行为数量
    browseCount() {
      return this.list.filter(item => item.type === 1).length
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

    // ----------- 显示自定义 toast（替代 uni.showToast）
    showToast({ title, icon = 'none', duration = 2000 }) {
      if (this.toastTimer) clearTimeout(this.toastTimer)
      this.toastTitle = title
      this.toastIcon = icon
      this.toastVisible = true
      this.toastTimer = setTimeout(() => {
        this.toastVisible = false
      }, duration)
    },

    // ----------- 切换 Tab
    switchTab(tab) {
      if (this.activeTab === tab) return
      this.activeTab = tab
    },

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
      // 获取历史线索
      this.fetchHistoryLeads()
    },

    // ----------- 获取历史线索列表（分页）
    async fetchHistoryLeads() {
      this.historyPage = 1
      this.historyHasMore = true
      try {
        const myLat = uni.getStorageSync('myLatitude')
        const myLng = uni.getStorageSync('myLongitude')
        const res = await clueViewList({ page: this.historyPage, pageSize: this.historyPageSize })
        const items = res?.data?.list || []
        this.historyHasMore = items.length >= this.historyPageSize
        items.forEach(item => {
          item._distance = this.calcDistance(myLat, myLng, item.mapLat, item.mapLng)
        })
        this.savedList = items
      } catch (e) {
        // 接口异常静默处理
      }
    },

    // ----------- 点击接收线索按钮，搜索近三天本地下载浏览信息
    async onReceiveLeads() {
      if (this.searching) return
      this.searching = true
      // 同时获取历史线索
      this.fetchHistoryLeads()
      try {
        // 获取用户当前经纬度
        const myLat = uni.getStorageSync('myLatitude')
        const myLng = uni.getStorageSync('myLongitude')
        this.page = 1
        this.hasMore = true
        const res = await searchUsersByAdvert({
          days: 3,
          page: this.page,
          pageSize: this.pageSize,
          lat: myLat,
          lng: myLng
        })
        const items = res?.data?.list || []
        // 判断是否还有更多
        this.hasMore = items.length >= this.pageSize
        // 计算每条线索与用户的距离
        items.forEach(item => {
          item._distance = this.calcDistance(myLat, myLng, item.mapLat, item.mapLng)
        })
        this.list = items
        this.hasSearched = true
        if (items.length) {
          this.showToast({ title: `找到${items.length}条匹配线索`, icon: 'success' })
        } else {
          this.showToast({ title: '近三天暂无匹配线索', icon: 'none' })
        }
      } catch (e) {
        this.showToast({ title: e, icon: 'none' })
      } finally {
        this.searching = false
      }
    },

    // ----------- 触底加载更多（根据当前 tab 区分）
    async onLoadMore() {
      if (this.activeTab === 'history') {
        this.onLoadMoreHistory()
      } else {
        this.onLoadMoreLeads()
      }
    },

    // ----------- 触底加载更多本地线索
    async onLoadMoreLeads() {
      if (this.loadingMore || !this.hasMore || !this.hasSearched) return
      this.loadingMore = true
      try {
        const myLat = uni.getStorageSync('myLatitude')
        const myLng = uni.getStorageSync('myLongitude')
        this.page++
        const res = await searchUsersByAdvert({
          days: 3,
          page: this.page,
          pageSize: this.pageSize,
          lat: myLat,
          lng: myLng
        })
        const items = res?.data?.list || []
        this.hasMore = items.length >= this.pageSize
        items.forEach(item => {
          item._distance = this.calcDistance(myLat, myLng, item.mapLat, item.mapLng)
        })
        this.list = this.list.concat(items)
      } catch (e) {
        this.page--
        this.showToast({ title: '加载失败，请重试', icon: 'none' })
      } finally {
        this.loadingMore = false
      }
    },

    // ----------- 触底加载更多历史线索
    async onLoadMoreHistory() {
      if (this.historyLoadingMore || !this.historyHasMore || !this.savedList.length) return
      this.historyLoadingMore = true
      try {
        const myLat = uni.getStorageSync('myLatitude')
        const myLng = uni.getStorageSync('myLongitude')
        this.historyPage++
        const res = await clueViewList({ page: this.historyPage, pageSize: this.historyPageSize })
        const items = res?.data?.list || []
        this.historyHasMore = items.length >= this.historyPageSize
        items.forEach(item => {
          item._distance = this.calcDistance(myLat, myLng, item.mapLat, item.mapLng)
        })
        this.savedList = this.savedList.concat(items)
      } catch (e) {
        this.historyPage--
        this.showToast({ title: '加载失败，请重试', icon: 'none' })
      } finally {
        this.historyLoadingMore = false
      }
    },

    // ----------- 计算两点经纬度距离（Haversine 公式），返回格式化字符串
    calcDistance(lat1, lng1, lat2, lng2) {
      if (!lat1 || !lng1 || !lat2 || !lng2) return ''
      const R = 6371 // 地球半径 km
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLng = (lng2 - lng1) * Math.PI / 180
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2)
      const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      if (d < 1) return Math.round(d * 1000) + 'm'
      return d.toFixed(1) + 'km'
    },

    // ----------- 跟进线索
    onFollowLead(item) {
      if (!item || !item.userId) {
        this.showToast({ title: '暂无用户信息', icon: 'none' })
        return
      }
      uni.navigateTo({
        url: `/pages-sub/explore/staff-detail/index?staffInfo=${encodeURIComponent(JSON.stringify({
          ...item,
          nickName: this.showName(item)
        }))}`
      })
    },

    // ----------- 显示自定义确认弹窗（替代 uni.showModal）
    showConfirm({ title, content, type = 'ignore', callback }) {
      this.confirmTitle = title
      this.confirmContent = content
      this.confirmType = type
      this.confirmCallback = callback
      this.confirmVisible = true
    },
    // ----------- 确认弹窗 - 取消
    cancelConfirm() {
      this.confirmVisible = false
      this.confirmCallback = null
    },
    // ----------- 确认弹窗 - 确定
    okConfirm() {
      this.confirmVisible = false
      if (this.confirmCallback) this.confirmCallback()
      this.confirmCallback = null
    },

    // ----------- 忽略线索（从列表移除）
    onIgnoreLead(item) {
      this.showConfirm({
        title: '确认忽略',
        content: '忽略后该线索将从列表中移除，确定要忽略吗？',
        type: 'ignore',
        callback: () => {
          this.list = this.list.filter(i => (i.clueId || i.userId) !== (item.clueId || item.userId))
          this.showToast({ title: '已忽略', icon: 'none' })
        }
      })
    },

    // ----------- 保存线索（调用接口，不从列表移除）
    async onSaveLead(item) {
      if (!item.clueId) {
        this.showToast({ title: '缺少线索ID', icon: 'none' })
        return
      }
      try {
        await saveClueView({ clueId: item.clueId })
        this.showToast({ title: '已保存到历史线索', icon: 'success' })
      } catch (e) {
        this.showToast({ title: '保存失败，请重试', icon: 'none' })
      }
    },

    // ----------- 查看线索详情
    onViewDetail(item) {
      if (!item || !item.userId) {
        this.showToast({ title: '暂无用户信息', icon: 'none' })
        return
      }
      uni.navigateTo({
        url: `/pages-sub/explore/staff-detail/index?staffInfo=${encodeURIComponent(JSON.stringify({
          ...item,
          nickName: this.showName(item)
        }))}`
      })
    },

    // ----------- 删除历史线索
    async onDeleteLead(item, index) {
      this.showConfirm({
        title: '确认删除',
        content: '删除后不可恢复，确定要删除该线索吗？',
        type: 'delete',
        callback: async () => {
          if (!item.clueId) {
            this.showToast({ title: '缺少线索ID', icon: 'none' })
            return
          }
          try {
            await deleteClueView({ clueId: item.clueId })
            this.savedList.splice(index, 1)
            this.showToast({ title: '已删除', icon: 'success' })
          } catch (e) {
          }
        }
      })
    },

    // ----------- 格式化完整时间（xxxx年x月x日xx点xx分）
    formatFullTime(ts) {
      if (!ts) return '暂无时间'
      // 兼容字符串时间格式（如 2026-07-17 11:18:42）
      const d = new Date(typeof ts === 'string' ? ts.replace(/-/g, '/') : ts)
      const Y = d.getFullYear()
      const M = String(d.getMonth() + 1).padStart(2, '0')
      const D = String(d.getDate()).padStart(2, '0')
      const h = String(d.getHours()).padStart(2, '0')
      const m = String(d.getMinutes()).padStart(2, '0')
      return `${Y}年${M}月${D}日${h}点${m}分`
    },

    // ----------- 格式化简短时间
    formatTime(ts) {
      if (!ts) return '暂无时间'
      const d = new Date(typeof ts === 'string' ? ts.replace(/-/g, '/') : ts)
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
    },

    showName
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

// 顶部区域（取消整体渐变背景框，让内容直接铺在页面上）
.top-section {
  position: relative;
  z-index: 2;
}

.page-scroll {
  position: relative;
  z-index: 2;
  height: calc(100vh - 420rpx);
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
  background: #c8d6ff;
}

.blob-purple {
  top: -60rpx;
  right: -120rpx;
  width: 360rpx;
  height: 360rpx;
  background: #e6d8ff;
}

// ==================== 顶部主视觉
.hero {
  padding: 36rpx 32rpx;
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
  font-size: 40rpx;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
  letter-spacing: 0.5rpx;
}

.hero-title-gradient {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%);
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
  margin-right: 40rpx;
}

// Hero Orb - 深蓝金色系
.hero-orb {
  position: relative;
  flex-shrink: 0;
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #818cf8, #c084fc);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 14rpx 30rpx rgba(129, 140, 248, 0.4), 0 4rpx 10rpx rgba(192, 132, 252, 0.25);
}

.orb-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2rpx solid rgba(139, 92, 246, 0.5);
  pointer-events: none;
}

.hero-orb-inner {
  width: 86rpx;
  height: 86rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #a855f7);
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
  border: 1rpx solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 8rpx 22rpx rgba(99, 102, 241, 0.07);
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
  padding: 32rpx;
}

.receive-card {
  position: relative;
  overflow: hidden;
  padding: 56rpx 40rpx 48rpx;
  border-radius: 32rpx;
  background: linear-gradient(160deg, #f8f8f8 0%, #f3f6ff 50%, #efeaf6 100%);
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
  line-height: 44rpx;
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
  background: linear-gradient(135deg, #6366f1, #a855f7);
  box-shadow: 0 12rpx 28rpx rgba(99, 102, 241, 0.3);
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
  margin: 10rpx 32rpx 20rpx;
}

.lh-bar {
  width: 8rpx;
  height: 28rpx;
  border-radius: 6rpx;
  margin-right: 14rpx;
  background: linear-gradient(180deg, #6366f1, #a855f7);
}

.lh-title {
  flex: 1;
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
}


.lh-badge {
  min-width: 36rpx;
  height: 36rpx;
  padding: 0 10rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 700;
  color: #fff;
  line-height: 1;
  box-shadow: 0 4rpx 10rpx rgba(99, 102, 241, 0.3);
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
  background: radial-gradient(circle, rgba(168, 85, 247, 0.18) 0%, rgba(99, 102, 241, 0.08) 40%, transparent 70%);
}

.lc-halo-cyan {
  background: radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.06) 40%, transparent 70%);
}

// 提示文案
.lc-tip {
  position: relative;
  margin-bottom: 18rpx;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #f5f3ff, #eef2ff);
}

.lc-tip-text {
  font-size: 26rpx;
  line-height: 1.6;
  color: #475569;
}

.lc-tip-user {
  font-weight: 700;
  color: #4f46e5;
}

.lc-tip-action {
  font-weight: 700;
  color: #6366f1;
}

.lc-tip-product {
  font-weight: 700;
  color: #0f172a;
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
  background: linear-gradient(135deg, #eef2ff, #ede9fe);
  border: 1rpx solid rgba(99, 102, 241, 0.12);

  .chip-ico {
    font-size: 20rpx;
  }

  .chip-text {
    font-size: 23rpx;
    font-weight: 600;
    color: #6366f1;
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
  font-size: 24rpx;
  color: #64686d;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 6rpx;
}

.lc-meta {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-top: 8rpx;
}

.lc-meta-loc {
  flex-shrink: 0;
  padding: 2rpx 14rpx;
  border-radius: 999rpx;
  background: #f0f5ff;
  font-size: 22rpx;
  color: #4f7cf7;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300rpx;
}

.lc-meta-dist {
  flex-shrink: 0;
  padding: 2rpx 14rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #eef2ff, #f3e8ff);
  font-size: 22rpx;
  color: #6366f1;
}

// 匹配等级
.lc-match-level {
  font-size: 24rpx;
  font-weight: 600;
}

.level-high {
  color: #a855f7;
}

.level-normal {
  color: #64748b;
}

// 底部操作按钮组
.lc-actions {
  display: flex;
  gap: 12rpx;
  padding-top: 20rpx;
  border-top: 1rpx dashed #eef0f6;
}

.lc-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx 0;
  border-radius: 14rpx;
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.95);
  }
}

// 历史线索按钮样式（不占用等宽，右对齐固定宽度）
.saved-card .lc-actions {
  justify-content: flex-end;
  gap: 20rpx;
}

.saved-card .lc-action-btn {
  flex: none;
  width: 180rpx;
}

.lc-action-icon {
  font-size: 26rpx;
  line-height: 1;
}

.lc-action-label {
  font-size: 24rpx;
  font-weight: 600;
}

// 跟进/查看详情按钮
.lc-btn-follow,
.lc-btn-detail {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  box-shadow: 0 6rpx 16rpx rgba(99, 102, 241, 0.3);

  .lc-action-icon,
  .lc-action-label {
    color: #fff;
  }
}

// 忽略按钮
.lc-btn-ignore {
  background: #f1f5f9;

  .lc-action-icon {
    color: #94a3b8;
  }

  .lc-action-label {
    color: #64748b;
  }
}

// 保存按钮
.lc-btn-save {
  background: #fff4c8;

  .lc-action-icon {
    color: #f59e0b;
  }

  .lc-action-label {
    color: #d97706;
  }
}

// 删除按钮（使用忽略按钮配色）
.lc-btn-delete {
  background: #f1f5f9;

  .lc-action-icon {
    color: #94a3b8;
  }

  .lc-action-label {
    color: #64748b;
  }
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
  padding: 28rpx 0 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  font-size: 26rpx;
  color: #8593a5;
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
  animation: fadeUp 0.8s 0.1s ease-out both;
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
    box-shadow: 0 14rpx 30rpx rgba(129, 140, 248, 0.4), 0 4rpx 10rpx rgba(192, 132, 252, 0.25);
  }
  50% {
    transform: scale(1.06);
    box-shadow: 0 18rpx 40rpx rgba(129, 140, 248, 0.55), 0 6rpx 16rpx rgba(192, 132, 252, 0.4);
  }
}

.hero-orb {
  animation: popIn 0.8s 0.3s ease-out both, orbBreath 3s ease-in-out infinite 1.2s;
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
  animation: fadeUp 0.75s ease-out both;
}

.stat-tile:nth-child(1) { animation-delay: 0.35s; }
.stat-tile:nth-child(2) { animation-delay: 0.5s; }
.stat-tile:nth-child(3) { animation-delay: 0.65s; }

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
  animation: fadeUp 0.4s 0.1s ease-out both;
}

// 线索卡片错峰淡入
.lead-card {
  animation: fadeUp 0.7s ease-out both;
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
  animation: fadeUp 0.8s 0.4s ease-out both;
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

// 按钮箭头微移
@keyframes arrowSlide {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(4rpx); }
}

.lc-btn-arrow {
  animation: arrowSlide 1.6s ease-in-out infinite;
}

// ==================== Tab 切换栏（分段式）
.tab-bar {
  position: relative;
  display: flex;
  width: 380rpx;
  margin: 20rpx auto;
  padding: 6rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20rpx);
  box-shadow: 0 4rpx 16rpx rgba(99, 102, 241, 0.08);
}

// 滑块动效
.tab-slider {
  position: absolute;
  top: 6rpx;
  left: 6rpx;
  width: calc(50% - 6rpx);
  height: calc(100% - 12rpx);
  border-radius: 999rpx;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  box-shadow: 0 6rpx 18rpx rgba(99, 102, 241, 0.3);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.tab-slider.slider-right {
  transform: translateX(100%);
}

.tab-item {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  padding: 16rpx 0;
  border-radius: 999rpx;
  transition: color 0.25s ease;
}

.tab-icon {
  font-size: 26rpx;
  line-height: 1;
  transition: transform 0.25s ease;
}

.tab-item.active .tab-icon {
  transform: scale(1.15);
}

.tab-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #64748b;
  transition: color 0.25s ease;
}

.tab-item.active .tab-text {
  color: #fff;
}

// ==================== 详情弹窗
.detail-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease-out;
}

.detail-popup {
  width: 620rpx;
  max-height: 80vh;
  border-radius: 28rpx;
  background: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: popIn 0.25s ease-out;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 36rpx 24rpx;
  border-bottom: 1rpx solid #f1f5f9;
}

.detail-title {
  font-size: 34rpx;
  font-weight: 800;
  color: #0f172a;
}

.detail-close {
  font-size: 36rpx;
  color: #94a3b8;
  padding: 8rpx;
  line-height: 1;
}

.detail-body {
  padding: 24rpx 36rpx;
  max-height: 60vh;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f8fafc;
}

.detail-label {
  flex-shrink: 0;
  width: 160rpx;
  font-size: 26rpx;
  color: #94a3b8;
}

.detail-value {
  flex: 1;
  font-size: 26rpx;
  font-weight: 600;
  color: #0f172a;
}

.detail-section {
  padding: 20rpx 0;
}

.detail-section-title {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
  color: #475569;
  margin-bottom: 16rpx;
}

.detail-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.detail-keyword {
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #eef2ff, #ede9fe);
  font-size: 24rpx;
  font-weight: 600;
  color: #6366f1;
}

.detail-footer {
  padding: 24rpx 36rpx 32rpx;
  border-top: 1rpx solid #f1f5f9;
}

.detail-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  padding: 24rpx 0;
  border-radius: 999rpx;
  font-size: 30rpx;
  font-weight: 700;
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.97);
  }
}

.detail-btn-contact {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  box-shadow: 0 10rpx 24rpx rgba(99, 102, 241, 0.3);
  color: #fff;
}

// ==================== 自定义 toast
.custom-toast-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  pointer-events: none;
}

.custom-toast {
  min-width: 260rpx;
  max-width: 560rpx;
  padding: 28rpx 40rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 20rpx 60rpx rgba(15, 23, 42, 0.28);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  animation: popIn 0.2s ease-out;
  backdrop-filter: blur(8rpx);
}

.custom-toast-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38rpx;
  color: #fff;
}

.custom-toast-success .custom-toast-icon {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.custom-toast-error .custom-toast-icon {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.custom-toast-none .custom-toast-icon {
  background: linear-gradient(135deg, #6366f1, #a855f7);
}

.custom-toast-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
  line-height: 1.4;
}

// ==================== 自定义确认弹窗
.confirm-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease-out;
}

.confirm-popup {
  width: 560rpx;
  padding: 48rpx 40rpx 36rpx;
  border-radius: 28rpx;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: popIn 0.25s ease-out;
}

.confirm-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  margin-bottom: 24rpx;
}

.confirm-icon-ignore {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
}

.confirm-icon-delete {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
}

.confirm-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 12rpx;
}

.confirm-content {
  font-size: 26rpx;
  color: #64748b;
  line-height: 1.5;
  text-align: center;
  margin-bottom: 36rpx;
}

.confirm-btns {
  display: flex;
  gap: 20rpx;
  width: 100%;
}

.confirm-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.96);
  }
}

.confirm-btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.confirm-btn-ok {
  color: #fff;
}

.confirm-btn-ignore {
  background: linear-gradient(135deg, #6366f1, #a855f7);
}

.confirm-btn-delete {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}
</style>
