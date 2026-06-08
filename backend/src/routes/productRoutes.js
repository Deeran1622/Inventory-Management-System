// backend/src/routes/productRoutes.js
// ------------------------------------------------------------
// IMPORTANT: /low-stock must be registered BEFORE /:id
// otherwise Express will treat "low-stock" as an ID parameter.
// ------------------------------------------------------------

const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/productController");

router.get("/low-stock", controller.getLowStock); // GET /api/products/low-stock
router.get("/",          controller.getAll);       // GET /api/products
router.get("/:id",       controller.getOne);       // GET /api/products/:id
router.post("/",         controller.create);       // POST /api/products
router.put("/:id",       controller.update);       // PUT /api/products/:id
router.delete("/:id",    controller.remove);       // DELETE /api/products/:id

module.exports = router;