import { createBoxBody, createCircleBody, PhysicsWorldState, WORLD_H, WORLD_W } from './physics';
import { LevelDefinition, PhysicsBody } from './types';

function createCupWalls(
  cx: number,
  cy: number,
  w: number,
  h: number,
  color = '#FCFBF8',
  group = -1
): PhysicsBody[] {
  const wallT = 12;
  return [
    createBoxBody({
      id: `cup_l_${cx}`,
      kind: 'cup',
      x: cx - w * 0.5 + wallT * 0.5,
      y: cy,
      w: wallT,
      h,
      isStatic: true,
      color,
      material: 'ceramic',
      collisionGroup: group,
      sensorOnly: false,
    }),
    createBoxBody({
      id: `cup_r_${cx}`,
      kind: 'cup',
      x: cx + w * 0.5 - wallT * 0.5,
      y: cy,
      w: wallT,
      h,
      isStatic: true,
      color,
      material: 'ceramic',
      collisionGroup: group,
    }),
    createBoxBody({
      id: `cup_b_${cx}`,
      kind: 'cup',
      x: cx,
      y: cy + h * 0.5 - wallT * 0.5,
      w,
      h: wallT,
      isStatic: true,
      color,
      material: 'ceramic',
      collisionGroup: group,
    }),
  ];
}

