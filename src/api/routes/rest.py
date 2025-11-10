from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
from ..models import db, Restaurant, User
from flask_cors import CORS
from api.extensions import bcrypt, has_value

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

@rest_bp.route('/restaurant/<int:restaurant_id>', methods=['GET'])
def get_restaurant(user_id, restaurant_id):

    restaurant = db.session.get(Restaurant, restaurant_id)
    if restaurant and restaurant.company_id != user_id:
        restaurant = None

    if restaurant is None:
        return jsonify ({'msg': f'El Restaurante con ID {restaurant_id} no existe'}), 404
    print(get_restaurant)
    return jsonify({'restaurant': restaurant.serialize()}), 200



@rest_bp.route('/restaurant/<int:restaurant_id>', methods=['PUT'])
def update_restaurant(user_id, restaurant_id):

    body = request.get_json(silent=True)
    if body is None: 
        return jsonify({'msg': 'Debes enviar informacion en el body'}), 400 

    restaurant = Restaurant.query.filter_by(
        id=restaurant_id,
        company_id=user_id
    ).first()

    if restaurant is None:
        return jsonify({'msg': f'El Restaurante con ID {restaurant_id} no existe para el usuario {user_id}'}), 404
    
    updated = False

    if 'name' in body and has_value(body.get('name')):  # asumiendo has_value(str)->bool
        new_name = body['name'].strip()
        if not new_name:
            return jsonify({'msg': 'El nombre no puede estar vacío'}), 400

        if new_name != restaurant.name:

            exist = Restaurant.query.filter(
                Restaurant.company_id == user_id,
                Restaurant.name == new_name,
                Restaurant.id != restaurant_id
            ).first()
            if exist:
                return jsonify({'msg': 'Ya existe un restaurante con ese nombre para este usuario'}), 400

            restaurant.name = new_name
            updated = True
    
    if 'telefono' in body and has_value(body.get('telefono')):
        restaurant.telefono = body['telefono'].strip()
        updated = True


    if 'direccion' in body and has_value(body.get('direccion')):
        restaurant.direccion = body['direccion'].strip()
        updated = True

    if not updated:
        return jsonify({'msg': 'No se actualizaron todos los campos'}), 400
    
    db.session.commit()
    return jsonify({
        'msg': f'El restaurante {restaurant_id} ha sido actualizado con exito',
        'restaurant': restaurant.serialize()
    }), 200

@rest_bp.route('/restaurant/<int:restaurant_id>', methods=['DELETE'])
def delete_restaurant(user_id ,restaurant_id):

    restaurant = Restaurant.query.filter_by(
        id = restaurant_id,
        company_id = user_id
    ).first()

    if restaurant is None: 
        return jsonify({
            'msg': f'El restaurante con ID {restaurant_id} no existe para el usuario {user_id} '
        }), 404
    
    db.session.delete(restaurant)
    db.session.commit()
    return jsonify({
        'msg': f'El restaurante con ID {restaurant_id} se ha borrado correctamente para el usuario con ID {user_id}'
    }), 200
    