// ─────────────────────────────────────────────────────────────
// All app content lives here. Swap these arrays for API calls
// when you have a backend. Image paths point at /public/images.
// If a file is missing the <Img> component draws a placeholder,
// so the app runs fine before you add any photography.
// ─────────────────────────────────────────────────────────────

export const TEACHERS = [
  { id:'jayasaro', name:'Ajahn Jayasaro', lineage:'chah', years:'1958–',
    img:'/images/teachers/Ajahn Jayasaro.jpg', talks:62, meditations:12,
    bio:'An English disciple of Ajahn Chah and former abbot of Wat Pah Nanachat. He now lives in a hermitage near Pak Chong and writes widely in Thai and English.' },
  { id:'brahm', name:'Ajahn Brahm', lineage:'chah', years:'1951–',
    img:'/images/teachers/ajahn-brahm.jpeg', talks:58, meditations:8,
    bio:'Ajahn Brahm, tên tục là Peter Betts, sinh ngày 7 tháng 8 năm 1951 tại Luân Đôn, Anh Quốc. Từ năm 16 tuổi, ngài đã tự xem mình là Phật tử sau khi lần đầu đọc một cuốn sách về Phật giáo. Trong thời gian học Vật lý Lý thuyết tại Đại học Cambridge, ngài ngày càng quan tâm đến giáo pháp của Đức Phật và thiền định. Sau khi tốt nghiệp và dạy học một năm, ngài sang Thái Lan xuất gia. Năm 23 tuổi, ngài thọ cụ túc giới với pháp danh Brahmavamso tại Wat Saket. Trong chín năm tiếp theo, ngài tu học theo truyền thống rừng dưới sự hướng dẫn của Đại lão Thiền sư Ajahn Chah. Năm 1983, Ajahn Brahm được mời đến Perth, Tây Úc để thành lập một tu viện rừng. Ngài là Viện trưởng Tu viện Bodhinyana và Giám đốc Tâm linh của Hội Phật giáo Tây Úc. Những lời giảng gần gũi và hướng dẫn thiền của ngài đã mang lại lợi ích cho nhiều người trên khắp thế giới.' },
  { id:'sumedho', name:'Ajahn Sumedho', lineage:'chah', years:'1934–',
    img:'/images/teachers/Ajahn-Sumedho.jpg', talks:74, meditations:10,
    bio:'The first Western disciple of Ajahn Chah to establish the forest tradition outside Thailand, founding Cittaviveka and Amaravati in England.' },
  { id:'chah', name:'Ajahn Chah', lineage:'chah', years:'1918–1992',
    img:'/images/teachers/Ajahn Chah.jpg', talks:95, meditations:6,
    bio:'Founder of Wat Nong Pah Pong and Wat Pah Nanachat. Taught through ordinary images drawn from village life rather than technical vocabulary.' },
  { id:'pasanno', name:'Ajahn Pasanno', lineage:'chah', years:'1949–',
    img:'/images/teachers/AjahnPasanno.jpg', talks:41, meditations:7,
    bio:'Co-founder of Abhayagiri Monastery in California and former abbot of Wat Pah Nanachat.' },
  { id:'mun', name:'Ajahn Mun Bhūridatta', lineage:'forest', years:'1870–1949',
    img:'/images/teachers/AjahnMun.jpg', talks:12, meditations:0,
    bio:'The teacher who revived the forest tradition across northeast Thailand. Nearly every Thai forest teacher today traces their lineage to him.' },
  { id:'thanissaro', name:'Ṭhānissaro Bhikkhu', lineage:'forest', years:'1949–',
    img:'/images/teachers/thanissaro-bhikkhu.jpeg', talks:88, meditations:14,
    bio:'Abbot of Metta Forest Monastery in California and a prolific translator of the Pāli Canon.' },
]

export const LINEAGES = [
  { id:'all', label:'All' },
  { id:'chah', label:'Ajahn Chah Lineage' },
  { id:'forest', label:'Thai Forest' },
  { id:'other', label:'Other' },
]

