//游戏操作的代码都放在这
var operationMove = {
    up(){
        humanMove.up();
        bgMove.up();
    },
    down(){
        humanMove.down();
        bgMove.down();
    },
    left(){
        humanMove.left();
        bgMove.left();
    },
    right(){
        humanMove.right();
        bgMove.right();
    }
}

var operationReset = {
    normal(){
        bgMove.reset()
    },
    up(){
        humanReset.up();
    },
    down(){
        humanReset.down();
    },
    left(){
        humanReset.left();
    },
    right(){
        humanReset.right();
    }
}