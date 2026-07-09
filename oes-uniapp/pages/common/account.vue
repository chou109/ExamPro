<template>
  <view class="account-page">
    <!-- 用户信息头部 -->
    <view class="user-header">
      <view class="avatar-box" @click="showAvatarMenu">
        <image class="avatar" :src="getAvatarUrl(userInfo.avatar)" mode="aspectFill" />
        <view class="avatar-edit-icon">
          <text class="edit-icon">✎</text>
        </view>
      </view>
      <view class="user-info">
        <text class="username">{{ userInfo.realName || userInfo.username || '用户' }}</text>
        <text class="role">{{ roleText }}</text>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="menu-list">
      <!-- 基本信息 -->
      <view class="menu-group">
        <view class="menu-item" @click="showEditInfo">
          <view class="menu-icon">
            <text class="emoji-icon">👤</text>
          </view>
          <text class="menu-text">基本资料</text>
          <view class="menu-arrow">
            <text class="arrow-icon">›</text>
          </view>
        </view>

        <view class="menu-item" @click="showChangePassword">
          <view class="menu-icon">
            <text class="emoji-icon">🔒</text>
          </view>
          <text class="menu-text">修改密码</text>
          <view class="menu-arrow">
            <text class="arrow-icon">›</text>
          </view>
        </view>
      </view>

      <!-- 学习功能（仅学生） -->
      <view class="menu-group" v-if="userInfo.role === 'STUDENT'">
        <view class="menu-item" @click="goTo('/pages/student/statistics')">
          <view class="menu-icon">
            <text class="emoji-icon">📊</text>
          </view>
          <text class="menu-text">成绩分析</text>
          <view class="menu-arrow">
            <text class="arrow-icon">›</text>
          </view>
        </view>

        <view class="menu-item" @click="goTo('/pages/student/wrong-questions')">
          <view class="menu-icon">
            <text class="emoji-icon">❌</text>
          </view>
          <text class="menu-text">错题本</text>
          <view class="menu-arrow">
            <text class="arrow-icon">›</text>
          </view>
        </view>
      </view>

      <!-- 教师功能（仅教师） -->
      <view class="menu-group" v-if="userInfo.role === 'TEACHER'">
        <view class="menu-item" @click="goTo('/pages/teacher/exam-record-manage')">
          <view class="menu-icon">
            <text class="emoji-icon">📝</text>
          </view>
          <text class="menu-text">考试记录</text>
          <view class="menu-arrow">
            <text class="arrow-icon">›</text>
          </view>
        </view>
      </view>

      <!-- 其他功能 -->
      <view class="menu-group">
        <view class="menu-item" @click="showAbout">
          <view class="menu-icon">
            <text class="emoji-icon">ℹ️</text>
          </view>
          <text class="menu-text">关于系统</text>
          <view class="menu-arrow">
            <text class="arrow-icon">›</text>
          </view>
        </view>

        <view class="menu-item" @click="clearCache">
          <view class="menu-icon">
            <text class="emoji-icon">🗑️</text>
          </view>
          <text class="menu-text">清除缓存</text>
          <view class="menu-arrow">
            <text class="arrow-icon">›</text>
          </view>
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="logout-btn" @click="handleLogout">
        <text class="logout-text">退出登录</text>
      </view>
    </view>

    <!-- 编辑信息弹窗 -->
    <view class="popup-mask" v-if="showEditPopup" @click="closeEditPopup"></view>
    <view class="popup-bottom" v-if="showEditPopup">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">编辑基本资料</text>
          <text class="popup-close" @click="closeEditPopup">关闭</text>
        </view>

        <view class="form-content">
          <view class="form-item">
            <text class="label">用户名</text>
            <input class="input" type="text" v-model="editForm.username" disabled />
          </view>

          <view class="form-item">
            <text class="label">真实姓名</text>
            <input class="input" type="text" v-model="editForm.realName" placeholder="请输入真实姓名" />
          </view>

          <view class="form-item">
            <text class="label">邮箱</text>
            <input class="input" type="text" v-model="editForm.email" placeholder="请输入邮箱" />
          </view>

          <view class="form-item">
            <text class="label">手机号</text>
            <input class="input" type="text" v-model="editForm.phone" placeholder="请输入手机号" />
          </view>

          <button class="save-btn" @click="saveEditInfo">保存修改</button>
        </view>
      </view>
    </view>

    <!-- 修改密码弹窗 -->
    <view class="popup-mask" v-if="showPasswordPopup" @click="closePasswordPopup"></view>
    <view class="popup-bottom" v-if="showPasswordPopup">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">修改密码</text>
          <text class="popup-close" @click="closePasswordPopup">关闭</text>
        </view>

        <view class="form-content">
          <view class="form-item">
            <text class="label">当前密码</text>
            <input class="input" type="password" v-model="passwordForm.oldPassword" placeholder="请输入当前密码" />
          </view>

          <view class="form-item">
            <text class="label">新密码</text>
            <input class="input" type="password" v-model="passwordForm.newPassword" placeholder="请输入新密码" />
          </view>

          <view class="form-item">
            <text class="label">确认新密码</text>
            <input class="input" type="password" v-model="passwordForm.confirmPassword" placeholder="请确认新密码" />
          </view>

          <button class="save-btn" @click="savePassword">保存修改</button>
        </view>
      </view>
    </view>

    <!-- 关于弹窗 -->
    <view class="popup-mask" v-if="showAboutPopup" @click="closeAboutPopup"></view>
    <view class="popup-center" v-if="showAboutPopup">
      <view class="about-content">
        <image class="about-logo" src="/static/logo.png" mode="aspectFit" />
        <text class="about-title">ExamPro</text>
        <text class="about-version">版本 1.0.0</text>
        <text class="about-desc">专业的在线考试系统，让学习更高效</text>
        <text class="about-copy">© 2024 ExamPro Team</text>
        <button class="about-close-btn" @click="closeAboutPopup">确定</button>
      </view>
    </view>

    <!-- 头像操作菜单 -->
    <view class="popup-mask" v-if="showAvatarMenuVisible" @click="closeAvatarMenu"></view>
    <view class="avatar-menu-popup" v-if="showAvatarMenuVisible">
      <view class="avatar-menu-content">
        <view class="avatar-menu-item" @click="handleViewAvatar">
          <text class="menu-item-icon">👁️</text>
          <text class="menu-item-text">查看头像</text>
        </view>
        <view class="avatar-menu-item" @click="handleChangeAvatar">
          <text class="menu-item-icon">📷</text>
          <text class="menu-item-text">更换头像</text>
        </view>
        <view class="avatar-menu-cancel" @click="closeAvatarMenu">
          <text class="menu-cancel-text">取消</text>
        </view>
      </view>
    </view>

    <!-- 查看头像弹窗 -->
    <view class="popup-mask" v-if="showViewAvatar" @click="closeViewAvatar"></view>
    <view class="view-avatar-popup" v-if="showViewAvatar">
      <image class="view-avatar-img" :src="getAvatarUrl(userInfo.avatar)" mode="aspectFit" @click.stop />
      <text class="view-avatar-close" @click="closeViewAvatar">✕</text>
    </view>
  </view>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { authApi, userApi } from '../../utils/api'
