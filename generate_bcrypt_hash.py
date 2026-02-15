import bcrypt

# Remplacez par le mot de passe souhaité
password = "younisefficience"

# Générer le hash
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
print(hashed.decode())
