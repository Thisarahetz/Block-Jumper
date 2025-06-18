// Import necessary components from Cocos Creator engine
import { _decorator, Component, Vec3, EventMouse, input, Input, Animation } from "cc";
const { ccclass, property } = _decorator;

// Define the size of each block in the game (40 units)
export const BLOCK_SIZE = 40;

// Mark this class as a Cocos Creator component that can be attached to game objects
@ccclass("PlayerController")
export class PlayerController extends Component {
    // Flag to track if player is currently jumping
    private _startJump: boolean = false;

    // Number of blocks to jump (1 or 2)
    private _jumpStep: number = 0;

    // Current time elapsed during the jump
    private _curJumpTime: number = 0;

    // Total time a jump should take (0.3 seconds)
    private _jumpTime: number = 0.6;

    // Current speed of the jump (calculated based on distance and time)
    private _curJumpSpeed: number = 0;

    // Vector to store current position of the player
    private _curPos: Vec3 = new Vec3();

    // Vector to store position change for each frame
    private _deltaPos: Vec3 = new Vec3(0, 0, 0);

    // Vector to store the target position after jump
    private _targetPos: Vec3 = new Vec3();

    @property(Animation)
    BodyAnim: Animation = null;

    // Called when the component is first created
    start() {
        // Set up listener for mouse click events
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    // Method to reset player state (currently empty, can be used for game restart)
    reset() { }

    // Called when player releases a mouse button
    onMouseUp(event: EventMouse) {
        // Left click (button 0) = jump 1 block
        if (event.getButton() === 0) {
            this.jumpByStep(1);
        }
        // Right click (button 2) = jump 2 blocks
        else if (event.getButton() === 2) {
            this.jumpByStep(2);
        }
    }

    // Initiates a jump movement
    jumpByStep(step: number) {
        // If already jumping, ignore new jump request
        if (this._startJump) {
            return;
        }

        // Start the jump
        this._startJump = true;
        // Set how many blocks to jump
        this._jumpStep = step;
        // Reset jump timer
        this._curJumpTime = 0;

        // Calculate jump speed: (distance to travel) / (time to take)
        // Example: (1 block * 40 units) / 0.3 seconds = 133.33 units/second
        this._curJumpSpeed = (this._jumpStep * BLOCK_SIZE) / this._jumpTime;

        // Get current position
        this.node.getPosition(this._curPos);

        // Calculate target position by adding jump distance to current position
        // Example: current position + (1 block * 40 units) to the right
        Vec3.add(
            this._targetPos,
            this._curPos,
            new Vec3(this._jumpStep * BLOCK_SIZE, 0, 0)
        );

        //the code can explain itself
        if (this.BodyAnim) {
            if (step === 1) {
                this.BodyAnim.play('oneStep');
            } else if (step === 2) {
                this.BodyAnim.play('twoStep');
            }
        }

        const clipName = step == 1 ? 'oneStep' : 'twoStep';
        const state = this.BodyAnim.getState(clipName);
        this._jumpTime = state.duration;
    }

    //set the input active or not
    //this is used to disable the input when the game is not playing
    setInputActive(active: boolean) {
        if (active) {
            //enable input
            input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        } else {
            //disable input
            input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        }
    }

    // Called every frame by Cocos Creator
    update(deltaTime: number) {
        // Only process movement if player is jumping
        if (this._startJump) {
            // Add time since last frame to jump timer
            this._curJumpTime += deltaTime;

            // Check if jump is complete
            // Example: 0.3 seconds (jump time) > 0.0167 seconds (delta time)
            if (this._curJumpTime > this._jumpTime) {
                // Jump is done, set final position
                this.node.setPosition(this._targetPos);
                // Allow new jumps
                this._startJump = false;
            }

            else {
                // Jump is in progress
                // Get current position
                this.node.getPosition(this._curPos);

                // Calculate how far to move this frame
                // Example: 133.33 units/second * 0.0167 seconds = 2.22 units
                this._deltaPos.x = this._curJumpSpeed * deltaTime;

                // Update position by adding movement
                Vec3.add(this._curPos, this._curPos, this._deltaPos);

                // Apply new position to player
                this.node.setPosition(this._curPos);
            }
        }
    }
}