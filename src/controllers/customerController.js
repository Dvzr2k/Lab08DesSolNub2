import { pool } from "../db.js";
import multer from "multer";
import path from "path";
import { dirname } from 'path';
import { fileURLToPath } from "url";
import AWS from 'aws-sdk';
import multerS3 from 'multer-s3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configura las credenciales de AWS
AWS.config.update({
  accessKeyId: 'AKIAVCTNZQITY3YMPN4T',
  secretAccessKey: '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',
  region: 'us-east-2',
});

// Crea una instancia del servicio S3
const s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3,
    bucket: 'valdezbucket',
    acl: 'public-read', // Establece los permisos adecuados para los objetos cargados
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
      cb(null, filename);
    },
  }),
});

export const renderCustomers = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM product");
  res.render("customers", { customers: rows });
};

export const createCustomers = async (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error al cargar la imagen");
    }

    const { name, price, stock, description, brand } = req.body;
    const image = req.file ? req.file.location : ""; // Obtén la URL del objeto S3

    const newCustomer = {
      name,
      price,
      stock,
      description,
      brand,
      image,
    };

    await pool.query("INSERT INTO product SET ?", [newCustomer]);

    res.redirect("/");
  });
};

export const editCustomer = async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.query("SELECT * FROM product  WHERE id = ?", [id]);
  res.render("customers_edit", { customer: result[0] });
};

export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { name, price, stock, description, brand } = req.body;
  const image = req.file ? req.file.location : ""; // Obtén la URL del objeto S3

  const updatedCustomer = {
    name,
    price,
    stock,
    description,
    brand,
    image,
  };

  await pool.query("UPDATE product SET ? WHERE id = ?", [updatedCustomer, id]);

  res.redirect("/");
};

export const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  const result = await pool.query("DELETE FROM product WHERE id = ?", [id]);
  if (result.affectedRows === 1) {
    res.json({ message: "Product deleted" });
  }
  res.redirect("/");
};
