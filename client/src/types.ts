export type PlayerRole = 
  | 'TECNICO_TOTAL' 
  | 'INGENIERO_TOTAL' 
  | 'TECNICO_CONSOLA_1' 
  | 'TECNICO_CONSOLA_2' 
  | 'INGENIERO_A' 
  | 'INGENIERO_B';

export interface PlayerStats {
  reactionTimes: number[];
  mistakes: number;
  actionsCompleted: number;
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isBot?: boolean;
  hasMic?: boolean;
  role?: PlayerRole;
  stats: PlayerStats;
}

export type GamePhase = 'LOBBY' | 'ROUND_1' | 'ROUND_2' | 'ROUND_3' | 'ROUND_4' | 'SUMMARY';

export type ActionType = 'BUTTON' | 'VALVE' | 'SLIDER' | 'PUMP' | 'SHOUT';

export type ConveyorDestinationId = 'LEFT_BIN' | 'PLAYER_0' | 'PLAYER_1' | 'PLAYER_2' | 'PLAYER_3' | 'RIGHT_BIN';

export interface ConveyorCategory {
  id: string;
  name: string;
  shortName: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  iconName: string;
}

export interface ConveyorItem {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  color: string;
  iconName: string;
  targetDestinationId: ConveyorDestinationId;
}

export interface ConveyorStation {
  id: ConveyorDestinationId;
  title: string;
  playerId?: string;
  playerName?: string;
  category: ConveyorCategory;
  isBin: boolean;
}

export interface Round4State {
  startTime: number;
  durationSeconds: number; // 30
  timeLeftSeconds: number;
  totalClassified: number;
  totalMistakes: number;
  playerQueues: Record<string, ConveyorItem[]>;
  stations: ConveyorStation[];
}

export interface Round1Step {
  stepNumber: number;
  senderId: string;
  senderName: string;
  executorId: string;
  executorName: string;
  targetAction: ActionType;
  actionTitle: string;
  actionInstruction: string;
  startTime: number;
}

export interface AZ5Console {
  id: 1 | 2;
  title: string;
  coreColor: 'ROJO' | 'AMBAR' | 'VERDE';
  pressure: number;
  currentSwitches: {
    alfa: boolean;
    beta: boolean;
    gamma: boolean;
    delta: boolean;
  };
  requiredSwitches: {
    alfa: boolean;
    beta: boolean;
    gamma: boolean;
    delta: boolean;
  };
  isStabilized: boolean;
}

export interface Round2State {
  coreColor: 'ROJO' | 'AMBAR' | 'VERDE';
  pressure: number;
  currentSwitches: {
    alfa: boolean;
    beta: boolean;
    gamma: boolean;
    delta: boolean;
  };
  manualFull: string[];
  manualPartA: string[];
  manualPartB: string[];
  requiredSwitches: {
    alfa: boolean;
    beta: boolean;
    gamma: boolean;
    delta: boolean;
  };
  startTime: number;
  dualConsoles?: {
    console1: AZ5Console;
    console2: AZ5Console;
  };
}

export type QuestionAnswerType = 
  | 'YEAR' 
  | 'PERSON' 
  | 'WORK' 
  | 'CITY' 
  | 'COUNTRY' 
  | 'SCIENCE' 
  | 'NUMBER' 
  | 'NATURE' 
  | 'COLOR';

export interface DistributedQuestion {
  id: string;
  type: QuestionAnswerType;
  prompt: string;
  correctAnswerText: string;
  assignedPlayerId: string;
  isSolved: boolean;
  solvedByPlayerName?: string;
}

export interface DistributedOption {
  id: string;
  text: string;
  isCorrect: boolean;
  targetQuestionId?: string;
  assignedPlayerId: string;
  isSolved: boolean;
}

export interface Round3State {
  startTime: number;
  totalQuestions: number;
  solvedCount: number;
  questions: DistributedQuestion[];
  options: DistributedOption[];
}

export interface AwardInfo {
  type: 'BOTTLENECK' | 'FASTEST' | 'NERVOUS' | 'HERO';
  title: string;
  icon: string;
  playerName: string;
  metric: string;
  description: string;
}

export interface GameSummary {
  totalScore: number;
  rankTitle: string;
  rankSubtitle: string;
  rankBadge: string;
  awards: AwardInfo[];
  playerStats: {
    id: string;
    name: string;
    avgReactionMs: number;
    actionsCompleted: number;
    mistakes: number;
  }[];
}

export interface RoomState {
  code: string;
  players: Player[];
  phase: GamePhase;
  currentStability: number;
  round1Scores: number;
  round2Scores: number;
  round3Scores: number;
  round4Scores: number;
  totalScore: number;
  roundStartTime: number;
  round1?: Round1Step;
  round2?: Round2State;
  round3?: Round3State;
  round4?: Round4State;
  summary?: GameSummary;
  botRadioMessage?: string;
}
