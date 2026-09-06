export const MEDITATION_METHODS = [
  { id: 'anapanasati', name: 'Ānāpānasati', nameVi: 'Thiền hơi thở', icon: 'breath', descriptionVi: 'Đặt sự chú ý nhẹ nhàng vào hơi thở.', aboutVi: 'Một phương pháp nuôi dưỡng chánh niệm bằng cách nhận biết hơi thở tự nhiên, không điều khiển hay ép buộc.', suitableVi: 'Phù hợp cho người mới bắt đầu và người muốn làm tâm lắng dịu.', cueVi: 'Nhẹ nhàng đưa sự chú ý trở về với hơi thở.', referencesVi: ['Ānāpānasati là gì?', 'Kinh Ānāpānasati', 'Tư thế ngồi thiền'] },
  { id: 'metta', name: 'Mettā', nameVi: 'Thiền tâm từ', icon: 'heart', descriptionVi: 'Nuôi dưỡng thiện ý với chính mình và người khác.', aboutVi: 'Thực hành mở rộng lòng thiện ý, bắt đầu từ bản thân rồi hướng đến những người xung quanh.', suitableVi: 'Phù hợp khi tâm khép kín, căng thẳng hoặc có nhiều chống đối.', cueVi: 'Nguyện cho tôi và mọi người được an lành, thảnh thơi.', referencesVi: ['Mettā là gì?', 'Kinh Từ Bi', 'Cách thực hành tâm từ'] },
  { id: 'body', name: 'Body Awareness', nameVi: 'Quán sát thân', icon: 'body', descriptionVi: 'Nhận biết cảm giác và chuyển động trong cơ thể.', aboutVi: 'Đưa sự chú ý qua thân để nhận biết trực tiếp cảm giác, tư thế và sự thay đổi.', suitableVi: 'Phù hợp khi tâm nhiều suy nghĩ hoặc cần trở về với trải nghiệm hiện tại.', cueVi: 'Cảm nhận cơ thể như nó đang là, không cần điều chỉnh.', referencesVi: ['Quán thân là gì?', 'Bốn oai nghi', 'Thư giãn thân đúng cách'] },
  { id: 'walking', name: 'Walking Meditation', nameVi: 'Thiền hành', icon: 'walk', descriptionVi: 'Giữ sự tỉnh thức trong từng bước chân.', aboutVi: 'Thực hành chánh niệm khi đi, biết rõ chuyển động của chân và toàn thân.', suitableVi: 'Phù hợp khi buồn ngủ, bồn chồn hoặc khó ngồi lâu.', cueVi: 'Biết rõ bàn chân khi nhấc lên, di chuyển và đặt xuống.', referencesVi: ['Cách thiết lập đường thiền hành', 'Nhịp đi tự nhiên', 'Chánh niệm trong chuyển động'] },
  { id: 'silent', name: 'Silent Meditation', nameVi: 'Thiền im lặng', icon: 'lotus', descriptionVi: 'Thực hành không có lời hướng dẫn.', aboutVi: 'Một khoảng thực hành tự chủ với chuông bắt đầu và kết thúc, không có âm thanh hướng dẫn.', suitableVi: 'Phù hợp với người đã biết phương pháp mình muốn thực hành.', cueVi: 'Yên lặng nhận biết điều đang có mặt.', referencesVi: ['Chuẩn bị cho buổi thiền im lặng', 'Làm việc với phóng tâm', 'Kết thúc buổi thiền'] },
  { id: 'vipassana', name: 'Vipassanā', nameVi: 'Thiền Vipassanā', icon: 'lotus', descriptionVi: 'Thực hành theo bài hướng dẫn của Thiền sư S.N. Goenka.', aboutVi: 'Bài thực hành Vipassanā có hướng dẫn bằng âm thanh trong một giờ.', suitableVi: 'Phù hợp với người muốn thực hành trọn vẹn theo bài hướng dẫn dài.', cueVi: 'Lắng nghe lời hướng dẫn và duy trì sự tỉnh thức.', referencesVi: ['Thông tin bài hướng dẫn đang được bổ sung'] },
]

