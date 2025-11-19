from flask import Blueprint, request, jsonify
from flask_cors import CORS
#from decimal import Decimal, InvalidOperation
from ..models import db, Restaurant, Dishes, Ingredients, DishIngredient
from api.extensions import has_value, _parse_decimal

dising_bp = Blueprint('dising_bp', __name__, url_prefix='/api/restaurant/<int:restaurant_id>')

CORS(dising_bp)

""""
En el apartado "gross_weight" SIEMPRE se envian los valores en:

    - g para sólidos

    - ml para líquidos

    - ud para piezas

"""



@dising_bp.route('/dishes/<int:dish_id>/ingredients', methods=['POST'])
def add_line(restaurant_id, dish_id):

    dish = Dishes.query.filter_by(
        id = dish_id,
        restaurant_id = restaurant_id
    ).first()
    if dish is None:
        return jsonify({
            'msg': f'El plato {dish_id} no existe en el restaurante {restaurant_id}'
        }), 400

    body = request.get_json(silent=True)
    if body is None:
        return jsonify({
            'msg': 'Debes enviar informacion en el body'
        }), 400
    
    ingredient_id = body.get('ingredient_id')
    if ingredient_id is None:
        return jsonify({
            'msg': 'El campo "ingredient_id" es obligatorio'
        }), 400
    
    ing = Ingredients.query.filter_by(
        id = ingredient_id,
        restaurant_id = restaurant_id
    ).first()
    if ing is None:
        return jsonify({
            'msg': f'El ingrediente {ingredient_id} no existe en el restaurante {restaurant_id}'
        }), 400
    
    exists = DishIngredient.query.filter_by(
        dish_id = dish_id,
        ingredient_id = ingredient_id
    ).first()
    if exists:
        return jsonify({
            'msg': 'Ese ingrediente ya existe en el plato'
        }), 400
    
    try: 
        gross_weight = _parse_decimal(
            body.get('gross_weight'), 
            'gross_weight', 
            min_value=0, 
            scale="0.0001"
            )
    except ValueError as e:
        return jsonify({
            'msg': str(e)
        }), 400
    
    try:
        decrease_pct = _parse_decimal(
            body.get('decrease_pct', 0),
            'decrease_pct',
            min_value=0,
            max_value=100, 
            scale="0.0001" 
            )
        
    except ValueError as e:
        return jsonify({
            'msg': str(e)
        }), 400

    unit_price_snapshot = None
    if body.get('unit_price_snapshot') is not None and body.get('unit_price_snapshot') != '':
        try:
            unit_price_snapshot = _parse_decimal(
                body.get('unit_price_snapshot'),
                'unit_price_snapshot',
                min_value = 0,
                scale = "0.0001"
                ) 
        except ValueError as e:
            return jsonify({
                'msg': str(e)
            }), 400
        
    line = DishIngredient(
        dish_id = dish_id,
        ingredient_id = ingredient_id,
        gross_weight = gross_weight,
        decrease_pct = decrease_pct,
        unit_price_snapshot = unit_price_snapshot
    )

    db.session.add(line)
    db.session.commit()

    return jsonify({
        'msg': 'Ingrediente añadido al plato',
        'line': line.serialize(include_cost=True)
    }), 200


@dising_bp.route('/dishes/<int:dish_id>/ingredients/<int:line_id>', methods=['DELETE'])
def delete_line(restaurant_id, dish_id, line_id):

    dish = Dishes.query.filter_by(
        id=dish_id,
        restaurant_id=restaurant_id
    ).first()
    if dish is None:
        return jsonify({
            'msg': f'El plato {dish_id} no existe en el restaurante {restaurant_id}'
        }), 404

    line = DishIngredient.query.filter_by(
        id=line_id,
        dish_id=dish_id
    ).first()
    
    if line is None:
        return jsonify({
            'msg': f'La línea {line_id} no existe en el plato {dish_id}'
        }), 404

    db.session.delete(line)
    db.session.commit()

    return jsonify({
        'msg': f'La línea {line_id} se ha borrado del plato {dish_id}'
    }), 200