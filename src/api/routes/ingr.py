from flask import Blueprint, request, jsonify
from ..models import db, Restaurant, Ingredients
from decimal import Decimal, InvalidOperation
from flask_cors import CORS
from api.extensions import  has_value

ingr_bp = Blueprint('ingr_bp', __name__, url_prefix='/api/restaurant/<int:restaurant_id>')


CORS(ingr_bp)

UNIT_MAP = {
    'gr': 'g',
    'unidades': 'ud',
    'l': 'l',
    'kg': 'kg',
    'g': 'g',
    'ml': 'ml',
    'ud': 'ud',
}

ALLOWED_UNITS = {'g', 'kg', 'ml', 'l', 'ud'}

def _parse_price(ppu):

    if ppu is None:
        raise ValueError("price_per_unit requerido")
    
    try:
        val = Decimal(str(ppu))

    except (InvalidOperation, TypeError):
        raise ValueError("El campo 'price_per_unit' debe ser numérico")
    
    if val < 0:
        raise ValueError("El campo 'price_per_unit' debe ser positivo")
    
    return val.quantize(Decimal("0.0001"))



def _parse_allergens_text(value):
    """
    Acepta:
      - ["gluten","milk"]
      - "gluten, milk"
    Devuelve:
      - "gluten, milk" (string) o None
    """
    if value is None:
        return None

    if isinstance(value, list):
        items = [str(v).strip() for v in value if str(v).strip()]
    elif isinstance(value, str):
        items = [p.strip() for p in value.split(",") if p.strip()]
    else:
        return None

    seen = set()
    clean = []
    for it in items:
        it = it.replace("-", " ").strip()
        key = it.lower()
        if key and key not in seen:
            seen.add(key)
            clean.append(it)

    return ", ".join(clean) if clean else None



@ingr_bp.route('/ingredients', methods=['POST'])
def add_ingredient(restaurant_id):

    restaurant = Restaurant.query.get(restaurant_id)
    if restaurant is None:
        return jsonify({'msg': f'El restaurante con ID {restaurant_id} no existe'}), 404
    
    body = request.get_json(silent=True)
    if body is None:
        return jsonify({'msg': 'Debes enviar información en el body'}), 400
    
    if not has_value(body.get('name')):
        return jsonify({'msg': 'El campo "name" es obligatorio y no puede estar vacío'}), 400

    name = body['name'].strip()

    unit_raw = body.get('unit')
    if not unit_raw or not isinstance(unit_raw, str):
        return jsonify({
            'msg': 'El campo "unit" es obligatorio'
        }), 400
    
    unit_norm = UNIT_MAP.get(unit_raw.strip().lower())
    if unit_norm not in ALLOWED_UNITS:
        return jsonify({
            'msg': 'Unidad invalida'
        }), 400
    
    try:
        price_per_unit = _parse_price(body.get('price_per_unit'))

    except ValueError as e:
        return jsonify({'msg': str(e)}), 400
    
    image_url = body.get('image_url')

    id_product_api = body.get('id_product_api')
    if id_product_api is not None and id_product_api != '':
        try:
            id_product_api = int(id_product_api)
        except (TypeError, ValueError):
            return jsonify({
                'msg': 'El campo "id_product_api" debe ser un entero'
                }), 400

    existing_by_name = Ingredients.query.filter_by(
        restaurant_id = restaurant_id, 
        name = name
    ).first()

    if existing_by_name:
        return jsonify({
            'msg': f'Ya existe un ingrerdiente llamado "{name}" en este restaurante'
        }), 400

    if id_product_api is not None:

        existing_by_api = Ingredients.query.filter_by(
            id_product_api = id_product_api
        ).first()

        if existing_by_api:
            return jsonify({
                'msg': f'El "id_product_api" "{id_product_api}" ya esta asociado a otro ingrediente'
            }), 400
    
    allergens_text = _parse_allergens_text(body.get("allergens"))
    if allergens_text is None:
        allergens_text = _parse_allergens_text(body.get("allergen_tags"))

        
    new_ingredient = Ingredients(
        restaurant_id = restaurant_id,
        name = name,
        image_url = image_url,
        unit = unit_norm,
        price_per_unit = price_per_unit,
        is_active = True,
        id_product_api = id_product_api,
        allergens = allergens_text
    )


    db.session.add(new_ingredient)
    db.session.commit()

    return jsonify({
        'msg': 'Ingrediente registrado satisfactoriamente',
        'ingrediente': new_ingredient.serialize()
    }), 200


@ingr_bp.route('/ingredients/<int:ingredient_id>', methods=['GET'])
def get_ingredient(restaurant_id, ingredient_id):

    ingredient = Ingredients.query.filter_by(
        id = ingredient_id, 
        restaurant_id = restaurant_id
        ).first()

    if ingredient is None:
        return jsonify({
            'msg': f'El ingrediente con ID "{ingredient_id}" no existe'
        }), 404
    
    return jsonify({
        'ingredient': ingredient.serialize()
    }), 200


