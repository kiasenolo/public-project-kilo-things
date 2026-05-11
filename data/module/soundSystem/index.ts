import * as Tone from "tone";

export function SFXPlayer(url: string, gain: Tone.Gain<"gain">, onload?: () => void) {
  let disposed = false
  let canPlay = false

  const sample = new Tone.Sampler({
    urls: {
      C4: url
    },
    onload() {
      canPlay = true;
      (onload ?? (() => { }))()
    }
  }).connect(gain)


  const play = () => {
    if (disposed) throw Error("東西已經沒了 (SFXPlayer has been disposed)");
    if (!canPlay) { console.log("聲音還沒載好 (SFX not loaded yet)"); return; }
    sample.triggerAttack("C4")
  }

  const dispose = () => {
    if (disposed) return;
    sample.dispose()
    disposed = true
  }

  return {
    play,
    dispose,
    sampler: sample
  }
}

export function LoopMusic(url: string, gain: Tone.Gain<"gain">, loopPoint: string | [number, number] | "NOT_LOOP", onload?: () => void) {
  let disposed = false
  let canPlay = false
  let started = false

  let playerS: Tone.Player | null = null;
  let playerL: Tone.Player | null = null;

  const players: Tone.Player[] = [];

  const onAllLoaded = () => {
    canPlay = true;
    (onload ?? (() => { }))();
  };

  if (loopPoint === "NOT_LOOP") {
    playerL = new Tone.Player({
      url,
      loop: false,
      onload: onAllLoaded,
    }).connect(gain);
    players.push(playerL);

  } else if (Array.isArray(loopPoint)) {
    playerS = new Tone.Player({
      url,
      onload: () => {
        playerL = new Tone.Player({
          url: playerS!.buffer,
          loop: true,
          loopStart: loopPoint[0],
          loopEnd: loopPoint[1],
        }).connect(gain);
        players.push(playerL);
        onAllLoaded();
      },
    }).connect(gain);
    players.push(playerS);

  } else {
    let loadedCount = 0;
    const onPartLoaded = () => {
      loadedCount++;
      if (loadedCount === 2) {
        onAllLoaded();
      }
    };

    playerS = new Tone.Player({ url, onload: onPartLoaded }).connect(gain);
    playerL = new Tone.Player({ url: loopPoint, loop: true, onload: onPartLoaded }).connect(gain);
    players.push(playerS, playerL);
  }

  const start = () => {
    if (disposed) throw Error("東西已經沒了 (LoopMusic has been disposed)");
    if (!canPlay) {
      console.log("聲音還沒載好 (BGM not loaded yet)");
      return players;
    }

    started = true;
    const now = Tone.now();

    if (loopPoint === "NOT_LOOP") {
      playerL!.start(now);
    } else if (Array.isArray(loopPoint)) {
      const loopStartTime = loopPoint[0];
      playerS!.start(now);
      playerS!.stop(now + loopStartTime);
      playerL!.start(now + loopStartTime, loopStartTime);
    } else {
      const introDuration = playerS!.buffer.duration;
      playerS!.start(now);
      playerL!.start(now + introDuration);
    }

    return players;
  };

  const startLoopOnly = (time?: Tone.Unit.Time, offset?: Tone.Unit.Time, duration?: Tone.Unit.Time) => {
    if (disposed) throw Error("東西已經沒了 (LoopMusic has been disposed)");
    if (!canPlay) {
      console.log("聲音還沒載好 (BGM not loaded yet)");
      return players;
    }

    if (playerL) {
      started = true;
      playerL.start(time, offset, duration);
    }

    return players;
  };

  const stop = () => {
    if (disposed) return players;
    started = false;
    players.forEach(p => p.stop());
    return players;
  };

  const dispose = () => {
    if (disposed) return;
    players.forEach(p => {
      p.stop();
      p.dispose();
    });
    disposed = true;
  };

  return {
    start,
    startLoopOnly,
    stop,
    dispose,
    player: players,
    get loaded() {
      return canPlay;
    },
    get started() {
      return started;
    },
  };
}