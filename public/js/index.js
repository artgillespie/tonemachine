function elid(id) {
  return document.getElementById(id)
}
function elevt(el, evt, fn) {
  return el.addEventListener(evt, fn)
}
function qsel(sel) {
  return document.querySelector(sel)
}
function newel(tag) {
  return document.createElement(tag)
}

function ready(fn) {
  document.addEventListener('DOMContentLoaded', fn)
}

ready(function() {
  const tbtn = elid('play-btn')
  elevt(tbtn, 'change', function(evt) {
    Tone.Transport.toggle()
  })

  const transport = {
    pos: qsel('#transport-disp > #pos'),
    tempo: qsel('#transport-disp #tempo #disp')
  }

  function update() {
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
      this.part = new Tone.Part(this.trigger)
      this.part.loop = true
      this.part.loopStart = '0:0:0'
      this.part.loopEnd = '1:0:0'
      this.part.start('0:0:0')
      this.setupPads()
    }

    trigger(time, note) {
      this.player.start(time)
    }

    createPadHandler(i) {
      var fn = function(evt) {
        var q = Math.floor(i / 4)
        var s = i % 4
        if (evt.target.checked) {
          this.part.add(`0:${q}:${s}`)
        } else {
          this.part.remove(`0:${q}:${s}`)
        }
      }
      return fn.bind(this)
    }

    setupPads() {
      var trackEl = newel('div')
      for (var i = 0; i < 16; i++) {
        var pad = newel('input')
        pad.setAttribute('type', 'checkbox')
        elevt(pad, 'change', this.createPadHandler(i))
        trackEl.appendChild(pad)
      }
      elid('pads').appendChild(trackEl)
    }
  }

  var hatTrack = new DMSampleTrack('/audio/hh.ogg')
  var kickTrack = new DMSampleTrack('/audio/bd.ogg')
  var snare = new DMSampleTrack('/audio/sd.ogg')
  var clap = new DMSampleTrack('/audio/cp.ogg')

  var swingSlider = qsel('#transport-disp #swing')
  elevt(swingSlider, 'input', function(evt) {
    Tone.Transport.swing = evt.target.value
  })

  var swing8Btn = qsel('#transport-disp #swing  #div8')
  var swing16Btn = qsel('#transport-disp #swing  #div16')

  function swingHandler(evt) {
    evt.preventDefault()
    if (swing8Btn.checked) {
      Tone.Transport.swingSubdivision = '8n'
    } else if (swing16Btn.checked) {
      Tone.Transport.swingSubdivision = '16n'
    }
  }
  elevt(swing8Btn, 'change', swingHandler)
  elevt(swing16Btn, 'change', swingHandler)

  var tempoSld = qsel('#transport-disp #tempo input')
  elevt(tempoSld, 'input', function(evt) {
    var t = Math.round(parseFloat(evt.target.value))
    Tone.Transport.bpm.value = t
  })

  tempoSld.value = Tone.Transport.bpm.value

  update()
})