export const MEDITATION_AUDIO_CREDIT = {
  dasiraNarada: { name: 'Thiền Dưỡng Sinh DASIRA NARADA', url: 'https://www.youtube.com/@thienduongsinhdasiranarada' },
}

export const MEDITATION_SESSIONS = [
  { id: 'guided-basic-8', titleVi: 'Thiền định 8 phút', methodId: 'vipassana', durationSeconds: 480, guidanceType: 'guided', language: 'vi', level: 'beginner', audioCredit: 'dasiraNarada', audioUrl: encodeURI('/audio/Meditation/8 phut HUONG-DAN-THIEN-CAN-BAN.mp3') },
  { id: 'guided-release-15', titleVi: 'Thiền định 15 phút', methodId: 'vipassana', durationSeconds: 900, guidanceType: 'guided', language: 'vi', level: 'beginner', audioCredit: 'dasiraNarada', audioUrl: encodeURI('/audio/Meditation/15-phut-Thien.mp3') },
  { id: 'guided-meditation-30', titleVi: 'Thiền định 30 phút', methodId: 'vipassana', durationSeconds: 1800, guidanceType: 'guided', language: 'vi', level: 'regular', audioCredit: 'dasiraNarada', audioUrl: encodeURI('/audio/Meditation/30 PHÚT THIỀN ĐỊNH.mp3') },
  { id: 'guided-meditation-60', titleVi: 'Thiền định 60 phút', methodId: 'vipassana', durationSeconds: 3600, guidanceType: 'guided', language: 'vi', level: 'regular', audioCredit: 'dasiraNarada', audioUrl: '/audio/Meditation/web-thien-dinh-60.m4a' },
  { id: 'guided-mindfulness-90', titleVi: 'Thiền định 90 phút', methodId: 'vipassana', durationSeconds: 5400, guidanceType: 'guided', language: 'vi', level: 'experienced', audioCredit: 'dasiraNarada', audioUrl: encodeURI('/audio/Meditation/90-PHUT-HUONG-DAN-THIEN-DINH-CHANH-NIEM.mp3') },
  { id: 'guided-mindfulness-120', titleVi: 'Thiền định 120 phút', methodId: 'vipassana', durationSeconds: 7200, guidanceType: 'guided', language: 'vi', level: 'experienced', audioCredit: 'dasiraNarada', audioUrl: encodeURI('/audio/Meditation/120-PHUT-THIEN-DINH-CHANH-NIEM-CAN-BAN.mp3') },
  { id: 'silent-8', titleVi: 'Khoảng lặng 8 phút', methodId: 'silent', durationSeconds: 480, guidanceType: 'silent', language: 'vi', level: 'beginner' },
  { id: 'breath-5-light', titleVi: 'Một khoảng dừng nhẹ', methodId: 'anapanasati', teacherId: 'jayasaro', durationSeconds: 300, guidanceType: 'silent', language: 'vi', level: 'beginner' },
  { id: 'breath-10-light', titleVi: 'Hơi thở và khoảng lặng', methodId: 'anapanasati', teacherId: 'jayasaro', durationSeconds: 600, guidanceType: 'silent', language: 'vi', level: 'regular' },
  { id: 'breath-15-light', titleVi: 'An trú nhẹ nhàng', methodId: 'anapanasati', durationSeconds: 900, guidanceType: 'silent', language: 'vi', level: 'regular' },
  { id: 'ms2', titleVi: 'An trú với hơi thở', methodId: 'anapanasati', teacherId: 'jayasaro', durationSeconds: 1200, guidanceType: 'silent', language: 'vi', level: 'regular' },
  { id: 'breath-30-light', titleVi: 'An trú trong tĩnh lặng', methodId: 'anapanasati', teacherId: 'jayasaro', durationSeconds: 1800, guidanceType: 'silent', language: 'vi', level: 'experienced' },
  { id: 'breath-60-light', titleVi: 'Một giờ an trú', methodId: 'anapanasati', durationSeconds: 3600, guidanceType: 'silent', language: 'vi', level: 'experienced' },
  { id: 'daily-evening-25', titleVi: 'Trở về với sự tĩnh lặng', methodId: 'anapanasati', durationSeconds: 1500, guidanceType: 'silent', language: 'vi', level: 'regular' },
  { id: 'ms3', titleVi: 'Hơi thở trong im lặng', methodId: 'anapanasati', durationSeconds: 1800, guidanceType: 'silent', language: 'vi', level: 'regular' },
  { id: 'ms4', titleVi: 'Tâm từ cho người mới', methodId: 'metta', teacherId: 'brahm', durationSeconds: 600, guidanceType: 'guided', language: 'vi', level: 'beginner' },
  { id: 'ms5', titleVi: 'Mở rộng lòng thiện ý', methodId: 'metta', teacherId: 'brahm', durationSeconds: 1200, guidanceType: 'silent', language: 'vi', level: 'regular' },
  { id: 'ms6', titleVi: 'Nhận biết toàn thân', methodId: 'body', teacherId: 'sumedho', durationSeconds: 1200, guidanceType: 'guided', language: 'vi', level: 'beginner' },
  { id: 'ms7', titleVi: 'Quán sát cảm giác', methodId: 'body', durationSeconds: 1800, guidanceType: 'silent', language: 'vi', level: 'regular' },
  { id: 'ms8', titleVi: 'Tỉnh thức trong từng bước', methodId: 'walking', teacherId: 'pasanno', durationSeconds: 600, guidanceType: 'guided', language: 'vi', level: 'beginner' },
  { id: 'ms9', titleVi: 'Thiền hành yên lặng', methodId: 'walking', durationSeconds: 1200, guidanceType: 'silent', language: 'vi', level: 'regular' },
  { id: 'ms10', titleVi: 'Khoảng lặng ngắn', methodId: 'silent', durationSeconds: 300, guidanceType: 'silent', language: 'vi', level: 'beginner' },
  { id: 'ms11', titleVi: 'Thiền im lặng', methodId: 'silent', durationSeconds: 600, guidanceType: 'silent', language: 'vi', level: 'regular' },
  { id: 'silent-15', titleVi: 'Khoảng lặng 15 phút', methodId: 'silent', durationSeconds: 900, guidanceType: 'silent', language: 'vi', level: 'regular' },
  { id: 'silent-20', titleVi: 'Khoảng lặng 20 phút', methodId: 'silent', durationSeconds: 1200, guidanceType: 'silent', language: 'vi', level: 'regular' },
  { id: 'ms12', titleVi: 'Thiền im lặng', methodId: 'silent', durationSeconds: 1800, guidanceType: 'silent', language: 'vi', level: 'experienced' },
  { id: 'silent-60', titleVi: 'Thiền im lặng 60 phút', methodId: 'silent', durationSeconds: 3600, guidanceType: 'silent', language: 'vi', level: 'experienced' },
  { id: 'silent-90', titleVi: 'Thiền im lặng 90 phút', methodId: 'silent', durationSeconds: 5400, guidanceType: 'silent', language: 'vi', level: 'experienced' },
  { id: 'silent-120', titleVi: 'Thiền im lặng 120 phút', methodId: 'silent', durationSeconds: 7200, guidanceType: 'silent', language: 'vi', level: 'experienced' },
]

export const SUPPORTING_PRACTICES = [
  { id: 'relax', titleVi: 'Thư giãn cơ thể', descriptionVi: 'Buông lỏng những vùng đang căng.', duration: 10, icon: 'body' },
  { id: 'rest', titleVi: 'Chuẩn bị nghỉ ngơi', descriptionVi: 'Khép lại ngày bằng sự tỉnh thức.', duration: 15, icon: 'moon' },
]

export const GUIDANCE_LABELS = { guided: 'Có hướng dẫn', silent: 'Im lặng' }
export const GUIDANCE_DESCRIPTIONS = { guided: 'Có lời hướng dẫn trong suốt buổi thiền.', silent: 'Không lời hướng dẫn, chỉ có chuông.' }
export const GUIDANCE_LABELS_EN = { guided: 'Guided', silent: 'Silent' }
export const GUIDANCE_DESCRIPTIONS_EN = { guided: 'Guidance throughout the meditation.', silent: 'No spoken guidance, only bells.' }
