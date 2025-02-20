/** @type {HTMLCanvasElement} */
let settings = {
    a: 1,
    xo: 0.25,
    xmax: 100,
    xignore: 10,
    stepsize: 0.05,
    linewidth: 1
};

function add_input(id, variable, label_id, name) {
    document.getElementById(id).addEventListener('input', e => {
        settings[variable] = e.target.value;
        document.getElementById(label_id).innerText = `${name} = ${settings[variable]}`;
        if (variable != 'linewidth') {
            update_canvas1();
            draw_line()
        }
        if (variable != 'a') {
            update();
        }
    });
}
add_input('a', 'a', 'a-label', 'a');
add_input('Xo', 'xo', 'Xo-label', 'Xo');
add_input('Xmax', 'xmax', 'Xmax-label', 'Xmax');
add_input('Xignore', 'xignore', 'Xignore-label', 'Xignore');
add_input('stepsize', 'stepsize', 'stepsize-label', 'Step Size');
add_input('linewidth', 'linewidth', 'linewidth-label', 'Line Width');

class Canvas {
    constructor(id) {
        this.canvas = document.getElementById(id);
        this.isPanning = false;
        this.startX = 0;
        this.startY = 0;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.height = this.canvas.clientHeight;
        this.width = this.canvas.clientWidth;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        window.addEventListener('resize', () => {
            this.height = this.canvas.clientHeight;
            this.width = this.canvas.clientWidth;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            update_canvas1()
            update()
        });
        if (id == 'canvas2') {
            this.zoom = 1
            this.panX = 0
            this.panY = 0

            window.addEventListener('keyup', e => {
                if (e.key == 'r') {
                    this.zoom = 1
                    this.panX = 0
                    this.panY = 0
                    update()
                }
            })

            this.canvas.addEventListener('mousedown', e => {
                this.isPanning = true
                this.startX = e.offsetX - this.panX
                this.startY = e.offsetY - this.panY
            })
    
            this.canvas.addEventListener('mousemove', e => {
                if (this.isPanning) {
                    this.panX = e.offsetX - this.startX
                    this.panY = e.offsetY - this.startY
                    update()
                }
            })
    
            window.addEventListener('mouseup', () => {
                this.isPanning = false
            })
    
            this.canvas.addEventListener('wheel', e => {
                e.preventDefault();
                const mouseX = e.offsetX;
                const mouseY = e.offsetY;
                const zoomAmount = -e.deltaY * 0.001;
                const newZoom = Math.max(this.zoom + zoomAmount, 1);
                const scaleChange = newZoom / this.zoom;
                this.panX = mouseX - (mouseX - this.panX) * scaleChange;
                this.panY = mouseY - (mouseY - this.panY) * scaleChange;
                this.zoom = newZoom;
                update();
            });
        }
    }
}

let canvas1 = new Canvas('canvas1');
let canvas2 = new Canvas('canvas2');

// main

function update_canvas1() {
    canvas1.ctx.clearRect(0, 0, canvas1.width, canvas1.height);
    canvas1.ctx.save()
    canvas1.ctx.fillStyle = 'rgba(255, 0, 0, .125)';
    canvas1.ctx.fillRect(0, 0, settings.xignore / settings.xmax * canvas1.width, canvas1.height);
    canvas1.ctx.restore()
    let xn = settings.xo;
    for (let i = 0; i < settings.xmax; i++) {
        canvas1.ctx.fillRect(i * canvas1.width / settings.xmax, canvas1.height - xn * canvas1.height, 2, 2);
        xn = settings.a * xn * (1 - xn);
    }
}

function draw_line(just_line=false) {
    canvas2.ctx.save()
    if (!just_line) {
        canvas2.ctx.clearRect(0, 0, canvas2.width, canvas2.height)
        canvas2.ctx.drawImage(canvas2.img, 0, 0)
    }
    canvas2.ctx.scale(canvas2.zoom, canvas2.zoom);
    canvas2.ctx.translate(canvas2.panX / canvas2.zoom, canvas2.panY / canvas2.zoom);
    canvas2.ctx.fillStyle = 'rgba(255, 0, 0, .5)'
    canvas2.ctx.fillRect(settings.a * canvas2.width/4, 0, settings.linewidth * 4, canvas2.height)
    canvas2.ctx.restore()
}

function update() {
    if (!canvas2.updating) {
        canvas2.updating = true
        canvas2.ctx.clearRect(0, 0, canvas2.width, canvas2.height);
        canvas2.ctx.save();
        canvas2.ctx.scale(canvas2.zoom, canvas2.zoom);
        canvas2.ctx.translate(canvas2.panX / canvas2.zoom, canvas2.panY / canvas2.zoom);
        for (let i = 0; i < (4 / settings.stepsize + 1); i++) {
            let xn = settings.xo;
            let a = i * settings.stepsize;
            let x_array = [];
            for (let y = 0; y < settings.xmax; y++) {
                if (y > settings.xignore) {
                    canvas2.ctx.fillRect(a * canvas2.width / 4, canvas2.height - xn * canvas2.height, settings.linewidth, settings.linewidth);
                }
                xn = a * xn * (1 - xn);
                if (x_array.includes(xn)) {
                    canvas2.ctx.save();
                    canvas2.ctx.fillStyle = 'black';
                    canvas2.ctx.fillRect(a * canvas2.width / 4, canvas2.height - xn * canvas2.height, settings.linewidth, settings.linewidth);
                    canvas2.ctx.restore();
                    break;
                }
                x_array.push(xn);
            }
        }
        const img_data = canvas2.canvas.toDataURL();
        const img = new Image();
        img.onload = function() {
            canvas2.img = img;
        }
        img.src = img_data;
        canvas2.ctx.restore();
        draw_line(true)
        canvas2.updating = false
    }
}

update_canvas1();
update();