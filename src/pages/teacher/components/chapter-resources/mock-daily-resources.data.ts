export interface UploadedMediaItem {
  id: string;
  name: string;
  type: 'presentation' | 'pdf' | 'image' | 'audio' | 'document';
  size: string;
  url?: string;
}

export interface QuestionItem {
  id: string;
  questionText: string;
  type: 'mcq' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  marks: number;
}

export interface AiQuestionPaper {
  id: string;
  dailyLogId: string;
  title: string;
  topic: string;
  date: string;
  totalMarks: number;
  durationMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Challenging';
  questions: QuestionItem[];
  generatedAt: string;
}

export interface NoteSection {
  heading: string;
  content: string;
}

export interface AiGeneratedNote {
  id: string;
  dailyLogId: string;
  title: string;
  topic: string;
  date: string;
  readingTime: string;
  keyTakeaways: string[];
  sections: NoteSection[];
  formulasOrDefinitions?: string[];
  generatedAt: string;
}

export interface DailyTeachingLog {
  id: string;
  chapterId: string;
  date: string; // ISO date string YYYY-MM-DD
  formattedDate: string;
  period: string;
  topic: string;
  conceptsCovered: string[];
  teacherNotes?: string;
  materials: UploadedMediaItem[];
  aiStatus: 'pending' | 'generating' | 'completed';
  generatedNoteId?: string;
  generatedQuizId?: string;
  createdAt: string;
}

export const INITIAL_MOCK_DAILY_LOGS: DailyTeachingLog[] = [
  {
    id: 'log-1',
    chapterId: '0be4d741-83c8-460d-b1e7-5516b0a6d503',
    date: '2026-10-15',
    formattedDate: 'Today, Oct 15',
    period: 'Period 3 (10:30 AM - 11:15 AM)',
    topic: "Newton's Second Law & Friction Analysis",
    conceptsCovered: [
      'F = ma Derivation',
      'Static vs Kinetic Friction',
      'Free Body Diagrams',
      'Normal Reaction Force',
    ],
    teacherNotes:
      'Covered numerical problem 4.2 from textbook. Emphasized that static friction is self-adjusting up to its maximum value (limiting friction). Gave homework questions 3 to 7 on page 84.',
    materials: [
      {
        id: 'mat-1',
        name: 'Lesson_Slides_Friction_Forces.pptx',
        type: 'presentation',
        size: '4.8 MB',
      },
      {
        id: 'mat-2',
        name: 'Blackboard_Derivation_Photo_Oct15.jpg',
        type: 'image',
        size: '2.1 MB',
      },
      {
        id: 'mat-3',
        name: 'Friction_Formulas_QuickSheet.pdf',
        type: 'pdf',
        size: '850 KB',
      },
    ],
    aiStatus: 'completed',
    generatedNoteId: 'note-1',
    generatedQuizId: 'quiz-1',
    createdAt: '2026-10-15T11:20:00.000Z',
  },
  {
    id: 'log-2',
    chapterId: '0be4d741-83c8-460d-b1e7-5516b0a6d503',
    date: '2026-10-14',
    formattedDate: 'Yesterday, Oct 14',
    period: 'Period 2 (09:40 AM - 10:25 AM)',
    topic: 'Introduction to Forces & Momentum (Newton\'s 1st Law)',
    conceptsCovered: [
      'Inertia of Rest & Motion',
      'Linear Momentum p = mv',
      'Frames of Reference',
    ],
    teacherNotes:
      'Demonstrated inertia using coin-and-card trick. Discussed why passengers lean forward when a bus applies sudden brakes.',
    materials: [
      {
        id: 'mat-4',
        name: 'Lecture_Intro_Forces_Momentum.pdf',
        type: 'pdf',
        size: '3.4 MB',
      },
      {
        id: 'mat-5',
        name: 'Teacher_Audio_Summary_10min.mp3',
        type: 'audio',
        size: '7.2 MB',
      },
    ],
    aiStatus: 'completed',
    generatedNoteId: 'note-2',
    generatedQuizId: 'quiz-2',
    createdAt: '2026-10-14T10:35:00.000Z',
  },
  {
    id: 'log-3',
    chapterId: '0be4d741-83c8-460d-b1e7-5516b0a6d503',
    date: '2026-10-13',
    formattedDate: 'Monday, Oct 13',
    period: 'Period 5 (01:15 PM - 02:00 PM)',
    topic: 'Curvilinear Motion & Centripetal Acceleration',
    conceptsCovered: [
      'Centripetal Force mv²/r',
      'Banking of Roads',
      'Bending of a Cyclist',
    ],
    teacherNotes:
      'Blackboard diagrams drawn for angle of banking without friction theta = tan⁻¹(v²/rg). Need to revise maximum safe velocity with friction in next tutorial.',
    materials: [
      {
        id: 'mat-6',
        name: 'Whiteboard_Banking_Of_Roads.png',
        type: 'image',
        size: '1.9 MB',
      },
    ],
    aiStatus: 'pending',
    createdAt: '2026-10-13T14:10:00.000Z',
  },
];

