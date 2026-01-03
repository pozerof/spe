"""
Скрипт для создания иконок приложения (требует PIL/Pillow)
Если Pillow не установлен, можно пропустить этот шаг
"""
import sys
import io

# Настройка кодировки для Windows консоли
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
    
    def create_icon(size, filename):
        """Создает простую иконку с текстом СПЭ"""
        # Создаем изображение
        img = Image.new('RGB', (size, size), color='#667eea')
        draw = ImageDraw.Draw(img)
        
        # Пробуем использовать системный шрифт
        try:
            # Для Windows
            font_size = size // 3
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            try:
                # Для Linux
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size // 3)
            except:
                # Базовый шрифт
                font = ImageFont.load_default()
        
        # Рисуем текст
        text = "СПЭ"
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        position = ((size - text_width) // 2, (size - text_height) // 2)
        draw.text(position, text, fill='white', font=font)
        
        # Сохраняем
        img.save(filename, 'PNG')
        print(f"✅ Создана иконка: {filename} ({size}x{size})")
    
    # Создаем иконки
    create_icon(192, 'icon-192.png')
    create_icon(512, 'icon-512.png')
    
    print("\n✅ Иконки успешно созданы!")
    
except ImportError:
    print("⚠️  Pillow не установлен. Иконки не будут созданы.")
    print("   Установите: pip install Pillow")
    print("   Или создайте иконки вручную (192x192 и 512x512 пикселей)")
    print("   и назовите их icon-192.png и icon-512.png")
except Exception as e:
    print(f"❌ Ошибка при создании иконок: {e}")
    print("   Создайте иконки вручную (192x192 и 512x512 пикселей)")
    print("   и назовите их icon-192.png и icon-512.png")

