$(function () {
    // 全局变量
    // 控制范围高宽
    const spaceH = $('#ctrlSpace').height();
    const spaceW = $('#ctrlSpace').width(); 

    //作用 确定方位
    var orient = '';

    // 复原控制球
    function initBall() {
        $('#ctrlBall').css({ 'transform': 'translate(-50%,-50%) rotate(0deg) translateX(0)' })
    }

    // 控制球球跟着鼠标
    function folowMouse(e) {
        //获取鼠标坐标 球坐标
        let touch = e.originalEvent.targetTouches[0];
        let mouseX = touch.clientX;
        let mouseY = touch.clientY;
        let spaceX = $('#ctrlSpace').offset().left + spaceW / 2;
        let spaceY = $('#ctrlSpace').offset().top + spaceH / 2;

        //求角度Start
        const diffX = mouseX - spaceX;
        const diffY = mouseY - spaceY;

        const radians = Math.atan2(diffY, diffX);
        const angle = radians * 180 / Math.PI;
        // console.log(parseInt(angle));
        //求角度End

        //求 鼠标 离 球原点 的 距离 Start
        let distance = Math.sqrt(Math.pow(mouseX - spaceX, 2) + Math.pow(mouseY - spaceY, 2));
        if (distance > spaceW / 2) {
            distance = spaceW / 2;
        }
        // console.log(parseInt(distance));
        //求 鼠标 离 球原点 的 距离 End

        //控制球显示位置
        $('#ctrlBall').css({ 'transform': 'translate(-50%,-50%) rotate(' + angle + 'deg) translateX(' + distance + 'px )' })

        //获取球上下左右。上(-135 ～ -44); 右(-45 ~ 46); 下(45 ~ 136); 左(135 ~ -134)
        if (angle > -135 && angle < -44) {
            if (orient != '上') {
                orient = '上';
                ctrlBallMove(orient)
            }
        } else if (angle > -45 && angle < 46) {
            if (orient != '右') {
                orient = '右';
                ctrlBallMove(orient)
            }

        } else if (angle > 45 && angle < 136) {
            if (orient != '下') {
                orient = '下';
                ctrlBallMove(orient)
            }
        } else if (angle < -134 || angle > 135) {
            if (orient != '左') {
                orient = '左';
                ctrlBallMove(orient)
            }
        }
    }

    // 控制球移动，传入 上 下 左 右 参数。
    function ctrlBallMove(direction) {
        switch (direction) {
            case '上':
                // console.log('上');
                operationMove.up();
                break;
            case '下':
                // console.log('下');
                operationMove.down();
                break;
            case '左':
                // console.log('左');
                operationMove.left();
                break;
            case '右':
                // console.log('右');
                operationMove.right();
                break;
        }
    }

    //控制球复原函数
    function ctrlBallReset(direction) {
        // 先判断orient（direction）的方位，例如是上，就给上的复原图，以此类推
        switch (direction) {
            case '上':
                // console.log('复原上');
                operationReset.up();
                break;
            case '下':
                // console.log('复原下');
                operationReset.down();
                break;
            case '左':
                // console.log('复原左');
                operationReset.left();
                break;
            case '右':
                // console.log('复原右');
                operationReset.right();
                break;
        }
        //只要复原了就会执行 不管上下左右
        operationReset.normal();
    }

    // 鼠标按下
    $(document).on('touchstart', function (e) {
        //初始化圆盘坐标
        let touch = e.originalEvent.targetTouches[0];
        let mouseX = touch.clientX;
        let mouseY = touch.clientY;
        $('#ctrlSpace').css({ 'top': mouseY - spaceH / 2 + 'px', 'left': mouseX - spaceW / 2 + 'px', })

        $(document).on('touchmove', folowMouse)
    })

    //鼠标松开
    $(document).on('touchend', function () {
        $(document).off('touchmove', folowMouse)

        //复原球
        initBall()

        //控制球复原
        ctrlBallReset(orient);
        orient = '';

    })

})