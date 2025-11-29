from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
from ..models import db, User
from flask_cors import CORS
from api.extensions import has_value, mail
from flask_mail import Message
import os
from itsdangerous import URLSafeTimedSerializer
import re
auth_bp = Blueprint('/api/user', __name__)

# ---Incorporacion nueva para campos vacios en PUT ---VALIDAR HORACIO------
# def has_value(value):
#    return not (value is None or (isinstance(value, str) and value.strip() == ''))
# --------------------------------------------------------------------------------

CORS(auth_bp)

url_front = os.getenv("FRONTEND_URL").rstrip("/")


@auth_bp.route('/resetPassword', methods=['POST'])
def send_mail_password():
    body = request.get_json(silent=True)
    email = (body["email"] or "").strip().lower()

    serializer = URLSafeTimedSerializer(os.getenv("MAIL_PASSWORD"))
    token = serializer.dumps(email, salt="password-reset")

    reset_email_password = f"{url_front}/resetPassword/{token}/token"

    msg = Message(
        'Prueba de email',
        html=f"<p>para restablecer la contraseña, da click <a href={reset_email_password}>aqui</a> </p>",
        recipients=[email],
        sender='setadish@gmail.com',
    )
    mail.send(msg)
    print(token)

    return jsonify({
        'msg': 'Correo enviado correctamente',
    }), 200


@auth_bp.route('/resetPassword/<string:token>', methods=['POST'])
def reset_password(token):
    body = request.get_json(silent=True)
    if body is None:
        return jsonify({'msg': 'Debes enviar informacion en el body'}), 400
    if 'password' not in body:
        return jsonify({'msg': 'Debes proporcionar una nueva contraseña'}), 400

    serializer = URLSafeTimedSerializer(os.getenv("MAIL_PASSWORD"))
    try:
        email = serializer.loads(
            token,
            salt="password-reset",
            max_age=3600
        )
    except Exception as e:
        return jsonify({'msg': 'El token es inválido o ha expirado'}), 400

    user = User.query.filter_by(email=email).first()
    if user is None:
        return jsonify({'msg': 'El usuario no existe'}), 404

    user.password = generate_password_hash(body["password"])
    db.session.commit()

    return jsonify({'msg': 'Contraseña restablecida correctamente'}), 200


@auth_bp.route('/login', methods=['POST'])
def login():
    body = request.get_json(silent=True)
    if body is None:
        return jsonify({'msg': ' Debes enviar informacion en el body'}), 400
    if 'email' not in body:
        return jsonify({'msg': 'El campo email es obligatorio'}), 400
    if 'password' not in body:
        return jsonify({'msg': ' El campo password es obligatorio'}), 400

    user = User.query.filter_by(email=body['email']).first()
    if not user or not check_password_hash(user.password, body['password']):
        return jsonify({"error": "Credenciales inválidas"}), 401

    access_token = create_access_token(identity=user.email)
    return jsonify({
        'msg': 'Usuario logeado correctamente!',
        'token': access_token,
        'user': user.serialize()
    }), 200


@auth_bp.route('/register', methods=['POST'])
def register_user():

    body = request.get_json(silent=True)
    if body is None:
        return jsonify({'msg': 'Debes enviar informacion en el body'}), 400
    # if 'email' not in body:
    #    return jsonify({'msg': 'El campo email es obligatorio'}), 400
    if 'name' not in body:
        return jsonify({'msg': 'Debes proporcionar un nombre'}), 400
    if 'password' not in body:
        return jsonify({'msg': 'Debes proporcionar una contraseña'}), 400

    email = (body["email"] or "").strip().lower()
    if not email:
        return jsonify({'msg': 'El campo email es obligatorio'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'msg': f'El email {email} ya está registrado'}), 400

    user = User(
        email=body["email"],
        password=generate_password_hash(body["password"]),
        is_active=True,
        name=body["name"],


    )

    db.session.add(user)
    db.session.commit()

    return jsonify({'msg': 'Usuario registrado!', 'register': user.serialize()}), 200

# ///////////INCORPORACION METODO 'GET' PARA /api/user/perfil //////////////////


@auth_bp.route('/profile/<int:user_id>', methods=['GET'])
def profile_user(user_id):

    user = User.query.get(user_id)
    if user is None:
        return jsonify({'msg': f'El usuario con ID {user_id} no existe'}), 404

    return jsonify({'user': user.serialize()}), 200


@auth_bp.route('/delete/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):

    user = User.query.get(user_id)
    if user is None:
        return jsonify({'msg': f'El usuario con ID {user_id} no existe'}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({'msg': 'Usuario eliminado con exito'}), 200


@auth_bp.route('/update/<int:user_id>', methods=['PUT'])
def update_user(user_id):

    body = request.get_json(silent=True)
    if body is None:
        return jsonify({'msg': 'Debes enviar informacion en el body'}), 400

    user = User.query.get(user_id)
    if user is None:
        return jsonify({'msg': f'El usuario con ID {user_id} no existe'}), 404

    updated = False

    if 'email' in body and has_value(body.get('email')):
        new_email = body['email'].strip()
        if new_email != user.email:
            exist = User.query.filter(
                User.email == new_email, User.id != user_id). first()
            if exist:
                return jsonify({'msg': 'Este email ya esta en uso'}), 400
            user.email = new_email
            updated = True
    if 'name' in body and has_value(body.get('name')):
        user.name = body['name'].strip()
        updated = True

    if 'password' in body and has_value(body.get('password')):
        user.password = generate_password_hash(body['password'])
        updated = True

    if 'telefono' in body and has_value(body.get('telefono')):
        user.telefono = body['telefono'].strip()
        updated = True

    if 'direccion' in body and has_value(body.get('direccion')):
        user.direccion = body['direccion'].strip()
        updated = True

    if not updated:
        return jsonify({'msg': 'No se actualizaron todos los campos'}), 400

# -----------SE DEBERIA PEDIR CONFIRMACION PARA CAMBIO DE CONTRASEÑA? COMO DESARROLLARLO??
    # print(user.password)
    db.session.commit()
    return jsonify({
        'msg': f'El usuario {user_id} ha sido actualizado con exito',
        'user': user.serialize()
    }), 200