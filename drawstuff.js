/* classes */ 

/* Ray Casting Functions */
/* ---------- PART 3: Unique Scene (Retro Robot) ---------- */
// [AI USE - start]
function intersectRaySphere(ro, rd, sph) {
    // ro, rd are objects {x,y,z}; sph: {c:{x,y,z}, r: number}
    const ocx = ro.x - sph.c.x;
    const ocy = ro.y - sph.c.y;
    const ocz = ro.z - sph.c.z;

    const a = rd.x*rd.x + rd.y*rd.y + rd.z*rd.z;
    const b = 2 * (ocx*rd.x + ocy*rd.y + ocz*rd.z);
    const c = ocx*ocx + ocy*ocy + ocz*ocz - sph.r * sph.r;

    const disc = b*b - 4*a*c;
    if (disc < 0) return null;
    const sqrtD = Math.sqrt(disc);
    const t0 = (-b - sqrtD) / (2*a);
    const t1 = (-b + sqrtD) / (2*a);

    let t = null;
    if (t0 > 0 && t1 > 0) t = Math.min(t0, t1);
    else if (t0 > 0) t = t0;
    else if (t1 > 0) t = t1;
    else return null;

    const hp = { x: ro.x + rd.x * t, y: ro.y + rd.y * t, z: ro.z + rd.z * t };
    const nx = (hp.x - sph.c.x) / (sph.r);
    const ny = (hp.y - sph.c.y) / (sph.r);
    const nz = (hp.z - sph.c.z) / (sph.r);
    const nlen = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1.0;
    return { t: t, normal: [nx/nlen, ny/nlen, nz/nlen] };
}

// Ray-plane intersection for horizontal ground plane at y = planeY
// Returns { t, normal:[0,1,0] } or null
function intersectRayPlane(ro, rd, planeY) {
    // plane normal = (0,1,0)
    if (Math.abs(rd.y) < 1e-8) return null;
    const t = (planeY - ro.y) / rd.y;
    if (t <= 0) return null;
    return { t: t, normal: [0,1,0] };
}

// Utility: check occlusion (shadow test) against arrays of spheres and boxes
// returns true if any object intersects between eps and maxDist
function isOccluded(ro, rd, maxDist, spheres, boxes) {
    const EPS = 1e-4;
    // spheres
    for (let s = 0; s < spheres.length; s++) {
        const res = intersectRaySphere(ro, rd, spheres[s]);
        if (res && res.t > EPS && res.t < maxDist - EPS) return true;
    }
    // boxes: use existing intersectRayAABB (expects rayOrigin {x,y,z}, rayDir {x,y,z}, box)
    for (let b = 0; b < boxes.length; b++) {
        const resBox = intersectRayAABB(ro, rd, boxes[b]);
        if (resBox && resBox.t > EPS && resBox.t < maxDist - EPS) return true;
    }
    return false;
}
// [AI USE - end]

