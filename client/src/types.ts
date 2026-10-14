export type PlayerRole = 'TECNICO' | 'INGENIERO';

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
  role?: PlayerRole;
  stats: PlayerStats;
}

export type GamePhase = 'LOBBY' | 'ROUND_1' | 'ROUND_2' | 'ROUND_3' | 'SUMMARY';

export type ActionType = 'BUTTON' | 'VALVE' | 'SLIDER' | 'PUMP';

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

export interface Round2State {
  coreColor: 'ROJO' | 'AMBAR' | 'VERDE';
  pressure: number;
  currentSwitches: {
    alfa: boolean;
    beta: boolean;
    gamma: boolean;
    delta: boolean;
  };
  manualRules: string[];
  requiredSwitches: {
    alfa: boolean;
    beta: boolean;
    gamma: boolean;
    delta: boolean;
  };
  matchedRuleText: string;
  startTime: number;
}

export interface TriviaOption {
  id: string;
  text: string;
  isCorrect: boolean;
  assignedPlayerId: string;
}

export interface Round3Question {
  questionNumber: number;
  prompt: string;
  options: TriviaOption[];
  startTime: number;
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
  totalScore: number;
  roundStartTime: number;
  round1?: Round1Step;
  round2?: Round2State;
  round3?: Round3Question;
  summary?: GameSummary;
  botRadioMessage?: string;
}
