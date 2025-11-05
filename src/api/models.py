from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Numeric, ForeignKey, UniqueConstraint, CheckConstraint, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.hybrid import hybrid_property

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "user"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]= mapped_column(String(90), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)

    restaurants: Mapped[list['Restaurant']] = relationship(
        back_populates='owner', cascade='all, delete-orphan', single_parent=True
    )

    def __repr__(self):
        return f'User {self.name}'

    def serialize(self):
        return {"id": self.id, "name": self.name, "email": self.email, "is_active": self.is_active}


class Restaurant(db.Model):
    __tablename__ = "restaurant"
    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey('user.id'), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)

    owner: Mapped['User'] = relationship('User', back_populates='restaurants', foreign_keys=[company_id]) 
    categories: Mapped[list['Categories']] = relationship(back_populates='restaurant', cascade='all, delete-orphan', single_parent=True)
    ingredients: Mapped[list['Ingredients']] = relationship(back_populates='restaurant', cascade='all, delete-orphan', single_parent=True)

    def __repr__(self):
        return f'Restaurant {self.name}'

    def serialize(self):
        return {"id": self.id, "name": self.name, "company_id": self.company_id, "is_active": self.is_active}


class Categories(db.Model):
    __tablename__ = "categories"
    id: Mapped[int] = mapped_column(primary_key=True)
    restaurant_id: Mapped[int] = mapped_column(ForeignKey('restaurant.id'), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(90), nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)

    __table_args__ = (
        UniqueConstraint("restaurant_id", "name", name="uq_category_restaurant_name"),
    )

    restaurant: Mapped['Restaurant'] = relationship(back_populates='categories')
    dishes: Mapped[list['Dishes']] = relationship(back_populates='category', cascade='all, delete-orphan', single_parent=True)

    def __repr__(self):
        return f'Category {self.name}'

    def serialize(self):
        return {"id": self.id, "restaurant_id": self.restaurant_id, "name": self.name, "image_url": self.image_url, "is_active": self.is_active}


class Ingredients(db.Model):
    __tablename__ = 'ingredients'
    id: Mapped[int] = mapped_column(primary_key=True)
    id_product_api: Mapped[int] = mapped_column(Integer, unique=True)
    restaurant_id: Mapped[int] = mapped_column(ForeignKey('restaurant.id'), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    unit: Mapped[str] = mapped_column(String(20), nullable=False)
    price_per_unit: Mapped[Numeric] = mapped_column(Numeric(10, 2), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    __table_args__ = (
        UniqueConstraint("restaurant_id", "name", name="uq_ingredient_restaurant_name"),
        CheckConstraint("price_per_unit >= 0", name="ck_ingredient_price_nonnegative"),
    )

    restaurant: Mapped['Restaurant'] = relationship(back_populates='ingredients')
    dish_ingredients: Mapped[list['DishIngredient']] = relationship(back_populates='ingredient', cascade='all, delete-orphan', single_parent=True)

    def serialize(self):
        return {"id": self.id, "restaurant_id": self.restaurant_id, "name": self.name, "unit": self.unit, "price_per_unit":(self.price_per_unit), "is_active": self.is_active}


class Dishes(db.Model):
    __tablename__= 'dishes'
    id: Mapped[int] = mapped_column(primary_key=True)
    category_id: Mapped[int] = mapped_column(ForeignKey('categories.id'), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(90), nullable=False)
    description: Mapped[str] = mapped_column(String(300))
    cost_price: Mapped[Numeric] = mapped_column(Numeric(10, 2), nullable=False)
    sale_price: Mapped[Numeric] = mapped_column(Numeric(10, 2))
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)

    __table_args__ = (
        UniqueConstraint("category_id", "name", name="uq_dish_category_name"),
    )

    category: Mapped['Categories'] = relationship(back_populates='dishes')
    ingredients: Mapped[list['DishIngredient']] = relationship(back_populates='dish', cascade='all, delete-orphan', single_parent=True)

    @hybrid_property    
    def total_cost(self):
        return sum(di.ingredient_cost for di in self.ingredients if di.ingredient_cost is not None)

    def serialize(self, include_cost: bool = True):
        data = {"id": self.id, "category_id": self.category_id, "name": self.name, "description": self.description, "cost_price": self.cost_price, "sale_price": self.sale_price, "image_url": self.image_url, "is_active": self.is_active}
        if include_cost:
            data['total_cost'] = float(self.total_cost or 0)
        return data


class DishIngredient(db.Model):
    __tablename__= 'dish_ingredient'
    id: Mapped[int] = mapped_column(primary_key=True)
    dish_id: Mapped[int] = mapped_column(ForeignKey('dishes.id'), nullable=False, index=True)
    ingredient_id: Mapped[int] = mapped_column(ForeignKey('ingredients.id'), nullable=False, index=True)

    gross_weight: Mapped[Numeric] = mapped_column(Numeric(10, 4), nullable=False) 
    decrease_pct: Mapped[Numeric] = mapped_column(Numeric(5, 4), nullable=False, default=0)
    unit_price_snapshot: Mapped[Numeric | None] = mapped_column(Numeric(10, 4), nullable=True)

    __table_args__ = (
        CheckConstraint("gross_weight >= 0", name="ck_di_weight_nonnegative"),
        CheckConstraint("decrease_pct >= 0 AND decrease_pct <= 1", name="ck_di_decrease_range")
    )

    dish: Mapped['Dishes'] = relationship(back_populates='ingredients')
    ingredient: Mapped['Ingredients'] = relationship(back_populates="dish_ingredients")

    @hybrid_property
    def used_qty(self) -> float:
        gw = float(self.gross_weight or 0)
        dec = float(self.decrease_pct or 0)
        return gw * (1 - dec)

    @hybrid_property
    def unit_price_effective(self) -> float:
        unit = (self.ingredient.unit or '').lower()
        price = self.unit_price_effective
        if unit in ('kg', 'l'):
            return price / 1000.0
        # 'g', 'ml', 'ud' ya es base
        return price

    @hybrid_property
    def ingredient_cost(self) -> float:
        """Coste de esta línea de ingrediente en el plato."""
        return (self.price_per_base_qty or 0) * (self.used_qty or 0)
    
    def serialize(self, include_cost: bool = True):
        data = {
            "id": self.id,
            "dish_id": self.dish_id,
            "ingredient_id": self.ingredient_id,
            "gross_weight": float(self.gross_weight or 0),
            "decrease_pct": float(self.decrease_pct or 0),
            "unit_price_snapshot": float(self.unit_price_snapshot) if self.unit_price_snapshot is not None else None
        }
        if include_cost:
            data["used_qty"] = float(self.used_qty or 0)
            data["lingredient_cost"] = float(self.ingredient_cost or 0)
        return data
