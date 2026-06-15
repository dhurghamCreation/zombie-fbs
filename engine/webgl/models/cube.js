import { mat4 } from "../mat4.js"; // Make sure you have a basic mat4 utility

export class Cube {
  constructor(gl, x = 0, y = 0, z = 0, size = 1) {
    this.gl = gl;
    this.position = [x, y, z];
    this.size = size;

    // Full cube vertices (positions + normals + UVs)
    this.vertices = new Float32Array([
      // Front face
      -1, -1,  1,  0, 0, 1,  0, 0,
       1, -1,  1,  0, 0, 1,  1, 0,
       1,  1,  1,  0, 0, 1,  1, 1,
      -1,  1,  1,  0, 0, 1,  0, 1,
      // Back face
      -1, -1, -1,  0, 0,-1,  0, 0,
       1, -1, -1,  0, 0,-1,  1, 0,
       1,  1, -1,  0, 0,-1,  1, 1,
      -1,  1, -1,  0, 0,-1,  0, 1,
      // Top face
      -1,  1, -1,  0, 1, 0,  0, 0,
       1,  1, -1,  0, 1, 0,  1, 0,
       1,  1,  1,  0, 1, 0,  1, 1,
      -1,  1,  1,  0, 1, 0,  0, 1,
      // Bottom face
      -1, -1, -1,  0,-1, 0,  0, 0,
       1, -1, -1,  0,-1, 0,  1, 0,
       1, -1,  1,  0,-1, 0,  1, 1,
      -1, -1,  1,  0,-1, 0,  0, 1,
      // Right face
       1, -1, -1,  1, 0, 0,  0, 0,
       1,  1, -1,  1, 0, 0,  1, 0,
       1,  1,  1,  1, 0, 0,  1, 1,
       1, -1,  1,  1, 0, 0,  0, 1,
      // Left face
      -1, -1, -1, -1, 0, 0,  0, 0,
      -1,  1, -1, -1, 0, 0,  1, 0,
      -1,  1,  1, -1, 0, 0,  1, 1,
      -1, -1,  1, -1, 0, 0,  0, 1,
    ]);

    // Indices for triangles (2 per face)
    this.indices = new Uint16Array([
      0, 1, 2, 2, 3, 0,       // front
      4, 5, 6, 6, 7, 4,       // back
      8, 9,10,10,11, 8,       // top
     12,13,14,14,15,12,       // bottom
     16,17,18,18,19,16,       // right
     20,21,22,22,23,20        // left
    ]);

    this.createBuffers(gl);
  }

  createBuffers(gl) {
    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

    this.ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
  }

  getMatrix() {
  const m = mat4.identity();
  m[12] = this.position[0];
  m[13] = this.position[1];
  m[14] = this.position[2];
  return m;
  }

  draw(gl, loc) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.vertexAttribPointer(loc.pos, 3, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(loc.pos);

    gl.vertexAttribPointer(loc.normal, 3, gl.FLOAT, false, 32, 12);
    gl.enableVertexAttribArray(loc.normal);

    gl.vertexAttribPointer(loc.uv, 2, gl.FLOAT, false, 32, 24);
    gl.enableVertexAttribArray(loc.uv);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
  }
  
}
