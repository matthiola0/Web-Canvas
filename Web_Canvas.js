const canvasW = window.innerWidth*2/3;
const canvasH = window.innerHeight*3/4;
const colorpickerWH = window.innerWidth*1/8;

let curFunc = 0;
/* pen: 1, eraser: 2, text: 3, 
    circle: 4, triangle: 5, rectangle:6,  
    line: 7, rainbow: 8*/

let namei = ["pen", "eraser", "text", 
        "circle", "circle_fill", "triangle", "triangle_fill", "rectangle", "rectangle_fill", "line", "rainbow"];


let textX, textY;
let mouseX, mouseY;
let last_mouseX, last_mouseY;
let mouse_down;

let cur_step = -1;
let history = [];
let last_shape;

var ran = 0;
var filled = false;


class ColorPicker {
    constructor(myCanvas, width, height) {
        this.myCanvas = myCanvas;  // 設置傳入的畫布
        this.width = width;  // 設置畫布的寬度
        this.height = height;  // 設置畫布的高度
        this.myCanvas.width = width;  // 設置畫布寬度
        this.myCanvas.height = height;  // 設置畫布高度
        this.ctx = this.myCanvas.getContext("2d");  // 取得畫布的上下文
        this.myPickerCircle = {x: 4, y: 296, width: 6, height: 6};  // 設置顏色選擇器的圓形
        //EventListeners
        // 滑鼠事件
        // 當滑鼠按下時，設定 isMouseDown 為 true，表示使用者正在拖曳色彩選擇器
        let isMouseDown = false;  // 初始時滑鼠狀態為未按下
        const onMouseDown = (e) => {  // 滑鼠按下事件
            var rect = this.myCanvas.getBoundingClientRect();  // 取得畫布的位置資訊
            var posX = e.clientX - rect.left;  // 取得滑鼠在畫布中的 x 座標位置
            var posY = e.clientY - rect.top;  // 取得滑鼠在畫布中的 y 座標位置
            isMouseDown = true;  // 將滑鼠狀態設置為按下
            if(posX >= 3 && posX <= this.width-3 && posY >= 0 && posY <= this.height) {  // 判斷滑鼠是否在畫布範圍內
                this.myPickerCircle.x = posX;  // 設置顏色選擇器圓形的 x 座標位置
                this.myPickerCircle.y = posY;  // 設置顏色選擇器圓形的 y 座標位置
            }
        }
        // 當滑鼠移動時，若使用者正在拖曳色彩選擇器，則更新 myPickerCircle 的位置
        const onMouseMove = (e) => {
            if(isMouseDown) { // 如果滑鼠已經按下
                var rect = this.myCanvas.getBoundingClientRect(); // 取得畫布的位置
                var posX = e.clientX - rect.left; // 取得滑鼠在畫布上的 x 座標
                var posY = e.clientY - rect.top; // 取得滑鼠在畫布上的 y 座標
                if(posX >= 3 && posX <= this.width-3 && posY >= 0 && posY <= this.height) { // 如果滑鼠位置在畫布範圍內
                    this.myPickerCircle.x = posX; // 將圓圈 x 座標設為滑鼠 x 座標
                    this.myPickerCircle.y = posY; // 將圓圈 y 座標設為滑鼠 y 座標
                    console.log(posX + " " + posY); // 印出目前座標
                }
            }
        }
        // 當滑鼠放開時，設定 isMouseDown 為 false，表示使用者停止拖曳色彩選擇器
        const onMouseUp = () => {
            isMouseDown = false;
        }
        // 在 myCanvas 上加入滑鼠事件監聽器，當使用者拖曳色彩選擇器時，即時觸發 onChangeCallback，將所選的顏色值傳遞出去
        this.myCanvas.addEventListener ("mousedown", onMouseDown);
        this.myCanvas.addEventListener ("mousemove", onMouseMove);
        this.myCanvas.addEventListener ("mousedown", () => this.onChangeCallback(this.getPickedColor()));
        this.myCanvas.addEventListener ("mousemove", () => this.onChangeCallback(this.getPickedColor()));
        document.addEventListener ("mouseup", onMouseUp);
    }
    // 繪製畫布，呼叫 build() 方法建立顏色選擇器
    draw () {
        this.build();
    }
    
