import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, createProductReview, getMyReviews } from '../controllers/productController';
import { protect, admin } from '../middleware/authMiddleware';
import { cache } from '../middleware/cacheMiddleware';
import { validateProduct } from '../middleware/validateMiddleware';

const router = express.Router();

// Cache product listings for 5 minutes
router.get('/', cache(300), getProducts);
router.get('/myreviews', protect, getMyReviews);
router.get('/:id', cache(300), getProductById);
router.post('/:id/reviews', protect, createProductReview);
router.post('/', protect, admin, validateProduct, createProduct);
router.put('/:id', protect, admin, validateProduct, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;
