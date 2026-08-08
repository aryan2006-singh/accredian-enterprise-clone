export interface SegmentCard {
  title: string;
  tags: string[];
}

export const segmentation: SegmentCard[] = [
  { title: 'Program Specific', tags: ['Certificate', 'Executive', 'Postgraduate Certificate'] },
  { title: 'Industry Specific', tags: ['IT', 'Healthcare', 'Retail', 'Finance', 'Manufacturing'] },
  { title: 'Topic Specific', tags: ['Machine Learning', 'Design', 'Analytics', 'Cybersecurity', 'Cloud'] },
  { title: 'Level Specific', tags: ['Senior Leadership', 'Mid-Career', 'Early Career'] },
];
