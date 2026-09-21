import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

MASTER_IMAGE_PATH = r"C:\Users\divya\.gemini\antigravity-ide\brain\16efec4f-0fcf-4d49-b176-5d49d81bd0a2\chessley_luxury_logo_1789978327684.jpg"
PUBLIC_DIR = r"c:\CodeBase\Projects\chessley\public"
ICONS_DIR = os.path.join(PUBLIC_DIR, "icons")

os.makedirs(ICONS_DIR, exist_ok=True)

print("Opening master image...")
master = Image.open(MASTER_IMAGE_PATH).convert("RGBA")
arr = np.array(master, dtype=float)

# Separate background and create pure transparent cutout
max_rgb = np.max(arr[:, :, :3], axis=2)
alpha = np.clip((max_rgb - 46.0) / (85.0 - 46.0), 0.0, 1.0) * 255.0

# Zero out anything outside the region of interest
# Emblem is within y: 170 to 670, x: 240 to 760
# Text is within y: 690 to 860, x: 170 to 854
roi_mask = np.zeros_like(alpha)
roi_mask[170:670, 240:760] = 1.0
roi_mask[690:860, 170:854] = 1.0

final_alpha = alpha * roi_mask

result_arr = np.zeros_like(arr)
result_arr[:, :, :3] = arr[:, :, :3]
result_arr[:, :, 3] = final_alpha

trans_img = Image.fromarray(result_arr.astype(np.uint8))

# Crop isolated emblem
emblem_trans = trans_img.crop((240, 170, 760, 670))
# Crop isolated text
text_trans = trans_img.crop((170, 690, 854, 795))

# Save pure transparent emblem
emblem_trans.save(os.path.join(PUBLIC_DIR, "chessley-emblem.png"), "PNG", optimize=True)
emblem_trans.save(os.path.join(ICONS_DIR, "chessley-emblem.png"), "PNG", optimize=True)

