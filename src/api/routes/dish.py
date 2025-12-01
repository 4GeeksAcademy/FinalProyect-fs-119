from flask import Blueprint, request, jsonify
#from decimal import Decimal, InvalidOperation
#from sqlalchemy import asc, desc
from ..models import db, Restaurant, Categories, Dishes, DishIngredient
from api.extensions import has_value, _parse_decimal

dish_bp = Blueprint('dish_bp', __name__, url_prefix='/api/restaurant/<int:restaurant_id>')



@dish_bp.route('/dishes', methods=['POST'])
def create_dish(restaurant_id):

    restaurant = Restaurant.query.get(restaurant_id)
    if restaurant is None:
        return jsonify({
            'msg': f'El restaurante con ID {restaurant_id} no existe'
        }), 400
    
    body = request.get_json(silent=True)
    if body is None:
        return jsonify({
            'msg': 'Debes enviar informacion en el body'
        }), 400
    
    if not has_value(body.get('name')):
        return jsonify({
            'msg': 'El campo "name" es obligatorio y no puede estar vacío'
            }), 400
    name = body['name'].strip()

    category_id = body.get('category_id')
    if category_id is None:
        return jsonify({
            'msg': 'El campo "category_id" es obligatorio'
        }), 400
    
    category = Categories.query.filter_by(
        id = category_id,
        restaurant_id = restaurant_id
    ).first()
    if category is None:
        return jsonify({
            'msg': f'La categoria {category_id} no existe en el restaurante {restaurant_id}'
        }), 400
    
    exist = Dishes.query.filter_by(
        category_id = category_id,
        name = name
    ).first()
    if exist:
        return jsonify({
            'msg': f'Ya existe un plato con nombre {name} en esta categoria'
        }), 400
    
    description = body.get('description')

    image_url = body.get('image_url')

    cost_price = None
    if body.get('cost_price') is not None:
        try:
            cost_price = _parse_decimal(body.get('cost_price'), 'cost_price', min_value=0)
        
        except ValueError as e:
            return jsonify({
                'msg': str(e)
            }), 400

    dish = Dishes(
        restaurant_id = restaurant_id,
        category_id = category_id,
        name = name,
        description = description,
        image_url = image_url,
        cost_price = cost_price
    )

    db.session.add(dish)
    db.session.commit()

    return jsonify({
        'msg': 'Plato creado satisfactoriamente',
        'dish': dish.serialize(include_cost=True)
    }), 200



@dish_bp.route('/dishes/<int:dish_id>', methods=['GET'])
def get_dish(restaurant_id, dish_id):

    dish = Dishes.query.filter_by(
        id = dish_id,
        restaurant_id = restaurant_id        
    ).first()
    if dish is None:
        return jsonify({
            'msg': f'El plato {dish_id} no existe en el restaurante {restaurant_id}'
        }), 404
    
    lines = DishIngredient.query.filter_by(dish_id=dish_id).all()

    dish_data = dish.serialize(include_cost=True)

    dish_data["cost_price"] = float(dish.total_cost or 0)

    dish_data["ingredients"] = [ln.serialize(include_cost=True) for ln in lines]


    
    return jsonify({
        'dish': dish_data
    }), 200

@dish_bp.route('/dishes', methods=['GET'])
def get_all_dishes(restaurant_id):

    restaurant = Restaurant.query.get(restaurant_id)
    if restaurant is None:
        return jsonify({
            'msg': f'El restaurante con ID {restaurant_id} no existe'
        }), 404
    
    query = Dishes.query.filter_by(
        restaurant_id=restaurant_id
    )

    dishes = query.all()

    dishes_serialized = []
    for d in dishes:
        d_data = d.serialize(include_cost=True)
        d_data["cost_price"] = float(d.total_cost or 0)
        dishes_serialized.append(d_data)

    return jsonify({
        'msg': f'Listado de platos del restaurante {restaurant_id}',
        'dishes': dishes_serialized
    }), 200
@dish_bp.route('/dishes/<int:dish_id>', methods=['DELETE'])
def delete_dish(restaurant_id, dish_id):

    dish = Dishes.query.filter_by(
        id=dish_id,
        restaurant_id=restaurant_id
    ).first()
    if dish is None:
        return jsonify({
            'msg': f'El plato {dish_id} no existe en el restaurante {restaurant_id}'
        }), 404

    db.session.delete(dish)
    db.session.commit()

    return jsonify({
        'msg': f'El plato con ID {dish_id} se ha borrado correctamente del restaurante {restaurant_id}'
    }), 200