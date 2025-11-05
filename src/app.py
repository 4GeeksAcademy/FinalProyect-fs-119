"""""
import os
from flask import Flask, jsonify, send_from_directory, request, url_for 
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required, create_refresh_token
from datetime import timedelta
from api.utils import APIException, generate_sitemap
from api.models import db, User, Restaurant, Categories, Ingredients, Dishes, DishIngredient
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands

from flask_bcrypt import Bcrypt

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../dist/')
app = Flask(__name__)
app.url_map.strict_slashes = False

app.config["JWT_SECRET_KEY"] = os.getenv('JWT_KEY')

bcrypt = Bcrypt(app) 

ACCESS_MIN = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_MIN", "60"))
REFRESH_DAYS = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES_DAYS", "30"))

app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=ACCESS_MIN)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=REFRESH_DAYS)


db_url = os.getenv("DATABASE_URL")
if db_url:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace("postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "supersecretkey")

MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)
CORS(app)
jwt = JWTManager(app)

setup_admin(app)
setup_commands(app)

app.register_blueprint(api, url_prefix='/api')

@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  
    return response


@app.route('/api/login', methods=['POST'])
def login():
    body = request.get_json(silent=True)
    if body is None:
        return jsonify({'msg': ' Debes enviar informacion en el body'}), 400
    if 'email' not in body:
        return jsonify({'msg': 'El campo email es obligatorio'}), 400
    if 'password' not in body:
        return jsonify({'msg': ' El campo password es obligatorio'}), 400
    
    user = User.query.filter_by(email=body['email']).first() 
    if user is None:
        return jsonify({'msg': 'Usuario o contraseña incorrecta'}), 400
    is_correct = bcrypt.check_password_hash(user.password, body['password'])
    if is_correct == False:
        return jsonify({'msg': 'Usuario o contraseña incorrecta'}), 400
    acces_token = create_access_token(identity=user.email)
    refresh_token = create_refresh_token(identity=user.email)
    #if user.password != body['password']:
    #    return jsonify({'msg': 'Usuario o contraseña incorrecta'}), 400 
    return jsonify({'msg': 'Usuario logeado correctamente!', \
                    'token': acces_token,
                    'refresh_token': refresh_token,
                    'access_expires_minutes': ACCESS_MIN,
                    'refresh_expires_days': REFRESH_DAYS}), 200

@app.route('/api/private', methods=['GET'])
@jwt_required()
def privado():
    current_user = get_jwt_identity()
    current_user = User.query.filter_by(email=current_user).first()
    #----Para autorizar por primera vez un token en Postman /headers -> //crear key// -> Authorization y //Value -> Bearer (espacio) nuevo token
    #---Una vez autorizado -> /Authorization/Bearer Token/ poner el token
    return jsonify({'msg': 'Gracias por probar que estas logeado'}), 200
    #return jsonify({"id": user.email, "username": user.username }), 200

@app.route('/api/register', methods=['POST'])
def register_user():
    body = request.get_json(silent=True)
    if body is None:
        return jsonify({'msg': 'Debes enviar informacion en el body'}), 400
    if 'email' not in body:
        return jsonify({'msg': 'El campo email es obligatorio'}), 400
    if 'name' not in body:
        return  jsonify({'msg': 'Debes proporcionar un nombre'}), 400
    if 'password' not in body:
        return jsonify({'msg': 'Debes proporcionar una contraseña'}), 400
    
    user = User() 

    user.name = body['name']
    user.email = body['email']
    hash_password = bcrypt.generate_password_hash(body['password']).decode('utf-8')
    #user.password = body['password']
    user.password = hash_password

    user.is_active = True
    
    db.session.add(user)
    db.session.commit()

    return jsonify({'msg': 'Usuario registrado!', 'register': user.serialize()}), 200



if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
"""

import os
from datetime import timedelta
from flask import Flask, jsonify, send_from_directory
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from api.utils import APIException, generate_sitemap
from api.models import db
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from api.extensions import bcrypt  # <-- NUEVO

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')
app = Flask(__name__)
app.url_map.strict_slashes = False

# JWT config
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "supersecretkey")
ACCESS_MIN = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_MIN", "60"))
REFRESH_DAYS = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES_DAYS", "30"))
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=ACCESS_MIN)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=REFRESH_DAYS)

# Exponer números para usarlos en /api/routes.py (respuesta del login)
app.config["ACCESS_MIN"] = ACCESS_MIN
app.config["REFRESH_DAYS"] = REFRESH_DAYS

# DB config
db_url = os.getenv("DATABASE_URL")
if db_url:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Init extensiones
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)
bcrypt.init_app(app)            # <-- NUEVO
CORS(app)
jwt = JWTManager(app)

# Admin, comandos y blueprint
setup_admin(app)
setup_commands(app)
app.register_blueprint(api, url_prefix='/api')

# Errores y estáticos


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code


@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0
    return response


if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
