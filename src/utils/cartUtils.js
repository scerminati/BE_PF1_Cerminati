import cartsModel from "../models/carts.model.js";
import productsModel from "../models/products.model.js";

export async function getNextId() {
  try {
    const lastProduct = await productsModel.findOne(
      {},
      {},
      { sort: { id: -1 } }
    );
    return lastProduct ? lastProduct.id + 1 : 1;
  } catch (error) {
    console.error("Error al obtener el siguiente ID:", error);
    throw error;
  }
}

export async function getNextIdC() {
  try {
    const lastCart = await cartsModel.findOne({}, {}, { sort: { id: -1 } });
    return lastCart ? lastCart.id + 1 : 1;
  } catch (error) {
    console.error("Error al obtener el siguiente ID:", error);
    throw error;
  }
}

export const populateCarrito = async (carrito) => {
  return await carrito.populate({
    path: "products.product",
    select: "title price stock",
  });
};

export const emitCarrito = async (carrito) => {
  let carritoEncontrado = await populateCarrito(carrito);
  carritoEncontrado = {
    ...carritoEncontrado.toObject(),
    products: carritoEncontrado.products.map((product) => ({
      ...product.toObject(),
      quantity: product.quantity,
    })),
  };
  return carritoEncontrado;
};
