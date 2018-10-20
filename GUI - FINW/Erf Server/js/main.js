// ------ Marker object ------------------------------------------------

function Marker() {
    THREE.Object3D.call(this);

    var radius = 0.005;
    var sphereRadius = 0.02;
    var height = 0.05;

    //var material = new THREE.MeshPhongMaterial({ color: 0xe00f0f });
    var material = new THREE.MeshToonMaterial({ color: 0xeef0f });

    var cone = new THREE.Mesh(new THREE.ConeBufferGeometry(radius, height, 8, 1, true), material);
    cone.position.y = height * 0.5;
    cone.rotation.x = Math.PI;

    var sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(sphereRadius, 16, 8), material);
    sphere.position.y = height * 0.95 + sphereRadius;

    this.add(cone, sphere);
}

Marker.prototype = Object.create(THREE.Object3D.prototype);

// ------ Earth object -------------------------------------------------

function Earth(radius, texture) {
    THREE.Object3D.call(this);

    this.userData.radius = radius;

    var earth = new THREE.Mesh(
        new THREE.SphereBufferGeometry(radius, 64.0, 48.0),
        new THREE.MeshPhongMaterial({
            map: texture
        })
    );

    this.add(earth);
}

Earth.prototype = Object.create(THREE.Object3D.prototype);

Earth.prototype.createMarker = function(lat, lon, hashtag = '', url = '', city = '') {
    var marker = new Marker();

    var latRad = lat * (Math.PI / 180);
    var lonRad = -lon * (Math.PI / 180);
    var r = this.userData.radius;

    marker.hashtag = hashtag;
    marker.url = url
    marker.city = city

    marker.position.set(Math.cos(latRad) * Math.cos(lonRad) * r, Math.sin(latRad) * r, Math.cos(latRad) * Math.sin(lonRad) * r);
    marker.rotation.set(0.0, -lonRad, latRad - Math.PI * 0.5);

    this.add(marker);
    // console.log(["Placed Marker:", lat, lon]);
};

// ------ Three.js code ------------------------------------------------

var scene, camera, renderer;
var controls;

var earth;
var projector;

var currentPin, pinList;

init();

function init() {


    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, 4 / 3, 0.1, 100);
    camera.position.set(0.0, 1.5, 3.0);

    container = document.getElementById('canvas');
    document.body.appendChild(container);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(800, 600);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    //scene.background = new THREE.Color( 0x000000 );
    renderer.setClearColor(0x000000, 0);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.autoRotate = true;
    //controls.autoRotateSpeed = 999.0;
    controls.autoRotateSpeed = -2;
    controls.enablePan = false;

    var ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    var direcitonal = new THREE.DirectionalLight(0xffffff, 0.5);
    direcitonal.position.set(5.0, 2.0, 5.0).normalize();
    scene.add(direcitonal);

    // just some code for the LOADING
    var manager = createLoader(renderer.domElement, animate);

    var texLoader = new THREE.TextureLoader(manager).setCrossOrigin(true);

    //var texture = texLoader.load('/images/earthmap1k2.jpg');
    //var texture = texLoader.load('/images/earthlatlon.png');
    var texture = texLoader.load('/images/ultrahigh.jpg');
    //var texture = texLoader.load('/images/tron.png');
    //var texture = texLoader.load('/images/mars.png');



    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    //var earth = new Earth(1.0, texture);
    earth = new Earth(1.0, texture);

    /*
    earth.createMarker(48.856700, 2.350800); // Paris
    earth.createMarker(51.507222, -0.1275); // London

    /*
    earth.createMarker(34.050000, -118.250000); // LA
    earth.createMarker(41.836944, -87.684722); // Chicago
    earth.createMarker(35.683333, 139.683333); // Tokyo
    earth.createMarker(33.333333, 44.383333); // Baghdad
    earth.createMarker(40.712700, -74.005900); // New York

    earth.createMarker(55.750000, 37.616667); // Moscow
    earth.createMarker(35.117500, -89.971111); // Memphis
    earth.createMarker(-33.925278, 18.423889); // Cape Town
    earth.createMarker(32.775833, -96.796667); // Dallas
    earth.createMarker(52.366667, 4.900000); // Amsterdam
    earth.createMarker(42.358056, -71.063611); // Boston
    earth.createMarker(52.507222, 13.145833); // Berlin


    earth.createMarker(37.783333, -122.416667); // San Francisco
    */


    scene.add(earth);

    //window.addEventListener('resize', onResize);
    //onResize();
    ///**

    //renderer.setSize( 600, 600 );
    //container = document.getElementById( 'canvas' );
    //container.appendChild( renderer.domElement );
    //document.body.appendChild( container );
    //document.body.appendChild(renderer.domElement);

    //**/


    //renderer = new THREE.WebGLRenderer();    

    //console.log(earth)
    pinList = earth.children;
    pinList = pinList.slice(1, pinList.length)
    //console.log(pinList)
    currentPin = 0;

}


