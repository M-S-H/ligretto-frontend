<template>
  <div class="pile" :class="[pile.color]">{{ pile.currentValue }}</div>
</template>

<script>
export default {
  name: 'Pile',

  props: ['pile'],

  watch: {
    'pile.currentValue': function () {
      this.animateDrop()
    }
  },

  methods: {
    animateDrop () {
      // this.$el.classList.add('one')
      // this.$el.classList.add('two')
      this.$el.style.transform = 'scale(1.3)'
      setTimeout(() => {
        this.$el.style.transform = 'scale(1)'
        setTimeout(() => {
          this.$el.style.transition = 'transform 0.2s ease-in-out'
          // this.$el.style.remove('one')
          // this.$el.classList.add('two')
          setTimeout(() => {
            this.$el.style.transition = 'none'
            // this.$el.classList.remove('two')
          }, 201)
        }, 0)
      }, 0)
    }
  }
}
</script>
