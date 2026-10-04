#!/usr/bin/env python3
"""Paint Westward scenes with claude-paint and cut them into parallax layers.

A scene is a folder in tools/paint/scenes/<name>/ holding Lua files that run in
name order, for example:

    00-canvas.lua   the canvas and piles (not a layer)
    10-sky.lua      layer "sky"
    20-far.lua      layer "far"
    30-mid.lua      layer "mid"
    40-near.lua     layer "near"

Each layer file paints on top of everything before it, the way a painter works
back to front. After each layer the cumulative painting is rendered. A layer's
alpha comes from where its paint changed the canvas: in each column, everything
from the first changed pixel down to the bottom belongs to that layer (each
layer is painted all the way to the bottom edge, so parallax never shows a gap).

Shared helpers in scenes/_common.lua are run before every scene.
A scene folder holding a file named "single" is rendered as one flat image.
A scene folder holding a file named "sprite" is a set of cut-out parts (the
wagon, its wheels, the oxen): each part file after 00-canvas.lua is painted on
bare canvas, and its alpha is exactly where its paint landed (holes filled).
Every part is saved at the full frame size, so they stack in place.

Output: assets/art/<name>/<layer>.webp and full.webp.

    render.py --timelapse <scene>   also films the painting being painted
                                    (assets/art/<scene>/timelapse.mp4)
"""
import glob
import shutil
import hashlib
import os
import subprocess
import sys
import time

import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SCENES = os.path.join(HERE, "scenes")
WORK = os.path.join(HERE, "work")
EASEL = os.environ.get("EASEL", os.path.join(HERE, "claude-paint", "target", "release", "easel"))
OUT_WIDTH = 2000


def lua_files(scene):
    d = os.path.join(SCENES, scene)
    return [f for f in sorted(os.listdir(d)) if f.endswith(".lua")]


def layer_name(f):
    base = f[:-4]
    return base.split("-", 1)[1] if "-" in base else base


def render(src, out, width):
    """Run the easel on a Lua source; reuse the last render if nothing changed."""
    key = hashlib.sha1((src + str(width)).encode()).hexdigest()[:16]
    stamp = out + ".key"
    if os.path.exists(out) and os.path.exists(stamp) and open(stamp).read() == key:
        return False
    lua = out[:-4] + ".lua"
    with open(lua, "w") as f:
        f.write(src)
    args = [EASEL, "run", lua, "--out", out]
    if width:
        args += ["--width", str(width)]
    t = time.time()
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write(r.stdout + r.stderr)
        raise SystemExit("easel failed on " + lua)
    with open(stamp, "w") as f:
        f.write(key)
    print("  painted %s in %.0fs" % (os.path.basename(out), time.time() - t))
    return True


def layer_alpha(prev, cur, threshold=9.0):
    """Alpha for the paint added between two renders, filled down each column."""
    diff = np.abs(cur.astype(np.int16) - prev.astype(np.int16)).max(axis=2).astype(np.uint8)
    d = Image.fromarray(diff).filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.GaussianBlur(1.5))
    changed = np.asarray(d) > threshold
    h, w = changed.shape
    # first changed row in each column (h if none)
    any_col = changed.any(axis=0)
    top = np.where(any_col, changed.argmax(axis=0), h)
    # smooth the silhouette: drop single-column spikes, keep real shapes
    top = median_1d(top, 9)
    rows = np.arange(h)[:, None]
    solid = rows >= top[None, :] + 3
    # near the silhouette, use the brushy diff itself so edges stay painterly
    band = (rows >= top[None, :] - 10) & ~solid
    alpha = np.where(solid, 255, 0).astype(np.float32)
    soft = np.asarray(d).astype(np.float32)
    alpha = np.where(band, np.clip((soft - 3) * 28, 0, 255), alpha)
    a = Image.fromarray(alpha.astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    return a


def sprite_alpha(prev, cur, threshold=10.0, fill=True):
    """Alpha for a cut-out part: where its paint landed, with interior holes filled
    (parts named wheel* keep their see-through gaps between spokes)."""
    diff = np.abs(cur.astype(np.int16) - prev.astype(np.int16)).max(axis=2).astype(np.uint8)
    d = Image.fromarray(diff).filter(ImageFilter.MedianFilter(3))
    m = Image.fromarray(((np.asarray(d) > threshold) * 255).astype(np.uint8))
    m = m.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))  # close small gaps
    inside = np.asarray(m) > 0
    if not fill:
        return Image.fromarray(inside.astype(np.uint8) * 255).filter(ImageFilter.GaussianBlur(0.6))
    # fill holes: anything not reachable from the border is inside
    h, w = inside.shape
    outside = np.zeros_like(inside)
    stack = [(0, x) for x in range(w)] + [(h - 1, x) for x in range(w)] + [(y, 0) for y in range(h)] + [(y, w - 1) for y in range(h)]
    while stack:
        y, x = stack.pop()
        if outside[y, x] or inside[y, x]:
            continue
        outside[y, x] = True
        if y > 0: stack.append((y - 1, x))
        if y < h - 1: stack.append((y + 1, x))
        if x > 0: stack.append((y, x - 1))
        if x < w - 1: stack.append((y, x + 1))
    alpha = (~outside).astype(np.uint8) * 255
    return Image.fromarray(alpha).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))


def median_1d(a, k):
    pad = k // 2
    p = np.pad(a, pad, mode="edge")
    windows = np.lib.stride_tricks.sliding_window_view(p, k)
    return np.median(windows, axis=1).astype(int)