// Build a quirky "retro robot" scene using boxes and spheres (coordinates in [0,1] range)
function buildPart3Scene() {
    // Boxes used for robot torso and arms (matching format used in boxes.json)
    const boxes = [];

    // torso (box)
    boxes.push({
        lx: 0.35, rx: 0.65,
        by: 0.12, ty: 0.52,
        fz: 0.7, rz: 0.95,
        diffuse: [0.2, 0.6, 1.0],   
		ambient: [0.1, 0.3, 0.5],   
		specular: [0.9, 0.9, 0.9],  
        n: 64
    });

    // left arm (thin box)
    boxes.push({
        lx: 0.22, rx: 0.34,
        by: 0.23, ty: 0.33,
        fz: 0.72, rz: 0.88,
        diffuse: [0.2, 0.2, 0.25],
        ambient: [0.04, 0.04, 0.05],
        specular: [0.6,0.6,0.6],
        n: 32
    });

    // right arm
    boxes.push({
        lx: 0.66, rx: 0.78,
        by: 0.23, ty: 0.33,
        fz: 0.72, rz: 0.88,
        diffuse: [0.2, 0.2, 0.25],
        ambient: [0.04, 0.04, 0.05],
        specular: [0.6,0.6,0.6],
        n: 32
    });

    // small control panel (front box) for character
    boxes.push({
        lx: 0.42, rx: 0.58,
        by: 0.22, ty: 0.38,
        fz: 0.95, rz: 1.02,
        diffuse: [0.9, 0.35, 0.12],
        ambient: [0.1,0.04,0.02],
        specular: [0.9,0.9,0.9],
        n: 20
    });

    // Spheres for head, eyes, antenna, bolts
    const spheres = [];

    // head (a shiny sphere sitting near top of torso)
    spheres.push({
        c: { x: 0.5, y: 0.72, z: 0.82 },
        r: 0.12,
        diffuse: [0.8, 0.2, 0.2],   
		ambient: [0.3, 0.1, 0.1],
		specular: [1.0, 0.9, 0.9],
		n: 100
    });

    // left eye (glowing)
    spheres.push({
        c: { x: 0.47, y: 0.74, z: 0.72 },
        r: 0.03,
        diffuse: [0.95, 0.95, 0.6],
        ambient: [0.95, 0.95, 0.6],
        specular: [0.9,0.9,0.9],
        n: 8
    });

    // right eye
    spheres.push({
        c: { x: 0.53, y: 0.74, z: 0.72 },
        r: 0.03,
        diffuse: [0.6, 0.95, 0.95],
        ambient: [0.6, 0.95, 0.95],
        specular: [0.9,0.9,0.9],
        n: 8
    });

    // antenna ball
    spheres.push({
        c: { x: 0.5, y: 0.88, z: 0.82 },
        r: 0.02,
        diffuse: [0.9, 0.9, 0.2],
        ambient: [0.2, 0.2, 0.05],
        specular: [0.9,0.9,0.9],
        n: 40
    });

    // decorative shiny orbs around the robot (unique look)
    spheres.push({
        c: { x: 0.28, y: 0.18, z: 0.78 },
        r: 0.04,
        diffuse: [0.17,0.6,0.17],
        ambient: [0.03,0.1,0.03],
        specular: [0.9,0.9,0.9],
        n: 64
    });

    spheres.push({
        c: { x: 0.72, y: 0.18, z: 0.78 },
        r: 0.04,
        diffuse: [0.6,0.17,0.2],
        ambient: [0.05,0.02,0.02],
        specular: [0.9,0.9,0.9],
        n: 64
    });

    return { boxes: boxes, spheres: spheres };
}
// [AI USE - start]
// The Part3 renderer: raycast every pixel, supports shadows & multiple lights
function renderPart3(context) {
    const scene = buildPart3Scene();
    const boxes = scene.boxes;
    const spheres = scene.spheres;

    const W = context.canvas.width;
    const H = context.canvas.height;
    const out = context.createImageData(W, H);

    // camera & lights
    const eye = { x: 0.5, y: 0.5, z: -0.5 };
    // two lights: key + fill
    const lights = [
        { pos: { x: -0.5, y: 1.8, z: -0.5 }, La: [0.15,0.15,0.18], Ld: [1,1,1], Ls: [1,1,1], intensity: 1.0 },
        { pos: { x: 1.2, y: 1.0, z: -0.2 }, La: [0.05,0.05,0.06], Ld: [0.45,0.5,0.6], Ls: [0.6,0.6,0.6], intensity: 0.6 }
    ];

    // small helpers
    const vSub = (a,b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
    const vAdd = (a,b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
    const vScale = (v,s) => ({ x: v.x*s, y: v.y*s, z: v.z*s });
    const vDot = (a,b) => a.x*b.x + a.y*b.y + a.z*b.z;
    const vLen = v => Math.sqrt(Math.max(0, vDot(v,v)));
    const vNorm = v => { const L = vLen(v); return L>0 ? vScale(v, 1.0/L) : {x:0,y:0,z:0}; };
    const clamp01 = x => Math.max(0, Math.min(1, x));

    // Ground plane at y = 0: checkered pattern
    const planeY = 0.0;

    for (let j = 0; j < H; j++) {
        for (let i = 0; i < W; i++) {
            const u = (i + 0.5) / W;
            const v = (j + 0.5) / H;
            const pixelWorld = { x: u, y: 1.0 - v, z: 0.0 };
            const rd = vSub(pixelWorld, eye); // not normalized for t

            // Find nearest hit among spheres, boxes, and plane
            let bestT = Infinity;
            let hitMat = null;
            let hitP = null;
            let hitN = null;

            // spheres
            for (let s = 0; s < spheres.length; s++) {
                const res = intersectRaySphere(eye, rd, spheres[s]);
                if (res && res.t > 0 && res.t < bestT) {
                    bestT = res.t;
                    hitMat = spheres[s];
                    hitP = { x: eye.x + rd.x * res.t, y: eye.y + rd.y * res.t, z: eye.z + rd.z * res.t };
                    hitN = { x: res.normal[0], y: res.normal[1], z: res.normal[2] };
                }
            }

            // boxes (use existing AABB intersection)
            for (let b = 0; b < boxes.length; b++) {
                const resB = intersectRayAABB(eye, rd, boxes[b]);
                if (resB && resB.t > 0 && resB.t < bestT) {
                    bestT = resB.t;
                    hitMat = boxes[b];
                    hitP = { x: eye.x + rd.x * resB.t, y: eye.y + rd.y * resB.t, z: eye.z + rd.z * resB.t };
                    hitN = { x: resB.normal[0], y: resB.normal[1], z: resB.normal[2] };
                }
            }

            // plane (floor)
            const resPlane = intersectRayPlane(eye, rd, planeY);
            if (resPlane && resPlane.t > 0 && resPlane.t < bestT) {
                bestT = resPlane.t;
                hitMat = { // synthetic material for plane
                    diffuse: [0.95, 0.95, 0.95],
                    ambient: [0.02, 0.02, 0.02],
                    specular: [0.3,0.3,0.3],
                    n: 8,
                    isPlane: true
                };
                hitP = { x: eye.x + rd.x * resPlane.t, y: planeY, z: eye.z + rd.z * resPlane.t };
                hitN = { x: 0, y: 1, z: 0 };
            }

            // color accumulation
            let R = 0, G = 0, B = 0, A = 255;

            if (hitMat && hitP && hitN) {
                // material retrieval
                const Ka = (hitMat.ambient  && hitMat.ambient.length)  ? hitMat.ambient  : [0.02,0.02,0.02];
                const Kd = (hitMat.diffuse  && hitMat.diffuse.length)  ? hitMat.diffuse  : [0.8,0.8,0.8];
                const Ks = (hitMat.specular && hitMat.specular.length) ? hitMat.specular : [0.2,0.2,0.2];
                const shin = (typeof hitMat.n === 'number') ? hitMat.n : 32;

                const N = vNorm(hitN);
                const V = vNorm(vSub(eye, hitP));

                // Start with black, add contributions from lights
                let accum = [0,0,0];

                for (let Lidx = 0; Lidx < lights.length; Lidx++) {
                    const Linfo = lights[Lidx];
                    const LdirVec = vSub(Linfo.pos, hitP);
                    const Ldist = vLen(LdirVec);
                    if (Ldist <= 1e-6) continue;
                    const Ldir = vNorm(LdirVec);

                    // Shadow test: cast a ray from hitP + N*eps toward light
                    const shadowOrigin = { x: hitP.x + N.x * 1e-4, y: hitP.y + N.y * 1e-4, z: hitP.z + N.z * 1e-4 };
                    const shadowRd = Ldir; // normalized, but intersect functions accept non-normalized too
                    const occluded = isOccluded(shadowOrigin, shadowRd, Ldist, spheres, boxes);

                    // Ambient from this light
                    accum[0] += Ka[0] * Linfo.La[0] * Linfo.intensity;
                    accum[1] += Ka[1] * Linfo.La[1] * Linfo.intensity;
                    accum[2] += Ka[2] * Linfo.La[2] * Linfo.intensity;

                    if (!occluded) {
                        // diffuse
                        const NdotL = Math.max(0, vDot(N, Ldir));
                        accum[0] += Kd[0] * Linfo.Ld[0] * NdotL * Linfo.intensity;
                        accum[1] += Kd[1] * Linfo.Ld[1] * NdotL * Linfo.intensity;
                        accum[2] += Kd[2] * Linfo.Ld[2] * NdotL * Linfo.intensity;

                        // Blinn-Phong specular
                        const H = vNorm(vAdd(Ldir, V));
                        const NdotH = Math.max(0, vDot(N, H));
                        const spec = Math.pow(NdotH, shin);
                        accum[0] += Ks[0] * Linfo.Ls[0] * spec * Linfo.intensity;
                        accum[1] += Ks[1] * Linfo.Ls[1] * spec * Linfo.intensity;
                        accum[2] += Ks[2] * Linfo.Ls[2] * spec * Linfo.intensity;
                    }
                }

                // special: if the hit is the plane, add a checkered variation to diffuse
                if (hitMat.isPlane) {
                    const scale = 8.0; // check size
                    const cx = Math.floor(hitP.x * scale);
                    const cz = Math.floor(hitP.z * scale);
                    const checker = ((cx + cz) % 2 === 0) ? 1.0 : 0.14;
                    accum[0] *= checker;
                    accum[1] *= checker;
                    accum[2] *= checker;
                }

                // tone & clamp
                const colR = clamp01(accum[0]);
                const colG = clamp01(accum[1]);
                const colB = clamp01(accum[2]);

                R = Math.floor(colR * 255);
                G = Math.floor(colG * 255);
                B = Math.floor(colB * 255);
            }

            const idx = (j * W + i) * 4;
            out.data[idx    ] = R;
            out.data[idx + 1] = G;
            out.data[idx + 2] = B;
            out.data[idx + 3] = A;
        }
    }

    context.putImageData(out, 0, 0);
}
// [AI USE - end]

// [AI USE - start]
function intersectRayAABB(rayOrigin, rayDir, box) {
    // axis-aligned min/max arrays for compact looping
    const mins = [ box.lx, box.by, box.fz ];
    const maxs = [ box.rx, box.ty, box.rz ];
    const ro  = [ rayOrigin.x, rayOrigin.y, rayOrigin.z ];
    const rd  = [ rayDir.x,      rayDir.y,      rayDir.z      ];

    // storage per-axis
    const tNearAxis = [ -Infinity, -Infinity, -Infinity ];
    const tFarAxis  = [  Infinity,  Infinity,  Infinity ];
    const nNearAxis = [ [0,0,0], [0,0,0], [0,0,0] ];
    const nFarAxis  = [ [0,0,0], [0,0,0], [0,0,0] ];

    // helper to produce axis normals quickly
    const negNormals = [[-1,0,0],[0,-1,0],[0,0,-1]];
    const posNormals = [[ 1,0,0],[0, 1,0],[0,0, 1]];

    // For each axis compute near/far t and their face normals
    for (let a = 0; a < 3; a++) {
        const rda = rd[a];
        const roa = ro[a];

        // If ray is parallel to the axis and outside slab -> no hit
        if (rda === 0) {
            if (roa < mins[a] || roa > maxs[a]) return null;
            // inside slab: set a neutral interval that won't constrain entry/exit
            tNearAxis[a] = -Infinity;
            tFarAxis[a]  =  Infinity;
            nNearAxis[a] = [0,0,0];
            nFarAxis[a]  = [0,0,0];
            continue;
        }

        // compute t to the two slab planes
        const inv = 1.0 / rda;
        let t1 = (mins[a] - roa) * inv;
        let t2 = (maxs[a] - roa) * inv;

        // order them so tNearAxis <= tFarAxis and set normals accordingly
        if (t1 <= t2) {
            tNearAxis[a] = t1; tFarAxis[a] = t2;
            nNearAxis[a]  = negNormals[a];
            nFarAxis[a]   = posNormals[a];
        } else {
            tNearAxis[a] = t2; tFarAxis[a] = t1;
            // swapped: near corresponds to positive face when rda < 0
            nNearAxis[a]  = posNormals[a];
            nFarAxis[a]   = negNormals[a];
        }
    }
	// [AI USE - end]
    // overall entry is the maximum of per-axis near values
    let tEntry = tNearAxis[0], entryIdx = 0;
    for (let a = 1; a < 3; a++) {
        if (tNearAxis[a] > tEntry) { tEntry = tNearAxis[a]; entryIdx = a; }
    }

    // overall exit is the minimum of per-axis far values
    let tExit = tFarAxis[0], exitIdx = 0;
    for (let a = 1; a < 3; a++) {
        if (tFarAxis[a] < tExit) { tExit = tFarAxis[a]; exitIdx = a; }
    }

    // Valid intersection if intervals overlap and exit is in front of ray origin
    if (tExit >= Math.max(tEntry, 0.0)) {
        if (tEntry >= 0.0) {
            return { t: tEntry, normal: nNearAxis[entryIdx] };
        } else {
            // origin inside box: return the exit hit and its normal
            return { t: tExit, normal: nFarAxis[exitIdx] };
        }
    }

    return null;
}
// [AI USE - start]
function renderBoxesRayCast(context) {
    const boxes = getInputBoxes();
    if (boxes === String.null) return;

    const W = context.canvas.width;
    const H = context.canvas.height;
    const out = context.createImageData(W, H);

    // eye and light (same intent as before, arranged so boxes sit in lower-left area)
    const eye = { x: 0.5, y: 0.5, z: -0.5 };
    const lightPos = { x: -0.5, y: 1.5, z: -0.5 };
    const La = [1,1,1], Ld = [1,1,1], Ls = [1,1,1];

    // tiny, local vector helpers (kept internal to avoid touching other code)
    const vSub = (a,b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
    const vAdd = (a,b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
    const vScale = (v, s) => ({ x: v.x * s, y: v.y * s, z: v.z * s });
    const vDot = (a,b) => a.x*b.x + a.y*b.y + a.z*b.z;
    const vLen = v => Math.sqrt(vDot(v,v));
    const vNorm = v => { const L = vLen(v); return L>0 ? vScale(v, 1/L) : {x:0,y:0,z:0}; };
    const clamp01 = x => Math.max(0, Math.min(1, x));

    // iterate image pixels
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {

            // compute a world-space point on the image plane (pixel center)
            const u = (x + 0.5) / W;           // [0,1]
            const v = (y + 0.5) / H;           // [0,1]
            const pixelWorld = { x: u, y: 1.0 - v, z: 0.0 };

            // ray direction from eye through pixel (not normalized on purpose for t scaling)
            const rd = vSub(pixelWorld, eye);

            // find nearest intersection
            let bestT = Infinity;
            let hitInfo = null;
            let hitBox = null;

            for (let i = 0; i < boxes.length; i++) {
                const res = intersectRayAABB(eye, rd, boxes[i]);
                if (res && res.t > 0 && res.t < bestT) {
                    bestT = res.t;
                    hitBox = boxes[i];
                    // compute hit point
                    const hp = { x: eye.x + rd.x * res.t, y: eye.y + rd.y * res.t, z: eye.z + rd.z * res.t };
                    hitInfo = { p: hp, n: { x: res.normal[0], y: res.normal[1], z: res.normal[2] } };
                }
            }

            // default background black
            let R = 0, G = 0, B = 0, A = 255;

            if (hitInfo && hitBox) {
                // gather material properties with safe defaults
                const Ka = (hitBox.ambient  && hitBox.ambient.length)  ? hitBox.ambient  : [0,0,0];
                const Kd = (hitBox.diffuse  && hitBox.diffuse.length)  ? hitBox.diffuse  : [1,1,1];
                const Ks = (hitBox.specular && hitBox.specular.length) ? hitBox.specular : [0,0,0];
                const shin = (typeof hitBox.n === 'number') ? hitBox.n : 32;

                // normalize vectors needed for Blinn-Phong
                const N = vNorm(hitInfo.n);
                const L = vNorm(vSub(lightPos, hitInfo.p));
                const V = vNorm(vSub(eye, hitInfo.p));
                const H = vNorm(vAdd(L, V));

                const NdotL = Math.max(0, vDot(N, L));
                const NdotH = Math.max(0, vDot(N, H));

                // compute components
                const ambient  = [ Ka[0]*La[0], Ka[1]*La[1], Ka[2]*La[2] ];
                const diffuse  = [ Kd[0]*Ld[0]*NdotL, Kd[1]*Ld[1]*NdotL, Kd[2]*Ld[2]*NdotL ];
                const specular = (NdotL > 0)
                    ? [ Ks[0]*Ls[0]*Math.pow(NdotH, shin), Ks[1]*Ls[1]*Math.pow(NdotH, shin), Ks[2]*Ls[2]*Math.pow(NdotH, shin) ]
                    : [0,0,0];

                // final color clamped to [0,1]
                const colR = clamp01(ambient[0] + diffuse[0] + specular[0]);
                const colG = clamp01(ambient[1] + diffuse[1] + specular[1]);
                const colB = clamp01(ambient[2] + diffuse[2] + specular[2]);

                R = Math.floor(colR * 255);
                G = Math.floor(colG * 255);
                B = Math.floor(colB * 255);
            }

            // write pixel into image buffer
            const idx = (y * W + x) * 4;
            out.data[idx    ] = R;
            out.data[idx + 1] = G;
            out.data[idx + 2] = B;
            out.data[idx + 3] = A;
        }
    }

    context.putImageData(out, 0, 0);
}
// [AI USE - end]

// Color constructor
class Color {
    constructor(r,g,b,a) {
        try {
            if ((typeof(r) !== "number") || (typeof(g) !== "number") || (typeof(b) !== "number") || (typeof(a) !== "number"))
                throw "color component not a number";
            else if ((r<0) || (g<0) || (b<0) || (a<0)) 
                throw "color component less than 0";
            else if ((r>255) || (g>255) || (b>255) || (a>255)) 
                throw "color component bigger than 255";
            else {
                this.r = r; this.g = g; this.b = b; this.a = a; 
            }
        } // end try
        
        catch (e) {
            console.log(e);
        }
    } // end Color constructor

        // Color change method
    change(r,g,b,a) {
        try {
            if ((typeof(r) !== "number") || (typeof(g) !== "number") || (typeof(b) !== "number") || (typeof(a) !== "number"))
                throw "color component not a number";
            else if ((r<0) || (g<0) || (b<0) || (a<0)) 
                throw "color component less than 0";
            else if ((r>255) || (g>255) || (b>255) || (a>255)) 
                throw "color component bigger than 255";
            else {
                this.r = r; this.g = g; this.b = b; this.a = a; 
            }
        } // end throw
        
        catch (e) {
            console.log(e);
        }
    } // end Color change method
} // end color class


/* utility functions */

// draw a pixel at x,y using color
function drawPixel(imagedata,x,y,color) {
    try {
        if ((typeof(x) !== "number") || (typeof(y) !== "number"))
            throw "drawpixel location not a number";
        else if ((x<0) || (y<0) || (x>=imagedata.width) || (y>=imagedata.height))
            throw "drawpixel location outside of image";
        else if (color instanceof Color) {
            var pixelindex = (y*imagedata.width + x) * 4;
            imagedata.data[pixelindex] = color.r;
            imagedata.data[pixelindex+1] = color.g;
            imagedata.data[pixelindex+2] = color.b;
            imagedata.data[pixelindex+3] = color.a;
        } else 
            throw "drawpixel color is not a Color";
    } // end try
    
    catch(e) {
        console.log(e);
    }
} // end drawPixel
    
// draw random pixels
function drawRandPixels(context) {
    var c = new Color(0,0,0,0); // the color at the pixel: black
    var w = context.canvas.width;
    var h = context.canvas.height;
    var imagedata = context.createImageData(w,h);
    const PIXEL_DENSITY = 0.01;
    var numPixels = (w*h)*PIXEL_DENSITY; 
    
    // Loop over 1% of the pixels in the image
    for (var x=0; x<numPixels; x++) {
        c.change(Math.random()*255,Math.random()*255,
            Math.random()*255,255); // rand color
        drawPixel(imagedata,
            Math.floor(Math.random()*w),
            Math.floor(Math.random()*h),
                c);
    } // end for x
    context.putImageData(imagedata, 0, 0);
} // end draw random pixels

// get the input ellipsoids from the standard class URL
function getInputEllipsoids() {
    const INPUT_ELLIPSOIDS_URL = 
        "https://ncsucgclass.github.io/prog1/ellipsoids.json";
        
    // load the ellipsoids file
    var httpReq = new XMLHttpRequest(); // a new http request
    httpReq.open("GET",INPUT_ELLIPSOIDS_URL,false); // init the request
    httpReq.send(null); // send the request
    var startTime = Date.now();
    while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
        if ((Date.now()-startTime) > 3000)
            break;
    } // until its loaded or we time out after three seconds
    if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE)) {
        console.log*("Unable to open input ellipses file!");
        return String.null;
    } else
        return JSON.parse(httpReq.response); 
} // end get input ellipsoids

