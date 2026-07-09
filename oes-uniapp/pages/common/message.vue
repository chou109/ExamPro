<template>
  <view class="message-page">
    <view class="page-header">
      <text class="title">消息</text>
    </view>

    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'class' }" 
        @click="activeTab = 'class'"
      >
        <text class="tab-text">班级消息</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'system' }" 
        @click="activeTab = 'system'"
      >
        <text class="tab-text">系统通知</text>
      </view>
    </view>

    <scroll-view class="content" scroll-y>
      <template v-if="activeTab === 'class'">
        <view class="class-list" v-if="myClasses.length > 0">
          <view 
            class="class-item" 
            v-for="item in myClasses" 
            :key="item.class.id" 
            @click="goToClass(item.class)"
          >
            <view class="class-icon">
              <text class="icon-emoji">🏫</text>
            </view>
            <view class="class-info">
              <view class="class-header">
                <text class="class-name">{{ item.class.className }}</text>
                <text class="class-time">{{ formatTime(item.class.lastMessageTime) }}</text>
              </view>
              <text class="last-message">{{ getLastMessage(item.class) }}</text>
            </view>
            <view class="class-arrow">
              <text class="arrow-icon">›</text>
            </view>
          </view>
        </view>
        <view class="empty" v-else>
          <text class="empty-emoji">📭</text>
          <text class="empty-text">暂无班级消息</text>
        </view>
      </template>

      <template v-if="activeTab === 'system'">
        <view class="system-list" v-if="systemMessages.length > 0">
          <view class="system-item" v-for="msg in systemMessages" :key="msg.id">
            <view class="system-icon">
              <text class="icon-emoji">{{ msg.type === 'EXAM' ? '📝' : '📢' }}</text>
            </view>
            <view class="system-info">
              <text class="system-title">{{ msg.title }}</text>
              <text class="system-content">{{ msg.content }}</text>
              <text class="system-time">{{ formatTime(msg.createTime) }}</text>
            </view>
          </view>
        </view>
        <view class="empty" v-else>
          <text class="empty-emoji">🔔</text>
          <text class="empty-text">暂无系统通知</text>
        </view>
      </template>
    </scroll-view>
  </view>
</template>

<script>
import { ref, onMounted } from 'vue'
import { classApi } from '../../utils/api'

export default {
  setup() {
    const userInfo = ref(uni.getStorageSync('userInfo') || {})
    const activeTab = ref('class')
    const myClasses = ref([])
    const systemMessages = ref([])

    const goToClass = (cls) => {
      const url = userInfo.value.role === 'STUDENT' 
        ? `/pages/student/class-chat?id=${cls.id}` 
        : `/pages/teacher/class-chat?id=${cls.id}`
      uni.navigateTo({ url })
    }

    const getLastMessage = (cls) => {
      if (!cls.lastMessage) return '暂无消息'
      if (cls.lastMessage.startsWith('EXAM_NOTICE|')) {
        return parseExamNotice(cls.lastMessage)
      }
      return cls.lastMessage
    }

    const parseExamNotice = (content) => {
      if (!content?.startsWith('EXAM_NOTICE|')) return ''
      const parts = content.split('|')
      const noticeType = parts[1] || ''
      const title = parts[2] || ''
      if (noticeType === 'START') {
        return '🚀 ' + title + ' 开始考试'
      } else if (noticeType === 'PUBLISH') {
        return '📢 ' + title + ' 发布通知'
      } else if (noticeType === 'END') {
        return '🔚 ' + title + ' 考试结束'
      }
      return '📝 ' + title
    }

    const formatTime = (time) => {
      if (!time) return ''
      const date = new Date(time)
      const now = new Date()
      const diff = now - date
      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
      return date.toLocaleDateString('zh-CN')
    }

    const loadMyClasses = async () => {
      try {
        const userId = userInfo.value.id || userInfo.value.userId
        if (!userId) return
        const res = await classApi.getMyClasses(userId)
        if (res.code === 200) {
          myClasses.value = (res.data || []).map(cls => ({
            ...cls,
            memberCount: cls.memberCount || 0,
            lastMessage: cls.lastMessage || '',
            lastMessageTime: cls.lastMessageTime || ''
          }))
        }
      } catch (e) {
        console.error('加载班级失败:', e)
      }
    }

    const loadSystemMessages = async () => {
      systemMessages.value = []
    }

    onMounted(async () => {
      await loadMyClasses()
      await loadSystemMessages()
    })

    return {
      userInfo,
      activeTab,
      myClasses,
      systemMessages,
      goToClass,
      getLastMessage,
      formatTime
    }
  }
}
</script>

<style lang="scss">
.message-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.page-header {
  padding: 24rpx 32rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;

  .title {
    font-size: 36rpx;
    font-weight: 700;
    color: #0f172a;
  }
}

.tabs {
  display: flex;
  background: #fff;
  padding: 0 32rpx;
  border-bottom: 1rpx solid #eee;

  .tab-item {
    flex: 1;
    padding: 24rpx 0;
    text-align: center;
    position: relative;

    &.active {
      .tab-text {
        color: #dc2626;
        font-weight: 600;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 48rpx;
        height: 6rpx;
        background: #dc2626;
        border-radius: 3rpx;
      }
    }

    .tab-text {
      font-size: 30rpx;
      color: #666;
    }
  }
}

.content {
  height: calc(100vh - 180rpx);
}

.class-list {
  padding: 24rpx;
}

.class-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);

  .class-icon {
    width: 80rpx;
    height: 80rpx;
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;

    .icon-emoji {
      font-size: 36rpx;
    }
  }

  .class-info {
    flex: 1;

    .class-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8rpx;

      .class-name {
        font-size: 30rpx;
        font-weight: 600;
        color: #333;
      }

      .class-time {
        font-size: 24rpx;
        color: #999;
      }
    }

    .last-message {
      font-size: 26rpx;
      color: #666;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
    }
  }

  .class-arrow {
    margin-left: 16rpx;

    .arrow-icon {
      font-size: 40rpx;
      color: #999;
    }
  }
}

.system-list {
  padding: 24rpx;
}

.system-item {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);

  .system-icon {
    width: 64rpx;
    height: 64rpx;
    background: #fef3c7;
    border-radius: 14rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
    flex-shrink: 0;

    .icon-emoji {
      font-size: 28rpx;
    }
  }

  .system-info {
    flex: 1;

    .system-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #333;
      display: block;
      margin-bottom: 8rpx;
    }

    .system-content {
      font-size: 26rpx;
      color: #666;
      display: block;
      margin-bottom: 8rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .system-time {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;

  .empty-emoji {
    font-size: 80rpx;
    margin-bottom: 24rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>