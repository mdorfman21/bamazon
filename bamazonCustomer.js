var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon"
});

connection.connect(err => {
  if (err) throw err;
  console.log("Welcome to Bamazon!!");
  showItems();
  start();
});

function start() {
  connection.query("SELECT * FROM products", (err, res) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "choice",
          type: "input",
          message: "Please enter the item ID for the item would you like to buy"
        },
        {
          name: "quantity",
          type: "input",
          message: "How many do you want to purhcase?"
        }
      ])
      .then(answer => {
        checkQuantity(answer);
      });
  });
}

function showItems() {
  connection.query("SELECT * FROM products", (err, res) => {
    if (err) throw err;
    res.forEach(product => {
      console.log(`===========================================`);
      console.log(
        `ID: ${product.item_id}, Name: ${product.product_name}, Price: $${
          product.price
        }`
      );
      console.log(`===========================================`);
    });
  });
  console.log(`check out these items`);
}

function checkQuantity(res) {
  var itemID = res.choice;
  var requestedQuantity = parseInt(res.quantity);

  connection.query(
    `SELECT stock_quantity, price FROM products WHERE item_id= "${itemID}"`,
    (err, res) => {
      if (err) throw err;
      var currentStock = res[0].stock_quantity;
      var price = res[0].price;
      if (requestedQuantity > currentStock) {
        console.log("Insufficient Inventory!");
        start();
      } else {
        purchaseItem(itemID, requestedQuantity, currentStock, price);
      }
    }
  );
}

function purchaseItem(item, quantity, current, price) {
  connection.query(
    `UPDATE products SET ? WHERE ?`,
    [
      {
        stock_quantity: current - quantity
      },
      {
        item_id: item
      }
    ],
    console.log(`Your total cost is $${price * quantity}`),
    (err, res) => {
      if (err) throw err;
    }
  );
  start();
}
