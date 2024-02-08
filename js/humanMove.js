//人物移动动画循环
var humanMoveInterval;
//人物移动动画(传入 开始 人物图片的X轴参数)
function humanMoveAnimation(star){
    //结束动画
    clearInterval(humanMoveInterval)
    //人物活动 图片的X轴参数
    let actionImgX = star;
    let end = star - 120
    humanMoveInterval = setInterval(() => {
        if(actionImgX == end){
            actionImgX = star ;
        }
        $('#human').css({'background-position': + actionImgX + 'px 0px'})
        actionImgX -= 60;
    }, 100);
}

//人物复原动画(传入 复原 人物图片的X轴参数)
function humanResetAnimation(reset){
    clearInterval(humanMoveInterval)
    $('#human').css({'background-position': + reset + 'px 0px'});
}

var humanMove = {
    up(){
        humanMoveAnimation(-360)
    },
    down(){
        humanMoveAnimation(0)
    },
    left(){
        humanMoveAnimation(-540)
    },
    right(){
        humanMoveAnimation(-180)
    }
}

var humanReset = {
    up(){
        humanResetAnimation(-420);
    },
    down(){
        humanResetAnimation(-60);
    },
    left(){
        humanResetAnimation(-600);
    },
    right(){
        humanResetAnimation(-240);
    }
}