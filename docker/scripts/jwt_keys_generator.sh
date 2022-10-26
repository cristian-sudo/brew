#!/usr/bin/env bash

mkdir -p config/jwt

chmod -R 777 config

jwt_private_key='config/jwt/jwt_private.pem'
jwt_public_key='config/jwt/jwt_public.pem'

if [ -e $jwt_private_key ] || [ -e $jwt_public_key ]; then
    echo "config/jwt contains *.pem file(s). Skipping..."
    exit 0
fi

echo "Generating JWT keys..."

openssl genrsa -out $jwt_private_key 4096
openssl rsa -pubout -in $jwt_private_key -out $jwt_public_key

setfacl -R -m u:www-data:rX -m u:"$(whoami)":rwX config/jwt  true
setfacl -dR -m u:www-data:rX -m u:"$(whoami)":rwX config/jwt || true