//get the input triangles from the standard class URL
function getInputTriangles() {
    const INPUT_TRIANGLES_URL = 
        "https://ncsucgclass.github.io/prog1/triangles.json";
        
    // load the triangles file
    var httpReq = new XMLHttpRequest(); // a new http request
    httpReq.open("GET",INPUT_TRIANGLES_URL,false); // init the request
    httpReq.send(null); // send the request
    var startTime = Date.now();
    while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
        if ((Date.now()-startTime) > 3000)
            break;
    } // until its loaded or we time out after three seconds
    if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE)) {
        console.log*("Unable to open input triangles file!");
        return String.null;
    } else
        return JSON.parse(httpReq.response); 
} // end get input triangles

//get the input boxex from the standard class URL
function getInputBoxes() {
    const INPUT_BOXES_URL = 
        "https://ncsucgclass.github.io/prog1/boxes.json";
        
    // load the boxes file
    var httpReq = new XMLHttpRequest(); // a new http request
    httpReq.open("GET",INPUT_BOXES_URL,false); // init the request
    httpReq.send(null); // send the request
    var startTime = Date.now();
    while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
        if ((Date.now()-startTime) > 3000)
            break;
    } // until its loaded or we time out after three seconds
    if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE)) {
        console.log*("Unable to open input boxes file!");
        return String.null;
    } else
        return JSON.parse(httpReq.response); 
} // end get input boxes

