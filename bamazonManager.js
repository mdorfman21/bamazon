const mysql = require("mysql");
const inquirer = require("inquirer");

let connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon"
});

connection.connect(err => {
  if (err) throw err;
  start();
});

function start() {
  connection.query("SELECT * FROM products", (err, res) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "choice",
          type: "list",
          choices: [
            "View Products for Sale",
            "View Low Inventory",
            "Add to Inventory",
            "Add New Product"
          ],
          message: "What would you like to do?"
        }
      ])
      .then(ans => {
        console.log(ans.choice);
        switch (ans.choice) {
          case "View Products for Sale":
            viewProducts();
            break;
          case "View Low Inventory":
            lowInventory();
            break;
          case "Add to Inventory":
            addInventory();
            break;
          case "Add New Product":
            newProduct();
            break;
        }
      });
  });
}

function viewProducts() {
  connection.query("SELECT * FROM products", (err, res) => {
    if (err) throw err;
    res.forEach(product => {
      console.log("=======");
      console.log(
        `ID: ${product.item_id}, Name: ${product.product_name}, Price: $${
          product.price
        }, Quantity ${product.stock_quantity}`
      );
    });
  });
  start();
}

function lowInventory() {
  connection.query(
    `SELECT * FROM products WHERE stock_quantity <= "${5}"`,
    (err, res) => {
      if (err) throw err;
      console.log("The below items are low on stock");
      console.log("===========================");
      res.forEach(product => {
        console.log(
          `Product Name: ${product.product_name}, ID: ${
            product.item_id
          }, Stock Quantity: ${product.stock_quantity}`
        );
        console.log("===========================");
      });
    }
  );
  start();
}

function addInventory() {
  inquirer
    .prompt([
      {
        name: "productID",
        type: "input",
        message: "Please enter the product ID to change the stock"
      },
      {
        name: "quantityChange",
        type: "input",
        message: "How much stock do you want to add?"
      }
    ])
    .then(ans => {
      let selectedItem = ans.productID;
      let increaseQuantity = parseInt(ans.quantityChange);
      //   connection.query(
      //     `SELECT * FROM products WHERE item_id="${selectedItem}"`,
      //     (err, res) => {
      //       if (err) throw err;
      //       let currentQuantity = res.stock_quantity;
      //       console.log(currentQuantity);
      //       return currentQuantity;
      //     }
      //   );

      console.log(selectedItem, increaseQuantity);
      connection.query(
        `UPDATE products SET ? WHERE ?`,
        [
          {
            stock_quantity: increaseQuantity
          },
          {
            item_id: selectedItem
          }
        ],
        err => {
          if (err) throw err;
          console.log("stock quantity increased");
        }
      );
      start();
    });
}

function newProduct() {
  inquirer
    .prompt([
      {
        name: "productName",
        type: "input",
        message: "Please enter the name of the product"
      },
      {
        name: "departmentName",
        type: "input",
        message: "Please enter the department name"
      },
      {
        name: "price",
        type: "input",
        message: "Please enter the integer of the price"
      },
      {
        name: "stock",
        type: "input",
        message: "Please enter the integer of stock quantity"
      }
    ])
    .then(ans => {
      let productName = ans.productName;
      let departmentName = ans.departmentName;
      let price = parseInt(ans.price);
      let stock = parseInt(ans.stock);
      connection.query(
        "INSERT INTO products SET ?",
        {
          product_name: productName,
          department_name: departmentName,
          price: price,
          stock_quantity: stock
        },
        err => {
          if (err) throw err;
          console.log("Product created!");
          start();
        }
      );
    });
}
