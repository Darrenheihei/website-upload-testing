window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
        constructor(effect, x, y, color){
            this.effect = effect;
            this.x = x; // current x-coordinate of the particle
            this.y = y; // current y-coordinate of the particle
            this.originX = Math.floor(x); // original x-coordinate of the particle
            this.originY = Math.floor(y); // original y-coordinate of the particle
            this.color = color;
            this.size = this.effect.gap; // each particle is size*size pixels
            this.vx = 0; // horizontal speed, the unit is pixel per animation frame
            this.vy = 0; // vertical speed, the unit is pixel per animation frame
            this.ease = 0.05;
            this.dx = 0;
            this.dy = 0;
            this.distance = 0;
            this.force = 0;
            this.angle = 0; // determine the direction of the particle being pushed away
            this.friction = 0.8;
        }

        draw(context){
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, this.size, this.size);
        }

        update(){
            this.dx = this.effect.mouse.x - this.x;
            this.dy = this.effect.mouse.y - this.y;
            this.distance = this.dx ** 2 + this.dy ** 2;
            this.force = - this.effect.mouse.radius / this.distance;
            
            if (this.distance < this.effect.mouse.radius){
                this.angle = Math.atan2(this.dy, this.dx);
                this.vx += this.force * Math.cos(this.angle);
                this.vy += this.force * Math.sin(this.angle);
            }

            this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease;
            this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease;
        }

        warp(){
            this.x = Math.floor(Math.random() * this.effect.width);
            this.y = Math.floor(Math.random() * this.effect.height);
        }
    }

    class Effect{
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.particlesArray = []; // contain all currently active particle objects
            this.image = document.getElementById('image');
            this.imgX = (width - this.image.width * 0.8)/2;
            this.imgY = (height - this.image.height * 0.8)/2;
            this.gap = 3;
            this.mouse = {
                 radius: 4000, // the radius will define the area around the cursor where particles react to mouse
                 x: undefined,
                 y: undefined
            }
            window.addEventListener('mousemove', event => {
                this.mouse.x = event.x;
                this.mouse.y = event.y;
            });
        }
        init(context){ // this method is to initialize the effect and fill particlesArray with many particle objects
            context.drawImage(this.image, this.imgX, this.imgY, this.image.width * 0.8, this.image.height * 0.8);
            const pixels = context.getImageData(0, 0, this.width, this.height).data;
            for (let y = 0; y < canvas.height; y += this.gap){
                for (let x = 0; x < canvas.width; x += this.gap){
                    const index = (y * this.width + x) * 4;
                    const red = pixels[index];
                    const green = pixels[index + 1];
                    const blue = pixels[index + 2];
                    const alpha = pixels[index + 3];
                    const color = 'rgb(' + red + ',' + green + ',' + blue + ')';

                    if (alpha > 0){
                        this.particlesArray.push(new Particle(this, x, y, color));
                    }

                }
            } 
        }

        draw(context){
            this.particlesArray.forEach(particle => particle.draw(context));
        }

        update(){
            this.particlesArray.forEach(particle => particle.update());
        }

        warp(){
            this.particlesArray.forEach(particle => particle.warp());
        }
    }

    const effect = new Effect(canvas.width, canvas.height);
    effect.init(ctx);

    function animate(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        effect.draw(ctx);
        effect.update();
        window.requestAnimationFrame(animate);
    }
    animate();

    // warp button
    const warpButton = document.getElementById('warpButton');
    warpButton.addEventListener('click', function(){
        effect.warp();
    });
})