// put random points in the ellipsoids from the class github
function drawRandPixelsInInputEllipsoids(context) {
    var inputEllipsoids = getInputEllipsoids();
    var w = context.canvas.width;
    var h = context.canvas.height;
    var imagedata = context.createImageData(w,h);
    const PIXEL_DENSITY = 0.1;
    var numCanvasPixels = (w*h)*PIXEL_DENSITY; 
    
    if (inputEllipsoids != String.null) { 
        var x = 0; var y = 0; // pixel coord init
        var cx = 0; var cy = 0; // init center x and y coord
        var ellipsoidXRadius = 0; // init ellipsoid x radius
        var ellipsoidYRadius = 0; // init ellipsoid y radius
        var numEllipsoidPixels = 0; // init num pixels in ellipsoid
        var c = new Color(0,0,0,0); // init the ellipsoid color
        var n = inputEllipsoids.length; // the number of input ellipsoids
        //console.log("number of ellipses: " + n);

        // Loop over the ellipsoids, draw rand pixels in each
        for (var e=0; e<n; e++) {
            cx = w*inputEllipsoids[e].x; // ellipsoid center x
            cy = h*inputEllipsoids[e].y; // ellipsoid center y
            ellipsoidXRadius = Math.round(w*inputEllipsoids[e].a); // x radius
            ellipsoidYRadius = Math.round(h*inputEllipsoids[e].b); // y radius
            numEllipsoidPixels = ellipsoidXRadius*ellipsoidYRadius*Math.PI; // projected ellipsoid area
            numEllipsoidPixels *= PIXEL_DENSITY; // percentage of ellipsoid area to render to pixels
            numEllipsoidPixels = Math.round(numEllipsoidPixels);
            //console.log("ellipsoid x radius: "+ellipsoidXRadius);
            //console.log("ellipsoid y radius: "+ellipsoidYRadius);
            //console.log("num ellipsoid pixels: "+numEllipsoidPixels);
            c.change(
                inputEllipsoids[e].diffuse[0]*255,
                inputEllipsoids[e].diffuse[1]*255,
                inputEllipsoids[e].diffuse[2]*255,
                255); // ellipsoid diffuse color
            for (var p=0; p<numEllipsoidPixels; p++) {
                do {
                    x = Math.random()*2 - 1; // in unit square 
                    y = Math.random()*2 - 1; // in unit square
                } while (Math.sqrt(x*x + y*y) > 1) // a circle is also an ellipse
                drawPixel(imagedata,
                    cx+Math.round(x*ellipsoidXRadius),
                    cy+Math.round(y*ellipsoidYRadius),c);
                //console.log("color: ("+c.r+","+c.g+","+c.b+")");
                //console.log("x: "+Math.round(w*inputEllipsoids[e].x));
                //console.log("y: "+Math.round(h*inputEllipsoids[e].y));
            } // end for pixels in ellipsoid
        } // end for ellipsoids
        context.putImageData(imagedata, 0, 0);
    } // end if ellipsoids found
} // end draw rand pixels in input ellipsoids

