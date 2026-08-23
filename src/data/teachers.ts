export interface AudioTeacher {
  id: string
  slug: string
  name: string
  image?: string
  tradition?: string
  lineage?: string
  monastery?: string
}

// Only known relationship metadata is included; unverified fields remain TODO.
export const AUDIO_TEACHERS: AudioTeacher[] = [
  { id: 'chah', slug: 'ajahn-chah', name: 'Ajahn Chah', tradition: 'Truyền thống rừng Thái Lan' },
  { id: 'jayasaro', slug: 'ajahn-jayasaro', name: 'Ajahn Jayasaro', image: '/images/teachers/jayasaro.jpg' },
  { id: 'brahm', slug: 'ajahn-brahm', name: 'Ajahn Brahm', image: '/images/teachers/brahm.jpg' },
]
