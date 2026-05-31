import pandas as pd

df = pd.read_csv('Tabela_Escola_2025.csv', sep=';', encoding='latin1', nrows=5)

print("As colunas do arquivo são:")
print(df.columns.tolist())