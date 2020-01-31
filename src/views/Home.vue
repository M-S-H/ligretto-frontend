<template>
  <div class="home">
    <div class="welcome">
      <h1>
        <span class="blue">LI</span>
        <span class="red">GR</span>
        <span class="yellow">ET</span>
        <span class="green">TO</span>
      </h1>

      <av-button-group v-model="createOrJoin" class="create-or-join">
        <av-button-group-item value="join">Join Game</av-button-group-item>
        <av-button-group-item value="create">Create Game</av-button-group-item>
      </av-button-group>

      <div class="create-game" v-if="createOrJoin == 'join'">
        <input type="text" v-model="joinForm.game_id" placeholder="Game ID" />
        <input type="text" v-model="joinForm.name" placeholder="Name" />
        <input type="text" v-model="joinForm.color" placeholder="Color" />
        <av-button @click="joinGame">Join!</av-button>
        <!-- <button @click="joinGame">Join</button> -->
      </div>

      <div class="join-game" v-if="createOrJoin == 'create'">
        <input type="text" v-model="createForm.name" placeholder="Name" />
        <input type="text" v-model="createForm.color" placeholder="Color" />
        <input type="number" v-model="createForm.total_rounds" />
        <av-button @click="createGame">Create!</av-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'home',

  data () {
    return {
      createOrJoin: 'join',
      joinForm: { name: '', color: '', game_id: '' },
      createForm: { name: '', color: '', total_rounds: 5 },
      e: null
    }
  },

  mounted () {
    const gameId = localStorage.getItem('ligretto:game_id')
    if (gameId) {
      this.$router.push('/game')
    }
  },

  methods: {
    joinGame () {
      this.$axios.put('/joingame', this.joinForm).then(resp => {
        this.cacheData(resp.data.game.id, resp.data.player.id)
        this.$router.push('/game')
      })
    },

    createGame () {
      this.$axios.post('/newgame', this.createForm).then(resp => {
        this.cacheData(resp.data.game.id, resp.data.player.id)
        this.$router.push('/game')
      }).catch(e => { this.e = e })
    },

    cacheData (gameId, playerId) {
      localStorage.setItem('ligretto:game_id', gameId)
      localStorage.setItem('ligretto:player_id', playerId)
    }
  }
}
</script>
