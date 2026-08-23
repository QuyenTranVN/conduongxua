export type AudioCategory = 'dhamma' | 'sutta' | 'meditation' | 'chanting' | 'audiobook'
export type AudioLanguage = 'vi' | 'pali' | 'en'

export interface AudioItem {
  id: string
  slug: string
  title: string
  subtitle?: string
  teacherId?: string
  teacher?: string
  category: AudioCategory
  language: AudioLanguage
  duration?: number
  description?: string
  image?: string
  audioPath: string
  canonReference?: string
  collection?: string
  featured?: boolean
  source: { name: string; pageUrl: string; originalAudioUrl?: string }
  attribution: string
  permission?: { status: 'approved'; note?: string }
  publishedAt?: string
}

const AJAHN_CHAH_SOURCE = { name: 'Bộ sưu tập pháp thoại Ajahn Chah', pageUrl: 'TO_BE_ADDED' }
const AJAHN_BRAHM_SOURCE = { name: 'Bộ hướng dẫn thiền Ajahn Brahm', pageUrl: 'TO_BE_ADDED' }
const MEDITATION_SOURCE = { name: 'Thiền Dưỡng Sinh DASIRA NARADA', pageUrl: 'https://www.youtube.com/@thienduongsinhdasiranarada' }
const dhammaPath = (file: string) => encodeURI(`Listen/Thien Su Ajahn Chah/Dharma talk/${file}`)
const meditationPath = (file: string) => encodeURI(`Meditation/${file}`)
const brahmPath = (file: string) => encodeURI(`Meditation/Huong Dan Thien Dinh/Ajahn Brahm/${file}`)
const attributionPending = 'Nguồn và thông tin bản quyền đang được bổ sung.'

const AJAHN_BRAHM_MEDITATIONS = [
  ['1', 'Hướng dẫn thiền định', 'Phan 1 HUONG-DAN-THIEN-DINH-Thien-su-Ajahn-Brah.mp3', 2018.116],
  ['2', 'Im lặng nội tâm, bước vào trạng thái nhập định', 'Phan 2 IM-LANG-NOI-TAM-BUOC-VAO-TRANG-THAI-NHAP.mp3', 1794.168],
  ['3', 'Hướng dẫn về thiền định và thiền quán', 'Phan 3 Huong-Dan-ve-Thien-Dinh-va-Thien-Quan-Thien.mp3', 3964.16],
  ['4', 'Những yếu tố tâm linh đưa đến thành công', 'Phan 4 NHUNG-YEU-TO-TAM-LINH-DUA-DEN-THANH-CONG.mp3', 4688.588],
  ['5', 'Hơi thở tuyệt đẹp và kinh nghiệm nhập định', 'Phan 5 HOI-THO-TUYET-DEP-VA-KINH-NGHIEM-NHAP-DInh.mp3', 4036.885],
  ['6', 'Bốn trọng tâm của Tứ niệm xứ', 'Phan 6 BON-TRONG-TAM-CUA-TU-NIEM-XU-Thien-su-Aj.mp3', 4076.251],
  ['7', 'Nhập sơ thiền, nhị thiền', 'Phan 7 NHAP-SO-THIEN-NHI-THIEN-THIEN-SU-AJAHN-B.mp3', 4410.462],
  ['8', 'Bản chất của tuệ giác, tuệ giác giải thoát', 'Phan 8 BAN-CHAT-CUA-TUE-GIAC-TUE-GIAC-GIAI-THOA.mp3', 5591.562],
] as const

