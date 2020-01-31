<template>
  <div class="card" :class=[card.color]>{{ card ? card.value : ''}}</div>
</template>

<script>
import Hammer from 'hammerjs'

export default {
  name: 'Card',

  props: ['card', 'disableDrag'],

  mounted () {
    if (!this.disableDrag) {
      const mc = new Hammer(this.$el)

      mc.add(new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }))

      mc.on('pan', (ev) => {
        const elem = ev.target
        elem.style.transform = `translate(${ev.deltaX}px, ${ev.deltaY}px) scale(1.1, 1.1)`
        elem.classList.add('dragging')

        if (ev.isFinal) {
          ev.card = this.card
          this.$emit('finishedDrag', ev)
        }
      })
    }
  }
}
</script>