    build () {
        let gradient = this.ctx.createLinearGradient (0, 0, this.width, 0);
        // 添加顏色停止點
        gradient.addColorStop(0, "rgb(255, 0, 0)");     //在位置0的地方，添加紅色
        gradient.addColorStop(0.15, "rgb(255, 0, 255)");//在位置0.15的地方，添加品紅色
        gradient.addColorStop(0.33, "rgb(0, 0, 255)");  //在位置0.33的地方，添加藍色
        gradient.addColorStop(0.49, "rgb(0, 255, 255)");//在位置0.49的地方，添加青色
        gradient.addColorStop(0.67, "rgb(0, 255, 0)");  //在位置0.67的地方，添加綠色
        gradient.addColorStop(0.84, "rgb(255, 255, 0)");//在位置0.84的地方，添加黃色
        gradient.addColorStop(1, "rgb(255, 0, 0)");     //在位置1的地方，再次添加紅色
        
        // 設置繪圖上下文的填充樣式為漸變色
        this.ctx.fillStyle = gradient;
        // 繪製一個填滿漸變色的矩形，覆蓋整個畫布
        this.ctx.fillRect(0, 0, this.width, this.height);      
        
        // 創建一個縱向漸變的顏色資料
        gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        // 添加顏色停止點
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");     //在位置0的地方，添加完全不透明的白色
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0)");   //在位置0.5的地方，添加完全透明的白色
        gradient.addColorStop(0.5, "rgba(0, 0, 0, 0)");         //在位置0.5的地方，添加完全透明的黑色
        gradient.addColorStop(1, "rgba(0, 0, 0, 1)");           //在位置0的地方，添加完全不透明的黑色
        // 設置調色盤的填充樣式為縱向漸變色
        this.ctx.fillStyle = gradient;
        // 繪製一個填充縱向漸變色的矩形，覆蓋整個畫布
        this.ctx.fillRect(0, 0, this.width, this.height);     
        
        // 繪製取色器的圓形
        this.ctx.beginPath();
        // 使用取色器的位置和寬度參數繪製一個圓形
        this.ctx.arc(this.myPickerCircle.x, this.myPickerCircle.y, this.myPickerCircle.width, 0, Math.PI * 2);
        // 設置繪圖上下文的線條顏色
        this.ctx.strokeStyle = "white";
        // 設置繪圖上下文的線條寬度
        this.ctx.lineWidth = 3;
        // 繪製出圓形的線條
        this.ctx.stroke();
        // 結束繪圖路徑
        this.ctx.closePath();
    }
    // 取得滑鼠所選的顏色值
    getPickedColor () {
        let imageData = this.ctx.getImageData (this.myPickerCircle.x, this.myPickerCircle.y, 1, 1);
        return { r: imageData.data[0], g: imageData.data[1], b: imageData.data[2] };
    }
    // 設定當色彩選擇器改變時所執行的 callback 函數
    onChange (callback) {
        this.onChangeCallback = callback;
    }
}


// Get the canvas element and its 2D rendering context
const canvas = document.getElementById("thecanvas");
const ctx = canvas.getContext("2d");

// Set the line properties
ctx.lineWidth = 4;
ctx.strokeStyle = "black";
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.setLineDash([]);

canvas.width = canvasW;
canvas.height = canvasH;


const myColorPicker = new ColorPicker(document.getElementById("color_picker"), colorpickerWH, colorpickerWH);
  
setInterval(() => myColorPicker.draw(), 1);

myColorPicker.onChange((color) => {
    const Color = `rgb(${color.r}, ${color.g}, ${color.b})`;
    ctx.strokeStyle = Color;
    ctx.fillStyle = Color;
});