export const AUDIO_ITEMS = [
  {
    id: 'ajahn-chah-chuong-1', slug: 'ajahn-chah-con-duong-giua-ben-trong', title: 'Chương 1 · Con đường giữa bên trong, tức Trung đạo',
    teacherId: 'chah', teacher: 'Thiền sư Ajahn Chah', category: 'dhamma', language: 'vi', duration: 1793.776,
    image: '/images/scenes/forest.jpg', featured: true, audioPath: dhammaPath('Chuong-1-Con-Duong-Giua-Ben-Trong-tuc-Trung-Dao.mp3'),
    collection: 'Pháp thoại Ajahn Chah', source: AJAHN_CHAH_SOURCE, attribution: attributionPending,
  },
  {
    id: 'ajahn-chah-chuong-2', slug: 'ajahn-chah-binh-an-vuot-qua-hanh-phuc', title: 'Chương 2 · Bình an vượt qua cả hạnh phúc',
    teacherId: 'chah', teacher: 'Thiền sư Ajahn Chah', category: 'dhamma', language: 'vi', duration: 2226.495,
    image: '/images/scenes/stillness.jpg', audioPath: dhammaPath('Chuong-2-BINH-AN-VUOT-QUA-CA-HANH-PHUC.mp3'),
    collection: 'Pháp thoại Ajahn Chah', source: AJAHN_CHAH_SOURCE, attribution: attributionPending,
  },
  {
    id: 'ajahn-chah-chuong-3', slug: 'ajahn-chah-quy-uoc-va-su-giai-thoat', title: 'Chương 3 · Quy ước và sự giải thoát',
    teacherId: 'chah', teacher: 'Thiền sư Ajahn Chah', category: 'dhamma', language: 'vi', duration: 1224.046,
    image: '/images/scenes/monk.jpg', audioPath: dhammaPath('Chuong-3-QUI-UOC-VA-SU-GIAI-THOAT-Thien-su-Ajahn-Chah.mp3'),
    collection: 'Pháp thoại Ajahn Chah', source: AJAHN_CHAH_SOURCE, attribution: attributionPending,
  },
  {
    id: 'ajahn-chah-chuong-4', slug: 'ajahn-chah-khong-co-cho-dua', title: 'Chương 4 · Không có chỗ dựa',
    teacherId: 'chah', teacher: 'Thiền sư Ajahn Chah', category: 'dhamma', language: 'vi', duration: 1264.248,
    image: '/images/scenes/tree.jpg', audioPath: dhammaPath('CHUONG-4-KHONG-CO-CHO-DUA-Thien-su-Ajahn_Chah.mp3'),
    collection: 'Pháp thoại Ajahn Chah', source: AJAHN_CHAH_SOURCE, attribution: attributionPending,
  },
  {
    id: 'ajahn-chah-chuong-5', slug: 'ajahn-chah-thoi-thien-buoi-toi', title: 'Chương 5 · Thời thiền buổi tối',
    teacherId: 'chah', teacher: 'Thiền sư Ajahn Chah', category: 'dhamma', language: 'vi', duration: 2054.531,
    image: '/images/scenes/practice.jpg', audioPath: dhammaPath('Chuong-5-Thoi-Thien-Buoi-Toi-Thien-su-Aj.mp3'),
    collection: 'Pháp thoại Ajahn Chah', source: AJAHN_CHAH_SOURCE, attribution: attributionPending,
  },
  {
    id: 'ajahn-chah-chuong-6-7', slug: 'ajahn-chah-quan-than-tren-than', title: 'Chương 6 · Quán thân trên thân',
    teacherId: 'chah', teacher: 'Thiền sư Ajahn Chah', category: 'dhamma', language: 'vi', duration: 4177.554,
    image: '/images/scenes/session.jpg', audioPath: dhammaPath('Chuong-6-Quan-Than-Tren-Than-Thien-su-.mp3'),
    collection: 'Pháp thoại Ajahn Chah', source: AJAHN_CHAH_SOURCE, attribution: attributionPending,
  },
  {
    id: 'ajahn-chah-chuong-7', slug: 'ajahn-chah-day-la-dieu-chung-ta-co-the-lam', title: 'Chương 7 · Đây là điều chúng ta có thể làm',
    teacherId: 'chah', teacher: 'Thiền sư Ajahn Chah', category: 'dhamma', language: 'vi', duration: 3533.244,
    image: '/images/scenes/forest.jpg', audioPath: dhammaPath('CHUONG-7-DAY-LA-DIEU-CHUNG-TA-CO-THE-LAM.mp3'),
    collection: 'Pháp thoại Ajahn Chah', source: AJAHN_CHAH_SOURCE, attribution: attributionPending,
  },
  ...AJAHN_BRAHM_MEDITATIONS.map(([part, title, file, duration]) => ({
    id: `ajahn-brahm-thien-dinh-${part}`, slug: `ajahn-brahm-thien-dinh-phan-${part}`,
    title: `Phần ${part} · ${title}`, teacherId: 'brahm', teacher: 'Thiền sư Ajahn Brahm',
    category: 'meditation' as const, language: 'vi' as const, duration, image: '/images/teachers/brahm.jpg',
    audioPath: brahmPath(file), collection: 'Hướng dẫn thiền định · Ajahn Brahm',
    source: AJAHN_BRAHM_SOURCE, attribution: attributionPending,
  })),
  ...[
    ['8', '8 phut HUONG-DAN-THIEN-CAN-BAN.mp3', 480],
    ['15', '15-phut-Thien-Buong-Thu-danh-cho-nguoi.mp3', 900],
    ['30', '30 PHÚT THIỀN ĐỊNH.mp3', 1800],
    ['60', 'web-thien-dinh-60.m4a', 3600],
    ['90', '90-PHUT-HUONG-DAN-THIEN-DINH-CHANH-NIEM.mp3', 5400],
    ['120', '120-PHUT-THIEN-DINH-CHANH-NIEM-CAN-BAN.mp3', 7200],
  ].map(([minutes, file, duration]) => ({
    id: `listen-meditation-${minutes}`, slug: `huong-dan-thien-dinh-chanh-niem-${minutes}-phut`,
    title: `Thiền định ${minutes} phút`, teacher: 'Thiền Dưỡng Sinh DASIRA NARADA',
    category: 'meditation' as const, language: 'vi' as const, duration: Number(duration), image: '/images/scenes/session.jpg',
    audioPath: meditationPath(String(file)), collection: 'Thiền định chánh niệm', source: MEDITATION_SOURCE,
    attribution: 'Âm thanh được chia sẻ với sự cho phép của Thiền Dưỡng Sinh DASIRA NARADA.',
    permission: { status: 'approved' as const },
  })),
] satisfies AudioItem[]
