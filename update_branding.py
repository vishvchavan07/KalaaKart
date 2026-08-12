import os
import glob

# Files to update
html_files = glob.glob('*.html')
js_files = glob.glob('assets/js/*.js')

all_files = html_files + js_files

replacements = {
    'assets/images/main_logo_final.jpeg': 'assets/images/craftified_logo.jpg',
    'assets/images/main_logo.jpeg': 'assets/images/craftified_logo.jpg',
    'Kalaa Kart': 'Craftified',
    'KalaaKart': 'Craftified',
    'kalaakart': 'craftified'
}

for file_path in all_files:
    if os.path.isfile(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        for old, new in replacements.items():
            content = content.replace(old, new)
        
        if content != original:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {file_path}")

print("Branding update complete.")
