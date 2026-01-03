"""
Скрипт для конвертации Excel файла в JSON формат для приложения СПЭ Билеты
"""
import pandas as pd
import json
import sys
import os

# Настройка кодировки для Windows консоли
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def convert_excel_to_json(excel_file, output_file='tickets.json'):
    """
    Конвертирует Excel файл в JSON формат
    
    Args:
        excel_file: путь к Excel файлу
        output_file: путь к выходному JSON файлу
    """
    try:
        # Читаем Excel файл
        # Пробуем разные разделители и форматы
        try:
            df = pd.read_excel(excel_file, engine='openpyxl')
        except:
            try:
                df = pd.read_excel(excel_file, engine='xlrd')
            except:
                # Пробуем как CSV с разными разделителями
                try:
                    df = pd.read_csv(excel_file, sep=';', encoding='utf-8')
                except:
                    df = pd.read_csv(excel_file, sep=',', encoding='utf-8')
        
        # Нормализуем названия столбцов
        column_mapping = {}
        for col in df.columns:
            col_lower = str(col).lower().strip()
            if 'номер' in col_lower or 'билет' in col_lower:
                column_mapping[col] = 'Номер билета'
            elif 'вопрос' in col_lower:
                column_mapping[col] = 'Вопрос'
            elif 'ответ' in col_lower:
                column_mapping[col] = 'Ответ'
        
        # Переименовываем столбцы
        if column_mapping:
            df = df.rename(columns=column_mapping)
        
        # Удаляем пустые строки
        df = df.dropna(how='all')
        
        # Преобразуем в список словарей и очищаем данные
        tickets = []
        for _, row in df.iterrows():
            ticket = {}
            for col in df.columns:
                value = row[col]
                # Обрабатываем значения
                if pd.isna(value):
                    value = ''
                else:
                    value = str(value).strip()
                    # Удаляем символы возврата каретки из Excel
                    value = value.replace('_x000D_', '\n').replace('\r\n', '\n').replace('\r', '\n')
                
                ticket[col] = value
            
            # Пропускаем полностью пустые билеты
            if any(ticket.values()):
                tickets.append(ticket)
        
        # Сохраняем в JSON
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(tickets, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Успешно конвертировано {len(tickets)} билетов")
        print(f"📁 Файл сохранен: {os.path.abspath(output_file)}")
        print(f"\nСтолбцы в файле: {list(df.columns)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Ошибка при конвертации: {e}")
        print("\nУбедитесь, что:")
        print("1. Excel файл существует и доступен")
        print("2. Установлены библиотеки: pandas, openpyxl")
        print("3. Файл содержит столбцы: 'Номер билета', 'Вопрос', 'Ответ'")
        return False

if __name__ == '__main__':
    if len(sys.argv) > 1:
        excel_file = sys.argv[1]
    else:
        # Ищем Excel файлы в текущей директории
        excel_files = [f for f in os.listdir('.') if f.endswith(('.xlsx', '.xls', '.csv'))]
        if excel_files:
            print("Найденные Excel/CSV файлы:")
            for i, f in enumerate(excel_files, 1):
                print(f"{i}. {f}")
            choice = input("\nВведите номер файла или путь к файлу: ").strip()
            try:
                file_index = int(choice) - 1
                excel_file = excel_files[file_index]
            except:
                excel_file = choice
        else:
            excel_file = input("Введите путь к Excel файлу: ").strip()
    
    if not os.path.exists(excel_file):
        print(f"❌ Файл не найден: {excel_file}")
        sys.exit(1)
    
    convert_excel_to_json(excel_file)

