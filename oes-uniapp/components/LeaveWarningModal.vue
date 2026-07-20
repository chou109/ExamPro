<template>
  <view v-if="visible" class="leave-modal" @click="handleClose">
    <view class="modal-content" @click.stop>
      <view class="modal-header">
        <text class="modal-title">{{ title }}</text>
      </view>
      <view class="modal-body">
        <text class="modal-text">{{ leaveText }}</text>
        <text class="leave-count" :class="{ danger: isDanger }">{{ leaveCount }}</text>
        <text class="modal-text">{{ chancesText }}</text>
      </view>
      <view class="modal-footer">
        <button class="modal-btn" @click="handleConfirm">{{ confirmText }}</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '警告'
  },
  leaveText: {
    type: String,
    default: '检测到离开考试，已离开'
  },
  leaveCount: {
    type: Number,
    default: 0
  },
  chancesText: {
    type: String,
    default: '次，剩余机会有限'
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  maxLeaveCount: {
    type: Number,
    default: 3
  },
  isDanger: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'confirm'])

const handleClose = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<style lang="scss" scoped>
.leave-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.modal-header {
  padding: 40rpx;
  text-align: center;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #dc2626;
}

.modal-body {
  padding: 40rpx;
  text-align: center;
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
}

.modal-text {
  color: #666;
}

.leave-count {
  font-size: 48rpx;
  font-weight: bold;
  color: #dc2626;
  margin: 0 8rpx;
}

.leave-count.danger {
  color: #dc2626;
  font-size: 56rpx;
}

.modal-footer {
  padding: 20rpx 40rpx 40rpx;
}

.modal-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #dc2626, #ef4444);
  color: #fff;
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
}
</style>