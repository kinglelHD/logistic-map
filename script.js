/** @type {HTMLCanvasElement} */
let settings = {
    a: 1,
    xo: 0.25,
    xmax: 100,
    xignore: 10,
    stepsize: 0.1,
    linewidth: 1
};
function add_input(id, variable, label_id, name) {
    document.getElementById(id).addEventListener('input', e => {
        settings[variable] = e.target.value;
        document.getElementById(label_id).innerText = `${name} = ${settings[variable]}`;
        update_canvas1()
        if (variable != 'a') {
            update()
        }
        canvas2.ctx.clearRect(0, 0, canvas2.width, canvas2.height)
        canvas2.ctx.drawImage(canvas2.img, 0, 0)
        canvas2.ctx.save()
        canvas2.ctx.fillStyle = 'rgba(255, 0, 0, .5)'
        canvas2.ctx.fillRect(settings.a * canvas2.width/4, 0, settings.linewidth * 2, canvas2.height)
        canvas2.ctx.restore()
    });
}
add_input('a', 'a', 'a-label', 'a');
add_input('Xo', 'xo', 'Xo-label', 'Xo');
add_input('Xmax', 'xmax', 'Xmax-label', 'Xmax');
add_input('Xignore', 'xignore', 'Xignore-label', 'Xignore');
add_input('stepsize', 'stepsize', 'stepsize-label', 'step size');
add_input('linewidth', 'linewidth', 'linewidth-label', 'line width');
class Cavnvas {
    constructor(id) {
        this.canvas = document.getElementById(id)
        this.ctx = this.canvas.getContext('2d')
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
        this.height = this.canvas.clientHeight
        this.width = this.canvas.clientWidth
        this.canvas.width = this.width
        this.canvas.height = this.height
        window.addEventListener('resize', () => {
            this.height = this.canvas.clientHeight
            this.width = this.canvas.clientWidth
            this.canvas.width = this.width
            this.canvas.height = this.height
        })
    }
}
let canvas1 = new Cavnvas('canvas1')
let canvas2 = new Cavnvas('canvas2')

// main

function update_canvas1() {
    canvas1.ctx.clearRect(0, 0, canvas1.width, canvas1.height)
    let xn = settings.xo
    for (let i = 0; i < settings.xmax; i++) {
        canvas1.ctx.fillRect(i * canvas1.width/settings.xmax, canvas1.height - xn * canvas1.height, settings.linewidth, settings.linewidth)
        xn = settings.a * xn * (1 - xn)
    }
}

function update() {
    canvas2.ctx.clearRect(0, 0, canvas2.width, canvas2.height)
    for (let i = 0; i < (4/settings.stepsize + 1); i++) {
        let xn = settings.xo
        let a = i * settings.stepsize
        let x_array = []
        for (let y = 0; y < settings.xmax; y++) {
            if (y > settings.xignore) {
                canvas2.ctx.fillRect(a * canvas2.width/4, canvas2.height - xn * canvas2.height, settings.linewidth, settings.linewidth)
            }
            xn = a * xn * (1 - xn)
            if (x_array.includes(xn)) {
                canvas2.ctx.save()
                canvas2.ctx.fillStyle = 'black'
                canvas2.ctx.fillRect(a * canvas2.width/4, canvas2.height - xn * canvas2.height, settings.linewidth, settings.linewidth)
                canvas2.ctx.restore()
                break
            }
            x_array.push(xn)
        }
    }
    const img_data = canvas2.canvas.toDataURL()
    const img = new Image()
    img.onload = function() {
        canvas2.img = img
    }
    img.src = img_data
}

update()
update_canvas1()