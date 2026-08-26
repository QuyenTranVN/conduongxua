export const PRIVACY_TRANSLATIONS = {
  vi: {
    pageTitle: 'Quyền riêng tư', eyebrow: 'QUYỀN RIÊNG TƯ', title: 'Quyền riêng tư của bạn rất quan trọng với chúng tôi.',
    intro: 'Con Đường Xưa được xây dựng như một nguồn tài nguyên miễn phí cho việc thiền, nghe Pháp và học hỏi. Chúng tôi cố gắng chỉ lưu những dữ liệu thực sự cần thiết để ứng dụng hoạt động tốt.',
    lastUpdated: 'Cập nhật lần cuối',
    cards: {
      stored: { icon: 'list', title: 'Dữ liệu chúng tôi có thể lưu', body: 'Ứng dụng lưu một số thông tin giới hạn trên thiết bị để trải nghiệm của bạn được liên tục hơn.', items: ['tiến trình thiền và thực hành hỗ trợ', 'tiến trình nghe', 'bài nghe yêu thích', 'trang sách đang đọc', 'tùy chọn hướng dẫn thiền'] },
      meditation: { icon: 'lotus', title: 'Dữ liệu thiền tập', body: 'Tiến trình được lưu trên thiết bị để bạn có thể tiếp tục một buổi thiền chưa hoàn thành.', items: ['buổi thiền đã bắt đầu', 'thời lượng đã thực hành', 'trạng thái hoàn thành', 'loại hướng dẫn'] },
      saved: { icon: 'bookmark', title: 'Nội dung và tùy chọn đã lưu', body: 'Bài nghe yêu thích, tiến trình nghe, trang sách và một số tùy chọn có thể được ghi nhớ để bạn dễ dàng quay lại sau.' },
      local: { icon: 'user', title: 'Không cần tài khoản', body: 'Bạn có thể sử dụng ứng dụng mà không cần tạo tài khoản. Hiện tại, dữ liệu sử dụng được lưu trực tiếp trong trình duyệt hoặc trên thiết bị và không được đồng bộ với tài khoản đám mây.' },
      external: { icon: 'globe', title: 'Dịch vụ bên ngoài', body: 'Một số nguồn và đường dẫn có thể mở YouTube hoặc các website bên ngoài. Khi bạn rời ứng dụng, chính sách quyền riêng tư của dịch vụ đó có thể được áp dụng.', items: ['YouTube khi bạn mở đường dẫn nguồn', 'website bên ngoài mà bạn chủ động truy cập'] },
    },
    promise: { title: 'Chúng tôi không', items: ['bán dữ liệu cá nhân', 'sử dụng dữ liệu thiền tập để quảng cáo cá nhân hóa', 'chia sẻ dữ liệu cá nhân với nhà quảng cáo', 'yêu cầu thông tin không cần thiết'] },
    choices: { title: 'Dữ liệu của bạn', body: 'Bạn có thể:', items: ['bỏ nội dung yêu thích trong ứng dụng', 'thay đổi tùy chọn của mình', 'xóa dữ liệu cục bộ bằng phần cài đặt dữ liệu của trình duyệt hoặc thiết bị', 'liên hệ với chúng tôi về quyền riêng tư'], action: 'Liên hệ về quyền riêng tư' },
    contact: { title: 'Có câu hỏi về quyền riêng tư?', body: 'Nếu bạn có câu hỏi về dữ liệu, quyền riêng tư hoặc muốn được hỗ trợ cập nhật hay xóa dữ liệu, hãy liên hệ với chúng tôi.', action: 'Liên hệ với chúng tôi' },
    fullPolicy: 'Xem chính sách quyền riêng tư đầy đủ',
    freeTitle: 'Con Đường Xưa là một dự án miễn phí.', freeBody: 'Chúng tôi tin rằng quyền riêng tư nên đơn giản, rõ ràng và tôn trọng người dùng.',
  },
  en: {
    pageTitle: 'Privacy', eyebrow: 'PRIVACY', title: 'Your privacy matters to us.',
    intro: 'Con Đường Xưa is built as a free resource for meditation, Dhamma listening, and learning. We aim to store only the information genuinely needed for the app to work well.',
    lastUpdated: 'Last updated',
    cards: {
      stored: { icon: 'list', title: 'Data we may store', body: 'The app stores a limited amount of information on your device to make your experience more continuous.', items: ['meditation and supporting-practice progress', 'listening progress', 'favourite audio', 'current book page', 'meditation guidance preference'] },
      meditation: { icon: 'lotus', title: 'Meditation data', body: 'Progress is stored on your device so you can continue an unfinished meditation session.', items: ['session started', 'time practised', 'completion status', 'guidance type'] },
      saved: { icon: 'bookmark', title: 'Saved content and preferences', body: 'Favourite audio, listening progress, book pages, and certain preferences may be remembered so you can easily return later.' },
      local: { icon: 'user', title: 'No account required', body: 'You can use the app without creating an account. Usage data is currently stored directly in your browser or on your device and is not synced to a cloud account.' },
      external: { icon: 'globe', title: 'External services', body: 'Some sources and links may open YouTube or external websites. When you leave the app, the privacy policy of that service may apply.', items: ['YouTube when you open a source link', 'external websites you choose to visit'] },
    },
    promise: { title: 'We do not', items: ['sell personal data', 'use meditation data for personalised advertising', 'share personal data with advertisers', 'ask for information that is not necessary'] },
    choices: { title: 'Your data', body: 'You can:', items: ['remove favourite content in the app', 'change your preferences', 'clear local data through your browser or device data settings', 'contact us about privacy'], action: 'Contact us about privacy' },
    contact: { title: 'Questions about privacy?', body: 'If you have questions about your data or privacy, or would like help updating or deleting data, please contact us.', action: 'Contact us' },
    fullPolicy: 'View full Privacy Policy',
    freeTitle: 'Con Đường Xưa is a free project.', freeBody: 'We believe privacy should be simple, clear, and respectful of users.',
  },
}

export const privacyText = (lang = 'vi') => PRIVACY_TRANSLATIONS[lang] || PRIVACY_TRANSLATIONS.vi

