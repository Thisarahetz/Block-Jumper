import { _decorator, CCInteger, Component, instantiate, Node, Prefab } from 'cc';
import { BLOCK_SIZE } from './PlayerController';
const { ccclass, property } = _decorator;

// Types of blocks in our game
// BT_NONE = 0 (empty space, no block)
// BT_STONE = 1 (stone block that player can stand on)
enum BlockType{
    BT_NONE,    // 0 = empty space
    BT_STONE,   // 1 = stone block
};

@ccclass('GameManager')
export class GameManager extends Component {
    
    // This is the box prefab we'll use to create stone blocks
    // You need to drag a prefab here in the editor
    @property({type: Prefab})
    public boxPrefab: Prefab|null = null;

    // How many blocks long our road will be
    // Example: roadLength = 50 means 50 blocks total
    @property({type: CCInteger})
    public roadLength: number = 50;

    // This array stores our road layout
    // Example: [1, 0, 1, 1, 0] means: stone, empty, stone, stone, empty
    private _road: BlockType[] = [];

    // This function creates the road
    generateRoad() {

        // Remove all existing blocks first
        this.node.removeAllChildren();
    
        // Clear our road array
        this._road = [];
        
        // Always start with a stone block (so player has somewhere to stand)
        this._road.push(BlockType.BT_STONE); // Add 1 (stone) to array
    
        // Create the rest of the road
        for (let i = 1; i < this.roadLength; i++) {
            // If the previous block was empty (0), we MUST put a stone (1) here
            // This prevents the player from falling into a hole
            if (this._road[i - 1] === BlockType.BT_NONE) {
                this._road.push(1); // Force stone block
            } else {
                // Randomly choose: 0 (empty) or 1 (stone)
                // Math.random() gives 0-1, Math.floor makes it 0 or 1
                this._road.push(Math.floor(Math.random() * 2));
            }
        }
        
        // Now create the visual blocks in the game
        for (let j = 0; j < this._road.length; j++) {
            // Get the block type at position j
            let block: Node | null = this.spawnBlockByType(this._road[j]);
            if (block) {
                // Add the block to our scene
                // why is this here? answer: 
                // because we want to add the block to the game manager node
                this.node.addChild(block);
                // Position it: j * 40 units to the right
                // Example: block 0 at x=0, block 1 at x=40, block 2 at x=80
                block.setPosition(j * BLOCK_SIZE, 0, 0);
            }

            
        }
    }

    // This function creates a block based on its type
    spawnBlockByType(type: BlockType) {
        // Check if we have a prefab to use
        if (!this.boxPrefab) {
            return null; // No prefab = no block created
        }
    
        let block: Node|null = null;

        switch(type) {
            case BlockType.BT_STONE: // If type is 1 (stone)
                // Create a new block from our prefab
                block = instantiate(this.boxPrefab);
                break;
            // For BT_NONE (0), we don't create any block (empty space)
        }
    
        return block;
    }

    // This runs when the game starts
    start() {
        // Generate our road when the game begins
        this.generateRoad();
        this.generateRoad();
    }
}