/* mouse event */
function mousedown(event) {
    if (cur_step == -1)
        save();

    if (curFunc == 1 || curFunc == 2 || curFunc == 8 ) {                    //pen, eraser, rainbow
        last_mouseX = mouseX;
        last_mouseY = mouseY;
        mouseX = event.offsetX;
        mouseY = event.offsetY;
        mouse_down = true;
    }
    else if (curFunc == 3) {                                                //text
        var textelement = document.getElementById('textarea');
        if (!textelement) {
            const { offsetX, offsetY } = event;
        
            const textArea = document.createElement('textarea');
            textArea.id = 'textarea';
            textArea.cols = '12';
            textArea.rows = '1.2';
            textArea.style.position = 'fixed';
            textArea.style.left = `${event.clientX}px`;
            textArea.style.top = `${event.clientY}px`;
        
            document.getElementById('left').appendChild(textArea);
        
            textX = offsetX;
            textY = offsetY;
        }
        else {                                  // create textelement
            ctx.font = document.getElementById("fontSize").value + "px " + document.getElementById("fontStyle").value;

            var textValue = textelement.value;
            document.getElementById('left').removeChild(textelement);
            ctx.fillText(textValue, textX, textY + document.getElementById("fontSize").value * 1.2);
        } 
    }
    else if (curFunc == 4 || curFunc == 5 || curFunc == 6 || curFunc == 7 ) {  //circle, triangle, rectangle, line
        last_mouseX = mouseX;
        last_mouseY = mouseY;
        mouseX = event.offsetX;
        mouseY = event.offsetY;
        mouse_down = true;

        last_shape = canvas.toDataURL();
    }
}

function mousemove(event) {
    if (curFunc == 1) {          //pen
        last_mouseX = mouseX;
        last_mouseY = mouseY;
        mouseX = event.offsetX;
        mouseY = event.offsetY;

        if(mouse_down) {
            ctx.beginPath();
            ctx.moveTo(last_mouseX, last_mouseY);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
        }
    }
    if (curFunc == 2) {          //eraser
        last_mouseX = mouseX;
        last_mouseY = mouseY;
        mouseX = event.offsetX;
        mouseY = event.offsetY;

        if(mouse_down) {
            ctx.globalCompositeOperation = "destination-out";
            ctx.beginPath();
            ctx.moveTo(last_mouseX, last_mouseY);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
            ctx.globalCompositeOperation = "source-over";
        }
    }
    if (curFunc === 4) { // Draw circle
        mouseX = event.offsetX;
        mouseY = event.offsetY;
      
        if (mouse_down) {
            const img = new Image();
            img.src = last_shape;
        
            img.onload = function() {
                // 恢復畫布到上一步驟的狀態
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                // 繪製圓形
                ctx.beginPath();
                const radius = Math.sqrt(((mouseX - last_mouseX)/2) ** 2 + ((mouseY - last_mouseY)/2) ** 2);
                ctx.arc((mouseX + last_mouseX)/2, (mouseY + last_mouseY)/2, radius, 0, 2 * Math.PI);
                
                if (filled) {
                    ctx.fill();
                } else {
                    ctx.stroke();
                }
            };
        }
    }
    if (curFunc == 5) {     // Draw triangle
        mouseX = event.offsetX;
        mouseY = event.offsetY;

        if(mouse_down) {
            const img = new Image();
            img.src = last_shape;
            img.onload = () => {
                // 恢復畫布到上一步驟的狀態
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                // 繪製三角形
                ctx.beginPath();
                ctx.moveTo(last_mouseX, last_mouseY);
                ctx.lineTo(mouseX, last_mouseY);
                ctx.lineTo((last_mouseX + mouseX) / 2, mouseY);
                ctx.lineTo(last_mouseX, last_mouseY);
                if (filled) {
                    ctx.fill();
                } else {
                    ctx.stroke();
                }
            };
        }
    }
    if (curFunc == 6) {          // Draw Rectangle
        mouseX = event.offsetX;
        mouseY = event.offsetY;

        if(mouse_down) {
            let img = new Image();
            img.src = last_shape;
            img.onload = function() {
                // 恢復畫布到上一步驟的狀態
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                // 繪製長方形
                ctx.beginPath();
                const width = mouseX - last_mouseX;
                const height = mouseY - last_mouseY;
                const x = Math.min(last_mouseX, mouseX);
                const y = Math.min(last_mouseY, mouseY);
        
                if (filled) {
                    ctx.fillRect(x, y, width, height);
                } else {
                    ctx.strokeRect(x, y, width, height);
                }
            };
        }
    }
    if (curFunc == 7) {          //line
        mouseX = event.offsetX;
        mouseY = event.offsetY;

        if(mouse_down) {
            let img = new Image();
            img.src = last_shape;
            img.onload = function() {
                // 恢復畫布到上一步驟的狀態
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                // 繪製直線
                ctx.beginPath();
                ctx.moveTo(last_mouseX, last_mouseY);
                ctx.lineTo(mouseX, mouseY);
                ctx.stroke();
            }
        }
    }
    if (curFunc == 8) {         //rainbow
        last_mouseX = mouseX;
        last_mouseY = mouseY;
        mouseX = event.offsetX;
        mouseY = event.offsetY;
      
        if (mouse_down) {
            ctx.beginPath();
            const gradient = ctx.createLinearGradient(last_mouseX, last_mouseY, mouseX, mouseY);
            gradient.addColorStop(0, `hsl(${ran},100%,50%)`);
            ctx.strokeStyle = gradient;
            ctx.moveTo(last_mouseX, last_mouseY);
            ctx.lineTo(event.offsetX, event.offsetY);
            ctx.stroke();
            if (ran > 360) {
                ran = 0;
            } else {
                ran++;
            }
        }
    }  
}

