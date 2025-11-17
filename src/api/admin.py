
import os
from flask_admin import Admin
from .models import db, User, Restaurant, Categories, Ingredients, Dishes, DishIngredient
from flask_admin.contrib.sqla import ModelView


def user_label(u: User):
    return f"{u.email} (id={u.id})"

def restaurant_label(r: Restaurant):
    return f"{r.name} (id={r.id})"

def category_label(c: Categories):
    return f"{c.name} (id={c.id})"

def ingredient_label(i: Ingredients):
    return f"{i.name} (id={i.id})"

def dish_label(d: Dishes):
    return f"{d.name} (id={d.id})"


class UsersModelView(ModelView):
    column_list = ['id', 'name', 'email', 'password', 'telefono', 'direccion', 'is_active']
    column_searchable_list = ['name', 'email']
    # Formulario
    form_columns = ['name', 'email', 'password', 'telefono', 'direccion', 'is_active']


class RestaurantModelView(ModelView):
    column_list = ['id', 'owner', 'name', 'telefono', 'direccion','is_active']
    column_labels = {'owner': 'Owner (User)'}
    column_searchable_list = ['name', 'owner.name', 'owner.email']
    column_filters = ['is_active']

    form_columns = ['owner','name', 'telefono', 'direccion', 'is_active']

    form_ajax_refs = {
        'owner': {
            'fields': ('name', 'email'),
        }
    }


class CategoriesModelView(ModelView):
    column_list = ['id', 'name', 'restaurant', 'image_url', 'is_active']
    column_labels = {'restaurant': 'Restaurant'}
    column_searchable_list = ['name', 'restaurant.name']
    column_filters = ['restaurant.name', 'is_active']

    form_columns = ['restaurant', 'name', 'image_url', 'is_active']

    form_ajax_refs = {
        'restaurant': {
            'fields': ('name',),
        }
    }


class IngredientsModelView(ModelView):
    column_list = ['id', 'name', 'restaurant', 'image_url', 'unit', 'price_per_unit', 'is_active']
    column_labels = {'restaurant': 'Restaurant'}
    column_searchable_list = ['name', 'restaurant.name', 'unit']
    column_filters = ['restaurant.name', 'unit', 'is_active']

    form_columns = ['restaurant', 'id_product_api', 'name', 'image_url', 'unit', 'price_per_unit', 'is_active']

    form_ajax_refs = {
        'restaurant': {
            'fields': ('name',),
        }
    }


class DishesModelView(ModelView):
    column_list = ['id', 'name', 'restaurant', 'category', 'description', 'cost_price', 'image_url', 'is_active']
    column_labels = {'restaurant': 'Restaurant', 'category': 'Category'}
    column_searchable_list = ['name', 'category.name', 'description', 'restaurant.name']
    column_filters = ['restaurant.name', 'category.name', 'is_active']

    form_columns = ['restaurant', 'category', 'name', 'description', 'cost_price', 'image_url', 'is_active']

    form_ajax_refs = {
        'restaurant': { 'fields': ('name',) },
        'category':   { 'fields': ('name',) }
    }


class DishIngredientModelView(ModelView):
    column_list = [
        'id', 'dish', 'ingredient', 'gross_weight',
        'decrease_pct', 'unit_price_snapshot'
    ]
    column_labels = {
        'dish': 'Dish',
        'ingredient': 'Ingredient',
        'gross_weight': 'Gross Qty',
        'decrease_pct': 'Merma (0..1)',
        'unit_price_snapshot': 'Unit Price (snapshot)'
    }
    column_searchable_list = ['dish.name', 'ingredient.name']
    column_filters = ['dish.name', 'ingredient.name']

    form_columns = [
        'dish', 'ingredient', 'gross_weight', 'decrease_pct', 'unit_price_snapshot'
    ]

    form_ajax_refs = {
        'dish': {
            'fields': ('name',),
        },
        'ingredient': {
            'fields': ('name',),
        }
    }


def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'
    admin = Admin(app, name='4Geeks Admin', template_mode='bootstrap3')

    admin.add_view(UsersModelView(User, db.session))
    admin.add_view(RestaurantModelView(Restaurant, db.session))
    admin.add_view(CategoriesModelView(Categories, db.session))
    admin.add_view(IngredientsModelView(Ingredients, db.session))
    admin.add_view(DishesModelView(Dishes, db.session))
    admin.add_view(DishIngredientModelView(DishIngredient, db.session))
