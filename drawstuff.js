/* classes */ 

/* Ray Casting Functions */

/* Enhanced Ray Casting Implementation - Part 1 & 2 Only */

// Part 1: Unlit boxes with different implementation
function drawRayCastBoxesUnlit(context) {
    var boxes = getInputBoxes();
    var width = context.canvas.width;
    var height = context.canvas.height;
    var imageBuffer = context.createImageData(width, height);
    
    if (boxes !== String.null) {
        // Camera configuration as specified
        var cameraPosition = [0.5, 0.5, -0.5];
        var viewDirection = [0, 0, 1];
        var upVector = [0, 1, 0];
        
        // Calculate viewing vectors
        var viewVector = normalize([
            viewDirection[0] - cameraPosition[0],
            viewDirection[1] - cameraPosition[1],
            viewDirection[2] - cameraPosition[2]
        ]);
        
        var sideVector = normalize(cross(viewVector, upVector));
        var cameraUpVector = normalize(cross(sideVector, viewVector));
        
        // Process each screen pixel
        for (var row = 0; row < height; row++) {
            for (var col = 0; col < width; col++) {
                // Convert pixel coordinates to world coordinates
                var u = (col / width) - 0.5;
                var v = ((height - row) / height) - 0.5;
                
                // Calculate ray direction for current pixel
                var rayDirection = normalize([
                    viewVector[0] + u * sideVector[0] + v * cameraUpVector[0],
                    viewVector[1] + u * sideVector[1] + v * cameraUpVector[1],
                    viewVector[2] + u * sideVector[2] + v * cameraUpVector[2]
                ]);
                
                var rayStart = cameraPosition;
                
                // Check for box intersections
                var minDistance = Number.MAX_VALUE;
                var hitBox = null;
                
                for (var i = 0; i < boxes.length; i++) {
                    var currentBox = boxes[i];
                    var hitDistance = calculateBoxHitDistance(rayStart, rayDirection, currentBox);
                    
                    if (hitDistance > 0 && hitDistance < minDistance) {
                        minDistance = hitDistance;
                        hitBox = currentBox;
                    }
                }
                
                // Determine pixel color
                if (hitBox !== null) {
                    var finalColor = new Color(
                        hitBox.diffuse[0] * 255,
                        hitBox.diffuse[1] * 255,
                        hitBox.diffuse[2] * 255,
                        255
                    );
                    drawPixel(imageBuffer, col, row, finalColor);
                } else {
                    // Set background to black
                    drawPixel(imageBuffer, col, row, new Color(0, 0, 0, 255));
                }
            }
        }
        context.putImageData(imageBuffer, 0, 0);
    }
}