// draw 2d projections read from the JSON file at class github
function drawInputEllipsoidsUsingArcs(context) {
    var inputEllipsoids = getInputEllipsoids();
    
    
    if (inputEllipsoids != String.null) { 
        var c = new Color(0,0,0,0); // the color at the pixel: black
        var w = context.canvas.width;
        var h = context.canvas.height;
        var n = inputEllipsoids.length; 
        //console.log("number of ellipsoids: " + n);

        // Loop over the ellipsoids, draw each in 2d
        for (var e=0; e<n; e++) {
            context.fillStyle = 
                "rgb(" + Math.floor(inputEllipsoids[e].diffuse[0]*255)
                +","+ Math.floor(inputEllipsoids[e].diffuse[1]*255)
                +","+ Math.floor(inputEllipsoids[e].diffuse[2]*255) +")"; // diffuse color
            context.save(); // remember previous (non-) scale
            context.scale(1, inputEllipsoids[e].b/inputEllipsoids[e].a); // scale by ellipsoid ratio 
            context.beginPath();
            context.arc(
                Math.round(w*inputEllipsoids[e].x),
                Math.round(h*inputEllipsoids[e].y),
                Math.round(w*inputEllipsoids[e].a),
                0,2*Math.PI);
            context.restore(); // undo scale before fill so stroke width unscaled
            context.fill();
            //console.log(context.fillStyle);
            //console.log("x: "+Math.round(w*inputEllipsoids[e].x));
            //console.log("y: "+Math.round(h*inputEllipsoids[e].y));
            //console.log("a: "+Math.round(w*inputEllipsoids[e].a));
            //console.log("b: "+Math.round(h*inputEllipsoids[e].b));
        } // end for ellipsoids
    } // end if ellipsoids found
} // end draw input ellipsoids

