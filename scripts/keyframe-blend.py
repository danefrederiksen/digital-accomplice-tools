#!/usr/bin/env python3
"""
Keyframe Blender — takes a folder of PNGs and creates a smooth video
by blending between each consecutive pair as keyframes.

Usage: python3 keyframe-blend.py [options]

The script:
1. Loads PNGs sorted by file modification time (chronological)
2. Holds each keyframe briefly so you can see it
3. Blends smoothly between consecutive pairs using cosine easing
4. Outputs an H.264 MP4 at 24fps
"""

import os
import sys
import math
import subprocess
import tempfile
import argparse
from PIL import Image
import numpy as np


def cosine_ease(t):
    """Cosine ease-in-out: slow start, fast middle, slow end. Feels natural."""
    return (1 - math.cos(t * math.pi)) / 2


def blend_frames(img1_array, img2_array, alpha):
    """Blend two images using alpha (0.0 = all img1, 1.0 = all img2)."""
    return ((1 - alpha) * img1_array + alpha * img2_array).astype(np.uint8)


def main():
    parser = argparse.ArgumentParser(description="Blend keyframe PNGs into a smooth video")
    parser.add_argument("--input", "-i", default=os.path.expanduser("~/Downloads"),
                        help="Folder containing PNG keyframes (default: ~/Downloads)")
    parser.add_argument("--prefix", "-p", default="drdane_leonardo",
                        help="Filename prefix to filter PNGs (default: drdane_leonardo)")
    parser.add_argument("--output", "-o", default=os.path.expanduser("~/Desktop/davinci-tattoo-blend.mp4"),
                        help="Output video path (default: ~/Desktop/davinci-tattoo-blend.mp4)")
    parser.add_argument("--fps", type=int, default=24, help="Frame rate (default: 24)")
    parser.add_argument("--transition", "-t", type=float, default=2.0,
                        help="Seconds per transition between keyframes (default: 2.0)")
    parser.add_argument("--hold", type=float, default=0.5,
                        help="Seconds to hold each keyframe (default: 0.5)")
    parser.add_argument("--quality", "-q", type=int, default=23,
                        help="H.264 CRF quality, lower=better, 18-28 range (default: 23)")

    args = parser.parse_args()

    # --- Find and sort PNGs ---
    input_dir = args.input
    png_files = [f for f in os.listdir(input_dir)
                 if f.startswith(args.prefix) and f.lower().endswith(".png")]

    if len(png_files) < 2:
        print(f"Error: Found {len(png_files)} matching PNGs. Need at least 2.")
        sys.exit(1)

    # Sort by file modification time (oldest first = chronological order)
    png_files.sort(key=lambda f: os.path.getmtime(os.path.join(input_dir, f)))

    print(f"Found {len(png_files)} keyframes")
    print(f"Transition: {args.transition}s | Hold: {args.hold}s | FPS: {args.fps}")

    transition_frames = int(args.fps * args.transition)
    hold_frames = int(args.fps * args.hold)
    total_frames = (len(png_files) * hold_frames) + ((len(png_files) - 1) * transition_frames)
    total_duration = total_frames / args.fps

    print(f"Frames per transition: {transition_frames}")
    print(f"Frames per hold: {hold_frames}")
    print(f"Total frames: {total_frames}")
    print(f"Total duration: {total_duration:.1f}s")
    print()

    # --- Load all images into memory as numpy arrays ---
    print("Loading images...")
    images = []
    for i, fname in enumerate(png_files):
        path = os.path.join(input_dir, fname)
        img = Image.open(path).convert("RGB")
        images.append(np.array(img))
        print(f"  [{i+1}/{len(png_files)}] {fname[:50]}...")

    width, height = images[0].shape[1], images[0].shape[0]
    print(f"\nFrame size: {width}x{height}")

    # --- Pipe frames to FFmpeg ---
    print(f"\nEncoding video to: {args.output}")

    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{width}x{height}",
        "-pix_fmt", "rgb24",
        "-r", str(args.fps),
        "-i", "-",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", str(args.quality),
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        args.output
    ]

    process = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)

    frame_count = 0

    for i in range(len(images)):
        # --- Hold the keyframe ---
        print(f"Keyframe {i+1}/{len(images)}: holding {hold_frames} frames...")
        for _ in range(hold_frames):
            process.stdin.write(images[i].tobytes())
            frame_count += 1

        # --- Transition to next keyframe ---
        if i < len(images) - 1:
            print(f"  Blending {i+1} -> {i+2}: {transition_frames} frames (cosine ease)...")
            for f in range(transition_frames):
                t = (f + 1) / (transition_frames + 1)  # 0 < t < 1, excluding endpoints
                alpha = cosine_ease(t)
                blended = blend_frames(images[i], images[i + 1], alpha)
                process.stdin.write(blended.tobytes())
                frame_count += 1

    process.stdin.close()
    stderr = process.stderr.read().decode()
    process.wait()

    if process.returncode != 0:
        print(f"\nFFmpeg error:\n{stderr}")
        sys.exit(1)

    # --- Report ---
    output_size = os.path.getsize(args.output) / (1024 * 1024)
    print(f"\nDone!")
    print(f"Output: {args.output}")
    print(f"Frames: {frame_count}")
    print(f"Duration: {frame_count / args.fps:.1f}s")
    print(f"File size: {output_size:.1f} MB")


if __name__ == "__main__":
    main()
