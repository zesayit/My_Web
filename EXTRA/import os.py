import os
import csv
import shutil

# Caminho da pasta onde estão armazenadas as fotografias
folder_path = r"C:\Users\leaod\Desktop\DCIM"

# Caminho do ficheiro CSV com a lista de fotografias a salvar
csv_path = r"C:\Users\leaod\Desktop\arvores_salvar.csv"

# Caminho da pasta para onde as fotografias serão movidas
destination_folder = r"C:\Users\leaod\Desktop\salvas"

# Ler a lista de fotografias a salvar a partir do CSV
with open(csv_path, mode='r', newline='', encoding='utf-8') as file:
    reader = csv.reader(file)
    photos_to_save = [row[0] for row in reader]  # Assumindo que o nome da foto está na primeira coluna

# Mover as fotografias
for photo in photos_to_save:
    photo_path = os.path.join(folder_path, photo)
    if os.path.exists(photo_path):
        # Caminho para a nova localização
        destination_path = os.path.join(destination_folder, photo)
        shutil.move(photo_path, destination_path)
        print(f"Fotografia {photo} foi movida para {destination_path}.")
    else:
        print(f"Fotografia {photo} não foi encontrada.")
