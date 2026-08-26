export const SUPPORT_PRACTICES = [
  {
    id: 'body-relaxation-10', type: 'body_relaxation', contentType: 'visual_guided',
    titleVi: 'Thư giãn cơ thể', subtitleVi: 'Buông lỏng những vùng đang căng cứng.',
    durationSeconds: 600, heroIcon: 'body', isPublished: true, isActive: true, order: 1,
    steps: [
      { id: 'settle', titleVi: 'Ổn định tư thế', descriptionVi: 'Ngồi hoặc nằm theo cách bạn cảm thấy thoải mái.', durationSeconds: 60, icon: 'lotus' },
      { id: 'face', titleVi: 'Khuôn mặt', descriptionVi: 'Buông lỏng vùng mắt, hàm và trán.', durationSeconds: 90, icon: 'user' },
      { id: 'shoulders', titleVi: 'Vai và cổ', descriptionVi: 'Để hai vai rơi xuống tự nhiên. Cảm nhận trọng lượng của cánh tay.', durationSeconds: 120, icon: 'body' },
      { id: 'chest', titleVi: 'Ngực và bụng', descriptionVi: 'Nhận biết chuyển động tự nhiên của cơ thể theo từng hơi thở.', durationSeconds: 120, icon: 'breath' },
      { id: 'whole-body', titleVi: 'Toàn thân', descriptionVi: 'Cảm nhận toàn bộ cơ thể đang được nâng đỡ.', durationSeconds: 210, icon: 'lotus' },
    ],
  },
  {
    id: 'evening-wind-down-10', type: 'evening_wind_down', contentType: 'visual_guided',
    titleVi: 'Chuẩn bị nghỉ ngơi', subtitleVi: 'Khép lại ngày bằng sự tỉnh thức.',
    durationSeconds: 600, heroIcon: 'moon', isPublished: true, isActive: true, order: 2,
    steps: [
      { id: 'pause', titleVi: 'Dừng lại', descriptionVi: 'Đặt điện thoại sang một bên và cho phép cơ thể chậm lại.', durationSeconds: 60, icon: 'moon' },
      { id: 'relax', titleVi: 'Thả lỏng cơ thể', descriptionVi: 'Buông lỏng vai, khuôn mặt và bàn tay.', durationSeconds: 120, icon: 'body' },
      { id: 'breath', titleVi: 'Hơi thở', descriptionVi: 'Không cần thay đổi hơi thở. Chỉ nhận biết nó đang đến và đi.', durationSeconds: 180, icon: 'breath' },
      { id: 'reflect', titleVi: 'Nhìn lại ngày', descriptionVi: 'Nhận biết ngày hôm nay mà không phán xét.', durationSeconds: 120, icon: 'note' },
      { id: 'silence', titleVi: 'Khoảng lặng', descriptionVi: 'Nghỉ trong im lặng trong những phút cuối.', durationSeconds: 120, icon: 'lotus' },
    ],
  },
]