# Save transparent splash-logo (emblem + text)
splash_logo = Image.new("RGBA", (800, 850), (0, 0, 0, 0))
e_w, e_h = emblem_trans.size
splash_logo_e = emblem_trans.resize((480, int(480 * (e_h / e_w))), Image.Resampling.LANCZOS)
splash_logo.paste(splash_logo_e, ((800 - splash_logo_e.width) // 2, 40), splash_logo_e)

t_w, t_h = text_trans.size
splash_logo_t = text_trans.resize((460, int(460 * (t_h / t_w))), Image.Resampling.LANCZOS)
splash_logo.paste(splash_logo_t, ((800 - splash_logo_t.width) // 2, 530), splash_logo_t)
splash_logo.save(os.path.join(PUBLIC_DIR, "splash-logo.png"), "PNG", optimize=True)

# Function to generate premium square icon with subtle dark obsidian gradient and amber aura
def generate_icon(size, is_maskable=False):
    canvas = Image.new("RGBA", (size, size), (6, 9, 17, 255)) # #060911
    
    # Subtle central aura
    glow_r = int(size * (0.35 if not is_maskable else 0.30))
    if glow_r > 4:
        glow = Image.new("RGBA", (glow_r * 2, glow_r * 2), (0, 0, 0, 0))
        g_draw = ImageDraw.Draw(glow)
        for r in range(glow_r, 0, -max(1, glow_r // 20)):
            a = int(32 * (1.0 - r / glow_r) ** 1.8)
            g_draw.ellipse((glow_r - r, glow_r - r, glow_r + r, glow_r + r), fill=(215, 185, 125, a))
        glow = glow.filter(ImageFilter.GaussianBlur(max(2, glow_r // 8)))
        canvas.paste(glow, (size // 2 - glow_r, size // 2 - glow_r), glow)
    
    # Resize emblem to fit within bounds
    # Maskable safe-zone requires ~65% target height, standard uses ~84%
    target_ratio = 0.65 if is_maskable else (0.86 if size <= 32 else 0.82)
    target_h = int(size * target_ratio)
    target_w = int(target_h * (emblem_trans.width / emblem_trans.height))
    
    resized = emblem_trans.resize((target_w, target_h), Image.Resampling.LANCZOS)
    pos_x = (size - target_w) // 2
    pos_y = (size - target_h) // 2
    canvas.paste(resized, (pos_x, pos_y), resized)
    return canvas

# Generate complete icon suite
icon_sizes = {
    "favicon-16x16.png": 16,
    "favicon-32x32.png": 32,
    "favicon-48x48.png": 48,
    "apple-touch-icon.png": 180,
    "apple-touch-icon-180x180.png": 180,
    "icon-192x192.png": 192,
    "icon-256x256.png": 256,
    "icon-384x384.png": 384,
    "icon-512x512.png": 512,
}

print("Generating all icon sizes...")
for filename, sz in icon_sizes.items():
    icon = generate_icon(sz, is_maskable=False)
    icon.save(os.path.join(ICONS_DIR, filename), "PNG", optimize=True)
    if filename in ["favicon-16x16.png", "favicon-32x32.png", "apple-touch-icon.png"]:
        icon.save(os.path.join(PUBLIC_DIR, filename), "PNG", optimize=True)

# Maskable icon (Android PWA adaptive icon)
print("Generating maskable icon...")
maskable_icon = generate_icon(512, is_maskable=True)
maskable_icon.save(os.path.join(ICONS_DIR, "icon-maskable-512x512.png"), "PNG", optimize=True)

# Generate multi-resolution ICO
print("Generating multi-layer favicon.ico...")
ico_16 = generate_icon(16)
ico_32 = generate_icon(32)
ico_48 = generate_icon(48)

for p in [os.path.join(PUBLIC_DIR, "favicon.ico"), os.path.join(ICONS_DIR, "favicon.ico")]:
    ico_48.save(
        p,
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=[ico_16, ico_32]
    )

# --- Generate 1920x1080 Desktop Splash Screen ---
print("Generating 1920x1080 widescreen splash...")
splash_1080p = Image.new("RGBA", (1920, 1080), (6, 9, 17, 255))
glow_desk = Image.new("RGBA", (1100, 1100), (0, 0, 0, 0))
g_draw = ImageDraw.Draw(glow_desk)
for r in range(550, 0, -4):
    a = int(36 * (1.0 - r / 550.0) ** 2.0)
    g_draw.ellipse((550 - r, 550 - r, 550 + r, 550 + r), fill=(215, 185, 125, a))
glow_desk = glow_desk.filter(ImageFilter.GaussianBlur(30))
splash_1080p.paste(glow_desk, (960 - 550, 480 - 550), glow_desk)

# Emblem on desktop splash
desk_e_h = 470
desk_e_w = int(desk_e_h * (emblem_trans.width / emblem_trans.height))
desk_e = emblem_trans.resize((desk_e_w, desk_e_h), Image.Resampling.LANCZOS)
splash_1080p.paste(desk_e, (960 - desk_e_w // 2, 450 - desk_e_h // 2 - 40), desk_e)

# Text on desktop splash
desk_t_w = 420
desk_t_h = int(desk_t_w * (text_trans.height / text_trans.width))
desk_t = text_trans.resize((desk_t_w, desk_t_h), Image.Resampling.LANCZOS)
splash_1080p.paste(desk_t, (960 - desk_t_w // 2, 450 + desk_e_h // 2 - 20), desk_t)

# Subtitle
draw_desk = ImageDraw.Draw(splash_1080p)
try:
    font_desk = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", 14)
except:
    font_desk = ImageFont.load_default()

sub_desk = "P R E C I S I O N   S T O C K F I S H   1 9   A N A L Y Z E R"
bbox = draw_desk.textbbox((0, 0), sub_desk, font=font_desk)
draw_desk.text((960 - (bbox[2] - bbox[0]) // 2, 450 + desk_e_h // 2 + 55), sub_desk, fill=(148, 163, 184, 200), font=font_desk)

splash_1080p.save(os.path.join(PUBLIC_DIR, "splash-1920x1080.png"), "PNG", optimize=True)

# --- Generate 1080x1920 Mobile Splash Screen ---
print("Generating 1080x1920 mobile splash...")
splash_mobile = Image.new("RGBA", (1080, 1920), (6, 9, 17, 255))
glow_mob = Image.new("RGBA", (900, 900), (0, 0, 0, 0))
gm_draw = ImageDraw.Draw(glow_mob)
for r in range(450, 0, -4):
    a = int(38 * (1.0 - r / 450.0) ** 2.0)
    gm_draw.ellipse((450 - r, 450 - r, 450 + r, 450 + r), fill=(215, 185, 125, a))
glow_mob = glow_mob.filter(ImageFilter.GaussianBlur(30))
splash_mobile.paste(glow_mob, (540 - 450, 850 - 450), glow_mob)

# Emblem on mobile splash
mob_e_h = 510
mob_e_w = int(mob_e_h * (emblem_trans.width / emblem_trans.height))
mob_e = emblem_trans.resize((mob_e_w, mob_e_h), Image.Resampling.LANCZOS)
splash_mobile.paste(mob_e, (540 - mob_e_w // 2, 850 - mob_e_h // 2 - 40), mob_e)

# Text on mobile splash
mob_t_w = 460
mob_t_h = int(mob_t_w * (text_trans.height / text_trans.width))
mob_t = text_trans.resize((mob_t_w, mob_t_h), Image.Resampling.LANCZOS)
splash_mobile.paste(mob_t, (540 - mob_t_w // 2, 850 + mob_e_h // 2 - 15), mob_t)

draw_mob = ImageDraw.Draw(splash_mobile)
draw_mob.text((540 - (bbox[2] - bbox[0]) // 2, 850 + mob_e_h // 2 + 65), sub_desk, fill=(148, 163, 184, 200), font=font_desk)

splash_mobile.save(os.path.join(PUBLIC_DIR, "splash-1080x1920.png"), "PNG", optimize=True)

print("Icon suite and splash screens successfully completed!")