export const TALKS = [
  { id:'t1', title:'The Natural Mind', teacher:'chah', minutes:42, seconds:2538,
    img:'/images/covers/natural-mind.jpg', kind:'talk', topics:['Wisdom','Meditation'],
    licence:'free',
    source:'Abhayagiri Monastery',
    about:'Ajahn Chah points to the mind that is already still underneath our reactions, and how practice is a matter of not disturbing it rather than building something new.' },
  { id:'t2', title:'Understanding Attachment', teacher:'jayasaro', minutes:28, seconds:1680,
    img:'/images/covers/attachment.jpg', kind:'talk', topics:['Attachment','Daily Life'],
    licence:'free', source:'Panyaprateep Foundation',
    about:'What clinging actually is in experience, as distinct from caring about something, and how the difference shows up in ordinary situations.' },
  { id:'t3', title:'Living With Uncertainty', teacher:'sumedho', minutes:36, seconds:2160,
    img:'/images/covers/uncertainty.jpg', kind:'talk', topics:['Wisdom','Daily Life'],
    licence:'free', source:'Amaravati Buddhist Monastery',
    about:'On not-knowing as a place to rest rather than a problem to solve.' },
  { id:'t4', title:'Peace Comes From Within', teacher:'brahm', minutes:32, seconds:1920,
    img:'/images/covers/peace.jpg', kind:'talk', topics:['Meditation','Mindfulness'],
    licence:'free', source:'Buddhist Society of Western Australia',
    about:'A practical talk on letting the mind settle without forcing it.' },
  { id:'t5', title:'Understanding the Middle Way', teacher:'jayasaro', minutes:42, seconds:2520,
    img:'/images/scenes/monk.jpg', kind:'video', topics:['Middle Way','Wisdom','Meditation','Attachment'],
    licence:'link', source:'YouTube',
    about:'In this talk Ajahn Jayasaro explains the Middle Way as taught by the Buddha and how it applies to our daily life.' },
  { id:'t6', title:'Letting Go', teacher:'chah', minutes:11, seconds:660,
    img:'/images/covers/letting-go.jpg', kind:'talk', topics:['Attachment'],
    licence:'free', source:'Abhayagiri Monastery',
    about:'A short reflection on release as the whole of the practice.' },
]

export const TOPICS = ['Meditation','Letting Go','Anger','Mindfulness','Kamma','Relationships','Daily Life','Wisdom','Nibbāna']

export const QUICK = [8, 15, 30, 45, 60, 120]

export const DAILY_PRACTICE = [
  { n:1, title:'Arrive', sub:'1 min', action:'Start', kind:'meditate', minutes:1 },
  { n:2, title:'Breathing Meditation', sub:'10 min', action:'Start', kind:'meditate', minutes:10 },
  { n:3, title:'Dhamma Talk', sub:'Ajahn Chah · Con đường giữa bên trong', action:'Listen', kind:'talk', talkId:'ajahn-chah-chuong-1' },
  { n:4, title:'Quiet Reflection', sub:'3 min', action:'Begin', kind:'meditate', minutes:3 },
]

export const SEVEN_DAYS = [
  { d:1, t:'Why meditate?' }, { d:2, t:'The breath' }, { d:3, t:'Working with thoughts' },
  { d:4, t:'Restlessness' }, { d:5, t:'Difficult emotions' }, { d:6, t:'Impermanence' },
  { d:7, t:'Continuing your practice' },
]

export const LIBRARY_TABS = ['All','Talks','Videos','Articles','Suttas','Books']

export const LIBRARY_SHELVES = [
  { id:'bookmarks', label:'Bookmarks', sub:'24 items', icon:'bookmark' },
  { id:'downloads', label:'Downloads', sub:'12 items', icon:'download' },
  { id:'playlists', label:'Playlists', sub:'8 playlists', icon:'list' },
  { id:'notes', label:'Notes', sub:'15 notes', icon:'note' },
  { id:'history', label:'History', sub:'Continue where you left off', icon:'clock' },
]

export const teacherById = id => TEACHERS.find(t => t.id === id)
export const talkById = id => TALKS.find(t => t.id === id)
