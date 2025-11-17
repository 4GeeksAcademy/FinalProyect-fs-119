from flask import Blueprint, request, jsonify
from flask_cors import CORS
from decimal import Decimal, InvalidOperation
from sqlalchemy import asc, desc
from ..models import db, Restaurant, Categories, Dishes
from api.extensions import has_value

dish_bp = Blueprint('dish_bp', __name__, url_prefix='/api/restaurant/<int:restaurant_id>')

CORS(dish_bp)