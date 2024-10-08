import { getProducts, getProduct } from '../services/api.js';
import { createOrder, retrieveOrder } from '../services/klarna.js';
import express from 'express';
const app = express();
import { config } from 'dotenv';
config();

app.get('/', async (req, res) => {
	try {
	  const products = await getProducts();
  
	  // Genera el markup para todos los productos
	  const productsMarkup = products
		.map(
		  (p) =>
			`<div style="display: flex; flex-direction: column; align-items: center; width: 60%; margin: 20px auto; border: solid 2px black; padding: 7px; font-family: 'serif', Georgia;">
			  <img src="${p.image}" alt="${p.title}" style="max-width: 10%; margin-bottom: 10px;">
			  <a style="display: block; color: black; text-align: center;" href="/products/${p.id}">
				${p.title} - ${p.price} kr
			  </a>
			</div>`
		)
		.join('');
  
	  // Agrega el título una sola vez al principio del markup
	  const fullMarkup = `
		<div style="background-color: #FCFCFC; padding: 20px;">
				<div style="text-align: center; margin-top: 10px;">
					<h1 style="font-size: 32px; color: #000000; font-family: 'serif', Georgia;">Available Products To Buy</h1>
				</div>
				<div>${productsMarkup}</div>
			</div>
	  `;
  
	  res.send(fullMarkup);
	} catch (error) {
	  // Manejo de errores
	  res.status(500).send('Error al obtener los productos.');
	}
  });
  
app.get('/products/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const product = await getProduct(id);
		const klarnaResponse = await createOrder(product);
		const markup = klarnaResponse.html_snippet;
		res.send(markup);
	} catch (error) {
		res.send(error.message);
	}
});

app.get('/confirmation', async (req, res) => {
	const { order_id } = req.query;
	const klarnaResponse = await retrieveOrder(order_id);
	const { html_snippet } = klarnaResponse;
	res.send(html_snippet);
});

app.listen(process.env.PORT);