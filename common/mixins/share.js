export default {
	// ----------- 转发给好友
	onShareAppMessage() {
		return {
			title: '探客工兵',
			path: '/pages/common/start/index'
		}
	},
	// ----------- 分享到朋友圈
	onShareTimeline() {
		return {
			title: '探客工兵'
		}
	}
}
