from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
from ..models import db, Restaurant, User
from flask_cors import CORS
#from api.extensions import bcrypt

rest_bp = Blueprint('rest', __name__, url_prefix='/api/user/<int:user_id>')

#---URL->/api/user/user_id/rest

CORS(rest_bp)

@rest_bp.route('/restaurant', methods=['POST'])
def create_restaurant(user_id):

    owner = User.query.get(user_id)
    if owner is None:
        return jsonify({'msg': f'El usuario con id {user_id} no existe'}), 404

    body = request.get_json(silent=True)
    if body is None:
        return jsonify({'msg': 'Debes enviar informacion en el body'}), 400
    if 'name' not in body:
        return jsonify({'msg': 'Debes proporcionar un nombre'}), 400
    
    name = body['name'].strip()
    telefono = body.get('telefono')
    direccion = body.get('direccion')

    new_restaurant = Restaurant(
        company_id = user_id, 
        name = name, 
        telefono = telefono,
        direccion = direccion,
        is_active = True 
        )


    db.session.add(new_restaurant)
    db.session.commit()

    return jsonify({
        'msg': 'Restaurante registreado',
        'restaurante': new_restaurant.serialize()
    }), 200