export const INITIAL_MOCK_NOTES: AiGeneratedNote[] = [
  {
    id: 'note-1',
    dailyLogId: 'log-1',
    title: "Comprehensive Revision: Newton's 2nd Law & Friction",
    topic: "Newton's 2nd Law, Normal Force & Friction Dynamics",
    date: 'Oct 15, 2026',
    readingTime: '6 min read',
    keyTakeaways: [
      'Net external force is directly proportional to the rate of change of momentum (dp/dt).',
      'Limiting friction fs(max) = μs * N is independent of apparent contact area.',
      'Kinetic friction fk = μk * N is usually less than limiting static friction (μk < μs).',
      'Free body diagrams must isolate the body and explicitly display contact & non-contact forces.',
    ],
    formulasOrDefinitions: [
      'F_net = m · a (for constant mass systems)',
      'f_s ≤ μ_s · N (Static friction threshold)',
      'f_k = μ_k · N (Kinetic friction during motion)',
      'Angle of Repose: tan(θ) = μ_s',
    ],
    sections: [
      {
        heading: "1. Newton's Second Law & Momentum Formulation",
        content:
          "The rate of change of momentum of a body is directly proportional to the applied unbalanced force and occurs in the direction of the force. Expressed as F = dp/dt = d(mv)/dt. When mass 'm' remains constant, this simplifies to F = m(dv/dt) = m·a.",
      },
      {
        heading: '2. Microscopic Origin of Friction',
        content:
          'Friction arises due to atomic roughness and cold welds forming at actual microscopic contact points between two surfaces. Even highly polished surfaces possess microscopic peaks and valleys.',
      },
      {
        heading: '3. Static vs Kinetic Friction Dynamics',
        content:
          'Static friction is self-adjusting. If an applied lateral force P is 5 N and the body does not move, static friction is exactly 5 N. It increases until it reaches the limiting friction value fs(max). Once sliding begins, the cold welds break continuously, resulting in kinetic friction which remains roughly constant at fk = μk · N.',
      },
      {
        heading: '4. Step-by-Step Free Body Diagram (FBD) Protocol',
        content:
          'Identify all acting forces: Gravitational force (W = mg downwards), Normal reaction (N perpendicular to surface), Applied force (F along vector), and Opposing friction (directed opposite to impending or actual relative motion).',
      },
    ],
    generatedAt: '2026-10-15T11:22:15.000Z',
  },
  {
    id: 'note-2',
    dailyLogId: 'log-2',
    title: 'Study Guide: Inertia, Momentum & Newton\'s First Law',
    topic: 'Forces, Momentum and Law of Inertia',
    date: 'Oct 14, 2026',
    readingTime: '5 min read',
    keyTakeaways: [
      'Inertia is the inherent resistance of an object to changes in its state of motion or rest.',
      'Mass is the quantitative measure of an object\'s inertia.',
      'Linear momentum (p = mv) is a vector quantity pointing in the velocity vector direction.',
    ],
    formulasOrDefinitions: [
      'p = m · v (Units: kg·m/s)',
      'Δp = F_avg · Δt (Impulse-momentum theorem)',
    ],
    sections: [
      {
        heading: '1. The Concept of Inertia',
        content:
          "Every object continues in its state of rest or uniform motion in a straight line unless acted upon by a net non-zero external force. Galilean thought experiments on dual inclined planes laid the groundwork for this principle.",
      },
      {
        heading: '2. Practical Everyday Manifestations',
        content:
          'When an automobile rounds a curve or accelerates suddenly, passengers experience apparent forces due to their own body\'s inertia resisting change in motion.',
      },
    ],
    generatedAt: '2026-10-14T10:37:40.000Z',
  },
];