/*
function toScreenXY( position, camera, jqdiv ) {

    var pos = position.clone();
    projScreenMat = new THREE.Matrix4();
    projScreenMat.multiply( camera.projectionMatrix, camera.matrixWorldInverse );
    projScreenMat.multiplyVector3( pos );

    return { x: ( pos.x + 1 ) * jqdiv.width() / 2 + jqdiv.offset().left,
         y: ( - pos.y + 1) * jqdiv.height() / 2 + jqdiv.offset().top };

}*/
function toScreenPosition(obj, camera) {
    var vector = new THREE.Vector3();

    var widthHalf = 0.5 * renderer.context.canvas.width;
    var heightHalf = 0.5 * renderer.context.canvas.height;

    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);

    vector.x = (vector.x * widthHalf) + widthHalf;
    vector.y = -(vector.y * heightHalf) + heightHalf;
    return {
        x: vector.x,
        y: vector.y
    };

};


function onResize() {
    var canvas = document.getElementById('canvas');
    var width = canvas.width;
    var height = canvas.height;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

var counter = 0
var hashtagList = updateTweetsFromFile();

function animate() {


    pinList = earth.children.slice(1, pinList.length);


    requestAnimationFrame(animate);

    controls.update();

    if (counter % 5 == 0) {
        updateLabels();
    }

    pinList.forEach(function(element) {

        element.scale.set(1, 1, 1);
    });
    if(pinList[currentPin]){
    pinList[currentPin].scale.set(5, 5, 5);
    }

    update();

    renderer.render(scene, camera);

    counter += 1
    if (counter >= 6000) {
        hashtagList = updateTweetsFromFile()
        counter = 0;
    }

    if (!pinList[currentPin]){
        currentPin = (Math.floor((Math.random() * 2 * pinList.length) + 1) + 1) % pinList.length;
    }
}

function updateLabels() {
    document.getElementById('divHolder').textContent = '';
    var text2 = document.createElement('div');
    text2.style.position = 'absolute';
    text2.setAttribute("id", "Div1");
    text2.style.zIndex = 0; // if you still don't see the label, try uncommenting this
    text2.style.width = 100;
    text2.style.height = 100;
    text2.style.backgroundColor = "white";
    //text2.innerHTML = "#ISuckAtProgramming";
    pin = pinList[currentPin]
    if (pin) {
        text2.innerHTML = '#' + pin.hashtag + "<br />" + pin.city;
        var aTag = document.createElement('a');
        aTag.setAttribute('href', pin.url);
        aTag.setAttribute('target',  "_blank");
        aTag.innerHTML = "<br />" + "Open in Twitter!";
        text2.appendChild(aTag);
    }

    earthPos = toScreenPosition(pinList[currentPin], camera)
    text2.style.top = earthPos['y'] + 'px';
    text2.style.left = earthPos['x'] + 'px';
    document.getElementById('divHolder').appendChild(text2);
}


function updateTweetsFromFile() {
    hashtagListUpdate = []
    $.getJSON("data/tweeter_data.json", function(data) {
        $.each(data, function(index, value) {
            hashtagList.push(value);
            //console.log(value);
            earth.createMarker(value['lat'], value['lon'], value['hashtag'], value['url'], value['name']);
        });
    });
    //console.log(hashtagListUpdate);

    //console.log(earth.children);
    pinList = earth.children;

    //console.log(pinList);
    return hashtagListUpdate;
}