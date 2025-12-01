# src/api/routes/openfood.py
from flask import Blueprint, jsonify, request
import requests

OPENFOOD_BASE_URL = "https://world.openfoodfacts.org"

openfood_bp = Blueprint("openfood_bp", __name__)


def _normalize_allergen_tag(tag: str) -> str | None:
    """
    Convierte cosas tipo 'en:milk' o 'es:frutos-secos'
    en etiquetas humanas: 'milk', 'frutos secos'.
    """
    if not tag:
        return None
    if ":" in tag:
        tag = tag.split(":", 1)[1]
    tag = tag.replace("-", " ").strip()
    return tag or None


def _extract_allergen_info(product: dict) -> tuple[str, list[str], list[str]]:
    """
    Devuelve:
      - texto libre de alérgenos (si lo hubiera)
      - tags crudos de OFF (allergens_tags / hierarchy)
      - tags normalizados (solo el nombre, sin 'en:' etc.)
    """
    allergens_text = (
        product.get("allergens_from_ingredients")
        or product.get("allergens")
        or ""
    )

    raw_tags = (
        product.get("allergens_hierarchy")
        or product.get("allergens_tags")
        or []
    )

    normalized = []
    for t in raw_tags:
        norm = _normalize_allergen_tag(t)
        if norm:
            normalized.append(norm)

    return allergens_text, raw_tags, normalized


@openfood_bp.route("/openfood/search", methods=["GET"])
def openfood_search():
    """
    GET /api/openfood/search?q=leche

    Busca productos en OpenFoodFacts y devuelve
    una lista simplificada con posibles alérgenos.
    """
    query = (request.args.get("q") or "").strip()
    if not query:
        return jsonify({"msg": "El parámetro 'q' es obligatorio"}), 400

    try:
        resp = requests.get(
            f"{OPENFOOD_BASE_URL}/cgi/search.pl",
            params={
                "search_terms": query,
                "search_simple": 1,
                "action": "process",
                "json": 1,
                "page_size": 8,
            },
            timeout=5,
        )
    except requests.RequestException as exc:
        return jsonify(
            {
                "msg": "Error al contactar con OpenFoodFacts",
                "error": str(exc),
            }
        ), 502

    if not resp.ok:
        return jsonify(
            {
                "msg": "OpenFoodFacts devolvió un error",
                "status_code": resp.status_code,
            }
        ), 502

    data = resp.json()
    products = data.get("products") or []

    results = []
    for p in products:
        allergens_text, raw_tags, normalized = _extract_allergen_info(p)
        results.append(
            {
                "code": p.get("code"),
                "name": (
                    p.get("product_name_es")
                    or p.get("product_name")
                    or p.get("generic_name")
                    or ""
                ),
                "brand": p.get("brands") or "",
                "allergens": allergens_text,      # texto libre (si lo hay)
                "allergen_tags": raw_tags,        # crudos de OFF
                "allergen_labels": normalized,    # limpio tipo ['gluten', 'milk']
            }
        )

    return jsonify({"results": results, "count": len(results)}), 200


@openfood_bp.route("/openfood/barcode/<code>", methods=["GET"])
def openfood_by_barcode(code):
    """
    GET /api/openfood/barcode/1234567890123

    Opcional, por si quieres buscar un producto concreto
    a mano por código de barras (aunque no uses lector físico).
    """
    code = (code or "").strip()
    if not code:
        return jsonify({"msg": "Debes indicar un código de barras"}), 400

    try:
        resp = requests.get(
            f"{OPENFOOD_BASE_URL}/api/v2/product/{code}",
            params={"fields": "code,product_name_es,product_name,generic_name,brands,allergens,allergens_tags,allergens_hierarchy,allergens_from_ingredients"},
            headers={"User-Agent": "setameal/0.1 (bootcamp project)"},
            timeout=5,
)

    except requests.RequestException as exc:
        return jsonify(
            {
                "msg": "Error al contactar con OpenFoodFacts",
                "error": str(exc),
            }
        ), 502

    if not resp.ok:
        return jsonify(
            {
                "msg": "OpenFoodFacts devolvió un error",
                "status_code": resp.status_code,
            }
        ), 502

    data = resp.json()
    product = data.get("product")
    if not product:
        return jsonify({"msg": "Producto no encontrado"}), 404

    allergens_text, raw_tags, normalized = _extract_allergen_info(product)

    result = {
        "code": product.get("code"),
        "name": (
            product.get("product_name_es")
            or product.get("product_name")
            or product.get("generic_name")
            or ""
        ),
        "brand": product.get("brands") or "",
        "allergens": allergens_text,
        "allergen_tags": raw_tags,
        "allergen_labels": normalized,
    }

    return jsonify({"product": result}), 200
