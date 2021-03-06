import Tone from 'tone'

const elid = id => document.getElementById(id)
const elevt = (el, evt, fn) => el.addEventListener(evt, fn)
const qsel = sel => document.querySelector(sel)
const newel = tag => document.createElement(tag)

const ready = fn => {
  document.addEventListener('DOMContentLoaded', fn)
}

ready(() => {
  const tbtn = elid('play-btn')
  elevt(tbtn, 'change', evt => {
    Tone.Transport.toggle()
  })

  const transport = {
    pos: qsel('#transport-disp > #pos'),
    tempo: qsel('#transport-disp #tempo #disp')
  }

  const update = () => {
    requestAnimationFrame(update)
    transport.pos.innerText = Tone.Transport.position
    transport.tempo.innerText = Tone.Transport.bpm.value.toFixed(2)
  }

  class DMSampleTrack {
    constructor(smp_url) {
      this.createPadHandler = this.createPadHandler.bind(this)
      this.trigger = this.trigger.bind(this)

      this.player = new Tone.Player(smp_url).toMaster()
      this.player.retrigger = true
      this.events = []
      this.setupPads()
    }

    trigger(time, note) {
      this.player.start(time)
    }

    createPadHandler(i) {
      // TODO: User changes step state -> unschedule any existing events -> schedule events
      // `scheduleEventsForState(state, step)`
      // at each step `null || { state: {...}, events: [] }`
      var fn = evt => {
        if (evt.target.checked) {
          const note = new Tone.Event((time, val) => {
            this.player.start(time)
          })
          const inTicks = Tone.Transport.PPQ / 4
          note.start(`${i * inTicks}i`)
          this.events[i] = note
          note.loop = true
          note.loopEnd = '1m'
        } else {
          const note = this.events[i]
          note.stop()
          note.dispose()
          this.events[i] = null
        }
      }
      return fn.bind(this)
    }

    setupPads() {
      const trackEl = newel('div')
      for (var i = 0; i < 16; i++) {
        const pad = newel('input')
        pad.setAttribute('type', 'checkbox')
        elevt(pad, 'change', this.createPadHandler(i))
        trackEl.appendChild(pad)
      }
      elid('pads').appendChild(trackEl)
    }
  }

  const hatTrack = new DMSampleTrack('/audio/hh.ogg')
  const kickTrack = new DMSampleTrack('/audio/bd.ogg')
  const snare = new DMSampleTrack('/audio/sd.ogg')
  const clap = new DMSampleTrack('/audio/cp.ogg')

  const loadPreset = () => {}

  const swingSlider = qsel('#transport-disp #swing')
  elevt(swingSlider, 'input', evt => {
    Tone.Transport.swing = evt.target.value
  })

  const swing8Btn = qsel('#transport-disp #swing  #div8')
  const swing16Btn = qsel('#transport-disp #swing  #div16')

  const swingHandler = evt => {
    evt.preventDefault()
    if (swing8Btn.checked) {
      Tone.Transport.swingSubdivision = '8n'
    } else if (swing16Btn.checked) {
      Tone.Transport.swingSubdivision = '16n'
    }
  }
  elevt(swing8Btn, 'change', swingHandler)
  elevt(swing16Btn, 'change', swingHandler)

  const tempoSld = qsel('#transport-disp #tempo input')
  elevt(tempoSld, 'input', evt => {
    const t = Math.round(parseFloat(evt.target.value))
    Tone.Transport.bpm.value = t
  })

  tempoSld.value = Tone.Transport.bpm.value

  update()
})
