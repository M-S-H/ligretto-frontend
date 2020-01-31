<template>
  <div class="pile" :class="[pile.color]">{{ pile.currentValue }}</div>
</template>

<script>
export default {
  name: 'Pile',

  props: ['pile']
}
</script>
