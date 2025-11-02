  
import os
from flask_admin import Admin
from .models import db, User, Restaurant, Category, Ingredient, Dish, DishIngredient
from flask_admin.contrib.sqla import ModelView


class UsersModelView(ModelView):
    column_auto_select_related = True #Cargar las relaciones
    column_list = ['id','email', 'password', 'is_active']

class RestaurantModelView(ModelView):
    column_auto_select_related = True #Cargar las relaciones
    column_list = [ 'id', 'name', 'user_id']    

class CategoryModelView(ModelView):
     column_auto_select_related = True
     column_list = [ 'id', 'restaurant_id', 'name', 'image_url', 'is_active']    

class IngredientModelView(ModelView):
    column_auto_select_related = True
    column_list = [ 'id', 'restaurant_id', 'name', 'price_per_kg', 'is_active']

class DishModelView(ModelView):
    column_auto_select_related = True
    column_list = [ 'id', 'category_id', 'name', 'image_url', 'is_active']

class DishIngredientModelView(ModelView):
    column_auto_select_related = True
    column_list = [ 'id', 'dish_id', 'ingredient_id', 'gross_weight_kg', 'decrease_pct', 'unit_price_snapshot']




def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'
    admin = Admin(app, name='4Geeks Admin', template_mode='bootstrap3')

    
    # Add your models here, for example this is how we add a the User model to the admin
    admin.add_view(UsersModelView(User, db.session))
    admin.add_view(RestaurantModelView(Restaurant, db.session))
    admin.add_view(CategoryModelView(Category, db.session))
    admin.add_view(IngredientModelView(Ingredient, db.session))
    admin.add_view(DishModelView(Dish, db.session))
    admin.add_view(DishIngredientModelView(DishIngredient, db.session))

    # You can duplicate that line to add mew models
    # admin.add_view(ModelView(YourModelName, db.session))




    #ACABAR DE AÑADIR LOS MODELS EN LA PARTE DE ABAJO /\