export const LEVELS: LevelDefinition[] = [
  // =========================================================
  // NIVEL 01 · Xícara da Manhã
  // =========================================================
  {
    id: 1,
    numberLabel: '01',
    title: 'Xícara da Manhã',
    subtitle: 'Toque na colher para adoçar o chá',
    objectIcon: 'cup',
    idealTaps: 1,
    tapLimit: 1,
    hints: [
      { targetBodyId: 'spoon_1', label: 'Toque na colher de madeira', directionHint: { dx: 1, dy: 0.5 } },
    ],
    goal: {
      type: 'bodies_in_zone',
      zone: { x: 495, y: 390, w: 100, h: 90 },
      requiredBodyIds: ['sugar_1'],
      holdDuration: 0.65,
    },
    setup: () => {
      const table = createBoxBody({
        id: 'table',
        kind: 'shelf',
        x: WORLD_W * 0.5,
        y: 505,
        w: 620,
        h: 18,
        isStatic: true,
        color: '#E3DDD2',
        material: 'wood',
      });

      const spoon = createBoxBody({
        id: 'spoon_1',
        kind: 'spoon',
        x: 375,
        y: 235,
        w: 156,
        h: 14,
        angle: 0,
        targetAngle: 0,
        angleOptions: [0, 0.48],
        angleMotorStiffness: 35,
        isStatic: true,
        isPinnedPivot: true,
        color: '#D5BFA8',
        accentColor: '#7FA68A',
        material: 'wood',
        tapAction: 'tilt_toggle',
        friction: 0.08,
        collisionGroup: -2,
      });

      // Tiny stopper on left of spoon so sugar stays cozy until tapped
      const spoonLip = createBoxBody({
        id: 'spoon_lip',
        kind: 'shelf',
        x: 300,
        y: 220,
        w: 12,
        h: 24,
        isStatic: true,
        color: '#D5BFA8',
        material: 'wood',
        collisionGroup: -2,
      });

      const sugar = createBoxBody({
        id: 'sugar_1',
        kind: 'sugar',
        x: 345,
        y: 205,
        w: 30,
        h: 30,
        mass: 0.9,
        friction: 0.06,
        restitution: 0.12,
        color: '#FCFBF8',
        accentColor: '#E5DFD3',
        material: 'ceramic',
      });

      const cupWalls = createCupWalls(545, 452, 108, 86, '#FCFBF8', -1);

      return {
        bodies: [table, spoon, spoonLip, sugar, ...cupWalls],
        liquids: [
          {
            id: 'tea_1',
            x: 503,
            y: 422,
            w: 84,
            h: 62,
            baseSurfaceY: 428,
            surfaceY: 428,
            targetSurfaceY: 428,
            density: 0.55,
            color: 'rgba(221, 160, 137, 0.48)',
            surfaceColor: '#DDA089',
            wavePhase: 0,
            waveAmplitude: 1.5,
          },
        ],
      };
    },
  },

  // =========================================================
  // NIVEL 02 · Gelo no Copo
  // =========================================================
  {
    id: 2,
    numberLabel: '02',
    title: 'Gelo no Copo',
    subtitle: 'Remova a trava para refrescar o suco',
    objectIcon: 'ice',
    idealTaps: 1,
    tapLimit: 1,
    hints: [
      { targetBodyId: 'pin_1', label: 'Toque na trava de madeira' },
    ],
    goal: {
      type: 'bodies_in_zone',
      zone: { x: 560, y: 310, w: 120, h: 165 },
      requiredBodyIds: ['ice_1', 'ice_2'],
      holdDuration: 0.8,
    },
    setup: () => {
      const table = createBoxBody({
        id: 'table',
        kind: 'shelf',
        x: WORLD_W * 0.5,
        y: 505,
        w: 640,
        h: 18,
        isStatic: true,
        color: '#E3DDD2',
        material: 'wood',
      });

      const ramp = createBoxBody({
        id: 'ramp_1',
        kind: 'ramp',
        x: 365,
        y: 235,
        w: 270,
        h: 14,
        angle: 0.27,
        isStatic: true,
        friction: 0.05,
        color: '#D5BFA8',
        material: 'wood',
      });

      const pin = createBoxBody({
        id: 'pin_1',
        kind: 'pin',
        x: 410,
        y: 222,
        w: 16,
        h: 48,
        angle: 0.27,
        isStatic: true,
        color: '#DDA089',
        accentColor: '#DDA089',
        material: 'wood',
        tapAction: 'remove',
      });

      const ice1 = createBoxBody({
        id: 'ice_1',
        kind: 'ice',
        x: 310,
        y: 192,
        w: 32,
        h: 32,
        angle: 0.27,
        mass: 0.9,
        friction: 0.04,
        restitution: 0.15,
        color: '#CFE4EE',
        accentColor: '#FFFFFF',
        material: 'glass',
      });

      const ice2 = createBoxBody({
        id: 'ice_2',
        kind: 'ice',
        x: 360,
        y: 205,
        w: 32,
        h: 32,
        angle: 0.27,
        mass: 0.9,
        friction: 0.04,
        restitution: 0.15,
        color: '#CFE4EE',
        accentColor: '#FFFFFF',
        material: 'glass',
      });

      const glassWalls = createCupWalls(620, 412, 122, 166, '#E8F1F5', -1);

      return {
        bodies: [table, ramp, pin, ice1, ice2, ...glassWalls],
        liquids: [
          {
            id: 'juice_1',
            x: 571,
            y: 356,
            w: 98,
            h: 126,
            baseSurfaceY: 368,
            surfaceY: 368,
            targetSurfaceY: 368,
            density: 1.55,
            color: 'rgba(230, 198, 117, 0.42)',
            surfaceColor: '#E6C675',
            wavePhase: 0,
            waveAmplitude: 1.8,
          },
        ],
      };
    },
  },

  // =========================================================
  // NIVEL 03 · Prateleira dos Livros
  // =========================================================
  {
    id: 3,
    numberLabel: '03',
    title: 'Prateleira dos Livros',
    subtitle: 'Libere o caminho e toque o sino',
    objectIcon: 'book',
    idealTaps: 2,
    tapLimit: 2,
    hints: [
      { targetBodyId: 'pin_book', label: 'Primeiro remova o lápis no meio' },
      { targetBodyId: 'book_1', label: 'Empurre o primeiro livro', directionHint: { dx: 1, dy: 0 } },
    ],
    goal: {
      type: 'bell_rung',
      bellBodyId: 'bell_1',
      holdDuration: 0.45,
    },
    setup: () => {
      const shelf = createBoxBody({
        id: 'shelf_1',
        kind: 'shelf',
        x: 480,
        y: 425,
        w: 580,
        h: 16,
        isStatic: true,
        color: '#D5BFA8',
        material: 'wood',
        friction: 0.8,
      });

      const pinBook = createBoxBody({
        id: 'pin_book',
        kind: 'pin',
        x: 405,
        y: 378,
        w: 14,
        h: 74,
        isStatic: true,
        color: '#E6C675',
        accentColor: '#DDA089',
        material: 'wood',
        tapAction: 'remove',
      });

      const bookColors = ['#8AB4C8', '#7FA68A', '#DDA089', '#B5A8D1'];
      const bookXs = [290, 358, 446, 518];
      const books = bookXs.map((bx, i) =>
        createBoxBody({
          id: `book_${i + 1}`,
          kind: 'book',
          x: bx,
          y: 367,
          w: 24,
          h: 98,
          mass: 1.3,
          friction: 0.65,
          restitution: 0.1,
          color: bookColors[i],
          material: 'wood',
          ...(i === 0
            ? {
                tapAction: 'push_book' as const,
                maxTaps: 1,
                pushImpulse: { vx: 72, vy: -8, angVel: 2.2 },
                accentColor: '#2B3230',
              }
            : {}),
        })
      );

      const bell = createCircleBody({
        id: 'bell_1',
        kind: 'bell',
        x: 615,
        y: 396,
        radius: 22,
        isStatic: true,
        color: '#E6C675',
        accentColor: '#FCFBF8',
        material: 'bell',
      });

      return {
        bodies: [shelf, pinBook, ...books, bell],
      };
    },
  },

  // =========================================================
  // NIVEL 04 · Torrada Matinal
  // =========================================================
  {
    id: 4,
    numberLabel: '04',
    title: 'Torrada Matinal',
    subtitle: 'Alinhe a prateleira e dispare a torradeira',
    objectIcon: 'toast',
    idealTaps: 2,
    tapLimit: 2,
    hints: [
      { targetBodyId: 'shelf_toast', label: 'Incline a prateleira central em direção ao prato' },
      { targetBodyId: 'toaster_1', label: 'Toque na torradeira para lançar a torrada', directionHint: { dx: 0.6, dy: -1 } },
    ],
    goal: {
      type: 'bodies_in_zone',
      zone: { x: 615, y: 375, w: 155, h: 85 },
      requiredBodyIds: ['toast_1'],
      holdDuration: 0.7,
    },
    setup: () => {
      const table = createBoxBody({
        id: 'table',
        kind: 'shelf',
        x: WORLD_W * 0.5,
        y: 505,
        w: 680,
        h: 18,
        isStatic: true,
        color: '#E3DDD2',
        material: 'wood',
      });

      const toaster = createBoxBody({
        id: 'toaster_1',
        kind: 'toaster',
        x: 215,
        y: 452,
        w: 96,
        h: 82,
        isStatic: true,
        color: '#8AB4C8',
        accentColor: '#FCFBF8',
        material: 'ceramic',
        tapAction: 'launch_toast',
        launchTargetId: 'toast_1',
        launchImpulse: { vx: 185, vy: -460 },
      });

      const toast = createBoxBody({
        id: 'toast_1',
        kind: 'toast',
        x: 215,
        y: 386,
        w: 44,
        h: 48,
        mass: 1.0,
        friction: 0.24,
        restitution: 0.08,
        color: '#E0B989',
        accentColor: '#B88B58',
        material: 'soft',
      });

      const shelfToast = createBoxBody({
        id: 'shelf_toast',
        kind: 'hinge_plank',
        x: 475,
        y: 290,
        w: 185,
        h: 14,
        angle: -0.68,
        targetAngle: -0.68,
        angleOptions: [-0.68, 0.34],
        angleMotorStiffness: 24,
        isStatic: true,
        isPinnedPivot: true,
        friction: 0.22,
        restitution: 0.05,
        color: '#D5BFA8',
        accentColor: '#7FA68A',
        material: 'wood',
        tapAction: 'tilt_toggle',
      });

      // Ceramic plate with gentle raised rims
      const plateBase = createBoxBody({
        id: 'plate_base',
        kind: 'plate',
        x: 690,
        y: 468,
        w: 166,
        h: 14,
        isStatic: true,
        friction: 0.8,
        color: '#FCFBF8',
        material: 'ceramic',
        collisionGroup: -1,
      });
      const plateRimL = createBoxBody({
        id: 'plate_rim_l',
        kind: 'plate',
        x: 608,
        y: 448,
        w: 12,
        h: 44,
        angle: -0.25,
        isStatic: true,
        color: '#FCFBF8',
        material: 'ceramic',
        collisionGroup: -1,
      });
      const plateRimR = createBoxBody({
        id: 'plate_rim_r',
        kind: 'plate',
        x: 772,
        y: 448,
        w: 12,
        h: 44,
        angle: 0.25,
        isStatic: true,
        color: '#FCFBF8',
        material: 'ceramic',
        collisionGroup: -1,
      });

      return {
        bodies: [table, toaster, toast, shelfToast, plateBase, plateRimL, plateRimR],
      };
    },
  },

  // =========================================================
  // NIVEL 05 · Balança da Cozinha
  // =========================================================
  {
    id: 5,
    numberLabel: '05',
    title: 'Balança da Cozinha',
    subtitle: 'Combine os pesos para nivelar os pratos',
    objectIcon: 'scale',
    idealTaps: 2,
    tapLimit: 2,
    hints: [
      { targetBodyId: 'clip_lemon', label: 'Solte o limão leve (peso 1)' },
      { targetBodyId: 'clip_apple', label: 'Combine com a maçã (peso 2) para igualar a laranja (3)' },
    ],
    goal: {
      type: 'scale_balanced',
      holdDuration: 1.0,
    },
    setup: () => {
      const table = createBoxBody({
        id: 'table',
        kind: 'shelf',
        x: WORLD_W * 0.5,
        y: 505,
        w: 640,
        h: 18,
        isStatic: true,
        color: '#E3DDD2',
        material: 'wood',
      });

      const beam = createBoxBody({
        id: 'scale_beam',
        kind: 'scale_beam',
        x: 480,
        y: 315,
        w: 310,
        h: 12,
        mass: 4.5,
        isStatic: true,
        isPinnedPivot: true,
        sensorOnly: true,
        restoringSpring: 2.2,
        angularDamping: 3.4,
        angleMin: -0.18,
        angleMax: 0.18,
        color: '#D5BFA8',
        material: 'wood',
        collisionGroup: -3,
      });

      const leftPan = createBoxBody({
        id: 'pan_left',
        kind: 'scale_pan',
        x: 480 - 140,
        y: 315 + 68,
        w: 148,
        h: 12,
        isStatic: true,
        friction: 0.95,
        color: '#FCFBF8',
        material: 'ceramic',
        collisionGroup: -3,
      });

      const rightPan = createBoxBody({
        id: 'pan_right',
        kind: 'scale_pan',
        x: 480 + 140,
        y: 315 + 68,
        w: 148,
        h: 12,
        isStatic: true,
        friction: 0.95,
        color: '#FCFBF8',
        material: 'ceramic',
        collisionGroup: -3,
      });

      const orangeLeft = createCircleBody({
        id: 'orange_left',
        kind: 'orange',
        x: 480 - 140,
        y: 315 + 38,
        radius: 23,
        mass: 3.0,
        weightValue: 3,
        friction: 0.95,
        restitution: 0.04,
        color: '#E6A87C',
        accentColor: '#7FA68A',
        material: 'soft',
      });

      const lemon = createCircleBody({
        id: 'lemon_right',
        kind: 'lemon',
        x: 568,
        y: 152,
        radius: 16,
        mass: 1.0,
        weightValue: 1,
        friction: 0.95,
        restitution: 0.05,
        attachedToClip: true,
        color: '#E6C675',
        accentColor: '#7FA68A',
        material: 'soft',
      });
      const clipLemon = createBoxBody({
        id: 'clip_lemon',
        kind: 'clip',
        x: 568,
        y: 110,
        w: 24,
        h: 24,
        isStatic: true,
        color: '#B5A8D1',
        material: 'wood',
        tapAction: 'drop_item',
        launchTargetId: 'lemon_right',
        sensorOnly: true,
      });

      const apple = createCircleBody({
        id: 'apple_right',
        kind: 'apple',
        x: 622,
        y: 204,
        radius: 20,
        mass: 2.0,
        weightValue: 2,
        friction: 0.95,
        restitution: 0.05,
        attachedToClip: true,
        color: '#DDA089',
        accentColor: '#7FA68A',
        material: 'soft',
      });
      const clipApple = createBoxBody({
        id: 'clip_apple',
        kind: 'clip',
        x: 622,
        y: 162,
        w: 24,
        h: 24,
        isStatic: true,
        color: '#B5A8D1',
        material: 'wood',
        tapAction: 'drop_item',
        launchTargetId: 'apple_right',
        sensorOnly: true,
      });

      const heavyOrange = createCircleBody({
        id: 'orange_heavy',
        kind: 'orange',
        x: 676,
        y: 140,
        radius: 26,
        mass: 4.0,
        weightValue: 4,
        friction: 0.95,
        restitution: 0.05,
        attachedToClip: true,
        color: '#E6A87C',
        accentColor: '#7FA68A',
        material: 'soft',
      });
      const clipHeavy = createBoxBody({
        id: 'clip_heavy',
        kind: 'clip',
        x: 676,
        y: 94,
        w: 24,
        h: 24,
        isStatic: true,
        color: '#B5A8D1',
        material: 'wood',
        tapAction: 'drop_item',
        launchTargetId: 'orange_heavy',
        sensorOnly: true,
      });

      return {
        bodies: [
          table,
          beam,
          leftPan,
          rightPan,
          orangeLeft,
          lemon,
          clipLemon,
          apple,
          clipApple,
          heavyOrange,
          clipHeavy,
        ],
        scales: [
          {
            beamId: 'scale_beam',
            leftPanId: 'pan_left',
            rightPanId: 'pan_right',
            armLength: 140,
            panDrop: 68,
            equilibriumTolerance: 0.08,
          },
        ],
      };
    },
  },

  // =========================================================
  // NIVEL 06 · Gotas no Vaso
  // =========================================================
  {
    id: 6,
    numberLabel: '06',
    title: 'Gotas no Vaso',
    subtitle: 'Gire as folhas para regar a planta com 5 gotas',
    objectIcon: 'drop',
    idealTaps: 3,
    tapLimit: 4,
    hints: [
      { targetBodyId: 'leaf_1', label: 'Toque na folha superior para desviar as gotas à direita' },
      { targetBodyId: 'leaf_2', label: 'Alinhe as outras duas folhas em cascata até o vaso' },
    ],
    goal: {
      type: 'drops_collected',
      requiredCount: 5,
      holdDuration: 0.3,
    },
    setup: () => {
      const table = createBoxBody({
        id: 'table',
        kind: 'shelf',
        x: WORLD_W * 0.5,
        y: 505,
        w: 660,
        h: 18,
        isStatic: true,
        color: '#E3DDD2',
        material: 'wood',
      });

      const leaf1 = createBoxBody({
        id: 'leaf_1',
        kind: 'leaf',
        x: 245,
        y: 215,
        w: 130,
        h: 14,
        angle: -0.45,
        targetAngle: -0.45,
        angleOptions: [-0.45, 0.42],
        angleMotorStiffness: 20,
        isStatic: true,
        isPinnedPivot: true,
        friction: 0.02,
        restitution: 0.25,
        color: '#7FA68A',
        accentColor: '#5E8569',
        material: 'ceramic',
        tapAction: 'tilt_toggle',
      });

      const leaf2 = createBoxBody({
        id: 'leaf_2',
        kind: 'leaf',
        x: 410,
        y: 318,
        w: 136,
        h: 14,
        angle: -0.42,
        targetAngle: -0.42,
        angleOptions: [-0.42, 0.4],
        angleMotorStiffness: 20,
        isStatic: true,
        isPinnedPivot: true,
        friction: 0.02,
        restitution: 0.25,
        color: '#7FA68A',
        accentColor: '#5E8569',
        material: 'ceramic',
        tapAction: 'tilt_toggle',
      });

      const leaf3 = createBoxBody({
        id: 'leaf_3',
        kind: 'leaf',
        x: 565,
        y: 398,
        w: 130,
        h: 14,
        angle: -0.4,
        targetAngle: -0.4,
        angleOptions: [-0.4, 0.36],
        angleMotorStiffness: 20,
        isStatic: true,
        isPinnedPivot: true,
        friction: 0.02,
        restitution: 0.25,
        color: '#7FA68A',
        accentColor: '#5E8569',
        material: 'ceramic',
        tapAction: 'tilt_toggle',
      });

      const pot = createBoxBody({
        id: 'pot_1',
        kind: 'pot',
        x: 705,
        y: 462,
        w: 96,
        h: 68,
        isStatic: true,
        color: '#DDA089',
        accentColor: '#7FA68A',
        material: 'ceramic',
        sensorOnly: true,
      });

      return {
        bodies: [table, leaf1, leaf2, leaf3, pot],
        faucet: {
          x: 215,
          y: 100,
          interval: 0.92,
          timer: 0.65,
          active: true,
          dropsSpawned: 0,
          dropsCollected: 0,
          targetDrops: 5,
        },
      };
    },
  },

  // =========================================================
  // NIVEL 07 · Bandeja de Biscoitos
  // =========================================================
  {
    id: 7,
    numberLabel: '07',
    title: 'Bandeja de Biscoitos',
    subtitle: 'Guie os 3 biscoitos para o pote de vidro',
    objectIcon: 'cookie',
    idealTaps: 3,
    tapLimit: 3,
    hints: [
      { targetBodyId: 'gate_left', label: 'Abra um portão por vez alternando a rampa central' },
      { targetBodyId: 'bridge_cookie', label: 'Toque na tábua central para virá-la para o outro lado' },
    ],
    goal: {
      type: 'bodies_in_zone',
      zone: { x: 400, y: 390, w: 160, h: 100 },
      requiredBodyIds: ['cookie_1', 'cookie_2', 'cookie_3'],
      holdDuration: 0.8,
    },
    setup: () => {
      const table = createBoxBody({
        id: 'table',
        kind: 'shelf',
        x: WORLD_W * 0.5,
        y: 505,
        w: 660,
        h: 18,
        isStatic: true,
        color: '#E3DDD2',
        material: 'wood',
      });

      const rampL = createBoxBody({
        id: 'ramp_cookie_l',
        kind: 'ramp',
        x: 255,
        y: 180,
        w: 215,
        h: 12,
        angle: 0.3,
        isStatic: true,
        friction: 0.04,
        color: '#D5BFA8',
        material: 'wood',
      });
      const gateL = createBoxBody({
        id: 'gate_left',
        kind: 'gate',
        x: 330,
        y: 175,
        w: 14,
        h: 54,
        angle: 0.3,
        isStatic: true,
        color: '#DDA089',
        material: 'wood',
        tapAction: 'remove',
      });

      const rampR = createBoxBody({
        id: 'ramp_cookie_r',
        kind: 'ramp',
        x: 705,
        y: 180,
        w: 215,
        h: 12,
        angle: -0.3,
        isStatic: true,
        friction: 0.04,
        color: '#D5BFA8',
        material: 'wood',
      });
      const gateR = createBoxBody({
        id: 'gate_right',
        kind: 'gate',
        x: 630,
        y: 175,
        w: 14,
        h: 54,
        angle: -0.3,
        isStatic: true,
        color: '#DDA089',
        material: 'wood',
        tapAction: 'remove',
      });

      // Central tiltable bridge that routes cookies from left OR right straight down into jar
      const bridge = createBoxBody({
        id: 'bridge_cookie',
        kind: 'hinge_plank',
        x: 480,
        y: 286,
        w: 132,
        h: 12,
        angle: 0.3,
        targetAngle: 0.3,
        angleOptions: [0.3, -0.3],
        angleMotorStiffness: 20,
        isStatic: true,
        isPinnedPivot: true,
        friction: 0.05,
        color: '#8AB4C8',
        accentColor: '#7FA68A',
        material: 'wood',
        tapAction: 'tilt_toggle',
      });

      // Soft guide side bumpers above jar so cookies funnel smoothly into jar
      const guideL = createBoxBody({
        id: 'guide_l',
        kind: 'wall',
        x: 368,
        y: 332,
        w: 10,
        h: 118,
        angle: -0.34,
        isStatic: true,
        color: '#E3DDD2',
        material: 'glass',
      });
      const guideR = createBoxBody({
        id: 'guide_r',
        kind: 'wall',
        x: 592,
        y: 332,
        w: 10,
        h: 118,
        angle: 0.34,
        isStatic: true,
        color: '#E3DDD2',
        material: 'glass',
      });

      const c1 = createCircleBody({
        id: 'cookie_1',
        kind: 'cookie',
        x: 200,
        y: 135,
        radius: 18,
        mass: 0.85,
        friction: 0.05,
        restitution: 0.08,
        color: '#DFB684',
        accentColor: '#9C7853',
        material: 'soft',
      });
      const c2 = createCircleBody({
        id: 'cookie_2',
        kind: 'cookie',
        x: 250,
        y: 150,
        radius: 18,
        mass: 0.85,
        friction: 0.05,
        restitution: 0.08,
        color: '#DFB684',
        accentColor: '#9C7853',
        material: 'soft',
      });
      const c3 = createCircleBody({
        id: 'cookie_3',
        kind: 'cookie',
        x: 735,
        y: 142,
        radius: 18,
        mass: 0.85,
        friction: 0.05,
        restitution: 0.08,
        color: '#DFB684',
        accentColor: '#9C7853',
        material: 'soft',
      });

      const jarWalls = createCupWalls(480, 442, 166, 112, '#E8F1F5', -1);

      return {
        bodies: [
          table,
          rampL,
          gateL,
          rampR,
          gateR,
          bridge,
          guideL,
          guideR,
          c1,
          c2,
          c3,
          ...jarWalls,
        ],
      };
    },
  },

  // =========================================================
  // NIVEL 08 · Móbile do Quarto
  // =========================================================
  {
    id: 8,
    numberLabel: '08',
    title: 'Móbile do Quarto',
    subtitle: 'Equilibre as duas hastes com os objetos certos',
    objectIcon: 'mobile',
    idealTaps: 2,
    tapLimit: 2,
    hints: [
      { targetBodyId: 'clip_btn_1', label: 'Solte um botão de peso 1 no lado esquerdo da haste menor' },
      { targetBodyId: 'clip_btn_3', label: 'Solte um botão de peso 1 no lado direito para somar 2' },
    ],
    goal: {
      type: 'mobile_balanced',
      holdDuration: 1.0,
    },
    setup: () => {
      const mainBar = createBoxBody({
        id: 'mobile_main',
        kind: 'mobile_bar',
        x: 470,
        y: 230,
        w: 310,
        h: 10,
        mass: 4.5,
        isStatic: true,
        isPinnedPivot: true,
        sensorOnly: true,
        restoringSpring: 2.2,
        angularDamping: 3.8,
        angleMin: -0.18,
        angleMax: 0.18,
        color: '#D5BFA8',
        material: 'wood',
        collisionGroup: -4,
      });

      const mainLeftPlat = createBoxBody({
        id: 'mob_main_l',
        kind: 'scale_pan',
        x: 470 - 140,
        y: 230 + 62,
        w: 84,
        h: 10,
        isStatic: true,
        friction: 0.95,
        color: '#FCFBF8',
        material: 'wood',
        collisionGroup: -4,
      });

      // Invisible dummy right platform for mainBar (the subBar hangs at +140!)
      const mainRightDummy = createBoxBody({
        id: 'mob_main_r',
        kind: 'scale_pan',
        x: 470 + 140,
        y: 230 + 62,
        w: 10,
        h: 10,
        isStatic: true,
        sensorOnly: true,
        collisionGroup: -4,
      });

      const fixedKey = createBoxBody({
        id: 'key_fixed',
        kind: 'key_weight',
        x: 470 - 140,
        y: 230 + 38,
        w: 36,
        h: 34,
        mass: 2.0,
        weightValue: 2,
        friction: 0.95,
        restitution: 0.04,
        color: '#E6C675',
        material: 'ceramic',
      });

      const subBar = createBoxBody({
        id: 'mobile_sub',
        kind: 'mobile_bar',
        x: 470 + 140,
        y: 230 + 95,
        w: 185,
        h: 10,
        mass: 3.0,
        isStatic: true,
        isPinnedPivot: true,
        sensorOnly: true,
        restoringSpring: 2.6,
        angularDamping: 3.8,
        angleMin: -0.2,
        angleMax: 0.2,
        color: '#D5BFA8',
        material: 'wood',
        collisionGroup: -5,
      });

      const subLeftPlat = createBoxBody({
        id: 'mob_sub_l',
        kind: 'scale_pan',
        x: 610 - 80,
        y: 325 + 62,
        w: 88,
        h: 10,
        isStatic: true,
        friction: 0.95,
        color: '#FCFBF8',
        material: 'wood',
        collisionGroup: -5,
      });

      const subRightPlat = createBoxBody({
        id: 'mob_sub_r',
        kind: 'scale_pan',
        x: 610 + 80,
        y: 325 + 62,
        w: 88,
        h: 10,
        isStatic: true,
        friction: 0.95,
        color: '#FCFBF8',
        material: 'wood',
        collisionGroup: -5,
      });

      // 4 hanging buttons above subBar: Left (1.0, 2.0) | Right (1.0, 2.0)
      const btn1 = createCircleBody({
        id: 'btn_1',
        kind: 'button_weight',
        x: 526,
        y: 125,
        radius: 17,
        mass: 1.0,
        weightValue: 1,
        restitution: 0.04,
        friction: 0.95,
        attachedToClip: true,
        color: '#8AB4C8',
        material: 'ceramic',
        collisionGroup: -4,
      });
      const clipBtn1 = createBoxBody({
        id: 'clip_btn_1',
        kind: 'clip',
        x: 526,
        y: 86,
        w: 22,
        h: 22,
        isStatic: true,
        color: '#B5A8D1',
        material: 'wood',
        tapAction: 'drop_item',
        launchTargetId: 'btn_1',
        sensorOnly: true,
      });

      const btn2 = createCircleBody({
        id: 'btn_2',
        kind: 'button_weight',
        x: 570,
        y: 158,
        radius: 21,
        mass: 2.0,
        weightValue: 2,
        restitution: 0.04,
        friction: 0.95,
        attachedToClip: true,
        color: '#DDA089',
        material: 'ceramic',
        collisionGroup: -4,
      });
      const clipBtn2 = createBoxBody({
        id: 'clip_btn_2',
        kind: 'clip',
        x: 570,
        y: 114,
        w: 22,
        h: 22,
        isStatic: true,
        color: '#B5A8D1',
        material: 'wood',
        tapAction: 'drop_item',
        launchTargetId: 'btn_2',
        sensorOnly: true,
      });

      const btn3 = createCircleBody({
        id: 'btn_3',
        kind: 'button_weight',
        x: 688,
        y: 125,
        radius: 17,
        mass: 1.0,
        weightValue: 1,
        restitution: 0.04,
        friction: 0.95,
        attachedToClip: true,
        color: '#7FA68A',
        material: 'ceramic',
        collisionGroup: -4,
      });
      const clipBtn3 = createBoxBody({
        id: 'clip_btn_3',
        kind: 'clip',
        x: 688,
        y: 86,
        w: 22,
        h: 22,
        isStatic: true,
        color: '#B5A8D1',
        material: 'wood',
        tapAction: 'drop_item',
        launchTargetId: 'btn_3',
        sensorOnly: true,
      });

      const btn4 = createCircleBody({
        id: 'btn_4',
        kind: 'button_weight',
        x: 732,
        y: 158,
        radius: 21,
        mass: 2.0,
        weightValue: 2,
        restitution: 0.04,
        friction: 0.95,
        attachedToClip: true,
        color: '#DDA089',
        material: 'ceramic',
        collisionGroup: -4,
      });
      const clipBtn4 = createBoxBody({
        id: 'clip_btn_4',
        kind: 'clip',
        x: 732,
        y: 114,
        w: 22,
        h: 22,
        isStatic: true,
        color: '#B5A8D1',
        material: 'wood',
        tapAction: 'drop_item',
        launchTargetId: 'btn_4',
        sensorOnly: true,
      });

      return {
        bodies: [
          mainBar,
          mainLeftPlat,
          mainRightDummy,
          fixedKey,
          subBar,
          subLeftPlat,
          subRightPlat,
          btn1,
          clipBtn1,
          btn2,
          clipBtn2,
          btn3,
          clipBtn3,
          btn4,
          clipBtn4,
        ],
        mobiles: [
          {
            barId: 'mobile_main',
            leftPlatformId: 'mob_main_l',
            rightPlatformId: 'mob_main_r',
            armLength: 140,
            panDrop: 62,
            dropLength: 0,
          },
          {
            barId: 'mobile_sub',
            parentBarId: 'mobile_main',
            attachOffsetX: 140,
            dropLength: 95,
            leftPlatformId: 'mob_sub_l',
            rightPlatformId: 'mob_sub_r',
            armLength: 80,
            panDrop: 62,
          },
        ],
      };
    },
  },

  // =========================================================
  // NIVEL 09 · Sabonete na Pia
  // =========================================================
  {
    id: 9,
    numberLabel: '09',
    title: 'Sabonete na Pia',
    subtitle: 'Toque nas esponjas para impulsionar o sabonete',
    objectIcon: 'soap',
    idealTaps: 3,
    tapLimit: 4,
    hints: [
      { targetBodyId: 'pin_soap', label: 'Solte a trava para o sabonete escorregar' },
      { targetBodyId: 'sponge_1', label: 'Toque em cada esponja quando o sabonete chegar perto' },
    ],
    goal: {
      type: 'bodies_in_zone',
      zone: { x: 660, y: 380, w: 150, h: 85 },
      requiredBodyIds: ['soap_1'],
      holdDuration: 0.7,
    },
    setup: () => {
      const table = createBoxBody({
        id: 'table',
        kind: 'shelf',
        x: WORLD_W * 0.5,
        y: 505,
        w: 680,
        h: 18,
        isStatic: true,
        color: '#E3DDD2',
        material: 'wood',
      });

      const slide = createBoxBody({
        id: 'slide_soap',
        kind: 'ramp',
        x: 210,
        y: 205,
        w: 175,
        h: 14,
        angle: 0.28,
        isStatic: true,
        friction: 0.02,
        color: '#CFE4EE',
        material: 'ceramic',
      });

      const pinSoap = createBoxBody({
        id: 'pin_soap',
        kind: 'pin',
        x: 245,
        y: 190,
        w: 16,
        h: 46,
        angle: 0.28,
        isStatic: true,
        color: '#7FA68A',
        material: 'wood',
        tapAction: 'remove',
      });

      const soap = createBoxBody({
        id: 'soap_1',
        kind: 'soap',
        x: 175,
        y: 165,
        w: 44,
        h: 24,
        angle: 0.28,
        mass: 0.85,
        friction: 0.03,
        restitution: 0.35,
        color: '#E8B8C1',
        accentColor: '#FCFBF8',
        material: 'soft',
      });

      const divider1 = createBoxBody({
        id: 'div_1',
        kind: 'wall',
        x: 425,
        y: 446,
        w: 18,
        h: 100,
        isStatic: true,
        color: '#FCFBF8',
        material: 'ceramic',
      });

      const divider2 = createBoxBody({
        id: 'div_2',
        kind: 'wall',
        x: 595,
        y: 446,
        w: 18,
        h: 100,
        isStatic: true,
        color: '#FCFBF8',
        material: 'ceramic',
      });

      const sponge1 = createBoxBody({
        id: 'sponge_1',
        kind: 'sponge',
        x: 345,
        y: 355,
        w: 94,
        h: 26,
        isStatic: true,
        restitution: 0.65,
        color: '#E6C675',
        accentColor: '#7FA68A',
        material: 'spring',
        tapAction: 'bounce_pad',
        bounceImpulse: { vx: 185, vy: -370 },
      });

      const sponge2 = createBoxBody({
        id: 'sponge_2',
        kind: 'sponge',
        x: 510,
        y: 365,
        w: 94,
        h: 26,
        isStatic: true,
        restitution: 0.65,
        color: '#E6C675',
        accentColor: '#7FA68A',
        material: 'spring',
        tapAction: 'bounce_pad',
        bounceImpulse: { vx: 205, vy: -370 },
      });

      const dishBase = createBoxBody({
        id: 'soap_dish',
        kind: 'soap_dish',
        x: 735,
        y: 468,
        w: 136,
        h: 14,
        isStatic: true,
        friction: 0.65,
        color: '#FCFBF8',
        material: 'ceramic',
        collisionGroup: -1,
      });
      const dishRimL = createBoxBody({
        id: 'dish_l',
        kind: 'soap_dish',
        x: 668,
        y: 454,
        w: 12,
        h: 32,
        isStatic: true,
        color: '#FCFBF8',
        material: 'ceramic',
        collisionGroup: -1,
      });
      const dishRimR = createBoxBody({
        id: 'dish_r',
        kind: 'soap_dish',
        x: 802,
        y: 454,
        w: 12,
        h: 32,
        isStatic: true,
        color: '#FCFBF8',
        material: 'ceramic',
        collisionGroup: -1,
      });

      return {
        bodies: [
          table,
          slide,
          pinSoap,
          soap,
          divider1,
          divider2,
          sponge1,
          sponge2,
          dishBase,
          dishRimL,
          dishRimR,
        ],
      };
    },
  },

  // =========================================================
  // NIVEL 10 · Jarra de Chá Gelado
  // =========================================================
  {
    id: 10,
    numberLabel: '10',
    title: 'Jarra de Chá Gelado',
    subtitle: 'Eleve o nível do chá antes de rolar o limão',
    objectIcon: 'lemon',
    idealTaps: 2,
    tapLimit: 2,
    hints: [
      { targetBodyId: 'pin_ice_10', label: 'Primeiro solte o gelo na jarra para subir o nível da ponte' },
      { targetBodyId: 'pin_lemon_10', label: 'Depois libere o limão para cruzar a ponte até o copo' },
    ],
    goal: {
      type: 'bodies_in_zone',
      zone: { x: 640, y: 375, w: 120, h: 125 },
      requiredBodyIds: ['lemon_10'],
      holdDuration: 0.75,
    },
    setup: () => {
      const table = createBoxBody({
        id: 'table',
        kind: 'shelf',
        x: WORLD_W * 0.5,
        y: 505,
        w: 680,
        h: 18,
        isStatic: true,
        color: '#E3DDD2',
        material: 'wood',
      });

      // Pitcher (x=370, width=180 -> 280..460, wall top around y=312)
      const pitcherWalls = createCupWalls(370, 405, 180, 185, '#E8F1F5', -1);

      // Trapdoor shelf directly above pitcher holding 2 heavy ice cubes
      const pinIce = createBoxBody({
        id: 'pin_ice_10',
        kind: 'pin',
        x: 370,
        y: 182,
        w: 124,
        h: 14,
        isStatic: true,
        color: '#8AB4C8',
        material: 'wood',
        tapAction: 'remove',
      });
      const iceA = createBoxBody({
        id: 'ice_10a',
        kind: 'ice',
        x: 342,
        y: 155,
        w: 36,
        h: 36,
        mass: 2.2,
        friction: 0.08,
        color: '#CFE4EE',
        material: 'glass',
        collisionGroup: -6,
      });
      const iceB = createBoxBody({
        id: 'ice_10b',
        kind: 'ice',
        x: 398,
        y: 155,
        w: 36,
        h: 36,
        mass: 2.2,
        friction: 0.08,
        color: '#CFE4EE',
        material: 'glass',
        collisionGroup: -6,
      });

      // Floating cork raft bridge inside pitcher (ice passes through into tea; lemon rolls on top!)
      const raft = createBoxBody({
        id: 'raft_10',
        kind: 'float_raft',
        x: 370,
        y: 388,
        w: 154,
        h: 14,
        isStatic: true,
        friction: 0.04,
        color: '#D5BFA8',
        accentColor: '#7FA68A',
        material: 'wood',
        collisionGroup: -6,
      });

      // Left ramp holding the lemon slice
      const lemonRamp = createBoxBody({
        id: 'lemon_ramp_10',
        kind: 'ramp',
        x: 195,
        y: 280,
        w: 155,
        h: 12,
        angle: 0.22,
        isStatic: true,
        friction: 0.04,
        color: '#D5BFA8',
        material: 'wood',
      });
      const pinLemon = createBoxBody({
        id: 'pin_lemon_10',
        kind: 'pin',
        x: 240,
        y: 266,
        w: 15,
        h: 44,
        angle: 0.22,
        isStatic: true,
        color: '#E6C675',
        material: 'wood',
        tapAction: 'remove',
      });
      const lemon = createCircleBody({
        id: 'lemon_10',
        kind: 'lemon',
        x: 155,
        y: 250,
        radius: 19,
        mass: 0.75,
        friction: 0.04,
        restitution: 0.12,
        color: '#E6C675',
        accentColor: '#7FA68A',
        material: 'soft',
      });

      // Right ramp leading from pitcher rim into serving glass
      const exitRamp = createBoxBody({
        id: 'exit_ramp_10',
        kind: 'ramp',
        x: 545,
        y: 342,
        w: 165,
        h: 12,
        angle: 0.24,
        isStatic: true,
        friction: 0.04,
        color: '#D5BFA8',
        material: 'wood',
      });

      const servingGlass = createCupWalls(700, 442, 114, 108, '#E8F1F5', -2);

      return {
        bodies: [
          table,
          ...pitcherWalls,
          pinIce,
          iceA,
          iceB,
          raft,
          lemonRamp,
          pinLemon,
          lemon,
          exitRamp,
          ...servingGlass,
        ],
        liquids: [
          {
            id: 'tea_10',
            x: 286,
            y: 290,
            w: 168,
            h: 200,
            baseSurfaceY: 392,
            surfaceY: 392,
            targetSurfaceY: 392,
            density: 1.35,
            risePerUnitArea: 18,
            color: 'rgba(221, 160, 137, 0.44)',
            surfaceColor: '#DDA089',
            wavePhase: 0,
            waveAmplitude: 1.6,
          },
        ],
        floatBridge: {
          raftId: 'raft_10',
          liquidId: 'tea_10',
          baseOffset: -4,
        },
      };
    },
  },

  // =========================================================
  // NIVEL 11 · Relógio de Pêndulo
  // =========================================================
  {
    id: 11,
    numberLabel: '11',
    title: 'Relógio de Pêndulo',
    subtitle: 'Ajuste as rampas e solte a bolinha no balanço certo',
    objectIcon: 'pendulum',
    idealTaps: 3,
    tapLimit: 4,
    hints: [
      { targetBodyId: 'ramp_pend_1', label: 'Alinhe primeiro as duas rampas em direção ao pote' },
      { targetBodyId: 'pendulum_clip', label: 'Toque no topo do pêndulo quando ele balançar à direita', directionHint: { dx: 1, dy: 0 } },
    ],
    goal: {
      type: 'bodies_in_zone',
      zone: { x: 690, y: 390, w: 120, h: 105 },
      requiredBodyIds: ['marble_11'],
      holdDuration: 0.7,
    },
    setup: () => {
      const table = createBoxBody({
        id: 'table',
        kind: 'shelf',
        x: WORLD_W * 0.5,
        y: 505,
        w: 680,
        h: 18,
        isStatic: true,
        color: '#E3DDD2',
        material: 'wood',
      });

      const pendulumClip = createBoxBody({
        id: 'pendulum_clip',
        kind: 'clip',
        x: 260,
        y: 78,
        w: 36,
        h: 36,
        isStatic: true,
        color: '#B5A8D1',
        material: 'wood',
        tapAction: 'release_pendulum',
        tapRadiusBonus: 20,
        sensorOnly: true,
      });

      const marble = createCircleBody({
        id: 'marble_11',
        kind: 'marble',
        x: 260,
        y: 228,
        radius: 17,
        mass: 1.0,
        friction: 0.04,
        restitution: 0.3,
        color: '#8AB4C8',
        accentColor: '#FCFBF8',
        material: 'glass',
      });

      const ramp1 = createBoxBody({
        id: 'ramp_pend_1',
        kind: 'hinge_plank',
        x: 455,
        y: 315,
        w: 170,
        h: 13,
        angle: -0.36,
        targetAngle: -0.36,
        angleOptions: [-0.36, 0.28],
        angleMotorStiffness: 20,
        isStatic: true,
        isPinnedPivot: true,
        friction: 0.04,
        color: '#D5BFA8',
        accentColor: '#7FA68A',
        material: 'wood',
        tapAction: 'tilt_toggle',
      });

      const ramp2 = createBoxBody({
        id: 'ramp_pend_2',
        kind: 'hinge_plank',
        x: 615,
        y: 396,
        w: 155,
        h: 13,
        angle: -0.32,
        targetAngle: -0.32,
        angleOptions: [-0.32, 0.28],
        angleMotorStiffness: 20,
        isStatic: true,
        isPinnedPivot: true,
        friction: 0.04,
        color: '#D5BFA8',
        accentColor: '#7FA68A',
        material: 'wood',
        tapAction: 'tilt_toggle',
      });

      const jar = createCupWalls(750, 448, 118, 96, '#E8F1F5', -1);

      return {
        bodies: [table, pendulumClip, marble, ramp1, ramp2, ...jar],
        pendulum: {
          anchorX: 260,
          anchorY: 78,
          length: 150,
          angle: 0,
          angularVel: 0,
          maxAngle: 0.82,
          frequency: 2.0,
          bobBodyId: 'marble_11',
          released: false,
        },
      };
    },
  },

  // =========================================================
  // NIVEL 12 · Mesa Completa (Grand Finale)
  // =========================================================
  {
    id: 12,
    numberLabel: '12',
    title: 'Mesa Completa',
    subtitle: 'Orquestre todos os objetos até o sino final',
    objectIcon: 'bell',
    idealTaps: 3,
    tapLimit: 3,
    hints: [
      { targetBodyId: 'shelf_fin', label: 'Alinhe a prateleira no alto e remova a trava dos livros' },
      { targetBodyId: 'toaster_fin', label: 'Dispare a torradeira para iniciar a reação em cadeia' },
    ],
    goal: {
      type: 'bell_rung',
      bellBodyId: 'bell_fin',
      holdDuration: 0.65,
    },
    setup: () => {
      const table = createBoxBody({
        id: 'table',
        kind: 'shelf',
        x: 565,
        y: 455,
        w: 520,
        h: 18,
        isStatic: true,
        color: '#E3DDD2',
        material: 'wood',
        friction: 0.35,
      });

      const toaster = createBoxBody({
        id: 'toaster_fin',
        kind: 'toaster',
        x: 155,
        y: 452,
        w: 92,
        h: 82,
        isStatic: true,
        color: '#8AB4C8',
        material: 'ceramic',
        tapAction: 'launch_toast',
        launchTargetId: 'marble_fin',
        launchImpulse: { vx: 205, vy: -460 },
      });

      const marble = createCircleBody({
        id: 'marble_fin',
        kind: 'marble',
        x: 155,
        y: 392,
        radius: 17,
        mass: 1.2,
        friction: 0.04,
        restitution: 0.2,
        color: '#DDA089',
        accentColor: '#FCFBF8',
        material: 'ceramic',
      });

      const shelfFin = createBoxBody({
        id: 'shelf_fin',
        kind: 'hinge_plank',
        x: 375,
        y: 255,
        w: 175,
        h: 13,
        angle: -0.45,
        targetAngle: -0.45,
        angleOptions: [-0.45, 0.32],
        angleMotorStiffness: 20,
        isStatic: true,
        isPinnedPivot: true,
        friction: 0.04,
        color: '#D5BFA8',
        accentColor: '#7FA68A',
        material: 'wood',
        tapAction: 'tilt_toggle',
      });

      const pinFin = createBoxBody({
        id: 'pin_fin',
        kind: 'pin',
        x: 525,
        y: 417,
        w: 14,
        h: 58,
        isStatic: true,
        color: '#E6C675',
        material: 'wood',
        tapAction: 'remove',
      });

      const bookColors = ['#7FA68A', '#8AB4C8', '#B5A8D1'];
      const bookXs = [585, 650, 715];
      const books = bookXs.map((bx, i) =>
        createBoxBody({
          id: `book_fin_${i + 1}`,
          kind: 'book',
          x: bx,
          y: 398,
          w: 22,
          h: 96,
          mass: 1.1,
          friction: 0.6,
          restitution: 0.1,
          color: bookColors[i],
          material: 'wood',
        })
      );

      const bell = createCircleBody({
        id: 'bell_fin',
        kind: 'bell',
        x: 785,
        y: 424,
        radius: 22,
        isStatic: true,
        color: '#E6C675',
        material: 'bell',
      });

      return {
        bodies: [table, toaster, marble, shelfFin, pinFin, ...books, bell],
      };
    },
  },

  // =========================================================
  // NIVEL 13 · Pesos Cruzados
  // =========================================================
  {
    id: 13,
    numberLabel: '13',
    title: 'Pesos Cruzados',
    subtitle: 'Equilibre os dois pratos usando exatamente 3 toques',
    objectIcon: 'scale',
    idealTaps: 3,
    tapLimit: 3,
    hints: [
      { targetBodyId: 'clip_13_l3', label: 'No lado esquerdo já há 2: solte o peso 3 para somar 5' },
      { targetBodyId: 'clip_13_r1', label: 'No lado direito, combine 1 + 4 para igualar 5' },
    ],
    goal: {
      type: 'scale_balanced',
      holdDuration: 1.0,
    },
    setup: () => {
      const table = createBoxBody({
        id: 'table',
        kind: 'shelf',
        x: WORLD_W * 0.5,
        y: 505,
        w: 660,
        h: 18,
        isStatic: true,
        color: '#E3DDD2',
        material: 'wood',
      });

      const beam = createBoxBody({
        id: 'scale_beam',
        kind: 'scale_beam',
        x: 480,
        y: 315,
        w: 310,
        h: 12,
        mass: 4.5,
        isStatic: true,
        isPinnedPivot: true,
        sensorOnly: true,
        restoringSpring: 2.2,
        angularDamping: 3.4,
        angleMin: -0.18,
        angleMax: 0.18,
        color: '#D5BFA8',
        material: 'wood',
        collisionGroup: -3,
      });

      const leftPan = createBoxBody({
        id: 'pan_left',
        kind: 'scale_pan',
        x: 340,
        y: 383,
        w: 148,
        h: 12,
        isStatic: true,
        friction: 0.95,
        color: '#FCFBF8',
        material: 'ceramic',
        collisionGroup: -3,
      });

      const rightPan = createBoxBody({
        id: 'pan_right',
        kind: 'scale_pan',
        x: 620,
        y: 383,
        w: 148,
        h: 12,
        isStatic: true,
        friction: 0.95,
        color: '#FCFBF8',
        material: 'ceramic',
        collisionGroup: -3,
      });

      const fixedApple = createCircleBody({
        id: 'apple_13_fixed',
        kind: 'apple',
        x: 340,
        y: 353,
        radius: 20,
        mass: 2.0,
        weightValue: 2,
        friction: 0.95,
        restitution: 0.04,
        color: '#DDA089',
        accentColor: '#7FA68A',
        material: 'soft',
      });

      const wL3 = createBoxBody({
        id: 'key_13_l3',
        kind: 'key_weight',
        x: 300,
        y: 160,
        w: 36,
        h: 34,
        mass: 3.0,
        weightValue: 3,
        friction: 0.95,
        restitution: 0.04,
        attachedToClip: true,
        color: '#E6C675',
        material: 'ceramic',
      });
      const clipL3 = createBoxBody({
        id: 'clip_13_l3',
        kind: 'clip',
        x: 300,
        y: 112,
        w: 24,
        h: 24,
        isStatic: true,
        color: '#B5A8D1',
        material: 'wood',
        tapAction: 'drop_item',
        launchTargetId: 'key_13_l3',
        sensorOnly: true,
      });

      const wL5 = createBoxBody({
        id: 'key_13_l5',
        kind: 'key_weight',
        x: 382,
        y: 196,
        w: 40,
        h: 38,
        mass: 5.0,
        weightValue: 5,
        friction: 0.95,
        restitution: 0.04,
        attachedToClip: true,
        color: '#8AB4C8',
        material: 'ceramic',
      });
      const clipL5 = createBoxBody({
        id: 'clip_13_l5',
        kind: 'clip',
        x: 382,
        y: 146,
        w: 24,
        h: 24,
        isStatic: true,
        color: '#B5A8D1',
        material: 'wood',
        tapAction: 'drop_item',
        launchTargetId: 'key_13_l5',
        sensorOnly: true,
      });

      const wR1 = createCircleBody({
        id: 'btn_13_r1',
        kind: 'button_weight',
        x: 566,
        y: 148,
        radius: 16,
        mass: 1.0,
        weightValue: 1,
        friction: 0.95,
        restitution: 0.04,
        attachedToClip: true,
        color: '#7FA68A',
        material: 'ceramic',
      });
      const clipR1 = createBoxBody({
        id: 'clip_13_r1',
        kind: 'clip',
        x: 566,
        y: 104,
        w: 24,
        h: 24,
        isStatic: true,
        color: '#B5A8D1',
        material: 'wood',
        tapAction: 'drop_item',
        launchTargetId: 'btn_13_r1',
        sensorOnly: true,
      });

      const wR4 = createCircleBody({
        id: 'orange_13_r4',
        kind: 'orange',
        x: 622,
        y: 202,
        radius: 23,
        mass: 4.0,
        weightValue: 4,
        friction: 0.95,
        restitution: 0.04,
        attachedToClip: true,
        color: '#E6A87C',
        accentColor: '#7FA68A',
        material: 'soft',
      });
      const clipR4 = createBoxBody({
        id: 'clip_13_r4',
        kind: 'clip',
        x: 622,
        y: 152,
        w: 24,
        h: 24,
        isStatic: true,
        color: '#B5A8D1',
        material: 'wood',
        tapAction: 'drop_item',
        launchTargetId: 'orange_13_r4',
        sensorOnly: true,
      });

      const wR6 = createCircleBody({
        id: 'btn_13_r6',
        kind: 'button_weight',
        x: 678,
        y: 142,
        radius: 26,
        mass: 6.0,
        weightValue: 6,
        friction: 0.95,
        restitution: 0.04,
        attachedToClip: true,
        color: '#B5A8D1',
        material: 'ceramic',
      });
      const clipR6 = createBoxBody({
        id: 'clip_13_r6',
        kind: 'clip',
        x: 678,
        y: 90,
        w: 24,
        h: 24,
        isStatic: true,
        color: '#B5A8D1',
        material: 'wood',
        tapAction: 'drop_item',
        launchTargetId: 'btn_13_r6',
        sensorOnly: true,
      });

      return {
        bodies: [
          table,
          beam,
          leftPan,
          rightPan,
          fixedApple,
          wL3,
          clipL3,
          wL5,
          clipL5,
          wR1,
          clipR1,
          wR4,
          clipR4,
          wR6,
          clipR6,
        ],
        scales: [
          {
            beamId: 'scale_beam',
            leftPanId: 'pan_left',
            rightPanId: 'pan_right',
            armLength: 140,
            panDrop: 68,
            equilibriumTolerance: 0.08,
          },
        ],
      };
    },
  },

  // =========================================================
  // NIVEL 14 · Ponte do Dominó
  // =========================================================
  {
    id: 14,
    numberLabel: '14',
    title: 'Ponte do Dominó',
    subtitle: 'Prepare a ponte e a trava antes de empurrar',
    objectIcon: 'book',
    idealTaps: 3,
    tapLimit: 3,
    hints: [
      { targetBodyId: 'bridge_14', label: 'Abaixe primeiro a ponte central e tire a trava inferior' },
      { targetBodyId: 'book_14_1', label: 'Só então empurre o primeiro livro no alto', directionHint: { dx: 1, dy: 0 } },
    ],
    goal: {
      type: 'bell_rung',
      bellBodyId: 'bell_14',
      holdDuration: 0.5,
    },
    setup: () => {
      const upperShelf = createBoxBody({
        id: 'shelf_14_top',
        kind: 'shelf',
        x: 270,
        y: 235,
        w: 270,
        h: 14,
        isStatic: true,
        color: '#D5BFA8',
        material: 'wood',
        friction: 0.5,
      });

      const bridge14 = createBoxBody({
        id: 'bridge_14',
        kind: 'hinge_plank',
        x: 472,
        y: 266,
        w: 145,
        h: 13,
        angle: -0.52,
        targetAngle: -0.52,
        angleOptions: [-0.52, 0.25],
        angleMotorStiffness: 24,
        isStatic: true,
        isPinnedPivot: true,
        friction: 0.04,
        color: '#8AB4C8',
        accentColor: '#7FA68A',
        material: 'wood',
        tapAction: 'tilt_toggle',
      });

      const lowerShelf = createBoxBody({
        id: 'shelf_14_low',
        kind: 'shelf',
        x: 660,
        y: 445,
        w: 350,
        h: 16,
        isStatic: true,
        color: '#E3DDD2',
        material: 'wood',
        friction: 0.4,
      });

      const bookColors = ['#8AB4C8', '#7FA68A', '#DDA089'];
      const upperBooks = [170, 232, 294].map((bx, i) =>
        createBoxBody({
          id: `book_14_${i + 1}`,
          kind: 'book',
          x: bx,
          y: 184,
          w: 22,
          h: 88,
          mass: 1.25,
          friction: 0.6,
          restitution: 0.1,
          color: bookColors[i],
          material: 'wood',
          ...(i === 0
            ? {
                tapAction: 'push_book' as const,
                maxTaps: 1,
                pushImpulse: { vx: 82, vy: -8, angVel: 2.3 },
              }
            : {}),
        })
      );

      const marble14 = createCircleBody({
        id: 'marble_14',
        kind: 'marble',
        x: 358,
        y: 211,
        radius: 16,
        mass: 1.1,
        friction: 0.04,
        restitution: 0.18,
        color: '#E6C675',
        material: 'glass',
      });

      const pin14 = createBoxBody({
        id: 'pin_14',
        kind: 'pin',
        x: 590,
        y: 404,
        w: 14,
        h: 64,
        isStatic: true,
        color: '#DDA089',
        material: 'wood',
        tapAction: 'remove',
      });

      const lowBooks = [648, 708].map((bx, i) =>
        createBoxBody({
          id: `book_14_low_${i + 1}`,
          kind: 'book',
          x: bx,
          y: 389,
          w: 22,
          h: 92,
          mass: 1.15,
          friction: 0.6,
          restitution: 0.1,
          color: i === 0 ? '#B5A8D1' : '#7FA68A',
          material: 'wood',
        })
      );

      const bell14 = createCircleBody({
        id: 'bell_14',
        kind: 'bell',
        x: 785,
        y: 415,
        radius: 22,
        isStatic: true,
        color: '#E6C675',
        material: 'bell',
      });

      return {
        bodies: [upperShelf, bridge14, lowerShelf, ...upperBooks, marble14, pin14, ...lowBooks, bell14],
      };
    },
  },

  // =========================================================
  // NIVEL 15 · Ricochete Matinal
  // =========================================================
  {
    id: 15,
    numberLabel: '15',
    title: 'Ricochete Matinal',
    subtitle: 'Alinhe os dois desvios antes de lançar a torrada',
    objectIcon: 'toast',
    idealTaps: 3,
    tapLimit: 3,
    hints: [
      { targetBodyId: 'plank_15a', label: 'Incline as duas tábuas para baixo à direita' },
      { targetBodyId: 'toaster_15', label: 'Depois dispare a torradeira até o prato', directionHint: { dx: 0.6, dy: -1 } },
    ],
    goal: {
      type: 'bodies_in_zone',
      zone: { x: 645, y: 380, w: 175, h: 85 },
      requiredBodyIds: ['toast_15'],
      holdDuration: 0.7,
    },
    setup: () => {
      const table = createBoxBody({
        id: 'table',
        kind: 'shelf',
        x: WORLD_W * 0.5,
        y: 505,
        w: 690,
        h: 18,
        isStatic: true,
        color: '#E3DDD2',
        material: 'wood',
      });

      const toaster = createBoxBody({
        id: 'toaster_15',
        kind: 'toaster',
        x: 175,
        y: 452,
        w: 94,
        h: 82,
        isStatic: true,
        color: '#8AB4C8',
        material: 'ceramic',
        tapAction: 'launch_toast',
        launchTargetId: 'toast_15',
        launchImpulse: { vx: 195, vy: -480 },
      });

      const toast = createBoxBody({
        id: 'toast_15',
        kind: 'toast',
        x: 175,
        y: 386,
        w: 44,
        h: 46,
        mass: 1.0,
        friction: 0.16,
        restitution: 0.08,
        color: '#E0B989',
        accentColor: '#B88B58',
        material: 'soft',
      });

      const plankA = createBoxBody({
        id: 'plank_15a',
        kind: 'hinge_plank',
        x: 390,
        y: 235,
        w: 175,
        h: 14,
        angle: -0.62,
        targetAngle: -0.62,
        angleOptions: [-0.62, 0.25],
        angleMotorStiffness: 24,
        isStatic: true,
        isPinnedPivot: true,
        friction: 0.16,
        restitution: 0.05,
        color: '#D5BFA8',
        material: 'wood',
        tapAction: 'tilt_toggle',
      });

      const plankB = createBoxBody({
        id: 'plank_15b',
        kind: 'hinge_plank',
        x: 565,
        y: 345,
        w: 168,
        h: 14,
        angle: -0.58,
        targetAngle: -0.58,
        angleOptions: [-0.58, 0.28],
        angleMotorStiffness: 24,
        isStatic: true,
        isPinnedPivot: true,
        friction: 0.16,
        restitution: 0.05,
        color: '#D5BFA8',
        material: 'wood',
        tapAction: 'tilt_toggle',
      });

      const plateBase = createBoxBody({
        id: 'plate_15_base',
        kind: 'plate',
        x: 735,
        y: 468,
        w: 174,
        h: 14,
        isStatic: true,
        friction: 0.85,
        color: '#FCFBF8',
        material: 'ceramic',
        collisionGroup: -1,
      });
      const plateRimL = createBoxBody({
        id: 'plate_15_l',
        kind: 'plate',
        x: 648,
        y: 446,
        w: 12,
        h: 48,
        angle: -0.22,
        isStatic: true,
        color: '#FCFBF8',
        material: 'ceramic',
        collisionGroup: -1,
      });
      const plateRimR = createBoxBody({
        id: 'plate_15_r',
        kind: 'plate',
        x: 822,
        y: 446,
        w: 12,
        h: 48,
        angle: 0.22,
        isStatic: true,
        color: '#FCFBF8',
        material: 'ceramic',
        collisionGroup: -1,
      });

      return {
        bodies: [table, toaster, toast, plankA, plankB, plateBase, plateRimL, plateRimR],
      };
    },
  },

  // =========================================================
  // NIVEL 16 · Salto na Pia
  // =========================================================
  {
    id: 16,
    numberLabel: '16',
    title: 'Salto na Pia',
    subtitle: 'Escolha apenas as 2 esponjas certas com 3 toques',
    objectIcon: 'soap',
    idealTaps: 3,
    tapLimit: 3,
    hints: [
      { targetBodyId: 'pin_soap_16', label: 'Solte a trava e use só as duas esponjas altas' },
      { targetBodyId: 'sponge_16a', label: 'Ignore a esponja de baixo para não gastar toques' },
    ],
    goal: {
      type: 'bodies_in_zone',
      zone: { x: 675, y: 380, w: 150, h: 85 },
      requiredBodyIds: ['soap_16'],
      holdDuration: 0.7,
    },
    setup: () => {
      const table = createBoxBody({
        id: 'table',
        kind: 'shelf',
        x: WORLD_W * 0.5,
        y: 505,
        w: 690,
        h: 18,
        isStatic: true,
        color: '#E3DDD2',
        material: 'wood',
      });

      const slide = createBoxBody({
        id: 'slide_16',
        kind: 'ramp',
        x: 190,
        y: 205,
        w: 165,
        h: 14,
        angle: 0.28,
        isStatic: true,
        friction: 0.02,
        color: '#CFE4EE',
        material: 'ceramic',
      });

      const pinSoap = createBoxBody({
        id: 'pin_soap_16',
        kind: 'pin',
        x: 225,
        y: 190,
        w: 16,
        h: 46,
        angle: 0.28,
        isStatic: true,
        color: '#7FA68A',
        material: 'wood',
        tapAction: 'remove',
      });

      const soap = createBoxBody({
        id: 'soap_16',
        kind: 'soap',
        x: 160,
        y: 166,
        w: 44,
        h: 24,
        angle: 0.28,
        mass: 0.85,
        friction: 0.03,
        restitution: 0.35,
        color: '#E8B8C1',
        accentColor: '#FCFBF8',
        material: 'soft',
      });

      const div1 = createBoxBody({
        id: 'div_16_1',
        kind: 'wall',
        x: 446,
        y: 442,
        w: 18,
        h: 108,
        isStatic: true,
        color: '#FCFBF8',
        material: 'ceramic',
      });
      const div2 = createBoxBody({
        id: 'div_16_2',
        kind: 'wall',
        x: 618,
        y: 442,
        w: 18,
        h: 108,
        isStatic: true,
        color: '#FCFBF8',
        material: 'ceramic',
      });

      const spongeA = createBoxBody({
        id: 'sponge_16a',
        kind: 'sponge',
        x: 365,
        y: 355,
        w: 100,
        h: 26,
        isStatic: true,
        restitution: 0.35,
        color: '#E6C675',
        material: 'spring',
        tapAction: 'bounce_pad',
        bounceImpulse: { vx: 132, vy: -305 },
      });

      const spongeB = createBoxBody({
        id: 'sponge_16b',
        kind: 'sponge',
        x: 530,
        y: 364,
        w: 100,
        h: 26,
        isStatic: true,
        restitution: 0.35,
        color: '#E6C675',
        material: 'spring',
        tapAction: 'bounce_pad',
        bounceImpulse: { vx: 185, vy: -345 },
      });

      // Decoy sponge resting on the counter between dividers
      const spongeDecoy = createBoxBody({
        id: 'sponge_16_decoy',
        kind: 'sponge',
        x: 530,
        y: 482,
        w: 84,
        h: 22,
        isStatic: true,
        restitution: 0.4,
        color: '#DDA089',
        material: 'spring',
        tapAction: 'bounce_pad',
        bounceImpulse: { vx: 30, vy: -190 },
      });

      const dishBase = createBoxBody({
        id: 'soap_dish_16',
        kind: 'soap_dish',
        x: 750,
        y: 468,
        w: 140,
        h: 14,
        isStatic: true,
        friction: 0.65,
        color: '#FCFBF8',
        material: 'ceramic',
        collisionGroup: -1,
      });
      const dishL = createBoxBody({
        id: 'dish_16_l',
        kind: 'soap_dish',
        x: 682,
        y: 454,
        w: 12,
        h: 32,
        isStatic: true,
        color: '#FCFBF8',
        material: 'ceramic',
        collisionGroup: -1,
      });
      const dishR = createBoxBody({
        id: 'dish_16_r',
        kind: 'soap_dish',
        x: 818,
        y: 454,
        w: 12,
        h: 32,
        isStatic: true,
        color: '#FCFBF8',
        material: 'ceramic',
        collisionGroup: -1,
      });

      return {
        bodies: [
          table,
          slide,
          pinSoap,
          soap,
          div1,
          div2,
          spongeA,
          spongeB,
          spongeDecoy,
          dishBase,
          dishL,
          dishR,
        ],
      };
    },
  },

  // =========================================================
  // NIVEL 17 · Cascata Invertida
  // =========================================================
  {
    id: 17,
    numberLabel: '17',
    title: 'Cascata Invertida',
    subtitle: 'Trace o caminho certo sem tocar na folha falsa',
    objectIcon: 'drop',
    idealTaps: 3,
    tapLimit: 3,
    hints: [
      { targetBodyId: 'leaf_17_1', label: 'Gire a folha mais alta e siga a descida até o vaso' },
      { targetBodyId: 'leaf_17_3', label: 'A folha alta à direita é um desvio: ignore-a' },
    ],
    goal: {
      type: 'drops_collected',
      requiredCount: 5,
      holdDuration: 0.3,
    },
    setup: () => {
      const table = createBoxBody({
        id: 'table',
        kind: 'shelf',
        x: WORLD_W * 0.5,
        y: 505,
        w: 670,
        h: 18,
        isStatic: true,
        color: '#E3DDD2',
        material: 'wood',
      });

      const leaf1 = createBoxBody({
        id: 'leaf_17_1',
        kind: 'leaf',
        x: 245,
        y: 215,
        w: 132,
        h: 14,
        angle: -0.45,
        targetAngle: -0.45,
        angleOptions: [-0.45, 0.42],
        angleMotorStiffness: 20,
        isStatic: true,
        isPinnedPivot: true,
        friction: 0.02,
        restitution: 0.25,
        color: '#7FA68A',
        material: 'ceramic',
        tapAction: 'tilt_toggle',
      });

      const leaf2 = createBoxBody({
        id: 'leaf_17_2',
        kind: 'leaf',
        x: 410,
        y: 318,
        w: 136,
        h: 14,
        angle: -0.42,
        targetAngle: -0.42,
        angleOptions: [-0.42, 0.4],
        angleMotorStiffness: 20,
        isStatic: true,
        isPinnedPivot: true,
        friction: 0.02,
        restitution: 0.25,
        color: '#7FA68A',
        material: 'ceramic',
        tapAction: 'tilt_toggle',
      });

      // Decoy upper-right leaf that catches nothing in the real cascade
      const leafDecoy = createBoxBody({
        id: 'leaf_17_decoy',
        kind: 'leaf',
        x: 565,
        y: 215,
        w: 120,
        h: 14,
        angle: 0.42,
        targetAngle: 0.42,
        angleOptions: [0.42, -0.42],
        angleMotorStiffness: 20,
        isStatic: true,
        isPinnedPivot: true,
        friction: 0.02,
        restitution: 0.25,
        color: '#B5A8D1',
        material: 'ceramic',
        tapAction: 'tilt_toggle',
      });

      const leaf3 = createBoxBody({
        id: 'leaf_17_3',
        kind: 'leaf',
        x: 565,
        y: 398,
        w: 132,
        h: 14,
        angle: -0.4,
        targetAngle: -0.4,
        angleOptions: [-0.4, 0.36],
        angleMotorStiffness: 20,
        isStatic: true,
        isPinnedPivot: true,
        friction: 0.02,
        restitution: 0.25,
        color: '#7FA68A',
        material: 'ceramic',
        tapAction: 'tilt_toggle',
      });

      const pot = createBoxBody({
        id: 'pot_17',
        kind: 'pot',
        x: 705,
        y: 462,
        w: 96,
        h: 68,
        isStatic: true,
        color: '#DDA089',
        accentColor: '#7FA68A',
        material: 'ceramic',
        sensorOnly: true,
      });

      return {
        bodies: [table, leaf1, leaf2, leafDecoy, leaf3, pot],
        faucet: {
          x: 215,
          y: 100,
          interval: 0.9,
          timer: 0.65,
          active: true,
          dropsSpawned: 0,
          dropsCollected: 0,
          targetDrops: 5,
        },
      };
    },
  },

  // =========================================================
  // NIVEL 18 · Chá de Arquimedes II
  // =========================================================
  {
    id: 18,
    numberLabel: '18',
    title: 'Chá de Arquimedes II',
    subtitle: 'Escolha o gelo suficiente e alinhe a ponte de saída',
    objectIcon: 'lemon',
    idealTaps: 3,
    tapLimit: 3,
    hints: [
      { targetBodyId: 'pin_ice_18_double', label: 'Um cubo só não basta: solte os 2 cubos grandes na jarra' },
      { targetBodyId: 'exit_ramp_18', label: 'Abaixe a rampa direita e depois libere o limão' },
    ],
    goal: {
      type: 'bodies_in_zone',
      zone: { x: 645, y: 375, w: 120, h: 125 },
      requiredBodyIds: ['lemon_18'],
      holdDuration: 0.75,
    },
    setup: () => {
      const table = createBoxBody({
        id: 'table',
        kind: 'shelf',
        x: WORLD_W * 0.5,
        y: 505,
        w: 690,
        h: 18,
        isStatic: true,
        color: '#E3DDD2',
        material: 'wood',
      });

      const pitcherWalls = createCupWalls(375, 405, 180, 185, '#E8F1F5', -1);

      // Left decoy trapdoor: 1 small cube (not enough buoyancy!)
      const pinIceSmall = createBoxBody({
        id: 'pin_ice_18_small',
        kind: 'pin',
        x: 318,
        y: 182,
        w: 58,
        h: 13,
        isStatic: true,
        color: '#DDA089',
        material: 'wood',
        tapAction: 'remove',
      });
      const iceSmall = createBoxBody({
        id: 'ice_18_s',
        kind: 'ice',
        x: 318,
        y: 158,
        w: 30,
        h: 30,
        mass: 1.2,
        friction: 0.08,
        color: '#CFE4EE',
        material: 'glass',
        collisionGroup: -6,
      });

      // Right trapdoor: 2 heavy cubes (raises tea enough!)
      const pinIceDouble = createBoxBody({
        id: 'pin_ice_18_double',
        kind: 'pin',
        x: 416,
        y: 182,
        w: 96,
        h: 14,
        isStatic: true,
        color: '#8AB4C8',
        material: 'wood',
        tapAction: 'remove',
      });
      const iceD1 = createBoxBody({
        id: 'ice_18_d1',
        kind: 'ice',
        x: 394,
        y: 154,
        w: 36,
        h: 36,
        mass: 2.3,
        friction: 0.08,
        color: '#CFE4EE',
        material: 'glass',
        collisionGroup: -6,
      });
      const iceD2 = createBoxBody({
        id: 'ice_18_d2',
        kind: 'ice',
        x: 438,
        y: 154,
        w: 36,
        h: 36,
        mass: 2.3,
        friction: 0.08,
        color: '#CFE4EE',
        material: 'glass',
        collisionGroup: -6,
      });

      const raft = createBoxBody({
        id: 'raft_18',
        kind: 'float_raft',
        x: 375,
        y: 388,
        w: 154,
        h: 14,
        isStatic: true,
        friction: 0.04,
        color: '#D5BFA8',
        material: 'wood',
        collisionGroup: -6,
      });

      const lemonRamp = createBoxBody({
        id: 'lemon_ramp_18',
        kind: 'ramp',
        x: 195,
        y: 280,
        w: 155,
        h: 12,
        angle: 0.22,
        isStatic: true,
        friction: 0.04,
        color: '#D5BFA8',
        material: 'wood',
      });
      const pinLemon = createBoxBody({
        id: 'pin_lemon_18',
        kind: 'pin',
        x: 240,
        y: 266,
        w: 15,
        h: 44,
        angle: 0.22,
        isStatic: true,
        color: '#E6C675',
        material: 'wood',
        tapAction: 'remove',
      });
      const lemon = createCircleBody({
        id: 'lemon_18',
        kind: 'lemon',
        x: 155,
        y: 250,
        radius: 19,
        mass: 0.75,
        friction: 0.04,
        restitution: 0.12,
        color: '#E6C675',
        accentColor: '#7FA68A',
        material: 'soft',
      });

      const exitBridge = createBoxBody({
        id: 'exit_ramp_18',
        kind: 'hinge_plank',
        x: 550,
        y: 342,
        w: 165,
        h: 12,
        angle: -0.35,
        targetAngle: -0.35,
        angleOptions: [-0.35, 0.24],
        angleMotorStiffness: 22,
        isStatic: true,
        isPinnedPivot: true,
        friction: 0.04,
        color: '#D5BFA8',
        material: 'wood',
        tapAction: 'tilt_toggle',
      });

      const servingGlass = createCupWalls(705, 442, 114, 108, '#E8F1F5', -2);

      return {
        bodies: [
          table,
          ...pitcherWalls,
          pinIceSmall,
          iceSmall,
          pinIceDouble,
          iceD1,
          iceD2,
          raft,
          lemonRamp,
          pinLemon,
          lemon,
          exitBridge,
          ...servingGlass,
        ],
        liquids: [
          {
            id: 'tea_18',
            x: 291,
            y: 290,
            w: 168,
            h: 200,
            baseSurfaceY: 392,
            surfaceY: 392,
            targetSurfaceY: 392,
            density: 0.85,
            risePerUnitArea: 18,
            color: 'rgba(221, 160, 137, 0.44)',
            surfaceColor: '#DDA089',
            wavePhase: 0,
            waveAmplitude: 1.6,
          },
        ],
        floatBridge: {
          raftId: 'raft_18',
          liquidId: 'tea_18',
          baseOffset: -4,
        },
      };
    },
  },

  // =========================================================
  // NIVEL 19 · Móbile do Equilíbrio
  // =========================================================
  {
    id: 19,
    numberLabel: '19',
    title: 'Móbile do Equilíbrio',
    subtitle: 'Iguale 4 no total (2 + 2) com exatos 3 toques',
    objectIcon: 'mobile',
    idealTaps: 3,
    tapLimit: 3,
    hints: [
      { targetBodyId: 'clip_19_l1', label: 'A haste menor precisa de 2 na esquerda (1 + 1) e 2 na direita' },
      { targetBodyId: 'clip_19_r2', label: 'Na direita, solte direto o botão de peso 2' },
    ],
    goal: {
      type: 'mobile_balanced',
      holdDuration: 1.0,
    },
    setup: () => {
      const mainBar = createBoxBody({
        id: 'mobile_main',
        kind: 'mobile_bar',
        x: 455,
        y: 230,
        w: 310,
        h: 10,
        mass: 4.5,
        isStatic: true,
        isPinnedPivot: true,
        sensorOnly: true,
        restoringSpring: 2.2,
        angularDamping: 3.8,
        angleMin: -0.18,
        angleMax: 0.18,
        color: '#D5BFA8',
        material: 'wood',
        collisionGroup: -4,
      });

      const mainLeftPlat = createBoxBody({
        id: 'mob_main_l',
        kind: 'scale_pan',
        x: 455 - 140,
        y: 230 + 62,
        w: 88,
        h: 10,
        isStatic: true,
        friction: 0.95,
        color: '#FCFBF8',
        material: 'wood',
        collisionGroup: -4,
      });

      const mainRightDummy = createBoxBody({
        id: 'mob_main_r',
        kind: 'scale_pan',
        x: 455 + 140,
        y: 230 + 62,
        w: 10,
        h: 10,
        isStatic: true,
        sensorOnly: true,
        collisionGroup: -4,
      });

      const fixedKey = createBoxBody({
        id: 'key_19_fixed',
        kind: 'key_weight',
        x: 455 - 140,
        y: 230 + 38,
        w: 40,
        h: 36,
        mass: 4.0,
        weightValue: 4,
        friction: 0.95,
        restitution: 0.04,
        color: '#E6C675',
        material: 'ceramic',
      });

      const subBar = createBoxBody({
        id: 'mobile_sub',
        kind: 'mobile_bar',
        x: 595,
        y: 325,
        w: 185,
        h: 10,
        mass: 3.0,
        isStatic: true,
        isPinnedPivot: true,
        sensorOnly: true,
        restoringSpring: 2.6,
        angularDamping: 3.8,
        angleMin: -0.2,
        angleMax: 0.2,
        color: '#D5BFA8',
        material: 'wood',
        collisionGroup: -5,
      });

      const subLeftPlat = createBoxBody({
        id: 'mob_sub_l',
        kind: 'scale_pan',
        x: 595 - 80,
        y: 325 + 62,
        w: 94,
        h: 10,
        isStatic: true,
        friction: 0.95,
        color: '#FCFBF8',
        material: 'wood',
        collisionGroup: -5,
      });

      const subRightPlat = createBoxBody({
        id: 'mob_sub_r',
        kind: 'scale_pan',
        x: 595 + 80,
        y: 325 + 62,
        w: 94,
        h: 10,
        isStatic: true,
        friction: 0.95,
        color: '#FCFBF8',
        material: 'wood',
        collisionGroup: -5,
      });

      // Left side of subBar (x ~ 515): 1, 1, 3
      const bL1a = createCircleBody({
        id: 'btn_19_l1a',
        kind: 'button_weight',
        x: 486,
        y: 126,
        radius: 16,
        mass: 1.0,
        weightValue: 1,
        restitution: 0.04,
        friction: 0.95,
        attachedToClip: true,
        color: '#8AB4C8',
        material: 'ceramic',
        collisionGroup: -4,
      });
      const clipL1a = createBoxBody({
        id: 'clip_19_l1',
        kind: 'clip',
        x: 486,
        y: 86,
        w: 22,
        h: 22,
        isStatic: true,
        color: '#B5A8D1',
        material: 'wood',
        tapAction: 'drop_item',
        launchTargetId: 'btn_19_l1a',
        sensorOnly: true,
      });

      const bL1b = createCircleBody({
        id: 'btn_19_l1b',
        kind: 'button_weight',
        x: 526,
        y: 164,
        radius: 16,
        mass: 1.0,
        weightValue: 1,
        restitution: 0.04,
        friction: 0.95,
        attachedToClip: true,
        color: '#7FA68A',
        material: 'ceramic',
        collisionGroup: -4,
      });
      const clipL1b = createBoxBody({
        id: 'clip_19_l2',
        kind: 'clip',
        x: 526,
        y: 122,
        w: 22,
        h: 22,
        isStatic: true,
        color: '#B5A8D1',
        material: 'wood',
        tapAction: 'drop_item',
        launchTargetId: 'btn_19_l1b',
        sensorOnly: true,
      });

      const bL3 = createCircleBody({
        id: 'btn_19_l3',
        kind: 'button_weight',
        x: 566,
        y: 126,
        radius: 21,
        mass: 3.0,
        weightValue: 3,
        restitution: 0.04,
        friction: 0.95,
        attachedToClip: true,
        color: '#DDA089',
        material: 'ceramic',
        collisionGroup: -4,
      });
      const clipL3 = createBoxBody({
        id: 'clip_19_l3',
        kind: 'clip',
        x: 566,
        y: 84,
        w: 22,
        h: 22,
        isStatic: true,
        color: '#B5A8D1',
        material: 'wood',
        tapAction: 'drop_item',
        launchTargetId: 'btn_19_l3',
        sensorOnly: true,
      });

      // Right side of subBar (x ~ 675): 1, 2, 4
      const bR1 = createCircleBody({
        id: 'btn_19_r1',
        kind: 'button_weight',
        x: 644,
        y: 126,
        radius: 16,
        mass: 1.0,
        weightValue: 1,
        restitution: 0.04,
        friction: 0.95,
        attachedToClip: true,
        color: '#8AB4C8',
        material: 'ceramic',
        collisionGroup: -4,
      });
      const clipR1 = createBoxBody({
        id: 'clip_19_r1',
        kind: 'clip',
        x: 644,
        y: 86,
        w: 22,
        h: 22,
        isStatic: true,
        color: '#B5A8D1',
        material: 'wood',
        tapAction: 'drop_item',
        launchTargetId: 'btn_19_r1',
        sensorOnly: true,
      });

      const bR2 = createCircleBody({
        id: 'btn_19_r2',
        kind: 'button_weight',
        x: 686,
        y: 166,
        radius: 19,
        mass: 2.0,
        weightValue: 2,
        restitution: 0.04,
        friction: 0.95,
        attachedToClip: true,
        color: '#E6C675',
        material: 'ceramic',
        collisionGroup: -4,
      });
      const clipR2 = createBoxBody({
        id: 'clip_19_r2',
        kind: 'clip',
        x: 686,
        y: 122,
        w: 22,
        h: 22,
        isStatic: true,
        color: '#B5A8D1',
        material: 'wood',
        tapAction: 'drop_item',
        launchTargetId: 'btn_19_r2',
        sensorOnly: true,
      });

      const bR4 = createCircleBody({
        id: 'btn_19_r4',
        kind: 'button_weight',
        x: 732,
        y: 128,
        radius: 23,
        mass: 4.0,
        weightValue: 4,
        restitution: 0.04,
        friction: 0.95,
        attachedToClip: true,
        color: '#DDA089',
        material: 'ceramic',
        collisionGroup: -4,
      });
      const clipR4 = createBoxBody({
        id: 'clip_19_r4',
        kind: 'clip',
        x: 732,
        y: 82,
        w: 22,
        h: 22,
        isStatic: true,
        color: '#B5A8D1',
        material: 'wood',
        tapAction: 'drop_item',
        launchTargetId: 'btn_19_r4',
        sensorOnly: true,
      });

      return {
        bodies: [
          mainBar,
          mainLeftPlat,
          mainRightDummy,
          fixedKey,
          subBar,
          subLeftPlat,
          subRightPlat,
          bL1a,
          clipL1a,
          bL1b,
          clipL1b,
          bL3,
          clipL3,
          bR1,
          clipR1,
          bR2,
          clipR2,
          bR4,
          clipR4,
        ],
        mobiles: [
          {
            barId: 'mobile_main',
            leftPlatformId: 'mob_main_l',
            rightPlatformId: 'mob_main_r',
            armLength: 140,
            panDrop: 62,
            dropLength: 0,
          },
          {
            barId: 'mobile_sub',
            parentBarId: 'mobile_main',
            attachOffsetX: 140,
            dropLength: 95,
            leftPlatformId: 'mob_sub_l',
            rightPlatformId: 'mob_sub_r',
            armLength: 80,
            panDrop: 62,
          },
        ],
      };
    },
  },

  // =========================================================
  // NIVEL 20 · Biscoitos com Desvio
  // =========================================================
  {
    id: 20,
    numberLabel: '20',
    title: 'Biscoitos com Desvio',
    subtitle: 'Destrave o funil e alterne os portões com 4 toques',
    objectIcon: 'cookie',
    idealTaps: 4,
    tapLimit: 4,
    hints: [
      { targetBodyId: 'pin_20_mouth', label: 'Primeiro tire a trava no meio do funil sobre o pote' },
      { targetBodyId: 'gate_20_l', label: 'Depois abra a esquerda, vire a tábua central e abra a direita' },
    ],
    goal: {
      type: 'bodies_in_zone',
      zone: { x: 400, y: 390, w: 160, h: 100 },
      requiredBodyIds: ['cookie_20_1', 'cookie_20_2', 'cookie_20_3'],
      holdDuration: 0.8,
    },
    setup: () => {
      const table = createBoxBody({
        id: 'table',
        kind: 'shelf',
        x: WORLD_W * 0.5,
        y: 505,
        w: 670,
        h: 18,
        isStatic: true,
        color: '#E3DDD2',
        material: 'wood',
      });

      const rampL = createBoxBody({
        id: 'ramp_20_l',
        kind: 'ramp',
        x: 255,
        y: 180,
        w: 215,
        h: 12,
        angle: 0.3,
        isStatic: true,
        friction: 0.04,
        color: '#D5BFA8',
        material: 'wood',
      });
      const gateL = createBoxBody({
        id: 'gate_20_l',
        kind: 'gate',
        x: 330,
        y: 175,
        w: 14,
        h: 54,
        angle: 0.3,
        isStatic: true,
        color: '#DDA089',
        material: 'wood',
        tapAction: 'remove',
      });

      const rampR = createBoxBody({
        id: 'ramp_20_r',
        kind: 'ramp',
        x: 705,
        y: 180,
        w: 215,
        h: 12,
        angle: -0.3,
        isStatic: true,
        friction: 0.04,
        color: '#D5BFA8',
        material: 'wood',
      });
      const gateR = createBoxBody({
        id: 'gate_20_r',
        kind: 'gate',
        x: 630,
        y: 175,
        w: 14,
        h: 54,
        angle: -0.3,
        isStatic: true,
        color: '#DDA089',
        material: 'wood',
        tapAction: 'remove',
      });

      const bridge = createBoxBody({
        id: 'bridge_20',
        kind: 'hinge_plank',
        x: 480,
        y: 280,
        w: 132,
        h: 12,
        angle: 0.3,
        targetAngle: 0.3,
        angleOptions: [0.3, -0.3],
        angleMotorStiffness: 20,
        isStatic: true,
        isPinnedPivot: true,
        friction: 0.05,
        color: '#8AB4C8',
        accentColor: '#7FA68A',
        material: 'wood',
        tapAction: 'tilt_toggle',
      });

      const pinMouth = createBoxBody({
        id: 'pin_20_mouth',
        kind: 'pin',
        x: 480,
        y: 368,
        w: 150,
        h: 14,
        isStatic: true,
        color: '#7FA68A',
        material: 'wood',
        tapAction: 'remove',
      });

      const guideL = createBoxBody({
        id: 'guide_20_l',
        kind: 'wall',
        x: 368,
        y: 332,
        w: 10,
        h: 118,
        angle: -0.34,
        isStatic: true,
        color: '#E3DDD2',
        material: 'glass',
      });
      const guideR = createBoxBody({
        id: 'guide_20_r',
        kind: 'wall',
        x: 592,
        y: 332,
        w: 10,
        h: 118,
        angle: 0.34,
        isStatic: true,
        color: '#E3DDD2',
        material: 'glass',
      });

      const c1 = createCircleBody({
        id: 'cookie_20_1',
        kind: 'cookie',
        x: 200,
        y: 135,
        radius: 18,
        mass: 0.85,
        friction: 0.05,
        restitution: 0.08,
        color: '#DFB684',
        accentColor: '#9C7853',
        material: 'soft',
      });
      const c2 = createCircleBody({
        id: 'cookie_20_2',
        kind: 'cookie',
        x: 250,
        y: 150,
        radius: 18,
        mass: 0.85,
        friction: 0.05,
        restitution: 0.08,
        color: '#DFB684',
        accentColor: '#9C7853',
        material: 'soft',
      });
      const c3 = createCircleBody({
        id: 'cookie_20_3',
        kind: 'cookie',
        x: 735,
        y: 142,
        radius: 18,
        mass: 0.85,
        friction: 0.05,
        restitution: 0.08,
        color: '#DFB684',
        accentColor: '#9C7853',
        material: 'soft',
      });

      const jarWalls = createCupWalls(480, 442, 166, 112, '#E8F1F5', -1);

      return {
        bodies: [
          table,
          rampL,
          gateL,
          rampR,
          gateR,
          bridge,
          pinMouth,
          guideL,
          guideR,
          c1,
          c2,
          c3,
          ...jarWalls,
        ],
      };
    },
  },

  // =========================================================
  // NIVEL 21 · Pêndulo na Hora Certa
  // =========================================================
  {
    id: 21,
    numberLabel: '21',
    title: 'Pêndulo na Hora Certa',
    subtitle: 'Desbloqueie o caminho e solte no balanço certo',
    objectIcon: 'pendulum',
    idealTaps: 3,
    tapLimit: 3,
    hints: [
      { targetBodyId: 'ramp_21_1', label: 'Alinhe a rampa central e remova a trava da rampa inferior' },
      { targetBodyId: 'pendulum_clip', label: 'Ignore a trava sobre o pote e solte o pêndulo para a direita', directionHint: { dx: 1, dy: 0 } },
    ],
    goal: {
      type: 'bodies_in_zone',
      zone: { x: 690, y: 390, w: 120, h: 105 },
      requiredBodyIds: ['marble_21'],
      holdDuration: 0.7,
    },
    setup: () => {
      const table = createBoxBody({
        id: 'table',
        kind: 'shelf',
        x: WORLD_W * 0.5,
        y: 505,
        w: 680,
        h: 18,
        isStatic: true,
        color: '#E3DDD2',
        material: 'wood',
      });

      const pendulumClip = createBoxBody({
        id: 'pendulum_clip',
        kind: 'clip',
        x: 260,
        y: 78,
        w: 36,
        h: 36,
        isStatic: true,
        color: '#B5A8D1',
        material: 'wood',
        tapAction: 'release_pendulum',
        tapRadiusBonus: 20,
        sensorOnly: true,
      });

      const marble = createCircleBody({
        id: 'marble_21',
        kind: 'marble',
        x: 260,
        y: 228,
        radius: 17,
        mass: 1.0,
        friction: 0.04,
        restitution: 0.3,
        color: '#8AB4C8',
        accentColor: '#FCFBF8',
        material: 'glass',
      });

      const ramp1 = createBoxBody({
        id: 'ramp_21_1',
        kind: 'hinge_plank',
        x: 455,
        y: 315,
        w: 170,
        h: 13,
        angle: -0.36,
        targetAngle: -0.36,
        angleOptions: [-0.36, 0.28],
        angleMotorStiffness: 20,
        isStatic: true,
        isPinnedPivot: true,
        friction: 0.04,
        color: '#D5BFA8',
        accentColor: '#7FA68A',
        material: 'wood',
        tapAction: 'tilt_toggle',
      });

      const ramp2 = createBoxBody({
        id: 'ramp_21_2',
        kind: 'ramp',
        x: 615,
        y: 374,
        w: 155,
        h: 13,
        angle: 0.28,
        isStatic: true,
        friction: 0.04,
        color: '#D5BFA8',
        material: 'wood',
      });

      const pinRamp2 = createBoxBody({
        id: 'pin_21_ramp',
        kind: 'pin',
        x: 638,
        y: 352,
        w: 14,
        h: 48,
        angle: 0.28,
        isStatic: true,
        color: '#7FA68A',
        material: 'wood',
        tapAction: 'remove',
      });

      // Decoy pin holding an oversized cork block over the jar
      const pinDecoy = createBoxBody({
        id: 'pin_21_decoy',
        kind: 'pin',
        x: 750,
        y: 245,
        w: 72,
        h: 14,
        isStatic: true,
        color: '#DDA089',
        material: 'wood',
        tapAction: 'remove',
      });
      const blockerCube = createBoxBody({
        id: 'blocker_21',
        kind: 'book',
        x: 750,
        y: 218,
        w: 94,
        h: 34,
        mass: 3.0,
        friction: 0.8,
        color: '#D5BFA8',
        material: 'wood',
      });

      const jar = createCupWalls(750, 448, 118, 96, '#E8F1F5', -1);

      return {
        bodies: [table, pendulumClip, marble, ramp1, ramp2, pinRamp2, pinDecoy, blockerCube, ...jar],
        pendulum: {
          anchorX: 260,
          anchorY: 78,
          length: 150,
          angle: 0,
          angularVel: 0,
          maxAngle: 0.82,
          frequency: 2.0,
          bobBodyId: 'marble_21',
          released: false,
        },
      };
    },
  },

  // =========================================================
  // NIVEL 22 · Orquestra Final
  // =========================================================
  {
    id: 22,
    numberLabel: '22',
    title: 'Orquestra Final',
    subtitle: 'Alinhe as duas prateleiras, tire a trava e dispare',
    objectIcon: 'bell',
    idealTaps: 4,
    tapLimit: 4,
    hints: [
      { targetBodyId: 'shelf_22a', label: 'Incline as duas prateleiras em cascata para a direita' },
      { targetBodyId: 'pin_22', label: 'Remova a trava dos livros e dispare a torradeira' },
    ],
    goal: {
      type: 'bell_rung',
      bellBodyId: 'bell_22',
      holdDuration: 0.65,
    },
    setup: () => {
      const table = createBoxBody({
        id: 'table',
        kind: 'shelf',
        x: 635,
        y: 455,
        w: 400,
        h: 18,
        isStatic: true,
        color: '#E3DDD2',
        material: 'wood',
        friction: 0.35,
      });

      const toaster = createBoxBody({
        id: 'toaster_22',
        kind: 'toaster',
        x: 150,
        y: 452,
        w: 92,
        h: 82,
        isStatic: true,
        color: '#8AB4C8',
        material: 'ceramic',
        tapAction: 'launch_toast',
        launchTargetId: 'marble_22',
        launchImpulse: { vx: 205, vy: -460 },
      });

      const marble = createCircleBody({
        id: 'marble_22',
        kind: 'marble',
        x: 150,
        y: 392,
        radius: 17,
        mass: 1.25,
        friction: 0.04,
        restitution: 0.16,
        color: '#DDA089',
        accentColor: '#FCFBF8',
        material: 'ceramic',
      });

      const shelfA = createBoxBody({
        id: 'shelf_22a',
        kind: 'hinge_plank',
        x: 375,
        y: 252,
        w: 175,
        h: 13,
        angle: -0.48,
        targetAngle: -0.48,
        angleOptions: [-0.48, 0.3],
        angleMotorStiffness: 22,
        isStatic: true,
        isPinnedPivot: true,
        friction: 0.04,
        color: '#D5BFA8',
        material: 'wood',
        tapAction: 'tilt_toggle',
      });

      const shelfB = createBoxBody({
        id: 'shelf_22b',
        kind: 'hinge_plank',
        x: 515,
        y: 342,
        w: 165,
        h: 13,
        angle: -0.46,
        targetAngle: -0.46,
        angleOptions: [-0.46, 0.3],
        angleMotorStiffness: 22,
        isStatic: true,
        isPinnedPivot: true,
        friction: 0.04,
        color: '#D5BFA8',
        material: 'wood',
        tapAction: 'tilt_toggle',
      });

      const pinFin = createBoxBody({
        id: 'pin_22',
        kind: 'pin',
        x: 565,
        y: 417,
        w: 14,
        h: 58,
        isStatic: true,
        color: '#E6C675',
        material: 'wood',
        tapAction: 'remove',
      });

      const bookColors = ['#7FA68A', '#8AB4C8', '#B5A8D1'];
      const bookXs = [625, 682, 738];
      const books = bookXs.map((bx, i) =>
        createBoxBody({
          id: `book_22_${i + 1}`,
          kind: 'book',
          x: bx,
          y: 398,
          w: 22,
          h: 96,
          mass: 1.1,
          friction: 0.6,
          restitution: 0.1,
          color: bookColors[i],
          material: 'wood',
        })
      );

      const bell = createCircleBody({
        id: 'bell_22',
        kind: 'bell',
        x: 802,
        y: 424,
        radius: 22,
        isStatic: true,
        color: '#E6C675',
        material: 'bell',
      });

      return {
        bodies: [table, toaster, marble, shelfA, shelfB, pinFin, ...books, bell],
      };
    },
  },
];

