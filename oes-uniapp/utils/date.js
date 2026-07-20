export const formatDateTime = (dateStr, lang = 'zh') => {
  if (!dateStr) return ''
  
  const date = new Date(dateStr)
  
  if (lang === 'zh') {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}年${month}月${day}日 ${hours}:${minutes}`
  } else {
    const options = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    return date.toLocaleString('en-US', options)
  }
}

export const formatDate = (dateStr, lang = 'zh') => {
  if (!dateStr) return ''
  
  const date = new Date(dateStr)
  
  if (lang === 'zh') {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}年${month}月${day}日`
  } else {
    const options = { month: 'short', day: 'numeric', year: 'numeric' }
    return date.toLocaleString('en-US', options)
  }
}

export const formatTime = (dateStr, lang = 'zh') => {
  if (!dateStr) return ''
  
  const date = new Date(dateStr)
  
  if (lang === 'zh') {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  } else {
    const options = { hour: '2-digit', minute: '2-digit', hour12: false }
    return date.toLocaleString('en-US', options)
  }
}

export const formatMessageTime = (dateStr, lang = 'zh') => {
  if (!dateStr) return ''
  
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    return formatTime(dateStr, lang)
  } else if (days === 1) {
    return lang === 'zh' ? '昨天' : 'Yesterday'
  } else if (days < 7) {
    const weekDays = lang === 'zh' 
      ? ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return weekDays[date.getDay()]
  } else {
    return formatDate(dateStr, lang)
  }
}