def build(scene, width):
    files = lua_files(scene)
    common = open(os.path.join(SCENES, "_common.lua")).read() if os.path.exists(os.path.join(SCENES, "_common.lua")) else ""
    work = os.path.join(WORK, scene)
    out = os.path.join(ROOT, "assets", "art", scene)
    os.makedirs(work, exist_ok=True)
    os.makedirs(out, exist_ok=True)
    single = os.path.exists(os.path.join(SCENES, scene, "single"))
    sprite = os.path.exists(os.path.join(SCENES, scene, "sprite"))
    print(scene + (" (single)" if single else ""))

    src = ""
    stages = []  # (layer, png)
    for i, f in enumerate(files):
        chunk = open(os.path.join(SCENES, scene, f)).read()
        if i == 0:
            # the canvas must be the first chunk; shared helpers follow it
            src = "--@ chunk\n" + chunk + "\n--@ chunk\n" + common
            if not single and layer_name(f) == "canvas":
                if sprite:  # the bare canvas is the reference every part is cut against
                    png = os.path.join(work, "00-canvas.png")
                    render(src, png, width)
                    stages.append(("canvas", png))
                continue
        else:
            # each file is its own chunk in the log, like a painter's session
            src += "\n--@ chunk\n" + chunk
        if single and i < len(files) - 1:
            continue
        png = os.path.join(work, "%02d-%s.png" % (i, layer_name(f)))
        render(src, png, width)
        stages.append((layer_name(f), png))

    final = Image.open(stages[-1][1]).convert("RGB")
    size = (OUT_WIDTH, round(OUT_WIDTH * final.height / final.width))
    final.resize(size, Image.LANCZOS).save(os.path.join(out, "full.webp"), quality=82, method=6)
    if single:
        return
    if sprite:
        base = np.asarray(Image.open(stages[0][1]).convert("RGB"))
        prev = base
        for name, png in stages[1:]:
            cur = np.asarray(Image.open(png).convert("RGB"))
            rgba = Image.fromarray(cur).copy()
            rgba.putalpha(sprite_alpha(prev, cur, fill=not name.startswith("wheel")))
            sz = (1000, round(1000 * rgba.height / rgba.width))
            rgba.resize(sz, Image.LANCZOS).save(os.path.join(out, name + ".webp"), quality=85, alpha_quality=90, method=6)
            prev = cur
        print("  wrote parts " + ", ".join(n for n, _ in stages[1:]) + " to assets/art/" + scene)
        return
    prev = None
    for name, png in stages:
        cur = np.asarray(Image.open(png).convert("RGB"))
        img = Image.fromarray(cur)
        if prev is None:
            img.resize(size, Image.LANCZOS).save(os.path.join(out, name + ".webp"), quality=80, method=6)
        else:
            rgba = img.copy()
            rgba.putalpha(layer_alpha(prev, cur))
            rgba.resize(size, Image.LANCZOS).save(os.path.join(out, name + ".webp"), quality=80, alpha_quality=70, method=6)
        prev = cur
    print("  wrote " + ", ".join(n for n, _ in stages) + " to assets/art/" + scene)


def timelapse(scene, seconds=12):
    """Replay the whole painting, saving a frame as the hand works, then cut a clip."""
    work = os.path.join(WORK, scene)
    lua = sorted(glob.glob(os.path.join(work, "*.lua")))[-1]
    frames = os.path.join(work, "frames")
    shutil.rmtree(frames, ignore_errors=True)
    r = subprocess.run([EASEL, "run", lua, "--out", os.path.join(work, "timelapse-end.png"), "--width", "1280",
                        "--frames-every", "20", "--frames-dir", frames, "--frame-width", "1280"],
                       capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write(r.stdout + r.stderr)
        raise SystemExit("easel failed while filming " + scene)
    shots = sorted(glob.glob(os.path.join(frames, "*.png")))
    # hold the finished painting for the last second
    for i in range(8):
        shutil.copy(shots[-1], os.path.join(frames, "%05d.png" % (len(shots) + i)))
    rate = max(2.0, (len(shots) + 8) / float(seconds))
    out = os.path.join(ROOT, "assets", "art", scene, "timelapse.mp4")
    r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", "%.3f" % rate,
                        "-i", os.path.join(frames, "%05d.png"),
                        "-vf", "framerate=30:interp_start=0:interp_end=255:scene=100,scale=1280:-2",
                        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "27", "-preset", "slow",
                        "-movflags", "+faststart", "-an", out], capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write(r.stderr)
        raise SystemExit("ffmpeg failed")
    print("  filmed %d frames into %s (%.1f MB)" % (len(shots), out, os.path.getsize(out) / 1e6))


def main(argv):
    width = None
    names = []
    film = False
    for a in argv:
        if a == "--timelapse":
            film = True
        elif a == "--preview":
            width = 800
        elif a.startswith("--width="):
            width = int(a.split("=")[1])
        elif a == "--all":
            names = [d for d in sorted(os.listdir(SCENES)) if os.path.isdir(os.path.join(SCENES, d)) and not d.startswith("_")]
        else:
            names.append(a)
    if not names:
        raise SystemExit(__doc__)
    if not os.path.exists(EASEL):
        raise SystemExit("No painter yet. Run tools/paint/setup.sh first.")
    for n in names:
        build(n, width)
        if film:
            timelapse(n)


if __name__ == "__main__":
    main(sys.argv[1:])
