/*
 * 简单封装下threejs,并实现类似v3d的树结构管理
 */

var container, camera, scene, renderer, controls, loader;
var mouse = new THREE.Vector2(); // 鼠标点选点
var screenRatio; // 屏幕分辨率缩放 200% = 2

var SELECTEDENTITIES, SELECTEDNODE; // 选中实体数组,选中节点;实体数组为该节点下包含的所有实体
var groups = new Map(); // 记录节点名称-对应组，与v3d 中nodename - scenenode类似
var hides; // 隐藏节点数组[mesh]

var mixer;
var clock = new THREE.Clock();
// 初始化threejs,并创建初始场景
// media:资源文件路径
// scenenodes:场景脚本中定义的json对象名称，一般在html页面需要引用该js文件，该js文件是通过v3d中node脚本转换成json格式的
function init(media,scenenodes) {
	container = document.createElement('div');
	document.body.appendChild(container);

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 500);
	camera.position.set(3,2,3);

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000C1F);
	scene.add(new THREE.HemisphereLight());

	var directionalLight = new THREE.DirectionalLight(0xffeedd);
	directionalLight.position.set(0, 10, 2);
	scene.add(directionalLight);

	// renderer
	renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	screenRatio = window.devicePixelRatio;
	renderer.setPixelRatio(screenRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.renderSingleSided = false;
	container.appendChild(renderer.domElement);
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.shadowMap.enabled = true;
	
	window.addEventListener('resize', onResize, false);
	renderer.domElement.addEventListener('mousedown', onMouseDown);
	renderer.domElement.addEventListener('touchstart', onTouchStart);

	// camera controls
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.maxPolarAngle = Math.PI;
	controls.minDistance = 0.1;
	controls.maxDistance = 500;

	// select
	raycaster = new THREE.Raycaster();

	// 初始化非threejs对象
	SELECTEDENTITIES = [];
	SELECTEDNODE = null;
	hides = [];

	// 加载场景
	loadScene(media,scenenodes);	
}

var play = false;
function playAnimation(){
	play = true;
}

