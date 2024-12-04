const express = require('express');
const bodyParser = require('body-parser');
const cron = require('node-cron');

const app = express();
app.use(bodyParser.json());

let menu = [];
let orders = [];
let orderIdCounter = 1;

// Add menu item
app.post('/menu', (req, res) => {
    const { name, price, category } = req.body;
    if (!name || price <= 0 || !["Main Course", "Dessert", "Drink"].includes(category)) {
        return res.status(400).send({ error: 'Invalid menu item data.' });
    }
    const item = { id: menu.length + 1, name, price, category };
    menu.push(item);
    res.status(201).send(item);
});

// Get menu
app.get('/menu', (req, res) => {
    res.send(menu);
});

// Place an order
app.post('/orders', (req, res) => {
    const { items } = req.body;
    if (!items || !items.every(id => menu.some(item => item.id === id))) {
        return res.status(400).send({ error: 'Invalid item IDs.' });
    }
    const order = { id: orderIdCounter++, items, status: 'Preparing', timestamp: new Date() };
    orders.push(order);
    res.status(201).send(order);
});

// Get order
app.get('/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === parseInt(req.params.id));
    if (!order) {
        return res.status(404).send({ error: 'Order not found.' });
    }
    res.send(order);
});

// Status update simulation
cron.schedule('*/1 * * * *', () => {
    orders.forEach(order => {
        if (order.status === 'Preparing') order.status = 'Out for Delivery';
        else if (order.status === 'Out for Delivery') order.status = 'Delivered';
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
