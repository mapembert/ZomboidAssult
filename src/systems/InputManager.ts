import Phaser from 'phaser';

export class InputManager {
  private scene: Phaser.Scene;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private leftKey: Phaser.Input.Keyboard.Key | null = null;
  private rightKey: Phaser.Input.Keyboard.Key | null = null;
  private touchZones: { left: Phaser.GameObjects.Zone; right: Phaser.GameObjects.Zone } | null = null;
  private touchLeft: boolean = false;
  private touchRight: boolean = false;
  private debugGraphics: Phaser.GameObjects.Graphics | null = null;

  // Drag-to-column input properties
  private isDragging: boolean = false;
  private currentDragColumn: number | null = null;
  private dragZone: Phaser.GameObjects.Zone | null = null;
  private columnCount: number = 12;
  private screenWidth: number;
  private boundaryPadding: number;
  private columnPositions: number[] = [];

  constructor(scene: Phaser.Scene, columnCount: number = 12, boundaryPadding: number = 60) {
    this.scene = scene;
    this.columnCount = columnCount;
    this.screenWidth = scene.scale.width;
    this.boundaryPadding = boundaryPadding;

    // Calculate column positions (same algorithm as HeroManager)
    this.calculateColumnPositions();

    this.setupKeyboardInput();
    this.setupTouchInput();
    this.setupDragInput();
  }

  /**
   * Set up keyboard input (Arrow keys and A/D keys)
   */
  private setupKeyboardInput(): void {
    if (!this.scene.input.keyboard) {
      console.warn('Keyboard input not available');
      return;
    }

    // Create cursor keys (Arrow keys)
    this.cursors = this.scene.input.keyboard.createCursorKeys();

    // Add A and D keys
    this.leftKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.rightKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  }

  /**
   * Set up touch input zones (left/right halves of screen)
   */
  private setupTouchInput(): void {
    const screenWidth = this.scene.scale.width;
    const screenHeight = this.scene.scale.height;

    // Left zone (left half of screen)
    const leftZone = this.scene.add.zone(0, 0, screenWidth / 2, screenHeight);
    leftZone.setOrigin(0, 0);
    leftZone.setInteractive();
    leftZone.setDepth(-1); // Behind everything else

    // Right zone (right half of screen)
    const rightZone = this.scene.add.zone(screenWidth / 2, 0, screenWidth / 2, screenHeight);
    rightZone.setOrigin(0, 0);
    rightZone.setInteractive();
    rightZone.setDepth(-1); // Behind everything else

    // Left zone touch handlers
    leftZone.on('pointerdown', () => {
      this.touchLeft = true;
    });

    leftZone.on('pointerup', () => {
      this.touchLeft = false;
    });

    leftZone.on('pointerout', () => {
      this.touchLeft = false;
    });

    // Right zone touch handlers
    rightZone.on('pointerdown', () => {
      this.touchRight = true;
    });

    rightZone.on('pointerup', () => {
      this.touchRight = false;
    });

    rightZone.on('pointerout', () => {
      this.touchRight = false;
    });

    this.touchZones = { left: leftZone, right: rightZone };
  }

  /**
   * Calculate column positions (same algorithm as HeroManager)
   */
  private calculateColumnPositions(): void {
    const playableWidth = this.screenWidth - (2 * this.boundaryPadding);
    const spacing = playableWidth / (this.columnCount - 1);

    this.columnPositions = [];
    for (let i = 0; i < this.columnCount; i++) {
      this.columnPositions.push(this.boundaryPadding + i * spacing);
    }
  }

  /**
   * Map screen X position to nearest column index
   */
  private xPositionToColumn(x: number): number {
    if (this.columnPositions.length === 0) return 0;

    let nearestIndex = 0;
    let minDistance = Math.abs(x - this.columnPositions[0]);

    for (let i = 0; i < this.columnPositions.length; i++) {
      const distance = Math.abs(x - this.columnPositions[i]);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }

    return nearestIndex;
  }

  /**
   * Set up drag input (full-screen drag zone)
   */
  private setupDragInput(): void {
    const screenHeight = this.scene.scale.height;

    // Create full-screen drag zone
    this.dragZone = this.scene.add.zone(0, 0, this.screenWidth, screenHeight);
    this.dragZone.setOrigin(0, 0);
    this.dragZone.setInteractive();
    this.dragZone.setDepth(-2); // Behind touch zones

    // Drag handlers
    this.dragZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.currentDragColumn = this.xPositionToColumn(pointer.x);
    });

    this.dragZone.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        this.currentDragColumn = this.xPositionToColumn(pointer.x);
      }
    });

    this.dragZone.on('pointerup', () => {
      this.isDragging = false;
      this.currentDragColumn = null;
    });

    this.dragZone.on('pointerout', () => {
      this.isDragging = false;
      this.currentDragColumn = null;
    });
  }

  /**
   * Check if player is pressing left
   */
  isMovingLeft(): boolean {
    const keyboardLeft =
      (this.cursors?.left.isDown ?? false) || (this.leftKey?.isDown ?? false);
    return keyboardLeft || this.touchLeft;
  }

  /**
   * Check if player is pressing right
   */
  isMovingRight(): boolean {
    const keyboardRight =
      (this.cursors?.right.isDown ?? false) || (this.rightKey?.isDown ?? false);
    return keyboardRight || this.touchRight;
  }

  /**
   * Get target column from drag input
   * Returns column index (0-11) or null if not dragging
   */
  getTargetColumn(): number | null {
    if (this.isDragging && this.currentDragColumn !== null) {
      return this.currentDragColumn;
    }
    return null;
  }

  /**
   * Check if user is currently dragging
   */
  isDraggingActive(): boolean {
    return this.isDragging;
  }

  /**
   * Show debug visualization of touch zones
   */
  showDebugZones(show: boolean): void {
    if (show && !this.debugGraphics) {
      const screenWidth = this.scene.scale.width;
      const screenHeight = this.scene.scale.height;

      this.debugGraphics = this.scene.add.graphics();
      this.debugGraphics.setDepth(-1);

      // Left zone (red tint)
      this.debugGraphics.fillStyle(0xff0000, 0.2);
      this.debugGraphics.fillRect(0, 0, screenWidth / 2, screenHeight);

      // Right zone (green tint)
      this.debugGraphics.fillStyle(0x00ff00, 0.2);
      this.debugGraphics.fillRect(screenWidth / 2, 0, screenWidth / 2, screenHeight);

      console.log('Input debug zones enabled');
    } else if (!show && this.debugGraphics) {
      this.debugGraphics.destroy();
      this.debugGraphics = null;
      console.log('Input debug zones disabled');
    }
  }

  /**
   * Update method (currently not needed but available for future use)
   */
  update(): void {
    // Input state is polled, not updated
    // This method is here for consistency and future enhancements
  }

  /**
   * Cleanup when input manager is destroyed
   */
  destroy(): void {
    // Clean up touch zones
    if (this.touchZones) {
      this.touchZones.left.destroy();
      this.touchZones.right.destroy();
      this.touchZones = null;
    }

    // Clean up drag zone
    if (this.dragZone) {
      this.dragZone.destroy();
      this.dragZone = null;
    }

    // Clean up debug graphics
    if (this.debugGraphics) {
      this.debugGraphics.destroy();
      this.debugGraphics = null;
    }

    // Keyboard input is managed by Phaser, no cleanup needed
    this.cursors = null;
    this.leftKey = null;
    this.rightKey = null;
  }
}