// 加载场景
function loadScene(media,scenenodes){
	loader = new THREE.JSONLoader();
	var group = new THREE.Group(); // 先创建一个场景管理的根节点
	group.name = "scene_root";
	group.lock = false;
	groups.set("scene_root",group);
	scene.add(group);
	
	createEntity(0,media,scenenodes,function(){ //  必须从0开始，将异步变成同步，一个一个模型加载
		var json = {
	        "fps": 20,
	        "name": "default",
	        "tracks": [{
	            "type": "vector3",
	            "keys": [{
	                "time": 0,
	                "value": [0.0056304932,0.23247391,0.37216187]
	            },{
	                "time": 40,
	                "value": [0.0056304932,0.23247391,1.17216187]
	            },{
	                "time": 300,
	                "value": [0.0056304932,0.23247391,1.17216187]
	            }],
	            "name":"bcbb.4.position" // 这个定义的方式有点像WPF的属性绑定,而且这个动画必须要场景加载完成后才能创建，否这个名称找不到就绑定到根节点上
	        },{
	            "type": "vector3",
	            "keys": [{
	                "time": 0,
	                "value": [0.005569458,0.20821571,0.15264893]
	            },{
	                "time": 40,
	                "value": [0.005569458,0.20821571,0.15264893]
	            },{
	                "time": 80,
	                "value": [0.005569458,0.70821571,0.15264893]
	            },{
	                "time": 300,
	                "value": [0.005569458,0.70821571,0.15264893]
	            }],
	            "name":"bcbb.5.position" 
	        },{
	            "type": "vector3",
	            "keys": [{
	                "time": 0,
	                "value": [0.005569458,0.23557949,0.171428]
	            },{
	                "time": 80,
	                "value": [0.005569458,0.23557949,0.171428]
	            },{
	                "time": 110,
	                "value": [0.005569458,0.23557949,0.871428]
	            },{
	                "time": 300,
	                "value": [0.005569458,0.23557949,0.871428]
	            }],
	            "name":"bcbb.6.position" 
	        },{
	            "type": "vector3",
	            "keys": [{
	                "time": 0,
	                "value": [0,0,0]
	            },{
	                "time": 110,
	                "value": [0,0,0]
	            },{
	                "time": 135,
	                "value": [0,0,0.6]
	            },{
	                "time": 300,
	                "value": [0,0,0.6]
	            }],
	            "name":"bcbb.2.position" 
	        },{
	            "type": "vector3",
	            "keys": [{
	                "time": 0,
	                "value": [0,0,0]
	            },{
	                "time": 135,
	                "value": [0,0,0]
	            },{
	                "time": 160,
	                "value": [0,0,0.3]
	            },{
	                "time": 300,
	                "value": [0,0,0.3]
	            }],
	            "name":"bcbb.3.position" 
	        },{
	            "type": "vector3",
	            "keys": [{
	                "time": 0,
	                "value": [0,0,0]
	            },{
	                "time": 160,
	                "value": [0,0,0]
	            },{
	                "time": 200,
	                "value": [0,0,-1.8]
	            },{
	                "time": 300,
	                "value": [0,0,-1.8]
	            }],
	            "name":"bcbb.1.1.position" 
	        },{
	            "type": "vector3",
	            "keys": [{
	                "time": 0,
	                "value": [0,0,0]
	            },{
	                "time": 200,
	                "value": [0,0,0]
	            },{
	                "time": 220,
	                "value": [0,0,-1.2]
	            },{
	                "time": 300,
	                "value": [0,0,-1.2]
	            }],
	            "name":"bcbb.1.2.position" 
	        },{
	            "type": "vector3",
	            "keys": [{
	                "time": 0,
	                "value": [0,0,0]
	            },{
	                "time": 220,
	                "value": [0,0,0]
	            },{
	                "time": 236,
	                "value": [0,0,-1.0]
	            },{
	                "time": 300,
	                "value": [0,0,-1.0]
	            }],
	            "name":"bcbb.1.3.position" 
	        },{
	            "type": "vector3",
	            "keys": [{
	                "time": 0,
	                "value": [0,0,0]
	            },{
	                "time": 236,
	                "value": [0,0,0]
	            },{
	                "time": 250,
	                "value": [0,0,-0.8]
	            },{
	                "time": 300,
	                "value": [0,0,-0.8]
	            }],
	            "name":"bcbb.1.4.position" 
	        },{
	            "type": "vector3",
	            "keys": [{
	                "time": 0,
	                "value": [0,0,0]
	            },{
	                "time": 250,
	                "value": [0,0,0]
	            },{
	                "time": 262,
	                "value": [0,0,-0.6]
	            },{
	                "time": 300,
	                "value": [0,0,-0.6]
	            }],
	            "name":"bcbb.1.5.position" 
	        },{
	            "type": "vector3",
	            "keys": [{
	                "time": 0,
	                "value": [0,0,0]
	            },{
	                "time": 262,
	                "value": [0,0,0]
	            },{
	                "time": 272,
	                "value": [0,0,-0.4]
	            },{
	                "time": 300,
	                "value": [0,0,-0.4]
	            }],
	            "name":"bcbb.1.6.position" 
	        },{
	            "type": "vector3",
	            "keys": [{
	                "time": 0,
	                "value": [0,0,0]
	            },{
	                "time": 272,
	                "value": [0,0,0]
	            },{
	                "time": 280,
	                "value": [0,0,-0.2]
	            },{
	                "time": 300,
	                "value": [0,0,-0.2]
	            }],
	            "name":"bcbb.1.7.position" 
	        }]
	    };
	
		var clip = new THREE.AnimationClip.parse(json);
		mixer = new THREE.AnimationMixer(groups.get("scene_root")); // 注意group参数，应该是能包含上述 json中定义tracks ->name 的object，当然也可以是当个mesh
		var action = mixer.clipAction(clip);
		action.play();
		
		mixer.addEventListener( 'loop', function( e ) {play = false;} ); 
	}); 
}

// 创建模型，包括树结构，
// loader加载是异步的，但因为需要设置位置，所以此处处理成同步
// index 的目的是控制加载变成同步的递归
// media 资源文件目录
// scenenodes 场景脚本json定义
// loaded 加载完成的回掉函数，可在此函数执行其他操作，这样可以保证场景是建立完成的
function createEntity(index,media,scenenodes,loaded) {
	if(index < scenenodes.length) {
		if(scenenodes[index].type == "entity") {
			loader.load( media + "/" + scenenodes[index].file, function(geometry, materials) {
				var x, y, z;
				x = scenenodes[index].x;
				y = scenenodes[index].y;
				z = scenenodes[index].z;
				var mesh = new THREE.Mesh(geometry, materials);
				mesh.name = scenenodes[index].name;
				mesh.position.set(x, y, z);
				var parent = groups.get(scenenodes[index].parent);
				parent.add(mesh);
				
				createEntity(++index,media,scenenodes,loaded);
			});
		} else {
			var group = new THREE.Group();
			group.name = scenenodes[index].name;
			group.lock = true; // 添加一个自定义属性，为该组合体加锁，用于上下层级操作
			groups.set(group.name,group);
			
			if(scenenodes[index].parent == "") {
				var parent = groups.get("scene_root");
				parent.add(group);
			} else {	
				var parent = groups.get(scenenodes[index].parent);
				parent.add(group);
			}

			createEntity(++index,media,scenenodes,loaded);
		}
	}else{
		if(loaded) loaded();
	}
	
}

function onResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
	renderer.render(scene, camera);
	if(play)
		mixer.update(clock.getDelta());
	requestAnimationFrame(render);
}

// 鼠标点击
function onMouseDown(event) {
	if(event.buttons == 1) {
		event.preventDefault();
		mouse.x = (event.clientX / (renderer.domElement.width / screenRatio)) * 2 - 1;
		mouse.y = -(event.clientY / (renderer.domElement.height / screenRatio)) * 2 + 1;

		selectEntity(mouse);
	}
}

// 触屏点击
function onTouchStart(event) {
	if(event.touches.length == 1) {
		mouse.x = (event.touches[0].clientX / (renderer.domElement.width / screenRatio)) * 2 - 1;
		mouse.y = -(event.touches[0].clientY / (renderer.domElement.height / screenRatio)) * 2 + 1;
		selectEntity(mouse);
	}
}

// 根据点击位置判断需要选择的节点，加入树结构检测
function selectEntity(point) {
	if(SELECTEDNODE != null) {
		cancelSelectedMask();
	}

	raycaster.setFromCamera(point, camera);
	var intersects = raycaster.intersectObjects(scene.children,true); 

	if(intersects.length > 0) {
		var sel = intersects[0].object;
		//console.log(sel); 
		var parent = sel.parent;
		
		while(parent.name != "scene_root"){
			if(parent.lock){
				sel = parent;
				parent = parent.parent;
			}else{
				SELECTEDNODE = sel;
				break;
			}
		}
		
		if(SELECTEDNODE == null){ // 如果为null,说明以及遍历到parent.name == "scene_root"，将最后一个往上递归节点返回即可
			SELECTEDNODE = sel;
		}
		//console.log(SELECTEDNODE);
		setSelectedMask();
	} else {
		cancelSelectedMask();
	}
}

// 从group中找出实体节点，有可能传入的group本身就是实体节点
function getMeshFromGroup(group){
	if(group.type == "Mesh"){
		SELECTEDENTITIES.push(group);
	}else{
		var children = group.children;
		children.forEach(function(item){
			if(item.type == "Group"){
				getMeshFromGroup(item);
			}else if(item.type == "Mesh"){
				SELECTEDENTITIES.push(item);
			}
		});
	}
}

// 设置选中标记
function setSelectedMask() {	
	getMeshFromGroup(SELECTEDNODE);
	//console.log(SELECTEDENTITIES);
	SELECTEDENTITIES.forEach(function(item) {
		item.currentHex = new Array();
		item.material.forEach(function(mat) {
			item.currentHex.push(mat.color.getHex());
			mat.color.setHex(0x33CCCC);
		});
	});
}

// 取消选中标记
function cancelSelectedMask() {
	SELECTEDENTITIES.forEach(function(item) {
		item.material.forEach(function(mat, index) {
			mat.color.setHex(item.currentHex[index]);
		});
		item.currentHex.length = 0;
	});

	SELECTEDNODE = null;
	SELECTEDENTITIES = [];
}

function nextLayer() {
	if(SELECTEDNODE != null) {
		SELECTEDNODE.lock = false;
	}
}

function upperLayer() {
	if(SELECTEDNODE != null) {
		SELECTEDNODE.parent.lock = true;
	}
}

// 隐藏节点，遍历该选中节点下的全部实体节点，因为树结构实现的问题，此处实现并不太好
function hideNode() {
	SELECTEDNODE.visible = false;
	hides.push(SELECTEDNODE);
}

// 显示所有隐藏节点
function showAllNodes() {	
	for (var i in hides) {
		hides[i].visible = true;
	}
	
	hides = [];
}


/* --- 以下为其他需要的数据结构 ---*/
// 实现一个简单的Map 
function Map() {
    this.container = {};
}
//将key-value放入map中    
Map.prototype.set = function(key, value) {
    try {
        if (key != null && key != "")
            this.container[key] = value;
    } catch (e) {
        return e;
    }
};
 
//根据key从map中取出对应的value    
Map.prototype.get = function(key) {
    try {
        return this.container[key];
    } catch (e) {
        return e;
    }
};
 
//判断map中是否包含指定的key    
Map.prototype.has = function(key) {
    try {
        for ( var p in this.container) {
            if (p == key)
                return true;
        }
        return false;
 
    } catch (e) {
        return false;
    }
}