from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
from ..models import db, User
from flask_cors import CORS
from api.extensions import bcrypt
auth_bp = Blueprint('api/user', __name__)

CORS(auth_bp)


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Faltan campos"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Credenciales inválidas"}), 401

    token = create_access_token(identity=user.id, expires_delta=timedelta(hours=2))
    return jsonify({
        "token": token,
        "user": user.serialize()
    }), 200


@auth_bp.route('/register', methods=['POST'])
def register_user():

    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "El email ya está registrado"}), 400

    user = User(email=email, password=generate_password_hash(password), is_active=True)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Usuario creado exitosamente"}), 201