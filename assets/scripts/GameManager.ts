// GameManager.ts
// This script manages the main game logic for a simple step-based game in Cocos Creator.
// It handles road generation, player state, UI updates, and game state transitions.
// Example usage is provided at the end of the file.

import { _decorator, CCInteger, Component, instantiate, Label, Node, Prefab, Vec3 } from 'cc';
import { BLOCK_SIZE, PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

// Enum for block types on the road
// BT_NONE: empty space, BT_STONE: a stone block the player can step on
enum BlockType {
    BT_NONE,
    BT_STONE,
};

// Enum for game states
// GS_INIT: before game starts, GS_PLAYING: game in progress, GS_END: game over
enum GameState {
    GS_INIT,
    GS_PLAYING,
    GS_END,
};

@ccclass('GameManager')
export class GameManager extends Component {
    // Prefab for the stone block
    @property({ type: Prefab })
    public boxPrefab: Prefab | null = null;
    // Number of blocks in the road
    @property({ type: CCInteger })
    public roadLength: number = 50;
    // Array to store the generated road
    private _road: BlockType[] = [];

    // Reference to the start menu UI node
    @property({ type: Node })
    public startMenu: Node | null = null;
    // Reference to the player controller
    @property({ type: PlayerController })
    public playerCtrl: PlayerController | null = null;
    // Reference to the label showing steps
    @property({type: Label})
    public stepsLabel: Label|null = null;

    // Called when the component is first enabled
    start() {
        this.setCurState(GameState.GS_INIT);
        // Listen for the player's jump end event
        this.playerCtrl?.node.on('JumpEnd', this.onPlayerJumpEnd, this);
    }

    // Initialize the game state and UI
    init() {
        if (this.startMenu) {
            this.startMenu.active = true;
        }
        this.generateRoad();
        if (this.playerCtrl) {
            this.playerCtrl.setInputActive(false);
            this.playerCtrl.node.setPosition(Vec3.ZERO);
            this.playerCtrl.reset();
        }
    }

    // Set the current game state and update UI/logic accordingly
    setCurState(value: GameState) {
        switch (value) {
            case GameState.GS_INIT:
                this.init();
                break;
            case GameState.GS_PLAYING:
                if (this.startMenu) {
                    this.startMenu.active = false;
                }
                if (this.stepsLabel) {
                    this.stepsLabel.string = '0';
                }
                // Enable player input after a short delay
                setTimeout(() => {
                    if (this.playerCtrl) {
                        this.playerCtrl.setInputActive(true);
                    }
                }, 0.1);
                break;
            case GameState.GS_END:
                // Game end logic can be added here
                break;
        }
    }

    // Generate the road with random blocks
    generateRoad() {
        this.node.removeAllChildren();
        this._road = [];
        // Start position always has a stone block
        this._road.push(BlockType.BT_STONE);
        for (let i = 1; i < this.roadLength; i++) {
            if (this._road[i - 1] === BlockType.BT_NONE) {
                this._road.push(BlockType.BT_STONE);
            } else {
                this._road.push(Math.floor(Math.random() * 2));
            }
        }
        // Instantiate and position blocks
        for (let j = 0; j < this._road.length; j++) {
            let block: Node | null = this.spawnBlockByType(this._road[j]);
            if (block) {
                this.node.addChild(block);
                block.setPosition(j * BLOCK_SIZE, 0, 0);
            }
        }
    }

    // Instantiate a block node based on its type
    spawnBlockByType(type: BlockType) {
        if (!this.boxPrefab) {
            return null;
        }
        let block: Node | null = null;
        switch (type) {
            case BlockType.BT_STONE:
                block = instantiate(this.boxPrefab);
                break;
        }
        return block;
    }

    // Called when the start button is clicked
    onStartButtonClicked() {
        this.setCurState(GameState.GS_PLAYING);
    }

    // Check if the player's move is valid or if the game should reset
    checkResult(moveIndex: number) {
        if (moveIndex < this.roadLength) {
            if (this._road[moveIndex] == BlockType.BT_NONE) {
                this.setCurState(GameState.GS_INIT);
            }
        } else { 
            this.setCurState(GameState.GS_INIT);
        }
    }

    // Called when the player finishes a jump
    onPlayerJumpEnd(moveIndex: number) {
        if (this.stepsLabel) {
            this.stepsLabel.string = '' + (moveIndex >= this.roadLength ? this.roadLength : moveIndex);
        }
        this.checkResult(moveIndex);
    }

}

// Example usage:
// Attach GameManager to a Node in your scene.
// Assign the boxPrefab, startMenu, playerCtrl, and stepsLabel properties in the Cocos Creator editor.
// Call onStartButtonClicked() when the player presses the start button to begin the game.