// Part 2: Lit boxes with Blinn-Phong illumination
function drawRayCastBoxesLit(context) {
    var boxes = getInputBoxes();
    var width = context.canvas.width;
    var height = context.canvas.height;
    var imageBuffer = context.createImageData(width, height);
    
    if (boxes !== String.null) {
        // Camera and lighting setup
        var cameraPosition = [0.5, 0.5, -0.5];
        var viewDirection = [0, 0, 1];
        var upVector = [0, 1, 0];
        var lightPosition = [-0.5, 1.5, -0.5];
        var lightIntensity = [1.0, 1.0, 1.0];
        
        // Calculate viewing vectors
        var viewVector = normalize([
            viewDirection[0] - cameraPosition[0],
            viewDirection[1] - cameraPosition[1],
            viewDirection[2] - cameraPosition[2]
        ]);
        
        var sideVector = normalize(cross(viewVector, upVector));
        var cameraUpVector = normalize(cross(sideVector, viewVector));
        
        // Process each screen pixel
        for (var row = 0; row < height; row++) {
            for (var col = 0; col < width; col++) {
                // Convert pixel coordinates to world coordinates
                var u = (col / width) - 0.5;
                var v = ((height - row) / height) - 0.5;
                
                // Calculate ray direction
                var rayDirection = normalize([
                    viewVector[0] + u * sideVector[0] + v * cameraUpVector[0],
                    viewVector[1] + u * sideVector[1] + v * cameraUpVector[1],
                    viewVector[2] + u * sideVector[2] + v * cameraUpVector[2]
                ]);
                
                var rayStart = cameraPosition;
                
                // Find closest box intersection with surface information
                var minDistance = Number.MAX_VALUE;
                var hitBox = null;
                var hitPosition = null;
                var surfaceNormal = null;
                
                for (var i = 0; i < boxes.length; i++) {
                    var currentBox = boxes[i];
                    var hitInfo = calculateBoxHitWithNormal(rayStart, rayDirection, currentBox);
                    
                    if (hitInfo.distance > 0 && hitInfo.distance < minDistance) {
                        minDistance = hitInfo.distance;
                        hitBox = currentBox;
                        hitPosition = hitInfo.position;
                        surfaceNormal = hitInfo.normal;
                    }
                }
                
                // Calculate lighting and set pixel color
                if (hitBox !== null) {
                    var illuminatedColor = calculateSurfaceIllumination(
                        hitPosition,
                        surfaceNormal,
                        cameraPosition,
                        lightPosition,
                        lightIntensity,
                        hitBox.diffuse,
                        hitBox.diffuse, // Use diffuse color for ambient
                        [1.0, 1.0, 1.0], // White specular
                        50.0 // Shininess factor
                    );
                    
                    var finalColor = new Color(
                        illuminatedColor[0] * 255,
                        illuminatedColor[1] * 255,
                        illuminatedColor[2] * 255,
                        255
                    );
                    drawPixel(imageBuffer, col, row, finalColor);
                } else {
                    // Set background to black
                    drawPixel(imageBuffer, col, row, new Color(0, 0, 0, 255));
                }
            }
        }
        context.putImageData(imageBuffer, 0, 0);
    }
}

// Alternative box intersection calculation
function calculateBoxHitDistance(rayOrigin, rayDirection, box) {
    var xMin = box.lx, xMax = box.rx;
    var yMin = box.by, yMax = box.ty;
    var zMin = box.fz, zMax = box.rz;
    
    // Calculate intersection distances for each axis
    var tx1 = (xMin - rayOrigin[0]) / rayDirection[0];
    var tx2 = (xMax - rayOrigin[0]) / rayDirection[0];
    
    var ty1 = (yMin - rayOrigin[1]) / rayDirection[1];
    var ty2 = (yMax - rayOrigin[1]) / rayDirection[1];
    
    var tz1 = (zMin - rayOrigin[2]) / rayDirection[2];
    var tz2 = (zMax - rayOrigin[2]) / rayDirection[2];
    
    // Ensure proper min/max ordering
    if (tx1 > tx2) [tx1, tx2] = [tx2, tx1];
    if (ty1 > ty2) [ty1, ty2] = [ty2, ty1];
    if (tz1 > tz2) [tz1, tz2] = [tz2, tz1];
    
    // Find the largest minimum and smallest maximum
    var tNear = Math.max(tx1, ty1, tz1);
    var tFar = Math.min(tx2, ty2, tz2);
    
    // Check for valid intersection
    if (tNear > tFar || tFar < 0) return -1;
    
    // Return the closest positive intersection distance
    return tNear >= 0 ? tNear : tFar;
}

// Enhanced intersection with normal calculation
function calculateBoxHitWithNormal(rayOrigin, rayDirection, box) {
    var hitDistance = calculateBoxHitDistance(rayOrigin, rayDirection, box);
    
    if (hitDistance <= 0) return { distance: -1 };
    
    // Calculate hit position
    var hitPoint = [
        rayOrigin[0] + hitDistance * rayDirection[0],
        rayOrigin[1] + hitDistance * rayDirection[1],
        rayOrigin[2] + hitDistance * rayDirection[2]
    ];
    
    // Determine which face was hit by checking proximity to box boundaries
    var tolerance = 0.0001;
    var normalVector = [0, 0, 0];
    
    // Check X faces
    if (Math.abs(hitPoint[0] - box.lx) < tolerance) normalVector[0] = -1;
    else if (Math.abs(hitPoint[0] - box.rx) < tolerance) normalVector[0] = 1;
    // Check Y faces
    else if (Math.abs(hitPoint[1] - box.by) < tolerance) normalVector[1] = -1;
    else if (Math.abs(hitPoint[1] - box.ty) < tolerance) normalVector[1] = 1;
    // Check Z faces
    else if (Math.abs(hitPoint[2] - box.fz) < tolerance) normalVector[2] = -1;
    else if (Math.abs(hitPoint[2] - box.rz) < tolerance) normalVector[2] = 1;
    
    return {
        distance: hitDistance,
        position: hitPoint,
        normal: normalVector
    };
}

