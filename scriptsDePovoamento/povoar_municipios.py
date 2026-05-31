import geobr
from supabase import create_client

URL_SUPABASE = "https://xlzcnnkvqtxxceoowbsr.supabase.co"
CHAVE_SUPABASE = "CHAVE_REMOVIDA_POR_SEGURANCA"

supabase = create_client(URL_SUPABASE, CHAVE_SUPABASE)

print("Baixando os dados dos municípios da Paraíba (geobr)...")
municipios_pb = geobr.read_municipality(code_muni="PB", year=2020)

print("Iniciando a inserção na tabela 'municipios'...")

for index, row in municipios_pb.iterrows():
    try:
        # Extrai o polígono do mapa e converte para texto (WKT), formato exigido pelo banco
        geometria_wkt = row.geometry.wkt
        
        # Alinha exatamente com as colunas int4, varchar e geometria que tem no banco
        dados = {
            "codigo_ibge": int(row['code_muni']),
            "nome": str(row['name_muni']),
            "geom": geometria_wkt
        }
        supabase.table("municipios").insert(dados).execute()
        print(f"Sucesso: {row['name_muni']}")
        
    except Exception as e:
        print(f"Erro ao inserir {row['name_muni']}: {e}")

print("Tabela de municípios povoada com sucesso!")