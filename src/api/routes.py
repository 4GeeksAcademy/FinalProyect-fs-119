"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
"""""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

    """
# /src/api/routes.py
"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import request, jsonify, Blueprint, current_app
from flask_cors import CORS
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
)
from api.models import db, User, Restaurant, Categories, Ingredients, Dishes, DishIngredient
from api.utils import APIException
from api.extensions import bcrypt  

api = Blueprint('api', __name__)

# Allow CORS requests to this API (opcional si ya tienes CORS(app))
CORS(api)

@api.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code


@api.route('/hello', methods=['GET', 'POST'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200


@api.route('/login', methods=['POST'])
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
    if not is_correct:
        return jsonify({'msg': 'Usuario o contraseña incorrecta'}), 400

    access_token = create_access_token(identity=user.email)
    refresh_token = create_refresh_token(identity=user.email)

    return jsonify({
        'msg': 'Usuario logeado correctamente!',
        'token': access_token,
        'refresh_token': refresh_token,
        'access_expires_minutes': current_app.config.get("ACCESS_MIN"),
        'refresh_expires_days': current_app.config.get("REFRESH_DAYS"),
    }), 200


@api.route('/private', methods=['GET'])
@jwt_required()
def privado():
    current_email = get_jwt_identity()
    user = User.query.filter_by(email=current_email).first()
    if user is None:
        return jsonify({'msg': 'Usuario no encontrado'}), 404

    return jsonify({'msg': 'Gracias por probar que estas logeado'}), 200


@api.route('/register', methods=['POST'])
def register_user():
    body = request.get_json(silent=True)
    if body is None:
        return jsonify({'msg': 'Debes enviar informacion en el body'}), 400
    if 'email' not in body:
        return jsonify({'msg': 'El campo email es obligatorio'}), 400
    if 'name' not in body:
        return jsonify({'msg': 'Debes proporcionar un nombre'}), 400
    if 'password' not in body:
        return jsonify({'msg': 'Debes proporcionar una contraseña'}), 400

    if User.query.filter_by(email=body['email']).first():
        return jsonify({'msg': 'El email ya está registrado'}), 400

    user = User(
        name=body['name'],
        email=body['email'],
        password=bcrypt.generate_password_hash(body['password']).decode('utf-8'),
        is_active=True
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({'msg': 'Usuario registrado!', 'register': user.serialize()}), 200
