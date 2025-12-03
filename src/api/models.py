from __future__ import annotations
from typing import List, Optional

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import (
    String, Boolean, Numeric, ForeignKey, UniqueConstraint, CheckConstraint, Integer, Index, case, func, select
    )
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.hybrid import hybrid_property

db = SQLAlchemy()

def _to_base_unit_price(unit: Optional[str], price_per_unit: float) -> float:
   
    u = (unit or "").lower()
    p = float(price_per_unit or 0)
    if u in ("kg", "l"):
        return p / 1000.0
    
    return p

"""Youtube --> Dia 44 - Recuperación de Contraseña por correo pt1 min:24:00

class PasswordResetToken(db.Model)
    __tablename__ = "password_reset_token"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey('user.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    token: Mapped[str] = mapped_column(String(128), nullable=False, unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=False)

    user: Mapped['User'] = relationship('User', backref='password_reset_tokens')

    def is_valid(self) -> bool:
        now = datetime.now(timezone.utc)
        return (not self.used) and (self.expires_at > now)
    

    def __repr__(self):
        return f'password_reset_token {self.id}'

    def serialize(self):
        return {"id": self.id,
                "user_id": self.user_id 
                "token": self.token,
                "created_at": self.created_at, 
                "expires_at": self.expires_at,

                }

        
"""

