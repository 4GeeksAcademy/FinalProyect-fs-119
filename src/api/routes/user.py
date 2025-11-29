from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
from ..models import db, User
from flask_cors import CORS
from api.extensions import has_value

auth_bp = Blueprint('api/user', __name__)

#---Incorporacion nueva para campos vacios en PUT ---VALIDAR HORACIO------
#def has_value(value):
#    return not (value is None or (isinstance(value, str) and value.strip() == ''))
#--------------------------------------------------------------------------------

CORS(auth_bp)


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
    #if 'email' not in body:
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
        telefono=body["telefono"],
        direccion=body['direccion']
        )

    db.session.add(user)
    db.session.commit()

    return jsonify({'msg': 'Usuario registrado!', 'register': user.serialize()}), 200

#///////////INCORPORACION METODO 'GET' PARA /api/user/perfil //////////////////

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
        return jsonify ({'msg': f'El usuario con ID {user_id} no existe'}), 404
    
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
        return jsonify ({'msg': f'El usuario con ID {user_id} no existe'}), 404
    
    updated = False

    if 'email' in body and has_value(body.get('email')):
        new_email = body['email'].strip()
        if new_email != user.email:
            exist = User.query.filter(User.email == new_email, User.id != user_id). first()
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
    #print(user.password)
    db.session.commit()
    return jsonify({
        'msg': f'El usuario {user_id} ha sido actualizado con exito', 
        'user': user.serialize()
        }), 200