import { upload } from '../../utils/request'

export default {
  setup() {
    const userInfo = ref(uni.getStorageSync('userInfo') || {})

    const roleText = computed(() => {
      const map = { ADMIN: '管理员', TEACHER: '教师', STUDENT: '学生' }
      return map[userInfo.value.role] || '用户'
    })

    const getAvatarUrl = (avatar) => {
      if (!avatar) {
        const name = userInfo.value.realName || userInfo.value.username || '用户'
        const firstChar = name.charAt(0)
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(firstChar)}&background=dc2626&color=fff&size=100`
      }
      if (avatar.startsWith('http')) {
        return avatar
      }
      return 'http://192.168.34.49:8081' + avatar
    }

    const showEditPopup = ref(false)
    const showPasswordPopup = ref(false)
    const showAboutPopup = ref(false)
    const showAvatarMenuVisible = ref(false)
    const showViewAvatar = ref(false)

    const editForm = reactive({
      username: userInfo.value.username || '',
      realName: userInfo.value.realName || '',
      email: userInfo.value.email || '',
      phone: userInfo.value.phone || ''
    })

    const passwordForm = reactive({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const showEditInfo = () => {
      editForm.username = userInfo.value.username || ''
      editForm.realName = userInfo.value.realName || ''
      editForm.email = userInfo.value.email || ''
      editForm.phone = userInfo.value.phone || ''

      showEditPopup.value = true
    }

    const closeEditPopup = () => {
      showEditPopup.value = false
    }

    const showChangePassword = () => {
      showPasswordPopup.value = true
    }

    const closePasswordPopup = () => {
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      showPasswordPopup.value = false
    }

    const showAbout = () => {
      showAboutPopup.value = true
    }

    const closeAboutPopup = () => {
      showAboutPopup.value = false
    }

    const showAvatarMenu = () => {
      showAvatarMenuVisible.value = true
    }

    const closeAvatarMenu = () => {
      showAvatarMenuVisible.value = false
    }

    const handleViewAvatar = () => {
      closeAvatarMenu()
      showViewAvatar.value = true
    }

    const closeViewAvatar = () => {
      showViewAvatar.value = false
    }

    const handleChangeAvatar = () => {
      closeAvatarMenu()
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0]
          uploadAvatar(tempFilePath)
        },
        fail: () => {
          uni.showToast({ title: '选择图片失败', icon: 'none' })
        }
      })
    }

    const uploadAvatar = async (filePath) => {
      uni.showLoading({ title: '上传中...' })
      try {
        const result = await upload('/upload/avatar', filePath)
        
        if (result.code === 200) {
          const avatarUrl = result.data
          const userId = userInfo.value.userId || userInfo.value.id
          
          await userApi.update({
            id: userId,
            avatar: avatarUrl
          })

          userInfo.value.avatar = avatarUrl
          uni.setStorageSync('userInfo', userInfo.value)
          uni.showToast({ title: '上传成功', icon: 'success' })
        } else {
          uni.showToast({ title: result.message || '上传失败', icon: 'none' })
        }
      } catch (e) {
        console.error(e)
        uni.showToast({ title: '上传失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }

    const goTo = (url) => {
      uni.navigateTo({ url })
    }

    const saveEditInfo = async () => {
      if (!editForm.realName) {
        uni.showToast({ title: '请输入真实姓名', icon: 'none' })
        return
      }

      const userId = userInfo.value.userId || userInfo.value.id
      if (!userId) {
        uni.showToast({ title: '用户信息异常', icon: 'none' })
        return
      }

      try {
        const res = await userApi.update({
          id: userId,
          username: editForm.username,
          realName: editForm.realName,
          email: editForm.email,
          phone: editForm.phone
        })

        if (res.code === 200) {
          uni.showToast({ title: '保存成功', icon: 'success' })

          const updatedUserInfo = {
            ...userInfo.value,
            realName: editForm.realName,
            email: editForm.email,
            phone: editForm.phone
          }
          userInfo.value = updatedUserInfo
          uni.setStorageSync('userInfo', updatedUserInfo)

          closeEditPopup()
        } else {
          uni.showToast({ title: res.message || '保存失败', icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: e.message || '保存失败', icon: 'none' })
      }
    }

    const savePassword = async () => {
      if (!passwordForm.oldPassword) {
        uni.showToast({ title: '请输入当前密码', icon: 'none' })
        return
      }
      if (!passwordForm.newPassword) {
        uni.showToast({ title: '请输入新密码', icon: 'none' })
        return
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        uni.showToast({ title: '两次密码不一致', icon: 'none' })
        return
      }

      try {
        const res = await authApi.changePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })

        if (res.code === 200) {
          uni.showToast({ title: '密码修改成功', icon: 'success' })
          closePasswordPopup()
        } else {
          uni.showToast({ title: res.message || '修改失败', icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: e.message || '修改失败', icon: 'none' })
      }
    }

    const clearCache = () => {
      uni.showModal({
        title: '提示',
        content: '确定要清除缓存吗？',
        success: (res) => {
          if (res.confirm) {
            uni.clearStorage()
            uni.showToast({ title: '缓存已清除', icon: 'success' })
          }
        }
      })
    }

    const handleLogout = () => {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('token')
            uni.removeStorageSync('userInfo')

            uni.reLaunch({
              url: '/pages/common/login'
            })
          }
        }
      })
    }

    return {
      userInfo,
      roleText,
      getAvatarUrl,
      showEditPopup,
      showPasswordPopup,
      showAboutPopup,
      showAvatarMenuVisible,
      showViewAvatar,
      editForm,
      passwordForm,
      showEditInfo,
      closeEditPopup,
      showChangePassword,
      closePasswordPopup,
      showAbout,
      closeAboutPopup,
      showAvatarMenu,
      closeAvatarMenu,
      handleViewAvatar,
      closeViewAvatar,
      handleChangeAvatar,
      saveEditInfo,
      savePassword,
      clearCache,
      handleLogout,
      goTo
    }
  }
}
</script>

<style lang="scss">
.account-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.user-header {
  display: flex;
  align-items: center;
  padding: 40rpx 32rpx;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);

  .avatar-box {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;

    .avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
    }
  }

  .user-info {
    .username {
      font-size: 36rpx;
      color: #fff;
      font-weight: 600;
      margin-bottom: 8rpx;
    }

    .role {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

.menu-list {
  padding: 24rpx;
}

.menu-group {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;

  .menu-item {
    display: flex;
    align-items: center;
    padding: 28rpx 24rpx;
    border-bottom: 1rpx solid #e5e5e5;

    &:last-child {
      border-bottom: none;
    }

    .menu-icon {
      width: 44rpx;
      height: 44rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      .emoji-icon {
        font-size: 36rpx;
      }
    }

    .menu-text {
      flex: 1;
      font-size: 32rpx;
      color: #333;
      margin-left: 16rpx;
    }

    .menu-arrow {
      width: 32rpx;

      .arrow-icon {
        font-size: 40rpx;
        color: #999;
      }
    }
  }
}

.logout-btn {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  text-align: center;

  .logout-text {
    font-size: 32rpx;
    color: #dc2626;
  }
}

/* 弹窗遮罩 */
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

/* 底部弹窗 */
.popup-bottom {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;

  .popup-content {
    background: #fff;
    border-radius: 24rpx 24rpx 0 0;
    padding: 32rpx;

    .popup-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32rpx;

      .popup-title {
        font-size: 36rpx;
        font-weight: 600;
        color: #333;
      }

      .popup-close {
        font-size: 28rpx;
        color: #666;
      }
    }
  }
}

/* 居中弹窗 */
.popup-center {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;

  .about-content {
    width: 500rpx;
    background: #fff;
    border-radius: 24rpx;
    padding: 40rpx;
    text-align: center;

    .about-logo {
      width: 120rpx;
      height: 120rpx;
      margin-bottom: 24rpx;
    }

    .about-title {
      font-size: 40rpx;
      font-weight: 700;
      color: #333;
      margin-bottom: 16rpx;
    }

    .about-version {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 24rpx;
    }

    .about-desc {
      font-size: 28rpx;
      color: #999;
      margin-bottom: 24rpx;
    }

    .about-copy {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 24rpx;
    }

    .about-close-btn {
      width: 200rpx;
      height: 72rpx;
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      border-radius: 12rpx;
      border: none;
      color: #fff;
      font-size: 28rpx;
    }
  }
}

.form-content {
  .form-item {
    margin-bottom: 24rpx;

    .label {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 12rpx;
    }

    .input {
      width: 100%;
      height: 80rpx;
      background: #f5f5f5;
      border-radius: 12rpx;
      padding: 0 20rpx;
      font-size: 32rpx;
      color: #333;
    }
  }

  .save-btn {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    border-radius: 12rpx;
    border: none;
    margin-top: 32rpx;
    color: #fff;
    font-size: 32rpx;
  }
}

.avatar-box {
  position: relative;
}

.avatar-edit-icon {
  position: absolute;
  right: -4rpx;
  bottom: -4rpx;
  width: 36rpx;
  height: 36rpx;
  background: #dc2626;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3rpx solid #fff;

  .edit-icon {
    font-size: 20rpx;
    color: #fff;
  }
}

.avatar-menu-popup {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.avatar-menu-content {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 32rpx 0;
}

.avatar-menu-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  .menu-item-icon {
    font-size: 40rpx;
    margin-right: 16rpx;
  }

  .menu-item-text {
    font-size: 32rpx;
    color: #333;
  }
}

.avatar-menu-cancel {
  margin-top: 16rpx;
  padding: 32rpx 0;
  background: #f5f5f5;

  .menu-cancel-text {
    font-size: 32rpx;
    color: #666;
    text-align: center;
    display: block;
  }
}

.view-avatar-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.9);
}

.view-avatar-img {
  width: 600rpx;
  height: 600rpx;
  border-radius: 16rpx;
}

.view-avatar-close {
  position: absolute;
  top: 60rpx;
  right: 32rpx;
  font-size: 48rpx;
  color: #fff;
}
</style>