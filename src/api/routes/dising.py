from flask import Blueprint, request, jsonify
from flask_cors import CORS
from decimal import Decimal, InvalidOperation
from ..models import db, Restaurant, Dishes, Ingredients, DishIngredient
from api.extensions import has_value

dising_bp = Blueprint('dising_bp', __name__, url_prefix='/api/restaurant/<int:restaurant_id>')

CORS(dising_bp)