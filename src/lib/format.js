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
      teachers: 'Các vị thầy',
      library: 'Thư viện',
    },
    home: {
      prompt: 'Bạn muốn thực hành như thế nào hôm nay?',
      startMeditation: 'Bắt đầu thiền',
      continueListening: 'Tiếp tục nghe',
      continuePractice: 'Tiếp tục thực hành',
      continueAction: 'Tiếp tục',
      recommended: 'Dành cho bạn',
      teachers: 'Các vị thầy',
      seeAll: 'Xem tất cả',
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
      guidedPlaying: 'Đang phát hướng dẫn', guidedPaused: 'Đang tạm dừng', noGuidance: 'Không có lời hướng dẫn. Chỉ có chuông bắt đầu và kết thúc.', done: 'Xong',
      practiceNow: 'THỰC HÀNH NGAY', timeQuestion: 'Bạn có bao nhiêu thời gian?', continuePractice: 'Tiếp tục thực hành', tapToOpen: 'Chạm để mở trình phát', continueAction: 'Tiếp tục', pauseAction: 'Tạm dừng', withTeachers: 'Thiền cùng các vị thầy', viewAllTeachers: 'Xem tất cả các vị thầy', supportPractices: 'Thực hành hỗ trợ', recommendation: 'ĐỀ XUẤT', start: 'Bắt đầu', later: 'Để sau', practiceChoice: 'Bạn muốn thực hành thế nào?', recommendationHint: 'Gợi ý phù hợp với thời gian của bạn', backgroundSound: 'Âm nền', backgroundVolume: 'Âm lượng', chooseBackground: 'Chọn âm nền', percent: 'phần trăm',
      sessions: 'Các buổi thực hành', all: 'Tất cả', quick: 'Thực hành nhanh', selfPractice: 'Tự thực hành', unavailableMethod: 'Không tìm thấy phương pháp thiền này.', audioCredit: 'Âm thanh được chia sẻ với sự cho phép của',
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
    audioBrowse: {
      title: 'Nghe', subtitle: 'Lắng nghe Pháp thoại, thiền hướng dẫn và kinh tụng.', searchPlaceholder: 'Tìm bài nghe, vị thầy hoặc chủ đề…', searchLabel: 'Tìm nội dung âm thanh', continue: 'Nghe tiếp', continueAction: 'Tiếp tục nghe', explore: 'Khám phá', recommended: 'Dành cho bạn', byTeacher: 'Theo vị thầy', collections: 'Bộ nội dung', allAudio: 'Tất cả bài nghe', categoriesLabel: 'Lọc nội dung nghe', openDetails: 'Mở chi tiết', retry: 'Thử lại',
      categories: { all: 'Tất cả', dhamma: 'Pháp thoại', sutta: 'Kinh', meditation: 'Thiền', chanting: 'Tụng kinh', audiobook: 'Sách nói' },
      pause: 'Tạm dừng', play: 'Phát', details: 'Chi tiết', unknownTeacher: 'Chưa cập nhật', durationPending: 'Thời lượng đang cập nhật', empty: 'Không tìm thấy nội dung phù hợp.', emptyHint: 'Thử tìm bằng tên bài, vị thầy hoặc chủ đề khác.', items: 'bài', playlist: 'Kinh tụng theo ngày', playlistDescription: 'Các thời kinh tụng được sắp xếp theo ngày.', tracks: 'bài tụng', suttaPlaylist: 'Kinh giảng — Ashin Sarana', suttaPlaylistDescription: 'Hai bài giảng và giải thích về kinh.', goenkaPlaylist: 'Tứ Niệm Xứ Giảng Giải', goenkaPlaylistDescription: 'Thiền sư S.N. Goenka · Bản giảng được chia thành sáu phần.', parts: 'phần', playAll: 'Phát từ đầu', viewPlaylist: 'Xem danh sách', collapsePlaylist: 'Thu gọn', moreAudio: 'Nội dung khác',
    },
    player: {
      missing: 'Không tìm thấy nội dung âm thanh.', close: 'Đóng trình phát', unsave: 'Bỏ lưu', save: 'Lưu', saved: 'Đã lưu', details: 'Xem chi tiết', previous: 'Bài trước', next: 'Bài tiếp theo', back15: 'Lùi 15 giây', forward15: 'Tiến 15 giây', pause: 'Tạm dừng', play: 'Phát', speed: 'Tốc độ phát', information: 'Thông tin', source: 'Nguồn', original: 'Nội dung gốc',
    },
    audioDetail: { content: 'Nội dung', notFound: 'Không tìm thấy nội dung này.', title: 'Chi tiết', unknown: 'Không ghi tên người tụng', play: 'Phát', unavailable: 'Chưa có âm thanh', saved: 'Đã lưu', save: 'Lưu', description: 'Mô tả', descriptionPending: 'Mô tả đang được biên tập và xác minh.', teacher: 'Về vị thầy', source: 'NGUỒN', sourceLabel: 'Nguồn', original: 'Xem nội dung gốc', sourcePending: 'Liên kết nguồn đang được bổ sung.', categories: { dhamma: 'Pháp thoại', sutta: 'Kinh', meditation: 'Thiền', chanting: 'Tụng kinh', audiobook: 'Sách nói' }, languages: { vi: 'Tiếng Việt', pali: 'Pāli', en: 'English', und: 'Ngôn ngữ chưa xác định' } },
    teachersPage: {
      emptyLineage: 'Chưa có vị thầy trong truyền thống này.', listeningCount: 'bài nghe', meditationCount: 'bài thiền', tradition: 'Truyền thống rừng Thái', lineage: 'Dòng truyền thừa Ajahn Chah', about: 'Giới thiệu', meditate: 'Thiền', listen: 'Nghe', sessions: 'Các buổi thiền', listening: 'Nội dung nghe', noMeditation: 'Chưa có buổi thiền từ vị thầy này.', noAudio: 'Chưa có bản ghi âm đã duyệt từ vị thầy này.', selfPractice: 'Tự thực hành',
    },
    errors: { audioUnavailable: 'Nội dung này hiện chưa có âm thanh để phát.', audioPlay: 'Hiện chưa thể phát nội dung này. Vui lòng thử lại sau.', audioSeek: 'Không thể chuyển đến vị trí này. Vui lòng thử lại.', audioTimeout: 'Tải âm thanh quá lâu. Vui lòng kiểm tra mạng và thử lại.', audioLoad: 'Không thể tải âm thanh. Hãy kiểm tra kết nối và thử lại.', meditationUnavailable: 'Bài hướng dẫn này hiện chưa có âm thanh để phát.', meditationPlay: 'Hiện chưa thể phát bài hướng dẫn này.', meditationSeek: 'Không thể chuyển đến vị trí này.' },
    support: { title: 'Thực hành hỗ trợ', unavailable: 'Nội dung này hiện chưa khả dụng. Vui lòng quay lại sau.', visual: 'Hướng dẫn trực quan', audio: 'Có hướng dẫn', mixed: 'Hướng dẫn kết hợp', plan: 'Bạn sẽ thực hành', continue: 'Tiếp tục', start: 'Bắt đầu', continueFrom: 'Tiếp tục từ phút', mode: 'Thực hành hỗ trợ', close: 'Đóng', previous: 'Bước trước', next: 'Bước tiếp theo', pause: 'Tạm dừng', resume: 'Tiếp tục', remaining: 'phút còn lại trong bước này', step: 'bước' },
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
      continuePractice: 'Continue Practice',
      continueAction: 'Continue',
      recommended: 'Recommended for you',
      teachers: 'Teachers',
      seeAll: 'See all',
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
      guidedPlaying: 'Guidance is playing', guidedPaused: 'Paused', noGuidance: 'No spoken guidance. Only beginning and ending bells.', done: 'Done',
      practiceNow: 'PRACTICE NOW', timeQuestion: 'How much time do you have?', continuePractice: 'Continue practice', tapToOpen: 'Tap to open the player', continueAction: 'Continue', pauseAction: 'Pause', withTeachers: 'Meditate with teachers', viewAllTeachers: 'View all teachers', supportPractices: 'Supporting practices', recommendation: 'RECOMMENDED', start: 'Start', later: 'Maybe later', practiceChoice: 'How would you like to practise?', recommendationHint: 'Recommended for your available time', backgroundSound: 'Background sound', backgroundVolume: 'Volume', chooseBackground: 'Choose background sound', percent: 'percent',
      sessions: 'Practice sessions', all: 'All', quick: 'Quick practice', selfPractice: 'Self-guided practice', unavailableMethod: 'This meditation method could not be found.', audioCredit: 'Audio shared with permission from',
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
    audioBrowse: {
      title: 'Listen', subtitle: 'Listen to Dhamma talks, guided meditation, and chanting.', searchPlaceholder: 'Search talks, teachers or topics…', searchLabel: 'Search audio content', continue: 'Continue listening', continueAction: 'Continue listening', explore: 'Explore', recommended: 'For you', byTeacher: 'By teacher', collections: 'Collections', allAudio: 'All listening', categoriesLabel: 'Filter listening content', openDetails: 'Open details', retry: 'Try again',
      categories: { all: 'All', dhamma: 'Dhamma talks', sutta: 'Suttas', meditation: 'Meditation', chanting: 'Chanting', audiobook: 'Audiobooks' },
      pause: 'Pause', play: 'Play', details: 'Details', unknownTeacher: 'Not yet available', durationPending: 'Duration not yet available', empty: 'No matching content was found.', emptyHint: 'Try another title, teacher, or topic.', items: 'items', playlist: 'Daily chanting', playlistDescription: 'Chanting services arranged by day.', tracks: 'chants', suttaPlaylist: 'Sutta teachings — Ashin Sarana', suttaPlaylistDescription: 'Two teachings and explanations about Suttas.', goenkaPlaylist: 'Satipaṭṭhāna Explained', goenkaPlaylistDescription: 'S.N. Goenka · The teaching is divided into six parts.', parts: 'parts', playAll: 'Play from start', viewPlaylist: 'View playlist', collapsePlaylist: 'Collapse', moreAudio: 'More listening',
    },
    player: {
      missing: 'Audio content not found.', close: 'Close player', unsave: 'Remove saved item', save: 'Save', saved: 'Saved', details: 'View details', previous: 'Previous track', next: 'Next track', back15: 'Back 15 seconds', forward15: 'Forward 15 seconds', pause: 'Pause', play: 'Play', speed: 'Playback speed', information: 'Information', source: 'Source', original: 'Original content',
    },
    audioDetail: { content: 'Content', notFound: 'This content could not be found.', title: 'Details', unknown: 'Chanting group not credited', play: 'Play', unavailable: 'Audio unavailable', saved: 'Saved', save: 'Save', description: 'Description', descriptionPending: 'A verified description is not yet available.', teacher: 'About the teacher', source: 'SOURCE', sourceLabel: 'Source', original: 'View original content', sourcePending: 'The original source link is not available.', categories: { dhamma: 'Dhamma talk', sutta: 'Sutta', meditation: 'Meditation', chanting: 'Chanting', audiobook: 'Audiobook' }, languages: { vi: 'Vietnamese', pali: 'Pāli', en: 'English', und: 'Language not specified' } },
    teachersPage: {
      emptyLineage: 'No teachers are available in this lineage.', listeningCount: 'listening items', meditationCount: 'meditations', tradition: 'Thai Forest tradition', lineage: 'Ajahn Chah lineage', about: 'About', meditate: 'Meditate', listen: 'Listen', sessions: 'Meditation sessions', listening: 'Listening content', noMeditation: 'No meditation sessions are available from this teacher.', noAudio: 'No approved recordings are available from this teacher.', selfPractice: 'Self-guided practice',
    },
    errors: { audioUnavailable: 'Audio is not currently available for this content.', audioPlay: 'This audio cannot be played right now. Please try again.', audioSeek: 'Unable to seek to that position. Please try again.', audioTimeout: 'The audio is taking too long to load. Check your connection and try again.', audioLoad: 'Unable to load the audio. Check your connection and try again.', meditationUnavailable: 'Guided audio is not currently available for this session.', meditationPlay: 'The guided meditation cannot be played right now.', meditationSeek: 'Unable to seek to that position.' },
    support: { title: 'Supporting practice', unavailable: 'This content is not currently available. Please return later.', visual: 'Visual guidance', audio: 'Guided audio', mixed: 'Combined guidance', plan: 'What you will practise', continue: 'Continue', start: 'Start', continueFrom: 'Continue from minute', mode: 'Supporting practice', close: 'Close', previous: 'Previous step', next: 'Next step', pause: 'Pause', resume: 'Resume', remaining: 'minutes remaining in this step', step: 'step' },
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
