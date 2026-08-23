/** @format */

export const clock = (s) => {
  const t = Math.max(0, Math.floor(s))
  const m = Math.floor(t / 60),
    r = t % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

export const UI_TEXT = {
  vi: {
    greeting: {
      morning: 'Chào buổi sáng',
      afternoon: 'Chào buổi chiều',
      evening: 'Chào buổi tối',
    },
    nav: {
      home: 'Trang chủ',
      meditate: 'Thiền',
      listen: 'Nghe',
      teachers: 'Giảng viên',
      library: 'Thư viện',
    },
    home: {
      prompt: 'Bạn muốn thực hành như thế nào hôm nay?',
      startMeditation: 'Bắt đầu thiền',
      continueListening: 'Tiếp tục nghe',
      recommended: 'Dành cho bạn',
      todaysPractice: 'Thực hành hôm nay',
      remaining: 'phút còn lại',
      watch: 'Xem',
      dhammaTalk: 'Bài pháp thoại',
      breathingMeditation: 'Thiền hơi thở',
      quietReflection: 'Tĩnh tâm',
      naturalMind: 'Tâm tự nhiên',
      middleWay: 'Hiểu về Trung đạo',
    },
    meditate: {
      quickPractice: 'Thực hành nhanh',
      guidedMeditation: 'Thiền có hướng dẫn',
      byTeacher: 'Theo giảng viên',
      create: 'Tạo buổi thiền',
      duration: 'Thời lượng',
      guidance: 'Hướng dẫn',
      guided: 'Có hướng dẫn',
      silent: 'Yên lặng',
      custom: 'Tùy chỉnh',
      minute: 'phút',
      beginningBell: 'Chuông bắt đầu',
      intervalBell: 'Chuông giữa buổi',
      endingBell: 'Chuông kết thúc',
      beginPractice: 'Bắt đầu thực hành',
      names: {
        m1: 'Thiền hơi thở (Ānāpānasati)',
        m2: 'Thiền tâm từ (Mettā)',
        m3: 'Quán sát thân',
        m4: 'Thiền hành',
        m5: 'Thư giãn và ngủ',
      },
      descriptions: {
        m1: 'Đặt sự chú ý nhẹ nhàng nơi cảm giác của hơi thở.',
        m2: 'Nuôi dưỡng thiện ý, bắt đầu từ chính mình.',
        m3: 'Đưa sự chú ý lần lượt qua từng phần cơ thể.',
        m4: 'Nhận biết từng bước chân trên một đoạn đường.',
        m5: 'Thả lỏng cơ thể và nhẹ nhàng đi vào nghỉ ngơi.',
      },
      cues: {
        m1: 'Nhẹ nhàng đưa sự chú ý trở về với hơi thở.',
        m2: 'Nguyện cho bạn được an lành. Nguyện cho bạn được thảnh thơi.',
        m3: 'Cảm nhận cơ thể như nó đang là, không cần điều chỉnh.',
        m4: 'Biết rõ bàn chân khi nhấc lên, di chuyển và đặt xuống.',
        m5: 'Lúc này không cần làm gì cả. Hãy để cơ thể được thả lỏng.',
      },
      closeSession: 'Đóng buổi thiền',
      sessionOptions: 'Tùy chọn buổi thiền',
      meditation: 'Thiền',
      sessionComplete: 'Buổi thiền đã hoàn thành.',
      ringBell: 'Thỉnh chuông',
      pause: 'Tạm dừng',
      resume: 'Tiếp tục',
      endSession: 'Kết thúc buổi thiền',
    },
    listen: {
      forYourEvening: 'Dành cho buổi tối',
      clear: 'Xóa bộ lọc',
      browseByTopic: 'Khám phá theo chủ đề',
      play: 'Phát',
      minute: 'phút',
      talkTitles: {
        t1: 'Tâm tự nhiên', t2: 'Hiểu về sự chấp thủ', t3: 'Sống với vô thường',
        t4: 'Bình an đến từ bên trong', t5: 'Hiểu về Trung đạo', t6: 'Buông bỏ',
      },
      topics: {
        Meditation: 'Thiền', 'Letting Go': 'Buông bỏ', Anger: 'Sân giận',
        Mindfulness: 'Chánh niệm', Kamma: 'Nghiệp', Relationships: 'Các mối quan hệ',
        'Daily Life': 'Đời sống hằng ngày', Wisdom: 'Trí tuệ', Nibbāna: 'Niết-bàn',
      },
      closePlayer: 'Đóng trình phát', removeBookmark: 'Bỏ dấu trang', bookmark: 'Đánh dấu',
      more: 'Thêm', playbackSpeed: 'Tốc độ phát', back15: 'Lùi 15 giây',
      forward15: 'Tiến 15 giây', pause: 'Tạm dừng', resumePlay: 'Phát', sleepTimer: 'Hẹn giờ ngủ',
      playlist: 'Danh sách phát', share: 'Chia sẻ', transcript: 'Bản chép lời',
      noAudio: 'Chưa có tệp âm thanh — ứng dụng đang mô phỏng phát lại.',
      minutes: 'phút', endOfTrack: 'Khi hết bài', fadeNote: 'Âm thanh sẽ nhỏ dần trong 20 giây.',
    },
    drawer: {
      settings: 'Cài đặt',
      language: 'Ngôn ngữ',
      darkMode: 'Chế độ tối',
    },
    common: {
      search: 'Tìm kiếm',
      settings: 'Cài đặt',
      language: 'Ngôn ngữ',
      darkMode: 'Chế độ tối',
      next: 'Tiếp theo',
    },
  },
  en: {
    greeting: {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
    },
    nav: {
      home: 'Home',
      meditate: 'Meditate',
      listen: 'Listen',
      teachers: 'Teachers',
      library: 'Library',
    },
    home: {
      prompt: 'How would you like to<br />practice today?',
      startMeditation: 'Start Meditation',
      continueListening: 'Continue Listening',
      recommended: 'Recommended for you',
      todaysPractice: 'Today’s Practice',
      remaining: 'min remaining',
      watch: 'Watch',
      dhammaTalk: 'Dhamma Talk',
      breathingMeditation: 'Breathing Meditation',
      quietReflection: 'Quiet Reflection',
      naturalMind: 'The Natural Mind',
      middleWay: 'Understanding the Middle Way',
    },
    meditate: {
      quickPractice: 'Quick Practice', guidedMeditation: 'Guided Meditation', byTeacher: 'By Teacher',
      create: 'Create Meditation', duration: 'Duration', guidance: 'Guidance', guided: 'Guided',
      silent: 'Silent', custom: 'Custom', minute: 'min',
      beginningBell: 'Beginning bell', intervalBell: 'Interval bell', endingBell: 'Ending bell',
      beginPractice: 'Begin Practice', names: {}, descriptions: {}, cues: {}, closeSession: 'Close session',
      sessionOptions: 'Session options', meditation: 'Meditation', sessionComplete: 'The session is complete.',
      ringBell: 'Ring the bell', pause: 'Pause', resume: 'Resume', endSession: 'End session',
    },
    listen: {
      forYourEvening: 'For your evening', clear: 'Clear', browseByTopic: 'Browse by topic', play: 'Play',
      minute: 'min', talkTitles: {}, topics: {}, closePlayer: 'Close player',
      removeBookmark: 'Remove bookmark', bookmark: 'Bookmark', more: 'More',
      playbackSpeed: 'Playback speed', back15: 'Back 15 seconds', forward15: 'Forward 15 seconds',
      pause: 'Pause', resumePlay: 'Play', sleepTimer: 'Sleep timer', playlist: 'Playlist',
      share: 'Share', transcript: 'Transcript',
      noAudio: 'No audio file is available — playback is being simulated.', minutes: 'minutes',
      endOfTrack: 'End of track', fadeNote: 'Fades out over 20 seconds rather than cutting.',
    },
    drawer: {
      settings: 'Settings',
      language: 'Language',
      darkMode: 'Dark Mode',
    },
    common: {
      search: 'Search',
      settings: 'Settings',
      language: 'Language',
      darkMode: 'Dark Mode',
      next: 'Next',
    },
  },
}

export const uiText = (lang = 'vi') => UI_TEXT[lang] || UI_TEXT.vi

export const greeting = (lang = 'vi') => {
  const h = new Date().getHours()
  const copy = uiText(lang)
  if (h < 11) return copy.greeting.morning
  if (h < 18) return copy.greeting.afternoon
  return copy.greeting.evening
}
