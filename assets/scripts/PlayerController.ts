import { _decorator, Component, Vec3, EventMouse, input, Input, Animation,Node, EventTouch } from "cc";
const { ccclass, property } = _decorator;

// The size of each block the player can jump to
export const BLOCK_SIZE = 40;

@ccclass("PlayerController")
export class PlayerController extends Component {

    // Reference to the Animation component for the player's body
    @property(Animation)
    BodyAnim:Animation = null;

    @property({
        type: Node
    })
    leftTouch: Node = null;

    @property({
        type: Node
    })
    rightTouch: Node = null;

    // Indicates if the player is currently jumping
    private _startJump: boolean = false;
    // Number of steps to jump (1 or 2)
    private _jumpStep: number = 0;
    // Current time spent in the jump
    private _curJumpTime: number = 0;
    // Total time the jump should take
    private _jumpTime: number = 0.1;
    // Current speed of the jump
    private _curJumpSpeed: number = 0;
    // Current position of the player
    private _curPos: Vec3 = new Vec3();
    // Delta position for each frame during jump
    private _deltaPos: Vec3 = new Vec3(0, 0, 0);
    // Target position after the jump
    private _targetPos: Vec3 = new Vec3();   
    // The current index (block) the player is on
    private _curMoveIndex: number = 0;

    start () {
        // Optionally, you could enable input here
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }
    

    /**
     * Enable or disable mouse input for jumping.
     * @param active Whether input should be active
     * Example:
     *   setInputActive(true); // enables mouse input
     */

    setInputActive(active: boolean) {
        if (active) {
            //for pc
            input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
            //for mobile
            this.leftTouch.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
            this.rightTouch.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        } else { 
            //for pc
            input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
            //for mobile
            this.leftTouch.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
            this.rightTouch.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        }
    }

    onTouchStart(event: EventTouch) {
        const target = event.target as Node;    
        if (target?.name == 'LeftTouch') {
            this.jumpByStep(1);
        } else {
            this.jumpByStep(2);
        }
    }

    /**
     * Reset the player's position and move index to the start.
     * Example:
     *   reset(); // player goes back to the start
     */
    reset() {
        this._curMoveIndex = 0;
        this.node.getPosition(this._curPos);
        this._targetPos.set(0,0,0);
    }   

    /**
     * Handle mouse up events to trigger jumps.
     * Left click (button 0): jump 1 step
     * Right click (button 2): jump 2 steps
     * Example:
     *   // User left clicks: player jumps 1 block
     *   // User right clicks: player jumps 2 blocks
     */
    onMouseUp(event: EventMouse) {
        if (event.getButton() === 0) {
            this.jumpByStep(1);
        } else if (event.getButton() === 2) {
            this.jumpByStep(2);
        }

    }

    /**
     * Initiate a jump by a given number of steps (1 or 2).
     * @param step Number of steps to jump
     * Example:
     *   jumpByStep(1); // jump 1 block
     *   jumpByStep(2); // jump 2 blocks
     */
    jumpByStep(step: number) {
        if (this._startJump) {
            // Prevent starting a new jump while already jumping
            return;
        }
        this._startJump = true;
        this._jumpStep = step;
        this._curJumpTime = 0;

        // Get jump time from animation duration.
        const clipName = step == 1? 'oneStep' : 'twoStep';
        const state =  this.BodyAnim.getState(clipName);        
        this._jumpTime = state.duration;

        // Calculate jump speed based on distance and animation time
        this._curJumpSpeed = this._jumpStep * BLOCK_SIZE/ this._jumpTime;
        this.node.getPosition(this._curPos);
        Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep* BLOCK_SIZE, 0, 0));  
        
        // Play the appropriate jump animation
        if (this.BodyAnim) {
            if (step === 1) {
                this.BodyAnim.play('oneStep');
            } else if (step === 2) {
                this.BodyAnim.play('twoStep');
            }
        }

        // Update the move index to reflect the jump
        this._curMoveIndex += step;
    }

    /**
     * Called when a jump animation ends. Emits a 'JumpEnd' event with the current move index.
     * Example:
     *   // After jump ends, notify listeners
     *   onOnceJumpEnd();
     */
    onOnceJumpEnd() {
        this.node.emit('JumpEnd', this._curMoveIndex);
    }
   
    /**
     * Update is called every frame. Handles the jump movement and animation.
     * @param deltaTime Time since last frame
     * Example:
     *   // Called automatically by the engine
     *   update(0.016); // ~60 FPS
     */
    update (deltaTime: number) {
        if (this._startJump) {
            this._curJumpTime += deltaTime;
            if (this._curJumpTime > this._jumpTime) {
                // Jump finished: set position to target and end jump
                this.node.setPosition(this._targetPos);
                this._startJump = false;   
                this.onOnceJumpEnd();           
            } else {
                // Jump in progress: move a bit closer to the target
                this.node.getPosition(this._curPos);
                this._deltaPos.x = this._curJumpSpeed * deltaTime;
                Vec3.add(this._curPos, this._curPos, this._deltaPos);
                this.node.setPosition(this._curPos);
            }
        }
    }
}