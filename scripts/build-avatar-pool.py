from PIL import Image
from pathlib import Path

src_dir = Path(r"D:\2workspace\codex\ai-mange\public\avatars")
out_dir = src_dir

names = (
    list(src_dir.glob("portrait-*.png"))
    + list(src_dir.glob("p0*.png"))
    + list(src_dir.glob("p1*.png"))
    + list(src_dir.glob("p2*.png"))
    + list(src_dir.glob("p3*.png"))
)
seen = set()
files = []
for p in names:
    if p.name not in seen:
        seen.add(p.name)
        files.append(p)
print("source count", len(files))

TARGET_W, TARGET_H = 512, 640
faces = []
for src in sorted(files, key=lambda x: x.name):
    im = Image.open(src).convert("RGB")
    w, h = im.size
    tr = TARGET_W / TARGET_H
    if w / h > tr:
        nw = int(h * tr)
        left = (w - nw) // 2
        box = (left, 0, left + nw, h)
    else:
        nh = int(w / tr)
        top = max(0, int((h - nh) * 0.12))
        box = (0, top, w, top + nh)
    crop = im.crop(box).resize((TARGET_W, TARGET_H), Image.LANCZOS)
    out_name = src.stem + ".jpg"
    crop.save(out_dir / out_name, "JPEG", quality=86, optimize=True)
    faces.append(out_name)
    print(out_name, crop.size)

print("FACES_LEN", len(faces))
for f in faces:
    print("FACE", f)
