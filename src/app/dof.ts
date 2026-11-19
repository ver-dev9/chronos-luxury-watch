import * as THREE from 'three';
/** World-space DOF focus target, updated by whichever scene uses depth of field. */
export const dofFocus = new THREE.Vector3(0, 0, 0);