class User(db.Model):
    __tablename__ = "user" 

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]= mapped_column(String(90), nullable=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    telefono: Mapped[int] = mapped_column(nullable=True)
    direccion: Mapped[str] = mapped_column(String(120), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)

    restaurants: Mapped[list['Restaurant']] = relationship(
        back_populates='owner', 
        cascade='all, delete-orphan', 
        single_parent=True,
        passive_deletes=True
    )

    def __repr__(self):
        return f'User {self.name}'

    def serialize(self):
        return {"id": self.id, 
                "name": self.name, 
                "email": self.email, 
                "telefono": self.telefono,
                "direccion": self.direccion,  
                "is_active": self.is_active
                }


class Restaurant(db.Model):
    __tablename__ = "restaurant"

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(
        ForeignKey('user.id', ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    telefono: Mapped[int] = mapped_column(nullable=True)
    direccion: Mapped[str] = mapped_column(String(120), nullable=True)
    lat: Mapped[float | None] = mapped_column(Numeric(9, 6), nullable=True)
    lng: Mapped[float | None] = mapped_column(Numeric(9, 6), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)

    owner: Mapped["User"] = relationship(
        "User",
        back_populates="restaurants",
        foreign_keys=[company_id],
        passive_deletes=True,
    )

    categories: Mapped[list["Categories"]] = relationship(
        back_populates="restaurant",
        cascade="all, delete-orphan",
        single_parent=True,
        passive_deletes=True,
    )

    ingredients: Mapped[list["Ingredients"]] = relationship(
        back_populates="restaurant",
        cascade="all, delete-orphan",
        single_parent=True,
        passive_deletes=True,
    )

    dishes: Mapped[list["Dishes"]] = relationship(
        back_populates="restaurant",
        cascade="all, delete-orphan",
        single_parent=True,
        passive_deletes=True,
    )

    __table_args__ = (
        Index("ix_restaurant_company_name", "company_id", "name"),
    )

    def __repr__(self):
        return f"Restaurant {self.name}"

    def serialize(self):
        return {
            "id": self.id,
            "company_id": self.company_id,
            "name": self.name,
            "telefono": self.telefono,
            "direccion": self.direccion,
            "lat": float(self.lat) if self.lat is not None else None,
            "lng": float(self.lng) if self.lng is not None else None,
            "is_active": self.is_active,
        }


class Categories(db.Model):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    restaurant_id: Mapped[int] = mapped_column(
        ForeignKey('restaurant.id', ondelete='CASCADE'), 
        nullable=False, 
        index=True
        )
    name: Mapped[str] = mapped_column(String(90), nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)

    __table_args__ = (
        UniqueConstraint("restaurant_id", "name", name="uq_category_restaurant_name"),
        Index("ix_category_restaurant_name", "restaurant_id", "name")
    )

    restaurant: Mapped['Restaurant'] = relationship(
        back_populates='categories',
        passive_deletes=True
        )
    dishes: Mapped[list['Dishes']] = relationship(
        back_populates='category', 
        cascade='all, delete-orphan', 
        single_parent=True,
        passive_deletes=True
        )

    def __repr__(self):
        return f'Category {self.name}'

    def serialize(self):
        return {
            "id": self.id, 
            "restaurant_id": self.restaurant_id, 
            "name": self.name, 
            "image_url": self.image_url, 
            "is_active": self.is_active
            }


class Ingredients(db.Model):
    __tablename__ = 'ingredients'

    id: Mapped[int] = mapped_column(primary_key=True)
    id_product_api: Mapped[int] = mapped_column(Integer, unique=True, nullable=True)

    restaurant_id: Mapped[int] = mapped_column(
        ForeignKey('restaurant.id', ondelete='CASCADE'), 
        nullable=False, 
        index=True
        )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    unit: Mapped[str] = mapped_column(String(20), nullable=False)

    price_per_unit: Mapped[Numeric] = mapped_column(Numeric(10, 2), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    __table_args__ = (
        UniqueConstraint("restaurant_id", "name", name="uq_ingredient_restaurant_name"),
        CheckConstraint("price_per_unit >= 0", name="ck_ingredient_price_nonnegative"),
        CheckConstraint("unit IN ('g','kg','ml','l','ud')", name="ck_ingredient_unit_valid"),
        Index("ix_ingredient_restaurant_name", "restaurant_id", "name")
    )

    restaurant: Mapped['Restaurant'] = relationship(
        back_populates='ingredients',
        passive_deletes=True
        )
    dish_ingredients: Mapped[list['DishIngredient']] = relationship(
        back_populates='ingredient', 
        cascade='all, delete-orphan', 
        single_parent=True,
        passive_deletes=True
        )
    
    @hybrid_property
    def price_per_base_unit(self) -> float:
        return _to_base_unit_price(self.unit, float(self.price_per_unit or 0))

    @price_per_base_unit.expression
    def price_per_base_unit(cls):
        return case(
            (cls.unit.in_(["kg", "l"]), cls.price_per_unit / 1000.0),
            else_=cls.price_per_unit
        )


    def __repr__(self) -> str:
        return f"Ingredient<{self.id}:{self.name} ({self.unit})>"

    def serialize(self):
        return {
            "id": self.id, 
            "restaurant_id": self.restaurant_id, 
            "name": self.name, 
            "unit": self.unit, 
            "price_per_unit": float(self.price_per_unit or 0),
            "price_per_base_unit": float(self.price_per_base_unit or 0),
            "image_url": self.image_url, 
            "is_active": self.is_active
            }


class Dishes(db.Model):
    __tablename__= 'dishes'

    id: Mapped[int] = mapped_column(primary_key=True)
    restaurant_id: Mapped[int] = mapped_column(
        ForeignKey("restaurant.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
        )
    
    category_id: Mapped[int] = mapped_column(
        ForeignKey('categories.id', ondelete='CASCADE'), 
        nullable=False, 
        index=True
        )
    
    name: Mapped[str] = mapped_column(String(90), nullable=False)
    description: Mapped[str] = mapped_column(String(300), nullable=True)
    cost_price: Mapped[Optional[Numeric]] = mapped_column(
        Numeric(10, 2), 
        nullable=True
        )
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)

    __table_args__ = (
        UniqueConstraint("category_id", "name", name="uq_dish_category_name"),
        Index("ix_dish_category_name", "category_id", "name"),
        Index("ix_dish_restaurant", "restaurant_id")

    )
    restaurant: Mapped["Restaurant"] = relationship(
        back_populates="dishes"
        )
    category: Mapped['Categories'] = relationship(
        back_populates='dishes',
        passive_deletes=True
        )
    ingredients: Mapped[list['DishIngredient']] = relationship(
        back_populates='dish', 
        cascade='all, delete-orphan', 
        single_parent=True,
        passive_deletes=True
        )

    @hybrid_property    
    def total_cost(self) -> float:
        return sum(
            (di.ingredient_cost or 0.0)
            for di in self.ingredients
            )
    @total_cost.expression
    def total_cost(cls):
        """
        SUM(
          price_base * (gross_weight * (1 - decrease_pct))
        )
        con price_base = COALESCE(unit_price_snapshot, normalize(Ingredients.price_per_unit))
        y normalize: divide entre 1000 si unidad es kg o l
        """
        DI = DishIngredient
        ING = Ingredients

        # used_qty = gross_weight * (1 - decrease_pct)
        used_qty_sql = DI.gross_weight * (1 - (DI.decrease_pct / 100.0))

        # CASE para normalizar precio por unidad a base (g/ml/ud)
        normalized_price_sql = case(
            (ING.unit.in_(["kg", "l"]), ING.price_per_unit / 1000.0),
            else_=ING.price_per_unit
        )

        price_base_sql = func.coalesce(DI.unit_price_snapshot, normalized_price_sql)

        return (
            select(func.coalesce(func.sum(price_base_sql * used_qty_sql), 0.0))
            .select_from(DI)
            .join(ING, ING.id == DI.ingredient_id)
            .where(DI.dish_id == cls.id)
            .correlate(cls)
            .scalar_subquery()
        )

    def __repr__(self) -> str:
        return f"Dish<{self.id}:{self.name}>"


    def serialize(self, include_cost: bool = True):
        data = {
            "id": self.id,
            "restaurant_id": self.restaurant_id, 
            "category_id": self.category_id, 
            "name": self.name, 
            "description": self.description, 
            "cost_price": float(self.cost_price or 0) 
                if self.cost_price is not None else None, 
            "image_url": self.image_url, 
            "is_active": self.is_active
            }
        
        if include_cost:
            data['total_cost'] = float(self.total_cost or 0)
        return data


class DishIngredient(db.Model):
    __tablename__= 'dish_ingredient'

    id: Mapped[int] = mapped_column(primary_key=True)
    dish_id: Mapped[int] = mapped_column(
        ForeignKey('dishes.id', ondelete="CASCADE"), 
        nullable=False, 
        index=True
        )
    
    ingredient_id: Mapped[int] = mapped_column(
        ForeignKey('ingredients.id', ondelete="RESTRICT"), 
        nullable=False, 
        index=True
        )

    gross_weight: Mapped[Numeric] = mapped_column(
        Numeric(10, 4), 
        nullable=False
        )

    decrease_pct: Mapped[Numeric] = mapped_column(
        Numeric(5, 4), 
        nullable=False, 
        default=0
        )

    unit_price_snapshot: Mapped[Optional[Numeric]] = mapped_column(Numeric(10, 4), nullable=True)

    __table_args__ = ( 
        CheckConstraint("gross_weight >= 0", name="ck_di_weight_nonnegative"),
        CheckConstraint("decrease_pct >= 0 AND decrease_pct <= 100", name="ck_di_decrease_range"),
        UniqueConstraint("dish_id", "ingredient_id", name="uq_di_dish_ingredient"),  
        Index("ix_di_dish_ing", "dish_id", "ingredient_id")
        )
            

    dish: Mapped['Dishes'] = relationship(
        back_populates='ingredients',
        passive_deletes=True
        )
    
    ingredient: Mapped['Ingredients'] = relationship(
        back_populates="dish_ingredients",
        passive_deletes=True
        )

    @hybrid_property
    def used_qty(self) -> float:
        gw = float(self.gross_weight or 0)
        dec = float(self.decrease_pct or 0)  

        return gw * (1 - dec / 100.0)

    @used_qty.expression
    def used_qty(cls):
        return cls.gross_weight * (1 - (cls.decrease_pct / 100.0))


    @hybrid_property
    def price_per_base_unit(self) -> float:
        if self.unit_price_snapshot is not None:
            return float(self.unit_price_snapshot or 0)
        return _to_base_unit_price(self.ingredient.unit, float(self.ingredient.price_per_unit or 0))

    @price_per_base_unit.expression
    def price_per_base_unit(cls):
        ING = Ingredients
        normalized_price_sql = case(
            (ING.unit.in_(["kg", "l"]), ING.price_per_unit / 1000.0),
            else_=ING.price_per_unit
        )
        return func.coalesce(cls.unit_price_snapshot, normalized_price_sql)

    # --- Hybrid: coste de la línea ---
    @hybrid_property
    def ingredient_cost(self) -> float:
        return float(self.used_qty or 0) * float(self.price_per_base_unit or 0)

    @ingredient_cost.expression
    def ingredient_cost(cls):
        return cls.used_qty * cls.price_per_base_unit  # usa las .expression de arriba


    def __repr__(self) -> str:
        return f"DI<{self.id}: dish={self.dish_id}, ing={self.ingredient_id}>"


    def serialize(self, include_cost: bool = True):
        data = {
            "id": self.id,
            "dish_id": self.dish_id,
            "ingredient_id": self.ingredient_id,
            "ingredient_name": self.ingredient.name if self.ingredient else None,
            "ingredient_unit": self.ingredient.unit if self.ingredient else None,
            "ingredient_price_per_unit": float(self.ingredient.price_per_unit or 0) if self.ingredient else None,
            "ingredient_price_per_base_unit": float(self.ingredient.price_per_base_unit or 0) if self.ingredient else None,
            "gross_weight": float(self.gross_weight or 0),
            "decrease_pct": float(self.decrease_pct or 0),
            "unit_price_snapshot": float(self.unit_price_snapshot) if self.unit_price_snapshot is not None else None
        }
        if include_cost:
            data["used_qty"] = float(self.used_qty or 0)
            data["ingredient_cost"] = float(self.ingredient_cost or 0)
        return data