export function createWorldFromLevel(level: LevelDefinition): PhysicsWorldState {
  const data = level.setup();
  return {
    bodies: data.bodies,
    liquids: data.liquids ?? [],
    scales: data.scales ?? [],
    mobiles: data.mobiles ?? [],
    pendulum: data.pendulum ?? null,
    faucet: data.faucet ?? null,
    floatBridge: data.floatBridge ?? null,
    particles: [],
    ripples: [],
    bellRung: false,
    bellRingTimer: 0,
    goalHoldTimer: 0,
    timeElapsed: 0,
    kineticEnergy: 0,
    panImpulsesY: new Map(),
  };
}

export function createTitleDiorama(): PhysicsWorldState {
  // Calm ambient physics diorama for the Title Screen
  const cupWalls = createCupWalls(730, 445, 118, 92, '#FCFBF8', -1);
  const ice = createBoxBody({
    id: 'title_ice',
    kind: 'ice',
    x: 730,
    y: 385,
    w: 32,
    h: 32,
    angle: 0.15,
    mass: 0.9,
    color: '#CFE4EE',
    material: 'glass',
  });
  const marble = createCircleBody({
    id: 'title_bob',
    kind: 'marble',
    x: 200,
    y: 260,
    radius: 16,
    color: '#8AB4C8',
    material: 'glass',
  });

  return {
    bodies: [...cupWalls, ice, marble],
    liquids: [
      {
        id: 'title_tea',
        x: 683,
        y: 412,
        w: 94,
        h: 68,
        baseSurfaceY: 418,
        surfaceY: 418,
        targetSurfaceY: 418,
        density: 1.45,
        color: 'rgba(138, 180, 200, 0.35)',
        surfaceColor: '#8AB4C8',
        wavePhase: 0,
        waveAmplitude: 1.5,
      },
    ],
    scales: [],
    mobiles: [],
    pendulum: {
      anchorX: 200,
      anchorY: 115,
      length: 145,
      angle: 0,
      angularVel: 0,
      maxAngle: 0.48,
      frequency: 1.35,
      bobBodyId: 'title_bob',
      released: false,
    },
    faucet: null,
    floatBridge: null,
    particles: [],
    ripples: [],
    bellRung: false,
    bellRingTimer: 0,
    goalHoldTimer: 0,
    timeElapsed: 0,
    kineticEnergy: 0,
    panImpulsesY: new Map(),
  };
}