@ingr_bp.route('/ingredients', methods=['GET'])
def get_all_ingredients(restaurant_id):

    restaurant = Restaurant.query.get(restaurant_id)
    if restaurant is None:
        return jsonify({
            'msg': f'El restaurante con ID "{restaurant_id}" no existe'
        }), 404

    ingredients = Ingredients.query.filter_by(
        restaurant_id = restaurant_id
        ).all()
    
    return jsonify({
        'msg': f'Ingredientes del restaurante {restaurant_id}',
        'ingredients': [i.serialize() for i in ingredients]
    }), 200

@ingr_bp.route('/ingredients/<int:ingredient_id>', methods=['PUT'])
def update_ingredient(restaurant_id, ingredient_id):

    restaurant = Restaurant.query.get(restaurant_id)
    if restaurant is None:
        return jsonify({
            'msg': f'El restaurante con ID "{restaurant_id}" no existe'
            }), 404

    body = request.get_json(silent=True)
    if body is None: 
        return jsonify({
            'msg': 'Debes enviar informacion en el body'
            }), 400 
    
    ingredient = Ingredients.query.filter_by(
        id = ingredient_id,
        restaurant_id = restaurant_id
    ).first()

    if ingredient is None:
        return jsonify({
            'msg': f'La categoria con ID {ingredient_id} no existe en el restaurante {restaurant_id}'
        }), 404
    
    updated = False

    if 'name' in body and has_value(body.get('name')):

        new_name = body['name'].strip()

        if not new_name:
            return jsonify({'msg': 'El nombre no puede estar vacío'}), 400
        
        if new_name != ingredient.name:

            exist = Ingredients.query.filter(
                Ingredients.restaurant_id == restaurant_id,
                Ingredients.name == new_name,
                Ingredients.id != ingredient_id
            ).first()
            
            if exist:
                return jsonify({
                    'msg': 'Ya existe ese ingrediente en este restaurante'
                }), 400
            
            ingredient.name = new_name
            updated = True

    if "allergens" in body or "allergen_tags" in body:
        allergens_text = _parse_allergens_text(body.get("allergens"))
        if allergens_text is None:
            allergens_text = _parse_allergens_text(body.get("allergen_tags"))
        ingredient.allergens = allergens_text
        updated = True


    if 'image_url' in body:

        val = body.get('image_url')
        ingredient.image_url = val.strip() if isinstance(val, str) and val.strip() else None
        updated = True

    if 'unit' in body:

        unit_raw = body.get('unit')
        if not unit_raw or not isinstance(unit_raw, str):
            return jsonify({
                'msg': 'El campo "unit" es obligatorio si se envía'
                }), 400
        
        unit_norm = UNIT_MAP.get(unit_raw.strip().lower())
        if unit_norm not in ALLOWED_UNITS:
            return jsonify({
                'msg': f'Unidad inválida. Debe ser una de {sorted(ALLOWED_UNITS)}'
                }), 400

        if unit_norm != ingredient.unit:
            ingredient.unit = unit_norm
            updated = True

    if 'price_per_unit' in body:
        
        try:
            new_price = _parse_price(body.get('price_per_unit'))

        except ValueError as e:
            return jsonify({'msg': str(e)}), 400
        
        if ingredient.price_per_unit is None or new_price != ingredient.price_per_unit:
            ingredient.price_per_unit = new_price
            updated = True

    if 'id_product_api' in body:
        
        raw = body.get('id_product_api')
        if raw is None or raw == '':
            if ingredient.id_product_api is not None:
                ingredient.id_product_api = None
                updated = True
        else:
            try:
                id_api_int = int(raw)
            except (TypeError, ValueError):
                return jsonify({'msg': 'El campo "id_product_api" debe ser un entero'}), 400

            if id_api_int != ingredient.id_product_api:
                exists_api = Ingredients.query.filter(
                    Ingredients.id_product_api == id_api_int,
                    Ingredients.id != ingredient_id
                ).first()

                if exists_api:
                    return jsonify({'msg': f'El id_product_api "{id_api_int}" ya está asociado a otro ingrediente'}), 400
                ingredient.id_product_api = id_api_int
                updated = True

    if not updated:
        return jsonify({'msg': 'No se actualizaron los campos'}), 400

    db.session.commit()
    
    return jsonify({
        'msg': f'El ingrediente {ingredient_id} ha sido actualizado con éxito',
        'ingredient': ingredient.serialize()
    }), 200    

@ingr_bp.route('/ingredients/<int:ingredient_id>', methods=['DELETE'])
def delete_ingredient(restaurant_id, ingredient_id):

    ingredient = Ingredients.query.filter_by(
        id = ingredient_id,
        restaurant_id = restaurant_id
    ).first()

    if ingredient is None:
        return jsonify({
            'msg': f'El ingrediente {ingredient_id} no existe en el restaurante {restaurant_id}'
        }), 404
    
    db.session.delete(ingredient)
    db.session.commit()
    
    return jsonify({
        'msg': f'El ingrediente con ID {ingredient_id} se ha borrado con exito en el restaurante con ID {restaurant_id}'
    }), 200