//save the step
function save() {
    cur_step++;
    if (cur_step < history.length) 
        history.length = cur_step;
    history.push(canvas.toDataURL());
}

function mouseup() {
    save();
    mouse_down = false;
}

function Size() {
    ctx.lineWidth = document.getElementsByName("myRange")[0].value/10;
}


function Choose(Func) {
    if (Func == 'Pen') {
        canvas.style.cursor = "url('./image/pen.png'), auto";
        curFunc = 1;
    }
    else if (Func == 'Eraser') {
        canvas.style.cursor = "url('./image/eraser.png'), auto";
        curFunc = 2;
    }
    else if (Func == 'Text') {
        canvas.style.cursor = "url('./image/text.png'), auto";
        curFunc = 3;
    }
    else if (Func == 'Circle') {
        canvas.style.cursor = "url('./image/circle.png'), auto";
        curFunc = 4;
    }
    else if (Func == 'Triangle') {
        canvas.style.cursor = "url('./image/triangle.png'), auto";
        curFunc = 5;
    }
    else if (Func == 'Rectangle') {
        canvas.style.cursor = "url('./image/rectangle.png'), auto";
        curFunc = 6;
    }
    else if (Func == 'Line') {
        curFunc = 7;
        canvas.style.cursor = "url('./image/line.png'), auto";
    } 
    else if (Func == 'Rainbow') {
        canvas.style.cursor = "url('./image/rainbow.png'), auto";
        curFunc = 8;
    }
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
}

function Do(Func) {    
    if (Func == 'Undo') {
        if (cur_step > 0) {
            let img = new Image();
            img.src = history[--cur_step];
            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            }
        }
    }
    else if (Func == 'Redo') {
        if (cur_step <= history.length - 2) {
            const img = new Image(); 
            img.src = history[++cur_step]; 
            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            }
        }
    }
    else if (Func == 'Clear') {
        cur_step = -1;
        history = [];
        canvas.style.background = "white";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

async function Upload(e) {
    const file = e.files[0];
    const src = URL.createObjectURL(file);
    try {
        const img = await loadImage(src);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(src);
        save();
    } catch (err) {
        console.error(err);
    }
}

function Download() {
    const dataUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    
    downloadLink.href = dataUrl;
    downloadLink.download = 'canvas_img.png';
  
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    const downloadMessage = document.createElement('p');
    downloadMessage.textContent = '圖片已下載';
    document.body.appendChild(downloadMessage);
    
    setTimeout(() => {
        downloadLink.remove();
        downloadMessage.remove();
    }, 2000);
}

function changeFill() {
    if(!filled) {
        document.getElementById("circle_img").src='image/circle_fill.png';
        document.getElementById("triangle_img").src='image/triangle_fill.png';
        document.getElementById("rectangle_img").src='image/rectangle_fill.png';
        document.getElementById("fill_img").src='image/circle.png';
    }
    else {
        document.getElementById("circle_img").src='image/circle.png';
        document.getElementById("triangle_img").src='image/triangle.png';
        document.getElementById("rectangle_img").src='image/rectangle.png';
        document.getElementById("fill_img").src='image/circle_fill.png';
    }
    filled = !filled;
}


/* listen event */
canvas.addEventListener('mousemove', mousemove);
canvas.addEventListener('mousedown', mousedown);
canvas.addEventListener('mouseup', mouseup);

