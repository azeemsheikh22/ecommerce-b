const express = require("express");
const cors = require("cors");
const user = require("./db/user");
const Product = require("./db/product");
const Otherf = require("./db/otherfields");
const Cart = require("./db/carts");
const bcrypt = require("bcryptjs");
const cookeparser = require("cookie-parser");
const authentication = require("./middlewere/authentication");
const dotenv = require("dotenv");

// require("./db/config");
dotenv.config({ path: "./config.env" });
require("./connection/connect");
const PORT = process.env.PORT;

const app = express();
app.use(cookeparser());
app.use(express.json());
app.use(cors());

//  img process
const multer = require("multer");
const path = require("path");
const product = require("./db/product");

app.use("/", express.static("image"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "image/img");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
});

app.post("/upload", upload.single("file"), (req, res) => {
  console.log(req.file);
});

app.post("/sign", async (req, res) => {
  const { name, email, password, cpassword } = req.body;
  if (name && email && password && cpassword) {
    try {
      const userexist = await user.findOne({ email: email });
      if (userexist) {
        res.send("Email Already Exist");
      } else if (password === cpassword) {
        let users = new user({ name, email, password, cpassword });

        let result = await users.save();
        if (result) {
          res.send("Data Add SuccesFully");
        }
      } else {
        res.send("Password Not Match");
      }
    } catch (error) {
      res.send("error");
    }
  }
});

app.post("/login", async (req, res) => {
  // console.log("login")
  const { email, password } = req.body;
  if (!email || !password) {
    res.send("please fill input");
  }

  try {
    const uservalid = await user.findOne({ email: email });
    if (uservalid) {
      const match = await bcrypt.compare(password, uservalid.password);

      if (!match) {
        res.send("Invalid Details");
      } else {
        // res.send(uservalid);
        const token = await uservalid.generateAuthtoken();
        // console.log(token)
        res.cookie("usercooke", token, {
          expires: new Date(Date.now() + 9000000),
          httpOnly: true,
        });
        const result = {
          uservalid,
          token,
        };
        res.send(result);
      }
    } else if (!uservalid) {
      res.send("Invalid Details");
    }
  } catch (error) {
    res.send("error");
    console.log(error);
  }
});

// user valid
app.get("/validuser", authentication, async (req, res) => {
  console.log("done");
  const verifytoken = req.verifytoken;
  res.send(verifytoken);
});

// ADD PRODUCT API

app.post(
  "/add-product",
  authentication,
  upload.single("file"),
  async (req, res) => {
    try {
      if (req.verifytoken._id) {
        const file = req.file.filename;
        const { title, price, category } = req.body;
        res.send("verify");

        if (title && file && price && category) {
          let product = new Product({
            title,
            price,
            category,
            file,
          });
          let result = await product.save();
          // console.log(result);
          res.send("data add done");
        } else {
          res.send("fill input");
        }
      } else {
        res.send("not verify");
      }
    } catch (error) {
      console.log("erroradd");
    }
  }
);

app.get("/products", async (req, res) => {
  Product.find()
    .then((user) => res.json(user))
    .catch((err) => res.json(err));
});

// category product API

app.get("/headcg", async (req, res) => {
  Product.find({ category: "headphone" })
    .then((data) => res.json(data))
    .catch((err) => res.json(err));
});

app.get("/watchcg", async (req, res) => {
  Product.find({ category: "watch" })
    .then((data) => res.json(data))
    .catch((err) => res.json(err));
});
app.get("/speaker", async (req, res) => {
  Product.find({ category: "speaker" })
    .then((data) => res.json(data))
    .catch((err) => res.json(err));
});
app.get("/earbud", async (req, res) => {
  Product.find({ category: "earbud" })
    .then((data) => res.json(data))
    .catch((err) => res.json(err));
});

// product delete API

app.delete("/products/:id", async (req, res) => {
  const result = await Product.deleteOne({ _id: req.params.id });
  if (result) {
    res.send(result);
  } else {
    console.warn("Product Not Found");
  }
});

app.get("/product/:id", async (req, res) => {
  try {
    const result = await Product.findOne({ _id: req.params.id });
    if (result) {
      res.send(result);
    } else {
      console.warn("Product Not Found");
    }
  } catch (err) {
    res.status(404).json({ message: "Product not Found" });
  }
});

// get update product api

app.get("/update-product/:id", async (req, res) => {
  try {
    const result = await Product.findOne({ _id: req.params.id });
    if (result._id) {
      res.send(result);
      // console.log(result);
    } else {
      res.send("product not found");
    }
  } catch (error) {
    // console.log();
    res.send("product not found");
  }
});

// update product API

app.put("/update-products/:id", upload.single("file"), async (req, res) => {
  console.log(req.file);
  if (req.file) {
    const result = await Product.updateOne(
      { _id: req.params.id },
      {
        $set: {
          title: req.body.title,
          price: req.body.price,
          category: req.body.category,
          file: req.file.filename,
        },
      }
    );

    res.send(result);
  } else {
    const result = await Product.updateOne(
      { _id: req.params.id },
      {
        $set: {
          title: req.body.title,
          price: req.body.price,
          category: req.body.category,
          // file: req.file.filename,
        },
      }
    );
    res.send(result);
  }
});

// search product

app.get("/search/:key", async (req, res) => {
  const result = await Product.find({
    $or: [{ title: { $regex: req.params.key } }],
    // $or: [{ category: { $regex: req.params.key } }],
  });
  res.send(result);
});

// product add to cart

app.get("/cart-product/:id", async (req, res) => {
  try {
    const result = await Product.findOne({ _id: req.params.id });
    if (result._id) {
      res.send(result);
      // console.log(result);
    } else {
      res.send("product not found");
    }
  } catch (error) {
    // console.log();
    res.send("product not found");
  }
});

app.post("/cart-product", upload.single("file"), async (req, res) => {
  console.log(req.body);
  // const file = req.file.filename;
  // const { title, price, category } = req.body;

  // if (title && price && category) {
  //   let product = new Cart({
  //     title,
  //     price,
  //     category,
  //     // file,
  //   });
  //   let result = await product.save();
  //   console.log(result);
  //   res.send("data add done");
  // } else {
  //   res.send("fill input");
  // }
});

// Other fields

app.post("/otherf", async (req, res) => {
  const { username, email, message } = req.body;
  const other = new Otherf({ username, email, message });
  const result = await other.save();
  res.send(result);
  console.log(result)
});

app.get("/contact", async (req, res) =>{
  Otherf.find().then((resp) => res.send(resp))
})

app.listen(PORT);
