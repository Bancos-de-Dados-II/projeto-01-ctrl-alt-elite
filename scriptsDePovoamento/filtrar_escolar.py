import pandas as pd

print("Lendo o arquivo gigante (isso pode demorar um pouquinho)...")
df = pd.read_csv('Tabela_Escola_2025.csv', sep=';', encoding='latin1', low_memory=False)

print("Filtrando as escolas da Paraíba...")
df_pb = df[df['SG_UF'] == 'PB'].copy()

colunas_mapeamento = {
    'CO_ENTIDADE': 'codigo_inep',
    'NO_ENTIDADE': 'nome_escola',
    'CO_MUNICIPIO': 'codigo_ibge',
    'LATITUDE': 'latitude',
    'LONGITUDE': 'longitude',
    'IN_ACESSIBILIDADE_RAMPAS': 'tem_rampa',
    'IN_BANHEIRO_PNE': 'tem_banheiro_pcd',
    'IN_ACESSIBILIDADE_VAO_LIVRE': 'acesso_total'
}

# Separa apenas as colunas mapeadas
df_limpo = df_pb[list(colunas_mapeamento.keys())].copy()

# Renomeia para o padrão do Supabase
df_limpo.rename(columns=colunas_mapeamento, inplace=True)

# Garante que os números 0 e 1 virem Booleanos
colunas_booleanas = ['tem_rampa', 'tem_banheiro_pcd', 'acesso_total']
for col in colunas_booleanas:
    df_limpo[col] = df_limpo[col].fillna(0).astype(bool)

# Para garantir que o mapa do Leaflet não quebre, remove escolas sem coordenadas
df_limpo = df_limpo.dropna(subset=['latitude', 'longitude'])

df_limpo.to_csv('escolas_pb_limpo.csv', index=False)
print("Sucesso! O arquivo 'escolas_pb_limpo.csv' foi gerado com todas as 8 colunas!")