//put random points in the triangles from the class github
function drawRandPixelsInInputTriangles(context) {
    var inputTriangles = getInputTriangles();
    var w = context.canvas.width;
    var h = context.canvas.height;
    var imagedata = context.createImageData(w,h);
    const PIXEL_DENSITY = 0.1;
    var numCanvasPixels = (w*h)*PIXEL_DENSITY; 
    
    if (inputTriangles != String.null) { 
        var x = 0; var y = 0; // pixel coord init
        var cx = 0; var cy = 0; // init center x and y coord
        var numTrianglePixels = 0; // init num pixels in triangle
        var c = new Color(0,0,0,0); // init the triangle color
        var n = inputTriangles.length; // the number of input files
        //console.log("number of files: " + n);

        // Loop over the triangles, draw rand pixels in each
        for (var f=0; f<n; f++) {
        	var tn = inputTriangles[f].triangles.length;
        	//console.log("number of triangles in this files: " + tn);
        	
        	// Loop over the triangles, draw each in 2d
        	for(var t=0; t<tn; t++){
        		var vertex1 = inputTriangles[f].triangles[t][0];
        		var vertex2 = inputTriangles[f].triangles[t][1];
        		var vertex3 = inputTriangles[f].triangles[t][2];

        		var vertexPos1 = inputTriangles[f].vertices[vertex1];
        		var vertexPos2 = inputTriangles[f].vertices[vertex2];
        		var vertexPos3 = inputTriangles[f].vertices[vertex3];
        		//console.log("vertexPos1 " + vertexPos1);
        		//console.log("vertexPos2 " + vertexPos2);
        		//console.log("vertexPos3 " + vertexPos3);
        		
        		// triangle position on canvas
        		
        		var v1 = [w*vertexPos1[0], h*vertexPos1[1]];
        		var v2 = [w*vertexPos2[0], h*vertexPos2[1]];
        		var v3 = [w*vertexPos3[0], h*vertexPos3[1]];
        		
        		// calculate triangle area on canvas (shoelace formula)
        		var triangleArea = 0.5*Math.abs(v1[0]*v2[1]+v2[0]*v3[1]+v3[0]*v1[1]-v2[0]*v1[1]-v3[0]*v2[1]-v1[0]*v3[1]);
        		var numTrianglePixels = triangleArea; // init num pixels in triangle
            	//console.log("triangle area " + triangleArea);
            	numTrianglePixels *= PIXEL_DENSITY; // percentage of triangle area to render to pixels
            	numTrianglePixels = Math.round(numTrianglePixels);
            	// console.log("numTrianglePixels " + numTrianglePixels);
            	c.change(
            		inputTriangles[f].material.diffuse[0]*255,
                	inputTriangles[f].material.diffuse[1]*255,
                	inputTriangles[f].material.diffuse[2]*255,
                	255); // triangle diffuse color
            	for (var p=0; p<numTrianglePixels; p++) {
                    var point; // on canvas plane
            		var triangleTest = 0;
            		while (triangleTest == 0 ){ //if the pixel outside the triangle
                  
            			point = [Math.floor(Math.random()*w), Math.floor(Math.random()*h)];
                    	// plane checking
            			
                    	var t1 = ((point[0]-v2[0]) * (v1[1] - v2[1]) - (v1[0] - v2[0]) * (point[1] - v2[1])) < 0.0;
                    	var t2 = ((point[0]-v3[0]) * (v2[1] - v3[1]) - (v2[0] - v3[0]) * (point[1] - v3[1])) < 0.0;
                    	var t3 = ((point[0]-v1[0]) * (v3[1] - v1[1]) - (v3[0] - v1[0]) * (point[1] - v1[1])) < 0.0;
                    	
                    	if((t1==t2)&&(t2==t3)) // draw the pixel if inside the triangle
                    		triangleTest = 1;
            		}
            		drawPixel(imagedata,point[0],point[1],c);
                	//console.log("color: ("+c.r+","+c.g+","+c.b+")");
                	//console.log("x: "+ x);
                	//console.log("y: "+ y);
            	} // end for pixels in triangle
        	} // end for triangles
    	} // end for files
        context.putImageData(imagedata, 0, 0);
    } // end if triangle file found
} // end draw rand pixels in input triangles

