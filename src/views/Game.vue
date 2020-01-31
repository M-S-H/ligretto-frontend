<template>
  <div class="game">
    <div class="countdown-screen" v-if="countingDown">
      {{ count }}
    </div>

    <div class="waiting-modal" v-if="gameState == 'gathering_players' || gameState == 'waiting_for_players'">
      <div class="game-id">
        GAME ID: {{ gameId }}
      </div>

      <div class="game-over" v-if="gameOver">
        <h1>Game Over!</h1>
      </div>
      <!-- ME: {{ player.name }} <br>
      Waiting for players -->

      <div class="round-score-wrap" v-if="roundScore">
        <div class="round-score">Your Round Score: {{ this.roundScore }}</div>
      </div>
      <!-- <h3>Players: {{ players.length }}</h3> -->
      <div class="player-list">
        <div class="player-listing" v-for="(p, i) of players" :key="p.id">
          <span class="player-rank">{{ i }}</span>
          <span class="player-name">{{ p.name }}</span>
          <span class="player-score">{{ p.score }}</span>
          <span class="player-status">
            <i v-if="!p.ready" class="fas fa-spinner fa-pulse"></i>
            <i v-if="p.ready" class="fas fa-check-circle"></i>
          </span>
        </div>
      </div>
      <!-- <av-spinner v-if="!allPlayersReady">Waiting For Players</av-spinner> -->

      <div class="status" v-if="!gameOver">
        <av-button @click="setReady" v-if="!player.ready">I'm Ready</av-button>
        <av-button @click="start" v-if="allPlayersReady && player.leader">Lets Go</av-button>
        <div v-if="player.ready && !allPlayersReady" class="waiting-spinner"><i class="fas fa-spinner fa-pulse"></i> Waiting For Other Players</div>
        <div v-if="allPlayersReady && !player.leader" class="waiting-spinner"><i class="fas fa-spinner fa-pulse"></i> Waiting For Leader</div>
      </div>

      <div class="status" v-if="gameOver">
        <av-button @click="endGame">Good Game!</av-button>
      </div>

    </div>

    <template v-if="gameState === 'in_progress'">
      <!-- Main Play Area -->
      <div class="play-area-container">
        <div class="play-area">
          <pile v-for="pile of piles" :key="pile.id" :pile="pile"></pile>
        </div>
        <!-- <span v-for="h of hand" :key="h.id">{{ h.value }} - </span> -->
      </div>

      <!-- <button v-if="stack.length != 0" @click="ligretto">Ligretto!</button> -->

      <!-- The Player's Stack, Row and Hand -->
      <div class="player-cards">
        <div class="stack">
          <div class="stack-info">Stack: {{stack.length}}</div>
          <div v-if="!stack[1]" class="win-button placeholder" :class="{active: stack.length == 0}" @click="ligretto"><i class="fas fa-trophy"></i></div>
          <card v-if="stack[1]" :card="stack[1]" :disableDrag="true" class="next-stack-card"></card>
          <card v-if="stack[0]" @finishedDrag="handleDrop" :card="stack[0]" class="top-stack-card"></card>
        </div>

        <div class="row">
          <div class="row-slot" slot-num="0">
            <div class="row-info">Row 1</div>
            <card v-if="row[0]" @finishedDrag="handleDrop" :card="row[0]"></card>
            <div class="row-bg">
              <i class="far fa-circle"></i>
            </div>
          </div>
          <div class="row-slot" slot-num="1">
            <div class="row-info">Row 2</div>
            <card v-if="row[1]" @finishedDrag="handleDrop" :card="row[1]"></card>
            <div class="row-bg">
              <i class="far fa-circle"></i>
            </div>
          </div>
          <div class="row-slot" slot-num="2">
            <div class="row-info">Row 3</div>
            <card v-if="row[2]" @finishedDrag="handleDrop" :card="row[2]"></card>
            <div class="row-bg">
              <i class="far fa-circle"></i>
            </div>
          </div>
        </div>

        <div class="hand">
          <div class="hand-info">Hand</div>
          <div class="hand-wrap">
            <card v-if="handPosition != -1" :card="topFlip" @finishedDrag="handleDrop"></card>
            <div class="placeholder" v-if="handPosition == -1"></div>
            <div class="deck" @click="flip"><i class="fas fa-redo"></i></div>
          </div>

          <div class="underneath">
            <card v-if="hand[handPosition - 2]" :card="hand[handPosition - 2]" :disableDrag="true" class="one"></card>
            <card v-if="hand[handPosition - 1]" :card="hand[handPosition - 1]" :disableDrag="true" class="two"></card>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
