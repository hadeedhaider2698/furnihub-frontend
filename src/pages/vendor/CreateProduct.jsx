import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { Package, DollarSign, Layers, Save, ChevronLeft, Plus, X, Loader2 } from 'lucide-react';
import api from '../../services/api.js';
import FileUpload from '../../components/ui/FileUpload.jsx';
import { Button } from '../../components/ui/Button.jsx';

const CATEGORIES = [
  'sofa', 'bed', 'dining-table', 'chair', 'wardrobe',
  'desk', 'bookshelf', 'cabinet', 'outdoor', 'decor', 'other'
];

const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: 'Please select a category' }) }),
  price: z.coerce.number().min(1, 'Price must be greater than 0'),
  discountPrice: z.coerce.number().optional().nullable(),
  stock: z.coerce.number().min(0, 'Stock cannot be negative'),
  material: z.string().optional(),
});

export default function CreateProduct() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]); // [{url, publicId}]
  const [colorInput, setColorInput] = useState('');
  const [colors, setColors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: { stock: 1, category: '' },
  });

  const addColor = () => {
    const val = colorInput.trim();
    if (val && !colors.find(c => c.name.toLowerCase() === val.toLowerCase())) {
      setColors([...colors, { name: val, hex: '#888888' }]);
      setColorInput('');
    }
  };

  const removeColor = (idx) => setColors(colors.filter((_, i) => i !== idx));

  const onSubmit = async (data) => {
    if (images.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        discountPrice: data.discountPrice || undefined,
        images: images.map((img, idx) => ({
          url: img.url,
          publicId: img.publicId,
          isPrimary: idx === 0,
        })),
        colors,
      };

      await api.post('/products', payload);
      toast.success('🎉 Product published successfully!');
      navigate('/vendor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] pb-24">
      <Helmet><title>Create Product | FurniHub Vendor</title></Helmet>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--surface)]/90 backdrop-blur-md border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-[var(--surface-2)] rounded-full transition-colors">
          <ChevronLeft size={22} />
        </button>
        <h1 className="font-bold text-[var(--primary)]">New Product</h1>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-[var(--primary)] text-white px-5 py-2 rounded-xl font-bold text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Publish
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Images */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--surface-2)] rounded-2xl p-5 border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Layers size={16} className="text-blue-600" />
            </div>
            <h2 className="font-bold text-[var(--primary)]">Product Images</h2>
          </div>
          <FileUpload
            value={images}
            onChange={setImages}
            folder="furnihub/products"
            multiple={true}
            maxFiles={6}
            accept="image/*"
            label="Upload product photos (up to 6) — first image is the main photo"
            preview="square"
          />
        </motion.div>

        {/* Basic Info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-[var(--surface-2)] rounded-2xl p-5 border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Package size={16} className="text-amber-600" />
            </div>
            <h2 className="font-bold text-[var(--primary)]">Product Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Product Title *</label>
              <input
                {...register('title')}
                placeholder="e.g. Luxe Velvet Sofa – 3-Seater"
                className="w-full bg-[var(--surface)] text-sm rounded-xl py-3 px-4 border border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] outline-none transition-all"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Description *</label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Describe your product — materials, dimensions, style, etc."
                className="w-full bg-[var(--surface)] text-sm rounded-xl py-3 px-4 border border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] outline-none resize-none transition-all"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Category *</label>
                <select
                  {...register('category')}
                  className="w-full bg-[var(--surface)] text-sm rounded-xl py-3 px-4 border border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)]/30 outline-none capitalize"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c.replace('-', ' ')}</option>)}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Material</label>
                <input
                  {...register('material')}
                  placeholder="e.g. Oak, Velvet"
                  className="w-full bg-[var(--surface)] text-sm rounded-xl py-3 px-4 border border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)]/30 outline-none"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pricing & Stock */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[var(--surface-2)] rounded-2xl p-5 border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign size={16} className="text-green-600" />
            </div>
            <h2 className="font-bold text-[var(--primary)]">Pricing & Stock</h2>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Price (USD) *</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-[var(--text-secondary)] text-sm font-bold">$</span>
                <input
                  {...register('price')}
                  type="number" min="0" step="0.01"
                  placeholder="0.00"
                  className="w-full bg-[var(--surface)] text-sm rounded-xl py-3 pl-7 pr-4 border border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)]/30 outline-none"
                />
              </div>
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Sale Price</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-[var(--text-secondary)] text-sm font-bold">$</span>
                <input
                  {...register('discountPrice')}
                  type="number" min="0" step="0.01"
                  placeholder="Optional"
                  className="w-full bg-[var(--surface)] text-sm rounded-xl py-3 pl-7 pr-4 border border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)]/30 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Stock *</label>
              <input
                {...register('stock')}
                type="number" min="0"
                className="w-full bg-[var(--surface)] text-sm rounded-xl py-3 px-4 border border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)]/30 outline-none"
              />
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
            </div>
          </div>
        </motion.div>

        {/* Colors */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-[var(--surface-2)] rounded-2xl p-5 border border-[var(--border)]">
          <h2 className="font-bold text-[var(--primary)] mb-4">Available Colors <span className="text-xs font-normal text-[var(--text-secondary)]">(optional)</span></h2>
          <div className="flex gap-2 flex-wrap mb-3">
            {colors.map((c, idx) => (
              <div key={idx} className="flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-full px-3 py-1.5 text-sm font-bold text-[var(--primary)]">
                <span>{c.name}</span>
                <button type="button" onClick={() => removeColor(idx)} className="text-[var(--text-secondary)] hover:text-red-500 transition-colors">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
              placeholder="e.g. Midnight Black"
              className="flex-1 bg-[var(--surface)] text-sm rounded-xl py-2.5 px-4 border border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)]/30 outline-none"
            />
            <button type="button" onClick={addColor} className="flex items-center gap-1.5 bg-[var(--primary)] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
              <Plus size={16} /> Add
            </button>
          </div>
        </motion.div>

        {/* Submit */}
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="w-full h-14 text-base font-black"
          isLoading={isSubmitting}
        >
          🚀 Publish Product
        </Button>
      </div>
    </div>
  );
}