// Enhanced Blinn-Phong illumination calculation
function calculateSurfaceIllumination(surfacePoint, surfaceNormal, viewerPosition, 
                                     lightPosition, lightColor, materialDiffuse, 
                                     materialAmbient, materialSpecular, shininess) {
    // Normalize all vectors
    var N = normalize(surfaceNormal);
    var V = normalize([
        viewerPosition[0] - surfacePoint[0],
        viewerPosition[1] - surfacePoint[1],
        viewerPosition[2] - surfacePoint[2]
    ]);
    var L = normalize([
        lightPosition[0] - surfacePoint[0],
        lightPosition[1] - surfacePoint[1],
        lightPosition[2] - surfacePoint[2]
    ]);
    var H = normalize([
        L[0] + V[0],
        L[1] + V[1],
        L[2] + V[2]
    ]);
    
    // Calculate lighting components
    var diffuseComponent = Math.max(0, dot(N, L));
    var specularComponent = Math.pow(Math.max(0, dot(N, H)), shininess);
    
    // Combine all lighting effects
    var finalColor = [
        materialAmbient[0] * lightColor[0] + 
        materialDiffuse[0] * lightColor[0] * diffuseComponent + 
        materialSpecular[0] * lightColor[0] * specularComponent,
        
        materialAmbient[1] * lightColor[1] + 
        materialDiffuse[1] * lightColor[1] * diffuseComponent + 
        materialSpecular[1] * lightColor[1] * specularComponent,
        
        materialAmbient[2] * lightColor[2] + 
        materialDiffuse[2] * lightColor[2] * diffuseComponent + 
        materialSpecular[2] * lightColor[2] * specularComponent
    ];
    
    // Ensure color values are valid
    finalColor[0] = Math.min(1, Math.max(0, finalColor[0]));
    finalColor[1] = Math.min(1, Math.max(0, finalColor[1]));
    finalColor[2] = Math.min(1, Math.max(0, finalColor[2]));
    
    return finalColor;
}

// Keep all the professor's existing utility functions below...
// (The subtract, add, scale, dot, cross, length, normalize functions remain unchanged)

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

// function main() {

//     // Get the canvas and context
//     var canvas = document.getElementById("viewport"); 
//     var context = canvas.getContext("2d");
 
//     // Create the image
//     //drawRandPixels(context);
//       // shows how to draw pixels
    
//     //drawRandPixelsInInputEllipsoids(context);
//       // shows how to draw pixels and read input file
      
//     //drawInputEllipsoidsUsingArcs(context);
//       // shows how to read input file, but not how to draw pixels
    
//     //drawRandPixelsInInputTriangles(context);
//       // shows how to draw pixels and read input file
    
//     //drawInputTrainglesUsingPaths(context);
//       // shows how to read input file, but not how to draw pixels
    
//     drawRandPixelsInInputBoxes(context);
//       // shows how to draw pixels and read input file
    
//     //drawInputBoxesUsingPaths(context);
//       // shows how to read input file, but not how to draw pixels
// }

function main() {
    // Get the canvas and context
    var canvas = document.getElementById("viewport"); 
    var context = canvas.getContext("2d");
 
    // Create the image using ray casting
    
    // Part 1: Unlit boxes
    //drawRayCastBoxesUnlit(context);
    
    // Part 2: Lit boxes with Blinn-Phong illumination
    drawRayCastBoxesLit(context);
    
    // You can comment/uncomment the above lines to test each part
}
