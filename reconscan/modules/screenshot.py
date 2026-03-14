"""Capture a full-page JPEG screenshot and an animated GIF of page load via Playwright."""

from __future__ import annotations

import asyncio
import io

from PIL import Image, ImageDraw, ImageFont
from playwright.async_api import Page


# Intervals (seconds) at which viewport frames are captured during load.
_FRAME_INTERVALS: list[float] = [0.0, 0.5, 1.0, 1.5, 2.0, 3.0]
# GIF frame duration in milliseconds.
_FRAME_DURATION_MS: int = 400
# Viewport dimensions used for GIF frames.
_GIF_WIDTH: int = 1280
_GIF_HEIGHT: int = 800

# Timestamp overlay config
_LABEL_FONT_SIZE: int = 20
_LABEL_PADDING: int = 8
_LABEL_BG: tuple[int, int, int, int] = (0, 0, 0, 180)  # semi-transparent black
_LABEL_FG: tuple[int, int, int, int] = (0, 255, 100, 255)  # matrix green


def _draw_timestamp(img: Image.Image, label: str) -> Image.Image:
    """Stamp a timestamp label in the bottom-left corner of *img*."""
    out = img.convert("RGBA")
    draw = ImageDraw.Draw(out)

    try:
        font: ImageFont.FreeTypeFont | ImageFont.ImageFont = ImageFont.truetype(
            "DejaVuSansMono.ttf", _LABEL_FONT_SIZE
        )
    except OSError:
        try:
            font = ImageFont.truetype(
                "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
                _LABEL_FONT_SIZE,
            )
        except OSError:
            font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), label, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    x = _LABEL_PADDING
    y = out.height - text_h - _LABEL_PADDING * 2 - bbox[1]

    # Background pill
    draw.rectangle(
        [
            x - _LABEL_PADDING,
            y - _LABEL_PADDING,
            x + text_w + _LABEL_PADDING,
            y + text_h + _LABEL_PADDING,
        ],
        fill=_LABEL_BG,
    )
    draw.text((x, y), label, font=font, fill=_LABEL_FG)

    return out.convert("RGB")


async def capture_screenshot(page: Page, job_id: str) -> tuple[bytes, bytes]:
    """
    Capture screenshot artifacts for a completed page load.

    The page is expected to already have been navigated to the target URL
    (wait_until="networkidle") before this function is called.

    Returns a tuple of (jpeg_bytes, gif_bytes).
    """
    # -- Full-page JPEG (final state) --
    jpeg_bytes = await page.screenshot(full_page=True, type="jpeg", quality=85)

    # -- Animated GIF (viewport frames replaying the load progression) --
    await page.set_viewport_size({"width": _GIF_WIDTH, "height": _GIF_HEIGHT})

    frames: list[Image.Image] = []
    timestamps: list[float] = []

    async def _take_frame(elapsed: float) -> None:
        raw = await page.screenshot(type="png", full_page=False)
        img = Image.open(io.BytesIO(raw)).convert("RGB")
        frames.append(img)
        timestamps.append(elapsed)

    current_url = page.url
    nav_task = asyncio.create_task(
        page.goto(current_url, timeout=30_000, wait_until="networkidle")
    )

    elapsed = 0.0
    for interval in _FRAME_INTERVALS:
        if interval > elapsed:
            await asyncio.sleep(interval - elapsed)
            elapsed = interval
        await _take_frame(elapsed)

    await nav_task
    await _take_frame(elapsed)  # final frame after full load

    if not frames:
        frames = [Image.open(io.BytesIO(jpeg_bytes)).convert("RGB")]
        timestamps = [0.0]

    resized: list[Image.Image] = []
    for frame, ts in zip(frames, timestamps):
        resized_frame = frame.resize((_GIF_WIDTH, _GIF_HEIGHT), Image.LANCZOS)
        label = f"+{ts:.1f}s" if ts < timestamps[-1] else f"+{ts:.1f}s (done)"
        resized.append(_draw_timestamp(resized_frame, label))

    buf = io.BytesIO()
    resized[0].save(
        buf,
        format="GIF",
        save_all=True,
        append_images=resized[1:],
        duration=_FRAME_DURATION_MS,
        loop=0,
        optimize=False,
    )
    gif_bytes = buf.getvalue()

    return jpeg_bytes, gif_bytes
