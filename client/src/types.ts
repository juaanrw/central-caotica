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
  role?: PlayerRole;
  teamId?: string;
  stats: PlayerStats;
}

export type GameMode = 'COOP' | 'COMPETITIVE';

export interface TeamInfo {
  id: string;
  name: string;
  color: string;
  playerIds: string[];
  playerNames: string[];
  round1Scores: number;
  round2Scores: number;
  round3Scores: number;
  round4Scores: number;
  round5Scores: number;
  totalScore: number;
  currentRoundCompleted: boolean;
  currentStability: number;
}

export type GamePhase = 
  | 'LOBBY' 
  | 'ROUND_INTRO'
  | 'ROUND_1' 
  | 'ROUND_2' 
  | 'ROUND_3' 
  | 'ROUND_4' 
  | 'ROUND_5' 
  | 'SUMMARY';

export type ActionType = 'BUTTON' | 'VALVE' | 'SLIDER' | 'PUMP';

export type MazeRole =
  | 'CARTOGRAFO_TOTAL'
  | 'CARTOGRAFO_MUROS'
  | 'ESCANER_RADIACION'
  | 'PILOTO_TOTAL'
  | 'PILOTO_VERTICAL'
  | 'PILOTO_HORIZONTAL';

export type MazeDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface MazeCoord {
  row: number;
  col: number;
}

export interface Round5State {
  startTime: number;
  gridSize: number; // 6
  probePos: MazeCoord;
  startPos: MazeCoord;
  keyPos: MazeCoord;
  goalPos: MazeCoord;
  hasKey: boolean;
  walls: MazeCoord[];
  traps: MazeCoord[];
  visitedCells: MazeCoord[];
  playerRoles: Record<string, MazeRole>;
  lastEventMessage?: string;
  lastEventStatus?: 'INFO' | 'SUCCESS' | 'ERROR';
}

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

export interface TeamRanking {
  teamId: string;
  teamName: string;
  teamColor: string;
  playerNames: string[];
  round1Scores: number;
  round2Scores: number;
  round3Scores: number;
  round4Scores: number;
  round5Scores: number;
  totalScore: number;
  rankPosition: number;
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
    teamId?: string;
    teamName?: string;
    teamColor?: string;
    avgReactionMs: number;
    actionsCompleted: number;
    mistakes: number;
  }[];
  teamRankings?: TeamRanking[];
}

export interface RoomState {
  code: string;
  players: Player[];
  allPlayers?: Player[];
  phase: GamePhase;
  upcomingRound?: 1 | 2 | 3 | 4 | 5;
  lastCompletedRound?: 1 | 2 | 3 | 4 | 5;
  gameMode: GameMode;
  teams: TeamInfo[];
  myTeamId?: string;
  currentStability: number;
  round1Scores: number;
  round2Scores: number;
  round3Scores: number;
  round4Scores: number;
  round5Scores: number;
  totalScore: number;
  roundStartTime: number;
  round1?: Round1Step;
  round2?: Round2State;
  round3?: Round3State;
  round4?: Round4State;
  round5?: Round5State;
  summary?: GameSummary;
  botRadioMessage?: string;
  singleRoundMode?: boolean;
}
