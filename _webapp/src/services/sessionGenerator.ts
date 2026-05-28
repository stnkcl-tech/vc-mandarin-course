import type { SessionConfig, Question, ReadingQuestion, WritingCharacterQuestion, WritingEssayQuestion, SpeakingQuestion } from '../types';

export function generateQuestions(config: SessionConfig): Question[] {
  const questions: Question[] = [];
  let idCounter = 1;
  const makeId = () => `q_${idCounter++}`;

  // Speaking questions
  if (config.includeSpeaking) {
    const speakingQs: SpeakingQuestion[] = [
      {
        id: makeId(),
        type: 'speaking',
        section: 'Speaking',
        prompt: 'Introduce your family. Mention at least 3 family members, their relationship to you, and one fact about each person. Use the grammar point: 的 (possessive).',
        maxDuration: 120,
        tips: [
          'Speak clearly and at natural pace',
          'Use 的 after pronouns: 我的妈妈, 他的工作',
          'Minimum target: 4–5 sentences',
        ],
      },
      {
        id: makeId(),
        type: 'speaking',
        section: 'Speaking',
        prompt: 'Describe your daily routine from morning to evening. Include at least 5 different activities with specific times.',
        maxDuration: 120,
        tips: [
          'Use time expressions: 早上, 中午, 晚上',
          'Connect activities with 然后, 以后',
        ],
      },
    ];
    questions.push(...speakingQs);
  }

  // Reading questions
  if (config.includeReadingComprehension) {
    const readingQs: ReadingQuestion[] = [
      {
        id: makeId(),
        type: 'reading',
        section: 'Reading Comprehension',
        prompt: 'What does Li Ming do at 12 PM?',
        passage: '我叫李明。我是大学生。每天早上七点起床，然后洗澡、吃早饭。八点我去上课。中午十二点我和朋友一起吃饭。下午我常常去图书馆。晚上我看书或者看电影。十一点睡觉。',
        passagePinyin: 'Wǒ jiào Lǐ Míng. Wǒ shì dàxuéshēng. Měitiān zǎoshang qī diǎn qǐchuáng, ránhòu xǐzǎo, chī zǎofàn. Bā diǎn wǒ qù shàngkè. Zhōngwǔ shí\'èr diǎn wǒ hé péngyǒu yìqǐ chīfàn. Xiàwǔ wǒ chángcháng qù túshūguǎn. Wǎnshang wǒ kànshū huòzhě kàn diànyǐng. Shíyī diǎn shuìjiào.',
        options: [
          { id: 'a', text: 'He goes to class' },
          { id: 'b', text: 'He eats with friends' },
          { id: 'c', text: 'He goes to the library' },
          { id: 'd', text: 'He watches movies' },
        ],
        correctOptionId: 'b',
      },
      {
        id: makeId(),
        type: 'reading',
        section: 'Reading Comprehension',
        prompt: 'What is Wang Fang\'s profession?',
        passage: '王方是我的好朋友。她是医生，在医院工作。她每天很忙，但是很喜欢自己的工作。她的爱好是看书和旅行。',
        options: [
          { id: 'a', text: 'Teacher' },
          { id: 'b', text: 'Doctor' },
          { id: 'c', text: 'Student' },
          { id: 'd', text: 'Engineer' },
        ],
        correctOptionId: 'b',
      },
    ];
    questions.push(...readingQs);
  }

  // Character writing questions
  if (config.includeCharacterWriting) {
    const chars: WritingCharacterQuestion[] = [
      {
        id: makeId(),
        type: 'writing-character',
        section: 'Character Writing',
        prompt: 'Write this character from memory:',
        character: '家',
        pinyin: 'jiā',
        meaning: 'home / family',
        strokeCount: 10,
        etymology: '宀 (roof) + 豕 (pig) = traditional family home',
      },
      {
        id: makeId(),
        type: 'writing-character',
        section: 'Character Writing',
        prompt: 'Write this character from memory:',
        character: '我',
        pinyin: 'wǒ',
        meaning: 'I / me',
        strokeCount: 7,
      },
      {
        id: makeId(),
        type: 'writing-character',
        section: 'Character Writing',
        prompt: 'Write this character from memory:',
        character: '好',
        pinyin: 'hǎo',
        meaning: 'good',
        strokeCount: 6,
        etymology: '女 (woman) + 子 (child) = good/complete',
      },
    ];
    questions.push(...chars);
  }

  // Essay questions
  if (config.includeShortEssay) {
    const essay: WritingEssayQuestion = {
      id: makeId(),
      type: 'writing-essay',
      section: 'Essay Composition',
      prompt: 'Topic: Write about your best friend (150–200 characters)',
      topic: 'Write about your best friend',
      minChars: 150,
      maxChars: 200,
      requirements: [
        'Use at least 3 descriptive adjectives',
        'Use 比 (comparison) at least once',
        'Mention how you met and one activity you do together',
      ],
      template: '我的好朋友叫______。他/她______。我们______认识，因为______。他/她比我很______。我们常常一起______。我觉得他/她非常______。',
    };
    questions.push(essay);
  }

  return questions;
}
