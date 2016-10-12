//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.call(this);
        this.click = 0;
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var d = __define,c=Main,p=c.prototype;
    p.onAddToStage = function (event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    p.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    };
    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    p.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onItemLoadError = function (event) {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onResourceLoadError = function (event) {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    };
    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    p.onResourceProgress = function (event) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    p.change = function () {
        this.page1Content1.textColor = 0x000000;
        this.page1Content1.text = "个人简介";
        egret.setTimeout(function () { this.page1Content1.textColor = 0x878889; this.page1Content1.text = "向右滑动"; }, this, 1000);
        egret.setTimeout(function () { this.change(); }, this, 3000);
    };
    //第一次触摸屏幕时
    p.startScroll = function (e) {
        //正常情况下scrollRect.x是stageW的整数倍；如果图片位置错误，返回上一个正确位置；
        if ((this.scrollRect.x % this.stageW) != 0) {
            this.scrollRect.x = this.currentPageX;
        }
        //记录下刚触摸屏幕时的y值
        this.starttouchpointX = e.stageX;
        //此时scrollRect已停留在一个page上
        this.currentPageX = this.scrollRect.x;
        //TouchEvent.TOUCH_MOVE：连续触摸时调用
        this.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onScroll, this);
    };
    //连续触摸时调用，计算出每时每刻移动的距离，并控制屏幕滑动
    p.onScroll = function (e) {
        var rect = this.scrollRect;
        this.movedistance = this.starttouchpointX - e.stageX;
        //实时改变scrollRect的位置
        if ((this.currentPageX == 0 && this.movedistance < 0) || (this.currentPageX == this.stageH && this.movedistance > 0)) {
        }
        else {
            rect.x = (this.currentPageX + this.movedistance);
            this.scrollRect = rect;
        }
    };
    p.stopScroll = function (e) {
        var rect = this.scrollRect;
        //右划超过三分之一就翻页（scrollRect）
        if ((this.movedistance >= (this.stage.stageWidth / 3)) && this.currentPageX != this.stageW) {
            rect.x = this.currentPageX + this.stageW;
            this.scrollRect = rect;
        }
        else if ((this.movedistance <= (-(this.stage.stageWidth / 3))) && this.currentPageX != 0) {
            rect.x = this.currentPageX - this.stageW;
            this.scrollRect = rect;
        }
        else {
            rect.x = this.currentPageX;
            this.scrollRect = rect;
        }
        this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.onScroll, this);
    };
    /**
     * 创建游戏场景
     * Create a game scene
     */
    p.createGameScene = function () {
        /*
        滑动的三个步骤:点，滑，松
        设置三个事件，分别监听TouchEvent.TOUCH_BEGIN，TouchEvent.TOUCH_MOVE，TouchEvent.TOUCH_END
        最后根据移动的距离判断是否换页
        */
        this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.startScroll, this);
        this.addEventListener(egret.TouchEvent.TOUCH_END, this.stopScroll, this);
        this.stageW = this.stage.stageWidth;
        this.stageH = this.stage.stageHeight;
        //两页的滑块
        this.scrollRect = new egret.Rectangle(0, 0, this.stageW, this.stageH * 2);
        this.cacheAsBitmap = true;
        this.touchEnabled = true;
        this.starttouchpointX = 0;
        this.currentPageX = 0;
        this.movedistance = 0;
        //创建第一个界面,位置默认为左上角,即X=0，Y=0
        this.page1 = new egret.DisplayObjectContainer();
        this.addChild(this.page1);
        var bg1 = this.createBitmapByName("bg_jpg");
        bg1.width = this.stageW;
        bg1.height = this.stageH;
        this.page1.addChild(bg1);
        this.headSculpture = this.createBitmapByName("K1QxYhi_jpg");
        this.headSculpture.x = 40;
        this.headSculpture.y = 40;
        this.page1.addChild(this.headSculpture);
        this.page1Content1 = new egret.TextField();
        this.page1Content1.textColor = 0x000000;
        this.page1Content1.y = 500;
        this.page1Content1.x = 120;
        this.page1Content1.size = 100;
        this.page1.addChild(this.page1Content1);
        //第二个界面，X默认为StageW，Y指定为0，即在第一个界面正右方
        this.page2 = new egret.DisplayObjectContainer();
        this.page2.width = this.stageW;
        this.page2.height = this.stageH;
        this.page2.x = this.stageW;
        this.addChild(this.page2);
        var bg = this.createBitmapByName("bg_jpg");
        bg.width = this.stageW;
        bg.height = this.stageH;
        this.page2.addChild(bg);
        this.title = new egret.TextField();
        this.title.size = 55;
        this.title.y = 60;
        this.title.width = this.stage.width;
        this.title.textColor = 0x000000;
        this.title.textAlign = egret.HorizontalAlign.CENTER;
        this.title.touchEnabled = true;
        /* //注册事件监听器，点击显示详细内容
         this.title.addEventListener( egret.TouchEvent.TOUCH_TAP, this.touchTitle, this );
         this.page2.addChild(this.title);
         */
        this.content = new egret.TextField();
        this.content.text = "姓名:李天宸";
        this.content.textColor = 0x000000;
        this.content.y = 200;
        this.content.x = 30;
        this.content.size = 35;
        this.page2.addChild(this.content);
        this.content1 = new egret.TextField();
        this.content1.text = "学号:14081207";
        this.content1.textColor = 0x000000;
        this.content1.y = 300;
        this.content1.x = 30;
        this.content1.size = 35;
        this.page2.addChild(this.content1);
        this.content4 = new egret.TextField();
        this.content4.text = "喜欢的电脑游戏:魔兽世界(万年DKT）,";
        this.content4.textColor = 0x000000;
        this.content4.y = 400;
        this.content4.x = 30;
        this.content4.size = 35;
        this.page2.addChild(this.content4);
        this.content4 = new egret.TextField();
        this.content4.text = "守望先锋，";
        this.content4.textColor = 0x000000;
        this.content4.y = 435;
        this.content4.x = 285;
        this.content4.size = 35;
        this.page2.addChild(this.content4);
        this.content4 = new egret.TextField();
        this.content4.text = "炉石传说。。。";
        this.content4.textColor = 0x000000;
        this.content4.y = 470;
        this.content4.x = 285;
        this.content4.size = 35;
        this.page2.addChild(this.content4);
        this.content5 = new egret.TextField();
        this.content5.text = "喜欢的手机游戏：阴阳师";
        this.content5.textColor = 0x000000;
        this.content5.y = 600;
        this.content5.x = 30;
        this.content5.size = 35;
        this.page2.addChild(this.content5);
        this.content5 = new egret.TextField();
        this.content5.text = "（非洲阴阳师，就是不出式神。。。）";
        this.content5.textColor = 0x000000;
        this.content5.y = 640;
        this.content5.x = 270;
        this.content5.size = 20;
        this.page2.addChild(this.content5);
        this.headSculptureTween = egret.Tween.get(this.headSculpture, { loop: true });
        //Tween对象按顺序执行逻辑
        this.headSculptureTween.to({ x: 500 }, 1500, egret.Ease.sineIn);
        this.headSculptureTween.to({ "rotation": 20 }, 500, egret.Ease.sineIn);
        this.headSculptureTween.to({ "rotation": 0 }, 500, egret.Ease.sineIn);
        this.headSculptureTween.to({ y: 970 }, 1500, egret.Ease.sineIn);
        this.headSculptureTween.to({ "rotation": 20 }, 500, egret.Ease.sineIn);
        this.headSculptureTween.to({ "rotation": 0 }, 500, egret.Ease.sineIn);
        this.headSculptureTween.to({ x: 40 }, 1500, egret.Ease.sineIn);
        this.headSculptureTween.to({ "rotation": -20 }, 500, egret.Ease.sineIn);
        this.headSculptureTween.to({ "rotation": 0 }, 500, egret.Ease.sineIn);
        this.headSculptureTween.to({ y: 40 }, 1500, egret.Ease.sineIn);
        this.headSculptureTween.to({ "rotation": -20 }, 500, egret.Ease.sineIn);
        this.headSculptureTween.to({ "rotation": 0 }, 500, egret.Ease.sineIn);
        //改变字体内容及颜色
        this.change();
        //循环播放音乐
        var sound = RES.getRes("菅野よう子 - ペットフード_mp3");
        var channel = sound.play(0, -1);
    };
    /*
        根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
        Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
    */
    p.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    return Main;
}(egret.DisplayObjectContainer));
egret.registerClass(Main,'Main');
//# sourceMappingURL=Main.js.map