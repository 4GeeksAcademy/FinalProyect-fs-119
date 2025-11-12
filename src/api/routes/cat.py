from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
from ..models import db, Restaurant, User, Categories
from flask_cors import CORS
from api.extensions import  has_value

cat_bp = Blueprint('cat', __name__, url_prefix='/api/user/restaurant/<int:restaurant_id>')


CORS(cat_bp)

@cat_bp.route('/categories', methods=['POST'])
def create_category(restaurant_id):

    
    restaurant = Restaurant.query.get(restaurant_id)
    if restaurant is None:
        return jsonify({'msg': f'El restaurante con ID {restaurant_id} no existe'}), 404
    
    body = request.get_json(silent=True)
    if body is None:
        return jsonify({'msg': 'Debes enviar información en el body'}), 400
    
    if not has_value(body.get('name')):
        return jsonify({'msg': 'El campo "name" es obligatorio y no puede estar vacío'}), 400
    
    name = body['name'].strip()
    image_url = body.get('image_url')

    existing_category = Categories.query.filter_by(restaurant_id=restaurant_id, name=name).first()    
    if existing_category:
        return jsonify({
            'msg': f'Ya existe una categoria llamada "{name}" en este restaurante'
        }),400
    
    new_category = Categories(
        restaurant_id = restaurant_id,
        name = name,
        image_url = image_url,
        is_active = True
    )

    db.session.add(new_category)
    db.session.commit()

    return jsonify({
        'msg': 'Nueva categoria registrada',
        'categoria': new_category.serialize()
    }), 200

@cat_bp.route('/categories/<int:category_id>', methods=['GET'])
def get_gategory(restaurant_id, category_id):

    category = db.session.get(Categories, category_id)
    if category and category.restaurant_id != restaurant_id:
        category = None

    if category is None:
        return jsonify({
            'msg': f'La categoria con ID {category_id} no existe'
        }), 404
    return jsonify({
        'category': category.serialize()
    }), 200

@cat_bp.route('/categories', methods=['GET'])
def get_all_categories(restaurant_id):

    categories = Categories.query.filter_by(restaurant_id=restaurant_id).all()

    categories_serialized = [
        category.serialize() for category in categories
    ]

    response_body = {
        'msg': f'categorias del restaurante {restaurant_id} serializados',
        'categories': categories_serialized
    }

    return jsonify(response_body), 200

@cat_bp.route('/categories/<int:category_id>', methods=['PUT'])
def update_category(restaurant_id, category_id):

    body = request.get_json(silent=True)
    if body is None: 
        return jsonify({'msg': 'Debes enviar informacion en el body'}), 400 

    category = Categories.query.filter_by(
        id = category_id,
        restaurant_id = restaurant_id
    ).first()

    if category is None:
        return jsonify({
            'msg': f'La categoria con ID {category_id} no existe en el restaurante {restaurant_id}'
        }), 404
    
    updated = False

    if 'name' in body and has_value(body.get('name')):  
        new_name = body['name'].strip()
        if not new_name:
            return jsonify({'msg': 'El nombre no puede estar vacío'}), 400
        
        if new_name != category.name:

            exist = Categories.query.filter(
                Categories.restaurant_id == restaurant_id,
                Categories.name == new_name,
                Categories.id != category_id
            ).first()
            if exist:
                return jsonify({
                    'msg': 'Ya existe esa categoria en este restaurante'
                }), 400
            
            category.name = new_name
            updated = True

    if 'image_url' in body and has_value(body.get('image_url')):
        category.image_url = body['image_url'].strip()
        updated = True

    if not updated:
        return jsonify({'msg': 'No se actualizaron todos los campos'}), 400

    db.session.commit()
    return jsonify({
        'msg': f'La categoria {category_id} ha sido actualizada con exito',
        'category': category.serialize()
    }), 200
                
@cat_bp.route('/categories/<int:category_id>', methods=['DELETE'])
def delete_category(restaurant_id, category_id):

    category = Categories.query.filter_by(
        id = category_id,
        restaurant_id = restaurant_id
    ).first()

    if category is None:
        return jsonify({
            'msg': f'La categoria {category_id} no existe en el restaurante {restaurant_id}'
        }), 404
    
    db.session.delete(category)
    db.session.commit()
    return jsonify({
        'msg': f'La categoria con ID{category_id} se ha borrado con exito en el restaurante con ID {restaurant_id}'
    }), 200