//draw 2d projections traingle from the JSON file at class github
function drawInputTrainglesUsingPaths(context) {
    var inputTriangles = getInputTriangles();
    
    if (inputTriangles != String.null) { 
        var c = new Color(0,0,0,0); // the color at the pixel: black
        var w = context.canvas.width;
        var h = context.canvas.height;
        var n = inputTriangles.length; 
        //console.log("number of files: " + n);

        // Loop over the input files
        for (var f=0; f<n; f++) {
        	var tn = inputTriangles[f].triangles.length;
        	//console.log("number of triangles in this files: " + tn);
        	
        	// Loop over the triangles, draw each in 2d
        	for(var t=0; t<tn; t++){
        		var vertex1 = inputTriangles[f].triangles[t][0];
        		var vertex2 = inputTriangles[f].triangles[t][1];
        		var vertex3 = inputTriangles[f].triangles[t][2];

        		var vertexPos1 = inputTriangles[f].vertices[vertex1];
        		var vertexPos2 = inputTriangles[f].vertices[vertex2];
        		var vertexPos3 = inputTriangles[f].vertices[vertex3];
        		//console.log("vertexPos1 " + vertexPos1);
        		//console.log("vertexPos2 " + vertexPos2);
        		//console.log("vertexPos3 " + vertexPos3);
        		
            	context.fillStyle = 
            	    "rgb(" + Math.floor(inputTriangles[f].material.diffuse[0]*255)
            	    +","+ Math.floor(inputTriangles[f].material.diffuse[1]*255)
            	    +","+ Math.floor(inputTriangles[f].material.diffuse[2]*255) +")"; // diffuse color
            
            	var path=new Path2D();
            	path.moveTo(w*vertexPos1[0],h*vertexPos1[1]);
            	path.lineTo(w*vertexPos2[0],h*vertexPos2[1]);
            	path.lineTo(w*vertexPos3[0],h*vertexPos3[1]);
            	path.closePath();
            	context.fill(path);

        	} // end for triangles
        } // end for files
    } // end if triangle files found
} // end draw input triangles