// import Hammer from 'hammerjs'

export default {
  name: 'Game',

  data () {
    return {
      gameOver: false,
      roundScore: null,
      player: {},
      playerId: null,
      players: [],
      gameState: '',
      stack: [],
      row: [],
      hand: [],
      handPosition: -1,
      piles: [],
      gameId: null,
      currentRound: 0,
      channel: null,
      countingDown: false,
      count: 3
    }
  },

  mounted () {
    this.gameId = localStorage.getItem('ligretto:game_id')
    this.playerId = localStorage.getItem('ligretto:player_id')

    if (!this.gameId || !this.playerId) {
      this.$router.push('/')
    }

    window.game = this

    this.getGame()
  },

  computed: {
    stackTop () {
      return this.stack[0]
    },

    stackSize () {
      return this.stack.length
    },

    topFlip () {
      return this.hand[this.handPosition]
    },

    allPlayersReady () {
      let allReady = true
      this.players.forEach(p => { allReady = allReady && p.ready })
      return allReady
    }

    // rankedPlayers () {
    //   return this.players.sort((a, b) => a.score > b.score)
    // }
  },

  methods: {
    endGame () {
      localStorage.clear()
      this.$router.push('/')
    },

    handleDrop ($event) {
      const draggedElem = $event.target
      const card = $event.card

      // Get the element that was dropped on
      draggedElem.style.visibility = 'hidden'
      const dropElem = document.elementFromPoint($event.center.x, $event.center.y)
      draggedElem.style.visibility = 'visible'

      if (!dropElem) {
        this.animateBack(draggedElem)
        return
      }

      // Get the element's vue instance
      const dropVue = dropElem.__vue__

      if (dropVue && dropVue.$options.name === 'Pile') {
        console.log('dropping on pile')
        this.channel.push('play_card', { card: card, pile_id: dropVue.pile.id })
          .receive('ok', () => {
            if (card.location === 'stack') {
              this.stack.splice(0, 1)
              this.snapBack(draggedElem)
            } else if (card.location === 'row') {
              const currentRowInd = this.row.findIndex(c => card.id === c.id)
              this.row.splice(currentRowInd, 1, null)
            } else if (card.location === 'hand') {
              const handInd = this.hand.findIndex(c => c.id === card.id && c.color === card.color)
              this.hand.splice(handInd, 1)
              this.handPosition -= 1
              this.snapBack(draggedElem)
            }
            this.saveState()
          })
          .receive('error', () => {
            this.animateBack(draggedElem)
          })
      } else if (dropElem.classList.contains('row-slot')) {
        const slotNum = Number.parseInt(dropElem.getAttribute('slot-num'))
        if (this.row[slotNum]) {
          this.animateBack(draggedElem)
        } else {
          if (card.location === 'stack') {
            card.location = 'row'
            this.row.splice(slotNum, 1, card)
            this.stack.splice(0, 1)
            this.snapBack(draggedElem)
            this.channel.push('moved_from_stack', {})
          } else {
            this.animateBack(draggedElem)
          }
        }
        this.saveState()
      } else if ($event.card.value === 1 && (dropElem.classList.contains('play-area') || dropElem.classList.contains('play-area-container'))) {
        console.log('dropping on play area')
        this.channel.push('new_pile', $event.card)
          .receive('ok', () => {
            this.snapBack(draggedElem)
            if (card.location === 'stack') {
              this.stack.splice(0, 1)
            } else if (card.location === 'row') {
              const currentRowInd = this.row.findIndex(c => c && card.id === c.id)
              this.row.splice(currentRowInd, 1, null)
            } else if (card.location === 'hand') {
              const handInd = this.hand.findIndex(c => c.id === card.id && c.color === card.color)
              this.hand.splice(handInd, 1)
              this.handPosition -= 1
              this.snapBack(draggedElem)
            }
            this.saveState()
          })
      } else {
        this.animateBack(draggedElem)
      }
    },

    snapBack (elem) {
      console.log('snap back')
      elem.style.transform = 'translate(0,0)'
      elem.classList.remove('dragging')
    },

    animateBack (elem) {
      console.log('animate back')
      elem.style.transition = 'transform 0.2s ease-in-out'
      elem.style.transform = 'translate(0,0)'
      setTimeout(() => {
        elem.style.transition = 'none'
        elem.classList.remove('dragging')
      }, 201)
    },

    removeFromStack () {
      this.stack.splice(0, 1)
    },

    flip () {
      if (this.handPosition === this.hand.length - 1) {
        this.handPosition = -1
      } else if (this.handPosition + 3 >= this.hand.length) {
        this.handPosition = this.hand.length - 1
      } else {
        this.handPosition += 3
      }
    },

    move (card, from) {},

    setupGame (stack, hand, row) {
      this.hand = hand
      this.stack = stack
      this.row = row
    },

    getGame (gameId) {
      this.$axios.get('/game/' + this.gameId).then(resp => {
        this.gameState = resp.data.game.state
        this.gameId = resp.data.game.id
        this.players = resp.data.players
        this.player = this.players.find(p => p.id === this.playerId)
        this.piles = resp.data.piles
        this.currentRound = resp.data.currentRound
        this.loadState()
        this.connectToGame()
      }).catch(e => {
        if (e.response && e.response.status === 404) {
          localStorage.clear()
          this.$router.push('/')
        } else {
          console.log(e)
        }
      })
    },

    connectToGame () {
      this.$socket.connect()
      this.channel = this.$socket.channel('game:' + this.gameId, { player_id: this.playerId })
      this.channel.on('player_joined', p => this.addPlayer(p))
      this.channel.on('player_ready', p => this.setPlayerReady(p.player_id))
      this.channel.on('round_started', p => this.startRound())
      this.channel.on('new_pile_created', p => this.addPile(p))
      this.channel.on('update_pile', p => this.updatePile(p))
      this.channel.on('end_of_round', msg => this.showEndOfRound(msg.results))
      this.channel.on('game_over', msg => this.showEndOfRound(msg.results, true))

      this.channel.join()
        .receive('ok', () => this.notifyPlayers())
    },

    updatePile (pile) {
      const localPile = this.piles.find(p => p.id === pile.id)
      localPile.currentValue = pile.currentValue
    },

    addPile (pile) {
      this.piles.push(pile)
    },

    addPlayer (player) {
      // this.player
      if (!this.players.find(x => x.id === player.id)) {
        this.players.push(player)
      }
    },

    notifyPlayers () {
      this.channel.push('player_joined', { player_id: this.player.id })
    },

    setReady () {
      this.channel.push('set_ready', { player_id: this.player.id })
        .receive('ok', hand => this.setHand(hand))
    },

    setPlayerReady (playerId) {
      const player = this.players.find(p => p.id === playerId)
      player.ready = true
    },

    start () {
      this.channel.push('start_round', {})
    },

    setHand (hand) {
      console.log(hand)
      this.stack = hand.stack
      this.row = hand.row
      this.hand = hand.hand
      this.saveState()
    },

    startRound () {
      this.player.ready = false
      this.players.forEach(p => { p.ready = false })
      this.gameState = 'in_progress'
      this.startCountdown()
    },

    saveState () {
      const stateString = JSON.stringify({ hand: this.hand, row: this.row, stack: this.stack, gameOver: this.gameOver })
      localStorage.setItem('player_cards', stateString)
      console.log('saved')
    },

    loadState () {
      const stateString = localStorage.getItem('player_cards')
      if (!stateString) return

      const state = JSON.parse(localStorage.getItem('player_cards'))
      this.hand = state.hand
      this.row = state.row
      this.stack = state.stack
      this.gameOver = state.gameOver
    },

    ligretto () {
      console.log('hi')
      this.channel.push('ligretto')
    },

    showEndOfRound (results, gameover = false) {
      console.log(results)
      this.piles = []
      this.gameState = 'waiting_for_players'
      results.forEach(r => {
        const player = this.players.find(p => p.id === r.player_id)
        player.score = r.new_score
        if (player.id === this.player.id) {
          this.roundScore = r.round_score
        }
      })

      this.gameOver = gameover

      this.players = this.players.sort((a, b) => {
        if (a.score > b.score) {
          return -1
        } else if (b.score > a.score) {
          return 1
        } else {
          return 0
        }
      })

      // this.players = this.players.sort(p => p.score)
    },

    startCountdown () {
      this.count = 3
      this.countingDown = true
      const time = 1000
      setTimeout(() => { this.count = 2 }, time)
      setTimeout(() => { this.count = 1 }, time * 2)
      setTimeout(() => { this.countingDown = false }, time * 3)
    }
  }
}
</script>