export const INITIAL_MOCK_QUIZZES: AiQuestionPaper[] = [
  {
    id: 'quiz-1',
    dailyLogId: 'log-1',
    title: 'Daily Practice Quiz: Newton\'s 2nd Law & Friction',
    topic: 'Friction, Normal Force & Force Acceleration Equations',
    date: 'Oct 15, 2026',
    totalMarks: 20,
    durationMinutes: 15,
    difficulty: 'Medium',
    generatedAt: '2026-10-15T11:23:05.000Z',
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        questionText:
          'A block of mass 5 kg rests on a rough horizontal floor with static friction coefficient μs = 0.4. A horizontal pulling force of 10 N is applied. (Assume g = 10 m/s²). What is the frictional force exerted by the floor on the block?',
        options: [
          'A) 20 N',
          'B) 10 N',
          'C) 0 N',
          'D) 50 N',
        ],
        correctAnswer: 'B) 10 N',
        explanation:
          'Max static friction fs(max) = μs * N = 0.4 * (5 * 10) = 20 N. Since the applied force (10 N) is less than the limiting friction (20 N), the block does not slide. Static friction self-adjusts to match the applied force, so f_s = 10 N.',
        marks: 2,
      },
      {
        id: 'q2',
        type: 'mcq',
        questionText:
          'Why is the coefficient of kinetic friction (μk) generally smaller than the coefficient of static friction (μs)?',
        options: [
          'A) Normal reaction decreases once motion begins',
          'B) Microscopic contact points do not get adequate time to form deep atomic bonds during sliding',
          'C) The mass of the body decreases during velocity increases',
          'D) Gravity acts at an inclined angle during motion',
        ],
        correctAnswer:
          'B) Microscopic contact points do not get adequate time to form deep atomic bonds during sliding',
        explanation:
          'Once sliding starts, the asperities (microscopic peaks) skip over each other without having enough time to form interlocking cold-welds.',
        marks: 2,
      },
      {
        id: 'q3',
        type: 'mcq',
        questionText:
          'If a body of mass 2 kg moves with constant velocity 4 m/s on a rough floor under an external force of 8 N, what is the kinetic friction force?',
        options: ['A) 0 N', 'B) 4 N', 'C) 8 N', 'D) 16 N'],
        correctAnswer: 'C) 8 N',
        explanation:
          'Constant velocity means acceleration a = 0. By Newton\'s 2nd Law, F_net = F_ext - f_k = m*a = 0. Hence, f_k = F_ext = 8 N.',
        marks: 2,
      },
      {
        id: 'q4',
        type: 'short_answer',
        questionText:
          'State the relationship between angle of friction (λ) and coefficient of static friction (μs).',
        correctAnswer: 'tan(λ) = μ_s',
        explanation:
          'The angle of friction λ is the angle which the resultant of limiting friction and normal reaction makes with the normal reaction. Therefore tan(λ) = f_s(max)/N = μ_s.',
        marks: 4,
      },
      {
        id: 'q5',
        type: 'short_answer',
        questionText:
          'Draw or describe the Free Body Diagram (FBD) of a lawnmower being pushed at an angle θ to the horizontal. Why is pulling easier than pushing?',
        correctAnswer:
          'When pushing, the vertical component of pushing force (F sin θ) adds to mg, increasing the normal force N = mg + F sin θ, which increases friction. When pulling, F sin θ opposes mg, reducing normal force N = mg - F sin θ.',
        explanation:
          'Normal force dictates limiting friction (f = μN). Since pushing increases N and pulling reduces N, pulling requires less horizontal effort.',
        marks: 10,
      },
    ],
  },
  {
    id: 'quiz-2',
    dailyLogId: 'log-2',
    title: 'Concept Check: Inertia & Momentum',
    topic: 'Momentum, Inertia Types and First Law Applications',
    date: 'Oct 14, 2026',
    totalMarks: 15,
    durationMinutes: 10,
    difficulty: 'Easy',
    generatedAt: '2026-10-14T10:38:10.000Z',
    questions: [
      {
        id: 'q2-1',
        type: 'mcq',
        questionText:
          'An athlete runs some distance before taking a long jump. This is an application of:',
        options: [
          'A) Inertia of direction',
          'B) Inertia of motion',
          'C) Inertia of rest',
          'D) Conservation of charge',
        ],
        correctAnswer: 'B) Inertia of motion',
        explanation:
          'Running gives momentum to the body. Due to inertia of motion, the body continues moving forward while in the air, allowing a longer jump.',
        marks: 3,
      },
      {
        id: 'q2-2',
        type: 'short_answer',
        questionText:
          'A cricket ball of mass 150g is caught by a player who pulls their hands backwards. Why does pulling hands back decrease injury risk?',
        correctAnswer:
          'Pulling hands back increases the impact duration (Δt). According to Impulse F = Δp / Δt, a larger Δt reduces the peak impact force on the hands.',
        explanation:
          'By increasing stopping time from, say, 0.05s to 0.2s, the impulsive force is reduced by a factor of 4.',
        marks: 6,
      },
      {
        id: 'q2-3',
        type: 'mcq',
        questionText: 'Which physical quantity has the SI unit kg·m/s?',
        options: ['A) Force', 'B) Energy', 'C) Linear Momentum', 'D) Power'],
        correctAnswer: 'C) Linear Momentum',
        explanation: 'Momentum p = mass (kg) × velocity (m/s).',
        marks: 6,
      },
    ],
  },
];