// put random points in the boxes from the class github
function drawRandPixelsInInputBoxes(context) {
    var inputBoxes = getInputBoxes();
    var w = context.canvas.width;
    var h = context.canvas.height;
    var imagedata = context.createImageData(w,h);
    const PIXEL_DENSITY = 0.1;
    var numCanvasPixels = (w*h)*PIXEL_DENSITY; 
    
    if (inputBoxes != String.null) { 
	    var x  = 0; var y  = 0; // pixel coord init
        var lx = 0; var rx = 0; // input lx, rx from boxes.json
        var by = 0; var ty = 0; // input by, ty from boxes.json
        var fz = 0; var rz = 0; // input fz, rz from boxes.json
        var numBoxPixels = 0; // init num pixels in boxes
        var c = new Color(0,0,0,0); // init the box color
        var n = inputBoxes.length; // the number of input boxes
        //console.log("number of ellipses: " + n);

        // Loop over the ellipsoids, draw rand pixels in each
        for (var b=0; b<n; b++) {
			// input lx,rx,by,ty on canvas
			lx = w*inputBoxes[b].lx;
			rx = w*inputBoxes[b].rx;
			by = h*inputBoxes[b].by;
			ty = h*inputBoxes[b].ty;           
			
            numBoxesPixels  = (rx-lx)*(ty-by); // projected box area 
            numBoxesPixels *= PIXEL_DENSITY;  // percentage of box area to render to pixels
            numBoxesPixels  = Math.round(numBoxesPixels);
           
            //console.log("num box pixels: "+numBoxesPixels);
            
			c.change(
                inputBoxes[b].diffuse[0]*255,
                inputBoxes[b].diffuse[1]*255,
                inputBoxes[b].diffuse[2]*255,
                255); // box diffuse color
            for (var p=0; p<numBoxesPixels; p++) {
                do {
                    x = Math.floor(Math.random()*w); 
                    y = Math.floor(Math.random()*h); 
                } while ( x<lx || x>rx || y>ty || y<by ) // inside the projection
                drawPixel(imagedata,x,y,c);
                //console.log("color: ("+c.r+","+c.g+","+c.b+")");
                //console.log("x: " + x);
                //console.log("y: " + y);
            } // end for pixels in box
        } // end for boxes
        context.putImageData(imagedata, 0, 0);
    } // end if boxes found
} // end draw rand pixels in input boxes

//draw 2d projections boxes from the JSON file at class github
function drawInputBoxesUsingPaths(context) {
    var inputBoxes = getInputBoxes();
    var n = inputBoxes.length; // the number of input boxes
	
    if (inputBoxes != String.null) { 
		var w = context.canvas.width;
        var h = context.canvas.height;
        var c = new Color(0,0,0,0); // the color at the pixel: black
        var x  = 0; var y  = 0; // pixel coord init
        var lx = 0; var rx = 0; // input lx, rx from boxes.json
        var by = 0; var ty = 0; // input by, ty from boxes.json
        var fz = 0; var rz = 0; // input fz, rz from boxes.json
        //console.log("number of files: " + n);

        // Loop over the input files
        for (var b=0; b<n; b++) {
				
			// input lx,rx,by,ty on canvas
			lx = w*inputBoxes[b].lx;
			rx = w*inputBoxes[b].rx;
			by = h*inputBoxes[b].by;
			ty = h*inputBoxes[b].ty; 
        		
            context.fillStyle = 
            	"rgb(" + Math.floor(inputBoxes[b].diffuse[0]*255)
            	+","+ Math.floor(inputBoxes[b].diffuse[1]*255)
            	+","+ Math.floor(inputBoxes[b].diffuse[2]*255) +")"; // diffuse color
            
            var path=new Path2D();
            path.moveTo(lx,ty);
            path.lineTo(lx,by);
            path.lineTo(rx,by);
			path.lineTo(rx,ty);
            path.closePath();
            context.fill(path);

        } // end for files
    } // end if box files found
} // end draw input boxes

/* main -- here is where execution begins after window load */
function main() {
    const canvas = document.getElementById("viewport");
    const context = canvas.getContext("2d");

    // Start by rendering the existing boxes scene (Part 2)
    try { renderBoxesRayCast(context); } catch (e) { console.log("renderBoxesRayCast failed:", e); }

    // Listen for Space to render Part-3, and 'B' to go back to boxes
    window.addEventListener('keydown', function(e) {
        if (e.code === "Space") {
            e.preventDefault();
            try { renderPart3(context); }
            catch (err) { console.log("renderPart3 error:", err); }
        } else if (e.key === 'b' || e.key === 'B') {
            e.preventDefault();
            try { renderBoxesRayCast(context); }
            catch (err) { console.log("renderBoxesRayCast error:", err); }
        }
    }, false);
}