export function evaluateLevelGoal(
  world: PhysicsWorldState,
  level: LevelDefinition,
  dt: number
): { progress: number; solved: boolean } {
  const goal = level.goal;
  let conditionMet = false;

  switch (goal.type) {
    case 'bodies_in_zone': {
      const z = goal.zone!;
      const ids = goal.requiredBodyIds ?? [];
      conditionMet = ids.every((id) => {
        const b = world.bodies.find((item) => item.id === id);
        if (!b || !b.active) return false;
        const inBox = b.x >= z.x && b.x <= z.x + z.w && b.y >= z.y && b.y <= z.y + z.h;
        const slow = Math.hypot(b.vx, b.vy) < 95;
        return inBox && slow;
      });
      break;
    }
    case 'bell_rung': {
      conditionMet = world.bellRung;
      break;
    }
    case 'scale_balanced': {
      const beam = world.bodies.find((b) => b.id === 'scale_beam');
      const leftPan = world.bodies.find((b) => b.id === 'pan_left');
      const rightPan = world.bodies.find((b) => b.id === 'pan_right');
      if (beam && leftPan && rightPan) {
        const hasLeftItem = world.bodies.some(
          (b) =>
            !b.isStatic &&
            !b.attachedToClip &&
            Math.abs(b.x - leftPan.x) < 75 &&
            b.y > leftPan.y - 95 &&
            b.y < leftPan.y + 15
        );
        const hasRightItem = world.bodies.some(
          (b) =>
            !b.isStatic &&
            !b.attachedToClip &&
            Math.abs(b.x - rightPan.x) < 75 &&
            b.y > rightPan.y - 95 &&
            b.y < rightPan.y + 15
        );
        const balanced = Math.abs(beam.angle) < 0.075 && Math.abs(beam.angularVel) < 0.14;
        conditionMet = hasLeftItem && hasRightItem && balanced;
      }
      break;
    }
    case 'drops_collected': {
      const target = goal.requiredCount ?? 5;
      if (world.faucet && world.faucet.dropsCollected >= target) {
        conditionMet = true;
      }
      break;
    }
    case 'mobile_balanced': {
      const mainBar = world.bodies.find((b) => b.id === 'mobile_main');
      const subBar = world.bodies.find((b) => b.id === 'mobile_sub');
      const subL = world.bodies.find((b) => b.id === 'mob_sub_l');
      const subR = world.bodies.find((b) => b.id === 'mob_sub_r');
      if (mainBar && subBar && subL && subR) {
        const hasLeft = world.bodies.some(
          (b) => !b.isStatic && !b.attachedToClip && Math.hypot(b.x - subL.x, b.y - subL.y) < 55
        );
        const hasRight = world.bodies.some(
          (b) => !b.isStatic && !b.attachedToClip && Math.hypot(b.x - subR.x, b.y - subR.y) < 55
        );
        const balanced =
          Math.abs(mainBar.angle) < 0.08 &&
          Math.abs(subBar.angle) < 0.08 &&
          Math.abs(mainBar.angularVel) < 0.15 &&
          Math.abs(subBar.angularVel) < 0.15;
        conditionMet = hasLeft && hasRight && balanced;
      }
      break;
    }
  }

  if (conditionMet) {
    world.goalHoldTimer += dt;
  } else {
    world.goalHoldTimer = Math.max(0, world.goalHoldTimer - dt * 1.5);
  }

  const progress = Math.min(1, world.goalHoldTimer / goal.holdDuration);
  return {
    progress,
    solved: world.goalHoldTimer >= goal.holdDuration,
  };
}
