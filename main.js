// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load font and create text meshes
const loader = new THREE.FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const alphabet = 'i'; // Replace with the last alphabet character of your name
    const digit = '8'; // Replace with the last digit of your student ID

    const alphabetGeometry = new THREE.TextGeometry(alphabet, {
        font: font,
        size: 5,
        height: 1,
        curveSegments: 12,
        bevelEnabled: false
    });
    const digitGeometry = new THREE.TextGeometry(digit, {
        font: font,
        size: 5,
        height: 1,
        curveSegments: 12,
        bevelEnabled: false
    });

    const ambientIntensity = 0.218; // 200 + last three digits of your student ID

    // Alphabet ShaderMaterial
    const alphabetMaterial = new THREE.ShaderMaterial({
        uniforms: {
            lightPosition: { value: new THREE.Vector3(0, 0, 0) },
            ambientIntensity: { value: ambientIntensity },
            diffuseColor: { value: new THREE.Color('#79CEE0') }, // Replace with your favorite color
            specularColor: { value: new THREE.Color(0xffffff) },
            shininess: { value: 30.0 }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                // Pass the normal and position to the fragment shader
                vNormal = normalize(normalMatrix * normal);
                vPosition = vec3(modelViewMatrix * vec4(position, 1.0));
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 lightPosition;
            uniform float ambientIntensity;
            uniform vec3 diffuseColor;
            uniform vec3 specularColor;
            uniform float shininess;
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                // Ambient component
                vec3 ambient = ambientIntensity * diffuseColor;

                // Diffuse component
                vec3 lightDir = normalize(lightPosition - vPosition);
                float diff = max(dot(vNormal, lightDir), 0.0);
                vec3 diffuse = diff * diffuseColor;

                // Specular component (Plastic-like)
                vec3 viewDir = normalize(-vPosition);
                vec3 reflectDir = reflect(-lightDir, vNormal);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
                vec3 specular = spec * specularColor;

                // Combine all components
                gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
            }
        `
    });

    // Digit ShaderMaterial
    const digitMaterial = new THREE.ShaderMaterial({
        uniforms: {
            lightPosition: { value: new THREE.Vector3(0, 0, 0) },
            ambientIntensity: { value: ambientIntensity },
            diffuseColor: { value: new THREE.Color(0xff0000) }, // Replace with the complementary color
            specularColor: { value: new THREE.Color(0xff0000) },
            shininess: { value: 100.0 }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                // Pass the normal and position to the fragment shader
                vNormal = normalize(normalMatrix * normal);
                vPosition = vec3(modelViewMatrix * vec4(position, 1.0));
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 lightPosition;
            uniform float ambientIntensity;
            uniform vec3 diffuseColor;
            uniform vec3 specularColor;
            uniform float shininess;
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                // Ambient component
                vec3 ambient = ambientIntensity * diffuseColor;

                // Diffuse component
                vec3 lightDir = normalize(lightPosition - vPosition);
                float diff = max(dot(vNormal, lightDir), 0.0);
                vec3 diffuse = diff * diffuseColor;

                // Specular component (Metal-like)
                vec3 viewDir = normalize(-vPosition);
                vec3 reflectDir = reflect(-lightDir, vNormal);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
                vec3 specular = spec * specularColor;

                // Combine all components
                gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
            }
        `
    });

    const alphabetMesh = new THREE.Mesh(alphabetGeometry, alphabetMaterial);
    const digitMesh = new THREE.Mesh(digitGeometry, digitMaterial);

    alphabetMesh.position.set(-10, 0, 0);
    digitMesh.position.set(10, 0, 0);

    scene.add(alphabetMesh);
    scene.add(digitMesh);
});

// Glowing cube ShaderMaterial
const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
        glowColor: { value: new THREE.Color(0xffffff) }
    },
    vertexShader: `
        varying vec3 vNormal;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
            float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            gl_FragColor = vec4(glowColor * intensity, 1.0);
        }
    `,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    transparent: true
});

// Central glowing cube
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cube = new THREE.Mesh(cubeGeometry, glowMaterial);
cube.position.set(0, 0, 0);
scene.add(cube);

// Point light at the cube's position
const pointLight = new THREE.PointLight(0xff0000 , 2, 50); // Increased intensity and reduced distance
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// Camera position
camera.position.z = 20;

// Render loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Interactivity
document.addEventListener('keydown', function (event) {
    switch (event.key) {
        case 'w':
            cube.position.y += 1;
            pointLight.position.y += 1;
            break;
        case 's':
            cube.position.y -= 1;
            pointLight.position.y -= 1;
            break;
        case 'a':
            camera.position.x -= 1;
            break;
        case 'd':
            camera.position.x += 1;
            break;
    }
});