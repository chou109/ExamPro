<script>
export default {
  onLaunch: function() {
    console.log('App Launch')
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  }
}
</script>

<style lang="scss">
@import './uni.scss';

view, text, scroll-view {
  box-sizing: border-box;
}

page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.status-bar {
  height: var(--status-bar-height);
  background-color: #dc2626;
}

.safe-area-bottom {
  height: var(--safe-area-inset-bottom);
}

$primary-color: #dc2626;
$primary-light: #f87171;
$primary-dark: #b91c1c;
$success-color: #22c55e;
$warning-color: #f59e0b;
$error-color: #ef4444;
$info-color: #3b82f6;

$text-primary: #1f2937;
$text-secondary: #6b7280;
$text-muted: #9ca3af;

$bg-primary: #ffffff;
$bg-secondary: #f3f4f6;
$bg-tertiary: #e5e7eb;

$border-color: #e5e7eb;
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

$radius-sm: 8rpx;
$radius-md: 16rpx;
$radius-lg: 24rpx;

$spacing-xs: 8rpx;
$spacing-sm: 16rpx;
$spacing-md: 24rpx;
$spacing-lg: 32rpx;
$spacing-xl: 48rpx;

$font-xs: 22rpx;
$font-sm: 24rpx;
$font-base: 28rpx;
$font-md: 32rpx;
$font-lg: 36rpx;
$font-xl: 40rpx;
$font-2xl: 48rpx;
$font-3xl: 56rpx;
</style>