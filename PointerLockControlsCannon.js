import * as THREE from 'three';
import * as CANNON from 'cannon-es';

class PointerLockControlsCannon extends THREE.EventDispatcher {
  constructor(camera, cannonBody) {
    super();

    this.enabled = false;

    this.cannonBody = cannonBody;

    // var eyeYPos = 2 // eyes are 2 meters above the ground
    this.velocityFactor = 0.2;
    this.jumpVelocity = 20;
    this.speed = 30;
    this.sprintMult = 1.8;
    this.stamina = 100;
    this.maxRange = 130;
    this.exhausted = false;

    this.pitchObject = new THREE.Object3D();
    this.pitchObject.add(camera);

    this.yawObject = new THREE.Object3D();
    this.yawObject.position.y = 2;
    this.yawObject.add(this.pitchObject);

    this.quaternion = new THREE.Quaternion();

    this.isMoving = false;

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    this.canJump = false;
    this.canSprint = false;

    const contactNormal = new CANNON.Vec3(); // Normal in the contact, pointing *out* of whatever the player touched
    const upAxis = new CANNON.Vec3(0, 1, 0);
    this.cannonBody.addEventListener('collide', (event) => {
      const { contact } = event;

      // contact.bi and contact.bj are the colliding bodies, and contact.ni is the collision normal.
      // We do not yet know which one is which! Let's check.
      if (contact.bi.id === this.cannonBody.id) {
        // bi is the player body, flip the contact normal
        contact.ni.negate(contactNormal);
      } else {
        // bi is something else. Keep the normal as it is
        contactNormal.copy(contact.ni);
      }

      // If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat in the up direction.
      if (contactNormal.dot(upAxis) > 0.5) {
        // Use a "good" threshold value between 0 and 1 here!
        this.canJump = true;
      }
    });

    this.velocity = this.cannonBody.velocity;

    // Moves the camera to the cannon.js object position and adds velocity to the object if the run key is down
    this.inputVelocity = new THREE.Vector3();
    this.euler = new THREE.Euler();

    this.lockEvent = { type: 'lock' };
    this.unlockEvent = { type: 'unlock' };

    this.connect();
  }

  connect() {
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('pointerlockchange', this.onPointerlockChange);
    document.addEventListener('pointerlockerror', this.onPointerlockError);
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
  }

  disconnect() {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('pointerlockchange', this.onPointerlockChange);
    document.removeEventListener('pointerlockerror', this.onPointerlockError);
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
  }

  dispose() {
    this.disconnect();
  }

  lock() {
    document.body.requestPointerLock();
  }

  unlock() {
    document.exitPointerLock();
  }

  onPointerlockChange = () => {
    if (document.pointerLockElement) {
      this.dispatchEvent(this.lockEvent);

      this.isLocked = true;
    } else {
      this.dispatchEvent(this.unlockEvent);

      this.isLocked = false;
    }
  }

  onPointerlockError = () => {
    console.error('PointerLockControlsCannon: Unable to use Pointer Lock API');
  }

  onMouseMove = (event) => {
    if (!this.enabled) {
      return;
    }

    const { movementX, movementY } = event;

    this.yawObject.rotation.y -= movementX * 0.002;
    this.pitchObject.rotation.x -= movementY * 0.002;

    this.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitchObject.rotation.x));
  }

  onKeyDown = (event) => {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = true;
        this.isMoving = true;
        break;

      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = true;
        this.isMoving = true;
        break;

      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = true;
        this.isMoving = true;
        break;

      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = true;
        this.isMoving = true;
        break;

      case 'Space':
        if (this.canJump) {
          this.velocity.y += this.jumpVelocity;
        }
        this.canJump = false;
        break;

      case 'ShiftLeft':
      case 'ShiftRight':
        this.canSprint = true;
        break;
    }
  }

  onKeyUp = (event) => {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = false;
        this.isMoving = false;
        break;

      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = false;
        this.isMoving = false;
        break;

      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = false;
        this.isMoving = false;
        break;

      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = false;
        this.isMoving = false;
        break;

      case 'ShiftLeft':
      case 'ShiftRight':
        this.canSprint = false;
        break;
    }
  }

  getObject() {
    return this.yawObject;
  }

  getDirection() {
    const vector = new CANNON.Vec3(0, 0, -1);
    vector.applyQuaternion(this.quaternion);
    return vector;
  }

  update(delta) {
    if (this.enabled === false) {
      return;
    }

    delta *= 1000;
    delta *= 0.1;

    this.inputVelocity.set(0, 0, 0);

    this.velocity.x -= this.velocity.x * delta;
    this.velocity.z -= this.velocity.z * delta;

    if(this.cannonBody.position.x > this.maxRange)
    {
      //this.velocityFactor *= -1;
      this.cannonBody.position.x -= 0.1;
    }
    else if(this.cannonBody.position.x < -this.maxRange)
    {
      this.cannonBody.position.x += 0.1;
    }

    if(this.cannonBody.position.z > this.maxRange)
    {
      //this.velocityFactor *= -1;
      this.cannonBody.position.z -= 0.1;
    }
    else if(this.cannonBody.position.z < -this.maxRange)
    {
      this.cannonBody.position.z += 0.1;
    }

    //else if(this.velocityFactor < 0)this.velocityFactor *= -1;

    if (this.moveForward) {
      this.inputVelocity.z = this.velocityFactor * this.speed * delta;
      this.isMoving = true;
    }
    if (this.moveBackward) {
      this.inputVelocity.z = -this.velocityFactor * this.speed * delta;
      this.isMoving = true;
    }

    if (this.moveLeft) {
      this.inputVelocity.x = this.velocityFactor * this.speed * delta;
      this.isMoving = true;
    }
    if (this.moveRight) {
      this.inputVelocity.x = -this.velocityFactor * this.speed * delta;
      this.isMoving = true;
    }
    if(this.canSprint && this.isMoving && this.stamina > 0 && !this.exhausted) {
      this.stamina -= 0.1;
      this.inputVelocity.z =  this.inputVelocity.z * this.sprintMult;
      this.inputVelocity.x =  this.inputVelocity.x * this.sprintMult;
    }

    // Convert velocity to world coordinates
    this.euler.x = this.pitchObject.rotation.x;
    this.euler.y = this.yawObject.rotation.y;
    this.euler.order = 'XYZ';
    this.quaternion.setFromEuler(this.euler);
    this.inputVelocity.applyQuaternion(this.quaternion);

    // Add to the object
    this.velocity.x -= this.inputVelocity.x;
    this.velocity.z -= this.inputVelocity.z;

    this.yawObject.position.copy(this.cannonBody.position);
  }
}

export { PointerLockControlsCannon }