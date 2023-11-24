const User = require('../models/userModel')
const Product = require('../models/productModel')

const loadCart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    console.log(userId);
    const user = await User.findById(userId).populate('cart.product');

    if (!user) {
      return res.status(404).render('cart', { cart: [], grandTotal: 'N/A' });
    }

    const grandTotal = calculateGrandTotal(user.cart);

    res.render('cart', { cart: user.cart, user: user, grandTotal: grandTotal.toFixed(2) });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal server error');
  }
};

function calculateGrandTotal(cart) {
  let grandTotal = 0;
  for (const item of cart) {
    const subtotalValue = parseFloat(item.product.salePrice) * parseFloat(item.quantity);
    grandTotal += subtotalValue;
  }
  return grandTotal;
}


const addToCart = async (req, res) => {
  try {
    console.log(req.session.user_id)
    const userId = req.session.user_id;
    const productId = req.body.id;
    const quantity = req.body.quantity || 1;

    const user = await User.findById(userId).populate('cart.product')

    if (user.cart === undefined) {
      user.cart = [];
    }
    console.log(user.cart);

    const product = await Product.findById(productId);
    console.log(product._id)

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    const existingCartItem = user.cart.find(item => item.product._id.toString() == product._id.toString());
    console.log('exist', existingCartItem)

    if (existingCartItem && existingCartItem.quantity < product.quantity) {
      existingCartItem.quantity += quantity;
    } else if (existingCartItem && existingCartItem.quantity === product.quantity) {
      console.log('insufficient stock')
    } else {
      user.cart.push({ product: productId, quantity });
    }

    await user.save();

    const grandTotal = calculateGrandTotal(user.cart);
    res.redirect('/cart')
    //res.render('cart', { cart: user.cart, user: userId, grandTotal: grandTotal.toFixed(2) });

  } catch (error) {
    console.log(error);
    console.log('haii');
    console.log(error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};




const updateCartt = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const { action, itemId } = req.query;
    const user = await User.findById(userId).populate('cart.product');

    if (action === 'increment' || action === 'decrement') {
      const cartItem = user.cart.find((item) => item.product.equals(itemId));

      if (!cartItem) {
        return res.status(404).json({ error: 'Item not found in cart' });
      }

      const prod = await Product.findById(itemId);

      if (!prod) {
        console.log(`Product not found for itemId: ${itemId}`);
        return res.status(404).json({ error: 'Product not found' });
      }

      console.log('CartItem:', cartItem);

      if (action === 'increment') {
        if (prod.quantity <= cartItem.quantity) {
          console.log('Cannot increment. Insufficient stock.');
          const errorMessage = 'Insufficient stock. Cannot increment quantity.';
          const grandTotal = calculateGrandTotal(user.cart);
          const updatedCartData = {
            itemId: cartItem.product._id,
            quantity: cartItem.quantity,
            price: cartItem.product.salePrice,
            subtotal: cartItem.quantity * prod.salePrice,
            grandTotal: grandTotal.toFixed(2),
          };
          return res.status(200).json({ error: errorMessage, ...updatedCartData });
        } else {
          cartItem.quantity += 1;
        }
      } else {
        if (cartItem.quantity > 1) {
          cartItem.quantity -= 1;
        } else {
          const errorMessage = 'Minimum quantity reached. Cannot decrement further.';
          const grandTotal = calculateGrandTotal(user.cart);
          const updatedCartData = {
            itemId: cartItem.product._id,
            quantity: cartItem.quantity,
            price: cartItem.product.salePrice,
            subtotal: cartItem.quantity * prod.salePrice,
            grandTotal: grandTotal.toFixed(2),
          };
          return res.status(200).json({ minerror: errorMessage, ...updatedCartData });
        }
      }

      await user.save();

      const subtotal = cartItem.quantity * prod.salePrice;
      console.log("SUBTOTAL", subtotal);

      const grandTotal = calculateGrandTotal(user.cart);

      const updatedCartData = {
        itemId: cartItem.product._id,
        quantity: cartItem.quantity,
        price: cartItem.product.salePrice,
        subtotal: subtotal.toFixed(2),
        grandTotal: grandTotal.toFixed(2),
      };
      res.json(updatedCartData);
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Server error' });
  }
};






const deleteCart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const productId = req.params.productId;

    console.log(`UserId: ${userId}, ProductId: ${productId}`);

    const user = await User.findById(userId);
    const cartIndex = user.cart.findIndex((item) => item.product.equals(productId));
    console.log(cartIndex);
    if (cartIndex !== -1) {
      user.cart.splice(cartIndex, 1);
      await user.save();
      res.status(200).json({ message: 'Item successfully removed from the cart.' });
    } else {
      res.status(404).json({ message: 'Item not found in the cart.' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Server error' });
  }
};







module.exports = {
  updateCartt,
  loadCart,
  addToCart,
  deleteCart

}