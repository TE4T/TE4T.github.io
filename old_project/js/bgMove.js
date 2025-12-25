//背景互换
bgAnimation()
function bgAnimation() {
    let flag = true;
    setInterval(() => {
        if (flag) {
            $('#bg').removeClass('bgImg1');
            $('#bg').addClass('bgImg2');
        } else {
            $('#bg').removeClass('bgImg2');
            $('#bg').addClass('bgImg1');
        }
        flag = !flag
    }, 1500);
}

//移动动画
var bgMoveInterval;
//背景图片移动X轴/Y轴
var bgImgX = 0;
var bgImgY = 0;
//移动距离
var moveDistance = 16;

function bgMoveAnimation(direction) {
    clearInterval(bgMoveInterval)
    bgMoveInterval = setInterval(() => {
        switch (direction) {
            case 'up':
                bgImgY += moveDistance;
                break;
            case 'down':
                bgImgY -= moveDistance;
                break;
            case 'left':
                bgImgX += moveDistance;
                break;
            case 'right':
                bgImgX -= moveDistance;
                break;
        }
        $('#bg').css({ 'background-position': bgImgX + 'px ' + bgImgY + 'px' })
    }, 100);
}
//人物移动时的背景移动
var bgMove = {
    up() {
        bgMoveAnimation('up');
    },
    down() {
        bgMoveAnimation('down');
    },
    left() {
        bgMoveAnimation('left');
    },
    right() {
        bgMoveAnimation('right');
    },
    reset(){
        clearInterval(bgMoveInterval)
    }
}
