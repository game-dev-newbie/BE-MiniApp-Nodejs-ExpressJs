import models from "../../models/index.js";

const { Restaurant } = models;

async function getTime() {
  const restaurant = await Restaurant.findByPk(1);
  const time = restaurant.created_at;
  const date = new Date();
  console.log(typeof time);
}

getTime();
