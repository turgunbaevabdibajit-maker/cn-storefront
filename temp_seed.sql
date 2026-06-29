-- Seed products
insert into public.products (title, slug, description, short_description, price_cents, cover_image_url, category, level, sort_order) values
(
  'HSK 1-5 Complete Coursebook',
  'hsk-1-5-complete-coursebook',
  'A comprehensive collection of Chinese learning materials covering HSK levels 1 through 5. Includes grammar explanations, vocabulary lists, practice exercises, and audio files.',
  'Complete HSK 1-5 course with grammar, vocabulary, and exercises',
  4999,
  '/products/hsk-coursebook.jpg',
  'Coursebook',
  'Beginner - Intermediate',
  1
),
(
  'Business Chinese Bundle',
  'business-chinese-bundle',
  'Master professional Chinese for business contexts. Covers email writing, meetings, negotiations, presentations, and cultural etiquette.',
  'Professional Chinese for business communication and cultural etiquette',
  3999,
  '/products/business-chinese.jpg',
  'Business',
  'Intermediate - Advanced',
  2
),
(
  'Chinese Calligraphy Starter Kit',
  'chinese-calligraphy-starter-kit',
  'Learn the fundamentals of Chinese calligraphy with brush and ink. Includes stroke-order guides, character practice sheets (500+ characters), and technique videos.',
  'Digital kit with stroke guides, 500+ character sheets, and video tutorials',
  2999,
  '/products/calligraphy-kit.jpg',
  'Culture & Art',
  'Beginner',
  3
),
(
  'Mandarin Pronunciation Masterclass',
  'mandarin-pronunciation-masterclass',
  'Solve your accent problems once and for all. Detailed breakdown of every Chinese phoneme, tone pairs, neutral tones, and common pronunciation mistakes.',
  'Audio-driven course to perfect your Mandarin pronunciation and tones',
  1999,
  '/products/pronunciation.jpg',
  'Pronunciation',
  'Beginner',
  4
),
(
  'Chinese Idioms (Chengyu) Encyclopedia',
  'chinese-idioms-encyclopedia',
  'Explore 300 essential Chinese idioms (成语) with stories, usage examples, audio pronunciations, and English translations.',
  '300 essential Chinese idioms with stories, audio, and translations',
  3499,
  '/products/chengyu.jpg',
  'Vocabulary',
  'Intermediate - Advanced',
  5
),
(
  'Daily Conversation Flashcards',
  'daily-conversation-flashcards',
  '200 digital flashcards for everyday Chinese conversations. Organized by scenario with Chinese characters, pinyin, English translation, and audio.',
  '200 scenario-based flashcards for everyday conversations with audio',
  1499,
  '/products/flashcards.jpg',
  'Vocabulary',
  'Beginner',
  6
);
