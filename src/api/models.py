from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Integer, Float, ForeignKey, CheckConstraint, UniqueConstraint, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.hybrid import hybrid_property

db = SQLAlchemy()

class User(db.Model):

    __tablename__ = "user"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)

    restaurants: Mapped[list['Restaurant']] = relationship( \
        back_populates='owner', cascade='all, delete-orphan', single_parent=True)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            # do not serialize the password, its a security breach
        }
        
    

class Restaurant(db.Model):

    __tablename__ = "restaurant"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)

    owner: Mapped['User'] =relationship(back_populates='restaurants')
    categories: Mapped[list['Category']] = relationship(back_populates='restaurant', \
                                                        cascade='all, delete-orphan', single_parent=True)
    ingredients: Mapped[list['Ingredient']] = relationship(back_populates='restaurant', \
                                                        cascade='all, delete-orphan', single_parent=True)
    
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "user_id": self.user_id
        }

class Category(db.Model):

    __tablename__= "category"
    id: Mapped[int] = mapped_column(primary_key=True)
    restaurant_id: Mapped[int] = mapped_column(ForeignKey('restaurant.id'), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(90), unique=True, nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(500), unique=False, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)

    __table_args__ = (
        UniqueConstraint("restaurant_id", "name", name="uq_category_restaurant_name"),
    )

    restaurant: Mapped['Restaurant'] = relationship(back_populates='categories')
    dishes: Mapped[list['Dish']] = relationship(back_populates='category', cascade='all, delete-orphan', single_parent=True)

    def serialize(self):
        return {
            "id": self.id,
            "restaurant_id": self.restaurant_id,
            "name": self.name,
            "image_url": self.image_url,
            "is_active": self.is_active
        }

class Ingredient(db.Model):

    __tablename__= 'ingredient'
    id: Mapped[int] = mapped_column(primary_key=True)
    restaurant_id: Mapped[int] = mapped_column(ForeignKey('restaurant.id'), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    price_per_kg: Mapped[Numeric] = mapped_column(Numeric(10, 4), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    __table_args__ = (
        UniqueConstraint("restaurant_id", "name", name="uq_ingredient_restaurant_name"),
        CheckConstraint("price_per_kg >= 0", name="ck_ingredient_price_nonnegative"),
    )

    restaurant: Mapped['Restaurant'] = relationship(back_populates='ingredients')

    dish_links: Mapped[list['DishIngredient']] = relationship(back_populates='ingredient', \
                                                               cascade='all, delete-orphan', single_parent=True)
    
    def serialize(self):
        return {
            "id": self.id,
            "restaurant_id": self.restaurant_id,
            "name": self.name,
            "price_per_kg": str(self.price_per_kg),
            "is_active": self.is_active,
        }


class Dish(db.Model):

    __tablename__= 'dish'
    id: Mapped[int] = mapped_column(primary_key=True)
    category_id: Mapped[int] = mapped_column(ForeignKey('category.id'), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(90), nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(500), unique=False, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)

    __table_args__ = (
        UniqueConstraint("category_id", "name", name="uq_dish_category_name"),
    )

    category: Mapped['Category'] = relationship(back_populates='dishes')
    ingredients: Mapped[list['DishIngredient']]= relationship(back_populates='dish', \
                                                              cascade='all, delete-orphan', single_parent=True)
    
     # ---- Cálculos de coste (propiedades híbridas para usar en Python y en queries) ----
    @hybrid_property    
    def total_cost(self):
        
    #    Suma de (precio_efectivo_kg * peso_neto_kg) de cada línea.
        
        return sum(link.line_cost for link in self.ingredients)
        
    
    def serialize(self, include_cost: bool = True):
        data = {
            "id": self.id,
            "category_id": self.category_id,
            "name": self.name,
            "image_url": self.image_url,
            "is_active": self.is_active,
        }
        
        if include_cost:
            data['total_cost'] = float(self.total_cost or 0)
        
        return data
    

class DishIngredient(db.Model):

    __tablename__= 'dish_ingredient'
    id: Mapped[int] = mapped_column(primary_key=True)
    dish_id: Mapped[int] = mapped_column(ForeignKey('dish.id'), nullable=False, index=True)
    ingredient_id: Mapped[int] = mapped_column(ForeignKey('ingredient.id'), nullable=False, index=True)

    gross_weight_kg: Mapped[Numeric] = mapped_column(Numeric(10, 4), nullable=False) 
    decrease_pct: Mapped[Numeric] = mapped_column(Numeric(5, 4), nullable=False, default=0)
    unit_price_snapshot: Mapped[Numeric | None] = mapped_column(Numeric(10, 4), nullable=True)

    __table_args__ = (
        CheckConstraint("gross_weight_kg >= 0", name="ck_di_weight_nonnegative"),
        CheckConstraint("decrease_pct >= 0 AND decrease_pct <= 1", name="ck_di_decrease_range")
    )

    dish: Mapped['Dish'] = relationship(back_populates='ingredients')
    ingredient: Mapped['Ingredient'] = relationship(back_populates="dish_links")

    @hybrid_property
    def effective_unit_price(self):
        """
        Precio efectivo €/kg: si hay snapshot úsalo; si no, usa el precio actual del ingrediente.
        """
        return self.unit_price_snapshot if self.unit_price_snapshot is not None else self.ingredient.price_per_kg

    @hybrid_property
    def net_weight_kg(self):
        """
        Peso neto tras merma.
        """
        return (self.gross_weight_kg or 0) * (1 - (self.decrease_pct or 0))

    @hybrid_property
    def line_cost(self):
        """
        Coste de esta línea = precio_efectivo_kg * peso_neto_kg
        """
        return (self.effective_unit_price or 0) * (self.net_weight_kg or 0)
    
    def serialize(self, include_cost: bool = True):
        data = {
            "id": self.id,
            "dish_id": self.dish_id,
            "ingredient_id": self.ingredient_id,
            "gross_weight_kg": float(self.gross_weight_kg or 0),
            "decrease_pct": float(self.decrease_pct or 0),
            "unit_price_snapshot": float(self.unit_price_snapshot) if self.unit_price_snapshot is not None else None,
        }
        if include_cost:
            data["net_weight_kg"] = float(self.net_weight_kg or 0)
            data["line_cost"] = float(self.line_cost or 0)
        return data
