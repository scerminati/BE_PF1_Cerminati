import mongoose from "mongoose";

const productsCollection = "products";

const productsSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  code: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: Boolean },
  stock: { type: Number, required: true },
  category: { type: String, required: true },
  thumbnail: { type: String },
});

const productsModel = mongoose.model(productsCollection, productsSchema);

export default productsModel;
