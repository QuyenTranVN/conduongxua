#!/usr/bin/env python3
from pathlib import Path
import json, math, struct, zlib

ROOT = Path(__file__).resolve().parents[1]


def clamp(v, lo, hi):
    return max(lo, min(hi, v))


def mix(a, b, t, alpha=None):
    if alpha is None:
        alpha = 255
    rgb = tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))
    return (*rgb, alpha)


def write_png(path: Path, width: int, height: int, pixels):
    path.parent.mkdir(parents=True, exist_ok=True)
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        for x in range(width):
            r, g, b, a = pixels[y][x]
            raw.extend((r, g, b, a))
    compressed = zlib.compress(bytes(raw), 9)
    ihdr = struct.pack('!IIBBBBB', width, height, 8, 6, 0, 0, 0)

    def chunk(tag, data):
        return (
            struct.pack('!I', len(data))
            + tag
            + data
            + struct.pack('!I', zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', compressed) + chunk(b'IEND', b'')
    path.write_bytes(png)


def empty_pixels(width, height, color=(0, 0, 0, 0)):
    return [[color for _ in range(width)] for _ in range(height)]


def gradient_icon(width, height):
    pixels = empty_pixels(width, height)
    for y in range(height):
        for x in range(width):
            nx = (x - width / 2) / max(width / 2, 1)
            ny = (y - height / 2) / max(height / 2, 1)
            d = math.sqrt(nx * nx + ny * ny)
            bg1 = (17, 35, 27)
            bg2 = (59, 92, 64)
            bg3 = (207, 170, 108)
            t = clamp((math.sqrt(nx * nx + ny * ny) * 1.1) if nx or ny else 0, 0, 1)
            r, g, b = mix(bg1, bg2, clamp((y / height) * 0.9, 0, 1))[:3]
            if d < 0.9:
                r, g, b = mix((74, 119, 88), bg3, clamp(1 - d, 0, 1))[:3]
            pixels[y][x] = (r, g, b, 255)
    cx = width / 2
    cy = height / 2
    for y in range(height):
        for x in range(width):
            dx = (x - cx) / (width / 2)
            dy = (y - cy) / (height / 2)
            dist = dx * dx + dy * dy
            if dist < 0.86:
                pixels[y][x] = mix((142, 204, 163), (242, 214, 160), clamp(1 - dist, 0, 1), 255)
    # lotus petals
    for petal in range(8):
        ang = petal * math.pi / 4 + math.pi / 10
        for y in range(height):
            for x in range(width):
                dx = x - cx
                dy = y - cy
                rx = dx * math.cos(-ang) - dy * math.sin(-ang)
                ry = dx * math.sin(-ang) + dy * math.cos(-ang)
                r2 = (rx / (width * 0.18)) ** 2 + ((ry + 0.05 * width) / (height * 0.28)) ** 2
                if r2 < 1 and abs(rx) < width * 0.22 and ry < height * 0.20:
                    pixels[y][x] = (255, 238, 188, 255)
    # central lotus body
    for y in range(height):
        for x in range(width):
            dx = x - cx
            dy = y - cy
            if dx * dx + dy * dy < (width * 0.12) ** 2:
                pixels[y][x] = (234, 188, 96, 255)
    return pixels


def gradient_splash(width, height):
    pixels = empty_pixels(width, height)
    for y in range(height):
        for x in range(width):
            t = y / height
            a = (17, 29, 22)
            b = (41, 58, 43)
            c = (98, 117, 89)
            if t < 0.45:
                r, g, b = mix(a, b, t / 0.45)[:3]
            else:
                r, g, b = mix(b, c, (t - 0.45) / 0.55)[:3]
            pixels[y][x] = (r, g, b, 255)

    # temple silhouette
    temple_w = width * 0.32
    temple_x = width * 0.60
    temple_y = height * 0.18
    for y in range(height):
        for x in range(width):
            dx = x - temple_x
            dy = y - temple_y
            if abs(dx) < temple_w * 0.45 and dy > 0 and dy < height * 0.28 and abs(dx) < (temple_w * 0.52) * (1.0 - (dy / (height * 0.28)) * 0.35):
                pixels[y][x] = (145, 125, 90, 255)
            if abs(dx) < temple_w * 0.14 and dy > 0 and dy < height * 0.36:
                pixels[y][x] = (170, 148, 102, 255)
    # forest / mist overlay
    for y in range(height):
        for x in range(width):
            if y > height * 0.44 and x < width * 0.75:
                v = (x / width) * 18 + (y / height) * 12
                if int(v) % 2 == 0:
                    pixels[y][x] = mix(pixels[y][x][:3], (32, 52, 38), 0.32, 255)
    # monk silhouette
    monk_center_x = width * 0.62
    monk_center_y = height * 0.75
    for y in range(height):
        for x in range(width):
            dx = x - monk_center_x
            dy = y - monk_center_y
            if abs(dx) < width * 0.18 and dy > 0:
                if abs(dx) < width * 0.1 and dy < height * 0.18:
                    pixels[y][x] = (44, 36, 27, 255)
                elif abs(dx) < width * 0.09 and dy > height * 0.04:
                    pixels[y][x] = (44, 36, 27, 255)
    # seated monk robe shapes
    for y in range(height):
        for x in range(width):
            dx = x - monk_center_x
            dy = y - monk_center_y
            if dx * dx + (dy - height * 0.12) ** 2 < (width * 0.11) ** 2:
                pixels[y][x] = (51, 42, 32, 255)
    return pixels


def build_android_icons():
    sizes = {
        'mipmap-mdpi': 48,
        'mipmap-hdpi': 72,
        'mipmap-xhdpi': 96,
        'mipmap-xxhdpi': 144,
        'mipmap-xxxhdpi': 192,
    }
    for folder, size in sizes.items():
        base = ROOT / 'android/app/src/main/res' / folder
        for name in ['ic_launcher.png', 'ic_launcher_round.png']:
            write_png(base / name, size, size, gradient_icon(size, size))


def build_android_splash():
    splash_path = ROOT / 'android/app/src/main/res/drawable/splash.png'
    write_png(splash_path, 640, 640, gradient_splash(640, 640))


def build_ios_icons():
    appicon_dir = ROOT / 'ios/App/App/Assets.xcassets/AppIcon.appiconset'
    # Apple-style sizes
    sizes = {
        'AppIcon-20@2x.png': 40,
        'AppIcon-20@3x.png': 60,
        'AppIcon-29@2x.png': 58,
        'AppIcon-29@3x.png': 87,
        'AppIcon-40@2x.png': 80,
        'AppIcon-40@3x.png': 120,
        'AppIcon-60@2x.png': 120,
        'AppIcon-60@3x.png': 180,
        'AppIcon-76.png': 76,
        'AppIcon-76@2x.png': 152,
        'AppIcon-83.5@2x.png': 167,
        'AppIcon-512@2x.png': 1024,
    }
    for name, size in sizes.items():
        write_png(appicon_dir / name, size, size, gradient_icon(size, size))

    contents = {
        "images": [
            {"idiom": "iphone", "size": "20x20", "scale": "2x", "filename": "AppIcon-20@2x.png"},
            {"idiom": "iphone", "size": "20x20", "scale": "3x", "filename": "AppIcon-20@3x.png"},
            {"idiom": "iphone", "size": "29x29", "scale": "2x", "filename": "AppIcon-29@2x.png"},
            {"idiom": "iphone", "size": "29x29", "scale": "3x", "filename": "AppIcon-29@3x.png"},
            {"idiom": "iphone", "size": "40x40", "scale": "2x", "filename": "AppIcon-40@2x.png"},
            {"idiom": "iphone", "size": "40x40", "scale": "3x", "filename": "AppIcon-40@3x.png"},
            {"idiom": "iphone", "size": "60x60", "scale": "2x", "filename": "AppIcon-60@2x.png"},
            {"idiom": "iphone", "size": "60x60", "scale": "3x", "filename": "AppIcon-60@3x.png"},
            {"idiom": "ipad", "size": "76x76", "scale": "1x", "filename": "AppIcon-76.png"},
            {"idiom": "ipad", "size": "76x76", "scale": "2x", "filename": "AppIcon-76@2x.png"},
            {"idiom": "ipad", "size": "83.5x83.5", "scale": "2x", "filename": "AppIcon-83.5@2x.png"},
            {"idiom": "ios-marketing", "size": "1024x1024", "scale": "1x", "filename": "AppIcon-512@2x.png"}
        ],
        "info": {"version": 1, "author": "xcode"}
    }
    (appicon_dir / 'Contents.json').write_text(json.dumps(contents, indent=2))


def build_ios_splash():
    splash = ROOT / 'ios/App/App/Assets.xcassets/Splash.imageset'
    splash.mkdir(parents=True, exist_ok=True)
    write_png(splash / 'splash.png', 1366, 1366, gradient_splash(1366, 1366))
    contents = {
      "images": [{"idiom": "universal", "filename": "splash.png", "scale": "1x"}],
      "info": {"version": 1, "author": "xcode"}
    }
    (splash / 'Contents.json').write_text(json.dumps(contents, indent=2))


def main():
    build_android_icons()
    build_android_splash()
    build_ios_icons()
    build_ios_splash()
    print('Generated mobile app assets')


if __name__ == '__main__':
    main()
