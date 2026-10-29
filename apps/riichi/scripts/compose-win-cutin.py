"""Original Bunny Gala cinematic score. Deterministic synthesis; no sampled/library music.
Cues: 0 dark swell / .24 eye slash / 1.45 tile reveal / 2.80 full-art impact.
Run from repository root with Python+NumPy and ffmpeg.
"""
from pathlib import Path
import numpy as np
import wave, subprocess, tempfile
SR=48000; DURATION=5.2
rng=np.random.default_rng(7026)
t=np.arange(int(SR*DURATION))/SR
out=Path('public/audio/sfx');out.mkdir(parents=True,exist_ok=True)

def band_noise(lo,hi):
    noise=rng.normal(0,1,len(t));f=np.fft.rfftfreq(len(t),1/SR)
    filt=np.clip((f-lo)/max(100,lo),0,1)*np.clip((hi-f)/max(200,hi*.3),0,1)
    x=np.fft.irfft(np.fft.rfft(noise)*filt,n=len(t));return x/(np.std(x)+1e-9)

def envelope(start,attack,decay):
    u=np.maximum(0,t-start);return (t>=start)*(1-np.exp(-u/attack))*np.exp(-u/decay)

def compose(power):
    x=np.zeros((len(t),2));air=band_noise(700,9000)
    def add(v,pan=0):
        x[:,0]+=v*np.sqrt((1-pan)/2);x[:,1]+=v*np.sqrt((1+pan)/2)
    # Dark sub, dissonance resolving into a D-minor power chord.
    add(.23*np.sin(2*np.pi*36.708*t)*envelope(0,.04,.8))
    for side in [-1,1]:
        pulse=np.sin(2*np.pi*(146.832+side*.27)*t)+.22*np.sin(2*np.pi*293.664*t)
        add(.045*pulse*envelope(.03,.16,1.25),side*.8)
    # A fast, ascending stereo blade synchronized to the eye strip.
    for start,amp in [(.09,.105),(1.13,.075)]:
        u=np.clip((t-start)/.36,0,1);env=np.sin(np.pi*u)**1.6
        add(amp*air*env,-.55);add(amp*np.roll(air,257)*env,.55)
        phase=2*np.pi*(180*(t-start)+1350*(t-start)**2)
        add(.07*np.sin(phase)*env)
    # Revealed tiles: ascending crystalline D minor/add9, with long stereo tails.
    for i,f in enumerate([587.33,698.456,880,1174.66,1318.51]):
        at=1.45+i*.09;u=np.maximum(0,t-at)
        bell=(np.sin(2*np.pi*f*u)+.27*np.sin(2*np.pi*f*2.01*u)+.12*np.sin(2*np.pi*f*3.98*u))
        add(.055*bell*envelope(at,.002,.48),-.65+i*.325)
    # Deep, accelerating ensemble drum strokes (no machine-gun transient).
    for at,amp in [(1.45,.13),(1.96,.14),(2.37,.19)]:
        u=np.maximum(0,t-at);phase=2*np.pi*(49*u+24*.055*(1-np.exp(-u/.055)))
        add(amp*np.sin(phase)*envelope(at,.001,.22))
    # Brass/string-like harmonic ensemble and sub-drop at the full-art reveal.
    u=np.maximum(0,t-2.8)
    add(.34*np.sin(2*np.pi*(37*u+30*.12*(1-np.exp(-u/.12))))*envelope(2.8,.002,.72))
    for i,f in enumerate([73.416,110,146.832,174.614,220,293.664]):
        v=np.zeros(len(t))
        for h in range(1,9+power*2):
            v+=np.sin(2*np.pi*f*h*u+.009*np.sin(2*np.pi*4.3*u))/(h**1.45)
        add((.095+power*.012)*v*envelope(2.8,.012,1.05+power*.13),(-1 if i%2 else 1)*.65)
    add((.07+power*.025)*band_noise(1300,12000)*envelope(2.8,.003,.30))
    if power:
        for i,f in enumerate([587.33,880,1174.66,1760]):
            add(.025*power*np.sin(2*np.pi*f*u)*envelope(2.8,.012,1.15),(-1)**i*.85)
    # Leave space for the character grade VO after the hit, then a restrained reverb tail.
    x*=np.where(t>3.05,.58,1)[:,None]
    dry=x.copy()
    for delay,gain in [(.087,.15),(.149,.12),(.237,.095),(.371,.07)]:
        n=int(delay*SR);x[n:]+=dry[:-n,::-1]*gain
    x*=np.minimum(1,np.maximum(0,(DURATION-t)/.5))[:,None]
    return x

def export(name,x):
    x=np.tanh(x*1.1);x*=.79/max(.79,np.abs(x).max())
    with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
        with wave.open(tmp.name,'wb') as w:
            w.setparams((2,2,SR,0,'NONE','not compressed'));w.writeframes((x*32767).astype('<i2').tobytes())
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',tmp.name,'-af','loudnorm=I=-17:TP=-2:LRA=8','-c:a','libmp3lame','-b:a','192k',str(out/name)],check=True)
    print(name)

for name,power in [('cutin-silver.mp3',0),('cutin-gold.mp3',1),('cutin-divine.mp3',2)]:
    export(name,compose(power))
prefix=compose(0)[:int(SR*1.45)].copy();prefix[-int(SR*.08):]*=np.linspace(1,0,int(SR*.08))[:,None]
export('cutin-eyes.mp3',prefix)
