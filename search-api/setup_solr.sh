#!/bin/bash

# Script para configurar el schema de Solr
# Este script debe ejecutarse DESPUÉS de que Solr esté levantado

SOLR_URL="http://localhost:8983/solr"
CORE_NAME="fields_core"

echo "Configurando schema de Solr para $CORE_NAME..."

# Esperar a que Solr esté listo
echo "Esperando a que Solr esté disponible..."
until $(curl --output /dev/null --silent --head --fail $SOLR_URL); do
    printf '.'
    sleep 2
done
echo "Solr está listo!"

# Definir campos en el schema
# id: ya existe por defecto
# name: texto para búsqueda
curl -X POST -H 'Content-type:application/json' --data-binary '{
  "add-field":{
    "name":"name",
    "type":"text_general",
    "stored":true,
    "indexed":true
  }
}' "$SOLR_URL/$CORE_NAME/schema"

# sport: string para filtros exactos
curl -X POST -H 'Content-type:application/json' --data-binary '{
  "add-field":{
    "name":"sport",
    "type":"string",
    "stored":true,
    "indexed":true
  }
}' "$SOLR_URL/$CORE_NAME/schema"

# location: texto para búsqueda
curl -X POST -H 'Content-type:application/json' --data-binary '{
  "add-field":{
    "name":"location",
    "type":"text_general",
    "stored":true,
    "indexed":true
  }
}' "$SOLR_URL/$CORE_NAME/schema"

# price_per_hour: número flotante para ordenar y filtrar
curl -X POST -H 'Content-type:application/json' --data-binary '{
  "add-field":{
    "name":"price_per_hour",
    "type":"pfloat",
    "stored":true,
    "indexed":true
  }
}' "$SOLR_URL/$CORE_NAME/schema"

# image: string simple
curl -X POST -H 'Content-type:application/json' --data-binary '{
  "add-field":{
    "name":"image",
    "type":"string",
    "stored":true,
    "indexed":false
  }
}' "$SOLR_URL/$CORE_NAME/schema"

# description: texto para búsqueda
curl -X POST -H 'Content-type:application/json' --data-binary '{
  "add-field":{
    "name":"description",
    "type":"text_general",
    "stored":true,
    "indexed":true
  }
}' "$SOLR_URL/$CORE_NAME/schema"

# available: booleano
curl -X POST -H 'Content-type:application/json' --data-binary '{
  "add-field":{
    "name":"available",
    "type":"boolean",
    "stored":true,
    "indexed":true
  }
}' "$SOLR_URL/$CORE_NAME/schema"

echo "Schema configurado exitosamente!"