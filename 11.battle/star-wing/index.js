window.screenOrientation="sensor_portrait";

function InitLib(){
	loadLib("libs/min/laya.core.min.js");
	loadLib("libs/min/laya.ani.min.js");
	loadLib("libs/min/laya.particle.min.js");
	loadLib("libs/min/laya.ui.min.js");
	loadLib("libs/min/laya.d3.min.js");
	loadLib("js/bundle.js");
}

if("undefined" != typeof PokiSDK){
    PokiSDK.init().then(() => {
        console.log("Poki SDK successfully initialized");
                        
        // fire your function to continue to game
        InitLib();
    }).catch(() => {
        console.log("Initialized, something went wrong, load you game anyway");
                        
        // fire your function to continue to game
        InitLib();
    });
}else{
    console.log("Poki SDK loaded fail");
	InitLib();
}
