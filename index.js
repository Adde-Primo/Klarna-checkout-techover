import { getProducts, getProduct } from './services/api.js';
import { createOrder, retrieveOrder } from './services/klarna.js';
import express from 'express';
const app = express();
import { config } from 'dotenv';
config();

app.get('/', async (req, res) => {
	const products = await getProducts();
	const markup = products
		.map(
			(p) =>
				`<div style="display: flex; flex-direction: column; align-items: center; width: 60%; margin: 20px auto; border: solid 2px black; padding: 7px;">
					<img src="${p.image}" alt="${p.title}" style="max-width: 10%; margin-bottom: 10px;">
					<a style="display: block; color: black; text-align: center;" href="/products/${p.id}">
						${p.title} - ${p.price} kr
					</a>
				</div>`
		)
		.join('');
	res.send(`<div>${markup}</div>`);
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