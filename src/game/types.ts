export type GameState =
  | 'TITLE_MENU'
  | 'LEVEL_GRID'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_COMPLETE'
  | 'CAMPAIGN_COMPLETE';

export type BodyShape = 'circle' | 'box';

export type ObjectKind =
  | 'sugar'
  | 'spoon'
  | 'cup'
  | 'ice'
  | 'glass'
  | 'pin'
  | 'book'
  | 'bell'
  | 'toast'
  | 'toaster'
  | 'plate'
  | 'scale_beam'
  | 'scale_pan'
  | 'orange'
  | 'apple'
  | 'lemon'
  | 'drop'
  | 'leaf'
  | 'pot'
  | 'cookie'
  | 'gate'
  | 'jar'
  | 'mobile_bar'
  | 'clip'
  | 'key_weight'
  | 'button_weight'
  | 'soap'
  | 'sponge'
  | 'soap_dish'
  | 'marble'
  | 'pendulum_bob'
  | 'float_raft'
  | 'hinge_plank'
  | 'shelf'
  | 'ramp'
  | 'wall';

export type TapAction =
  | 'remove'
  | 'tilt_toggle'
  | 'launch_toast'
  | 'bounce_pad'
  | 'release_pendulum'
  | 'drop_item'
  | 'push_book';

export type SoundMaterial = 'wood' | 'ceramic' | 'glass' | 'soft' | 'water' | 'bell' | 'spring';

export interface PhysicsBody {
  id: string;
  shape: BodyShape;
  kind: ObjectKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angularVel: number;
  w?: number;
  h?: number;
  radius?: number;
  isStatic: boolean;
  isPinnedPivot?: boolean; // Rotates around (x,y) without translating
  mass: number;
  invMass: number;
  inertia: number;
  invInertia: number;
  restitution: number;
  friction: number;
  linearDamping: number;
  angularDamping: number;
  color: string;
  accentColor?: string;
  material: SoundMaterial;
  active: boolean;
  isRemoved?: boolean;
  fadeOut: number; // 1 = visible, 0 = gone
  // Tap interactivity
  tapAction?: TapAction;
  tapRadiusBonus?: number;
  tappedCount: number;
  maxTaps?: number;
  // Smooth angle motor (for spoons, leaves, ramps)
  targetAngle?: number;
  angleOptions?: number[];
  angleMotorStiffness?: number;
  angleMin?: number;
  angleMax?: number;
  restoringSpring?: number;
  // Specialized props
  launchTargetId?: string;
  launchImpulse?: { vx: number; vy: number };
  bounceImpulse?: { vx: number; vy: number };
  bounceAnim?: number; // 0..1 visual pulse when sponge/toaster fires
  pushImpulse?: { vx: number; vy: number; angVel?: number };
  attachedToClip?: boolean;
  weightValue?: number;
  goalGroup?: string;
  sensorOnly?: boolean; // Doesn't physically collide, used for visual markers
  collisionGroup?: number; // 0 = default, negative = never collide with same negative group
  // Visual spring state
  squashX: number;
  squashY: number;
  highlightPulse: number;
}

export interface LiquidZone {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  baseSurfaceY: number;
  surfaceY: number;
  targetSurfaceY: number;
  density: number;
  color: string;
  surfaceColor: string;
  wavePhase: number;
  waveAmplitude: number;
  risePerUnitArea?: number;
}

export interface ScaleLinkage {
  beamId: string;
  leftPanId: string;
  rightPanId: string;
  armLength: number;
  panDrop: number;
  equilibriumTolerance: number;
}

export interface MobileLinkage {
  barId: string;
  parentBarId?: string;
  attachOffsetX?: number;
  dropLength: number;
  leftPlatformId: string;
  rightPlatformId: string;
  armLength: number;
  panDrop: number;
}

export interface PendulumRig {
  anchorX: number;
  anchorY: number;
  length: number;
  angle: number;
  angularVel: number;
  maxAngle: number;
  frequency: number;
  bobBodyId: string;
  released: boolean;
}

export interface FaucetRig {
  x: number;
  y: number;
  interval: number;
  timer: number;
  active: boolean;
  dropsSpawned: number;
  dropsCollected: number;
  targetDrops: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
  kind: 'circle' | 'steam' | 'droplet' | 'spark';
}

export interface TapRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export interface HintStep {
  targetBodyId: string;
  label: string;
  directionHint?: { dx: number; dy: number };
}

export interface LevelGoalCheck {
  type:
    | 'bodies_in_zone'
    | 'bell_rung'
    | 'scale_balanced'
    | 'drops_collected'
    | 'mobile_balanced';
  zone?: { x: number; y: number; w: number; h: number };
  requiredBodyIds?: string[];
  requiredCount?: number;
  holdDuration: number;
  bellBodyId?: string;
}

export interface LevelDefinition {
  id: number;
  numberLabel: string;
  title: string;
  subtitle: string;
  objectIcon:
    | 'cup'
    | 'ice'
    | 'book'
    | 'toast'
    | 'scale'
    | 'drop'
    | 'cookie'
    | 'mobile'
    | 'soap'
    | 'lemon'
    | 'pendulum'
    | 'bell';
  idealTaps: number;
  tapLimit: number;
  hints: HintStep[];
  goal: LevelGoalCheck;
  setup: () => {
    bodies: PhysicsBody[];
    liquids?: LiquidZone[];
    scales?: ScaleLinkage[];
    mobiles?: MobileLinkage[];
    pendulum?: PendulumRig;
    faucet?: FaucetRig;
    floatBridge?: {
      raftId: string;
      liquidId: string;
      baseOffset: number;
    };
  };
}

export interface PlayerProgress {
  unlockedLevel: number;
  completedLevels: number[];
  bestTaps: Record<number, number>;
  isMuted: boolean;
}
