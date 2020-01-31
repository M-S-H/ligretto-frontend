import Hammer from 'hammerjs'

export default {
  bind (el, binding, vnode) {
    const mc = new Hammer(el)

    mc.add(new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }))

    mc.on('pan', (ev) => {
      const elem = ev.target
      elem.style.transform = `translate(${ev.deltaX}px, ${ev.deltaY}px)`

      if (ev.isFinal) {
        vnode.context.$emit('finishedDrag')
        // elem.style.transition = 'transform 0.1s ease-in-out'
        // elem.style.transform = 'translate(0,0)'

        // setTimeout(() => { elem.style.transition = 'none' }, 101)
      }
    })
  },

  inserted (el, binding, vnode) {

  }
}

// var myBlock = document.getElementById('myElement');
// var statusBar = document.getElementById('status');

// // create a simple instance on our object
// var mc = new Hammer(myBlock);

// // add a "PAN" recognizer to it (all directions)
// mc.add( new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }) );

// // tie in the handler that will be called
// mc.on("pan", handleDrag);

// // poor choice here, but to keep it simple
// // setting up a few vars to keep track of things.
// // at issue is these values need to be encapsulated
// // in some scope other than global.
// var ogX = 0;
// var ogY = 0;
// var lastPosX = 0;
// var lastPosY = 0;
// var isDragging = false;
// var thing = 0;

// function handleDrag(ev) {
//   // for convience, let's get a reference to our object
//   var elem = ev.target;

//   // DRAG STARTED
//   // here, let's snag the current position
//   // and keep track of the fact that we're dragging
//   if ( ! isDragging ) {
//     isDragging = true;
//     ogX = ev.center.x;
//     ogY = ev.center.y;
//     lastPosX = elem.offsetLeft;
//     lastPosY = elem.offsetTop;
//     console.log(elem.offsetLeft);
//     setStatus("You, sir, are dragging me...");

//     setBlockText("WOAH");
//   }

//   // we simply need to determine where the x,y of this
//   // object is relative to where it's "last" known position is
//   // NOTE:
//   //    deltaX and deltaY are cumulative
//   // Thus we need to always calculate 'real x and y' relative
//   // to the "lastPosX/Y"
//   console.log({x: ev.deltaX, y: ev.deltaY});
//   var posX = ev.deltaX;
//   var posY = ev.deltaY;

//   // move our element to that position
//   elem.style.transform = "translate(" + posX + "px, " + posY + "px)";

//   // DRAG ENDED
//   // this is where we simply forget we are dragging
//   if (ev.isFinal) {
//     isDragging = false;
//     elem.style.transition = 'transform 0.1s ease-in-out';
//     elem.style.transform = 'translate(0,0)';

//     setTimeout(function() {
//       elem.style.transition = 'none';
//     }, 300);

//     setStatus("Much better. It's nice here.");
//     setBlockText("Thanks");
//   }
// }

// function setStatus(msg) {
//   statusBar.textContent = msg;
// }
// function setBlockText(msg) {
//   myBlock.textContent = msg;
// }
